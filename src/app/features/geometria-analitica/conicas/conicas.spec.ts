import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorConicas } from './conicas.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(8383);
  return Array.from({ length: quantidade }, () => geradorConicas.gerar(nivel, rng));
}

describe('geradorConicas', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é positivo e finito`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.gabarito).toBeGreaterThan(0);
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

  it('a excentricidade da elipse fica entre 0 e 1', () => {
    const elipses = amostra('medio', 120).filter(
      (e) => e.enunciado.includes('excentricidade') && e.enunciado.includes('elipse'),
    );

    for (const exercicio of elipses) {
      expect(exercicio.gabarito).toBeGreaterThan(0);
      expect(exercicio.gabarito).toBeLessThan(1);
    }
  });

  it('a excentricidade da hipérbole é maior que 1', () => {
    const hiperboles = amostra('dificil', 120).filter(
      (e) => e.enunciado.includes('excentricidade') && e.enunciado.includes('hipérbole'),
    );

    for (const exercicio of hiperboles) {
      expect(exercicio.gabarito).toBeGreaterThan(1);
    }
  });

  it('no nível fácil só aparecem elipses', () => {
    for (const exercicio of amostra('facil')) {
      expect(exercicio.enunciado).not.toContain('hipérbole');
    }
  });

  it('diagnostica quem troca a relação da elipse pela da hipérbole', () => {
    const exercicio = amostra('medio', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('relação da hipérbole')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('relação da hipérbole'),
    )!;

    const resultado = corrigir(geradorConicas, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
  });
});
