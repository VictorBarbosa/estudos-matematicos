import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorProporcao } from './razao-proporcao.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(4242);
  return Array.from({ length: quantidade }, () => geradorProporcao.gerar(nivel, rng));
}

describe('geradorProporcao', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é positivo e finito`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito)).toBe(true);
        expect(exercicio.gabarito).toBeGreaterThan(0);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(1e-6);
        }
      }
    });

    it(`no nível ${nivel}, todo exercício tem enunciado em contexto`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.enunciado.length).toBeGreaterThan(20);
      }
    });
  }

  it('no nível fácil só aparece a proporcionalidade direta', () => {
    for (const exercicio of amostra('facil')) {
      expect(exercicio.enunciadoTex).toContain('\\frac');
    }
  });

  it('nos níveis seguintes aparecem os dois tipos', () => {
    const inversas = amostra('medio', 60).filter((e) => e.enunciadoTex.includes('\\cdot'));

    expect(inversas.length).toBeGreaterThan(0);
    expect(inversas.length).toBeLessThan(60);
  });

  it('avisa quem confunde direta com inversa', () => {
    const exercicio = amostra('medio', 60).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('INVERSAMENTE')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('INVERSAMENTE'))!;
    const resultado = corrigir(geradorProporcao, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('proporcao.regra-de-tres');
  });
});
