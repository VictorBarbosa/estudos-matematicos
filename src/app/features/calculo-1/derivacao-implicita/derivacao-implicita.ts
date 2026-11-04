import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  CurvaImplicita,
  curvaImplicitaParaTex,
  derivadaImplicitaNoPonto,
  fatorDaDerivada,
  parteSemDerivada,
  retaTangenteTex,
  somaParaTex,
  tangenteEhVertical,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/calculo-1/derivacao-implicita/derivacao-implicita.i18n.json';
import { geradorDerivacaoImplicita } from '@features/calculo-1/derivacao-implicita/derivacao-implicita.gerador';
import { TEORIA_DERIVACAO_IMPLICITA } from '@features/calculo-1/derivacao-implicita/derivacao-implicita.teoria';

@Component({
  selector: 'app-derivacao-implicita',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './derivacao-implicita.html',
  styleUrl: './derivacao-implicita.scss',
})
export class DerivacaoImplicita {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorDerivacaoImplicita;
  protected readonly conceitos = TEORIA_DERIVACAO_IMPLICITA.map((teoria) => teoria.id);

  /** Coeficientes da elipse `p x² + q y² = c`, montada pelo ponto escolhido. */
  protected readonly p = signal(1);
  protected readonly q = signal(1);
  protected readonly x = signal(3);
  protected readonly y = signal(4);

  protected readonly curva = computed<CurvaImplicita>(() => {
    const termos = [
      { coeficiente: this.p(), grauX: 2, grauY: 0 },
      { coeficiente: this.q(), grauX: 0, grauY: 2 },
    ];

    return {
      termos,
      constante: this.p() * this.x() ** 2 + this.q() * this.y() ** 2,
      nome: this.p() === this.q() ? 'circunferência' : 'elipse',
    };
  });

  protected readonly curvaTex = computed(() => curvaImplicitaParaTex(this.curva()));

  protected readonly derivadaTex = computed(
    () =>
      `\\frac{dy}{dx} = -\\frac{${somaParaTex(parteSemDerivada(this.curva()))}}{${somaParaTex(
        fatorDaDerivada(this.curva()),
      )}}`,
  );

  protected readonly vertical = computed(() =>
    tangenteEhVertical(this.curva(), this.x(), this.y()),
  );

  protected readonly inclinacao = computed(() =>
    derivadaImplicitaNoPonto(this.curva(), this.x(), this.y()),
  );

  protected readonly tangenteTex = computed(() =>
    retaTangenteTex(this.curva(), this.x(), this.y()),
  );

  /** O ramo de cima e o de baixo: juntos, a curva inteira. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const { constante } = this.curva();
    const [p, q] = [this.p(), this.q()];
    const ramo = (sinal: number) => (valor: number) => {
      const dentro = (constante - p * valor ** 2) / q;
      return dentro < 0 ? Number.NaN : sinal * Math.sqrt(dentro);
    };

    const m = this.inclinacao();
    const tangente = (valor: number) => this.y() + m * (valor - this.x());

    return [
      { fn: ramo(1), cor: 'serie-1', rotulo: this.texto('ramoDeCima') },
      { fn: ramo(-1), cor: 'serie-2', rotulo: this.texto('ramoDeBaixo') },
      ...(Number.isFinite(m)
        ? [
            {
              fn: tangente,
              cor: 'acento' as const,
              tracejada: true,
              rotulo: this.texto('tangente'),
            },
          ]
        : []),
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    { x: this.x(), y: this.y(), cor: 'acento', rotulo: `(${this.x()}, ${this.y()})` },
  ]);

  protected readonly dominio = computed(() => {
    const alcance = Math.sqrt(this.curva().constante / this.p()) * 1.4;
    return { xMin: -alcance, xMax: alcance };
  });

  protected readonly descricaoGrafico = computed(() => this.texto('descricaoGrafico'));

  constructor() {
    inject(TeoriaService).registrar(TEORIA_DERIVACAO_IMPLICITA);
  }

  protected formatar(valor: number): string {
    return Number.isFinite(valor)
      ? Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 })
      : this.texto('naoExiste');
  }
}
