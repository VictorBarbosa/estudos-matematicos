import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorPontoReta } from '@features/geometria-analitica/ponto-e-reta/ponto-e-reta.gerador';

function amostra(nivel: Nivel, quantidade = 60) {
  const rng = criarRng(4747);
  return Array.from({ length: quantidade }, () => geradorPontoReta.gerar(nivel, rng));
}

describe('geradorPontoReta', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito é finito`, () => {
      for (const exercicio of amostra(nivel)) {
        expect(Number.isFinite(exercicio.gabarito)).toBe(true);
      }
    });

    it(`no nível ${nivel}, nenhuma armadilha coincide com o gabarito`, () => {
      for (const exercicio of amostra(nivel)) {
        for (const armadilha of exercicio.armadilhas) {
          expect(Math.abs(armadilha.resposta - exercicio.gabarito)).toBeGreaterThan(0.02);
        }
      }
    });
  }

  it('a distância calculada confere com Pitágoras', () => {
    const exercicios = amostra('medio', 90).filter((e) =>
      e.enunciado.includes('entre os dois pontos'),
    );

    for (const exercicio of exercicios) {
      const [, ax, ay, bx, by] = /A\((-?\d+),\\; (-?\d+)\) \\qquad B\((-?\d+),\\; (-?\d+)\)/.exec(
        exercicio.enunciadoTex,
      )!;

      const esperado = Math.hypot(Number(bx) - Number(ax), Number(by) - Number(ay));
      expect(exercicio.gabarito).toBeCloseTo(esperado, 9);
    }
  });

  it('nos níveis fácil e médio a distância é inteira', () => {
    const exercicios = amostra('facil', 90).filter((e) =>
      e.enunciado.includes('entre os dois pontos'),
    );

    for (const exercicio of exercicios) {
      expect(Number.isInteger(exercicio.gabarito)).toBe(true);
    }
  });

  it('a inclinação nunca é pedida para reta vertical', () => {
    const exercicios = amostra('dificil', 90).filter((e) => e.enunciado.includes('angular'));

    for (const exercicio of exercicios) {
      expect(Number.isFinite(exercicio.gabarito)).toBe(true);
    }
  });

  it('diagnostica quem soma os catetos em vez de usar a hipotenusa', () => {
    const exercicio = amostra('facil', 60).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('HIPOTENUSA')),
    )!;

    const armadilha = exercicio.armadilhas.find((a) => a.diagnostico.includes('HIPOTENUSA'))!;
    const resultado = corrigir(geradorPontoReta, exercicio, String(armadilha.resposta));

    expect(resultado.veredito).toBe('incorreto');
    expect(resultado.conceitoAssociado).toBe('ponto-reta.distancia');
  });

  it('diagnostica a inclinação invertida', () => {
    const exercicio = amostra('dificil', 90).find((candidato) =>
      candidato.armadilhas.some((a) => a.diagnostico.includes('razão está invertida')),
    )!;

    expect(exercicio).toBeDefined();
    expect(exercicio.conceitos).toContain('ponto-reta.equacao');
  });
});

describe('geradorPontoReta — distância a reta e perpendicular', () => {
  const rng = criarRng(6262);
  const lote = (nivel: Nivel) =>
    Array.from({ length: 200 }, () => geradorPontoReta.gerar(nivel, rng));

  /** a, b, c da reta, a partir da forma geral ou da reduzida do enunciado. */
  function reta(tex: string): [number, number, number] {
    const num = (t: string) => {
      const f = /^(-)?\\frac\{(\d+)\}\{(\d+)\}$/.exec(t);
      return f ? (f[1] ? -1 : 1) * (Number(f[2]) / Number(f[3])) : Number(t);
    };
    const geral = /^(-?\d*)x(?: ([+-]) (\d*)y)?(?: ([+-]) (\d+))? = 0$/.exec(tex);
    if (geral) {
      const a = geral[1] === '' ? 1 : geral[1] === '-' ? -1 : Number(geral[1]);
      const b = (geral[2] === '-' ? -1 : 1) * (geral[3] === '' ? 1 : Number(geral[3]));
      const c = geral[5] ? (geral[4] === '-' ? -1 : 1) * Number(geral[5]) : 0;
      return [a, b, c];
    }
    const red = /^y = (.*?)x(?: ([+-]) (.+))?$/.exec(tex)!;
    const m = red[1] === '' ? 1 : red[1] === '-' ? -1 : num(red[1]!);
    const q = red[3] ? (red[2] === '-' ? -1 : 1) * num(red[3]) : 0;
    return [m, -1, q];
  }

  it('a distância do ponto à reta confere com a projeção ortogonal', () => {
    for (const nivel of ['medio', 'dificil', 'extremo'] as const) {
      const casos = lote(nivel).filter((e) => e.conceitos.includes('ponto-reta.distancia-reta'));
      expect(casos.length).toBeGreaterThan(0);
      for (const e of casos) {
        const [a, b, c] = reta(e.enunciadoTex!);
        const [, x0, y0] = /P\((-?\d+), (-?\d+)\)/.exec(e.enunciado)!.map(Number);
        // Pé da perpendicular: P − t(a, b), com t = (ax₀ + by₀ + c)/(a² + b²).
        const t = (a * x0! + b * y0! + c) / (a * a + b * b);
        const esperado = Math.hypot(t * a, t * b);
        expect(e.gabarito, e.enunciadoTex).toBeCloseTo(esperado, 9);
      }
    }
  });

  it('a perpendicular tem produto de inclinações −1 e passa pelo ponto', () => {
    for (const nivel of ['medio', 'dificil', 'extremo'] as const) {
      const casos = lote(nivel).filter(
        (e) => e.conceitos.includes('ponto-reta.posicoes') && e.enunciado.includes('perpendicular'),
      );
      expect(casos.length).toBeGreaterThan(0);
      for (const e of casos) {
        const [a, b] = reta(e.enunciadoTex!);
        const m = -a / b;
        if (nivel === 'medio') {
          expect(m * e.gabarito).toBeCloseTo(-1, 9);
        } else {
          const [, x0, y0] = /P\((-?\d+), (-?\d+)\)/.exec(e.enunciado)!.map(Number);
          expect(y0!).toBeCloseTo((-1 / m) * x0! + e.gabarito, 9);
        }
      }
    }
  });
});

describe('geradorPontoReta — reta por dois pontos e interseção', () => {
  const rng = criarRng(8282);
  const lote = (nivel: Nivel) =>
    Array.from({ length: 300 }, () => geradorPontoReta.gerar(nivel, rng));

  /** Lê «y = 2x - 3», «y = -x», «y = x + 4» (coeficientes inteiros). */
  function reduzida(tex: string): [number, number] {
    const m = /y = (-?\d*)x(?: ([+-]) (\d+))?/.exec(tex)!;
    const a = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
    const q = m[2] ? (m[2] === '-' ? -1 : 1) * Number(m[3]) : 0;
    return [a, q];
  }

  /** Lê «2x - 3y = 5». */
  function geral(tex: string): [number, number, number] {
    const m = /(-?\d*)x ([+-]) (\d*)y = (-?\d+)/.exec(tex)!;
    const a = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
    const b = (m[2] === '-' ? -1 : 1) * (m[3] === '' ? 1 : Number(m[3]));
    return [a, b, Number(m[4])];
  }

  it('o q da reta por dois pontos faz a reta passar pelos dois', () => {
    const casos = [...lote('medio'), ...lote('dificil')].filter((e) =>
      e.id.startsWith('ponto-reta-dois'),
    );
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const [, x1, y1, x2, y2] = /A\((-?\d+), (-?\d+)\) e B\((-?\d+), (-?\d+)\)/
        .exec(e.enunciado)!
        .map(Number);
      const m = (y2! - y1!) / (x2! - x1!);
      expect(m * x1! + e.gabarito).toBeCloseTo(y1!, 9);
      expect(m * x2! + e.gabarito).toBeCloseTo(y2!, 9);
    }
  });

  it('o ponto de interseção está nas duas retas', () => {
    const casos = [...lote('medio'), ...lote('dificil'), ...lote('extremo')].filter((e) =>
      e.conceitos.includes('ponto-reta.intersecao'),
    );
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const [texR, texS] = e.enunciadoTex.split('\\qquad');
      const pedeX = e.enunciado.includes('coordenada x');
      if (e.id.includes('-geral-')) {
        const [a1, b1, c1] = geral(texR!);
        const [a2, b2, c2] = geral(texS!);
        const det = a1 * b2 - a2 * b1;
        const x = (c1 * b2 - c2 * b1) / det;
        const y = (a1 * c2 - a2 * c1) / det;
        expect(e.gabarito).toBeCloseTo(pedeX ? x : y, 9);
        expect(a1 * x + b1 * y).toBeCloseTo(c1, 9);
      } else {
        const [m1, q1] = reduzida(texR!);
        const [m2, q2] = reduzida(texS!);
        const x = (q2 - q1) / (m1 - m2);
        expect(e.gabarito).toBeCloseTo(pedeX ? x : m1 * x + q1, 9);
      }
    }
  });
});
