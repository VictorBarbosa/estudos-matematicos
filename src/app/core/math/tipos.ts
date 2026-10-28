/**
 * Tipos comuns a todo o motor matemático.
 *
 * A ideia central do projeto é *demonstrar*, não apenas calcular. Por isso toda
 * rotina de resolução devolve, além do resultado, a trilha algébrica que levou
 * até ele. Essa mesma trilha alimenta tanto a explicação na tela quanto o
 * gabarito comentado da área de treino.
 */

/** Uma etapa da resolução, pronta para ser exibida. */
export interface Passo {
  /** O que foi feito nesta etapa, em linguagem natural. */
  readonly descricao: string;
  /** A expressão correspondente, em LaTeX. */
  readonly tex: string;
  /** Observação opcional sobre o porquê da etapa. */
  readonly nota?: string;
}

/** Resultado de uma rotina acompanhado de sua demonstração. */
export interface Resolucao<T> {
  readonly resultado: T;
  readonly passos: readonly Passo[];
}

/** Erro de domínio: a entrada não representa um objeto matemático válido. */
export class ErroMatematico extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroMatematico';
  }
}

/** Garante que o valor é um inteiro finito antes de usá-lo em aritmética exata. */
export function exigirInteiro(valor: number, nome: string): number {
  if (!Number.isInteger(valor)) {
    throw new ErroMatematico(`${nome} deve ser um número inteiro, recebido: ${valor}`);
  }
  return valor;
}
