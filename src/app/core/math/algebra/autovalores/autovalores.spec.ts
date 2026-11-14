import {
  autovaloresComPassos,
  autovaloresDeTriangular,
  autovalores,
  autovetorPara,
  matrizComAutovalores,
  polinomioCaracteristicoTex,
  traco,
} from '@core/math/algebra/autovalores/autovalores';

describe('autovalores de 2×2', () => {
  it('o traço é a soma da diagonal', () => {
    expect(
      traco([
        [3, 1],
        [0, 5],
      ]),
    ).toBe(8);
  });

  it('acha os autovalores de uma matriz simples', () => {
    // λ² − 5λ + 6 = 0 → 3 e 2.
    expect(
      autovalores([
        [4, -1],
        [2, 1],
      ]),
    ).toEqual([3, 2]);
  });

  /**
   * As duas identidades que servem de conferência: a soma é o traço e o
   * produto é o determinante. Valem sempre, e é por isso que se pode verificar
   * a própria resposta.
   */
  it('somam o traço e multiplicam o determinante', () => {
    const m = [
      [5, 2],
      [2, 2],
    ];
    const [a, b] = autovalores(m)! as [number, number];

    expect(a + b).toBeCloseTo(traco(m), 10);
    expect(a * b).toBeCloseTo(5 * 2 - 2 * 2, 10);
  });

  /**
   * Discriminante negativo não é falha de conta: é a matriz GIRAR. Nenhuma
   * direção sobrevive a uma rotação de 90°, e devolver um número real seria
   * mentir sobre a geometria.
   */
  it('recusa a matriz que gira', () => {
    expect(
      autovalores([
        [0, -1],
        [1, 0],
      ]),
    ).toBeUndefined();
  });

  it('o polinômio característico sai com os sinais certos', () => {
    expect(
      polinomioCaracteristicoTex([
        [4, -1],
        [2, 1],
      ]),
    ).toBe('\\lambda^2 - 5\\lambda + 6');

    expect(
      polinomioCaracteristicoTex([
        [0, 1],
        [1, 0],
      ]),
    ).toBe('\\lambda^2 - 1');
  });
});

describe('autovetores', () => {
  /** A definição: A·v tem de sair igual a λ·v, coordenada por coordenada. */
  it('o autovetor satisfaz A·v = λ·v', () => {
    const m = [
      [4, -1],
      [2, 1],
    ];

    for (const autovalor of autovalores(m)!) {
      const v = autovetorPara(m, autovalor)!;
      const aplicado = m.map((linha) => linha.reduce((soma, valor, i) => soma + valor * v[i]!, 0));

      expect(aplicado[0]).toBeCloseTo(autovalor * v[0]!, 8);
      expect(aplicado[1]).toBeCloseTo(autovalor * v[1]!, 8);
    }
  });

  it('o representante vem reduzido', () => {
    const m = [
      [3, 4],
      [0, 1],
    ];

    // Para λ = 1: (b, λ − a) = (4, −2), que reduz para (2, −1).
    expect(autovetorPara(m, 1)).toEqual([2, -1]);
  });

  it('numa matriz diagonal, os eixos são os autovetores', () => {
    const m = [
      [2, 0],
      [0, 7],
    ];

    expect(autovetorPara(m, 2)).toEqual([1, 0]);
    expect(autovetorPara(m, 7)).toEqual([0, 1]);
  });

  it('o autovetor nunca é nulo', () => {
    const m = [
      [5, 2],
      [2, 2],
    ];

    for (const autovalor of autovalores(m)!) {
      const v = autovetorPara(m, autovalor)!;

      expect(
        v.some((valor) => valor !== 0),
        String(v),
      ).toBe(true);
    }
  });
});

describe('matriz triangular', () => {
  /** O motivo de todo o esforço de diagonalizar: as raízes saem de graça. */
  it('os autovalores estão na diagonal', () => {
    expect(
      autovaloresDeTriangular([
        [2, 5, 1],
        [0, 7, 3],
        [0, 0, 4],
      ]),
    ).toEqual([7, 4, 2]);
  });

  it('vale também para a triangular inferior', () => {
    expect(
      autovaloresDeTriangular([
        [3, 0],
        [9, 1],
      ]),
    ).toEqual([3, 1]);
  });

  it('recusa a matriz que não é triangular', () => {
    expect(
      autovaloresDeTriangular([
        [1, 2],
        [3, 4],
      ]),
    ).toBeUndefined();
  });
});

describe('construir a matriz a partir dos autovalores', () => {
  /**
   * A receita A = P D P⁻¹ com det(P) = 1 mantém tudo inteiro, e a matriz sai
   * NÃO triangular — se fosse triangular, a resposta estaria na diagonal e o
   * exercício não cobraria conta nenhuma.
   */
  it('a matriz construída tem os autovalores pedidos', () => {
    const p = [
      [1, 1],
      [1, 2],
    ];

    for (const [primeiro, segundo] of [
      [3, 1],
      [5, 2],
      [4, -1],
    ] as const) {
      const m = matrizComAutovalores(primeiro, segundo, p)!;

      expect(m.flat().every(Number.isInteger), String(m)).toBe(true);
      expect(autovalores(m)).toEqual([primeiro, segundo]);
      expect(m[0]![1], String(m)).not.toBe(0);
    }
  });

  it('recusa P de determinante diferente de um', () => {
    expect(
      matrizComAutovalores(3, 1, [
        [2, 0],
        [0, 2],
      ]),
    ).toBeUndefined();
  });
});

describe('a resolução', () => {
  it('passa pelo polinômio e termina na conferência', () => {
    const { resultado, passos } = autovaloresComPassos([
      [4, -1],
      [2, 1],
    ])!;

    expect(resultado).toEqual([3, 2]);
    expect(passos).toHaveLength(5);
    expect(passos[2]!.tex).toContain('\\lambda^2');
    expect(passos[4]!.tex).toContain('= 5');
  });

  it('devolve indefinido quando a matriz gira', () => {
    expect(
      autovaloresComPassos([
        [0, -1],
        [1, 0],
      ]),
    ).toBeUndefined();
  });
});
