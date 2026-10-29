import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorLimiteIntuitivo } from '@features/pre-calculo/nocao-intuitiva-de-limite/nocao-intuitiva-de-limite.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(3737);
  return Array.from({ length: quantidade }, () => geradorLimiteIntuitivo.gerar(nivel, rng));
}

describe('geradorLimiteIntuitivo', () => {
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

  it('o limite da diferença de quadrados é o dobro do ponto', () => {
    // Só a diferença de quadrados tem a fração com x² no numerador; a função
    // contínua também contém "x^{2} -" quando o termo constante é negativo.
    const exercicios = amostra('facil', 90).filter((e) =>
      e.enunciadoTex.includes('\\frac{x^{2}'),
    );

    for (const exercicio of exercicios) {
      const [, k] = /x \\to (\d+)/.exec(exercicio.enunciadoTex)!;
      expect(exercicio.gabarito).toBe(2 * Number(k));
    }
  });

  it('os casos de indeterminação avisam disso no enunciado ou na resolução', () => {
    const indeterminados = amostra('dificil', 90).filter((e) =>
      e.conceitos.includes('limite.indeterminacao'),
    );

    for (const exercicio of indeterminados) {
      const mencionaIndeterminacao =
        exercicio.enunciado.includes('0/0') ||
        exercicio.resolucao.passos.some((p) => p.tex.includes('\\frac{0}{0}'));

      expect(mencionaIndeterminacao).toBe(true);
    }
  });

  it('diagnostica quem responde zero na indeterminação 0/0', () => {
    const exercicio = amostra('medio', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.resposta === 0),
    )!;

    const resultado = corrigir(geradorLimiteIntuitivo, exercicio, '0');

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('indetermina');
    expect(resultado.conceitoAssociado).toBe('limite.indeterminacao');
  });
});
