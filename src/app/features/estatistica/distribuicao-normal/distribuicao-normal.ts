import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  REGRA_EMPIRICA,
  acumulada,
  densidade,
  escoreZ,
  probabilidadeEntre,
  quantilPadrao,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { AreaPlot, CurvaPlot } from '@shared/components/math-plot/models/math-plot.model';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/estatistica/distribuicao-normal/distribuicao-normal.i18n.json';
import { geradorDistribuicaoNormal } from '@features/estatistica/distribuicao-normal/distribuicao-normal.gerador';
import { TEORIA_NORMAL } from '@features/estatistica/distribuicao-normal/distribuicao-normal.teoria';

@Component({
  selector: 'app-distribuicao-normal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './distribuicao-normal.html',
  styleUrl: './distribuicao-normal.scss',
})
export class DistribuicaoNormal {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorDistribuicaoNormal;
  protected readonly conceitos = TEORIA_NORMAL.map((teoria) => teoria.id);
  protected readonly regra = REGRA_EMPIRICA;

  protected readonly media = signal(50);
  protected readonly desvio = signal(5);
  protected readonly de = signal(45);
  protected readonly ate = signal(55);
  /** O percentil procurado, para a leitura inversa da tabela. */
  protected readonly percentil = signal(95);

  protected readonly zDe = computed(() => escoreZ(this.de(), this.media(), this.desvio()));
  protected readonly zAte = computed(() => escoreZ(this.ate(), this.media(), this.desvio()));

  protected readonly dentro = computed(() =>
    probabilidadeEntre(this.de(), this.ate(), this.media(), this.desvio()),
  );

  protected readonly abaixo = computed(() => acumulada(this.de(), this.media(), this.desvio()));

  protected readonly acima = computed(() => 1 - acumulada(this.ate(), this.media(), this.desvio()));

  protected readonly valorDoPercentil = computed(
    () => this.media() + quantilPadrao(this.percentil() / 100) * this.desvio(),
  );

  protected readonly intervaloTex = computed(
    () =>
      `P\\left(${this.tex(this.de())} < X < ${this.tex(this.ate())}\\right) = ` +
      `${this.tex(Number(this.dentro().toFixed(4)))}`,
  );

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const [media, desvio] = [this.media(), this.desvio()];
    return [
      {
        fn: (x) => densidade(x, media, desvio),
        cor: 'serie-1',
        rotulo: this.texto('curvaDensidade'),
      },
    ];
  });

  protected readonly areas = computed<readonly AreaPlot[]>(() => {
    const [media, desvio] = [this.media(), this.desvio()];
    return [
      {
        fn: (x) => densidade(x, media, desvio),
        de: this.de(),
        ate: this.ate(),
        cor: 'acento',
      },
    ];
  });

  protected readonly dominio = computed(() => ({
    xMin: this.media() - 4 * this.desvio(),
    xMax: this.media() + 4 * this.desvio(),
    yMin: 0,
  }));

  protected readonly descricaoGrafico = computed(() => this.texto('descricaoGrafico'));

  constructor() {
    inject(TeoriaService).registrar(TEORIA_NORMAL);
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
