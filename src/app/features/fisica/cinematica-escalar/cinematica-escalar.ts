import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  deslocamentoPorAreaComPassos,
  movimentoUniformementeVariado,
  torricelliComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { AreaPlot, CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorCinematica } from '@features/fisica/cinematica-escalar/cinematica-escalar.gerador';
import { TEORIA_CINEMATICA } from '@features/fisica/cinematica-escalar/cinematica-escalar.teoria';

@Component({
  selector: 'app-cinematica-escalar',
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
  templateUrl: './cinematica-escalar.html',
  styleUrl: './cinematica-escalar.scss',
})
export class CinematicaEscalar {
  protected readonly gerador = geradorCinematica;
  protected readonly conceitos = TEORIA_CINEMATICA.map((teoria) => teoria.id);

  protected readonly velocidadeInicial = signal(6);
  protected readonly aceleracao = signal(2);
  protected readonly instante = signal(4);

  protected readonly estado = computed(() =>
    movimentoUniformementeVariado(0, this.velocidadeInicial(), this.aceleracao(), this.instante()),
  );

  protected readonly analiseArea = computed(() =>
    deslocamentoPorAreaComPassos(this.velocidadeInicial(), this.aceleracao(), this.instante()),
  );

  protected readonly torricelli = computed(() => {
    try {
      return torricelliComPassos(
        this.velocidadeInicial(),
        this.aceleracao(),
        this.estado().posicao,
      );
    } catch {
      return null;
    }
  });

  protected readonly velocidadeTex = computed(
    () =>
      `v = ${this.velocidadeInicial()} + ${this.aceleracao()}t \\;\\Rightarrow\\; ` +
      `v(${this.instante()}) = ${this.formatar(this.estado().velocidade)}\\,\\text{m/s}`,
  );

  protected readonly posicaoTex = computed(
    () =>
      `\\Delta s = ${this.velocidadeInicial()}t + \\frac{${this.aceleracao()}t^{2}}{2} ` +
      `\\;\\Rightarrow\\; ${this.formatar(this.estado().posicao)}\\,\\text{m}`,
  );

  /** O gráfico de velocidade, cuja área é o deslocamento. */
  protected readonly curvasVelocidade = computed<readonly CurvaPlot[]>(() => {
    const v0 = this.velocidadeInicial();
    const a = this.aceleracao();

    return [{ fn: (t) => v0 + a * t, cor: 'serie-1', rotulo: 'v(t)' }];
  });

  protected readonly areaDeslocamento = computed<readonly AreaPlot[]>(() => {
    const v0 = this.velocidadeInicial();
    const a = this.aceleracao();

    return [{ fn: (t) => v0 + a * t, de: 0, ate: this.instante(), cor: 'acento' }];
  });

  /** O gráfico de posição, cuja inclinação é a velocidade. */
  protected readonly curvasPosicao = computed<readonly CurvaPlot[]>(() => {
    const v0 = this.velocidadeInicial();
    const a = this.aceleracao();
    const t0 = this.instante();
    const s0 = v0 * t0 + (a * t0 * t0) / 2;
    const inclinacao = v0 + a * t0;

    return [
      { fn: (t) => v0 * t + (a * t * t) / 2, cor: 'serie-2', rotulo: 's(t)' },
      {
        fn: (t) => s0 + inclinacao * (t - t0),
        cor: 'acento',
        tracejada: true,
        rotulo: 'tangente = velocidade',
      },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    {
      x: this.instante(),
      y: this.estado().velocidade,
      rotulo: `${this.formatar(this.estado().velocidade)} m/s`,
      cor: 'serie-1',
    },
  ]);

  protected readonly pontosPosicao = computed<readonly PontoPlot[]>(() => [
    {
      x: this.instante(),
      y: this.estado().posicao,
      rotulo: `${this.formatar(this.estado().posicao)} m`,
      cor: 'serie-2',
    },
  ]);

  protected readonly dominio = computed(() => ({ xMin: 0, xMax: 12 }));

  constructor() {
    inject(TeoriaService).registrar(TEORIA_CINEMATICA);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
