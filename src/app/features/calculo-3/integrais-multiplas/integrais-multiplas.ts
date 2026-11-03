import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Quadrica, avaliarQuadrica, integralDuplaComPassos, quadricaParaTex } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { AreaPlot, CurvaPlot } from '@shared/components/math-plot/models/math-plot.model';
import { geradorIntegraisMultiplas } from '@features/calculo-3/integrais-multiplas/integrais-multiplas.gerador';
import { TEORIA_MULTIPLAS } from '@features/calculo-3/integrais-multiplas/integrais-multiplas.teoria';

@Component({
  selector: 'app-integrais-multiplas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './integrais-multiplas.html',
  styleUrl: './integrais-multiplas.scss',
})
export class IntegraisMultiplas {
  protected readonly gerador = geradorIntegraisMultiplas;
  protected readonly conceitos = TEORIA_MULTIPLAS.map((teoria) => teoria.id);

  protected readonly a = signal(1);
  protected readonly b = signal(1);
  protected readonly constante = signal(4);
  protected readonly x0 = signal(0);
  protected readonly x1 = signal(2);
  protected readonly y0 = signal(0);
  protected readonly y1 = signal(2);
  /** O y em que a integral interna é mostrada, fatia a fatia. */
  protected readonly yDaFatia = signal(1);

  protected readonly funcao = computed<Quadrica>(() => ({
    a: this.a(),
    b: this.b(),
    c: 0,
    d: 0,
    e: 0,
    f0: this.constante(),
  }));

  protected readonly funcaoTex = computed(() => `f(x,y) = ${quadricaParaTex(this.funcao())}`);

  protected readonly integral = computed(
    () =>
      integralDuplaComPassos(this.funcao(), this.x0(), this.x1(), this.y0(), this.y1())
        .resultado,
  );

  protected readonly area = computed(
    () => (this.x1() - this.x0()) * (this.y1() - this.y0()),
  );

  protected readonly media = computed(() => this.integral() / this.area());

  /** A integral da fatia atual: a integral interna, isolada. */
  protected readonly fatia = computed(() => {
    const q = this.funcao();
    const y = this.yDaFatia();
    const [x0, x1] = [this.x0(), this.x1()];

    return (
      (q.a * (x1 ** 3 - x0 ** 3)) / 3 +
      (q.b * y * y + q.f0) * (x1 - x0)
    );
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const q = this.funcao();
    return [
      {
        fn: (x) => avaliarQuadrica(q, x, this.yDaFatia()),
        cor: 'serie-1',
        rotulo: `fatia em y = ${this.yDaFatia()}`,
      },
    ];
  });

  protected readonly areas = computed<readonly AreaPlot[]>(() => {
    const q = this.funcao();
    return [
      {
        fn: (x) => avaliarQuadrica(q, x, this.yDaFatia()),
        de: this.x0(),
        ate: this.x1(),
        cor: 'acento',
      },
    ];
  });

  protected readonly dominio = computed(() => ({
    xMin: this.x0() - 1,
    xMax: this.x1() + 1,
    yMin: 0,
  }));

  protected readonly descricaoGrafico = computed(
    () =>
      `A fatia da superfície em y igual a ${this.yDaFatia()}, com a área sob ela destacada: é ` +
      'a integral interna, que depois será somada ao longo de y.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_MULTIPLAS);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
