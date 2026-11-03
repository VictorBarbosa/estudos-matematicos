import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Quadrica, avaliarQuadrica, quadricaParaTex } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot } from '@shared/components/math-plot/models/math-plot.model';
import { geradorFuncoesVariasVariaveis } from '@features/calculo-3/funcoes-de-varias-variaveis/funcoes-de-varias-variaveis.gerador';
import { TEORIA_MULTIVAR } from '@features/calculo-3/funcoes-de-varias-variaveis/funcoes-de-varias-variaveis.teoria';

@Component({
  selector: 'app-funcoes-de-varias-variaveis',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './funcoes-de-varias-variaveis.html',
  styleUrl: './funcoes-de-varias-variaveis.scss',
})
export class FuncoesDeVariasVariaveis {
  protected readonly gerador = geradorFuncoesVariasVariaveis;
  protected readonly conceitos = TEORIA_MULTIVAR.map((teoria) => teoria.id);

  protected readonly a = signal(1);
  protected readonly b = signal(1);
  protected readonly c = signal(0);
  /** O plano de corte, que transforma a superfície numa curva. */
  protected readonly yDoCorte = signal(1);

  protected readonly funcao = computed<Quadrica>(() => ({
    a: this.a(),
    b: this.b(),
    c: this.c(),
    d: 0,
    e: 0,
    f0: 0,
  }));

  protected readonly funcaoTex = computed(() => `f(x,y) = ${quadricaParaTex(this.funcao())}`);

  protected readonly tipo = computed(() => {
    const determinante = 4 * this.a() * this.b() - this.c() * this.c();
    if (determinante < 0) {
      return 'sela';
    }
    if (determinante === 0) {
      return 'calha';
    }
    return this.a() > 0 ? 'paraboloide para cima' : 'paraboloide para baixo';
  });

  protected readonly noCorte = computed(() =>
    avaliarQuadrica(this.funcao(), 0, this.yDoCorte()),
  );

  /** Vários cortes da superfície, cada um uma função de uma variável só. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const q = this.funcao();
    const cores = ['texto-suave', 'serie-2', 'acento', 'serie-4', 'serie-5'] as const;

    return [-2, -1, 0, 1, 2].map((y, indice) => ({
      fn: (x: number) => avaliarQuadrica(q, x, y === 0 ? this.yDoCorte() : y),
      cor: cores[indice],
      rotulo: y === 0 ? `y = ${this.yDoCorte()}` : `y = ${y}`,
    }));
  });

  protected readonly dominio = computed(() => ({ xMin: -4, xMax: 4 }));

  protected readonly descricaoGrafico = computed(
    () =>
      'Cortes verticais da superfície: cada curva é a função com um y fixo, e juntas elas ' +
      'descrevem o relevo inteiro.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_MULTIVAR);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
