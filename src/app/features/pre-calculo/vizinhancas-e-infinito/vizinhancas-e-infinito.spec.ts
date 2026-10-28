import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorVizinhancas } from './vizinhancas-e-infinito.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(5959);
  return Array.from({ length: quantidade }, () => geradorVizinhancas.gerar(nivel, rng));
}

describe('geradorVizinhancas', () => {
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

  it('o limite com denominador de grau maior é sempre zero', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciadoTex.includes('x^{2} +'));

    for (const exercicio of exercicios) {
      expect(exercicio.gabarito).toBe(0);
    }
  });

  it('a assíntota vertical zera o denominador', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciado.includes('assíntota'));

    for (const exercicio of exercicios) {
      const [, sinal, valor] = /x ([+-]) (\d+)/.exec(exercicio.enunciadoTex)!;
      const k = sinal === '-' ? Number(valor) : -Number(valor);

      expect(exercicio.gabarito).toBe(k);
    }
  });

  it('diagnostica quem inverte a razão dos coeficientes', () => {
    const exercicio = amostra('dificil', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('razão está invertida')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('razão está invertida'),
    )!;

    const resultado = corrigir(geradorVizinhancas, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('vizinhancas.infinito');
  });

  it('diagnostica quem responde zero com graus iguais', () => {
    const exercicio = amostra('dificil', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('grau MAIOR')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('vizinhancas.infinito');
  });
});
