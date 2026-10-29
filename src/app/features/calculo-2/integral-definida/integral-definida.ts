import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Polinomio, integralNumerica, somaDeRiemann } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { AreaPlot, CurvaPlot } from '@shared/components/math-plot/math-plot.model';
import { geradorDefinida } from './integral-definida.gerador';
import { TEORIA_DEFINIDA } from './integral-definida.teoria';

@Component({
  selector: 'app-integral-definida',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    ConceitosTopico,
    ControleParametro,
    Formula,
    MathPlot,
    TopicoLayout,
  ],
  templateUrl: './integral-definida.html',
  styleUrl: './integral-definida.scss',
})
export class IntegralDefinida {
  protected readonly gerador = geradorDefinida;
  protected readonly conceitos = TEORIA_DEFINIDA.map((teoria) => teoria.id);

  protected readonly a = signal(1);
  protected readonly b = signal(0);
  protected readonly c = signal(0);
  protected readonly de = signal(-1);
  protected readonly ate = signal(2);

  protected readonly funcao = computed(() => Polinomio.de(this.c(), this.b(), this.a()));

  protected readonly fn = computed(() => {
    const p = this.funcao();
    return (x: number) => p.avaliar(x);
  });

  /**
   * O valor da integral, por somas cada vez mais finas.
   *
   * Aqui a integral é apresentada como ela é definida — um limite de somas de
   * Riemann —, e não por F(b) − F(a): o Teorema Fundamental só aparece duas
   * etapas adiante na trilha, e usá-lo aqui era cobrar o que ainda não havia
   * sido ensinado.
   */
  protected readonly comSinal = computed(() =>
    integralNumerica(this.fn(), this.de(), this.ate()),
  );

  /** A convergência das somas de Riemann, para ver o limite acontecendo. */
  protected readonly convergencia = computed(() => {
    const fn = this.fn();
    const de = this.de();
    const ate = this.ate();

    return [4, 10, 50, 200, 1000].map((n) => ({
      n,
      valor: somaDeRiemann(fn, de, ate, n, 'trapezio'),
    }));
  });

  /** A área geométrica soma os módulos, separando pelos pontos onde f muda de sinal. */
  protected readonly areaGeometrica = computed(() =>
    integralNumerica((x) => Math.abs(this.fn()(x)), this.de(), this.ate()),
  );

  protected readonly difereDaArea = computed(
    () => Math.abs(this.areaGeometrica() - Math.abs(this.comSinal())) > 1e-6,
  );

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => [
    { fn: this.fn(), cor: 'serie-1', rotulo: 'f(x)' },
  ]);

  protected readonly areas = computed<readonly AreaPlot[]>(() => [
    { fn: this.fn(), de: this.de(), ate: this.ate(), cor: 'acento' },
  ]);

  protected readonly dominio = computed(() => {
    const folga = Math.max(1, (this.ate() - this.de()) * 0.3);
    return { xMin: this.de() - folga, xMax: this.ate() + folga };
  });

  protected readonly descricaoGrafico = computed(
    () =>
      `Região entre a curva e o eixo de ${this.de()} a ${this.ate()}, cuja área com sinal ` +
      `vale ${this.formatar(this.comSinal())}.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_DEFINIDA);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
