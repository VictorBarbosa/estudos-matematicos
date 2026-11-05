import { analisarNumero, proximosEmCasas } from '@core/treino/resposta-numerica/resposta-numerica';

describe('analisarNumero', () => {
  it('lê inteiros e decimais com vírgula ou ponto', () => {
    expect(analisarNumero('42')).toBe(42);
    expect(analisarNumero('-1,5')).toBeCloseTo(-1.5, 12);
    expect(analisarNumero(' 0.75 ')).toBeCloseTo(0.75, 12);
    expect(analisarNumero('+3')).toBe(3);
  });

  it('lê notação científica', () => {
    expect(analisarNumero('1,2e3')).toBeCloseTo(1200, 9);
    expect(analisarNumero('5e-2')).toBeCloseTo(0.05, 12);
  });

  it('lê frações, inclusive negativas e com parênteses', () => {
    expect(analisarNumero('3/4')).toBeCloseTo(0.75, 12);
    expect(analisarNumero('-2/3')).toBeCloseTo(-2 / 3, 12);
    expect(analisarNumero('7/(2*3)')).toBeCloseTo(7 / 6, 12);
  });

  it('lê raízes com e sem parênteses', () => {
    expect(analisarNumero('√2')).toBeCloseTo(Math.SQRT2, 12);
    expect(analisarNumero('sqrt(2)')).toBeCloseTo(Math.SQRT2, 12);
    expect(analisarNumero('raiz de 2')).toBeCloseTo(Math.SQRT2, 12);
    expect(analisarNumero('2√3')).toBeCloseTo(2 * Math.sqrt(3), 12);
    expect(analisarNumero('√3/2')).toBeCloseTo(Math.sqrt(3) / 2, 12);
  });

  it('lê a forma exata das raízes de uma quadrática', () => {
    // (1+√5)/2 é o gabarito de x² − x − 1 = 0: impossível de digitar enquanto
    // o campo só aceitava decimais.
    expect(analisarNumero('(1+√5)/2')).toBeCloseTo((1 + Math.sqrt(5)) / 2, 12);
    expect(analisarNumero('(-3-sqrt(17))/4')).toBeCloseTo((-3 - Math.sqrt(17)) / 4, 12);
  });

  it('lê π e o número e', () => {
    expect(analisarNumero('pi')).toBeCloseTo(Math.PI, 12);
    expect(analisarNumero('π/2')).toBeCloseTo(Math.PI / 2, 12);
    expect(analisarNumero('3π')).toBeCloseTo(3 * Math.PI, 12);
    expect(analisarNumero('e')).toBeCloseTo(Math.E, 12);
  });

  it('respeita a ordem das operações e os parênteses', () => {
    expect(analisarNumero('1+2*3')).toBe(7);
    expect(analisarNumero('(1+2)*3')).toBe(9);
    expect(analisarNumero('2^10')).toBe(1024);
    expect(analisarNumero('-2^2')).toBe(-4);
    expect(analisarNumero('2(1+1)')).toBe(4);
  });

  it('recusa o que não é número, sem lançar', () => {
    for (const entrada of ['', '   ', 'flutua', '3/', '(1+2', '1+', 'x+1', '2.', '√-4', '3 4 5a']) {
      expect(analisarNumero(entrada)).toBeNull();
    }
  });

  it('recusa divisão por zero em vez de devolver infinito', () => {
    expect(analisarNumero('1/0')).toBeNull();
  });
});

describe('proximosEmCasas', () => {
  it('aceita o arredondamento que o enunciado pede', () => {
    const duasCasas = proximosEmCasas(2);

    expect(duasCasas(0.63, 0.6309297535714574)).toBe(true);
    expect(duasCasas(0.64, 0.6309297535714574)).toBe(false);
  });

  it('não aceita erro maior que meia unidade na última casa', () => {
    const tresCasas = proximosEmCasas(3);

    expect(tresCasas(1.2346, 1.235)).toBe(true);
    expect(tresCasas(1.23, 1.235)).toBe(false);
  });

  it('usa a parcela relativa nos valores grandes', () => {
    const comRelativa = proximosEmCasas(2, 1e-4);

    expect(comRelativa(2.7e11, 2.7e11 * 1.00005)).toBe(true);
    expect(comRelativa(2.7e11, 2.7e11 * 1.01)).toBe(false);
  });
});

describe('ponto: decimal ou milhar', () => {
  it('zero milhares não existe, então 0.833 é decimal', () => {
    // Lido como milhar virava 833, e o site respondia «a resposta correta é
    // 0,83» a quem tinha escrito 0,833.
    expect(analisarNumero('0.833')).toBeCloseTo(0.833, 10);
    expect(analisarNumero('0.125')).toBeCloseTo(0.125, 10);
    expect(analisarNumero('-0.714')).toBeCloseTo(-0.714, 10);
  });

  it('o separador de milhar de verdade continua valendo', () => {
    // É a forma que o próprio site escreve o gabarito.
    expect(analisarNumero('50.000.000')).toBe(50_000_000);
    expect(analisarNumero('1.072,5')).toBeCloseTo(1072.5, 10);
    expect(analisarNumero('1.375')).toBe(1375);
  });

  it('o ponto decimal fora do formato de milhar nunca foi ambíguo', () => {
    expect(analisarNumero('1.5')).toBeCloseTo(1.5, 10);
    expect(analisarNumero('2.6667')).toBeCloseTo(2.6667, 10);
  });
});
