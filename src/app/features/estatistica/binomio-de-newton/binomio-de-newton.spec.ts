import { combinacoes } from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorBinomio as gerador } from '@features/estatistica/binomio-de-newton/binomio-de-newton.gerador';

function amostra(nivel: Nivel, quantidade = 150) {
  const rng = criarRng(5252);
  return Array.from({ length: quantidade }, () => gerador.gerar(nivel, rng));
}

/** Expande (a·x^p + c·x^q)^n numericamente: devolve o mapa expoente → coeficiente. */
function expandir(a: number, p: number, c: number, q: number, n: number): Map<number, number> {
  const termos = new Map<number, number>();
  for (let k = 0; k <= n; k++) {
    const e = p * (n - k) + q * k;
    termos.set(e, (termos.get(e) ?? 0) + combinacoes(n, k) * a ** (n - k) * c ** k);
  }
  return termos;
}

const SOBRESCRITO: Record<string, number> = {
  '': 1,
  '²': 2,
  '³': 3,
  '⁴': 4,
  '⁵': 5,
  '⁶': 6,
  '⁷': 7,
  '⁸': 8,
};

describe('geradorBinomio', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito confere com a expansão feita por fora`, () => {
      for (const e of amostra(nivel)) {
        const tex = e.enunciadoTex;
        let m = /^\\binom\{(\d+)\}\{(\d+)\}/.exec(tex);
        if (m) {
          expect(e.gabarito).toBe(combinacoes(Number(m[1]), Number(m[2])));
          continue;
        }
        m = /^\\left\((-?\d*)x ([+-]) (\d+)\\right\)\^\{(\d+)\}$/.exec(tex);
        if (m) {
          const a = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
          const b = (m[2] === '-' ? -1 : 1) * Number(m[3]);
          const n = Number(m[4]);
          const termos = expandir(a, 1, b, 0, n);
          if (e.enunciado.includes('soma de todos')) {
            expect(e.gabarito).toBe([...termos.values()].reduce((s, v) => s + v, 0));
          } else if (e.enunciado.includes('º termo')) {
            const ordem = Number(/(\d+)º termo/.exec(e.enunciado)![1]);
            expect(e.gabarito).toBe(termos.get(n - (ordem - 1)));
          } else {
            const pot = /coeficiente de x(.?) no/.exec(e.enunciado)![1]!;
            expect(e.gabarito).toBe(termos.get(SOBRESCRITO[pot]!));
          }
          continue;
        }
        m = /^\\left\((x|x\^\{2\}) ([+-]) \\frac\{(\d+)\}\{x\}\\right\)\^\{(\d+)\}$/.exec(tex);
        expect(m, tex).not.toBeNull();
        const p = m![1] === 'x' ? 1 : 2;
        const c = (m![2] === '-' ? -1 : 1) * Number(m![3]);
        expect(e.gabarito).toBe(expandir(1, p, c, -1, Number(m![4])).get(0));
      }
    });

    it(`no nível ${nivel}, armadilhas diferem do gabarito, que é aceito`, () => {
      for (const e of amostra(nivel, 60)) {
        for (const a of e.armadilhas) expect(a.resposta).not.toBe(e.gabarito);
        expect(corrigir(gerador, e, String(e.gabarito)).veredito).toBe('correto');
      }
    });
  }
});
