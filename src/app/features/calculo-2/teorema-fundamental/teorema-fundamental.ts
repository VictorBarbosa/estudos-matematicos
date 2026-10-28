import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Polinomio, teoremaFundamentalComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { AreaPlot, CurvaPlot, PontoPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorTfc } from './teorema-fundamental.gerador';
import { TEORIA_TFC } from './teorema-fundamental.teoria';

@Component({
  selector: 'app-teorema-fundamental',
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
  templateUrl: './teorema-fundamental.html',
  styleUrl: './teorema-fundamental.scss',
})
export class TeoremaFundamental {
  protected readonly gerador = geradorTfc;
  protected readonly conceitos = TEORIA_TFC.map((teoria) => teoria.id);

  protected readonly a = signal(1);
  protected readonly b = signal(0);
  /** O limite superior, que desliza para mostrar a área acumulando. */
  protected readonly x = signal(2);

  protected readonly funcao = computed(() => Polinomio.de(0, this.b(), this.a()));
  protected readonly acumulada = computed(() => this.funcao().integrar(0));

  protected readonly analise = computed(() =>
    teoremaFundamentalComPassos(this.funcao(), 0, this.x()),
  );

  protected readonly areaAteX = computed(() => this.acumulada().avaliar(this.x()));

  /** A altura da curva no ponto, que é a derivada da área acumulada. */
  protected readonly alturaNoPonto = computed(() => this.funcao().avaliar(this.x()));

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const f = this.funcao();
    const area = this.acumulada();

    return [
      { fn: (t) => f.avaliar(t), cor: 'serie-1', rotulo: 'f(x)' },
      { fn: (t) => area.avaliar(t), cor: 'acento', rotulo: 'A(x) — área acumulada' },
    ];
  });

  protected readonly areas = computed<readonly AreaPlot[]>(() => [
    { fn: (t) => this.funcao().avaliar(t), de: 0, ate: this.x(), cor: 'serie-1' },
  ]);

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    {
      x: this.x(),
      y: this.areaAteX(),
      rotulo: `A(${this.x()}) = ${this.formatar(this.areaAteX())}`,
      cor: 'acento',
    },
    {
      x: this.x(),
      y: this.alturaNoPonto(),
      rotulo: `f(${this.x()}) = ${this.formatar(this.alturaNoPonto())}`,
      cor: 'serie-1',
    },
  ]);

  protected readonly dominio = computed(() => ({ xMin: -1, xMax: 5 }));

  protected readonly descricaoGrafico = computed(
    () =>
      `Curva e sua área acumulada. Em x igual a ${this.x()}, a área vale ` +
      `${this.formatar(this.areaAteX())} e a inclinação dessa curva de área é ` +
      `${this.formatar(this.alturaNoPonto())}, que é a altura da função.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_TFC);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
