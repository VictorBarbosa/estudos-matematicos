import { Injectable, computed, signal } from '@angular/core';
import {
  CARREGAR_TEORIA_DO_TOPICO,
  TITULO_DO_CONCEITO,
  TOPICO_DO_CONCEITO,
} from '@core/teoria/registro-teorias/registro-teorias';
import { Teoria } from '@core/teoria/models/teoria.model';

/**
 * Registro central dos conceitos e controle do modal de teoria.
 *
 * Cada tópico registra seus próprios conceitos ao ser carregado, de modo que o
 * conteúdo acompanha o código lazy-loaded da área e não pesa no bundle inicial.
 *
 * Só que um link "Veja também" pode apontar para um conceito de OUTRO tópico —
 * 80 dos 483 links fazem isso. Antes, nesses casos o botão exibia o id cru
 * (`limite.intuicao`) e abria um modal vazio, porque a teoria do outro tópico
 * ainda não havia sido registrada. Por isso existe o índice gerado
 * {@link registro-teorias}: ele é pequeno (título e tópico de cada conceito) e
 * sabe carregar sob demanda a teoria que falta, sem trazer os 355 KB de teoria
 * para o bundle inicial.
 */
@Injectable({ providedIn: 'root' })
export class TeoriaService {
  private readonly registro = signal<ReadonlyMap<string, Teoria>>(new Map());
  private readonly idAberto = signal<string | null>(null);
  private readonly buscando = signal(false);

  /** Tópicos cuja teoria já foi pedida, para não importar duas vezes. */
  private readonly pedidos = new Set<string>();

  /** O conceito atualmente exibido no modal, ou `null` se ele estiver fechado. */
  readonly aberta = computed<Teoria | null>(() => {
    const id = this.idAberto();
    return id === null ? null : (this.registro().get(id) ?? null);
  });

  readonly estaAberta = computed(() => this.idAberto() !== null);

  /** O modal está aberto e o conteúdo ainda está sendo buscado. */
  readonly carregando = computed(() => this.buscando() && this.aberta() === null);

  /** Título do conceito aberto, disponível mesmo antes de a teoria chegar. */
  readonly tituloAberto = computed(() => {
    const id = this.idAberto();
    return id === null ? '' : this.tituloDe(id);
  });

  /** Adiciona conceitos ao registro. Registrar duas vezes o mesmo id é inofensivo. */
  registrar(teorias: readonly Teoria[]): void {
    const atualizado = new Map(this.registro());
    for (const teoria of teorias) {
      atualizado.set(teoria.id, teoria);
      const topico = TOPICO_DO_CONCEITO[teoria.id];
      if (topico !== undefined) {
        this.pedidos.add(topico);
      }
    }
    this.registro.set(atualizado);
  }

  obter(id: string): Teoria | undefined {
    return this.registro().get(id);
  }

  /**
   * Título do conceito.
   *
   * Vem do registro quando a teoria já está carregada e, antes disso, do
   * índice gerado. Só cai no próprio id se o conceito realmente não existir —
   * caso que um teste impede de chegar ao site.
   */
  tituloDe(id: string): string {
    return this.registro().get(id)?.titulo ?? TITULO_DO_CONCEITO[id] ?? id;
  }

  /** O conceito existe em algum tópico do site? */
  existe(id: string): boolean {
    return this.registro().has(id) || TOPICO_DO_CONCEITO[id] !== undefined;
  }

  abrir(id: string): void {
    this.idAberto.set(id);

    if (this.registro().has(id)) {
      return;
    }

    void this.carregar(id);
  }

  fechar(): void {
    this.idAberto.set(null);
    this.buscando.set(false);
  }

  /** Importa a teoria do tópico que define o conceito e a registra. */
  private async carregar(id: string): Promise<void> {
    const topico = TOPICO_DO_CONCEITO[id];
    const carregador = topico === undefined ? undefined : CARREGAR_TEORIA_DO_TOPICO[topico];

    if (topico === undefined || carregador === undefined || this.pedidos.has(topico)) {
      return;
    }

    this.pedidos.add(topico);
    this.buscando.set(true);

    try {
      this.registrar(await carregador());
    } catch {
      // Falha de rede no chunk: o modal mostra o título e um aviso, em vez de
      // ficar vazio para sempre.
      this.pedidos.delete(topico);
    } finally {
      this.buscando.set(false);
    }
  }
}
