import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { paraRadianos } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { CirculoTrigonometrico } from '@shared/components/circulo-trigonometrico/circulo-trigonometrico';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/math-plot.model';
import { geradorRazoes } from './seno-cosseno-tangente.gerador';
import { TEORIA_RAZOES } from './seno-cosseno-tangente.teoria';

@Component({
  selector: 'app-seno-cosseno-tangente',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    CirculoTrigonometrico,
    ConceitosTopico,
    ControleParametro,
    Formula,
    MathPlot,
    TopicoLayout,
  ],
  templateUrl: './seno-cosseno-tangente.html',
  styleUrl: './seno-cosseno-tangente.scss',
})
export class SenoCossenoTangente {
  protected readonly gerador = geradorRazoes;
  protected readonly conceitos = TEORIA_RAZOES.map((teoria) => teoria.id);

  protected readonly angulo = signal(60);

  protected readonly radianos = computed(() => paraRadianos(this.angulo()));

  protected readonly seno = computed(() => Math.sin(this.radianos()));
  protected readonly cosseno = computed(() => Math.cos(this.radianos()));

  protected readonly tangente = computed(() => {
    const cos = this.cosseno();
    return Math.abs(cos) < 1e-9 ? null : this.seno() / cos;
  });

  protected readonly complementar = computed(() => 90 - this.angulo());

  /** As três curvas no mesmo eixo, em graus para facilitar a leitura. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => [
    { fn: (graus) => Math.sin(paraRadianos(graus)), cor: 'serie-2', rotulo: 'seno' },
    { fn: (graus) => Math.cos(paraRadianos(graus)), cor: 'serie-1', rotulo: 'cosseno' },
    { fn: (graus) => Math.tan(paraRadianos(graus)), cor: 'serie-3', rotulo: 'tangente' },
  ]);

  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const marcados: PontoPlot[] = [
      { x: this.angulo(), y: this.seno(), cor: 'serie-2' },
      { x: this.angulo(), y: this.cosseno(), cor: 'serie-1' },
    ];

    const tangente = this.tangente();
    if (tangente !== null && Math.abs(tangente) <= 4) {
      marcados.push({ x: this.angulo(), y: tangente, cor: 'serie-3' });
    }

    return marcados;
  });

  protected readonly dominio = computed(() => ({
    xMin: -30,
    xMax: 390,
    yMin: -4,
    yMax: 4,
  }));

  protected readonly descricaoGrafico = computed(
    () =>
      'Seno, cosseno e tangente ao longo de uma volta completa. A tangente tem assíntotas ' +
      'verticais em 90 e 270 graus, onde o cosseno se anula.',
  );

  protected readonly perto90 = computed(() => Math.abs(this.cosseno()) < 0.1);

  constructor() {
    inject(TeoriaService).registrar(TEORIA_RAZOES);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
