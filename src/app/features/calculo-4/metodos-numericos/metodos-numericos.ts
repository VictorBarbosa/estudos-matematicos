import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rungeKutta4 } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { geradorMetodosNumericos } from '@features/calculo-4/metodos-numericos/metodos-numericos.gerador';
import { TEORIA_NUMERICO } from '@features/calculo-4/metodos-numericos/metodos-numericos.teoria';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/calculo-4/metodos-numericos/metodos-numericos.i18n.json';

@Component({
  selector: 'app-metodos-numericos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './metodos-numericos.html',
  styleUrl: './metodos-numericos.scss',
})
export class MetodosNumericos {
  protected readonly gerador = geradorMetodosNumericos;
  protected readonly conceitos = TEORIA_NUMERICO.map((teoria) => teoria.id);
  protected readonly texto = textoLocal(textos);

  /** A taxa e o passo em décimos, que é a granularidade que interessa aqui. */
  protected readonly decimosDeK = signal(8);
  protected readonly decimosDoPasso = signal(5);
  protected readonly y0 = signal(1);
  protected readonly tempo = signal(3);

  protected readonly k = computed(() => this.decimosDeK() / 10);
  protected readonly passo = computed(() => this.decimosDoPasso() / 10);
  protected readonly quantos = computed(() => Math.round(this.tempo() / this.passo()));

  protected readonly exato = computed(() => this.y0() * Math.exp(this.k() * this.tempo()));

  /** Os valores intermediários de Euler, que são o que o gráfico mostra. */
  protected readonly trilhaDeEuler = computed(() => {
    const trilha = [this.y0()];
    let y = this.y0();

    for (let i = 0; i < this.quantos(); i++) {
      y += this.passo() * this.k() * y;
      trilha.push(y);
    }

    return trilha;
  });

  protected readonly euler = computed(() => this.trilhaDeEuler().at(-1)!);

  protected readonly rk = computed(() =>
    rungeKutta4(this.k(), this.y0(), this.passo(), this.quantos()),
  );

  protected readonly erroDeEuler = computed(() => Math.abs(this.exato() - this.euler()));
  protected readonly erroDeRk = computed(() => Math.abs(this.exato() - this.rk()));

  protected readonly equacaoTex = computed(
    () => `y' = ${this.tex(this.k())}y, \\qquad y(0) = ${this.y0()}`,
  );

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const [k, y0] = [this.k(), this.y0()];
    const trilha = this.trilhaDeEuler();
    const passo = this.passo();

    return [
      { fn: (t) => y0 * Math.exp(k * t), cor: 'serie-1', rotulo: 'solução exata' },
      {
        fn: (t) => {
          const indice = Math.floor(t / passo);
          if (indice < 0 || indice >= trilha.length - 1) {
            return trilha.at(-1) ?? Number.NaN;
          }
          const fracao = (t - indice * passo) / passo;
          return trilha[indice]! + fracao * (trilha[indice + 1]! - trilha[indice]!);
        },
        cor: 'acento',
        tracejada: true,
        rotulo: 'Euler',
      },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() =>
    this.trilhaDeEuler().map((y, indice) => ({
      x: indice * this.passo(),
      y,
      cor: 'acento' as const,
    })),
  );

  protected readonly dominio = computed(() => ({ xMin: 0, xMax: this.tempo() }));

  protected readonly descricaoGrafico = computed(
    () =>
      this.texto('descricaoGrafico'),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_NUMERICO);
  }

  protected formatar(valor: number): string {
    if (valor !== 0 && Math.abs(valor) < 1e-4) {
      return valor.toExponential(3).replace('.', ',');
    }
    return Number(valor.toFixed(6)).toLocaleString('pt-BR', { maximumFractionDigits: 6 });
  }

  private tex(valor: number): string {
    return String(Number(valor.toFixed(4))).replace('.', '{,}');
  }
}
