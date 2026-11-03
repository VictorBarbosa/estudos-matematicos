import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot } from '@shared/components/math-plot/models/math-plot.model';
import { geradorAplicacoesDeEdo } from '@features/calculo-4/aplicacoes-de-edo/aplicacoes-de-edo.gerador';
import { TEORIA_APLICACOES_EDO } from '@features/calculo-4/aplicacoes-de-edo/aplicacoes-de-edo.teoria';

/** As quatro situações que o tópico percorre, todas com a mesma equação por trás. */
const CENARIOS = [
  { nome: 'resfriamento', unidade: '°C', rotuloFinal: 'temperatura do ambiente' },
  { nome: 'decaimento', unidade: 'g', rotuloFinal: 'zero, no limite' },
  { nome: 'circuito RL', unidade: 'A', rotuloFinal: 'corrente de regime' },
  { nome: 'tanque de mistura', unidade: 'kg', rotuloFinal: 'equilíbrio de concentração' },
] as const;

@Component({
  selector: 'app-aplicacoes-de-edo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './aplicacoes-de-edo.html',
  styleUrl: './aplicacoes-de-edo.scss',
})
export class AplicacoesDeEdo {
  protected readonly gerador = geradorAplicacoesDeEdo;
  protected readonly conceitos = TEORIA_APLICACOES_EDO.map((teoria) => teoria.id);
  protected readonly cenarios = CENARIOS;

  protected readonly escolha = signal(0);
  protected readonly inicial = signal(90);
  protected readonly alvo = signal(20);
  /** A constante de decaimento em centésimos. */
  protected readonly centesimosDeK = signal(10);

  protected readonly k = computed(() => this.centesimosDeK() / 100);
  protected readonly cenario = computed(() => CENARIOS[this.escolha()]!);

  protected readonly constanteDeTempo = computed(() => 1 / this.k());
  protected readonly meiaVida = computed(() => Math.log(2) / this.k());

  protected readonly equacaoTex = computed(
    () => `\\frac{dy}{dt} = -${this.tex(this.k())}\\left(y - ${this.tex(this.alvo())}\\right)`,
  );

  protected readonly solucaoTex = computed(
    () =>
      `y(t) = ${this.tex(this.alvo())} + \\left(${this.tex(this.inicial())} - ` +
      `${this.tex(this.alvo())}\\right)e^{-${this.tex(this.k())}t}`,
  );

  protected readonly emUmaConstante = computed(
    () => this.alvo() + (this.inicial() - this.alvo()) * Math.exp(-1),
  );

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const [k, inicial, alvo] = [this.k(), this.inicial(), this.alvo()];

    return [
      { fn: () => alvo, cor: 'texto-suave', tracejada: true, rotulo: 'valor final' },
      {
        fn: (t) => alvo + (inicial - alvo) * Math.exp(-k * t),
        cor: 'acento',
        rotulo: 'solução',
      },
      {
        fn: (t) => inicial - (inicial - alvo) * k * t,
        cor: 'erro',
        tracejada: true,
        rotulo: 'aproximação linear (errada)',
      },
    ];
  });

  protected readonly dominio = computed(() => ({ xMin: 0, xMax: 6 / this.k() }));

  protected readonly descricaoGrafico = computed(
    () =>
      'Solução exponencial e a reta tangente inicial: a aproximação linear só vale para tempos ' +
      'curtos, e logo se afasta.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_APLICACOES_EDO);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }

  private tex(valor: number): string {
    return String(Number(valor.toFixed(4))).replace('.', '{,}');
  }
}
