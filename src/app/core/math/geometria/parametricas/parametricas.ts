import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { formatar, formatarEmTexto } from '@core/math/algebra/polinomio/polinomio';

/**
 * Equações paramétricas.
 *
 * Em vez de amarrar y a x, descreve-se cada coordenada em função de um
 * terceiro parâmetro — quase sempre o tempo. A diferença não é cosmética: a
 * forma paramétrica carrega informação que a cartesiana perde, a saber, QUANDO
 * o móvel passa por cada ponto e em que sentido ele percorre a curva.
 *
 * É por isso que toda trajetória de voo, toda órbita e toda simulação de
 * mecânica são escritas assim. E é por isso que uma circunferência, que não é
 * função de x, se descreve sem nenhum esforço com um parâmetro.
 */

export type TipoParametrica = 'reta' | 'circunferencia' | 'elipse' | 'parabola' | 'cicloide';

export interface CurvaParametrica {
  readonly tipo: TipoParametrica;
  readonly x: (t: number) => number;
  readonly y: (t: number) => number;
  readonly xTex: string;
  readonly yTex: string;
  /** A equação cartesiana equivalente, quando ela existe de forma simples. */
  readonly cartesianaTex: string;
}

/** Reta por um ponto, com vetor diretor: a forma mais usada em cinemática. */
export function retaParametrica(
  x0: number,
  y0: number,
  vx: number,
  vy: number,
): CurvaParametrica {
  return {
    tipo: 'reta',
    x: (t) => x0 + vx * t,
    y: (t) => y0 + vy * t,
    xTex: `x = ${formatar(x0)} + ${formatar(vx)}t`,
    yTex: `y = ${formatar(y0)} + ${formatar(vy)}t`,
    cartesianaTex:
      vx === 0
        ? `x = ${formatar(x0)}`
        : `y = ${formatar(y0)} + \\frac{${formatar(vy)}}{${formatar(vx)}}\\left(x - ${formatar(x0)}\\right)`,
  };
}

/** Circunferência de raio r centrada em (cx, cy). */
export function circunferenciaParametrica(
  cx: number,
  cy: number,
  raio: number,
): CurvaParametrica {
  return {
    tipo: 'circunferencia',
    x: (t) => cx + raio * Math.cos(t),
    y: (t) => cy + raio * Math.sin(t),
    xTex: `x = ${formatar(cx)} + ${formatar(raio)}\\cos t`,
    yTex: `y = ${formatar(cy)} + ${formatar(raio)}\\operatorname{sen} t`,
    cartesianaTex: `\\left(x - ${formatar(cx)}\\right)^{2} + \\left(y - ${formatar(cy)}\\right)^{2} = ${formatar(raio * raio)}`,
  };
}

/** Elipse de semieixos a e b, centrada na origem. */
export function elipseParametrica(a: number, b: number): CurvaParametrica {
  return {
    tipo: 'elipse',
    x: (t) => a * Math.cos(t),
    y: (t) => b * Math.sin(t),
    xTex: `x = ${formatar(a)}\\cos t`,
    yTex: `y = ${formatar(b)}\\operatorname{sen} t`,
    cartesianaTex: `\\frac{x^{2}}{${formatar(a * a)}} + \\frac{y^{2}}{${formatar(b * b)}} = 1`,
  };
}

/** Lançamento balístico: a parábola escrita como o tempo a produz. */
export function lancamentoParametrico(
  v0: number,
  anguloGraus: number,
  gravidade = 9.81,
): CurvaParametrica {
  const radianos = (anguloGraus * Math.PI) / 180;
  const vx = v0 * Math.cos(radianos);
  const vy = v0 * Math.sin(radianos);

  return {
    tipo: 'parabola',
    x: (t) => vx * t,
    y: (t) => vy * t - 0.5 * gravidade * t * t,
    xTex: `x = ${formatar(Number(vx.toFixed(4)))}t`,
    yTex: `y = ${formatar(Number(vy.toFixed(4)))}t - ${formatar(gravidade / 2)}t^{2}`,
    cartesianaTex:
      `y = ${formatar(Number((vy / vx).toFixed(4)))}x - ` +
      `${formatar(Number((gravidade / (2 * vx * vx)).toFixed(6)))}x^{2}`,
  };
}

/** A ciclóide: o rastro de um ponto da borda de uma roda que rola. */
export function cicloideParametrica(raio: number): CurvaParametrica {
  return {
    tipo: 'cicloide',
    x: (t) => raio * (t - Math.sin(t)),
    y: (t) => raio * (1 - Math.cos(t)),
    xTex: `x = ${formatar(raio)}\\left(t - \\operatorname{sen} t\\right)`,
    yTex: `y = ${formatar(raio)}\\left(1 - \\cos t\\right)`,
    cartesianaTex: '\\text{não tem forma cartesiana elementar}',
  };
}

/** A posição no instante t — a leitura mais direta da forma paramétrica. */
export function posicaoNoInstanteComPassos(
  curva: CurvaParametrica,
  t: number,
): Resolucao<number> {
  const x = curva.x(t);
  const y = curva.y(t);

  const passos: Passo[] = [
    {
      descricao: 'As duas coordenadas dependem do mesmo parâmetro.',
      tex: `\\begin{cases} ${curva.xTex} \\\\ ${curva.yTex} \\end{cases}`,
      nota: 'Cada valor do parâmetro escolhe um ponto da curva, e só um.',
    },
    {
      descricao: `Substituímos t igual a ${formatarEmTexto(t)} nas duas.`,
      tex:
        `x = ${formatar(Number(x.toFixed(6)))} \\qquad y = ${formatar(Number(y.toFixed(6)))}`,
    },
    {
      descricao: 'O ponto correspondente.',
      tex: `\\left(${formatar(Number(x.toFixed(6)))},\\; ${formatar(Number(y.toFixed(6)))}\\right)`,
    },
  ];

  return { resultado: x, passos };
}

/**
 * A velocidade, que é a derivada de cada coordenada.
 *
 * É aqui que a forma paramétrica ganha da cartesiana: a velocidade sai direto,
 * com módulo e direção, sem precisar da regra da cadeia.
 */
export function velocidadeParametricaComPassos(
  curva: CurvaParametrica,
  t: number,
  h = 1e-6,
): Resolucao<number> {
  const vx = (curva.x(t + h) - curva.x(t - h)) / (2 * h);
  const vy = (curva.y(t + h) - curva.y(t - h)) / (2 * h);
  const resultado = Math.hypot(vx, vy);

  const passos: Passo[] = [
    {
      descricao: 'Cada componente da velocidade é a derivada da coordenada correspondente.',
      tex: '\\vec{v}(t) = \\left(\\frac{dx}{dt},\\; \\frac{dy}{dt}\\right)',
      nota: 'Não é preciso eliminar o parâmetro: a derivada é componente a componente.',
    },
    {
      descricao: `No instante ${formatarEmTexto(t)}.`,
      tex:
        `\\frac{dx}{dt} = ${formatar(Number(vx.toFixed(4)))} \\qquad ` +
        `\\frac{dy}{dt} = ${formatar(Number(vy.toFixed(4)))}`,
    },
    {
      descricao: 'A rapidez é o módulo desse vetor.',
      tex:
        `\\left|\\vec{v}\\right| = \\sqrt{${formatar(Number((vx * vx).toFixed(4)))} + ` +
        `${formatar(Number((vy * vy).toFixed(4)))}} = ${formatar(Number(resultado.toFixed(4)))}`,
    },
  ];

  return { resultado, passos };
}

/**
 * Eliminar o parâmetro para chegar à forma cartesiana.
 *
 * Dá para fazer, e às vezes é útil — mas o que se perde é o tempo: a equação
 * cartesiana descreve o CAMINHO, não o movimento.
 */
export function eliminarParametroComPassos(curva: CurvaParametrica): Resolucao<string> {
  const passos: Passo[] = [
    {
      descricao: 'Partimos das duas equações.',
      tex: `\\begin{cases} ${curva.xTex} \\\\ ${curva.yTex} \\end{cases}`,
    },
    {
      descricao:
        curva.tipo === 'circunferencia' || curva.tipo === 'elipse'
          ? 'Isolamos cosseno e seno, elevamos ao quadrado e usamos a identidade fundamental.'
          : 'Isolamos o parâmetro numa das equações e substituímos na outra.',
      tex:
        curva.tipo === 'circunferencia' || curva.tipo === 'elipse'
          ? '\\cos^{2} t + \\operatorname{sen}^{2} t = 1'
          : 't = \\frac{x - x_{0}}{v_{x}}',
    },
    {
      descricao: 'E sobra a equação cartesiana.',
      tex: curva.cartesianaTex,
      nota: 'Ela descreve o caminho, mas já não diz quando o móvel passa por cada ponto.',
    },
  ];

  return { resultado: curva.cartesianaTex, passos };
}

/** O alcance de um lançamento, lido da forma paramétrica. */
export function alcanceDoLancamentoComPassos(
  v0: number,
  anguloGraus: number,
  gravidade = 9.81,
): Resolucao<number> {
  const radianos = (anguloGraus * Math.PI) / 180;
  const tempoDeVoo = (2 * v0 * Math.sin(radianos)) / gravidade;
  const resultado = v0 * Math.cos(radianos) * tempoDeVoo;

  const passos: Passo[] = [
    {
      descricao: 'A altura volta a zero quando o parâmetro satisfaz a equação de y.',
      tex: `${formatar(Number((v0 * Math.sin(radianos)).toFixed(4)))}t - ${formatar(gravidade / 2)}t^{2} = 0`,
    },
    {
      descricao: 'Além de t igual a zero, há outra raiz: o instante do impacto.',
      tex:
        `t = \\frac{2v_{0}\\operatorname{sen}\\theta}{g} = ` +
        `${formatar(Number(tempoDeVoo.toFixed(4)))}\\ \\text{s}`,
    },
    {
      descricao: 'O alcance é a coordenada x nesse instante.',
      tex: `x = ${formatar(Number(resultado.toFixed(4)))}\\ \\text{m}`,
      nota:
        Math.abs(anguloGraus - 45) < 1e-9
          ? 'A 45 graus o alcance é máximo, e é só nesse ângulo.'
          : 'O alcance máximo acontece a 45 graus, para uma mesma velocidade inicial.',
    },
  ];

  return { resultado, passos };
}
