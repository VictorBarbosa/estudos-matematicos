import { Passo, Resolucao } from '@core/math/tipos/tipos';

/**
 * Notação matemática: ler o que está escrito e escrever o que se quer dizer.
 *
 * Duas direções, e as duas precisam de coisas diferentes do motor.
 *
 * **Ler** vira conta: quem entende `\sum_{k=1}^{4} k^2` chega a 30, e quem não
 * entende não chega. É por isso que os exercícios de leitura pedem o valor em
 * vez de pedir a tradução em palavras — não há como acertar por eliminação.
 *
 * **Escrever** vira comparação de texto, e aí o problema é que a mesma coisa
 * se escreve de muitos jeitos: `∀`, `\forall`, `ℝ`, `\mathbb{R}`, `R`, `≥`,
 * `\geq`, `>=`. {@link canonizarNotacao} reduz todas essas formas a uma só,
 * para que a correção cobre o conteúdo e não a digitação.
 */

/** Um símbolo do repertório, com o nome que ele tem em cada língua. */
export interface SimboloMatematico {
  readonly simbolo: string;
  /** O nome do símbolo, não a leitura da expressão. */
  readonly nome: string;
  /** Como se lê em voz alta, em português, francês e inglês. */
  readonly pt: string;
  readonly fr: string;
  readonly en: string;
  /** Um exemplo curto, em LaTeX. */
  readonly exemploTex: string;
  /** O que o exemplo diz, em português. */
  readonly exemploLido: string;
  readonly familia: FamiliaDeSimbolos;
}

export type FamiliaDeSimbolos =
  | 'conjuntos'
  | 'logica'
  | 'intervalos'
  | 'somas'
  | 'funcoes'
  | 'operadores';

export const FAMILIAS: Readonly<Record<FamiliaDeSimbolos, string>> = {
  conjuntos: 'Conjuntos e pertinência',
  logica: 'Lógica e quantificadores',
  intervalos: 'Intervalos',
  somas: 'Somatório e produtório',
  funcoes: 'Funções',
  operadores: 'Operadores',
};

/**
 * O repertório que este site cobra.
 *
 * A leitura em francês e inglês não é enfeite: o curso é no Québec, a
 * bibliografia é em inglês, e um símbolo que não se sabe dizer em voz alta é
 * um símbolo que não se usa para pensar.
 */
export const SIMBOLOS: readonly SimboloMatematico[] = [
  {
    simbolo: '∈',
    nome: 'pertence',
    pt: 'pertence a',
    fr: 'appartient à',
    en: 'belongs to / is in',
    exemploTex: '3 \\in \\mathbb{N}',
    exemploLido: 'três pertence aos naturais',
    familia: 'conjuntos',
  },
  {
    simbolo: '∉',
    nome: 'não pertence',
    pt: 'não pertence a',
    fr: "n'appartient pas à",
    en: 'does not belong to',
    exemploTex: '\\tfrac{1}{2} \\notin \\mathbb{Z}',
    exemploLido: 'um meio não pertence aos inteiros',
    familia: 'conjuntos',
  },
  {
    simbolo: '⊂',
    nome: 'está contido',
    pt: 'está contido em',
    fr: 'est inclus dans',
    en: 'is a subset of',
    exemploTex: '\\mathbb{N} \\subset \\mathbb{Z}',
    exemploLido: 'os naturais estão contidos nos inteiros',
    familia: 'conjuntos',
  },
  {
    simbolo: '∪',
    nome: 'união',
    pt: 'união',
    fr: 'union',
    en: 'union',
    exemploTex: '\\{1,2\\} \\cup \\{2,3\\} = \\{1,2,3\\}',
    exemploLido: 'tudo o que está em um ou no outro',
    familia: 'conjuntos',
  },
  {
    simbolo: '∩',
    nome: 'interseção',
    pt: 'interseção',
    fr: 'intersection',
    en: 'intersection',
    exemploTex: '\\{1,2\\} \\cap \\{2,3\\} = \\{2\\}',
    exemploLido: 'só o que está nos dois',
    familia: 'conjuntos',
  },
  {
    simbolo: 'ℝ',
    nome: 'conjunto dos reais',
    pt: 'erre, o conjunto dos reais',
    fr: 'R, ensemble des réels',
    en: 'R, the real numbers',
    exemploTex: '\\pi \\in \\mathbb{R}',
    exemploLido: 'pi é um número real',
    familia: 'conjuntos',
  },
  {
    simbolo: '∀',
    nome: 'quantificador universal',
    pt: 'para todo',
    fr: 'pour tout',
    en: 'for all / for every',
    exemploTex: '\\forall x \\in \\mathbb{R},\\ x^2 \\geq 0',
    exemploLido: 'para todo x real, x ao quadrado é maior ou igual a zero',
    familia: 'logica',
  },
  {
    simbolo: '∃',
    nome: 'quantificador existencial',
    pt: 'existe',
    fr: 'il existe',
    en: 'there exists',
    exemploTex: '\\exists n \\in \\mathbb{N},\\ n > 5',
    exemploLido: 'existe um natural maior que cinco',
    familia: 'logica',
  },
  {
    simbolo: '⇒',
    nome: 'implica',
    pt: 'implica / então',
    fr: 'implique / donc',
    en: 'implies',
    exemploTex: 'x > 2 \\Rightarrow x > 1',
    exemploLido: 'se x é maior que dois, então x é maior que um',
    familia: 'logica',
  },
  {
    simbolo: '⇔',
    nome: 'se e somente se',
    pt: 'se e somente se',
    fr: 'si et seulement si',
    en: 'if and only if',
    exemploTex: 'x^2 = 4 \\Leftrightarrow x = \\pm 2',
    exemploLido: 'uma coisa vale exatamente quando a outra vale',
    familia: 'logica',
  },
  {
    simbolo: '[a, b]',
    nome: 'intervalo fechado',
    pt: 'de a até b, incluindo os dois',
    fr: 'intervalle fermé de a à b',
    en: 'closed interval from a to b',
    exemploTex: 'x \\in [2, 5]',
    exemploLido: 'x vale de dois a cinco, com os extremos',
    familia: 'intervalos',
  },
  {
    simbolo: '(a, b)',
    nome: 'intervalo aberto',
    pt: 'de a até b, sem os extremos',
    fr: 'intervalle ouvert de a à b',
    en: 'open interval from a to b',
    exemploTex: 'x \\in (2, 5)',
    exemploLido: 'x fica entre dois e cinco, sem valer dois nem cinco',
    familia: 'intervalos',
  },
  {
    simbolo: '∑',
    nome: 'somatório',
    pt: 'somatório de k igual a 1 até n',
    fr: 'somme de k égale 1 à n',
    en: 'sum from k equals 1 to n',
    exemploTex: '\\sum_{k=1}^{4} k^2 = 1 + 4 + 9 + 16 = 30',
    exemploLido: 'some os quadrados de 1 a 4',
    familia: 'somas',
  },
  {
    simbolo: '∏',
    nome: 'produtório',
    pt: 'produtório de k igual a 1 até n',
    fr: 'produit de k égale 1 à n',
    en: 'product from k equals 1 to n',
    exemploTex: '\\prod_{k=1}^{4} k = 1 \\cdot 2 \\cdot 3 \\cdot 4 = 24',
    exemploLido: 'multiplique os naturais de 1 a 4',
    familia: 'somas',
  },
  {
    simbolo: 'f: A → B',
    nome: 'assinatura da função',
    pt: 'f de A em B',
    fr: 'f de A dans B',
    en: 'f from A to B',
    exemploTex: 'f: \\mathbb{R} \\to \\mathbb{R}',
    exemploLido: 'f recebe um real e devolve um real',
    familia: 'funcoes',
  },
  {
    simbolo: '|x|',
    nome: 'valor absoluto',
    pt: 'módulo de x',
    fr: 'valeur absolue de x',
    en: 'absolute value of x',
    exemploTex: '|-7| = 7',
    exemploLido: 'a distância de x até zero',
    familia: 'operadores',
  },
  {
    simbolo: 'n!',
    nome: 'fatorial',
    pt: 'n fatorial',
    fr: 'factorielle n',
    en: 'n factorial',
    exemploTex: '4! = 4 \\cdot 3 \\cdot 2 \\cdot 1 = 24',
    exemploLido: 'o produto de todos os naturais de 1 a n',
    familia: 'operadores',
  },
  {
    simbolo: '∫',
    nome: 'integral',
    pt: 'integral de a até b de f de x, de xis',
    fr: 'intégrale de a à b de f de x, dx',
    en: 'integral from a to b of f of x, d x',
    exemploTex: '\\int_{0}^{1} x \\,dx = \\tfrac{1}{2}',
    exemploLido: 'a área sob a curva entre 0 e 1',
    familia: 'somas',
  },
  {
    simbolo: '≤',
    nome: 'menor ou igual',
    pt: 'menor ou igual a',
    fr: 'inférieur ou égal à',
    en: 'less than or equal to',
    exemploTex: 'x \\leq 3',
    exemploLido: 'x vale no máximo três',
    familia: 'operadores',
  },
];

/**
 * Formas de escrever a mesma coisa, reduzidas a uma só.
 *
 * A ordem importa: `\mathbb{R}` tem de ser trocado antes de `\mathbb`, e
 * `\Leftrightarrow` antes de `\leq`, senão o pedaço comum some primeiro.
 */
const EQUIVALENCIAS: readonly (readonly [RegExp, string])[] = [
  // LaTeX dos conjuntos numéricos.
  [/\\mathbb\s*\{\s*R\s*\}/g, 'ℝ'],
  [/\\mathbb\s*\{\s*N\s*\}/g, 'ℕ'],
  [/\\mathbb\s*\{\s*Z\s*\}/g, 'ℤ'],
  [/\\mathbb\s*\{\s*Q\s*\}/g, 'ℚ'],

  // Setas e conectivos, do mais longo para o mais curto.
  [/\\Leftrightarrow|\\iff|<=>/g, '⇔'],
  [/\\Rightarrow|\\implies|=>/g, '⇒'],
  [/\\leftrightarrow/g, '⇔'],
  [/\\rightarrow|\\to|->/g, '→'],

  [/\\forall/g, '∀'],
  [/\\exists/g, '∃'],
  [/\\notin/g, '∉'],
  [/\\in\b/g, '∈'],
  [/\\subseteq|\\subset/g, '⊂'],
  [/\\cup/g, '∪'],
  [/\\cap/g, '∩'],
  [/\\emptyset|\\varnothing/g, '∅'],
  [/\\infty/g, '∞'],
  [/\\sum/g, '∑'],
  [/\\prod/g, '∏'],
  [/\\int/g, '∫'],
  [/\\sqrt/g, '√'],
  [/\\pi\b/g, 'π'],
  [/\\cdot|\\times/g, '·'],
  [/\\leq|<=/g, '≤'],
  [/\\geq|>=/g, '≥'],
  [/\\neq|!=|=\//g, '≠'],
  [/\\approx/g, '≈'],
  [/\\pm/g, '±'],

  // Espaçamento de LaTeX, que não muda o que está escrito.
  [/\\[,;:!]|\\quad|\\qquad|\\ |\\left|\\right/g, ''],

  // Expoentes e índices escritos como caractere.
  [/²/g, '^2'],
  [/³/g, '^3'],
  [/⁴/g, '^4'],
];

/** O separador do corpo de um quantificador: vírgula, dois-pontos ou ponto. */
const SEPARADOR_DE_QUANTIFICADOR = /(∀[^,:.]*|∃[^,:.]*)[:.]/g;

/**
 * Reduz uma notação à forma que a correção compara.
 *
 * Tira espaço, troca cada grafia alternativa pela canônica e desmancha as
 * chaves de um expoente ou índice de um caractere só. O que sobra é o
 * conteúdo: `\forall x \in \mathbb{R}, x^{2} \geq 0` e `∀x∈ℝ, x²≥0` chegam à
 * mesma string.
 */
export function canonizarNotacao(entrada: string): string {
  let texto = entrada.trim();

  for (const [de, para] of EQUIVALENCIAS) {
    texto = texto.replace(de, para);
  }

  texto = texto
    // Dois-pontos separando o corpo do quantificador vale como vírgula.
    .replace(SEPARADOR_DE_QUANTIFICADOR, '$1,')
    // `R`, `N`, `Z` e `Q` soltos depois de ∈, ⊂ ou : são os conjuntos.
    .replace(/([∈⊂:→])\s*R\b/g, '$1ℝ')
    .replace(/([∈⊂:→])\s*N\b/g, '$1ℕ')
    .replace(/([∈⊂:→])\s*Z\b/g, '$1ℤ')
    .replace(/([∈⊂:→])\s*Q\b/g, '$1ℚ')
    // `x^{2}` e `_{k}` com um token dentro não precisam das chaves.
    .replace(/([_^])\{([^{}]{1,12})\}/g, '$1$2')
    .replace(/\s+/g, '')
    .replace(/\.$/, '');

  return texto;
}

/**
 * Soma os termos de `de` até `ate`, mostrando a expansão.
 *
 * A expansão é o passo que ensina: ver `1 + 4 + 9 + 16` embaixo de
 * `\sum_{k=1}^{4} k^2` é o que transforma o símbolo em conta.
 */
export function somatorioComPassos(
  de: number,
  ate: number,
  termo: (k: number) => number,
  termoTex: (k: number) => string,
  corpoTex: string,
): Resolucao<number> {
  const indices = Array.from({ length: ate - de + 1 }, (_, i) => de + i);
  const parcelas = indices.map(termo);
  const resultado = parcelas.reduce((total, parcela) => total + parcela, 0);

  const passos: Passo[] = [
    {
      descricao: `O somatório manda somar ${corpoTex ? 'o termo' : 'os termos'} com k indo de ${de} a ${ate}.`,
      tex: `\\sum_{k=${de}}^{${ate}} ${corpoTex}`,
      nota: 'O índice embaixo diz onde começa; o número em cima, onde para.',
    },
    {
      descricao: 'Escrevemos cada parcela, trocando k pelo seu valor.',
      tex: indices.map(termoTex).join(' + '),
    },
    {
      descricao: 'Somamos.',
      tex: `${parcelas.join(' + ')} = ${resultado}`,
    },
  ];

  return { resultado, passos };
}

/** O mesmo que {@link somatorioComPassos}, multiplicando em vez de somar. */
export function produtorioComPassos(
  de: number,
  ate: number,
  termo: (k: number) => number,
  termoTex: (k: number) => string,
  corpoTex: string,
): Resolucao<number> {
  const indices = Array.from({ length: ate - de + 1 }, (_, i) => de + i);
  const fatores = indices.map(termo);
  const resultado = fatores.reduce((total, fator) => total * fator, 1);

  const passos: Passo[] = [
    {
      descricao: `O produtório manda multiplicar, com k indo de ${de} a ${ate}.`,
      tex: `\\prod_{k=${de}}^{${ate}} ${corpoTex}`,
      nota: 'Mesmo arranjo do somatório; o que muda é a operação.',
    },
    {
      descricao: 'Escrevemos cada fator, trocando k pelo seu valor.',
      tex: indices.map(termoTex).join(' \\cdot '),
    },
    {
      descricao: 'Multiplicamos.',
      tex: `${fatores.join(' \\cdot ')} = ${resultado}`,
    },
  ];

  return { resultado, passos };
}

/** Um intervalo da reta, com as pontas abertas ou fechadas. */
export interface Intervalo {
  readonly de: number;
  readonly ate: number;
  readonly fechadoEsquerda: boolean;
  readonly fechadoDireita: boolean;
}

/** `[2, 5)` e companhia, em LaTeX. */
export function intervaloParaTex(intervalo: Intervalo): string {
  const abre = intervalo.fechadoEsquerda ? '[' : '(';
  const fecha = intervalo.fechadoDireita ? ']' : ')';
  return `\\left${abre}${intervalo.de},\\, ${intervalo.ate}\\right${fecha}`;
}

/**
 * Quantos inteiros cabem no intervalo.
 *
 * É a pergunta que separa quem leu o colchete de quem não leu: `[2, 5]` tem
 * quatro inteiros e `[2, 5)` tem três, e a diferença está só no desenho da
 * ponta.
 */
export function inteirosNoIntervaloComPassos(intervalo: Intervalo): Resolucao<number> {
  const primeiro = intervalo.fechadoEsquerda
    ? Math.ceil(intervalo.de)
    : Math.floor(intervalo.de) + 1;
  const ultimo = intervalo.fechadoDireita
    ? Math.floor(intervalo.ate)
    : Math.ceil(intervalo.ate) - 1;

  const resultado = Math.max(0, ultimo - primeiro + 1);
  const lista = Array.from({ length: resultado }, (_, i) => primeiro + i);

  const passos: Passo[] = [
    {
      descricao: 'Lemos as pontas: colchete inclui o extremo, parêntese não.',
      tex: intervaloParaTex(intervalo),
      nota: `${intervalo.fechadoEsquerda ? intervalo.de + ' entra' : intervalo.de + ' fica de fora'}; ${
        intervalo.fechadoDireita ? intervalo.ate + ' entra' : intervalo.ate + ' fica de fora'
      }.`,
    },
    {
      descricao: 'Os inteiros que sobram são estes.',
      tex: resultado === 0 ? '\\{\\,\\}' : `\\{${lista.join(', ')}\\}`,
    },
    {
      descricao: 'Contamos.',
      tex: `${resultado}`,
    },
  ];

  return { resultado, passos };
}

/** As três operações entre conjuntos que o tópico cobra. */
export type OperacaoDeConjunto = 'uniao' | 'intersecao' | 'diferenca';

const SIMBOLO_DE_CONJUNTO: Readonly<Record<OperacaoDeConjunto, string>> = {
  uniao: '\\cup',
  intersecao: '\\cap',
  diferenca: '\\setminus',
};

const LEITURA_DE_CONJUNTO: Readonly<Record<OperacaoDeConjunto, string>> = {
  uniao: 'tudo o que está em A ou em B',
  intersecao: 'só o que está nos dois',
  diferenca: 'o que está em A e não está em B',
};

/** `\{1, 2, 3\}`. */
export function conjuntoParaTex(elementos: readonly number[]): string {
  return elementos.length === 0 ? '\\varnothing' : `\\{${[...elementos].join(', ')}\\}`;
}

/** Aplica a operação e mostra o conjunto que sai dela. */
export function operacaoDeConjuntoComPassos(
  a: readonly number[],
  b: readonly number[],
  operacao: OperacaoDeConjunto,
): Resolucao<readonly number[]> {
  const resultado =
    operacao === 'uniao'
      ? [...new Set([...a, ...b])].sort((x, y) => x - y)
      : operacao === 'intersecao'
        ? a.filter((elemento) => b.includes(elemento))
        : a.filter((elemento) => !b.includes(elemento));

  const passos: Passo[] = [
    {
      descricao: 'Escrevemos os dois conjuntos.',
      tex: `A = ${conjuntoParaTex(a)} \\qquad B = ${conjuntoParaTex(b)}`,
    },
    {
      descricao: `O símbolo pede ${LEITURA_DE_CONJUNTO[operacao]}.`,
      tex: `A ${SIMBOLO_DE_CONJUNTO[operacao]} B = ${conjuntoParaTex(resultado)}`,
    },
  ];

  return { resultado, passos };
}
