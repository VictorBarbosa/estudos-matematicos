import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { areaEntreCurvas, integralNumerica } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { AreaPlot, CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/calculo-2/aplicacoes-da-integral/aplicacoes-da-integral.i18n.json';
import { geradorAplicacoesIntegral } from '@features/calculo-2/aplicacoes-da-integral/aplicacoes-da-integral.gerador';
import { TEORIA_APLICACOES_INTEGRAL } from '@features/calculo-2/aplicacoes-da-integral/aplicacoes-da-integral.teoria';

type Aplicacao = 'area' | 'volume' | 'comprimento';

@Component({
  selector: 'app-aplicacoes-da-integral',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    ConceitosTopico,
    ControleParametro,
    Formula,
    MathPlot,
    TopicoLayout,
  ],
  templateUrl: './aplicacoes-da-integral.html',
  styleUrl: './aplicacoes-da-integral.scss',
})
export class AplicacoesDaIntegral {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorAplicacoesIntegral;
  protected readonly conceitos = TEORIA_APLICACOES_INTEGRAL.map((teoria) => teoria.id);

  protected readonly aplicacao = signal<Aplicacao>('area');

  protected readonly a = signal(3);
  protected readonly ate = signal(3);

  protected readonly aplicacoes: readonly { valor: Aplicacao; rotulo: string }[] = [
    { valor: 'area', rotulo: 'rotuloArea' },
    { valor: 'volume', rotulo: 'rotuloVolume' },
    { valor: 'comprimento', rotulo: 'rotuloComprimento' },
  ];

  /** As duas curvas da região: a reta y = ax e a parábola y = x². */
  protected readonly reta = computed(() => (x: number) => this.a() * x);
  protected readonly parabola = (x: number): number => x * x;

  /** Elas se cruzam em 0 e em a. */
  protected readonly intersecao = computed(() => this.a());

  protected readonly area = computed(() =>
    areaEntreCurvas(this.reta(), this.parabola, 0, this.intersecao()),
  );

  protected readonly volume = computed(() => {
    const f = this.reta();
    return Math.PI * integralNumerica((x) => f(x) ** 2, 0, this.ate());
  });

  /** Comprimento da reta: a derivada é constante, então a integral é direta. */
  protected readonly comprimento = computed(() => {
    const inclinacao = this.a();
    return integralNumerica(() => Math.sqrt(1 + inclinacao * inclinacao), 0, this.ate());
  });

  protected readonly formulaTex = computed(() => {
    switch (this.aplicacao()) {
      case 'area':
        return `A = \\int_{0}^{${this.intersecao()}} \\left(${this.a()}x - x^{2}\\right) dx = ${this.formatar(this.area())}`;
      case 'volume':
        return `V = \\pi\\int_{0}^{${this.ate()}} \\left(${this.a()}x\\right)^{2} dx = ${this.formatar(this.volume())}`;
      case 'comprimento':
        return `L = \\int_{0}^{${this.ate()}} \\sqrt{1 + ${this.a() ** 2}}\\,dx = ${this.formatar(this.comprimento())}`;
    }
  });

  protected readonly explicacao = computed(() => {
    switch (this.aplicacao()) {
      case 'area':
        return this.texto('explArea');
      case 'volume':
        return this.texto('explVolume');
      case 'comprimento':
        return this.texto('explComprimento');
    }
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    if (this.aplicacao() === 'area') {
      return [
        { fn: this.reta(), cor: 'serie-1', rotulo: `y = ${this.a()}x` },
        { fn: this.parabola, cor: 'serie-2', rotulo: 'y = x²' },
      ];
    }

    return [{ fn: this.reta(), cor: 'serie-1', rotulo: `y = ${this.a()}x` }];
  });

  protected readonly areas = computed<readonly AreaPlot[]>(() => {
    if (this.aplicacao() === 'area') {
      // A região entre as curvas, desenhada como a diferença.
      return [
        {
          fn: (x) => this.reta()(x) - this.parabola(x),
          de: 0,
          ate: this.intersecao(),
          cor: 'acento',
        },
      ];
    }

    return [{ fn: this.reta(), de: 0, ate: this.ate(), cor: 'acento' }];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    if (this.aplicacao() !== 'area') {
      return [];
    }

    const k = this.intersecao();
    const rotulo = this.texto('cruzam');
    return [
      { x: 0, y: 0, rotulo, cor: 'acento' },
      { x: k, y: this.a() * k, rotulo, cor: 'acento' },
    ];
  });

  protected readonly dominio = computed(() => {
    const limite = Math.max(this.intersecao(), this.ate()) + 1;
    return { xMin: -0.5, xMax: limite };
  });

  protected readonly descricaoGrafico = computed(() => {
    const chave = this.aplicacoes.find((a) => a.valor === this.aplicacao())!.rotulo;
    return this.texto('descricaoGrafico', { aplicacao: this.texto(chave) });
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_APLICACOES_INTEGRAL);
  }

  protected definirAplicacao(aplicacao: Aplicacao): void {
    this.aplicacao.set(aplicacao);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
