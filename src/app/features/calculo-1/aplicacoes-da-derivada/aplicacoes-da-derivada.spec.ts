import { Polinomio, pontosCriticos } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorAplicacoesDerivada } from '@features/calculo-1/aplicacoes-da-derivada/aplicacoes-da-derivada.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(3636);
  return Array.from({ length: quantidade }, () => geradorAplicacoesDerivada.gerar(nivel, rng));
}

describe('geradorAplicacoesDerivada', () => {
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

  it('a área máxima da cerca é a do quadrado', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('cerca'));

    for (const exercicio of exercicios) {
      const [, perimetro] = /Com (\d+) m de cerca/.exec(exercicio.enunciado)!;
      const lado = Number(perimetro) / 4;

      expect(exercicio.gabarito).toBe(lado * lado);
    }
  });

  it('os pontos críticos informados anulam mesmo a derivada', () => {
    const exercicios = amostra('facil', 90).filter((e) =>
      e.enunciado.includes('pontos críticos'),
    );

    for (const exercicio of exercicios) {
      const k = exercicio.gabarito;
      // f(x) = x³ − 3k²x tem derivada 3x² − 3k², que zera em ±k.
      const p = Polinomio.de(0, -3 * k * k, 0, 1);
      expect(p.derivar().avaliar(k)).toBeCloseTo(0, 9);
    }
  });

  it('diagnostica quem confunde o x do máximo com o valor máximo', () => {
    const exercicio = amostra('dificil', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('x onde ocorre o máximo')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('x onde ocorre o máximo'),
    )!;

    const resultado = corrigir(geradorAplicacoesDerivada, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
  });

  it('diagnostica quem responde o lado em vez da área', () => {
    const exercicio = amostra('facil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('LADO do retângulo')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('aplic-derivada.otimizacao');
  });

  it('o core classifica máximo e mínimo corretamente', () => {
    // x³ − 3x: máximo em −1, mínimo em +1.
    const f = (x: number) => x ** 3 - 3 * x;
    const criticos = pontosCriticos(f, -3, 3);

    expect(criticos.length).toBe(2);
    expect(criticos[0]!.tipo).toBe('maximo');
    expect(criticos[1]!.tipo).toBe('minimo');
  });
});
