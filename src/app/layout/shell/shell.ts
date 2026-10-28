import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ROTULO_TEMA, TemaService } from '@core/tema/tema.service';
import { TeoriaDialog } from '@shared/components/teoria-dialog/teoria-dialog';
import { Sidebar } from '@layout/sidebar/sidebar';

/**
 * Moldura da aplicação: cabeçalho, navegação lateral, área de conteúdo e a
 * única instância do modal de teoria, disponível a partir de qualquer tela.
 */
@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterOutlet, Sidebar, TeoriaDialog],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  protected readonly tema = inject(TemaService);
  protected readonly rotuloTema = ROTULO_TEMA;

  /** Controla o menu lateral em telas estreitas. */
  protected readonly menuAberto = signal(false);

  protected alternarMenu(): void {
    this.menuAberto.update((aberto) => !aberto);
  }

  protected fecharMenu(): void {
    this.menuAberto.set(false);
  }
}
