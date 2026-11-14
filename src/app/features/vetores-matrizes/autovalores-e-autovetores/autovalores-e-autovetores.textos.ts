import { Frases } from '@core/treino/textos/texto-trilingue';

/**
 * Os enunciados e as dicas do tópico, nas três línguas.
 *
 * A matriz vai toda no `enunciadoTex`, que é igual em qualquer língua — o
 * texto só diz o que se pede. Não há decimal em nenhum enunciado: os
 * autovalores deste tópico são inteiros por construção, e por isso não há
 * `numeroEscrito` aqui.
 */

export const SOMA: Frases<[]> = {
  pt: () => 'Qual é a soma dos autovalores da matriz acima?',
  fr: () => 'Quelle est la somme des valeurs propres de la matrice ci-dessus ?',
  en: () => 'What is the sum of the eigenvalues of the matrix above?',
};

/**
 * A dica entrega a identidade, e isso é de propósito.
 *
 * Que a soma dos autovalores é o traço não é uma pegadinha a ser descoberta:
 * é a ferramenta de conferência do tópico. Quem a conhece verifica a própria
 * resposta sem gabarito, e é isso que vale a pena ensinar.
 */
export const DICA_SOMA: Frases<[]> = {
  pt: () =>
    'Não precisa achar os autovalores: a soma deles é sempre o traço, a soma da diagonal da ' +
    'matriz.',
  fr: () =>
    'Pas besoin de trouver les valeurs propres : leur somme est toujours la trace, la somme de ' +
    'la diagonale.',
  en: () =>
    'You do not need the eigenvalues: their sum is always the trace, the sum of the matrix ' +
    'diagonal.',
};

export const PRODUTO: Frases<[]> = {
  pt: () => 'Qual é o produto dos autovalores da matriz acima?',
  fr: () => 'Quel est le produit des valeurs propres de la matrice ci-dessus ?',
  en: () => 'What is the product of the eigenvalues of the matrix above?',
};

export const DICA_PRODUTO: Frases<[]> = {
  pt: () =>
    'O produto dos autovalores é sempre o determinante. É por isso que uma matriz com ' +
    'autovalor zero não tem inversa.',
  fr: () =>
    'Le produit des valeurs propres est toujours le déterminant. C’est pourquoi une matrice ' +
    'ayant une valeur propre nulle n’a pas d’inverse.',
  en: () =>
    'The product of the eigenvalues is always the determinant. That is why a matrix with a ' +
    'zero eigenvalue has no inverse.',
};

export const MAIOR: Frases<[]> = {
  pt: () => 'Qual é o maior autovalor da matriz acima?',
  fr: () => 'Quelle est la plus grande valeur propre de la matrice ci-dessus ?',
  en: () => 'What is the largest eigenvalue of the matrix above?',
};

/** A dica dá o caminho, e o que fazer com as duas raízes. */
export const DICA_MAIOR: Frases<[]> = {
  pt: () =>
    'Monte λ² − (traço)λ + (determinante) = 0 e resolva. Das duas raízes, a pergunta quer a ' +
    'maior — e a soma delas tem de dar o traço.',
  fr: () =>
    'Écrivez λ² − (trace)λ + (déterminant) = 0 et résolvez. Des deux racines, on demande la ' +
    'plus grande — et leur somme doit donner la trace.',
  en: () =>
    'Set up λ² − (trace)λ + (determinant) = 0 and solve. Of the two roots, the question wants ' +
    'the larger one — and their sum must equal the trace.',
};

export const DIRECAO: Frases<[number]> = {
  pt: (autovalor) =>
    `A matriz acima tem autovalor ${autovalor}. Para qual valor de k o vetor (1, k) é um ` +
    'autovetor associado a ele?',
  fr: (autovalor) =>
    `La matrice ci-dessus a la valeur propre ${autovalor}. Pour quelle valeur de k le vecteur ` +
    '(1, k) est-il un vecteur propre associé ?',
  en: (autovalor) =>
    `The matrix above has eigenvalue ${autovalor}. For which value of k is the vector (1, k) ` +
    'an eigenvector for it?',
};

/**
 * A dica dá a equação, não a fórmula pronta.
 *
 * `(A − λI)v = 0` é a definição; dizer «k = (λ − a)/b» pouparia justamente o
 * passo que o tópico ensina, que é escrever a condição.
 */
export const DICA_DIRECAO: Frases<[number]> = {
  pt: () =>
    'Escreva (A − λI)·(1, k) = (0, 0). A primeira linha já basta: ela dá uma equação com k ' +
    'sozinho.',
  fr: () =>
    'Écrivez (A − λI)·(1, k) = (0, 0). La première ligne suffit : elle donne une équation avec ' +
    'k seul.',
  en: () =>
    'Write (A − λI)·(1, k) = (0, 0). The first row is enough: it gives one equation in k alone.',
};

export const TRIANGULAR: Frases<[]> = {
  pt: () => 'Qual é o maior autovalor da matriz triangular acima?',
  fr: () => 'Quelle est la plus grande valeur propre de la matrice triangulaire ci-dessus ?',
  en: () => 'What is the largest eigenvalue of the triangular matrix above?',
};

/** A dica diz por que a matriz triangular é fácil — e por que isso importa. */
export const DICA_TRIANGULAR: Frases<[]> = {
  pt: () =>
    'Numa matriz triangular os autovalores estão na diagonal, e não há conta a fazer. É por ' +
    'isso que diagonalizar vale o esforço.',
  fr: () =>
    'Dans une matrice triangulaire les valeurs propres sont sur la diagonale, sans aucun ' +
    'calcul. C’est pourquoi diagonaliser vaut l’effort.',
  en: () =>
    'In a triangular matrix the eigenvalues sit on the diagonal, with no work to do. That is ' +
    'why diagonalising is worth the effort.',
};
