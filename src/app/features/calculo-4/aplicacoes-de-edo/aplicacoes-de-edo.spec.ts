import { linearPrimeiraOrdemComPassos, separavelExponencialComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorAplicacoesDeEdo } from '@features/calculo-4/aplicacoes-de-edo/aplicacoes-de-edo.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(98_765);
  return Array.from({ length: quantidade }, () => geradorAplicacoesDeEdo.gerar(nivel, rng));
}

describe('geradorAplicacoesDeEdo', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorAplicacoesDeEdo.formatar(exercicio.gabarito);
        expect(corrigir(geradorAplicacoesDeEdo, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorAplicacoesDeEdo.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('todo exercício é uma situação concreta, não uma equação solta', () => {
    // O tópico existe para treinar a montagem a partir do enunciado.
    for (const nivel of NIVEIS) {
      for (const exercicio of amostra(nivel, 100)) {
        expect(exercicio.conceitos, exercicio.enunciado).toContain('aplicacoes.montar');
      }
    }
  });

  it('a temperatura de resfriamento fica entre o ambiente e o inicial', () => {
    for (const exercicio of amostra('facil', 200)) {
      if (!exercicio.enunciado.includes('resfriamento')) {
        continue;
      }

      const [, ambiente] = /ambiente a (\d+)/.exec(exercicio.enunciado)!;
      const [, inicial] = /corpo a (\d+)/.exec(exercicio.enunciado)!;

      expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThan(Number(ambiente) - 0.001);
      expect(exercicio.gabarito, exercicio.enunciado).toBeLessThan(Number(inicial) + 0.001);
    }
  });

  it('o Difícil chega ao circuito e à mola', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('aplicacoes.circuito')).toBe(true);
    expect(conceitos.has('aplicacoes.mola')).toBe(true);
  });

  it('diagnostica quem faz o corpo esfriar até zero', () => {
    const exercicio = amostra('facil', 250).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('decai exponencialmente é a DIFERENÇA')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('decai exponencialmente é a DIFERENÇA'),
    )!;
    const resultado = corrigir(
      geradorAplicacoesDeEdo,
      exercicio,
      geradorAplicacoesDeEdo.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('aplicacoes.resfriamento');
  });
});

/**
 * As aplicações compartilham o mesmo motor das EDO.
 *
 * O que se verifica aqui é que cada situação física cai no comportamento
 * esperado: o resfriamento tende ao ambiente, o circuito à corrente de regime,
 * o decaimento a zero sem nunca chegar lá.
 */
describe('aplicações de EDO', () => {
  it('no resfriamento, a temperatura tende ao ambiente', () => {
    // dT/dt = −k(T − 20), com k = 0,05 e T(0) = 90.
    const { resultado } = linearPrimeiraOrdemComPassos(0.05, 0.05 * 20, 90, 500);

    expect(resultado).toBeCloseTo(20, 6);
  });

  it('e nunca passa abaixo dele', () => {
    for (const t of [1, 10, 50, 200]) {
      const valor = linearPrimeiraOrdemComPassos(0.05, 0.05 * 20, 90, t).resultado;
      expect(valor, `t = ${t}`).toBeGreaterThan(20);
    }
  });

  it('um corpo na temperatura do ambiente não muda', () => {
    expect(linearPrimeiraOrdemComPassos(0.05, 0.05 * 20, 20, 30).resultado).toBeCloseTo(20, 10);
  });

  it('no circuito RL, a corrente parte de zero e tende a V sobre R', () => {
    // L di/dt + R i = V, com R = 4, L = 0,2 e V = 12.
    const partida = linearPrimeiraOrdemComPassos(4 / 0.2, 12 / 0.2, 0, 0).resultado;
    const regime = linearPrimeiraOrdemComPassos(4 / 0.2, 12 / 0.2, 0, 5).resultado;

    expect(partida).toBeCloseTo(0, 12);
    expect(regime).toBeCloseTo(3, 6);
  });

  it('uma constante de tempo leva a corrente a 63 por cento', () => {
    const tau = 0.2 / 4;
    const valor = linearPrimeiraOrdemComPassos(4 / 0.2, 12 / 0.2, 0, tau).resultado;

    expect(valor / 3).toBeCloseTo(1 - Math.exp(-1), 8);
  });

  it('o decaimento nunca chega a zero', () => {
    for (const t of [10, 100, 1000]) {
      expect(separavelExponencialComPassos(-0.1, 500, t).resultado, `t = ${t}`).toBeGreaterThan(0);
    }
  });

  it('no tanque, a quantidade tende à concentração de entrada vezes o volume', () => {
    // 5 L/min a 0,3 kg/L num tanque de 200 L.
    const { resultado } = linearPrimeiraOrdemComPassos(5 / 200, 5 * 0.3, 0, 2000);

    expect(resultado).toBeCloseTo(60, 6);
  });
});
