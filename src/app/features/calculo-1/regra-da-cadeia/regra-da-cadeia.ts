import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { derivadaNumerica } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot } from '@shared/components/math-plot/math-plot.model';
import { geradorCadeia } from './regra-da-cadeia.gerador';
import { TEORIA_CADEIA } from './regra-da-cadeia.teoria';

@Component({
  selector: 'app-regra-da-cadeia',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    ConceitosTopico,
    ControleParametro,
    Formula,
    MathPlot,
    TopicoLayout,
  ],
  templateUrl: './regra-da-cadeia.html',
  styleUrl: './regra-da-cadeia.scss',
})
export class RegraDaCadeia {
  protected readonly gerador = geradorCadeia;
  protected readonly conceitos = TEORIA_CADEIA.map((teoria) => teoria.id);

  protected readonly a = signal(2);
  protected readonly b = signal(1);
  protected readonly n = signal(2);
  protected readonly ponto = signal(1);

  protected readonly fn = computed(() => {
    const [a, b, n] = [this.a(), this.b(), this.n()];
    return (x: number) => (a * x + b) ** n;
  });

  protected readonly internoNoPonto = computed(() => this.a() * this.ponto() + this.b());

  /** O valor correto, pela cadeia. */
  protected readonly comCadeia = computed(
    () => this.n() * this.internoNoPonto() ** (this.n() - 1) * this.a(),
  );

  /** O erro clássico: esquecer o fator interno. */
  protected readonly semFatorInterno = computed(
    () => this.n() * this.internoNoPonto() ** (this.n() - 1),
  );

  /** Verificação independente, por derivação numérica. */
  protected readonly numerica = computed(() => derivadaNumerica(this.fn(), this.ponto()));

  protected readonly funcaoTex = computed(() => {
    const interno = `${this.a() === 1 ? '' : this.a()}x ${this.b() >= 0 ? '+' : '-'} ${Math.abs(this.b())}`;
    return `f(x) = \\left(${interno}\\right)^{${this.n()}}`;
  });

  protected readonly derivadaTex = computed(() => {
    const interno = `${this.a() === 1 ? '' : this.a()}x ${this.b() >= 0 ? '+' : '-'} ${Math.abs(this.b())}`;
    return `f'(x) = ${this.n()}\\left(${interno}\\right)^{${this.n() - 1}} \\cdot ${this.a()}`;
  });

  /** A função, a derivada correta e a versão sem o fator interno. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const [a, b, n] = [this.a(), this.b(), this.n()];

    return [
      { fn: this.fn(), cor: 'serie-1', rotulo: 'f(x)' },
      {
        fn: (x) => n * (a * x + b) ** (n - 1) * a,
        cor: 'acento',
        rotulo: "f'(x) correta",
      },
      {
        fn: (x) => n * (a * x + b) ** (n - 1),
        cor: 'erro',
        tracejada: true,
        rotulo: 'sem o fator interno (errada)',
      },
    ];
  });

  protected readonly dominio = computed(() => ({ xMin: -3, xMax: 3 }));

  protected readonly descricaoGrafico = computed(
    () =>
      'Função composta, sua derivada correta e a versão errada que esquece o fator interno; ' +
      `as duas diferem por um fator ${this.a()}.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_CADEIA);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
