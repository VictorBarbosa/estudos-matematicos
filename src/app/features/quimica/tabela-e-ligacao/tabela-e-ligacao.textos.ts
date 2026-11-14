import { Frases } from '@core/treino/textos/texto-trilingue';
import { numeroEscrito } from '@core/treino/textos/numero-escrito';

/**
 * Os enunciados e as dicas do tópico, nas três línguas.
 *
 * Os símbolos de elemento não se traduzem, e o número atômico vai entre
 * parênteses porque é o dado de que a pergunta precisa — o NOME do elemento
 * muda de língua, e a tabela do núcleo guarda só o português.
 */

export const GRUPO: Frases<[string]> = {
  pt: (etiqueta) => `Em que grupo da tabela periódica (de 1 a 18) está o ${etiqueta}?`,
  fr: (etiqueta) => `Dans quel groupe du tableau périodique (de 1 à 18) se trouve le ${etiqueta} ?`,
  en: (etiqueta) => `Which group of the periodic table (1 to 18) is ${etiqueta} in?`,
};

/**
 * A dica liga o grupo à última camada, que é de onde ele vem.
 *
 * Dizer «olhe na tabela» não ensinaria nada: o grupo É a contagem da última
 * camada, e é por isso que ele agrupa elementos de química parecida.
 */
export const DICA_GRUPO: Frases<[string]> = {
  pt: () =>
    'Conte os elétrons da última camada: até 2, o grupo é esse número; de 3 em diante, some 10 ' +
    '— é a numeração de 1 a 18.',
  fr: () =>
    'Comptez les électrons de la dernière couche : jusqu’à 2, le groupe est ce nombre ; à ' +
    'partir de 3, ajoutez 10 — c’est la numérotation de 1 à 18.',
  en: () =>
    'Count the outermost-shell electrons: up to 2, the group is that number; from 3 on, add 10 ' +
    '— that is the 1-to-18 numbering.',
};

export const CARGA: Frases<[string]> = {
  pt: (etiqueta) =>
    `Qual é a carga do íon mais provável do ${etiqueta}? (com o sinal, como 2 ou -2)`,
  fr: (etiqueta) =>
    `Quelle est la charge de l’ion le plus probable du ${etiqueta} ? (avec le signe, comme 2 ` +
    'ou -2)',
  en: (etiqueta) =>
    `What is the charge of ${etiqueta}’s most likely ion? (with the sign, like 2 or -2)`,
};

/** A dica dá o critério, que é chegar ao gás nobre mais próximo. */
export const DICA_CARGA: Frases<[string]> = {
  pt: () =>
    'O átomo vai para a configuração do gás nobre mais próximo: com poucos elétrons na última ' +
    'camada, perde-os (carga positiva); perto de fechar, ganha os que faltam (negativa).',
  fr: () =>
    'L’atome rejoint la configuration du gaz noble le plus proche : avec peu d’électrons sur ' +
    'la dernière couche, il les perd (charge positive) ; près de la compléter, il gagne ceux ' +
    'qui manquent (négative).',
  en: () =>
    'The atom goes to the nearest noble gas configuration: with few outer electrons it loses ' +
    'them (positive charge); close to a full shell it gains the missing ones (negative).',
};

export const FORMULA_IONICA: Frases<[string, string]> = {
  pt: (cation, anion) =>
    `Qual é a fórmula do composto iônico formado por ${cation} e ${anion}? (escreva como NaCl)`,
  fr: (cation, anion) =>
    `Quelle est la formule du composé ionique formé par ${cation} et ${anion} ? ` +
    '(écrivez comme NaCl)',
  en: (cation, anion) =>
    `What is the formula of the ionic compound formed by ${cation} and ${anion}? ` +
    '(write it like NaCl)',
};

/**
 * A dica dá o cruzamento E a redução.
 *
 * O cruzamento sozinho produz Mg₂O₂, que ninguém escreve. A redução não é
 * detalhe: a fórmula iônica é uma proporção, e proporção se escreve reduzida.
 */
export const DICA_FORMULA: Frases<[string, string]> = {
  pt: () =>
    'Ache a carga de cada um e cruze: o índice de cada elemento é a carga do outro. Depois ' +
    'reduza — Mg²⁺ com O²⁻ dá MgO, não Mg2O2.',
  fr: () =>
    'Trouvez la charge de chacun et croisez : l’indice de chaque élément est la charge de ' +
    'l’autre. Puis réduisez — Mg²⁺ avec O²⁻ donne MgO, pas Mg2O2.',
  en: () =>
    'Find each charge and cross them: each element’s subscript is the other’s charge. Then ' +
    'reduce — Mg²⁺ with O²⁻ gives MgO, not Mg2O2.',
};

export const DELTA: Frases<[string, string, number, number]> = {
  pt: (primeiro, segundo, eletroPrimeiro, eletroSegundo) =>
    `A eletronegatividade de ${primeiro} é ${numeroEscrito(eletroPrimeiro, 'pt')} e a de ` +
    `${segundo} é ${numeroEscrito(eletroSegundo, 'pt')}. Qual é a diferença entre elas? ` +
    '(2 casas decimais)',
  fr: (primeiro, segundo, eletroPrimeiro, eletroSegundo) =>
    `L’électronégativité de ${primeiro} est ${numeroEscrito(eletroPrimeiro, 'fr')} et celle de ` +
    `${segundo} est ${numeroEscrito(eletroSegundo, 'fr')}. Quelle est la différence entre ` +
    'elles ? (2 décimales)',
  en: (primeiro, segundo, eletroPrimeiro, eletroSegundo) =>
    `The electronegativity of ${primeiro} is ${numeroEscrito(eletroPrimeiro, 'en')} and that ` +
    `of ${segundo} is ${numeroEscrito(eletroSegundo, 'en')}. What is the difference between ` +
    'them? (2 decimal places)',
};

/**
 * A dica diz para onde o número aponta.
 *
 * A subtração é trivial; o que o aluno precisa saber é o que fazer com o
 * resultado — e que a régua é uma faixa, não uma fronteira.
 */
export const DICA_DELTA: Frases<[string, string, number, number]> = {
  pt: () =>
    'Subtraia a menor da maior: a diferença é sempre positiva. Acima de 1,7 a ligação se ' +
    'trata como iônica; abaixo de 0,4, como covalente apolar.',
  fr: () =>
    'Soustrayez la plus petite de la plus grande : la différence est toujours positive. ' +
    'Au-dessus de 1,7 la liaison est traitée comme ionique ; sous 0,4, comme covalente apolaire.',
  en: () =>
    'Subtract the smaller from the larger: the difference is always positive. Above 1.7 the ' +
    'bond is treated as ionic; below 0.4, as nonpolar covalent.',
};
