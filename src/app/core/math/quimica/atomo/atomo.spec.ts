import {
  contarParticulas,
  contarParticulasComPassos,
  massaAtomicaMedia,
  massaAtomicaMediaComPassos,
} from '@core/math/quimica/atomo/atomo';

describe('contagem de partículas', () => {
  it('o átomo neutro tem um elétron por próton', () => {
    // Carbono-12.
    expect(contarParticulas({ z: 6, a: 12, carga: 0 })).toEqual({
      protons: 6,
      neutrons: 6,
      eletrons: 6,
    });
  });

  it('os nêutrons são a diferença entre A e Z', () => {
    // Urânio-238.
    expect(contarParticulas({ z: 92, a: 238, carga: 0 }).neutrons).toBe(146);
  });

  /**
   * O sinal da carga é o que mais confunde, e a conta explica por quê: a carga
   * positiva é elétron que FALTA, então ela entra subtraindo.
   */
  it('o cátion perdeu elétrons e o ânion ganhou', () => {
    // Ca²⁺ perdeu dois; Cl⁻ ganhou um.
    expect(contarParticulas({ z: 20, a: 40, carga: 2 }).eletrons).toBe(18);
    expect(contarParticulas({ z: 17, a: 35, carga: -1 }).eletrons).toBe(18);
  });

  it('isótopos do mesmo elemento têm o mesmo Z e nêutrons diferentes', () => {
    const cloro35 = contarParticulas({ z: 17, a: 35, carga: 0 });
    const cloro37 = contarParticulas({ z: 17, a: 37, carga: 0 });

    expect(cloro35.protons).toBe(cloro37.protons);
    expect(cloro37.neutrons - cloro35.neutrons).toBe(2);
  });

  it('a resolução nomeia cada passo e termina na contagem', () => {
    const { resultado, passos } = contarParticulasComPassos({ z: 20, a: 40, carga: 2 });

    expect(resultado.eletrons).toBe(18);
    expect(passos.length).toBe(3);
    expect(passos[2]!.descricao).toContain('positiva');
  });
});

describe('massa atômica média', () => {
  /**
   * O cloro é o exemplo clássico: 35,45 não é a massa de nenhum átomo de
   * cloro, é o que se mede numa amostra onde convivem o 35 e o 37.
   */
  it('o cloro natural dá 35,45', () => {
    const media = massaAtomicaMedia([
      { massa: 34.969, abundancia: 75.77 },
      { massa: 36.966, abundancia: 24.23 },
    ]);

    expect(media).toBeCloseTo(35.45, 2);
  });

  it('com um isótopo só, a média é a própria massa', () => {
    expect(massaAtomicaMedia([{ massa: 18.998, abundancia: 100 }])).toBeCloseTo(18.998, 6);
  });

  it('o isótopo mais abundante puxa a média para si', () => {
    const media = massaAtomicaMedia([
      { massa: 10, abundancia: 90 },
      { massa: 20, abundancia: 10 },
    ]);

    expect(media).toBe(11);
    expect(media).toBeLessThan(15);
  });

  it('a resolução mostra a ponderação antes do resultado', () => {
    const { resultado, passos } = massaAtomicaMediaComPassos([
      { massa: 63, abundancia: 69 },
      { massa: 65, abundancia: 31 },
    ]);

    expect(resultado).toBeCloseTo(63.62, 2);
    expect(passos[0]!.tex).toContain('69\\%');
    expect(passos[2]!.nota).toContain('nenhum átomo isolado');
  });
});
