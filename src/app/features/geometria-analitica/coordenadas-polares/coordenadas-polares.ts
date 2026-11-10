import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { PontoPlot, SegmentoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/geometria-analitica/coordenadas-polares/coordenadas-polares.i18n.json';
import { geradorPolares } from '@features/geometria-analitica/coordenadas-polares/coordenadas-polares.gerador';
import { TEORIA_POLARES } from '@features/geometria-analitica/coordenadas-polares/coordenadas-polares.teoria';

@Component({
  selector: 'app-coordenadas-polares',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './coordenadas-polares.html',
  styleUrl: './coordenadas-polares.scss',
})
export class CoordenadasPolares {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorPolares;
  protected readonly conceitos = TEORIA_POLARES.map((teoria) => teoria.id);

  protected readonly r = signal(6);
  protected readonly theta = signal(135);

  private readonly radianos = computed(() => (this.theta() * Math.PI) / 180);
  protected readonly x = computed(() => this.r() * Math.cos(this.radianos()));
  protected readonly y = computed(() => this.r() * Math.sin(this.radianos()));

  protected readonly conversaoTex = computed(() => {
    const f = (v: number) => this.formatar(v).replace(',', '{,}');
    return (
      `(r, \\theta) = (${this.r()},\\; ${this.theta()}^{\\circ}) \\;\\to\\; ` +
      `(x, y) = (${f(this.x())},\\; ${f(this.y())})`
    );
  });

  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => [
    { x1: 0, y1: 0, x2: this.x(), y2: this.y(), cor: 'acerto', seta: true },
    { x1: this.x(), y1: 0, x2: this.x(), y2: this.y(), cor: 'serie-2', tracejado: true },
    { x1: 0, y1: this.y(), x2: this.x(), y2: this.y(), cor: 'serie-3', tracejado: true },
  ]);

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    {
      x: this.x(),
      y: this.y(),
      rotulo: `(${this.formatar(this.x())}; ${this.formatar(this.y())})`,
      cor: 'acento',
    },
  ]);

  protected readonly dominio = computed(() => {
    // Quadrado; o gráfico usa `mesmaEscala` para o ângulo desenhado ser o de verdade.
    const m = Math.max(4, this.r() + 1);
    return { xMin: -m, xMax: m, yMin: -m, yMax: m };
  });

  protected readonly descricaoGrafico = computed(() =>
    this.texto('descricaoGrafico', {
      r: String(this.r()),
      theta: String(this.theta()),
      x: this.formatar(this.x()),
      y: this.formatar(this.y()),
    }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_POLARES);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
