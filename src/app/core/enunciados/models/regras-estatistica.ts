import { PI, combinacao, fatorial, type Regra } from '@core/enunciados/models/regras-de-passos';

/**
 * As regras de estatística, matrizes e binômio de Newton.
 */

/** A função erro, aproximação de Abramowitz–Stegun (erro menor que 1,5e−7). */
function erf(x: number): number {
  const sinal = x < 0 ? -1 : 1;
  const z = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * z);
  const polinomial =
    t *
    (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  return sinal * (1 - polinomial * Math.exp(-z * z));
}

/** P(Z ≤ z) na normal padrão. */
const normalAcumulada = (z: number): number => 0.5 * (1 + erf(z / Math.SQRT2));

/** O z que deixa `p` da distribuição abaixo dele. */
function zDe(p: number): number {
  let baixo = -6;
  let alto = 6;

  for (let i = 0; i < 80; i += 1) {
    const meio = (baixo + alto) / 2;
    if (normalAcumulada(meio) < p) baixo = meio;
    else alto = meio;
  }

  return (baixo + alto) / 2;
}

/** Média e desvio amostral dos valores. */
function estatisticas(valores: readonly number[]): { media: number; desvio: number } {
  const media = valores.reduce((t, v) => t + v, 0) / valores.length;
  const variancia =
    valores.reduce((t, v) => t + (v - media) ** 2, 0) / Math.max(1, valores.length - 1);
  return { media, desvio: Math.sqrt(variancia) };
}

/** A matriz 2×2 escrita como `[[a, b], [c, d]]` no texto. */
function matriz2(texto: string): readonly [number, number, number, number] {
  const achado = /\[\[([^\]]+)\],\s*\[([^\]]+)\]\]/.exec(texto);
  const numeros = (achado?.[0] ?? '').match(/-?\d+(?:[.,]\d+)?/g) ?? [];
  const [a, b, c, d] = numeros.map((n) => Number(n.replace(',', '.')));
  return [a ?? 0, b ?? 0, c ?? 0, d ?? 0];
}

/** Os pares (x, y) do texto, na ordem em que aparecem. */
function paresDoTexto(texto: string): readonly (readonly [number, number])[] {
  const achados = [...texto.matchAll(/\((-?\d+(?:[.,]\d+)?),\s*(-?\d+(?:[.,]\d+)?)\)/g)];
  return achados.map(
    (achado) =>
      [Number(achado[1]!.replace(',', '.')), Number(achado[2]!.replace(',', '.'))] as const,
  );
}

/** Inclinação e intercepto da reta de mínimos quadrados. */
function minimosQuadrados(pares: readonly (readonly [number, number])[]): {
  inclinacao: number;
  intercepto: number;
} {
  const n = pares.length;
  const sx = pares.reduce((t, [x]) => t + x, 0);
  const sy = pares.reduce((t, [, y]) => t + y, 0);
  const sxy = pares.reduce((t, [x, y]) => t + x * y, 0);
  const sxx = pares.reduce((t, [x]) => t + x * x, 0);
  const inclinacao = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  return { inclinacao, intercepto: (sy - inclinacao * sx) / n };
}

/** O coeficiente de correlação de Pearson. */
function pearson(pares: readonly (readonly [number, number])[]): number {
  const n = pares.length;
  const sx = pares.reduce((t, [x]) => t + x, 0);
  const sy = pares.reduce((t, [, y]) => t + y, 0);
  const sxy = pares.reduce((t, [x, y]) => t + x * y, 0);
  const sxx = pares.reduce((t, [x]) => t + x * x, 0);
  const syy = pares.reduce((t, [, y]) => t + y * y, 0);
  return (n * sxy - sx * sy) / Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));
}

export const REGRAS_ESTATISTICA: Readonly<Record<string, readonly Regra[]>> = {
  'distribuicao-normal': [
    [
      'Numa distribuição normal, que porcentagem dos valores fica a até # desvio padrão da média? Responda o número com uma casa decimal.',
      'P(|Z| \\le k) = 2\\Phi(k) - 1',
      '2\\Phi(#) - 1',
      (v) => (2 * normalAcumulada(v[0]!) - 1) * 100,
      1,
    ],
    [
      'Numa distribuição normal, que porcentagem dos valores fica a até # desvios padrão da média? Responda o número com uma casa decimal.',
      'P(|Z| \\le k) = 2\\Phi(k) - 1',
      '2\\Phi(#) - 1',
      (v) => (2 * normalAcumulada(v[0]!) - 1) * 100,
      1,
    ],
    [
      'Uma grandeza tem distribuição normal com média # e desvio padrão #. Qual é o escore z de uma leitura de #? (duas casas decimais)',
      'z = \\frac{x - \\mu}{\\sigma}',
      'z = \\frac{#333 - #111}{#222}',
      (v) => (v[2]! - v[0]!) / v[1]!,
      2,
    ],
    [
      'Uma medida tem média # e desvio padrão #. Quantos desvios padrão acima da média está o valor #?',
      'z = \\frac{x - \\mu}{\\sigma}',
      'z = \\frac{#33 - #11}{#22}',
      (v) => (v[2]! - v[0]!) / v[1]!,
    ],
    [
      'Numa normal de média # e desvio #, qual é a proporção ABAIXO de #? (duas casas decimais)',
      'P(X < x) = \\Phi\\left(\\frac{x - \\mu}{\\sigma}\\right)',
      'P = \\Phi\\left(\\frac{# - #}{#}\\right)',
      (v) => normalAcumulada((v[2]! - v[0]!) / v[1]!),
      2,
    ],
    [
      'Numa normal de média # e desvio #, que proporção fica ABAIXO de #? (duas casas decimais)',
      'P(X < x) = \\Phi\\left(\\frac{x - \\mu}{\\sigma}\\right)',
      'P = \\Phi\\left(\\frac{# - #}{#}\\right)',
      (v) => normalAcumulada((v[2]! - v[0]!) / v[1]!),
      2,
    ],
    [
      'Numa normal de média # e desvio #, que proporção fica ACIMA de #? (duas casas decimais)',
      'P(X > x) = 1 - \\Phi\\left(\\frac{x - \\mu}{\\sigma}\\right)',
      'P = 1 - \\Phi\\left(\\frac{# - #}{#}\\right)',
      (v) => 1 - normalAcumulada((v[2]! - v[0]!) / v[1]!),
      2,
    ],
    [
      'Numa normal de média # e desvio #, que proporção fica entre # e #? (duas casas decimais)',
      'P(a < X < b) = \\Phi\\left(\\frac{b-\\mu}{\\sigma}\\right) - \\Phi\\left(\\frac{a-\\mu}{\\sigma}\\right)',
      'P = \\Phi\\left(\\frac{# - #}{#}\\right) - \\Phi\\left(\\frac{# - #}{#}\\right)',
      (v) => normalAcumulada((v[3]! - v[0]!) / v[1]!) - normalAcumulada((v[2]! - v[0]!) / v[1]!),
      2,
    ],
    [
      'Numa normal de média # e desvio #, que proporção fica a até # desvio(s) padrão da média? (duas casas decimais)',
      'P(|Z| \\le k) = 2\\Phi(k) - 1',
      '2\\Phi(#) - 1',
      (v) => 2 * normalAcumulada(v[2]!) - 1,
      2,
    ],
    [
      'Numa distribuição normal de média # e desvio padrão #, entre que valor e # ficam aproximadamente #% dos casos? Informe o valor INFERIOR.',
      'x_{inf} = \\mu - z\\sigma',
      'x_{inf} = # - # \\cdot #',
      (v) => Math.round(v[0]! - zDe((1 + v[v.length - 1]! / 100) / 2) * v[1]!),
    ],
    [
      'Numa normal de média # e desvio #, que valor deixa #% das observações abaixo dele? (duas casas decimais)',
      'x = \\mu + z\\sigma',
      'x = # + # \\cdot #',
      (v) => Math.round(v[0]! + zDe(v[2]! / 100) * v[1]!),
      2,
    ],
    [
      'Numa normal de média # e desvio #, duas leituras independentes são feitas. Qual é a probabilidade de AMBAS ficarem abaixo de #? (duas casas decimais)',
      'P = \\Phi\\left(\\frac{x-\\mu}{\\sigma}\\right)^2',
      'P = \\Phi\\left(\\frac{# - #}{#}\\right)^2',
      (v) => normalAcumulada((v[2]! - v[0]!) / v[1]!) ** 2,
      2,
    ],
  ],

  'estatistica-e-incerteza': [
    [
      'Para as medidas #, #, # e #, qual é a média? (duas casas decimais)',
      '\\bar{x} = \\frac{\\sum x_i}{n}',
      '\\bar{x} = \\frac{# + # + # + #}{4}',
      (v) => (v[0]! + v[1]! + v[2]! + v[3]!) / 4,
      2,
    ],
    [
      'Para as medidas #, #, # e #, qual é a MÉDIA? (duas casas decimais)',
      '\\bar{x} = \\frac{\\sum x_i}{n}',
      '\\bar{x} = \\frac{# + # + # + #}{4}',
      (v) => (v[0]! + v[1]! + v[2]! + v[3]!) / 4,
      2,
    ],
    [
      'Para as medidas #, # e #, qual é a AMPLITUDE (maior menos menor)?',
      'A = x_{max} - x_{min}',
      'A = \\max(#, #, #) - \\min(#, #, #)',
      (v) => Math.max(v[0]!, v[1]!, v[2]!) - Math.min(v[0]!, v[1]!, v[2]!),
    ],
    [
      'Para as medidas #, #, # e #, qual é a amplitude, ou seja, a diferença entre a maior e a menor? (duas casas decimais)',
      'A = x_{max} - x_{min}',
      'A = \\max(#, #, #, #) - \\min(#, #, #, #)',
      (v) => Math.max(v[0]!, v[1]!, v[2]!, v[3]!) - Math.min(v[0]!, v[1]!, v[2]!, v[3]!),
      2,
    ],
    [
      'Dois comprimentos são medidos com incertezas de # cm e # cm. Somando os dois, qual é a incerteza do resultado, em cm? (duas casas decimais)',
      '\\delta = \\sqrt{\\delta_1^2 + \\delta_2^2}',
      '\\delta = # + #',
      (v) => v[0]! + v[1]!,
      2,
    ],
    [
      'Para as medidas #, # e #, qual é a mediana? (duas casas decimais)',
      'M_e = x_{(n+1)/2}',
      'M_e\\left(#, #, #\\right)',
      (v) => [v[0]!, v[1]!, v[2]!].sort((a, b) => a - b)[1]!,
      2,
    ],
    [
      'Para as medidas #, #, # e #, qual é o DESVIO PADRÃO populacional? (duas casas decimais)',
      '\\sigma = \\sqrt{\\frac{\\sum (x_i - \\bar{x})^2}{n}}',
      '\\sigma = \\sqrt{\\frac{\\sum (x_i - \\bar{x})^2}{4}}',
      (v) => {
        const media = (v[0]! + v[1]! + v[2]! + v[3]!) / 4;
        const variancia =
          ((v[0]! - media) ** 2 +
            (v[1]! - media) ** 2 +
            (v[2]! - media) ** 2 +
            (v[3]! - media) ** 2) /
          4;
        return Math.sqrt(variancia);
      },
      2,
    ],
    [
      'Para as medidas #, #, # e #, qual é o desvio padrão AMOSTRAL (divisor n−#)? (duas casas decimais)',
      's = \\sqrt{\\frac{\\sum (x_i - \\bar{x})^2}{n - 1}}',
      's = \\sqrt{\\frac{\\sum (x_i - \\bar{x})^2}{3}}',
      (v) => {
        const media = (v[0]! + v[1]! + v[2]! + v[3]!) / 4;
        const variancia =
          ((v[0]! - media) ** 2 +
            (v[1]! - media) ** 2 +
            (v[2]! - media) ** 2 +
            (v[3]! - media) ** 2) /
          3;
        return Math.sqrt(variancia);
      },
      2,
    ],
    [
      'Um retângulo tem base # ± # cm e altura # ± # cm. Qual é a incerteza da área, em cm²? (duas casas decimais)',
      '\\frac{\\delta A}{A} = \\sqrt{\\left(\\frac{\\delta b}{b}\\right)^2 + \\left(\\frac{\\delta h}{h}\\right)^2}',
      '\\delta A = #3 \\cdot #2 + #4 \\cdot #1',
      (v) => v[0]! * v[3]! + v[2]! * v[1]!,
      2,
    ],
    [
      'Uma medida vale # com incerteza de #. Qual é a incerteza relativa, em porcentagem? (duas casas decimais)',
      '\\frac{\\delta}{x} \\cdot 100\\%',
      '\\frac{#2}{#1} \\cdot 100',
      (v) => (v[1]! / v[0]!) * 100,
      2,
    ],
    [
      'Uma medida vale # ± #. Qual é a incerteza RELATIVA, em %? (duas casas decimais)',
      '\\frac{\\delta}{x} \\cdot 100\\%',
      '\\frac{#2}{#1} \\cdot 100',
      (v) => (v[1]! / v[0]!) * 100,
      2,
    ],
  ],

  'regressao-e-correlacao': [
    [
      'Uma reta de mínimos quadrados tem inclinação # e passa pelo ponto (#, #). Qual é o seu intercepto?',
      'b = \\bar{y} - a\\bar{x}',
      'b = #3 - #2 \\cdot #1',
      (v) => v[2]! - v[0]! * v[1]!,
    ],
    [
      'Uma reta de mínimos quadrados tem inclinação # e intercepto #. Que valor ela prevê para x = #?',
      '\\hat{y} = ax + b',
      '\\hat{y} = #3 \\cdot #1 + #2',
      (v) => v[0]! * v[2]! + v[1]!,
    ],
    [
      'Para os pares (#, #), (#, #) e (#, #), qual é a inclinação da reta de mínimos quadrados? (duas casas decimais)',
      'a = \\frac{n\\sum xy - \\sum x\\sum y}{n\\sum x^2 - (\\sum x)^2}',
      'a = \\frac{3\\sum xy - \\sum x\\sum y}{3\\sum x^2 - (\\sum x)^2}',
      (_v, texto) => minimosQuadrados(paresDoTexto(texto)).inclinacao,
      2,
    ],
    [
      'Para os pares (#, #), (#, #), (#, #) e (#, #), qual é a inclinação da reta de mínimos quadrados? (duas casas decimais)',
      'a = \\frac{n\\sum xy - \\sum x\\sum y}{n\\sum x^2 - (\\sum x)^2}',
      'a = \\frac{4\\sum xy - \\sum x\\sum y}{4\\sum x^2 - (\\sum x)^2}',
      (_v, texto) => minimosQuadrados(paresDoTexto(texto)).inclinacao,
      2,
    ],
    [
      'Para os pares (#, #), (#, #) e (#, #), qual é o intercepto da reta de mínimos quadrados? (duas casas decimais)',
      'b = \\frac{\\sum y - a\\sum x}{n}',
      'b = \\frac{\\sum y - a\\sum x}{3}',
      (_v, texto) => minimosQuadrados(paresDoTexto(texto)).intercepto,
      2,
    ],
    [
      'Para os pares (#, #), (#, #) e (#, #), qual é o coeficiente de correlação de Pearson? (duas casas decimais)',
      'r = \\frac{n\\sum xy - \\sum x\\sum y}{\\sqrt{(n\\sum x^2 - (\\sum x)^2)(n\\sum y^2 - (\\sum y)^2)}}',
      'r = \\frac{n\\sum xy - \\sum x\\sum y}{\\sqrt{(n\\sum x^2 - (\\sum x)^2)(n\\sum y^2 - (\\sum y)^2)}}',
      (_v, texto) => pearson(paresDoTexto(texto)),
      2,
    ],
    [
      'Para os pares (#, #), (#, #), (#, #) e (#, #), qual é o coeficiente de correlação de Pearson? (duas casas decimais)',
      'r = \\frac{n\\sum xy - \\sum x\\sum y}{\\sqrt{(n\\sum x^2 - (\\sum x)^2)(n\\sum y^2 - (\\sum y)^2)}}',
      'r = \\frac{n\\sum xy - \\sum x\\sum y}{\\sqrt{(n\\sum x^2 - (\\sum x)^2)(n\\sum y^2 - (\\sum y)^2)}}',
      (_v, texto) => pearson(paresDoTexto(texto)),
      2,
    ],
    [
      'Para os pares (#, #), (#, #) e (#, #), que fração da variação de y a reta ajustada explica (r²)? (duas casas decimais)',
      'r^2 = \\left(\\frac{n\\sum xy - \\sum x\\sum y}{\\sqrt{\\cdots}}\\right)^2',
      'r^2 = r \\cdot r',
      (_v, texto) => pearson(paresDoTexto(texto)) ** 2,
      2,
    ],
    [
      'Para os pares (#, #), (#, #) e (#, #), qual é o valor PREVISTO de y quando x = #? (duas casas decimais)',
      '\\hat{y} = ax + b',
      '\\hat{y} = a \\cdot # + b',
      (v, texto) => {
        const pares = paresDoTexto(texto);
        const { inclinacao, intercepto } = minimosQuadrados(pares);
        // O último número do texto é o x pedido.
        return inclinacao * v[v.length - 1]! + intercepto;
      },
      2,
    ],
    [
      'Dois conjuntos de dados estão alinhados numa reta crescente perfeita. Qual é o coeficiente de correlação?',
      'r = 1',
      'r = 1',
      () => 1,
    ],
    [
      'Dois conjuntos de dados estão alinhados numa reta DECRESCENTE perfeita. Qual é o coeficiente de correlação?',
      'r = -1',
      'r = -1',
      () => -1,
    ],
    [
      'Para os pares (#, #), (#, #) e (#, #), qual é o resíduo do ponto de x = # em relação à reta de mínimos quadrados? (duas casas decimais)',
      'e = y - (ax + b)',
      'e = y - \\hat{y}',
      (v, texto) => {
        const pares = paresDoTexto(texto);
        const { inclinacao, intercepto } = minimosQuadrados(pares);
        const x = v[v.length - 1]!;
        const ponto = pares.find(([px]) => px === x);
        return (ponto?.[1] ?? 0) - (inclinacao * x + intercepto);
      },
      2,
    ],
  ],

  'matrizes-determinantes': [
    [
      'Qual é o determinante da matriz [[#, #], [#, #]]?',
      '\\det = ad - bc',
      '\\det = #4 \\cdot #1 - #3 \\cdot #2',
      (v) => v[0]! * v[3]! - v[1]! * v[2]!,
    ],
    [
      'Uma matriz # por # tem primeira linha # e #, e segunda linha # e #. Qual é o seu determinante?',
      '\\det = ad - bc',
      '\\det = # \\cdot # - # \\cdot #',
      (v) => {
        const [a, b, c, d] = v.slice(-4) as [number, number, number, number];
        return a * d - b * c;
      },
    ],
    [
      'Qual é a soma dos elementos da diagonal principal da matriz [[#, #], [#, #]]?',
      '\\operatorname{tr} = a + d',
      '\\operatorname{tr} = # + #',
      (v) => v[0]! + v[3]!,
    ],
    [
      'Uma matriz # por # tem primeira linha # e #, e segunda linha # e #. Qual é a soma dos elementos da diagonal principal?',
      '\\operatorname{tr} = a + d',
      '\\operatorname{tr} = # + #',
      (v) => {
        const [a, , , d] = v.slice(-4) as [number, number, number, number];
        return a + d;
      },
    ],
    [
      'Qual é o determinante da matriz identidade de ordem #?',
      '\\det I_n = 1',
      '\\det I_{#} = 1',
      () => 1,
    ],
    [
      'A matriz [[#, #], [#, #]] é invertível? Responda # se sim e # se não.',
      '\\det \\ne 0 \\iff \\text{}',
      '\\det = # \\cdot # - # \\cdot # \\ne 0\\,?',
      (v) => (v[0]! * v[3]! - v[1]! * v[2]! !== 0 ? 1 : 0),
    ],
    [
      'Se o determinante de A é # e o de B é #, qual é o determinante do produto A·B?',
      '\\det(AB) = \\det A \\cdot \\det B',
      '\\det(AB) = # \\cdot #',
      (v) => v[0]! * v[1]!,
    ],
    [
      'Qual é o determinante da matriz [[#, #, #], [#, #, #], [#, #, #]]?',
      '\\det = a(ei-fh) - b(di-fg) + c(dh-eg)',
      '\\det = #(# \\cdot # - # \\cdot #) - #(# \\cdot # - # \\cdot #) + #(# \\cdot # - # \\cdot #)',
      (v) =>
        v[0]! * (v[4]! * v[8]! - v[5]! * v[7]!) -
        v[1]! * (v[3]! * v[8]! - v[5]! * v[6]!) +
        v[2]! * (v[3]! * v[7]! - v[4]! * v[6]!),
    ],
    [
      'No sistema resolvido por Cramer, o determinante da matriz principal é # e o da matriz de x é #. Qual é o valor de x? (duas casas decimais)',
      'x = \\frac{\\det A_x}{\\det A}',
      'x = \\frac{#2}{#1}',
      (v) => v[1]! / v[0]!,
      2,
    ],
  ],

  'autovalores-e-autovetores': [
    [
      'Uma matriz diagonal # por # tem # e # na diagonal principal e zeros fora dela. Qual é o maior autovalor?',
      '\\{\\lambda\\} = \\mathrm{diag}',
      '\\lambda_{max} = \\max(#, #)',
      (v) => Math.max(v[v.length - 2]!, v[v.length - 1]!),
    ],
    [
      'Qual é o maior autovalor da matriz diagonal [[#, #], [#, #]]?',
      '\\{\\lambda\\} = \\mathrm{diag}',
      '\\lambda_{max} = \\max(#, #)',
      (v) => Math.max(v[0]!, v[3]!),
    ],
    [
      'A matriz [[#, #], [#, #]] é triangular. Qual é o maior autovalor dela?',
      '\\Delta_{\\triangle} \\Rightarrow \\{\\lambda\\} = \\mathrm{diag}',
      '\\lambda_{max} = \\max(#, #)',
      (v) => Math.max(v[0]!, v[3]!),
    ],
    [
      'Qual é o traço da matriz [[#, #], [#, #]], isto é, a soma dos autovalores?',
      '\\operatorname{tr} = a + d',
      '\\operatorname{tr} = # + #',
      (v) => v[0]! + v[3]!,
    ],
    [
      'Qual é o produto dos autovalores da matriz [[#, #], [#, #]]?',
      '\\lambda_1\\lambda_2 = \\det',
      '\\prod\\lambda = #4 \\cdot #1 - #3 \\cdot #2',
      (v) => v[0]! * v[3]! - v[1]! * v[2]!,
    ],
    [
      'Uma matriz #×# tem autovalores # e #. Qual é o traço dela?',
      '\\operatorname{tr} = \\lambda_1 + \\lambda_2',
      '\\operatorname{tr} = # + #',
      (v) => v[v.length - 2]! + v[v.length - 1]!,
    ],
    [
      'Uma matriz #×# tem autovalores # e #. Qual é o determinante dela?',
      '\\det = \\lambda_1\\lambda_2',
      '\\det = # \\cdot #',
      (v) => v[v.length - 2]! * v[v.length - 1]!,
    ],
    [
      'Uma matriz # por # tem autovalores # e #. Qual é o determinante dela, que é o produto dos autovalores?',
      '\\det = \\lambda_1\\lambda_2',
      '\\det = # \\cdot #',
      (v) => v[v.length - 2]! * v[v.length - 1]!,
    ],
    [
      'A matriz [[#, #], [#, #]] tem autovalores iguais a # e #. Qual é o determinante dela?',
      '\\det = \\lambda_1\\lambda_2',
      '\\det = # \\cdot #',
      (v) => v[v.length - 2]! * v[v.length - 1]!,
    ],
    [
      'Uma matriz # por # tem traço # e determinante #. Sabendo que a soma dos autovalores é o traço, e que um deles vale #, qual é o outro?',
      '\\lambda_2 = \\operatorname{tr} - \\lambda_1',
      '\\lambda_2 = # - #',
      (v) => v[v.length - 3]! - v[v.length - 1]!,
    ],
    [
      'Uma matriz # por # tem primeira linha # e #, e segunda linha # e #. Qual é a soma dos seus autovalores?',
      '\\sum\\lambda = \\operatorname{tr}',
      '\\sum\\lambda = # + #',
      (v) => v[v.length - 4]! + v[v.length - 1]!,
    ],
    [
      'Qual é o maior autovalor da matriz [[#, #], [#, #]]? (duas casas decimais)',
      '\\lambda_{max} = \\frac{(a+d) + \\sqrt{(a-d)^2 + 4b^2}}{2}',
      '\\lambda_{max} = \\frac{(# + #) + \\sqrt{(# - #)^2 + 4 \\cdot #^2}}{2}',
      (v) => {
        const traco = v[0]! + v[3]!;
        const discriminante = (v[0]! - v[3]!) ** 2 + 4 * v[1]! * v[2]!;
        return (traco + Math.sqrt(discriminante)) / 2;
      },
      2,
    ],
  ],

  'escalonamento-e-inversa': [
    [
      'Num sistema já escalonado, a última equação diz que #y vale #. Quanto vale y?',
      'y = \\frac{b}{a}',
      'y = \\frac{#2}{#1}',
      (v) => v[1]! / v[0]!,
    ],
    [
      'Num sistema escalonado, y vale # e a primeira equação diz que x mais #y vale #. Quanto vale x?',
      'x = c - ay',
      'x = #3 - #2 \\cdot #1',
      (v) => v[2]! - v[1]! * v[0]!,
    ],
    [
      'Aplicando a operação L# ← L# − #·L# na matriz [[#, #], [#, #]], qual é a nova entrada da linha # na coluna #?',
      'L_2 \\leftarrow L_2 - k L_1',
      'a_{21} = # - # \\cdot #',
      (v, texto) => {
        const [a, , c] = matriz2(texto);
        return c - v[2]! * a;
      },
    ],
    [
      'Uma matriz # por # tem primeira linha # e #, e segunda linha # e #. Qual é o determinante dela, que é o número pelo qual a inversa divide?',
      '\\det = ad - bc',
      '\\det = # \\cdot # - # \\cdot #',
      (v) => {
        const [a, b, c, d] = v.slice(-4) as [number, number, number, number];
        return a * d - b * c;
      },
    ],
    [
      'Uma matriz # por # tem primeira linha # e #, e segunda linha # e #. Qual é a entrada da linha #, coluna # da matriz inversa?',
      'A^{-1} = \\frac{1}{\\det}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}',
      '\\frac{#4}{#5 \\cdot #3 - #2 \\cdot #1}',
      (_v, texto) => {
        const [a, b, c, d] = matriz2(texto);
        return d / (a * d - b * c);
      },
    ],
    [
      'A matriz [[#, #], [#, #]] tem inversa. Qual é a entrada da linha #, coluna # dela?',
      'A^{-1} = \\frac{1}{\\det}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}',
      '\\frac{#4}{#5 \\cdot #3 - #2 \\cdot #1}',
      (_v, texto) => {
        const [a, b, c, d] = matriz2(texto);
        return d / (a * d - b * c);
      },
    ],
  ],

  'binomio-de-newton': [
    [
      'Quantos termos tem o desenvolvimento de (a mais b) elevado a #?',
      't = n + 1',
      't = # + 1',
      (v) => v[0]! + 1,
    ],
    [
      'Qual é a soma de todos os coeficientes do desenvolvimento de (a mais b) elevado a #?',
      '(a+b)^n,\\ a = b = 1 \\Rightarrow 2^n',
      '2^{#}',
      (v) => 2 ** v[0]!,
    ],
    [
      'Quanto vale C(#, #), o número na linha #, posição # do triângulo de Pascal (contando do #)?',
      'C(n, k) = \\frac{n!}{k!(n-k)!}',
      'C(#, #) = \\frac{#!}{#!(# - #)!}',
      (v) => combinacao(v[0]!, v[1]!),
    ],
    [
      'Qual é o coeficiente de x^# no desenvolvimento de (x + #)^#?',
      'C(n, k)a^{n-k}',
      'C(#, #) \\cdot #^{# - #}',
      (v) => combinacao(v[2]!, v[0]!) * v[1]! ** (v[2]! - v[0]!),
    ],
    [
      'Qual é o coeficiente de x^# no desenvolvimento de (#x + #)^#?',
      'C(n, k)a^k b^{n-k}',
      'C(#, #) \\cdot #^{#} \\cdot #^{# - #}',
      (v) => combinacao(v[3]!, v[0]!) * v[1]! ** v[0]! * v[2]! ** (v[3]! - v[0]!),
    ],
    [
      'No desenvolvimento de (a mais b) elevado a #, qual é o maior coeficiente binomial?',
      '\\max C(n, k) = C\\left(n, \\left\\lfloor n/2 \\right\\rfloor\\right)',
      '\\max C(#, k)',
      (v) => combinacao(v[0]!, Math.floor(v[0]! / 2)),
    ],
    [
      'No desenvolvimento de (a mais b) elevado a #, qual é o coeficiente do termo em que a aparece elevado a #?',
      'C(n, k)',
      'C(#, #)',
      (v) => combinacao(v[0]!, v[1]!),
    ],
    [
      'Qual é a soma dos coeficientes de x^{pares} no desenvolvimento de (# + x)^#? Responda como potência de # elevada a n−#.',
      '\\frac{2^n}{2} = 2^{n-1}',
      '2^{#}',
      (v) => 2 ** (v[1]! - 1),
    ],
  ],
};
