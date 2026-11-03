import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { formatar, formatarEmTexto } from '@core/math/algebra/polinomio/polinomio';

/**
 * Derivadas da exponencial e do logaritmo.
 *
 * São as duas funções que fecham a tabela do Cálculo 1, e elas se explicam uma
 * pela outra: `eˣ` é a única função que é a própria derivada, e `ln x` é a sua
 * inversa — do que sai `1/x`, a derivada mais usada de toda a engenharia,
 * porque é ela que aparece sempre que uma grandeza cresce proporcionalmente ao
 * que já existe.
 *
 * Duas armadilhas moram aqui, e as duas têm a mesma raiz — confundir base com
 * expoente: derivar `2ˣ` como se fosse `x²`, e derivar `ln(5x)` achando que o 5
 * sobrevive.
 */

/** `2x`, `x`, `-x` — o expoente escrito sem o "1" que ninguém põe à mão. */
export function expoenteParaTex(k: number): string {
  return k === 1 ? 'x' : k === -1 ? '-x' : `${formatar(k)}x`;
}

/** `3e^{2x}`, como o enunciado escreve. */
export function exponencialParaTex(a: number, k: number): string {
  return `${coeficienteTex(a)}e^{${expoenteParaTex(k)}}`;
}

/** `3\ln(5x)`. */
export function logaritmoParaTex(a: number, k: number): string {
  const interno = k === 1 ? 'x' : `${formatar(k)}x`;
  return `${coeficienteTex(a)}\\ln\\left(${interno}\\right)`;
}

/**
 * Deriva `a·e^{kx}` e avalia num ponto.
 *
 * O resultado é a própria função vezes `k` — a exponencial é o único caso em
 * que derivar não muda a forma, só a escala.
 */
export function derivadaExponencialComPassos(
  a: number,
  k: number,
  x0: number,
): Resolucao<number> {
  const resultado = a * k * Math.exp(k * x0);

  const passos: Passo[] = [
    {
      descricao: 'A exponencial natural é a única função que é a própria derivada.',
      tex: "\\left[e^{x}\\right]' = e^{x}",
    },
    {
      descricao: 'Com um múltiplo de x no expoente, a cadeia acrescenta o fator interno.',
      tex: `f'(x) = ${coeficienteTex(a * k)}e^{${expoenteParaTex(k)}}`,
      nota:
        k === 1
          ? 'Aqui o fator interno é 1, e por isso ele passa despercebido.'
          : `A derivada de ${formatarEmTexto(k)}x é ${formatarEmTexto(k)}, e ela multiplica a exponencial inteira.`,
    },
    {
      descricao: `Substituímos x = ${formatarEmTexto(x0)}.`,
      tex:
        `f'(${formatar(x0)}) = ${formatar(a * k)}e^{${formatar(k * x0)}} \\approx ` +
        `${formatar(Number(resultado.toFixed(4)))}`,
    },
  ];

  return { resultado, passos };
}

/**
 * Deriva `a·ln(kx)` e avalia num ponto.
 *
 * O `k` desaparece, e esse é o ponto do exercício: `ln(kx) = ln k + ln x`, e a
 * constante some ao derivar.
 */
export function derivadaLogaritmoComPassos(a: number, k: number, x0: number): Resolucao<number> {
  const resultado = a / x0;

  const passos: Passo[] = [
    {
      descricao: 'A derivada do logaritmo natural é o inverso do argumento.',
      tex: "\\left[\\ln(x)\\right]' = \\frac{1}{x}",
    },
    {
      descricao:
        k === 1
          ? 'O coeficiente de fora acompanha a derivada.'
          : 'A propriedade do logaritmo separa a constante, e constante derivada some.',
      tex:
        k === 1
          ? `f'(x) = \\frac{${formatar(a)}}{x}`
          : `\\ln\\left(${formatar(k)}x\\right) = \\ln ${formatar(k)} + \\ln x \\quad\\Rightarrow\\quad f'(x) = \\frac{${formatar(a)}}{x}`,
      nota:
        k === 1
          ? undefined
          : `O ${formatarEmTexto(k)} não aparece na derivada: ele virou uma parcela constante, não um fator.`,
    },
    {
      descricao: `Substituímos x = ${formatarEmTexto(x0)}.`,
      tex: `f'(${formatar(x0)}) = \\frac{${formatar(a)}}{${formatar(x0)}} = ${formatar(Number(resultado.toFixed(6)))}`,
    },
  ];

  return { resultado, passos };
}

/**
 * Deriva `a·bˣ`, com base diferente de `e`.
 *
 * É a regra que justifica por que `e` é a base natural: só com ela o fator
 * `ln b` vale 1 e desaparece.
 */
export function derivadaExponencialDeBaseComPassos(
  a: number,
  base: number,
  x0: number,
): Resolucao<number> {
  const resultado = a * base ** x0 * Math.log(base);

  const passos: Passo[] = [
    {
      descricao: 'Toda exponencial se escreve na base e, e daí sai o fator que sobra.',
      tex: `${formatar(base)}^{x} = e^{x\\ln ${formatar(base)}}`,
    },
    {
      descricao: 'Derivando pela cadeia, aparece o logaritmo natural da base.',
      tex: `f'(x) = ${coeficienteTex(a)}${formatar(base)}^{x}\\ln ${formatar(base)}`,
      nota: `Com base e esse fator valeria 1 e sumiria; com base ${formatarEmTexto(base)} ele vale cerca de ${formatarEmTexto(Number(Math.log(base).toFixed(4)))}.`,
    },
    {
      descricao: `Substituímos x = ${formatarEmTexto(x0)}.`,
      tex:
        `f'(${formatar(x0)}) = ${formatar(a)}\\cdot${formatar(base ** x0)}\\cdot\\ln ${formatar(base)} ` +
        `\\approx ${formatar(Number(resultado.toFixed(4)))}`,
    },
  ];

  return { resultado, passos };
}

/** Deriva `a·log_b(x)` e avalia num ponto. */
export function derivadaLogaritmoDeBaseComPassos(
  a: number,
  base: number,
  x0: number,
): Resolucao<number> {
  const resultado = a / (x0 * Math.log(base));

  const passos: Passo[] = [
    {
      descricao: 'A mudança de base escreve o logaritmo como um múltiplo do natural.',
      tex: `\\log_{${formatar(base)}} x = \\frac{\\ln x}{\\ln ${formatar(base)}}`,
    },
    {
      descricao: 'O denominador é constante, então ele só divide a derivada do natural.',
      tex: `f'(x) = \\frac{${formatar(a)}}{x\\ln ${formatar(base)}}`,
    },
    {
      descricao: `Substituímos x = ${formatarEmTexto(x0)}.`,
      tex:
        `f'(${formatar(x0)}) = \\frac{${formatar(a)}}{${formatar(x0)}\\ln ${formatar(base)}} ` +
        `\\approx ${formatar(Number(resultado.toFixed(4)))}`,
    },
  ];

  return { resultado, passos };
}

/**
 * Deriva `xⁿ·e^{kx}` pela regra do produto.
 *
 * É a forma que aparece em todo decaimento com atraso, e o fator comum `e^{kx}`
 * nunca sai da conta — só multiplica o colchete.
 */
export function derivadaProdutoComExponencialComPassos(
  n: number,
  k: number,
  x0: number,
): Resolucao<number> {
  const resultado = Math.exp(k * x0) * (n * x0 ** (n - 1) + k * x0 ** n);

  const potencia = n === 1 ? 'x' : `x^{${n}}`;
  const derivadaPotencia = n === 1 ? '1' : n === 2 ? '2x' : `${n}x^{${n - 1}}`;
  const expoente = expoenteParaTex(k);
  const exponencial = `e^{${expoente}}`;

  // O sinal de k vira o sinal da soma, e o 1 implícito não se escreve: com
  // k igual a −1 o que sai é `e^{-x} - xe^{-x}`, nunca `1e^{-1x} + x·-1e^{-1x}`.
  const sinal = k < 0 ? '-' : '+';
  const magnitude = Math.abs(k) === 1 ? '' : formatar(Math.abs(k));
  const segundaParcela = `${magnitude}${potencia}${exponencial}`;
  const dentroDoColchete = `${derivadaPotencia} ${sinal} ${magnitude}${potencia}`;

  const passos: Passo[] = [
    {
      descricao: 'Derivamos o primeiro fator mantendo o segundo, e somamos o contrário.',
      tex: `(uv)' = u'v + uv'`,
    },
    {
      descricao: 'A exponencial aparece nas duas parcelas e pode ser posta em evidência.',
      tex:
        `f'(x) = ${n === 1 ? '' : derivadaPotencia}${exponencial} ${sinal} ${segundaParcela} = ` +
        `${exponencial}\\left(${dentroDoColchete}\\right)`,
    },
    {
      descricao: `Substituímos x = ${formatarEmTexto(x0)}.`,
      tex:
        `f'(${formatar(x0)}) = e^{${formatar(k * x0)}}\\left(${formatar(n * x0 ** (n - 1) + k * x0 ** n)}\\right) ` +
        `\\approx ${formatar(Number(resultado.toFixed(4)))}`,
    },
  ];

  return { resultado, passos };
}

/**
 * Deriva `a·ln(xⁿ)` e avalia num ponto.
 *
 * Com a propriedade da potência, o expoente vira fator antes de qualquer
 * derivada — e a conta deixa de precisar da cadeia.
 */
export function derivadaLogaritmoDePotenciaComPassos(
  a: number,
  n: number,
  x0: number,
): Resolucao<number> {
  const resultado = (a * n) / x0;

  const passos: Passo[] = [
    {
      descricao: 'A propriedade da potência baixa o expoente para fora do logaritmo.',
      tex: `\\ln\\left(x^{${n}}\\right) = ${n}\\ln x`,
      nota: 'Simplificar antes de derivar poupa a regra da cadeia inteira.',
    },
    {
      descricao: 'Agora é o logaritmo natural multiplicado por uma constante.',
      tex: `f'(x) = \\frac{${formatar(a * n)}}{x}`,
    },
    {
      descricao: `Substituímos x = ${formatarEmTexto(x0)}.`,
      tex: `f'(${formatar(x0)}) = \\frac{${formatar(a * n)}}{${formatar(x0)}} = ${formatar(Number(resultado.toFixed(6)))}`,
    },
  ];

  return { resultado, passos };
}

/** A tabela que o tópico ensina, para a tela de exploração. */
export const TABELA_DAS_DERIVADAS_EXP_LOG: readonly {
  readonly funcaoTex: string;
  readonly derivadaTex: string;
  readonly observacao: string;
}[] = [
  {
    funcaoTex: 'e^{x}',
    derivadaTex: 'e^{x}',
    observacao: 'A única função não nula que é a própria derivada.',
  },
  {
    funcaoTex: 'e^{kx}',
    derivadaTex: 'ke^{kx}',
    observacao: 'A cadeia traz o expoente para fora como fator.',
  },
  {
    funcaoTex: 'b^{x}',
    derivadaTex: 'b^{x}\\ln b',
    observacao: 'Com b igual a e o fator vale 1, e é só por isso que ele some.',
  },
  {
    funcaoTex: '\\ln x',
    derivadaTex: '\\frac{1}{x}',
    observacao: 'Vale para x positivo; a derivada cai quando x cresce.',
  },
  {
    funcaoTex: '\\ln(kx)',
    derivadaTex: '\\frac{1}{x}',
    observacao: 'O k vira parcela constante e desaparece ao derivar.',
  },
  {
    funcaoTex: '\\log_{b} x',
    derivadaTex: '\\frac{1}{x\\ln b}',
    observacao: 'Mudança de base: o natural dividido por uma constante.',
  },
];

function coeficienteTex(valor: number): string {
  if (valor === 1) {
    return '';
  }
  return valor === -1 ? '-' : formatar(valor);
}
