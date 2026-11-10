import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorRetasPlanos as gerador } from '@features/vetores-matrizes/retas-e-planos/retas-e-planos.gerador';

type V = [number, number, number];

function amostra(nivel: Nivel, quantidade = 200) {
  const rng = criarRng(1313);
  return Array.from({ length: quantidade }, () => gerador.gerar(nivel, rng));
}

/** Todos os vetores «(a,\; b,\; c)» do LaTeX, em ordem. */
function vetores(tex: string): V[] {
  return [...tex.matchAll(/\((-?\d+),\\; (-?\d+),\\; (-?\d+)\)/g)].map(
    (m) => [Number(m[1]), Number(m[2]), Number(m[3])] as V,
  );
}

/** Lê «2x - y + 3z = 5» (termos podem faltar). */
function plano(tex: string): { n: V; d: number } {
  const [lado, d] = tex.split(' = ');
  const n: V = [0, 0, 0];
  for (const m of lado!.replace(/\s/g, '').matchAll(/([+-]?)(\d*)([xyz])/g)) {
    const k = (m[1] === '-' ? -1 : 1) * (m[2] === '' ? 1 : Number(m[2]));
    n['xyz'.indexOf(m[3]!)] = k;
  }
  return { n, d: Number(d) };
}

const escalar = (u: V, v: V) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const vetorial = (u: V, v: V): V => [
  u[1] * v[2] - u[2] * v[1],
  u[2] * v[0] - u[0] * v[2],
  u[0] * v[1] - u[1] * v[0],
];
const mod = (u: V) => Math.sqrt(escalar(u, u));

describe('geradorRetasPlanos', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito confere por fora`, () => {
      for (const e of amostra(nivel)) {
        const tipo = /^planos-(comb|d|dist|ang|det|k|3p)-/.exec(e.id)![1];
        const vs = vetores(e.enunciadoTex);
        if (tipo === 'comb') {
          const [, alfa, sinal, beta] = /w = (-?\d+)u (.) (\d+)v/.exec(e.enunciado)!;
          const a = Number(alfa);
          const b = (sinal === '−' ? -1 : 1) * Number(beta);
          const i = 'xyz'.indexOf(/coordenada (.)/.exec(e.enunciado)![1]!);
          expect(e.gabarito).toBe(a * vs[0]![i]! + b * vs[1]![i]!);
        } else if (tipo === 'd') {
          const [p, n] = vs;
          expect(e.gabarito).toBe(escalar(n!, p!));
        } else if (tipo === 'dist') {
          const p = vs[0]!;
          const { n, d } = plano(e.enunciadoTex.split('\\qquad ')[1]!);
          expect(e.gabarito).toBeCloseTo(Math.abs(escalar(n, p) - d) / mod(n), 9);
        } else if (tipo === 'ang') {
          let u: V, v: V;
          if (e.id.includes('-planos-')) {
            const [p1, p2] = e.enunciadoTex.split('\\qquad ');
            u = plano(p1!.replace(/^\\pi_1:\\; /, '')).n;
            v = plano(p2!.replace(/^\\pi_2:\\; /, '')).n;
          } else {
            // Os pontos-base são escritos sem \; e não entram: sobram as duas direções.
            [u, v] = [vs[0]!, vs[1]!];
          }
          const graus = (Math.acos(Math.abs(escalar(u, v)) / (mod(u) * mod(v))) * 180) / Math.PI;
          expect(e.gabarito).toBeCloseTo(graus, 6);
          expect(e.gabarito).toBeLessThanOrEqual(90 + 1e-9);
        } else if (tipo === 'det') {
          const [u, v, w] = vs;
          expect(e.gabarito).toBe(Math.abs(escalar(u!, vetorial(v!, w!))));
        } else if (tipo === 'k') {
          const [u, v] = vs;
          const [, a, b] = /\(\s*(-?\d+),\\; (-?\d+),\\; k\)/.exec(e.enunciadoTex)!;
          const w: V = [Number(a), Number(b), e.gabarito];
          expect(escalar(u!, vetorial(v!, w))).toBeCloseTo(0, 6);
        } else {
          const [A, B, C] = vs;
          const n = vetorial(
            [B![0] - A![0], B![1] - A![1], B![2] - A![2]],
            [C![0] - A![0], C![1] - A![1], C![2] - A![2]],
          );
          const sinal = n[0] < 0 ? -1 : 1;
          // Os três pontos satisfazem n·X = d.
          for (const X of [A!, B!, C!]) expect(sinal * escalar(n, X)).toBeCloseTo(e.gabarito, 9);
        }
      }
    });

    it(`no nível ${nivel}, armadilhas diferem e o gabarito é aceito`, () => {
      for (const e of amostra(nivel, 60)) {
        for (const a of e.armadilhas)
          expect(Math.abs(a.resposta - e.gabarito)).toBeGreaterThan(0.02);
        expect(corrigir(gerador, e, gerador.formatar(e.gabarito)).veredito).toBe('correto');
      }
    });
  }
});
