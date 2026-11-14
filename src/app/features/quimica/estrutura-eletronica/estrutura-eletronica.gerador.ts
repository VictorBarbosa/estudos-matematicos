import {
  ELEMENTOS,
  Elemento,
  ORDEM_DE_PREENCHIMENTO,
  SEGUE_A_REGRA,
  camadas,
  configuracaoComPassos,
  configuracaoParaTex,
  eletronsDaUltimaCamada,
  eletronsNoSubnivel,
  periodo,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Exercicio,
  GeradorExercicio,
  Nivel,
  SEM_FORMULA,
  semColisoes,
} from '@core/treino/models/treino.model';
import { enunciadoTrilingue } from '@core/treino/textos/texto-trilingue';
import {
  CAMADA,
  DICA_CAMADA,
  DICA_PERIODO,
  DICA_SUBNIVEL,
  DICA_ULTIMA,
  PERIODO,
  SUBNIVEL,
  ULTIMA_CAMADA,
} from '@features/quimica/estrutura-eletronica/estrutura-eletronica.textos';

// Contagens de elétrons: sempre inteiras. A folga é só do ponto flutuante.
const { saoEquivalentes: proximos, formatar } = numeroComCasas(0, 1e-9);

/**
 * Os elementos que a regra diagonal acerta.
 *
 * Cromo, cobre, prata, platina e ouro ficam de fora: neles a configuração
 * medida não é a que a regra prevê, e cobrar a regra onde ela falha ensinaria
 * a regra errada.
 */
const SEGUEM = ELEMENTOS.filter((elemento) => SEGUE_A_REGRA(elemento.numeroAtomico));

/**
 * Os representativos, para a pergunta de última camada.
 *
 * Nos metais de transição a «valência» não é só a última camada — o d
 * incompleto também participa —, e por isso a pergunta não os sorteia. O corte
 * é por número atômico: até o cálcio, mais os halogênios pesados, que são
 * representativos de período alto.
 */
const REPRESENTATIVOS = SEGUEM.filter(
  (elemento) => elemento.numeroAtomico <= 20 || [35, 53].includes(elemento.numeroAtomico),
);

type Pergunta = 'ultima' | 'camada' | 'subnivel' | 'periodo';

/**
 * Estrutura eletrônica — a ordem de energia, e o que ela explica.
 *
 * Os elétrons ocupam os subníveis em ordem de ENERGIA, não de número: o 4s vem
 * antes do 3d. Quem não sabe disso erra todo o quarto período, e não por
 * descuido — por estar usando a regra errada.
 *
 * A distribuição explica a tabela periódica, e não o contrário: o período é o
 * número de camadas ocupadas, e os elétrons da última camada explicam por que
 * sódio e potássio reagem do mesmo jeito. É essa ligação que as quatro
 * perguntas exercitam, uma de cada lado.
 */
export const geradorEletrons: GeradorExercicio<number> = {
  topicoId: 'estrutura-eletronica',
  formatoResposta: 'um número inteiro',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'camada':
        return exercicioCamada(nivel, rng);
      case 'subnivel':
        return exercicioSubnivel(nivel, rng);
      case 'periodo':
        return exercicioPeriodo(nivel, rng);
      default:
        return exercicioUltima(nivel, rng);
    }
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['ultima', 'camada']);
    case 'medio':
      return rng.escolher<Pergunta>(['ultima', 'camada', 'subnivel']);
    case 'dificil':
      return rng.escolher<Pergunta>(['periodo', 'subnivel', 'camada']);
    // O subnível é onde a ordem de energia cobra: no quarto período, quem
    // preenche o 3d antes do 4s erra tudo.
    case 'extremo':
      return rng.escolher<Pergunta>(['subnivel', 'periodo']);
  }
}

/**
 * O enunciado não mostra a configuração: montá-la é a tarefa.
 *
 * Exibir `1s² 2s² 2p⁶ 3s¹` ao lado da pergunta responderia a pergunta antes
 * dela ser feita — e por isso o `enunciadoTex` fica vazio. O número atômico
 * entra no texto, que é tudo de que o aluno precisa.
 */
function semFormula(): string {
  return SEM_FORMULA;
}

function exercicioUltima(nivel: Nivel, rng: Rng): Exercicio<number> {
  const elemento = rng.escolher(REPRESENTATIVOS);
  const z = elemento.numeroAtomico;
  const resultado = eletronsDaUltimaCamada(z);

  const texto = enunciadoTrilingue(ULTIMA_CAMADA, [etiqueta(elemento)], DICA_ULTIMA);
  const { passos } = configuracaoComPassos(z, elemento.simbolo);

  const porCamada = camadas(z);
  const penultima = porCamada.length > 1 ? porCamada[porCamada.length - 2]! : 0;

  return {
    id: `elet-ultima-${elemento.simbolo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: semFormula(),
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['eletrons.ordem', 'eletrons.valencia'],
    armadilhas: semColisoes(
      [
        {
          resposta: z,
          diagnostico:
            'Esse é o total de elétrons do átomo, que é o número atômico. A pergunta é sobre ' +
            'a ÚLTIMA camada — as de dentro não contam.',
          passo: 3,
          conceito: 'eletrons.valencia',
        },
        {
          resposta: penultima,
          diagnostico:
            'Essa é a camada de dentro, a penúltima. A última é a de maior n que recebeu ' +
            'elétrons.',
          passo: 3,
          conceito: 'eletrons.valencia',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioCamada(nivel: Nivel, rng: Rng): Exercicio<number> {
  const elemento = rng.escolher(SEGUEM);
  const z = elemento.numeroAtomico;
  const porCamada = camadas(z);

  const n = rng.inteiro(1, porCamada.length);
  const resultado = porCamada[n - 1]!;

  const texto = enunciadoTrilingue(CAMADA, [etiqueta(elemento), n], DICA_CAMADA);
  const { passos } = configuracaoComPassos(z, elemento.simbolo);

  return {
    id: `elet-camada-${elemento.simbolo}-${n}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: semFormula(),
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['eletrons.ordem', 'eletrons.camadas'],
    armadilhas: semColisoes(
      [
        {
          // A capacidade da camada, 2n², que só coincide quando ela está cheia.
          resposta: 2 * n * n,
          diagnostico:
            `Esse é quanto a camada ${n} CABE, não quanto ela tem. Capacidade e ocupação só ` +
            'coincidem quando a camada está cheia, e a última raramente está.',
          passo: 3,
          conceito: 'eletrons.camadas',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioSubnivel(nivel: Nivel, rng: Rng): Exercicio<number> {
  const elemento = rng.escolher(SEGUEM);
  const z = elemento.numeroAtomico;

  // Só subníveis que existem na ordem até onde este átomo chega, mais um
  // vazio de vez em quando: zero também é resposta, e é a que a ordem de
  // energia cobra — o 3d do potássio está vazio porque o 4s veio antes.
  const candidatos = ORDEM_DE_PREENCHIMENTO.slice(0, 9);
  const vaga = rng.escolher(candidatos);
  const resultado = eletronsNoSubnivel(z, vaga.n, vaga.letra);

  const nome = `${vaga.n}${vaga.letra}`;
  const texto = enunciadoTrilingue(SUBNIVEL, [etiqueta(elemento), nome], DICA_SUBNIVEL);
  const { passos } = configuracaoComPassos(z, elemento.simbolo);

  // Quem preenche na ordem dos NÚMEROS põe elétrons no 3d antes do 4s.
  const naOrdemErrada = eletronsPelaOrdemNumerica(z, vaga.n, vaga.letra);

  return {
    id: `elet-sub-${elemento.simbolo}-${nome}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: semFormula(),
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        ...passos,
        {
          descricao: `Lendo o ${nome} na distribuição.`,
          tex: `${nome}: ${resultado}`,
          nota:
            resultado === 0
              ? 'Zero é resposta: este subnível ainda não começou a receber elétrons.'
              : 'A conta é só de leitura, depois de distribuir na ordem certa.',
        },
      ],
    },
    conceitos: ['eletrons.ordem', 'eletrons.camadas'],
    armadilhas: semColisoes(
      [
        {
          resposta: naOrdemErrada,
          diagnostico:
            'Os subníveis foram preenchidos na ordem dos NÚMEROS, e não na de energia. O 4s ' +
            'vem antes do 3d: é a energia que manda, não o número da camada.',
          passo: 2,
          conceito: 'eletrons.ordem',
        },
        {
          resposta: vaga.capacidade,
          diagnostico:
            `Esse é o que o subnível ${nome} CABE. Ele só está cheio se os elétrons tiverem ` +
            'chegado até lá.',
          passo: 2,
          conceito: 'eletrons.ordem',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioPeriodo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const elemento = rng.escolher(SEGUEM);
  const z = elemento.numeroAtomico;
  const resultado = periodo(z);

  const texto = enunciadoTrilingue(PERIODO, [etiqueta(elemento)], DICA_PERIODO);
  const { passos } = configuracaoComPassos(z, elemento.simbolo);

  // Quantos SUBNÍVEIS ocupados: o que se conta por engano no lugar das camadas.
  const subniveis = configuracaoParaTex(z).split('\\;').length;

  return {
    id: `elet-periodo-${elemento.simbolo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: semFormula(),
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['eletrons.camadas', 'eletrons.ordem'],
    armadilhas: semColisoes(
      [
        {
          resposta: subniveis,
          diagnostico:
            'Esses são os SUBNÍVEIS ocupados, não as camadas. Uma camada reúne vários ' +
            'subníveis: a camada 2 tem o 2s e o 2p.',
          passo: 3,
          conceito: 'eletrons.camadas',
        },
        {
          resposta: z,
          diagnostico:
            'Esse é o número atômico, o total de elétrons. As camadas ocupadas são poucas: ' +
            'uma camada acomoda muitos elétrons.',
          passo: 1,
          conceito: 'eletrons.camadas',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}

/**
 * Como o elemento aparece no enunciado.
 *
 * Só o símbolo e o número atômico, porque o NOME do elemento é diferente em
 * cada língua e a tabela do núcleo guarda só o português — pôr «nitrogênio»
 * num enunciado em inglês seria pior que não pôr nome nenhum. O símbolo é
 * universal, e o Z é o dado de que a pergunta precisa.
 */
function etiqueta(elemento: Elemento): string {
  return `${elemento.simbolo} (Z = ${elemento.numeroAtomico})`;
}

/**
 * A distribuição de quem preenche na ordem dos números, e não da energia.
 *
 * Existe para ser **armadilha**: é o que o aluno calcula quando lê o diagrama
 * como se 3d viesse antes de 4s. Tê-la aqui, ao lado da conta certa, deixa
 * explícito no código qual é o erro que o tópico persegue.
 */
function eletronsPelaOrdemNumerica(
  eletrons: number,
  n: number,
  letra: 's' | 'p' | 'd' | 'f',
): number {
  const porNumero = [...ORDEM_DE_PREENCHIMENTO].sort(
    (a, b) => a.n - b.n || 'spdf'.indexOf(a.letra) - 'spdf'.indexOf(b.letra),
  );

  let restam = eletrons;

  for (const vaga of porNumero) {
    const cabem = Math.min(restam, vaga.capacidade);
    if (vaga.n === n && vaga.letra === letra) {
      return Math.max(0, cabem);
    }
    restam -= cabem;
  }

  return 0;
}
