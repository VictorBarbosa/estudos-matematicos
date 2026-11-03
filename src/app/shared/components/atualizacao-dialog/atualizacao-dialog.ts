import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { AtualizacaoService } from '@core/atualizacao/services/atualizacao.service';
import { I18nService } from '@core/i18n/services/i18n.service';

/**
 * Aviso de que saiu uma versão nova do site.
 *
 * Única instância, montada no shell. Usa o `<dialog>` nativo pelo mesmo motivo
 * do modal de teoria: `showModal()` entrega foco preso, backdrop e fechamento
 * por Esc sem nenhuma dependência.
 *
 * No estado irrecuperável — quando o cache quebrou e a aplicação não consegue
 * mais se montar — o X, o Esc e o clique fora somem. Não é teimosia: nesse
 * ponto não existe "mais tarde", porque a tela por trás do modal já não
 * funciona.
 */
@Component({
  selector: 'app-atualizacao-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './atualizacao-dialog.html',
  styleUrl: './atualizacao-dialog.scss',
})
export class AtualizacaoDialog {
  protected readonly i18n = inject(I18nService);

  protected readonly atualizacao = inject(AtualizacaoService);

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  protected readonly podeDispensar = computed(() => this.atualizacao.motivo() !== 'irrecuperavel');

  protected readonly titulo = computed(() =>
    this.i18n.t(
      this.podeDispensar() ? 'atualizacao.disponivel' : 'atualizacao.recarregar',
    ),
  );

  protected readonly descricao = computed(() =>
    this.podeDispensar()
      ? this.i18n.t('atualizacao.descricaoDisponivel')
      : this.i18n.t('atualizacao.descricaoIrrecuperavel'),
  );

  constructor() {
    effect(() => {
      const elemento = this.dialogo().nativeElement;
      const deveAbrir = this.atualizacao.disponivel();

      if (deveAbrir && !elemento.open) {
        // Onde `showModal` não existe — jsdom nos testes, navegadores antigos —
        // abrir como diálogo simples mantém o aviso acessível.
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

  /** Esc fecha o `<dialog>` nativo — menos quando não há o que adiar. */
  protected aoCancelar(evento: Event): void {
    if (!this.podeDispensar()) {
      evento.preventDefault();
    }
  }

  /**
   * O `<dialog>` nativo não fecha ao clicar no backdrop. Como o backdrop é o
   * próprio elemento, um clique cujo alvo é o dialog — e não o conteúdo dentro
   * dele — veio de fora da caixa.
   */
  protected aoClicar(evento: MouseEvent): void {
    if (evento.target === this.dialogo().nativeElement && this.podeDispensar()) {
      this.atualizacao.dispensar();
    }
  }
}
