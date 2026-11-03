import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { BotaoTeoria } from '@shared/components/botao-teoria/botao-teoria';
import { I18nService } from '@core/i18n/services/i18n.service';

/** Rodapé com os conceitos do tópico, cada um abrindo seu popup de teoria. */
@Component({
  selector: 'app-conceitos-topico',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BotaoTeoria],
  templateUrl: './conceitos-topico.html',
  styleUrl: './conceitos-topico.scss',
})
export class ConceitosTopico {
  protected readonly i18n = inject(I18nService);

  readonly conceitos = input.required<readonly string[]>();
  /** O rótulo já traduzido; quem não passa nada recebe o texto padrão. */
  readonly etiqueta = input<string | null>(null);
}
