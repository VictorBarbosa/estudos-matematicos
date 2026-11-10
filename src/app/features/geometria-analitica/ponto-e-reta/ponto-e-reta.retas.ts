import { numeroEmTex } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;

/** `ax + by + c = 0` com os sinais certos. */
function retaGeralTex(a: number, b: number, c: number): string {
  const termoX = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
  const termoY = b === 0 ? '' : ` ${b > 0 ? '+' : '-'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}y`;
  const termoC = c === 0 ? '' : ` ${c > 0 ? '+' : '-'} ${Math.abs(c)}`;
  return `${termoX}${termoY}${termoC} = 0`;
}

/** `y = mx + q`, com m e q possivelmente fracionários. */
function retaReduzidaTex(m: number, q: number): string {
  const termoM = m === 1 ? 'x' : m === -1 ? '-x' : `${numeroEmTex(m)}x`;
  const termoQ = q === 0 ? '' : ` ${q > 0 ? '+' : '-'} ${numeroEmTex(Math.abs(q))}`;
  return `y = ${termoM}${termoQ}`;
}

/** O valor exato e, se não for inteiro, o decimal ao lado: `-\frac{1}{4} \approx -0{,}25`. */
const exatoEDecimal = (v: number): string =>
  Number.isInteger(v)
    ? `${v}`
    : `${numeroEmTex(v)} \\approx ${String(Number(v.toFixed(4))).replace('.', '{,}')}`;

const par = (v: number): string => (v < 0 ? `(${v})` : `${v}`);

/** Os pares (a, b) com √(a² + b²) inteiro: a distância sai exata. */
const PITAGORICOS: readonly (readonly [number, number])[] = [
  [3, 4],
  [4, 3],
  [6, 8],
  [8, 6],
  [5, 12],
  [12, 5],
];

/**
 * Distância de um ponto a uma reta: |ax₀ + by₀ + c| / √(a² + b²).
 *
 * - Médio: a e b de um terno pitagórico, raiz exata.
 * - Difícil: coeficientes quaisquer, a raiz não fecha (2 casas).
 * - Extremo: a reta vem como y = mx + q e precisa ir para a forma geral.
 */
export function exercicioDistanciaPontoReta(nivel: Nivel, rng: Rng): Exercicio<number> {
  let a: number, b: number;
  if (nivel === 'medio') {
    [a, b] = rng.escolher(PITAGORICOS);
    a *= rng.sinal();
  } else {
    do {
      a = rng.inteiro(-6, 6);
      b = rng.inteiro(-6, 6);
    } while (a === 0 || b === 0 || Number.isInteger(Math.hypot(a, b)));
  }
  const c = rng.inteiro(-12, 12);
  const x0 = rng.inteiro(-6, 6);
  const y0 = rng.inteiro(-6, 6);

  const reduzida = nivel === 'extremo';
  // Na reduzida, y = mx + q com m = −a/b e q = −c/b; multiplicar por −b volta à geral.
  const m = -a / b;
  const q = -c / b;

  const valor = a * x0 + b * y0 + c;
  const raiz = Math.hypot(a, b);
  const gabarito = Math.abs(valor) / raiz;
  const exata = Number.isInteger(raiz);

  const passos = [
    ...(reduzida
      ? [
          {
            descricao: `A fórmula pede a reta na forma ax + by + c = 0. Multiplicamos y = mx + q por ${b} e passamos tudo para um lado.`,
            tex: `${retaReduzidaTex(m, q)} \\;\\Rightarrow\\; ${retaGeralTex(a, b, c)}`,
          },
        ]
      : []),
    {
      descricao: `Com a = ${a}, b = ${b} e c = ${c}, a distância do ponto (${x0}, ${y0}) à reta é:`,
      tex: 'd = \\frac{|ax_0 + by_0 + c|}{\\sqrt{a^{2} + b^{2}}}',
    },
    {
      descricao: 'O numerador: substituímos o ponto na expressão da reta e tiramos o módulo.',
      tex: `|${a} \\cdot ${par(x0)} + ${par(b)} \\cdot ${par(y0)} + ${par(c)}| = |${valor}| = ${Math.abs(valor)}`,
    },
    {
      descricao: 'O denominador: o comprimento do vetor normal (a, b).',
      tex: `\\sqrt{${par(a)}^{2} + ${par(b)}^{2}} = \\sqrt{${a * a + b * b}}${exata ? ` = ${raiz}` : ` \\approx ${raiz.toFixed(4).replace('.', '{,}')}`}`,
    },
    {
      descricao: 'Dividindo.',
      tex: `d = \\frac{${Math.abs(valor)}}{${exata ? raiz : `\\sqrt{${a * a + b * b}}`}} \\approx ${gabarito.toFixed(4).replace('.', '{,}')}`,
    },
  ];

  return {
    id: `ponto-reta-distreta-${a}${b}${c}-${x0}${y0}-${reduzida ? 'r' : 'g'}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é a distância do ponto P(${x0}, ${y0}) à reta? (2 casas decimais)`,
    enunciadoTex: reduzida ? retaReduzidaTex(m, q) : retaGeralTex(a, b, c),
    gabarito,
    resolucao: { resultado: gabarito, passos },
    conceitos: ['ponto-reta.distancia-reta'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.abs(valor),
          diagnostico: `Faltou dividir por √(a² + b²) = √${a * a + b * b}. O numerador sozinho não é distância: muda se a equação da reta for multiplicada por um número.`,
          passo: passos.length - 1,
          conceito: 'ponto-reta.distancia-reta',
        },
        {
          resposta: Math.abs(valor) / (Math.abs(a) + Math.abs(b)),
          diagnostico: 'O denominador é √(a² + b²), não a + b: é o comprimento do vetor (a, b).',
          passo: passos.length - 2,
          conceito: 'ponto-reta.distancia-reta',
        },
        {
          resposta: Math.abs(a * x0 + b * y0) / raiz,
          diagnostico: `Faltou o c = ${c} no numerador: substitua o ponto na expressão INTEIRA ax + by + c.`,
          passo: passos.length - 3,
          conceito: 'ponto-reta.distancia-reta',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'medio'
        ? 'Use d = |a·x₀ + b·y₀ + c| / √(a² + b²), com a reta na forma ax + by + c = 0.'
        : nivel === 'extremo'
          ? 'Passe a reta para a forma ax + by + c = 0 antes de usar a fórmula da distância.'
          : undefined,
  };
}

/**
 * Reta perpendicular.
 *
 * - Médio: a inclinação da perpendicular, −1/m.
 * - Difícil: o coeficiente linear da perpendicular por um ponto dado.
 * - Extremo: o mesmo, com a reta dada na forma geral (inclinação −a/b).
 */
export function exercicioPerpendicular(nivel: Nivel, rng: Rng): Exercicio<number> {
  const x0 = rng.inteiro(-5, 5);
  const y0 = rng.inteiro(-5, 5);

  if (nivel === 'medio') {
    let m = rng.inteiro(-5, 5);
    if (m === 0) m = 2;
    const q = rng.inteiro(-6, 6);
    const gabarito = -1 / m;
    return {
      id: `ponto-reta-perp-m-${m}${q}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        'Qual é o coeficiente angular de uma reta perpendicular a esta?' +
        (Number.isInteger(gabarito) ? '' : ' Responda como fração ou com 2 casas decimais.'),
      enunciadoTex: retaReduzidaTex(m, q),
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          { descricao: 'A inclinação da reta dada é o número que multiplica x.', tex: `m = ${m}` },
          {
            descricao: 'Perpendiculares: o produto das inclinações é −1.',
            tex: "m \\cdot m' = -1 \\;\\Rightarrow\\; m' = -\\frac{1}{m}",
          },
          {
            descricao: 'Invertemos e trocamos o sinal.',
            tex: `m' = -\\frac{1}{${m}} = ${exatoEDecimal(gabarito)}`,
          },
        ],
      },
      conceitos: ['ponto-reta.posicoes'],
      armadilhas: semColisoes(
        [
          {
            resposta: 1 / m,
            diagnostico:
              'Faltou trocar o sinal: a perpendicular tem inclinação −1/m, o produto tem de dar −1.',
            passo: 2,
            conceito: 'ponto-reta.posicoes',
          },
          {
            resposta: -m,
            diagnostico: 'Faltou inverter: a perpendicular tem inclinação −1/m, não −m.',
            passo: 2,
            conceito: 'ponto-reta.posicoes',
          },
          {
            resposta: m,
            diagnostico: 'Mesma inclinação é a condição de PARALELAS. Perpendicular é −1/m.',
            passo: 1,
            conceito: 'ponto-reta.posicoes',
          },
        ],
        gabarito,
        proximos,
      ),
      dica: 'Perpendicular: inverta a inclinação e troque o sinal (m′ = −1/m).',
    };
  }

  // Difícil e Extremo: coeficiente linear da perpendicular que passa por P.
  let m: number;
  let enunciadoTex: string;
  let passoInclinacao: { descricao: string; tex: string };
  if (nivel === 'extremo') {
    let a: number, b: number;
    do {
      a = rng.inteiro(-5, 5);
      b = rng.inteiro(-5, 5);
    } while (a === 0 || b === 0);
    const c = rng.inteiro(-9, 9);
    m = -a / b;
    enunciadoTex = retaGeralTex(a, b, c);
    passoInclinacao = {
      descricao: `Na forma ax + by + c = 0, isolando y a inclinação é −a/b, com a = ${a} e b = ${b}.`,
      tex: `m = -\\frac{${a}}{${b}} = ${numeroEmTex(m)}`,
    };
  } else {
    m = rng.inteiro(-4, 4);
    if (m === 0) m = 3;
    const q = rng.inteiro(-6, 6);
    enunciadoTex = retaReduzidaTex(m, q);
    passoInclinacao = { descricao: 'A inclinação da reta dada.', tex: `m = ${m}` };
  }

  const mp = -1 / m;
  const gabarito = y0 - mp * x0;

  return {
    id: `ponto-reta-perp-q-${numeroEmTex(m)}-${x0}${y0}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `A reta perpendicular a esta que passa por P(${x0}, ${y0}) tem equação y = m′x + n. ` +
      'Qual é o coeficiente linear n?' +
      (Number.isInteger(gabarito) ? '' : ' Responda como fração ou com 2 casas decimais.'),
    enunciadoTex,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        passoInclinacao,
        {
          descricao: 'A perpendicular tem inclinação −1/m.',
          tex: `m' = -\\frac{1}{${numeroEmTex(m)}} = ${numeroEmTex(mp)}`,
        },
        {
          descricao: `Ela passa por P(${x0}, ${y0}): substituímos em y = m′x + n.`,
          tex: `${y0} = ${numeroEmTex(mp)} \\cdot ${par(x0)} + n`,
        },
        {
          descricao: 'Isolando n.',
          tex: `n = ${y0} - \\left(${numeroEmTex(mp * x0)}\\right) = ${exatoEDecimal(gabarito)}`,
        },
      ],
    },
    conceitos: ['ponto-reta.posicoes', 'ponto-reta.equacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: y0 - m * x0,
          diagnostico:
            'Você usou a inclinação da reta dada: essa é a PARALELA por P. A perpendicular usa −1/m.',
          passo: 1,
          conceito: 'ponto-reta.posicoes',
        },
        {
          resposta: y0 + mp * x0,
          diagnostico: 'O sinal ao isolar n saiu trocado: n = y₀ − m′·x₀.',
          passo: 3,
          conceito: 'ponto-reta.equacao',
        },
        {
          resposta: y0 - (1 / m) * x0,
          diagnostico: 'Faltou trocar o sinal da inclinação: a perpendicular tem m′ = −1/m.',
          passo: 1,
          conceito: 'ponto-reta.posicoes',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'dificil'
        ? 'Ache m′ = −1/m. Depois use o ponto: n = y₀ − m′·x₀.'
        : 'Na forma ax + by + c = 0, a inclinação é −a/b. A perpendicular tem −1 sobre ela.',
  };
}
