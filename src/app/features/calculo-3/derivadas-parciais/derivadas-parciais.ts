import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  Quadrica,
  avaliarLinear2,
  avaliarQuadrica,
  linear2ParaTex,
  parcialX,
  parcialY,
  quadricaParaTex,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { geradorDerivadasParciais } from '@features/calculo-3/derivadas-parciais/derivadas-parciais.gerador';
import { TEORIA_PARCIAIS } from '@features/calculo-3/derivadas-parciais/derivadas-parciais.teoria';

@Component({
  selector: 'app-derivadas-parciais',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './derivadas-parciais.html',
  styleUrl: './derivadas-parciais.scss',
})
export class DerivadasParciais {
  protected readonly gerador = geradorDerivadasParciais;
  protected readonly conceitos = TEORIA_PARCIAIS.map((teoria) => teoria.id);

  protected readonly a = signal(2);
  protected readonly b = signal(1);
  protected readonly c = signal(3);
  protected readonly x = signal(1);
  protected readonly y = signal(1);

  protected readonly funcao = computed<Quadrica>(() => ({
    a: this.a(),
    b: this.b(),
    c: this.c(),
    d: 0,
    e: 0,
    f0: 0,
  }));

  protected readonly funcaoTex = computed(() => `f(x,y) = ${quadricaParaTex(this.funcao())}`);

  protected readonly parcialXTex = computed(
    () => `\\frac{\\partial f}{\\partial x} = ${linear2ParaTex(parcialX(this.funcao()))}`,
  );

  protected readonly parcialYTex = computed(
    () => `\\frac{\\partial f}{\\partial y} = ${linear2ParaTex(parcialY(this.funcao()))}`,
  );

  protected readonly fx = computed(() =>
    avaliarLinear2(parcialX(this.funcao()), this.x(), this.y()),
  );

  protected readonly fy = computed(() =>
    avaliarLinear2(parcialY(this.funcao()), this.x(), this.y()),
  );

  protected readonly fxx = computed(() => 2 * this.a());
  protected readonly fyy = computed(() => 2 * this.b());
  protected readonly fxy = computed(() => this.c());

  /** O corte em y fixo e a reta tangente a ele: a parcial, desenhada. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const q = this.funcao();
    const y = this.y();
    const x0 = this.x();
    const altura = avaliarQuadrica(q, x0, y);
    const inclinacao = this.fx();

    return [
      { fn: (x) => avaliarQuadrica(q, x, y), cor: 'serie-1', rotulo: `corte em y = ${y}` },
      {
        fn: (x) => altura + inclinacao * (x - x0),
        cor: 'acento',
        tracejada: true,
        rotulo: 'tangente, de inclinação ∂f/∂x',
      },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    { x: this.x(), y: avaliarQuadrica(this.funcao(), this.x(), this.y()), cor: 'acento' },
  ]);

  protected readonly dominio = computed(() => ({ xMin: -4, xMax: 4 }));

  protected readonly descricaoGrafico = computed(
    () =>
      'O corte da superfície com y fixo e a reta tangente a ele: a inclinação dessa reta é ' +
      'exatamente a derivada parcial em x.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_PARCIAIS);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
