import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot } from '@shared/components/math-plot/models/math-plot.model';
import { geradorMomentoAngular } from '@features/fisica/momento-angular/momento-angular.gerador';
import { TEORIA_MOMENTO_ANGULAR } from '@features/fisica/momento-angular/momento-angular.teoria';

@Component({
  selector: 'app-momento-angular',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './momento-angular.html',
  styleUrl: './momento-angular.scss',
})
export class MomentoAngular {
  protected readonly gerador = geradorMomentoAngular;
  protected readonly conceitos = TEORIA_MOMENTO_ANGULAR.map((teoria) => teoria.id);

  /** Inércia inicial em décimos, para permitir valores quebrados. */
  protected readonly decimosDaInercia = signal(40);
  protected readonly decimosDeOmega = signal(20);
  /** Quanto da inércia resta depois de recolher a massa, em por cento. */
  protected readonly percentualRestante = signal(25);

  protected readonly inerciaInicial = computed(() => this.decimosDaInercia() / 10);
  protected readonly omegaInicial = computed(() => this.decimosDeOmega() / 10);
  protected readonly inerciaFinal = computed(
    () => (this.inerciaInicial() * this.percentualRestante()) / 100,
  );

  protected readonly momentoAngular = computed(
    () => this.inerciaInicial() * this.omegaInicial(),
  );

  protected readonly omegaFinal = computed(() => this.momentoAngular() / this.inerciaFinal());

  protected readonly energiaInicial = computed(
    () => 0.5 * this.inerciaInicial() * this.omegaInicial() ** 2,
  );

  protected readonly energiaFinal = computed(
    () => 0.5 * this.inerciaFinal() * this.omegaFinal() ** 2,
  );

  protected readonly trabalho = computed(() => this.energiaFinal() - this.energiaInicial());

  protected readonly conservacaoTex = computed(
    () =>
      `${this.tex(this.inerciaInicial())} \\cdot ${this.tex(this.omegaInicial())} = ` +
      `${this.tex(this.inerciaFinal())} \\cdot ${this.tex(this.omegaFinal())}`,
  );

  /**
   * Com L fixo, a energia é inversamente proporcional à inércia.
   *
   * É a curva que mostra o ponto do tópico: o momento angular é uma reta
   * horizontal, e a energia dispara quando a inércia encolhe.
   */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const L = this.momentoAngular();

    return [
      { fn: () => L, cor: 'serie-1', rotulo: 'momento angular (constante)' },
      {
        fn: (inercia) => (inercia > 0.05 ? (L * L) / (2 * inercia) : Number.NaN),
        cor: 'acento',
        rotulo: 'energia de rotação',
      },
    ];
  });

  protected readonly dominio = computed(() => ({
    xMin: 0,
    xMax: Math.max(this.inerciaInicial() * 1.3, 1),
  }));

  protected readonly descricaoGrafico = computed(
    () =>
      'Em função do momento de inércia: o momento angular não muda, e a energia de rotação ' +
      'cresce sem limite à medida que a massa se aproxima do eixo.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_MOMENTO_ANGULAR);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }

  private tex(valor: number): string {
    return String(Number(valor.toFixed(3))).replace('.', '{,}');
  }
}
