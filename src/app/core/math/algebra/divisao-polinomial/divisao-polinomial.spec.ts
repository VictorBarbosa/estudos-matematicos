import { ErroMatematico } from '@core/math/tipos/tipos';
import { Polinomio } from '@core/math/algebra/polinomio/polinomio';
import {
  candidatasRacionais,
  dividirComPassos,
  fatorarPorRaizesComPassos,
  raizesRacionais,
  restoPorBinomioComPassos,
} from '@core/math/algebra/divisao-polinomial/divisao-polinomial';

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
    expect(() => dividirComPassos(Polinomio.de(1, 1), Polinomio.ZERO)).toThrowError(ErroMatematico);
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

  it('a resolução passa por cada fase, uma mudança de cada vez', () => {
    // x³ + 4x² - 3x - 2 dividido por (x + 1). Sete passos: dizer quem é quem,
    // achar o -1, apagar o quociente, substituir, elevar, multiplicar, somar.
    const { passos } = restoPorBinomioComPassos(Polinomio.de(-2, -3, 4, 1), -1);

    expect(passos.map((passo) => passo.tex)).toEqual([
      '\\underbrace{x^{3} + 4x^{2} - 3x - 2}_{P(x)} = ' +
        'Q(x)\\underbrace{\\left(x + 1\\right)}_{\\text{divisor}} + R',
      'x + 1 = 0 \\;\\Longrightarrow\\; x = -1',
      'P(-1) = Q(-1) \\cdot 0 + R = R',
      'P(-1) = (-1)^{3} + 4(-1)^{2} - 3(-1) - 2',
      'P(-1) = -1 + 4 \\cdot 1 - 3(-1) - 2',
      'P(-1) = -1 + 4 + 3 - 2',
      'R = -1 + 4 + 3 - 2 = 3 + 3 - 2 = 6 - 2 = 4',
    ]);
  });

  it('diz de onde vem o número que zera o divisor', () => {
    // O -1 aparecia do nada numa divisão por (x + 1).
    const { passos } = restoPorBinomioComPassos(Polinomio.de(-2, -3, 4, 1), -1);

    expect(passos[1]?.descricao).toContain('zera o divisor');
    expect(passos[1]?.nota).toContain('pede -1, e não 1');
  });

  it('explica o sinal da potência e o do produto', () => {
    const { passos } = restoPorBinomioComPassos(Polinomio.de(-2, -3, 4, 1), -1);

    expect(passos[4]?.nota).toBe(
      'Base negativa: expoente par dá positivo, ímpar dá negativo — (-1)² = 1, (-1)³ = -1.',
    );
    expect(passos[5]?.nota).toBe('Menos vezes menos dá mais: -3 · (-1) = 3, que entra somando.');
  });

  it('o número vai entre parênteses, senão a potência de negativo troca de sinal', () => {
    // Sem parênteses, `-2^{3}` seria -(2³); o certo é (-2)³.
    const { passos } = restoPorBinomioComPassos(Polinomio.de(1, 0, 0, 1), -2);

    expect(passos.map((passo) => passo.tex).slice(3)).toEqual([
      'P(-2) = (-2)^{3} + 1',
      'P(-2) = -8 + 1',
      'R = -8 + 1 = -7',
    ]);
  });

  it('a fase que não mudaria nada é descartada', () => {
    // 2x + 1 em x = 3: não há potência para resolver, só o produto.
    const { passos } = restoPorBinomioComPassos(Polinomio.de(1, 2), 3);

    expect(passos.map((passo) => passo.tex).slice(3)).toEqual([
      'P(3) = 2(3) + 1',
      'P(3) = 6 + 1',
      'R = 6 + 1 = 7',
    ]);
  });

  it('com um termo só a conta é imediata e não vira quatro linhas', () => {
    const { passos } = restoPorBinomioComPassos(Polinomio.de(7), 4);

    expect(passos).toHaveLength(4);
    expect(passos.at(-1)?.tex).toBe('R = P(4) = 7');
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
