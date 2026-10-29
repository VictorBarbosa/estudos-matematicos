import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  anguloInternoRegular,
  classificarTriangulo,
  desigualdadeTriangular,
  somaAngulosInternosComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { PontoPlot, SegmentoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorAngulos } from '@features/geometria/angulos-e-triangulos/angulos-e-triangulos.gerador';
import { TEORIA_ANGULOS } from '@features/geometria/angulos-e-triangulos/angulos-e-triangulos.teoria';

const ROTULO_FORMA = {
  equilatero: 'equilátero',
  isosceles: 'isósceles',
  escaleno: 'escaleno',
} as const;

const ROTULO_ANGULO = {
  retangulo: 'retângulo',
  acutangulo: 'acutângulo',
  obtusangulo: 'obtusângulo',
} as const;

@Component({
  selector: 'app-angulos-e-triangulos',
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
  templateUrl: './angulos-e-triangulos.html',
  styleUrl: './angulos-e-triangulos.scss',
})
export class AngulosETriangulos {
  protected readonly gerador = geradorAngulos;
  protected readonly conceitos = TEORIA_ANGULOS.map((teoria) => teoria.id);

  protected readonly lados = signal(6);

  /** Os três lados do triângulo que o aluno monta. */
  protected readonly a = signal(3);
  protected readonly b = signal(4);
  protected readonly c = signal(5);

  protected readonly analise = computed(() => somaAngulosInternosComPassos(this.lados()));

  protected readonly anguloInterno = computed(() => anguloInternoRegular(this.lados()));

  protected readonly anguloExterno = computed(() => 360 / this.lados());

  protected readonly somaTex = computed(
    () => `S_i = (${this.lados()} - 2) \\cdot 180^\\circ = ${this.analise().resultado}^\\circ`,
  );

  /** Vértices do polígono regular, no círculo de raio 1. */
  private readonly vertices = computed(() => {
    const n = this.lados();
    // Começa apontando para cima, para o polígono não parecer tombado.
    const defasagem = Math.PI / 2;

    return Array.from({ length: n }, (_, indice) => {
      const angulo = defasagem + (2 * Math.PI * indice) / n;
      return { x: Math.cos(angulo), y: Math.sin(angulo) };
    });
  });

  /** Lados do polígono, mais as diagonais que o repartem em triângulos. */
  protected readonly segmentosPoligono = computed<readonly SegmentoPlot[]>(() => {
    const vertices = this.vertices();
    const n = vertices.length;

    const contorno: SegmentoPlot[] = vertices.map((vertice, indice) => {
      const proximo = vertices[(indice + 1) % n]!;
      return { x1: vertice.x, y1: vertice.y, x2: proximo.x, y2: proximo.y, cor: 'serie-1' };
    });

    // As diagonais saem todas do primeiro vértice: é a decomposição da prova.
    const origem = vertices[0]!;
    const diagonais: SegmentoPlot[] = vertices
      .slice(2, n - 1)
      .map((vertice) => ({
        x1: origem.x,
        y1: origem.y,
        x2: vertice.x,
        y2: vertice.y,
        cor: 'acento',
        tracejado: true,
      }));

    return [...contorno, ...diagonais];
  });

  protected readonly pontosPoligono = computed<readonly PontoPlot[]>(() =>
    this.vertices().map((vertice) => ({ x: vertice.x, y: vertice.y, cor: 'serie-1' })),
  );

  protected readonly dominioPoligono = computed(() => ({
    xMin: -1.4,
    xMax: 1.4,
    yMin: -1.3,
    yMax: 1.3,
  }));

  protected readonly valido = computed(() => desigualdadeTriangular(this.a(), this.b(), this.c()));

  protected readonly classificacao = computed(() =>
    this.valido() ? classificarTriangulo(this.a(), this.b(), this.c()) : null,
  );

  protected readonly rotuloClassificacao = computed(() => {
    const classificacao = this.classificacao();
    return classificacao === null
      ? 'não é triângulo'
      : `${ROTULO_FORMA[classificacao.forma]} e ${ROTULO_ANGULO[classificacao.angulo]}`;
  });

  /** A comparação de Pitágoras que decide o tipo de ângulo. */
  protected readonly comparacaoTex = computed(() => {
    const [menor, medio, maior] = [this.a(), this.b(), this.c()].sort((x, y) => x - y) as [
      number,
      number,
      number,
    ];

    const quadradoMaior = maior * maior;
    const soma = menor * menor + medio * medio;
    const relacao = Math.abs(quadradoMaior - soma) < 1e-9 ? '=' : quadradoMaior > soma ? '>' : '<';

    return `${maior}^{2} ${relacao} ${menor}^{2} + ${medio}^{2} \\quad (${quadradoMaior} ${relacao} ${soma})`;
  });

  /** O triângulo desenhado a partir dos três lados, quando eles fecham. */
  protected readonly segmentosTriangulo = computed<readonly SegmentoPlot[]>(() => {
    if (!this.valido()) {
      return [];
    }

    const [a, b, c] = [this.a(), this.b(), this.c()];

    // Apoia o lado a no eixo x e localiza o terceiro vértice por interseção.
    const x = (a * a + b * b - c * c) / (2 * a);
    const y = Math.sqrt(Math.max(0, b * b - x * x));

    return [
      { x1: 0, y1: 0, x2: a, y2: 0, cor: 'serie-1', rotulo: 'a' },
      { x1: 0, y1: 0, x2: x, y2: y, cor: 'serie-2' },
      { x1: a, y1: 0, x2: x, y2: y, cor: 'serie-3' },
    ];
  });

  protected readonly dominioTriangulo = computed(() => {
    const maior = Math.max(this.a(), this.b(), this.c());
    return { xMin: -1, xMax: maior + 1, yMin: -1, yMax: maior + 1 };
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_ANGULOS);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
