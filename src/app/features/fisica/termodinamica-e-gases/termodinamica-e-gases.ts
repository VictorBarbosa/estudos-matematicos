import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { gasIdealComPassos, primeiraLeiComPassos, trabalhoIsobaricoComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { AreaPlot, CurvaPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorTermo } from './termodinamica-e-gases.gerador';
import { TEORIA_TERMO } from './termodinamica-e-gases.teoria';

@Component({
  selector: 'app-termodinamica-e-gases',
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
  templateUrl: './termodinamica-e-gases.html',
  styleUrl: './termodinamica-e-gases.scss',
})
export class TermodinamicaEGases {
  protected readonly gerador = geradorTermo;
  protected readonly conceitos = TEORIA_TERMO.map((teoria) => teoria.id);

  protected readonly mols = signal(1);
  protected readonly temperaturaCelsius = signal(25);
  protected readonly volumeLitros = signal(24);

  protected readonly calor = signal(500);
  protected readonly trabalho = signal(200);

  protected readonly pressaoAtm = signal(1);
  protected readonly volumeInicial = signal(10);
  protected readonly volumeFinal = signal(30);

  protected readonly temperatura = computed(() => this.temperaturaCelsius() + 273.15);

  protected readonly estado = computed(() =>
    gasIdealComPassos({
      mols: this.mols(),
      volume: this.volumeLitros() / 1000,
      temperatura: this.temperatura(),
    }),
  );

  protected readonly primeiraLei = computed(() =>
    primeiraLeiComPassos(this.calor(), this.trabalho()),
  );

  protected readonly trabalhoIsobarico = computed(() =>
    trabalhoIsobaricoComPassos(
      this.pressaoAtm() * 101325,
      this.volumeInicial() / 1000,
      this.volumeFinal() / 1000,
    ),
  );

  protected readonly pressaoKPa = computed(() => this.estado().resultado.pressao / 1000);

  protected readonly estadoTex = computed(
    () =>
      `pV = nRT \\;\\Rightarrow\\; p = ${this.formatar(this.pressaoKPa())}\\,\\text{kPa}`,
  );

  /** A isoterma: pressão em função do volume, à temperatura fixa. */
  protected readonly curvasIsoterma = computed<readonly CurvaPlot[]>(() => {
    const n = this.mols();
    const t = this.temperatura();

    return [
      {
        fn: (litros) => (litros <= 0 ? Number.NaN : (n * 8.314 * t) / (litros / 1000) / 1000),
        cor: 'serie-1',
        rotulo: `isoterma a ${this.temperaturaCelsius()} °C`,
      },
      {
        fn: (litros) =>
          litros <= 0 ? Number.NaN : (n * 8.314 * (t + 100)) / (litros / 1000) / 1000,
        cor: 'serie-2',
        tracejada: true,
        rotulo: `+100 K`,
      },
    ];
  });

  protected readonly dominioIsoterma = computed(() => ({
    xMin: 0,
    xMax: 80,
    yMin: 0,
    yMax: Math.min(600, this.pressaoKPa() * 3),
  }));

  /** O retângulo de trabalho no diagrama p × V. */
  protected readonly curvasTrabalho = computed<readonly CurvaPlot[]>(() => {
    const pressao = this.pressaoAtm() * 101325;
    return [{ fn: () => pressao / 1000, cor: 'serie-1', rotulo: 'isobárica' }];
  });

  protected readonly areaTrabalho = computed<readonly AreaPlot[]>(() => {
    const pressao = this.pressaoAtm() * 101325;

    return [
      {
        fn: () => pressao / 1000,
        de: this.volumeInicial(),
        ate: Math.max(this.volumeInicial(), this.volumeFinal()),
        cor: 'acento',
      },
    ];
  });

  protected readonly dominioTrabalho = computed(() => ({
    xMin: 0,
    xMax: 80,
    yMin: 0,
    yMax: this.pressaoAtm() * 101.325 * 1.6,
  }));

  constructor() {
    inject(TeoriaService).registrar(TEORIA_TERMO);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
