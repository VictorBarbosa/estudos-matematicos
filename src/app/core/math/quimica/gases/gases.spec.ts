import {
  R_LITRO_ATM,
  fracaoEmMassa,
  fracaoMolar,
  paraKelvin,
  molsIdeais,
  molsIdeaisComPassos,
  pressaoIdeal,
  pressaoParcial,
  pressaoParcialComPassos,
  volumeIdeal,
  volumeIdealComPassos,
  volumeNoSegundoEstado,
  volumeNoSegundoEstadoComPassos,
} from '@core/math/quimica/gases/gases';

describe('equação dos gases', () => {
  it('a escala Celsius sobe 273,15 para virar kelvin', () => {
    expect(paraKelvin(0)).toBeCloseTo(273.15, 10);
    expect(paraKelvin(25)).toBeCloseTo(298.15, 10);
  });

  /** Um mol a 0 °C e 1 atm ocupa os 22,4 L que a escola decora. */
  it('o volume molar nas condições normais sai da própria equação', () => {
    expect(volumeIdeal(1, 1, paraKelvin(0))).toBeCloseTo(22.4, 1);
  });

  it('as três formas se desfazem umas às outras', () => {
    const t = paraKelvin(25);
    const p = pressaoIdeal(2, 10, t);

    expect(volumeIdeal(2, p, t)).toBeCloseTo(10, 8);
    expect(molsIdeais(p, 10, t)).toBeCloseTo(2, 8);
  });

  /**
   * O erro em Celsius não é de unidade: muda a resposta inteira, e muda mais
   * quanto mais fria a temperatura.
   */
  it('usar graus Celsius muda o resultado, e muito', () => {
    const emKelvin = volumeIdeal(1, 1, paraKelvin(25));
    const emCelsius = volumeIdeal(1, 1, 25);

    expect(emKelvin / emCelsius).toBeCloseTo(298.15 / 25, 6);
  });

  it('a resolução da quantidade converte a temperatura antes de tudo', () => {
    const { resultado, passos } = molsIdeaisComPassos(2, 10, 27);

    expect(resultado).toBeCloseTo((2 * 10) / (R_LITRO_ATM * 300.15), 8);
    expect(passos[0]!.tex).toContain('273');
  });

  it('a resolução do volume mostra a substituição', () => {
    const { passos } = volumeIdealComPassos(1.5, 2, 30);

    expect(passos).toHaveLength(3);
    expect(passos[2]!.tex).toContain(String(R_LITRO_ATM));
  });
});

describe('lei combinada', () => {
  /** É PV = nRT escrita duas vezes: a razão PV/T se conserva. */
  it('a razão PV/T é a mesma nos dois estados', () => {
    const [p1, v1, t1, p2] = [2, 5, paraKelvin(27), 1];
    const t2 = paraKelvin(127);

    const v2 = volumeNoSegundoEstado(p1, v1, t1, p2, t2);

    expect((p1 * v1) / t1).toBeCloseTo((p2 * v2) / t2, 10);
  });

  it('aquecer a pressão constante aumenta o volume', () => {
    const v2 = volumeNoSegundoEstado(1, 10, paraKelvin(0), 1, paraKelvin(100));

    expect(v2).toBeGreaterThan(10);
  });

  it('a resolução traz as duas temperaturas em kelvin', () => {
    const { passos } = volumeNoSegundoEstadoComPassos(2, 5, 27, 1, 127);

    expect(passos[0]!.tex).toContain('300');
    expect(passos[0]!.tex).toContain('400');
  });
});

describe('pressões parciais', () => {
  it('as frações molares somam um', () => {
    expect(fracaoMolar(2, 5) + fracaoMolar(3, 5)).toBeCloseTo(1, 10);
  });

  it('a pressão parcial é a fração molar da total', () => {
    expect(pressaoParcial(2, 5, 10)).toBeCloseTo(4, 10);
  });

  it('as pressões parciais somam a total', () => {
    const total = 3;

    expect(pressaoParcial(1, 4, total) + pressaoParcial(3, 4, total)).toBeCloseTo(total, 10);
  });

  /**
   * A fração em massa não é a molar, e a diferença é grande quando as massas
   * molares diferem: 1 mol de He (4 g) com 1 mol de Ar (40 g) dá metade da
   * pressão para cada um, mas um onze avos da massa para o hélio.
   */
  it('a fração em massa não serve para pressão parcial', () => {
    const molarDoHelio = fracaoMolar(1, 2);
    const massicaDoHelio = fracaoEmMassa(4, 44);

    expect(molarDoHelio).toBeCloseTo(0.5, 10);
    expect(massicaDoHelio).toBeLessThan(0.1);
  });

  it('a resolução mostra a fração antes da multiplicação', () => {
    const { resultado, passos } = pressaoParcialComPassos(2, 5, 10, 'N_2');

    expect(resultado).toBeCloseTo(4, 10);
    expect(passos).toHaveLength(2);
    expect(passos[0]!.tex).toContain('0.4');
  });
});
