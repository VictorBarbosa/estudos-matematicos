import { Polinomio } from '@core/math/algebra/polinomio';
import { derivadaNumerica, derivarPolinomioComPassos, pontosCriticos } from './derivadas';
import {
  integralNumerica,
  integrarPolinomioComPassos,
  somaDeRiemann,
  teoremaFundamentalComPassos,
} from './integrais';
import { ehContinua, limitesLaterais, limiteNoInfinito } from './limites';
import { somaComPassos, somaInfinitaComPassos, termoGeral } from './sequencias';

describe('sequências', () => {
  it('calcula o termo geral da PA e da PG', () => {
    expect(termoGeral({ primeiro: 2, razao: 3, geometrica: false }, 5)).toBe(14);
    expect(termoGeral({ primeiro: 2, razao: 3, geometrica: true }, 4)).toBe(54);
  });

  it('soma a PA pelo truque de Gauss', () => {
    // 1 + 2 + ... + 100 = 5050
    const { resultado } = somaComPassos({ primeiro: 1, razao: 1, geometrica: false }, 100);
    expect(resultado).toBe(5050);
  });

  it('soma a PG pela fórmula do cancelamento', () => {
    // 1 + 2 + 4 + 8 + 16 = 31
    const { resultado } = somaComPassos({ primeiro: 1, razao: 2, geometrica: true }, 5);
    expect(resultado).toBe(31);
  });

  it('a soma infinita converge apenas quando |q| < 1', () => {
    expect(somaInfinitaComPassos(1, 0.5).resultado).toBe(2);
    expect(somaInfinitaComPassos(1, 2).resultado).toBeNull();
    expect(somaInfinitaComPassos(1, -0.5).resultado).toBeCloseTo(2 / 3, 12);
  });
});

describe('limites', () => {
  it('encontra o limite de uma função contínua', () => {
    const { existe, valor } = limitesLaterais((x) => x * x, 3);

    expect(existe).toBe(true);
    expect(valor).toBeCloseTo(9, 3);
  });

  it('resolve a indeterminação 0/0 de (x²−1)/(x−1)', () => {
    // A função não existe em x = 1, mas o limite é 2.
    const f = (x: number) => (x * x - 1) / (x - 1);
    const { existe, valor } = limitesLaterais(f, 1);

    expect(Number.isFinite(f(1))).toBe(false);
    expect(existe).toBe(true);
    expect(valor).toBeCloseTo(2, 3);
  });

  it('detecta quando os limites laterais discordam', () => {
    // A função degrau salta em zero.
    const { existe } = limitesLaterais((x) => (x < 0 ? -1 : 1), 0);
    expect(existe).toBe(false);
  });

  it('calcula limites no infinito', () => {
    expect(limiteNoInfinito((x) => 1 / x)).toBeCloseTo(0, 5);
    expect(limiteNoInfinito((x) => (2 * x + 1) / (x + 3))).toBeCloseTo(2, 3);
  });

  it('reconhece continuidade e descontinuidade', () => {
    expect(ehContinua((x) => x * x, 2)).toBe(true);
    expect(ehContinua((x) => (x === 0 ? 5 : 1 / x), 0)).toBe(false);
  });
});

describe('derivadas', () => {
  it('a derivada numérica confere com a analítica', () => {
    // f(x) = x³ -> f'(2) = 12
    expect(derivadaNumerica((x) => x ** 3, 2)).toBeCloseTo(12, 4);
    expect(derivadaNumerica(Math.sin, 0)).toBeCloseTo(1, 6);
  });

  it('deriva polinômio pela regra da potência', () => {
    // 3x² + 2x + 7 -> 6x + 2
    const { resultado } = derivarPolinomioComPassos(Polinomio.de(7, 2, 3));
    expect(resultado.paraTex()).toBe('6x + 2');
  });

  it('a derivada de uma constante é zero', () => {
    expect(derivarPolinomioComPassos(Polinomio.de(5)).resultado.ehNulo).toBe(true);
  });

  it('encontra e classifica pontos críticos', () => {
    // x² tem mínimo em 0; -x² tem máximo.
    const minimo = pontosCriticos((x) => x * x, -3, 3);
    expect(minimo).toHaveLength(1);
    expect(minimo[0]!.tipo).toBe('minimo');
    expect(minimo[0]!.x).toBeCloseTo(0, 3);

    const maximo = pontosCriticos((x) => -x * x, -3, 3);
    expect(maximo[0]!.tipo).toBe('maximo');
  });
});

describe('integrais', () => {
  it('a soma de Riemann se aproxima da área exata quando n cresce', () => {
    // ∫₀¹ x² dx = 1/3
    const grosseira = Math.abs(somaDeRiemann((x) => x * x, 0, 1, 4) - 1 / 3);
    const refinada = Math.abs(somaDeRiemann((x) => x * x, 0, 1, 1000) - 1 / 3);

    expect(refinada).toBeLessThan(grosseira);
    expect(refinada).toBeLessThan(0.001);
  });

  it('a soma pela esquerda subestima uma função crescente', () => {
    const esquerda = somaDeRiemann((x) => x * x, 0, 1, 10, 'esquerda');
    const direita = somaDeRiemann((x) => x * x, 0, 1, 10, 'direita');

    expect(esquerda).toBeLessThan(1 / 3);
    expect(direita).toBeGreaterThan(1 / 3);
  });

  it('a integral numérica é precisa para polinômios', () => {
    expect(integralNumerica((x) => x * x, 0, 3)).toBeCloseTo(9, 9);
    expect(integralNumerica(Math.sin, 0, Math.PI)).toBeCloseTo(2, 6);
  });

  it('integrar e derivar são operações inversas', () => {
    const p = Polinomio.de(4, -3, 2);
    const primitiva = integrarPolinomioComPassos(p).resultado;

    expect(primitiva.derivar().paraTex()).toBe(p.paraTex());
  });

  it('o teorema fundamental confere com a integral numérica', () => {
    const p = Polinomio.de(0, 0, 1); // x²
    const { resultado } = teoremaFundamentalComPassos(p, 0, 3);

    expect(resultado).toBeCloseTo(9, 9);
    expect(resultado).toBeCloseTo(integralNumerica((x) => x * x, 0, 3), 6);
  });
});
