import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Ponto, posicaoRelativa } from '@core/math';
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
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorCircunferencia } from '@features/geometria-analitica/circunferencia/circunferencia.gerador';
import { TEORIA_CIRCUNFERENCIA } from '@features/geometria-analitica/circunferencia/circunferencia.teoria';
import { circunferenciaComPassos } from '@core/math';

@Component({
  selector: 'app-circunferencia',
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
  templateUrl: './circunferencia.html',
  styleUrl: './circunferencia.scss',
})
export class Circunferencia {
  protected readonly gerador = geradorCircunferencia;
  protected readonly conceitos = TEORIA_CIRCUNFERENCIA.map((teoria) => teoria.id);

  protected readonly centroX = signal(3);
  protected readonly centroY = signal(4);
  protected readonly raio = signal(5);

  protected readonly testeX = signal(0);
  protected readonly testeY = signal(0);

  protected readonly centro = computed<Ponto>(() => ({ x: this.centroX(), y: this.centroY() }));
  protected readonly pontoTeste = computed<Ponto>(() => ({ x: this.testeX(), y: this.testeY() }));

  /** Coeficientes da forma geral, derivados do centro e do raio. */
  protected readonly geral = computed(() => ({
    d: -2 * this.centroX(),
    e: -2 * this.centroY(),
    f: this.centroX() ** 2 + this.centroY() ** 2 - this.raio() ** 2,
  }));

  protected readonly conversao = computed(() => {
    const { d, e, f } = this.geral();
    return circunferenciaComPassos(d, e, f);
  });

  protected readonly reduzidaTex = computed(() => {
    const a = this.centroX();
    const b = this.centroY();
    return (
      `(x ${a >= 0 ? '-' : '+'} ${Math.abs(a)})^{2} + ` +
      `(y ${b >= 0 ? '-' : '+'} ${Math.abs(b)})^{2} = ${this.raio() ** 2}`
    );
  });

  protected readonly geralTex = computed(() => {
    const { d, e, f } = this.geral();
    return (
      `x^{2} + y^{2} ${d >= 0 ? '+' : '-'} ${Math.abs(d)}x ` +
      `${e >= 0 ? '+' : '-'} ${Math.abs(e)}y ${f >= 0 ? '+' : '-'} ${Math.abs(f)} = 0`
    );
  });

  protected readonly distanciaAoCentro = computed(() =>
    Math.hypot(this.testeX() - this.centroX(), this.testeY() - this.centroY()),
  );

  protected readonly posicao = computed(() =>
    posicaoRelativa(this.pontoTeste(), { centro: this.centro(), raio: this.raio() }),
  );

  protected readonly descricaoPosicao = computed(() => {
    const d = this.formatar(this.distanciaAoCentro());

    switch (this.posicao()) {
      case 'dentro':
        return `O ponto está DENTRO: a distância ao centro (${d}) é menor que o raio (${this.raio()}).`;
      case 'sobre':
        return `O ponto está SOBRE a circunferência: a distância ao centro é exatamente o raio.`;
      case 'fora':
        return `O ponto está FORA: a distância ao centro (${d}) é maior que o raio (${this.raio()}).`;
    }
  });

  /**
   * A circunferência é desenhada como dois semicírculos, porque o plano
   * cartesiano traça funções e ela não é uma.
   */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const a = this.centroX();
    const b = this.centroY();
    const r = this.raio();

    const metade = (sinal: number) => (x: number) => {
      const dentro = r * r - (x - a) ** 2;
      return dentro < 0 ? Number.NaN : b + sinal * Math.sqrt(dentro);
    };

    return [
      { fn: metade(1), cor: 'serie-1' },
      { fn: metade(-1), cor: 'serie-1' },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    { x: this.centroX(), y: this.centroY(), rotulo: 'C', cor: 'serie-2' },
    {
      x: this.testeX(),
      y: this.testeY(),
      rotulo: 'P',
      cor: this.posicao() === 'fora' ? 'erro' : this.posicao() === 'sobre' ? 'aviso' : 'acerto',
    },
  ]);

  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => [
    {
      x1: this.centroX(),
      y1: this.centroY(),
      x2: this.testeX(),
      y2: this.testeY(),
      cor: 'texto-suave',
      tracejado: true,
    },
    // O raio, desenhado na horizontal para servir de referência.
    {
      x1: this.centroX(),
      y1: this.centroY(),
      x2: this.centroX() + this.raio(),
      y2: this.centroY(),
      cor: 'acento',
    },
  ]);

  protected readonly dominio = computed(() => {
    const folga = this.raio() + 3;
    return {
      xMin: this.centroX() - folga,
      xMax: this.centroX() + folga,
      yMin: this.centroY() - folga,
      yMax: this.centroY() + folga,
    };
  });

  protected readonly descricaoGrafico = computed(
    () =>
      `Circunferência de centro (${this.centroX()}, ${this.centroY()}) e raio ${this.raio()}, ` +
      `com um ponto de teste ${this.posicao()} dela.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_CIRCUNFERENCIA);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
