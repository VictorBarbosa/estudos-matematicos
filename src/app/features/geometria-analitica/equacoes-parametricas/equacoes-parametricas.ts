import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  CurvaParametrica,
  cicloideParametrica,
  circunferenciaParametrica,
  elipseParametrica,
  lancamentoParametrico,
  retaParametrica,
  velocidadeParametricaComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { PontoPlot, SegmentoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { geradorEquacoesParametricas } from '@features/geometria-analitica/equacoes-parametricas/equacoes-parametricas.gerador';
import { TEORIA_PARAMETRICAS } from '@features/geometria-analitica/equacoes-parametricas/equacoes-parametricas.teoria';

@Component({
  selector: 'app-equacoes-parametricas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './equacoes-parametricas.html',
  styleUrl: './equacoes-parametricas.scss',
})
export class EquacoesParametricas {
  protected readonly gerador = geradorEquacoesParametricas;
  protected readonly conceitos = TEORIA_PARAMETRICAS.map((teoria) => teoria.id);

  protected readonly escolha = signal(1);
  /** O instante em centésimos, para que o traço avance suavemente. */
  protected readonly centesimosDoTempo = signal(300);
  protected readonly parametroA = signal(4);
  protected readonly parametroB = signal(2);

  protected readonly tempo = computed(() => this.centesimosDoTempo() / 100);

  protected readonly curva = computed<CurvaParametrica>(() => {
    const [a, b] = [this.parametroA(), this.parametroB()];

    switch (this.escolha()) {
      case 0:
        return retaParametrica(0, 0, a, b);
      case 1:
        return circunferenciaParametrica(0, 0, a);
      case 2:
        return elipseParametrica(a, b);
      case 3:
        return lancamentoParametrico(a * 5, 45);
      default:
        return cicloideParametrica(a);
    }
  });

  protected readonly sistemaTex = computed(
    () => `\\begin{cases} ${this.curva().xTex} \\\\ ${this.curva().yTex} \\end{cases}`,
  );

  protected readonly cartesianaTex = computed(() => this.curva().cartesianaTex);

  protected readonly posicao = computed(() => ({
    x: this.curva().x(this.tempo()),
    y: this.curva().y(this.tempo()),
  }));

  protected readonly rapidez = computed(
    () => velocidadeParametricaComPassos(this.curva(), this.tempo()).resultado,
  );

  /** O traço percorrido até agora, segmento a segmento. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const curva = this.curva();
    const ate = this.tempo();
    const passos = 120;
    const saida: SegmentoPlot[] = [];

    for (let i = 0; i < passos; i++) {
      const t1 = (ate * i) / passos;
      const t2 = (ate * (i + 1)) / passos;
      saida.push({
        x1: curva.x(t1),
        y1: curva.y(t1),
        x2: curva.x(t2),
        y2: curva.y(t2),
        cor: 'serie-1',
      });
    }

    return saida;
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    { x: this.posicao().x, y: this.posicao().y, cor: 'acento', rotulo: 'agora' },
  ]);

  protected readonly dominio = computed(() => {
    const alcance = Math.max(this.parametroA(), this.parametroB()) * 2.5 + 2;
    return { xMin: -alcance, xMax: alcance * 2, yMin: -alcance, yMax: alcance };
  });

  protected readonly descricaoGrafico = computed(
    () =>
      'A curva vai sendo traçada conforme o parâmetro avança, e o ponto em destaque marca onde ' +
      'o móvel está no instante escolhido.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_PARAMETRICAS);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
