import { Passo } from '@core/math/tipos';

/** Uma fórmula em destaque dentro do modal de teoria. */
export interface FormulaTeoria {
  readonly tex: string;
  readonly legenda?: string;
}

/** Exemplo numérico resolvido que acompanha a explicação. */
export interface ExemploTeoria {
  readonly enunciado: string;
  readonly passos: readonly Passo[];
}

/**
 * Conteúdo teórico de um conceito, tratado como dado tipado em vez de markup
 * espalhado pelos templates.
 *
 * Como é dado, o mesmo conceito pode ser aberto a partir de qualquer tópico,
 * referenciado por um exercício que o aluno errou e listado como leitura
 * relacionada em outro conceito.
 */
export interface Teoria {
  /** Identificador estável, no formato `topico.conceito`. */
  readonly id: string;
  readonly titulo: string;
  /** Uma frase que resume a ideia, usada como subtítulo do modal. */
  readonly resumo: string;
  readonly definicao: string;
  readonly formulas: readonly FormulaTeoria[];
  /** A demonstração de por que a regra funciona. */
  readonly demonstracao: readonly Passo[];
  readonly exemplo?: ExemploTeoria;
  /** Ids de outros conceitos relacionados. */
  readonly vejaTambem?: readonly string[];
}
