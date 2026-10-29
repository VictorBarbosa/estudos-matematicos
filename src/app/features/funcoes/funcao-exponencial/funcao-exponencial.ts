import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { analisarExponencialComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorExponencial } from '@features/funcoes/funcao-exponencial/funcao-exponencial.gerador';
import { TEORIA_EXPONENCIAL } from '@features/funcoes/funcao-exponencial/funcao-exponencial.teoria';

/** Bases disponíveis, incluindo as menores que 1 para o decaimento. */
const BASES = [0.2, 0.5, 1.5, 2, 2.718, 3, 5, 10] as const;

@Component({
  selector: 'app-funcao-exponencial',
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
  templateUrl: './funcao-exponencial.html',
  styleUrl: './funcao-exponencial.scss',
})
export class FuncaoExponencial {
  protected readonly gerador = geradorExponencial;
  protected readonly conceitos = TEORIA_EXPONENCIAL.map((teoria) => teoria.id);
  protected readonly bases = BASES;

  protected readonly inicial = signal(100);
  protected readonly indiceBase = signal(3);

  protected readonly base = computed(() => BASES[this.indiceBase()] ?? 2);

  protected readonly analise = computed(() =>
    analisarExponencialComPassos(this.inicial(), this.base()),
  );

  protected readonly resultado = computed(() => this.analise().resultado);

  protected readonly funcaoTex = computed(
    () => `f(x) = ${this.inicial()} \\cdot ${formatar(this.base())}^{x}`,
  );

  protected readonly comportamento = computed(() =>
    this.resultado().crescente
      ? `Crescimento: a cada passo o valor é multiplicado por ${formatar(this.base())}.`
      : `Decaimento: a cada passo o valor é multiplicado por ${formatar(this.base())}, ou seja, diminui.`,
  );

  /**
   * A exponencial ao lado de uma reta de mesma taxa inicial.
   *
   * A comparação é o ponto didático do tópico: as duas começam parecidas e a
   * exponencial logo dispara, o que explica por que intuição linear falha aqui.
   */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const inicial = this.inicial();
    const base = this.base();
    const taxaLinear = inicial * (base - 1);

    return [
      { fn: (x) => inicial * base ** x, cor: 'serie-1', rotulo: 'exponencial' },
      {
        fn: (x) => inicial + taxaLinear * x,
        cor: 'serie-2',
        tracejada: true,
        rotulo: 'reta de mesma taxa inicial',
      },
    ];
  });

  /** Os primeiros valores inteiros, para ver a multiplicação acontecendo. */
  protected readonly tabela = computed(() => {
    const inicial = this.inicial();
    const base = this.base();

    return [0, 1, 2, 3, 4].map((x) => ({
      x,
      valor: inicial * base ** x,
      razao: x === 0 ? null : base,
    }));
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() =>
    this.tabela()
      .slice(0, 4)
      .map((linha) => ({
        x: linha.x,
        y: linha.valor,
        cor: 'acento' as const,
      })),
  );

  protected readonly dominio = computed(() => ({ xMin: -3, xMax: 4 }));

  protected readonly descricaoGrafico = computed(
    () =>
      `Curva exponencial de base ${formatar(this.base())} comparada a uma reta de mesma taxa ` +
      'inicial; a exponencial se afasta rapidamente.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_EXPONENCIAL);
  }

  protected formatar(valor: number): string {
    return formatar(valor);
  }
}

function formatar(valor: number): string {
  return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
}
