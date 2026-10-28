import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Passo } from '@core/math';
import { Formula } from '@shared/components/formula/formula';

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
}
