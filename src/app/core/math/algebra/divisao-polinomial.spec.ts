import { ErroMatematico } from '@core/math/tipos';
import { Polinomio } from './polinomio';
import {
  candidatasRacionais,
  dividirComPassos,
  fatorarPorRaizesComPassos,
  raizesRacionais,
  restoPorBinomioComPassos,
} from './divisao-polinomial';

describe('divisão de polinômios', () => {
  it('divide exatamente quando o divisor é fator', () => {
    // (x² - 1) ÷ (x - 1) = x + 1, resto zero.
    const { resultado } = dividirComPassos(Polinomio.de(-1, 0, 1), Polinomio.de(-1, 1));

    expect(resultado.quociente.coeficientes).toEqual([1, 1]);
    expect(resultado.resto.ehNulo).toBe(true);
  });

  it('devolve resto de grau menor que o divisor', () => {
    const dividendo = Polinomio.de(5, 3, 0, 2);
    const divisor = Polinomio.de(1, 1);
    const { resultado } = dividirComPassos(dividendo, divisor);

    expect(resultado.resto.grau).toBeLessThan(divisor.grau);
  });

  it('vale a identidade P = Q·D + R', () => {
    const casos: readonly [Polinomio, Polinomio][] = [
      [Polinomio.de(-6, 11, -6, 1), Polinomio.de(-1, 1)],
      [Polinomio.de(5, 3, 0, 2), Polinomio.de(1, 1)],
      [Polinomio.de(4, 0, 0, 0, 3), Polinomio.de(-2, 0, 1)],
      [Polinomio.de(7, 2), Polinomio.de(1, 1, 1)],
    ];

    for (const [dividendo, divisor] of casos) {
      const { quociente, resto } = dividirComPassos(dividendo, divisor).resultado;
      const reconstruido = quociente.multiplicar(divisor).somar(resto);

      for (const x of [-3, -1, 0, 0.5, 2, 7]) {
        expect(reconstruido.avaliar(x)).toBeCloseTo(dividendo.avaliar(x), 9);
      }
    }
  });

  it('um divisor de grau maior deixa o dividendo como resto', () => {
    const { resultado } = dividirComPassos(Polinomio.de(7, 2), Polinomio.de(1, 1, 1));

    expect(resultado.quociente.ehNulo).toBe(true);
    expect(resultado.resto.coeficientes).toEqual([7, 2]);
  });

  it('recusa divisão por zero', () => {
    expect(() => dividirComPassos(Polinomio.de(1, 1), Polinomio.ZERO)).toThrow(ErroMatematico);
  });
});

describe('teorema do resto', () => {
  it('o resto da divisão por (x − a) é P(a)', () => {
    const p = Polinomio.de(-6, 11, -6, 1);

    for (const a of [-2, 0, 1, 2, 3, 5]) {
      const esperado = p.avaliar(a);
      expect(restoPorBinomioComPassos(p, a).resultado).toBeCloseTo(esperado, 9);

      const { resto } = dividirComPassos(p, Polinomio.de(-a, 1)).resultado;
      expect(resto.avaliar(0)).toBeCloseTo(esperado, 9);
    }
  });

  it('resto zero é anunciado como raiz', () => {
    const { passos } = restoPorBinomioComPassos(Polinomio.de(-6, 11, -6, 1), 1);
    expect(passos.at(-1)?.nota).toContain('raiz');
  });
});

describe('raízes racionais', () => {
  it('as candidatas incluem as raízes verdadeiras', () => {
    // (x-1)(x-2)(x-3) = x³ - 6x² + 11x - 6
    const p = Polinomio.de(-6, 11, -6, 1);

    for (const raiz of [1, 2, 3]) {
      expect(candidatasRacionais(p)).toContain(raiz);
    }
  });

  it('encontra raízes fracionárias quando o líder não é 1', () => {
    // 2x² - 3x + 1 = (2x - 1)(x - 1): raízes 1/2 e 1.
    const encontradas = raizesRacionais(Polinomio.de(1, -3, 2));

    expect(encontradas).toContain(1);
    expect(encontradas.some((r) => Math.abs(r - 0.5) < 1e-9)).toBe(true);
  });

  it('toda raiz devolvida anula o polinômio', () => {
    const polinomios = [
      Polinomio.de(-6, 11, -6, 1),
      Polinomio.de(1, -3, 2),
      Polinomio.de(-4, 0, 1),
      Polinomio.de(6, -5, 1),
    ];

    for (const p of polinomios) {
      for (const raiz of raizesRacionais(p)) {
        expect(p.avaliar(raiz)).toBeCloseTo(0, 9);
      }
    }
  });

  it('termo constante zero significa que zero é raiz', () => {
    expect(raizesRacionais(Polinomio.de(0, -1, 1))).toContain(0);
  });

  it('com termo constante zero, não perde as outras raízes', () => {
    // x(x-1)(x+3) = x³ + 2x² - 3x: as raízes são 0, 1 e -3.
    const encontradas = raizesRacionais(Polinomio.de(0, -3, 2, 1));

    expect([...encontradas].sort((a, b) => a - b)).toEqual([-3, 0, 1]);
  });

  it('fatora corretamente mesmo com x² como fator', () => {
    // x²(x-2) = x³ - 2x²
    const { resultado } = fatorarPorRaizesComPassos(Polinomio.de(0, 0, -2, 1));

    expect([...resultado].sort((a, b) => a - b)).toEqual([0, 0, 2]);
  });

  it('não devolve candidatas para coeficientes não inteiros', () => {
    expect(candidatasRacionais(Polinomio.de(0.5, 1.2))).toEqual([]);
  });

  it('reconhece quem não tem raiz racional', () => {
    // x² - 2 tem raízes ±√2, irracionais.
    expect(raizesRacionais(Polinomio.de(-2, 0, 1))).toEqual([]);
  });
});

describe('fatoração por raízes', () => {
  it('extrai todas as raízes de um produto de binômios', () => {
    const { resultado } = fatorarPorRaizesComPassos(Polinomio.de(-6, 11, -6, 1));

    expect([...resultado].sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });

  it('para no fator sem raiz racional e avisa', () => {
    // (x - 1)(x² - 2) = x³ - x² - 2x + 2
    const { resultado, passos } = fatorarPorRaizesComPassos(Polinomio.de(2, -2, -1, 1));

    expect(resultado).toEqual([1]);
    expect(passos.at(-1)?.descricao).toContain('não tem raiz racional');
  });

  it('não encontra nada quando não há raiz racional', () => {
    const { resultado } = fatorarPorRaizesComPassos(Polinomio.de(-2, 0, 1));
    expect(resultado).toEqual([]);
  });

  it('o produto dos fatores reconstrói o polinômio', () => {
    const p = Polinomio.de(-6, 11, -6, 1);
    const { resultado } = fatorarPorRaizesComPassos(p);

    const reconstruido = resultado.reduce(
      (acumulado, raiz) => acumulado.multiplicar(Polinomio.de(-raiz, 1)),
      Polinomio.de(1),
    );

    for (const x of [-2, 0, 1.5, 4]) {
      expect(reconstruido.avaliar(x)).toBeCloseTo(p.avaliar(x), 9);
    }
  });
});
