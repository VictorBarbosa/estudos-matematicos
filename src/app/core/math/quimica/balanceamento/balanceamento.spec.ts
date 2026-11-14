import {
  balanceamentoComPassos,
  balancear,
  contarAtomos,
  equacaoQuimicaParaTex,
  estaBalanceada,
} from '@core/math/quimica/balanceamento/balanceamento';

describe('balanceamento', () => {
  it('a água: dois para um, dois', () => {
    expect(balancear(['H2', 'O2'], ['H2O'])).toEqual([2, 1, 2]);
  });

  it('a amônia', () => {
    expect(balancear(['N2', 'H2'], ['NH3'])).toEqual([1, 3, 2]);
  });

  it('a ferrugem', () => {
    expect(balancear(['Fe', 'O2'], ['Fe2O3'])).toEqual([4, 3, 2]);
  });

  it('a combustão do metano, com dois produtos', () => {
    expect(balancear(['CH4', 'O2'], ['CO2', 'H2O'])).toEqual([1, 2, 1, 2]);
  });

  it('a combustão do propano', () => {
    expect(balancear(['C3H8', 'O2'], ['CO2', 'H2O'])).toEqual([1, 5, 3, 4]);
  });

  /** Com coeficientes fracionários no caminho, o resultado ainda sai inteiro. */
  it('a combustão do etano, que pediria meio oxigênio', () => {
    expect(balancear(['C2H6', 'O2'], ['CO2', 'H2O'])).toEqual([2, 7, 4, 6]);
  });

  it('o calcário com ácido clorídrico, com três produtos', () => {
    expect(balancear(['CaCO3', 'HCl'], ['CaCl2', 'H2O', 'CO2'])).toEqual([1, 2, 1, 1, 1]);
  });

  it('a neutralização do hidróxido de sódio', () => {
    expect(balancear(['H2SO4', 'NaOH'], ['Na2SO4', 'H2O'])).toEqual([1, 2, 1, 2]);
  });

  /**
   * Os coeficientes saem nos MENORES inteiros: dobrar tudo continua
   * balanceado, e a convenção é a forma reduzida.
   */
  it('os coeficientes vêm reduzidos', () => {
    const coeficientes = balancear(['H2', 'O2'], ['H2O'])!;
    const dobrados = coeficientes.map((valor) => valor * 2);

    expect(estaBalanceada(['H2', 'O2'], ['H2O'], dobrados)).toBe(true);
    expect(coeficientes).toEqual([2, 1, 2]);
  });

  it('recusa equação impossível', () => {
    // Não há como sair enxofre de onde não entrou enxofre.
    expect(balancear(['H2', 'O2'], ['H2S'])).toBeUndefined();
  });

  it('recusa fórmula ilegível', () => {
    expect(balancear(['XyZ'], ['H2O'])).toBeUndefined();
  });

  /**
   * Com duas reações independentes nas mesmas espécies, o sistema tem duas
   * variáveis livres e não há UMA resposta: recusar é mais honesto que
   * escolher uma.
   */
  it('recusa equação ambígua', () => {
    expect(balancear(['C', 'O2'], ['CO', 'CO2'])).toBeUndefined();
  });
});

describe('contagem e conferência', () => {
  it('conta os átomos de um lado com os coeficientes', () => {
    const total = contarAtomos(['CH4', 'O2'], [1, 2]);

    expect(total.get('C')).toBe(1);
    expect(total.get('H')).toBe(4);
    expect(total.get('O')).toBe(4);
  });

  it('reconhece o que não fecha', () => {
    expect(estaBalanceada(['H2', 'O2'], ['H2O'], [1, 1, 1])).toBe(false);
    expect(estaBalanceada(['H2', 'O2'], ['H2O'], [2, 1, 2])).toBe(true);
  });
});

describe('escrita da equação', () => {
  it('o coeficiente um não se escreve', () => {
    const tex = equacaoQuimicaParaTex(['N2', 'H2'], ['NH3'], [1, 3, 2]);

    expect(tex).toContain('3\\,');
    expect(tex).toContain('2\\,');
    expect(tex).not.toContain('1\\,');
  });

  it('sem coeficientes, a equação sai crua', () => {
    expect(equacaoQuimicaParaTex(['H2', 'O2'], ['H2O'])).not.toContain('\\,');
  });

  it('a resolução confere átomo por átomo', () => {
    const { resultado, passos } = balanceamentoComPassos(['CH4', 'O2'], ['CO2', 'H2O'])!;

    expect(resultado).toEqual([1, 2, 1, 2]);
    expect(passos).toHaveLength(3);
    expect(passos[2]!.tex).toContain('H: 4 = 4');
  });

  it('a resolução devolve indefinido para equação impossível', () => {
    expect(balanceamentoComPassos(['H2'], ['H2S'])).toBeUndefined();
  });
});
