import { ErroMatematico } from '@core/math/tipos';
import {
  divisores,
  ehPrimo,
  fatoracaoParaTex,
  fatorar,
  mdc,
  mdcLista,
  mmc,
  mmcLista,
} from './inteiros';

describe('mdc', () => {
  it('calcula o máximo divisor comum', () => {
    expect(mdc(12, 18)).toBe(6);
    expect(mdc(18, 12)).toBe(6);
    expect(mdc(7, 13)).toBe(1);
    expect(mdc(100, 100)).toBe(100);
  });

  it('ignora o sinal, devolvendo sempre um valor não negativo', () => {
    expect(mdc(-12, 18)).toBe(6);
    expect(mdc(-12, -18)).toBe(6);
  });

  it('trata o zero como elemento neutro', () => {
    expect(mdc(0, 5)).toBe(5);
    expect(mdc(5, 0)).toBe(5);
    expect(mdc(0, 0)).toBe(0);
  });

  it('recusa valores não inteiros', () => {
    expect(() => mdc(1.5, 2)).toThrow(ErroMatematico);
  });
});

describe('mmc', () => {
  it('calcula o mínimo múltiplo comum', () => {
    expect(mmc(4, 6)).toBe(12);
    expect(mmc(12, 18)).toBe(36);
    expect(mmc(3, 5)).toBe(15);
    expect(mmc(4, 8)).toBe(8);
  });

  it('é zero quando um dos valores é zero', () => {
    expect(mmc(0, 7)).toBe(0);
  });

  it('não perde precisão com números grandes', () => {
    expect(mmc(123456, 789012)).toBe(8117355456);
  });
});

describe('listas', () => {
  it('estende mdc e mmc a várias entradas', () => {
    expect(mdcLista([12, 18, 24])).toBe(6);
    expect(mmcLista([2, 3, 4])).toBe(12);
    expect(mmcLista([])).toBe(1);
  });
});

describe('fatorar', () => {
  it('decompõe em primos com seus expoentes', () => {
    expect(fatorar(12)).toEqual([
      { primo: 2, expoente: 2 },
      { primo: 3, expoente: 1 },
    ]);
    expect(fatorar(97)).toEqual([{ primo: 97, expoente: 1 }]);
  });

  it('devolve lista vazia para 0, 1 e -1', () => {
    expect(fatorar(0)).toEqual([]);
    expect(fatorar(1)).toEqual([]);
    expect(fatorar(-1)).toEqual([]);
  });

  it('escreve a fatoração em LaTeX', () => {
    expect(fatoracaoParaTex(12)).toBe('2^{2} \\cdot 3');
    expect(fatoracaoParaTex(7)).toBe('7');
  });
});

describe('ehPrimo', () => {
  it('reconhece primos e compostos', () => {
    expect([2, 3, 5, 7, 11, 97].every(ehPrimo)).toBe(true);
    expect([0, 1, 4, 9, 91, 100].some(ehPrimo)).toBe(false);
  });
});

describe('divisores', () => {
  it('lista os divisores positivos em ordem crescente', () => {
    expect(divisores(12)).toEqual([1, 2, 3, 4, 6, 12]);
    expect(divisores(16)).toEqual([1, 2, 4, 8, 16]);
    expect(divisores(13)).toEqual([1, 13]);
  });

  it('recusa o zero, que tem infinitos divisores', () => {
    expect(() => divisores(0)).toThrow(ErroMatematico);
  });
});
