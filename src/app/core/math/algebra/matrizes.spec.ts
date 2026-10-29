import { ErroMatematico } from '@core/math/tipos';
import {
  cramerComPassos,
  determinante,
  determinanteComPassos,
  dimensoes,
  escalarMatriz,
  multiplicarComPassos,
  somarMatrizes,
  transposta,
} from './matrizes';

describe('operações com matrizes', () => {
  it('exige linhas de mesmo tamanho', () => {
    expect(() => dimensoes([[1, 2], [3]])).toThrowError(ErroMatematico);
    expect(() => dimensoes([])).toThrowError(ErroMatematico);
  });

  it('soma entrada por entrada', () => {
    expect(
      somarMatrizes(
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
      ),
    ).toEqual([
      [6, 8],
      [10, 12],
    ]);
  });

  it('não soma matrizes de ordens diferentes', () => {
    expect(() => somarMatrizes([[1, 2]], [[1], [2]])).toThrowError(ErroMatematico);
  });

  it('a transposta da transposta é a original', () => {
    const m = [
      [1, 2, 3],
      [4, 5, 6],
    ];

    expect(transposta(transposta(m))).toEqual(m);
    expect(dimensoes(transposta(m))).toEqual({ linhas: 3, colunas: 2 });
  });

  it('multiplica linha por coluna', () => {
    const { resultado } = multiplicarComPassos(
      [
        [1, 2],
        [3, 4],
      ],
      [
        [5, 6],
        [7, 8],
      ],
    );

    expect(resultado).toEqual([
      [19, 22],
      [43, 50],
    ]);
  });

  it('o produto não é comutativo', () => {
    const a = [
      [1, 2],
      [3, 4],
    ];
    const b = [
      [0, 1],
      [1, 0],
    ];

    expect(multiplicarComPassos(a, b).resultado).not.toEqual(
      multiplicarComPassos(b, a).resultado,
    );
  });

  it('a identidade não altera a matriz', () => {
    const a = [
      [2, -1],
      [5, 3],
    ];
    const identidade = [
      [1, 0],
      [0, 1],
    ];

    expect(multiplicarComPassos(a, identidade).resultado).toEqual(a);
  });

  it('recusa ordens incompatíveis', () => {
    expect(() => multiplicarComPassos([[1, 2]], [[1, 2]])).toThrowError(ErroMatematico);
  });

  it('escalar multiplica todas as entradas', () => {
    expect(escalarMatriz([[1, -2]], 3)).toEqual([[3, -6]]);
  });
});

describe('determinante', () => {
  it('2×2 é a diferença dos produtos das diagonais', () => {
    expect(
      determinante([
        [3, 1],
        [2, 4],
      ]),
    ).toBe(10);
  });

  it('é zero quando as linhas são proporcionais', () => {
    const { resultado, passos } = determinanteComPassos([
      [2, 4],
      [1, 2],
    ]);

    expect(resultado).toBe(0);
    expect(passos.at(-1)?.nota).toContain('achata');
  });

  it('3×3 confere com a regra de Sarrus', () => {
    const m = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 10],
    ];

    // Sarrus: 1(50-48) - 2(40-42) + 3(32-35) = 2 + 4 - 9 = -3
    expect(determinante(m)).toBeCloseTo(-3, 9);
  });

  it('a identidade tem determinante 1 em qualquer ordem', () => {
    for (const n of [1, 2, 3, 4]) {
      const identidade = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
      );

      expect(determinante(identidade)).toBeCloseTo(1, 9);
    }
  });

  it('trocar duas linhas inverte o sinal', () => {
    const m = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 10],
    ];
    const trocada = [m[1]!, m[0]!, m[2]!];

    expect(determinante(trocada)).toBeCloseTo(-determinante(m), 9);
  });

  it('o determinante do produto é o produto dos determinantes', () => {
    const a = [
      [2, 1],
      [1, 3],
    ];
    const b = [
      [0, -1],
      [4, 2],
    ];

    const produto = multiplicarComPassos(a, b).resultado;
    expect(determinante(produto)).toBeCloseTo(determinante(a) * determinante(b), 9);
  });

  it('só existe para matrizes quadradas', () => {
    expect(() => determinanteComPassos([[1, 2, 3]])).toThrowError(ErroMatematico);
  });
});

describe('regra de Cramer', () => {
  it('resolve um sistema 2×2', () => {
    // x + y = 5 ; x - y = 1 → x = 3, y = 2
    const { resultado } = cramerComPassos(
      [
        [1, 1],
        [1, -1],
      ],
      [5, 1],
    );

    expect(resultado.valores[0]).toBeCloseTo(3, 9);
    expect(resultado.valores[1]).toBeCloseTo(2, 9);
  });

  it('a solução satisfaz todas as equações', () => {
    const coeficientes = [
      [2, 3, -1],
      [1, -1, 2],
      [3, 1, 1],
    ];
    const constantes = [5, 3, 8];

    const { valores } = cramerComPassos(coeficientes, constantes).resultado;

    coeficientes.forEach((linha, i) => {
      const soma = linha.reduce((total, coeficiente, j) => total + coeficiente * valores[j]!, 0);
      expect(soma).toBeCloseTo(constantes[i]!, 8);
    });
  });

  it('recusa sistema com determinante nulo', () => {
    expect(() =>
      cramerComPassos(
        [
          [1, 2],
          [2, 4],
        ],
        [3, 6],
      ),
    ).toThrowError(ErroMatematico);
  });

  it('exige uma constante por equação', () => {
    expect(() =>
      cramerComPassos(
        [
          [1, 1],
          [1, -1],
        ],
        [5],
      ),
    ).toThrowError(ErroMatematico);
  });
});
