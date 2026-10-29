import { anguloInternoRegular, somaAngulosInternosComPassos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const { saoEquivalentes: proximos } = numeroComCasas(2, 1e-4);

type Pergunta = 'soma-internos' | 'angulo-regular' | 'terceiro-angulo' | 'lados-pelo-angulo';

export const geradorAngulos: GeradorExercicio<number> = {
  topicoId: 'angulos-e-triangulos',
  formatoResposta: 'um número em graus, ex.: 120',

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
    }
  },

  // O grau é ruído de unidade: a resposta em si é um número.
  analisar: (entrada) => analisarNumero(entrada.replace(/°/g, '')),

  ...numeroComCasas(2, 1e-4),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['soma-internos', 'terceiro-angulo']);
    case 'medio':
      return rng.escolher<Pergunta>(['angulo-regular', 'soma-internos', 'terceiro-angulo']);
    case 'dificil':
      return rng.escolher<Pergunta>(['lados-pelo-angulo', 'angulo-regular']);
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
    dica: nivel === 'facil' ? 'Sᵢ = (n − 2) · 180°' : undefined,
  };
}

function exercicioAnguloRegular(nivel: Nivel, rng: Rng): Exercicio<number> {
  const lados = rng.inteiro(3, 30);
  const soma = somaAngulosInternosComPassos(lados).resultado;
  const resultado = anguloInternoRegular(lados);

  return {
    id: `ang-reg-${lados}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Quanto mede cada ângulo interno de um ${nomeDe(lados)} regular? (em graus)`,
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

function exercicioLadosPeloAngulo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const lados = rng.inteiro(5, 120);
  const angulo = anguloInternoRegular(lados);

  return {
    id: `ang-lados-${lados}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um polígono regular tem ângulo interno de ${Number(angulo.toFixed(2))}°. Quantos lados ele tem?`,
    enunciadoTex: `a_i = ${Number(angulo.toFixed(2))}^\\circ`,
    gabarito: lados,
    resolucao: {
      resultado: lados,
      passos: [
        {
          descricao: 'O ângulo externo é o suplementar do interno.',
          tex: `a_e = 180^\\circ - ${Number(angulo.toFixed(2))}^\\circ = ${Number((180 - angulo).toFixed(2))}^\\circ`,
        },
        {
          descricao: 'A soma dos externos é 360°, e num regular eles são todos iguais.',
          tex: `n = \\frac{360^\\circ}{a_e}`,
          nota: 'Pelo externo a conta sai em um passo; pelo interno exigiria resolver uma equação.',
        },
        {
          descricao: 'Dividindo.',
          tex: `n = \\frac{360}{${Number((180 - angulo).toFixed(2))}} = ${lados}`,
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
          diagnostico:
            'A relação não é direta assim. Passe pelo ângulo externo: n = 360° / aₑ.',
          passo: 1,
          conceito: 'angulos.soma',
        },
      ],
      lados,
      proximos,
    ),
  };
}
