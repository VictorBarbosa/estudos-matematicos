import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  FUNCAO_TEX,
  FuncaoDeSerie,
  SERIES_CONHECIDAS,
  avaliarMaclaurin,
  polinomioDeMaclaurinTex,
  raioDeConvergencia,
  valorDaFuncaoDeSerie,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot } from '@shared/components/math-plot/models/math-plot.model';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/calculo-2/series-de-taylor/series-de-taylor.i18n.json';
import { geradorSeriesDeTaylor } from '@features/calculo-2/series-de-taylor/series-de-taylor.gerador';
import { TEORIA_TAYLOR } from '@features/calculo-2/series-de-taylor/series-de-taylor.teoria';

/** A ordem do dropdown numérico, já que o controle só move inteiros. */
const FUNCOES: readonly FuncaoDeSerie[] = ['exp', 'sen', 'cos', 'ln1x', 'geometrica'];

/** A observação de cada série vira uma chave do dicionário deste tópico. */
const OBSERVACOES: Readonly<Record<FuncaoDeSerie, string>> = {
  exp: 'obsExp',
  sen: 'obsSen',
  cos: 'obsCos',
  ln1x: 'obsLn',
  geometrica: 'obsGeo',
};

@Component({
  selector: 'app-series-de-taylor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './series-de-taylor.html',
  styleUrl: './series-de-taylor.scss',
})
export class SeriesDeTaylor {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorSeriesDeTaylor;
  protected readonly conceitos = TEORIA_TAYLOR.map((teoria) => teoria.id);
  protected readonly series = SERIES_CONHECIDAS.map((serie) => ({
    ...serie,
    observacao: OBSERVACOES[serie.funcao],
  }));

  protected readonly escolha = signal(1);
  protected readonly grau = signal(3);
  /** O ponto de avaliação em décimos, para permitir meio em meio. */
  protected readonly decimosDoPonto = signal(10);

  protected readonly funcao = computed(() => FUNCOES[this.escolha()]!);
  protected readonly ponto = computed(() => this.decimosDoPonto() / 10);

  protected readonly funcaoTex = computed(() => FUNCAO_TEX[this.funcao()]);

  protected readonly polinomioTex = computed(
    () => `P_{${this.grau()}}(x) = ${polinomioDeMaclaurinTex(this.funcao(), this.grau())}`,
  );

  protected readonly aproximado = computed(() =>
    avaliarMaclaurin(this.funcao(), this.grau(), this.ponto()),
  );

  protected readonly exato = computed(() => valorDaFuncaoDeSerie(this.funcao(), this.ponto()));

  protected readonly erro = computed(() => Math.abs(this.exato() - this.aproximado()));

  protected readonly raio = computed(() => raioDeConvergencia(this.funcao()));

  protected readonly foraDoRaio = computed(() => Math.abs(this.ponto()) >= this.raio());

  protected readonly pontoEscrito = computed(() =>
    this.ponto().toLocaleString('pt-BR', { maximumFractionDigits: 1 }),
  );

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const funcao = this.funcao();
    const grau = this.grau();
    const raio = this.raio();

    return [
      {
        fn: (x) => (Math.abs(x) < raio ? valorDaFuncaoDeSerie(funcao, x) : Number.NaN),
        cor: 'serie-1',
        rotulo: this.texto('funcao'),
      },
      {
        fn: (x) => avaliarMaclaurin(funcao, grau, x),
        cor: 'acento',
        tracejada: true,
        rotulo: this.texto('polinomioDeGrau', { grau }),
      },
    ];
  });

  protected readonly dominio = computed(() => {
    const alcance = this.raio() === 1 ? 1.4 : 5;
    return { xMin: -alcance, xMax: alcance, yMin: -3, yMax: 4 };
  });

  protected readonly descricaoGrafico = computed(() =>
    this.texto('descricaoGrafico', { grau: this.grau() }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_TAYLOR);
  }

  protected formatar(valor: number): string {
    if (!Number.isFinite(valor)) {
      return this.texto('foraDoRaio');
    }
    return Number(valor.toFixed(6)).toLocaleString('pt-BR', { maximumFractionDigits: 6 });
  }
}
