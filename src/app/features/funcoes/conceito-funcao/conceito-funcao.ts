import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
import { geradorConceito } from '@features/funcoes/conceito-funcao/conceito-funcao.gerador';
import { TEORIA_CONCEITO } from '@features/funcoes/conceito-funcao/conceito-funcao.teoria';

interface Relacao {
  readonly id: string;
  readonly rotulo: string;
  readonly tex: string;
  readonly ehFuncao: boolean;
  /** Relações que não são função precisam de dois ramos para serem desenhadas. */
  readonly ramos: readonly ((x: number) => number)[];
  readonly explicacao: string;
}

const RELACOES: readonly Relacao[] = [
  {
    id: 'reta',
    rotulo: 'y = 2x + 1',
    tex: 'y = 2x + 1',
    ehFuncao: true,
    ramos: [(x) => 2 * x + 1],
    explicacao: 'Qualquer vertical cruza a reta exatamente uma vez. É função.',
  },
  {
    id: 'parabola',
    rotulo: 'y = x²',
    tex: 'y = x^{2}',
    ehFuncao: true,
    ramos: [(x) => x * x],
    explicacao:
      'Duas entradas diferentes podem dar a mesma saída — e isso é permitido. O que não pode ' +
      'é uma entrada com duas saídas.',
  },
  {
    id: 'raiz',
    rotulo: 'y² = x',
    tex: 'y^{2} = x',
    ehFuncao: false,
    ramos: [(x) => (x < 0 ? Number.NaN : Math.sqrt(x)), (x) => (x < 0 ? Number.NaN : -Math.sqrt(x))],
    explicacao:
      'Para cada x positivo há dois valores de y, um positivo e outro negativo. A vertical ' +
      'corta o gráfico duas vezes: NÃO é função de x.',
  },
  {
    id: 'circulo',
    rotulo: 'x² + y² = 25',
    tex: 'x^{2} + y^{2} = 25',
    ehFuncao: false,
    ramos: [
      (x) => (Math.abs(x) > 5 ? Number.NaN : Math.sqrt(25 - x * x)),
      (x) => (Math.abs(x) > 5 ? Number.NaN : -Math.sqrt(25 - x * x)),
    ],
    explicacao:
      'A circunferência falha no teste da reta vertical em quase todo ponto: NÃO é função.',
  },
];

@Component({
  selector: 'app-conceito-funcao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    ConceitosTopico,
    ControleParametro,
    Formula,
    MathPlot,
    TopicoLayout,
  ],
  templateUrl: './conceito-funcao.html',
  styleUrl: './conceito-funcao.scss',
})
export class ConceitoFuncao {
  protected readonly gerador = geradorConceito;
  protected readonly conceitos = TEORIA_CONCEITO.map((teoria) => teoria.id);
  protected readonly relacoes = RELACOES;

  protected readonly indiceRelacao = signal(0);
  /** Posição da reta vertical que faz o teste. */
  protected readonly posicaoTeste = signal(2);

  protected readonly relacao = computed(() => RELACOES[this.indiceRelacao()] ?? RELACOES[0]!);

  protected readonly curvas = computed<readonly CurvaPlot[]>(() =>
    this.relacao().ramos.map((fn, indice) => ({
      fn,
      cor: indice === 0 ? ('serie-1' as const) : ('serie-2' as const),
    })),
  );

  /** A reta vertical do teste, desenhada como um segmento alto. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => [
    {
      x1: this.posicaoTeste(),
      y1: -12,
      x2: this.posicaoTeste(),
      y2: 12,
      cor: 'aviso',
      tracejado: true,
    },
  ]);

  /** Onde a vertical encontra cada ramo — é o que o teste conta. */
  protected readonly intersecoes = computed<readonly PontoPlot[]>(() => {
    const x = this.posicaoTeste();

    return this.relacao()
      .ramos.map((fn) => fn(x))
      .filter((y) => Number.isFinite(y))
      .map((y) => ({ x, y, rotulo: `(${x}, ${Number(y.toFixed(2))})`, cor: 'acento' as const }));
  });

  protected readonly quantidadeDeCortes = computed(() => this.intersecoes().length);

  protected readonly veredito = computed(() => {
    const cortes = this.quantidadeDeCortes();

    if (cortes > 1) {
      return `A vertical corta ${cortes} vezes: aqui a relação NÃO é função.`;
    }
    if (cortes === 1) {
      return 'A vertical corta uma única vez neste ponto.';
    }
    return 'A vertical não encontra o gráfico: este x está fora do domínio.';
  });

  protected readonly dominio = computed(() => ({ xMin: -8, xMax: 8, yMin: -8, yMax: 8 }));

  protected readonly descricaoGrafico = computed(
    () =>
      `Gráfico de ${this.relacao().rotulo} com uma reta vertical de teste em x igual a ` +
      `${this.posicaoTeste()}, que o encontra ${this.quantidadeDeCortes()} vez(es).`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_CONCEITO);
  }

  protected selecionar(indice: number): void {
    this.indiceRelacao.set(indice);
  }
}
