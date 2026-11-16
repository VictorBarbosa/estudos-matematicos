/**
 * Gera os catálogos de enunciados a partir da árvore de arquivos.
 *
 * São DOIS níveis de arquivo, e o segundo existe porque o primeiro cresceu
 * até ficar impossível de abrir:
 *
 *   catalogos/<tópico>.ts     → os imports e as entradas de UM tópico;
 *   enunciados/catalogo.ts    → importa os índices e concatena.
 *
 * O site continua lendo uma lista plana só (`ENTRADAS_DE_ENUNCIADO`), como
 * antes; o que muda é onde ela é montada. Um tópico novo ganha o seu arquivo
 * sozinho, e um diff de enunciado mexe num arquivo de vinte linhas em vez de
 * num de dezesseis mil.
 *
 * O texto está espalhado em um arquivo por pergunta — `fracoes/facil/01.json`,
 * `retas-e-planos/moldes/forma-3.json` —, e alguém tem de juntá-los para o
 * site ler. Esse alguém é o catálogo, e ele é GERADO: escrito à mão, mil
 * imports viram mil chances de esquecer um, e um import esquecido é uma
 * pergunta que nunca chega à tela, sem quebrar nada.
 *
 * Rodar `npm run enunciados:catalogo` depois de acrescentar ou remover um
 * arquivo. `npm run verificar:geradores` reprova quando o catálogo está
 * desatualizado, para que o esquecimento apareça antes de ir para o ar.
 */
import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PASTA = 'src/app/core/enunciados/enunciados';
const CATALOGOS = 'src/app/core/enunciados/catalogos';
const NIVEIS = ['facil', 'medio', 'dificil', 'extremo'];

/** Os arquivos de um tópico, na ordem em que o site deve lê-los. */
function arquivosDoTopico(topico) {
  const raiz = join(PASTA, topico);
  const saida = [];

  for (const nivel of NIVEIS) {
    const pasta = join(raiz, nivel);
    if (!existe(pasta)) {
      continue;
    }
    for (const nome of readdirSync(pasta)
      .filter((n) => n.endsWith('.json'))
      .sort()) {
      saida.push({ caminho: `${topico}/${nivel}/${nome}`, nivel });
    }
  }

  const moldes = join(raiz, 'moldes');
  if (existe(moldes)) {
    /*
     * Dois jeitos de guardar molde, e o caminho diz qual é:
     *
     *   moldes/forma-3.json        → a forma tem UM molde;
     *   moldes/direta/01.json      → a forma tem VÁRIOS, e o gerador sorteia.
     *
     * A pasta existe para que o nome do arquivo não precise carregar número:
     * `forma-1-02.json` obrigaria a descontar o sufixo para achar a forma, e
     * descontar sufixo numérico de `forma-1` dá `forma`.
     */
    for (const nome of readdirSync(moldes).sort(porNumero)) {
      const dentro = join(moldes, nome);
      if (existe(dentro)) {
        for (const arquivo of readdirSync(dentro)
          .filter((n) => n.endsWith('.json'))
          .sort()) {
          saida.push({ caminho: `${topico}/moldes/${nome}/${arquivo}`, forma: nome });
        }
      } else if (nome.endsWith('.json')) {
        saida.push({ caminho: `${topico}/moldes/${nome}`, forma: nome.replace('.json', '') });
      }
    }
  }

  return saida;
}

/** Ordem numérica, e não alfabética: `forma-10` vem depois de `forma-9`. */
function porNumero(a, b) {
  return numero(a) - numero(b) || a.localeCompare(b);
}

function numero(nome) {
  const achado = /(\d+)/.exec(nome);
  return achado === null ? Number.MAX_SAFE_INTEGER : Number(achado[1]);
}

function existe(caminho) {
  try {
    return statSync(caminho).isDirectory();
  } catch {
    return false;
  }
}

function identificador(caminho) {
  return (
    'e' +
    caminho.replace(/\.json$/, '').replace(/[^A-Za-z0-9]+(.)?/g, (_t, c) => (c ?? '').toUpperCase())
  );
}

const topicos = readdirSync(PASTA)
  .filter((nome) => existe(join(PASTA, nome)))
  .sort();

mkdirSync(CATALOGOS, { recursive: true });

/** `analise-combinatoria` → `ENTRADAS_DE_ANALISE_COMBINATORIA`. */
function constanteDoTopico(topico) {
  return `ENTRADAS_DE_${topico.toUpperCase().replace(/-/g, '_')}`;
}

const indices = [];
let total = 0;

for (const topico of topicos) {
  const arquivos = arquivosDoTopico(topico);
  const constante = constanteDoTopico(topico);

  const linhas = [
    '/**',
    ` * Os enunciados de ${topico}, para o catálogo juntar.`,
    ' *',
    ' * ARQUIVO GERADO por `npm run enunciados:catalogo`. Não edite à mão: o que',
    ` * se edita são os arquivos de \`enunciados/${topico}/<nível>/\` e de`,
    ` * \`enunciados/${topico}/moldes/\`, e este índice se refaz a partir deles.`,
    ' */',
    '',
  ];

  if (arquivos.length > 0) {
    // O import precisa vir antes do tipo, como em qualquer arquivo TS.
    const imports = [];
    const entradas = [];

    for (const arquivo of arquivos) {
      const nome = identificador(arquivo.caminho);
      imports.push(`import ${nome} from '@core/enunciados/enunciados/${arquivo.caminho}';`);

      const partes = [`topico: '${topico}'`];
      if (arquivo.nivel !== undefined) {
        partes.push(`nivel: '${arquivo.nivel}'`);
      }
      if (arquivo.forma !== undefined) {
        partes.push(`forma: '${arquivo.forma}'`);
      }
      partes.push(`conteudo: ${nome}`);
      entradas.push(`  { ${partes.join(', ')} },`);
    }

    linhas.push(
      ...imports,
      "import { EntradaDeEnunciado } from '@core/enunciados/models/entrada-de-enunciado';",
      '',
      `export const ${constante}: readonly EntradaDeEnunciado[] = [`,
      ...entradas,
      '];',
      '',
    );
  } else {
    linhas.push(
      "import { EntradaDeEnunciado } from '@core/enunciados/models/entrada-de-enunciado';",
      '',
      `export const ${constante}: readonly EntradaDeEnunciado[] = [];`,
      '',
    );
  }

  writeFileSync(join(CATALOGOS, `${topico}.ts`), linhas.join('\n'), 'utf8');
  indices.push({ topico, constante });
  total += arquivos.length;
}

/*
 * O índice geral: só imports e uma concatenação.
 *
 * Ele NÃO repete o cabeçalho longo de antes. Quem quer saber de onde vem o
 * nível e a forma de cada entrada lê `enunciados/<tópico>/` — é lá que o
 * caminho diz, e é isso que os guardas conferem.
 */
const linhasIndice = [
  '/**',
  ' * Os enunciados de todos os tópicos, reunidos para o site ler.',
  ' *',
  ' * ARQUIVO GERADO por `npm run enunciados:catalogo`. Não edite à mão: o que',
  ' * se edita são os arquivos de `enunciados/<tópico>/<nível>/` e de',
  ' * `enunciados/<tópico>/moldes/`, e o catálogo se refaz a partir deles.',
  ' *',
  ' * Cada tópico tem o seu índice em `core/enunciados/catalogos/<tópico>.ts`,',
  ' * com os imports e as entradas daquele tópico. Aqui só se juntam, para o',
  ' * resto do site continuar vendo uma lista plana.',
  ' */',
  '',
  ...indices.map(
    ({ topico, constante }) =>
      `import { ${constante} } from '@core/enunciados/catalogos/${topico}';`,
  ),
  '',
  "import type { EntradaDeEnunciado } from '@core/enunciados/models/entrada-de-enunciado';",
  '',
  // Reexportado porque o catálogo era o dono do tipo até a segmentação, e
  // quem importava daqui continua importando daqui.
  "export type { EntradaDeEnunciado } from '@core/enunciados/models/entrada-de-enunciado';",
  '',
  'export const ENTRADAS_DE_ENUNCIADO: readonly EntradaDeEnunciado[] = [',
  ...indices.map(({ constante }) => `  ...${constante},`),
  '];',
  '',
];

writeFileSync(join(PASTA, 'catalogo.ts'), linhasIndice.join('\n'), 'utf8');
console.log(
  `Catálogo gerado: ${total} entradas em ${topicos.length} tópicos, ` +
    `mais os ${topicos.length} índices por tópico.`,
);
