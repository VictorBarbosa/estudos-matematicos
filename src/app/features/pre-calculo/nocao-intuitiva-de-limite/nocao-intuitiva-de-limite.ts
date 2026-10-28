import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { aproximar, limiteComPassos, limitesLaterais } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorLimiteIntuitivo } from './nocao-intuitiva-de-limite.gerador';
import { TEORIA_LIMITE_INTUITIVO } from './nocao-intuitiva-de-limite.teoria';

interface Caso {
  readonly id: string;
  readonly rotulo: string;
  readonly tex: string;
  readonly fn: (x: number) => number;
  readonly ponto: number;
  readonly explicacao: string;
}

const CASOS: readonly Caso[] = [
  {
    id: 'buraco',
    rotulo: 'Buraco em x = 1',
    tex: '\\frac{x^{2}-1}{x-1}',
    fn: (x) => (x * x - 1) / (x - 1),
    ponto: 1,
    explicacao:
      'A função não existe em x = 1, mas se aproxima de 2 pelos dois lados. O limite existe ' +
      'mesmo assim — ele descreve o destino, não o ponto.',
  },
  {
    id: 'continua',
    rotulo: 'Função contínua',
    tex: 'x^{2} + 1',
    fn: (x) => x * x + 1,
    ponto: 2,
    explicacao:
      'Aqui o limite coincide com o valor no ponto. É exatamente isso que significa ser contínua.',
  },
  {
    id: 'salto',
    rotulo: 'Salto em x = 0',
    tex: '\\frac{|x|}{x}',
    fn: (x) => Math.abs(x) / x,
    ponto: 0,
    explicacao:
      'Pela esquerda tende a −1, pela direita a +1. Os lados discordam, então o limite NÃO ' +
      'existe — e isso é diferente de ser infinito.',
  },
  {
    id: 'assintota',
    rotulo: 'Explode em x = 0',
    tex: '\\frac{1}{x^{2}}',
    fn: (x) => 1 / (x * x),
    ponto: 0,
    explicacao:
      'Os dois lados crescem sem limite. Dizemos que o limite é infinito, o que é outra ' +
      'forma de dizer que ele não existe como número.',
  },
];

@Component({
  selector: 'app-nocao-intuitiva-de-limite',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    ConceitosTopico,
    Formula,
    MathPlot,
    PassoAPasso,
    TopicoLayout,
  ],
  templateUrl: './nocao-intuitiva-de-limite.html',
  styleUrl: './nocao-intuitiva-de-limite.scss',
})
export class NocaoIntuitivaDeLimite {
  protected readonly gerador = geradorLimiteIntuitivo;
  protected readonly conceitos = TEORIA_LIMITE_INTUITIVO.map((teoria) => teoria.id);
  protected readonly casos = CASOS;

  protected readonly indice = signal(0);

  protected readonly caso = computed(() => CASOS[this.indice()] ?? CASOS[0]!);

  protected readonly lateral = computed(() =>
    limitesLaterais(this.caso().fn, this.caso().ponto),
  );

  protected readonly analise = computed(() =>
    limiteComPassos(this.caso().fn, this.caso().ponto, this.caso().tex),
  );

  /** A tabela de aproximação, que é o argumento central do tópico. */
  protected readonly tabela = computed(() => {
    const { fn, ponto } = this.caso();
    const esquerda = aproximar(fn, ponto, true, 4);
    const direita = aproximar(fn, ponto, false, 4);

    return esquerda.map((item, indice) => ({
      xEsquerda: item.x,
      fxEsquerda: item.fx,
      xDireita: direita[indice]!.x,
      fxDireita: direita[indice]!.fx,
    }));
  });

  protected readonly valorNoPonto = computed(() => {
    const valor = this.caso().fn(this.caso().ponto);
    return Number.isFinite(valor) ? valor : null;
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => [
    { fn: this.caso().fn, cor: 'serie-1', rotulo: 'f(x)' },
  ]);

  /** O ponto removido é marcado com círculo vazado, como manda a convenção. */
  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const { ponto } = this.caso();
    const lateral = this.lateral();

    if (!lateral.existe) {
      return [];
    }

    return [
      {
        x: ponto,
        y: lateral.valor!,
        rotulo: `tende a ${this.formatar(lateral.valor!)}`,
        cor: 'acento',
        vazado: this.valorNoPonto() === null,
      },
    ];
  });

  protected readonly dominio = computed(() => {
    const { ponto } = this.caso();
    return { xMin: ponto - 4, xMax: ponto + 4 };
  });

  protected readonly descricaoGrafico = computed(
    () =>
      `Gráfico de ${this.caso().rotulo}, com o comportamento em torno de x igual a ` +
      `${this.caso().ponto} em destaque.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_LIMITE_INTUITIVO);
  }

  protected selecionar(indice: number): void {
    this.indice.set(indice);
  }

  protected formatar(valor: number): string {
    if (!Number.isFinite(valor)) {
      return '—';
    }
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
