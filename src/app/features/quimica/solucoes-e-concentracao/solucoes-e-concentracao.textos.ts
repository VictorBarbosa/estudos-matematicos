import { Frases } from '@core/treino/textos/texto-trilingue';
import { numeroEscrito } from '@core/treino/textos/numero-escrito';

/**
 * Os enunciados e as dicas do tópico, nas três línguas.
 *
 * Os volumes vêm em mililitros de propósito: é assim que eles aparecem na
 * bancada e na prova, e converter para litro é metade do que o tópico ensina.
 * Dar o volume já em litros pouparia o aluno do erro que mais se comete.
 */

export const MOLARIDADE: Frases<[string, number, number]> = {
  pt: (soluto, massa, mililitros) =>
    `Dissolvem-se ${numeroEscrito(massa, 'pt')} g de ${soluto} e completa-se até ` +
    `${numeroEscrito(mililitros, 'pt')} mL de solução. Qual é a concentração em mol/L? ` +
    '(2 casas decimais)',
  fr: (soluto, massa, mililitros) =>
    `On dissout ${numeroEscrito(massa, 'fr')} g de ${soluto} et on complète jusqu’à ` +
    `${numeroEscrito(mililitros, 'fr')} mL de solution. Quelle est la concentration en mol/L ? ` +
    '(2 décimales)',
  en: (soluto, massa, mililitros) =>
    `${numeroEscrito(massa, 'en')} g of ${soluto} are dissolved and made up to ` +
    `${numeroEscrito(mililitros, 'en')} mL of solution. What is the concentration in mol/L? ` +
    '(2 decimal places)',
};

/**
 * A dica nomeia os dois tropeços, e não a fórmula.
 *
 * Quem erra aqui não erra a divisão: erra por deixar o volume em mililitros,
 * ou por dividir a massa em gramas sem passar pelos mols. Dizer «mols, e o
 * volume em litros» é a dica inteira.
 */
export const DICA_MOLARIDADE: Frases<[string, number, number]> = {
  pt: () =>
    'A concentração é mols por LITRO: passe a massa a mols pela massa molar, e o volume de ' +
    'mL para L dividindo por 1000.',
  fr: () =>
    'La concentration est en moles par LITRE : convertissez la masse en moles par la masse ' +
    'molaire, et le volume de mL en L en divisant par 1000.',
  en: () =>
    'Concentration is moles per LITRE: turn the mass into moles with the molar mass, and the ' +
    'volume from mL to L by dividing by 1000.',
};

export const MASSA_EM_SOLUCAO: Frases<[string, number, number]> = {
  pt: (soluto, concentracao, mililitros) =>
    `Que massa de ${soluto} há em ${numeroEscrito(mililitros, 'pt')} mL de solução a ` +
    `${numeroEscrito(concentracao, 'pt')} mol/L? (em gramas, 2 casas decimais)`,
  fr: (soluto, concentracao, mililitros) =>
    `Quelle masse de ${soluto} y a-t-il dans ${numeroEscrito(mililitros, 'fr')} mL de solution à ` +
    `${numeroEscrito(concentracao, 'fr')} mol/L ? (en grammes, 2 décimales)`,
  en: (soluto, concentracao, mililitros) =>
    `What mass of ${soluto} is there in ${numeroEscrito(mililitros, 'en')} mL of a ` +
    `${numeroEscrito(concentracao, 'en')} mol/L solution? (in grams, 2 decimal places)`,
};

export const DICA_MASSA: Frases<[string, number, number]> = {
  pt: () =>
    'Vá por concentração × volume em litros → mols → vezes a massa molar → gramas. O caminho ' +
    'é o mesmo da definição, de trás para a frente.',
  fr: () =>
    'Passez par concentration × volume en litres → moles → fois la masse molaire → grammes. ' +
    'C’est le chemin de la définition, à l’envers.',
  en: () =>
    'Go through concentration × volume in litres → moles → times the molar mass → grams. It is ' +
    'the definition’s path, backwards.',
};

export const DILUICAO: Frases<[number, number, number]> = {
  pt: (concentracao, mililitros, acrescentados) =>
    `A ${numeroEscrito(mililitros, 'pt')} mL de solução a ${numeroEscrito(concentracao, 'pt')} ` +
    `mol/L acrescentam-se ${numeroEscrito(acrescentados, 'pt')} mL de água. Qual é a ` +
    'concentração final, em mol/L? (2 casas decimais)',
  fr: (concentracao, mililitros, acrescentados) =>
    `À ${numeroEscrito(mililitros, 'fr')} mL de solution à ${numeroEscrito(concentracao, 'fr')} ` +
    `mol/L on ajoute ${numeroEscrito(acrescentados, 'fr')} mL d’eau. Quelle est la ` +
    'concentration finale, en mol/L ? (2 décimales)',
  en: (concentracao, mililitros, acrescentados) =>
    `To ${numeroEscrito(mililitros, 'en')} mL of a ${numeroEscrito(concentracao, 'en')} mol/L ` +
    `solution, ${numeroEscrito(acrescentados, 'en')} mL of water are added. What is the final ` +
    'concentration, in mol/L? (2 decimal places)',
};

/** A dica diz a razão da fórmula, porque é ela que impede o uso errado. */
export const DICA_DILUICAO: Frases<[number, number, number]> = {
  pt: () =>
    'Acrescentar água não cria nem destrói soluto: os mols são os mesmos. O volume final é o ' +
    'que havia MAIS o que se acrescentou.',
  fr: () =>
    'Ajouter de l’eau ne crée ni ne détruit de soluté : les moles restent les mêmes. Le volume ' +
    'final est celui de départ PLUS celui ajouté.',
  en: () =>
    'Adding water neither creates nor destroys solute: the moles are the same. The final volume ' +
    'is what was there PLUS what was added.',
};

export const MISTURA: Frases<[number, number, number, number]> = {
  pt: (c1, ml1, c2, ml2) =>
    `Misturam-se ${numeroEscrito(ml1, 'pt')} mL de solução a ${numeroEscrito(c1, 'pt')} mol/L ` +
    `com ${numeroEscrito(ml2, 'pt')} mL a ${numeroEscrito(c2, 'pt')} mol/L, do mesmo soluto. ` +
    'Qual é a concentração final, em mol/L? (2 casas decimais)',
  fr: (c1, ml1, c2, ml2) =>
    `On mélange ${numeroEscrito(ml1, 'fr')} mL de solution à ${numeroEscrito(c1, 'fr')} mol/L ` +
    `avec ${numeroEscrito(ml2, 'fr')} mL à ${numeroEscrito(c2, 'fr')} mol/L, du même soluté. ` +
    'Quelle est la concentration finale, en mol/L ? (2 décimales)',
  en: (c1, ml1, c2, ml2) =>
    `${numeroEscrito(ml1, 'en')} mL of a ${numeroEscrito(c1, 'en')} mol/L solution are mixed ` +
    `with ${numeroEscrito(ml2, 'en')} mL at ${numeroEscrito(c2, 'en')} mol/L, same solute. ` +
    'What is the final concentration, in mol/L? (2 decimal places)',
};

export const DICA_MISTURA: Frases<[number, number, number, number]> = {
  pt: () =>
    'Some os mols dos dois frascos e some os volumes; divida um pelo outro. Não é a média das ' +
    'concentrações — ela só acerta se os volumes forem iguais.',
  fr: () =>
    'Additionnez les moles des deux flacons et les volumes ; divisez l’un par l’autre. Ce n’est ' +
    'pas la moyenne des concentrations — elle ne vaut que si les volumes sont égaux.',
  en: () =>
    'Add the moles from both flasks and add the volumes; divide one by the other. It is not the ' +
    'average of the concentrations — that only works when the volumes are equal.',
};
