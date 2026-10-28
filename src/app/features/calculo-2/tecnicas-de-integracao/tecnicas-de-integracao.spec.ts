import { integralNumerica } from '@core/math';
import { criarRng } from '@core/treino/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/treino.model';
import { geradorTecnicas } from './tecnicas-de-integracao.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(8686);
  return Array.from({ length: quantidade }, () => geradorTecnicas.gerar(nivel, rng));
}

describe('geradorTecnicas', () => {
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

  it('o gabarito confere com a integração numérica', () => {
    for (const exercicio of amostra('medio', 40)) {
      const [, aTexto, sinal, bTexto, nTexto] =
        /\\left\((\d*)x ([+-]) (\d+)\\right\)\^\{(\d+)\}/.exec(exercicio.enunciadoTex)!;
      const [, ate] = /\\int_\{0\}\^\{(\d+)\}/.exec(exercicio.enunciadoTex)!;

      const a = aTexto === '' ? 1 : Number(aTexto);
      const b = sinal === '+' ? Number(bTexto) : -Number(bTexto);
      const n = Number(nTexto);

      const numerica = integralNumerica((x) => (a * x + b) ** n, 0, Number(ate));
      expect(exercicio.gabarito).toBeCloseTo(numerica, 4);
    }
  });

  it('diagnostica quem esquece o fator da substituição', () => {
    const exercicio = amostra('facil', 60).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('coeficiente interno')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('coeficiente interno'),
    )!;

    const resultado = corrigir(geradorTecnicas, exercicio, String(armadilha.resposta));
    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('tecnicas.substituicao');
  });

  it('diagnostica quem mantém o expoente ao integrar', () => {
    const exercicio = amostra('dificil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('AUMENTAR em um')),
    )!;

    expect(exercicio).toBeDefined();
  });
});
