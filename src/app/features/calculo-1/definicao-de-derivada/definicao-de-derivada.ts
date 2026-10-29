import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Polinomio, derivadaPelaDefinicaoComPassos, quocienteDeNewton } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorDefinicaoDerivada } from '@features/calculo-1/definicao-de-derivada/definicao-de-derivada.gerador';
import { TEORIA_DEFINICAO_DERIVADA } from '@features/calculo-1/definicao-de-derivada/definicao-de-derivada.teoria';

@Component({
  selector: 'app-definicao-de-derivada',
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
  templateUrl: './definicao-de-derivada.html',
  styleUrl: './definicao-de-derivada.scss',
})
export class DefinicaoDeDerivada {
  protected readonly gerador = geradorDefinicaoDerivada;
  protected readonly conceitos = TEORIA_DEFINICAO_DERIVADA.map((teoria) => teoria.id);

  protected readonly ponto = signal(1);
  /** h controlado em centésimos, para poder chegar bem perto de zero. */
  protected readonly hEmCentesimos = signal(100);

  protected readonly h = computed(() => Math.max(0.01, this.hEmCentesimos() / 100));

  protected readonly funcao = Polinomio.de(0, 0, 1); // x²

  protected readonly fn = (x: number): number => this.funcao.avaliar(x);

  protected readonly inclinacaoSecante = computed(() =>
    quocienteDeNewton(this.fn, this.ponto(), this.h()),
  );

  protected readonly derivadaExata = computed(() =>
    this.funcao.derivar().avaliar(this.ponto()),
  );

  protected readonly erro = computed(() =>
    Math.abs(this.inclinacaoSecante() - this.derivadaExata()),
  );

  protected readonly analise = computed(() =>
    derivadaPelaDefinicaoComPassos(this.fn, this.ponto(), 'x^{2}'),
  );

  /** A curva, a secante atual e a tangente exata, no mesmo gráfico. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const x0 = this.ponto();
    const y0 = this.fn(x0);
    const mSecante = this.inclinacaoSecante();
    const mTangente = this.derivadaExata();

    return [
      { fn: this.fn, cor: 'serie-1', rotulo: 'f(x) = x²' },
      {
        fn: (x) => y0 + mSecante * (x - x0),
        cor: 'serie-2',
        rotulo: 'secante',
      },
      {
        fn: (x) => y0 + mTangente * (x - x0),
        cor: 'acento',
        tracejada: true,
        rotulo: 'tangente',
      },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const x0 = this.ponto();
    const x1 = x0 + this.h();

    return [
      { x: x0, y: this.fn(x0), rotulo: 'x', cor: 'acento' },
      { x: x1, y: this.fn(x1), rotulo: 'x + h', cor: 'serie-2' },
    ];
  });

  protected readonly dominio = computed(() => {
    const centro = this.ponto();
    return { xMin: centro - 4, xMax: centro + 4 };
  });

  protected readonly descricaoGrafico = computed(
    () =>
      `Parábola com a reta secante entre x e x mais h, e a tangente exata tracejada. ` +
      `Com h igual a ${this.formatar(this.h())}, as duas inclinações diferem em ` +
      `${this.formatar(this.erro())}.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_DEFINICAO_DERIVADA);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
