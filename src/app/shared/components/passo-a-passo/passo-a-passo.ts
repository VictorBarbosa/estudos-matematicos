import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Passo } from '@core/math';
import { Formula } from '@shared/components/formula/formula';
import { MathTranslationsService } from '@core/math/translations/math-translations.service';

/**
 * Exibe a trilha de resolução devolvida pelo motor matemático.
 *
 * O mesmo componente serve à exploração do tópico e ao gabarito comentado do
 * treino. No treino, `passoDestacado` aponta a etapa em que a resposta do aluno
 * divergiu — é o que transforma "errado" em "errado aqui, por isto".
 */
@Component({
  selector: 'app-passo-a-passo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Formula],
  templateUrl: './passo-a-passo.html',
  styleUrl: './passo-a-passo.scss',
})
export class PassoAPasso {
  readonly passos = input.required<readonly Passo[]>();
  /** Índice da etapa a destacar, ou `null` para nenhuma. */
  readonly passoDestacado = input<number | null>(null);

  private readonly tradutor = inject(MathTranslationsService);

  /** Traduz a descrição de um passo para o idioma da interface. */
  traduzirDescricao(descricao: string): string {
    return this.tradutor.traduzir(descricao);
  }
}
