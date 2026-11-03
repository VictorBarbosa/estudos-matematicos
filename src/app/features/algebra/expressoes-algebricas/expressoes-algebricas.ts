import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Polinomio } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/algebra/expressoes-algebricas/expressoes-algebricas.i18n.json';
import { geradorExpressoes } from '@features/algebra/expressoes-algebricas/expressoes-algebricas.gerador';
import { TEORIA_EXPRESSOES } from '@features/algebra/expressoes-algebricas/expressoes-algebricas.teoria';

@Component({
  selector: 'app-expressoes-algebricas',
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
  templateUrl: './expressoes-algebricas.html',
  styleUrl: './expressoes-algebricas.scss',
})
export class ExpressoesAlgebricas {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorExpressoes;
  protected readonly conceitos = TEORIA_EXPRESSOES.map((teoria) => teoria.id);

  protected readonly a = signal(2);
  protected readonly b = signal(-3);
  protected readonly c = signal(1);
  protected readonly x = signal(3);

  protected readonly expressao = computed(() => Polinomio.de(this.c(), this.b(), this.a()));

  protected readonly valor = computed(() => this.expressao().avaliar(this.x()));

  /** A substituição escrita termo a termo, antes de qualquer conta. */
  protected readonly substituicao = computed(() => {
    const x = this.x();
    const entreParenteses = x < 0 ? `(${x})` : String(x);
    debugger;

    return (
      `${this.a()}.${entreParenteses} ^{2} ` +
      `${this.b() >= 0 ? '+' : '-'} ${Math.abs(this.b())}.${entreParenteses} ` +
      `${this.c() >= 0 ? '+' : '-'} ${Math.abs(this.c())}`
    );
  });

  protected readonly passos = computed(() => [
    {
      descricao: this.texto('passoSubstituir', { x: this.x() }),
      tex: this.substituicao(),
    },
    {
      descricao: this.texto('passoPotencias'),
      tex:
        `${this.a()} \\cdot ${this.x() * this.x()} ` +
        `${this.b() >= 0 ? '+' : '-'} ${Math.abs(this.b())} \\cdot ${this.x() < 0 ? `(${this.x()})` : this.x()} ` +
        `${this.c() >= 0 ? '+' : '-'} ${Math.abs(this.c())}`,
    },
    {
      descricao: this.texto('passoProdutos'),
      tex: `= ${this.valor()}`,
    },
  ]);

  /**
   * A expressão desenhada como função. Cada valor de x escolhido é um ponto
   * sobre a curva — avaliar uma expressão é ler uma altura no gráfico.
   */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const expressao = this.expressao();
    return [
      { fn: (x) => expressao.avaliar(x), cor: 'serie-1', rotulo: this.texto('curvaExpressao') },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    {
      x: this.x(),
      y: this.valor(),
      rotulo: `(${this.x()}, ${Number(this.valor().toFixed(2))})`,
      cor: 'acento',
    },
  ]);

  protected readonly dominio = computed(() => ({ xMin: -6, xMax: 6 }));

  protected readonly descricaoGrafico = computed(() =>
    this.texto('descricaoGrafico', { x: this.x() }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_EXPRESSOES);
  }
}
