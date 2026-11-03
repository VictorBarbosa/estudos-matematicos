import {
  aceleracaoCentripeta,
  movimentoCircularComPassos,
  velocidadeAngular,
  velocidadeTangencial,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorMovimentoCircular } from '@features/fisica/movimento-circular/movimento-circular.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(60_221);
  return Array.from({ length: quantidade }, () => geradorMovimentoCircular.gerar(nivel, rng));
}

describe('geradorMovimentoCircular', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorMovimentoCircular.formatar(exercicio.gabarito);
        expect(corrigir(geradorMovimentoCircular, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorMovimentoCircular.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('toda resolução termina exatamente no que foi perguntado', () => {
    // Os tipos compartilham uma cadeia só de passos, e cada um para num elo
    // diferente dela — se o recorte errar, a resolução conclui outra coisa.
    for (const nivel of NIVEIS) {
      for (const exercicio of amostra(nivel, 60)) {
        expect(
          geradorMovimentoCircular.saoEquivalentes(
            exercicio.resolucao.resultado,
            exercicio.gabarito,
          ),
          exercicio.enunciado,
        ).toBe(true);
        expect(exercicio.resolucao.passos.length).toBeGreaterThan(0);
      }
    }
  });

  it('a armadilha de "aceleração zero" aparece onde ela é o engano do tópico', () => {
    const centripetas = amostra('dificil', 250).filter((exercicio) =>
      exercicio.conceitos.includes('circular.centripeta'),
    );

    expect(centripetas.length).toBeGreaterThan(0);
    expect(
      centripetas.some((exercicio) => exercicio.armadilhas.some((a) => a.resposta === 0)),
    ).toBe(true);
  });

  it('diagnostica quem esquece de converter rotações por minuto', () => {
    const exercicio = amostra('facil', 250).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('converter minutos')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('converter minutos'),
    )!;
    const resultado = corrigir(
      geradorMovimentoCircular,
      exercicio,
      geradorMovimentoCircular.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('circular.periodo-frequencia');
  });
});

/**
 * O motor do movimento circular.
 *
 * A cadeia período → angular → tangencial → centrípeta é conferida elo a elo,
 * porque é nela que cada tipo de exercício se apoia.
 */
describe('movimento circular', () => {
  it('uma volta são 2 pi radianos', () => {
    expect(velocidadeAngular(1)).toBeCloseTo(2 * Math.PI, 12);
    expect(velocidadeAngular(2 * Math.PI)).toBeCloseTo(1, 12);
  });

  it('a velocidade tangencial cresce com o raio', () => {
    const omega = velocidadeAngular(4);

    expect(velocidadeTangencial(omega, 2)).toBeCloseTo(2 * velocidadeTangencial(omega, 1), 12);
  });

  it('dobrar a velocidade quadruplica a aceleração centrípeta', () => {
    expect(aceleracaoCentripeta(20, 2)).toBeCloseTo(4 * aceleracaoCentripeta(10, 2), 12);
  });

  it('as duas formas da aceleração centrípeta concordam', () => {
    const periodo = 3;
    const raio = 1.5;
    const omega = velocidadeAngular(periodo);
    const v = velocidadeTangencial(omega, raio);

    expect(aceleracaoCentripeta(v, raio)).toBeCloseTo(omega * omega * raio, 12);
  });

  it('a resolução vai do período até a força, em quatro passos', () => {
    const { resultado, passos } = movimentoCircularComPassos(2, 1, 3);

    expect(passos).toHaveLength(4);
    expect(resultado).toBeCloseTo(aceleracaoCentripeta(velocidadeTangencial(Math.PI, 1), 1), 10);
    expect(passos[3]!.nota).toContain('não é uma força nova');
  });

  it('a nota do segundo passo explica por que o raio importa', () => {
    const { passos } = movimentoCircularComPassos(5, 2, 1);

    expect(passos[1]!.nota).toContain('mais afastados do eixo');
  });
});
