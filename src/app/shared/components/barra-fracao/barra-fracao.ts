import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Fracao } from '@core/math';
import { CorPlot, corCss } from '@shared/components/math-plot/models/math-plot.model';

/**
 * Representa uma fração como barra dividida em partes iguais.
 *
 * É a imagem que torna visível por que não se somam frações de denominadores
 * diferentes: as partes têm tamanhos distintos. Frações impróprias ocupam mais
 * de uma barra, o que mostra concretamente o que significa "passar do inteiro".
 */
@Component({
  selector: 'app-barra-fracao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './barra-fracao.html',
  styleUrl: './barra-fracao.scss',
})
export class BarraFracao {
  readonly fracao = input.required<Fracao>();
  readonly cor = input<CorPlot>('serie-1');
  readonly rotulo = input<string>();

  protected readonly corResolvida = computed(() => corCss(this.cor()));

  /**
   * Divide a fração em barras de um inteiro cada. Uma fração própria rende uma
   * barra parcialmente preenchida; 7/4 rende uma barra cheia e outra com 3/4.
   */
  protected readonly barras = computed(() => {
    const fracao = this.fracao();
    const numerador = Math.abs(fracao.numerador);
    const denominador = fracao.denominador;
    const quantidade = Math.max(1, Math.ceil(numerador / denominador));

    return Array.from({ length: quantidade }, (_, indice) => {
      const preenchidas = Math.max(0, Math.min(denominador, numerador - indice * denominador));
      return {
        total: denominador,
        partes: Array.from({ length: denominador }, (_, parte) => parte < preenchidas),
      };
    });
  });

  protected readonly descricaoAcessivel = computed(() => {
    const fracao = this.fracao();
    const prefixo = this.rotulo() ? `${this.rotulo()}: ` : '';
    return (
      `${prefixo}${fracao.numerador} de ${fracao.denominador} partes iguais, ` +
      `equivalente a ${fracao.paraDecimal().toLocaleString('pt-BR')}`
    );
  });
}
