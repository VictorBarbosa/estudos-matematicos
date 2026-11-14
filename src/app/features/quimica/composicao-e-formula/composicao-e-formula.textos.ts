import { Frases } from '@core/treino/textos/texto-trilingue';
import { numeroEscrito } from '@core/treino/textos/numero-escrito';

/**
 * Os enunciados e as dicas do tópico, nas três línguas.
 *
 * As fórmulas não se traduzem — `H₂O` é H₂O em qualquer língua —, e por isso
 * os moldes aqui são curtos: o que varia é o que se pede. Os números passam
 * por `numeroEscrito`, porque o separador decimal é do idioma.
 */

export const PERCENTUAL: Frases<[string, string]> = {
  pt: (formula, elemento) =>
    `Qual é a porcentagem em massa de ${elemento} em ${formula}? (em %, 2 casas decimais)`,
  fr: (formula, elemento) =>
    `Quel est le pourcentage massique de ${elemento} dans ${formula} ? (en %, 2 décimales)`,
  en: (formula, elemento) =>
    `What is the mass percentage of ${elemento} in ${formula}? (in %, 2 decimal places)`,
};

/**
 * A dica diz onde entra o índice, que é onde se erra.
 *
 * Quem erra aqui não erra a divisão: esquece que dois hidrogênios pesam duas
 * vezes, e põe a massa atômica crua em cima.
 */
export const DICA_PERCENTUAL: Frases<[string, string]> = {
  pt: (_formula, elemento) =>
    `Em cima vai a massa de TODOS os átomos de ${elemento} da fórmula — massa atômica vezes o ` +
    'índice. Embaixo, a massa molar inteira.',
  fr: (_formula, elemento) =>
    `Au numérateur, la masse de TOUS les atomes de ${elemento} de la formule — masse atomique ` +
    'fois l’indice. Au dénominateur, la masse molaire entière.',
  en: (_formula, elemento) =>
    `On top goes the mass of ALL the ${elemento} atoms in the formula — atomic mass times the ` +
    'subscript. Below, the whole molar mass.',
};

export const MASSA_MOLAR: Frases<[string]> = {
  pt: (formula) => `Qual é a massa molar de ${formula}? (em g/mol, 2 casas decimais)`,
  fr: (formula) => `Quelle est la masse molaire de ${formula} ? (en g/mol, 2 décimales)`,
  en: (formula) => `What is the molar mass of ${formula}? (in g/mol, 2 decimal places)`,
};

export const DICA_MASSA_MOLAR: Frases<[string]> = {
  pt: () =>
    'Some a massa atômica de cada elemento multiplicada pelo seu índice. O índice conta ' +
    'átomos, e por isso multiplica.',
  fr: () =>
    'Additionnez la masse atomique de chaque élément multipliée par son indice. L’indice ' +
    'compte des atomes, donc il multiplie.',
  en: () =>
    'Add each element’s atomic mass times its subscript. The subscript counts atoms, which is ' +
    'why it multiplies.',
};

/**
 * A composição chega como símbolos e porcentagens separados, e não como texto
 * pronto, porque o separador decimal é do idioma: montar a lista em português
 * levaria vírgulas para o inglês.
 */
function listaDeComposicao(
  simbolos: readonly string[],
  percentuais: readonly number[],
  idioma: 'pt' | 'fr' | 'en',
  ligacao: string,
): string {
  return simbolos
    .map(
      (simbolo, indice) => `${numeroEscrito(percentuais[indice]!, idioma)}% ${ligacao} ${simbolo}`,
    )
    .join(', ');
}

export const EMPIRICA: Frases<[readonly string[], readonly number[]]> = {
  pt: (simbolos, percentuais) =>
    `Um composto tem a composição ${listaDeComposicao(simbolos, percentuais, 'pt', 'de')}. ` +
    'Qual é a sua fórmula empírica? (escreva como H2O)',
  fr: (simbolos, percentuais) =>
    `Un composé a la composition ${listaDeComposicao(simbolos, percentuais, 'fr', 'de')}. ` +
    'Quelle est sa formule empirique ? (écrivez comme H2O)',
  en: (simbolos, percentuais) =>
    `A compound has the composition ${listaDeComposicao(simbolos, percentuais, 'en', 'of')}. ` +
    'What is its empirical formula? (write it like H2O)',
};

/**
 * A dica dá o trajeto inteiro, e o passo que ninguém lembra.
 *
 * Dividir pelo menor é o que transforma mols em proporção; multiplicar para
 * inteirar é o passo seguinte, e é o que falta quando a resposta sai com
 * «um e meio» de alguma coisa.
 */
export const DICA_EMPIRICA: Frases<[readonly string[], readonly number[]]> = {
  pt: () =>
    'Finja 100 g: cada porcentagem vira gramas. Passe cada um a mols, divida todos pelo MENOR ' +
    'e, se sobrar meio, multiplique todos por dois.',
  fr: () =>
    'Supposez 100 g : chaque pourcentage devient des grammes. Convertissez-les en moles, ' +
    'divisez tout par le PLUS PETIT et, s’il reste un demi, multipliez tout par deux.',
  en: () =>
    'Pretend 100 g: each percentage becomes grams. Turn each into moles, divide them all by the ' +
    'SMALLEST and, if a half is left over, multiply everything by two.',
};

export const MOLECULAR: Frases<[string, number]> = {
  pt: (empirica, massaMolar) =>
    `A fórmula empírica de um composto é ${empirica} e a sua massa molar é ` +
    `${numeroEscrito(massaMolar, 'pt')} g/mol. Qual é a fórmula molecular? (escreva como H2O)`,
  fr: (empirica, massaMolar) =>
    `La formule empirique d’un composé est ${empirica} et sa masse molaire est ` +
    `${numeroEscrito(massaMolar, 'fr')} g/mol. Quelle est la formule moléculaire ? ` +
    '(écrivez comme H2O)',
  en: (empirica, massaMolar) =>
    `A compound’s empirical formula is ${empirica} and its molar mass is ` +
    `${numeroEscrito(massaMolar, 'en')} g/mol. What is the molecular formula? (write it like H2O)`,
};

export const DICA_MOLECULAR: Frases<[string, number]> = {
  pt: () =>
    'Divida a massa molar pela massa da fórmula empírica: o resultado é um número inteiro, e é ' +
    'por ele que todos os índices se multiplicam.',
  fr: () =>
    'Divisez la masse molaire par celle de la formule empirique : le résultat est un entier, et ' +
    'c’est par lui que tous les indices se multiplient.',
  en: () =>
    'Divide the molar mass by the empirical formula’s mass: the result is a whole number, and it ' +
    'is what every subscript gets multiplied by.',
};
