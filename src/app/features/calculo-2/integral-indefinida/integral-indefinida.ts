import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Polinomio, integrarPolinomioComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorIndefinida } from './integral-indefinida.gerador';
import { TEORIA_INDEFINIDA } from './integral-indefinida.teoria';

@Component({
  selector: 'app-integral-indefinida',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    ConceitosTopico,
    ControleParametro,
    Formula,
    MathPlot,
    PassoAPasso,
    TopicoLayout,
  ],
  templateUrl: './integral-indefinida.html',
  styleUrl: './integral-indefinida.scss',
})
export class IntegralIndefinida {
  protected readonly gerador = geradorIndefinida;
  protected readonly conceitos = TEORIA_INDEFINIDA.map((teoria) => teoria.id);

  protected readonly a = signal(3);
  protected readonly b = signal(-2);
  protected readonly c = signal(1);

  /** A constante escolhida, para ver a família de primitivas. */
  protected readonly constante = signal(0);

  protected readonly integrando = computed(() =>
    Polinomio.de(this.c(), this.b(), this.a()),
  );

  protected readonly primitiva = computed(() => this.integrando().integrar(this.constante()));

  protected readonly analise = computed(() => integrarPolinomioComPassos(this.integrando()));

  /** Conferência: derivar a primitiva devolve o integrando. */
  protected readonly conferencia = computed(() => this.primitiva().derivar());

  /** Fórmulas longas montadas aqui para manter o template legível. */
  protected readonly integralTex = computed(
    () =>
      String.raw`\int \left(${this.integrando().paraTex()}\right) dx = ` +
      `${this.integrando().integrar(0).paraTex()} + C`,
  );

  protected readonly conferenciaTex = computed(
    () =>
      String.raw`\frac{d}{dx}\left(${this.primitiva().paraTex()}\right) = ` +
      this.conferencia().paraTex(),
  );

  protected readonly confere = computed(
    () => this.conferencia().paraTex() === this.integrando().paraTex(),
  );

  /**
   * Várias primitivas, uma para cada C.
   *
   * Todas têm exatamente a mesma inclinação em cada x — é isso que significa
   * terem a mesma derivada.
   */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const base = this.integrando().integrar(0);
    const escolhida = this.constante();

    const familia: CurvaPlot[] = [-6, -3, 0, 3, 6]
      .filter((c) => c !== escolhida)
      .map((c) => ({
        fn: (x: number) => base.avaliar(x) + c,
        cor: 'texto-suave' as const,
        tracejada: true,
      }));

    return [
      ...familia,
      {
        fn: (x) => base.avaliar(x) + escolhida,
        cor: 'acento',
        rotulo: `F(x) com C = ${escolhida}`,
      },
      { fn: (x) => this.integrando().avaliar(x), cor: 'serie-1', rotulo: 'integrando f(x)' },
    ];
  });

  protected readonly dominio = computed(() => ({ xMin: -3, xMax: 3 }));

  protected readonly descricaoGrafico = computed(
    () =>
      'Família de primitivas, todas paralelas entre si, junto do integrando. Mudar a ' +
      'constante desloca a curva verticalmente sem alterar sua inclinação.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_INDEFINIDA);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
