import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { partesDoEnunciado } from '@core/enunciados/models/enunciado-em-partes';
import { Formula } from '@shared/components/formula/formula';

/**
 * O enunciado com a matemática desenhada.
 *
 * O enunciado do banco é texto puro, e a conta nele está escrita como no
 * teclado: `f(x) = (x + 1)/(x − 2)`. A barra engana — lê-se como divisão de duas
 * quantias, não como a fração que a questão pede. Aqui cada expressão vira
 * fórmula do KaTeX, e o resto continua texto, quebrando linha como texto.
 *
 * A separação mora em `partesDoEnunciado`, que é TypeScript puro e tem guarda
 * próprio: é lá que se decide o que é conta e o que é unidade (`km/h` não é
 * fração).
 */
@Component({
  selector: 'app-enunciado-rico',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Formula],
  template: `
    @for (parte of partes(); track $index) {
      @if (parte.tipo === 'texto') {
        {{ parte.valor }}
      } @else {
        <app-formula [tex]="parte.tex" />
      }
    }
  `,
  styles: `
    :host {
      display: inline;
    }
  `,
})
export class EnunciadoRico {
  readonly texto = input.required<string>();

  protected readonly partes = computed(() => partesDoEnunciado(this.texto()));
}
