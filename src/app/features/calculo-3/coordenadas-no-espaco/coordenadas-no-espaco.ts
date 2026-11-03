import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { cilindricasComPassos, esfericasComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot, SegmentoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { geradorCoordenadasNoEspaco } from '@features/calculo-3/coordenadas-no-espaco/coordenadas-no-espaco.gerador';
import { TEORIA_COORDENADAS } from '@features/calculo-3/coordenadas-no-espaco/coordenadas-no-espaco.teoria';

@Component({
  selector: 'app-coordenadas-no-espaco',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './coordenadas-no-espaco.html',
  styleUrl: './coordenadas-no-espaco.scss',
})
export class CoordenadasNoEspaco {
  protected readonly gerador = geradorCoordenadasNoEspaco;
  protected readonly conceitos = TEORIA_COORDENADAS.map((teoria) => teoria.id);

  protected readonly rho = signal(5);
  protected readonly phi = signal(60);
  protected readonly theta = signal(45);

  protected readonly radianosPhi = computed(() => (this.phi() * Math.PI) / 180);
  protected readonly radianosTheta = computed(() => (this.theta() * Math.PI) / 180);

  protected readonly x = computed(
    () => this.rho() * Math.sin(this.radianosPhi()) * Math.cos(this.radianosTheta()),
  );
  protected readonly y = computed(
    () => this.rho() * Math.sin(this.radianosPhi()) * Math.sin(this.radianosTheta()),
  );
  protected readonly z = computed(() => this.rho() * Math.cos(this.radianosPhi()));

  /** O r cilíndrico: distância ao EIXO, não à origem. */
  protected readonly rCilindrico = computed(() => Math.hypot(this.x(), this.y()));

  protected readonly esfericaTex = computed(
    () => esfericasComPassos(this.rho(), this.phi(), this.theta()).passos[1]!.tex,
  );

  protected readonly cilindricaTex = computed(
    () => cilindricasComPassos(this.rCilindrico(), this.theta(), this.z()).passos[1]!.tex,
  );

  /** A projeção no plano xy, vista de cima. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const r = this.rCilindrico();
    return [
      {
        fn: (x) => (Math.abs(x) <= r ? Math.sqrt(r * r - x * x) : Number.NaN),
        cor: 'texto-suave',
        rotulo: 'círculo de raio r',
      },
      { fn: (x) => (Math.abs(x) <= r ? -Math.sqrt(r * r - x * x) : Number.NaN), cor: 'texto-suave' },
    ];
  });

  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => [
    {
      x1: 0,
      y1: 0,
      x2: this.x(),
      y2: this.y(),
      cor: 'acento',
      seta: true,
      rotulo: 'projeção no plano',
    },
  ]);

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    { x: this.x(), y: this.y(), cor: 'acento', rotulo: 'projeção' },
    { x: 0, y: 0, cor: 'texto-suave', rotulo: 'eixo z' },
  ]);

  protected readonly dominio = computed(() => {
    const alcance = this.rho() * 1.3 + 1;
    return { xMin: -alcance, xMax: alcance, yMin: -alcance, yMax: alcance };
  });

  protected readonly descricaoGrafico = computed(
    () =>
      'Vista de cima: o círculo de raio igual à distância ao eixo, e a projeção do ponto sobre ' +
      'o plano xy.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_COORDENADAS);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
