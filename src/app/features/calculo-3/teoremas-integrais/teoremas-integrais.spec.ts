import { criarRng } from '@core/treino/rng/rng';
import { NIVEIS, Nivel, corrigir } from '@core/treino/models/treino.model';
import { geradorTeoremasIntegrais as gerador } from '@features/calculo-3/teoremas-integrais/teoremas-integrais.gerador';

function amostra(nivel: Nivel, quantidade = 120) {
  const rng = criarRng(7373);
  return Array.from({ length: quantidade }, () => gerador.gerar(nivel, rng));
}

type F3 = (x: number, y: number, z: number) => number;

/** Lê um monômio em LaTeX (`-3x^{2}yz`) como função de (x, y, z). */
function lerMonomio(tex: string): F3 {
  const m = /^(-?\d*)(x(?:\^\{(\d)\})?)?(y(?:\^\{(\d)\})?)?(z(?:\^\{(\d)\})?)?$/.exec(tex.trim())!;
  expect(m, tex).not.toBeNull();
  const c = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
  const ex = m[2] ? Number(m[3] ?? 1) : 0;
  const ey = m[4] ? Number(m[5] ?? 1) : 0;
  const ez = m[6] ? Number(m[7] ?? 1) : 0;
  return (x, y, z) => c * x ** ex * y ** ey * z ** ez;
}

function lerCampo(tex: string): F3[] {
  const corpo = /\\left\((.*)\\right\)/.exec(tex)![1]!;
  return corpo.split(',\\;').map((parte) => {
    const termos = parte.trim().replace(/ - /g, ' + -').split(' + ');
    const fs = termos.map(lerMonomio);
    return (x, y, z) => fs.reduce((s, f) => s + f(x, y, z), 0);
  });
}

const N = 600;

/** ∮ P dx + Q dy numa curva paramétrica t ∈ [0, 1]. */
function circulacao(F: F3[], curva: (t: number) => [number, number], z = 0): number {
  let soma = 0;
  for (let n = 0; n < N; n++) {
    const [x0, y0] = curva(n / N);
    const [x1, y1] = curva((n + 1) / N);
    const [xm, ym] = curva((n + 0.5) / N);
    soma += F[0]!(xm, ym, z) * (x1 - x0) + F[1]!(xm, ym, z) * (y1 - y0);
  }
  return soma;
}

function retangulo(L: number, M: number) {
  return (t: number): [number, number] => {
    const s = 4 * t;
    if (s < 1) return [s * L, 0];
    if (s < 2) return [L, (s - 1) * M];
    if (s < 3) return [L - (s - 2) * L, M];
    return [0, M - (s - 3) * M];
  };
}

/** Fluxo para fora do cubo [0, L]³ somado nas seis faces (regra do ponto médio). */
function fluxoCubo(F: F3[], L: number): number {
  const n = 60;
  const h = L / n;
  let soma = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const [u, v] = [(i + 0.5) * h, (j + 0.5) * h];
      soma += (F[0]!(L, u, v) - F[0]!(0, u, v)) * h * h;
      soma += (F[1]!(u, L, v) - F[1]!(u, 0, v)) * h * h;
      soma += (F[2]!(u, v, L) - F[2]!(u, v, 0)) * h * h;
    }
  }
  return soma;
}

/** Fluxo para fora de uma superfície parametrizada r(u, v), com normal r_u × r_v para fora. */
function fluxoParametrico(
  F: F3[],
  r: (u: number, v: number) => [number, number, number],
  [u0, u1]: [number, number],
  [v0, v1]: [number, number],
): number {
  const n = 200;
  const [du, dv] = [(u1 - u0) / n, (v1 - v0) / n];
  let soma = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const [u, v] = [u0 + (i + 0.5) * du, v0 + (j + 0.5) * dv];
      const p = r(u, v);
      const ru = r(u + 1e-6, v).map((c, k) => (c - p[k]!) / 1e-6);
      const rv = r(u, v + 1e-6).map((c, k) => (c - p[k]!) / 1e-6);
      const nx = ru[1]! * rv[2]! - ru[2]! * rv[1]!;
      const ny = ru[2]! * rv[0]! - ru[0]! * rv[2]!;
      const nz = ru[0]! * rv[1]! - ru[1]! * rv[0]!;
      soma += (F[0]!(...p) * nx + F[1]!(...p) * ny + F[2]!(...p) * nz) * du * dv;
    }
  }
  return soma;
}

function conferir(e: ReturnType<typeof gerador.gerar>): number {
  const en = e.enunciado;
  const tex = e.enunciadoTex;
  let m: RegExpExecArray | null;

  if ((m = /divergente do campo no ponto \((-?\d+), (-?\d+), (-?\d+)\)/.exec(en))) {
    const F = lerCampo(tex);
    const [x, y, z] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const h = 1e-5;
    return (
      (F[0]!(x + h, y, z) - F[0]!(x - h, y, z)) / (2 * h) +
      (F[1]!(x, y + h, z) - F[1]!(x, y - h, z)) / (2 * h) +
      (F[2]!(x, y, z + h) - F[2]!(x, y, z - h)) / (2 * h)
    );
  }
  if ((m = /rotacional do campo plano no ponto \((-?\d+), (-?\d+)\)/.exec(en))) {
    const F = lerCampo(tex);
    const [x, y] = [Number(m[1]), Number(m[2])];
    const h = 1e-5;
    return (
      (F[1]!(x + h, y, 0) - F[1]!(x - h, y, 0)) / (2 * h) -
      (F[0]!(x, y + h, 0) - F[0]!(x, y - h, 0)) / (2 * h)
    );
  }
  if ((m = /acima do retângulo 0 ≤ x ≤ (\d+), 0 ≤ y ≤ (\d+)/.exec(en))) {
    const [, a, b] = /z = (-?\d+)x ([+-] \d+)y/.exec(tex)!.map((t) => t.replace(' ', ''));
    // Área pelo produto vetorial dos vetores tangentes (1, 0, a) e (0, 1, b).
    return Math.hypot(-Number(a), -Number(b), 1) * Number(m[1]) * Number(m[2]);
  }
  if ((m = /borda do retângulo 0 ≤ x ≤ (\d+), 0 ≤ y ≤ (\d+)/.exec(en))) {
    return circulacao(lerCampo(tex), retangulo(Number(m[1]), Number(m[2])));
  }
  if ((m = /fora da esfera de raio (\d+)/.exec(en))) {
    const R = Number(m[1]);
    return fluxoParametrico(
      lerCampo(tex),
      (u, v) => [R * Math.sin(u) * Math.cos(v), R * Math.sin(u) * Math.sin(v), R * Math.cos(u)],
      [0, Math.PI],
      [0, 2 * Math.PI],
    );
  }
  if ((m = /fora do cubo 0 ≤ x, y, z ≤ (\d+)/.exec(en))) {
    return fluxoCubo(lerCampo(tex), Number(m[1]));
  }
  if ((m = /fora do cilindro x² \+ y² ≤ (\d+), 0 ≤ z ≤ (\d+)/.exec(en))) {
    const F = lerCampo(tex);
    const [R, H] = [Math.sqrt(Number(m[1])), Number(m[2])];
    const lateral = fluxoParametrico(
      F,
      (t, z) => [R * Math.cos(t), R * Math.sin(t), z],
      [0, 2 * Math.PI],
      [0, H],
    );
    // Tampa de cima (normal +z) e de baixo (normal −z), em coordenadas polares.
    const tampa = (z: number, s: number) =>
      fluxoParametrico(
        F,
        (rho, t) => [rho * Math.cos(t), rho * Math.sin(t), z],
        [0, R],
        [0, 2 * Math.PI],
      ) * s;
    return lateral + tampa(H, 1) + tampa(0, -1);
  }
  if ((m = /circunferência x² \+ y² = (\d+), no plano z = 0/.exec(en))) {
    const R = Math.sqrt(Number(m[1]));
    const corpo = /\\left\((.*),\\; z\\right\)/.exec(tex)![1]!;
    const F = lerCampo(`\\left(${corpo}\\right)`);
    return circulacao(F, (t) => [R * Math.cos(2 * Math.PI * t), R * Math.sin(2 * Math.PI * t)]);
  }
  m = /\\frac\{x\^\{2\}\}\{(\d+)\} \+ \\frac\{y\^\{2\}\}\{(\d+)\} = 1/.exec(tex)!;
  expect(m, tex).not.toBeNull();
  const [a, b] = [Math.sqrt(Number(m[1])), Math.sqrt(Number(m[2]))];
  const F: F3[] = [(_x, y) => -y / 2, (x) => x / 2, () => 0];
  return circulacao(F, (t) => [a * Math.cos(2 * Math.PI * t), b * Math.sin(2 * Math.PI * t)]);
}

describe('geradorTeoremasIntegrais', () => {
  for (const nivel of NIVEIS) {
    it(`no nível ${nivel}, o gabarito confere com o cálculo direto (sem o teorema)`, () => {
      for (const e of amostra(nivel)) {
        const direto = conferir(e);
        const escala = Math.max(1, Math.abs(e.gabarito));
        expect(
          Math.abs(direto - e.gabarito) / escala,
          `${e.enunciado} ${e.enunciadoTex}`,
        ).toBeLessThan(2e-3);
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

  it('o Extremo tem Stokes, cilindro e área por Green, que o Difícil não tem', () => {
    const extremo = new Set(amostra('extremo', 200).flatMap((e) => e.conceitos));
    expect(extremo.has('teoremas.stokes')).toBe(true);
    expect(amostra('dificil', 200).some((e) => e.enunciado.includes('Stokes'))).toBe(false);
  });
});
