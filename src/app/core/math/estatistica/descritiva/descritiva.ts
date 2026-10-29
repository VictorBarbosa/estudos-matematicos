import { formatar } from '@core/math/algebra/polinomio/polinomio';
import { ErroMatematico, Resolucao } from '@core/math/tipos/tipos';

/**
 * Estatística descritiva e incerteza de medidas.
 *
 * Em engenharia, nenhuma medida é um número só: é um número com uma incerteza.
 * Este módulo cobre o mínimo honesto — média, dispersão, ajuste de reta e como
 * o erro se propaga por uma conta.
 */

export interface ResumoAmostra {
  readonly media: number;
  readonly mediana: number;
  readonly desvioPadrao: number;
  readonly amplitude: number;
  /** Desvio padrão da média: a incerteza do valor médio. */
  readonly incertezaDaMedia: number;
}

export function mediaComPassos(valores: readonly number[]): Resolucao<number> {
  if (valores.length === 0) {
    throw new ErroMatematico('Não há média de uma amostra vazia.');
  }

  const soma = valores.reduce((total, valor) => total + valor, 0);
  const resultado = soma / valores.length;

  return {
    resultado,
    passos: [
      {
        descricao: 'Somamos todos os valores.',
        tex: `\\sum x_i = ${formatar(Number(soma.toFixed(6)))}`,
      },
      {
        descricao: 'Dividimos pela quantidade de medidas.',
        tex: `\\bar{x} = \\frac{${formatar(Number(soma.toFixed(6)))}}{${valores.length}} = ${formatar(Number(resultado.toFixed(6)))}`,
        nota: 'A média é o ponto de equilíbrio da amostra.',
      },
    ],
  };
}

/**
 * Desvio padrão amostral, com a divisão por n − 1.
 *
 * O n − 1 não é capricho: a média já foi estimada da própria amostra, e isso
 * consome um grau de liberdade. Dividir por n subestimaria a dispersão.
 */
export function desvioPadraoComPassos(valores: readonly number[]): Resolucao<number> {
  if (valores.length < 2) {
    throw new ErroMatematico('O desvio padrão amostral exige ao menos duas medidas.');
  }

  const media = mediaComPassos(valores).resultado;
  const quadrados = valores.reduce((total, valor) => total + (valor - media) ** 2, 0);
  const variancia = quadrados / (valores.length - 1);
  const resultado = Math.sqrt(variancia);

  return {
    resultado,
    passos: [
      {
        descricao: 'Medimos o afastamento de cada valor em relação à média.',
        tex: `\\bar{x} = ${formatar(Number(media.toFixed(6)))}`,
      },
      {
        descricao: 'Elevamos ao quadrado para que desvios opostos não se cancelem.',
        tex: `\\sum (x_i - \\bar{x})^{2} = ${formatar(Number(quadrados.toFixed(6)))}`,
        nota: 'Somar os desvios sem elevar daria exatamente zero, sempre.',
      },
      {
        descricao: 'Dividimos por n − 1, não por n: a média já saiu desta mesma amostra.',
        tex: `s^{2} = \\frac{${formatar(Number(quadrados.toFixed(6)))}}{${valores.length - 1}} = ${formatar(Number(variancia.toFixed(6)))}`,
      },
      {
        descricao: 'A raiz devolve a dispersão na unidade original.',
        tex: `s = ${formatar(Number(resultado.toFixed(6)))}`,
      },
    ],
  };
}

export function resumirAmostra(valores: readonly number[]): ResumoAmostra {
  if (valores.length === 0) {
    throw new ErroMatematico('Não há resumo de uma amostra vazia.');
  }

  const ordenados = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(ordenados.length / 2);

  const mediana =
    ordenados.length % 2 === 0
      ? (ordenados[meio - 1]! + ordenados[meio]!) / 2
      : ordenados[meio]!;

  const media = mediaComPassos(valores).resultado;
  const desvioPadrao = valores.length < 2 ? 0 : desvioPadraoComPassos(valores).resultado;

  return {
    media,
    mediana,
    desvioPadrao,
    amplitude: ordenados.at(-1)! - ordenados[0]!,
    incertezaDaMedia: desvioPadrao / Math.sqrt(valores.length),
  };
}

export interface RetaAjustada {
  readonly inclinacao: number;
  readonly intercepto: number;
  /** Coeficiente de determinação: quanto da variação a reta explica. */
  readonly r2: number;
}

/**
 * Ajuste de reta por mínimos quadrados.
 *
 * É a ferramenta com que se extrai uma constante física de uma série de
 * medidas: a inclinação da reta é a grandeza procurada, e o R² diz se o
 * modelo linear era adequado.
 */
export function ajustarRetaComPassos(
  pontos: readonly { readonly x: number; readonly y: number }[],
): Resolucao<RetaAjustada> {
  if (pontos.length < 2) {
    throw new ErroMatematico('O ajuste exige ao menos dois pontos.');
  }

  const n = pontos.length;
  const somaX = pontos.reduce((total, ponto) => total + ponto.x, 0);
  const somaY = pontos.reduce((total, ponto) => total + ponto.y, 0);
  const somaXY = pontos.reduce((total, ponto) => total + ponto.x * ponto.y, 0);
  const somaX2 = pontos.reduce((total, ponto) => total + ponto.x * ponto.x, 0);

  const denominador = n * somaX2 - somaX * somaX;

  if (Math.abs(denominador) < 1e-12) {
    throw new ErroMatematico('Todos os pontos têm o mesmo x: não há reta ajustável.');
  }

  const inclinacao = (n * somaXY - somaX * somaY) / denominador;
  const intercepto = (somaY - inclinacao * somaX) / n;

  const mediaY = somaY / n;
  const totalQuadrados = pontos.reduce((total, ponto) => total + (ponto.y - mediaY) ** 2, 0);
  const residuos = pontos.reduce(
    (total, ponto) => total + (ponto.y - (inclinacao * ponto.x + intercepto)) ** 2,
    0,
  );

  const r2 = totalQuadrados === 0 ? 1 : 1 - residuos / totalQuadrados;

  return {
    resultado: { inclinacao, intercepto, r2 },
    passos: [
      {
        descricao: 'Buscamos a reta que minimiza a soma dos quadrados dos resíduos.',
        tex: '\\min \\sum (y_i - ax_i - b)^{2}',
        nota: 'Quadrados, de novo, para que erros para cima e para baixo não se cancelem.',
      },
      {
        descricao: 'Derivando em relação a a e b e igualando a zero, chega-se às somas.',
        tex: `a = \\frac{n\\sum xy - \\sum x \\sum y}{n\\sum x^{2} - (\\sum x)^{2}}`,
      },
      {
        descricao: 'Substituindo as somas da amostra.',
        tex: `a = ${formatar(Number(inclinacao.toFixed(6)))} \\qquad b = ${formatar(Number(intercepto.toFixed(6)))}`,
      },
      {
        descricao: 'O R² indica a fração da variação explicada pela reta.',
        tex: `R^{2} = ${formatar(Number(r2.toFixed(6)))}`,
        nota:
          r2 > 0.99
            ? 'Acima de 0,99: o comportamento é essencialmente linear.'
            : 'Longe de 1: a reta pode não ser o modelo adequado.',
      },
    ],
  };
}

/**
 * Propagação de incerteza numa soma ou subtração.
 *
 * As incertezas absolutas se somam em quadratura — erros independentes não se
 * acumulam linearmente, porque é improvável que todos errem para o mesmo lado.
 */
export function propagarSomaComPassos(
  incertezas: readonly number[],
): Resolucao<number> {
  if (incertezas.some((valor) => valor < 0)) {
    throw new ErroMatematico('Incertezas não são negativas.');
  }

  const soma = incertezas.reduce((total, valor) => total + valor * valor, 0);
  const resultado = Math.sqrt(soma);

  return {
    resultado,
    passos: [
      {
        descricao: 'Numa soma ou subtração, as incertezas ABSOLUTAS se combinam.',
        tex: '\\sigma = \\sqrt{\\sigma_1^{2} + \\sigma_2^{2} + \\dots}',
      },
      {
        descricao: 'Somamos os quadrados.',
        tex: incertezas.map((valor) => `${formatar(valor)}^{2}`).join(' + ') + ` = ${formatar(Number(soma.toFixed(8)))}`,
        nota: 'Somar diretamente superestimaria o erro: seria supor que todos erram junto.',
      },
      {
        descricao: 'Extraímos a raiz.',
        tex: `\\sigma = ${formatar(Number(resultado.toFixed(6)))}`,
      },
    ],
  };
}

/**
 * Propagação de incerteza num produto ou quociente.
 *
 * Aqui são as incertezas RELATIVAS que se somam em quadratura — e é por isso
 * que medir bem a grandeza que entra ao quadrado importa mais.
 */
export function propagarProdutoComPassos(
  medidas: readonly { readonly valor: number; readonly incerteza: number; readonly expoente?: number }[],
  resultadoNominal: number,
): Resolucao<number> {
  if (medidas.some(({ valor }) => valor === 0)) {
    throw new ErroMatematico('Não há incerteza relativa de uma medida nula.');
  }

  const relativas = medidas.map(({ valor, incerteza, expoente = 1 }) =>
    Math.abs(expoente) * (incerteza / Math.abs(valor)),
  );

  const somaQuadrados = relativas.reduce((total, relativa) => total + relativa * relativa, 0);
  const relativaFinal = Math.sqrt(somaQuadrados);
  const resultado = Math.abs(resultadoNominal) * relativaFinal;

  return {
    resultado,
    passos: [
      {
        descricao: 'Em produtos e quocientes, somam-se as incertezas RELATIVAS.',
        tex: '\\frac{\\sigma_R}{R} = \\sqrt{\\left(n_1\\frac{\\sigma_1}{x_1}\\right)^{2} + \\dots}',
      },
      {
        descricao: 'Cada expoente multiplica a incerteza relativa daquela medida.',
        tex: relativas
          .map((relativa) => formatar(Number((relativa * 100).toFixed(4))) + '\\%')
          .join(' \\quad '),
        nota: 'Uma grandeza elevada ao quadrado contribui com o dobro da sua incerteza relativa.',
      },
      {
        descricao: 'Combinando em quadratura e voltando à incerteza absoluta.',
        tex: `\\sigma_R = ${formatar(Number(Math.abs(resultadoNominal).toFixed(6)))} \\times ${formatar(Number(relativaFinal.toFixed(6)))} = ${formatar(Number(resultado.toFixed(6)))}`,
      },
    ],
  };
}
