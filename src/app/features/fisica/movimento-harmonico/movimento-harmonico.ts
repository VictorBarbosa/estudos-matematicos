import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { resolverOscilacaoComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, SegmentoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorMhs } from '@features/fisica/movimento-harmonico/movimento-harmonico.gerador';
import { TEORIA_MHS } from '@features/fisica/movimento-harmonico/movimento-harmonico.teoria';

@Component({
  selector: 'app-movimento-harmonico',
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
  templateUrl: './movimento-harmonico.html',
  styleUrl: './movimento-harmonico.scss',
})
export class MovimentoHarmonico {
  protected readonly gerador = geradorMhs;
  protected readonly conceitos = TEORIA_MHS.map((teoria) => teoria.id);

  /** Amplitude em décimos de metro, para permitir valores pequenos. */
  protected readonly amplitudeEmDecimos = signal(10);
  protected readonly constante = signal(8);
  protected readonly massa = signal(2);

  protected readonly amplitude = computed(() => this.amplitudeEmDecimos() / 10);

  protected readonly analise = computed(() =>
    resolverOscilacaoComPassos(this.amplitude(), this.constante(), this.massa()),
  );

  protected readonly oscilacao = computed(() => this.analise().resultado);

  protected readonly velocidadeMaxima = computed(
    () => this.amplitude() * this.oscilacao().frequenciaAngular,
  );

  protected readonly aceleracaoMaxima = computed(
    () => this.amplitude() * this.oscilacao().frequenciaAngular ** 2,
  );

  /** Posição, velocidade e aceleração sobrepostas, para ver as defasagens. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const A = this.amplitude();
    const w = this.oscilacao().frequenciaAngular;

    return [
      { fn: (t) => A * Math.cos(w * t), cor: 'serie-1', rotulo: 'posição' },
      { fn: (t) => -A * w * Math.sin(w * t), cor: 'serie-2', rotulo: 'velocidade' },
      {
        fn: (t) => -A * w * w * Math.cos(w * t),
        cor: 'serie-3',
        tracejada: true,
        rotulo: 'aceleração',
      },
    ];
  });

  /** Marca um período completo no eixo do tempo. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const altura = this.aceleracaoMaxima() * 1.1;
    const T = this.oscilacao().periodo;

    return [
      { x1: 0, y1: -altura, x2: 0, y2: altura, cor: 'texto-suave', tracejado: true },
      { x1: T, y1: -altura, x2: T, y2: altura, cor: 'texto-suave', tracejado: true },
    ];
  });

  protected readonly dominio = computed(() => {
    const limite = Math.max(this.aceleracaoMaxima(), this.velocidadeMaxima(), this.amplitude());
    return {
      xMin: -0.3,
      xMax: this.oscilacao().periodo * 2.2,
      yMin: -limite * 1.2,
      yMax: limite * 1.2,
    };
  });

  protected readonly descricaoGrafico = computed(
    () =>
      `Posição, velocidade e aceleração ao longo de dois períodos de ` +
      `${this.formatar(this.oscilacao().periodo)} segundos cada.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_MHS);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
