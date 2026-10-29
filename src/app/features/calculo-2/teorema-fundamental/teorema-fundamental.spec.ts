import { Polinomio, derivadaNumerica, integralNumerica } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorTfc } from './teorema-fundamental.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(7575);
  return Array.from({ length: quantidade }, () => geradorTfc.gerar(nivel, rng));
}

describe('geradorTfc', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito)).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(0.01);
        }
      }
    });
  }

  it('a derivada da área acumulada é o próprio integrando', () => {
    const p = Polinomio.de(0, 2, 3); // 3x² + 2x
    const area = (x: number) => integralNumerica((t) => p.avaliar(t), 0, x);

    for (const x of [1, 2, 3]) {
      expect(derivadaNumerica(area, x, 1e-4)).toBeCloseTo(p.avaliar(x), 3);
    }
  });

  it('diagnostica quem confunde a área com a sua derivada', () => {
    const exercicio = amostra('facil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('valor da ÁREA')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('valor da ÁREA'),
    )!;

    const resultado = corrigir(geradorTfc, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('tfc.funcao-area');
  });

  it('diagnostica quem avalia a função em vez da primitiva', () => {
    const exercicio = amostra('dificil', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('É a PRIMITIVA')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('tfc.enunciado');
  });

  it('o k pedido é a única solução positiva', () => {
    const rng = criarRng(31_415);
    const exercicios = Array.from({ length: 400 }, () => geradorTfc.gerar('dificil', rng)).filter(
      (e) => e.enunciado.includes('Para qual valor de k'),
    );

    expect(exercicios.length).toBeGreaterThan(20);

    for (const exercicio of exercicios) {
      const [, coefA, sinal, coefB] =
        /\\int_\{0\}\^\{k\} \\left\((\d*)x\^\{2\}(?: ([+-]) (\d*)x)?\\right\)/.exec(
          exercicio.enunciadoTex,
        ) ?? [];

      expect(coefA, exercicio.enunciadoTex).toBeDefined();

      const qa = coefA === '' ? 1 : Number(coefA);
      const qb = coefB === undefined ? 0 : (sinal === '-' ? -1 : 1) * (coefB === '' ? 1 : Number(coefB));

      // F(x) = a x³/3 + b x²/2; procuramos outro k > 0 com o mesmo valor.
      const f = (x: number): number => (qa * x ** 3) / 3 + (qb * x ** 2) / 2;
      const alvo = f(exercicio.gabarito as number);

      for (let x = 0.01; x <= 8; x += 0.01) {
        if (Math.abs(x - (exercicio.gabarito as number)) < 0.05) {
          continue;
        }
        expect(Math.abs(f(x) - alvo)).toBeGreaterThan(0.01);
      }
    }
  });
});
