import { Frases } from '@core/treino/textos/texto-trilingue';

/**
 * Os enunciados e as dicas do tópico, nas três línguas.
 *
 * A Química nasce trilíngue, e isso é decisão de projeto: o levantamento de
 * 13/11 mostrou ≈ 10 000 frases já escritas à espera de tradução, e repetir o
 * padrão numa área inteira seria aumentar a dívida de propósito. Nascer
 * traduzido custa pouco mais; traduzir depois já se provou caro.
 *
 * O vocabulário segue o que a escola usa em cada língua: «nêutron / neutron»,
 * «cátion / cation», «número de massa / nombre de masse / mass number».
 */

export const PARTICULAS: Frases<[string, number, number]> = {
  pt: (simbolo, z, a) =>
    `Um átomo neutro de ${simbolo} tem número atômico ${z} e número de massa ${a}. ` +
    'Quantos nêutrons ele tem?',
  fr: (simbolo, z, a) =>
    `Un atome neutre de ${simbolo} a un numéro atomique de ${z} et un nombre de masse de ${a}. ` +
    'Combien de neutrons a-t-il ?',
  en: (simbolo, z, a) =>
    `A neutral atom of ${simbolo} has atomic number ${z} and mass number ${a}. How many ` +
    'neutrons does it have?',
};

export const DICA_PARTICULAS: Frases<[string, number, number]> = {
  pt: (_s, z, a) =>
    `O número de massa conta prótons e nêutrons juntos: tire os ${z} prótons dos ${a}.`,
  fr: (_s, z, a) =>
    `Le nombre de masse compte protons et neutrons ensemble : retirez les ${z} protons des ${a}.`,
  en: (_s, z, a) =>
    `The mass number counts protons and neutrons together: take the ${z} protons out of ${a}.`,
};

export const ELETRONS_DO_ION: Frases<[string, number, number]> = {
  pt: (simbolo, z, carga) =>
    `O íon ${simbolo} tem número atômico ${z} e carga ${carga > 0 ? `${carga}+` : `${-carga}−`}. ` +
    'Quantos elétrons ele tem?',
  fr: (simbolo, z, carga) =>
    `L’ion ${simbolo} a un numéro atomique de ${z} et une charge de ` +
    `${carga > 0 ? `${carga}+` : `${-carga}−`}. Combien d’électrons a-t-il ?`,
  en: (simbolo, z, carga) =>
    `The ${simbolo} ion has atomic number ${z} and charge ` +
    `${carga > 0 ? `${carga}+` : `${-carga}−`}. How many electrons does it have?`,
};

/**
 * A dica diz de que lado o elétron falta — que é onde o sinal engana.
 *
 * «Carga positiva» soa como «tem mais alguma coisa», e o que ela quer dizer é
 * o contrário: falta elétron. Dizer isso é metade do tópico.
 */
export const DICA_ELETRONS: Frases<[string, number, number]> = {
  pt: (_s, _z, carga) =>
    carga > 0
      ? `Carga positiva é elétron que FALTA: tire ${carga} do número de prótons.`
      : `Carga negativa é elétron a MAIS: some ${-carga} ao número de prótons.`,
  fr: (_s, _z, carga) =>
    carga > 0
      ? `Une charge positive, c’est un électron qui MANQUE : retirez ${carga} du nombre de protons.`
      : `Une charge négative, c’est un électron EN PLUS : ajoutez ${-carga} au nombre de protons.`,
  en: (_s, _z, carga) =>
    carga > 0
      ? `A positive charge is a MISSING electron: take ${carga} off the proton count.`
      : `A negative charge is an EXTRA electron: add ${-carga} to the proton count.`,
};

export const NUMERO_DE_MASSA: Frases<[string, number, number]> = {
  pt: (simbolo, protons, neutrons) =>
    `Um átomo de ${simbolo} tem ${protons} prótons e ${neutrons} nêutrons. Qual é o seu ` +
    'número de massa?',
  fr: (simbolo, protons, neutrons) =>
    `Un atome de ${simbolo} a ${protons} protons et ${neutrons} neutrons. Quel est son nombre ` +
    'de masse ?',
  en: (simbolo, protons, neutrons) =>
    `An atom of ${simbolo} has ${protons} protons and ${neutrons} neutrons. What is its mass ` +
    'number?',
};

export const DICA_NUMERO_DE_MASSA: Frases<[string, number, number]> = {
  pt: () => 'O elétron não entra: ele tem massa pequena demais para contar aqui.',
  fr: () => 'L’électron ne compte pas : sa masse est trop petite pour entrer ici.',
  en: () => 'The electron does not count: its mass is far too small to matter here.',
};

export const MASSA_MEDIA: Frases<[string, number, number, number, number]> = {
  pt: (simbolo, m1, p1, m2, p2) =>
    `O ${simbolo} tem dois isótopos naturais: massa ${m1} com ${p1}% de abundância, e massa ` +
    `${m2} com ${p2}%. Qual é a massa atômica média, com duas casas decimais?`,
  fr: (simbolo, m1, p1, m2, p2) =>
    `Le ${simbolo} a deux isotopes naturels : masse ${m1} avec ${p1} % d’abondance, et masse ` +
    `${m2} avec ${p2} %. Quelle est la masse atomique moyenne, avec deux décimales ?`,
  en: (simbolo, m1, p1, m2, p2) =>
    `${simbolo} has two natural isotopes: mass ${m1} at ${p1}% abundance, and mass ${m2} at ` +
    `${p2}%. What is the average atomic mass, to two decimal places?`,
};

export const DICA_MASSA_MEDIA: Frases<[string, number, number, number, number]> = {
  pt: (_s, m1, p1) =>
    `É média ponderada, não média simples: cada massa entra vezes a sua fração — ${m1} × ` +
    `${(p1 / 100).toFixed(4)}, e o mesmo para a outra.`,
  fr: (_s, m1, p1) =>
    `C’est une moyenne pondérée, pas une moyenne simple : chaque masse entre multipliée par sa ` +
    `fraction — ${m1} × ${(p1 / 100).toFixed(4)}, et de même pour l’autre.`,
  en: (_s, m1, p1) =>
    `It is a weighted mean, not a plain average: each mass enters times its fraction — ${m1} × ` +
    `${(p1 / 100).toFixed(4)}, and likewise for the other.`,
};
