import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { jurosCompostosComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorJuros } from '@features/funcoes/juros-compostos/juros-compostos.gerador';
import { TEORIA_JUROS } from '@features/funcoes/juros-compostos/juros-compostos.teoria';

@Component({
  selector: 'app-juros-compostos',
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
  templateUrl: './juros-compostos.html',
  styleUrl: './juros-compostos.scss',
})
export class JurosCompostos {
  protected readonly gerador = geradorJuros;
  protected readonly conceitos = TEORIA_JUROS.map((teoria) => teoria.id);

  protected readonly capital = signal(1000);
  protected readonly taxa = signal(10);
  protected readonly periodos = signal(10);

  protected readonly analise = computed(() =>
    jurosCompostosComPassos(this.capital(), this.taxa(), this.periodos()),
  );

  protected readonly montante = computed(() => this.analise().resultado);

  protected readonly simples = computed(
    () => this.capital() * (1 + (this.taxa() / 100) * this.periodos()),
  );

  protected readonly diferenca = computed(() => this.montante() - this.simples());

  protected readonly tempoParaDobrar = computed(
    () => Math.log(2) / Math.log(1 + this.taxa() / 100),
  );

  protected readonly regraDe72 = computed(() => 72 / this.taxa());

  /** As duas curvas: exponencial contra reta. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const c = this.capital();
    const i = this.taxa() / 100;

    return [
      { fn: (n) => c * (1 + i) ** n, cor: 'serie-1', rotulo: 'compostos' },
      { fn: (n) => c * (1 + i * n), cor: 'serie-2', tracejada: true, rotulo: 'simples' },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    {
      x: this.periodos(),
      y: this.montante(),
      rotulo: this.formatar(this.montante()),
      cor: 'acento',
    },
    {
      x: this.periodos(),
      y: this.simples(),
      rotulo: this.formatar(this.simples()),
      cor: 'serie-2',
    },
  ]);

  protected readonly dominio = computed(() => ({
    xMin: 0,
    xMax: this.periodos() * 1.15,
    yMin: 0,
    yMax: this.montante() * 1.15,
  }));

  protected readonly descricaoGrafico = computed(
    () =>
      `Crescimento do capital a juros compostos comparado aos simples, ao longo de ` +
      `${this.periodos()} períodos.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_JUROS);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  }
}
