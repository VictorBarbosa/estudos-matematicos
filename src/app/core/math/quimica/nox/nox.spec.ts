import { EXCECOES_DE_OXIGENIO, noxComPassos, noxDoElemento } from '@core/math/quimica/nox/nox';

describe('número de oxidação', () => {
  it('o oxigênio ancora a conta', () => {
    expect(noxDoElemento('Fe2O3', 'Fe')).toBe(3);
    expect(noxDoElemento('FeO', 'Fe')).toBe(2);
    expect(noxDoElemento('Al2O3', 'Al')).toBe(3);
    expect(noxDoElemento('CO2', 'C')).toBe(4);
  });

  it('o halogênio também', () => {
    expect(noxDoElemento('NaCl', 'Na')).toBe(1);
    expect(noxDoElemento('CaCl2', 'Ca')).toBe(2);
    expect(noxDoElemento('AlCl3', 'Al')).toBe(3);
  });

  it('a soma dos nox de um composto neutro é zero', () => {
    const casos = [
      ['Fe2O3', 'Fe', 2, 3, -2],
      ['CaCl2', 'Ca', 1, 2, -1],
    ] as const;

    for (const [formula, simbolo, quantos, quantosAncora, cargaAncora] of casos) {
      const nox = noxDoElemento(formula, simbolo)!;

      expect(quantos * nox + quantosAncora * cargaAncora, formula).toBe(0);
    }
  });

  /**
   * As exceções não são detalhe: um motor que respondesse −2 para o oxigênio
   * do peróxido daria uma resposta errada com toda a confiança.
   */
  it('recusa os peróxidos', () => {
    for (const formula of EXCECOES_DE_OXIGENIO) {
      expect(noxDoElemento(formula, 'O'), formula).toBeUndefined();
    }
  });

  it('recusa quando não há âncora', () => {
    // Dois metais: nenhum dos dois tem nox previsível.
    expect(noxDoElemento('NaK', 'Na')).toBeUndefined();
  });

  it('recusa composto de três elementos', () => {
    expect(noxDoElemento('CaCO3', 'Ca')).toBeUndefined();
  });

  it('recusa nox fracionário', () => {
    // Fe3O4 daria +8/3: existe na natureza e não sai desta regra.
    expect(noxDoElemento('Fe3O4', 'Fe')).toBeUndefined();
  });

  it('recusa fórmula ilegível', () => {
    expect(noxDoElemento('XyZ', 'X')).toBeUndefined();
  });

  it('a resolução parte da âncora e usa a soma zero', () => {
    const { resultado, passos } = noxComPassos('Fe2O3', 'Fe', 'Fe_2O_3')!;

    expect(resultado).toBe(3);
    expect(passos).toHaveLength(3);
    expect(passos[0]!.tex).toContain('-2');
    expect(passos[1]!.tex).toContain('= 0');
  });

  it('a resolução devolve indefinido onde o nox não sai', () => {
    expect(noxComPassos('H2O2', 'O', 'H_2O_2')).toBeUndefined();
  });
});
