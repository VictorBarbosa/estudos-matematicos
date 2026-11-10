import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorLimites } from '@features/calculo-1/limites/limites.gerador';

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
    const comConjugado = amostra('dificil', 120).filter((e) => e.enunciadoTex.includes('\\sqrt'));

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

describe('geradorLimites — limite fundamental e existência', () => {
  const rng = criarRng(11_235);
  const lote = (nivel: Nivel) =>
    Array.from({ length: 300 }, () => geradorLimites.gerar(nivel, rng));

  it('o limite fundamental confere com o valor da função perto de zero', () => {
    for (const nivel of ['facil', 'medio', 'dificil', 'extremo'] as const) {
      const casos = lote(nivel).filter((e) => e.id.startsWith('lim-fund'));
      expect(casos.length).toBeGreaterThan(0);
      for (const e of casos) {
        const t = e.enunciadoTex;
        const x = 1e-4;
        let valor: number;
        const cos = /\\frac\{1 - \\cos\((\d+)x\)\}\{x\^\{2\}\}/.exec(t);
        if (cos) {
          valor = (1 - Math.cos(Number(cos[1]) * x)) / (x * x);
        } else {
          const [, k, den] = /\\frac\{\\sin\((\d+)x\)\}\{(.+)\}$/.exec(t)!;
          const s = /\\sin\((\d+)x\)/.exec(den!);
          const d = s
            ? Math.sin(Number(s[1]) * x)
            : den === 'x'
              ? x
              : Number(den!.replace('x', '')) * x;
          valor = Math.sin(Number(k) * x) / d;
        }
        expect(e.gabarito).toBeCloseTo(valor, 2);
      }
    }
  });

  it('a classificação confere com os laterais calculados perto do ponto', () => {
    const casos = lote('extremo').filter((e) => e.id.startsWith('lim-existe'));
    expect(casos.length).toBeGreaterThan(0);
    for (const e of casos) {
      const [, caso, a, k] = /^lim-existe-(existe|infinito|salto)-(-?\d+)-(\d+)-/.exec(e.id)!;
      const [A, K] = [Number(a), Number(k)];
      const f = {
        existe: (x: number) => (x * x - A * A) / (x - A),
        infinito: (x: number) => K / (x - A) ** 2,
        salto: (x: number) => (K * Math.abs(x - A)) / (x - A),
      }[caso as 'existe' | 'infinito' | 'salto'];
      const [esq, dir] = [f(A - 1e-7), f(A + 1e-7)];
      const codigo = Math.abs(esq) > 1e6 ? 2 : Math.abs(esq - dir) > 1e-3 ? 3 : 1;
      expect(e.gabarito).toBe(codigo);
    }
  });
});
