import { Matriz, determinante, matrizParaTex } from '@core/math/algebra/matrizes/matrizes';
import { Resolucao } from '@core/math/tipos/tipos';

/**
 * Autovalores e autovetores: as direções que a matriz não torce.
 *
 * Uma matriz, aplicada a um vetor, geralmente muda o tamanho E a direção dele.
 * Para algumas direções especiais, porém, ela só muda o tamanho: o vetor sai
 * paralelo ao que entrou, multiplicado por um número. Essa direção é um
 * AUTOVETOR e esse número é o AUTOVALOR, e é isso que `A·v = λ·v` diz — nada
 * mais.
 *
 * Por que isso importa em engenharia: as direções que a matriz não torce são
 * os modos naturais do sistema. Numa estrutura, são as frequências em que ela
 * vibra sozinha; num sistema de equações diferenciais, são as soluções que
 * crescem ou decaem sem mudar de forma; numa rotação de eixos de inércia, são
 * os eixos principais. É sempre a mesma ideia: achar o referencial em que o
 * problema fica simples.
 *
 * A conta de 2×2 é pequena e inteira de propósito. `det(A − λI) = 0` abre o
 * polinômio característico `λ² − tr(A)·λ + det(A) = 0`, e as duas identidades
 * que saem dele — a soma dos autovalores é o traço, o produto é o determinante
 * — são a melhor conferência que existe: quem acha os dois autovalores e os
 * soma pode verificar a própria resposta sem gabarito.
 */

/** O traço: a soma da diagonal, que é também a soma dos autovalores. */
export function traco(m: Matriz): number {
  return m.reduce((soma, linha, indice) => soma + (linha[indice] ?? 0), 0);
}

/** `λ² − 5λ + 6`, em LaTeX. */
export function polinomioCaracteristicoTex(m: Matriz): string {
  const tr = traco(m);
  const det = determinante(m);

  const termoLinear = tr === 0 ? '' : tr > 0 ? ` - ${tr}\\lambda` : ` + ${-tr}\\lambda`;
  const termoLivre = det === 0 ? '' : det > 0 ? ` + ${det}` : ` - ${-det}`;

  return `\\lambda^2${termoLinear}${termoLivre}`;
}

/**
 * Os autovalores reais de uma matriz 2×2, do maior para o menor.
 *
 * Devolve `undefined` quando o discriminante é negativo: aí os autovalores são
 * complexos conjugados, o que significa que a matriz GIRA — não há direção que
 * ela deixe parada, e dizer um número real qualquer seria mentir sobre a
 * geometria. Uma rotação de 90° é o exemplo: nenhuma direção sobrevive a ela.
 */
export function autovalores(m: Matriz): readonly number[] | undefined {
  if (m.length !== 2 || m[0]!.length !== 2) {
    return undefined;
  }

  const tr = traco(m);
  const det = determinante(m);
  const discriminante = tr * tr - 4 * det;

  if (discriminante < 0) {
    return undefined;
  }

  const raiz = Math.sqrt(discriminante);

  return [(tr + raiz) / 2, (tr - raiz) / 2];
}

/**
 * Um autovetor inteiro associado a um autovalor, na forma mais simples.
 *
 * O autovetor nunca é único: qualquer múltiplo dele também serve, porque o que
 * importa é a DIREÇÃO. Esta função devolve o representante de coordenadas
 * inteiras reduzidas, que é o que se escreve numa resposta.
 */
export function autovetorPara(m: Matriz, autovalor: number): readonly number[] | undefined {
  if (m.length !== 2 || m[0]!.length !== 2) {
    return undefined;
  }

  const [[a, b], [c, d]] = [m[0]!, m[1]!] as [readonly number[], readonly number[]];

  // (A − λI)v = 0. Da primeira linha: (a − λ)x + b y = 0, logo (b, λ − a)
  // resolve. Se b for zero, a primeira linha não diz nada sobre y, e a
  // segunda é que resolve.
  const bruto =
    b !== 0
      ? [b!, autovalor - a!]
      : c !== 0
        ? [autovalor - d!, c!]
        : // Matriz diagonal: os eixos são os autovetores.
          autovalor === a!
          ? [1, 0]
          : [0, 1];

  return reduzir(bruto);
}

function reduzir(vetor: readonly number[]): readonly number[] {
  const inteiros = vetor.every((valor) => Number.isInteger(valor));

  if (!inteiros) {
    return vetor;
  }

  const divisor = vetor.reduce((atual, valor) => mdc(atual, valor), 0);

  if (divisor <= 1) {
    return vetor;
  }

  const reduzido = vetor.map((valor) => valor / divisor);

  // Por convenção, a primeira coordenada não nula fica positiva.
  const primeiraNaoNula = reduzido.find((valor) => valor !== 0) ?? 1;

  return primeiraNaoNula < 0 ? reduzido.map((valor) => -valor) : reduzido;
}

function mdc(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y !== 0) {
    [x, y] = [y, x % y];
  }

  return x === 0 ? 1 : x;
}

/**
 * O autovalor de uma matriz triangular está na diagonal.
 *
 * Não é truque nem caso particular inútil: é o motivo de todo o esforço de
 * diagonalizar. Numa matriz triangular, `det(A − λI)` é o produto da diagonal
 * deslocada, e as raízes aparecem de graça.
 */
export function autovaloresDeTriangular(m: Matriz): readonly number[] | undefined {
  const triangularSuperior = m.every((linha, i) =>
    linha.every((valor, j) => j >= i || valor === 0),
  );
  const triangularInferior = m.every((linha, i) =>
    linha.every((valor, j) => j <= i || valor === 0),
  );

  if (!triangularSuperior && !triangularInferior) {
    return undefined;
  }

  return [...m.map((linha, indice) => linha[indice] ?? 0)].sort((x, y) => y - x);
}

export function autovaloresComPassos(m: Matriz): Resolucao<readonly number[]> | undefined {
  const valores = autovalores(m);

  if (valores === undefined) {
    return undefined;
  }

  const tr = traco(m);
  const det = determinante(m);
  const [maior, menor] = valores as [number, number];

  const escrever = (valor: number) => Number(valor.toFixed(4));

  return {
    resultado: valores,
    passos: [
      {
        descricao: 'Um autovalor é o número que a matriz multiplica, sem torcer a direção.',
        tex: `A\\,v = \\lambda\\,v \\qquad A = ${matrizParaTex(m)}`,
        nota: 'Procurar λ é procurar as direções que a matriz deixa paradas, só esticadas.',
      },
      {
        descricao: 'Para haver v não nulo, a matriz A − λI tem de ser singular.',
        tex: '\\det(A - \\lambda I) = 0',
        nota:
          'Se o determinante não fosse zero, a única solução seria v = 0 — e o vetor nulo não ' +
          'aponta para direção nenhuma.',
      },
      {
        descricao: 'Abrindo o determinante, aparece o polinômio característico.',
        tex: `${polinomioCaracteristicoTex(m)} = 0`,
        nota: `O coeficiente de λ é menos o traço (${tr}) e o termo livre é o determinante (${det}).`,
      },
      {
        descricao: 'As raízes são os autovalores.',
        tex: `\\lambda_1 = ${escrever(maior)} \\qquad \\lambda_2 = ${escrever(menor)}`,
      },
      {
        descricao: 'E a conferência sai de graça: somam o traço e multiplicam o determinante.',
        tex:
          `${escrever(maior)} + ${escrever(menor)} = ${tr} \\qquad ` +
          `${escrever(maior)} \\times ${escrever(menor)} = ${det}`,
        nota: 'É a melhor forma de verificar a própria resposta sem olhar o gabarito.',
      },
    ],
  };
}

/**
 * A matriz 2×2 inteira que tem os autovalores pedidos.
 *
 * Existe para que os exercícios tenham resposta inteira sem que a matriz seja
 * triangular — se fosse, a resposta estaria na diagonal e a conta não seria
 * feita. A receita é `A = P D P⁻¹` com `P` de determinante 1, que mantém tudo
 * inteiro.
 */
export function matrizComAutovalores(
  primeiro: number,
  segundo: number,
  p: Matriz,
): Matriz | undefined {
  if (determinante(p) !== 1) {
    return undefined;
  }

  const [[p11, p12], [p21, p22]] = [p[0]!, p[1]!] as [readonly number[], readonly number[]];

  // Inversa de uma 2×2 de determinante 1: troca a diagonal e inverte os sinais.
  const inversa: Matriz = [
    [p22!, -p12!],
    [-p21!, p11!],
  ];

  const d: Matriz = [
    [primeiro, 0],
    [0, segundo],
  ];

  const produto = (a: Matriz, b: Matriz): Matriz =>
    a.map((linha) =>
      b[0]!.map((_, j) => linha.reduce((soma, valor, k) => soma + valor * b[k]![j]!, 0)),
    );

  return produto(produto(p, d), inversa);
}
