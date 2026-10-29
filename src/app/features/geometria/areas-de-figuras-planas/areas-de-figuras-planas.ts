import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Figura, NOME_FIGURA, areaComPassos, escalaComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { SegmentoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorAreas } from '@features/geometria/areas-de-figuras-planas/areas-de-figuras-planas.gerador';
import { TEORIA_AREAS } from '@features/geometria/areas-de-figuras-planas/areas-de-figuras-planas.teoria';

/** As figuras que o painel permite explorar, na ordem da dedução. */
const FIGURAS: readonly Figura[] = ['retangulo', 'paralelogramo', 'triangulo', 'trapezio'];

@Component({
  selector: 'app-areas-de-figuras-planas',
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
  templateUrl: './areas-de-figuras-planas.html',
  styleUrl: './areas-de-figuras-planas.scss',
})
export class AreasDeFigurasPlanas {
  protected readonly gerador = geradorAreas;
  protected readonly conceitos = TEORIA_AREAS.map((teoria) => teoria.id);
  protected readonly figuras = FIGURAS;
  protected readonly nomeFigura = NOME_FIGURA;

  protected readonly figura = signal<Figura>('triangulo');
  protected readonly base = signal(8);
  protected readonly altura = signal(5);
  protected readonly baseMenor = signal(4);
  protected readonly k = signal(2);

  /** Deslocamento do topo, que inclina o paralelogramo sem mudar a área. */
  protected readonly inclinacao = signal(3);

  protected readonly analise = computed(() =>
    areaComPassos(this.figura(), {
      base: this.base(),
      altura: this.altura(),
      baseMenor: this.baseMenor(),
    }),
  );

  protected readonly area = computed(() => this.analise().resultado);

  protected readonly areaTex = computed(() => `A = ${this.formatar(this.area())}`);

  protected readonly ehTrapezio = computed(() => this.figura() === 'trapezio');

  protected readonly usaInclinacao = computed(
    () => this.figura() === 'paralelogramo' || this.figura() === 'triangulo',
  );

  /** O contorno da figura escolhida, desenhado com segmentos. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const b = this.base();
    const h = this.altura();
    const d = this.usaInclinacao() ? this.inclinacao() : 0;

    const vertices = this.verticesDa(this.figura(), b, h, d, this.baseMenor());

    return vertices.map((vertice, indice) => {
      const proximo = vertices[(indice + 1) % vertices.length]!;
      return { x1: vertice.x, y1: vertice.y, x2: proximo.x, y2: proximo.y, cor: 'serie-1' };
    });
  });

  /** O retângulo de referência, para comparar com o recorte. */
  protected readonly retanguloReferencia = computed<readonly SegmentoPlot[]>(() => {
    const b = this.base();
    const h = this.altura();

    if (this.figura() === 'retangulo') {
      return [];
    }

    return [
      { x1: 0, y1: 0, x2: b, y2: 0, cor: 'texto-suave', tracejado: true },
      { x1: b, y1: 0, x2: b, y2: h, cor: 'texto-suave', tracejado: true },
      { x1: b, y1: h, x2: 0, y2: h, cor: 'texto-suave', tracejado: true },
      { x1: 0, y1: h, x2: 0, y2: 0, cor: 'texto-suave', tracejado: true },
    ];
  });

  protected readonly todosOsSegmentos = computed<readonly SegmentoPlot[]>(() => [
    ...this.retanguloReferencia(),
    ...this.segmentos(),
  ]);

  protected readonly dominio = computed(() => {
    const maior = Math.max(this.base() + Math.abs(this.inclinacao()), this.altura());
    return { xMin: -1, xMax: maior + 1, yMin: -1, yMax: maior * 0.9 };
  });

  protected readonly escalaArea = computed(() => escalaComPassos(this.k(), 2));

  protected readonly areaEscalada = computed(() => this.area() * this.escalaArea().resultado);

  constructor() {
    inject(TeoriaService).registrar(TEORIA_AREAS);
  }

  protected selecionar(figura: Figura): void {
    this.figura.set(figura);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }

  /** Vértices no sentido anti-horário, com a base apoiada no eixo x. */
  private verticesDa(
    figura: Figura,
    base: number,
    altura: number,
    deslocamento: number,
    baseMenor: number,
  ): readonly { x: number; y: number }[] {
    switch (figura) {
      case 'triangulo':
        return [
          { x: 0, y: 0 },
          { x: base, y: 0 },
          { x: deslocamento, y: altura },
        ];
      case 'paralelogramo':
        return [
          { x: 0, y: 0 },
          { x: base, y: 0 },
          { x: base + deslocamento, y: altura },
          { x: deslocamento, y: altura },
        ];
      case 'trapezio': {
        const recuo = (base - baseMenor) / 2;
        return [
          { x: 0, y: 0 },
          { x: base, y: 0 },
          { x: base - recuo, y: altura },
          { x: recuo, y: altura },
        ];
      }
      default:
        return [
          { x: 0, y: 0 },
          { x: base, y: 0 },
          { x: base, y: altura },
          { x: 0, y: altura },
        ];
    }
  }
}
