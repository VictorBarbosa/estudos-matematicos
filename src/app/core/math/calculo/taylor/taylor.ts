import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { formatar, formatarEmTexto } from '@core/math/algebra/polinomio/polinomio';
import { fatorial } from '@core/math/estatistica/contagem/contagem';

/**
 * Séries de Taylor e de Maclaurin.
 *
 * A ideia é a mais produtiva de todo o cálculo: trocar uma função difícil por
 * um polinômio que a imita perto de um ponto. É assim que uma calculadora
 * obtém o seno, que um simulador integra uma equação sem solução fechada e que
 * a engenharia lineariza um sistema para projetar um controlador.
 *
 * Duas coisas separam quem usa isso de quem só decorou a fórmula: saber que a
 * aproximação é LOCAL — longe do centro ela despenca — e saber estimar o erro
 * sem conhecer a resposta, que é o papel do resto de Lagrange.
 */

export type FuncaoDeSerie = 'exp' | 'sen' | 'cos' | 'ln1x' | 'geometrica';

/** Um coeficiente exato `num/den`, para que `1/120` não vire 0,008333. */
export interface CoeficienteExato {
  readonly num: number;
  readonly den: number;
}

export const NOME_DA_SERIE: Readonly<Record<FuncaoDeSerie, string>> = {
  exp: 'exponencial',
  sen: 'seno',
  cos: 'cosseno',
  ln1x: 'logaritmo de 1 mais x',
  geometrica: 'série geométrica',
};

export const FUNCAO_TEX: Readonly<Record<FuncaoDeSerie, string>> = {
  exp: 'e^{x}',
  sen: '\\operatorname{sen} x',
  cos: '\\cos x',
  ln1x: '\\ln(1 + x)',
  geometrica: '\\frac{1}{1 - x}',
};

/** O raio dentro do qual a série representa a função. Infinito para três delas. */
export function raioDeConvergencia(funcao: FuncaoDeSerie): number {
  return funcao === 'ln1x' || funcao === 'geometrica' ? 1 : Number.POSITIVE_INFINITY;
}

export function valorDaFuncaoDeSerie(funcao: FuncaoDeSerie, x: number): number {
  switch (funcao) {
    case 'exp':
      return Math.exp(x);
    case 'sen':
      return Math.sin(x);
    case 'cos':
      return Math.cos(x);
    case 'ln1x':
      return Math.log(1 + x);
    default:
      return 1 / (1 - x);
  }
}

/** O coeficiente exato de `xⁿ` na série de Maclaurin. */
export function coeficienteExatoDeMaclaurin(funcao: FuncaoDeSerie, n: number): CoeficienteExato {
  switch (funcao) {
    case 'exp':
      return { num: 1, den: fatorial(n) };
    case 'sen':
      return n % 2 === 0 ? { num: 0, den: 1 } : { num: (-1) ** ((n - 1) / 2), den: fatorial(n) };
    case 'cos':
      return n % 2 === 1 ? { num: 0, den: 1 } : { num: (-1) ** (n / 2), den: fatorial(n) };
    case 'ln1x':
      return n === 0 ? { num: 0, den: 1 } : { num: (-1) ** (n + 1), den: n };
    default:
      return { num: 1, den: 1 };
  }
}

export function coeficienteDeMaclaurin(funcao: FuncaoDeSerie, n: number): number {
  const { num, den } = coeficienteExatoDeMaclaurin(funcao, n);
  return num / den;
}

/** `\frac{x^{3}}{6}` — um termo escrito como se escreve à mão. */
export function termoDeMaclaurinTex(
  coeficiente: CoeficienteExato,
  n: number,
  primeiro: boolean,
): string {
  if (coeficiente.num === 0) {
    return '';
  }

  const sinal = coeficiente.num < 0 ? ' - ' : primeiro ? '' : ' + ';
  const magnitude = Math.abs(coeficiente.num);
  const potencia = n === 0 ? '' : n === 1 ? 'x' : `x^{${n}}`;

  if (coeficiente.den === 1) {
    const corpo = magnitude === 1 && n > 0 ? potencia : `${magnitude}${potencia}`;
    return `${sinal}${corpo}`;
  }

  const cima = magnitude === 1 ? (n === 0 ? '1' : potencia) : `${magnitude}${potencia}`;
  return `${sinal}\\frac{${cima}}{${coeficiente.den}}`;
}

/** O polinômio de Maclaurin até o grau pedido, em LaTeX. */
export function polinomioDeMaclaurinTex(funcao: FuncaoDeSerie, grau: number): string {
  let saida = '';

  for (let n = 0; n <= grau; n++) {
    const coeficiente = coeficienteExatoDeMaclaurin(funcao, n);
    saida += termoDeMaclaurinTex(coeficiente, n, saida === '');
  }

  return saida === '' ? '0' : saida;
}

/** O valor do polinômio de Maclaurin num ponto. */
export function avaliarMaclaurin(funcao: FuncaoDeSerie, grau: number, x: number): number {
  let soma = 0;
  for (let n = 0; n <= grau; n++) {
    soma += coeficienteDeMaclaurin(funcao, n) * x ** n;
  }
  return soma;
}

/**
 * A aproximação passo a passo: montar o polinômio, substituir, somar.
 *
 * O último passo compara com o valor verdadeiro de propósito — ver o erro é
 * metade do que o tópico ensina.
 */
export function maclaurinComPassos(
  funcao: FuncaoDeSerie,
  grau: number,
  x: number,
): Resolucao<number> {
  const resultado = avaliarMaclaurin(funcao, grau, x);
  const exato = valorDaFuncaoDeSerie(funcao, x);

  const passos: Passo[] = [
    {
      descricao: `Os coeficientes saem das derivadas em zero, divididas pelo fatorial da ordem.`,
      tex: `P_{${grau}}(x) = \\sum_{n=0}^{${grau}} \\frac{f^{(n)}(0)}{n!}x^{n}`,
    },
    {
      descricao: `Para ${NOME_DA_SERIE[funcao]}, o polinômio de grau ${grau} é este.`,
      tex: `P_{${grau}}(x) = ${polinomioDeMaclaurinTex(funcao, grau)}`,
    },
    {
      descricao: `Substituímos x = ${formatarEmTexto(x)}.`,
      tex: `P_{${grau}}\\left(${formatar(x)}\\right) = ${formatar(Number(resultado.toFixed(6)))}`,
    },
    {
      descricao: 'Comparando com o valor verdadeiro, fica à vista o que a aproximação custou.',
      tex:
        `${FUNCAO_TEX[funcao]}\\big|_{x = ${formatar(x)}} = ${formatar(Number(exato.toFixed(6)))} ` +
        `\\qquad \\text{erro} = ${formatar(Number(Math.abs(exato - resultado).toFixed(6)))}`,
      nota:
        Math.abs(x) <= 1
          ? 'Perto do centro, poucos termos já bastam.'
          : 'Longe do centro o erro cresce depressa, e é preciso mais termos.',
    },
  ];

  return { resultado, passos };
}

/** O coeficiente de um termo, com a derivada que o produz. */
export function coeficienteComPassos(funcao: FuncaoDeSerie, n: number): Resolucao<number> {
  const exato = coeficienteExatoDeMaclaurin(funcao, n);
  const resultado = exato.num / exato.den;

  const passos: Passo[] = [
    {
      descricao: 'Cada coeficiente é a derivada de ordem n em zero, dividida pelo fatorial.',
      tex: `a_{n} = \\frac{f^{(n)}(0)}{n!}`,
    },
    {
      descricao: `Para ${NOME_DA_SERIE[funcao]}, o padrão das derivadas em zero é conhecido.`,
      tex: `${FUNCAO_TEX[funcao]} = ${polinomioDeMaclaurinTex(funcao, Math.max(n, 3))} + \\cdots`,
    },
    {
      descricao: `O coeficiente de x elevado a ${n} é o que acompanha esse termo.`,
      tex: `a_{${n}} = ${fracaoTex(exato)} = ${formatar(Number(resultado.toFixed(6)))}`,
      nota:
        exato.num === 0
          ? 'Este termo não aparece na série: o coeficiente é zero, por simetria da função.'
          : undefined,
    },
  ];

  return { resultado, passos };
}

/**
 * O erro da aproximação, medido de verdade.
 *
 * Não é a cota de Lagrange: é a diferença real entre a função e o polinômio,
 * que é o que deixa visível quanto um termo a mais compra.
 */
export function erroDaAproximacaoComPassos(
  funcao: FuncaoDeSerie,
  grau: number,
  x: number,
): Resolucao<number> {
  const aproximado = avaliarMaclaurin(funcao, grau, x);
  const exato = valorDaFuncaoDeSerie(funcao, x);
  const resultado = Math.abs(exato - aproximado);

  const passos: Passo[] = [
    {
      descricao: 'O erro é a distância entre a função e o polinômio que a imita.',
      tex: `R_{${grau}}(x) = \\left|f(x) - P_{${grau}}(x)\\right|`,
    },
    {
      descricao: `O polinômio de grau ${grau} vale isto no ponto.`,
      tex: `P_{${grau}}\\left(${formatar(x)}\\right) = ${formatar(Number(aproximado.toFixed(6)))}`,
    },
    {
      descricao: 'E a função vale isto.',
      tex: `f\\left(${formatar(x)}\\right) = ${formatar(Number(exato.toFixed(6)))}`,
    },
    {
      descricao: 'A diferença, em módulo, é o erro cometido.',
      tex: `R_{${grau}} = ${formatar(Number(resultado.toFixed(6)))}`,
      nota: 'Cada termo a mais costuma derrubar o erro por um fator grande, perto do centro.',
    },
  ];

  return { resultado, passos };
}

/**
 * A cota de Lagrange, que estima o erro sem conhecer a resposta.
 *
 * É o que se usa na prática: a resposta exata não está disponível — se
 * estivesse, não haveria por que aproximar.
 */
export function cotaDeLagrangeComPassos(
  grau: number,
  x: number,
  cotaDaDerivada: number,
): Resolucao<number> {
  const resultado = (cotaDaDerivada * Math.abs(x) ** (grau + 1)) / fatorial(grau + 1);

  const passos: Passo[] = [
    {
      descricao:
        'O resto de Lagrange tem a forma do termo seguinte, com a derivada num ponto intermediário.',
      tex: `\\left|R_{${grau}}(x)\\right| \\leq \\frac{M\\left|x\\right|^{${grau + 1}}}{(${grau + 1})!}`,
      nota: 'M é uma cota para a derivada de ordem seguinte no intervalo.',
    },
    {
      descricao: `Com M igual a ${formatarEmTexto(cotaDaDerivada)} e x igual a ${formatarEmTexto(x)}.`,
      tex:
        `\\frac{${formatar(cotaDaDerivada)} \\cdot ${formatar(Math.abs(x))}^{${grau + 1}}}{${formatar(fatorial(grau + 1))}} = ` +
        `${formatar(Number(resultado.toFixed(6)))}`,
    },
    {
      descricao: 'O erro verdadeiro é, no máximo, esse valor.',
      tex: `\\left|R_{${grau}}\\right| \\leq ${formatar(Number(resultado.toFixed(6)))}`,
      nota: 'A cota é sempre generosa: o erro real costuma ser bem menor que ela.',
    },
  ];

  return { resultado, passos };
}

/**
 * Taylor em torno de um ponto diferente de zero.
 *
 * É o caso geral, e o que torna a técnica útil fora da vizinhança da origem:
 * a raiz quadrada perto de 4, a pressão perto da altitude de cruzeiro.
 */
export function taylorDaRaizComPassos(a: number, x: number, grau: number): Resolucao<number> {
  const h = x - a;
  const raiz = Math.sqrt(a);

  const termos = [raiz, h / (2 * raiz), -(h * h) / (8 * a * raiz)];
  const resultado = termos.slice(0, grau + 1).reduce((soma, termo) => soma + termo, 0);

  const passos: Passo[] = [
    {
      descricao: `Centramos em ${formatarEmTexto(a)}, onde a raiz é conhecida.`,
      tex: `f(x) = \\sqrt{x} \\qquad f(${formatar(a)}) = ${formatar(raiz)}`,
    },
    {
      descricao: 'As duas primeiras derivadas dão os coeficientes.',
      tex: `f'(x) = \\frac{1}{2\\sqrt{x}} \\qquad f''(x) = -\\frac{1}{4x^{3/2}}`,
    },
    {
      descricao: `O polinômio de Taylor de grau ${grau} em torno de ${formatarEmTexto(a)}.`,
      tex:
        `P_{${grau}}(x) = ${formatar(raiz)} + \\frac{x - ${formatar(a)}}{${formatar(2 * raiz)}}` +
        (grau >= 2 ? ` - \\frac{(x - ${formatar(a)})^{2}}{${formatar(8 * a * raiz)}}` : ''),
    },
    {
      descricao: `Substituindo x = ${formatarEmTexto(x)}, com afastamento ${formatarEmTexto(h)}.`,
      tex:
        `P_{${grau}}\\left(${formatar(x)}\\right) = ${formatar(Number(resultado.toFixed(6)))} ` +
        `\\qquad \\sqrt{${formatar(x)}} = ${formatar(Number(Math.sqrt(x).toFixed(6)))}`,
      nota: 'Quanto mais perto do centro, melhor a aproximação — é sempre local.',
    },
  ];

  return { resultado, passos };
}

/** As séries que o tópico ensina de cor, para a tela de exploração. */
export const SERIES_CONHECIDAS: readonly {
  readonly funcao: FuncaoDeSerie;
  readonly serieTex: string;
  readonly observacao: string;
}[] = [
  {
    funcao: 'exp',
    serieTex: 'e^{x} = \\sum_{n=0}^{\\infty} \\frac{x^{n}}{n!}',
    observacao: 'Vale para todo x: o fatorial cresce mais rápido que qualquer potência.',
  },
  {
    funcao: 'sen',
    serieTex: '\\operatorname{sen} x = \\sum_{k=0}^{\\infty} \\frac{(-1)^{k}x^{2k+1}}{(2k+1)!}',
    observacao: 'Só potências ímpares, porque o seno é uma função ímpar.',
  },
  {
    funcao: 'cos',
    serieTex: '\\cos x = \\sum_{k=0}^{\\infty} \\frac{(-1)^{k}x^{2k}}{(2k)!}',
    observacao: 'Só potências pares, porque o cosseno é par.',
  },
  {
    funcao: 'ln1x',
    serieTex: '\\ln(1 + x) = \\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}x^{n}}{n}',
    observacao: 'Raio 1: fora desse intervalo a série não representa a função.',
  },
  {
    funcao: 'geometrica',
    serieTex: '\\frac{1}{1 - x} = \\sum_{n=0}^{\\infty} x^{n}',
    observacao: 'A mais simples de todas, e a que dá origem a muitas outras.',
  },
];

function fracaoTex({ num, den }: CoeficienteExato): string {
  if (num === 0) {
    return '0';
  }
  if (den === 1) {
    return formatar(num);
  }
  const sinal = num < 0 ? '-' : '';
  return `${sinal}\\frac{${Math.abs(num)}}{${den}}`;
}
