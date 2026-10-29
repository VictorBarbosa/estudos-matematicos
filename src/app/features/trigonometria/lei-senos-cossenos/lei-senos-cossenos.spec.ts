import { leiDosCossenosComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorLeis } from '@features/trigonometria/lei-senos-cossenos/lei-senos-cossenos.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(9090);
  return Array.from({ length: quantidade }, () => geradorLeis.gerar(nivel, rng));
}

describe('geradorLeis', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o lado calculado é positivo`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.gabarito).toBeGreaterThan(0);
        expect(Number.isFinite(exercicio.gabarito)).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(0.05);
        }
      }
    });
  }

  it('no nível fácil só aparece a lei dos cossenos', () => {
    for (const exercicio of amostra('facil')) {
      expect(exercicio.conceitos).toContain('leis.cossenos');
    }
  });

  it('nos níveis seguintes as duas leis aparecem', () => {
    const conceitos = new Set(amostra('dificil', 80).flatMap((e) => e.conceitos));

    expect(conceitos.has('leis.cossenos')).toBe(true);
    expect(conceitos.has('leis.senos')).toBe(true);
  });

  it('com ângulo de 90° a lei dos cossenos devolve Pitágoras', () => {
    expect(leiDosCossenosComPassos(3, 4, 90).resultado).toBeCloseTo(5, 9);
  });

  it('diagnostica quem aplica Pitágoras num triângulo não retângulo', () => {
    const exercicio = amostra('facil', 60).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('Pitágoras direto')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('Pitágoras direto'),
    )!;

    const resultado = corrigir(geradorLeis, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('leis.cossenos');
  });

  it('diagnostica quem esquece de extrair a raiz', () => {
    const exercicio = amostra('medio', 80).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('valor de a²')),
    )!;

    expect(exercicio).toBeDefined();
  });
});
