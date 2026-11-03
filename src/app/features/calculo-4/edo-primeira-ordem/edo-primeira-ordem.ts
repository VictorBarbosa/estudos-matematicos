import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot } from '@shared/components/math-plot/models/math-plot.model';
import { geradorEdoPrimeiraOrdem } from '@features/calculo-4/edo-primeira-ordem/edo-primeira-ordem.gerador';
import { TEORIA_EDO1 } from '@features/calculo-4/edo-primeira-ordem/edo-primeira-ordem.teoria';

@Component({
  selector: 'app-edo-primeira-ordem',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './edo-primeira-ordem.html',
  styleUrl: './edo-primeira-ordem.scss',
})
export class EdoPrimeiraOrdem {
  protected readonly gerador = geradorEdoPrimeiraOrdem;
  protected readonly conceitos = TEORIA_EDO1.map((teoria) => teoria.id);

  /** O coeficiente em décimos, para variar suavemente. */
  protected readonly decimosDeP = signal(5);
  protected readonly q = signal(10);
  protected readonly y0 = signal(2);

  protected readonly p = computed(() => this.decimosDeP() / 10);

  protected readonly equilibrio = computed(() => this.q() / this.p());
  protected readonly constanteDeTempo = computed(() => 1 / this.p());

  protected readonly equacaoTex = computed(
    () => `y' + ${this.tex(this.p())}y = ${this.tex(this.q())}`,
  );

  protected readonly solucaoTex = computed(
    () =>
      `y(t) = ${this.tex(this.equilibrio())} + \\left(${this.tex(this.y0())} - ` +
      `${this.tex(this.equilibrio())}\\right)e^{-${this.tex(this.p())}t}`,
  );

  protected readonly meiaVida = computed(() => Math.log(2) / this.p());

  /** A solução particular e, ao lado, outras da mesma família. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const [p, equilibrio] = [this.p(), this.equilibrio()];
    const solucao = (inicial: number) => (t: number) =>
      equilibrio + (inicial - equilibrio) * Math.exp(-p * t);

    return [
      { fn: () => equilibrio, cor: 'texto-suave', tracejada: true, rotulo: 'regime permanente' },
      { fn: solucao(this.y0()), cor: 'acento', rotulo: 'solução particular' },
      { fn: solucao(this.y0() + 15), cor: 'serie-2', rotulo: 'outra condição inicial' },
      { fn: solucao(Math.max(0, this.y0() - 15)), cor: 'serie-3', rotulo: 'mais uma' },
    ];
  });

  protected readonly dominio = computed(() => ({ xMin: 0, xMax: 10 / this.p() }));

  protected readonly descricaoGrafico = computed(
    () =>
      'Três soluções da mesma equação, partindo de valores iniciais diferentes: todas caminham ' +
      'para o mesmo regime permanente.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_EDO1);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }

  private tex(valor: number): string {
    return String(Number(valor.toFixed(4))).replace('.', '{,}');
  }
}
