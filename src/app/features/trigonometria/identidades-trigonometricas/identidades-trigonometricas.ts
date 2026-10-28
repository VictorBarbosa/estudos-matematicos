import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { paraRadianos } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot } from '@shared/components/math-plot/math-plot.model';
import { geradorIdentidades } from './identidades-trigonometricas.gerador';
import { TEORIA_IDENTIDADES } from './identidades-trigonometricas.teoria';

@Component({
  selector: 'app-identidades-trigonometricas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    ConceitosTopico,
    ControleParametro,
    Formula,
    MathPlot,
    TopicoLayout,
  ],
  templateUrl: './identidades-trigonometricas.html',
  styleUrl: './identidades-trigonometricas.scss',
})
export class IdentidadesTrigonometricas {
  protected readonly gerador = geradorIdentidades;
  protected readonly conceitos = TEORIA_IDENTIDADES.map((teoria) => teoria.id);

  protected readonly a = signal(30);
  protected readonly b = signal(60);

  private readonly radA = computed(() => paraRadianos(this.a()));
  private readonly radB = computed(() => paraRadianos(this.b()));

  /** Os dois lados da fórmula da soma, calculados separadamente. */
  protected readonly senoDaSoma = computed(() => Math.sin(this.radA() + this.radB()));
  protected readonly formulaSoma = computed(
    () =>
      Math.sin(this.radA()) * Math.cos(this.radB()) +
      Math.cos(this.radA()) * Math.sin(this.radB()),
  );

  /** O erro clássico, calculado ao lado para comparação direta. */
  protected readonly somaIngenua = computed(
    () => Math.sin(this.radA()) + Math.sin(this.radB()),
  );

  protected readonly cossenoDaSoma = computed(() => Math.cos(this.radA() + this.radB()));
  protected readonly formulaCosseno = computed(
    () =>
      Math.cos(this.radA()) * Math.cos(this.radB()) -
      Math.sin(this.radA()) * Math.sin(this.radB()),
  );

  protected readonly arcoDuplo = computed(() => ({
    direto: Math.sin(2 * this.radA()),
    formula: 2 * Math.sin(this.radA()) * Math.cos(this.radA()),
    ingenuo: 2 * Math.sin(this.radA()),
  }));

  /** A identidade fundamental desenhada: a soma dos quadrados é a reta y = 1. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => [
    {
      fn: (graus) => Math.sin(paraRadianos(graus)) ** 2,
      cor: 'serie-2',
      rotulo: 'sen²θ',
    },
    {
      fn: (graus) => Math.cos(paraRadianos(graus)) ** 2,
      cor: 'serie-1',
      rotulo: 'cos²θ',
    },
    {
      fn: (graus) =>
        Math.sin(paraRadianos(graus)) ** 2 + Math.cos(paraRadianos(graus)) ** 2,
      cor: 'acento',
      rotulo: 'soma = 1',
    },
  ]);

  protected readonly dominio = computed(() => ({
    xMin: 0,
    xMax: 360,
    yMin: -0.2,
    yMax: 1.4,
  }));

  protected readonly descricaoGrafico = computed(
    () =>
      'Quadrados do seno e do cosseno oscilando em oposição, e sua soma constante igual a 1.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_IDENTIDADES);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
