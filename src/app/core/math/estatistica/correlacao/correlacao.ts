import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { formatar, formatarEmTexto } from '@core/math/algebra/polinomio/polinomio';

/**
 * Correlação e regressão.
 *
 * Duas perguntas distintas que vivem juntas e são constantemente confundidas.
 * A regressão responde "qual reta descreve melhor estes dados"; a correlação
 * responde "o quanto eles realmente seguem uma reta". Dá para ter uma reta
 * ajustada perfeitamente definida sobre uma nuvem sem nenhuma relação — a
 * reta sempre existe, a correlação é que diz se ela significa alguma coisa.
 *
 * E há o aviso que o tópico existe para dar: correlação não é causalidade.
 * Duas grandezas podem andar juntas porque uma causa a outra, porque uma
 * terceira causa as duas, ou por puro acaso amostral.
 */

export interface Par {
  readonly x: number;
  readonly y: number;
}

export function media(valores: readonly number[]): number {
  return valores.reduce((soma, valor) => soma + valor, 0) / valores.length;
}

/** Covariância amostral: o quanto os dois desviam juntos. */
export function covariancia(pares: readonly Par[]): number {
  const mx = media(pares.map((par) => par.x));
  const my = media(pares.map((par) => par.y));

  return pares.reduce((soma, par) => soma + (par.x - mx) * (par.y - my), 0) / (pares.length - 1);
}

export function desvioAmostral(valores: readonly number[]): number {
  const m = media(valores);
  const soma = valores.reduce((total, valor) => total + (valor - m) ** 2, 0);
  return Math.sqrt(soma / (valores.length - 1));
}

/**
 * O coeficiente de Pearson: a covariância normalizada.
 *
 * Fica sempre entre −1 e 1, e é adimensional — trocar metros por centímetros
 * não o altera, o que é exatamente o que se quer de uma medida de forma.
 */
export function pearson(pares: readonly Par[]): number {
  const sx = desvioAmostral(pares.map((par) => par.x));
  const sy = desvioAmostral(pares.map((par) => par.y));

  return sx === 0 || sy === 0 ? 0 : covariancia(pares) / (sx * sy);
}

/**
 * A força de uma correlação, como chave de dicionário.
 *
 * O motor classifica; quem desenha escolhe a língua.
 * {@link forcaDaCorrelacao} é a mesma classificação dita em português.
 */
export function chaveDaForca(r: number): string {
  const modulo = Math.abs(r);
  const sentido = r > 0 ? 'Positiva' : 'Negativa';

  if (modulo < 0.2) {
    return 'correlacao.desprezivel';
  }
  const intensidade =
    modulo >= 0.9 ? 'muitoForte' : modulo >= 0.7 ? 'forte' : modulo >= 0.4 ? 'moderada' : 'fraca';

  return `correlacao.${intensidade}${sentido}`;
}

/** As mesmas classificações em português, para o gerador de exercícios. */
const FORCA_EM_PORTUGUES: Readonly<Record<string, string>> = {
  'correlacao.muitoFortePositiva': 'muito forte e positiva',
  'correlacao.muitoForteNegativa': 'muito forte e negativa',
  'correlacao.fortePositiva': 'forte e positiva',
  'correlacao.forteNegativa': 'forte e negativa',
  'correlacao.moderadaPositiva': 'moderada e positiva',
  'correlacao.moderadaNegativa': 'moderada e negativa',
  'correlacao.fracaPositiva': 'fraca e positiva',
  'correlacao.fracaNegativa': 'fraca e negativa',
  'correlacao.desprezivel': 'desprezível',
};

/** Como se lê a força de uma correlação, em palavras. */
export function forcaDaCorrelacao(r: number): string {
  return FORCA_EM_PORTUGUES[chaveDaForca(r)]!;
}

/** O coeficiente de Pearson, passo a passo. */
export function pearsonComPassos(pares: readonly Par[]): Resolucao<number> {
  const mx = media(pares.map((par) => par.x));
  const my = media(pares.map((par) => par.y));
  const cov = covariancia(pares);
  const sx = desvioAmostral(pares.map((par) => par.x));
  const sy = desvioAmostral(pares.map((par) => par.y));
  const resultado = pearson(pares);

  const passos: Passo[] = [
    {
      descricao: 'Começamos pelas duas médias.',
      tex:
        `\\bar{x} = ${formatar(Number(mx.toFixed(4)))} \\qquad ` +
        `\\bar{y} = ${formatar(Number(my.toFixed(4)))}`,
    },
    {
      descricao: 'A covariância soma os produtos dos desvios.',
      tex: `\\text{cov} = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{n - 1} = ${formatar(Number(cov.toFixed(4)))}`,
      nota: 'Ela já diz o SENTIDO da relação, mas o valor depende das unidades.',
    },
    {
      descricao: 'Dividindo pelos dois desvios padrão, o resultado perde a unidade.',
      tex:
        `r = \\frac{${formatar(Number(cov.toFixed(4)))}}{${formatar(Number(sx.toFixed(4)))} \\cdot ` +
        `${formatar(Number(sy.toFixed(4)))}} = ${formatar(Number(resultado.toFixed(4)))}`,
    },
    {
      descricao: 'E o valor se lê numa escala fixa, de menos um a um.',
      tex: `r = ${formatar(Number(resultado.toFixed(4)))}`,
      nota: `A correlação é ${forcaDaCorrelacao(resultado)}.`,
    },
  ];

  return { resultado, passos };
}

/**
 * A relação entre o coeficiente de correlação e o de determinação.
 *
 * `r²` é a fração da variação de y que a reta explica — e é por isso que uma
 * correlação de 0,7, que parece alta, explica menos da metade dos dados.
 */
export function determinacaoComPassos(r: number): Resolucao<number> {
  const resultado = r * r;

  const passos: Passo[] = [
    {
      descricao: 'O coeficiente de determinação é o quadrado do de correlação.',
      tex: 'R^{2} = r^{2}',
    },
    {
      descricao: 'Elevando ao quadrado.',
      tex: `R^{2} = ${formatar(r)}^{2} = ${formatar(Number(resultado.toFixed(4)))}`,
    },
    {
      descricao: 'Ele é a fração da variação de y que a reta consegue explicar.',
      tex: `${formatar(Number((resultado * 100).toFixed(2)))}\\%`,
      nota:
        Math.abs(r) >= 0.7 && resultado < 0.5
          ? 'Repare: uma correlação que parece alta explica menos da metade da variação.'
          : 'O que sobra é a variação que o modelo linear não captura.',
    },
  ];

  return { resultado, passos };
}

/**
 * A previsão pela reta ajustada — e o aviso sobre extrapolar.
 *
 * Dentro da faixa observada, a reta interpola; fora dela, ela apenas supõe que
 * o padrão continua, o que nada garante.
 */
export function preverComPassos(
  inclinacao: number,
  intercepto: number,
  x: number,
  faixa: { readonly min: number; readonly max: number },
): Resolucao<number> {
  const resultado = inclinacao * x + intercepto;
  const extrapola = x < faixa.min || x > faixa.max;

  const passos: Passo[] = [
    {
      descricao: 'A reta ajustada dá a previsão.',
      tex: `\\hat{y} = ${formatar(inclinacao)}x + ${formatar(intercepto)}`,
    },
    {
      descricao: `Substituindo x igual a ${formatarEmTexto(x)}.`,
      tex: `\\hat{y} = ${formatar(Number(resultado.toFixed(4)))}`,
    },
    {
      descricao: extrapola
        ? 'Mas esse x está fora da faixa observada.'
        : 'E esse x está dentro da faixa observada.',
      tex:
        `${formatar(faixa.min)} \\leq x \\leq ${formatar(faixa.max)} ` +
        `${extrapola ? '\\;\\text{(violado)}' : '\\;\\checkmark'}`,
      nota: extrapola
        ? 'Extrapolar supõe que o padrão continua lá fora, e nada no ajuste garante isso.'
        : 'Dentro da faixa, a reta interpola — que é o uso para o qual ela foi ajustada.',
    },
  ];

  return { resultado, passos };
}

/** O resíduo de um ponto: o que a reta errou nele. */
export function residuoComPassos(
  inclinacao: number,
  intercepto: number,
  par: Par,
): Resolucao<number> {
  const previsto = inclinacao * par.x + intercepto;
  const resultado = par.y - previsto;

  const passos: Passo[] = [
    {
      descricao: 'A reta prevê um valor para esse x.',
      tex:
        `\\hat{y} = ${formatar(inclinacao)} \\cdot ${formatar(par.x)} + ${formatar(intercepto)} = ` +
        `${formatar(Number(previsto.toFixed(4)))}`,
    },
    {
      descricao: 'O observado foi outro.',
      tex: `y = ${formatar(par.y)}`,
    },
    {
      descricao: 'O resíduo é a diferença, com sinal.',
      tex: `e = y - \\hat{y} = ${formatar(Number(resultado.toFixed(4)))}`,
      nota:
        resultado > 0
          ? 'Resíduo positivo: o ponto observado está ACIMA da reta.'
          : resultado < 0
            ? 'Resíduo negativo: o ponto está abaixo da reta.'
            : 'Resíduo nulo: o ponto cai exatamente sobre a reta.',
    },
  ];

  return { resultado, passos };
}
