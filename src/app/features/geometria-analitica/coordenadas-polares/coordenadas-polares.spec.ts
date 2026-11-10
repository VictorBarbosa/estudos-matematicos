import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorPolares as gerador } from '@features/geometria-analitica/coordenadas-polares/coordenadas-polares.gerador';

function amostra(nivel: Nivel, quantidade = 150) {
  const rng = criarRng(6161);
  return Array.from({ length: quantidade }, () => gerador.gerar(nivel, rng));
}

const rad = (g: number) => (g * Math.PI) / 180;
const n = (t: string) => Number(t.replace(',', '.'));

describe('geradorPolares', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito confere por fora`, () => {
      for (const e of amostra(nivel)) {
        const en = e.enunciado;
        let m: RegExpExecArray | null;
        if ((m = /\(r, θ\) = \((\d+), (\d+)°\)\. Qual é a coordenada (x|y)/.exec(en))) {
          const [r, t] = [n(m[1]!), rad(n(m[2]!))];
          expect(e.gabarito).toBeCloseTo(m[3] === 'x' ? r * Math.cos(t) : r * Math.sin(t), 9);
        } else if ((m = /ponto \((-?\d+), (-?\d+)\) até a origem/.exec(en))) {
          expect(e.gabarito).toBeCloseTo(Math.hypot(n(m[1]!), n(m[2]!)), 9);
        } else if ((m = /ângulo polar θ do ponto \((-?\d+), (-?\d+)\)/.exec(en))) {
          const [x, y] = [n(m[1]!), n(m[2]!)];
          // Confere voltando ao cartesiano: r·cos θ = x e r·sen θ = y.
          const r = Math.hypot(x, y);
          expect(r * Math.cos(rad(e.gabarito))).toBeCloseTo(x, 6);
          expect(r * Math.sin(rad(e.gabarito))).toBeCloseTo(y, 6);
          expect(e.gabarito).toBeGreaterThanOrEqual(0);
          expect(e.gabarito).toBeLessThan(360);
        } else if ((m = /^r = (\d+)\\(cos|sin)\\theta$/.exec(e.enunciadoTex))) {
          // Pontos da curva ficam a distância R do centro.
          const d = n(m[1]!);
          const cx = m[2] === 'cos' ? e.gabarito : 0;
          const cy = m[2] === 'cos' ? 0 : e.gabarito;
          for (const t of [10, 50, 80, 120]) {
            const r = d * (m[2] === 'cos' ? Math.cos(rad(t)) : Math.sin(rad(t)));
            expect(Math.hypot(r * Math.cos(rad(t)) - cx, r * Math.sin(rad(t)) - cy)).toBeCloseTo(
              e.gabarito,
              6,
            );
          }
        } else if ((m = /pontos polares \((\d+), (\d+)°\) e \((\d+), (\d+)°\)/.exec(en))) {
          const p1 = [n(m[1]!) * Math.cos(rad(n(m[2]!))), n(m[1]!) * Math.sin(rad(n(m[2]!)))];
          const p2 = [n(m[3]!) * Math.cos(rad(n(m[4]!))), n(m[3]!) * Math.sin(rad(n(m[4]!)))];
          expect(e.gabarito).toBeCloseTo(Math.hypot(p1[0]! - p2[0]!, p1[1]! - p2[1]!), 6);
        } else {
          m = /\\frac\{(\d+)\}\{1 \+ ([\d{},]+)\\cos\\theta\}/.exec(e.enunciadoTex)!;
          expect(m, e.enunciadoTex).not.toBeNull();
          const [p, ex] = [n(m[1]!), n(m[2]!.replace('{,}', ','))];
          const rs = Array.from({ length: 361 }, (_, g) => p / (1 + ex * Math.cos(rad(g))));
          const [min, max] = [Math.min(...rs), Math.max(...rs)];
          const esperado = en.includes('menor')
            ? min
            : en.includes('maior distância')
              ? max
              : (min + max) / 2;
          expect(e.gabarito).toBeCloseTo(esperado, 6);
        }
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
