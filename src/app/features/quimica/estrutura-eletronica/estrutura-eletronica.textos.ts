import { Frases } from '@core/treino/textos/texto-trilingue';

/**
 * Os enunciados e as dicas do tópico, nas três línguas.
 *
 * O símbolo do elemento e o nome do subnível (`3p`) não se traduzem, e os
 * números que aparecem nos enunciados são índices de camada — inteiros de um
 * dígito, sem separador decimal. Por isso não há `numeroEscrito` aqui: não há
 * decimal nenhum para o idioma estragar.
 */

export const ULTIMA_CAMADA: Frases<[string]> = {
  pt: (simbolo) => `Quantos elétrons há na última camada do átomo neutro de ${simbolo}?`,
  fr: (simbolo) =>
    `Combien d’électrons y a-t-il sur la dernière couche de l’atome neutre de ${simbolo} ?`,
  en: (simbolo) =>
    `How many electrons are there in the outermost shell of a neutral ${simbolo} atom?`,
};

/**
 * A dica diz onde olhar, e separa as duas contagens que se confundem.
 *
 * Quem erra aqui costuma dar o número atômico: a conta de TODOS os elétrons,
 * que é outra pergunta.
 */
export const DICA_ULTIMA: Frases<[string]> = {
  pt: () =>
    'Distribua os elétrons na ordem de energia e olhe só a ÚLTIMA camada — não o total de ' +
    'elétrons do átomo.',
  fr: () =>
    'Répartissez les électrons dans l’ordre des énergies et ne regardez que la DERNIÈRE ' +
    'couche — pas le total d’électrons de l’atome.',
  en: () =>
    'Fill the subshells in energy order and look only at the OUTERMOST shell — not the atom’s ' +
    'total electron count.',
};

export const CAMADA: Frases<[string, number]> = {
  pt: (simbolo, n) => `Quantos elétrons há na camada ${n} do átomo neutro de ${simbolo}?`,
  fr: (simbolo, n) =>
    `Combien d’électrons y a-t-il sur la couche ${n} de l’atome neutre de ${simbolo} ?`,
  en: (simbolo, n) => `How many electrons are there in shell ${n} of a neutral ${simbolo} atom?`,
};

/** A dica avisa que a camada pode estar incompleta: capacidade não é ocupação. */
export const DICA_CAMADA: Frases<[string, number]> = {
  pt: (_simbolo, n) =>
    `Some os elétrons de todos os subníveis com n = ${n}. A camada pode estar incompleta: ` +
    'o que ela CABE não é o que ela tem.',
  fr: (_simbolo, n) =>
    `Additionnez les électrons de tous les sous-niveaux avec n = ${n}. La couche peut être ` +
    'incomplète : ce qu’elle peut contenir n’est pas ce qu’elle contient.',
  en: (_simbolo, n) =>
    `Add up the electrons in every subshell with n = ${n}. The shell may be incomplete: what ` +
    'it can hold is not what it holds.',
};

export const SUBNIVEL: Frases<[string, string]> = {
  pt: (simbolo, subnivel) =>
    `Quantos elétrons há no subnível ${subnivel} do átomo neutro de ${simbolo}?`,
  fr: (simbolo, subnivel) =>
    `Combien d’électrons y a-t-il dans le sous-niveau ${subnivel} de l’atome neutre de ` +
    `${simbolo} ?`,
  en: (simbolo, subnivel) =>
    `How many electrons are there in the ${subnivel} subshell of a neutral ${simbolo} atom?`,
};

/**
 * A dica nomeia a ordem, que é a lição do tópico.
 *
 * O 4s antes do 3d não é pegadinha: é o que a energia manda, e quem não sabe
 * disso erra todos os elementos do quarto período.
 */
export const DICA_SUBNIVEL: Frases<[string, string]> = {
  pt: () =>
    'Preencha na ordem de ENERGIA, não na ordem dos números: o 4s vem antes do 3d. Um ' +
    'subnível vazio tem zero, e isso também é resposta.',
  fr: () =>
    'Remplissez dans l’ordre des ÉNERGIES, pas dans l’ordre des numéros : le 4s précède le ' +
    '3d. Un sous-niveau vide en a zéro, et c’est aussi une réponse.',
  en: () =>
    'Fill in ENERGY order, not number order: 4s comes before 3d. An empty subshell has zero, ' +
    'and that is an answer too.',
};

export const PERIODO: Frases<[string]> = {
  pt: (simbolo) => `Quantas camadas eletrônicas ocupadas tem o átomo neutro de ${simbolo}?`,
  fr: (simbolo) => `Combien de couches électroniques occupées a l’atome neutre de ${simbolo} ?`,
  en: (simbolo) => `How many occupied electron shells does a neutral ${simbolo} atom have?`,
};

export const DICA_PERIODO: Frases<[string]> = {
  pt: () =>
    'Conte as camadas (os valores de n) que receberam elétrons, e não os subníveis. Esse ' +
    'número é o período do elemento na tabela.',
  fr: () =>
    'Comptez les couches (les valeurs de n) qui ont reçu des électrons, et non les ' +
    'sous-niveaux. Ce nombre est la période de l’élément dans le tableau.',
  en: () =>
    'Count the shells (the values of n) that received electrons, not the subshells. That ' +
    'number is the element’s period in the table.',
};
