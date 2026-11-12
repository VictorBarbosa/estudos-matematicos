import { Injectable, signal } from '@angular/core';

/** A pergunta que está na tela, do jeito que ela se lê. */
export interface ExercicioEmFoco {
  readonly enunciado: string;
  /** A expressão em LaTeX, ou vazio quando o exercício é só texto. */
  readonly tex: string;
}

/**
 * Qual exercício o aluno está resolvendo agora.
 *
 * Existe por um motivo só, e ele é prático: no celular o monta monta ocupa a
 * tela inteira — a bandeja de peças não cabe em meia tela — e **cobre o
 * enunciado**. Montar a conta sem a pergunta à vista é fazer conta de cabeça,
 * que é exatamente o que a ferramenta existe para evitar.
 *
 * A gaveta vive no casco, fora do roteador, e não tem como alcançar o
 * componente que desenhou a pergunta: a sessão de treino nasce dentro de um
 * `computed` local da área de treino, e há três telas que servem exercício —
 * treino, prova de área e prova surpresa. Então a direção se inverte: cada uma
 * **publica** aqui o que está perguntando, e quem precisa, lê.
 *
 * É só leitura de ida: ninguém aqui manda nas três telas, e nenhuma delas sabe
 * que o monta monta existe. Quem sai de cena limpa o que publicou, senão a
 * gaveta mostraria a pergunta da tela anterior.
 *
 * O `tex` vem do código dos geradores, nunca do aluno — é o que permite
 * desenhá-lo com o KaTeX, como o resto do site faz.
 */
@Injectable({ providedIn: 'root' })
export class ExercicioEmFocoService {
  private readonly atual = signal<ExercicioEmFoco | null>(null);

  readonly exercicio = this.atual.asReadonly();

  mostrar(exercicio: ExercicioEmFoco): void {
    this.atual.set(exercicio);
  }

  limpar(): void {
    this.atual.set(null);
  }
}
