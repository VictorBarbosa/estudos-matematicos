import { areaComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorAreas } from './areas-de-figuras-planas.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(6064);
  return Array.from({ length: quantidade }, () => geradorAreas.gerar(nivel, rng));
}

describe('geradorAreas', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(geradorAreas.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(false);
        }
      }
    });

    it(`no nível ${nivel}, o gabarito é positivo e documentado`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.gabarito).toBeGreaterThan(0);
        expect(exercicio.resolucao.passos.length).toBeGreaterThan(1);
        expect(exercicio.conceitos.length).toBeGreaterThan(0);
      }
    });
  }

  it('a área do triângulo é metade de base × altura', () => {
    const exercicios = amostra('facil', 120).filter((e) => e.enunciado.includes('triângulo tem base'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, base, altura] = /b = (\d+) \\qquad h = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBeCloseTo((Number(base) * Number(altura)) / 2, 9);
    }
  });

  it('a área do trapézio é a média das bases vezes a altura', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('trapézio'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, maior, menor, altura] =
        /B = (\d+) \\qquad b = (\d+) \\qquad h = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBeCloseTo(
        areaComPassos('trapezio', {
          base: Number(maior),
          baseMenor: Number(menor),
          altura: Number(altura),
        }).resultado,
        9,
      );
    }
  });

  it('a altura pedida reconstrói a área informada', () => {
    const exercicios = amostra('medio', 150).filter((e) => e.enunciado.includes('Qual é sua altura'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, area, base] = /A = (\d+(?:\.\d+)?) \\qquad b = (\d+)/.exec(exercicio.enunciadoTex)!;
      const triangulo = exercicio.enunciado.includes('triângulo');

      const reconstruida = triangulo
        ? (Number(base) * exercicio.gabarito) / 2
        : Number(base) * exercicio.gabarito;

      expect(reconstruida).toBeCloseTo(Number(area), 6);
    }
  });

  it('a área ampliada usa k², não k', () => {
    const exercicios = amostra('dificil', 150).filter((e) => e.enunciado.includes('ampliada'));

    expect(exercicios.length).toBeGreaterThan(0);

    for (const exercicio of exercicios) {
      const [, area, k] = /A = (\d+) \\qquad k = (\d+)/.exec(exercicio.enunciadoTex)!;

      expect(exercicio.gabarito).toBe(Number(area) * Number(k) ** 2);
    }
  });

  it('diagnostica quem esquece de dividir o triângulo por 2', () => {
    const exercicio = amostra('facil', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('METADE do paralelogramo')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('METADE do paralelogramo'),
    )!;

    const resultado = corrigir(geradorAreas, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('areas.deducao');
  });

  it('diagnostica quem responde o perímetro', () => {
    const exercicio = amostra('facil', 150).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('PERÍMETRO')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('PERÍMETRO'))!;
    const resultado = corrigir(geradorAreas, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('unidades');
  });

  it('aceita decimal com vírgula', () => {
    expect(geradorAreas.analisar('7,5')).toBe(7.5);
    expect(geradorAreas.analisar('24')).toBe(24);
    expect(geradorAreas.analisar('vinte')).toBeNull();
  });
});
