import {
  concentracaoDaMistura,
  concentracaoDaMisturaComPassos,
  concentracaoDiluida,
  concentracaoDiluidaComPassos,
  massaEmSolucao,
  mediaSimplesDasConcentracoes,
  molaridade,
  molaridadeComPassos,
  molsEmSolucao,
  volumeDiluido,
  volumeDiluidoComPassos,
} from '@core/math/quimica/solucoes/solucoes';

describe('concentração', () => {
  it('a molaridade é mols por litro de solução', () => {
    expect(molaridade(0.5, 2)).toBeCloseTo(0.25, 10);
  });

  it('o volume devolve a quantidade de soluto', () => {
    expect(molsEmSolucao(0.25, 2)).toBeCloseTo(0.5, 10);
  });

  it('a massa num volume passa pela massa molar', () => {
    // 0,5 mol/L em 0,2 L dá 0,1 mol de NaCl, que pesa 5,844 g.
    expect(massaEmSolucao(0.5, 0.2, 58.44)).toBeCloseTo(5.844, 6);
  });

  /**
   * O erro do mililitro é de fator mil, e por isso vale um teste próprio:
   * 250 mL tratados como 250 L dariam uma concentração mil vezes menor.
   */
  it('o volume em litros é o que fecha a conta', () => {
    const certo = molaridade(0.1, 0.25);
    const comMililitro = molaridade(0.1, 250);

    expect(certo).toBeCloseTo(0.4, 10);
    expect(certo / comMililitro).toBeCloseTo(1000, 6);
  });

  it('a resolução da molaridade mostra os mols antes da divisão', () => {
    const { resultado, passos } = molaridadeComPassos(5.844, 58.44, 0.25, 'NaCl');

    expect(resultado).toBeCloseTo(0.4, 6);
    expect(passos).toHaveLength(3);
    expect(passos[0]!.tex).toContain('58.44');
    expect(passos[2]!.tex).toContain('mol/L');
  });
});

describe('diluição', () => {
  /** Acrescentar solvente não muda a quantidade de soluto: é só isso. */
  it('a quantidade de soluto se conserva', () => {
    const c1 = 2;
    const v1 = 0.1;
    const v2 = 0.5;

    const c2 = concentracaoDiluida(c1, v1, v2);

    expect(c1 * v1).toBeCloseTo(c2 * v2, 10);
  });

  it('o volume final sai de C₁V₁ = C₂V₂', () => {
    expect(volumeDiluido(2, 0.1, 0.5)).toBeCloseTo(0.4, 10);
  });

  /**
   * O erro clássico: tomar o volume FINAL pelo volume de água a acrescentar.
   * A resolução separa os dois de propósito.
   */
  it('a resolução separa o volume final da água acrescentada', () => {
    const { resultado, passos } = volumeDiluidoComPassos(2, 0.1, 0.5);

    expect(resultado).toBeCloseTo(0.4, 10);
    expect(passos[2]!.tex).toContain('0.3');
  });

  it('diluir sempre baixa a concentração', () => {
    const { resultado } = concentracaoDiluidaComPassos(2, 0.1, 0.4);

    expect(resultado).toBeLessThan(2);
    expect(resultado).toBeCloseTo(0.4, 10);
  });
});

describe('mistura de soluções', () => {
  it('a concentração final é a média ponderada pelos volumes', () => {
    // 1 L a 1 mol/L com 3 L a 3 mol/L dá 10 mol em 4 L.
    expect(concentracaoDaMistura(1, 1, 3, 3)).toBeCloseTo(2.5, 10);
  });

  /** Com volumes iguais — e só então — a média simples acerta. */
  it('a média simples só coincide com volumes iguais', () => {
    expect(concentracaoDaMistura(1, 2, 3, 2)).toBeCloseTo(mediaSimplesDasConcentracoes(1, 3), 10);
    expect(concentracaoDaMistura(1, 1, 3, 3)).not.toBeCloseTo(
      mediaSimplesDasConcentracoes(1, 3),
      3,
    );
  });

  it('a concentração final fica entre as duas de partida', () => {
    const c = concentracaoDaMistura(0.5, 0.3, 2, 0.7);

    expect(c).toBeGreaterThan(0.5);
    expect(c).toBeLessThan(2);
  });

  it('a resolução soma mols e volumes antes de dividir', () => {
    const { resultado, passos } = concentracaoDaMisturaComPassos(1, 1, 3, 3);

    expect(resultado).toBeCloseTo(2.5, 10);
    expect(passos).toHaveLength(3);
    expect(passos[1]!.tex).toContain('10');
  });
});
