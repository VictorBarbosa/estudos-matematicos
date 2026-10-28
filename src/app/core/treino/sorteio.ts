import { Rng } from '@core/treino/rng';
import { Nivel } from '@core/treino/treino.model';

/**
 * Sorteios reaproveitados entre geradores de exercício.
 *
 * O problema que este módulo resolve: um gerador que sorteia de
 * `[30, 45, 60]` produz três exercícios, e o aluno percebe a repetição em
 * poucos cliques. Quando o gabarito é numérico, não há razão para restringir
 * o sorteio aos ângulos notáveis — qualquer ângulo inteiro serve, e o espaço
 * de exercícios passa de três para dezenas.
 *
 * As funções aqui existem para que essa ampliação seja consistente entre
 * tópicos, em vez de cada gerador inventar sua própria lista curta.
 */

/** Ângulo agudo inteiro, para exercícios cujo gabarito é decimal. */
export function anguloAgudo(rng: Rng, nivel: Nivel): number {
  return nivel === 'facil' ? rng.inteiro(10, 80) : rng.inteiro(5, 85);
}

/**
 * Ângulo agudo múltiplo de 5°.
 *
 * Serve a tópicos cujo nível fácil se beneficia de ângulos "redondos" — mais
 * fáceis de situar mentalmente — sem ficar preso aos três notáveis, que
 * reduziam o tópico a três exercícios.
 */
export function anguloRedondo(rng: Rng, nivel: Nivel): number {
  return nivel === 'facil' ? rng.inteiro(3, 15) * 5 : rng.inteiro(1, 17) * 5;
}

/**
 * Ângulo em qualquer quadrante, para círculo trigonométrico e afins.
 *
 * No nível fácil fica no primeiro quadrante, onde todos os sinais são
 * positivos; nos demais percorre a volta inteira, que é onde o sinal passa a
 * importar.
 */
export function anguloNaVolta(rng: Rng, nivel: Nivel): number {
  switch (nivel) {
    case 'facil':
      return rng.inteiro(5, 85);
    case 'medio':
      return rng.inteiro(5, 175);
    case 'dificil':
      return rng.inteiro(5, 355);
  }
}

/**
 * Coeficiente não nulo num intervalo simétrico.
 *
 * Zerar coeficientes no nível fácil era o que mais estreitava os geradores de
 * cálculo: com b e c fixos em zero, sobravam poucas combinações. Um
 * coeficiente pequeno e variado mantém a conta fácil sem colapsar o espaço.
 */
export function coeficiente(rng: Rng, limite: number): number {
  const valor = rng.inteiro(1, limite);
  return rng.booleano() ? valor : -valor;
}

/** Inteiro não nulo em [−limite, limite], evitando o zero. */
export function inteiroNaoNulo(rng: Rng, limite: number): number {
  return coeficiente(rng, limite);
}

/**
 * Valor "redondo" numa faixa ampla: 1, 2, 5 ou os múltiplos deles.
 *
 * Serve para grandezas físicas em que o número exato não importa, mas a ordem
 * de grandeza sim — altitudes, massas, pressões. Dá variedade sem produzir
 * números deselegantes como 37 418 km.
 */
export function valorRedondo(rng: Rng, minimo: number, maximo: number): number {
  const candidatos: number[] = [];

  for (let expoente = 0; expoente <= 12; expoente++) {
    for (const fator of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 8]) {
      const valor = fator * 10 ** expoente;
      if (valor >= minimo && valor <= maximo) {
        candidatos.push(valor);
      }
    }
  }

  return candidatos.length === 0 ? rng.inteiro(minimo, maximo) : rng.escolher(candidatos);
}
