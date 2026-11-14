import { Frases } from '@core/treino/textos/texto-trilingue';
import { numeroEscrito } from '@core/treino/textos/numero-escrito';

/**
 * Os enunciados e as dicas do tópico, nas três línguas.
 *
 * O enunciado traz a equação só no `enunciadoTex`, que é igual em qualquer
 * língua — o texto diz o que se pede. Por isso os moldes aqui são curtos, e o
 * que varia neles são as fórmulas, que também não se traduzem.
 *
 * Os números passam por `numeroEscrito` porque o separador decimal é do
 * idioma: vírgula em português e francês, ponto em inglês.
 */

export const MASSA_DE_PRODUTO: Frases<[string, string, number]> = {
  pt: (deFormula, paraFormula, massa) =>
    `Pela equação acima, que massa de ${paraFormula} se obtém a partir de ` +
    `${numeroEscrito(massa, 'pt')} g de ${deFormula}? (em gramas, 2 casas decimais)`,
  fr: (deFormula, paraFormula, massa) =>
    `D’après l’équation ci-dessus, quelle masse de ${paraFormula} obtient-on à partir de ` +
    `${numeroEscrito(massa, 'fr')} g de ${deFormula} ? (en grammes, 2 décimales)`,
  en: (deFormula, paraFormula, massa) =>
    `From the equation above, what mass of ${paraFormula} is obtained from ` +
    `${numeroEscrito(massa, 'en')} g of ${deFormula}? (in grams, 2 decimal places)`,
};

/**
 * A dica nomeia o trajeto inteiro, e não a fórmula.
 *
 * O que falta a quem erra não é uma fórmula: é perceber que a proporção da
 * equação age sobre os MOLS, e que por isso há um desvio obrigatório pelo meio
 * do caminho. Dizer «massa → mols → mols → massa» é a dica.
 */
export const DICA_TRAJETO: Frases<[string, string, number]> = {
  pt: (deFormula, paraFormula) =>
    `A proporção da equação vale em mols, não em gramas. Vá por ${deFormula} em gramas → mols ` +
    `→ mols de ${paraFormula} → gramas.`,
  fr: (deFormula, paraFormula) =>
    `La proportion de l’équation vaut en moles, pas en grammes. Passez par ${deFormula} en ` +
    `grammes → moles → moles de ${paraFormula} → grammes.`,
  en: (deFormula, paraFormula) =>
    `The equation’s ratio holds in moles, not in grams. Go through ${deFormula} in grams → ` +
    `moles → moles of ${paraFormula} → grams.`,
};

export const MASSA_DE_REAGENTE: Frases<[string, string, number]> = {
  pt: (produtoFormula, reagenteFormula, massa) =>
    `Pela equação acima, que massa de ${reagenteFormula} é preciso para obter ` +
    `${numeroEscrito(massa, 'pt')} g de ${produtoFormula}? (em gramas, 2 casas decimais)`,
  fr: (produtoFormula, reagenteFormula, massa) =>
    `D’après l’équation ci-dessus, quelle masse de ${reagenteFormula} faut-il pour obtenir ` +
    `${numeroEscrito(massa, 'fr')} g de ${produtoFormula} ? (en grammes, 2 décimales)`,
  en: (produtoFormula, reagenteFormula, massa) =>
    `From the equation above, what mass of ${reagenteFormula} is needed to obtain ` +
    `${numeroEscrito(massa, 'en')} g of ${produtoFormula}? (in grams, 2 decimal places)`,
};

export const MOLS_DE_PRODUTO: Frases<[string, string, number]> = {
  pt: (deFormula, paraFormula, mols) =>
    `Pela equação acima, quantos mols de ${paraFormula} saem de ` +
    `${numeroEscrito(mols, 'pt')} mol de ${deFormula}? (2 casas decimais)`,
  fr: (deFormula, paraFormula, mols) =>
    `D’après l’équation ci-dessus, combien de moles de ${paraFormula} proviennent de ` +
    `${numeroEscrito(mols, 'fr')} mol de ${deFormula} ? (2 décimales)`,
  en: (deFormula, paraFormula, mols) =>
    `From the equation above, how many moles of ${paraFormula} come from ` +
    `${numeroEscrito(mols, 'en')} mol of ${deFormula}? (2 decimal places)`,
};

/** Aqui a conta é só a proporção: não há massa no caminho. */
export const DICA_PROPORCAO: Frases<[string, string, number]> = {
  pt: (deFormula, paraFormula) =>
    `Leia os coeficientes da equação: eles dão a razão entre ${deFormula} e ${paraFormula} ` +
    'diretamente, sem passar por gramas.',
  fr: (deFormula, paraFormula) =>
    `Lisez les coefficients de l’équation : ils donnent le rapport entre ${deFormula} et ` +
    `${paraFormula} directement, sans passer par les grammes.`,
  en: (deFormula, paraFormula) =>
    `Read the equation’s coefficients: they give the ratio between ${deFormula} and ` +
    `${paraFormula} directly, with no detour through grams.`,
};
