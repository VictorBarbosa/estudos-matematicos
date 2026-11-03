import {
  alcanceDoLancamentoComPassos,
  cicloideParametrica,
  circunferenciaParametrica,
  eliminarParametroComPassos,
  elipseParametrica,
  lancamentoParametrico,
  posicaoNoInstanteComPassos,
  retaParametrica,
  velocidadeParametricaComPassos,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorEquacoesParametricas } from '@features/geometria-analitica/equacoes-parametricas/equacoes-parametricas.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(86_420);
  return Array.from({ length: quantidade }, () => geradorEquacoesParametricas.gerar(nivel, rng));
}

describe('geradorEquacoesParametricas', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorEquacoesParametricas.formatar(exercicio.gabarito);
        expect(corrigir(geradorEquacoesParametricas, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorEquacoesParametricas.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o Difícil cobra velocidade e alcance', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('parametricas.velocidade')).toBe(true);
    expect(conceitos.has('parametricas.movimento')).toBe(true);
  });

  it('todo enunciado traz as duas equações, nunca uma só', () => {
    for (const nivel of NIVEIS) {
      for (const exercicio of amostra(nivel, 100)) {
        if (!exercicio.enunciadoTex.includes('cases')) {
          continue;
        }
        expect(exercicio.enunciadoTex, exercicio.enunciadoTex).toContain('x =');
        expect(exercicio.enunciadoTex, exercicio.enunciadoTex).toContain('y =');
      }
    }
  });

  it('diagnostica quem devolve a outra coordenada', () => {
    // Na reta, o engano é ler a equação errada do sistema — e o diagnóstico
    // precisa falar das duas equações, não da convenção seno/cosseno.
    const exercicio = amostra('facil', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('As duas equações andam juntas')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('As duas equações andam juntas'),
    )!;
    const resultado = corrigir(
      geradorEquacoesParametricas,
      exercicio,
      geradorEquacoesParametricas.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('parametricas.parametro');
  });
});

/**
 * O motor das paramétricas.
 *
 * O que ele precisa preservar é o que a forma cartesiana perde: o instante em
 * que o móvel passa por cada ponto, e a velocidade com que passa.
 */
describe('equações paramétricas', () => {
  it('a reta avança uniformemente com o parâmetro', () => {
    const reta = retaParametrica(1, 2, 3, 4);

    expect(reta.x(0)).toBe(1);
    expect(reta.x(2)).toBe(7);
    expect(reta.y(2)).toBe(10);
  });

  it('a circunferência começa à direita e sobe', () => {
    const circulo = circunferenciaParametrica(0, 0, 5);

    expect(circulo.x(0)).toBeCloseTo(5, 12);
    expect(circulo.y(0)).toBeCloseTo(0, 12);
    expect(circulo.y(Math.PI / 2)).toBeCloseTo(5, 12);
  });

  it('todo ponto da circunferência satisfaz a cartesiana', () => {
    const circulo = circunferenciaParametrica(2, -1, 3);

    for (let k = 0; k < 12; k++) {
      const t = (k / 12) * 2 * Math.PI;
      const distancia = Math.hypot(circulo.x(t) - 2, circulo.y(t) + 1);
      expect(distancia).toBeCloseTo(3, 10);
    }
  });

  it('a elipse satisfaz a sua própria equação', () => {
    const elipse = elipseParametrica(4, 2);

    for (let k = 0; k < 8; k++) {
      const t = (k / 8) * 2 * Math.PI;
      expect(elipse.x(t) ** 2 / 16 + elipse.y(t) ** 2 / 4).toBeCloseTo(1, 10);
    }
  });

  it('no movimento circular a rapidez é constante e vale o raio', () => {
    const circulo = circunferenciaParametrica(0, 0, 7);

    for (const t of [0, 1, 2.5, 4]) {
      expect(velocidadeParametricaComPassos(circulo, t).resultado).toBeCloseTo(7, 4);
    }
  });

  it('a ciclóide toca o chão uma vez por volta', () => {
    const cicloide = cicloideParametrica(2);

    expect(cicloide.y(0)).toBeCloseTo(0, 10);
    expect(cicloide.y(2 * Math.PI)).toBeCloseTo(0, 10);
    expect(cicloide.y(Math.PI)).toBeCloseTo(4, 10);
  });

  it('o lançamento sobe e volta ao mesmo nível', () => {
    const tiro = lancamentoParametrico(20, 45);
    const voo = (2 * 20 * Math.sin(Math.PI / 4)) / 9.81;

    expect(tiro.y(0)).toBeCloseTo(0, 10);
    expect(tiro.y(voo)).toBeCloseTo(0, 8);
  });

  it('o alcance é máximo a 45 graus', () => {
    const quarenta = alcanceDoLancamentoComPassos(30, 45).resultado;

    for (const angulo of [15, 30, 60, 75]) {
      expect(alcanceDoLancamentoComPassos(30, angulo).resultado).toBeLessThan(quarenta);
    }
  });

  it('ângulos complementares dão o mesmo alcance', () => {
    expect(alcanceDoLancamentoComPassos(25, 30).resultado).toBeCloseTo(
      alcanceDoLancamentoComPassos(25, 60).resultado,
      8,
    );
  });

  it('a posição num instante traz as duas coordenadas', () => {
    const { passos } = posicaoNoInstanteComPassos(retaParametrica(0, 0, 3, 4), 2);

    expect(passos[1]!.tex).toContain('x =');
    expect(passos[1]!.tex).toContain('y =');
  });

  it('eliminar o parâmetro devolve a cartesiana, e avisa o que se perde', () => {
    const { resultado, passos } = eliminarParametroComPassos(circunferenciaParametrica(0, 0, 3));

    expect(resultado).toContain('= 9');
    expect(passos.at(-1)!.nota).toContain('quando o móvel passa');
  });
});
