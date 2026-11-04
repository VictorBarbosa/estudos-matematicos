import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ehContinua, limitesLaterais } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/calculo-1/continuidade/continuidade.i18n.json';
import { geradorContinuidade } from '@features/calculo-1/continuidade/continuidade.gerador';
import { TEORIA_CONTINUIDADE } from '@features/calculo-1/continuidade/continuidade.teoria';

interface Caso {
  /** Também é a chave do rótulo, do tipo e da explicação no dicionário. */
  readonly id: string;
  readonly tex: string;
  readonly fn: (x: number) => number;
  readonly ponto: number;
}

const CASOS: readonly Caso[] = [
  {
    id: 'continua',
    tex: 'x^{2} + 1',
    fn: (x) => x * x + 1,
    ponto: 2,
  },
  {
    id: 'removivel',
    tex: '\\frac{x^{2}-4}{x-2}',
    fn: (x) => (x * x - 4) / (x - 2),
    ponto: 2,
  },
  {
    id: 'salto',
    tex: '\\frac{|x-2|}{x-2}',
    fn: (x) => Math.abs(x - 2) / (x - 2),
    ponto: 2,
  },
  {
    id: 'infinita',
    tex: '\\frac{1}{(x-2)^{2}}',
    fn: (x) => 1 / ((x - 2) * (x - 2)),
    ponto: 2,
  },
];

@Component({
  selector: 'app-continuidade',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, Formula, MathPlot, TopicoLayout],
  templateUrl: './continuidade.html',
  styleUrl: './continuidade.scss',
})
export class Continuidade {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorContinuidade;
  protected readonly conceitos = TEORIA_CONTINUIDADE.map((teoria) => teoria.id);
  protected readonly casos = CASOS;

  protected readonly indice = signal(0);

  protected readonly caso = computed(() => CASOS[this.indice()] ?? CASOS[0]!);

  protected readonly lateral = computed(() => limitesLaterais(this.caso().fn, this.caso().ponto));

  protected readonly valorNoPonto = computed(() => {
    const valor = this.caso().fn(this.caso().ponto);
    return Number.isFinite(valor) ? valor : null;
  });

  protected readonly continua = computed(() => ehContinua(this.caso().fn, this.caso().ponto));

  /** As três condições da definição, avaliadas uma a uma. */
  protected readonly condicoes = computed(() => {
    const valor = this.valorNoPonto();
    const lateral = this.lateral();

    return [
      {
        chave: 'condicaoDefinido',
        valores: { ponto: this.caso().ponto },
        cumprida: valor !== null,
      },
      {
        chave: 'condicaoLimite',
        valores: undefined,
        cumprida: lateral.existe,
      },
      {
        chave: 'condicaoCoincidem',
        valores: undefined,
        cumprida: valor !== null && lateral.existe && Math.abs(valor - lateral.valor!) < 1e-6,
      },
    ];
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
        rotulo: this.valorNoPonto() === null ? 'buraco' : 'ponto',
        cor: this.continua() ? 'acerto' : 'erro',
        vazado: this.valorNoPonto() === null,
      },
    ];
  });

  protected readonly dominio = computed(() => {
    const { ponto } = this.caso();
    return { xMin: ponto - 4, xMax: ponto + 4 };
  });

  protected readonly descricaoGrafico = computed(() =>
    this.texto('descricaoGrafico', {
      tipo: this.texto(`${this.caso().id}.tipo`).toLowerCase(),
      ponto: this.caso().ponto,
    }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_CONTINUIDADE);
  }

  protected selecionar(indice: number): void {
    this.indice.set(indice);
  }

  protected formatar(valor: number | null): string {
    if (valor === null || !Number.isFinite(valor)) {
      return 'não existe';
    }
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
