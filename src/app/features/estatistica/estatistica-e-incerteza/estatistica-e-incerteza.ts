import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ajustarRetaComPassos,
  desvioPadraoComPassos,
  propagarProdutoComPassos,
  propagarSomaComPassos,
  resumirAmostra,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, MarcaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorIncerteza } from '@features/estatistica/estatistica-e-incerteza/estatistica-e-incerteza.gerador';
import { TEORIA_INCERTEZA } from '@features/estatistica/estatistica-e-incerteza/estatistica-e-incerteza.teoria';

/** Uma série de medidas de exemplo: o período de um pêndulo, em segundos. */
const MEDIDAS = [2.01, 1.98, 2.04, 1.99, 2.02, 2.05, 1.97, 2.0];

@Component({
  selector: 'app-estatistica-e-incerteza',
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
  templateUrl: './estatistica-e-incerteza.html',
  styleUrl: './estatistica-e-incerteza.scss',
})
export class EstatisticaEIncerteza {
  protected readonly gerador = geradorIncerteza;
  protected readonly conceitos = TEORIA_INCERTEZA.map((teoria) => teoria.id);

  /** Quantas das medidas usar: mostra a incerteza da média caindo. */
  protected readonly quantidade = signal(MEDIDAS.length);

  /** Um valor extremo opcional, para ver média e mediana se separarem. */
  protected readonly comOutlier = signal(false);

  protected readonly incertezaBase = signal(0.3);
  protected readonly incertezaAltura = signal(0.2);
  protected readonly base = signal(20);
  protected readonly altura = signal(15);

  protected readonly medidas = computed(() => {
    const usadas = MEDIDAS.slice(0, this.quantidade());
    return this.comOutlier() ? [...usadas, 3.5] : usadas;
  });

  protected readonly resumo = computed(() => resumirAmostra(this.medidas()));

  protected readonly analiseDesvio = computed(() =>
    this.medidas().length >= 2 ? desvioPadraoComPassos(this.medidas()) : null,
  );

  protected readonly resultadoTex = computed(
    () =>
      `T = ${this.formatar(this.resumo().media)} \\pm ${this.formatar(this.resumo().incertezaDaMedia)}\\,\\text{s}`,
  );

  /** As medidas na reta real, com a média marcada. */
  protected readonly marcas = computed<readonly MarcaPlot[]>(() => [
    { x: this.resumo().media, rotulo: 'média', cor: 'acento' },
  ]);

  protected readonly pontosMedidas = computed<readonly PontoPlot[]>(() =>
    this.medidas().map((valor) => ({ x: valor, y: 0, cor: 'serie-1' })),
  );

  protected readonly dominioMedidas = computed(() => {
    const valores = this.medidas();
    const minimo = Math.min(...valores);
    const maximo = Math.max(...valores);
    const folga = Math.max(0.1, (maximo - minimo) * 0.2);

    return { xMin: minimo - folga, xMax: maximo + folga, yMin: -1, yMax: 1 };
  });

  /** Área do retângulo e sua incerteza propagada. */
  protected readonly area = computed(() => this.base() * this.altura());

  protected readonly propagacaoProduto = computed(() =>
    propagarProdutoComPassos(
      [
        { valor: this.base(), incerteza: this.incertezaBase() },
        { valor: this.altura(), incerteza: this.incertezaAltura() },
      ],
      this.area(),
    ),
  );

  protected readonly propagacaoSoma = computed(() =>
    propagarSomaComPassos([this.incertezaBase(), this.incertezaAltura()]),
  );

  protected readonly somaDireta = computed(() => this.incertezaBase() + this.incertezaAltura());

  /** Experimento fictício com ruído: o ajuste recupera a inclinação. */
  protected readonly experimento = computed(() => {
    const ruido = [0.3, -0.2, 0.1, -0.3, 0.25, -0.1, 0.05];
    return ruido.map((erro, indice) => ({ x: indice + 1, y: 2.5 * (indice + 1) + 1 + erro }));
  });

  protected readonly ajuste = computed(() => ajustarRetaComPassos(this.experimento()));

  protected readonly curvasAjuste = computed<readonly CurvaPlot[]>(() => {
    const { inclinacao, intercepto } = this.ajuste().resultado;
    return [{ fn: (x) => inclinacao * x + intercepto, cor: 'acento', rotulo: 'reta ajustada' }];
  });

  protected readonly pontosAjuste = computed<readonly PontoPlot[]>(() =>
    this.experimento().map((ponto) => ({ x: ponto.x, y: ponto.y, cor: 'serie-1' })),
  );

  protected readonly dominioAjuste = computed(() => ({ xMin: 0, xMax: 8, yMin: 0, yMax: 22 }));

  constructor() {
    inject(TeoriaService).registrar(TEORIA_INCERTEZA);
  }

  protected alternarOutlier(): void {
    this.comOutlier.update((atual) => !atual);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
