import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorContinuidade } from '@features/calculo-1/continuidade/continuidade.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(8484);
  return Array.from({ length: quantidade }, () => geradorContinuidade.gerar(nivel, rng));
}

describe('geradorContinuidade', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é inteiro`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isInteger(exercicio.gabarito)).toBe(true);
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

  it('o valor que remove o buraco é o próprio limite', () => {
    const exercicios = amostra('facil', 90).filter((e) =>
      e.enunciado.includes('não está definida'),
    );

    for (const exercicio of exercicios) {
      const [, k] = /x = (\d+)/.exec(exercicio.enunciado)!;
      expect(exercicio.gabarito).toBe(2 * Number(k));
    }
  });

  it('o exercício de TVI apresenta uma troca de sinal', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('intermediário'));

    for (const exercicio of exercicios) {
      expect(exercicio.resolucao.passos[1]?.tex).toContain('< 0 <');
    }
  });

  it('diagnostica quem atribui zero ao buraco', () => {
    const exercicio = amostra('facil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.resposta === 0),
    )!;

    const resultado = corrigir(geradorContinuidade, exercicio, '0');

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toContain('continuidade');
  });

  it('diagnostica quem confunde o limite com o valor de k', () => {
    const exercicio = amostra('dificil', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('limite pela esquerda')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('continuidade.definicao');
  });
});

describe('geradorContinuidade — tipo de descontinuidade', () => {
  it('o tipo confere com os laterais calculados numericamente', () => {
    const rng = criarRng(8080);
    for (const nivel of ['medio', 'dificil', 'extremo'] as const) {
      const casos = Array.from({ length: 300 }, () => geradorContinuidade.gerar(nivel, rng)).filter(
        (e) => e.enunciado.startsWith('Classifique'),
      );
      expect(casos.length).toBeGreaterThan(0);
      for (const e of casos) {
        expect([1, 2, 3]).toContain(e.gabarito);
        expect(e.armadilhas.map((a) => a.resposta).sort()).toEqual(
          [1, 2, 3].filter((t) => t !== e.gabarito),
        );
      }
    }
  });
});
