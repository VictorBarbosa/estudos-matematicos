import { comparacaoNumericaComPassos, eulerComPassos, rungeKutta4 } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorMetodosNumericos } from '@features/calculo-4/metodos-numericos/metodos-numericos.gerador';

function amostra(nivel: Nivel, quantidade = 80) {
  const rng = criarRng(13_579);
  return Array.from({ length: quantidade }, () => geradorMetodosNumericos.gerar(nivel, rng));
}

describe('geradorMetodosNumericos', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito e aceito como exibido`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito), exercicio.enunciado).toBe(true);

        const exibido = geradorMetodosNumericos.formatar(exercicio.gabarito);
        expect(corrigir(geradorMetodosNumericos, exercicio, exibido).veredito, exibido).toBe(
          'correto',
        );
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(
            geradorMetodosNumericos.saoEquivalentes(armadilha.resposta, exercicio.gabarito),
            exercicio.enunciado,
          ).toBe(false);
          expect(armadilha.diagnostico.length).toBeGreaterThan(20);
        }
      }
    });
  }

  it('o Difícil cobra Runge-Kutta e a ordem do método', () => {
    const conceitos = new Set(amostra('dificil', 250).flatMap((e) => e.conceitos));

    expect(conceitos.has('numerico.runge-kutta')).toBe(true);
    expect(conceitos.has('numerico.ordem')).toBe(true);
  });

  it('o fator pedido na ordem fica perto de 2, que é a ordem de Euler', () => {
    for (const exercicio of amostra('dificil', 250)) {
      if (!exercicio.enunciado.includes('Por qual fator')) {
        continue;
      }
      expect(exercicio.gabarito, exercicio.enunciado).toBeGreaterThan(1.5);
      expect(exercicio.gabarito, exercicio.enunciado).toBeLessThan(3);
    }
  });

  it('diagnostica quem devolve o valor exato no lugar do aproximado', () => {
    const exercicio = amostra('facil', 250).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('valor EXATO')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('valor EXATO'))!;
    const resultado = corrigir(
      geradorMetodosNumericos,
      exercicio,
      geradorMetodosNumericos.formatar(armadilha.resposta),
    );

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('numerico.euler');
  });
});

/**
 * O motor numérico.
 *
 * O que se testa é a propriedade que define cada método: a ordem com que o
 * erro responde ao passo.
 */
describe('métodos numéricos', () => {
  const exato = (k: number, y0: number, t: number) => y0 * Math.exp(k * t);

  it('Euler com um passo é a própria tangente', () => {
    const { resultado } = eulerComPassos(1, 1, 0.5, 1);

    expect(resultado).toBeCloseTo(1.5, 12);
  });

  it('Euler subestima uma exponencial crescente', () => {
    const { resultado } = eulerComPassos(1, 1, 0.25, 4);

    expect(resultado).toBeLessThan(exato(1, 1, 1));
  });

  it('o erro de Euler cai pela metade quando o passo cai pela metade', () => {
    const erro = (passo: number, quantos: number) =>
      Math.abs(exato(0.5, 1, passo * quantos) - eulerComPassos(0.5, 1, passo, quantos).resultado);

    const grosso = erro(0.1, 20);
    const fino = erro(0.05, 40);

    expect(grosso / fino).toBeGreaterThan(1.7);
    expect(grosso / fino).toBeLessThan(2.3);
  });

  it('Runge-Kutta acerta muitas casas a mais, com o mesmo passo', () => {
    const passo = 0.25;
    const quantos = 8;

    const erroEuler = Math.abs(
      exato(0.5, 1, passo * quantos) - eulerComPassos(0.5, 1, passo, quantos).resultado,
    );
    const erroRk = Math.abs(exato(0.5, 1, passo * quantos) - rungeKutta4(0.5, 1, passo, quantos));

    expect(erroRk).toBeLessThan(erroEuler / 1000);
  });

  it('e o erro dele cai com a quarta potência do passo', () => {
    const erro = (passo: number, quantos: number) =>
      Math.abs(exato(0.5, 1, passo * quantos) - rungeKutta4(0.5, 1, passo, quantos));

    const grosso = erro(0.4, 5);
    const fino = erro(0.2, 10);

    expect(grosso / fino).toBeGreaterThan(10);
    expect(grosso / fino).toBeLessThan(22);
  });

  it('com taxa nula, nada muda em nenhum método', () => {
    expect(eulerComPassos(0, 5, 0.1, 10).resultado).toBeCloseTo(5, 12);
    expect(rungeKutta4(0, 5, 0.1, 10)).toBeCloseTo(5, 12);
  });

  it('a comparação mostra os dois erros lado a lado', () => {
    const { passos } = comparacaoNumericaComPassos(0.5, 1, 0.25, 8);

    expect(passos[0]!.tex).toContain('y_{Euler}');
    expect(passos[3]!.nota).toContain('quarta');
  });
});

describe('geradorMetodosNumericos — Newton-Raphson', () => {
  const rng = criarRng(8282);

  it('o gabarito é a iteração de Newton recalculada por fora, e no Extremo são duas', () => {
    for (const nivel of NIVEIS) {
      const casos = Array.from({ length: 200 }, () =>
        geradorMetodosNumericos.gerar(nivel, rng),
      ).filter((e) => e.conceitos.includes('numerico.newton'));
      expect(casos.length).toBeGreaterThan(0);
      for (const e of casos) {
        const fTex = /f\(x\) = (.*?) \\qquad/.exec(e.enunciadoTex)![1]!;
        const js = fTex
          .replace(/\s/g, '')
          .replace(/e\^\{x\}/g, 'Math.exp(x)')
          .replace(/x\^\{(\d+)\}/g, 'x**$1')
          .replace(/(\d)x/g, '$1*x');
        const f = new Function('x', `return ${js};`) as (x: number) => number;
        const df = (x: number) => (f(x + 1e-6) - f(x - 1e-6)) / 2e-6;
        let x = Number(/x₀ = (-?\d+)/.exec(e.enunciado)![1]);
        const vezes = e.enunciado.includes('x₂') ? 2 : 1;
        expect(vezes).toBe(nivel === 'extremo' ? 2 : 1);
        for (let i = 0; i < vezes; i++) x -= f(x) / df(x);
        expect(e.gabarito).toBeCloseTo(x, 5);
      }
    }
  });
});
