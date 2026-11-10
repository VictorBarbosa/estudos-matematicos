import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { snellComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { SegmentoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/ondas-e-fisica-moderna/optica/optica.i18n.json';
import { geradorOptica } from '@features/ondas-e-fisica-moderna/optica/optica.gerador';
import { TEORIA_OPTICA } from '@features/ondas-e-fisica-moderna/optica/optica.teoria';

const RAIO = 4;

@Component({
  selector: 'app-optica',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, MathPlot, PassoAPasso, TopicoLayout],
  templateUrl: './optica.html',
  styleUrl: './optica.scss',
})
export class Optica {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorOptica;
  protected readonly conceitos = TEORIA_OPTICA.map((teoria) => teoria.id);

  /** Índices em centésimos (100 = 1,00) e o ângulo de incidência em graus. */
  protected readonly n1Centesimos = signal(150);
  protected readonly n2Centesimos = signal(100);
  protected readonly theta1 = signal(35);

  private readonly n1 = computed(() => Math.max(this.n1Centesimos(), 100) / 100);
  private readonly n2 = computed(() => Math.max(this.n2Centesimos(), 100) / 100);

  protected readonly resolucao = computed(() =>
    snellComPassos(this.n1(), this.theta1(), this.n2()),
  );
  protected readonly reflexaoTotal = computed(() => Number.isNaN(this.resolucao().resultado));

  /** Raio incidente (de cima), refratado (para baixo) ou refletido, e a normal. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const t1 = (this.theta1() * Math.PI) / 180;
    const incidente: SegmentoPlot = {
      x1: -RAIO * Math.sin(t1),
      y1: RAIO * Math.cos(t1),
      x2: 0,
      y2: 0,
      cor: 'serie-1',
      seta: true,
    };
    const normal: SegmentoPlot = {
      x1: 0,
      y1: -RAIO,
      x2: 0,
      y2: RAIO,
      cor: 'serie-3',
      tracejado: true,
    };
    if (this.reflexaoTotal()) {
      return [
        normal,
        incidente,
        { x1: 0, y1: 0, x2: RAIO * Math.sin(t1), y2: RAIO * Math.cos(t1), cor: 'erro', seta: true },
      ];
    }
    const t2 = (this.resolucao().resultado * Math.PI) / 180;
    return [
      normal,
      incidente,
      {
        x1: 0,
        y1: 0,
        x2: RAIO * Math.sin(t2),
        y2: -RAIO * Math.cos(t2),
        cor: 'acerto',
        seta: true,
      },
    ];
  });

  /** Proporção 1:1 para os ângulos desenhados serem os de verdade (o gráfico é ~2× mais largo). */
  protected readonly dominio = {
    xMin: -2 * (RAIO + 0.5),
    xMax: 2 * (RAIO + 0.5),
    yMin: -(RAIO + 0.5),
    yMax: RAIO + 0.5,
  };

  protected readonly descricaoGrafico = computed(() =>
    this.reflexaoTotal()
      ? this.texto('descricaoTotal', { theta: String(this.theta1()) })
      : this.texto('descricaoRefracao', {
          theta1: String(this.theta1()),
          theta2: this.formatar(this.resolucao().resultado),
        }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_OPTICA);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
