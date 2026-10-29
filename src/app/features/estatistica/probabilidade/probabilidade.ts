import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  aoMenosUmComPassos,
  probabilidadeComPassos,
  probabilidadeConjuntaComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorProbabilidade } from '@features/estatistica/probabilidade/probabilidade.gerador';
import { TEORIA_PROBABILIDADE } from '@features/estatistica/probabilidade/probabilidade.teoria';

@Component({
  selector: 'app-probabilidade',
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
  templateUrl: './probabilidade.html',
  styleUrl: './probabilidade.scss',
})
export class Probabilidade {
  protected readonly gerador = geradorProbabilidade;
  protected readonly conceitos = TEORIA_PROBABILIDADE.map((teoria) => teoria.id);

  protected readonly favoraveis = signal(3);
  protected readonly possiveis = signal(6);

  /** Urna com bolas de duas cores, para comparar com e sem reposição. */
  protected readonly vermelhas = signal(4);
  protected readonly azuis = signal(6);

  /** Tentativas independentes, para o complementar. */
  protected readonly tentativas = signal(4);

  protected readonly analise = computed(() =>
    probabilidadeComPassos(Math.min(this.favoraveis(), this.possiveis()), this.possiveis()),
  );

  protected readonly total = computed(() => this.vermelhas() + this.azuis());

  protected readonly comReposicao = computed(() => {
    const p = this.vermelhas() / this.total();
    return probabilidadeConjuntaComPassos(p, p, true);
  });

  protected readonly semReposicao = computed(() => {
    const primeira = this.vermelhas() / this.total();
    const segunda = (this.vermelhas() - 1) / (this.total() - 1);
    return probabilidadeConjuntaComPassos(primeira, Math.max(0, segunda), false, Math.max(0, segunda));
  });

  protected readonly aoMenosUm = computed(() =>
    aoMenosUmComPassos(this.analise().resultado, this.tentativas()),
  );

  protected readonly probabilidadeTex = computed(
    () =>
      `P(A) = \\frac{${Math.min(this.favoraveis(), this.possiveis())}}{${this.possiveis()}} = ` +
      `${this.formatar(this.analise().resultado)}`,
  );

  /** A curva de "ao menos um" crescendo com as tentativas. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const p = this.analise().resultado;

    return [
      { fn: (n) => (n < 0 ? Number.NaN : 1 - (1 - p) ** n), cor: 'serie-1', rotulo: 'ao menos um' },
      { fn: (n) => (n < 0 ? Number.NaN : (1 - p) ** n), cor: 'serie-2', tracejada: true, rotulo: 'nenhum' },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    {
      x: this.tentativas(),
      y: this.aoMenosUm().resultado,
      rotulo: this.formatar(this.aoMenosUm().resultado),
      cor: 'acento',
    },
  ]);

  protected readonly dominio = computed(() => ({
    xMin: 0,
    xMax: Math.max(10, this.tentativas() + 2),
    yMin: 0,
    yMax: 1.1,
  }));

  constructor() {
    inject(TeoriaService).registrar(TEORIA_PROBABILIDADE);
  }

  protected formatar(valor: number): string {
    return `${(valor * 100).toFixed(2).replace('.', ',')}%`;
  }

  protected formatarNumero(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
