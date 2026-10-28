import { Polinomio, quocienteDeNewton } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorDefinicaoDerivada } from './definicao-de-derivada.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(9292);
  return Array.from({ length: quantidade }, () => geradorDefinicaoDerivada.gerar(nivel, rng));
}

describe('geradorDefinicaoDerivada', () => {
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

  it('no nível difícil só aparece a derivada no ponto', () => {
    for (const exercicio of amostra('dificil')) {
      expect(exercicio.enunciado).toContain("f'");
    }
  });

  it('a inclinação da secante confere com o quociente de Newton', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('secante'));

    for (const exercicio of exercicios) {
      expect(Number.isFinite(exercicio.gabarito)).toBe(true);
      // A secante difere da tangente, salvo coincidência: ambas são finitas.
      expect(exercicio.resolucao.passos).toHaveLength(4);
    }
  });

  it('a secante se aproxima da tangente quando h diminui', () => {
    const p = Polinomio.de(0, 0, 1); // x²
    const fn = (x: number) => p.avaliar(x);
    const exata = p.derivar().avaliar(2);

    const grosseira = Math.abs(quocienteDeNewton(fn, 2, 1) - exata);
    const fina = Math.abs(quocienteDeNewton(fn, 2, 0.001) - exata);

    expect(fina).toBeLessThan(grosseira);
  });

  it('diagnostica quem confunde a derivada com o valor da função', () => {
    const exercicio = amostra('dificil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('valor da FUNÇÃO')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('valor da FUNÇÃO'),
    )!;

    const resultado = corrigir(geradorDefinicaoDerivada, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
  });

  it('diagnostica quem esquece de dividir pela variação de x', () => {
    const exercicio = amostra('facil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('Faltou dividir')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('derivada.secante');
  });
});
