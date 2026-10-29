import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos';
import { formatar } from '@core/math/algebra/polinomio';

/**
 * Geometria analítica: descrever formas com equações.
 *
 * O fio condutor é sempre o mesmo — toda figura aqui é o conjunto dos pontos
 * que satisfazem uma condição de distância, e a equação é apenas essa
 * condição escrita com coordenadas.
 */

export interface Ponto {
  readonly x: number;
  readonly y: number;
}

export function pontoParaTex({ x, y }: Ponto): string {
  return `(${formatar(x)},\\; ${formatar(y)})`;
}

/** Distância entre dois pontos: Pitágoras aplicado às diferenças. */
export function distanciaComPassos(a: Ponto, b: Ponto): Resolucao<number> {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const resultado = Math.hypot(dx, dy);

  return {
    resultado,
    passos: [
      {
        descricao: 'As diferenças de coordenadas são os catetos de um triângulo retângulo.',
        tex: `\\Delta x = ${formatar(b.x)} - ${formatar(a.x)} = ${formatar(dx)} \\qquad \\Delta y = ${formatar(b.y)} - ${formatar(a.y)} = ${formatar(dy)}`,
      },
      {
        descricao: 'A distância é a hipotenusa desse triângulo.',
        tex: `d = \\sqrt{(\\Delta x)^{2} + (\\Delta y)^{2}} = \\sqrt{${formatar(dx * dx)} + ${formatar(dy * dy)}}`,
      },
      {
        descricao: 'Calculando.',
        tex: `d = ${formatar(resultado)}`,
        nota: 'Como as diferenças são elevadas ao quadrado, a ordem dos pontos não importa.',
      },
    ],
  };
}

export function pontoMedio(a: Ponto, b: Ponto): Ponto {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export interface Reta {
  /** Coeficiente angular; `null` quando a reta é vertical. */
  readonly coeficienteAngular: number | null;
  readonly coeficienteLinear: number;
  readonly vertical: boolean;
  /** x fixo das retas verticais. */
  readonly xFixo?: number;
}

/** A reta que passa por dois pontos. */
export function retaPorDoisPontosComPassos(a: Ponto, b: Ponto): Resolucao<Reta> {
  if (a.x === b.x && a.y === b.y) {
    throw new ErroMatematico('Dois pontos coincidentes não determinam uma reta.');
  }

  if (a.x === b.x) {
    return {
      resultado: { coeficienteAngular: null, coeficienteLinear: 0, vertical: true, xFixo: a.x },
      passos: [
        {
          descricao: 'Os dois pontos têm a mesma abscissa, então a reta é vertical.',
          tex: `x = ${formatar(a.x)}`,
          nota: 'Retas verticais não têm coeficiente angular: a divisão por Δx seria por zero.',
        },
      ],
    };
  }

  const m = (b.y - a.y) / (b.x - a.x);
  const n = a.y - m * a.x;

  return {
    resultado: { coeficienteAngular: m, coeficienteLinear: n, vertical: false },
    passos: [
      {
        descricao: 'O coeficiente angular é a razão entre as variações.',
        tex: `m = \\frac{\\Delta y}{\\Delta x} = \\frac{${formatar(b.y - a.y)}}{${formatar(b.x - a.x)}} = ${formatar(m)}`,
      },
      {
        descricao: 'Substituímos um dos pontos para achar o coeficiente linear.',
        tex: `${formatar(a.y)} = ${formatar(m)} \\cdot ${formatar(a.x)} + n \\;\\Rightarrow\\; n = ${formatar(n)}`,
      },
      {
        descricao: 'A equação reduzida da reta.',
        tex: `y = ${formatar(m)}x ${n >= 0 ? '+' : '-'} ${formatar(Math.abs(n))}`,
      },
    ],
  };
}

/** Duas retas são paralelas quando têm a mesma inclinação. */
export function saoParalelas(m1: number, m2: number): boolean {
  return Math.abs(m1 - m2) < 1e-9;
}

/** E perpendiculares quando o produto das inclinações é −1. */
export function saoPerpendiculares(m1: number, m2: number): boolean {
  return Math.abs(m1 * m2 + 1) < 1e-9;
}

export interface Circunferencia {
  readonly centro: Ponto;
  readonly raio: number;
}

/**
 * Da equação geral à reduzida, completando quadrados.
 *
 * x² + y² + Dx + Ey + F = 0 vira (x−a)² + (y−b)² = r², que é a definição
 * geométrica: os pontos a distância r do centro.
 */
export function circunferenciaComPassos(
  d: number,
  e: number,
  f: number,
): Resolucao<Circunferencia> {
  const centro: Ponto = { x: -d / 2, y: -e / 2 };
  const raioQuadrado = centro.x * centro.x + centro.y * centro.y - f;

  if (raioQuadrado <= 0) {
    throw new ErroMatematico(
      'Com esses coeficientes não há circunferência real: o raio ao quadrado seria negativo ou nulo.',
    );
  }

  const raio = Math.sqrt(raioQuadrado);

  return {
    resultado: { centro, raio },
    passos: [
      {
        descricao: 'Partimos da equação geral.',
        tex: `x^{2} + y^{2} ${d >= 0 ? '+' : '-'} ${formatar(Math.abs(d))}x ${e >= 0 ? '+' : '-'} ${formatar(Math.abs(e))}y ${f >= 0 ? '+' : '-'} ${formatar(Math.abs(f))} = 0`,
      },
      {
        descricao: 'Completamos o quadrado em x e em y, somando metade do coeficiente ao quadrado.',
        tex: `\\left(x ${d >= 0 ? '+' : '-'} ${formatar(Math.abs(d / 2))}\\right)^{2} + \\left(y ${e >= 0 ? '+' : '-'} ${formatar(Math.abs(e / 2))}\\right)^{2} = ${formatar(raioQuadrado)}`,
      },
      {
        descricao: 'Comparando com a forma reduzida, lemos centro e raio.',
        tex: `C = ${pontoParaTex(centro)} \\qquad r = ${formatar(raio)}`,
        nota: 'O sinal do centro é o oposto do que aparece dentro do parêntese.',
      },
    ],
  };
}

/** Posição de um ponto em relação a uma circunferência. */
export function posicaoRelativa(
  ponto: Ponto,
  circunferencia: Circunferencia,
): 'dentro' | 'sobre' | 'fora' {
  const distancia = Math.hypot(
    ponto.x - circunferencia.centro.x,
    ponto.y - circunferencia.centro.y,
  );

  if (Math.abs(distancia - circunferencia.raio) < 1e-9) {
    return 'sobre';
  }
  return distancia < circunferencia.raio ? 'dentro' : 'fora';
}

export type TipoConica = 'elipse' | 'parabola' | 'hiperbole' | 'circunferencia';

export interface Conica {
  readonly tipo: TipoConica;
  /** Semieixos a e b, quando fazem sentido. */
  readonly a: number;
  readonly b: number;
  readonly excentricidade: number;
  readonly focos: readonly Ponto[];
}

/**
 * Descreve a cônica de semieixos a e b.
 *
 * A excentricidade mede o quanto a curva se afasta de um círculo: 0 é o
 * círculo perfeito, perto de 1 é uma elipse bem achatada, e acima de 1 a
 * curva deixa de se fechar.
 */
export function conicaComPassos(a: number, b: number, hiperbole: boolean): Resolucao<Conica> {
  if (a <= 0 || b <= 0) {
    throw new ErroMatematico('Os semieixos devem ser positivos.');
  }

  if (hiperbole) {
    const c = Math.hypot(a, b);
    const excentricidade = c / a;

    return {
      resultado: {
        tipo: 'hiperbole',
        a,
        b,
        excentricidade,
        focos: [
          { x: -c, y: 0 },
          { x: c, y: 0 },
        ],
      },
      passos: [
        {
          descricao: 'A hipérbole tem um sinal de MENOS entre os termos.',
          tex: `\\frac{x^{2}}{${formatar(a * a)}} - \\frac{y^{2}}{${formatar(b * b)}} = 1`,
        },
        {
          descricao: 'Nela, a distância focal satisfaz c² = a² + b².',
          tex: `c = \\sqrt{${formatar(a * a)} + ${formatar(b * b)}} = ${formatar(c)}`,
          nota: 'Na elipse é uma subtração; aqui é soma — por isso os focos ficam mais afastados.',
        },
        {
          descricao: 'A excentricidade é sempre maior que 1.',
          tex: `e = \\frac{c}{a} = ${formatar(excentricidade)}`,
        },
        {
          descricao: 'As assíntotas guiam os ramos no infinito.',
          tex: `y = \\pm\\frac{${formatar(b)}}{${formatar(a)}}x`,
        },
      ],
    };
  }

  const maior = Math.max(a, b);
  const menor = Math.min(a, b);
  const c = Math.sqrt(maior * maior - menor * menor);
  const excentricidade = maior === 0 ? 0 : c / maior;
  const horizontal = a >= b;

  return {
    resultado: {
      tipo: Math.abs(a - b) < 1e-9 ? 'circunferencia' : 'elipse',
      a,
      b,
      excentricidade,
      focos: horizontal
        ? [
            { x: -c, y: 0 },
            { x: c, y: 0 },
          ]
        : [
            { x: 0, y: -c },
            { x: 0, y: c },
          ],
    },
    passos: [
      {
        descricao: 'A elipse soma os dois termos.',
        tex: `\\frac{x^{2}}{${formatar(a * a)}} + \\frac{y^{2}}{${formatar(b * b)}} = 1`,
      },
      {
        descricao: 'A distância focal sai de c² = (maior)² − (menor)².',
        tex: `c = \\sqrt{${formatar(maior * maior)} - ${formatar(menor * menor)}} = ${formatar(c)}`,
      },
      {
        descricao: 'A excentricidade mede o achatamento.',
        tex: `e = \\frac{c}{a} = ${formatar(excentricidade)}`,
        nota:
          Math.abs(a - b) < 1e-9
            ? 'Com os semieixos iguais, e = 0 e a elipse é uma circunferência.'
            : 'Quanto mais perto de 1, mais achatada; em 0, vira círculo.',
      },
      {
        descricao: 'A soma das distâncias aos dois focos é constante.',
        tex: `d_1 + d_2 = 2a = ${formatar(2 * maior)}`,
        nota: 'É a definição da elipse — o "barbante preso em dois pregos".',
      },
    ],
  };
}
