import {
  cargaMaisProvavel,
  diferencaDeEletronegatividade,
  eletronegatividade,
  formulaIonica,
  formulaIonicaComPassos,
  grupo,
  temRaioMaior,
  tipoDeLigacao,
} from '@core/math/quimica/ligacao/ligacao';

describe('grupo e carga', () => {
  it('os alcalinos estão no grupo 1', () => {
    expect(grupo(3)).toBe(1);
    expect(grupo(11)).toBe(1);
    expect(grupo(19)).toBe(1);
  });

  it('os halogênios estão no grupo 17', () => {
    expect(grupo(9)).toBe(17);
    expect(grupo(17)).toBe(17);
  });

  it('os gases nobres fecham a tabela', () => {
    expect(grupo(2)).toBe(18);
    expect(grupo(10)).toBe(18);
    expect(grupo(18)).toBe(18);
  });

  it('o hidrogênio fica no grupo 1', () => {
    expect(grupo(1)).toBe(1);
  });

  /**
   * No bloco d a conta do grupo é outra, e devolver `undefined` é mais honesto
   * que inventar um número.
   */
  it('recusa os metais de transição', () => {
    expect(grupo(26)).toBeUndefined();
    expect(grupo(30)).toBeUndefined();
  });

  it('a carga é a que chega ao gás nobre mais próximo', () => {
    expect(cargaMaisProvavel(11)).toBe(1);
    expect(cargaMaisProvavel(12)).toBe(2);
    expect(cargaMaisProvavel(13)).toBe(3);
    expect(cargaMaisProvavel(8)).toBe(-2);
    expect(cargaMaisProvavel(17)).toBe(-1);
    expect(cargaMaisProvavel(7)).toBe(-3);
  });

  it('gases nobres e o grupo 14 não têm carga provável', () => {
    expect(cargaMaisProvavel(10)).toBeUndefined();
    expect(cargaMaisProvavel(6)).toBeUndefined();
  });
});

describe('fórmula iônica', () => {
  it('o cruzamento dá os índices', () => {
    expect(formulaIonica({ simbolo: 'Na', carga: 1 }, { simbolo: 'Cl', carga: -1 })).toBe('NaCl');
    expect(formulaIonica({ simbolo: 'Ca', carga: 2 }, { simbolo: 'Cl', carga: -1 })).toBe('CaCl2');
    expect(formulaIonica({ simbolo: 'Al', carga: 3 }, { simbolo: 'O', carga: -2 })).toBe('Al2O3');
  });

  /** Mg²⁺ com O²⁻ dá MgO: escreve-se a proporção mais simples. */
  it('os índices se reduzem', () => {
    expect(formulaIonica({ simbolo: 'Mg', carga: 2 }, { simbolo: 'O', carga: -2 })).toBe('MgO');
  });

  it('o composto sai neutro', () => {
    const pares = [
      [
        { simbolo: 'Na', carga: 1 },
        { simbolo: 'O', carga: -2 },
      ],
      [
        { simbolo: 'Al', carga: 3 },
        { simbolo: 'Cl', carga: -1 },
      ],
      [
        { simbolo: 'Ca', carga: 2 },
        { simbolo: 'N', carga: -3 },
      ],
    ] as const;

    for (const [cation, anion] of pares) {
      const formula = formulaIonica(cation, anion)!;
      const [, indiceCation] = new RegExp(`^${cation.simbolo}(\\d*)`).exec(formula)!;
      const [, indiceAnion] = new RegExp(`${anion.simbolo}(\\d*)$`).exec(formula)!;

      const positivas = (Number(indiceCation) || 1) * cation.carga;
      const negativas = (Number(indiceAnion) || 1) * Math.abs(anion.carga);

      expect(positivas, formula).toBe(negativas);
    }
  });

  it('a resolução explica o cruzamento e a redução', () => {
    const { resultado, passos } = formulaIonicaComPassos(
      { simbolo: 'Mg', carga: 2 },
      { simbolo: 'O', carga: -2 },
    );

    expect(resultado).toBe('MgO');
    expect(passos[2]!.nota).toContain('Mg₂O₂');
  });
});

describe('eletronegatividade e tipo de ligação', () => {
  it('cresce para a direita e para cima', () => {
    expect(eletronegatividade('F')!).toBeGreaterThan(eletronegatividade('O')!);
    expect(eletronegatividade('O')!).toBeGreaterThan(eletronegatividade('S')!);
    expect(eletronegatividade('Cl')!).toBeGreaterThan(eletronegatividade('Na')!);
  });

  it('a diferença é sempre positiva', () => {
    expect(diferencaDeEletronegatividade('Na', 'Cl')).toBeCloseTo(2.23, 6);
    expect(diferencaDeEletronegatividade('Cl', 'Na')).toBeCloseTo(2.23, 6);
  });

  it('classifica pela faixa', () => {
    expect(tipoDeLigacao('Na', 'Cl')).toBe('ionica');
    expect(tipoDeLigacao('H', 'O')).toBe('covalente-polar');
    expect(tipoDeLigacao('C', 'S')).toBe('covalente-apolar');
  });

  it('os gases nobres não entram na conta', () => {
    expect(tipoDeLigacao('Ne', 'Cl')).toBeUndefined();
  });
});

describe('raio atômico', () => {
  it('cresce para baixo: mais camadas', () => {
    expect(temRaioMaior(19, 11)).toBe(true);
  });

  it('encolhe para a direita: mais prótons na mesma camada', () => {
    expect(temRaioMaior(11, 17)).toBe(true);
    expect(temRaioMaior(17, 11)).toBe(false);
  });

  it('um elemento consigo mesmo não se compara', () => {
    expect(temRaioMaior(11, 11)).toBeUndefined();
  });
});
