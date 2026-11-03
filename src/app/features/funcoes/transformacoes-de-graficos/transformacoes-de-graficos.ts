import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  Transformacao,
  aplicar,
  descreverTransformacao,
  transformacaoParaTex,
  transformarPonto,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { geradorTransformacoes } from '@features/funcoes/transformacoes-de-graficos/transformacoes-de-graficos.gerador';
import { TEORIA_TRANSFORMACOES } from '@features/funcoes/transformacoes-de-graficos/transformacoes-de-graficos.teoria';

/** As funções-base disponíveis, nomeadas pelo índice do controle. */
const BASES: readonly { readonly nome: string; readonly fn: (x: number) => number }[] = [
  { nome: 'x²', fn: (x) => x * x },
  { nome: 'raiz de x', fn: (x) => (x >= 0 ? Math.sqrt(x) : Number.NaN) },
  { nome: 'módulo de x', fn: (x) => Math.abs(x) },
  { nome: 'seno', fn: Math.sin },
];

@Component({
  selector: 'app-transformacoes-de-graficos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './transformacoes-de-graficos.html',
  styleUrl: './transformacoes-de-graficos.scss',
})
export class TransformacoesDeGraficos {
  protected readonly gerador = geradorTransformacoes;
  protected readonly conceitos = TEORIA_TRANSFORMACOES.map((teoria) => teoria.id);

  protected readonly escolha = signal(0);
  protected readonly a = signal(1);
  protected readonly b = signal(1);
  protected readonly h = signal(0);
  protected readonly k = signal(0);

  protected readonly base = computed(() => BASES[this.escolha()]!);

  protected readonly transformacao = computed<Transformacao>(() => ({
    a: this.a(),
    b: this.b(),
    h: this.h(),
    k: this.k(),
  }));

  protected readonly formulaTex = computed(
    () => `g(x) = ${transformacaoParaTex(this.transformacao())}`,
  );

  protected readonly descricoes = computed(() => descreverTransformacao(this.transformacao()));

  /** Um ponto de referência do gráfico original, e para onde ele vai. */
  protected readonly origem = { x: 1, y: 1 };

  protected readonly destino = computed(() =>
    transformarPonto(
      { x: this.origem.x, y: this.base().fn(this.origem.x) },
      this.transformacao(),
    ),
  );

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const { fn } = this.base();

    return [
      { fn, cor: 'texto-suave', tracejada: true, rotulo: 'f(x) original' },
      { fn: aplicar(fn, this.transformacao()), cor: 'acento', rotulo: 'g(x) transformada' },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    {
      x: this.origem.x,
      y: this.base().fn(this.origem.x),
      cor: 'texto-suave',
      rotulo: 'ponto original',
    },
    { x: this.destino().x, y: this.destino().y, cor: 'acento', rotulo: 'para onde ele foi' },
  ]);

  protected readonly dominio = computed(() => ({ xMin: -8, xMax: 8, yMin: -6, yMax: 8 }));

  protected readonly descricaoGrafico = computed(
    () =>
      `Gráfico de ${this.base().nome} tracejado e sua versão transformada em destaque, com um ` +
      'ponto de referência marcado nos dois.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_TRANSFORMACOES);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
