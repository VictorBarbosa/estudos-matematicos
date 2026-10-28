import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Polinomio, derivarPolinomioComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorRegras } from './regras-de-derivacao.gerador';
import { TEORIA_REGRAS } from './regras-de-derivacao.teoria';

@Component({
  selector: 'app-regras-de-derivacao',
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
  templateUrl: './regras-de-derivacao.html',
  styleUrl: './regras-de-derivacao.scss',
})
export class RegrasDeDerivacao {
  protected readonly gerador = geradorRegras;
  protected readonly conceitos = TEORIA_REGRAS.map((teoria) => teoria.id);

  protected readonly a = signal(1);
  protected readonly b = signal(-3);
  protected readonly c = signal(0);
  protected readonly d = signal(2);

  protected readonly ponto = signal(1);

  protected readonly funcao = computed(() =>
    Polinomio.de(this.d(), this.c(), this.b(), this.a()),
  );

  protected readonly derivada = computed(() => this.funcao().derivar());
  protected readonly segunda = computed(() => this.derivada().derivar());

  /**
   * Rótulos em TeX montados aqui, e não no template: a notação de linha usa
   * apóstrofo, que brigaria com as aspas da expressão no HTML.
   */
  protected readonly funcaoTex = computed(() => `f(x) = ${this.funcao().paraTex()}`);
  protected readonly derivadaTex = computed(() => `f'(x) = ${this.derivada().paraTex()}`);
  protected readonly segundaTex = computed(() => `f''(x) = ${this.segunda().paraTex()}`);
  protected readonly regraProdutoTex = String.raw`(f \cdot g)' = f'g + fg'`;

  protected readonly analise = computed(() => derivarPolinomioComPassos(this.funcao()));

  protected readonly inclinacao = computed(() => this.derivada().avaliar(this.ponto()));

  /** A função, sua derivada e a tangente no ponto escolhido. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const f = this.funcao();
    const df = this.derivada();
    const x0 = this.ponto();
    const y0 = f.avaliar(x0);
    const m = this.inclinacao();

    return [
      { fn: (x) => f.avaliar(x), cor: 'serie-1', rotulo: 'f(x)' },
      { fn: (x) => df.avaliar(x), cor: 'serie-2', rotulo: "f'(x)" },
      {
        fn: (x) => y0 + m * (x - x0),
        cor: 'acento',
        tracejada: true,
        rotulo: 'tangente',
      },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    {
      x: this.ponto(),
      y: this.funcao().avaliar(this.ponto()),
      rotulo: `f(${this.ponto()})`,
      cor: 'serie-1',
    },
    {
      x: this.ponto(),
      y: this.inclinacao(),
      rotulo: `f'(${this.ponto()}) = ${this.formatar(this.inclinacao())}`,
      cor: 'serie-2',
    },
  ]);

  protected readonly dominio = computed(() => ({ xMin: -4, xMax: 4 }));

  protected readonly descricaoGrafico = computed(
    () =>
      `Função, sua derivada e a reta tangente em x igual a ${this.ponto()}, cuja inclinação ` +
      `é ${this.formatar(this.inclinacao())}.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_REGRAS);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
