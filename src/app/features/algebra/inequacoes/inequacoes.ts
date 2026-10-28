import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Relacao, SIMBOLO_RELACAO, resolverInequacaoComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot, SegmentoPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorInequacoes } from './inequacoes.gerador';
import { TEORIA_INEQUACOES } from './inequacoes.teoria';

const RELACOES: readonly { readonly valor: Relacao; readonly rotulo: string }[] = [
  { valor: '<', rotulo: '<' },
  { valor: '<=', rotulo: '≤' },
  { valor: '>', rotulo: '>' },
  { valor: '>=', rotulo: '≥' },
];

@Component({
  selector: 'app-inequacoes',
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
  templateUrl: './inequacoes.html',
  styleUrl: './inequacoes.scss',
})
export class Inequacoes {
  protected readonly gerador = geradorInequacoes;
  protected readonly conceitos = TEORIA_INEQUACOES.map((teoria) => teoria.id);
  protected readonly relacoes = RELACOES;

  protected readonly a = signal(-2);
  protected readonly b = signal(0);
  protected readonly c = signal(6);
  protected readonly relacao = signal<Relacao>('>');

  /** Coeficiente zero não define inequação do 1º grau; trocamos por 1. */
  protected readonly aEfetivo = computed(() => (this.a() === 0 ? 1 : this.a()));

  protected readonly resolucao = computed(() =>
    resolverInequacaoComPassos(this.aEfetivo(), this.b(), this.relacao(), this.c()),
  );

  protected readonly solucao = computed(() => this.resolucao().resultado);

  protected readonly houveInversao = computed(() => this.aEfetivo() < 0);

  protected readonly enunciadoTex = computed(() => {
    const a = this.aEfetivo();
    const coeficiente = a === 1 ? '' : a === -1 ? '-' : String(a);
    return (
      `${coeficiente}x ${this.b() >= 0 ? '+' : '-'} ${Math.abs(this.b())} ` +
      `${SIMBOLO_RELACAO[this.relacao()]} ${this.c()}`
    );
  });

  /** As duas retas: o lado esquerdo e o direito da inequação. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const a = this.aEfetivo();
    const b = this.b();
    const c = this.c();

    return [
      { fn: (x) => a * x + b, cor: 'serie-1', rotulo: 'lado esquerdo' },
      { fn: () => c, cor: 'serie-2', tracejada: true, rotulo: 'lado direito' },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const { fronteira, inclusiva } = this.solucao();
    return [
      {
        x: fronteira,
        y: this.c(),
        rotulo: `x = ${this.formatar(fronteira)}`,
        cor: 'acento',
        // Bolinha vazada quando a fronteira não pertence à solução.
        vazado: !inclusiva,
      },
    ];
  });

  /** A faixa da reta que satisfaz a inequação, desenhada sobre o eixo. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const { fronteira, relacao } = this.solucao();
    const { xMin, xMax } = this.dominio();
    const paraDireita = relacao === '>' || relacao === '>=';

    return [
      {
        x1: fronteira,
        y1: this.c(),
        x2: paraDireita ? xMax : xMin,
        y2: this.c(),
        cor: 'acerto',
        seta: true,
      },
    ];
  });

  protected readonly dominio = computed(() => {
    const centro = this.solucao().fronteira;
    const alcance = Math.max(6, Math.abs(centro) * 1.8);
    return { xMin: centro - alcance, xMax: centro + alcance };
  });

  protected readonly descricaoGrafico = computed(() => {
    const { fronteira, relacao } = this.solucao();
    const lado = relacao === '>' || relacao === '>=' ? 'à direita' : 'à esquerda';
    return `Reta cruzando a horizontal em x igual a ${this.formatar(fronteira)}; o conjunto solução fica ${lado}.`;
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_INEQUACOES);
  }

  protected definirRelacao(relacao: Relacao): void {
    this.relacao.set(relacao);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
