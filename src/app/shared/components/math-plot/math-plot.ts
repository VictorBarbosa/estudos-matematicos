import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  AreaPlot,
  CurvaPlot,
  DominioPlot,
  MarcaPlot,
  Margens,
  PontoPlot,
  Projecao,
  RetanguloPlot,
  SegmentoPlot,
  construirPathArea,
  construirPathCurva,
  corCss,
  deduzirLimitesVerticais,
  formatarNumero,
  gerarMarcacoes,
  passoBonito,
} from '@shared/components/math-plot/models/math-plot.model';

/** Largura fixa do sistema de coordenadas interno; o SVG escala por viewBox. */
const LARGURA = 800;

let proximoId = 0;

/**
 * Plano cartesiano em SVG.
 *
 * Um único componente declarativo cobre os usos do projeto inteiro: reta
 * numérica, gráfico de função, vetores, retas tangentes e áreas sob a curva.
 * Toda a geometria é derivada com `computed`, de modo que mexer num parâmetro
 * redesenha só o que mudou.
 */
@Component({
  selector: 'app-math-plot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './math-plot.scss',
  templateUrl: './math-plot.html',
})
export class MathPlot {
  readonly dominio = input.required<DominioPlot>();
  /** Descrição do que o gráfico mostra, lida por leitores de tela. */
  readonly descricao = input.required<string>();

  readonly curvas = input<readonly CurvaPlot[]>([]);
  readonly pontos = input<readonly PontoPlot[]>([]);
  readonly segmentos = input<readonly SegmentoPlot[]>([]);
  readonly areas = input<readonly AreaPlot[]>([]);
  readonly marcas = input<readonly MarcaPlot[]>([]);
  /** Retângulos com base no eixo x, para somas de Riemann. */
  readonly retangulos = input<readonly RetanguloPlot[]>([]);

  readonly mostrarEixoY = input(true);
  readonly mostrarGrade = input(true);
  /** Altura em unidades do viewBox; a largura é sempre 800. */
  readonly altura = input(460);

  protected readonly LARGURA = LARGURA;
  protected readonly idClip = `plot-clip-${proximoId++}`;

  protected readonly margens = computed<Margens>(() => ({
    topo: 18,
    direita: 24,
    baixo: 38,
    esquerda: this.mostrarEixoY() ? 54 : 24,
  }));

  protected readonly limites = computed(() => {
    const dominio = this.dominio();
    const { yMin, yMax } = deduzirLimitesVerticais(dominio, this.curvas(), this.pontos());
    return { xMin: dominio.xMin, xMax: dominio.xMax, yMin, yMax };
  });

  private readonly projecao = computed(
    () => new Projecao(this.limites(), LARGURA, this.altura(), this.margens()),
  );

  protected readonly larguraUtil = computed(() => this.projecao().larguraUtil);
  protected readonly alturaUtil = computed(() => this.projecao().alturaUtil);

  /** O eixo x acompanha y=0 quando ele está visível; caso contrário, encosta na borda. */
  protected readonly posicaoEixoX = computed(() => {
    const { yMin, yMax } = this.limites();
    const projecao = this.projecao();
    const alvo = Math.max(yMin, Math.min(yMax, 0));
    return projecao.py(alvo);
  });

  protected readonly posicaoEixoY = computed(() => {
    const { xMin, xMax } = this.limites();
    const projecao = this.projecao();
    const alvo = Math.max(xMin, Math.min(xMax, 0));
    return projecao.px(alvo);
  });

  protected readonly marcacoesX = computed(() => {
    const { xMin, xMax } = this.limites();
    const projecao = this.projecao();
    const passo = passoBonito(xMax - xMin, 10);

    return gerarMarcacoes(xMin, xMax, passo).map((valor) => ({
      valor,
      pos: projecao.px(valor),
      rotulo: formatarNumero(valor, passo),
    }));
  });

  protected readonly marcacoesY = computed(() => {
    const { yMin, yMax } = this.limites();
    const projecao = this.projecao();
    const passo = passoBonito(yMax - yMin, 6);

    return (
      gerarMarcacoes(yMin, yMax, passo)
        // O zero do eixo y seria redundante com o rótulo do eixo x.
        .filter((valor) => Math.abs(valor) > passo * 1e-6)
        .map((valor) => ({
          valor,
          pos: projecao.py(valor),
          rotulo: formatarNumero(valor, passo),
        }))
    );
  });

  protected readonly curvasDesenhadas = computed(() => {
    const projecao = this.projecao();
    return this.curvas().map((curva) => ({
      d: construirPathCurva(curva.fn, projecao),
      cor: corCss(curva.cor),
      tracejada: curva.tracejada ?? false,
    }));
  });

  protected readonly areasDesenhadas = computed(() => {
    const projecao = this.projecao();
    return this.areas().map((area) => ({
      d: construirPathArea(area, projecao),
      cor: corCss(area.cor),
    }));
  });

  protected readonly retangulosDesenhados = computed(() => {
    const projecao = this.projecao();
    const yZero = projecao.py(0);

    return this.retangulos().map((retangulo) => {
      const topo = projecao.py(retangulo.altura);
      const esquerda = projecao.px(retangulo.x);
      const direita = projecao.px(retangulo.x + retangulo.largura);

      return {
        x: Math.min(esquerda, direita),
        // Um retângulo de altura negativa é desenhado abaixo do eixo.
        y: Math.min(yZero, topo),
        largura: Math.abs(direita - esquerda),
        altura: Math.abs(topo - yZero),
        cor: corCss(retangulo.cor, 'serie-2'),
      };
    });
  });

  protected readonly pontosDesenhados = computed(() => {
    const projecao = this.projecao();
    return this.pontos().map((ponto) => ({
      cx: projecao.px(ponto.x),
      cy: projecao.py(ponto.y),
      cor: corCss(ponto.cor, 'acento'),
      rotulo: ponto.rotulo,
      vazado: ponto.vazado ?? false,
    }));
  });

  protected readonly marcasDesenhadas = computed(() => {
    const projecao = this.projecao();
    return this.marcas().map((marca) => ({
      pos: projecao.px(marca.x),
      cor: corCss(marca.cor, 'acento'),
      rotulo: marca.rotulo,
    }));
  });

  protected readonly segmentosDesenhados = computed(() => {
    const projecao = this.projecao();

    return this.segmentos().map((segmento) => {
      const x1 = projecao.px(segmento.x1);
      const y1 = projecao.py(segmento.y1);
      const x2 = projecao.px(segmento.x2);
      const y2 = projecao.py(segmento.y2);

      return {
        x1,
        y1,
        x2,
        y2,
        cor: corCss(segmento.cor, 'serie-2'),
        tracejado: segmento.tracejado ?? false,
        ponta: segmento.seta ? construirPontaSeta(x1, y1, x2, y2) : null,
      };
    });
  });

  protected readonly legenda = computed(() =>
    this.curvas()
      .filter((curva): curva is CurvaPlot & { rotulo: string } => curva.rotulo !== undefined)
      .map((curva) => ({ rotulo: curva.rotulo, cor: corCss(curva.cor) })),
  );
}

/**
 * Triângulo da ponta de um vetor, desenhado como path em vez de `marker`:
 * assim a ponta herda exatamente a cor do segmento em todos os navegadores.
 */
function construirPontaSeta(x1: number, y1: number, x2: number, y2: number): string | null {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const comprimento = Math.hypot(dx, dy);

  if (comprimento < 1e-6) {
    return null;
  }

  const ux = dx / comprimento;
  const uy = dy / comprimento;
  const tamanho = 11;
  const meiaBase = 5;

  const baseX = x2 - ux * tamanho;
  const baseY = y2 - uy * tamanho;
  // Perpendicular à direção do segmento.
  const px = -uy * meiaBase;
  const py = ux * meiaBase;

  return (
    `M${x2.toFixed(2)},${y2.toFixed(2)} ` +
    `L${(baseX + px).toFixed(2)},${(baseY + py).toFixed(2)} ` +
    `L${(baseX - px).toFixed(2)},${(baseY - py).toFixed(2)} Z`
  );
}
