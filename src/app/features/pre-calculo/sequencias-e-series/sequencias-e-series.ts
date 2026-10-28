import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { somaComPassos, somaInfinitaComPassos, somasParciais, termosIniciais } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { PontoPlot, SegmentoPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorSequencias } from './sequencias-e-series.gerador';
import { TEORIA_SEQUENCIAS } from './sequencias-e-series.teoria';

@Component({
  selector: 'app-sequencias-e-series',
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
  templateUrl: './sequencias-e-series.html',
  styleUrl: './sequencias-e-series.scss',
})
export class SequenciasESeries {
  protected readonly gerador = geradorSequencias;
  protected readonly conceitos = TEORIA_SEQUENCIAS.map((teoria) => teoria.id);

  protected readonly primeiro = signal(1);
  /** A razão é controlada em décimos, para permitir valores entre 0 e 1. */
  protected readonly razaoEmDecimos = signal(5);
  protected readonly geometrica = signal(true);
  protected readonly quantidade = signal(8);

  protected readonly razao = computed(() =>
    this.geometrica() ? this.razaoEmDecimos() / 10 : this.razaoEmDecimos(),
  );

  protected readonly progressao = computed(() => ({
    primeiro: this.primeiro(),
    razao: this.razao(),
    geometrica: this.geometrica(),
  }));

  protected readonly termos = computed(() =>
    termosIniciais(this.progressao(), this.quantidade()),
  );

  protected readonly parciais = computed(() =>
    somasParciais(this.progressao(), this.quantidade()),
  );

  protected readonly soma = computed(() =>
    somaComPassos(this.progressao(), this.quantidade()),
  );

  protected readonly infinita = computed(() =>
    this.geometrica() ? somaInfinitaComPassos(this.primeiro(), this.razao()) : null,
  );

  protected readonly converge = computed(
    () => this.geometrica() && Math.abs(this.razao()) < 1,
  );

  protected readonly formulaTex = computed(() =>
    this.geometrica()
      ? `a_n = ${this.primeiro()} \\cdot ${formatar(this.razao())}^{\\,n-1}`
      : `a_n = ${this.primeiro()} + (n-1) \\cdot ${formatar(this.razao())}`,
  );

  /** Termos e somas parciais lado a lado, para ver a convergência. */
  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    ...this.termos().map((valor, indice) => ({
      x: indice + 1,
      y: valor,
      cor: 'serie-2' as const,
    })),
    ...this.parciais().map((valor, indice) => ({
      x: indice + 1,
      y: valor,
      cor: 'acento' as const,
    })),
  ]);

  /** A reta do limite, quando a série converge. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const infinita = this.infinita();
    if (infinita === null || infinita.resultado === null) {
      return [];
    }

    return [
      {
        x1: 0,
        y1: infinita.resultado,
        x2: this.quantidade() + 1,
        y2: infinita.resultado,
        cor: 'serie-3',
        tracejado: true,
      },
    ];
  });

  protected readonly dominio = computed(() => {
    const valores = [...this.termos(), ...this.parciais()];
    const minimo = Math.min(0, ...valores);
    const maximo = Math.max(...valores);
    const folga = Math.max(1, (maximo - minimo) * 0.15);

    return {
      xMin: 0,
      xMax: this.quantidade() + 1,
      yMin: minimo - folga,
      yMax: maximo + folga,
    };
  });

  protected readonly descricaoGrafico = computed(
    () =>
      `Termos da progressão e somas parciais acumuladas` +
      (this.converge() ? ', com a reta do limite da série infinita.' : '.'),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_SEQUENCIAS);
  }

  protected alternarTipo(geometrica: boolean): void {
    this.geometrica.set(geometrica);
    // As faixas úteis de razão são bem diferentes nos dois casos.
    this.razaoEmDecimos.set(geometrica ? 5 : 3);
  }

  protected formatar(valor: number): string {
    return formatar(valor);
  }
}

function formatar(valor: number): string {
  return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
}
