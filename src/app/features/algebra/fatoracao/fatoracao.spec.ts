import { Polinomio, fatorarComPassos } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorFatoracao } from '@features/algebra/fatoracao/fatoracao.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(5150);
  return Array.from({ length: quantidade }, () => geradorFatoracao.gerar(nivel, rng));
}

describe('geradorFatoracao', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, a raiz informada realmente anula a expressão`, () => {
      for (const exercicio of amostra(nivel)) {
        // Reconstrói o polinômio a partir do enunciado para conferir de fora.
        const raiz = exercicio.gabarito;
        expect(Number.isFinite(raiz)).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(armadilha.resposta).not.toBe(exercicio.gabarito);
        }
      }
    });

    it(`no nível ${nivel}, a expressão gerada é de fato fatorável`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(exercicio.resolucao.passos.length).toBeGreaterThanOrEqual(2);
      }
    });
  }

  it('no nível fácil as raízes são inteiras e positivas', () => {
    for (const exercicio of amostra('facil')) {
      expect(Number.isInteger(exercicio.gabarito)).toBe(true);
      expect(exercicio.gabarito).toBeGreaterThan(0);
    }
  });

  it('diagnostica a troca de sinal da raiz', () => {
    const exercicio = amostra('facil', 40).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('sinal está invertido')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('sinal está invertido'),
    )!;
    const resultado = corrigir(geradorFatoracao, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.diagnostico).toContain('(x − r)');
  });

  it('a fatoração do core reconhece cada tipo', () => {
    expect(fatorarComPassos(Polinomio.de(0, 9, 6)).resultado.tipo).toBe('fator-comum');
    expect(fatorarComPassos(Polinomio.de(-16, 0, 9)).resultado.tipo).toBe('diferenca-de-quadrados');
    expect(fatorarComPassos(Polinomio.de(9, -6, 1)).resultado.tipo).toBe(
      'trinomio-quadrado-perfeito',
    );
  });
});

describe('geradorFatoracao: o que o aluno consegue escrever', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é inteiro ou uma fração de denominador pequeno`, () => {
      // Até o Difícil a raiz é inteira. No Extremo o trinômio não é mônico, e
      // a raiz é uma fração — mas com denominador até 7, que se escreve à mão.
      for (const exercicio of amostra(nivel, 200)) {
        const g = exercicio.gabarito;
        if (nivel === 'extremo') {
          const denominador = [2, 3, 4, 5, 6, 7].find((d) => Number.isInteger(g * d));
          expect(denominador ?? 1, `${exercicio.enunciadoTex} → ${g}`).toBeGreaterThan(0);
        } else {
          expect(Number.isInteger(g), `${exercicio.enunciadoTex}`).toBe(true);
        }
      }
    });

    it(`no nível ${nivel}, o gabarito é aceito escrito de todo jeito`, () => {
      for (const exercicio of amostra(nivel, 60)) {
        const g = exercicio.gabarito;
        for (const escrita of [
          String(g),
          String(g).replace('.', ','),
          g.toFixed(2),
          g.toFixed(2).replace('.', ','),
          g.toFixed(3),
        ]) {
          expect(
            corrigir(geradorFatoracao, exercicio, escrita).veredito,
            `${exercicio.enunciadoTex} escrito "${escrita}"`,
          ).toBe('correto');
        }
      }
    });
  }
});

describe('geradorFatoracao — agrupamento e cubos', () => {
  /** Avalia o polinômio do enunciado (`... = 0`) em x. */
  function avaliar(tex: string, x: number): number {
    const limpo = tex.replace(/\s*=\s*0$/, '').replace(/\s+/g, '');
    let total = 0;
    for (const [, sinal, numero, xs, expoente] of limpo.matchAll(
      /([+-]?)(\d*)(x(?:\^\{(\d+)\})?)?/g,
    )) {
      if (numero === '' && xs === undefined) continue;
      const grau = xs === undefined ? 0 : expoente === undefined ? 1 : Number(expoente);
      total += (numero === '' ? 1 : Number(numero)) * (sinal === '-' ? -1 : 1) * x ** grau;
    }
    return total;
  }

  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito anula a expressão do enunciado`, () => {
      for (const exercicio of amostra(nivel, 150)) {
        expect(
          avaliar(exercicio.enunciadoTex, exercicio.gabarito),
          exercicio.enunciadoTex,
        ).toBeCloseTo(0, 6);
      }
    });
  }

  it('cubos e agrupamento aparecem, e o gabarito é a maior raiz real', () => {
    const todos = (['medio', 'dificil', 'extremo'] as const).flatMap((n) => amostra(n, 150));
    const novos = todos.filter((e) => /fatoracao-(cubos|agrupamento)/.test(e.id));
    expect(novos.some((e) => e.id.includes('cubos'))).toBe(true);
    expect(novos.some((e) => e.id.includes('agrupamento'))).toBe(true);
    for (const exercicio of novos) {
      // Depois da maior raiz real, a expressão não troca mais de sinal.
      const depois = [0.25, 1, 3, 10].map((d) =>
        Math.sign(avaliar(exercicio.enunciadoTex, exercicio.gabarito + d)),
      );
      expect(new Set(depois).size, exercicio.enunciadoTex).toBe(1);
    }
  });

  it('o agrupamento no Extremo tem coeficiente líder maior que 1, e no Difícil não', () => {
    const lider = (tex: string) => /^(\d*)x\^\{3\}/.exec(tex)?.[1] ?? '';
    const agrup = (n: 'dificil' | 'extremo') =>
      amostra(n, 150).filter((e) => e.id.startsWith('fatoracao-agrupamento'));
    expect(agrup('dificil').every((e) => lider(e.enunciadoTex) === '')).toBe(true);
    expect(agrup('extremo').every((e) => Number(lider(e.enunciadoTex)) > 1)).toBe(true);
  });
});
