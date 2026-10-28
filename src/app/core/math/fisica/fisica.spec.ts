import { ErroMatematico } from '@core/math/tipos';
import {
  ADIMENSIONAL,
  deduzirDimensaoComPassos,
  dimensaoParaTex,
  dimensoesIguais,
  dividirDimensoes,
  elevarDimensao,
  grandezaPorNome,
  multiplicarDimensoes,
  verificarEquacaoComPassos,
} from './dimensional';
import {
  anguloCriticoComPassos,
  deslocamentoPorAreaComPassos,
  movimentoUniformementeVariado,
  planoInclinadoComPassos,
  segundaLeiComPassos,
  torricelliComPassos,
} from './mecanica';
import {
  centroDeMassaComPassos,
  colisaoComPassos,
  conservacaoEnergiaComPassos,
  energiaCinetica,
  equilibrioAlavancaComPassos,
  impulsoComPassos,
  momentoLinear,
  potenciaMediaComPassos,
  torqueComPassos,
  trabalhoComPassos,
} from './energia';
import {
  G,
  MASSA_TERRA,
  RAIO_TERRA,
  empuxoDeMotorComPassos,
  forcaGravitacionalComPassos,
  gravidadeNaAltitudeComPassos,
  orbitaCircularComPassos,
  terceiraLeiKeplerComPassos,
  tsiolkovskyComPassos,
  velocidadeEscapeComPassos,
} from './gravitacao';
import {
  DENSIDADE_AGUA,
  bernoulliComPassos,
  empuxoArquimedesComPassos,
  gasIdealComPassos,
  pressaoHidrostaticaComPassos,
  primeiraLeiComPassos,
  sustentacaoComPassos,
  trabalhoIsobaricoComPassos,
} from './fluidos';

describe('análise dimensional', () => {
  it('as dimensões deduzidas batem com a tabela de grandezas', () => {
    const pares: readonly [Parameters<typeof deduzirDimensaoComPassos>[0], string][] = [
      ['velocidade', 'velocidade'],
      ['aceleracao', 'aceleração'],
      ['forca', 'força'],
      ['energia', 'energia'],
      ['potencia', 'potência'],
      ['pressao', 'pressão'],
    ];

    for (const [chave, nome] of pares) {
      const deduzida = deduzirDimensaoComPassos(chave).resultado;
      expect(dimensoesIguais(deduzida, grandezaPorNome(nome)!.dimensao)).toBe(true);
    }
  });

  it('energia e trabalho têm a mesma dimensão', () => {
    const forca = grandezaPorNome('força')!.dimensao;
    const comprimento = grandezaPorNome('comprimento')!.dimensao;

    expect(
      dimensoesIguais(multiplicarDimensoes(forca, comprimento), grandezaPorNome('energia')!.dimensao),
    ).toBe(true);
  });

  it('energia cinética tem a dimensão de energia', () => {
    const massa = grandezaPorNome('massa')!.dimensao;
    const velocidade = grandezaPorNome('velocidade')!.dimensao;

    const cinetica = multiplicarDimensoes(massa, elevarDimensao(velocidade, 2));
    expect(dimensoesIguais(cinetica, grandezaPorNome('energia')!.dimensao)).toBe(true);
  });

  it('a notação omite expoentes nulos', () => {
    expect(dimensaoParaTex(ADIMENSIONAL)).toBe('1');
    expect(dimensaoParaTex({ M: 1, L: 1, T: -2 })).toBe('ML T^{-2}'.replace(' ', ''));
    expect(dimensaoParaTex({ M: 0, L: 1, T: -1 })).toBe('LT^{-1}');
  });

  it('um número adimensional sai da razão de grandezas iguais', () => {
    const velocidade = grandezaPorNome('velocidade')!.dimensao;
    expect(dimensoesIguais(dividirDimensoes(velocidade, velocidade), ADIMENSIONAL)).toBe(true);
  });

  it('a verificação aprova equação consistente e reprova a inconsistente', () => {
    const energia = grandezaPorNome('energia')!.dimensao;
    const forca = grandezaPorNome('força')!.dimensao;

    expect(verificarEquacaoComPassos(energia, energia, 'E', 'mv²').resultado.consistente).toBe(true);
    expect(verificarEquacaoComPassos(energia, forca, 'E', 'ma').resultado.consistente).toBe(false);
  });
});

describe('cinemática e dinâmica', () => {
  it('o MUV confere com as equações do movimento', () => {
    const { posicao, velocidade } = movimentoUniformementeVariado(10, 5, 2, 3);

    expect(posicao).toBeCloseTo(10 + 5 * 3 + (2 * 9) / 2, 9);
    expect(velocidade).toBeCloseTo(5 + 2 * 3, 9);
  });

  it('Torricelli confere com o cálculo pelo tempo', () => {
    const v0 = 4;
    const a = 3;
    const t = 2;

    const { posicao, velocidade } = movimentoUniformementeVariado(0, v0, a, t);
    expect(torricelliComPassos(v0, a, posicao).resultado).toBeCloseTo(velocidade, 8);
  });

  it('Torricelli recusa deslocamento inalcançável', () => {
    expect(() => torricelliComPassos(2, -5, 100)).toThrow(ErroMatematico);
  });

  it('a área sob a velocidade é o deslocamento', () => {
    const { resultado } = deslocamentoPorAreaComPassos(6, 2, 4);
    expect(resultado).toBeCloseTo(movimentoUniformementeVariado(0, 6, 2, 4).posicao, 9);
  });

  it('a segunda lei soma as forças com sinal', () => {
    const { resultado } = segundaLeiComPassos(10, [
      { valor: 50, descricao: 'tração' },
      { valor: -20, descricao: 'atrito' },
    ]);

    expect(resultado.resultante).toBe(30);
    expect(resultado.aceleracao).toBeCloseTo(3, 9);
  });

  it('resultante nula dá aceleração nula', () => {
    const { resultado } = segundaLeiComPassos(5, [
      { valor: 10, descricao: 'empurrão' },
      { valor: -10, descricao: 'atrito' },
    ]);

    expect(resultado.aceleracao).toBe(0);
  });

  it('recusa massa não positiva', () => {
    expect(() => segundaLeiComPassos(0, [{ valor: 1, descricao: 'f' }])).toThrow(ErroMatematico);
  });

  it('no plano inclinado, a normal cai e a componente do peso cresce com o ângulo', () => {
    const suave = planoInclinadoComPassos(10, 15, 0).resultado;
    const inclinado = planoInclinadoComPassos(10, 60, 0).resultado;

    expect(inclinado.componentePeso).toBeGreaterThan(suave.componentePeso);
    expect(inclinado.normal).toBeLessThan(suave.normal);
  });

  it('sem atrito, a aceleração no plano é g·sen(θ)', () => {
    const { resultado } = planoInclinadoComPassos(7, 30, 0);
    expect(resultado.aceleracao).toBeCloseTo(9.81 * Math.sin(Math.PI / 6), 8);
  });

  it('a aceleração no plano não depende da massa', () => {
    const leve = planoInclinadoComPassos(1, 40, 0.2).resultado.aceleracao;
    const pesado = planoInclinadoComPassos(100, 40, 0.2).resultado.aceleracao;

    expect(leve).toBeCloseTo(pesado, 9);
  });

  it('o ângulo crítico satisfaz tan(θ) = μ', () => {
    for (const mu of [0.1, 0.3, 0.5, 1]) {
      const angulo = anguloCriticoComPassos(mu).resultado;
      expect(Math.tan((angulo * Math.PI) / 180)).toBeCloseTo(mu, 9);

      // Exatamente no ângulo crítico, o bloco está no limite de deslizar.
      expect(planoInclinadoComPassos(5, angulo - 0.5, mu).resultado.desliza).toBe(false);
      expect(planoInclinadoComPassos(5, angulo + 0.5, mu).resultado.desliza).toBe(true);
    }
  });

  it('recusa ângulos e coeficientes inválidos', () => {
    expect(() => planoInclinadoComPassos(1, 100, 0.2)).toThrow(ErroMatematico);
    expect(() => planoInclinadoComPassos(1, 30, -0.1)).toThrow(ErroMatematico);
  });
});

describe('energia, impulso e momento', () => {
  it('força perpendicular não realiza trabalho', () => {
    expect(trabalhoComPassos(100, 5, 90).resultado).toBeCloseTo(0, 9);
  });

  it('força contrária realiza trabalho negativo', () => {
    expect(trabalhoComPassos(10, 3, 180).resultado).toBeCloseTo(-30, 9);
  });

  it('a velocidade de queda não depende da massa', () => {
    const leve = conservacaoEnergiaComPassos(1, 20, 0).resultado.velocidadeFinal;
    const pesado = conservacaoEnergiaComPassos(1000, 20, 0).resultado.velocidadeFinal;

    expect(leve).toBeCloseTo(pesado, 9);
    expect(leve).toBeCloseTo(Math.sqrt(2 * 9.81 * 20), 8);
  });

  it('a energia mecânica total se conserva', () => {
    const { resultado } = conservacaoEnergiaComPassos(5, 10, 3, 2);

    expect(resultado.cineticaInicial + resultado.potencialInicial).toBeCloseTo(
      resultado.cineticaFinal + resultado.potencialFinal,
      8,
    );
  });

  it('recusa altura inalcançável', () => {
    expect(() => conservacaoEnergiaComPassos(2, 0, 10)).toThrow(ErroMatematico);
  });

  it('potência é trabalho por tempo', () => {
    expect(potenciaMediaComPassos(600, 4).resultado).toBeCloseTo(150, 9);
    expect(() => potenciaMediaComPassos(100, 0)).toThrow(ErroMatematico);
  });

  it('o impulso iguala a variação do momento', () => {
    const massa = 4;
    const { resultado } = impulsoComPassos(20, 3, massa);
    const variacaoVelocidade = resultado / massa;

    expect(resultado).toBeCloseTo(60, 9);
    expect(momentoLinear(massa, variacaoVelocidade)).toBeCloseTo(resultado, 9);
  });

  it('a colisão inelástica conserva momento mas perde energia', () => {
    const { resultado } = colisaoComPassos(2, 10, 3, 0, 'perfeitamente-inelastica');

    expect(resultado.velocidadeFinalA).toBeCloseTo(4, 9);
    expect(2 * resultado.velocidadeFinalA + 3 * resultado.velocidadeFinalB).toBeCloseTo(
      resultado.momentoTotal,
      8,
    );
    expect(resultado.energiaDepois).toBeLessThan(resultado.energiaAntes);
  });

  it('a colisão elástica conserva momento e energia', () => {
    const { resultado } = colisaoComPassos(2, 8, 5, -3, 'elastica');

    expect(2 * resultado.velocidadeFinalA + 5 * resultado.velocidadeFinalB).toBeCloseTo(
      resultado.momentoTotal,
      8,
    );
    expect(resultado.energiaDepois).toBeCloseTo(resultado.energiaAntes, 8);
  });

  it('massas iguais em colisão elástica trocam de velocidade', () => {
    const { resultado } = colisaoComPassos(3, 7, 3, -2, 'elastica');

    expect(resultado.velocidadeFinalA).toBeCloseTo(-2, 8);
    expect(resultado.velocidadeFinalB).toBeCloseTo(7, 8);
  });

  it('a energia cinética nunca é negativa', () => {
    expect(energiaCinetica(2, -5)).toBeCloseTo(25, 9);
  });

  it('o centro de massa fica mais perto do corpo pesado', () => {
    const { resultado } = centroDeMassaComPassos([
      { massa: 1, posicao: 0 },
      { massa: 9, posicao: 10 },
    ]);

    expect(resultado).toBeCloseTo(9, 9);
  });

  it('o torque é máximo a 90° e nulo a 0°', () => {
    expect(torqueComPassos(50, 2, 90).resultado).toBeCloseTo(100, 9);
    expect(torqueComPassos(50, 2, 0).resultado).toBeCloseTo(0, 9);
  });

  it('a alavanca equilibra pelos torques', () => {
    // 100 N a 0,5 m equilibra 25 N a 2 m.
    expect(equilibrioAlavancaComPassos(100, 0.5, 25).resultado).toBeCloseTo(2, 9);
  });
});

describe('gravitação e propulsão', () => {
  it('a gravidade na superfície da Terra sai da lei da gravitação', () => {
    const { resultado } = gravidadeNaAltitudeComPassos(0);
    expect(resultado).toBeCloseTo(9.82, 1);
  });

  it('a força cai com o quadrado da distância', () => {
    const perto = forcaGravitacionalComPassos(MASSA_TERRA, 100, RAIO_TERRA).resultado;
    const longe = forcaGravitacionalComPassos(MASSA_TERRA, 100, 2 * RAIO_TERRA).resultado;

    expect(perto / longe).toBeCloseTo(4, 6);
  });

  it('a órbita baixa da Terra tem velocidade perto de 7,7 km/s', () => {
    const { resultado } = orbitaCircularComPassos(400_000);

    expect(resultado.velocidade / 1000).toBeGreaterThan(7.5);
    expect(resultado.velocidade / 1000).toBeLessThan(7.8);
    // E período de cerca de 90 minutos.
    expect(resultado.periodo / 60).toBeGreaterThan(88);
    expect(resultado.periodo / 60).toBeLessThan(94);
  });

  it('na órbita, a gravidade é exatamente a força centrípeta', () => {
    const altitude = 1_000_000;
    const { resultado } = orbitaCircularComPassos(altitude);

    const gravidade = (G * MASSA_TERRA) / resultado.raio ** 2;
    const centripeta = resultado.velocidade ** 2 / resultado.raio;

    expect(gravidade).toBeCloseTo(centripeta, 8);
  });

  it('órbitas mais altas são mais lentas', () => {
    const baixa = orbitaCircularComPassos(300_000).resultado;
    const alta = orbitaCircularComPassos(35_786_000).resultado;

    expect(alta.velocidade).toBeLessThan(baixa.velocidade);
    expect(alta.periodo).toBeGreaterThan(baixa.periodo);
    // A órbita geoestacionária tem período de 24 h.
    expect(alta.periodo / 3600).toBeCloseTo(24, 0);
  });

  it('a velocidade de escape é √2 vezes a orbital', () => {
    const escape = velocidadeEscapeComPassos().resultado;
    const orbital = orbitaCircularComPassos(0).resultado.velocidade;

    expect(escape / orbital).toBeCloseTo(Math.SQRT2, 9);
    expect(escape / 1000).toBeCloseTo(11.2, 1);
  });

  it('a terceira lei de Kepler confere com as órbitas calculadas', () => {
    const a = orbitaCircularComPassos(500_000).resultado;
    const b = orbitaCircularComPassos(20_000_000).resultado;

    const previsto = terceiraLeiKeplerComPassos(a.raio, a.periodo, b.raio).resultado;
    expect(previsto).toBeCloseTo(b.periodo, 0);
  });

  it('Tsiolkovsky cresce com o logaritmo da razão de massas', () => {
    const modesto = tsiolkovskyComPassos(2, 1, 3000).resultado;
    const agressivo = tsiolkovskyComPassos(8, 1, 3000).resultado;

    // Razão de massas 4 vezes maior, delta-v apenas 3 vezes: é logaritmo.
    expect(agressivo.deltaV / modesto.deltaV).toBeCloseTo(3, 6);
    expect(modesto.deltaV).toBeCloseTo(3000 * Math.LN2, 8);
  });

  it('dobrar o delta-v exige elevar ao quadrado a razão de massas', () => {
    const simples = tsiolkovskyComPassos(3, 1, 3000).resultado;
    const dobrado = tsiolkovskyComPassos(9, 1, 3000).resultado;

    expect(dobrado.deltaV).toBeCloseTo(2 * simples.deltaV, 6);
  });

  it('recusa massa final maior que a inicial', () => {
    expect(() => tsiolkovskyComPassos(1, 2, 3000)).toThrow(ErroMatematico);
  });

  it('o empuxo é vazão vezes velocidade de exaustão', () => {
    expect(empuxoDeMotorComPassos(250, 3000).resultado).toBeCloseTo(750_000, 6);
  });
});

describe('fluidos e termodinâmica', () => {
  it('a pressão cresce cerca de 1 atm a cada 10 m de água', () => {
    const superficie = pressaoHidrostaticaComPassos(0).resultado;
    const dezMetros = pressaoHidrostaticaComPassos(10).resultado;

    expect((dezMetros - superficie) / 101325).toBeCloseTo(0.97, 1);
  });

  it('flutua o que é menos denso que o fluido', () => {
    const gelo = empuxoArquimedesComPassos(1, 920).resultado;
    const ferro = empuxoArquimedesComPassos(1, 7800).resultado;

    expect(gelo.flutua).toBe(true);
    expect(ferro.flutua).toBe(false);
  });

  it('a fração submersa é a razão das densidades', () => {
    const { resultado } = empuxoArquimedesComPassos(2, 920, DENSIDADE_AGUA);
    expect(resultado.fracaoSubmersa).toBeCloseTo(0.92, 9);
  });

  it('a flutuação não depende do tamanho do corpo', () => {
    const pequeno = empuxoArquimedesComPassos(0.001, 500).resultado;
    const grande = empuxoArquimedesComPassos(1000, 500).resultado;

    expect(pequeno.flutua).toBe(grande.flutua);
    expect(pequeno.fracaoSubmersa).toBeCloseTo(grande.fracaoSubmersa, 9);
  });

  it('por Bernoulli, mais velocidade significa menos pressão', () => {
    const pressaoInicial = 101325;
    const acelerando = bernoulliComPassos(pressaoInicial, 10, 30).resultado;
    const desacelerando = bernoulliComPassos(pressaoInicial, 30, 10).resultado;

    expect(acelerando).toBeLessThan(pressaoInicial);
    expect(desacelerando).toBeGreaterThan(pressaoInicial);
  });

  it('a sustentação cresce com o quadrado da velocidade', () => {
    const lenta = sustentacaoComPassos(20, 60, 50).resultado;
    const rapida = sustentacaoComPassos(20, 120, 100).resultado;

    expect(rapida / lenta).toBeCloseTo(4, 6);
  });

  it('o gás ideal resolve a variável que falta', () => {
    const { resultado } = gasIdealComPassos({ pressao: 101325, volume: 0.0224, temperatura: 273 });
    expect(resultado.mols).toBeCloseTo(1, 1);
  });

  it('exige exatamente três grandezas e temperatura em kelvin', () => {
    expect(() => gasIdealComPassos({ pressao: 1, volume: 1 })).toThrow(ErroMatematico);
    expect(() =>
      gasIdealComPassos({ pressao: 1, volume: 1, temperatura: 0, mols: undefined }),
    ).toThrow(ErroMatematico);
  });

  it('a primeira lei contabiliza calor e trabalho', () => {
    expect(primeiraLeiComPassos(500, 200).resultado).toBe(300);
    expect(primeiraLeiComPassos(200, 200).resultado).toBe(0);
  });

  it('a expansão isobárica realiza trabalho positivo', () => {
    expect(trabalhoIsobaricoComPassos(101325, 0.01, 0.03).resultado).toBeCloseTo(
      101325 * 0.02,
      6,
    );
    expect(trabalhoIsobaricoComPassos(101325, 0.03, 0.01).resultado).toBeLessThan(0);
  });
});
