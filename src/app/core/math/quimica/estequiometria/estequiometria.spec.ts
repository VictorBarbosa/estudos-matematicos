import {
  massaCorrespondente,
  massaCorrespondenteComPassos,
  massaPelaProporcaoCrua,
  molsCorrespondentes,
} from '@core/math/quimica/estequiometria/estequiometria';

// 2 H₂ + O₂ → 2 H₂O
const H2 = { formula: 'H₂', coeficiente: 2, massaMolar: 2.016 };
const O2 = { formula: 'O₂', coeficiente: 1, massaMolar: 31.998 };
const H2O = { formula: 'H₂O', coeficiente: 2, massaMolar: 18.015 };

describe('estequiometria', () => {
  it('a proporção age sobre os MOLS', () => {
    // Dois mols de H₂ dão dois de água, e consomem um de O₂.
    expect(molsCorrespondentes(2, H2, H2O)).toBe(2);
    expect(molsCorrespondentes(2, H2, O2)).toBe(1);
  });

  it('a proporção se inverte quando se lê no outro sentido', () => {
    expect(molsCorrespondentes(1, O2, H2)).toBe(2);
    expect(molsCorrespondentes(4, H2O, O2)).toBe(2);
  });

  /**
   * O trajeto completo, com números que se conferem de cabeça: 4 g de H₂ são
   * dois mols, que dão dois mols de água, que pesam 36 g.
   */
  it('massa → mols → mols → massa', () => {
    expect(massaCorrespondente(4.032, H2, H2O)).toBeCloseTo(36.03, 2);
  });

  it('e o mesmo trajeto ao contrário', () => {
    expect(massaCorrespondente(36.03, H2O, H2)).toBeCloseTo(4.032, 3);
  });

  /**
   * O erro clássico, isolado: aplicar a proporção direto sobre as massas.
   *
   * Ele dá 4 g de água a partir de 4 g de hidrogênio — nove vezes menos que o
   * certo — e sai plausível, que é justamente o que o torna perigoso.
   */
  it('a proporção crua não coincide com a conta certa', () => {
    const certo = massaCorrespondente(4.032, H2, H2O);
    const cru = massaPelaProporcaoCrua(4.032, H2, H2O);

    expect(cru).toBeCloseTo(4.032, 3);
    expect(Math.abs(certo - cru)).toBeGreaterThan(30);
  });

  it('as duas só coincidem quando as massas molares são iguais', () => {
    const a = { formula: 'A', coeficiente: 1, massaMolar: 50 };
    const b = { formula: 'B', coeficiente: 1, massaMolar: 50 };

    expect(massaCorrespondente(10, a, b)).toBeCloseTo(massaPelaProporcaoCrua(10, a, b), 9);
  });

  it('a resolução mostra os três trechos, e avisa do erro clássico', () => {
    const { resultado, passos } = massaCorrespondenteComPassos(
      4.032,
      H2,
      H2O,
      '2\\,\\text{H}_2 + \\text{O}_2 \\to 2\\,\\text{H}_2\\text{O}',
    );

    expect(resultado).toBeCloseTo(36.03, 2);
    expect(passos.length).toBe(4);
    expect(passos[0]!.nota).toContain('erro clássico');
    expect(passos[3]!.nota).toContain('Massa → mols → mols → massa');
  });
});
