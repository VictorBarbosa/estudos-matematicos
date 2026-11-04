import { Resolucao } from '@core/math/tipos/tipos';
import { Rng } from '@core/treino/rng/rng';

export type Nivel = 'facil' | 'medio' | 'dificil';

export const NIVEIS: readonly Nivel[] = ['facil', 'medio', 'dificil'];

/** A chave de tradução de cada nível, já que a interface fala três línguas. */
export const CHAVE_DO_NIVEL: Readonly<Record<Nivel, string>> = {
  facil: 'nivel.facil',
  medio: 'nivel.medio',
  dificil: 'nivel.dificil',
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
  /**
   * A expressão a resolver, em LaTeX, ou {@link SEM_FORMULA}.
   *
   * Nem todo exercício deve entregar a fórmula montada. Em Razão e proporção,
   * no Difícil, a tarefa é justamente decidir se as grandezas são direta ou
   * inversamente proporcionais e montar a proporção: exibir `a/b = c/x` ao
   * lado do texto responderia a pergunta antes dela ser feita.
   */
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

/**
 * Uma tecla de símbolo do campo de resposta.
 *
 * Algumas inserem um símbolo solto (`∈`); outras, um esqueleto com o cursor no
 * lugar de preencher — `f()` com o cursor entre os parênteses, `\sum_{k=1}^{}`
 * com ele no limite de cima.
 */
export interface TeclaDeSimbolo {
  /** O que aparece no botão. */
  readonly rotulo: string;
  /** O texto inserido no campo. */
  readonly insere: string;
  /** Quantos caracteres recuar o cursor depois de inserir. */
  readonly recuo?: number;
  /** Nome para leitor de tela, já que o rótulo é um símbolo. */
  readonly nome: string;
}

/**
 * Enunciado sem fórmula: montar a expressão faz parte da pergunta.
 *
 * É string vazia, e não `undefined`, para que o campo continue obrigatório —
 * esquecer a fórmula tem de ser uma escolha escrita, não um esquecimento.
 */
export const SEM_FORMULA = '';

export type Veredito = 'correto' | 'incorreto' | 'invalido';

export interface Validacao {
  readonly veredito: Veredito;
  /** Mensagem principal mostrada ao aluno. */
  readonly mensagem: string;
  /**
   * Recado sobre a FORMA de uma resposta certa.
   *
   * `10/20` vale o mesmo que `1/2` e sempre contou como acerto — a correção
   * aqui é por valor. O que faltava era dizer que existe uma forma menor, que
   * é a que o gabarito mostra e a que deixa a conta seguinte mais leve.
   */
  readonly observacao?: string;
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
  /**
   * Sorteia um exercício.
   *
   * `pendentes` são os tipos que ainda faltam para a etapa abrir. Quem tem
   * exigência de cobertura usa a lista para oferecer o que falta em vez de
   * repetir o que já está cumprido; os demais geradores a ignoram.
   */
  gerar(nivel: Nivel, rng: Rng, pendentes?: readonly string[]): Exercicio<T>;
  /** Converte o texto digitado em valor do domínio, ou `null` se não entender. */
  analisar(entrada: string): T | null;
  /** Igualdade por valor: `6/8` deve contar como `3/4`. */
  saoEquivalentes(a: T, b: T): boolean;
  /** Forma legível do valor, para exibir o gabarito. */
  formatar(valor: T): string;
  /**
   * Teclas de símbolo oferecidas ao lado do campo de resposta.
   *
   * Existe porque `∀`, `∈` e `∑` não estão no teclado de ninguém: sem
   * paleta, um tópico que pede notação pede o impossível. Quem não precisa
   * dela não declara nada e o campo fica como sempre foi.
   */
  readonly simbolos?: readonly TeclaDeSimbolo[];
  /**
   * Um recado sobre a forma de uma resposta CERTA, quando há o que dizer.
   *
   * Recebe também o texto digitado, porque o recado fala da escrita: quem
   * respondeu `10/20` precisa ler `10/20` de volta, não a forma normalizada.
   */
  observarResposta?(valor: T, entrada: string): string | undefined;
  /**
   * As escritas igualmente corretas do mesmo valor, quando há mais de uma.
   *
   * Em Frações, 28/27 e 1 1/27 são o mesmo número e as duas contam como
   * acerto — mas o gabarito exibia só a que `formatar` escolhe, e quem
   * escreveu a outra tinha motivo para achar que ela não valia.
   *
   * A primeira da lista é a principal. Quem não implementa tem uma forma só.
   */
  formasEquivalentes?(valor: T): readonly string[];
}

/**
 * Todas as formas corretas de escrever o gabarito, a principal à frente.
 *
 * Sempre devolve pelo menos `formatar(valor)`: um gerador que esqueça de
 * incluir a forma principal na própria lista não some com ela da tela.
 */
export function formasDoGabarito<T>(gerador: GeradorExercicio<T>, valor: T): readonly string[] {
  const principal = gerador.formatar(valor);
  return [...new Set([principal, ...(gerador.formasEquivalentes?.(valor) ?? [])])];
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
    return {
      veredito: 'correto',
      mensagem: 'Correto!',
      observacao: gerador.observarResposta?.(valor, entrada),
    };
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

  const formas = formasDoGabarito(gerador, exercicio.gabarito);

  return {
    veredito: 'incorreto',
    // Quando há duas escritas certas, as duas aparecem: "é -28/27, ou -1 1/27".
    mensagem: `Não é isso. A resposta correta é ${formas.join(', ou ')}.`,
  };
}
