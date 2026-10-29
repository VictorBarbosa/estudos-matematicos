import { somaComPassos, somaInfinitaComPassos, termoGeral } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 1e-6;

type Pergunta = 'termo-pa' | 'soma-pa' | 'termo-pg' | 'soma-pg' | 'soma-infinita';

export const geradorProgressoes: GeradorExercicio<number> = {
  topicoId: 'progressoes',
  formatoResposta: 'um número, ex.: 48 ou 1,5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'termo-pa':
        return exercicioTermo(false, nivel, rng);
      case 'termo-pg':
        return exercicioTermo(true, nivel, rng);
      case 'soma-pa':
        return exercicioSoma(false, nivel, rng);
      case 'soma-pg':
        return exercicioSoma(true, nivel, rng);
      case 'soma-infinita':
        return exercicioSomaInfinita(nivel, rng);
    }
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(6)).toLocaleString('pt-BR', { maximumFractionDigits: 6 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['termo-pa', 'termo-pg']);
    case 'medio':
      return rng.escolher<Pergunta>(['soma-pa', 'termo-pg', 'soma-pg']);
    case 'dificil':
      return rng.escolher<Pergunta>(['soma-pg', 'soma-infinita', 'soma-pa']);
  }
}

/** Qual é o n-ésimo termo? */
function exercicioTermo(geometrica: boolean, nivel: Nivel, rng: Rng): Exercicio<number> {
  const primeiro = geometrica ? rng.inteiro(1, 6) : rng.inteiro(-10, 12);
  const razao = geometrica ? rng.escolher([2, 3, -2]) : rng.escolher([-6, -4, -3, 3, 4, 5, 7]);
  const n = rng.inteiro(5, geometrica ? 8 : 20);

  const progressao = { primeiro, razao, geometrica };
  const gabarito = termoGeral(progressao, n);

  const nome = geometrica ? 'PG' : 'PA';
  const letraRazao = geometrica ? 'q' : 'r';

  // O erro clássico: usar n em vez de n−1 no expoente ou no multiplicador.
  const comNErrado = geometrica ? primeiro * razao ** n : primeiro + n * razao;

  return {
    id: `prog-termo-${nome}-${primeiro}-${razao}-${n}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Numa ${nome} de primeiro termo ${primeiro} e razão ${razao}, qual é o ${n}º termo?`,
    enunciadoTex: `a_1 = ${primeiro} \\qquad ${letraRazao} = ${razao} \\qquad n = ${n}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `Escrevemos o termo geral da ${nome}.`,
          tex: geometrica ? 'a_n = a_1 \\cdot q^{\\,n-1}' : 'a_n = a_1 + (n-1)r',
        },
        {
          descricao: 'Substituímos os valores dados.',
          tex: geometrica
            ? `a_{${n}} = ${primeiro} \\cdot ${razao}^{${n}-1}`
            : `a_{${n}} = ${primeiro} + (${n}-1) \\cdot ${razao}`,
          nota: 'O expoente é n − 1, porque o primeiro termo já está contado.',
        },
        {
          descricao: 'Calculamos.',
          tex: `a_{${n}} = ${gabarito}`,
        },
      ],
    },
    conceitos: [geometrica ? 'progressoes.geometrica' : 'progressoes.aritmetica'],
    armadilhas: semColisoes(
      [
        {
          resposta: comNErrado,
          diagnostico: geometrica
            ? 'O expoente é n − 1, não n: o primeiro termo corresponde a q⁰. Você avançou um ' +
              'termo além do pedido.'
            : 'São n − 1 saltos de razão, não n: do 1º ao nº termo há um salto menos que o ' +
              'número de termos.',
          passo: 1,
          conceito: geometrica ? 'progressoes.geometrica' : 'progressoes.aritmetica',
        },
        {
          resposta: geometrica
            ? primeiro + (n - 1) * razao
            : primeiro * razao ** (n - 1),
          diagnostico: geometrica
            ? 'Essa é a fórmula da PA. Na PG a razão MULTIPLICA, ela não soma.'
            : 'Essa é a fórmula da PG. Na PA a razão SOMA, ela não multiplica.',
          passo: 0,
          conceito: geometrica ? 'progressoes.geometrica' : 'progressoes.aritmetica',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'facil'
        ? geometrica
          ? 'aₙ = a₁ · qⁿ⁻¹ — atenção ao expoente.'
          : 'aₙ = a₁ + (n − 1)r — conte os saltos, não os termos.'
        : undefined,
  };
}

/** Qual é a soma dos n primeiros termos? */
function exercicioSoma(geometrica: boolean, nivel: Nivel, rng: Rng): Exercicio<number> {
  const primeiro = geometrica ? rng.inteiro(1, 5) : rng.inteiro(1, 10);
  const razao = geometrica ? rng.escolher([2, 3]) : rng.escolher([2, 3, 4, 5, 6]);
  const n = rng.inteiro(5, geometrica ? 8 : 15);

  const progressao = { primeiro, razao, geometrica };
  const { resultado, passos } = somaComPassos(progressao, n);
  const ultimo = termoGeral(progressao, n);

  const nome = geometrica ? 'PG' : 'PA';
  const letraRazao = geometrica ? 'q' : 'r';

  return {
    id: `prog-soma-${nome}-${primeiro}-${razao}-${n}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Numa ${nome} de primeiro termo ${primeiro} e razão ${razao}, qual é a soma dos ${n} ` +
      'primeiros termos?',
    enunciadoTex: `a_1 = ${primeiro} \\qquad ${letraRazao} = ${razao} \\qquad n = ${n}`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: [geometrica ? 'progressoes.geometrica' : 'progressoes.aritmetica'],
    armadilhas: semColisoes(
      [
        {
          resposta: ultimo,
          diagnostico:
            'Esse é o último TERMO, não a soma. A pergunta pede o acumulado de todos eles.',
          passo: 1,
          conceito: geometrica ? 'progressoes.geometrica' : 'progressoes.aritmetica',
        },
        {
          resposta: geometrica
            ? ((primeiro + ultimo) * n) / 2
            : primeiro * ((razao ** n - 1) / (razao - 1)),
          diagnostico: geometrica
            ? 'Você usou a fórmula da soma da PA. Numa PG os termos não crescem de forma ' +
              'linear, então a média dos extremos não representa a soma.'
            : 'Você usou a fórmula da soma da PG numa PA. Aqui a razão soma, e a soma é a ' +
              'média dos extremos vezes a quantidade.',
          passo: 0,
          conceito: geometrica ? 'progressoes.geometrica' : 'progressoes.aritmetica',
        },
        {
          resposta: primeiro * n,
          diagnostico:
            'Multiplicar o primeiro termo pela quantidade só valeria se todos os termos ' +
            'fossem iguais — ou seja, se a razão fosse 0 (ou 1, na PG).',
          passo: 2,
          conceito: geometrica ? 'progressoes.geometrica' : 'progressoes.aritmetica',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

/**
 * Razões convergentes como fração exata.
 *
 * Mostrar "q = 0,333333" obrigaria o aluno a trabalhar com um valor truncado e
 * a chegar a uma resposta que não fecha. Com fração, a conta é exata.
 */
const RAZOES_CONVERGENTES: readonly (readonly [number, number])[] = [
  [1, 2],
  [1, 4],
  [1, 5],
  [1, 10],
  [-1, 2],
  [1, 3],
  [2, 3],
  [3, 4],
];

/** Qual é a soma infinita de uma PG convergente? */
function exercicioSomaInfinita(nivel: Nivel, rng: Rng): Exercicio<number> {
  const primeiro = rng.inteiro(1, 12);
  const [numerador, denominador] = rng.escolher(RAZOES_CONVERGENTES);
  const razao = numerador / denominador;

  const { resultado, passos } = somaInfinitaComPassos(primeiro, razao);
  const gabarito = resultado!;

  const sinal = numerador < 0 ? '-' : '';
  const razaoTex = `${sinal}\\frac{${Math.abs(numerador)}}{${denominador}}`;

  return {
    id: `prog-inf-${primeiro}-${numerador}_${denominador}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Qual é a soma de todos os infinitos termos desta PG?',
    enunciadoTex: `a_1 = ${primeiro} \\qquad q = ${razaoTex}`,
    gabarito,
    resolucao: { resultado: gabarito, passos },
    conceitos: ['progressoes.infinita', 'progressoes.geometrica'],
    armadilhas: semColisoes(
      [
        {
          resposta: primeiro / (1 + razao),
          diagnostico:
            'O denominador é 1 − q, não 1 + q. Com q negativo é fácil trocar: preste atenção ' +
            'ao sinal antes de subtrair.',
          passo: 1,
          conceito: 'progressoes.infinita',
        },
        {
          resposta: primeiro / razao,
          diagnostico:
            'Dividir pela razão não é a fórmula. A soma infinita divide o primeiro termo por ' +
            '1 − q — é o que sobra quando qⁿ vai a zero.',
          passo: 1,
          conceito: 'progressoes.infinita',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: nivel === 'facil' ? 'S = a₁ / (1 − q), válida porque |q| < 1.' : undefined,
  };
}
