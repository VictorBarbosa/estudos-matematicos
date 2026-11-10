import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/calculo-2/sequencias-e-series/sequencias-e-series.i18n.json';
import { geradorSequencias } from '@features/calculo-2/sequencias-e-series/sequencias-e-series.gerador';
import { TEORIA_SEQUENCIAS } from '@features/calculo-2/sequencias-e-series/sequencias-e-series.teoria';

/** As séries do painel: cada uma ilustra um teste, e duas divergem. */
interface SerieExemplo {
  readonly id: string;
  readonly tex: string;
  readonly termo: (n: number) => number;
  /** O limite das somas parciais, ou null quando a série diverge. */
  readonly soma: number | null;
  readonly somaTex: string;
}

const SERIES: readonly SerieExemplo[] = [
  {
    id: 'harmonica',
    tex: '\\sum \\frac{1}{n}',
    termo: (n) => 1 / n,
    soma: null,
    somaTex: '\\infty',
  },
  {
    id: 'basel',
    tex: '\\sum \\frac{1}{n^{2}}',
    termo: (n) => 1 / (n * n),
    soma: (Math.PI * Math.PI) / 6,
    somaTex: '\\frac{\\pi^{2}}{6} \\approx 1{,}645',
  },
  {
    id: 'alternada',
    tex: '\\sum \\frac{(-1)^{n+1}}{n}',
    termo: (n) => (n % 2 === 1 ? 1 : -1) / n,
    soma: Math.LN2,
    somaTex: '\\ln 2 \\approx 0{,}693',
  },
  {
    id: 'geometrica',
    tex: '\\sum \\left(\\frac{1}{2}\\right)^{n}',
    termo: (n) => 0.5 ** n,
    soma: 1,
    somaTex: '1',
  },
  {
    id: 'telescopica',
    tex: '\\sum \\frac{1}{n(n + 1)}',
    termo: (n) => 1 / (n * (n + 1)),
    soma: 1,
    somaTex: '1',
  },
  {
    id: 'raiz',
    tex: '\\sum \\frac{1}{\\sqrt{n}}',
    termo: (n) => 1 / Math.sqrt(n),
    soma: null,
    somaTex: '\\infty',
  },
];

@Component({
  selector: 'app-sequencias-e-series',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './sequencias-e-series.html',
  styleUrl: './sequencias-e-series.scss',
})
export class SequenciasESeries {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorSequencias;
  protected readonly conceitos = TEORIA_SEQUENCIAS.map((teoria) => teoria.id);
  protected readonly series = SERIES;

  protected readonly escolhida = signal<SerieExemplo>(SERIES[1]!);
  protected readonly quantidade = signal(30);

  /** S₁, S₂, …, Sₙ. */
  protected readonly parciais = computed(() => {
    const serie = this.escolhida();
    const somas: number[] = [];
    let acumulado = 0;
    for (let n = 1; n <= this.quantidade(); n++) {
      acumulado += serie.termo(n);
      somas.push(acumulado);
    }
    return somas;
  });

  protected readonly ultima = computed(() => this.parciais().at(-1) ?? 0);

  protected readonly pontos = computed<readonly PontoPlot[]>(() =>
    this.parciais().map((s, i) => ({ x: i + 1, y: s, cor: 'serie-1' })),
  );

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const soma = this.escolhida().soma;
    return soma === null
      ? []
      : [{ fn: () => soma, cor: 'serie-2', tracejada: true, rotulo: this.texto('limite') }];
  });

  protected readonly dominio = computed(() => {
    const somas = this.parciais();
    const soma = this.escolhida().soma;
    const valores = soma === null ? somas : [...somas, soma];
    const yMax = Math.max(...valores);
    const yMin = Math.min(0, ...valores);
    const folga = (yMax - yMin) * 0.12 || 1;
    return { xMin: 0, xMax: this.quantidade() + 1, yMin: yMin - folga, yMax: yMax + folga };
  });

  protected readonly somaParcialTex = computed(
    () =>
      `S_{${this.quantidade()}} = ${this.formatar(this.ultima()).replace(',', '{,}')} \\qquad ` +
      `\\lim S_n = ${this.escolhida().somaTex}`,
  );

  protected readonly descricaoGrafico = computed(() =>
    this.texto('descricaoGrafico', {
      n: String(this.quantidade()),
      s: this.formatar(this.ultima()),
    }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_SEQUENCIAS);
  }

  protected escolher(serie: SerieExemplo): void {
    this.escolhida.set(serie);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
