import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorFisicaComCalculo as gerador } from '@features/calculo-2/fisica-com-calculo/fisica-com-calculo.gerador';

function amostra(nivel: Nivel, quantidade = 150) {
  const rng = criarRng(7272);
  return Array.from({ length: quantidade }, () => gerador.gerar(nivel, rng));
}

/** Integral numérica por Simpson, para conferir os gabaritos sem usar as primitivas do gerador. */
function integral(f: (x: number) => number, a: number, b: number, n = 2000): number {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  return (s * h) / 3;
}

/** Lê um polinômio em LaTeX («2x^{2} - 3x + 1», em x ou t) como função. */
function poli(tex: string, v = 'x'): (x: number) => number {
  const js = tex
    .replace(/\s/g, '')
    .replace(new RegExp(`${v}\\^\\{(\\d+)\\}`, 'g'), `${v}**$1`)
    .replace(new RegExp(`(\\d)${v}`, 'g'), `$1*${v}`);
  return new Function(v, `return ${js};`) as (x: number) => number;
}

const num = (t: string) => Number(t.replace(',', '.'));

describe('geradorFisicaComCalculo', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito confere com a integral numérica`, () => {
      for (const e of amostra(nivel)) {
        const en = e.enunciado;
        let m: RegExpExecArray | null;
        let esperado: number;
        if (
          (m = /v\(t\) = (\d+)t \+ (\d+) \(m\/s\)\. .* entre t = (\d+) s e t = (\d+) s/.exec(en))
        ) {
          esperado = integral((t) => num(m![1]!) * t + num(m![2]!), num(m[3]!), num(m[4]!));
        } else if (
          (m = /k = (\d+) N\/m é esticada de x = ([\d,]+) m até x = ([\d,]+) m/.exec(en))
        ) {
          esperado = integral((x) => num(m![1]!) * x, num(m[2]!), num(m[3]!));
        } else if ((m = /de x = (\d+) m até x = (\d+) m/.exec(en))) {
          const f = poli(/F\(x\) = (.*)$/.exec(e.enunciadoTex)![1]!);
          esperado = integral(f, num(m[1]!), num(m[2]!));
        } else if ((m = /parte com (\d+) m\/s .* t = (\d+) s/.exec(en))) {
          const a = poli(/a\(t\) = (.*) \\qquad/.exec(e.enunciadoTex)![1]!, 't');
          esperado = num(m[1]!) + integral(a, 0, num(m[2]!));
        } else if ((m = /barra de (\d+) m/.exec(en))) {
          const l = poli(/\\lambda\(x\) = (.*) \\qquad/.exec(e.enunciadoTex)![1]!);
          const L = num(m[1]!);
          esperado = integral((x) => x * l(x), 0, L) / integral(l, 0, L);
        } else {
          m = /satélite de (\d+) kg .* até (\d+) km/.exec(en)!;
          expect(m, en).not.toBeNull();
          const [G, M, R] = [6.674e-11, 5.972e24, 6.371e6];
          const mm = num(m[1]!);
          esperado = integral((r) => (G * M * mm) / (r * r), R, R + num(m[2]!) * 1000) / 1e9;
        }
        expect(e.gabarito, en).toBeCloseTo(esperado, 4);
      }
    });

    it(`no nível ${nivel}, armadilhas diferem e o gabarito é aceito`, () => {
      for (const e of amostra(nivel, 60)) {
        for (const a of e.armadilhas)
          expect(Math.abs(a.resposta - e.gabarito)).toBeGreaterThan(1e-3);
        expect(corrigir(gerador, e, gerador.formatar(e.gabarito)).veredito).toBe('correto');
      }
    });
  }
});
