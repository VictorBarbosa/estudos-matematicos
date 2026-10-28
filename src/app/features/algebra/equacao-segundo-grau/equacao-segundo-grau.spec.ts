import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorEquacao2 } from './equacao-segundo-grau.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1618);
  return Array.from({ length: quantidade }, () => geradorEquacao2.gerar(nivel, rng));
}

describe('geradorEquacao2', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito)).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(1e-9);
        }
      }
    });

    it(`no nível ${nivel}, a resolução sempre calcula o discriminante`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.resolucao.passos[1]?.tex).toContain('\\Delta');
      }
    });
  }

  it('nos níveis fácil e médio as raízes são inteiras', () => {
    for (const nivel of ['facil', 'medio'] as const) {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isInteger(exercicio.gabarito)).toBe(true);
      }
    }
  });

  it('no nível difícil aparecem equações sem raiz real', () => {
    const semRaiz = amostra('dificil', 120).filter((e) =>
      e.enunciado.includes('não tem raízes reais'),
    );

    expect(semRaiz.length).toBeGreaterThan(0);
  });

  it('avisa quando o aluno responde a menor raiz', () => {
    const exercicio = amostra('facil', 60).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('MENOR raiz')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('MENOR raiz'))!;
    const resultado = corrigir(geradorEquacao2, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('maior');
  });
});
