import { ErroMatematico } from '@core/math/tipos/tipos';
import {
  aoMenosUmComPassos,
  arranjosComPassos,
  combinacoes,
  combinacoesComPassos,
  fatorial,
  permutacoesComPassos,
  probabilidadeComPassos,
  probabilidadeConjuntaComPassos,
} from '@core/math/estatistica/contagem/contagem';

describe('contagem', () => {
  it('fatorial cresce como esperado', () => {
    expect(fatorial(0)).toBe(1);
    expect(fatorial(1)).toBe(1);
    expect(fatorial(5)).toBe(120);
    expect(fatorial(10)).toBe(3628800);
  });

  it('recusa fatorial inválido ou fora de precisão', () => {
    expect(() => fatorial(-1)).toThrowError(ErroMatematico);
    expect(() => fatorial(2.5)).toThrowError(ErroMatematico);
    expect(() => fatorial(200)).toThrowError(ErroMatematico);
  });

  it('arranjos contam com ordem', () => {
    expect(arranjosComPassos(5, 2).resultado).toBe(20);
    expect(arranjosComPassos(10, 3).resultado).toBe(720);
  });

  it('arranjo de todos os elementos é a permutação', () => {
    for (const n of [3, 4, 5, 6]) {
      expect(arranjosComPassos(n, n).resultado).toBe(fatorial(n));
    }
  });

  it('combinações contam sem ordem', () => {
    expect(combinacoes(5, 2)).toBe(10);
    expect(combinacoes(10, 3)).toBe(120);
    expect(combinacoes(6, 6)).toBe(1);
    expect(combinacoes(6, 0)).toBe(1);
  });

  it('a combinação é o arranjo dividido por p!', () => {
    for (const [n, p] of [
      [5, 2],
      [8, 3],
      [10, 4],
    ]) {
      expect(combinacoes(n!, p!)).toBeCloseTo(
        arranjosComPassos(n!, p!).resultado / fatorial(p!),
        9,
      );
    }
  });

  it('escolher p é o mesmo que descartar n − p', () => {
    for (const [n, p] of [
      [7, 2],
      [10, 3],
      [12, 5],
    ]) {
      expect(combinacoes(n!, p!)).toBe(combinacoes(n!, n! - p!));
    }
  });

  it('a combinação é sempre um inteiro exato, sem resíduo de ponto flutuante', () => {
    // arranjos/p! é exato na matemática mas não em ponto flutuante: sem
    // arredondamento, C(24,5) saía como 42504.000000000007.
    for (let n = 1; n <= 30; n++) {
      for (let p = 0; p <= n; p++) {
        const valor = combinacoes(n, p);
        expect(Number.isInteger(valor)).toBe(true);
      }
    }
  });

  it('a soma de uma linha do triângulo de Pascal é 2ⁿ', () => {
    for (const n of [4, 6, 8]) {
      let soma = 0;
      for (let p = 0; p <= n; p++) {
        soma += combinacoes(n, p);
      }
      expect(soma).toBe(2 ** n);
    }
  });

  it('recusa escolher mais do que existe', () => {
    expect(() => combinacoesComPassos(3, 5)).toThrowError(ErroMatematico);
    expect(() => arranjosComPassos(3, 5)).toThrowError(ErroMatematico);
  });

  it('permutações com repetição dividem pelas ordens indistinguíveis', () => {
    // ARARA: 5 letras, 3 A e 2 R → 5!/(3!2!) = 10
    expect(permutacoesComPassos(5, [3, 2]).resultado).toBe(10);
    expect(permutacoesComPassos(4).resultado).toBe(24);
  });
});

describe('probabilidade', () => {
  it('fica entre 0 e 1', () => {
    for (const [favoraveis, total] of [
      [1, 6],
      [3, 4],
      [0, 10],
      [10, 10],
    ]) {
      const { resultado } = probabilidadeComPassos(favoraveis!, total!);
      expect(resultado).toBeGreaterThanOrEqual(0);
      expect(resultado).toBeLessThanOrEqual(1);
    }
  });

  it('recusa contagens impossíveis', () => {
    expect(() => probabilidadeComPassos(5, 3)).toThrowError(ErroMatematico);
    expect(() => probabilidadeComPassos(1, 0)).toThrowError(ErroMatematico);
    expect(() => probabilidadeComPassos(-1, 5)).toThrowError(ErroMatematico);
  });

  it('eventos independentes multiplicam', () => {
    const { resultado } = probabilidadeConjuntaComPassos(0.5, 0.5, true);
    expect(resultado).toBeCloseTo(0.25, 9);
  });

  it('sem reposição, a segunda probabilidade muda', () => {
    // Duas bolas vermelhas de 5: 2/5 e depois 1/4.
    const { resultado } = probabilidadeConjuntaComPassos(2 / 5, 2 / 5, false, 1 / 4);
    expect(resultado).toBeCloseTo(0.1, 9);
  });

  it('recusa probabilidade fora de [0, 1]', () => {
    expect(() => probabilidadeConjuntaComPassos(1.5, 0.5, true)).toThrowError(ErroMatematico);
  });

  it('ao menos um é o complementar de nenhum', () => {
    // Um dado, três lançamentos, buscando ao menos um seis.
    const { resultado } = aoMenosUmComPassos(1 / 6, 3);
    expect(resultado).toBeCloseTo(1 - (5 / 6) ** 3, 9);
  });

  it('ao menos um cresce com o número de tentativas', () => {
    let anterior = 0;
    for (let tentativas = 1; tentativas <= 20; tentativas++) {
      const atual = aoMenosUmComPassos(0.1, tentativas).resultado;
      expect(atual).toBeGreaterThan(anterior);
      expect(atual).toBeLessThan(1);
      anterior = atual;
    }
  });

  it('recusa tentativas inválidas', () => {
    expect(() => aoMenosUmComPassos(0.5, 0)).toThrowError(ErroMatematico);
    expect(() => aoMenosUmComPassos(0.5, 1.5)).toThrowError(ErroMatematico);
  });
});
