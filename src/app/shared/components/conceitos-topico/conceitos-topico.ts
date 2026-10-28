import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BotaoTeoria } from '@shared/components/botao-teoria/botao-teoria';

/** Rodapé com os conceitos do tópico, cada um abrindo seu popup de teoria. */
@Component({
  selector: 'app-conceitos-topico',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BotaoTeoria],
  templateUrl: './conceitos-topico.html',
  styleUrl: './conceitos-topico.scss',
})
export class ConceitosTopico {
  readonly conceitos = input.required<readonly string[]>();
  readonly etiqueta = input('Entenda a matemática:');
}
