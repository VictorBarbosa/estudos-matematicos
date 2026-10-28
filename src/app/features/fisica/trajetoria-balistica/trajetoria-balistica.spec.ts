import { GRAVIDADE, resolverLancamentoComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { alcanceDe, geradorBalistica } from './trajetoria-balistica.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1123);
  return Array.from({ length: quantidade }, () => geradorBalistica.gerar(nivel, rng));
}

describe('geradorBalistica', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é positivo e finito`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.gabarito).toBeGreaterThan(0);
        expect(Number.isFinite(exercicio.gabarito)).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(0.05);
        }
      }
    });
  }

  it('o gabarito confere com o motor de cinemática', () => {
    for (const exercicio of amostra('medio', 40)) {
      const [, v0, angulo, h0] =
        /v_0 = (\d+)\\text\{ m\/s\} \\qquad \\theta = (\d+)° \\qquad h_0 = (\d+)/.exec(
          exercicio.enunciadoTex,
        )!;

      const { resultado } = resolverLancamentoComPassos({
        velocidadeInicial: Number(v0),
        anguloGraus: Number(angulo),
        alturaInicial: Number(h0),
        gravidade: GRAVIDADE,
      });

      const bate = [resultado.alcance, resultado.alturaMaxima, resultado.tempoDeVoo].some(
        (valor) => Math.abs(valor - exercicio.gabarito) < 1e-9,
      );

      expect(bate).toBe(true);
    }
  });

  it('o alcance é máximo em 45° partindo do chão', () => {
    const alcances = [35, 40, 45, 50, 55].map((graus) => alcanceDe(25, graus, 0));
    expect(Math.max(...alcances)).toBeCloseTo(alcances[2]!, 9);
  });

  it('com altura inicial, o ângulo ótimo cai abaixo de 45°', () => {
    const a45 = alcanceDe(20, 45, 30);
    const a35 = alcanceDe(20, 35, 30);

    expect(a35).toBeGreaterThan(a45);
  });

  it('diagnostica quem usa a velocidade total em vez da componente', () => {
    const exercicio = amostra('facil', 60).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('velocidade TOTAL')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('velocidade TOTAL'),
    )!;

    const resultado = corrigir(geradorBalistica, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('balistica.independencia');
  });

  it('diagnostica quem para no tempo até o ápice', () => {
    const exercicio = amostra('facil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('PONTO MAIS ALTO')),
    )!;

    expect(exercicio).toBeDefined();
  });
});
