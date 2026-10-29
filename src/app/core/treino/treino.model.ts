import { Resolucao } from '@core/math/tipos';
import { Rng } from './rng';

export type Nivel = 'facil' | 'medio' | 'dificil';

export const NIVEIS: readonly Nivel[] = ['facil', 'medio', 'dificil'];

export const ROTULO_NIVEL: Readonly<Record<Nivel, string>> = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
};

/**
 * Um erro típico do tema, previsto de antemão.
 *
 * É o que permite corrigir de forma didática: quando a resposta do aluno
 * coincide com uma armadilha, sabemos exatamente qual foi o equívoco
 * conceitual e podemos nomeá-lo, em vez de apenas mostrar o gabarito.
 */
export interface Armadilha<T> {
  /** A resposta que esse erro produz. */
  readonly resposta: T;
  /** O que o aluno provavelmente fez, dito sem julgamento. */
  readonly diagnostico: string;
  /** Índice do passo da resolução em que a divergência aparece. */
  readonly passo?: number;
  /** Conceito a revisar por causa desse erro. */
  readonly conceito?: string;
}

export interface Exercicio<T> {
  readonly id: string;
  readonly nivel: Nivel;
  /** Comando em linguagem natural. */
  readonly enunciado: string;
  /** A expressão a resolver, em LaTeX. */
  readonly enunciadoTex: string;
  readonly gabarito: T;
  /** A resolução completa, reaproveitada do motor matemático. */
  readonly resolucao: Resolucao<T>;
  /** Conceitos exercitados — alimentam a sugestão de revisão. */
  readonly conceitos: readonly string[];
  readonly armadilhas: readonly Armadilha<T>[];
  readonly dica?: string;
  /**
   * A resposta precisa estar escrita como fração?
   *
   * Existe para o exercício em que a forma É a pergunta: "escreva 0,75 como
   * fração" tem 0,75 como resposta de valor correto, e aceitá-la deixaria o
   * aluno devolver o enunciado. Quando isto está ligado, um decimal digitado
   * não conta como erro de matemática — conta como formato, e a correção pede
   * a outra escrita.
   */
  readonly exigeFracao?: boolean;
}

export type Veredito = 'correto' | 'incorreto' | 'invalido';

export interface Validacao {
  readonly veredito: Veredito;
  /** Mensagem principal mostrada ao aluno. */
  readonly mensagem: string;
  /** Explicação do erro específico, quando ele foi reconhecido. */
  readonly diagnostico?: string;
  readonly passoDivergente?: number;
  readonly conceitoAssociado?: string;
}

/**
 * O que cada tópico precisa implementar para ganhar uma área de treino.
 *
 * A mecânica de rodada, correção, placar e progresso é genérica e já existe:
 * um tópico novo só escreve o gerador.
 */
export interface GeradorExercicio<T> {
  readonly topicoId: string;
  /** Texto de apoio do campo de resposta, por exemplo `ex.: 3/4`. */
  readonly formatoResposta: string;
  gerar(nivel: Nivel, rng: Rng): Exercicio<T>;
  /** Converte o texto digitado em valor do domínio, ou `null` se não entender. */
  analisar(entrada: string): T | null;
  /** Igualdade por valor: `6/8` deve contar como `3/4`. */
  saoEquivalentes(a: T, b: T): boolean;
  /** Forma legível do valor, para exibir o gabarito. */
  formatar(valor: T): string;
}

/** O que foi digitado é um decimal — com vírgula ou ponto — e não uma fração? */
function ehDecimal(entrada: string): boolean {
  return /^[+-]?\d*[.,]\d+$/.test(entrada.trim().replace(/\s+/g, ''));
}

/**
 * Remove armadilhas que, naquele exercício em particular, caem sobre o próprio
 * gabarito ou sobre outra armadilha já listada.
 *
 * Um erro previsto pode, por coincidência numérica, levar à resposta certa —
 * "dividir por 10" e "tomar 10%" dão o mesmo valor. Sem este filtro, o aluno
 * acertaria e ainda assim veria um diagnóstico de erro.
 */
export function semColisoes<T>(
  armadilhas: readonly Armadilha<T>[],
  gabarito: T,
  saoEquivalentes: (a: T, b: T) => boolean,
): readonly Armadilha<T>[] {
  const jaVistas: T[] = [gabarito];

  return armadilhas.filter((armadilha) => {
    if (jaVistas.some((anterior) => saoEquivalentes(anterior, armadilha.resposta))) {
      return false;
    }
    jaVistas.push(armadilha.resposta);
    return true;
  });
}

/**
 * Corrige uma resposta usando o gabarito e as armadilhas do exercício.
 *
 * Genérico de propósito: serve igualmente para frações, raízes de equações e
 * derivadas, bastando que o gerador saiba analisar e comparar seu próprio tipo.
 */
export function corrigir<T>(
  gerador: GeradorExercicio<T>,
  exercicio: Exercicio<T>,
  entrada: string,
): Validacao {
  const valor = gerador.analisar(entrada);

  if (valor === null) {
    return {
      veredito: 'invalido',
      mensagem: `Não consegui ler essa resposta. Use o formato ${gerador.formatoResposta}.`,
    };
  }

  // Onde a forma é a pergunta, repetir o decimal não responde nada.
  if (exercicio.exigeFracao === true && ehDecimal(entrada)) {
    return {
      veredito: 'invalido',
      mensagem:
        'Esse é o número que o enunciado já deu, escrito do mesmo jeito. ' +
        'A resposta é uma fração: escreva no formato 3/4.',
    };
  }

  if (gerador.saoEquivalentes(valor, exercicio.gabarito)) {
    return { veredito: 'correto', mensagem: 'Correto!' };
  }

  const armadilha = exercicio.armadilhas.find((candidata) =>
    gerador.saoEquivalentes(valor, candidata.resposta),
  );

  if (armadilha) {
    return {
      veredito: 'incorreto',
      mensagem: 'Quase — o caminho tem um desvio conhecido.',
      diagnostico: armadilha.diagnostico,
      passoDivergente: armadilha.passo,
      conceitoAssociado: armadilha.conceito,
    };
  }

  return {
    veredito: 'incorreto',
    mensagem: `Não é isso. A resposta correta é ${gerador.formatar(exercicio.gabarito)}.`,
  };
}
