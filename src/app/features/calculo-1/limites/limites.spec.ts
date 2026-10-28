import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorLimites } from './limites.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(6363);
  return Array.from({ length: quantidade }, () => geradorLimites.gerar(nivel, rng));
}

describe('geradorLimites', () => {
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

  it('o limite da diferença de cubos é 3a²', () => {
    const exercicios = amostra('facil', 90).filter((e) => e.enunciadoTex.includes('x^{3}'));

    for (const exercicio of exercicios) {
      const [, a] = /x \\to (\d+)/.exec(exercicio.enunciadoTex)!;
      expect(exercicio.gabarito).toBe(3 * Number(a) ** 2);
    }
  });

  it('o nível difícil inclui racionalização por conjugado', () => {
    const comConjugado = amostra('dificil', 120).filter((e) =>
      e.enunciadoTex.includes('\\sqrt'),
    );

    expect(comConjugado.length).toBeGreaterThan(0);
  });

  it('diagnostica quem responde zero numa indeterminação', () => {
    const exercicio = amostra('medio', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.resposta === 0),
    )!;

    const resultado = corrigir(geradorLimites, exercicio, '0');

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toContain('limites');
  });

  it('diagnostica a razão invertida no limite ao infinito', () => {
    const exercicio = amostra('dificil', 120).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('razão está invertida')),
    )!;

    expect(exercicio).toBeDefined();
  });
});
