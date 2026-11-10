import { Rng } from '@core/treino/rng/rng';
import { numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Armadilha, Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

/**
 * Regime de amortecimento com as grandezas físicas: m·y″ + c·y′ + k·y = 0.
 *
 * O tópico já classificava pelo discriminante de y″ + by′ + cy = 0, mas sem
 * massa, amortecimento e rigidez com unidade — que é como o problema chega
 * numa suspensão ou num amortecedor. A fronteira de tudo é c² = 4mk.
 */

const { saoEquivalentes, formatar } = numeroComCasas(4);
const tex = (v: number): string =>
  Number.isInteger(v) ? String(v) : formatar(v).replace(',', '{,}');

const EDO = (m: number | string, c: number | string, k: number | string): string =>
  `${m}y'' + ${c}y' + ${k}y = 0`;

function montar(
  id: string,
  nivel: Nivel,
  enunciado: string,
  enunciadoTex: string,
  gabarito: number,
  passos: Exercicio<number>['resolucao']['passos'],
  armadilhas: Armadilha<number>[],
  dica: string | undefined,
): Exercicio<number> {
  return {
    id,
    nivel,
    enunciado,
    enunciadoTex,
    gabarito,
    resolucao: { resultado: gabarito, passos },
    conceitos: ['edo2.amortecimento', 'edo2.regimes'],
    armadilhas: semColisoes(
      armadilhas.filter((a) => Number.isFinite(a.resposta)),
      gabarito,
      saoEquivalentes,
    ),
    dica,
  };
}

/** Médio: o c do amortecimento crítico. */
export function exercicioAmortecimentoCritico(nivel: Nivel, rng: Rng): Exercicio<number> {
  const m = rng.inteiro(1, 5);
  const r = rng.inteiro(1, 6);
  const k = m * r * r;
  const raiz = m * r;
  const gabarito = 2 * raiz;

  return montar(
    `amort-critico-${m}-${k}-${rng.inteiro(0, 9999)}`,
    nivel,
    `Uma massa de ${m} kg está presa a uma mola de rigidez ${k} N/m. Qual coeficiente de ` +
      'amortecimento c, em N·s/m, deixa o sistema CRITICAMENTE amortecido?',
    EDO(m, 'c', k),
    gabarito,
    [
      {
        descricao: 'A equação característica troca y por eʳᵗ.',
        tex: `${m}r^{2} + cr + ${k} = 0`,
      },
      {
        descricao: 'Amortecimento crítico é a raiz dupla: discriminante zero.',
        tex: `\\Delta = c^{2} - 4 \\cdot ${m} \\cdot ${k} = 0`,
      },
      {
        descricao: 'Isolando c (positivo, porque é atrito).',
        tex: `c = 2\\sqrt{${m} \\cdot ${k}} = 2\\sqrt{${m * k}} = 2 \\cdot ${raiz} = ${gabarito}`,
        nota: 'Menos que isso, o sistema oscila; mais, volta devagar sem oscilar.',
      },
    ],
    [
      {
        resposta: raiz,
        diagnostico: 'Faltou o 2: de c² = 4mk sai c = 2√(mk), não √(mk).',
        passo: 2,
        conceito: 'edo2.amortecimento',
      },
      {
        resposta: 4 * m * k,
        diagnostico: 'Esse é c², não c: falta tirar a raiz quadrada.',
        passo: 2,
        conceito: 'edo2.amortecimento',
      },
      {
        resposta: 2 * Math.sqrt(k),
        diagnostico: `A massa entra na conta: c = 2√(m·k), com m = ${m}.`,
        passo: 1,
        conceito: 'edo2.amortecimento',
      },
    ],
    nivel === 'medio'
      ? 'Crítico é a raiz dupla da característica: c² − 4mk = 0, então c = 2√(mk).'
      : undefined,
  );
}

/** Difícil: a rigidez a partir da qual o sistema passa a oscilar. */
export function exercicioRigidezLimite(nivel: Nivel, rng: Rng): Exercicio<number> {
  const m = rng.inteiro(1, 6);
  const c = rng.inteiro(2, 12);
  const gabarito = (c * c) / (4 * m);
  const inteiro = Number.isInteger(gabarito);

  return montar(
    `amort-rigidez-${m}-${c}-${rng.inteiro(0, 9999)}`,
    nivel,
    `Uma massa de ${m} kg tem amortecimento c = ${c} N·s/m. A partir de que rigidez k, em N/m, ` +
      'o sistema passa a OSCILAR?' +
      (inteiro ? '' : ' Responda com 4 casas decimais.'),
    EDO(m, c, 'k'),
    gabarito,
    [
      {
        descricao:
          'Oscila quando as raízes da característica são complexas: discriminante negativo.',
        tex: `\\Delta = ${c}^{2} - 4 \\cdot ${m} \\cdot k < 0`,
      },
      {
        descricao: 'Isolando k.',
        tex: `${c * c} < ${4 * m}k \\;\\Rightarrow\\; k > \\frac{${c * c}}{${4 * m}}`,
      },
      {
        descricao: 'A fronteira, onde o amortecimento é crítico.',
        tex: `k = \\frac{${c}^{2}}{4 \\cdot ${m}} = ${tex(gabarito)}`,
        nota: 'Mola mais dura que isso vence o atrito, e o sistema oscila.',
      },
    ],
    [
      {
        resposta: c / (4 * m),
        diagnostico: 'O c entra AO QUADRADO no discriminante: Δ = c² − 4mk.',
        passo: 0,
        conceito: 'edo2.amortecimento',
      },
      {
        resposta: (c * c) / m,
        diagnostico: 'Faltou o 4 de 4mk ao isolar k.',
        passo: 1,
        conceito: 'edo2.amortecimento',
      },
      {
        resposta: (c / 2) ** 2,
        diagnostico: `A massa divide: k = c²/(4m), com m = ${m}.`,
        passo: 2,
        conceito: 'edo2.amortecimento',
      },
    ],
    nivel === 'dificil'
      ? 'Oscila quando c² − 4mk < 0. A fronteira é c² − 4mk = 0: isole k.'
      : undefined,
  );
}

/** Extremo: em quanto tempo a amplitude da oscilação amortecida cai à metade. */
export function exercicioMeiaAmplitude(nivel: Nivel, rng: Rng): Exercicio<number> {
  const m = rng.inteiro(1, 5);
  const c = rng.inteiro(1, 8);
  const k = Math.floor((c * c) / (4 * m)) + rng.inteiro(2, 30);
  const taxa = c / (2 * m);
  const gabarito = Math.log(2) / taxa;
  const omega = Math.sqrt(4 * m * k - c * c) / (2 * m);

  return montar(
    `amort-meia-${m}-${c}-${k}-${rng.inteiro(0, 9999)}`,
    nivel,
    `Uma massa de ${m} kg, mola de ${k} N/m e amortecimento ${c} N·s/m. Em quantos segundos a ` +
      'amplitude da oscilação cai à METADE? Responda com 4 casas decimais.',
    EDO(m, c, k),
    gabarito,
    [
      {
        descricao: 'Primeiro, o regime: o discriminante é negativo, então o sistema oscila.',
        tex: `\\Delta = ${c}^{2} - 4 \\cdot ${m} \\cdot ${k} = ${c * c - 4 * m * k} < 0`,
      },
      {
        descricao:
          'As raízes são complexas; a parte real dá o decaimento, a imaginária a oscilação.',
        tex: `r = -\\frac{${c}}{2 \\cdot ${m}} \\pm ${tex(Number(omega.toFixed(4)))}\\,i \\;\\Rightarrow\\; y = A\\,e^{-${tex(taxa)}\\,t}\\cos(\\ldots)`,
      },
      {
        descricao: 'A amplitude é a envoltória exponencial; igualamos à metade do valor inicial.',
        tex: `e^{-${tex(taxa)}\\,t} = \\frac{1}{2} \\;\\Rightarrow\\; t = \\frac{\\ln 2}{${tex(taxa)}}`,
        nota: 'O cosseno só oscila entre −1 e 1; quem encolhe é a exponencial.',
      },
      {
        descricao: 'Calculando.',
        tex: `t = \\frac{0{,}6931}{${tex(taxa)}} = ${tex(gabarito)}\\ \\text{s}`,
      },
    ],
    [
      {
        resposta: Math.log(2) / c,
        diagnostico: `A taxa de decaimento é c/(2m), não c: com m = ${m}, ela vale ${formatar(taxa)}.`,
        passo: 1,
        conceito: 'edo2.amortecimento',
      },
      {
        resposta: 1 / taxa,
        diagnostico:
          'Essa é a constante de tempo (cai a 1/e ≈ 37%). Para cair à metade, entra ln 2.',
        passo: 2,
        conceito: 'edo2.amortecimento',
      },
      {
        resposta: (2 * Math.PI) / omega,
        diagnostico:
          'Esse é o período da oscilação. O pedido é o tempo para a AMPLITUDE cair à metade.',
        passo: 1,
        conceito: 'edo2.oscilacao',
      },
    ],
    'A amplitude decai como e elevado a −c·t/(2m). Iguale a 1/2 e isole t.',
  );
}
