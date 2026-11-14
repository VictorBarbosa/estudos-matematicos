import { Frases } from '@core/treino/textos/texto-trilingue';

/**
 * Os nomes dos compostos, nas três línguas — e é por isso que este arquivo é
 * grande.
 *
 * Nomenclatura É língua, diferente de todo o resto do site: uma fórmula não se
 * traduz, mas o nome dela se traduz três vezes. E a ORDEM também muda: em
 * português e francês o ânion vem primeiro («cloreto de sódio», «chlorure de
 * sodium»), em inglês vem por último («sodium chloride»). Guardar isso num
 * molde por língua é a única forma de não escrever três gerações de exercício.
 *
 * As tabelas ficam aqui, e não em `core`, de propósito: o núcleo calcula e não
 * fala línguas. O que o núcleo faz neste tópico é a fórmula a partir das
 * cargas e o nox a partir da soma zero.
 */

interface NomeTrilingue {
  readonly pt: string;
  readonly fr: string;
  readonly en: string;
}

/** O nome do metal, que em português e francês vem depois do «de». */
export const NOME_DO_CATION: Readonly<Record<string, NomeTrilingue>> = {
  Li: { pt: 'lítio', fr: 'lithium', en: 'lithium' },
  Na: { pt: 'sódio', fr: 'sodium', en: 'sodium' },
  K: { pt: 'potássio', fr: 'potassium', en: 'potassium' },
  Mg: { pt: 'magnésio', fr: 'magnésium', en: 'magnesium' },
  Ca: { pt: 'cálcio', fr: 'calcium', en: 'calcium' },
  Ba: { pt: 'bário', fr: 'baryum', en: 'barium' },
  Al: { pt: 'alumínio', fr: 'aluminium', en: 'aluminium' },
  Zn: { pt: 'zinco', fr: 'zinc', en: 'zinc' },
  Ag: { pt: 'prata', fr: 'argent', en: 'silver' },
  Fe: { pt: 'ferro', fr: 'fer', en: 'iron' },
  Cu: { pt: 'cobre', fr: 'cuivre', en: 'copper' },
  Pb: { pt: 'chumbo', fr: 'plomb', en: 'lead' },
  Sn: { pt: 'estanho', fr: 'étain', en: 'tin' },
};

/** O nome do ânion, com a terminação que o identifica em cada língua. */
export const NOME_DO_ANION: Readonly<Record<string, NomeTrilingue>> = {
  F: { pt: 'fluoreto', fr: 'fluorure', en: 'fluoride' },
  Cl: { pt: 'cloreto', fr: 'chlorure', en: 'chloride' },
  Br: { pt: 'brometo', fr: 'bromure', en: 'bromide' },
  I: { pt: 'iodeto', fr: 'iodure', en: 'iodide' },
  O: { pt: 'óxido', fr: 'oxyde', en: 'oxide' },
  S: { pt: 'sulfeto', fr: 'sulfure', en: 'sulfide' },
  N: { pt: 'nitreto', fr: 'nitrure', en: 'nitride' },
};

const ROMANOS: Readonly<Record<number, string>> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };

/**
 * O nome do composto, montado numa língua.
 *
 * O numeral romano entra só quando o metal tem mais de uma carga possível —
 * é o que a nomenclatura de Stock pede, e é informação necessária: «cloreto de
 * ferro» não diz se é FeCl₂ ou FeCl₃.
 */
export function nomeDoComposto(
  cation: string,
  anion: string,
  carga: number,
  variavel: boolean,
  idioma: 'pt' | 'fr' | 'en',
): string {
  const metal = NOME_DO_CATION[cation]![idioma];
  const naoMetal = NOME_DO_ANION[anion]![idioma];
  const romano = variavel ? `(${ROMANOS[carga]})` : '';

  return idioma === 'en' ? `${metal}${romano} ${naoMetal}` : `${naoMetal} de ${metal}${romano}`;
}

export const FORMULA_DO_NOME: Frases<[string, string, number, boolean]> = {
  pt: (cation, anion, carga, variavel) =>
    `Qual é a fórmula do ${nomeDoComposto(cation, anion, carga, variavel, 'pt')}? ` +
    '(escreva como NaCl)',
  fr: (cation, anion, carga, variavel) =>
    `Quelle est la formule du ${nomeDoComposto(cation, anion, carga, variavel, 'fr')} ? ` +
    '(écrivez comme NaCl)',
  en: (cation, anion, carga, variavel) =>
    `What is the formula of ${nomeDoComposto(cation, anion, carga, variavel, 'en')}? ` +
    '(write it like NaCl)',
};

/**
 * A dica diz onde está a carga, que é o que o nome esconde ou revela.
 *
 * Com metal de carga fixa, a carga vem do grupo; com metal de carga variável,
 * ela está escrita no numeral romano — e é para isso que o numeral existe.
 */
export const DICA_FORMULA: Frases<[string, string, number, boolean]> = {
  pt: (_cation, _anion, _carga, variavel) =>
    variavel
      ? 'O numeral romano É a carga do metal. Com ela e a do ânion, cruze os índices e reduza.'
      : 'A carga do metal vem do grupo dele na tabela. Cruze com a do ânion e reduza.',
  fr: (_cation, _anion, _carga, variavel) =>
    variavel
      ? 'Le chiffre romain EST la charge du métal. Avec celle de l’anion, croisez les indices ' +
        'et réduisez.'
      : 'La charge du métal vient de son groupe dans le tableau. Croisez avec celle de ' +
        'l’anion et réduisez.',
  en: (_cation, _anion, _carga, variavel) =>
    variavel
      ? 'The Roman numeral IS the metal’s charge. With the anion’s, cross the subscripts and ' +
        'reduce.'
      : 'The metal’s charge comes from its group in the table. Cross it with the anion’s and ' +
        'reduce.',
};

export const NOX: Frases<[string, string]> = {
  pt: (simbolo, formula) => `Qual é o número de oxidação do ${simbolo} em ${formula}?`,
  fr: (simbolo, formula) => `Quel est le nombre d’oxydation du ${simbolo} dans ${formula} ?`,
  en: (simbolo, formula) => `What is the oxidation number of ${simbolo} in ${formula}?`,
};

/** A dica dá a regra que faz a conta fechar, e a âncora. */
export const DICA_NOX: Frases<[string, string]> = {
  pt: () =>
    'A soma dos nox de um composto neutro é ZERO. Comece pelo elemento de nox conhecido — ' +
    'oxigênio −2, halogênio −1 — e não esqueça de multiplicar cada um pelo seu índice.',
  fr: () =>
    'La somme des nombres d’oxydation d’un composé neutre est ZÉRO. Commencez par l’élément ' +
    'au nox connu — oxygène −2, halogène −1 — et multipliez chacun par son indice.',
  en: () =>
    'The oxidation numbers of a neutral compound add up to ZERO. Start from the element whose ' +
    'number is known — oxygen −2, halogen −1 — and multiply each by its subscript.',
};

export const INDICE: Frases<[string, string, number, boolean]> = {
  pt: (cation, anion, carga, variavel) =>
    `Na fórmula do ${nomeDoComposto(cation, anion, carga, variavel, 'pt')}, qual é o índice ` +
    `do ${anion}?`,
  fr: (cation, anion, carga, variavel) =>
    `Dans la formule du ${nomeDoComposto(cation, anion, carga, variavel, 'fr')}, quel est ` +
    `l’indice du ${anion} ?`,
  en: (cation, anion, carga, variavel) =>
    `In the formula of ${nomeDoComposto(cation, anion, carga, variavel, 'en')}, what is the ` +
    `subscript of ${anion}?`,
};

export const DICA_INDICE: Frases<[string, string, number, boolean]> = {
  pt: () =>
    'Monte a fórmula primeiro: cruze as cargas e reduza. O índice pedido é o que sobra depois ' +
    'da redução, e vale 1 quando não se escreve.',
  fr: () =>
    'Écrivez d’abord la formule : croisez les charges et réduisez. L’indice demandé est celui ' +
    'qui reste après la réduction, et vaut 1 quand il ne s’écrit pas.',
  en: () =>
    'Build the formula first: cross the charges and reduce. The subscript asked for is what is ' +
    'left after reducing, and it is 1 when it is not written.',
};
