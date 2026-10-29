import { Polinomio } from '@core/math/algebra/polinomio/polinomio';
import { fatorarComPassos } from '@core/math/algebra/fatoracao/fatoracao';
import { expandirComPassos } from '@core/math/algebra/produtos-notaveis/produtos-notaveis';

describe('expandirComPassos', () => {
  it('expande o quadrado da soma mantendo o termo do meio', () => {
    // (2x + 3)² = 4x² + 12x + 9
    const { resultado } = expandirComPassos('quadrado-da-soma', 2, 3);
    expect(resultado.paraTex()).toBe('4x^{2} + 12x + 9');
  });

  it('expande o quadrado da diferença', () => {
    // (x - 5)² = x² - 10x + 25
    const { resultado } = expandirComPassos('quadrado-da-diferenca', 1, -5);
    expect(resultado.paraTex()).toBe('x^{2} - 10x + 25');
  });

  it('expande a diferença de quadrados sem termo do meio', () => {
    const { resultado } = expandirComPassos('diferenca-de-quadrados', 3, 4);

    expect(resultado.paraTex()).toBe('9x^{2} - 16');
    expect(resultado.coeficiente(1)).toBe(0);
  });

  it('expande o cubo da soma com os coeficientes de Pascal', () => {
    // (x + 1)³ = x³ + 3x² + 3x + 1
    const { resultado } = expandirComPassos('cubo-da-soma', 1, 1);
    expect(resultado.paraTex()).toBe('x^{3} + 3x^{2} + 3x + 1');
  });

  it('a demonstração do quadrado menciona a leitura geométrica', () => {
    const { passos } = expandirComPassos('quadrado-da-soma', 1, 2);
    expect(passos.some((p) => p.descricao.includes('Geometricamente'))).toBe(true);
  });
});

describe('fatorarComPassos', () => {
  it('põe o fator comum em evidência', () => {
    // 6x² + 9x = 3x(2x + 3)
    const { resultado } = fatorarComPassos(Polinomio.de(0, 9, 6));

    expect(resultado.tipo).toBe('fator-comum');
    expect(resultado.tex).toContain('3x');
  });

  it('reconhece diferença de quadrados', () => {
    const { resultado } = fatorarComPassos(Polinomio.de(-16, 0, 9));

    expect(resultado.tipo).toBe('diferenca-de-quadrados');
    expect(resultado.tex).toBe('\\left(3x + 4\\right)\\left(3x - 4\\right)');
  });

  it('reconhece trinômio quadrado perfeito', () => {
    // x² - 6x + 9 = (x - 3)²
    const { resultado } = fatorarComPassos(Polinomio.de(9, -6, 1));

    expect(resultado.tipo).toBe('trinomio-quadrado-perfeito');
    expect(resultado.tex).toBe('\\left(x - 3\\right)^{2}');
  });

  it('fatora trinômio por soma e produto', () => {
    // x² - 5x + 6 = (x - 2)(x - 3)
    const { resultado } = fatorarComPassos(Polinomio.de(6, -5, 1));

    expect(resultado.tipo).toBe('trinomio-soma-produto');
    expect(resultado.tex).toBe('\\left(x - 2\\right)\\left(x - 3\\right)');
  });

  it('admite quando não há fatoração inteira', () => {
    const { resultado } = fatorarComPassos(Polinomio.de(1, 1, 1));
    expect(resultado.tipo).toBe('nao-fatoravel');
  });
});
