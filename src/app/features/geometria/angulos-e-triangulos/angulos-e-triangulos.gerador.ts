import { moldesDe, textoDoMolde } from '@core/enunciados/moldes/moldes.model';
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
    enunciado: textoDoMolde(
      moldesDe('angulos-e-triangulos', 'forma-1')[0]!,
      { v1: nomeDe(lados) },
      'pt',
    ),
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
    //
    // A dica dá a RAZÃO do (n − 2), e não a fórmula: quem sabe de onde vem o
    // dois não precisa decorar a expressão, e quem só decorou não sabe o que
    // fazer quando o enunciado muda de forma.
    dica:
      nivel === 'facil' || nivel === 'medio'
        ? `Ligue um vértice a todos os outros: o polígono se reparte em ${lados} − 2 ` +
          'triângulos, e cada triângulo traz 180°.'
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
    enunciado: textoDoMolde(
      moldesDe('angulos-e-triangulos', 'forma-2')[0]!,
      { v1: nomeDe(lados), casas },
      'pt',
    ),
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
    dica:
      `Ligando um vértice aos outros, o polígono se reparte em ${lados} − 2 triângulos de ` +
      `180° cada — essa é a soma de todos os internos. Num polígono regular os ${lados} ` +
      'ângulos são iguais entre si.',
  };
}

function exercicioTerceiroAngulo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const primeiro = rng.inteiro(10, 120);
  const segundo = rng.inteiro(10, Math.max(10, 170 - primeiro));
  const resultado = 180 - primeiro - segundo;

  return {
    id: `ang-terceiro-${primeiro}-${segundo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: textoDoMolde(
      moldesDe('angulos-e-triangulos', 'forma-3')[0]!,
      { primeiro, segundo },
      'pt',
    ),
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
    enunciado: textoDoMolde(
      moldesDe('angulos-e-triangulos', 'forma-4')[0]!,
      { v1: emPortugues(angulo) },
      'pt',
    ),
    enunciadoTex: `a_i = ${angulo}^\\circ`,
    gabarito: lados,
    resolucao: {
      resultado: lados,
      passos: [
        {
          descricao:
            'No vértice, o lado segue em linha reta do outro lado: o interno e o externo ' +
            'completam 180°.',
          tex: `a_e = 180^\\circ - ${angulo}^\\circ = ${180 - angulo}^\\circ`,
          nota: 'É por isso que se subtrai de 180: os dois são suplementares, não por convenção.',
        },
        {
          descricao:
            'Andando o contorno inteiro, cada vértice faz você girar um ângulo externo — e no ' +
            'fim você está olhando para o mesmo lado do começo.',
          tex: `\\text{soma dos externos} = 360^\\circ`,
          nota:
            'Uma volta completa. É daí que vem o 360°, e é por isso que ele não depende do ' +
            'número de lados: qualquer polígono convexo dá uma volta e só uma.',
        },
        {
          descricao:
            `Num polígono regular todos os externos são iguais, então contar quantos cabem na ` +
            `volta é contar os vértices.`,
          tex: `n = \\frac{360}{${180 - angulo}} = ${lados}`,
          nota: 'Pelo interno a mesma conta exigiria resolver uma equação; pelo externo é uma divisão.',
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
    /*
     * A dica conta de onde vêm os 360°, em vez de só anunciá-los.
     *
     * «Os externos somam 360°» é um fato que não ajuda quem não sabe o que
     * fazer com ele. A imagem da volta inteira resolve as duas pontas: explica
     * por que a soma não depende do número de lados, e deixa claro que contar
     * quantos externos cabem na volta é contar os vértices.
     */
    dica:
      `No vértice, o lado segue em linha reta: o interno e o externo completam 180°, então o ` +
      `externo é 180° − ${emPortugues(angulo)}°. Andando o contorno inteiro, você gira um ` +
      'externo em cada vértice e termina olhando para o mesmo lado do começo — uma volta ' +
      'completa, 360°.',
  };
}
