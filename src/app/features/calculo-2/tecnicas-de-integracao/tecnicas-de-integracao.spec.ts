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
          // A régua é a tolerância da correção: uma armadilha que o gerador
          // considera equivalente ao gabarito diagnosticaria quem acertou.
          expect(geradorTecnicas.saoEquivalentes(armadilha.resposta, exercicio.gabarito)).toBe(
            false,
          );
        }
      }
    });
  }

  it('o gabarito da substituição confere com a integração numérica', () => {
    const porSubstituicao = amostra('medio', 90).filter((e) =>
      e.enunciado.includes('substituição'),
    );

    expect(porSubstituicao.length).toBeGreaterThan(5);

    for (const exercicio of porSubstituicao) {
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

  it('a integração por partes confere com a integração numérica', () => {
    const porPartes = amostra('dificil', 120).filter((e) => e.enunciado.includes('por partes'));

    expect(porPartes.length).toBeGreaterThan(5);

    for (const exercicio of porPartes) {
      const [, limite, coeficiente] = /\\int_\{1\}\^\{(\d+)\} (\d*)x\\ln x/.exec(
        exercicio.enunciadoTex,
      )!;
      const c = coeficiente === '' ? 1 : Number(coeficiente);

      const numerica = integralNumerica((x) => c * x * Math.log(x), 1, Number(limite), 4000);
      expect(exercicio.gabarito).toBeCloseTo(numerica, 4);
    }
  });

  it('as frações parciais conferem com a integração numérica', () => {
    const parciais = amostra('dificil', 120).filter((e) =>
      e.enunciado.includes('frações parciais'),
    );

    expect(parciais.length).toBeGreaterThan(5);

    for (const exercicio of parciais) {
      const [, ate, p, sinal, q, m, n] =
        /\\int_\{0\}\^\{(\d+)\} \\frac\{(\d*)x ([+-]) (\d+)\}\{\(x \+ (\d+)\)\(x \+ (\d+)\)\}/.exec(
          exercicio.enunciadoTex,
        )!;

      const coefP = p === '' ? 1 : Number(p);
      const coefQ = (sinal === '-' ? -1 : 1) * Number(q);

      const numerica = integralNumerica(
        (x) => (coefP * x + coefQ) / ((x + Number(m)) * (x + Number(n))),
        0,
        Number(ate),
        4000,
      );
      expect(exercicio.gabarito).toBeCloseTo(numerica, 4);
    }
  });

  it('as três técnicas aparecem nos níveis mais altos', () => {
    const enunciados = amostra('dificil', 200).map((e) => e.enunciado);

    expect(enunciados.some((e) => e.includes('substituição'))).toBe(true);
    expect(enunciados.some((e) => e.includes('por partes'))).toBe(true);
    expect(enunciados.some((e) => e.includes('frações parciais'))).toBe(true);
  });
});
