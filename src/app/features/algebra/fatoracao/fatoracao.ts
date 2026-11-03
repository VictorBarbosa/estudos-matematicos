import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Polinomio, fatorarComPassos } from '@core/math';
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
import textos from '@features/algebra/fatoracao/fatoracao.i18n.json';
import { geradorFatoracao } from '@features/algebra/fatoracao/fatoracao.gerador';
import { TEORIA_FATORACAO } from '@features/algebra/fatoracao/fatoracao.teoria';

@Component({
  selector: 'app-fatoracao',
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
  templateUrl: './fatoracao.html',
  styleUrl: './fatoracao.scss',
})
export class Fatoracao {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorFatoracao;
  protected readonly conceitos = TEORIA_FATORACAO.map((teoria) => teoria.id);

  protected readonly a = signal(1);
  protected readonly b = signal(-5);
  protected readonly c = signal(6);

  protected readonly polinomio = computed(() => Polinomio.de(this.c(), this.b(), this.a()));

  protected readonly fatoracao = computed(() => fatorarComPassos(this.polinomio()));

  /** O tipo de fatoração encontrado, dito por extenso. */
  protected readonly tipoLegivel = computed(() => {
    const tipo = this.fatoracao().resultado.tipo;
    return tipo in textos ? this.texto(tipo) : this.texto('fatoracao');
  });

  protected readonly fatorou = computed(() => this.fatoracao().resultado.tipo !== 'nao-fatoravel');

  /**
   * As raízes visíveis na forma fatorada: cada fator (x − r) corta o eixo em r.
   * É a tradução gráfica de "produto nulo exige fator nulo".
   */
  protected readonly raizes = computed(() => {
    const a = this.a();
    const b = this.b();
    const c = this.c();

    if (a === 0) {
      return b === 0 ? [] : [-c / b];
    }

    const delta = b * b - 4 * a * c;
    if (delta < 0) {
      return [];
    }
    if (delta === 0) {
      return [-b / (2 * a)];
    }
    return [(-b - Math.sqrt(delta)) / (2 * a), (-b + Math.sqrt(delta)) / (2 * a)];
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const polinomio = this.polinomio();
    return [
      { fn: (x) => polinomio.avaliar(x), cor: 'serie-1', rotulo: this.texto('curvaExpressao') },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() =>
    this.raizes().map((raiz) => ({
      x: raiz,
      y: 0,
      rotulo: this.texto('pontoRaiz', { raiz: Number(raiz.toFixed(2)) }),
      cor: 'acento' as const,
    })),
  );

  protected readonly dominio = computed(() => {
    const raizes = this.raizes();
    if (raizes.length === 0) {
      return { xMin: -6, xMax: 6 };
    }
    const centro = raizes.reduce((soma, raiz) => soma + raiz, 0) / raizes.length;
    const alcance = Math.max(5, (Math.max(...raizes) - Math.min(...raizes)) * 1.6 + 2);
    return { xMin: centro - alcance, xMax: centro + alcance };
  });

  protected readonly descricaoGrafico = computed(() => {
    const quantas = this.raizes().length;
    return quantas === 1
      ? this.texto('descricaoGraficoUm')
      : this.texto('descricaoGrafico', { quantas });
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_FATORACAO);
  }
}
