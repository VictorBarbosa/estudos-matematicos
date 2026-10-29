import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Polinomio, resolverQuadraticaComPassos } from '@core/math';
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
import { geradorQuadratica } from '@features/funcoes/funcao-quadratica/funcao-quadratica.gerador';
import { TEORIA_QUADRATICA } from '@features/funcoes/funcao-quadratica/funcao-quadratica.teoria';

@Component({
  selector: 'app-funcao-quadratica',
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
  templateUrl: './funcao-quadratica.html',
  styleUrl: './funcao-quadratica.scss',
})
export class FuncaoQuadratica {
  protected readonly gerador = geradorQuadratica;
  protected readonly conceitos = TEORIA_QUADRATICA.map((teoria) => teoria.id);

  protected readonly a = signal(1);
  protected readonly b = signal(-4);
  protected readonly c = signal(3);

  protected readonly aEfetivo = computed(() => (this.a() === 0 ? 1 : this.a()));

  protected readonly analise = computed(() =>
    resolverQuadraticaComPassos(this.aEfetivo(), this.b(), this.c()),
  );

  protected readonly solucao = computed(() => this.analise().resultado);

  protected readonly funcaoTex = computed(
    () => `f(x) = ${Polinomio.de(this.c(), this.b(), this.aEfetivo()).paraTex()}`,
  );

  /** A forma canônica, que exibe o vértice diretamente na expressão. */
  protected readonly formaCanonica = computed(() => {
    const a = this.aEfetivo();
    const { vertice } = this.solucao();
    const coeficiente = a === 1 ? '' : a === -1 ? '-' : String(a);
    const deslocamento = vertice.x === 0 ? 'x' : `\\left(x ${vertice.x > 0 ? '-' : '+'} ${formatar(Math.abs(vertice.x))}\\right)`;
    const altura = vertice.y === 0 ? '' : ` ${vertice.y > 0 ? '+' : '-'} ${formatar(Math.abs(vertice.y))}`;

    return `f(x) = ${coeficiente}${deslocamento}^{2}${altura}`;
  });

  protected readonly concavidade = computed(() =>
    this.aEfetivo() > 0
      ? 'Abre para cima: o vértice é o ponto de MÍNIMO.'
      : 'Abre para baixo: o vértice é o ponto de MÁXIMO.',
  );

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const a = this.aEfetivo();
    const b = this.b();
    const c = this.c();
    return [{ fn: (x) => a * x * x + b * x + c, cor: 'serie-1', rotulo: 'f(x)' }];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const { raizes, vertice } = this.solucao();

    return [
      ...raizes.map((raiz) => ({
        x: raiz,
        y: 0,
        rotulo: `raiz ${formatar(raiz)}`,
        cor: 'acento' as const,
      })),
      {
        x: vertice.x,
        y: vertice.y,
        rotulo: `vértice (${formatar(vertice.x)}, ${formatar(vertice.y)})`,
        cor: 'serie-2' as const,
      },
    ];
  });

  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const { vertice } = this.solucao();
    const altura = Math.max(5, Math.abs(vertice.y) * 2.5);

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
    const pontos = [vertice.x, ...raizes];
    const alcance = Math.max(5, (Math.max(...pontos) - Math.min(...pontos)) * 1.5 + 3);
    return { xMin: vertice.x - alcance, xMax: vertice.x + alcance };
  });

  protected readonly descricaoGrafico = computed(() => {
    const { quantidadeDeRaizes } = this.solucao();
    return (
      `Parábola abrindo para ${this.aEfetivo() > 0 ? 'cima' : 'baixo'}, com ` +
      `${quantidadeDeRaizes} ${quantidadeDeRaizes === 1 ? 'raiz' : 'raízes'} e o eixo de simetria tracejado.`
    );
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_QUADRATICA);
  }

  protected formatar(valor: number): string {
    return formatar(valor);
  }
}

function formatar(valor: number): string {
  return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
}
