import { Frases } from '@core/treino/textos/texto-trilingue';
import { numeroEscrito } from '@core/treino/textos/numero-escrito';

/**
 * Os enunciados e as dicas do tópico, nas três línguas.
 *
 * A substância entra pelo nome, e não só pela fórmula, porque é assim que o
 * enunciado de química se lê: «168 g de ferro», não «168 g de Fe». O nome muda
 * com a língua — ferro, fer, iron — e por isso ele chega como argumento
 * traduzido, não interpolado de uma lista única.
 */

export const MOLS_DE_MASSA: Frases<[string, number]> = {
  pt: (substancia, massa) =>
    `Quantos mols há em ${numeroEscrito(massa, 'pt')} g de ${substancia}? (2 casas decimais)`,
  fr: (substancia, massa) =>
    `Combien de moles y a-t-il dans ${numeroEscrito(massa, 'fr')} g de ${substancia} ? (2 décimales)`,
  en: (substancia, massa) =>
    `How many moles are there in ${numeroEscrito(massa, 'en')} g of ${substancia}? (2 decimal places)`,
};

export const DICA_MOLS_DE_MASSA: Frases<[string, number]> = {
  pt: (_s, massa) =>
    `A massa molar diz quanto pesa UM mol. Divida os ${numeroEscrito(massa, 'pt')} g por ela ` +
    'para saber quantos cabem.',
  fr: (_s, massa) =>
    `La masse molaire dit combien pèse UNE mole. Divisez les ${numeroEscrito(massa, 'fr')} g ` +
    'par elle pour savoir ' +
    'combien il y en a.',
  en: (_s, massa) =>
    `The molar mass says what ONE mole weighs. Divide the ${numeroEscrito(massa, 'en')} g by ` +
    'it to see how many fit.',
};

export const MASSA_DE_MOLS: Frases<[string, number]> = {
  pt: (substancia, mols) =>
    `Qual é a massa de ${numeroEscrito(mols, 'pt')} mol de ${substancia}, em gramas? (2 casas decimais)`,
  fr: (substancia, mols) =>
    `Quelle est la masse de ${numeroEscrito(mols, 'fr')} mol de ${substancia}, en grammes ? (2 décimales)`,
  en: (substancia, mols) =>
    `What is the mass of ${numeroEscrito(mols, 'en')} mol of ${substancia}, in grams? (2 decimal places)`,
};

export const DICA_MASSA_DE_MOLS: Frases<[string, number]> = {
  pt: (_s, mols) => `Cada mol pesa a massa molar: multiplique-a por ${numeroEscrito(mols, 'pt')}.`,
  fr: (_s, mols) =>
    `Chaque mole pèse la masse molaire : multipliez-la par ${numeroEscrito(mols, 'fr')}.`,
  en: (_s, mols) => `Each mole weighs the molar mass: multiply it by ${numeroEscrito(mols, 'en')}.`,
};

export const MASSA_MOLAR: Frases<[string, string]> = {
  pt: (substancia, formula) =>
    `Qual é a massa molar de ${substancia} (${formula}), em g/mol? (2 casas decimais)`,
  fr: (substancia, formula) =>
    `Quelle est la masse molaire de ${substancia} (${formula}), en g/mol ? (2 décimales)`,
  en: (substancia, formula) =>
    `What is the molar mass of ${substancia} (${formula}), in g/mol? (2 decimal places)`,
};

/**
 * A dica diz que o índice multiplica — que é o erro número um do tópico.
 *
 * Quem soma as massas atômicas ignorando os índices acerta na água e erra em
 * tudo o mais. Dizer isso na dica vale mais que dar a fórmula.
 */
export const DICA_MASSA_MOLAR: Frases<[string, string]> = {
  pt: (_s, formula) =>
    `Some as massas atômicas de ${formula}, mas cada uma VEZES o seu índice — o número ` +
    'pequeno conta átomos.',
  fr: (_s, formula) =>
    `Additionnez les masses atomiques de ${formula}, mais chacune MULTIPLIÉE par son indice — ` +
    'le petit chiffre compte des atomes.',
  en: (_s, formula) =>
    `Add the atomic masses in ${formula}, but each one TIMES its subscript — the small number ` +
    'counts atoms.',
};

export const PARTICULAS: Frases<[string, number]> = {
  pt: (substancia, mols) =>
    `Quantas moléculas de ${substancia} há em ${numeroEscrito(mols, 'pt')} mol? Responda o ` +
    'coeficiente da notação ' +
    'científica, com duas casas decimais (a potência é 10²³).',
  fr: (substancia, mols) =>
    `Combien de molécules de ${substancia} y a-t-il dans ${numeroEscrito(mols, 'fr')} mol ? ` +
    'Donnez le coefficient ' +
    'de la notation scientifique, avec deux décimales (la puissance est 10²³).',
  en: (substancia, mols) =>
    `How many molecules of ${substancia} are there in ${numeroEscrito(mols, 'en')} mol? Give ` +
    'the coefficient of the ' +
    'scientific notation, to two decimal places (the power is 10²³).',
};

export const DICA_PARTICULAS: Frases<[string, number]> = {
  pt: (_s, mols) =>
    `Um mol tem 6,022 × 10²³ partículas. Multiplique esse 6,022 por ${numeroEscrito(mols, 'pt')} ` +
    'e a potência fica.',
  fr: (_s, mols) =>
    `Une mole contient 6,022 × 10²³ particules. Multipliez ce 6,022 par ${numeroEscrito(mols, 'fr')} ` +
    '; la puissance ' +
    'reste.',
  en: (_s, mols) =>
    `One mole has 6.022 × 10²³ particles. Multiply that 6.022 by ${numeroEscrito(mols, 'en')}; ` +
    'the power stays.',
};
