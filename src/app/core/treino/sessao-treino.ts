import { Signal, WritableSignal, computed, signal } from '@angular/core';
import { ProgressoService } from './progresso.service';
import { Rng, criarRng, sementeAleatoria } from './rng';
import { Exercicio, GeradorExercicio, Nivel, Validacao, corrigir } from './treino.model';

/**
 * Estado de uma rodada de treino.
 *
 * Mantida fora do componente para que a mecânica — sortear, corrigir, pontuar,
 * registrar progresso — possa ser testada sem renderizar nada, e para que
 * qualquer tópico a reaproveite apenas fornecendo seu gerador.
 */
export class SessaoTreino<T> {
  private rng: Rng = criarRng(sementeAleatoria());

  readonly nivel = signal<Nivel>('facil');
  readonly resposta = signal('');
  readonly validacao = signal<Validacao | null>(null);
  readonly resolucaoVisivel = signal(false);

  readonly acertos = signal(0);
  readonly erros = signal(0);
  readonly sequencia = signal(0);

  private readonly exercicioAtual: WritableSignal<Exercicio<T>>;
  readonly exercicio: Signal<Exercicio<T>>;

  /** Já houve veredito para o exercício atual? */
  readonly corrigido = computed(() => {
    const veredito = this.validacao()?.veredito;
    return veredito === 'correto' || veredito === 'incorreto';
  });

  readonly acertou = computed(() => this.validacao()?.veredito === 'correto');
  readonly respondidos = computed(() => this.acertos() + this.erros());

  constructor(
    private readonly gerador: GeradorExercicio<T>,
    private readonly progresso: ProgressoService,
  ) {
    this.exercicioAtual = signal(this.gerador.gerar(this.nivel(), this.rng));
    this.exercicio = this.exercicioAtual.asReadonly();
  }

  /** Corrige a resposta digitada. Chamar de novo após acertar não faz nada. */
  responder(): void {
    if (this.corrigido()) {
      return;
    }

    const exercicio = this.exercicioAtual();
    const validacao = corrigir(this.gerador, exercicio, this.resposta());
    this.validacao.set(validacao);

    // Formato irreconhecível não conta como tentativa: o aluno não errou a
    // matemática, apenas escreveu de um jeito que não soubemos ler.
    if (validacao.veredito === 'invalido') {
      return;
    }

    const acertou = validacao.veredito === 'correto';

    if (acertou) {
      this.acertos.update((n) => n + 1);
      this.sequencia.update((n) => n + 1);
    } else {
      this.erros.update((n) => n + 1);
      this.sequencia.set(0);
      // Errou: a resolução comentada aparece imediatamente, que é o momento
      // em que ela ensina alguma coisa.
      this.resolucaoVisivel.set(true);
    }

    this.progresso.registrar({
      topicoId: this.gerador.topicoId,
      // Quando o erro foi reconhecido, ele é atribuído ao conceito específico
      // que falhou, em vez de manchar todos os conceitos do exercício.
      conceitos: validacao.conceitoAssociado ? [validacao.conceitoAssociado] : exercicio.conceitos,
      acertou,
      sequencia: this.sequencia(),
    });
  }

  /** Sorteia o próximo exercício e limpa o estado da resposta. */
  proximo(): void {
    this.exercicioAtual.set(this.gerador.gerar(this.nivel(), this.rng));
    this.limparResposta();
  }

  /** Troca o nível e já apresenta um exercício da nova dificuldade. */
  definirNivel(nivel: Nivel): void {
    if (nivel === this.nivel()) {
      return;
    }
    this.nivel.set(nivel);
    this.proximo();
  }

  /** Mostra a resolução sem responder — conta como desistir do exercício. */
  revelarResolucao(): void {
    this.resolucaoVisivel.set(true);
  }

  /** Zera o placar da rodada, mantendo o progresso histórico. */
  reiniciar(): void {
    this.acertos.set(0);
    this.erros.set(0);
    this.sequencia.set(0);
    this.rng = criarRng(sementeAleatoria());
    this.proximo();
  }

  private limparResposta(): void {
    this.resposta.set('');
    this.validacao.set(null);
    this.resolucaoVisivel.set(false);
  }
}
