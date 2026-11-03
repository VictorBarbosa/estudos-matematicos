import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { formatar, formatarEmTexto } from '@core/math/algebra/polinomio/polinomio';

/**
 * Equações diferenciais ordinárias.
 *
 * Uma EDO não descreve uma grandeza: descreve a REGRA pela qual ela muda. É
 * assim que a física é escrita de verdade — a segunda lei de Newton é uma EDO,
 * o decaimento radioativo é uma EDO, a carga de um capacitor é uma EDO. A
 * solução não é um número, é uma família de funções, e a condição inicial é o
 * que escolhe uma delas.
 *
 * Três casos cobrem a maior parte do que se usa: separáveis, lineares de
 * primeira ordem com fator integrante, e lineares de segunda ordem com
 * coeficientes constantes — que é onde mora todo sistema massa-mola e todo
 * circuito RLC.
 */

/** Como as raízes da equação característica se apresentam. */
export type RegimeDaSegundaOrdem = 'superamortecido' | 'criticamente-amortecido' | 'subamortecido';

export interface RaizesCaracteristicas {
  readonly regime: RegimeDaSegundaOrdem;
  /** Parte real das raízes; nas reais distintas, é a média delas. */
  readonly real: number;
  /** As duas raízes reais, quando elas existem. */
  readonly r1: number;
  readonly r2: number;
  /** A parte imaginária, no caso oscilatório. */
  readonly imaginaria: number;
}

/**
 * Crescimento ou decaimento exponencial: `y' = ky`.
 *
 * É a EDO mais importante que existe, e a razão é simples: ela descreve toda
 * grandeza cuja taxa de variação é proporcional ao que já há — juros, meia
 * vida, população sem limite, corrente num indutor.
 */
export function separavelExponencialComPassos(
  k: number,
  y0: number,
  t: number,
): Resolucao<number> {
  const resultado = y0 * Math.exp(k * t);

  const passos: Passo[] = [
    {
      descricao: 'Separamos as variáveis: tudo que tem y de um lado, tudo que tem t do outro.',
      tex: `\\frac{dy}{y} = ${formatar(k)}\\,dt`,
      nota: 'Separar só é possível quando a equação permite — e aqui permite.',
    },
    {
      descricao: 'Integramos os dois lados.',
      tex: `\\ln|y| = ${formatar(k)}t + C`,
    },
    {
      descricao: 'Exponenciando, a constante vira um fator multiplicativo.',
      tex: `y(t) = Ae^{${formatar(k)}t}`,
      nota: 'Esta é a solução GERAL: uma família inteira de funções.',
    },
    {
      descricao: `A condição inicial escolhe uma delas: y(0) igual a ${formatarEmTexto(y0)}.`,
      tex: `A = ${formatar(y0)} \\quad\\Longrightarrow\\quad y(t) = ${formatar(y0)}e^{${formatar(k)}t}`,
    },
    {
      descricao: `Avaliando em t igual a ${formatarEmTexto(t)}.`,
      tex: `y(${formatar(t)}) = ${formatar(Number(resultado.toFixed(6)))}`,
      nota:
        k > 0
          ? 'Com k positivo a grandeza cresce sem limite.'
          : 'Com k negativo ela decai, e nunca chega exatamente a zero.',
    },
  ];

  return { resultado, passos };
}

/** O tempo de meia-vida de um decaimento exponencial. */
export function meiaVidaComPassos(k: number): Resolucao<number> {
  const resultado = Math.log(2) / Math.abs(k);

  const passos: Passo[] = [
    {
      descricao: 'Procuramos o tempo em que resta metade.',
      tex: `\\frac{1}{2}y_{0} = y_{0}e^{${formatar(k)}t}`,
    },
    {
      descricao: 'A quantidade inicial se cancela — a meia-vida não depende dela.',
      tex: `\\frac{1}{2} = e^{${formatar(k)}t}`,
      nota: 'É por isso que meia-vida é propriedade do material, e não da amostra.',
    },
    {
      descricao: 'Aplicando o logaritmo e isolando.',
      tex: `t = \\frac{\\ln 2}{${formatar(Math.abs(k))}} = ${formatar(Number(resultado.toFixed(6)))}`,
    },
  ];

  return { resultado, passos };
}

/**
 * Linear de primeira ordem com coeficientes constantes: `y' + py = q`.
 *
 * O fator integrante transforma o lado esquerdo na derivada de um produto, e
 * daí a equação se resolve integrando. É a EDO de um circuito RL, de um corpo
 * com atrito viscoso e da lei de resfriamento de Newton.
 */
export function linearPrimeiraOrdemComPassos(
  p: number,
  q: number,
  y0: number,
  t: number,
): Resolucao<number> {
  const equilibrio = q / p;
  const resultado = equilibrio + (y0 - equilibrio) * Math.exp(-p * t);

  const passos: Passo[] = [
    {
      descricao: 'A equação está na forma padrão.',
      tex: `y' + ${formatar(p)}y = ${formatar(q)}`,
    },
    {
      descricao: 'O fator integrante é a exponencial da integral do coeficiente.',
      tex: `\\mu(t) = e^{\\int ${formatar(p)}\\,dt} = e^{${formatar(p)}t}`,
      nota: 'Multiplicar por ele transforma o lado esquerdo na derivada de um produto.',
    },
    {
      descricao: 'E aí a equação se integra diretamente.',
      tex: `\\left(ye^{${formatar(p)}t}\\right)' = ${formatar(q)}e^{${formatar(p)}t}`,
    },
    {
      descricao: 'Integrando e isolando y.',
      tex: `y(t) = ${formatar(Number(equilibrio.toFixed(6)))} + Ce^{-${formatar(p)}t}`,
      nota: 'A primeira parcela é o regime permanente; a segunda é o transiente, que some.',
    },
    {
      descricao: `Com y(0) igual a ${formatarEmTexto(y0)}, avaliamos em t igual a ${formatarEmTexto(t)}.`,
      tex: `y(${formatar(t)}) = ${formatar(Number(resultado.toFixed(6)))}`,
      nota: `Para t grande, a solução tende a ${formatarEmTexto(Number(equilibrio.toFixed(4)))}.`,
    },
  ];

  return { resultado, passos };
}

/** As raízes da equação característica de `y'' + by' + cy = 0`. */
export function raizesCaracteristicas(b: number, c: number): RaizesCaracteristicas {
  const delta = b * b - 4 * c;

  if (delta > 0) {
    const raiz = Math.sqrt(delta);
    return {
      regime: 'superamortecido',
      real: -b / 2,
      r1: (-b + raiz) / 2,
      r2: (-b - raiz) / 2,
      imaginaria: 0,
    };
  }

  if (delta === 0) {
    return {
      regime: 'criticamente-amortecido',
      real: -b / 2,
      r1: -b / 2,
      r2: -b / 2,
      imaginaria: 0,
    };
  }

  return {
    regime: 'subamortecido',
    real: -b / 2,
    r1: Number.NaN,
    r2: Number.NaN,
    imaginaria: Math.sqrt(-delta) / 2,
  };
}

/**
 * Linear homogênea de segunda ordem com coeficientes constantes.
 *
 * Toda a física de oscilação está aqui, e o discriminante decide o regime: com
 * duas raízes reais o sistema volta ao repouso sem oscilar, com raízes
 * complexas ele oscila amortecido, e no caso limite ele volta o mais rápido
 * possível sem passar do ponto — que é como se projeta uma suspensão.
 */
export function segundaOrdemComPassos(
  b: number,
  c: number,
  y0: number,
  v0: number,
  t: number,
): Resolucao<number> {
  const raizes = raizesCaracteristicas(b, c);
  const resultado = avaliarSegundaOrdem(raizes, y0, v0, t);

  const passos: Passo[] = [
    {
      descricao: 'Tentamos uma solução exponencial e chegamos à equação característica.',
      tex: `r^{2} + ${formatar(b)}r + ${formatar(c)} = 0`,
      nota: 'Substituir y igual a e elevado a rt transforma a EDO numa equação do segundo grau.',
    },
    {
      descricao: `O discriminante vale ${formatarEmTexto(b * b - 4 * c)}, e é ele que decide o regime.`,
      tex: `\\Delta = ${formatar(b)}^{2} - 4\\cdot${formatar(c)} = ${formatar(b * b - 4 * c)}`,
    },
    descricaoDoRegime(raizes),
    {
      descricao: `Com y(0) igual a ${formatarEmTexto(y0)} e y'(0) igual a ${formatarEmTexto(v0)}, avaliamos em t igual a ${formatarEmTexto(t)}.`,
      tex: `y(${formatar(t)}) = ${formatar(Number(resultado.toFixed(6)))}`,
      nota: 'Duas condições iniciais, porque a solução geral tem duas constantes.',
    },
  ];

  return { resultado, passos };
}

/** A solução de segunda ordem avaliada num instante, nos três regimes. */
export function avaliarSegundaOrdem(
  raizes: RaizesCaracteristicas,
  y0: number,
  v0: number,
  t: number,
): number {
  if (raizes.regime === 'superamortecido') {
    const c1 = (v0 - raizes.r2 * y0) / (raizes.r1 - raizes.r2);
    const c2 = y0 - c1;
    return c1 * Math.exp(raizes.r1 * t) + c2 * Math.exp(raizes.r2 * t);
  }

  if (raizes.regime === 'criticamente-amortecido') {
    const c1 = y0;
    const c2 = v0 - raizes.real * y0;
    return (c1 + c2 * t) * Math.exp(raizes.real * t);
  }

  const c1 = y0;
  const c2 = (v0 - raizes.real * y0) / raizes.imaginaria;
  return (
    Math.exp(raizes.real * t) *
    (c1 * Math.cos(raizes.imaginaria * t) + c2 * Math.sin(raizes.imaginaria * t))
  );
}

/** O período da oscilação amortecida, quando ela existe. */
export function periodoAmortecidoComPassos(b: number, c: number): Resolucao<number> {
  const raizes = raizesCaracteristicas(b, c);
  const resultado =
    raizes.regime === 'subamortecido'
      ? (2 * Math.PI) / raizes.imaginaria
      : Number.POSITIVE_INFINITY;

  const passos: Passo[] = [
    {
      descricao: 'Só há oscilação quando o discriminante é negativo.',
      tex: `\\Delta = ${formatar(b * b - 4 * c)}`,
    },
    {
      descricao:
        raizes.regime === 'subamortecido'
          ? 'A parte imaginária das raízes é a frequência angular amortecida.'
          : 'Sem parte imaginária não há oscilação, e não há período a falar.',
      tex:
        raizes.regime === 'subamortecido'
          ? `\\omega_{d} = \\frac{\\sqrt{${formatar(4 * c - b * b)}}}{2} = ${formatar(Number(raizes.imaginaria.toFixed(6)))}`
          : '\\text{sem oscilação}',
    },
    {
      descricao: 'E o período é uma volta inteira dividida por ela.',
      tex:
        raizes.regime === 'subamortecido'
          ? `T = \\frac{2\\pi}{\\omega_{d}} = ${formatar(Number(resultado.toFixed(6)))}`
          : 'T \\to \\infty',
      nota: 'O amortecimento alonga o período em relação ao sistema sem atrito.',
    },
  ];

  return { resultado, passos };
}

/**
 * O método de Euler: o primeiro passo de qualquer solução numérica.
 *
 * A ideia é a mais simples possível — seguir a tangente por um passo e
 * recomeçar. O erro acumula proporcionalmente ao passo, e é por isso que ele
 * serve para entender, não para produzir.
 */
export function eulerComPassos(
  k: number,
  y0: number,
  passo: number,
  quantos: number,
): Resolucao<number> {
  let y = y0;
  const trilha: number[] = [y];

  for (let i = 0; i < quantos; i++) {
    y += passo * k * y;
    trilha.push(y);
  }

  const exato = y0 * Math.exp(k * passo * quantos);

  const passos: Passo[] = [
    {
      descricao: 'Em cada passo, seguimos a tangente e recomeçamos.',
      tex: `y_{n+1} = y_{n} + h\\,f(t_{n},\\, y_{n})`,
      nota: 'É a definição de derivada lida ao contrário, com h finito em vez de infinitesimal.',
    },
    {
      descricao: `Com h igual a ${formatarEmTexto(passo)} e f igual a ${formatarEmTexto(k)}y.`,
      tex: `y_{n+1} = y_{n}\\left(1 + ${formatar(passo * k)}\\right)`,
    },
    {
      descricao: `Depois de ${formatarEmTexto(quantos)} passos.`,
      tex: `y \\approx ${formatar(Number(y.toFixed(6)))}`,
    },
    {
      descricao: 'Comparando com a solução exata.',
      tex:
        `y_{exato} = ${formatar(Number(exato.toFixed(6)))} \\qquad ` +
        `\\text{erro} = ${formatar(Number(Math.abs(exato - y).toFixed(6)))}`,
      nota: 'Metade do passo costuma dar metade do erro: Euler é de primeira ordem.',
    },
  ];

  return { resultado: y, passos };
}

/** Runge-Kutta de quarta ordem, para `y' = ky`. */
export function rungeKutta4(k: number, y0: number, passo: number, quantos: number): number {
  let y = y0;

  for (let i = 0; i < quantos; i++) {
    const k1 = k * y;
    const k2 = k * (y + (passo / 2) * k1);
    const k3 = k * (y + (passo / 2) * k2);
    const k4 = k * (y + passo * k3);
    y += (passo / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
  }

  return y;
}

/** A comparação entre Euler e Runge-Kutta, que é o ponto do tópico numérico. */
export function comparacaoNumericaComPassos(
  k: number,
  y0: number,
  passo: number,
  quantos: number,
): Resolucao<number> {
  let euler = y0;
  for (let i = 0; i < quantos; i++) {
    euler += passo * k * euler;
  }

  const rk = rungeKutta4(k, y0, passo, quantos);
  const exato = y0 * Math.exp(k * passo * quantos);
  const resultado = Math.abs(exato - rk);

  const passos: Passo[] = [
    {
      descricao: 'Euler usa uma inclinação por passo.',
      tex: `y_{Euler} \\approx ${formatar(Number(euler.toFixed(6)))} \\qquad \\text{erro} = ${formatar(Number(Math.abs(exato - euler).toFixed(6)))}`,
    },
    {
      descricao: 'Runge-Kutta usa quatro, e faz uma média ponderada delas.',
      tex: 'y_{n+1} = y_{n} + \\frac{h}{6}\\left(k_{1} + 2k_{2} + 2k_{3} + k_{4}\\right)',
      nota: 'Avaliar a inclinação no meio do passo corrige quase toda a curvatura.',
    },
    {
      descricao: 'O resultado é de outra ordem de precisão.',
      tex: `y_{RK4} \\approx ${formatar(Number(rk.toFixed(9)))} \\qquad y_{exato} = ${formatar(Number(exato.toFixed(9)))}`,
    },
    {
      descricao: 'O erro do Runge-Kutta.',
      tex: `\\text{erro} = ${formatar(Number(resultado.toExponential(4)))}`,
      nota: 'Euler é de primeira ordem; RK4 é de quarta: metade do passo divide o erro por 16.',
    },
  ];

  return { resultado, passos };
}

function descricaoDoRegime(raizes: RaizesCaracteristicas): Passo {
  if (raizes.regime === 'superamortecido') {
    return {
      descricao: 'Duas raízes reais distintas: o sistema volta ao repouso sem oscilar.',
      tex:
        `y(t) = C_{1}e^{${formatar(Number(raizes.r1.toFixed(4)))}t} + ` +
        `C_{2}e^{${formatar(Number(raizes.r2.toFixed(4)))}t}`,
      nota: 'É o regime superamortecido: lento, e sem passar do ponto de equilíbrio.',
    };
  }

  if (raizes.regime === 'criticamente-amortecido') {
    return {
      descricao: 'Raiz dupla: o caso limite, com um fator t na segunda solução.',
      tex: `y(t) = \\left(C_{1} + C_{2}t\\right)e^{${formatar(Number(raizes.real.toFixed(4)))}t}`,
      nota: 'É como se projeta uma suspensão: volta o mais rápido possível sem oscilar.',
    };
  }

  return {
    descricao: 'Raízes complexas: o sistema oscila enquanto a amplitude decai.',
    tex:
      `y(t) = e^{${formatar(Number(raizes.real.toFixed(4)))}t}\\left(C_{1}\\cos ${formatar(Number(raizes.imaginaria.toFixed(4)))}t + ` +
      `C_{2}\\operatorname{sen} ${formatar(Number(raizes.imaginaria.toFixed(4)))}t\\right)`,
    nota: 'A parte real controla o decaimento; a imaginária, a frequência.',
  };
}
