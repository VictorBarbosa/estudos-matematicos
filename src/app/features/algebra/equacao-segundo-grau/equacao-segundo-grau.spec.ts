import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorEquacao2 } from '@features/algebra/equacao-segundo-grau/equacao-segundo-grau.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(1618);
  return Array.from({ length: quantidade }, () => geradorEquacao2.gerar(nivel, rng));
}

/** A pergunta de entrada, por Bhaskara: maior raiz, ou Δ quando não há raiz real. */
const porBhaskara = (e: { enunciado: string; conceitos: readonly string[] }): boolean =>
  e.conceitos.includes('equacao2.discriminante') && !e.enunciado.includes('raiz dupla');

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

    it(`no nível ${nivel}, a resolução por Bhaskara sempre calcula o discriminante`, () => {
      for (const exercicio of amostra(nivel).filter(porBhaskara)) {
        expect(exercicio.resolucao.passos[1]?.tex).toContain('\\Delta');
      }
    });
  }

  it('nos níveis fácil e médio as raízes são inteiras', () => {
    for (const nivel of ['facil', 'medio'] as const) {
      for (const exercicio of amostra(nivel).filter(porBhaskara)) {
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

describe('geradorEquacao2 — perguntas clássicas', () => {
  const rng = criarRng(5150);
  const lote = (nivel: Nivel) =>
    Array.from({ length: 300 }, () => geradorEquacao2.gerar(nivel, rng));

  /** Coeficientes do enunciado `ax^{2} + bx + c = 0` (ou com x^{4}, x^{2}). */
  function coeficientes(tex: string, alto = 'x^{2}', baixo = 'x'): [number, number, number] {
    const limpo = tex.replace(' = 0', '').replace(/\s/g, '');
    const [, a, b, c] = new RegExp(
      `^(-?\\d*)${alto.replace(/[\\^{}]/g, '\\$&')}(?:([+-]\\d*)${baixo.replace(/[\\^{}]/g, '\\$&')})?([+-]\\d+)?$`,
    ).exec(limpo)!;
    const coef = (t: string | undefined, padrao: number) =>
      t === undefined ? padrao : t === '' || t === '+' ? 1 : t === '-' ? -1 : Number(t);
    return [coef(a, 1), coef(b, 0), c === undefined ? 0 : Number(c)];
  }

  it('soma e produto conferem com as raízes de verdade', () => {
    const casos = [...lote('facil'), ...lote('medio')].filter((e) =>
      e.conceitos.includes('equacao2.girard'),
    );
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const [a, b, c] = coeficientes(e.enunciadoTex!);
      const d = Math.sqrt(b * b - 4 * a * c);
      const [x1, x2] = [(-b - d) / (2 * a), (-b + d) / (2 * a)];
      const esperado = e.enunciado.includes('SOMA') ? x1 + x2 : x1 * x2;
      expect(e.gabarito).toBeCloseTo(esperado, 6);
    }
  });

  it('o k da raiz dupla zera o discriminante', () => {
    const casos = [...lote('medio'), ...lote('dificil')].filter((e) =>
      e.enunciado.includes('raiz dupla'),
    );
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const tex = e.enunciadoTex!.replace(/k/g, `(${e.gabarito})`);
      const limpo = tex.replace(' = 0', '').replace(/\s/g, '');
      const [, a, b, c] = /^(\(.*?\)|)x\^\{2\}([+-]\d+)x\+(\(.*?\)|\d+)$/.exec(limpo)!;
      const num = (t: string) => (t === '' ? 1 : Number(t.replace(/[()]/g, '')));
      expect(Number(b) ** 2 - 4 * num(a!) * num(c!)).toBeCloseTo(0, 9);
    }
  });

  it('as raízes da biquadrada zeram a equação e a contagem confere', () => {
    const casos = [...lote('dificil'), ...lote('extremo')].filter((e) =>
      e.conceitos.includes('equacao2.biquadrada'),
    );
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const [, b, c] = coeficientes(e.enunciadoTex!, 'x^{4}', 'x^{2}');
      const f = (x: number) => x ** 4 + b * x * x + c;
      const reais = new Set<number>();
      for (let x = -6; x <= 6; x += 0.5) if (Math.abs(f(x)) < 1e-9) reais.add(x);
      if (e.enunciado.includes('Quantas')) expect(e.gabarito).toBe(reais.size);
      else expect(e.gabarito).toBe(Math.max(...reais));
    }
  });

  it('x₁² + x₂² confere com as raízes', () => {
    const casos = lote('extremo').filter((e) => e.enunciado.includes('x₁² + x₂²'));
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const [a, b, c] = coeficientes(e.enunciadoTex!);
      const d = Math.sqrt(b * b - 4 * a * c);
      const [x1, x2] = [(-b - d) / (2 * a), (-b + d) / (2 * a)];
      expect(e.gabarito).toBeCloseTo(x1 * x1 + x2 * x2, 6);
    }
  });
});
