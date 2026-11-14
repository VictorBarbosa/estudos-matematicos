import { Frases } from '@core/treino/textos/texto-trilingue';
import { numeroEscrito } from '@core/treino/textos/numero-escrito';

/**
 * Os enunciados e as dicas do tópico, nas três línguas.
 *
 * A equação vai no `enunciadoTex`, igual em qualquer língua; o texto traz as
 * duas massas disponíveis e diz o que se pede. Os números passam por
 * `numeroEscrito` porque o separador decimal é do idioma.
 */

export const MASSA_DE_PRODUTO: Frases<[string, number, string, number, string]> = {
  pt: (a, massaA, b, massaB, produto) =>
    `Reagem ${numeroEscrito(massaA, 'pt')} g de ${a} com ${numeroEscrito(massaB, 'pt')} g de ` +
    `${b}. Que massa de ${produto} se forma? (em gramas, 2 casas decimais)`,
  fr: (a, massaA, b, massaB, produto) =>
    `On fait réagir ${numeroEscrito(massaA, 'fr')} g de ${a} avec ` +
    `${numeroEscrito(massaB, 'fr')} g de ${b}. Quelle masse de ${produto} se forme ? ` +
    '(en grammes, 2 décimales)',
  en: (a, massaA, b, massaB, produto) =>
    `${numeroEscrito(massaA, 'en')} g of ${a} react with ${numeroEscrito(massaB, 'en')} g of ` +
    `${b}. What mass of ${produto} forms? (in grams, 2 decimal places)`,
};

/**
 * A dica diz a MEDIDA, não a resposta.
 *
 * O erro do tópico é escolher o limitante pela massa, ou pelos mols sem
 * dividir pelo coeficiente. Nomear a razão certa é o que ensina; dizer qual
 * reagente limita seria responder a pergunta.
 */
export const DICA_LIMITANTE: Frases<[string, number, string, number, string]> = {
  pt: (a, _ma, b) =>
    `Não é o mais leve nem o de menos massa: compare quantas «receitas» cada um alcança — ` +
    `mols de ${a} e de ${b}, cada um DIVIDIDO pelo seu coeficiente.`,
  fr: (a, _ma, b) =>
    'Ce n’est ni le plus léger ni celui dont la masse est la plus faible : comparez combien ' +
    `de « recettes » chacun atteint — moles de ${a} et de ${b}, chacune DIVISÉE par son ` +
    'coefficient.',
  en: (a, _ma, b) =>
    'It is neither the lighter one nor the one with less mass: compare how many “batches” ' +
    `each reaches — moles of ${a} and of ${b}, each DIVIDED by its coefficient.`,
};

export const MASSA_QUE_SOBRA: Frases<[string, number, string, number, string]> = {
  pt: (a, massaA, b, massaB) =>
    `Reagem ${numeroEscrito(massaA, 'pt')} g de ${a} com ${numeroEscrito(massaB, 'pt')} g de ` +
    `${b}. Que massa do reagente em excesso sobra? (em gramas, 2 casas decimais)`,
  fr: (a, massaA, b, massaB) =>
    `On fait réagir ${numeroEscrito(massaA, 'fr')} g de ${a} avec ` +
    `${numeroEscrito(massaB, 'fr')} g de ${b}. Quelle masse du réactif en excès reste-t-il ? ` +
    '(en grammes, 2 décimales)',
  en: (a, massaA, b, massaB) =>
    `${numeroEscrito(massaA, 'en')} g of ${a} react with ${numeroEscrito(massaB, 'en')} g of ` +
    `${b}. What mass of the excess reactant is left over? (in grams, 2 decimal places)`,
};

export const DICA_SOBRA: Frases<[string, number, string, number, string]> = {
  pt: () =>
    'Ache primeiro o limitante. O que sobra é a massa do OUTRO menos o que ele gastou nas ' +
    'receitas que deram certo.',
  fr: () =>
    'Trouvez d’abord le réactif limitant. Ce qui reste est la masse de l’AUTRE moins ce qu’il ' +
    'a consommé dans les recettes réalisées.',
  en: () =>
    'Find the limiting reactant first. What is left is the OTHER one’s mass minus what it ' +
    'spent on the batches that happened.',
};

export const RENDIMENTO: Frases<[string, number, number]> = {
  pt: (produto, teorica, obtida) =>
    `Uma reação poderia dar ${numeroEscrito(teorica, 'pt')} g de ${produto}, e na bancada ` +
    `saíram ${numeroEscrito(obtida, 'pt')} g. Qual é o rendimento percentual? (2 casas decimais)`,
  fr: (produto, teorica, obtida) =>
    `Une réaction pourrait donner ${numeroEscrito(teorica, 'fr')} g de ${produto}, et à la ` +
    `paillasse on a obtenu ${numeroEscrito(obtida, 'fr')} g. Quel est le rendement en ` +
    'pourcentage ? (2 décimales)',
  en: (produto, teorica, obtida) =>
    `A reaction could give ${numeroEscrito(teorica, 'en')} g of ${produto}, and at the bench ` +
    `${numeroEscrito(obtida, 'en')} g came out. What is the percent yield? (2 decimal places)`,
};

export const DICA_RENDIMENTO: Frases<[string, number, number]> = {
  pt: () =>
    'O obtido vai em cima e o teórico embaixo: compara-se o que saiu com o que era possível. ' +
    'O resultado é menor que 100%.',
  fr: () =>
    'L’obtenu va au numérateur et le théorique au dénominateur : on compare ce qui est sorti ' +
    'à ce qui était possible. Le résultat est inférieur à 100 %.',
  en: () =>
    'The obtained goes on top and the theoretical below: you compare what came out with what ' +
    'was possible. The result is below 100%.',
};
