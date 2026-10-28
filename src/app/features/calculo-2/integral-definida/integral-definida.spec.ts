import { Polinomio, integralNumerica, teoremaFundamentalComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorDefinida } from './integral-definida.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(6464);
  return Array.from({ length: quantidade }, () => geradorDefinida.gerar(nivel, rng));
}

describe('geradorDefinida', () => {
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

  it('o teorema fundamental concorda com a integração numérica', () => {
    const p = Polinomio.de(1, -2, 3);
    const porTFC = teoremaFundamentalComPassos(p, 0, 2).resultado;
    const numerica = integralNumerica((x) => p.avaliar(x), 0, 2);

    expect(porTFC).toBeCloseTo(numerica, 6);
  });

  it('no nível difícil aparecem limites negativos', () => {
    const comNegativo = amostra('dificil', 90).filter((e) =>
      /\\int_\{-\d+\}/.test(e.enunciadoTex),
    );

    expect(comNegativo.length).toBeGreaterThan(0);
  });

  it('diagnostica quem esquece de subtrair o limite inferior', () => {
    // Só faz sentido quando F(a) ≠ 0 — com limite inferior zero, esquecer de
    // subtrair não muda o resultado, e a armadilha é corretamente descartada.
    const exercicio = amostra('dificil', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('limite INFERIOR')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('limite INFERIOR'),
    )!;

    const resultado = corrigir(geradorDefinida, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('tfc.enunciado');
  });

  it('diagnostica a subtração na ordem invertida', () => {
    const exercicio = amostra('dificil', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('ordem da subtração')),
    )!;

    expect(exercicio).toBeDefined();
  });
});
