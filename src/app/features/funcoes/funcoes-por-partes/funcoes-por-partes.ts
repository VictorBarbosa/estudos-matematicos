import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  FuncaoPorPartes,
  Polinomio,
  avaliarPorPartes,
  ehContinuaEm,
  limiteDireita,
  limiteEsquerda,
  porPartesParaTex,
  saltoEm,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/funcoes/funcoes-por-partes/funcoes-por-partes.i18n.json';
import { geradorFuncoesPorPartes } from '@features/funcoes/funcoes-por-partes/funcoes-por-partes.gerador';
import { TEORIA_POR_PARTES } from '@features/funcoes/funcoes-por-partes/funcoes-por-partes.teoria';

@Component({
  selector: 'app-funcoes-por-partes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './funcoes-por-partes.html',
  styleUrl: './funcoes-por-partes.scss',
})
export class FuncoesPorPartes {
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorFuncoesPorPartes;
  protected readonly conceitos = TEORIA_POR_PARTES.map((teoria) => teoria.id);

  protected readonly fronteira = signal(2);
  protected readonly inclinacaoEsquerda = signal(2);
  protected readonly constanteEsquerda = signal(1);
  protected readonly inclinacaoDireita = signal(-1);
  protected readonly constanteDireita = signal(4);

  protected readonly funcao = computed<FuncaoPorPartes>(() => ({
    trechos: [
      {
        expressao: Polinomio.de(this.constanteEsquerda(), this.inclinacaoEsquerda()),
        de: Number.NEGATIVE_INFINITY,
        ate: this.fronteira(),
        fechadoAEsquerda: true,
      },
      {
        expressao: Polinomio.de(this.constanteDireita(), this.inclinacaoDireita()),
        de: this.fronteira(),
        ate: Number.POSITIVE_INFINITY,
        fechadoAEsquerda: true,
      },
    ],
  }));

  protected readonly funcaoTex = computed(() => porPartesParaTex(this.funcao()));

  protected readonly esquerda = computed(() => limiteEsquerda(this.funcao(), this.fronteira()));
  protected readonly direita = computed(() => limiteDireita(this.funcao(), this.fronteira()));
  protected readonly valor = computed(() => avaliarPorPartes(this.funcao(), this.fronteira()));
  protected readonly salto = computed(() => saltoEm(this.funcao(), this.fronteira()));
  protected readonly continua = computed(() => ehContinuaEm(this.funcao(), this.fronteira()));

  /** A constante que faria as pontas se encontrarem. */
  protected readonly constanteQueCola = computed(
    () => this.esquerda() - this.inclinacaoDireita() * this.fronteira(),
  );

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const f = this.funcao();
    const corte = this.fronteira();

    return [
      {
        fn: (x) => (x < corte ? avaliarPorPartes(f, x) : Number.NaN),
        cor: 'serie-1',
        rotulo: this.texto('curvaEsquerda'),
      },
      {
        fn: (x) => (x >= corte ? avaliarPorPartes(f, x) : Number.NaN),
        cor: 'serie-3',
        rotulo: this.texto('curvaDireita'),
      },
    ];
  });

  /** O valor que a função assume é cheio; a ponta que não vale é vazada. */
  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    { x: this.fronteira(), y: this.esquerda(), cor: 'serie-1', vazado: true },
    { x: this.fronteira(), y: this.direita(), cor: 'serie-3' },
  ]);

  protected readonly dominio = computed(() => ({
    xMin: this.fronteira() - 6,
    xMax: this.fronteira() + 6,
  }));

  protected readonly descricaoGrafico = computed(() =>
    this.texto('descricaoGrafico', { x: this.fronteira() }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_POR_PARTES);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
