import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { Formula } from '@shared/components/formula/formula';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';

/**
 * Modal com a explicação matemática de um conceito.
 *
 * Existe uma única instância, montada no shell, que exibe o conceito que o
 * `TeoriaService` tiver aberto. Usa o elemento `<dialog>` nativo: com
 * `showModal()` o navegador já entrega foco preso, fechamento por `Esc`,
 * backdrop e devolução do foco ao botão de origem — sem dependência externa.
 */
@Component({
  selector: 'app-teoria-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Formula, PassoAPasso],
  templateUrl: './teoria-dialog.html',
  styleUrl: './teoria-dialog.scss',
})
export class TeoriaDialog {
  protected readonly teoria = inject(TeoriaService);

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  constructor() {
    effect(() => {
      const elemento = this.dialogo().nativeElement;
      const deveAbrir = this.teoria.estaAberta();

      if (deveAbrir && !elemento.open) {
        // `showModal` é o que entrega foco preso, backdrop e fechamento por
        // Esc. Onde ele não existe — jsdom nos testes, navegadores antigos —
        // abrir como diálogo simples mantém o conteúdo acessível.
        if (typeof elemento.showModal === 'function') {
          elemento.showModal();
        } else {
          elemento.open = true;
        }
      } else if (!deveAbrir && elemento.open) {
        if (typeof elemento.close === 'function') {
          elemento.close();
        } else {
          elemento.open = false;
        }
      }
    });
  }

  /**
   * O `<dialog>` nativo não fecha ao clicar no backdrop. Como o backdrop é o
   * próprio elemento, um clique cujo alvo é o dialog — e não o conteúdo dentro
   * dele — veio de fora da caixa.
   */
  protected aoClicar(evento: MouseEvent): void {
    if (evento.target === this.dialogo().nativeElement) {
      this.teoria.fechar();
    }
  }
}
