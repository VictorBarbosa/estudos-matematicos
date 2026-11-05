import { Injectable, computed, inject, signal } from '@angular/core';
import {
  EstadoDaProva,
  SESSOES,
  Sessao,
  sessaoDoTopico,
  sessaoPorId,
} from '@core/prova/models/prova.model';
import { ConfiguracaoService } from '@core/configuracao/services/configuracao.service';
import { dominioDe } from '@core/progressao/models/progressao.model';
import { ProgressoService } from '@core/treino/services/progresso.service';

const CHAVE = 'estudos-matematicos.provas.v1';

interface EstadoDasProvas {
  readonly versao: 1;
  /** Ids das sessões cuja prova final já foi passada. */
  readonly vencidas: readonly string[];
}

/**
 * Quais provas de fim de sessão já foram passadas.
 *
 * É o único estado novo que a prova introduz. Tudo o mais — se a sessão está
 * cumprida, quanto falta em cada etapa — continua sendo derivado do histórico
 * de tentativas que o progresso já guarda.
 *
 * Este serviço não conhece a `ProgressaoService`, e isso é deliberado: é a
 * progressão que depende dele, para trancar a sessão seguinte enquanto a prova
 * não passa. Inverter a dependência fecharia um ciclo.
 */
@Injectable({ providedIn: 'root' })
export class ProvaService {
  private readonly progresso = inject(ProgressoService);
  private readonly configuracao = inject(ConfiguracaoService);
  private readonly estado = signal<EstadoDasProvas>(carregar());

  readonly sessoes = SESSOES;

  /** Sessões cuja prova já foi passada. */
  readonly vencidas = computed(() => new Set(this.estado().vencidas));

  /**
   * Sessões com todas as etapas vencidas.
   *
   * Usa a mesma conta de domínio das etapas, lida do mesmo histórico — a prova
   * não acrescenta critério nenhum para decidir quando ela fica disponível.
   */
  readonly cumpridas = computed(() => {
    const historicos = this.progresso.porHistorico();
    const conceitos = this.progresso.porConceito();

    return new Set(
      SESSOES.filter((sessao) =>
        sessao.topicoIds.every(
          (topicoId) =>
            dominioDe(historicos[topicoId] ?? [], topicoId, conceitos, this.configuracao.etapa())
              .vencido,
        ),
      ).map((sessao) => sessao.id),
    );
  });

  /**
   * A prova que trava a trilha agora, ou `null`.
   *
   * É a primeira sessão cumprida cuja prova ainda não passou. Na ordem do
   * currículo só pode haver uma delas de cada vez, porque a sessão seguinte
   * fica trancada — salvo no modo livre, em que a primeira continua sendo a
   * resposta certa para "o que fazer agora".
   */
  readonly pendente = computed<Sessao | null>(() => {
    const cumpridas = this.cumpridas();
    const vencidas = this.vencidas();

    return SESSOES.find((sessao) => cumpridas.has(sessao.id) && !vencidas.has(sessao.id)) ?? null;
  });

  estadoDe(sessaoId: string): EstadoDaProva {
    if (this.vencidas().has(sessaoId)) {
      return 'vencida';
    }

    return this.cumpridas().has(sessaoId) ? 'disponivel' : 'trancada';
  }

  venceu(sessaoId: string): boolean {
    return this.vencidas().has(sessaoId);
  }

  /** A prova desta sessão está liberada para ser feita agora? */
  estaDisponivel(sessaoId: string): boolean {
    return this.estadoDe(sessaoId) === 'disponivel';
  }

  /** A prova da sessão a que o tópico pertence já foi passada? */
  venceuASessaoDo(topicoId: string): boolean {
    const sessao = sessaoDoTopico(topicoId);
    return sessao !== null && this.venceu(sessao.id);
  }

  /** Registra a aprovação, que é o que destranca a sessão seguinte. */
  aprovar(sessaoId: string): void {
    if (this.vencidas().has(sessaoId)) {
      return;
    }

    this.guardar({ versao: 1, vencidas: [...this.estado().vencidas, sessaoId] });
  }

  /**
   * Zera a sessão inteira.
   *
   * Apaga o desempenho de todos os tópicos dela — e também a aprovação, se por
   * algum caminho ela existisse —, de modo que a sessão volte a ser o que era
   * antes do primeiro exercício.
   */
  reprovar(sessaoId: string): void {
    const sessao = sessaoPorId(sessaoId);
    if (sessao === null) {
      return;
    }

    this.progresso.limparTopicos(sessao.topicoIds);
    this.guardar({
      versao: 1,
      vencidas: this.estado().vencidas.filter((id) => id !== sessaoId),
    });
  }

  /** Esquece todas as aprovações. Chamado ao recomeçar a trilha do zero. */
  limpar(): void {
    this.estado.set({ versao: 1, vencidas: [] });

    try {
      localStorage.removeItem(CHAVE);
    } catch {
      // Sem armazenamento não há o que limpar.
    }
  }

  private guardar(novo: EstadoDasProvas): void {
    this.estado.set(novo);

    try {
      localStorage.setItem(CHAVE, JSON.stringify(novo));
    } catch {
      // Janela privada: a aprovação vale só para esta sessão do navegador.
    }
  }
}

function carregar(): EstadoDasProvas {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto === null) {
      return { versao: 1, vencidas: [] };
    }

    const lido = JSON.parse(bruto) as Partial<EstadoDasProvas>;
    const vencidas = Array.isArray(lido.vencidas)
      ? lido.vencidas.filter((id): id is string => typeof id === 'string')
      : [];

    return { versao: 1, vencidas };
  } catch {
    return { versao: 1, vencidas: [] };
  }
}
