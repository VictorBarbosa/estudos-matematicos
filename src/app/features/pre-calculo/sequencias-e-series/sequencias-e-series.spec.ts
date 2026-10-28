import { termoGeral } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorSequencias } from './sequencias-e-series.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1919);
  return Array.from({ length: quantidade }, () => geradorSequencias.gerar(nivel, rng));
}

describe('geradorSequencias', () => {
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

  it('o termo pedido confere com a fórmula do termo geral', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('º termo'));

    for (const exercicio of exercicios) {
      const [, n] = /Qual é o (\d+)º termo/.exec(exercicio.enunciado)!;
      const [, primeiro, razao] = /a_1 = (\d+) \\qquad [qr] = (-?\d+)/.exec(
        exercicio.enunciadoTex,
      )!;

      const geometrica = exercicio.enunciado.includes('geométrica');
      const esperado = termoGeral(
        { primeiro: Number(primeiro), razao: Number(razao), geometrica },
        Number(n),
      );

      expect(exercicio.gabarito).toBeCloseTo(esperado, 6);
    }
  });

  it('no nível fácil só aparecem progressões aritméticas', () => {
    for (const exercicio of amostra('facil')) {
      expect(exercicio.enunciado).not.toContain('geométrica');
    }
  });

  it('a soma infinita só aparece com razão convergente', () => {
    const infinitas = amostra('dificil', 120).filter((e) => e.enunciado.includes('INFINITA'));

    for (const exercicio of infinitas) {
      // Com |q| < 1 a soma é sempre maior que o primeiro termo e finita.
      expect(Number.isFinite(exercicio.gabarito)).toBe(true);
      expect(exercicio.gabarito).toBeGreaterThan(0);
    }
  });

  it('diagnostica quem usa n passos em vez de n−1', () => {
    const exercicio = amostra('medio', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('n−1 passos')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('n−1 passos'),
    )!;

    const resultado = corrigir(geradorSequencias, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('sequencias.progressoes');
  });

  it('diagnostica quem troca a soma pelo último termo', () => {
    const exercicio = amostra('facil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('TERMO, não a soma')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('sequencias.soma');
  });
});
