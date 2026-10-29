import { criarRng } from '@core/treino/rng/rng';

describe('criarRng', () => {
  it('produz a mesma sequência para a mesma semente', () => {
    const primeira = Array.from({ length: 10 }, () => criarRng(42).proximo());
    const segunda = Array.from({ length: 10 }, () => criarRng(42).proximo());

    expect(primeira).toEqual(segunda);
  });

  it('produz sequências diferentes para sementes diferentes', () => {
    expect(criarRng(1).proximo()).not.toBe(criarRng(2).proximo());
  });

  it('gera valores em [0, 1)', () => {
    const rng = criarRng(7);

    for (let i = 0; i < 500; i++) {
      const valor = rng.proximo();
      expect(valor).toBeGreaterThanOrEqual(0);
      expect(valor).toBeLessThan(1);
    }
  });

  it('respeita os limites de inteiro, inclusive nas pontas', () => {
    const rng = criarRng(99);
    const obtidos = new Set<number>();

    for (let i = 0; i < 500; i++) {
      const valor = rng.inteiro(3, 6);
      expect(Number.isInteger(valor)).toBe(true);
      expect(valor).toBeGreaterThanOrEqual(3);
      expect(valor).toBeLessThanOrEqual(6);
      obtidos.add(valor);
    }

    expect(obtidos).toEqual(new Set([3, 4, 5, 6]));
  });

  it('aceita limites invertidos', () => {
    expect(criarRng(5).inteiro(6, 3)).toBeGreaterThanOrEqual(3);
  });

  it('embaralha sem perder nem duplicar elementos', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const embaralhado = criarRng(123).embaralhar(original);

    expect([...embaralhado].sort((a, b) => a - b)).toEqual(original);
    expect(original).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('recusa escolher de uma lista vazia', () => {
    expect(() => criarRng(1).escolher([])).toThrow();
  });

  it('devolve apenas +1 ou -1 como sinal', () => {
    const rng = criarRng(321);
    for (let i = 0; i < 100; i++) {
      expect(Math.abs(rng.sinal())).toBe(1);
    }
  });
});
