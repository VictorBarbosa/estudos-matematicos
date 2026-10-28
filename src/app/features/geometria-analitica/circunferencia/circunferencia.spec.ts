import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorCircunferencia } from './circunferencia.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(2626);
  return Array.from({ length: quantidade }, () => geradorCircunferencia.gerar(nivel, rng));
}

describe('geradorCircunferencia', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é inteiro`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isInteger(exercicio.gabarito)).toBe(true);
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

  it('o raio pedido é sempre positivo', () => {
    const exercicios = amostra('medio', 90).filter((e) => e.enunciado.includes('raio'));

    for (const exercicio of exercicios) {
      expect(exercicio.gabarito).toBeGreaterThan(0);
    }
  });

  it('no nível fácil a equação vem na forma reduzida', () => {
    for (const exercicio of amostra('facil')) {
      const reduzida = exercicio.enunciadoTex.includes('(x');
      const geral = exercicio.enunciadoTex.startsWith('x^{2} + y^{2}');
      expect(reduzida || geral).toBe(true);
    }
  });

  it('diagnostica quem confunde r com r²', () => {
    const exercicio = amostra('facil', 80).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('RAIZ')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('RAIZ'))!;
    const resultado = corrigir(geradorCircunferencia, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('circunferencia.definicao');
  });

  it('diagnostica quem lê D como a abscissa do centro', () => {
    const exercicio = amostra('facil', 80).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('coeficiente D')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('circunferencia.geral');
  });
});
