import { ChangeDetectionStrategy, Component, input, model, inject } from '@angular/core';
import { I18nService } from '@core/i18n/services/i18n.service';

let proximoId = 0;

/**
 * Controle numérico de um parâmetro: deslizante para explorar e campo para
 * precisão. Os dois editam o mesmo signal, via `model()`.
 */
@Component({
  selector: 'app-controle-parametro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './controle-parametro.html',
  styleUrl: './controle-parametro.scss',
})
export class ControleParametro {
  protected readonly i18n = inject(I18nService);

  readonly valor = model.required<number>();
  readonly rotulo = input.required<string>();
  readonly min = input(0);
  readonly max = input(10);
  readonly passo = input(1);
  readonly dica = input<string>();

  protected readonly id = `parametro-${proximoId++}`;

  protected aoDigitar(evento: Event): void {
    const bruto = (evento.target as HTMLInputElement).value;
    const numero = Number(bruto);

    // Campo vazio ou texto inválido: mantém o último valor válido em vez de
    // propagar NaN para o cálculo.
    if (bruto === '' || Number.isNaN(numero)) {
      return;
    }

    this.valor.set(Math.min(this.max(), Math.max(this.min(), numero)));
  }
}
