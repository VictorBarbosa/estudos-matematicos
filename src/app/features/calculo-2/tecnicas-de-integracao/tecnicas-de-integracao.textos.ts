import { Frases } from '@core/treino/textos/texto-trilingue';

/**
 * Os enunciados e as dicas das quatro técnicas, nas três línguas.
 *
 * O tópico foi traduzido inteiro ao ganhar a substituição trigonométrica. Meia
 * tradução é pior que nenhuma: o aluno em francês cairia em português só ao
 * trocar de tipo de exercício dentro do mesmo tópico, e leria isso como defeito
 * do site, não como obra inacabada.
 *
 * Os enunciados aqui são curtos porque a integral vai no `enunciadoTex`, que é
 * a mesma em qualquer língua — o texto só diz qual técnica usar.
 */

export const SUBSTITUICAO: Frases<[]> = {
  pt: () => 'Resolva por substituição. (2 casas decimais)',
  fr: () => 'Résolvez par substitution. (2 décimales)',
  en: () => 'Solve by substitution. (2 decimal places)',
};

export const DICA_SUBSTITUICAO: Frases<[]> = {
  pt: () => 'Depois de trocar por u, não esqueça o fator que vem de dx = du/a.',
  fr: () => 'Après le changement de variable, n’oubliez pas le facteur venant de dx = du/a.',
  en: () => 'After switching to u, do not forget the factor that comes from dx = du/a.',
};

export const POR_PARTES: Frases<[]> = {
  pt: () => 'Resolva por partes. (2 casas decimais)',
  fr: () => 'Résolvez par parties. (2 décimales)',
  en: () => 'Solve by parts. (2 decimal places)',
};

export const DICA_POR_PARTES: Frases<[]> = {
  pt: () => 'Tome u = ln x. A escolha certa é a que simplifica ao derivar.',
  fr: () => 'Prenez u = ln x. Le bon choix est celui qui se simplifie en dérivant.',
  en: () => 'Take u = ln x. The right choice is the one that gets simpler when differentiated.',
};

/*
 * Repete a assinatura da sua dica, mesmo sem usar os números: é o que permite
 * entregar as duas a `enunciadoTrilingue` numa chamada só.
 */
export const FRACOES_PARCIAIS: Frases<[number, number]> = {
  pt: () => 'Resolva por frações parciais. (2 casas decimais)',
  fr: () => 'Résolvez par fractions partielles. (2 décimales)',
  en: () => 'Solve by partial fractions. (2 decimal places)',
};

export const DICA_FRACOES_PARCIAIS: Frases<[number, number]> = {
  pt: (m, n) => `Fatore em A/(x+${m}) + B/(x+${n}) e avalie em x = -${m} e x = -${n}.`,
  fr: (m, n) => `Décomposez en A/(x+${m}) + B/(x+${n}) et évaluez en x = -${m} et x = -${n}.`,
  en: (m, n) => `Split into A/(x+${m}) + B/(x+${n}) and evaluate at x = -${m} and x = -${n}.`,
};

/**
 * Substituição trigonométrica — a técnica que faltava.
 *
 * `√(a² − x²)` e `a² + x²` não cedem a nenhuma das outras três: não há `u` cuja
 * derivada apareça no integrando, e não há o que decompor. O que resolve é
 * trocar `x` por `a·sen θ` ou `a·tg θ`, porque aí a identidade fundamental
 * dissolve a raiz — e é por isso que esta técnica depende de conhecer as
 * funções inversas, que o tópico de equações trigonométricas já ensina.
 */
export const SUBSTITUICAO_TRIGONOMETRICA: Frases<[]> = {
  pt: () => 'Resolva por substituição trigonométrica. (2 casas decimais)',
  fr: () => 'Résolvez par substitution trigonométrique. (2 décimales)',
  en: () => 'Solve by trigonometric substitution. (2 decimal places)',
};

/** A dica nomeia a troca, que é a decisão inteira; a conta fica com o aluno. */
export const DICA_SENO: Frases<[number]> = {
  pt: (a) => `A raiz pede x = ${a}·sen θ: daí √(${a * a} − x²) vira ${a}·cos θ.`,
  fr: (a) => `La racine appelle x = ${a}·sin θ : alors √(${a * a} − x²) devient ${a}·cos θ.`,
  en: (a) => `The root calls for x = ${a}·sin θ: then √(${a * a} − x²) becomes ${a}·cos θ.`,
};

export const DICA_TANGENTE: Frases<[number]> = {
  pt: (a) => `Some quadrados pede x = ${a}·tg θ: daí ${a * a} + x² vira ${a * a}·sec²θ.`,
  fr: (a) =>
    `Une somme de carrés appelle x = ${a}·tan θ : alors ${a * a} + x² devient ${a * a}·sec²θ.`,
  en: (a) =>
    `A sum of squares calls for x = ${a}·tan θ: then ${a * a} + x² becomes ${a * a}·sec²θ.`,
};
