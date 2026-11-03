import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { aceleracaoCentripeta, velocidadeAngular, velocidadeTangencial } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot, SegmentoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { geradorMovimentoCircular } from '@features/fisica/movimento-circular/movimento-circular.gerador';
import { TEORIA_MOVIMENTO_CIRCULAR } from '@features/fisica/movimento-circular/movimento-circular.teoria';

@Component({
  selector: 'app-movimento-circular',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './movimento-circular.html',
  styleUrl: './movimento-circular.scss',
})
export class MovimentoCircular {
  protected readonly gerador = geradorMovimentoCircular;
  protected readonly conceitos = TEORIA_MOVIMENTO_CIRCULAR.map((teoria) => teoria.id);

  /** O período em décimos de segundo, para permitir meias voltas. */
  protected readonly decimosDoPeriodo = signal(40);
  /** O raio em décimos de metro. */
  protected readonly decimosDoRaio = signal(20);
  protected readonly massa = signal(2);
  /** Em que fração da volta o ponto está, de 0 a 11 — doze posições. */
  protected readonly posicao = signal(2);

  protected readonly periodo = computed(() => this.decimosDoPeriodo() / 10);
  protected readonly raio = computed(() => this.decimosDoRaio() / 10);

  protected readonly omega = computed(() => velocidadeAngular(this.periodo()));
  protected readonly tangencial = computed(() => velocidadeTangencial(this.omega(), this.raio()));
  protected readonly centripeta = computed(() =>
    aceleracaoCentripeta(this.tangencial(), this.raio()),
  );
  protected readonly forca = computed(() => this.massa() * this.centripeta());
  protected readonly frequencia = computed(() => 1 / this.periodo());

  protected readonly angulo = computed(() => (this.posicao() / 12) * 2 * Math.PI);

  protected readonly ponto = computed(() => ({
    x: this.raio() * Math.cos(this.angulo()),
    y: this.raio() * Math.sin(this.angulo()),
  }));

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const r = this.raio();
    return [
      { fn: (x) => (Math.abs(x) <= r ? Math.sqrt(r * r - x * x) : Number.NaN), cor: 'texto-suave' },
      { fn: (x) => (Math.abs(x) <= r ? -Math.sqrt(r * r - x * x) : Number.NaN), cor: 'texto-suave' },
    ];
  });

  /** A velocidade é tangente; a aceleração aponta para o centro. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const { x, y } = this.ponto();
    const escala = this.raio() / Math.max(this.tangencial(), 0.001) / 2;
    const escalaA = this.raio() / Math.max(this.centripeta(), 0.001) / 2;

    return [
      {
        x1: x,
        y1: y,
        x2: x - y * this.omega() * escala,
        y2: y + x * this.omega() * escala,
        cor: 'serie-1',
        seta: true,
        rotulo: 'velocidade',
      },
      {
        x1: x,
        y1: y,
        x2: x - x * this.centripeta() * escalaA,
        y2: y - y * this.centripeta() * escalaA,
        cor: 'acento',
        seta: true,
        rotulo: 'aceleração',
      },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    { x: this.ponto().x, y: this.ponto().y, cor: 'serie-1' },
    { x: 0, y: 0, cor: 'texto-suave', rotulo: 'centro' },
  ]);

  protected readonly dominio = computed(() => {
    const alcance = this.raio() * 2.2;
    return { xMin: -alcance, xMax: alcance, yMin: -alcance, yMax: alcance };
  });

  protected readonly descricaoGrafico = computed(
    () =>
      'Circunferência com o ponto em movimento: a velocidade é sempre tangente, e a aceleração ' +
      'aponta sempre para o centro — por isso ela curva sem acelerar nem frear.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_MOVIMENTO_CIRCULAR);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
