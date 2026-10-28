import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  DENSIDADE_AR,
  bernoulliComPassos,
  empuxoArquimedesComPassos,
  pressaoHidrostaticaComPassos,
  sustentacaoComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorFluidos } from './fluidos-e-aerodinamica.gerador';
import { TEORIA_FLUIDOS } from './fluidos-e-aerodinamica.teoria';

/** Materiais de referência, com densidade em kg/m³. */
const MATERIAIS: readonly { readonly nome: string; readonly densidade: number }[] = [
  { nome: 'isopor', densidade: 30 },
  { nome: 'madeira', densidade: 600 },
  { nome: 'gelo', densidade: 920 },
  { nome: 'água', densidade: 1000 },
  { nome: 'alumínio', densidade: 2700 },
  { nome: 'aço', densidade: 7800 },
];

@Component({
  selector: 'app-fluidos-e-aerodinamica',
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
  templateUrl: './fluidos-e-aerodinamica.html',
  styleUrl: './fluidos-e-aerodinamica.scss',
})
export class FluidosEAerodinamica {
  protected readonly gerador = geradorFluidos;
  protected readonly conceitos = TEORIA_FLUIDOS.map((teoria) => teoria.id);
  protected readonly materiais = MATERIAIS;

  protected readonly profundidade = signal(10);
  protected readonly densidadeCorpo = signal(920);
  protected readonly volumeLitros = signal(10);

  protected readonly areaAsa = signal(20);
  protected readonly velocidadeInferior = signal(50);
  protected readonly velocidadeSuperior = signal(60);
  protected readonly massaAviao = signal(600);

  protected readonly pressao = computed(() =>
    pressaoHidrostaticaComPassos(this.profundidade()),
  );

  protected readonly empuxo = computed(() =>
    empuxoArquimedesComPassos(this.volumeLitros() / 1000, this.densidadeCorpo()),
  );

  protected readonly sustentacao = computed(() =>
    sustentacaoComPassos(this.areaAsa(), this.velocidadeSuperior(), this.velocidadeInferior()),
  );

  protected readonly bernoulli = computed(() =>
    bernoulliComPassos(101325, this.velocidadeInferior(), this.velocidadeSuperior()),
  );

  protected readonly pesoAviao = computed(() => this.massaAviao() * 9.81);

  protected readonly voa = computed(() => this.sustentacao().resultado >= this.pesoAviao());

  protected readonly pressaoTex = computed(
    () =>
      `p = 101{,}3 + \\rho g h = ${this.formatar(this.pressao().resultado / 1000)}\\,\\text{kPa}`,
  );

  protected readonly sustentacaoTex = computed(
    () => `L = \\Delta p \\cdot A = ${this.formatar(this.sustentacao().resultado)}\\,\\text{N}`,
  );

  /** A pressão crescendo linearmente com a profundidade. */
  protected readonly curvasPressao = computed<readonly CurvaPlot[]>(() => [
    {
      fn: (h) => (h < 0 ? Number.NaN : (101325 + 1000 * 9.81 * h) / 1000),
      cor: 'serie-1',
      rotulo: 'pressão (kPa)',
    },
  ]);

  protected readonly pontosPressao = computed<readonly PontoPlot[]>(() => [
    {
      x: this.profundidade(),
      y: this.pressao().resultado / 1000,
      rotulo: `${this.formatar(this.pressao().resultado / 1000)} kPa`,
      cor: 'acento',
    },
  ]);

  protected readonly dominioPressao = computed(() => ({ xMin: 0, xMax: 110, yMin: 0 }));

  /** A sustentação em função da velocidade de voo, mantendo a razão entre as faces. */
  protected readonly curvasSustentacao = computed<readonly CurvaPlot[]>(() => {
    const razao = this.velocidadeSuperior() / this.velocidadeInferior();
    const area = this.areaAsa();
    const peso = this.pesoAviao();

    return [
      {
        fn: (v) =>
          v < 0 ? Number.NaN : (DENSIDADE_AR * ((v * razao) ** 2 - v ** 2) * area) / 2,
        cor: 'serie-1',
        rotulo: 'sustentação',
      },
      { fn: () => peso, cor: 'erro', tracejada: true, rotulo: 'peso do avião' },
    ];
  });

  protected readonly pontosSustentacao = computed<readonly PontoPlot[]>(() => [
    {
      x: this.velocidadeInferior(),
      y: this.sustentacao().resultado,
      cor: 'acento',
    },
  ]);

  protected readonly dominioSustentacao = computed(() => ({
    xMin: 0,
    xMax: 120,
    yMin: 0,
    yMax: Math.max(this.pesoAviao() * 2, this.sustentacao().resultado * 1.2),
  }));

  constructor() {
    inject(TeoriaService).registrar(TEORIA_FLUIDOS);
  }

  protected escolherMaterial(densidade: number): void {
    this.densidadeCorpo.set(densidade);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }

  protected percentual(valor: number): string {
    return `${(valor * 100).toFixed(1).replace('.', ',')}%`;
  }
}
