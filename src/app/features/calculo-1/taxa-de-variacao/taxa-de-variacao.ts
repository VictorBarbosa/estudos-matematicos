import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  Polinomio,
  analisarMovimentoComPassos,
  aproximacoesDaTaxa,
  taxaMediaComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot, SegmentoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorTaxa } from '@features/calculo-1/taxa-de-variacao/taxa-de-variacao.gerador';
import { TEORIA_TAXA } from '@features/calculo-1/taxa-de-variacao/taxa-de-variacao.teoria';

@Component({
  selector: 'app-taxa-de-variacao',
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
  templateUrl: './taxa-de-variacao.html',
  styleUrl: './taxa-de-variacao.scss',
})
export class TaxaDeVariacao {
  protected readonly gerador = geradorTaxa;
  protected readonly conceitos = TEORIA_TAXA.map((teoria) => teoria.id);

  /** Coeficientes de s(t) = a·t³ + b·t² + c·t + d. */
  protected readonly a = signal(1);
  protected readonly b = signal(-6);
  protected readonly c = signal(9);
  protected readonly d = signal(0);

  protected readonly instante = signal(2);
  /** Largura do intervalo da secante — é o Δt que vai encolhendo. */
  protected readonly delta = signal(1);

  protected readonly posicao = computed(() =>
    Polinomio.de(this.d(), this.c(), this.b(), this.a()),
  );

  protected readonly analise = computed(() =>
    analisarMovimentoComPassos(this.posicao(), this.instante()),
  );

  protected readonly movimento = computed(() => this.analise().resultado);

  protected readonly analiseMedia = computed(() =>
    taxaMediaComPassos(this.posicao(), this.instante(), this.instante() + this.delta()),
  );

  protected readonly taxaMedia = computed(() => this.analiseMedia().resultado);

  protected readonly aproximacoes = computed(() =>
    aproximacoesDaTaxa(this.posicao(), this.instante()),
  );

  /** Fórmulas montadas aqui porque a notação de linha usa apóstrofo. */
  protected readonly posicaoTex = computed(() => `s(t) = ${this.posicao().paraTex('t')}`);
  protected readonly velocidadeTex = computed(
    () => `v(t) = s'(t) = ${this.movimento().v.paraTex('t')}`,
  );
  protected readonly aceleracaoTex = computed(
    () => `a(t) = s''(t) = ${this.movimento().a.paraTex('t')}`,
  );
  protected readonly limiteTex = String.raw`v(t) = \lim_{\Delta t \to 0} \frac{s(t + \Delta t) - s(t)}{\Delta t}`;

  /** O que o par (velocidade, aceleração) diz sobre o movimento. */
  protected readonly leituraDosSinais = computed(() => {
    const { velocidade, aceleracao } = this.movimento();

    if (Math.abs(velocidade) < 1e-9) {
      return 'Velocidade nula: o corpo está parado e a posição atinge um extremo aqui.';
    }

    const sentido = velocidade > 0 ? 'avançando' : 'recuando';

    if (Math.abs(aceleracao) < 1e-9) {
      return `O corpo está ${sentido} a velocidade constante — aceleração nula.`;
    }

    return velocidade * aceleracao > 0
      ? `O corpo está ${sentido} e ganhando velocidade: velocidade e aceleração têm o mesmo sinal.`
      : `O corpo está ${sentido} e freando: a aceleração aponta contra o movimento.`;
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const { s, v, a } = this.movimento();

    return [
      { fn: (t) => s.avaliar(t), cor: 'serie-1', rotulo: 's(t) posição' },
      { fn: (t) => v.avaliar(t), cor: 'serie-2', rotulo: "v(t) = s'(t)" },
      { fn: (t) => a.avaliar(t), cor: 'serie-3', tracejada: true, rotulo: "a(t) = s''(t)" },
    ];
  });

  /** A secante do intervalo escolhido, ao lado da tangente no instante. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const s = this.posicao();
    const t0 = this.instante();
    const t1 = t0 + this.delta();
    const y0 = s.avaliar(t0);
    const m = this.movimento().velocidade;

    // A tangente é desenhada com a mesma largura da secante, para comparar as
    // duas inclinações lado a lado.
    return [
      { x1: t0, y1: y0, x2: t1, y2: s.avaliar(t1), cor: 'aviso', rotulo: 'secante' },
      {
        x1: t0 - this.delta(),
        y1: y0 - m * this.delta(),
        x2: t1,
        y2: y0 + m * this.delta(),
        cor: 'acento',
        tracejado: true,
        rotulo: 'tangente',
      },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const s = this.posicao();
    const t0 = this.instante();
    const t1 = t0 + this.delta();

    return [
      { x: t0, y: s.avaliar(t0), rotulo: `s(${this.formatar(t0)})`, cor: 'serie-1' },
      { x: t1, y: s.avaliar(t1), rotulo: `s(${this.formatar(t1)})`, cor: 'aviso' },
    ];
  });

  protected readonly dominio = computed(() => ({ xMin: -1, xMax: 6 }));

  protected readonly descricaoGrafico = computed(
    () =>
      `Posição, velocidade e aceleração em função do tempo, com a secante do intervalo de ` +
      `largura ${this.formatar(this.delta())} e a tangente em t igual a ${this.formatar(this.instante())}.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_TAXA);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
