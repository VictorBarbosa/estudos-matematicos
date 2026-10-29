import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { analisarModularComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorModular } from '@features/funcoes/funcao-modular/funcao-modular.gerador';
import { TEORIA_MODULAR } from '@features/funcoes/funcao-modular/funcao-modular.teoria';

@Component({
  selector: 'app-funcao-modular',
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
  templateUrl: './funcao-modular.html',
  styleUrl: './funcao-modular.scss',
})
export class FuncaoModular {
  protected readonly gerador = geradorModular;
  protected readonly conceitos = TEORIA_MODULAR.map((teoria) => teoria.id);

  protected readonly a = signal(1);
  protected readonly b = signal(-2);
  protected readonly k = signal(3);
  protected readonly mostrarSemModulo = signal(true);

  protected readonly aEfetivo = computed(() => (this.a() === 0 ? 1 : this.a()));

  protected readonly analise = computed(() =>
    analisarModularComPassos(this.aEfetivo(), this.b()),
  );

  protected readonly bico = computed(() => this.analise().resultado.vertice);

  protected readonly funcaoTex = computed(() => {
    const a = this.aEfetivo();
    const coeficiente = a === 1 ? '' : a === -1 ? '-' : String(a);
    return `f(x) = \\left|${coeficiente}x ${this.b() >= 0 ? '+' : '-'} ${Math.abs(this.b())}\\right|`;
  });

  /** As duas soluções de |ax + b| = k, que a reta horizontal revela. */
  protected readonly solucoes = computed(() => {
    const a = this.aEfetivo();
    const b = this.b();
    const k = this.k();

    if (k < 0) {
      return [];
    }
    if (k === 0) {
      return [-b / a];
    }

    return [(k - b) / a, (-k - b) / a].sort((x, y) => x - y);
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const a = this.aEfetivo();
    const b = this.b();

    const modular: CurvaPlot = {
      fn: (x) => Math.abs(a * x + b),
      cor: 'serie-1',
      rotulo: '|ax + b|',
    };

    const horizontal: CurvaPlot = {
      fn: () => this.k(),
      cor: 'serie-3',
      tracejada: true,
      rotulo: `y = ${this.k()}`,
    };

    if (!this.mostrarSemModulo()) {
      return [modular, horizontal];
    }

    return [
      modular,
      {
        fn: (x) => a * x + b,
        cor: 'serie-2',
        tracejada: true,
        rotulo: 'ax + b (sem módulo)',
      },
      horizontal,
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    {
      x: this.bico().x,
      y: 0,
      rotulo: `bico em ${formatar(this.bico().x)}`,
      cor: 'acento',
    },
    ...this.solucoes().map((x) => ({
      x,
      y: this.k(),
      rotulo: formatar(x),
      cor: 'serie-3' as const,
    })),
  ]);

  protected readonly dominio = computed(() => {
    const centro = this.bico().x;
    const alcance = Math.max(6, Math.abs(centro) + 4);
    return { xMin: centro - alcance, xMax: centro + alcance };
  });

  protected readonly descricaoGrafico = computed(
    () =>
      `Gráfico em V com bico em x igual a ${formatar(this.bico().x)}, cortado pela reta ` +
      `horizontal y igual a ${this.k()} em ${this.solucoes().length} ponto(s).`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_MODULAR);
  }

  protected alternarSemModulo(): void {
    this.mostrarSemModulo.update((valor) => !valor);
  }

  protected formatar(valor: number): string {
    return formatar(valor);
  }
}

function formatar(valor: number): string {
  return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
}
