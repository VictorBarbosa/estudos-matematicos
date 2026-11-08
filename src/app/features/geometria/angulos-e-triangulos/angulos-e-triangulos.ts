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
import {
  ArcoPlot,
  PontoPlot,
  SegmentoPlot,
} from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/geometria/angulos-e-triangulos/angulos-e-triangulos.i18n.json';
import { geradorAngulos } from '@features/geometria/angulos-e-triangulos/angulos-e-triangulos.gerador';
import { TEORIA_ANGULOS } from '@features/geometria/angulos-e-triangulos/angulos-e-triangulos.teoria';

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
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
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
    const diagonais: SegmentoPlot[] = vertices.slice(2, n - 1).map((vertice) => ({
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

  /**
   * O ângulo interno marcado em cada vértice.
   *
   * O número já estava num cartão ao lado — «Cada interno (regular): 60°» —,
   * mas ler 60° e não ver onde ele está no desenho não ensina nada. Com o arco
   * no canto, dá para contar os ângulos e conferir a soma com o olho.
   */
  protected readonly arcosPoligono = computed<readonly ArcoPlot[]>(() => {
    const vertices = this.vertices();
    const n = vertices.length;
    const medida = `${this.formatar(this.anguloInterno())}°`;

    return vertices.map((vertice, indice) => ({
      x: vertice.x,
      y: vertice.y,
      de: vertices[(indice + 1) % n]!,
      ate: vertices[(indice - 1 + n) % n]!,
      rotulo: medida,
      cor: 'acento' as const,
      // Com muitos lados os cantos ficam apertados; o arco encolhe junto.
      raio: n > 8 ? 16 : 22,
    }));
  });

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
      ? this.texto('naoETriangulo')
      : this.texto('formaEAngulo', {
          forma: this.texto(classificacao.forma),
          angulo: this.texto(classificacao.angulo),
        });
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

  /**
   * Os três vértices, com o lado a apoiado no eixo x.
   *
   * O ápice sai por interseção. Num triângulo obtusângulo ele cai à ESQUERDA
   * da origem — com 4, 7 e 10 o x dá −4,375 —, e é por isso que o domínio não
   * pode começar em −1 fixo: o desenho ficava cortado fora da tela.
   */
  private readonly verticesTriangulo = computed(() => {
    const [a, b, c] = [this.a(), this.b(), this.c()];
    const x = (a * a + b * b - c * c) / (2 * a);
    const y = Math.sqrt(Math.max(0, b * b - x * x));

    return { A: { x: 0, y: 0 }, B: { x: a, y: 0 }, C: { x, y } };
  });

  /** O triângulo desenhado a partir dos três lados, quando eles fecham. */
  protected readonly segmentosTriangulo = computed<readonly SegmentoPlot[]>(() => {
    if (!this.valido()) {
      return [];
    }

    const { A, B, C } = this.verticesTriangulo();

    return [
      { x1: A.x, y1: A.y, x2: B.x, y2: B.y, cor: 'serie-1', rotulo: 'a' },
      { x1: A.x, y1: A.y, x2: C.x, y2: C.y, cor: 'serie-2' },
      { x1: B.x, y1: B.y, x2: C.x, y2: C.y, cor: 'serie-3' },
    ];
  });

  /** Os três ângulos internos, pela lei dos cossenos, marcados no desenho. */
  protected readonly arcosTriangulo = computed<readonly ArcoPlot[]>(() => {
    if (!this.valido()) {
      return [];
    }

    const { A, B, C } = this.verticesTriangulo();
    const [a, b, c] = [this.a(), this.b(), this.c()];

    // Em cada vértice, o lado oposto é o que não o toca.
    const grau = (oposto: number, um: number, outro: number): string =>
      `${this.formatar(
        (Math.acos((um * um + outro * outro - oposto * oposto) / (2 * um * outro)) * 180) / Math.PI,
      )}°`;

    return [
      { x: A.x, y: A.y, de: B, ate: C, rotulo: grau(c, a, b), cor: 'serie-3' as const },
      { x: B.x, y: B.y, de: C, ate: A, rotulo: grau(b, a, c), cor: 'serie-2' as const },
      { x: C.x, y: C.y, de: A, ate: B, rotulo: grau(a, b, c), cor: 'serie-1' as const },
    ];
  });

  protected readonly dominioTriangulo = computed(() => {
    const { B, C } = this.verticesTriangulo();
    // A folga é proporcional, para o arco do ângulo caber junto da figura.
    const folga = Math.max(1, Math.max(B.x, C.y) * 0.2);

    return {
      xMin: Math.min(0, C.x) - folga,
      xMax: Math.max(B.x, C.x) + folga,
      yMin: -folga,
      yMax: Math.max(C.y, 1) + folga,
    };
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_ANGULOS);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
