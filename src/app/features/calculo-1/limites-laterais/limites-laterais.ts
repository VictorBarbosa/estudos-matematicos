import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/math-plot.model';
import { geradorLaterais } from './limites-laterais.gerador';
import { TEORIA_LATERAIS } from './limites-laterais.teoria';

@Component({
  selector: 'app-limites-laterais',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    ConceitosTopico,
    ControleParametro,
    Formula,
    MathPlot,
    TopicoLayout,
  ],
  templateUrl: './limites-laterais.html',
  styleUrl: './limites-laterais.scss',
})
export class LimitesLaterais {
  protected readonly gerador = geradorLaterais;
  protected readonly conceitos = TEORIA_LATERAIS.map((teoria) => teoria.id);

  protected readonly ponto = signal(2);
  protected readonly a = signal(1);
  protected readonly b = signal(1);
  protected readonly c = signal(1);
  protected readonly d = signal(4);

  protected readonly valorEsquerda = computed(() => this.a() * this.ponto() + this.b());
  protected readonly valorDireita = computed(() => this.c() * this.ponto() + this.d());

  protected readonly salto = computed(() => this.valorDireita() - this.valorEsquerda());
  protected readonly limiteExiste = computed(() => Math.abs(this.salto()) < 1e-9);

  protected readonly sistemaTex = computed(() => {
    const esquerda = `${this.a() === 1 ? '' : this.a()}x ${this.b() >= 0 ? '+' : '-'} ${Math.abs(this.b())}`;
    const direita = `${this.c() === 1 ? '' : this.c()}x ${this.d() >= 0 ? '+' : '-'} ${Math.abs(this.d())}`;

    return (
      `f(x) = \\begin{cases} ${esquerda} & x < ${this.ponto()} \\\\ ` +
      `${direita} & x \\geq ${this.ponto()} \\end{cases}`
    );
  });

  /** Cada sentença é desenhada só na sua região de validade. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const [p, a, b, c, d] = [this.ponto(), this.a(), this.b(), this.c(), this.d()];

    return [
      {
        fn: (x) => (x < p ? a * x + b : Number.NaN),
        cor: 'serie-1',
        rotulo: 'sentença da esquerda',
      },
      {
        fn: (x) => (x >= p ? c * x + d : Number.NaN),
        cor: 'serie-2',
        rotulo: 'sentença da direita',
      },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    {
      x: this.ponto(),
      y: this.valorEsquerda(),
      rotulo: `L⁻ = ${this.valorEsquerda()}`,
      cor: 'serie-1',
      // A sentença da esquerda não inclui o ponto.
      vazado: true,
    },
    {
      x: this.ponto(),
      y: this.valorDireita(),
      rotulo: `L⁺ = ${this.valorDireita()}`,
      cor: 'serie-2',
    },
  ]);

  protected readonly dominio = computed(() => {
    const valores = [this.valorEsquerda(), this.valorDireita()];
    const folga = Math.max(4, Math.abs(this.salto()) + 2);

    return {
      xMin: this.ponto() - 5,
      xMax: this.ponto() + 5,
      yMin: Math.min(...valores) - folga,
      yMax: Math.max(...valores) + folga,
    };
  });

  protected readonly descricaoGrafico = computed(() =>
    this.limiteExiste()
      ? 'As duas sentenças se encontram no ponto: o gráfico emenda sem salto.'
      : `As duas sentenças chegam a alturas diferentes: há um salto de ${Math.abs(this.salto())}.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_LATERAIS);
  }

  /** Ajusta d para que as sentenças se encontrem, eliminando o salto. */
  protected emendar(): void {
    this.d.set(this.a() * this.ponto() + this.b() - this.c() * this.ponto());
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
