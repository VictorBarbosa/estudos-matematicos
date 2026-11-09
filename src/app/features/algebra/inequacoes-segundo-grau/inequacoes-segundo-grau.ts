import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  Polinomio,
  Relacao,
  SIMBOLO_RELACAO,
  solucaoRealEmTex,
  solucaoRealEmTexto,
  numeroEmTexto,
  resolverInequacaoQuadraticaComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import {
  CurvaPlot,
  PontoPlot,
  SegmentoPlot,
} from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/algebra/inequacoes-segundo-grau/inequacoes-segundo-grau.i18n.json';
import { geradorInequacoesSegundoGrau } from '@features/algebra/inequacoes-segundo-grau/inequacoes-segundo-grau.gerador';
import { TEORIA_INEQUACOES_SEGUNDO_GRAU } from '@features/algebra/inequacoes-segundo-grau/inequacoes-segundo-grau.teoria';

const RELACOES: readonly { readonly valor: Relacao; readonly rotulo: string }[] = [
  { valor: '<', rotulo: '<' },
  { valor: '<=', rotulo: '≤' },
  { valor: '>', rotulo: '>' },
  { valor: '>=', rotulo: '≥' },
];

@Component({
  selector: 'app-inequacoes-segundo-grau',
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
  templateUrl: './inequacoes-segundo-grau.html',
  styleUrl: './inequacoes-segundo-grau.scss',
})
export class InequacoesSegundoGrau {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorInequacoesSegundoGrau;
  protected readonly conceitos = TEORIA_INEQUACOES_SEGUNDO_GRAU.map((teoria) => teoria.id);
  protected readonly relacoes = RELACOES;

  protected readonly a = signal(1);
  protected readonly b = signal(-1);
  protected readonly c = signal(-6);
  protected readonly relacao = signal<Relacao>('<');

  /** Com a = 0 não há trinômio; trocamos por 1. */
  protected readonly aEfetivo = computed(() => (this.a() === 0 ? 1 : this.a()));

  protected readonly resolucao = computed(() =>
    resolverInequacaoQuadraticaComPassos(this.aEfetivo(), this.b(), this.c(), this.relacao()),
  );

  protected readonly conjunto = computed(() => this.resolucao().resultado);
  protected readonly conjuntoTex = computed(() => solucaoRealEmTex(this.conjunto()));

  protected readonly enunciadoTex = computed(
    () =>
      `${Polinomio.de(this.c(), this.b(), this.aEfetivo()).paraTex()} ${SIMBOLO_RELACAO[this.relacao()]} 0`,
  );

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const [a, b, c] = [this.aEfetivo(), this.b(), this.c()];
    return [
      { fn: (x) => a * x * x + b * x + c, cor: 'serie-1', rotulo: this.texto('curvaTrinomio') },
    ];
  });

  /** Os pontos onde o trinômio zera, cheios se entram no conjunto. */
  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const [a, b, c] = [this.aEfetivo(), this.b(), this.c()];
    const delta = b * b - 4 * a * c;
    if (delta < 0) return [];
    const raizes =
      delta === 0
        ? [-b / (2 * a)]
        : [(-b - Math.sqrt(delta)) / (2 * a), (-b + Math.sqrt(delta)) / (2 * a)];
    const inclui = this.relacao().endsWith('=');
    return raizes.map((x) => ({
      x,
      y: 0,
      rotulo: this.texto('pontoRaiz', { valor: numeroEmTexto(x) }),
      cor: 'acento',
      vazado: !inclui,
    }));
  });

  /** O trecho do eixo x que resolve a inequação. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const conjunto = this.conjunto();
    const { xMin, xMax } = this.dominio();
    const faixa = (x1: number, x2: number, seta = false): SegmentoPlot => ({
      x1,
      y1: 0,
      x2,
      y2: 0,
      cor: 'acerto',
      seta,
    });

    switch (conjunto.tipo) {
      case 'vazio':
      case 'ponto':
        return [];
      case 'todos':
        return [faixa(xMin, xMax)];
      case 'exceto':
        return [faixa(conjunto.a, xMin, true), faixa(conjunto.a, xMax, true)];
      case 'entre':
        return [faixa(conjunto.a, conjunto.b)];
      case 'fora':
        return [faixa(conjunto.a, xMin, true), faixa(conjunto.b, xMax, true)];
    }
  });

  protected readonly dominio = computed(() => {
    const centro = -this.b() / (2 * this.aEfetivo());
    const alcance = Math.max(6, Math.abs(centro) + 5);
    return { xMin: centro - alcance, xMax: centro + alcance };
  });

  protected readonly vazio = computed(() => this.conjunto().tipo === 'vazio');

  protected readonly descricaoGrafico = computed(() =>
    this.texto('descricaoGrafico', { conjunto: solucaoRealEmTexto(this.conjunto()) }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_INEQUACOES_SEGUNDO_GRAU);
  }

  protected definirRelacao(relacao: Relacao): void {
    this.relacao.set(relacao);
  }
}
