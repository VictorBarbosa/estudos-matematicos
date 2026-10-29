import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  Polinomio,
  formaFatoradaParaTex,
  relacoesDeGirard,
  resolverQuadraticaComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot, SegmentoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorEquacao2 } from '@features/algebra/equacao-segundo-grau/equacao-segundo-grau.gerador';
import { TEORIA_EQUACAO_2 } from '@features/algebra/equacao-segundo-grau/equacao-segundo-grau.teoria';

@Component({
  selector: 'app-equacao-segundo-grau',
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
  templateUrl: './equacao-segundo-grau.html',
  styleUrl: './equacao-segundo-grau.scss',
})
export class EquacaoSegundoGrau {
  protected readonly gerador = geradorEquacao2;
  protected readonly conceitos = TEORIA_EQUACAO_2.map((teoria) => teoria.id);

  protected readonly a = signal(1);
  protected readonly b = signal(-5);
  protected readonly c = signal(6);

  /** O coeficiente líder nunca é zero: o controle pula o valor. */
  protected readonly aEfetivo = computed(() => (this.a() === 0 ? 1 : this.a()));

  protected readonly resolucao = computed(() =>
    resolverQuadraticaComPassos(this.aEfetivo(), this.b(), this.c()),
  );

  protected readonly solucao = computed(() => this.resolucao().resultado);

  protected readonly equacaoTex = computed(
    () => `${Polinomio.de(this.c(), this.b(), this.aEfetivo()).paraTex()} = 0`,
  );

  protected readonly formaFatorada = computed(() =>
    formaFatoradaParaTex(this.aEfetivo(), this.solucao().raizes),
  );

  protected readonly girard = computed(() => relacoesDeGirard(this.aEfetivo(), this.b(), this.c()));

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const a = this.aEfetivo();
    const b = this.b();
    const c = this.c();

    return [{ fn: (x) => a * x * x + b * x + c, cor: 'serie-1', rotulo: 'y = ax² + bx + c' }];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const { raizes, vertice } = this.solucao();

    return [
      ...raizes.map((raiz, indice) => ({
        x: raiz,
        y: 0,
        rotulo: `x${indice + 1} = ${formatar(raiz)}`,
        cor: 'acento' as const,
      })),
      { x: vertice.x, y: vertice.y, rotulo: 'vértice', cor: 'serie-2' as const },
    ];
  });

  /** O eixo de simetria, que passa pelo vértice. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const { vertice } = this.solucao();
    const altura = Math.max(4, Math.abs(vertice.y) * 2);

    return [
      {
        x1: vertice.x,
        y1: vertice.y - altura,
        x2: vertice.x,
        y2: vertice.y + altura,
        cor: 'texto-suave',
        tracejado: true,
      },
    ];
  });

  protected readonly dominio = computed(() => {
    const { vertice, raizes } = this.solucao();
    const extremos = [vertice.x, ...raizes];
    const centro = vertice.x;
    const alcance = Math.max(5, (Math.max(...extremos) - Math.min(...extremos)) * 1.5 + 3);

    return { xMin: centro - alcance, xMax: centro + alcance };
  });

  protected readonly descricaoGrafico = computed(() => {
    const { quantidadeDeRaizes } = this.solucao();
    const cruzamentos =
      quantidadeDeRaizes === 0
        ? 'não cruza o eixo x'
        : quantidadeDeRaizes === 1
          ? 'toca o eixo x em um ponto'
          : 'cruza o eixo x em dois pontos';

    return `Parábola que ${cruzamentos}, com o vértice e o eixo de simetria destacados.`;
  });

  protected readonly resumoDelta = computed(() => {
    const { delta, quantidadeDeRaizes } = this.solucao();

    if (quantidadeDeRaizes === 2) {
      return 'Δ > 0: a parábola cruza o eixo x em dois pontos distintos.';
    }
    if (quantidadeDeRaizes === 1) {
      return 'Δ = 0: a parábola tangencia o eixo x, e a única raiz é o vértice.';
    }
    return `Δ = ${formatar(delta)} < 0: a parábola não toca o eixo x, então não há raiz real.`;
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_EQUACAO_2);
  }

  protected formatar(valor: number): string {
    return formatar(valor);
  }
}

function formatar(valor: number): string {
  return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
}
