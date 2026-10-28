import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ErroMatematico, Resolucao, SolucaoLinear, resolverLinearComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorEquacao1 } from './equacao-primeiro-grau.gerador';
import { TEORIA_EQUACAO_1 } from './equacao-primeiro-grau.teoria';

@Component({
  selector: 'app-equacao-primeiro-grau',
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
  templateUrl: './equacao-primeiro-grau.html',
  styleUrl: './equacao-primeiro-grau.scss',
})
export class EquacaoPrimeiroGrau {
  protected readonly gerador = geradorEquacao1;
  protected readonly conceitos = TEORIA_EQUACAO_1.map((teoria) => teoria.id);

  protected readonly a = signal(2);
  protected readonly b = signal(-6);
  protected readonly c = signal(0);

  /** A resolução, ou a razão pela qual ela não existe (a = 0). */
  private readonly analise = computed<
    | { readonly ok: true; readonly resolucao: Resolucao<SolucaoLinear> }
    | { readonly ok: false; readonly mensagem: string }
  >(() => {
    try {
      return { ok: true, resolucao: resolverLinearComPassos(this.a(), this.b(), this.c()) };
    } catch (erro) {
      return {
        ok: false,
        mensagem: erro instanceof ErroMatematico ? erro.message : 'Equação inválida.',
      };
    }
  });

  protected readonly erro = computed(() => {
    const analise = this.analise();
    return analise.ok ? null : analise.mensagem;
  });

  protected readonly passos = computed(() => {
    const analise = this.analise();
    return analise.ok ? analise.resolucao.passos : [];
  });

  protected readonly raiz = computed(() => {
    const analise = this.analise();
    return analise.ok ? analise.resolucao.resultado : null;
  });

  protected readonly equacaoTex = computed(() => {
    const a = this.a();
    const coeficiente = a === 1 ? '' : a === -1 ? '-' : String(a);
    return `${coeficiente}x ${this.b() >= 0 ? '+' : '-'} ${Math.abs(this.b())} = ${this.c()}`;
  });

  /**
   * A reta y = ax + b e a reta horizontal y = c. A raiz é a abscissa do
   * encontro — ver as duas deixa claro que resolver é cruzar gráficos.
   */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const a = this.a();
    const b = this.b();
    const c = this.c();

    return [
      {
        fn: (x) => a * x + b,
        cor: 'serie-1',
        rotulo: `y = ${this.equacaoTex().split('=')[0]!.trim()}`,
      },
      { fn: () => c, cor: 'serie-2', tracejada: true, rotulo: `y = ${c}` },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const raiz = this.raiz();
    if (raiz === null) {
      return [];
    }
    return [{ x: raiz.valor, y: this.c(), rotulo: `x = ${raiz.raiz}`, cor: 'acento' }];
  });

  protected readonly dominio = computed(() => {
    const raiz = this.raiz();
    const centro = raiz?.valor ?? 0;
    const alcance = Math.max(6, Math.abs(centro) * 1.8);
    return { xMin: centro - alcance, xMax: centro + alcance };
  });

  protected readonly descricaoGrafico = computed(() => {
    const raiz = this.raiz();
    return raiz === null
      ? 'Gráfico indisponível: o coeficiente de x é zero.'
      : `Reta cruzando a horizontal y igual a ${this.c()} no ponto x igual a ${raiz.raiz}.`;
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_EQUACAO_1);
  }
}
