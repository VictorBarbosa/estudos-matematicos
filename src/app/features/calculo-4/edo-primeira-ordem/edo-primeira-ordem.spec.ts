import {
  linearPrimeiraOrdemComPassos,
  meiaVidaComPassos,
  separavelExponencialComPassos,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorEdoPrimeiraOrdem } from '@features/calculo-4/edo-primeira-ordem/edo-primeira-ordem.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(10_101);
  return Array.from({ length: quantidade }, () => geradorEdoPrimeiraOrdem.gerar(nivel, rng));
}

describe('geradorEdoPrimeiraOrdem', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorEdoPrimeiraOrdem.formatar(exercicio.gabarito);
        expect(corrigir(geradorEdoPrimeiraOrdem, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorEdoPrimeiraOrdem.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o Fácil fica na separável ou no k da equação exata', () => {
    for (const exercicio of amostra('facil', 150)) {
      expect(
        exercicio.conceitos.includes('edo1.separavel') || exercicio.conceitos.includes('edo1.exata'),
      ).toBe(true);
    }
  });

  it('o Difícil cobra fator integrante e regime permanente', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('edo1.fator-integrante')).toBe(true);
    expect(conceitos.has('edo1.regime-permanente')).toBe(true);
  });

  it('a meia-vida pedida é sempre positiva', () => {
    for (const exercicio of amostra('medio', 200)) {
      if (!exercicio.enunciado.includes('meia-vida')) {
        continue;
      }
      expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThan(0);
    }
  });

  it('diagnostica quem trata o crescimento como linear', () => {
    const exercicio = amostra('facil', 200).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('não é linear')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('não é linear'))!;
    const resultado = corrigir(
      geradorEdoPrimeiraOrdem,
      exercicio,
      geradorEdoPrimeiraOrdem.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('edo1.separavel');
  });
});

/**
 * O motor das EDO de primeira ordem.
 *
 * Toda solução é conferida contra a propriedade que a define: a derivada da
 * função achada precisa satisfazer a equação de partida.
 */
describe('EDO de primeira ordem', () => {
  it('a solução exponencial satisfaz a própria equação', () => {
    const k = 0.4;
    const y0 = 7;
    const t = 2.5;
    const h = 1e-6;

    const y = (instante: number) => separavelExponencialComPassos(k, y0, instante).resultado;
    const derivada = (y(t + h) - y(t - h)) / (2 * h);

    expect(derivada).toBeCloseTo(k * y(t), 4);
  });

  it('a condição inicial é respeitada', () => {
    expect(separavelExponencialComPassos(0.4, 7, 0).resultado).toBeCloseTo(7, 12);
  });

  it('a meia-vida não depende da quantidade inicial', () => {
    const t = meiaVidaComPassos(-0.1).resultado;

    expect(separavelExponencialComPassos(-0.1, 100, t).resultado).toBeCloseTo(50, 8);
    expect(separavelExponencialComPassos(-0.1, 7, t).resultado).toBeCloseTo(3.5, 8);
  });

  it('duas meias-vidas deixam um quarto', () => {
    const t = meiaVidaComPassos(-0.3).resultado;

    expect(separavelExponencialComPassos(-0.3, 80, 2 * t).resultado).toBeCloseTo(20, 8);
  });

  it('a linear de primeira ordem respeita a condição inicial', () => {
    expect(linearPrimeiraOrdemComPassos(0.5, 10, 3, 0).resultado).toBeCloseTo(3, 12);
  });

  it('e tende ao regime permanente', () => {
    const { resultado } = linearPrimeiraOrdemComPassos(0.5, 10, 3, 100);

    expect(resultado).toBeCloseTo(20, 8);
  });

  it('a solução linear satisfaz a equação', () => {
    const [p, q, y0, t, h] = [0.5, 10, 3, 4, 1e-6];
    const y = (instante: number) => linearPrimeiraOrdemComPassos(p, q, y0, instante).resultado;
    const derivada = (y(t + h) - y(t - h)) / (2 * h);

    expect(derivada + p * y(t)).toBeCloseTo(q, 4);
  });

  it('partindo do equilíbrio, nada muda', () => {
    const { resultado } = linearPrimeiraOrdemComPassos(0.5, 10, 20, 7);

    expect(resultado).toBeCloseTo(20, 10);
  });

  it('a resolução separa transiente de permanente', () => {
    const { passos } = linearPrimeiraOrdemComPassos(0.5, 10, 3, 2);

    expect(passos[3]!.nota).toContain('regime permanente');
    expect(passos[1]!.nota).toContain('derivada de um produto');
  });
});

describe('geradorEdoPrimeiraOrdem — equação exata', () => {
  const rng = criarRng(4455);
  const lote = (nivel: Nivel) =>
    Array.from({ length: 300 }, () => geradorEdoPrimeiraOrdem.gerar(nivel, rng)).filter((e) =>
      e.conceitos.includes('edo1.exata'),
    );

  /** Avalia uma soma de termos em LaTeX (cxᵖyᵠ e ceˣ) num ponto. */
  function avaliar(tex: string, x: number, y: number): number {
    const js = tex
      .replace(/\s/g, '')
      .replace(/e\^\{x\}/g, 'E')
      .replace(/([xy])\^\{(\d+)\}/g, '($1**$2)')
      .replace(/(\d)([xyE(])/g, '$1*$2')
      .replace(/([xyE)])([xyE(])/g, '$1*$2')
      .replace(/([xyE)])([xyE(])/g, '$1*$2');
    return new Function('x', 'y', 'E', `return ${js};`)(x, y, Math.exp(x)) as number;
  }

  it('no Fácil aparece o k da exatidão, e com ele as derivadas cruzadas coincidem', () => {
    const casos = lote('facil').filter((e) => e.enunciado.includes('valor de k'));
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const [, m, n] = /\\left\((.*?)\\right\)dx \+ \\left\((.*?)\\right\)dy/.exec(
        e.enunciadoTex.replace(/k/g, String(e.gabarito)),
      )!;
      const h = 1e-5;
      for (const [x, y] of [
        [1.3, 0.7],
        [-0.8, 1.9],
      ]) {
        const dMdy = (avaliar(m!, x!, y! + h) - avaliar(m!, x!, y! - h)) / (2 * h);
        const dNdx = (avaliar(n!, x! + h, y!) - avaliar(n!, x! - h, y!)) / (2 * h);
        expect(dMdy).toBeCloseTo(dNdx, 4);
      }
    }
  });

  it('a constante C é F no ponto, e F tem as derivadas M e N do enunciado', () => {
    for (const nivel of ['medio', 'dificil', 'extremo'] as const) {
      const casos = lote(nivel).filter((e) => e.enunciado.includes('valor de C'));
      expect(casos.length).toBeGreaterThan(0);
      for (const e of casos) {
        const [, m, n] = /\\left\((.*?)\\right\)dx \+ \\left\((.*?)\\right\)dy/.exec(
          e.enunciadoTex,
        )!;
        const fTex = /F\(x, y\) = (.*)$/.exec(e.resolucao.passos[3]!.tex)![1]!;
        const [, x0, y0] = /\((-?\d+), (-?\d+)\)/.exec(e.enunciado)!.map(Number);
        expect(avaliar(fTex, x0!, y0!)).toBeCloseTo(e.gabarito, 6);
        const h = 1e-5;
        const [x, y] = [0.6, -1.1];
        expect((avaliar(fTex, x + h, y) - avaliar(fTex, x - h, y)) / (2 * h)).toBeCloseTo(
          avaliar(m!, x, y),
          4,
        );
        expect((avaliar(fTex, x, y + h) - avaliar(fTex, x, y - h)) / (2 * h)).toBeCloseTo(
          avaliar(n!, x, y),
          4,
        );
      }
    }
  });
});
