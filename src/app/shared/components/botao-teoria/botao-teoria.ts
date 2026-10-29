import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TeoriaService } from '@core/teoria/services/teoria.service';

/**
 * Abre a explicação matemática de um conceito.
 *
 * Qualquer tela ganha o popup com uma linha:
 * `<app-botao-teoria conceito="fracoes.mmc" />`
 */
@Component({
  selector: 'app-botao-teoria',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './botao-teoria.html',
  styleUrl: './botao-teoria.scss',
})
export class BotaoTeoria {
  /** Id do conceito, no formato `topico.conceito`. */
  readonly conceito = input.required<string>();
  /** Rótulo alternativo; por padrão usa o título registrado do conceito. */
  readonly rotulo = input<string>();
  /** Versão de menor peso visual, para usar dentro de um parágrafo. */
  readonly discreto = input(false);

  private readonly teoria = inject(TeoriaService);

  protected readonly texto = computed(() => this.rotulo() ?? this.teoria.tituloDe(this.conceito()));

  protected abrir(): void {
    this.teoria.abrir(this.conceito());
  }
}
