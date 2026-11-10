import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { harmonicoComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/ondas-e-fisica-moderna/ondas-e-som/ondas-e-som.i18n.json';
import { geradorOndasESom } from '@features/ondas-e-fisica-moderna/ondas-e-som/ondas-e-som.gerador';
import { TEORIA_ONDAS_E_SOM } from '@features/ondas-e-fisica-moderna/ondas-e-som/ondas-e-som.teoria';

@Component({
  selector: 'app-ondas-e-som',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, MathPlot, PassoAPasso, TopicoLayout],
  templateUrl: './ondas-e-som.html',
  styleUrl: './ondas-e-som.scss',
})
export class OndasESom {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorOndasESom;
  protected readonly conceitos = TEORIA_ONDAS_E_SOM.map((teoria) => teoria.id);

  /** Ordem do harmônico, comprimento da corda em cm e velocidade da onda em m/s. */
  protected readonly ordem = signal(2);
  protected readonly comprimentoCm = signal(65);
  protected readonly velocidade = signal(286);

  private readonly comprimento = computed(() => Math.max(this.comprimentoCm(), 1) / 100);

  protected readonly resolucao = computed(() =>
    harmonicoComPassos(this.ordem(), this.comprimento(), this.velocidade()),
  );

  /** O envelope da onda estacionária: ±sen(nπx/L). */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const n = this.ordem();
    const L = this.comprimento();
    const forma = (x: number): number =>
      x < 0 || x > L ? Number.NaN : Math.sin((n * Math.PI * x) / L);
    return [
      { fn: forma, cor: 'serie-1', rotulo: this.texto('curvaCorda') },
      {
        fn: (x) => -forma(x),
        cor: 'serie-2',
        tracejada: true,
        rotulo: this.texto('curvaMeioPeriodo'),
      },
    ];
  });

  /** Os nós: pontos que nunca se movem. */
  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const n = this.ordem();
    const L = this.comprimento();
    return Array.from({ length: n + 1 }, (_, k) => ({
      x: (k * L) / n,
      y: 0,
      cor: 'acento' as const,
    }));
  });

  protected readonly dominio = computed(() => ({
    xMin: -0.05 * this.comprimento(),
    xMax: 1.05 * this.comprimento(),
    yMin: -1.6,
    yMax: 1.6,
  }));

  protected readonly frequencia = computed(() => this.resolucao().resultado);

  protected readonly descricaoGrafico = computed(() =>
    this.texto('descricaoGrafico', {
      n: String(this.ordem()),
      nos: String(this.ordem() + 1),
      f: this.formatar(this.frequencia()),
    }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_ONDAS_E_SOM);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
