import { Injectable, computed, effect, signal } from '@angular/core';
import { ModoCalculadora } from '@core/calculadora/models/calculadora.model';

const CHAVE = 'calculadora-matematica.modo.v1';
const MODOS: readonly ModoCalculadora[] = ['basica', 'cientifica', 'mmc-mdc', 'soma-produto'];

/**
 * O modo escolhido no menu.
 *
 * Mora fora da página porque quem o troca é o menu lateral, do outro lado da
 * árvore — e é lembrado entre aberturas pela mesma razão que a calculadora do
 * site lembra: quem usa a aba de MMC todo dia não quer reescolhê-la.
 */
@Injectable({ providedIn: 'root' })
export class ModoService {
  private readonly escolhido = signal<ModoCalculadora>(carregar());

  readonly modo = computed(() => this.escolhido());

  constructor() {
    effect(() => salvar(this.escolhido()));
  }

  definir(modo: ModoCalculadora): void {
    this.escolhido.set(modo);
  }
}

function carregar(): ModoCalculadora {
  try {
    const bruto = localStorage.getItem(CHAVE) as ModoCalculadora | null;
    return bruto !== null && MODOS.includes(bruto) ? bruto : 'basica';
  } catch {
    return 'basica';
  }
}

function salvar(modo: ModoCalculadora): void {
  try {
    localStorage.setItem(CHAVE, modo);
  } catch {
    // Sem armazenamento: vale só para esta sessão.
  }
}
