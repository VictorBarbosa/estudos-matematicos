import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { partesDoEnunciado } from '@core/enunciados/models/enunciado-em-partes';
import { pedacosComTermos } from '@core/enunciados/glossario/termos-do-enunciado';
import { I18nService } from '@core/i18n/services/i18n.service';
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
        @for (pedaco of pedacos(parte.valor); track $index) {
          @if (pedaco.definicao) {
            <abbr class="termo" [title]="pedaco.definicao">{{ pedaco.valor }}</abbr>
          } @else {
            {{ pedaco.valor }}
          }
        }
      } @else {
        <app-formula [tex]="parte.tex" />
      }
    }
  `,
  styles: `
    :host {
      display: inline;
    }

    /*
     * O termo explicado se anuncia, e discretamente.
     *
     * Um pontilhado embaixo é o que diz «há algo aqui» sem competir com a
     * pergunta; o cursor de ajuda confirma. Em toque, a dica do navegador não
     * abre — por isso a explicação nunca é necessária para resolver, só para
     * entender.
     */
    .termo {
      text-decoration: underline dotted;
      text-underline-offset: 0.2em;
      cursor: help;
    }
  `,
})
export class EnunciadoRico {
  readonly texto = input.required<string>();

  private readonly i18n = inject(I18nService);

  protected readonly partes = computed(() => partesDoEnunciado(this.texto()));

  /**
   * Os pedaços de um trecho de texto, com os termos do glossário marcados.
   *
   * Lê o idioma da tela porque a palavra a reconhecer muda com ela: em
   * francês o aluno vê «abscisse», e é essa que tem de ganhar a explicação.
   */
  protected pedacos(valor: string) {
    return pedacosComTermos(valor, this.i18n.idioma());
  }
}
