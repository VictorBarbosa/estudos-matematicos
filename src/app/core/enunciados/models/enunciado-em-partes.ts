/**
 * O enunciado em partes: texto corrido de um lado, matemática do outro.
 *
 * ## O problema
 *
 * O enunciado do banco é texto puro, e a matemática nele foi escrita como se
 * escreve num teclado: `f(x) = (x + 1)/(x − 2)`. Na tela isso aparece com
 * parênteses e barra, e a barra engana — «(x + 1)/(x − 2)» lê-se como divisão
 * de duas quantias, não como a fração que a questão pede. Uma fração precisa ser
 * DESENHADA como fração.
 *
 * ## Como funciona
 *
 * O texto é varrido em busca de expressões — átomos ligados por operadores — e
 * cada expressão vira LaTeX. O que não for expressão continua texto, e continua
 * quebrando linha como texto: transformar a frase inteira em fórmula faria o
 * parágrafo virar um bloco só, que estoura a tela do celular.
 *
 * ## O que NÃO é fórmula
 *
 * Unidade não é fração: `km/h`, `m/s`, `mol/L`, `J/(kg·K)` continuam escritas
 * como estão. A distinção sai de uma lista de símbolos de unidade — sem ela,
 * metade dos enunciados de Física viraria fração.
 */

/** Um pedaço do enunciado: ou texto, ou uma expressão para o KaTeX. */
export type ParteDoEnunciado =
  | { readonly tipo: 'texto'; readonly valor: string }
  | {
      readonly tipo: 'math';
      readonly tex: string;
      /** O trecho original, que a fórmula substitui na tela. */
      readonly origem: string;
    };

/* ───────────────────────── o que é um átomo ───────────────────────── */

/**
 * As funções que podem aparecer com parênteses.
 *
 * A lista é fechada de propósito: sem ela, `domínio(x)` casaria como função, e
 * qualquer palavra antes de um parêntese viraria fórmula.
 */
const FUNCOES = [
  'arcsen',
  'arctan',
  'sen',
  'cos',
  'tan',
  'tg',
  'ln',
  'log',
  'lim',
  'det',
  'max',
  'min',
  'exp',
];

/** Sobrescritos tipográficos, como em `x²` e `10⁵`. */
const SOBRESCRITOS: Readonly<Record<string, string>> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
};

const SOBRESCRITO = '[\u00B9\u00B2\u00B3\u2070\u2074-\u2079]';
const POTENCIA = `(?:${SOBRESCRITO}|\\^\\d+)`;
const GRUPO = '\\([^()]{1,40}\\)';
const NUMERO = `\\d+(?:[.,]\\d+)?${POTENCIA}?`;
const LETRA = '[A-Za-z]';
const RAIZ = '√\\s*(?:\\([^()]{1,40}\\)|[A-Za-z0-9])';
const MODULO = '\\|[^|,\\[\\]]{1,20}\\|';

const ATOMO = [
  RAIZ,
  MODULO,
  GRUPO,
  // O produto implícito vem antes do número: a alternância casa a PRIMEIRA
  // opção, e `5` venceria `5x` — o que quebrava `x² − 5x` em dois pedaços.
  `\\d+(?:[.,]\\d+)?${LETRA}${POTENCIA}?`,
  NUMERO,
  `\\b(?:${FUNCOES.join('|')})\\s*\\([^()]*\\)`,
  `\\b${LETRA}${POTENCIA}?(?:\\s*\\([^()]*\\))?`,
].join('|');

const OPERADOR = '\\s*[-+−·×*/^=<>≤≥]\\s*';
const ATOMO_AGRUPADO = `(?:${ATOMO})`;
const EXPRESSAO = new RegExp(`${ATOMO_AGRUPADO}(?:${OPERADOR}${ATOMO_AGRUPADO})*`, 'g');

/** O que faz uma expressão merecer ser desenhada, e não deixada como texto. */
const SINAL_FORTE = /[/^=≤≥√]|[\u00B9\u00B2\u00B3\u2070\u2074-\u2079]/;

/* ───────────────────────── o que não é fórmula ───────────────────────── */

/**
 * Símbolos de unidade.
 *
 * `km/h` tem barra e dois «átomos» — mas não é fração, é quilômetro por hora.
 * Sem esta lista, a Física inteira viraria fração.
 */
const UNIDADES = new Set([
  'km',
  'hm',
  'dam',
  'dm',
  'cm',
  'mm',
  'nm',
  'μm',
  'um',
  'm',
  'kg',
  'mg',
  'g',
  't',
  's',
  'ms',
  'min',
  'h',
  'd',
  'L',
  'l',
  'mL',
  'ml',
  'mol',
  'mmol',
  'N',
  'kN',
  'J',
  'kJ',
  'W',
  'kW',
  'MW',
  'K',
  'Pa',
  'kPa',
  'MPa',
  'V',
  'kV',
  'mV',
  'A',
  'mA',
  'Ω',
  'Hz',
  'kHz',
  'MHz',
  'C',
  'T',
  'F',
  'μF',
  'nF',
  'pF',
  'Wb',
  'rad',
  'sr',
  'cd',
  'lm',
  'lx',
  'eV',
  'keV',
  'MeV',
  'atm',
  'cal',
  'kcal',
  'rpm',
  'psi',
  'bar',
  'dB',
  'u',
  'UA',
]);

/** A unidade composta: `m/s`, `mol/L`, `m²`, `cm³`. */
const UNIDADE_COMPOSTA = /^[A-Za-zμΩ²³/·]+$/;

/** Este átomo é uma unidade, e não uma grandeza da questão? */
function ehUnidade(expressao: string): boolean {
  const limpo = expressao.replace(/\s/g, '');
  const comPotencia = limpo.replace(/[\u00B9\u00B2\u00B3\u2070\u2074-\u2079]/g, '');
  const base = comPotencia.replace(/²|³|\^/g, '');

  if (UNIDADES.has(base) || UNIDADES.has(comPotencia)) {
    return true;
  }

  // Duas letras ou mais seguidas nunca são variável deste banco: são unidade.
  return UNIDADE_COMPOSTA.test(limpo) && !FUNCOES.includes(base) && base.length >= 2;
}

/* ───────────────────────── a conversão ───────────────────────── */

/** Traduz os sobrescritos tipográficos e o acento de menos para LaTeX. */
function normalizar(texto: string): string {
  let saida = texto.replace(/−/g, '-').replace(/×/g, '\\times ').replace(/·/g, '\\cdot ');

  saida = saida.replace(
    new RegExp(SOBRESCRITO, 'g'),
    (caractere) => `^{${SOBRESCRITOS[caractere]}}`,
  );
  saida = saida.replace(/\^(\d+)/g, '^{$1}');

  return saida;
}

/** A vírgula decimal, que no LaTeX precisa de chaves para não virar pausa. */
const decimal = (texto: string): string => texto.replace(/(\d),(\d)/g, '$1{,}$2');

/** As funções viram operador de LaTeX, e não letra seguida de parêntese. */
function nomearFuncoes(expressao: string): string {
  return expressao.replace(
    new RegExp(`\\b(${FUNCOES.join('|')})\\b`, 'g'),
    (nome: string) => `\\operatorname{${nome}}`,
  );
}

/** Converte um átomo isolado. */
function converterAtomo(atomo: string): string {
  const limpo = atomo.trim();

  if (limpo.startsWith('√')) {
    const dentro = limpo.slice(1).trim();
    const semParen = dentro.startsWith('(') ? dentro.slice(1, -1) : dentro;
    const tokens = [...semParen.matchAll(new RegExp(TOKEN.source, 'g'))].map((achado) => achado[0]);
    return `\\sqrt{${converterTokens(tokens)}}`;
  }

  if (limpo.startsWith('|') && limpo.endsWith('|')) {
    const tokens = [...limpo.slice(1, -1).matchAll(new RegExp(TOKEN.source, 'g'))].map(
      (achado) => achado[0],
    );
    return `\\left|${converterTokens(tokens)}\\right|`;
  }

  if (limpo.startsWith('(') && limpo.endsWith(')')) {
    const tokens = [...limpo.slice(1, -1).matchAll(new RegExp(TOKEN.source, 'g'))].map(
      (achado) => achado[0],
    );
    return `\\left(${converterTokens(tokens)}\\right)`;
  }

  return decimal(normalizar(limpo));
}

/** Um token: ou um átomo, ou um operador. */
const TOKEN = new RegExp(`(${ATOMO_AGRUPADO})|([-+−·×*/^=<>≤≥:])`, 'g');

/** Os operadores que aparecem na tela como símbolo. */
const SIMBOLO: Readonly<Record<string, string>> = {
  '−': '-',
  '×': '\\times',
  '·': '\\cdot',
  '≤': '\\leq',
  '≥': '\\geq',
};

/**
 * Converte a expressão para LaTeX, token a token.
 *
 * A divisão é o único operador que muda a ESTRUTURA: quando o token é `/`, o
 * átomo anterior e o seguinte viram numerador e denominador de uma fração
 * desenhada. Todo o resto vira símbolo.
 *
 * A montagem por tokens substituiu uma primeira versão que partia a string em
 * somas e produtos: ela errava em `y = √x`, porque a raiz ficava num pedaço que
 * não era átomo, e em `5x`, porque não havia operador entre o número e a letra.
 */
function converterTokens(tokens: readonly string[]): string {
  const saida: string[] = [];

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i]!;

    if (token === '/') {
      const numerador = saida.pop();
      const proximo = tokens[i + 1];

      if (numerador === undefined || proximo === undefined) {
        continue;
      }

      saida.push(`\\frac{${numerador}}{${converterAtomo(proximo)}}`);
      i += 1;
      continue;
    }

    if (token === '=' || token === '^' || token === '*') {
      saida.push(SIMBOLO[token] ?? token);
      continue;
    }

    if (Object.hasOwn(SIMBOLO, token)) {
      saida.push(SIMBOLO[token]!);
      continue;
    }

    if (/^[-+<>:]$/.test(token)) {
      saida.push(token);
      continue;
    }

    saida.push(converterAtomo(token));
  }

  return saida.join(' ');
}

/** O LaTeX de uma expressão já reconhecida. */
export function latexDaExpressao(expressao: string): string {
  const tokens = [...expressao.matchAll(new RegExp(TOKEN.source, 'g'))].map((achado) => achado[0]);
  return nomearFuncoes(converterTokens(tokens));
}

/* ───────────────────────── a varredura ───────────────────────── */

/**
 * Corta o enunciado em texto e expressões.
 *
 * Uma expressão só é aceita quando tem sinal forte — barra, potência, raiz ou
 * igualdade. Sem isso, toda palavra de uma letra (`a`, `e`) viraria fórmula, e
 * o enunciado sairia picado.
 */
export function partesDoEnunciado(texto: string): readonly ParteDoEnunciado[] {
  const partes: ParteDoEnunciado[] = [];
  let ultimoFim = 0;

  const varrer = new RegExp(EXPRESSAO.source, 'g');
  let achado: RegExpExecArray | null;

  while ((achado = varrer.exec(texto)) !== null) {
    const bruto = achado[0];

    if (bruto.trim().length < 2 || !SINAL_FORTE.test(bruto)) {
      continue;
    }

    // Unidade não é conta: `km/h`, `J/(kg·K)`, `m/s²`.
    if (bruto.split('/').some((fator: string) => ehUnidade(fator))) {
      continue;
    }

    if (achado.index > ultimoFim) {
      partes.push({ tipo: 'texto', valor: texto.slice(ultimoFim, achado.index) });
    }

    partes.push({ tipo: 'math', tex: latexDaExpressao(bruto), origem: bruto });
    ultimoFim = achado.index + bruto.length;
  }

  if (ultimoFim < texto.length) {
    partes.push({ tipo: 'texto', valor: texto.slice(ultimoFim) });
  }

  return partes.length === 0 ? [{ tipo: 'texto', valor: texto }] : partes;
}
