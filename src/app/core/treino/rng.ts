/**
 * Gerador pseudoaleatório com semente.
 *
 * Usar `Math.random()` tornaria os geradores de exercício impossíveis de
 * testar. Com uma semente explícita, a mesma seed produz sempre a mesma
 * sequência: os testes verificam o gerador de forma determinística e um
 * exercício específico pode ser reproduzido quando preciso.
 */
export interface Rng {
  /** Número em [0, 1). */
  proximo(): number;
  /** Inteiro em [min, max], ambos inclusivos. */
  inteiro(min: number, max: number): number;
  /** Um elemento qualquer da lista. */
  escolher<T>(itens: readonly T[]): T;
  /** Cópia embaralhada da lista. */
  embaralhar<T>(itens: readonly T[]): T[];
  /** Verdadeiro com a probabilidade indicada (0.5 por padrão). */
  booleano(probabilidade?: number): boolean;
  /** +1 ou -1. */
  sinal(): number;
}

/**
 * mulberry32: gerador de 32 bits curto, rápido e de qualidade suficiente para
 * sortear exercícios. Não serve para criptografia, e não precisa servir.
 */
export function criarRng(semente: number): Rng {
  let estado = semente >>> 0;

  const proximo = (): number => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const inteiro = (min: number, max: number): number => {
    if (max < min) {
      [min, max] = [max, min];
    }
    return min + Math.floor(proximo() * (max - min + 1));
  };

  return {
    proximo,
    inteiro,
    escolher: <T>(itens: readonly T[]): T => {
      if (itens.length === 0) {
        throw new Error('Não é possível escolher um item de uma lista vazia.');
      }
      return itens[inteiro(0, itens.length - 1)]!;
    },
    embaralhar: <T>(itens: readonly T[]): T[] => {
      const copia = [...itens];
      for (let i = copia.length - 1; i > 0; i--) {
        const j = inteiro(0, i);
        [copia[i], copia[j]] = [copia[j]!, copia[i]!];
      }
      return copia;
    },
    booleano: (probabilidade = 0.5): boolean => proximo() < probabilidade,
    sinal: (): number => (proximo() < 0.5 ? -1 : 1),
  };
}

/** Semente nova para cada rodada de treino. */
export function sementeAleatoria(): number {
  return (Math.random() * 2 ** 32) >>> 0;
}
