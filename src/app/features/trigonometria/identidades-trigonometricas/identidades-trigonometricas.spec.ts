import { paraRadianos } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorIdentidades } from '@features/trigonometria/identidades-trigonometricas/identidades-trigonometricas.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1717);
  return Array.from({ length: quantidade }, () => geradorIdentidades.gerar(nivel, rng));
}

describe('geradorIdentidades', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito está no intervalo possível de um seno ou cosseno`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.gabarito).toBeGreaterThanOrEqual(-1.0001);
        expect(exercicio.gabarito).toBeLessThanOrEqual(1.0001);
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

  it('o seno da soma confere com o valor real', () => {
    const exercicios = amostra('facil', 80).filter((e) => e.enunciado.includes('soma de arcos'));

    for (const exercicio of exercicios) {
      const [, a, b] = /\\sin\((\d+)° \+ (\d+)°\)/.exec(exercicio.enunciadoTex)!;
      const esperado = Math.sin(paraRadianos(Number(a) + Number(b)));

      expect(exercicio.gabarito).toBeCloseTo(esperado, 9);
    }
  });

  it('o arco duplo confere com o seno do ângulo dobrado', () => {
    const exercicios = amostra('dificil', 90).filter((e) => e.enunciado.includes('arco duplo'));

    for (const exercicio of exercicios) {
      const [, dobro] = /\\sin (\d+)°/.exec(exercicio.enunciadoTex)!;
      expect(exercicio.gabarito).toBeCloseTo(Math.sin(paraRadianos(Number(dobro))), 9);
    }
  });

  it('diagnostica quem distribui o seno sobre a soma', () => {
    const exercicio = amostra('facil', 80).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('NÃO se distribui')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('NÃO se distribui'),
    )!;

    const resultado = corrigir(geradorIdentidades, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('contraexemplo');
  });

  it('diagnostica quem escreve sen 2a como 2 sen a', () => {
    const exercicio = amostra('dificil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('multiplica o ÂNGULO')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('identidades.arco-duplo');
  });
});
