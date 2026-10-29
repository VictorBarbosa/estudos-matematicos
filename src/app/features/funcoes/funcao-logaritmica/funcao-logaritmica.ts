import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { analisarLogaritmicaComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorLogaritmica } from '@features/funcoes/funcao-logaritmica/funcao-logaritmica.gerador';
import { TEORIA_LOGARITMICA } from '@features/funcoes/funcao-logaritmica/funcao-logaritmica.teoria';

const BASES = [2, 2.718, 3, 5, 10] as const;

@Component({
  selector: 'app-funcao-logaritmica',
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
  templateUrl: './funcao-logaritmica.html',
  styleUrl: './funcao-logaritmica.scss',
})
export class FuncaoLogaritmica {
  protected readonly gerador = geradorLogaritmica;
  protected readonly conceitos = TEORIA_LOGARITMICA.map((teoria) => teoria.id);

  protected readonly indiceBase = signal(0);
  protected readonly mostrarExponencial = signal(true);

  protected readonly base = computed(() => BASES[this.indiceBase()] ?? 2);

  protected readonly analise = computed(() => analisarLogaritmicaComPassos(this.base()));

  protected readonly funcaoTex = computed(
    () => `f(x) = \\log_{${formatar(this.base())}} x`,
  );

  /**
   * O logaritmo ao lado da exponencial de mesma base e da reta y = x.
   *
   * Ver as três juntas mostra que as duas curvas são reflexos — que é a
   * definição de função inversa, desenhada.
   */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const base = this.base();
    const logaritmo: CurvaPlot = {
      fn: (x) => (x <= 0 ? Number.NaN : Math.log(x) / Math.log(base)),
      cor: 'serie-1',
      rotulo: 'logaritmo',
    };

    if (!this.mostrarExponencial()) {
      return [logaritmo];
    }

    return [
      logaritmo,
      { fn: (x) => base ** x, cor: 'serie-2', rotulo: 'exponencial' },
      { fn: (x) => x, cor: 'texto-suave', tracejada: true, rotulo: 'y = x (eixo do espelho)' },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const base = this.base();

    return [
      { x: 1, y: 0, rotulo: 'log(1) = 0', cor: 'acento' },
      { x: base, y: 1, rotulo: `log(${formatar(base)}) = 1`, cor: 'acento' },
    ];
  });

  protected readonly dominio = computed(() => ({ xMin: -4, xMax: 8, yMin: -4, yMax: 8 }));

  protected readonly descricaoGrafico = computed(
    () =>
      `Curva logarítmica de base ${formatar(this.base())}` +
      (this.mostrarExponencial()
        ? ', espelhada com a exponencial pela reta y igual a x.'
        : ', com assíntota vertical no eixo y.'),
  );

  /** Alguns valores exatos, para ver o logaritmo como contagem de fatores. */
  protected readonly tabela = computed(() => {
    const base = this.base();
    return [-2, -1, 0, 1, 2, 3].map((expoente) => ({
      expoente,
      argumento: base ** expoente,
    }));
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_LOGARITMICA);
  }

  protected alternarExponencial(): void {
    this.mostrarExponencial.update((valor) => !valor);
  }

  protected formatar(valor: number): string {
    return formatar(valor);
  }
}

function formatar(valor: number): string {
  return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
}
