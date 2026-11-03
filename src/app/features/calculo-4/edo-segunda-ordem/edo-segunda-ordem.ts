import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { avaliarSegundaOrdem, raizesCaracteristicas } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot } from '@shared/components/math-plot/models/math-plot.model';
import { geradorEdoSegundaOrdem } from '@features/calculo-4/edo-segunda-ordem/edo-segunda-ordem.gerador';
import { TEORIA_EDO2 } from '@features/calculo-4/edo-segunda-ordem/edo-segunda-ordem.teoria';

@Component({
  selector: 'app-edo-segunda-ordem',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './edo-segunda-ordem.html',
  styleUrl: './edo-segunda-ordem.scss',
})
export class EdoSegundaOrdem {
  protected readonly gerador = geradorEdoSegundaOrdem;
  protected readonly conceitos = TEORIA_EDO2.map((teoria) => teoria.id);

  /** O amortecimento em décimos, para atravessar o caso crítico sem saltos. */
  protected readonly decimosDeB = signal(20);
  protected readonly c = signal(25);
  protected readonly y0 = signal(1);
  protected readonly v0 = signal(0);

  protected readonly b = computed(() => this.decimosDeB() / 10);

  protected readonly discriminante = computed(() => this.b() ** 2 - 4 * this.c());

  protected readonly raizes = computed(() => raizesCaracteristicas(this.b(), this.c()));

  protected readonly regime = computed(() => this.raizes().regime);

  protected readonly periodo = computed(() =>
    this.raizes().regime === 'subamortecido'
      ? (2 * Math.PI) / this.raizes().imaginaria
      : Number.POSITIVE_INFINITY,
  );

  protected readonly equacaoTex = computed(
    () => `y'' + ${this.tex(this.b())}y' + ${this.tex(this.c())}y = 0`,
  );

  protected readonly caracteristicaTex = computed(
    () => `r^{2} + ${this.tex(this.b())}r + ${this.tex(this.c())} = 0`,
  );

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const raizes = this.raizes();
    const [y0, v0] = [this.y0(), this.v0()];

    const envoltoria = (sinal: number) => (t: number) =>
      sinal * Math.abs(y0 + 1) * Math.exp(raizes.real * t);

    return [
      {
        fn: (t) => avaliarSegundaOrdem(raizes, y0, v0, t),
        cor: 'acento',
        rotulo: 'solução',
      },
      ...(raizes.regime === 'subamortecido'
        ? [
            { fn: envoltoria(1), cor: 'texto-suave' as const, tracejada: true, rotulo: 'envoltória' },
            { fn: envoltoria(-1), cor: 'texto-suave' as const, tracejada: true },
          ]
        : []),
    ];
  });

  protected readonly dominio = computed(() => ({ xMin: 0, xMax: 12 }));

  protected readonly descricaoGrafico = computed(
    () =>
      `Solução no regime ${this.regime()}: a curva parte do valor inicial e, conforme o ` +
      'amortecimento, oscila ou volta direto ao repouso.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_EDO2);
  }

  protected formatar(valor: number): string {
    return Number.isFinite(valor)
      ? Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 })
      : 'não oscila';
  }

  private tex(valor: number): string {
    return String(Number(valor.toFixed(4))).replace('.', '{,}');
  }
}
