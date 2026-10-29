import { Signal, WritableSignal, computed, signal } from '@angular/core';
import { nivelDoTopico } from '@core/progressao/models/progressao.model';
import { ProgressoService } from '@core/treino/services/progresso.service';
import { Rng, criarRng, sementeAleatoria } from '@core/treino/rng/rng';
import { Exercicio, GeradorExercicio, Nivel, Validacao, corrigir } from '@core/treino/models/treino.model';

/**
 * Estado de uma rodada de treino.
 *
 * Mantida fora do componente para que a mecânica — sortear, corrigir, pontuar,
 * registrar progresso — possa ser testada sem renderizar nada, e para que
 * qualquer tópico a reaproveite apenas fornecendo seu gerador.
 */
export class SessaoTreino<T> {
  private rng: Rng = criarRng(sementeAleatoria());

  /**
   * O nível da vez, derivado do desempenho no tópico.
   *
   * Não é escolha: sobe com acertos seguidos e desce com erros seguidos, pela
   * regra de {@link nivelDoTopico}. Como sai do histórico que o progresso já
   * guarda, ele se recalcula sozinho a cada resposta — e o próximo exercício
   * já sai na dificuldade nova.
   */
  readonly escada = computed(() => nivelDoTopico(this.progresso.historicoDe(this.gerador.topicoId)));

  readonly nivel = computed<Nivel>(() => this.escada().nivel);

  readonly resposta = signal('');
  readonly validacao = signal<Validacao | null>(null);
  readonly resolucaoVisivel = signal(false);

  readonly acertos = signal(0);
  readonly erros = signal(0);
  readonly sequencia = signal(0);
  /** O aluno pediu a resolução do exercício atual em vez de responder? */
  readonly desistiu = signal(false);

  private readonly exercicioAtual: WritableSignal<Exercicio<T>>;
  readonly exercicio: Signal<Exercicio<T>>;

  /**
   * O exercício atual já está encerrado?
   *
   * Vale tanto para quem respondeu e recebeu veredito quanto para quem pediu a
   * resolução: nos dois casos o campo tranca e o caminho é passar ao próximo.
   */
  readonly corrigido = computed(() => {
    const veredito = this.validacao()?.veredito;
    return veredito === 'correto' || veredito === 'incorreto' || this.desistiu();
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
      nivel: this.nivel(),
    });
  }

  /** Sorteia o próximo exercício e limpa o estado da resposta. */
  proximo(): void {
    this.exercicioAtual.set(this.gerador.gerar(this.nivel(), this.rng));
    this.limparResposta();
  }

  /**
   * Mostra a resolução sem responder — e isso conta como desistir.
   *
   * Antes, revelar não registrava nada: o último passo da resolução traz o
   * número, então dava para ler a resposta, digitá-la e ganhar o acerto. O
   * tópico era liberado sem que nada tivesse sido resolvido.
   *
   * Agora a desistência é registrada como tentativa errada, zera a sequência e
   * tranca o campo. A resolução continua à mão de quem não sabe — ela é o que
   * ensina —, só não vale mais ponto.
   */
  revelarResolucao(): void {
    if (this.corrigido()) {
      return;
    }

    const exercicio = this.exercicioAtual();

    this.desistiu.set(true);
    this.resolucaoVisivel.set(true);
    this.erros.update((n) => n + 1);
    this.sequencia.set(0);

    this.progresso.registrar({
      topicoId: this.gerador.topicoId,
      conceitos: exercicio.conceitos,
      acertou: false,
      sequencia: 0,
      nivel: this.nivel(),
      desistiu: true,
    });
  }

  /** Zera o placar da rodada, mantendo o progresso histórico. */
  reiniciar(): void {
    this.acertos.set(0);
    this.erros.set(0);
    this.sequencia.set(0);
    this.desistiu.set(false);
    this.rng = criarRng(sementeAleatoria());
    this.proximo();
  }

  private limparResposta(): void {
    this.resposta.set('');
    this.validacao.set(null);
    this.resolucaoVisivel.set(false);
    this.desistiu.set(false);
  }
}
