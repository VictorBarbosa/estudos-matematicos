import { Injectable, effect, signal } from '@angular/core';

export type Tema = 'sistema' | 'claro' | 'escuro';

const CHAVE = 'estudos-matematicos.tema';
const CICLO: readonly Tema[] = ['sistema', 'claro', 'escuro'];

export const ROTULO_TEMA: Readonly<Record<Tema, string>> = {
  sistema: 'Tema do sistema',
  claro: 'Tema claro',
  escuro: 'Tema escuro',
};

/**
 * Preferência de tema.
 *
 * O padrão é seguir o sistema; escolher claro ou escuro grava `data-tema` no
 * elemento raiz, que é o que os tokens de cor observam.
 */
@Injectable({ providedIn: 'root' })
export class TemaService {
  readonly tema = signal<Tema>(carregar());

  constructor() {
    effect(() => {
      const tema = this.tema();
      const raiz = document.documentElement;

      if (tema === 'sistema') {
        raiz.removeAttribute('data-tema');
      } else {
        raiz.setAttribute('data-tema', tema);
      }

      try {
        localStorage.setItem(CHAVE, tema);
      } catch {
        // Sem armazenamento, a escolha vale apenas para esta sessão.
      }
    });
  }

  /** Avança para a próxima opção: sistema → claro → escuro → sistema. */
  alternar(): void {
    const atual = CICLO.indexOf(this.tema());
    this.tema.set(CICLO[(atual + 1) % CICLO.length]!);
  }
}

function carregar(): Tema {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo === 'claro' || salvo === 'escuro' || salvo === 'sistema') {
      return salvo;
    }
  } catch {
    // Ignora e cai no padrão.
  }
  return 'sistema';
}
