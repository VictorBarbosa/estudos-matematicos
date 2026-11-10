/** Um ponto no espaço, com z para cima. */
export type Ponto3d = readonly [x: number, y: number, z: number];

/** Cores disponíveis, as mesmas famílias do MathPlot. */
export type Cor3d = 'serie-1' | 'serie-2' | 'serie-3' | 'acento' | 'aresta' | 'apoio';

export interface Traco3d {
  /** Polilinha: dois pontos para um segmento, vários para uma curva. */
  readonly pontos: readonly Ponto3d[];
  readonly cor?: Cor3d;
  /** Seta na ponta final, para vetores. */
  readonly seta?: boolean;
  readonly tracejado?: boolean;
  /** Fecha e preenche levemente o polígono (um paralelogramo, uma base). */
  readonly preenchido?: boolean;
  /** Texto junto da ponta final. */
  readonly rotulo?: string;
  /** Põe o rótulo no meio do traço, para medidas que terminam no mesmo ponto (h e g no cone). */
  readonly rotuloNoMeio?: boolean;
}

/** Circunferência de raio r no plano z = altura, centrada no eixo z. */
export function circunferencia3d(raio: number, altura: number, lados = 48): Ponto3d[] {
  return Array.from({ length: lados + 1 }, (_, i) => {
    const t = (2 * Math.PI * i) / lados;
    return [raio * Math.cos(t), raio * Math.sin(t), altura] as const;
  });
}
