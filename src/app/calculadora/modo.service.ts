import { Injectable, computed, effect, signal } from '@angular/core';
import { ModoCalculadora } from '@core/calculadora/models/calculadora.model';

/**
 * Os modos do aplicativo.
 *
 * `decimal-fracao` é só daqui, e por isso o tipo mora neste arquivo e não no
 * modelo: aquele é cópia literal do site, e recopiá-lo não pode apagar o que
 * é nosso.
 */
export type Modo = ModoCalculadora | 'decimal-fracao';

const CHAVE = 'calculadora-matematica.modo.v1';
const MODOS: readonly Modo[] = [
  'basica',
  'cientifica',
  'mmc-mdc',
  'soma-produto',
  'decimal-fracao',
];

/**
 * O modo escolhido no menu.
 *
 * Mora fora da página porque quem o troca é o menu lateral, do outro lado da
 * árvore — e é lembrado entre aberturas pela mesma razão que a calculadora do
 * site lembra: quem usa a aba de MMC todo dia não quer reescolhê-la.
 */
@Injectable({ providedIn: 'root' })
export class ModoService {
  private readonly escolhido = signal<Modo>(carregar());

  readonly modo = computed(() => this.escolhido());

  constructor() {
    effect(() => salvar(this.escolhido()));
  }

  definir(modo: Modo): void {
    this.escolhido.set(modo);
  }
}

function carregar(): Modo {
  try {
    const bruto = localStorage.getItem(CHAVE) as Modo | null;
    return bruto !== null && MODOS.includes(bruto) ? bruto : 'basica';
  } catch {
    return 'basica';
  }
}

function salvar(modo: Modo): void {
  try {
    localStorage.setItem(CHAVE, modo);
  } catch {
    // Sem armazenamento: vale só para esta sessão.
  }
}
