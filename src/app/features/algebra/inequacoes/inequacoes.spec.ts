import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorInequacoes } from './inequacoes.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(606);
  return Array.from({ length: quantidade }, () => geradorInequacoes.gerar(nivel, rng));
}

describe('geradorInequacoes', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito)).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(1e-9);
        }
      }
    });

    it(`no nível ${nivel}, a resolução termina descrevendo o conjunto`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.resolucao.passos.at(-1)?.tex).toContain('S =');
      }
    });
  }

  it('no nível fácil o coeficiente é positivo e não há inversão', () => {
    for (const exercicio of amostra('facil')) {
      expect(exercicio.conceitos).not.toContain('inequacoes.inversao');
    }
  });

  it('nos níveis seguintes aparecem casos com inversão de sinal', () => {
    const comInversao = amostra('medio').filter((e) => e.conceitos.includes('inequacoes.inversao'));

    expect(comInversao.length).toBeGreaterThan(0);
  });

  it('a resolução registra explicitamente a inversão quando ela ocorre', () => {
    const exercicio = amostra('dificil', 60).find((e) =>
      e.conceitos.includes('inequacoes.inversao'),
    )!;

    expect(exercicio.resolucao.passos.some((passo) => passo.descricao.includes('NEGATIVO'))).toBe(
      true,
    );
  });

  it('diagnostica o erro de somar em vez de subtrair', () => {
    const exercicio = amostra('medio', 40).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('em vez de subtrair')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('em vez de subtrair'),
    )!;

    expect(corrigir(geradorInequacoes, exercicio, String(armadilha.resposta)).veredito).toBe(
      'incorreto',
    );
  });
});
