import { anguloInternoRegular, somaAngulosInternosComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const { saoEquivalentes: proximos } = numeroComCasas(2, 1e-4);

import {
  exercicioCongruencia,
  exercicioDiagonais,
  exercicioQuadrilatero,
} from '@features/geometria/angulos-e-triangulos/angulos-e-triangulos.poligonos';

type Pergunta =
  | 'soma-internos'
  | 'angulo-regular'
  | 'terceiro-angulo'
  | 'lados-pelo-angulo'
  | 'congruencia'
  | 'quadrilatero'
  | 'diagonais';

export const geradorAngulos: GeradorExercicio<number> = {
  topicoId: 'angulos-e-triangulos',
  formatoResposta: 'um número, ex.: 120',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'soma-internos':
        return exercicioSomaInternos(nivel, rng);
      case 'angulo-regular':
        return exercicioAnguloRegular(nivel, rng);
      case 'terceiro-angulo':
        return exercicioTerceiroAngulo(nivel, rng);
      case 'lados-pelo-angulo':
        return exercicioLadosPeloAngulo(nivel, rng);
      case 'congruencia':
        return exercicioCongruencia(nivel, rng);
      case 'quadrilatero':
        return exercicioQuadrilatero(nivel, rng);
      case 'diagonais':
        return exercicioDiagonais(nivel, rng);
    }
  },

  // O grau é ruído de unidade: a resposta em si é um número.
  analisar: (entrada) => analisarNumero(entrada.replace(/°|cm/g, '')),

  ...numeroComCasas(2, 1e-4),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['soma-internos', 'terceiro-angulo', 'congruencia']);
    case 'medio':
      return rng.escolher<Pergunta>([
        'angulo-regular',
        'soma-internos',
        'terceiro-angulo',
        'quadrilatero',
        'diagonais',
      ]);
    case 'dificil':
      return rng.escolher<Pergunta>([
        'lados-pelo-angulo',
        'angulo-regular',
        'congruencia',
        'quadrilatero',
      ]);
    /*
     * As duas perguntas inversas: do ângulo para o número de lados, e do
     * ângulo de um polígono regular para a sua identidade. Com uma só, o
     * nível virava a mesma pergunta repetida.
     */
    case 'extremo':
      return rng.escolher<Pergunta>(['lados-pelo-angulo', 'angulo-regular', 'diagonais']);
  }
}

const NOME_POLIGONO: Readonly<Record<number, string>> = {
  3: 'triângulo',
  4: 'quadrilátero',
  5: 'pentágono',
  6: 'hexágono',
  7: 'heptágono',
  8: 'octógono',
  9: 'eneágono',
  10: 'decágono',
  12: 'dodecágono',
};

function nomeDe(lados: number): string {
  return NOME_POLIGONO[lados] ?? `polígono de ${lados} lados`;
}

function exercicioSomaInternos(nivel: Nivel, rng: Rng): Exercicio<number> {
  const lados = rng.inteiro(3, 30);
  const { resultado, passos } = somaAngulosInternosComPassos(lados);

  return {
    id: `ang-soma-${lados}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é a soma dos ângulos internos de um ${nomeDe(lados)}? (em graus)`,
    enunciadoTex: `n = ${lados}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['angulos.soma'],
    armadilhas: semColisoes(
      [
        {
          resposta: lados * 180,
          diagnostico:
            'São n − 2 triângulos, não n. Os dois lados vizinhos ao vértice de onde saem as ' +
            'diagonais não geram triângulo novo.',
          passo: 1,
          conceito: 'angulos.soma',
        },
        {
          resposta: 360,
          diagnostico:
            'A soma dos ângulos EXTERNOS é sempre 360°, para qualquer polígono. A dos internos ' +
            'cresce com o número de lados.',
          passo: 2,
          conceito: 'angulos.soma',
        },
        {
          resposta: resultado / lados,
          diagnostico:
            'Esse é o ângulo interno de CADA vértice, se o polígono for regular. A pergunta ' +
            'pede a soma de todos.',
          passo: 2,
          conceito: 'angulos.soma',
        },
      ],
      resultado,
      proximos,
    ),
    // O nome do polígono muda a forma do enunciado; os novos aparecem no Médio.
    dica:
      nivel === 'facil' || nivel === 'medio'
        ? `Sᵢ = (n − 2) · 180°, com n = ${lados} lados.`
        : undefined,
  };
}

function exercicioAnguloRegular(nivel: Nivel, rng: Rng): Exercicio<number> {
  const lados = rng.inteiro(3, 30);
  const soma = somaAngulosInternosComPassos(lados).resultado;
  const resultado = anguloInternoRegular(lados);

  /*
   * O enunciado pede o arredondamento — mas só quando ele é necessário.
   *
   * Um heptágono tem 128,571428…° de ângulo interno, e isso é verdade: aqui a
   * resposta quebrada não é defeito do enunciado, é o número. O que faltava era
   * dizer quantas casas se espera, senão o aluno escreve 128,6 e leva um «não é
   * isso» sem entender que o problema era de precisão. Num hexágono, onde o
   * ângulo é 120° exatos, pedir casas decimais só confundiria.
   */
  const exato = Number.isInteger(resultado);
  const casas = exato ? '' : ', com duas casas decimais';

  return {
    id: `ang-reg-${lados}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Quanto mede cada ângulo interno de um ${nomeDe(lados)} regular? (em graus${casas})`,
    enunciadoTex: `n = ${lados} \\quad \\text{(regular)}`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        ...somaAngulosInternosComPassos(lados).passos,
        {
          descricao: 'Sendo regular, todos os ângulos são iguais: dividimos a soma por n.',
          tex: `a_i = \\frac{${soma}^\\circ}{${lados}} = ${Number(resultado.toFixed(4))}^\\circ`,
        },
      ],
    },
    conceitos: ['angulos.soma'],
    armadilhas: semColisoes(
      [
        {
          resposta: soma,
          diagnostico: 'Essa é a SOMA de todos os ângulos. Falta dividir por n.',
          passo: 3,
          conceito: 'angulos.soma',
        },
        {
          resposta: 360 / lados,
          diagnostico:
            'Esse é o ângulo EXTERNO. O interno é o suplementar dele: interno + externo = 180°.',
          passo: 3,
          conceito: 'angulos.soma',
        },
      ],
      resultado,
      proximos,
    ),
    dica: `Some os internos com (${lados} − 2) · 180° e divida pelos ${lados} ângulos, que são iguais.`,
  };
}

function exercicioTerceiroAngulo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const primeiro = rng.inteiro(10, 120);
  const segundo = rng.inteiro(10, Math.max(10, 170 - primeiro));
  const resultado = 180 - primeiro - segundo;

  return {
    id: `ang-terceiro-${primeiro}-${segundo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Num triângulo, dois ângulos medem ${primeiro}° e ${segundo}°. Quanto mede o terceiro?`,
    enunciadoTex: `\\alpha = ${primeiro}^\\circ \\qquad \\beta = ${segundo}^\\circ`,
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'A soma dos ângulos internos de qualquer triângulo é 180°.',
          tex: '\\alpha + \\beta + \\gamma = 180^\\circ',
        },
        {
          descricao: 'Isolamos o ângulo desconhecido.',
          tex: `\\gamma = 180^\\circ - ${primeiro}^\\circ - ${segundo}^\\circ`,
        },
        {
          descricao: 'Calculamos.',
          tex: `\\gamma = ${resultado}^\\circ`,
          nota:
            resultado === 90
              ? 'Resultado 90°: o triângulo é retângulo.'
              : resultado > 90
                ? 'Maior que 90°: o triângulo é obtusângulo.'
                : undefined,
        },
      ],
    },
    conceitos: ['angulos.triangulo', 'angulos.soma'],
    armadilhas: semColisoes(
      [
        {
          resposta: 360 - primeiro - segundo,
          diagnostico:
            'A soma dos internos do TRIÂNGULO é 180°, não 360°. Os 360° valem para a soma dos ' +
            'ângulos externos, ou para os internos de um quadrilátero.',
          passo: 0,
          conceito: 'angulos.soma',
        },
        {
          resposta: 90 - Math.min(primeiro, segundo),
          diagnostico:
            'Você supôs que o triângulo é retângulo. Nada no enunciado diz isso — use os 180° ' +
            'completos.',
          passo: 1,
          conceito: 'angulos.triangulo',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'Os três ângulos somam 180°.' : undefined,
  };
}

/**
 * O número como se escreve em português: 157,5 e não 157.5.
 *
 * O LaTeX fica com o ponto, que é a notação da fórmula; o texto corrido do
 * enunciado e da dica é que precisa da vírgula.
 */
function emPortugues(valor: number): string {
  return String(valor).replace('.', ',');
}

/**
 * Quantos lados pode ter o polígono desta pergunta.
 *
 * **Só divisores de 1440**, e a razão é que o enunciado precisa ser verdade.
 * Antes aqui havia `rng.inteiro(5, 120)`: com 35 lados o ângulo interno é
 * 169,714285…°, o enunciado o arredondava para 169,71° — e **nenhum polígono
 * regular tem ângulo interno de 169,71°**. O aluno então dividia 360 por 10,29,
 * achava 34,98 e não tinha como saber para que lado arredondar; pior, a
 * resolução afirmava `360/10,29 = 35`, que é falso.
 *
 * Com o número de lados dividindo 1440, o ângulo externo é múltiplo de 0,25° —
 * decimal exato de até duas casas, e exato também em ponto flutuante, que é o
 * que permite ao teste exigir igualdade em vez de aproximação. O interno sai
 * exato junto, e a conta de volta fecha na mosca.
 *
 * Dizer ao aluno «arredonde para o inteiro mais próximo» seria remendar o
 * enunciado em vez de consertá-lo: o dado continuaria sendo de um polígono que
 * não existe.
 *
 * Divisores de 360 bastariam para a exatidão, mas são só dezoito e a variedade
 * do nível caía abaixo do piso que o projeto cobra. Os de 1440 são vinte e
 * três e acrescentam ângulos com meia e um quarto de grau — do pentágono ao de
 * 120 lados.
 */
const LADOS_COM_ANGULO_EXATO: readonly number[] = [
  5, 6, 8, 9, 10, 12, 15, 16, 18, 20, 24, 30, 32, 36, 40, 45, 48, 60, 72, 80, 90, 96, 120,
];

function exercicioLadosPeloAngulo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const lados = LADOS_COM_ANGULO_EXATO[rng.inteiro(0, LADOS_COM_ANGULO_EXATO.length - 1)]!;
  const angulo = anguloInternoRegular(lados);

  return {
    id: `ang-lados-${lados}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Um polígono regular tem ângulo interno de ${emPortugues(angulo)}°. Quantos lados ele tem?`,
    enunciadoTex: `a_i = ${angulo}^\\circ`,
    gabarito: lados,
    resolucao: {
      resultado: lados,
      passos: [
        {
          descricao: 'O ângulo externo é o suplementar do interno.',
          tex: `a_e = 180^\\circ - ${angulo}^\\circ = ${180 - angulo}^\\circ`,
        },
        {
          descricao: 'A soma dos externos é 360°, e num regular eles são todos iguais.',
          tex: `n = \\frac{360^\\circ}{a_e}`,
          nota: 'Pelo externo a conta sai em um passo; pelo interno exigiria resolver uma equação.',
        },
        {
          descricao: 'Dividindo.',
          tex: `n = \\frac{360}{${180 - angulo}} = ${lados}`,
        },
      ],
    },
    conceitos: ['angulos.soma'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.round(360 / angulo),
          diagnostico:
            'Você dividiu 360° pelo ângulo INTERNO. A soma 360° é dos externos — use primeiro ' +
            'o suplementar.',
          passo: 1,
          conceito: 'angulos.soma',
        },
        {
          resposta: Math.round(angulo / 180 + 2),
          diagnostico: 'A relação não é direta assim. Passe pelo ângulo externo: n = 360° / aₑ.',
          passo: 1,
          conceito: 'angulos.soma',
        },
      ],
      lados,
      proximos,
    ),
    dica: `Passe pelo ângulo externo: 180° − ${emPortugues(angulo)}°. Os externos de qualquer polígono somam 360°.`,
  };
}
