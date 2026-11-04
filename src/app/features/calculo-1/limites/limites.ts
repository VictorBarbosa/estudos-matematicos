import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { aproximar, limiteComPassos, limitesLaterais } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/calculo-1/limites/limites.i18n.json';
import { geradorLimites } from '@features/calculo-1/limites/limites.gerador';
import { TEORIA_LIMITES } from '@features/calculo-1/limites/limites.teoria';

interface Caso {
  /** Também é a chave do rótulo e da técnica no dicionário do tópico. */
  readonly id: string;
  readonly tex: string;
  readonly fn: (x: number) => number;
  readonly ponto: number;
}

const CASOS: readonly Caso[] = [
  {
    id: 'fatoracao',
    tex: '\\frac{x^{2}-9}{x-3}',
    fn: (x) => (x * x - 9) / (x - 3),
    ponto: 3,
  },
  {
    id: 'conjugado',
    tex: '\\frac{\\sqrt{x+4}-2}{x}',
    fn: (x) => (Math.sqrt(x + 4) - 2) / x,
    ponto: 0,
  },
  {
    id: 'trigonometrico',
    tex: '\\frac{\\sin x}{x}',
    fn: (x) => Math.sin(x) / x,
    ponto: 0,
  },
  {
    id: 'cosseno',
    tex: '\\frac{1-\\cos x}{x}',
    fn: (x) => (1 - Math.cos(x)) / x,
    ponto: 0,
  },
];

@Component({
  selector: 'app-limites',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, Formula, MathPlot, PassoAPasso, TopicoLayout],
  templateUrl: './limites.html',
  styleUrl: './limites.scss',
})
export class Limites {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorLimites;
  protected readonly conceitos = TEORIA_LIMITES.map((teoria) => teoria.id);
  protected readonly casos = CASOS;

  protected readonly indice = signal(0);

  protected readonly caso = computed(() => CASOS[this.indice()] ?? CASOS[0]!);

  protected readonly lateral = computed(() => limitesLaterais(this.caso().fn, this.caso().ponto));

  protected readonly analise = computed(() =>
    limiteComPassos(this.caso().fn, this.caso().ponto, this.caso().tex),
  );

  protected readonly tabela = computed(() => {
    const { fn, ponto } = this.caso();
    const esquerda = aproximar(fn, ponto, true, 5);
    const direita = aproximar(fn, ponto, false, 5);

    return esquerda.map((item, indice) => ({
      distancia: Math.abs(item.x - ponto),
      pelaEsquerda: item.fx,
      pelaDireita: direita[indice]!.fx,
    }));
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => [
    { fn: this.caso().fn, cor: 'serie-1', rotulo: this.texto('curvaF') },
  ]);

  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const lateral = this.lateral();
    if (!lateral.existe) {
      return [];
    }

    return [
      {
        x: this.caso().ponto,
        y: lateral.valor!,
        rotulo: this.texto('pontoL', { valor: this.formatar(lateral.valor!) }),
        cor: 'acento',
        // Nesses casos a função nunca está definida no ponto.
        vazado: true,
      },
    ];
  });

  protected readonly dominio = computed(() => {
    const { ponto } = this.caso();
    return { xMin: ponto - 5, xMax: ponto + 5 };
  });

  protected readonly descricaoGrafico = computed(() =>
    this.texto('descricaoGrafico', { caso: this.texto(`${this.caso().id}.rotulo`) }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_LIMITES);
  }

  protected selecionar(indice: number): void {
    this.indice.set(indice);
  }

  protected formatar(valor: number): string {
    if (!Number.isFinite(valor)) {
      return '—';
    }
    return Number(valor.toFixed(6)).toLocaleString('pt-BR', { maximumFractionDigits: 6 });
  }
}
