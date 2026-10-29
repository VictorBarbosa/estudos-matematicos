import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { aproximar, limiteComPassos, limitesLaterais } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorLimites } from '@features/calculo-1/limites/limites.gerador';
import { TEORIA_LIMITES } from '@features/calculo-1/limites/limites.teoria';

interface Caso {
  readonly id: string;
  readonly rotulo: string;
  readonly tex: string;
  readonly fn: (x: number) => number;
  readonly ponto: number;
  readonly tecnica: string;
}

const CASOS: readonly Caso[] = [
  {
    id: 'fatoracao',
    rotulo: 'Fatoração',
    tex: '\\frac{x^{2}-9}{x-3}',
    fn: (x) => (x * x - 9) / (x - 3),
    ponto: 3,
    tecnica: 'Fatorar o numerador revela o fator (x − 3), que cancela com o denominador.',
  },
  {
    id: 'conjugado',
    rotulo: 'Conjugado',
    tex: '\\frac{\\sqrt{x+4}-2}{x}',
    fn: (x) => (Math.sqrt(x + 4) - 2) / x,
    ponto: 0,
    tecnica:
      'Multiplicar pelo conjugado transforma a diferença de raízes numa diferença de ' +
      'quadrados, liberando o fator que cancela.',
  },
  {
    id: 'trigonometrico',
    rotulo: 'sen(x)/x',
    tex: '\\frac{\\sin x}{x}',
    fn: (x) => Math.sin(x) / x,
    ponto: 0,
    tecnica:
      'O limite trigonométrico fundamental. Para ângulos pequenos em radianos, o seno ' +
      'praticamente coincide com o ângulo.',
  },
  {
    id: 'cosseno',
    rotulo: '(1−cos x)/x',
    tex: '\\frac{1-\\cos x}{x}',
    fn: (x) => (1 - Math.cos(x)) / x,
    ponto: 0,
    tecnica:
      'O cosseno se aproxima de 1 bem mais rápido que x se aproxima de zero, e o quociente ' +
      'tende a zero.',
  },
];

@Component({
  selector: 'app-limites',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, Formula, MathPlot, PassoAPasso, TopicoLayout],
  templateUrl: './limites.html',
  styleUrl: './limites.scss',
})
export class Limites {
  protected readonly gerador = geradorLimites;
  protected readonly conceitos = TEORIA_LIMITES.map((teoria) => teoria.id);
  protected readonly casos = CASOS;

  protected readonly indice = signal(0);

  protected readonly caso = computed(() => CASOS[this.indice()] ?? CASOS[0]!);

  protected readonly lateral = computed(() =>
    limitesLaterais(this.caso().fn, this.caso().ponto),
  );

  protected readonly analise = computed(() =>
    limiteComPassos(this.caso().fn, this.caso().ponto, this.caso().tex),
  );

  protected readonly tabela = computed(() => {
    const { fn, ponto } = this.caso();
    const esquerda = aproximar(fn, ponto, true, 5);
    const direita = aproximar(fn, ponto, false, 5);

    return esquerda.map((item, indice) => ({
      distancia: Math.abs(item.x - ponto),
      pelaEsquerda: item.fx,
      pelaDireita: direita[indice]!.fx,
    }));
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => [
    { fn: this.caso().fn, cor: 'serie-1', rotulo: 'f(x)' },
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
        rotulo: `L = ${this.formatar(lateral.valor!)}`,
        cor: 'acento',
        // Nesses casos a função nunca está definida no ponto.
        vazado: true,
      },
    ];
  });

  protected readonly dominio = computed(() => {
    const { ponto } = this.caso();
    return { xMin: ponto - 5, xMax: ponto + 5 };
  });

  protected readonly descricaoGrafico = computed(
    () => `Gráfico de ${this.caso().rotulo} em torno do ponto de interesse.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_LIMITES);
  }

  protected selecionar(indice: number): void {
    this.indice.set(indice);
  }

  protected formatar(valor: number): string {
    if (!Number.isFinite(valor)) {
      return '—';
    }
    return Number(valor.toFixed(6)).toLocaleString('pt-BR', { maximumFractionDigits: 6 });
  }
}
