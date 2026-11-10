import { numeroEmTex } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;
const par = (v: number): string => (v < 0 ? `(${v})` : `${v}`);
const exatoEDecimal = (v: number): string =>
  Number.isInteger(v)
    ? `${v}`
    : `${numeroEmTex(v)} \\approx ${String(Number(v.toFixed(4))).replace('.', '{,}')}`;

/** Deslocamentos (dx, dy) com dx² + dy² = r² inteiro, dx ≠ 0 e dy ≠ 0 (nem raio nem tangente verticais). */
const DESLOCAMENTOS: readonly (readonly [number, number])[] = [
  [3, 4],
  [4, 3],
  [-3, 4],
  [3, -4],
  [-4, -3],
  [5, 12],
  [-12, 5],
  [6, 8],
  [-8, 6],
];

const reduzidaTex = (a: number, b: number, r2: number): string =>
  `(x ${a >= 0 ? '-' : '+'} ${Math.abs(a)})^{2} + (y ${b >= 0 ? '-' : '+'} ${Math.abs(b)})^{2} = ${r2}`;

/**
 * Reta tangente num ponto da circunferência.
 *
 * A tangente é perpendicular ao raio no ponto de contato: a inclinação do raio
 * é dy/dx, a da tangente é −dx/dy. Pede-se a inclinação (Difícil) ou o
 * coeficiente linear (Extremo).
 */
export function exercicioTangente(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(-4, 4);
  const b = rng.inteiro(-4, 4);
  const [dx, dy] = rng.escolher(DESLOCAMENTOS);
  const r2 = dx * dx + dy * dy;
  const [px, py] = [a + dx, b + dy];
  const mTangente = -dx / dy;
  const q = py - mTangente * px;
  const pedeQ = nivel === 'extremo';
  const gabarito = pedeQ ? q : mTangente;

  return {
    id: `circunf-tangente-${a}${b}-${dx}${dy}-${pedeQ ? 'q' : 'm'}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `O ponto P(${px}, ${py}) está na circunferência. ` +
      (pedeQ
        ? 'A reta tangente em P, escrita como y = mx + q, corta o eixo y em que valor q?'
        : 'Qual é o coeficiente angular da reta tangente à circunferência em P?') +
      (Number.isInteger(gabarito) ? '' : ' Responda como fração ou com 2 casas decimais.'),
    enunciadoTex: reduzidaTex(a, b, r2),
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'O centro sai da equação reduzida.',
          tex: `C(${a},\\; ${b})`,
        },
        {
          descricao: 'A inclinação do raio CP.',
          tex: `m_{CP} = \\frac{${py} - ${par(b)}}{${px} - ${par(a)}} = \\frac{${dy}}{${dx}} = ${exatoEDecimal(dy / dx)}`,
        },
        {
          descricao:
            'A tangente é perpendicular ao raio: a inclinação dela é a recíproca com sinal trocado.',
          tex: `m_t = -\\frac{${dx}}{${dy}} = ${exatoEDecimal(mTangente)}`,
          nota: 'Perpendiculares: o produto das inclinações é −1.',
        },
        ...(pedeQ
          ? [
              {
                descricao: 'A tangente passa por P: substituímos e isolamos q.',
                tex: `${py} = ${numeroEmTex(mTangente)} \\cdot ${par(px)} + q \\;\\Rightarrow\\; q = ${exatoEDecimal(q)}`,
              },
            ]
          : []),
      ],
    },
    conceitos: ['circunferencia.tangente'],
    armadilhas: semColisoes(
      [
        {
          resposta: pedeQ ? py - (dy / dx) * px : dy / dx,
          diagnostico:
            'Essa é a inclinação do RAIO. A tangente é perpendicular a ele: inverta e troque o sinal.',
          passo: 2,
          conceito: 'circunferencia.tangente',
        },
        {
          resposta: pedeQ ? py - (dx / dy) * px : dx / dy,
          diagnostico:
            'Faltou trocar o sinal: perpendiculares têm inclinações de sinais opostos (produto −1).',
          passo: 2,
          conceito: 'circunferencia.tangente',
        },
        ...(pedeQ
          ? [
              {
                resposta: mTangente,
                diagnostico:
                  'Essa é a inclinação m. O pedido é q: ponha P em y = mx + q e isole q.',
                passo: 3,
                conceito: 'circunferencia.tangente',
              },
            ]
          : []),
      ],
      gabarito,
      proximos,
    ),
    dica: pedeQ
      ? `A tangente é perpendicular ao raio CP. Ache m com isso e depois use P(${px}, ${py}) para achar q.`
      : `A tangente é perpendicular ao raio CP, que vai de C(${a}, ${b}) a P(${px}, ${py}): inclinação do raio invertida e com sinal trocado.`,
  };
}

/**
 * Equação geral com coeficiente k ≠ 1 em x² e y²: divide-se por k antes de
 * completar quadrados — passo que, esquecido, estraga o raio.
 */
export function exercicioRaioComCoeficiente(nivel: Nivel, rng: Rng): Exercicio<number> {
  const k = rng.escolher([2, 3, 4]);
  const a = rng.inteiro(-5, 5);
  const b = rng.inteiro(-5, 5);
  const r = rng.inteiro(1, 7);
  const d = -2 * a;
  const e = -2 * b;
  const f = a * a + b * b - r * r;
  const termo = (coef: number, resto: string): string =>
    coef === 0 ? '' : ` ${coef > 0 ? '+' : '-'} ${Math.abs(coef)}${resto}`;
  const tex = `${k}x^{2} + ${k}y^{2}${termo(k * d, 'x')}${termo(k * e, 'y')}${termo(k * f, '')} = 0`;

  return {
    id: `circunf-raio-k-${k}-${a}${b}${r}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Qual é o raio desta circunferência?',
    enunciadoTex: tex,
    gabarito: r,
    resolucao: {
      resultado: r,
      passos: [
        {
          descricao: `Os termos ao quadrado vêm multiplicados por ${k}: dividimos a equação inteira por ${k}.`,
          tex: `x^{2} + y^{2}${termo(d, 'x')}${termo(e, 'y')}${termo(f, '')} = 0`,
        },
        {
          descricao: 'Completamos os quadrados em x e em y.',
          tex: `${reduzidaTex(a, b, r * r)}`,
          nota: `Somamos ${a * a} e ${b * b} dos dois lados (os quadrados das metades de ${d} e ${e}).`,
        },
        { descricao: 'O raio é a raiz do lado direito.', tex: `r = \\sqrt{${r * r}} = ${r}` },
      ],
    },
    conceitos: ['circunferencia.geral'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.sqrt(Math.max(0, k * k * (a * a + b * b) - k * f)),
          diagnostico: `Completar quadrados sem dividir por ${k} dá um raio errado: a forma (x − a)² + (y − b)² = r² exige coeficiente 1 em x² e y².`,
          passo: 0,
          conceito: 'circunferencia.geral',
        },
        {
          resposta: r * r,
          diagnostico: 'Esse é r². Falta tirar a raiz.',
          passo: 2,
          conceito: 'circunferencia.geral',
        },
      ],
      r,
      proximos,
    ),
    dica: `Divida tudo por ${k} para deixar x² e y² com coeficiente 1; depois complete os quadrados.`,
  };
}
