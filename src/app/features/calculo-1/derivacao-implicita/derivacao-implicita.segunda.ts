import { Rng } from '@core/treino/rng/rng';
import { numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const { saoEquivalentes, formatar } = numeroComCasas(4);

/** Fração reduzida em texto e em LaTeX, para gabaritos racionais. */
function fracao(num: number, den: number): { texto: string; tex: string } {
  const mdc = (a: number, b: number): number => (b === 0 ? Math.abs(a) : mdc(b, a % b));
  const d = mdc(num, den) || 1;
  let [n, q] = [num / d, den / d];
  if (q < 0) [n, q] = [-n, -q];
  if (q === 1) return { texto: String(n), tex: String(n) };
  return {
    texto: `${n}/${q}`,
    tex: `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${q}}`,
  };
}

const par = (v: number): string => (v < 0 ? `(${v})` : `${v}`);

/**
 * Derivada segunda implícita de ax² + by² = c num ponto.
 *
 * Deriva-se y′ = −ax/(by) de novo, pela regra do quociente, lembrando que y
 * depende de x — o y′ reaparece e é substituído. Sai y″ = −ac/(b²y³): a
 * concavidade da elipse em cada ponto.
 */
export function exercicioSegundaImplicita(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(1, nivel === 'medio' ? 2 : 4);
  const b = rng.inteiro(1, nivel === 'medio' ? 2 : 4);
  const x = rng.inteiro(1, 4) * rng.sinal();
  const y = rng.inteiro(1, 4) * rng.sinal();
  const c = a * x * x + b * y * y;

  const gabarito = (-a * c) / (b * b * y ** 3);
  const primeira = (-a * x) / (b * y);
  const g = fracao(-a * c, b * b * y ** 3);
  const p = fracao(-a * x, b * y);
  const ta = a === 1 ? '' : a;
  const tb = b === 1 ? '' : b;

  return {
    id: `implicita-segunda-${a}${b}-${x}${y}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `A curva passa pelo ponto (${x}, ${y}). Calcule a derivada SEGUNDA d²y/dx² nesse ponto. ` +
      'Responda como fração ou com 4 casas decimais.',
    enunciadoTex: `${ta}x^{2} + ${tb}y^{2} = ${c}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A primeira derivada, implicitamente.',
          tex: `${2 * a}x + ${2 * b}y\\,y' = 0 \\;\\Rightarrow\\; y' = -\\frac{${a}x}{${b}y}`,
        },
        {
          descricao:
            'Derivamos y′ de novo pela regra do quociente — y depende de x, então aparece y′ outra vez.',
          tex: `y'' = -\\frac{${a} \\cdot ${b}y - ${a}x \\cdot ${b}y'}{(${b}y)^{2}} = -\\frac{${a}(y - x\\,y')}{${b}y^{2}}`,
        },
        {
          descricao: `No ponto, y′ = ${p.texto}.`,
          tex: `y' = -\\frac{${a} \\cdot ${par(x)}}{${b} \\cdot ${par(y)}} = ${p.tex}`,
        },
        {
          descricao: 'Substituindo x, y e y′.',
          tex:
            `y'' = -\\frac{${a}\\left(${y} - ${par(x)} \\cdot \\left(${p.tex}\\right)\\right)}{${b} \\cdot ${par(y)}^{2}} = ${g.tex}` +
            (Number.isInteger(gabarito)
              ? ''
              : ` \\approx ${formatar(gabarito).replace(',', '{,}')}`),
          nota: `Atalho que sai da mesma conta: y″ = −a·c/(b²·y³) = −${a}·${c}/(${b * b}·${y ** 3}).`,
        },
      ],
    },
    conceitos: ['implicita.segunda'],
    armadilhas: semColisoes(
      [
        {
          resposta: primeira,
          diagnostico: 'Essa é a derivada PRIMEIRA. A pergunta pede derivar mais uma vez.',
          passo: 0,
          conceito: 'implicita.segunda',
        },
        {
          resposta: -a / (b * y),
          diagnostico:
            'Ao derivar −ax/(by) de novo, o y também varia: a regra do quociente traz um y′ no ' +
            'numerador. Tratar y como constante perde esse termo.',
          passo: 1,
          conceito: 'implicita.segunda',
        },
        {
          resposta: -gabarito,
          diagnostico: 'O sinal ficou trocado: y″ = −a(y − x·y′)/(b·y²), com o menos na frente.',
          passo: 1,
          conceito: 'implicita.segunda',
        },
      ],
      gabarito,
      saoEquivalentes,
    ),
    dica:
      `Primeiro y′ = −${a}x/(${b}y). Derive de novo pelo quociente lembrando que y depende de x, ` +
      `e troque o y′ que aparecer por ${p.texto}.`,
  };
}

/**
 * Onde a tangente é horizontal em x² ± xy + y² = c.
 *
 * dy/dx = 0 exige o NUMERADOR da derivada nulo — uma reta pela origem — e o
 * ponto tem de estar também na curva. Duas equações, dois pontos.
 */
export function exercicioTangenteHorizontal(nivel: Nivel, rng: Rng): Exercicio<number> {
  const s = rng.escolher([1, -1]);
  const k = rng.inteiro(1, 6);
  const c = 3 * k * k;
  // dy/dx = −(2x + s·y)/(s·x + 2y) = 0 ⟹ y = −2s·x.
  const pontos = [
    [k, -2 * s * k],
    [-k, 2 * s * k],
  ] as const;
  const gabarito = Math.max(pontos[0][1], pontos[1][1]);
  const mais = s > 0 ? '+' : '-';
  const menosSe = s > 0 ? '-' : '';

  return {
    id: `implicita-horizontal-${s}-${k}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'Em dois pontos da curva a reta tangente é horizontal. Qual é a MAIOR ordenada y entre eles?',
    enunciadoTex: `x^{2} ${mais} xy + y^{2} = ${c}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'Derivando implicitamente (o termo xy pede a regra do produto) e isolando dy/dx.',
          tex: `2x ${mais} y ${mais} x\\,y' + 2y\\,y' = 0 \\;\\Rightarrow\\; y' = -\\frac{2x ${mais} y}{${s > 0 ? '' : '-'}x + 2y}`,
        },
        {
          descricao: 'Tangente horizontal: y′ = 0, isto é, o numerador zera.',
          tex: `2x ${mais} y = 0 \\;\\Rightarrow\\; y = ${menosSe}2x`,
        },
        {
          descricao: 'O ponto também precisa estar na curva: substituímos y.',
          tex: `x^{2} ${mais} x(${menosSe}2x) + 4x^{2} = 3x^{2} = ${c} \\;\\Rightarrow\\; x = \\pm ${k}`,
        },
        {
          descricao: 'Os dois pontos e a maior ordenada.',
          tex: `(${pontos[0][0]}, ${pontos[0][1]}) \\text{ e } (${pontos[1][0]}, ${pontos[1][1]}) \\;\\Rightarrow\\; y = ${gabarito}`,
        },
      ],
    },
    conceitos: ['implicita.tangente', 'implicita.isolamento'],
    armadilhas: semColisoes(
      [
        {
          resposta: k,
          diagnostico: `Esse é o x do ponto. A pergunta é a ordenada y, que vem de y = ${s > 0 ? '−' : ''}2x.`,
          passo: 3,
          conceito: 'implicita.tangente',
        },
        {
          resposta: Math.sqrt(c),
          diagnostico:
            'Com x = 0 a tangente NÃO é horizontal. Horizontal pede o numerador de dy/dx igual a ' +
            'zero, junto com a equação da curva.',
          passo: 1,
          conceito: 'implicita.tangente',
        },
        {
          resposta: -gabarito,
          diagnostico: 'Essa é a MENOR das duas ordenadas.',
          passo: 3,
          conceito: 'implicita.tangente',
        },
      ],
      gabarito,
      saoEquivalentes,
    ),
    dica:
      'Tangente horizontal: dy/dx = 0, ou seja, o numerador da derivada zera. Resolva isso junto ' +
      'com a equação da curva.',
  };
}
