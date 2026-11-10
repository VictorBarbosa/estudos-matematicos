import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { cargaRcComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import {
  CurvaPlot,
  PontoPlot,
  SegmentoPlot,
} from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/eletromagnetismo/circuitos/circuitos.i18n.json';
import { geradorCircuitos } from '@features/eletromagnetismo/circuitos/circuitos.gerador';
import { TEORIA_CIRCUITOS } from '@features/eletromagnetismo/circuitos/circuitos.teoria';

@Component({
  selector: 'app-circuitos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, MathPlot, PassoAPasso, TopicoLayout],
  templateUrl: './circuitos.html',
  styleUrl: './circuitos.scss',
})
export class Circuitos {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorCircuitos;
  protected readonly conceitos = TEORIA_CIRCUITOS.map((teoria) => teoria.id);

  /** R em kΩ, C em μF, V em volts, t em décimos de segundo. */
  protected readonly r = signal(10);
  protected readonly c = signal(100);
  protected readonly v = signal(9);
  protected readonly decimos = signal(10);

  protected readonly tau = computed(() => (Math.max(1, this.r()) * Math.max(1, this.c())) / 1000);
  protected readonly t = computed(() => this.decimos() / 10);

  protected readonly resolucao = computed(() =>
    cargaRcComPassos(Math.max(1, this.r()), Math.max(1, this.c()), this.v(), this.t()),
  );

  protected readonly cargaFinal = computed(() => Math.max(1, this.c()) * this.v());
  protected readonly percentual = computed(() =>
    this.cargaFinal() === 0 ? 0 : (100 * this.resolucao().resultado) / this.cargaFinal(),
  );

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const q = this.cargaFinal();
    const tau = this.tau();
    return [
      {
        fn: (x) => (x < 0 ? NaN : q * (1 - Math.exp(-x / tau))),
        cor: 'serie-1',
        rotulo: this.texto('curvaCarga'),
      },
      { fn: () => q, cor: 'serie-2', tracejada: true, rotulo: this.texto('curvaFinal') },
    ];
  });

  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => [
    {
      x1: this.tau(),
      y1: 0,
      x2: this.tau(),
      y2: this.cargaFinal() * (1 - Math.exp(-1)),
      cor: 'serie-3',
      tracejado: true,
      rotulo: 'τ',
    },
  ]);

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    {
      x: this.t(),
      y: this.resolucao().resultado,
      rotulo: `${this.formatar(this.resolucao().resultado)} μC`,
      cor: 'acento',
    },
  ]);

  protected readonly dominio = computed(() => ({
    xMin: 0,
    xMax: Math.max(5 * this.tau(), this.t() * 1.1, 0.5),
    yMin: 0,
    yMax: Math.max(this.cargaFinal() * 1.15, 1),
  }));

  protected readonly descricaoGrafico = computed(() =>
    this.texto('descricaoGrafico', {
      tau: this.formatar(this.tau()),
      t: this.formatar(this.t()),
      q: this.formatar(this.resolucao().resultado),
    }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_CIRCUITOS);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
