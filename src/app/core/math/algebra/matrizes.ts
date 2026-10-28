import { formatar } from '@core/math/algebra/polinomio';
import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos';

/**
 * Matrizes e determinantes.
 *
 * A matriz entra no currículo como tabela de números, mas o que importa para a
 * engenharia é o que ela faz: representar um sistema linear inteiro num só
 * objeto, e descrever transformações do plano. O determinante mede o quanto
 * essa transformação estica a área — e zero significa que ela achatou tudo.
 */

/** Matriz densa, linhas por colunas. */
export type Matriz = readonly (readonly number[])[];

export function dimensoes(m: Matriz): { linhas: number; colunas: number } {
  const linhas = m.length;
  const colunas = m[0]?.length ?? 0;

  if (linhas === 0 || colunas === 0) {
    throw new ErroMatematico('Uma matriz precisa de pelo menos uma linha e uma coluna.');
  }

  if (m.some((linha) => linha.length !== colunas)) {
    throw new ErroMatematico('Todas as linhas devem ter o mesmo número de colunas.');
  }

  return { linhas, colunas };
}

export function matrizParaTex(m: Matriz): string {
  const corpo = m.map((linha) => linha.map((valor) => formatar(valor)).join(' & ')).join(' \\\\ ');
  return `\\begin{pmatrix} ${corpo} \\end{pmatrix}`;
}

export function somarMatrizes(a: Matriz, b: Matriz): Matriz {
  const dimA = dimensoes(a);
  const dimB = dimensoes(b);

  if (dimA.linhas !== dimB.linhas || dimA.colunas !== dimB.colunas) {
    throw new ErroMatematico('Só se somam matrizes de mesma ordem.');
  }

  return a.map((linha, i) => linha.map((valor, j) => valor + b[i]![j]!));
}

export function escalarMatriz(m: Matriz, fator: number): Matriz {
  return m.map((linha) => linha.map((valor) => valor * fator));
}

export function transposta(m: Matriz): Matriz {
  const { linhas, colunas } = dimensoes(m);
  return Array.from({ length: colunas }, (_, j) =>
    Array.from({ length: linhas }, (_, i) => m[i]![j]!),
  );
}

/**
 * Produto de matrizes, com os passos de cada entrada.
 *
 * A regra "linha por coluna" é o que explica por que o produto não comuta e
 * por que as ordens precisam encaixar: cada entrada é um produto escalar.
 */
export function multiplicarComPassos(a: Matriz, b: Matriz): Resolucao<Matriz> {
  const dimA = dimensoes(a);
  const dimB = dimensoes(b);

  if (dimA.colunas !== dimB.linhas) {
    throw new ErroMatematico(
      `Ordens incompatíveis: ${dimA.linhas}×${dimA.colunas} por ${dimB.linhas}×${dimB.colunas}.`,
    );
  }

  const resultado = Array.from({ length: dimA.linhas }, (_, i) =>
    Array.from({ length: dimB.colunas }, (_, j) => {
      let soma = 0;
      for (let k = 0; k < dimA.colunas; k++) {
        soma += a[i]![k]! * b[k]![j]!;
      }
      return soma;
    }),
  );

  const passos: Passo[] = [
    {
      descricao: 'As ordens encaixam: colunas da primeira igualam linhas da segunda.',
      tex: `${dimA.linhas}\\times${dimA.colunas} \\cdot ${dimB.linhas}\\times${dimB.colunas} = ${dimA.linhas}\\times${dimB.colunas}`,
    },
    {
      descricao: 'Cada entrada do produto é a linha de A vezes a coluna de B, termo a termo.',
      tex: 'c_{ij} = \\sum_k a_{ik} b_{kj}',
      nota: 'É um produto escalar entre uma linha e uma coluna.',
    },
  ];

  // Mostra a conta da primeira entrada, que é o padrão de todas as outras.
  const primeira = Array.from(
    { length: dimA.colunas },
    (_, k) => `${formatar(a[0]![k]!)}\\cdot${formatar(b[k]![0]!)}`,
  ).join(' + ');

  passos.push(
    {
      descricao: 'Por exemplo, a entrada da primeira linha e primeira coluna.',
      tex: `c_{11} = ${primeira} = ${formatar(resultado[0]![0]!)}`,
    },
    {
      descricao: 'Repetindo para todas as posições.',
      tex: matrizParaTex(resultado),
    },
  );

  return { resultado, passos };
}

/**
 * Determinante por expansão em cofatores, com os passos.
 *
 * Para 2×2 é a diferença dos produtos das diagonais; a partir de 3×3 a
 * expansão reduz a ordem recursivamente. A interpretação é sempre a mesma:
 * o fator pelo qual áreas (ou volumes) são multiplicados.
 */
export function determinanteComPassos(m: Matriz): Resolucao<number> {
  const { linhas, colunas } = dimensoes(m);

  if (linhas !== colunas) {
    throw new ErroMatematico('O determinante só existe para matrizes quadradas.');
  }

  if (linhas === 1) {
    return {
      resultado: m[0]![0]!,
      passos: [
        { descricao: 'Numa matriz 1×1, o determinante é o próprio número.', tex: formatar(m[0]![0]!) },
      ],
    };
  }

  if (linhas === 2) {
    const [[a, b], [c, d]] = m as [[number, number], [number, number]];
    const resultado = a * d - b * c;

    return {
      resultado,
      passos: [
        {
          descricao: 'Numa 2×2, o determinante é a diferença dos produtos das diagonais.',
          tex: `\\begin{vmatrix} ${formatar(a)} & ${formatar(b)} \\\\ ${formatar(c)} & ${formatar(d)} \\end{vmatrix} = ad - bc`,
        },
        {
          descricao: 'Substituímos os valores.',
          tex: `= ${formatar(a)}\\cdot${formatar(d)} - ${formatar(b)}\\cdot${formatar(c)} = ${formatar(resultado)}`,
          nota:
            Math.abs(resultado) < 1e-12
              ? 'Determinante zero: as linhas são proporcionais, e a matriz achata o plano.'
              : 'Em módulo, é a área do paralelogramo formado pelas linhas.',
        },
      ],
    };
  }

  // Expansão pela primeira linha: reduz a ordem até cair no caso 2×2.
  let resultado = 0;
  const termos: string[] = [];

  for (let j = 0; j < colunas; j++) {
    const sinal = j % 2 === 0 ? 1 : -1;
    const menor = m
      .slice(1)
      .map((linha) => linha.filter((_, coluna) => coluna !== j));

    const cofator = sinal * determinanteComPassos(menor).resultado;
    resultado += m[0]![j]! * cofator;

    termos.push(
      `${sinal === 1 ? '+' : '-'} ${formatar(Math.abs(m[0]![j]!))} \\cdot ${formatar(Math.abs(cofator))}`,
    );
  }

  return {
    resultado,
    passos: [
      {
        descricao: 'Expandimos pela primeira linha, alternando os sinais.',
        tex: '\\det A = \\sum_j (-1)^{1+j} a_{1j} \\det A_{1j}',
      },
      {
        descricao: 'Cada cofator é o determinante da matriz que sobra ao riscar linha e coluna.',
        tex: termos.join(' ').replace(/^\+ /, ''),
        nota: 'A ordem cai de n para n − 1 a cada expansão, até chegar ao caso 2×2.',
      },
      {
        descricao: 'Somando os termos.',
        tex: `\\det A = ${formatar(resultado)}`,
        nota:
          Math.abs(resultado) < 1e-12
            ? 'Determinante nulo: o sistema associado não tem solução única.'
            : undefined,
      },
    ],
  };
}

export function determinante(m: Matriz): number {
  return determinanteComPassos(m).resultado;
}

export interface SolucaoCramer {
  readonly valores: readonly number[];
  readonly determinantePrincipal: number;
}

/**
 * Regra de Cramer: resolve o sistema trocando colunas pelo vetor de constantes.
 *
 * Mostra concretamente para que serve o determinante: ele aparece no
 * denominador, e por isso um determinante nulo significa que não há solução
 * única.
 */
export function cramerComPassos(
  coeficientes: Matriz,
  constantes: readonly number[],
): Resolucao<SolucaoCramer> {
  const { linhas, colunas } = dimensoes(coeficientes);

  if (linhas !== colunas) {
    throw new ErroMatematico('A regra de Cramer exige uma matriz quadrada de coeficientes.');
  }

  if (constantes.length !== linhas) {
    throw new ErroMatematico('O vetor de constantes deve ter uma entrada por equação.');
  }

  const principal = determinante(coeficientes);

  if (Math.abs(principal) < 1e-12) {
    throw new ErroMatematico(
      'Determinante principal nulo: o sistema não tem solução única (impossível ou indeterminado).',
    );
  }

  const passos: Passo[] = [
    {
      descricao: 'O determinante principal vem da matriz dos coeficientes.',
      tex: `D = ${formatar(principal)}`,
    },
  ];

  const valores: number[] = [];

  for (let j = 0; j < colunas; j++) {
    const substituida = coeficientes.map((linha, i) =>
      linha.map((valor, coluna) => (coluna === j ? constantes[i]! : valor)),
    );

    const parcial = determinante(substituida);
    const valor = parcial / principal;
    valores.push(valor);

    passos.push({
      descricao: `Trocamos a coluna ${j + 1} pelas constantes e dividimos pelo principal.`,
      tex: `x_{${j + 1}} = \\frac{${formatar(parcial)}}{${formatar(principal)}} = ${formatar(Number(valor.toFixed(6)))}`,
    });
  }

  passos.push({
    descricao: 'O determinante no denominador é o que exige que ele não seja zero.',
    tex: `D \\ne 0`,
    nota: 'Determinante nulo significaria retas paralelas ou coincidentes.',
  });

  return { resultado: { valores, determinantePrincipal: principal }, passos };
}
