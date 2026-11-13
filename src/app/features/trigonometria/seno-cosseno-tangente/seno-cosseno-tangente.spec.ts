import { paraRadianos } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorRazoes } from '@features/trigonometria/seno-cosseno-tangente/seno-cosseno-tangente.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(3131);
  return Array.from({ length: quantidade }, () => geradorRazoes.gerar(nivel, rng));
}

describe('geradorRazoes', () => {
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

  it('a tangente informada é seno sobre cosseno', () => {
    const exercicios = amostra('facil', 80).filter((e) => e.enunciado.includes('tg'));

    for (const exercicio of exercicios) {
      const [, graus] = /\\tan (\d+)°/.exec(exercicio.enunciadoTex)!;
      expect(exercicio.gabarito).toBeCloseTo(Math.tan(paraRadianos(Number(graus))), 9);
    }
  });

  it('diagnostica a tangente invertida', () => {
    const exercicio = amostra('facil', 80).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('cotangente')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('cotangente'))!;
    const resultado = corrigir(geradorRazoes, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('razoes.relacao');
  });

  it('diagnostica quem esquece os quadrados na identidade fundamental', () => {
    const exercicio = amostra('dificil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('QUADRADOS')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('razoes.relacao');
  });

  it('o exercício de complementares usa a relação seno-cosseno', () => {
    const exercicio = amostra('facil', 80).find((e) => e.enunciadoTex.includes('90°'))!;
    expect(exercicio.conceitos).toContain('razoes.complementares');
  });
});

/**
 * O mesmo cuidado da identidade fundamental, no tópico das razões.
 *
 * O gabarito sai do seno exibido, não do ângulo exato: o aluno refaz a conta a
 * partir do que leu, e é essa conta que precisa fechar.
 */
describe('geradorRazoes: o cosseno segue do seno exibido', () => {
  const comSeno = amostra('dificil', 200).filter((e) => e.enunciado.includes('Se sen θ'));

  it('há exercícios desse tipo na amostra', () => {
    expect(comSeno.length).toBeGreaterThan(0);
  });

  it('refazer a conta a partir do enunciado dá exatamente o gabarito, e é aceita', () => {
    for (const exercicio of comSeno) {
      const senoDado = Number(/sen θ = ([\d,.]+)/.exec(exercicio.enunciado)![1].replace(',', '.'));

      expect(senoDado).toBeLessThan(1);
      expect(exercicio.gabarito).toBeCloseTo(Math.sqrt(1 - senoDado * senoDado), 12);

      const escrita = Math.sqrt(1 - senoDado * senoDado).toFixed(2);
      expect(corrigir(geradorRazoes, exercicio, escrita).veredito).toBe('correto');
    }
  });
});
