import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  criterioDaPotencia,
  expoenteTexto,
  integrandoPotenciaTex,
  potenciaNaOrigemComPassos,
  potenciaNoInfinitoComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { AreaPlot, CurvaPlot } from '@shared/components/math-plot/models/math-plot.model';
import { geradorIntegraisImproprias } from '@features/calculo-2/integrais-improprias/integrais-improprias.gerador';
import { TEORIA_IMPROPRIAS } from '@features/calculo-2/integrais-improprias/integrais-improprias.teoria';

@Component({
  selector: 'app-integrais-improprias',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './integrais-improprias.html',
  styleUrl: './integrais-improprias.scss',
})
export class IntegraisImproprias {
  protected readonly gerador = geradorIntegraisImproprias;
  protected readonly conceitos = TEORIA_IMPROPRIAS.map((teoria) => teoria.id);

  /** O expoente em décimos, porque o controle anda de um em um. */
  protected readonly decimosDoExpoente = signal(20);
  protected readonly borda = signal(1);
  /** Até onde a borda móvel avançou, para ver a área se acumular. */
  protected readonly ate = signal(10);

  protected readonly p = computed(() => this.decimosDoExpoente() / 10);

  protected readonly expoente = computed(() => ({
    num: this.decimosDoExpoente(),
    den: 10,
  }));

  protected readonly integrandoTex = computed(() => integrandoPotenciaTex(this.expoente()));

  protected readonly expoenteEscrito = computed(() =>
    Number(this.p().toFixed(1)).toLocaleString('pt-BR', { maximumFractionDigits: 1 }),
  );

  protected readonly noInfinito = computed(() => criterioDaPotencia(this.expoente(), false));
  protected readonly naOrigem = computed(() => criterioDaPotencia(this.expoente(), true));

  /** A área já acumulada até a borda móvel — o número que o limite persegue. */
  protected readonly acumulada = computed(() => {
    const [p, a, t] = [this.p(), this.borda(), this.ate()];
    if (Math.abs(p - 1) < 1e-9) {
      return Math.log(t) - Math.log(a);
    }
    return (t ** (1 - p) - a ** (1 - p)) / (1 - p);
  });

  protected readonly limite = computed(() => {
    const [p, a] = [this.p(), this.borda()];
    return p > 1 ? a ** (1 - p) / (p - 1) : Number.POSITIVE_INFINITY;
  });

  protected readonly integralTex = computed(() => {
    const resolucao = potenciaNoInfinitoComPassos(this.borda(), this.expoente());
    return resolucao.passos[0]!.tex;
  });

  protected readonly naOrigemTex = computed(() => {
    const resolucao = potenciaNaOrigemComPassos(1, this.expoente());
    return resolucao.passos[0]!.tex;
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const p = this.p();
    return [
      {
        fn: (x) => (x > 0 ? x ** -p : Number.NaN),
        cor: 'serie-1',
        rotulo: `1/x^${this.expoenteEscrito()}`,
      },
      { fn: (x) => (x > 0 ? 1 / x : Number.NaN), cor: 'texto-suave', tracejada: true, rotulo: '1/x' },
    ];
  });

  protected readonly areas = computed<readonly AreaPlot[]>(() => {
    const p = this.p();
    return [
      {
        fn: (x) => (x > 0 ? x ** -p : 0),
        de: this.borda(),
        ate: this.ate(),
        cor: 'acento',
      },
    ];
  });

  protected readonly dominio = computed(() => ({ xMin: 0, xMax: 12, yMin: 0, yMax: 2 }));

  protected readonly descricaoGrafico = computed(
    () =>
      `Área sob 1 sobre x elevado a ${this.expoenteEscrito()}, acumulada da borda até a borda ` +
      'móvel; a curva tracejada é 1 sobre x, que é a fronteira entre convergir e divergir.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_IMPROPRIAS);
  }

  protected formatar(valor: number): string {
    return Number.isFinite(valor)
      ? Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 })
      : 'diverge';
  }

  protected get expoenteTexto(): string {
    return expoenteTexto(this.expoente());
  }
}
