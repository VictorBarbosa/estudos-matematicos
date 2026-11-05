import { Injectable, computed, inject, signal } from '@angular/core';
import { ConfiguracaoService } from '@core/configuracao/services/configuracao.service';
import { ProvaService } from '@core/prova/services/prova.service';
import { ProgressoService } from '@core/treino/services/progresso.service';
import {
  ACERTOS_EXIGENTES,
  ACERTOS_NA_JANELA,
  Dominio,
  ExigenciaDaEtapa,
  ProgressoDoRequisito,
  Etapa,
  RESPOSTAS_NA_JANELA,
  TRILHA,
  dominioDe,
  montarTrilha,
  exigenciasDaEtapa,
  indiceNaTrilha,
} from '@core/progressao/models/progressao.model';

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
 * No fim de cada sessão — cada área do currículo — há ainda a prova final, que
 * cobra o assunto inteiro de uma vez. Enquanto ela não passa, a sessão seguinte
 * continua trancada mesmo com todas as etapas vencidas; quem cuida disso é a
 * {@link ProvaService}, consultada em {@link etapasAbertas}.
 *
 * O modo livre é a válvula de escape, para quando o objetivo é consultar e não
 * jogar. Ele também é lembrado entre sessões.
 */
@Injectable({ providedIn: 'root' })
export class ProgressaoService {
  private readonly progresso = inject(ProgressoService);
  private readonly prova = inject(ProvaService);
  private readonly configuracao = inject(ConfiguracaoService);
  private readonly livre = signal(carregarModoLivre());

  /**
   * A trilha do aluno: o currículo menos o que ele tirou nas configurações.
   *
   * Tudo aqui deriva dela, e não mais da constante — tirar um tópico tem de
   * reorganizar a contagem, a fronteira e a próxima etapa de uma vez só.
   */
  readonly trilha = computed(() => montarTrilha(this.configuracao.topicosRemovidos()));
  readonly totalDeEtapas = computed(() => this.trilha().length);
  readonly modoLivre = this.livre.asReadonly();

  /** Tópicos já vencidos, em qualquer ordem. */
  readonly concluidas = computed(() => {
    const historicos = this.progresso.porHistorico();
    const conceitos = this.progresso.porConceito();

    return new Set(
      this.trilha()
        .filter(
          (etapa) =>
            dominioDe(
              historicos[etapa.topicoId] ?? [],
              etapa.topicoId,
              conceitos,
              this.configuracao.etapa(),
            ).vencido,
        )
        .map((etapa) => etapa.topicoId),
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
    const trilha = this.trilha();

    let vencidas = 0;
    while (vencidas < trilha.length && concluidas.has(trilha[vencidas]!.topicoId)) {
      vencidas++;
    }

    return vencidas;
  });

  /**
   * Quantas etapas estão abertas, contando do começo.
   *
   * Difere de {@link etapasVencidas} num ponto só: a fronteira para ao chegar
   * à borda de uma sessão cuja prova final ainda não passou. Vencer todos os
   * tópicos de Álgebra, portanto, não abre Geometria — abre a prova.
   *
   * São contas separadas de propósito. O contador da trilha mostra etapas
   * vencidas, e uma prova pendente não desfaz nenhuma vitória; o que ela faz é
   * segurar a porta.
   */
  readonly etapasAbertas = computed(() => {
    const concluidas = this.concluidas();
    const provasVencidas = this.prova.vencidas();
    const trilha = this.trilha();

    let abertas = 0;
    while (abertas < trilha.length) {
      const etapa = trilha[abertas]!;
      const anterior = trilha[abertas - 1];

      const trocouDeSessao = anterior !== undefined && anterior.areaId !== etapa.areaId;
      if (trocouDeSessao && !provasVencidas.has(anterior.areaId)) {
        break;
      }

      abertas++;

      if (!concluidas.has(etapa.topicoId)) {
        break;
      }
    }

    return abertas;
  });

  /** A etapa em que o jogador está agora, ou `null` se a trilha acabou. */
  readonly etapaAtual = computed<Etapa | null>(() => this.trilha()[this.etapasVencidas()] ?? null);

  readonly trilhaCompleta = computed(() => this.etapasVencidas() === this.trilha().length);

  /** Percentual da trilha concluído, para a barra geral. */
  readonly percentual = computed(() => {
    const total = this.trilha().length;
    return total === 0 ? 0 : Math.round((this.etapasVencidas() / total) * 100);
  });

  etapaDe(topicoId: string): Etapa | null {
    const trilha = this.trilha();
    return trilha[indiceNaTrilha(topicoId, trilha)] ?? null;
  }

  /** A etapa seguinte a esta na trilha. */
  proximaDe(topicoId: string): Etapa | null {
    const trilha = this.trilha();
    const indice = indiceNaTrilha(topicoId, trilha);
    return indice === -1 ? null : (trilha[indice + 1] ?? null);
  }

  estaConcluida(topicoId: string): boolean {
    return this.concluidas().has(topicoId);
  }

  /**
   * O tópico pode ser aberto?
   *
   * Vale para o que já foi vencido, para a etapa da vez e para qualquer coisa
   * fora da trilha (uma página que não seja um tópico). No modo livre, tudo.
   *
   * Um tópico tirado do plano também sai da trilha, e por isso fica aberto:
   * tirar é dizer «não preciso disto», não «não quero mais poder ver isto».
   */
  estaLiberada(topicoId: string): boolean {
    if (this.livre()) {
      return true;
    }

    const indice = indiceNaTrilha(topicoId, this.trilha());
    return indice === -1 || indice < this.etapasAbertas();
  }

  /** Como o tópico está em relação ao critério de domínio. */
  dominioEm(topicoId: string): Dominio {
    return dominioDe(
      this.progresso.historicoDe(topicoId),
      topicoId,
      this.progresso.porConceito(),
      this.configuracao.etapa(),
    );
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

  /** As quatro exigências do critério de domínio, cumpridas ou não. */
  exigenciasDe(topicoId: string): readonly ExigenciaDaEtapa[] {
    return exigenciasDaEtapa(this.dominioEm(topicoId));
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
    this.prova.limpar();
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
