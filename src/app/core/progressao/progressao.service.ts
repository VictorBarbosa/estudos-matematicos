import { Injectable, computed, inject, signal } from '@angular/core';
import { ProgressoService } from '@core/treino/progresso.service';
import {
  ACERTOS_EXIGENTES,
  ACERTOS_NA_JANELA,
  Dominio,
  ProgressoDoRequisito,
  Etapa,
  RESPOSTAS_NA_JANELA,
  TRILHA,
  dominioDe,
  indiceNaTrilha,
} from './progressao.model';

const CHAVE_MODO_LIVRE = 'estudos-matematicos.modo-livre.v1';

/**
 * A trilha como um jogo: um tópico de cada vez.
 *
 * Cada etapa só abre depois que a anterior foi vencida — e vencer significa
 * demonstrar domínio no critério de {@link dominioDe}: acertar
 * {@link ACERTOS_NA_JANELA} das últimas {@link RESPOSTAS_NA_JANELA} tentativas,
 * com {@link ACERTOS_EXIGENTES} delas no Médio ou no Difícil. Isso evita o
 * atalho mais comum do estudo por conta própria: pular para derivadas sem ter
 * frações no automático.
 *
 * Nada aqui guarda estado novo: a conquista é derivada do histórico de
 * tentativas que o `ProgressoService` já registra por tópico, no mesmo
 * `localStorage`. Um refresh, portanto, devolve a trilha exatamente onde ela
 * estava.
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
    const historicos = this.progresso.porHistorico();
    const conceitos = this.progresso.porConceito();

    return new Set(
      TRILHA.filter(
        (etapa) => dominioDe(historicos[etapa.topicoId] ?? [], etapa.topicoId, conceitos).vencido,
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

  /** Como o tópico está em relação ao critério de domínio. */
  dominioEm(topicoId: string): Dominio {
    return dominioDe(this.progresso.historicoDe(topicoId), topicoId, this.progresso.porConceito());
  }

  /** Acertos já contabilizados na janela recente, limitados ao alvo. */
  avancoNa(topicoId: string): number {
    return Math.min(this.dominioEm(topicoId).acertos, ACERTOS_NA_JANELA);
  }

  /** Quantos acertos ainda faltam na janela recente. */
  faltamPara(topicoId: string): number {
    return Math.max(0, ACERTOS_NA_JANELA - this.dominioEm(topicoId).acertos);
  }

  /** Quantos acertos no Médio ou no Difícil ainda faltam. */
  faltamExigentesPara(topicoId: string): number {
    return Math.max(0, ACERTOS_EXIGENTES - this.dominioEm(topicoId).acertosExigentes);
  }

  /** As exigências de cobertura do tópico que ainda não foram cumpridas. */
  requisitosPendentes(topicoId: string): readonly ProgressoDoRequisito[] {
    return this.dominioEm(topicoId).requisitos.filter((requisito) => !requisito.cumprido);
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
