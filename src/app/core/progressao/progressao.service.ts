import { Injectable, computed, inject, signal } from '@angular/core';
import { ProgressoService } from '@core/treino/progresso.service';
import { ACERTOS_PARA_LIBERAR, Etapa, TRILHA, indiceNaTrilha } from './progressao.model';

const CHAVE_MODO_LIVRE = 'estudos-matematicos.modo-livre.v1';

/**
 * A trilha como um jogo: um tópico de cada vez.
 *
 * Cada etapa só abre depois que a anterior foi vencida — e vencer significa
 * acertar {@link ACERTOS_PARA_LIBERAR} exercícios seguidos na área de treino
 * daquele tópico. Isso evita o atalho mais comum do estudo por conta própria:
 * pular para derivadas sem ter frações no automático.
 *
 * Nada aqui guarda estado novo: a conquista é derivada da melhor sequência que
 * o `ProgressoService` já registra por tópico, no mesmo `localStorage`. Um
 * refresh, portanto, devolve a trilha exatamente onde ela estava.
 *
 * O modo livre é a válvula de escape, para quando o objetivo é consultar e não
 * jogar. Ele também é lembrado entre sessões.
 */
@Injectable({ providedIn: 'root' })
export class ProgressaoService {
  private readonly progresso = inject(ProgressoService);
  private readonly livre = signal(carregarModoLivre());

  readonly trilha = TRILHA;
  readonly totalDeEtapas = TRILHA.length;
  readonly modoLivre = this.livre.asReadonly();

  /** Tópicos já vencidos, em qualquer ordem. */
  readonly concluidas = computed(() => {
    const porTopico = this.progresso.porTopico();

    return new Set(
      TRILHA.filter(
        (etapa) => (porTopico[etapa.topicoId]?.melhorSequencia ?? 0) >= ACERTOS_PARA_LIBERAR,
      ).map((etapa) => etapa.topicoId),
    );
  });

  /**
   * Quantas etapas foram vencidas *sem furos* a partir do começo.
   *
   * É esse número que define a fronteira: tudo até ele está aberto, o resto
   * continua trancado.
   */
  readonly etapasVencidas = computed(() => {
    const concluidas = this.concluidas();

    let vencidas = 0;
    while (vencidas < TRILHA.length && concluidas.has(TRILHA[vencidas]!.topicoId)) {
      vencidas++;
    }

    return vencidas;
  });

  /** A etapa em que o jogador está agora, ou `null` se a trilha acabou. */
  readonly etapaAtual = computed<Etapa | null>(() => TRILHA[this.etapasVencidas()] ?? null);

  readonly trilhaCompleta = computed(() => this.etapasVencidas() === TRILHA.length);

  /** Percentual da trilha concluído, para a barra geral. */
  readonly percentual = computed(() =>
    TRILHA.length === 0 ? 0 : Math.round((this.etapasVencidas() / TRILHA.length) * 100),
  );

  etapaDe(topicoId: string): Etapa | null {
    return TRILHA[indiceNaTrilha(topicoId)] ?? null;
  }

  /** A etapa seguinte a esta na trilha. */
  proximaDe(topicoId: string): Etapa | null {
    const indice = indiceNaTrilha(topicoId);
    return indice === -1 ? null : (TRILHA[indice + 1] ?? null);
  }

  estaConcluida(topicoId: string): boolean {
    return this.concluidas().has(topicoId);
  }

  /**
   * O tópico pode ser aberto?
   *
   * Vale para o que já foi vencido, para a etapa da vez e para qualquer coisa
   * fora da trilha (uma página que não seja um tópico). No modo livre, tudo.
   */
  estaLiberada(topicoId: string): boolean {
    if (this.livre()) {
      return true;
    }

    const indice = indiceNaTrilha(topicoId);
    return indice === -1 || indice <= this.etapasVencidas();
  }

  /** Melhor sequência já feita no tópico, limitada ao alvo. */
  avancoNa(topicoId: string): number {
    const melhor = this.progresso.estatisticaDe(topicoId).melhorSequencia;
    return Math.min(melhor, ACERTOS_PARA_LIBERAR);
  }

  /** Quantos acertos seguidos ainda faltam para vencer o tópico. */
  faltamPara(topicoId: string): number {
    return ACERTOS_PARA_LIBERAR - this.avancoNa(topicoId);
  }

  /**
   * Apaga tudo e volta à primeira etapa.
   *
   * Zera o desempenho por tópico e por conceito e desliga o modo livre, de
   * modo que a trilha fique como no primeiro acesso. Não há desfazer: quem
   * chama confirma antes.
   */
  reiniciar(): void {
    this.progresso.limpar();
    this.definirModoLivre(false);
  }

  definirModoLivre(valor: boolean): void {
    this.livre.set(valor);

    try {
      localStorage.setItem(CHAVE_MODO_LIVRE, JSON.stringify(valor));
    } catch {
      // Janela privada: o modo vale só para esta sessão.
    }
  }
}

function carregarModoLivre(): boolean {
  try {
    return localStorage.getItem(CHAVE_MODO_LIVRE) === 'true';
  } catch {
    return false;
  }
}
