import { Injectable, computed, signal } from '@angular/core';
import { Teoria } from './teoria.model';

/**
 * Registro central dos conceitos e controle do modal de teoria.
 *
 * Cada tópico registra seus próprios conceitos ao ser carregado, de modo que o
 * conteúdo acompanha o código lazy-loaded da área e não pesa no bundle inicial.
 */
@Injectable({ providedIn: 'root' })
export class TeoriaService {
  private readonly registro = signal<ReadonlyMap<string, Teoria>>(new Map());
  private readonly idAberto = signal<string | null>(null);

  /** O conceito atualmente exibido no modal, ou `null` se ele estiver fechado. */
  readonly aberta = computed<Teoria | null>(() => {
    const id = this.idAberto();
    return id === null ? null : (this.registro().get(id) ?? null);
  });

  readonly estaAberta = computed(() => this.idAberto() !== null);

  /** Adiciona conceitos ao registro. Registrar duas vezes o mesmo id é inofensivo. */
  registrar(teorias: readonly Teoria[]): void {
    const atualizado = new Map(this.registro());
    for (const teoria of teorias) {
      atualizado.set(teoria.id, teoria);
    }
    this.registro.set(atualizado);
  }

  obter(id: string): Teoria | undefined {
    return this.registro().get(id);
  }

  /** Título do conceito, ou o próprio id caso ainda não tenha sido registrado. */
  tituloDe(id: string): string {
    return this.registro().get(id)?.titulo ?? id;
  }

  abrir(id: string): void {
    this.idAberto.set(id);
  }

  fechar(): void {
    this.idAberto.set(null);
  }
}
