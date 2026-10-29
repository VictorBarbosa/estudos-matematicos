import { ErroMatematico, exigirInteiro } from '@core/math/tipos/tipos';

/**
 * Máximo divisor comum pelo algoritmo de Euclides.
 *
 * Trabalha com os valores absolutos, de modo que o resultado é sempre não
 * negativo — é o que se espera ao usá-lo para simplificar frações.
 * Por convenção, mdc(0, 0) = 0.
 */
export function mdc(a: number, b: number): number {
  exigirInteiro(a, 'a');
  exigirInteiro(b, 'b');

  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y !== 0) {
    [x, y] = [y, x % y];
  }

  return x;
}

/**
 * Mínimo múltiplo comum.
 *
 * Calculado como |a·b| / mdc(a,b), mas dividindo *antes* de multiplicar para
 * não estourar a precisão com números grandes. mmc(n, 0) = 0.
 */
export function mmc(a: number, b: number): number {
  exigirInteiro(a, 'a');
  exigirInteiro(b, 'b');

  if (a === 0 || b === 0) {
    return 0;
  }

  const divisor = mdc(a, b);
  return Math.abs(a / divisor) * Math.abs(b);
}

/** Estende o mdc a uma lista de inteiros. */
export function mdcLista(valores: readonly number[]): number {
  return valores.reduce<number>((acumulado, valor) => mdc(acumulado, valor), 0);
}

/** Estende o mmc a uma lista de inteiros. */
export function mmcLista(valores: readonly number[]): number {
  if (valores.length === 0) {
    return 1;
  }
  return valores.reduce((acumulado, valor) => mmc(acumulado, valor));
}

/** Um primo e quantas vezes ele aparece na fatoração. */
export interface FatorPrimo {
  readonly primo: number;
  readonly expoente: number;
}

/**
 * Fatoração em primos por divisões sucessivas.
 *
 * Suficiente para os números didáticos deste projeto: testa 2 e depois apenas
 * os ímpares até a raiz quadrada do que restou.
 */
export function fatorar(n: number): readonly FatorPrimo[] {
  exigirInteiro(n, 'n');

  const valor = Math.abs(n);
  if (valor < 2) {
    return [];
  }

  const fatores: FatorPrimo[] = [];
  let restante = valor;

  const extrair = (primo: number): void => {
    let expoente = 0;
    while (restante % primo === 0) {
      restante /= primo;
      expoente++;
    }
    if (expoente > 0) {
      fatores.push({ primo, expoente });
    }
  };

  extrair(2);
  for (let divisor = 3; divisor * divisor <= restante; divisor += 2) {
    extrair(divisor);
  }

  // O que sobrar maior que 1 é necessariamente primo.
  if (restante > 1) {
    fatores.push({ primo: restante, expoente: 1 });
  }

  return fatores;
}

/** Teste de primalidade por divisão tentativa. */
export function ehPrimo(n: number): boolean {
  exigirInteiro(n, 'n');

  if (n < 2) {
    return false;
  }
  if (n % 2 === 0) {
    return n === 2;
  }

  for (let divisor = 3; divisor * divisor <= n; divisor += 2) {
    if (n % divisor === 0) {
      return false;
    }
  }

  return true;
}

/** Escreve a fatoração em LaTeX, por exemplo `2^{2} \cdot 3`. */
export function fatoracaoParaTex(n: number): string {
  const fatores = fatorar(n);

  if (fatores.length === 0) {
    return String(Math.abs(n));
  }

  const corpo = fatores
    .map(({ primo, expoente }) => (expoente === 1 ? `${primo}` : `${primo}^{${expoente}}`))
    .join(' \\cdot ');

  return n < 0 ? `-${corpo}` : corpo;
}

/** Lista os divisores positivos de um inteiro, em ordem crescente. */
export function divisores(n: number): readonly number[] {
  exigirInteiro(n, 'n');

  const valor = Math.abs(n);
  if (valor === 0) {
    throw new ErroMatematico('Zero tem infinitos divisores.');
  }

  const menores: number[] = [];
  const maiores: number[] = [];

  for (let d = 1; d * d <= valor; d++) {
    if (valor % d === 0) {
      menores.push(d);
      if (d !== valor / d) {
        maiores.unshift(valor / d);
      }
    }
  }

  return [...menores, ...maiores];
}
