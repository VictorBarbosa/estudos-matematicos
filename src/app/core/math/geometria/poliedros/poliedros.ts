/**
 * Poliedros: vértices, arestas e faces.
 *
 * Os cinco de Platão e os prismas e pirâmides de base regular, com as
 * coordenadas dos vértices (para desenhar) e as contagens V, A e F (para a
 * relação de Euler). As arestas dos sólidos de Platão saem de uma regra
 * geométrica simples: ligam os pares de vértices à menor distância.
 */

export type PontoPoliedro = readonly [number, number, number];

export interface Poliedro {
  readonly vertices: readonly PontoPoliedro[];
  readonly arestas: readonly (readonly [number, number])[];
  readonly faces: number;
}

export type Platonico = 'tetraedro' | 'cubo' | 'octaedro' | 'dodecaedro' | 'icosaedro';

const PHI = (1 + Math.sqrt(5)) / 2;

/** Todas as combinações de sinais de uma lista de valores. */
function sinais(base: readonly number[]): PontoPoliedro[] {
  const saida: PontoPoliedro[] = [];
  const indices = base.map((v, i) => (v === 0 ? -1 : i)).filter((i) => i >= 0);
  for (let m = 0; m < 1 << indices.length; m++) {
    const p = [...base];
    indices.forEach((idx, bit) => {
      if (m & (1 << bit)) p[idx] = -p[idx]!;
    });
    saida.push([p[0]!, p[1]!, p[2]!]);
  }
  return saida;
}

/** As três permutações cíclicas de (a, b, c). */
const ciclos = (a: number, b: number, c: number): number[][] => [
  [a, b, c],
  [b, c, a],
  [c, a, b],
];

const distancia = (p: PontoPoliedro, q: PontoPoliedro): number =>
  Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);

/** Liga os pares de vértices à menor distância entre eles. */
function arestasMaisCurtas(vertices: readonly PontoPoliedro[]): [number, number][] {
  let menor = Infinity;
  for (let i = 0; i < vertices.length; i++)
    for (let j = i + 1; j < vertices.length; j++)
      menor = Math.min(menor, distancia(vertices[i]!, vertices[j]!));
  const arestas: [number, number][] = [];
  for (let i = 0; i < vertices.length; i++)
    for (let j = i + 1; j < vertices.length; j++)
      if (Math.abs(distancia(vertices[i]!, vertices[j]!) - menor) < 1e-6) arestas.push([i, j]);
  return arestas;
}

export function poliedroPlatonico(nome: Platonico): Poliedro {
  let vertices: PontoPoliedro[];
  let faces: number;
  switch (nome) {
    case 'tetraedro':
      vertices = [
        [1, 1, 1],
        [1, -1, -1],
        [-1, 1, -1],
        [-1, -1, 1],
      ];
      faces = 4;
      break;
    case 'cubo':
      vertices = sinais([1, 1, 1]);
      faces = 6;
      break;
    case 'octaedro':
      vertices = ciclos(1, 0, 0).flatMap((c) => sinais(c));
      faces = 8;
      break;
    case 'dodecaedro':
      vertices = [...sinais([1, 1, 1]), ...ciclos(0, 1 / PHI, PHI).flatMap((c) => sinais(c))];
      faces = 12;
      break;
    case 'icosaedro':
      vertices = ciclos(0, 1, PHI).flatMap((c) => sinais(c));
      faces = 20;
      break;
  }
  return { vertices, arestas: arestasMaisCurtas(vertices), faces };
}

/** Prisma reto de base regular com n lados. */
export function poliedroPrisma(n: number, altura = 1.6): Poliedro {
  const base: PontoPoliedro[] = Array.from({ length: n }, (_, i) => {
    const t = (2 * Math.PI * i) / n;
    return [Math.cos(t), Math.sin(t), 0] as const;
  });
  const topo: PontoPoliedro[] = base.map(([x, y]) => [x, y, altura] as const);
  const arestas: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    arestas.push([i, (i + 1) % n], [n + i, n + ((i + 1) % n)], [i, n + i]);
  }
  return { vertices: [...base, ...topo], arestas, faces: n + 2 };
}

/** Pirâmide reta de base regular com n lados. */
export function poliedroPiramide(n: number, altura = 1.6): Poliedro {
  const base: PontoPoliedro[] = Array.from({ length: n }, (_, i) => {
    const t = (2 * Math.PI * i) / n;
    return [Math.cos(t), Math.sin(t), 0] as const;
  });
  const arestas: [number, number][] = [];
  for (let i = 0; i < n; i++) arestas.push([i, (i + 1) % n], [i, n]);
  return { vertices: [...base, [0, 0, altura]], arestas, faces: n + 1 };
}

/** A característica de Euler: V − A + F, que vale 2 em todo poliedro convexo. */
export const caracteristicaDeEuler = (p: Poliedro): number =>
  p.vertices.length - p.arestas.length + p.faces;
