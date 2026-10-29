import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorExpressoes } from '@features/algebra/expressoes-algebricas/expressoes-algebricas.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(2025);
  return Array.from({ length: quantidade }, () => geradorExpressoes.gerar(nivel, rng));
}

describe('geradorExpressoes', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é inteiro`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isInteger(exercicio.gabarito)).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(armadilha.resposta).not.toBe(exercicio.gabarito);
        }
      }
    });
  }

  it('no nível fácil pede o valor numérico', () => {
    for (const exercicio of amostra('facil')) {
      expect(exercicio.enunciado).toContain('valor numérico');
      expect(exercicio.enunciadoTex).toContain('x =');
    }
  });

  it('nos níveis seguintes pede o coeficiente após reduzir', () => {
    for (const exercicio of amostra('medio')) {
      expect(exercicio.enunciado).toContain('termos semelhantes');
    }
  });

  it('no nível difícil aparecem subtrações de parênteses', () => {
    const comSubtracao = amostra('dificil').filter((e) =>
      e.conceitos.includes('expressoes.distributiva'),
    );

    expect(comSubtracao.length).toBeGreaterThan(0);
  });

  it('diagnostica quem lê x² como 2x', () => {
    const exercicio = amostra('facil', 40).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('lido como 2x')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('lido como 2x'))!;
    const resultado = corrigir(geradorExpressoes, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('expressoes.variavel');
  });
});
