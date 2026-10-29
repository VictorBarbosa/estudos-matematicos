import { ErroMatematico } from '@core/math/tipos/tipos';
import {
  ajustarRetaComPassos,
  desvioPadraoComPassos,
  mediaComPassos,
  propagarProdutoComPassos,
  propagarSomaComPassos,
  resumirAmostra,
} from '@core/math/estatistica/descritiva/descritiva';

describe('estatística descritiva', () => {
  it('a média é a soma dividida pela quantidade', () => {
    expect(mediaComPassos([2, 4, 6]).resultado).toBeCloseTo(4, 9);
    expect(mediaComPassos([10]).resultado).toBeCloseTo(10, 9);
  });

  it('recusa amostra vazia', () => {
    expect(() => mediaComPassos([])).toThrowError(ErroMatematico);
    expect(() => resumirAmostra([])).toThrowError(ErroMatematico);
  });

  it('o desvio padrão é zero quando todas as medidas são iguais', () => {
    expect(desvioPadraoComPassos([5, 5, 5, 5]).resultado).toBeCloseTo(0, 12);
  });

  it('o desvio padrão amostral divide por n − 1', () => {
    // Para [2, 4, 4, 4, 5, 5, 7, 9]: média 5, soma dos quadrados 32, s² = 32/7
    const { resultado } = desvioPadraoComPassos([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(resultado).toBeCloseTo(Math.sqrt(32 / 7), 9);
  });

  it('exige ao menos duas medidas para o desvio', () => {
    expect(() => desvioPadraoComPassos([3])).toThrowError(ErroMatematico);
  });

  it('a mediana não se deixa levar por um valor extremo', () => {
    const comum = resumirAmostra([10, 11, 12, 13, 14]);
    const comOutlier = resumirAmostra([10, 11, 12, 13, 1000]);

    expect(comOutlier.mediana).toBe(comum.mediana);
    expect(comOutlier.media).toBeGreaterThan(comum.media * 5);
  });

  it('a mediana de uma amostra par é a média dos centrais', () => {
    expect(resumirAmostra([1, 2, 3, 4]).mediana).toBeCloseTo(2.5, 9);
  });

  it('a incerteza da média é o desvio dividido pela raiz de n', () => {
    const amostras: readonly number[][] = [
      [9, 10, 11],
      [2, 4, 4, 4, 5, 5, 7, 9],
      [1.5, 1.7, 1.6, 1.55, 1.62],
    ];

    for (const valores of amostras) {
      const resumo = resumirAmostra(valores);

      expect(resumo.incertezaDaMedia).toBeCloseTo(
        resumo.desvioPadrao / Math.sqrt(valores.length),
        9,
      );
      // Medir mais vezes nunca piora a estimativa da média.
      expect(resumo.incertezaDaMedia).toBeLessThanOrEqual(resumo.desvioPadrao + 1e-12);
    }
  });

  it('mais medidas da mesma dispersão reduzem a incerteza da média', () => {
    const base = [9, 10, 11];
    const repetida = [...base, ...base, ...base, ...base];

    // Repetir a amostra mantém a dispersão aproximada e quadruplica n, então a
    // incerteza da média cai perto da metade — não exatamente, porque o
    // desvio amostral divide por n − 1.
    expect(resumirAmostra(repetida).incertezaDaMedia).toBeLessThan(
      resumirAmostra(base).incertezaDaMedia * 0.6,
    );
  });
});

describe('ajuste de reta', () => {
  it('encontra exatamente a reta de pontos colineares', () => {
    const pontos = [0, 1, 2, 3, 4].map((x) => ({ x, y: 3 * x + 2 }));
    const { resultado } = ajustarRetaComPassos(pontos);

    expect(resultado.inclinacao).toBeCloseTo(3, 9);
    expect(resultado.intercepto).toBeCloseTo(2, 9);
    expect(resultado.r2).toBeCloseTo(1, 9);
  });

  it('o R² cai quando os pontos se dispersam', () => {
    const limpo = ajustarRetaComPassos([
      { x: 1, y: 2 },
      { x: 2, y: 4 },
      { x: 3, y: 6 },
    ]).resultado;

    const ruidoso = ajustarRetaComPassos([
      { x: 1, y: 2 },
      { x: 2, y: 9 },
      { x: 3, y: 6 },
    ]).resultado;

    expect(limpo.r2).toBeGreaterThan(ruidoso.r2);
  });

  it('a reta passa pelo centro de massa dos pontos', () => {
    const pontos = [
      { x: 1, y: 3 },
      { x: 2, y: 5 },
      { x: 4, y: 10 },
      { x: 5, y: 11 },
    ];

    const { inclinacao, intercepto } = ajustarRetaComPassos(pontos).resultado;
    const mediaX = pontos.reduce((t, p) => t + p.x, 0) / pontos.length;
    const mediaY = pontos.reduce((t, p) => t + p.y, 0) / pontos.length;

    expect(inclinacao * mediaX + intercepto).toBeCloseTo(mediaY, 9);
  });

  it('recusa pontos insuficientes ou verticais', () => {
    expect(() => ajustarRetaComPassos([{ x: 1, y: 1 }])).toThrowError(ErroMatematico);
    expect(() =>
      ajustarRetaComPassos([
        { x: 2, y: 1 },
        { x: 2, y: 5 },
      ]),
    ).toThrowError(ErroMatematico);
  });
});

describe('propagação de incerteza', () => {
  it('numa soma, as incertezas absolutas se combinam em quadratura', () => {
    const { resultado } = propagarSomaComPassos([3, 4]);
    expect(resultado).toBeCloseTo(5, 9);
  });

  it('a combinação em quadratura é menor que a soma direta', () => {
    const incertezas = [0.2, 0.3, 0.1];
    const combinada = propagarSomaComPassos(incertezas).resultado;
    const somaDireta = incertezas.reduce((total, valor) => total + valor, 0);

    expect(combinada).toBeLessThan(somaDireta);
  });

  it('recusa incerteza negativa', () => {
    expect(() => propagarSomaComPassos([-1])).toThrowError(ErroMatematico);
  });

  it('num produto, as incertezas relativas se combinam', () => {
    // A = b·h com b = 10 ± 0,1 e h = 20 ± 0,2: relativas de 1% cada.
    const { resultado } = propagarProdutoComPassos(
      [
        { valor: 10, incerteza: 0.1 },
        { valor: 20, incerteza: 0.2 },
      ],
      200,
    );

    expect(resultado / 200).toBeCloseTo(Math.sqrt(0.01 ** 2 + 0.01 ** 2), 9);
  });

  it('o expoente dobra o peso da incerteza relativa', () => {
    const linear = propagarProdutoComPassos([{ valor: 10, incerteza: 0.1 }], 10).resultado / 10;
    const quadratico =
      propagarProdutoComPassos([{ valor: 10, incerteza: 0.1, expoente: 2 }], 100).resultado / 100;

    expect(quadratico).toBeCloseTo(2 * linear, 9);
  });

  it('recusa medida nula', () => {
    expect(() => propagarProdutoComPassos([{ valor: 0, incerteza: 0.1 }], 1)).toThrowError(
      ErroMatematico,
    );
  });
});
