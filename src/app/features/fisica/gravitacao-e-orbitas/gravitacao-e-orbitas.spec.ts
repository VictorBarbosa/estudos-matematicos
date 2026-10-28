import { G, MASSA_TERRA, RAIO_TERRA, orbitaCircularComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorGravitacao } from './gravitacao-e-orbitas.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(6674);
  return Array.from({ length: quantidade }, () => geradorGravitacao.gerar(nivel, rng));
}

/**
 * Lê a altitude em km do enunciado.
 *
 * O TeX usa `\,` como separador de milhar, então descartar tudo o que não é
 * dígito é mais seguro que tentar recortar o separador.
 */
function altitudeKm(enunciadoTex: string): number {
  const bruto = /h = ([\d\\,]+)/.exec(enunciadoTex)![1];
  return Number(bruto.replace(/\D/g, ''));
}

describe('geradorGravitacao', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorGravitacao.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(
            false,
          );
        }
      }
    });

    it(`no nível ${nivel}, o gabarito é positivo e documentado`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.gabarito).toBeGreaterThan(0);
        expect(exercicio.resolucao.passos.length).toBeGreaterThan(1);
        expect(exercicio.conceitos.length).toBeGreaterThan(0);
      }
    });
  }

  it('a gravidade usa a distância ao centro da Terra', () => {
    const exercicios = amostra('facil', 90).filter((e) =>
      e.enunciado.includes('aceleração da gravidade'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const raio = RAIO_TERRA + altitudeKm(exercicio.enunciadoTex) * 1000;
      expect(exercicio.gabarito).toBeCloseTo((G * MASSA_TERRA) / raio ** 2, 6);
    }
  });

  it('a gravidade na superfície fica perto de 9,8 m/s²', () => {
    const naSuperficie = amostra('facil', 150).find(
      (e) => e.enunciado.includes('aceleração da gravidade') && altitudeKm(e.enunciadoTex) === 0,
    );

    expect(naSuperficie).toBeDefined();
    expect(naSuperficie!.gabarito).toBeCloseTo(9.82, 1);
  });

  it('a velocidade orbital confere e cai com a altitude', () => {
    const exercicios = amostra('medio', 150).filter((e) =>
      e.enunciado.includes('velocidade de um satélite'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const altitude = altitudeKm(exercicio.enunciadoTex) * 1000;
      const esperado = orbitaCircularComPassos(altitude).resultado.velocidade / 1000;

      expect(exercicio.gabarito).toBeCloseTo(esperado, 6);
      // Mais alto, mais lento.
      const maisAlto = orbitaCircularComPassos(altitude + 1_000_000).resultado.velocidade / 1000;
      expect(maisAlto).toBeLessThan(exercicio.gabarito);
    }
  });

  it('o período da órbita geoestacionária é de cerca de 24 h', () => {
    const geo = amostra('dificil', 200).find(
      (e) => e.enunciado.includes('período orbital') && altitudeKm(e.enunciadoTex) === 35786,
    );

    expect(geo).toBeDefined();
    // O gabarito está em minutos.
    expect(geo!.gabarito / 60).toBeCloseTo(24, 0);
  });

  it('a velocidade de escape é √2 vezes a orbital rasante', () => {
    const exercicios = amostra('dificil', 200).filter((e) =>
      e.enunciado.includes('velocidade de escape'),
    );

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, massa, raio] =
        /M = ([\d.e+]+)\\,\\text\{kg\} \\qquad R = ([\d.e+]+)/.exec(exercicio.enunciadoTex)!;

      // Massa e raio vêm do enunciado com 4 dígitos significativos, então a
      // razão fecha com essa precisão, não mais.
      const orbital = Math.sqrt((G * Number(massa)) / Number(raio)) / 1000;
      expect(exercicio.gabarito / orbital).toBeCloseTo(Math.SQRT2, 4);
    }
  });

  it('a razão de forças usa o quadrado do fator de distância', () => {
    const exercicios = amostra('facil', 120).filter((e) => e.enunciado.includes('fica dividida'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const fator = Number(/por (\d+), a força/.exec(exercicio.enunciado)![1]);
      expect(exercicio.gabarito).toBe(fator ** 2);
    }
  });

  it('diagnostica quem mede a distância da superfície', () => {
    const exercicio = amostra('facil', 180).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('medida do CENTRO')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('medida do CENTRO'),
    )!;

    const resultado = corrigir(geradorGravitacao, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('gravitacao.lei');
  });

  it('diagnostica quem confunde velocidade orbital com de escape', () => {
    const exercicio = amostra('medio', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('velocidade de ESCAPE')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('velocidade de ESCAPE'),
    )!;

    const resultado = corrigir(geradorGravitacao, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('gravitacao.escape');
  });

  it('aceita notação exponencial, útil nessas escalas', () => {
    expect(geradorGravitacao.analisar('7,67')).toBeCloseTo(7.67, 9);
    expect(geradorGravitacao.analisar('5.97e24')).toBeCloseTo(5.97e24, 9);
    expect(geradorGravitacao.analisar('orbital')).toBeNull();
  });
});
