import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { divisaoProporcionalComPassos, razaoComPassos, regraDeTresComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorProporcao } from './razao-proporcao.gerador';
import { TEORIA_PROPORCAO } from './razao-proporcao.teoria';

@Component({
  selector: 'app-razao-proporcao',
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
  templateUrl: './razao-proporcao.html',
  styleUrl: './razao-proporcao.scss',
})
export class RazaoProporcao {
  protected readonly gerador = geradorProporcao;
  protected readonly conceitos = TEORIA_PROPORCAO.map((teoria) => teoria.id);

  protected readonly a = signal(4);
  protected readonly b = signal(12);
  protected readonly c = signal(6);
  protected readonly inversa = signal(false);

  protected readonly total = signal(500);
  protected readonly peso1 = signal(2);
  protected readonly peso2 = signal(3);

  protected readonly razao = computed(() => razaoComPassos(this.a(), this.b()));

  protected readonly resolucao = computed(() =>
    regraDeTresComPassos(this.a(), this.b(), this.c(), this.inversa()),
  );

  protected readonly resultadoDireto = computed(
    () => regraDeTresComPassos(this.a(), this.b(), this.c(), false).resultado,
  );
  protected readonly resultadoInverso = computed(
    () => regraDeTresComPassos(this.a(), this.b(), this.c(), true).resultado,
  );

  protected readonly divisao = computed(() =>
    divisaoProporcionalComPassos(this.total(), [this.peso1(), this.peso2()]),
  );

  /**
   * As duas leis no mesmo gráfico: a direta é uma reta pela origem, a inversa
   * é uma hipérbole. Ver as duas lado a lado é o que fixa a diferença.
   */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const a = this.a();
    const b = this.b();

    return [
      {
        fn: (x) => (b / a) * x,
        cor: 'serie-1',
        rotulo: 'direta: y = kx',
        tracejada: this.inversa(),
      },
      {
        fn: (x) => (x === 0 ? Number.NaN : (a * b) / x),
        cor: 'serie-2',
        rotulo: 'inversa: y = k/x',
        tracejada: !this.inversa(),
      },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    { x: this.a(), y: this.b(), rotulo: 'dado', cor: 'texto-suave' },
    {
      x: this.c(),
      y: this.resolucao().resultado,
      rotulo: `x = ${this.formatar(this.resolucao().resultado)}`,
      cor: 'acento',
    },
  ]);

  protected readonly dominio = computed(() => {
    const maiorX = Math.max(this.a(), this.c()) * 1.6;
    const maiorY = Math.max(this.b(), this.resolucao().resultado) * 1.4;
    return { xMin: 0, xMax: maiorX, yMin: 0, yMax: maiorY };
  });

  protected readonly descricaoGrafico = computed(
    () =>
      `Comparação entre proporcionalidade direta, uma reta pela origem, e inversa, ` +
      `uma hipérbole. O ponto de resposta está em x igual a ${this.c()}.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_PROPORCAO);
  }

  protected alternarTipo(inversa: boolean): void {
    this.inversa.set(inversa);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
