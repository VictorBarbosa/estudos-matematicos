/**
 * Monômios c·xⁱ·yʲ·zᵏ: o bastante para os campos dos teoremas integrais.
 *
 * Com monômios, derivar e integrar numa caixa são contas exatas e curtas, e a
 * resolução pode mostrar cada número — o que um integrador numérico esconderia.
 */
export interface Monomio {
  readonly c: number;
  readonly i: number;
  readonly j: number;
  readonly k: number;
}

export type Variavel = 'x' | 'y' | 'z';

export const mono = (c: number, i = 0, j = 0, k = 0): Monomio => ({ c, i, j, k });

export function derivar(m: Monomio, v: Variavel): Monomio {
  const e = v === 'x' ? m.i : v === 'y' ? m.j : m.k;
  if (e === 0) return mono(0);
  return {
    c: m.c * e,
    i: v === 'x' ? m.i - 1 : m.i,
    j: v === 'y' ? m.j - 1 : m.j,
    k: v === 'z' ? m.k - 1 : m.k,
  };
}

export function avaliar(m: Monomio, x: number, y = 0, z = 0): number {
  return m.c * x ** m.i * y ** m.j * z ** m.k;
}

/** ∫₀ᴸ∫₀ᴹ c·xⁱ·yʲ dy dx (z ignorado). */
export function integrarRetangulo(m: Monomio, L: number, M: number): number {
  return (m.c * L ** (m.i + 1) * M ** (m.j + 1)) / ((m.i + 1) * (m.j + 1));
}

/** ∫₀ᴸ∫₀ᴸ∫₀ᴸ c·xⁱ·yʲ·zᵏ dV. */
export function integrarCubo(m: Monomio, L: number): number {
  return (m.c * L ** (m.i + m.j + m.k + 3)) / ((m.i + 1) * (m.j + 1) * (m.k + 1));
}

const potencia = (v: string, e: number): string => (e === 0 ? '' : e === 1 ? v : `${v}^{${e}}`);

/** O monômio em LaTeX: `3x^{2}y`, `-z`, `5`. */
export function monoTex(m: Monomio): string {
  const corpo = potencia('x', m.i) + potencia('y', m.j) + potencia('z', m.k);
  if (m.c === 0) return '0';
  if (corpo === '') return String(m.c);
  if (m.c === 1) return corpo;
  if (m.c === -1) return `-${corpo}`;
  return `${m.c}${corpo}`;
}

const SOBRE = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const potenciaTexto = (v: string, e: number): string =>
  e === 0 ? '' : e === 1 ? v : `${v}${SOBRE[e]}`;

/** O mesmo monômio em texto puro, para dicas: `3x²y`. */
export function monoTexto(m: Monomio): string {
  const corpo = potenciaTexto('x', m.i) + potenciaTexto('y', m.j) + potenciaTexto('z', m.k);
  if (m.c === 0) return '0';
  if (corpo === '') return String(m.c);
  if (m.c === 1) return corpo;
  if (m.c === -1) return `−${corpo}`;
  return `${m.c < 0 ? '−' : ''}${Math.abs(m.c)}${corpo}`;
}
