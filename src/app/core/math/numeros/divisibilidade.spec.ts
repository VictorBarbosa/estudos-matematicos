import { mdcComPassos, mmcComPassos, relacaoMdcMmcComPassos } from './divisibilidade';

describe('mdcComPassos', () => {
  it('encontra o máximo divisor comum pela fatoração', () => {
    const { resultado, passos } = mdcComPassos(12, 18);

    expect(resultado).toBe(6);
    expect(passos[1]?.descricao).toContain('MENOR expoente');
  });

  it('reconhece números primos entre si', () => {
    const { resultado, passos } = mdcComPassos(8, 9);

    expect(resultado).toBe(1);
    expect(passos[1]?.descricao).toContain('primos entre si');
  });
});

describe('mmcComPassos', () => {
  it('demonstra o MMC pela fatoração', () => {
    const { resultado, passos } = mmcComPassos(12, 18);

    expect(resultado).toBe(36);
    expect(passos.length).toBe(2);
    expect(passos[0]?.tex).toContain('2^{2} \\cdot 3');
    expect(passos[1]?.descricao).toContain('MAIOR expoente');
  });
});

describe('relacaoMdcMmcComPassos', () => {
  it('mostra que mdc × mmc é o produto dos números', () => {
    const { resultado } = relacaoMdcMmcComPassos(12, 18);
    expect(resultado).toBe(216);
  });

  it('vale também para números primos entre si', () => {
    const { resultado } = relacaoMdcMmcComPassos(7, 5);
    expect(resultado).toBe(35);
  });
});
