import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { analisarAfimComPassos } from '@core/math';
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
import { geradorAfim } from '@features/funcoes/funcao-afim/funcao-afim.gerador';
import { TEORIA_AFIM } from '@features/funcoes/funcao-afim/funcao-afim.teoria';

@Component({
  selector: 'app-funcao-afim',
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
  templateUrl: './funcao-afim.html',
  styleUrl: './funcao-afim.scss',
})
export class FuncaoAfim {
  protected readonly gerador = geradorAfim;
  protected readonly conceitos = TEORIA_AFIM.map((teoria) => teoria.id);

  protected readonly a = signal(2);
  protected readonly b = signal(-4);

  protected readonly analise = computed(() => analisarAfimComPassos(this.a(), this.b()));
  protected readonly resultado = computed(() => this.analise().resultado);

  protected readonly funcaoTex = computed(() => {
    const a = this.a();
    const coeficiente = a === 1 ? '' : a === -1 ? '-' : String(a);
    return `f(x) = ${a === 0 ? '' : `${coeficiente}x`} ${this.b() >= 0 ? '+' : '-'} ${Math.abs(this.b())}`;
  });

  protected readonly comportamento = computed(() => {
    const { constante, crescente } = this.resultado();
    if (constante) {
      return 'Constante: a reta é horizontal e o valor nunca muda.';
    }
    return crescente
      ? 'Crescente: cada passo à direita aumenta o valor.'
      : 'Decrescente: cada passo à direita diminui o valor.';
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const a = this.a();
    const b = this.b();
    return [{ fn: (x) => a * x + b, cor: 'serie-1', rotulo: 'f(x) = ax + b' }];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const { raiz, interceptoY } = this.resultado();
    const marcados: PontoPlot[] = [
      { x: 0, y: interceptoY, rotulo: `b = ${interceptoY}`, cor: 'serie-2' },
    ];

    if (raiz !== null) {
      marcados.push({ x: raiz, y: 0, rotulo: `raiz = ${formatar(raiz)}`, cor: 'acento' });
    }

    return marcados;
  });

  /**
   * O triângulo que materializa a taxa de variação: um passo de 1 na
   * horizontal corresponde a um passo de `a` na vertical.
   */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const a = this.a();
    const b = this.b();

    if (a === 0) {
      return [];
    }

    const x0 = 1;
    const y0 = a * x0 + b;

    return [
      { x1: x0, y1: y0, x2: x0 + 1, y2: y0, cor: 'serie-3', rotulo: 'Δx = 1' },
      { x1: x0 + 1, y1: y0, x2: x0 + 1, y2: a * (x0 + 1) + b, cor: 'serie-3', seta: true },
    ];
  });

  protected readonly dominio = computed(() => {
    const raiz = this.resultado().raiz ?? 0;
    const alcance = Math.max(6, Math.abs(raiz) * 1.6);
    return { xMin: raiz - alcance, xMax: raiz + alcance };
  });

  protected readonly descricaoGrafico = computed(() => {
    const { raiz } = this.resultado();
    return raiz === null
      ? 'Reta horizontal, sem raiz.'
      : `Reta cruzando o eixo x em ${formatar(raiz)} e o eixo y em ${this.b()}.`;
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_AFIM);
  }

  protected formatar(valor: number): string {
    return formatar(valor);
  }
}

function formatar(valor: number): string {
  return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
}
