import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorPontoReta } from '@features/geometria-analitica/ponto-e-reta/ponto-e-reta.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(4747);
  return Array.from({ length: quantidade }, () => geradorPontoReta.gerar(nivel, rng));
}

describe('geradorPontoReta', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito)).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(0.02);
        }
      }
    });
  }

  it('a distância calculada confere com Pitágoras', () => {
    const exercicios = amostra('medio', 90).filter((e) => e.enunciado.includes('distância'));

    for (const exercicio of exercicios) {
      const [, ax, ay, bx, by] =
        /A\((-?\d+),\\; (-?\d+)\) \\qquad B\((-?\d+),\\; (-?\d+)\)/.exec(exercicio.enunciadoTex)!;

      const esperado = Math.hypot(Number(bx) - Number(ax), Number(by) - Number(ay));
      expect(exercicio.gabarito).toBeCloseTo(esperado, 9);
    }
  });

  it('nos níveis fácil e médio a distância é inteira', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('distância'));

    for (const exercicio of exercicios) {
      expect(Number.isInteger(exercicio.gabarito)).toBe(true);
    }
  });

  it('a inclinação nunca é pedida para reta vertical', () => {
    const exercicios = amostra('dificil', 90).filter((e) => e.enunciado.includes('angular'));

    for (const exercicio of exercicios) {
      expect(Number.isFinite(exercicio.gabarito)).toBe(true);
    }
  });

  it('diagnostica quem soma os catetos em vez de usar a hipotenusa', () => {
    const exercicio = amostra('facil', 60).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('HIPOTENUSA')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('HIPOTENUSA'))!;
    const resultado = corrigir(geradorPontoReta, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('ponto-reta.distancia');
  });

  it('diagnostica a inclinação invertida', () => {
    const exercicio = amostra('dificil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('razão está invertida')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('ponto-reta.equacao');
  });
});
