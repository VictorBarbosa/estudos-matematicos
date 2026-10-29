import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { limiteNoInfinito } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, SegmentoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { geradorVizinhancas } from '@features/pre-calculo/vizinhancas-e-infinito/vizinhancas-e-infinito.gerador';
import { TEORIA_VIZINHANCAS } from '@features/pre-calculo/vizinhancas-e-infinito/vizinhancas-e-infinito.teoria';

@Component({
  selector: 'app-vizinhancas-e-infinito',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    ConceitosTopico,
    ControleParametro,
    Formula,
    MathPlot,
    TopicoLayout,
  ],
  templateUrl: './vizinhancas-e-infinito.html',
  styleUrl: './vizinhancas-e-infinito.scss',
})
export class VizinhancasEInfinito {
  protected readonly gerador = geradorVizinhancas;
  protected readonly conceitos = TEORIA_VIZINHANCAS.map((teoria) => teoria.id);

  /** Coeficientes de (ax + b)/(cx + d). */
  protected readonly a = signal(2);
  protected readonly b = signal(1);
  protected readonly c = signal(1);
  protected readonly d = signal(3);

  /** A margem ε do jogo épsilon-delta, em centésimos. */
  protected readonly epsilonEmCentesimos = signal(30);

  protected readonly epsilon = computed(() => this.epsilonEmCentesimos() / 100);

  protected readonly funcao = computed(() => {
    const [a, b, c, d] = [this.a(), this.b(), this.c(), this.d()];
    return (x: number) => (a * x + b) / (c * x + d);
  });

  protected readonly funcaoTex = computed(
    () => `f(x) = \\frac{${this.a()}x + ${this.b()}}{${this.c()}x + ${this.d()}}`,
  );

  /** A assíntota horizontal é a razão dos coeficientes líderes. */
  protected readonly assintotaHorizontal = computed(() => this.a() / this.c());

  /** A vertical fica onde o denominador zera. */
  protected readonly assintotaVertical = computed(() => -this.d() / this.c());

  protected readonly limiteInfinito = computed(() => limiteNoInfinito(this.funcao()));

  /** A partir de que x a função entra na faixa de largura ε em torno do limite. */
  protected readonly xSuficiente = computed(() => {
    const limite = this.assintotaHorizontal();
    const f = this.funcao();

    for (let x = 1; x < 1e7; x *= 1.5) {
      if (Math.abs(f(x) - limite) < this.epsilon()) {
        return x;
      }
    }
    return null;
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => [
    { fn: this.funcao(), cor: 'serie-1', rotulo: 'f(x)' },
  ]);

  /** A faixa de tolerância e as duas assíntotas. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const limite = this.assintotaHorizontal();
    const vertical = this.assintotaVertical();
    const { xMin, xMax } = this.dominio();

    return [
      { x1: xMin, y1: limite, x2: xMax, y2: limite, cor: 'acento' },
      {
        x1: xMin,
        y1: limite + this.epsilon(),
        x2: xMax,
        y2: limite + this.epsilon(),
        cor: 'serie-3',
        tracejado: true,
      },
      {
        x1: xMin,
        y1: limite - this.epsilon(),
        x2: xMax,
        y2: limite - this.epsilon(),
        cor: 'serie-3',
        tracejado: true,
      },
      {
        x1: vertical,
        y1: limite - 8,
        x2: vertical,
        y2: limite + 8,
        cor: 'erro',
        tracejado: true,
      },
    ];
  });

  protected readonly dominio = computed(() => {
    const limite = this.assintotaHorizontal();
    return { xMin: -20, xMax: 40, yMin: limite - 4, yMax: limite + 4 };
  });

  protected readonly descricaoGrafico = computed(
    () =>
      `Curva aproximando-se da assíntota horizontal y igual a ` +
      `${this.formatar(this.assintotaHorizontal())}, com a faixa de tolerância épsilon e a ` +
      `assíntota vertical destacadas.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_VIZINHANCAS);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
