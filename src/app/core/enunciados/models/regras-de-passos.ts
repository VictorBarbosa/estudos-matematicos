import type { Passo } from '@core/math/tipos/tipos';

/**
 * As regras de resolução, em forma declarativa.
 *
 * Cada regra é uma quádrupla: a FORMA da pergunta, a FÓRMULA simbólica em
 * LaTeX, a mesma fórmula com os valores no lugar, e a conta que fecha o
 * resultado. Com isso todo exercício do banco ganha a mesma trilha de três
 * etapas, que é a que o aluno precisa ver:
 *
 * 1. **A fórmula** — o que a pergunta pede, escrito em símbolos;
 * 2. **Substituindo** — os números do caso entrando na fórmula;
 * 3. **Efetuando** — o resultado.
 *
 * As três etapas aparecem com `KaTeX` (o componente `app-formula`), como as
 * resoluções dos geradores.
 *
 * ## O `#` é o número
 *
 * A forma e a substituição escrevem `#` onde vai um número. Na forma, cada `#`
 * vira um grupo de captura; na substituição, ele recebe o número que casou, na
 * ordem. É o que faz uma regra cobrir todos os valores de uma mesma pergunta.
 */

/**
 * As três descrições fixas dos passos.
 *
 * São exportadas porque o guarda de tradução precisa delas: os passos mostram
 * esta frase na tela, e ela tem de existir no dicionário como qualquer outra.
 */
export const DESCRICAO_DA_FORMULA = 'A fórmula que resolve a pergunta.';
export const DESCRICAO_DA_SUBSTITUICAO = 'Substituindo os valores do enunciado.';
export const DESCRICAO_DA_CONTA = 'Efetuando a conta.';

/**
 * A fórmula ou a substituição, escrita ou calculada.
 *
 * Quase sempre é uma string com `#` nos lugares dos números. Mas há contas em
 * que a substituição precisa de pedaços que não estão no enunciado: na fração
 * geratriz de 1,2555… o que entra na conta é 25, 2 e 90 — e nenhum dos três é
 * um número que se possa capturar do texto. Esses casos eram escritos como
 * frases dentro da fórmula («geratriz: parte que repete sobre 9, deslocada»),
 * o que não é fórmula nenhuma e não ensina a chegar ao resultado. Com a
 * função, a regra calcula a própria linha.
 */
export type TexDaRegra = string | ((valores: readonly number[], texto: string) => string);

/** Uma regra: forma, fórmula, substituição, conta, casas decimais. */
export type Regra = readonly [
  forma: string,
  formula: TexDaRegra,
  substituir: TexDaRegra,
  /**
   * A conta.
   *
   * Recebe os números do texto, na ordem, e o texto — porque há perguntas em
   * que a resposta depende de uma PALAVRA (o nome do íon, a fórmula química) e
   * não de um número.
   */
  conta: (valores: readonly number[], texto: string) => number | string,
  casas?: number,
];

const NUMERO = /-?\d+(?:[.,]\d+)?/g;

/** O texto com cada número trocado por `#`, e os espaços normalizados. */
export function formaDoTexto(texto: string): string {
  return texto.replace(NUMERO, '#').replace(/\s+/g, ' ').trim();
}

/** Os números do texto, na ordem em que aparecem. */
export function valoresDoTexto(texto: string): readonly number[] {
  return [...texto.matchAll(NUMERO)].map((achado) => Number(achado[0]!.replace(',', '.')));
}

const escapar = (texto: string): string => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * A forma vira um regex.
 *
 * `#` é um número; `*` é qualquer trecho sem números — é o que deixa uma regra
 * servir para todos os íons (`*` casa `Na⁺`, `Fe³⁺`) e todas as fórmulas
 * (`*` casa `H2SO4`).
 */
function paraRegex(forma: string): RegExp {
  const corpo = forma
    .split(/(#|\*)/)
    .map((pedaco) =>
      pedaco === '#' ? '(-?\\d+(?:[.,]\\d+)?)' : pedaco === '*' ? '([^\\d]*?)' : escapar(pedaco),
    )
    .join('');

  return new RegExp(`^${corpo}$`);
}

/**
 * Troca cada `#` da substituição pelo número correspondente.
 *
 * `#` sozinho segue a ordem do texto. `#n` (1, 2, 3…) aponta o grupo pelo
 * número — e é o que evita o erro que apareceu aqui muitas vezes: quando a
 * conta precisa do SEGUNDO número antes do primeiro, a substituição escrita em
 * ordem trocava os valores e mostrava uma conta que não fechava.
 */
function vestir(texto: string, valores: readonly number[]): string {
  let proximo = 0;

  return texto.replace(/#(\d+)?/g, (_achado, indice: string | undefined) => {
    if (indice === undefined) {
      return String(valores[proximo++] ?? '#');
    }

    return String(valores[Number(indice) - 1] ?? '#');
  });
}

/** O número como ele se lê: inteiro sem casas, decimal com as casas pedidas. */
export function formatar(valor: number | string, casas?: number): string {
  if (typeof valor === 'string') {
    return valor;
  }
  if (casas !== undefined) {
    return valor.toFixed(casas);
  }
  return Number.isInteger(valor) ? String(valor) : String(Number(valor.toFixed(4)));
}

/**
 * Os passos de uma regra aplicada a um texto, ou `null` se a forma não casar.
 *
 * A comparação é sobre o texto NORMALIZADO — números viram `#` —, então a
 * regra escrita uma vez serve para todos os valores daquela pergunta.
 */
export function passosDaRegra(
  regra: Regra,
  texto: string,
): { readonly passos: readonly Passo[]; readonly valor: string } | null {
  const [forma, formula, substituir, conta, casas] = regra;

  const limpo = texto.replace(/\s+/g, ' ').trim();

  const casamento = paraRegex(forma).exec(limpo);

  if (casamento === null) {
    return null;
  }

  /*
   * Os valores vêm dos GRUPOS do regex, e não de uma varredura do texto.
   *
   * A varredura pegaria também números que não são dados — o `10` de `10⁵`, o
   * `2` de `2ª franja` —, e deslocaria todos os índices. Os grupos são
   * exatamente os `#` da forma, na ordem em que a regra os escreveu.
   */
  const valores = casamento.slice(1).map((grupo) => Number(grupo!.replace(',', '.')));

  /*
   * A conta roda protegida: uma regra que estoura — divisão por zero, raiz de
   * negativo, índice que não existe — simplesmente não se aplica, e a pergunta
   * cai nas etapas genéricas. Antes, o estouro derrubava o exercício inteiro.
   */
  let resultado: number | string;

  try {
    resultado = conta(valores, limpo);
  } catch {
    return null;
  }

  // `undefined` também acontece: uma regra que lê um índice que não existe.
  if (typeof resultado !== 'number' && typeof resultado !== 'string') {
    return null;
  }

  if (typeof resultado === 'number' && !Number.isFinite(resultado)) {
    return null;
  }

  const valor = formatar(resultado, casas);

  /*
   * A linha escrita veste os `#`; a calculada já vem pronta.
   *
   * Uma linha calculada que estoura derruba a regra inteira, como a conta: é
   * melhor cair nas etapas genéricas do que mostrar uma fórmula pela metade.
   */
  let texDaFormula: string;
  let texDaSubstituicao: string;

  try {
    texDaFormula = typeof formula === 'string' ? formula : formula(valores, limpo);
    texDaSubstituicao =
      typeof substituir === 'string' ? vestir(substituir, valores) : substituir(valores, limpo);
  } catch {
    return null;
  }

  return {
    valor,
    passos: [
      { descricao: DESCRICAO_DA_FORMULA, tex: texDaFormula },
      { descricao: DESCRICAO_DA_SUBSTITUICAO, tex: texDaSubstituicao },
      { descricao: DESCRICAO_DA_CONTA, tex: `= ${valor}` },
    ],
  };
}

/**
 * O máximo divisor comum, iterativo e à prova de entrada ruim.
 *
 * A versão recursiva que cada arquivo de regras trazia estourava a pilha com
 * `NaN` — `mdc(NaN, NaN)` nunca chega a zero. E `NaN` aparece de verdade: uma
 * conta com denominador zero, um logaritmo de 1 na base 1. Aqui o laço termina
 * sempre, e o resultado nunca é zero (para não dividir por ele).
 */
export function mdc(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));

  while (y !== 0) {
    const resto = x % y;
    x = y;
    y = resto;
  }

  return x || 1;
}

/**
 * Uma fração irredutível a partir de dois números.
 *
 * Quando os dois não são inteiros — caso de `log(8)/2`, que só é inteiro nos
 * casos que o banco escolhe —, devolve o decimal em vez de fingir uma fração.
 */
export function fracao(numerador: number, denominador: number): string {
  if (!Number.isFinite(numerador) || !Number.isFinite(denominador) || denominador === 0) {
    return '\u2205';
  }

  if (!Number.isInteger(numerador) || !Number.isInteger(denominador)) {
    return String(Number((numerador / denominador).toFixed(4)));
  }

  const divisor = mdc(numerador, denominador);
  const num = numerador / divisor;
  const den = denominador / divisor;

  return den === 1 ? String(num) : `${num}/${den}`;
}

/** n!, para n pequeno — o bastante para anagramas e arranjos do banco. */
export function fatorial(valor: number): number {
  let total = 1;
  for (let i = 2; i <= valor; i += 1) {
    total *= i;
  }
  return total;
}

/** Combinações de `n` tomados `k` a `k`. */
export function combinacao(n: number, k: number): number {
  return fatorial(n) / (fatorial(k) * fatorial(n - k));
}

/** Arranjos de `n` tomados `k` a `k`. */
export function arranjo(n: number, k: number): number {
  return fatorial(n) / fatorial(n - k);
}

/**
 * Quantos anagramas distintos uma palavra tem.
 *
 * A conta é `n!` dividido pelo fatorial de cada letra repetida — e sai da
 * própria palavra, então a regra serve para qualquer uma: `AMOR` dá 24,
 * `BANANA` dá 60.
 */
export function anagramas(palavra: string): number {
  const letras = [...palavra.toUpperCase().replace(/[^A-ZÁÉÍÓÚÂÊÔÃÕÇ]/g, '')];
  const contagem = new Map<string, number>();

  for (const letra of letras) {
    contagem.set(letra, (contagem.get(letra) ?? 0) + 1);
  }

  let total = fatorial(letras.length);
  for (const quantidade of contagem.values()) {
    total /= fatorial(quantidade);
  }

  return total;
}

/** As duas raízes de `a x² + b x + c`, da maior para a menor. */
export function raizes(a: number, b: number, c: number): readonly number[] {
  const delta = b * b - 4 * a * c;

  if (delta < 0) {
    return [];
  }

  const raiz = Math.sqrt(delta);
  const x1 = (-b + raiz) / (2 * a);
  const x2 = (-b - raiz) / (2 * a);

  return [Math.max(x1, x2), Math.min(x1, x2)];
}

/** Procura a primeira regra que casa com o texto. */
export function resolverPorRegras(
  regras: readonly Regra[] | undefined,
  texto: string,
): { readonly passos: readonly Passo[]; readonly valor: string } | null {
  for (const regra of regras ?? []) {
    const resolucao = passosDaRegra(regra, texto);
    if (resolucao !== null) {
      return resolucao;
    }
  }

  return null;
}

/* ───────────────── o avaliador da substituição ───────────────── */

/**
 * Avalia a aritmética de um LaTeX de substituição.
 *
 * ## Por que isto existe
 *
 * O guarda compara a resposta RECALCULADA com o arquivo, e isso pega fórmula
 * errada. Não pega, porém, a substituição errada: uma regra que escreve
 * `y_v = 6 - 8^2/4` e devolve `-1` passa nos dois lados — a conta em JS está
 * certa, e o texto na tela mostra outra coisa. Foi exatamente o que aconteceu
 * com «valor MÍNIMO da função quadrática».
 *
 * Aqui o lado direito da substituição é lido de volta como número. Quando o
 * avaliador não entende a expressão, devolve `null` e a regra é PULADA: o
 * silêncio é melhor que um falso alarme.
 */
export function avaliarLatex(tex: string): number | null {
  // Só o lado direito interessa: `y_v = ...` vira `...`.
  const igual = tex.lastIndexOf('=');
  let expressao = igual === -1 ? tex : tex.slice(igual + 1);

  // Os comandos de formatação saem; os de estrutura viram operadores.
  expressao = expressao
    .replace(/\\left|\\right/g, '')
    .replace(/\\dfrac|\\tfrac/g, '\\frac')
    .replace(/\\cdot|\\times/g, '*')
    .replace(/\\,/g, ' ')
    // `2\pi` é produto: sem o `*`, a concatenação dava `23.14`.
    .replace(/(\d)\s*\\pi/g, `$1*${Math.PI}`)
    .replace(/\\pi/g, String(Math.PI))
    .replace(/\{,\}/g, '.')
    .replace(/\\operatorname\{([a-z]+)\}/g, '$1')
    .replace(/\s+/g, '')
    .trim();

  if (expressao === '') {
    return null;
  }

  // `rac{a}{b}` e `\sqrt{a}` viram chamadas de função que o parser entende.
  let anterior: string;

  do {
    anterior = expressao;
    expressao = expressao
      .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
      .replace(/\\sqrt\{([^{}]*)\}/g, 'Math.sqrt($1)');
  } while (expressao !== anterior);

  // Potência: `x^{2}` e `x^2` viram `Math.pow`.
  expressao = expressao
    .replace(/\{([^{}]*)\}\^\{([^{}]*)\}/g, 'Math.pow($1,$2)')
    .replace(/(\d+(?:\.\d+)?)\^\{([^{}]*)\}/g, 'Math.pow($1,$2)')
    .replace(/(\d+(?:\.\d+)?)\^(\d+)/g, 'Math.pow($1,$2)');

  // O que sobrou de letra é variável: não é conta numérica, e o avaliador sai.
  // `2Math.sqrt(...)` também é produto implícito.
  expressao = expressao.replace(/(\d)(Math\.)/g, '$1*$2');

  if (/[a-zA-Z]/.test(expressao.replace(/Math\.(sqrt|pow|sin|cos|tan|log|exp|abs|PI)/g, ''))) {
    return null;
  }

  if (!/^[\d.+\-*/()\s]|Math\./.test(expressao)) {
    return null;
  }

  try {
    const valor = Number(new Function(`"use strict"; return (${expressao});`)());
    return Number.isFinite(valor) ? valor : null;
  } catch {
    return null;
  }
}

/* ───────────────── utilidades das contas ───────────────── */

export const PI = Math.PI;
export const G = 9.81;
export const K_ELETRICA = 9e9;

/**
 * O raio da Terra escrito como `6.371`.
 *
 * O banco usa o ponto como separador de milhar em alguns números grandes —
 * `6.371 km` quer dizer 6371 km. Ler isso como 6,371 daria um satélite dentro
 * do planeta, e a conta não fecharia com o arquivo.
 */
export const kmEscrito = (valor: number): number => (valor < 1000 ? valor * 1000 : valor);

/** Duas casas como número, para o `formatar`. */
export const casas2 = 2;

export { paraRegex };
