import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { areaComPassos, perimetroCirculoComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, SegmentoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorCirculo } from '@features/geometria/circulo-e-poligonos/circulo-e-poligonos.gerador';
import { TEORIA_CIRCULO } from '@features/geometria/circulo-e-poligonos/circulo-e-poligonos.teoria';

@Component({
  selector: 'app-circulo-e-poligonos',
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
  templateUrl: './circulo-e-poligonos.html',
  styleUrl: './circulo-e-poligonos.scss',
})
export class CirculoEPoligonos {
  protected readonly gerador = geradorCirculo;
  protected readonly conceitos = TEORIA_CIRCULO.map((teoria) => teoria.id);

  protected readonly raio = signal(3);
  protected readonly anguloSetor = signal(90);
  /** Lados do polígono inscrito, que aproxima o círculo. */
  protected readonly lados = signal(6);

  protected readonly comprimento = computed(() => perimetroCirculoComPassos(this.raio()));

  protected readonly areaCirculo = computed(() => areaComPassos('circulo', { raio: this.raio() }));

  protected readonly areaSetor = computed(() =>
    areaComPassos('setor', { raio: this.raio(), anguloGraus: this.anguloSetor() }),
  );

  /** Lado e apótema do polígono regular inscrito no círculo de raio r. */
  protected readonly inscrito = computed(() => {
    const n = this.lados();
    const r = this.raio();

    const lado = 2 * r * Math.sin(Math.PI / n);
    const apotema = r * Math.cos(Math.PI / n);

    return {
      lado,
      apotema,
      perimetro: n * lado,
      area: areaComPassos('poligono-regular', { lados: n, base: lado, apotema }).resultado,
    };
  });

  /** Quanto da área do círculo o polígono inscrito já cobre. */
  protected readonly cobertura = computed(
    () => this.inscrito().area / this.areaCirculo().resultado,
  );

  protected readonly piEstimado = computed(
    () => this.inscrito().perimetro / (2 * this.raio()),
  );

  protected readonly comprimentoTex = computed(
    () => `C = 2\\pi \\cdot ${this.raio()} = ${this.formatar(this.comprimento().resultado)}`,
  );

  protected readonly areaTex = computed(
    () => `A = \\pi \\cdot ${this.raio()}^{2} = ${this.formatar(this.areaCirculo().resultado)}`,
  );

  /** O círculo desenhado como duas semicircunferências. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const r = this.raio();
    const circulo = (sinal: number) => (x: number) => {
      const dentro = r * r - x * x;
      return dentro < 0 ? Number.NaN : sinal * Math.sqrt(dentro);
    };

    return [
      { fn: circulo(1), cor: 'serie-1' },
      { fn: circulo(-1), cor: 'serie-1' },
    ];
  });

  /** O polígono inscrito, lado a lado com o círculo. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const n = this.lados();
    const r = this.raio();

    const vertices = Array.from({ length: n }, (_, indice) => {
      const angulo = Math.PI / 2 + (2 * Math.PI * indice) / n;
      return { x: r * Math.cos(angulo), y: r * Math.sin(angulo) };
    });

    return vertices.map((vertice, indice) => {
      const proximo = vertices[(indice + 1) % n]!;
      return { x1: vertice.x, y1: vertice.y, x2: proximo.x, y2: proximo.y, cor: 'acento' };
    });
  });

  protected readonly dominio = computed(() => {
    const r = this.raio() * 1.25;
    return { xMin: -r, xMax: r, yMin: -r, yMax: r };
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_CIRCULO);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }

  protected percentual(valor: number): string {
    return `${(valor * 100).toFixed(2).replace('.', ',')}%`;
  }
}
