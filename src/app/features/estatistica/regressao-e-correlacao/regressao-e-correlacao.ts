import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Par, ajustarRetaComPassos, covariancia, chaveDaForca, media, pearson } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import {
  CurvaPlot,
  PontoPlot,
  SegmentoPlot,
} from '@shared/components/math-plot/models/math-plot.model';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/estatistica/regressao-e-correlacao/regressao-e-correlacao.i18n.json';
import { geradorRegressaoCorrelacao } from '@features/estatistica/regressao-e-correlacao/regressao-e-correlacao.gerador';
import { TEORIA_REGRESSAO } from '@features/estatistica/regressao-e-correlacao/regressao-e-correlacao.teoria';

/**
 * Ruído determinístico, para que a tela não mude a cada renderização.
 *
 * Um `Math.random` aqui faria a nuvem saltar a cada detecção de mudança, o que
 * tornaria impossível comparar dois ajustes.
 */
function ruidoFixo(indice: number): number {
  return (
    Math.sin(indice * 12.9898) * 43758.5453 -
    Math.floor(Math.sin(indice * 12.9898) * 43758.5453) -
    0.5
  );
}

@Component({
  selector: 'app-regressao-e-correlacao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './regressao-e-correlacao.html',
  styleUrl: './regressao-e-correlacao.scss',
})
export class RegressaoECorrelacao {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorRegressaoCorrelacao;
  protected readonly conceitos = TEORIA_REGRESSAO.map((teoria) => teoria.id);

  protected readonly inclinacaoReal = signal(2);
  protected readonly interceptoReal = signal(3);
  /** A dispersão em décimos, para variar suavemente. */
  protected readonly decimosDeRuido = signal(10);
  protected readonly quantidade = signal(10);

  protected readonly pontos = computed<readonly Par[]>(() => {
    const [a, b, ruido, n] = [
      this.inclinacaoReal(),
      this.interceptoReal(),
      this.decimosDeRuido() / 10,
      this.quantidade(),
    ];

    return Array.from({ length: n }, (_, i) => ({
      x: i + 1,
      y: a * (i + 1) + b + ruidoFixo(i + 1) * ruido * 6,
    }));
  });

  protected readonly ajuste = computed(() => ajustarRetaComPassos(this.pontos()).resultado);

  protected readonly r = computed(() => pearson(this.pontos()));
  protected readonly cov = computed(() => covariancia(this.pontos()));
  protected readonly forca = computed(() => chaveDaForca(this.r()));

  protected readonly mediaDeY = computed(() => media(this.pontos().map((par) => par.y)));

  protected readonly retaTex = computed(
    () =>
      `\\hat{y} = ${this.tex(this.ajuste().inclinacao)}x ` +
      `${this.ajuste().intercepto >= 0 ? '+' : '-'} ${this.tex(Math.abs(this.ajuste().intercepto))}`,
  );

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const { inclinacao, intercepto } = this.ajuste();
    const mediaY = this.mediaDeY();

    return [
      {
        fn: (x) => inclinacao * x + intercepto,
        cor: 'acento',
        rotulo: this.texto('curvaAjustada'),
      },
      {
        fn: () => mediaY,
        cor: 'texto-suave',
        tracejada: true,
        rotulo: this.texto('curvaMediaDeY'),
      },
    ];
  });

  protected readonly marcadores = computed<readonly PontoPlot[]>(() =>
    this.pontos().map((par) => ({ x: par.x, y: par.y, cor: 'serie-1' as const })),
  );

  /** Cada resíduo desenhado como um segmento vertical até a reta. */
  protected readonly residuos = computed<readonly SegmentoPlot[]>(() => {
    const { inclinacao, intercepto } = this.ajuste();

    return this.pontos().map((par) => ({
      x1: par.x,
      y1: par.y,
      x2: par.x,
      y2: inclinacao * par.x + intercepto,
      cor: 'erro' as const,
      tracejado: true,
    }));
  });

  protected readonly dominio = computed(() => ({ xMin: 0, xMax: this.quantidade() + 1 }));

  protected readonly descricaoGrafico = computed(() => this.texto('descricaoGrafico'));

  constructor() {
    inject(TeoriaService).registrar(TEORIA_REGRESSAO);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }

  protected porcento(valor: number): string {
    return `${Number((valor * 100).toFixed(2)).toLocaleString('pt-BR')}%`;
  }

  private tex(valor: number): string {
    return String(Number(valor.toFixed(4))).replace('.', '{,}');
  }
}
