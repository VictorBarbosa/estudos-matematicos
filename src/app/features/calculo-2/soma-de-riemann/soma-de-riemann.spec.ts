import { integralNumerica, somaDeRiemann } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorRiemann } from '@features/calculo-2/soma-de-riemann/soma-de-riemann.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(4141);
  return Array.from({ length: quantidade }, () => geradorRiemann.gerar(nivel, rng));
}

describe('geradorRiemann', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é positivo e finito`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.gabarito).toBeGreaterThanOrEqual(0);
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

  it('a soma pela esquerda subestima a área de uma função crescente', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('esquerda'));

    for (const exercicio of exercicios) {
      const ultimoPasso = exercicio.resolucao.passos.at(-1)!;
      expect(ultimoPasso.nota).toContain('subestima');
    }
  });

  it('refinar a partição reduz o erro', () => {
    const fn = (x: number) => x * x;
    const exata = integralNumerica(fn, 0, 2);

    const grosseira = Math.abs(somaDeRiemann(fn, 0, 2, 4) - exata);
    const refinada = Math.abs(somaDeRiemann(fn, 0, 2, 200) - exata);

    expect(refinada).toBeLessThan(grosseira / 10);
  });

  it('diagnostica quem responde a área exata', () => {
    const exercicio = amostra('medio', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('valor EXATO')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('valor EXATO'),
    )!;

    const resultado = corrigir(geradorRiemann, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('riemann.limite');
  });

  it('diagnostica quem esquece de multiplicar pela largura', () => {
    const exercicio = amostra('facil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('Faltou multiplicar pela largura')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('riemann.ideia');
  });
});
