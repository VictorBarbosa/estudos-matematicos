import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  divisores,
  fatoracaoParaTex,
  mdcComPassos,
  mmcComPassos,
  relacaoMdcMmcComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MarcaPlot } from '@shared/components/math-plot/models/math-plot.model';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorMmcMdc } from '@features/matematica-basica/mmc-mdc/mmc-mdc.gerador';
import { TEORIA_MMC_MDC } from '@features/matematica-basica/mmc-mdc/mmc-mdc.teoria';

@Component({
  selector: 'app-mmc-mdc',
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
  templateUrl: './mmc-mdc.html',
  styleUrl: './mmc-mdc.scss',
})
export class MmcMdc {
  protected readonly gerador = geradorMmcMdc;
  protected readonly conceitos = TEORIA_MMC_MDC.map((teoria) => teoria.id);

  protected readonly a = signal(12);
  protected readonly b = signal(18);

  protected readonly fatoracaoA = computed(() => fatoracaoParaTex(this.a()));
  protected readonly fatoracaoB = computed(() => fatoracaoParaTex(this.b()));

  protected readonly resolucaoMdc = computed(() => mdcComPassos(this.a(), this.b()));
  protected readonly resolucaoMmc = computed(() => mmcComPassos(this.a(), this.b()));
  protected readonly relacao = computed(() => relacaoMdcMmcComPassos(this.a(), this.b()));

  protected readonly mdc = computed(() => this.resolucaoMdc().resultado);
  protected readonly mmc = computed(() => this.resolucaoMmc().resultado);

  /** Qual demonstração está em foco. */
  protected readonly foco = signal<'mdc' | 'mmc'>('mmc');

  protected readonly passosEmFoco = computed(() =>
    this.foco() === 'mdc' ? this.resolucaoMdc().passos : this.resolucaoMmc().passos,
  );

  /** Os divisores comuns, que tornam o MDC visível como o maior deles. */
  protected readonly divisoresComuns = computed(() => {
    const deA = new Set(divisores(this.a()));
    return divisores(this.b()).filter((divisor) => deA.has(divisor));
  });

  /**
   * Os primeiros múltiplos de cada número na reta, com o MMC destacado:
   * é o primeiro ponto em que as duas sequências se encontram.
   */
  protected readonly marcasMultiplos = computed<readonly MarcaPlot[]>(() => {
    const a = this.a();
    const b = this.b();
    const limite = this.mmc();

    const marcas: MarcaPlot[] = [];

    for (let valor = a; valor < limite; valor += a) {
      marcas.push({ x: valor, rotulo: String(valor), cor: 'serie-1' });
    }
    for (let valor = b; valor < limite; valor += b) {
      marcas.push({ x: valor, rotulo: String(valor), cor: 'serie-2' });
    }

    marcas.push({ x: limite, rotulo: `MMC ${limite}`, cor: 'acento' });
    return marcas;
  });

  protected readonly dominioMultiplos = computed(() => ({
    xMin: -this.mmc() * 0.08,
    xMax: this.mmc() * 1.12,
  }));

  protected readonly descricaoMultiplos = computed(
    () =>
      `Reta com os múltiplos de ${this.a()} e de ${this.b()}; ` +
      `o primeiro valor comum é ${this.mmc()}.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_MMC_MDC);
  }

  protected definirFoco(foco: 'mdc' | 'mmc'): void {
    this.foco.set(foco);
  }
}
