import { ErroMatematico } from '@core/math/tipos';
import {
  PREFIXOS_SI,
  algarismosSignificativos,
  arredondarParaSignificativos,
  avaliarNotacao,
  converterPrefixoComPassos,
  multiplicarNotacaoComPassos,
  paraNotacaoCientificaComPassos,
  prefixoPorSimbolo,
} from './notacao-cientifica';

describe('notação científica', () => {
  it('normaliza números grandes e pequenos', () => {
    expect(paraNotacaoCientificaComPassos(299792458).resultado).toEqual({
      mantissa: 2.99792458,
      expoente: 8,
    });

    expect(paraNotacaoCientificaComPassos(0.00042).resultado).toEqual({
      mantissa: 4.2,
      expoente: -4,
    });
  });

  it('mantém a mantissa no intervalo [1, 10)', () => {
    for (const valor of [1, 9.999, 10, 1e-7, 6.02e23, -5.5e-3, 7]) {
      const { mantissa } = paraNotacaoCientificaComPassos(valor).resultado;
      expect(Math.abs(mantissa)).toBeGreaterThanOrEqual(1);
      expect(Math.abs(mantissa)).toBeLessThan(10);
    }
  });

  it('não inventa casas decimais por erro binário', () => {
    // 0,1 / 10^-1 em ponto flutuante não dá exatamente 1.
    expect(paraNotacaoCientificaComPassos(0.1).resultado.mantissa).toBe(1);
    expect(paraNotacaoCientificaComPassos(0.3).resultado.mantissa).toBe(3);
  });

  it('a notação representa o mesmo número', () => {
    for (const valor of [1234.5, 0.000987, 6.674e-11, -2500]) {
      expect(avaliarNotacao(paraNotacaoCientificaComPassos(valor).resultado)).toBeCloseTo(valor, 9);
    }
  });

  it('o zero é tratado à parte', () => {
    expect(paraNotacaoCientificaComPassos(0).resultado).toEqual({ mantissa: 0, expoente: 0 });
  });

  it('recusa valores não finitos', () => {
    expect(() => paraNotacaoCientificaComPassos(Infinity)).toThrowError(ErroMatematico);
  });

  it('multiplica somando expoentes', () => {
    const { resultado } = multiplicarNotacaoComPassos(
      { mantissa: 3, expoente: 8 },
      { mantissa: 2, expoente: -3 },
    );

    expect(resultado).toEqual({ mantissa: 6, expoente: 5 });
  });

  it('renormaliza quando o produto das mantissas passa de 10', () => {
    const { resultado, passos } = multiplicarNotacaoComPassos(
      { mantissa: 5, expoente: 4 },
      { mantissa: 4, expoente: 2 },
    );

    // 5 × 4 = 20 → 2 × 10^1, então o expoente final é 4 + 2 + 1.
    expect(resultado).toEqual({ mantissa: 2, expoente: 7 });
    expect(passos.at(-1)?.descricao).toContain('normalizamos');
  });
});

describe('prefixos do SI', () => {
  it('converte de quilo para a unidade base', () => {
    const quilo = prefixoPorSimbolo('k')!;
    const base = prefixoPorSimbolo('')!;

    expect(converterPrefixoComPassos(2.5, quilo, base).resultado).toBeCloseTo(2500, 9);
  });

  it('converte de mili para micro, descendo três ordens', () => {
    const mili = prefixoPorSimbolo('m')!;
    const micro = prefixoPorSimbolo('μ')!;

    expect(converterPrefixoComPassos(1, mili, micro).resultado).toBeCloseTo(1000, 9);
  });

  it('ida e volta devolve o valor original', () => {
    for (const de of PREFIXOS_SI) {
      for (const para of PREFIXOS_SI) {
        const ida = converterPrefixoComPassos(7, de, para).resultado;
        expect(converterPrefixoComPassos(ida, para, de).resultado).toBeCloseTo(7, 6);
      }
    }
  });

  it('os prefixos estão em ordem crescente de expoente', () => {
    const expoentes = PREFIXOS_SI.map((p) => p.expoente);
    expect([...expoentes].sort((a, b) => a - b)).toEqual(expoentes);
  });
});

describe('algarismos significativos', () => {
  it('zeros à esquerda não contam', () => {
    expect(algarismosSignificativos('0,0042')).toBe(2);
    expect(algarismosSignificativos('0,500')).toBe(3);
  });

  it('zeros à direita contam quando há vírgula', () => {
    expect(algarismosSignificativos('1,50')).toBe(3);
    expect(algarismosSignificativos('1,5')).toBe(2);
  });

  it('zeros à direita de um inteiro não contam', () => {
    expect(algarismosSignificativos('1500')).toBe(2);
    expect(algarismosSignificativos('203')).toBe(3);
  });

  it('o zero tem um algarismo', () => {
    expect(algarismosSignificativos('0')).toBe(1);
    expect(algarismosSignificativos('0,0')).toBe(1);
  });

  it('recusa o que não é número', () => {
    expect(() => algarismosSignificativos('dois')).toThrowError(ErroMatematico);
  });

  it('arredonda para a precisão pedida', () => {
    expect(arredondarParaSignificativos(3.14159, 3)).toBe(3.14);
    expect(arredondarParaSignificativos(98765, 2)).toBe(99000);
    expect(arredondarParaSignificativos(0, 3)).toBe(0);
    expect(() => arredondarParaSignificativos(1, 0)).toThrowError(ErroMatematico);
  });
});
