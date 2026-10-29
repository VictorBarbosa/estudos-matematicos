import { Polinomio } from '@core/math/algebra/polinomio/polinomio';

describe('Polinomio', () => {
  it('guarda os coeficientes do grau zero em diante', () => {
    const p = Polinomio.de(3, -2, 1);

    expect(p.coeficiente(0)).toBe(3);
    expect(p.coeficiente(1)).toBe(-2);
    expect(p.coeficiente(2)).toBe(1);
    expect(p.grau).toBe(2);
  });

  it('descarta zeros à esquerda do maior grau', () => {
    expect(Polinomio.de(1, 2, 0, 0).grau).toBe(1);
    expect(Polinomio.de(0, 0, 0).grau).toBe(0);
    expect(Polinomio.de(0, 0, 0).ehNulo).toBe(true);
  });

  it('avalia corretamente', () => {
    const p = Polinomio.de(1, 2, 3); // 1 + 2x + 3x²

    expect(p.avaliar(0)).toBe(1);
    expect(p.avaliar(1)).toBe(6);
    expect(p.avaliar(2)).toBe(17);
    expect(p.avaliar(-1)).toBe(2);
  });

  it('soma, subtrai e multiplica', () => {
    const a = Polinomio.de(1, 1); // 1 + x
    const b = Polinomio.de(-1, 1); // -1 + x

    expect(a.somar(b).paraTex()).toBe('2x');
    expect(a.subtrair(b).paraTex()).toBe('2');
    // (1+x)(x-1) = x² - 1
    expect(a.multiplicar(b).paraTex()).toBe('x^{2} - 1');
  });

  it('deriva pela regra da potência', () => {
    // 5 + 3x + 2x² -> 3 + 4x
    expect(Polinomio.de(5, 3, 2).derivar().paraTex()).toBe('4x + 3');
    expect(Polinomio.de(7).derivar().ehNulo).toBe(true);
  });

  it('integra, acrescentando a constante', () => {
    // 2x -> x² + C
    expect(Polinomio.de(0, 2).integrar(5).paraTex()).toBe('x^{2} + 5');
  });

  it('derivar a integral devolve o polinômio original', () => {
    const p = Polinomio.de(3, -4, 7);
    expect(p.integrar(9).derivar().paraTex()).toBe(p.paraTex());
  });

  it('escreve em LaTeX omitindo coeficientes 1 e termos nulos', () => {
    expect(Polinomio.de(0, 0, 1).paraTex()).toBe('x^{2}');
    expect(Polinomio.de(-1, 0, 1).paraTex()).toBe('x^{2} - 1');
    expect(Polinomio.de(3, 0, -1).paraTex()).toBe('-x^{2} + 3');
    expect(Polinomio.ZERO.paraTex()).toBe('0');
  });

  it('aceita construção esparsa por grau', () => {
    expect(Polinomio.deGraus({ 0: 1, 3: 2 }).paraTex()).toBe('2x^{3} + 1');
  });
});
