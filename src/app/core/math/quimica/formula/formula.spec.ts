import {
  canonizarFormula,
  comSubscritos,
  formulaParaTex,
  lerFormula,
  massaMolarDaFormula,
  mesmaFormula,
  partesDaFormula,
  semSubscritos,
} from '@core/math/quimica/formula/formula';

describe('leitura de fórmulas', () => {
  it('lê os elementos e os índices', () => {
    expect([...lerFormula('H2O')!]).toEqual([
      ['H', 2],
      ['O', 1],
    ]);
  });

  /** O índice vale para o símbolo imediatamente antes dele, e só para ele. */
  it('o índice pertence ao último símbolo do bloco', () => {
    expect([...lerFormula('CaSO4')!]).toEqual([
      ['Ca', 1],
      ['S', 1],
      ['O', 4],
    ]);
  });

  it('entende parênteses com índice', () => {
    expect([...lerFormula('Ca(OH)2')!]).toEqual([
      ['Ca', 1],
      ['O', 2],
      ['H', 2],
    ]);
  });

  it('o mesmo elemento em dois lugares se soma', () => {
    expect(lerFormula('CH3COOH')!.get('H')).toBe(4);
    expect(lerFormula('CH3COOH')!.get('C')).toBe(2);
    expect(lerFormula('CH3COOH')!.get('O')).toBe(2);
  });

  /**
   * As quatro escritas que um campo de celular produz têm de dar na mesma: o
   * site corrige química, não datilografia.
   */
  it('espaço, subscrito e caixa não mudam a leitura', () => {
    const canonica = canonizarFormula('CaSO4');

    expect(canonizarFormula('Ca SO4')).toBe(canonica);
    expect(canonizarFormula('CaSO₄')).toBe(canonica);
    expect(canonizarFormula('caso4')).toBe(canonica);
  });

  /**
   * O que NÃO se perdoa: `CO` é monóxido de carbono e `Co` é cobalto. Com a
   * caixa certa, cada um é lido como escrito.
   */
  it('a caixa certa distingue CO de Co', () => {
    expect([...lerFormula('CO')!]).toEqual([
      ['C', 1],
      ['O', 1],
    ]);
    expect([...lerFormula('Co')!]).toEqual([['Co', 1]]);
  });

  /** Sem caixa e com duas leituras possíveis, a leitura é recusada. */
  it('recusa o ambíguo em vez de adivinhar', () => {
    expect(lerFormula('co')).toBeUndefined();
  });

  it('recusa o que não é fórmula', () => {
    expect(lerFormula('XyZ')).toBeUndefined();
    expect(lerFormula('Ca(OH2')).toBeUndefined();
    expect(lerFormula('H0')).toBeUndefined();
    expect(lerFormula('')).toBeUndefined();
    expect(lerFormula('42')).toBeUndefined();
  });
});

describe('comparação de fórmulas', () => {
  it('a ordem dos elementos é convenção, e não muda o composto', () => {
    expect(mesmaFormula('CaO', 'OCa')).toBe(true);
  });

  it('o parêntese expandido é a mesma fórmula', () => {
    expect(mesmaFormula('Ca(OH)2', 'CaO2H2')).toBe(true);
  });

  it('quantidade diferente é outro composto', () => {
    expect(mesmaFormula('H2O', 'H2O2')).toBe(false);
    expect(mesmaFormula('CO', 'CO2')).toBe(false);
  });

  it('fórmula ilegível nunca é igual a nada', () => {
    expect(mesmaFormula('XyZ', 'XyZ')).toBe(false);
  });
});

describe('massa molar a partir da fórmula escrita', () => {
  it('soma as massas da tabela', () => {
    expect(massaMolarDaFormula('H2O')).toBeCloseTo(18.02, 6);
    expect(massaMolarDaFormula('NaCl')).toBeCloseTo(58.44, 6);
    expect(massaMolarDaFormula('CaSO4')).toBeCloseTo(136.14, 6);
  });

  it('o parêntese multiplica o grupo inteiro', () => {
    // Ca 40,08 + 2 × (16,00 + 1,01) = 74,10
    expect(massaMolarDaFormula('Ca(OH)2')).toBeCloseTo(74.1, 6);
  });

  it('devolve indefinido para fórmula ilegível', () => {
    expect(massaMolarDaFormula('XyZ')).toBeUndefined();
  });

  it('as partes saem na ordem escrita, com o elemento inteiro', () => {
    const partes = partesDaFormula('H2O')!;

    expect(partes).toHaveLength(2);
    expect(partes[0]!.elemento.nome).toBe('hidrogênio');
    expect(partes[0]!.quantidade).toBe(2);
  });
});

describe('escrita', () => {
  it('os subscritos vão e voltam', () => {
    expect(semSubscritos('H₂SO₄')).toBe('H2SO4');
    expect(comSubscritos('H2SO4')).toBe('H₂SO₄');
  });

  it('o TeX traz os índices subscritos', () => {
    expect(formulaParaTex('H2O')).toBe('\\text{H}_{2}\\text{O}');
  });

  it('o índice um não se escreve', () => {
    expect(canonizarFormula('NaCl')).toBe('NaCl');
  });
});
