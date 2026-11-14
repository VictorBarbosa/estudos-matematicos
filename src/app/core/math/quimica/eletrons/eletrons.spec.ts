import {
  SEGUE_A_REGRA,
  camadas,
  configuracao,
  configuracaoComPassos,
  configuracaoEmTexto,
  eletronsDaUltimaCamada,
  eletronsNoSubnivel,
  periodo,
} from '@core/math/quimica/eletrons/eletrons';

describe('distribuição eletrônica', () => {
  it('o hidrogênio tem um elétron no 1s', () => {
    expect(configuracaoEmTexto(1)).toBe('1s¹');
  });

  it('o neônio fecha a segunda camada', () => {
    expect(configuracaoEmTexto(10)).toBe('1s² 2s² 2p⁶');
  });

  it('o sódio começa a terceira', () => {
    expect(configuracaoEmTexto(11)).toBe('1s² 2s² 2p⁶ 3s¹');
  });

  /**
   * A lição da ordem: o 4s vem antes do 3d, porque o que manda é a energia e
   * não o número da camada.
   */
  it('o potássio preenche o 4s antes do 3d', () => {
    expect(configuracaoEmTexto(19)).toBe('1s² 2s² 2p⁶ 3s² 3p⁶ 4s¹');
    expect(eletronsNoSubnivel(19, 3, 'd')).toBe(0);
    expect(eletronsNoSubnivel(19, 4, 's')).toBe(1);
  });

  it('o escândio é o primeiro a usar o 3d', () => {
    expect(eletronsNoSubnivel(21, 3, 'd')).toBe(1);
  });

  it('a soma dos subníveis devolve o número de elétrons', () => {
    for (const z of [1, 6, 11, 17, 20, 26, 35, 54]) {
      const total = configuracao(z).reduce((soma, subnivel) => soma + subnivel.eletrons, 0);
      expect(total, `Z = ${z}`).toBe(z);
    }
  });

  it('nenhum subnível passa da capacidade', () => {
    const limites = { s: 2, p: 6, d: 10, f: 14 } as const;

    for (let z = 1; z <= 86; z += 1) {
      for (const subnivel of configuracao(z)) {
        expect(subnivel.eletrons, `Z = ${z}`).toBeLessThanOrEqual(limites[subnivel.letra]);
      }
    }
  });
});

describe('camadas, período e última camada', () => {
  it('as camadas do cloro são 2, 8 e 7', () => {
    expect(camadas(17)).toEqual([2, 8, 7]);
  });

  it('o período é o número de camadas ocupadas', () => {
    expect(periodo(11)).toBe(3);
    expect(periodo(2)).toBe(1);
  });

  it('os elétrons da última camada explicam o grupo', () => {
    // Sódio e potássio: um elétron na última camada, e reações parecidas.
    expect(eletronsDaUltimaCamada(11)).toBe(1);
    expect(eletronsDaUltimaCamada(19)).toBe(1);
    // Cloro e bromo: sete.
    expect(eletronsDaUltimaCamada(17)).toBe(7);
    expect(eletronsDaUltimaCamada(35)).toBe(7);
  });

  it('os gases nobres fecham a última camada', () => {
    expect(eletronsDaUltimaCamada(10)).toBe(8);
    expect(eletronsDaUltimaCamada(18)).toBe(8);
    expect(eletronsDaUltimaCamada(2)).toBe(2);
  });
});

describe('as exceções da regra', () => {
  /**
   * A regra diagonal erra no cromo e no cobre: o subnível semicheio ou cheio
   * custa menos energia do que ela prevê. Reconhecer isso é honestidade, e é
   * o que impede um exercício de cobrar a regra onde ela falha.
   */
  it('cromo e cobre estão marcados como exceção', () => {
    expect(SEGUE_A_REGRA(24)).toBe(false);
    expect(SEGUE_A_REGRA(29)).toBe(false);
  });

  it('os representativos seguem a regra', () => {
    for (const z of [1, 6, 8, 11, 12, 13, 17, 20, 35, 53]) {
      expect(SEGUE_A_REGRA(z), `Z = ${z}`).toBe(true);
    }
  });
});

describe('a resolução', () => {
  it('aponta a inversão do 4s quando ela aparece', () => {
    const { resultado, passos } = configuracaoComPassos(21, 'Sc');

    expect(resultado).toContain('3d');
    expect(passos[1]!.nota).toContain('4s antes do 3d');
  });

  it('não inventa inversão onde não há', () => {
    const { passos } = configuracaoComPassos(10, 'Ne');

    expect(passos[1]!.nota).not.toContain('4s');
  });
});
