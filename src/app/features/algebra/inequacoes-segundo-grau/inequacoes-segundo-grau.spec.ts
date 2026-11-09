import { ConjuntoSolucaoReal, pertence } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import {
  analisarConjunto,
  geradorInequacoesSegundoGrau,
} from '@features/algebra/inequacoes-segundo-grau/inequacoes-segundo-grau.gerador';

function amostra(nivel: Nivel, quantidade = 120) {
  const rng = criarRng(2626);
  return Array.from({ length: quantidade }, () => geradorInequacoesSegundoGrau.gerar(nivel, rng));
}

/** Avalia o lado esquerdo do enunciado a partir do LaTeX gerado, para conferir o gabarito por fora. */
function ladoEsquerdo(tex: string): (x: number) => number {
  const js = tex
    .replace(/\s*(\\leq|\\geq|<|>)\s*0$/, '')
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/, '(($1)/($2))')
    .replace(/\\left|\\right/g, '')
    .replace(/\)\(/g, ')*(')
    .replace(/x\^\{2\}/g, 'x*x')
    .replace(/(\d)x/g, '$1*x')
    .replace(/(\d)\(/g, '$1*(');
  return new Function('x', `return ${js};`) as (x: number) => number;
}

function relacaoDe(tex: string): (v: number) => boolean {
  if (tex.includes('\\leq')) return (v) => v <= 1e-9;
  if (tex.includes('\\geq')) return (v) => v >= -1e-9;
  if (/<\s*0$/.test(tex)) return (v) => v < -1e-9;
  return (v) => v > 1e-9;
}

describe('geradorInequacoesSegundoGrau', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito confere ponto a ponto com a inequação`, () => {
      for (const exercicio of amostra(nivel)) {
        const f = ladoEsquerdo(exercicio.enunciadoTex!);
        const vale = relacaoDe(exercicio.enunciadoTex!);
        for (let x = -12; x <= 12; x += 0.25) {
          const valor = f(x);
          const esperado = Number.isFinite(valor) && vale(valor);
          expect(pertence(exercicio.gabarito, x), `${exercicio.enunciadoTex} em x = ${x}`).toBe(
            esperado,
          );
        }
      }
    });

    it(`no nível ${nivel}, o gabarito escrito como texto é aceito`, () => {
      for (const exercicio of amostra(nivel, 40)) {
        const texto = geradorInequacoesSegundoGrau.formatar(exercicio.gabarito);
        expect(corrigir(geradorInequacoesSegundoGrau, exercicio, texto).veredito).toBe('correto');
      }
    });
  }

  it('o Extremo tem a inequação-quociente, que o Difícil não tem', () => {
    expect(amostra('extremo').some((e) => e.conceitos.includes('sinal.quociente'))).toBe(true);
    expect(amostra('dificil').some((e) => e.conceitos.includes('sinal.quociente'))).toBe(false);
  });

  it('diagnostica quem inclui o zero do denominador', () => {
    const exercicio = amostra('extremo', 300).find((e) =>
      e.armadilhas.some((a) => a.diagnostico.includes('zera o DENOMINADOR')),
    )!;
    expect(exercicio).toBeDefined();
    const armadilha = exercicio.armadilhas.find((a) =>
      a.diagnostico.includes('zera o DENOMINADOR'),
    )!;
    const texto = geradorInequacoesSegundoGrau.formatar(armadilha.resposta);
    expect(corrigir(geradorInequacoesSegundoGrau, exercicio, texto).veredito).toBe('incorreto');
  });
});

describe('analisarConjunto', () => {
  const casos: readonly (readonly [string, ConjuntoSolucaoReal])[] = [
    ['-2 < x < 3', { tipo: 'entre', a: -2, b: 3, fechaA: false, fechaB: false }],
    ['-2 ≤ x ≤ 3', { tipo: 'entre', a: -2, b: 3, fechaA: true, fechaB: true }],
    ['-1/2 <= x < 4', { tipo: 'entre', a: -0.5, b: 4, fechaA: true, fechaB: false }],
    ['x < -2 ou x > 3', { tipo: 'fora', a: -2, b: 3, fechaA: false, fechaB: false }],
    ['x >= 3 ou x <= -2', { tipo: 'fora', a: -2, b: 3, fechaA: true, fechaB: true }],
    ['x ≠ 2', { tipo: 'exceto', a: 2 }],
    ['x != 1,5', { tipo: 'exceto', a: 1.5 }],
    ['x = 3/2', { tipo: 'ponto', a: 1.5 }],
    ['vazio', { tipo: 'vazio' }],
    ['∅', { tipo: 'vazio' }],
    ['todos', { tipo: 'todos' }],
    ['ℝ', { tipo: 'todos' }],
  ];

  for (const [entrada, esperado] of casos) {
    it(`lê «${entrada}»`, () => {
      expect(analisarConjunto(entrada)).toEqual(esperado);
    });
  }

  it('recusa o que não é conjunto', () => {
    expect(analisarConjunto('3')).toBeNull();
    expect(analisarConjunto('3 < x < -2')).toBeNull();
    expect(analisarConjunto('x < 3 ou y > 2')).toBeNull();
  });
});
