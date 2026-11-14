/**
 * Compara dois modelos locais escrevendo os mesmos problemas.
 *
 * Roda na máquina de quem estuda, nunca no CI: ele depende do Ollama estar no
 * ar em `localhost:11434`. A saída é um arquivo markdown com a taxa de
 * aprovação de cada modelo e os textos lado a lado, para a escolha ser feita
 * lendo português, francês e inglês — e não por tamanho de modelo.
 *
 *     node scripts/comparar-modelos.ts
 *     node scripts/comparar-modelos.ts --quantas 10 --modelos gpt-oss:20b,qwen3.8:27b-mlx
 *
 * O validador e o prompt são os MESMOS que o site usa em tempo de execução
 * (importados daqui por caminho relativo, porque os dois arquivos não importam
 * nada). Comparar com um validador diferente do que vai filtrar de verdade não
 * compararia nada.
 */
import { writeFile } from 'node:fs/promises';
import {
  type ModeloBruto,
  type MotivoDeRecusa,
  assinaturaDoModelo,
  validarModelo,
} from '../src/app/core/problemas/validacao/validar-modelo.ts';
import {
  type Nivel,
  type PedidoDeProblema,
  NIVEIS,
  montarPrompt,
} from '../src/app/core/problemas/prompt/montar-prompt.ts';
import { PROBLEMA_EQUACAO1 } from '../src/app/features/algebra/equacao-primeiro-grau/equacao-primeiro-grau.problema.ts';
import { PROBLEMA_SOMA_PRODUTO } from '../src/app/features/algebra/equacao-segundo-grau/equacao-segundo-grau.problema.ts';
import { PROBLEMA_MMC } from '../src/app/features/matematica-basica/mmc-mdc/mmc-mdc.problema.ts';
import { PROBLEMA_PA } from '../src/app/features/funcoes/progressoes/progressoes.problema.ts';
import { PROBLEMA_MONTANTE } from '../src/app/features/funcoes/juros-compostos/juros-compostos.problema.ts';
import { PROBLEMA_ESTEQUIOMETRIA } from '../src/app/features/quimica/estequiometria/estequiometria.problema.ts';

const ENDPOINT = process.env.OLLAMA_URL ?? 'http://localhost:11434';

/**
 * Quanto raciocínio permitir antes de escrever.
 *
 * Modelo de raciocínio gasta o orçamento de tokens pensando e devolve
 * `content` vazio: na primeira execução o gpt-oss:20b fez isso em dois dos
 * três pedidos, com `done_reason: length`. Escrever um enunciado não precisa
 * de cadeia de pensamento, então o padrão é desligar — e `--raciocinio low`
 * existe para dar uma chance a quem não aceita `false`.
 */
const RACIOCINIO: boolean | string = (() => {
  const escolha = process.argv.indexOf('--raciocinio');
  return escolha === -1 ? false : (process.argv[escolha + 1] ?? 'low');
})();

const NUM_PREDICT = 8192;
const SAIDA = 'comparacao-modelos.md';

/**
 * Os tópicos medidos: as declarações DE VERDADE, não cópias.
 *
 * Antes isto era uma cópia à mão de cada pedido, e a cópia desandou — eu
 * passei a medir um prompt que não era o que o site usava. Agora cada tópico
 * guarda a sua declaração num `*.problema.ts` que só importa TIPO, e o node
 * apaga `import type` ao rodar: por isso o caminho relativo funciona aqui sem
 * resolver os apelidos `@core` e `@features`.
 *
 * Acrescentar um tópico à medição é acrescentar uma linha a esta lista.
 */
const DECLARACOES = [
  PROBLEMA_EQUACAO1,
  PROBLEMA_SOMA_PRODUTO,
  PROBLEMA_MMC,
  PROBLEMA_PA,
  PROBLEMA_MONTANTE,
  PROBLEMA_ESTEQUIOMETRIA,
];

/**
 * Os níveis pedidos na medição: os quatro, como o site faz.
 *
 * Medir um nível só compararia um prompt que o site não usa mais — e o custo
 * de cada nível é justamente o que o lote agora mede junto.
 */
const NIVEIS_MEDIDOS: readonly Nivel[] = NIVEIS;

const PEDIDOS: readonly PedidoDeProblema[] = DECLARACOES.map((declaracao) => ({
  ...declaracao.pedido,
  niveis: NIVEIS_MEDIDOS,
  quantas: 2,
}));

interface Resultado {
  readonly modelo: string;
  readonly pedido: string;
  readonly aprovados: readonly ModeloBruto[];
  readonly recusados: readonly {
    readonly bruto: ModeloBruto;
    readonly motivos: readonly MotivoDeRecusa[];
  }[];
  readonly repetidos: number;
  readonly segundos: number;
  readonly erro?: string;
}

function argumento(nome: string, padrao: string): string {
  const indice = process.argv.indexOf(`--${nome}`);

  return indice === -1 ? padrao : (process.argv[indice + 1] ?? padrao);
}

/**
 * `gpt-oss:20b@low` quer dizer «este modelo, com raciocínio baixo».
 *
 * Existe porque os dois modelos não aceitam a mesma coisa: o qwen escreve bem
 * com o raciocínio desligado, e o gpt-oss recusa `false` — e, se o raciocínio
 * fica solto, ele gasta o orçamento inteiro pensando e devolve texto vazio.
 */
function separarRaciocinio(especificacao: string): {
  modelo: string;
  raciocinio: boolean | string;
} {
  const [modelo, raciocinio] = especificacao.split('@');

  return { modelo: modelo!, raciocinio: raciocinio ?? RACIOCINIO };
}

async function pedirAoModelo(
  especificacao: string,
  pedido: PedidoDeProblema,
): Promise<readonly ModeloBruto[]> {
  const { modelo, raciocinio } = separarRaciocinio(especificacao);
  const { system, user, esquema } = montarPrompt(pedido);

  const resposta = await fetch(`${ENDPOINT}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: modelo,
      stream: false,
      format: esquema,
      // `think: false` é essencial nos modelos de raciocínio: sem isso o
      // gpt-oss gasta todo o orçamento de tokens pensando e devolve
      // `content` vazio — foi o que aconteceu na primeira execução.
      think: raciocinio,
      // Temperatura alta o suficiente para variar o contexto, baixa o
      // suficiente para o formato não escapar. O orçamento é largo porque
      // modelo de raciocínio gasta tokens antes de escrever.
      options: { temperature: 0.8, num_predict: NUM_PREDICT },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!resposta.ok) {
    throw new Error(`${resposta.status} ${resposta.statusText}`);
  }

  const corpo = (await resposta.json()) as {
    message?: { content?: string; thinking?: string };
    done_reason?: string;
  };
  const conteudo = (corpo.message?.content ?? '').trim();

  if (conteudo.length === 0) {
    throw new Error(
      `resposta vazia (done_reason: ${corpo.done_reason ?? 'desconhecido'}` +
        `${corpo.message?.thinking ? ', só pensou' : ''})`,
    );
  }

  const lido = JSON.parse(conteudo) as { problemas?: readonly ModeloBruto[] };

  return lido.problemas ?? [];
}

async function avaliar(modelo: string, pedido: PedidoDeProblema): Promise<Resultado> {
  const inicio = Date.now();
  const base = { modelo, pedido: pedido.topico, repetidos: 0 };

  try {
    const brutos = await pedirAoModelo(modelo, pedido);

    const aprovados: ModeloBruto[] = [];
    const recusados: { bruto: ModeloBruto; motivos: readonly MotivoDeRecusa[] }[] = [];
    const vistos = new Set<string>();
    let repetidos = 0;

    for (const bruto of brutos) {
      const veredito = validarModelo(bruto, pedido.dados.length, {
        proibidas: pedido.proibidas,
        permitidas: pedido.permitidas,
        repetiveis: pedido.dados
          .filter((dado) => dado.tipo === 'formula')
          .map((dado) => dado.indice),
        niveis: pedido.niveis,
      });

      if (!veredito.ok) {
        recusados.push({ bruto, motivos: veredito.motivos });
        continue;
      }

      const assinatura = assinaturaDoModelo(bruto);

      if (vistos.has(assinatura)) {
        repetidos += 1;
        continue;
      }

      vistos.add(assinatura);
      aprovados.push(veredito.modelo);
    }

    return {
      ...base,
      aprovados,
      recusados,
      repetidos,
      segundos: (Date.now() - inicio) / 1000,
    };
  } catch (erro) {
    return {
      ...base,
      aprovados: [],
      recusados: [],
      segundos: (Date.now() - inicio) / 1000,
      erro: erro instanceof Error ? erro.message : String(erro),
    };
  }
}

function tabela(resultados: readonly Resultado[]): string {
  const linhas = resultados.map((r) => {
    const pedidos = r.aprovados.length + r.recusados.length + r.repetidos;
    const taxa = pedidos === 0 ? '—' : `${Math.round((r.aprovados.length / pedidos) * 100)}%`;
    const motivos = [...new Set(r.recusados.flatMap((x) => x.motivos))].join(', ') || '—';

    return `| ${r.modelo} | ${r.pedido} | ${r.aprovados.length}/${pedidos} | ${taxa} | ${r.repetidos} | ${r.segundos.toFixed(1)} s | ${r.erro ?? motivos} |`;
  });

  return [
    '| Modelo | Tópico | Aprovados | Taxa | Repetidos | Tempo | Recusas |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...linhas,
  ].join('\n');
}

function amostras(resultados: readonly Resultado[]): string {
  return resultados
    .map((r) => {
      if (r.erro !== undefined) {
        return `### ${r.modelo} — ${r.pedido}\n\nFalhou: ${r.erro}\n`;
      }

      const aprovados = r.aprovados
        .map((m, i) => `**${i + 1}.**\n\n- pt: ${m.pt}\n- fr: ${m.fr}\n- en: ${m.en}\n`)
        .join('\n');

      const recusados = r.recusados
        .map((x) => `- _${x.motivos.join(', ')}_: ${x.bruto.pt}`)
        .join('\n');

      return [
        `### ${r.modelo} — ${r.pedido}`,
        '',
        aprovados || '_nenhum aprovado_',
        recusados ? `\n#### Recusados\n\n${recusados}\n` : '',
      ].join('\n');
    })
    .join('\n---\n\n');
}

async function principal(): Promise<void> {
  const modelos = argumento('modelos', 'gpt-oss:20b,qwen3.8:27b-mlx').split(',');
  const quantas = Number(argumento('quantas', '6'));

  const pedidos = PEDIDOS.map((pedido) => ({ ...pedido, quantas }));
  const resultados: Resultado[] = [];

  for (const modelo of modelos) {
    for (const pedido of pedidos) {
      process.stdout.write(`${modelo} · ${pedido.topico}… `);
      const resultado = await avaliar(modelo, pedido);
      resultados.push(resultado);
      process.stdout.write(
        resultado.erro === undefined
          ? `${resultado.aprovados.length} aprovados em ${resultado.segundos.toFixed(1)} s\n`
          : `falhou: ${resultado.erro}\n`,
      );
    }
  }

  const texto = [
    '# Comparação de modelos locais para escrever os problemas',
    '',
    `Gerado em ${new Date().toISOString().slice(0, 16).replace('T', ' ')}, com ${quantas} ` +
      'pedidos por tópico e por modelo.',
    '',
    'A taxa de aprovação é do validador que o site usa de verdade',
    '(`core/problemas/validacao/validar-modelo.ts`): dígito solto, lacuna faltando, ordem',
    'diferente entre idiomas, metatexto, LaTeX, tamanho. «Repetidos» são histórias válidas',
    'mas iguais a outra do mesmo lote.',
    '',
    '## O quadro',
    '',
    tabela(resultados),
    '',
    '## Os textos, para ler',
    '',
    amostras(resultados),
  ].join('\n');

  await writeFile(SAIDA, texto, 'utf8');
  process.stdout.write(`\n${SAIDA} escrito.\n`);
}

await principal();
