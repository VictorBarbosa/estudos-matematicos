import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  Matriz,
  cramerComPassos,
  determinanteComPassos,
  matrizParaTex,
  multiplicarComPassos,
} from '@core/math';
import { ErroMatematico } from '@core/math/tipos';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { SegmentoPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorMatrizes } from './matrizes-determinantes.gerador';
import { TEORIA_MATRIZES } from './matrizes-determinantes.teoria';

@Component({
  selector: 'app-matrizes-determinantes',
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
  templateUrl: './matrizes-determinantes.html',
  styleUrl: './matrizes-determinantes.scss',
})
export class MatrizesDeterminantes {
  protected readonly gerador = geradorMatrizes;
  protected readonly conceitos = TEORIA_MATRIZES.map((teoria) => teoria.id);

  /** Matriz A, por entradas. */
  protected readonly a11 = signal(2);
  protected readonly a12 = signal(1);
  protected readonly a21 = signal(1);
  protected readonly a22 = signal(3);

  /** O vetor de constantes do sistema associado. */
  protected readonly b1 = signal(5);
  protected readonly b2 = signal(10);

  protected readonly a = computed<Matriz>(() => [
    [this.a11(), this.a12()],
    [this.a21(), this.a22()],
  ]);

  protected readonly analiseDeterminante = computed(() => determinanteComPassos(this.a()));

  protected readonly determinante = computed(() => this.analiseDeterminante().resultado);

  protected readonly singular = computed(() => Math.abs(this.determinante()) < 1e-9);

  /** O produto A·A, para ver os determinantes se multiplicarem. */
  protected readonly quadrado = computed(() => multiplicarComPassos(this.a(), this.a()));

  protected readonly determinanteDoQuadrado = computed(
    () => determinanteComPassos(this.quadrado().resultado).resultado,
  );

  /**
   * O sistema resolvido por Cramer.
   *
   * Com determinante nulo não há solução única, e a regra simplesmente não se
   * aplica — o erro é informação, não falha.
   */
  protected readonly cramer = computed(() => {
    try {
      return cramerComPassos(this.a(), [this.b1(), this.b2()]);
    } catch (erro) {
      return erro instanceof ErroMatematico ? null : null;
    }
  });

  protected readonly matrizTex = computed(() => `A = ${matrizParaTex(this.a())}`);

  protected readonly determinanteTex = computed(
    () =>
      `\\det A = (${this.a11()})(${this.a22()}) - (${this.a12()})(${this.a21()}) = ` +
      `${this.formatar(this.determinante())}`,
  );

  protected readonly sistemaTex = computed(
    () =>
      `\\begin{cases} ${this.a11()}x ${this.a12() >= 0 ? '+' : '-'} ${Math.abs(this.a12())}y = ${this.b1()} \\\\ ` +
      `${this.a21()}x ${this.a22() >= 0 ? '+' : '-'} ${Math.abs(this.a22())}y = ${this.b2()} \\end{cases}`,
  );

  /** O paralelogramo das linhas, cuja área é o módulo do determinante. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const u = { x: this.a11(), y: this.a12() };
    const v = { x: this.a21(), y: this.a22() };

    return [
      { x1: 0, y1: 0, x2: u.x, y2: u.y, cor: 'serie-1', seta: true, rotulo: 'linha 1' },
      { x1: 0, y1: 0, x2: v.x, y2: v.y, cor: 'serie-2', seta: true, rotulo: 'linha 2' },
      { x1: u.x, y1: u.y, x2: u.x + v.x, y2: u.y + v.y, cor: 'texto-suave', tracejado: true },
      { x1: v.x, y1: v.y, x2: u.x + v.x, y2: u.y + v.y, cor: 'texto-suave', tracejado: true },
    ];
  });

  protected readonly dominio = computed(() => {
    const alcance =
      Math.max(
        Math.abs(this.a11()) + Math.abs(this.a21()),
        Math.abs(this.a12()) + Math.abs(this.a22()),
      ) + 1.5;

    return { xMin: -alcance, xMax: alcance, yMin: -alcance, yMax: alcance };
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_MATRIZES);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
