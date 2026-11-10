import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { SegmentoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/calculo-3/teoremas-integrais/teoremas-integrais.i18n.json';
import { geradorTeoremasIntegrais } from '@features/calculo-3/teoremas-integrais/teoremas-integrais.gerador';
import { TEORIA_TEOREMAS_INTEGRAIS } from '@features/calculo-3/teoremas-integrais/teoremas-integrais.teoria';

/** `cx` sem «1x» nem «−1x»: 1 some, −1 vira só o sinal. */
const termo = (c: number, v: string): string =>
  c === 0 ? '0' : c === 1 ? v : c === -1 ? `-${v}` : `${c}${v}`;

/** Passos da integral de linha numérica em cada lado do retângulo. */
const PASSOS = 400;

/**
 * Green no retângulo, com o campo F = (α·y², β·x²).
 *
 * A circulação é calculada de verdade, somando F·dr ao longo dos quatro lados,
 * e posta ao lado da integral dupla de ∂Q/∂x − ∂P/∂y. Os dois números
 * coincidem para qualquer α, β e retângulo: é o teorema visto funcionando.
 */
@Component({
  selector: 'app-teoremas-integrais',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './teoremas-integrais.html',
  styleUrl: './teoremas-integrais.scss',
})
export class TeoremasIntegrais {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorTeoremasIntegrais;
  protected readonly conceitos = TEORIA_TEOREMAS_INTEGRAIS.map((teoria) => teoria.id);

  protected readonly alfa = signal(-1);
  protected readonly beta = signal(2);
  protected readonly largura = signal(3);
  protected readonly altura = signal(2);

  /** P depende só de y e Q só de x; os dois parâmetros ficam pela leitura F(x, y). */
  private P(_x: number, y: number): number {
    return this.alfa() * y * y;
  }

  private Q(x: number, _y: number): number {
    return this.beta() * x * x;
  }

  protected readonly campoTex = computed(
    () =>
      `\\vec{F} = \\left(${termo(this.alfa(), 'y^{2}')},\\; ${termo(this.beta(), 'x^{2}')}\\right)`,
  );

  /** ∮ P dx + Q dy pela regra do ponto médio, no sentido anti-horário. */
  protected readonly circulacao = computed(() => {
    const L = this.largura();
    const M = this.altura();
    let soma = 0;
    for (let n = 0; n < PASSOS; n++) {
      const t = (n + 0.5) / PASSOS;
      soma += this.P(t * L, 0) * (L / PASSOS); // base: x de 0 a L
      soma += this.Q(L, t * M) * (M / PASSOS); // direita: y de 0 a M
      soma -= this.P(L - t * L, M) * (L / PASSOS); // topo: x de L a 0, dx negativo
      soma -= this.Q(0, M - t * M) * (M / PASSOS); // esquerda: y de M a 0, dy negativo
    }
    return soma;
  });

  /** ∬ (2βx − 2αy) dA no retângulo, exata. */
  protected readonly duplaExata = computed(() => {
    const L = this.largura();
    const M = this.altura();
    return this.beta() * L * L * M - this.alfa() * L * M * M;
  });

  protected readonly comparacaoTex = computed(
    () =>
      `\\oint_C \\vec{F} \\cdot d\\vec{r} \\approx ${this.f(this.circulacao())} \\qquad ` +
      `\\iint_R \\left(${termo(2 * this.beta(), 'x')} ${-2 * this.alfa() >= 0 ? '+' : '-'} ${termo(Math.abs(2 * this.alfa()), 'y')}\\right) dA = ${this.f(this.duplaExata())}`,
  );

  /** Setas do campo numa grade, encolhidas para caber, e a borda orientada. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const L = this.largura();
    const M = this.altura();
    const setas: SegmentoPlot[] = [];
    const pontos: [number, number][] = [];
    for (let i = 0; i <= 6; i++)
      for (let j = 0; j <= 4; j++) pontos.push([(i * L) / 6, (j * M) / 4]);
    const maior = Math.max(...pontos.map(([x, y]) => Math.hypot(this.P(x, y), this.Q(x, y))), 1e-9);
    const escala = (0.45 * Math.min(L / 6, M / 4) * 2) / maior;
    for (const [x, y] of pontos) {
      const [u, v] = [this.P(x, y) * escala, this.Q(x, y) * escala];
      if (Math.hypot(u, v) < 1e-6) continue;
      setas.push({ x1: x, y1: y, x2: x + u, y2: y + v, cor: 'serie-1', seta: true });
    }
    const borda: SegmentoPlot[] = [
      { x1: 0, y1: 0, x2: L, y2: 0, cor: 'acerto', seta: true },
      { x1: L, y1: 0, x2: L, y2: M, cor: 'acerto', seta: true },
      { x1: L, y1: M, x2: 0, y2: M, cor: 'acerto', seta: true },
      { x1: 0, y1: M, x2: 0, y2: 0, cor: 'acerto', seta: true },
    ];
    return [...borda, ...setas];
  });

  protected readonly dominio = computed(() => {
    const L = this.largura();
    const M = this.altura();
    const m = Math.max(L, M) + 1;
    return { xMin: -1, xMax: 2 * m, yMin: -1, yMax: m };
  });

  protected readonly descricaoGrafico = computed(() =>
    this.texto('descricaoGrafico', {
      largura: String(this.largura()),
      altura: String(this.altura()),
      circulacao: this.f(this.circulacao()).replace('{,}', ','),
    }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_TEOREMAS_INTEGRAIS);
  }

  private f(valor: number): string {
    return Number(valor.toFixed(2))
      .toLocaleString('pt-BR', { maximumFractionDigits: 2 })
      .replace(',', '{,}');
  }
}
