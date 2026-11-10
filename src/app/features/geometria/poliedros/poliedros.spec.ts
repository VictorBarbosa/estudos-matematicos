import {
  caracteristicaDeEuler,
  poliedroPiramide,
  poliedroPlatonico,
  poliedroPrisma,
} from '@core/math';
import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorPoliedros as gerador } from '@features/geometria/poliedros/poliedros.gerador';

function amostra(nivel: Nivel, quantidade = 150) {
  const rng = criarRng(7272);
  return Array.from({ length: quantidade }, () => gerador.gerar(nivel, rng));
}

describe('geometria dos poliedros', () => {
  it('os cinco de Platão têm as contagens conhecidas e satisfazem Euler', () => {
    const esperado = {
      tetraedro: [4, 6, 4],
      cubo: [8, 12, 6],
      octaedro: [6, 12, 8],
      dodecaedro: [20, 30, 12],
      icosaedro: [12, 30, 20],
    } as const;
    for (const [nome, [v, a, f]] of Object.entries(esperado)) {
      const p = poliedroPlatonico(nome as keyof typeof esperado);
      expect([p.vertices.length, p.arestas.length, p.faces]).toEqual([v, a, f]);
      expect(caracteristicaDeEuler(p)).toBe(2);
    }
  });

  it('prismas e pirâmides de 3 a 10 lados satisfazem Euler', () => {
    for (let n = 3; n <= 10; n++) {
      expect(caracteristicaDeEuler(poliedroPrisma(n))).toBe(2);
      expect(caracteristicaDeEuler(poliedroPiramide(n))).toBe(2);
    }
  });
});

describe('geradorPoliedros', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito confere com Euler e com a contagem dupla`, () => {
      for (const e of amostra(nivel)) {
        const en = e.enunciado;
        let m: RegExpExecArray | null;
        if (
          (m =
            /tem (\d+) (vértices|arestas|faces) e (\d+) (vértices|arestas|faces)\. Quantos (vértices|arestas|faces)/.exec(
              en,
            ))
        ) {
          const c: Record<string, number> = {
            [m[2]!]: Number(m[1]),
            [m[4]!]: Number(m[3]),
            [m[5]!]: e.gabarito,
          };
          expect(c['vértices']! - c['arestas']! + c['faces']!).toBe(2);
        } else if (
          (m = /Quantos (vértices|arestas|faces) tem (um|uma) (prisma|pirâmide) de base/.exec(en))
        ) {
          const n = Number(/n = (\d+)/.exec(e.enunciadoTex)![1]);
          const p = m[3] === 'prisma' ? poliedroPrisma(n) : poliedroPiramide(n);
          const c = { vértices: p.vertices.length, arestas: p.arestas.length, faces: p.faces };
          expect(e.gabarito).toBe(c[m[1] as keyof typeof c]);
        } else if (
          (m =
            /tem (\d+) faces, todas (triangulares|quadrangulares|pentagonais)\. Quantos (vértices|arestas)/.exec(
              en,
            ))
        ) {
          const k = { triangulares: 3, quadrangulares: 4, pentagonais: 5 }[m[2]!]!;
          const f = Number(m[1]);
          const a = (k * f) / 2;
          expect(e.gabarito).toBe(m[3] === 'arestas' ? a : a - f + 2);
        } else if (
          (m = /tem (\d+) faces, e em cada vértice se encontram exatamente (\d+) arestas/.exec(en))
        ) {
          const [f, k, v] = [Number(m[1]), Number(m[2]), e.gabarito];
          expect(v - (k * v) / 2 + f).toBe(2);
          expect(Number.isInteger(v)).toBe(true);
        } else {
          const lados: Record<string, number> = {
            tridecágono: 13,
            dodecágono: 12,
            undecágono: 11,
            decágono: 10,
            eneágono: 9,
            octógono: 8,
            heptágono: 7,
            hexágono: 6,
            pentágono: 5,
            quadrado: 4,
            triângulo: 3,
          };
          const nomes = Object.keys(lados).join('|');
          const faces = [...en.matchAll(new RegExp(`(\\d+) (${nomes})s?`, 'g'))];
          expect(faces.length, en).toBe(2);
          const soma = faces.reduce((s, x) => s + Number(x[1]) * lados[x[2]!]!, 0);
          const f = faces.reduce((s, x) => s + Number(x[1]), 0);
          expect(e.gabarito).toBe(soma / 2 - f + 2);
        }
      }
    });

    it(`no nível ${nivel}, armadilhas diferem e o gabarito é aceito`, () => {
      for (const e of amostra(nivel, 60)) {
        for (const a of e.armadilhas) expect(a.resposta).not.toBe(e.gabarito);
        expect(corrigir(gerador, e, String(e.gabarito)).veredito).toBe('correto');
      }
    });
  }
});
