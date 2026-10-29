import { Injectable, computed, inject } from '@angular/core';
import { Etapa, TRILHA } from '@core/progressao/progressao.model';
import { ProgressaoService } from '@core/progressao/progressao.service';
import { TOPICO_DO_CONCEITO } from '@core/teoria/registro-teorias';
import { ProgressoService } from '@core/treino/progresso.service';

/** Quantos itens a fila de revisão traz por dia. */
export const ITENS_NA_FILA = 8;

/** Um dia em milissegundos, para medir o descanso de cada tópico. */
const UM_DIA = 24 * 60 * 60 * 1000;

/** Por que um tópico entrou na fila de hoje. */
export type MotivoRevisao = 'conceito-fragil' | 'descansado' | 'nunca-praticado';

export interface ItemRevisao {
  readonly etapa: Etapa;
  readonly motivo: MotivoRevisao;
  /** Conceitos deste tópico que vêm sendo errados. */
  readonly conceitosFrageis: readonly string[];
  /** Dias desde a última prática, ou `null` se nunca houve. */
  readonly diasSemPraticar: number | null;
  /** Quanto maior, mais urgente. Serve para ordenar a fila. */
  readonly prioridade: number;
}

/**
 * A fila de revisão do dia.
 *
 * Aprender um tópico e nunca voltar a ele é a forma mais eficiente de
 * esquecê-lo. A trilha, por si, empurra sempre para a frente: vencida a etapa,
 * ela não pede mais nada daquele assunto. Esta fila é o contrapeso — alguns
 * exercícios diários de matéria antiga, escolhidos por onde o esquecimento
 * está mais provável.
 *
 * A prioridade combina dois sinais que o `ProgressoService` já guarda:
 *
 * - **conceitos frágeis**: onde os erros se concentram, por conceito e não só
 *   por tópico;
 * - **tempo de descanso**: quanto mais dias sem praticar, mais urgente — é a
 *   parte "espaçada" da revisão.
 *
 * Nada aqui guarda estado novo: a fila é derivada e recalculada a cada
 * abertura, de modo que responder um exercício já muda a fila de amanhã.
 */
@Injectable({ providedIn: 'root' })
export class RevisaoService {
  private readonly progresso = inject(ProgressoService);
  private readonly progressao = inject(ProgressaoService);

  /** Tópicos candidatos: os que a trilha já liberou, menos a etapa da vez. */
  private readonly candidatos = computed<readonly Etapa[]>(() => {
    const concluidas = this.progressao.concluidas();
    return TRILHA.filter((etapa) => concluidas.has(etapa.topicoId));
  });

  /** A fila de hoje, da revisão mais urgente para a menos. */
  readonly fila = computed<readonly ItemRevisao[]>(() => {
    const agora = Date.now();
    const frageisPorTopico = this.frageisPorTopico();

    return this.candidatos()
      .map((etapa) => {
        const ultima = this.progresso.ultimaPraticaDe(etapa.topicoId);
        const diasSemPraticar =
          ultima === null ? null : Math.floor((agora - ultima) / UM_DIA);
        const conceitosFrageis = frageisPorTopico.get(etapa.topicoId) ?? [];

        const motivo: MotivoRevisao =
          conceitosFrageis.length > 0
            ? 'conceito-fragil'
            : ultima === null
              ? 'nunca-praticado'
              : 'descansado';

        return {
          etapa,
          motivo,
          conceitosFrageis,
          diasSemPraticar,
          // Cada conceito frágil pesa como uma semana de esquecimento: é o
          // sinal mais forte de que o assunto não ficou.
          prioridade: conceitosFrageis.length * 7 + (diasSemPraticar ?? 30),
        };
      })
      .sort((um, outro) => outro.prioridade - um.prioridade || um.etapa.numero - outro.etapa.numero)
      .slice(0, ITENS_NA_FILA);
  });

  /** Há matéria antiga suficiente para valer uma revisão? */
  readonly temRevisao = computed(() => this.fila().length > 0);

  /** Os conceitos frágeis de cada tópico, do pior para o menos pior. */
  private frageisPorTopico(): ReadonlyMap<string, readonly string[]> {
    const porTopico = new Map<string, string[]>();

    for (const conceito of this.progresso.conceitosFrageis()) {
      const topico = TOPICO_DO_CONCEITO[conceito.id];
      if (topico === undefined) {
        continue;
      }

      const lista = porTopico.get(topico) ?? [];
      lista.push(conceito.id);
      porTopico.set(topico, lista);
    }

    return porTopico;
  }
}
