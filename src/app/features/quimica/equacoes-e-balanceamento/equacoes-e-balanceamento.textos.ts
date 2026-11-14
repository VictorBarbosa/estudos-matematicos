import { Frases } from '@core/treino/textos/texto-trilingue';

/**
 * Os enunciados e as dicas do tópico, nas três línguas.
 *
 * A equação vai no `enunciadoTex`, igual em qualquer língua e sem os
 * coeficientes — pôr os coeficientes ali responderia a pergunta. O texto só
 * diz o que se quer, e por isso os moldes são curtos; o que varia neles são
 * fórmulas e símbolos de elemento, que não se traduzem.
 *
 * Nenhum número entra nestes enunciados, e é por isso que não há
 * `numeroEscrito` aqui: o que se pede é justamente o número que falta.
 */

export const COEFICIENTE: Frases<[string]> = {
  pt: (formula) =>
    `Balanceando a equação acima com os menores inteiros, qual é o coeficiente de ${formula}?`,
  fr: (formula) =>
    `En équilibrant l’équation ci-dessus avec les plus petits entiers, quel est le coefficient ` +
    `de ${formula} ?`,
  en: (formula) =>
    `Balancing the equation above with the smallest whole numbers, what is the coefficient of ` +
    `${formula}?`,
};

/**
 * A dica diz o que se ajusta — e o que não se ajusta.
 *
 * O erro que o tópico existe para corrigir é mexer no índice. Nomear a
 * diferença é a dica inteira: índice é a substância, coeficiente é quantas
 * dela.
 */
export const DICA_COEFICIENTE: Frases<[string]> = {
  pt: () =>
    'Conte os átomos de cada elemento nos dois lados e ajuste só os COEFICIENTES, os números ' +
    'da frente. Mexer num índice trocaria a substância.',
  fr: () =>
    'Comptez les atomes de chaque élément des deux côtés et n’ajustez que les COEFFICIENTS, ' +
    'les nombres devant. Modifier un indice changerait la substance.',
  en: () =>
    'Count each element’s atoms on both sides and adjust only the COEFFICIENTS, the numbers in ' +
    'front. Changing a subscript would change the substance.',
};

export const SOMA: Frases<[]> = {
  pt: () =>
    'Balanceando a equação acima com os menores inteiros, qual é a soma de todos os ' +
    'coeficientes, dos dois lados?',
  fr: () =>
    'En équilibrant l’équation ci-dessus avec les plus petits entiers, quelle est la somme de ' +
    'tous les coefficients, des deux côtés ?',
  en: () =>
    'Balancing the equation above with the smallest whole numbers, what is the sum of all the ' +
    'coefficients, on both sides?',
};

export const DICA_SOMA: Frases<[]> = {
  pt: () =>
    'Balanceie primeiro, e não esqueça o coeficiente 1, que não se escreve mas conta na soma. ' +
    'Os dois lados entram.',
  fr: () =>
    'Équilibrez d’abord, et n’oubliez pas le coefficient 1, qui ne s’écrit pas mais compte ' +
    'dans la somme. Les deux côtés y entrent.',
  en: () =>
    'Balance it first, and do not forget the coefficient 1, which is not written but counts in ' +
    'the sum. Both sides are included.',
};

export const ATOMOS: Frases<[string]> = {
  pt: (elemento) =>
    `Depois de balancear a equação acima, quantos átomos de ${elemento} há em cada lado?`,
  fr: (elemento) =>
    `Après avoir équilibré l’équation ci-dessus, combien d’atomes de ${elemento} y a-t-il de ` +
    'chaque côté ?',
  en: (elemento) =>
    `After balancing the equation above, how many ${elemento} atoms are there on each side?`,
};

/** A contagem é a PROVA do balanceamento, e por isso ela vira pergunta. */
export const DICA_ATOMOS: Frases<[string]> = {
  pt: (elemento) =>
    `Para cada substância, multiplique o coeficiente pelo índice de ${elemento} e some. Os ` +
    'dois lados dão o mesmo número — é isso que «balanceada» quer dizer.',
  fr: (elemento) =>
    `Pour chaque substance, multipliez le coefficient par l’indice de ${elemento} et ` +
    'additionnez. Les deux côtés donnent le même nombre — c’est ce que « équilibrée » veut dire.',
  en: (elemento) =>
    `For each substance, multiply the coefficient by ${elemento}’s subscript and add them up. ` +
    'Both sides give the same number — that is what “balanced” means.',
};
