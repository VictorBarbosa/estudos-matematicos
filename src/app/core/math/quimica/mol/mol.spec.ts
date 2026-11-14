import {
  AVOGADRO,
  massaDeMols,
  massaMolar,
  massaMolarComPassos,
  molsDeMassa,
  molsDeMassaComPassos,
  particulasDeMols,
} from '@core/math/quimica/mol/mol';

describe('o mol', () => {
  it('a massa molar da água soma as três massas atômicas', () => {
    const agua = massaMolar([
      { simbolo: 'H', massaAtomica: 1.008, quantidade: 2 },
      { simbolo: 'O', massaAtomica: 15.999, quantidade: 1 },
    ]);

    expect(agua).toBeCloseTo(18.015, 3);
  });

  it('o índice multiplica a massa do elemento', () => {
    // CO₂: um carbono e DOIS oxigênios.
    const gasCarbonico = massaMolar([
      { simbolo: 'C', massaAtomica: 12.011, quantidade: 1 },
      { simbolo: 'O', massaAtomica: 15.999, quantidade: 2 },
    ]);

    expect(gasCarbonico).toBeCloseTo(44.009, 3);
  });

  it('mols e massa são a mesma relação, lida nos dois sentidos', () => {
    const molar = 18.015;

    expect(molsDeMassa(36.03, molar)).toBeCloseTo(2, 6);
    expect(massaDeMols(2, molar)).toBeCloseTo(36.03, 6);
  });

  it('um mol tem o número de Avogadro de partículas', () => {
    expect(particulasDeMols(1)).toBe(AVOGADRO);
    expect(particulasDeMols(2)).toBeCloseTo(1.2044e24, -20);
  });

  it('a resolução de mols nomeia a massa molar antes de dividir', () => {
    const { resultado, passos } = molsDeMassaComPassos(36.03, 18.015, 'água');

    expect(resultado).toBeCloseTo(2, 6);
    expect(passos[0]!.descricao).toContain('água');
    expect(passos[0]!.nota).toContain('tabela periódica');
  });

  it('a resolução da massa molar mostra cada parcela', () => {
    const { resultado, passos } = massaMolarComPassos(
      [
        { simbolo: 'C', massaAtomica: 12, quantidade: 1 },
        { simbolo: 'O', massaAtomica: 16, quantidade: 2 },
      ],
      'CO2',
    );

    expect(resultado).toBe(44);
    expect(passos[0]!.tex).toContain('2 \\times 16');
    expect(passos[2]!.tex).toContain('g/mol');
  });

  /**
   * O acordo que faz a massa molar sair pronta da tabela.
   *
   * Um mol é a quantidade de partículas cuja massa em gramas dá o mesmo número
   * que a massa de uma partícula em unidades atômicas. É por isso que não há
   * fator de conversão nenhum entre as duas leituras.
   */
  it('a massa molar em g/mol tem o mesmo número da massa molecular', () => {
    const partes = [{ simbolo: 'N', massaAtomica: 14.007, quantidade: 2 }];

    expect(massaMolar(partes)).toBeCloseTo(28.014, 3);
  });
});
