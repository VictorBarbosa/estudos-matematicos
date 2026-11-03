import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { formatar, formatarEmTexto } from '@core/math/algebra/polinomio/polinomio';

/**
 * Derivadas de seno, cosseno e tangente.
 *
 * O que separa este assunto dos anteriores é que a regra não sai da definição
 * de potência: ela sai do limite fundamental, e o resultado é um ciclo —
 * derivar quatro vezes o seno devolve o seno. Por isso o motor aqui guarda
 * valores EXATOS (√3/2, e não 0,8660): num arco notável a resposta certa é um
 * número fechado, e arredondá-la cedo demais esconde o padrão.
 */

export type FuncaoTrig = 'sen' | 'cos' | 'tan';

/** Um arco escrito como múltiplo racional de π: `k · π / m`. */
export interface ArcoRacional {
  readonly k: number;
  readonly m: number;
}

/**
 * Um número da forma `num · √raiz / den`.
 *
 * Cobre todos os valores de seno e cosseno nos arcos notáveis, e também as
 * secantes ao quadrado da tangente, que são racionais (`raiz = 1`).
 */
export interface ValorExato {
  readonly num: number;
  readonly raiz: number;
  readonly den: number;
}

/** Os arcos que o treino usa: múltiplos de 30° e de 45°, até uma volta. */
export const ARCOS_DA_DERIVADA: readonly ArcoRacional[] = [
  { k: 0, m: 1 },
  { k: 1, m: 6 },
  { k: 1, m: 4 },
  { k: 1, m: 3 },
  { k: 1, m: 2 },
  { k: 2, m: 3 },
  { k: 3, m: 4 },
  { k: 5, m: 6 },
  { k: 1, m: 1 },
];

export function arcoValor({ k, m }: ArcoRacional): number {
  return (k * Math.PI) / m;
}

/** O arco em graus, já reduzido a uma volta. */
export function arcoEmGraus({ k, m }: ArcoRacional): number {
  return (((k * 180) / m) % 360 + 360) % 360;
}

/** Multiplica o arco por um inteiro — é o que a cadeia faz com `f(bx)`. */
export function arcoVezes(arco: ArcoRacional, fator: number): ArcoRacional {
  return { k: arco.k * fator, m: arco.m };
}

/** `\frac{2\pi}{3}`, pronto para o KaTeX. */
export function arcoTex(arco: ArcoRacional): string {
  const { p, q, negativo } = reduzirArco(arco);

  if (p === 0) {
    return '0';
  }

  const sinal = negativo ? '-' : '';
  const numerador = p === 1 ? '\\pi' : `${p}\\pi`;
  return q === 1 ? `${sinal}${numerador}` : `${sinal}\\frac{${numerador}}{${q}}`;
}

/**
 * O mesmo arco para uma frase.
 *
 * Enunciado e nota são parágrafos: `\frac{\pi}{3}` chegaria cru à tela. Aqui o
 * π é o caractere Unicode, que o navegador desenha sozinho.
 */
export function arcoTexto(arco: ArcoRacional): string {
  const { p, q, negativo } = reduzirArco(arco);

  if (p === 0) {
    return '0';
  }

  const sinal = negativo ? '-' : '';
  const numerador = p === 1 ? 'π' : `${p}π`;
  return q === 1 ? `${sinal}${numerador}` : `${sinal}${numerador}/${q}`;
}

export function exatoValor({ num, raiz, den }: ValorExato): number {
  return (num * Math.sqrt(raiz)) / den;
}

/** `-\frac{3\sqrt{2}}{2}`. */
export function exatoTex(valor: ValorExato): string {
  const { num, raiz, den } = simplificarExato(valor);

  if (num === 0) {
    return '0';
  }

  const magnitude = Math.abs(num);
  const corpo =
    raiz === 1
      ? `${magnitude}`
      : magnitude === 1
        ? `\\sqrt{${raiz}}`
        : `${magnitude}\\sqrt{${raiz}}`;

  const sinal = num < 0 ? '-' : '';
  return den === 1 ? `${sinal}${corpo}` : `${sinal}\\frac{${corpo}}{${den}}`;
}

/** Multiplica por um inteiro, simplificando a fração resultante. */
export function exatoVezes(valor: ValorExato, fator: number): ValorExato {
  return simplificarExato({ ...valor, num: valor.num * fator });
}

export function senoExato(arco: ArcoRacional): ValorExato {
  const valor = SENO_POR_GRAU.get(arcoEmGraus(arco));
  if (valor === undefined) {
    throw new Error(`Arco fora da tabela notável: ${arcoEmGraus(arco)}°`);
  }
  return valor;
}

export function cossenoExato(arco: ArcoRacional): ValorExato {
  // cos θ = sen(θ + 90°), e assim uma tabela só serve às duas funções.
  return senoExato({ k: arco.k * 2 + arco.m, m: arco.m * 2 });
}

/**
 * A secante ao quadrado, que é a derivada da tangente.
 *
 * Sempre racional nos arcos notáveis: cos² vale 1, 3/4, 1/2 ou 1/4, e o
 * inverso disso é 1, 4/3, 2 ou 4.
 */
export function secanteAoQuadradoExato(arco: ArcoRacional): ValorExato {
  const { num, raiz, den } = cossenoExato(arco);
  if (num === 0) {
    throw new Error('A tangente não existe neste arco: o cosseno é zero.');
  }
  return simplificarExato({ num: den * den, raiz: 1, den: num * num * raiz });
}

/** A tangente existe? É o único arco notável em que a pergunta não cabe. */
export function temTangente(arco: ArcoRacional): boolean {
  return cossenoExato(arco).num !== 0;
}

/** `3\sen(2x)`, como o enunciado escreve. */
export function trigParaTex(funcao: FuncaoTrig, a: number, b: number): string {
  const coeficiente = a === 1 ? '' : a === -1 ? '-' : `${formatar(a)}`;
  const interno = b === 1 ? 'x' : `${formatar(b)}x`;
  return `${coeficiente}\\${NOME_KATEX[funcao]}\\left(${interno}\\right)`;
}

/** A derivada, ainda em função de x. */
export function derivadaTrigParaTex(funcao: FuncaoTrig, a: number, b: number): string {
  const interno = b === 1 ? 'x' : `${formatar(b)}x`;

  if (funcao === 'sen') {
    return `${coeficienteTex(a * b)}\\cos\\left(${interno}\\right)`;
  }
  if (funcao === 'cos') {
    return `${coeficienteTex(-a * b)}\\operatorname{sen}\\left(${interno}\\right)`;
  }
  return `${coeficienteTex(a * b)}\\sec^{2}\\left(${interno}\\right)`;
}

/**
 * Deriva `a · f(bx)` e avalia num arco notável.
 *
 * Os três passos são sempre os mesmos — tabela, cadeia, substituição — porque é
 * essa sequência que o aluno precisa repetir sozinho.
 */
export function derivadaTrigNoPontoComPassos(
  funcao: FuncaoTrig,
  a: number,
  b: number,
  arco: ArcoRacional,
): Resolucao<number> {
  const interno = arcoVezes(arco, b);
  const exato = derivadaTrigExata(funcao, a, b, arco);
  const resultado = exatoValor(exato);

  const passos: Passo[] = [
    {
      descricao: `Pela tabela, a derivada ${DESCRICAO_DA_TABELA[funcao]}.`,
      tex: REGRA_TEX[funcao],
      nota:
        funcao === 'cos'
          ? 'O sinal de menos é a parte que se esquece: o cosseno começa descendo.'
          : undefined,
    },
    {
      descricao:
        b === 1
          ? 'O coeficiente de fora acompanha a derivada.'
          : 'Como o argumento é um múltiplo de x, a cadeia acrescenta o fator interno.',
      tex: `f'(x) = ${derivadaTrigParaTex(funcao, a, b)}`,
      nota:
        b === 1
          ? undefined
          : `A derivada de ${formatarEmTexto(b)}x é ${formatarEmTexto(b)}, e ela multiplica tudo.`,
    },
    {
      descricao:
        b === 1
          ? `Substituímos x = ${arcoTexto(arco)} e usamos os valores notáveis.`
          : `Substituímos x = ${arcoTexto(arco)}, de modo que o argumento vale ${arcoTexto(interno)}.`,
      tex:
        `f'\\left(${arcoTex(arco)}\\right) = ${substituicaoTex(funcao, a, b, interno)} = ` +
        `${exatoTex(exato)}${aproximacaoTex(exato)}`,
    },
  ];

  return { resultado, passos };
}

/** O valor exato da derivada de `a · f(bx)` no arco. */
export function derivadaTrigExata(
  funcao: FuncaoTrig,
  a: number,
  b: number,
  arco: ArcoRacional,
): ValorExato {
  const interno = arcoVezes(arco, b);

  if (funcao === 'sen') {
    return exatoVezes(cossenoExato(interno), a * b);
  }
  if (funcao === 'cos') {
    return exatoVezes(senoExato(interno), -a * b);
  }
  return exatoVezes(secanteAoQuadradoExato(interno), a * b);
}

/**
 * Deriva `xⁿ · f(x)` pela regra do produto e avalia num arco.
 *
 * Aqui o resultado deixa de ser fechado — aparece π multiplicando uma raiz —,
 * e é por isso que o passo final traz também a aproximação decimal.
 */
export function derivadaProdutoComTrigComPassos(
  n: number,
  funcao: 'sen' | 'cos',
  arco: ArcoRacional,
): Resolucao<number> {
  const x = arcoValor(arco);
  const f = funcao === 'sen' ? Math.sin : Math.cos;
  const linha = funcao === 'sen' ? Math.cos : (t: number) => -Math.sin(t);
  const resultado = n * x ** (n - 1) * f(x) + x ** n * linha(x);

  const nomeTex = funcao === 'sen' ? '\\operatorname{sen}' : '\\cos';
  const derivadaTex = funcao === 'sen' ? '\\cos' : '-\\operatorname{sen}';
  const potencia = n === 1 ? 'x' : `x^{${n}}`;
  const derivadaPotencia = n === 1 ? '1' : n === 2 ? '2x' : `${n}x^{${n - 1}}`;

  const passos: Passo[] = [
    {
      descricao: 'É um produto: derivamos o primeiro mantendo o segundo, e somamos o contrário.',
      tex: `(uv)' = u'v + uv'`,
      nota: 'Aqui u é a potência e v é a função trigonométrica.',
    },
    {
      descricao: 'Cada fator entra com sua própria derivada.',
      tex:
        `f'(x) = ${derivadaPotencia}\\,${nomeTex}(x) + ${potencia}\\,${derivadaTex}(x)`,
    },
    {
      descricao: `Substituímos x = ${arcoTexto(arco)}.`,
      tex:
        `f'\\left(${arcoTex(arco)}\\right) = ` +
        `${derivadaPotencia.replace(/x/g, `\\left(${arcoTex(arco)}\\right)`)}\\,${nomeTex}\\left(${arcoTex(arco)}\\right) + ` +
        `${potencia.replace('x', `\\left(${arcoTex(arco)}\\right)`)}\\,${derivadaTex}\\left(${arcoTex(arco)}\\right)`,
    },
    {
      descricao: 'Efetuando, com os valores notáveis do arco.',
      tex: `f'\\left(${arcoTex(arco)}\\right) \\approx ${formatar(Number(resultado.toFixed(4)))}`,
    },
  ];

  return { resultado, passos };
}

/**
 * Deriva `senⁿ(x)` ou `cosⁿ(x)` pela cadeia e avalia num arco.
 *
 * A potência de uma função trigonométrica é onde as duas regras se encontram, e
 * onde quase todo mundo escreve `n·senⁿ⁻¹(x)` e para por aí.
 */
export function derivadaPotenciaTrigComPassos(
  funcao: 'sen' | 'cos',
  n: number,
  arco: ArcoRacional,
): Resolucao<number> {
  const base = funcao === 'sen' ? senoExato(arco) : cossenoExato(arco);
  const derivadaBase = funcao === 'sen' ? cossenoExato(arco) : exatoVezes(senoExato(arco), -1);
  const resultado = n * exatoValor(base) ** (n - 1) * exatoValor(derivadaBase);

  const nomeTex = funcao === 'sen' ? '\\operatorname{sen}' : '\\cos';
  const derivadaTex = funcao === 'sen' ? '\\cos' : '-\\operatorname{sen}';

  const passos: Passo[] = [
    {
      descricao: 'A potência está por fora e a função trigonométrica por dentro.',
      tex: `u = ${nomeTex}(x) \\qquad f = u^{${n}}`,
    },
    {
      descricao: 'Derivamos a potência mantendo o miolo e multiplicamos pela derivada do miolo.',
      tex: `f'(x) = ${n}\\,${nomeTex}^{${n - 1}}(x)\\cdot ${derivadaTex}(x)`,
      nota: 'Sem esse último fator a conta fica incompleta, por mais que a potência esteja certa.',
    },
    {
      descricao: `No arco ${arcoTexto(arco)}, usamos os valores notáveis.`,
      tex:
        `${n}\\left(${exatoTex(base)}\\right)^{${n - 1}}\\cdot\\left(${exatoTex(derivadaBase)}\\right) ` +
        `= ${formatar(Number(resultado.toFixed(4)))}`,
    },
  ];

  return { resultado, passos };
}

/** A tabela que o tópico ensina, para a tela de exploração. */
export const TABELA_DAS_DERIVADAS_TRIG: readonly {
  readonly funcaoTex: string;
  readonly derivadaTex: string;
  readonly observacao: string;
}[] = [
  {
    funcaoTex: '\\operatorname{sen}(x)',
    derivadaTex: '\\cos(x)',
    observacao: 'A única das três que não troca de sinal.',
  },
  {
    funcaoTex: '\\cos(x)',
    derivadaTex: '-\\operatorname{sen}(x)',
    observacao: 'O menos vem de o cosseno começar descendo em x = 0.',
  },
  {
    funcaoTex: '\\tan(x)',
    derivadaTex: '\\sec^{2}(x)',
    observacao: 'Sai do quociente seno sobre cosseno, e nunca é negativa.',
  },
];

const NOME_KATEX: Readonly<Record<FuncaoTrig, string>> = {
  sen: 'operatorname{sen}',
  cos: 'cos',
  tan: 'tan',
};

const REGRA_TEX: Readonly<Record<FuncaoTrig, string>> = {
  sen: "\\left[\\operatorname{sen}(x)\\right]' = \\cos(x)",
  cos: "\\left[\\cos(x)\\right]' = -\\operatorname{sen}(x)",
  tan: "\\left[\\tan(x)\\right]' = \\sec^{2}(x)",
};

const DESCRICAO_DA_TABELA: Readonly<Record<FuncaoTrig, string>> = {
  sen: 'do seno é o cosseno',
  cos: 'do cosseno é menos o seno',
  tan: 'da tangente é a secante ao quadrado',
};

const SENO_POR_GRAU: ReadonlyMap<number, ValorExato> = new Map([
  [0, { num: 0, raiz: 1, den: 1 }],
  [30, { num: 1, raiz: 1, den: 2 }],
  [45, { num: 1, raiz: 2, den: 2 }],
  [60, { num: 1, raiz: 3, den: 2 }],
  [90, { num: 1, raiz: 1, den: 1 }],
  [120, { num: 1, raiz: 3, den: 2 }],
  [135, { num: 1, raiz: 2, den: 2 }],
  [150, { num: 1, raiz: 1, den: 2 }],
  [180, { num: 0, raiz: 1, den: 1 }],
  [210, { num: -1, raiz: 1, den: 2 }],
  [225, { num: -1, raiz: 2, den: 2 }],
  [240, { num: -1, raiz: 3, den: 2 }],
  [270, { num: -1, raiz: 1, den: 1 }],
  [300, { num: -1, raiz: 3, den: 2 }],
  [315, { num: -1, raiz: 2, den: 2 }],
  [330, { num: -1, raiz: 1, den: 2 }],
]);

function reduzirArco({ k, m }: ArcoRacional): { p: number; q: number; negativo: boolean } {
  const divisor = mdcInterno(Math.abs(k), m) || 1;
  return { p: Math.abs(k) / divisor, q: m / divisor, negativo: k < 0 };
}

function simplificarExato({ num, raiz, den }: ValorExato): ValorExato {
  if (num === 0) {
    return { num: 0, raiz: 1, den: 1 };
  }

  const sinal = Math.sign(num) * Math.sign(den);
  const divisor = mdcInterno(Math.abs(num), Math.abs(den)) || 1;

  return {
    num: (sinal * Math.abs(num)) / divisor,
    raiz,
    den: Math.abs(den) / divisor,
  };
}

function mdcInterno(a: number, b: number): number {
  return b === 0 ? a : mdcInterno(b, a % b);
}

function coeficienteTex(valor: number): string {
  if (valor === 1) {
    return '';
  }
  return valor === -1 ? '-' : formatar(valor);
}

function substituicaoTex(
  funcao: FuncaoTrig,
  a: number,
  b: number,
  interno: ArcoRacional,
): string {
  const fator = funcao === 'cos' ? -a * b : a * b;
  const valor =
    funcao === 'sen'
      ? cossenoExato(interno)
      : funcao === 'cos'
        ? senoExato(interno)
        : secanteAoQuadradoExato(interno);

  return `${coeficienteTex(fator)}\\left(${exatoTex(valor)}\\right)`;
}

/** A aproximação decimal, só quando o valor exato não é inteiro. */
function aproximacaoTex(valor: ValorExato): string {
  const numero = exatoValor(valor);
  return Number.isInteger(numero) ? '' : ` \\approx ${formatar(Number(numero.toFixed(4)))}`;
}
