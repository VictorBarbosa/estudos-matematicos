import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CONDUTIVIDADES, STEFAN_BOLTZMANN, ZERO_CELSIUS } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot } from '@shared/components/math-plot/models/math-plot.model';
import { geradorTransferenciaDeCalor } from '@features/fisica/transferencia-de-calor/transferencia-de-calor.gerador';
import { TEORIA_TERMICA } from '@features/fisica/transferencia-de-calor/transferencia-de-calor.teoria';

@Component({
  selector: 'app-transferencia-de-calor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './transferencia-de-calor.html',
  styleUrl: './transferencia-de-calor.scss',
})
export class TransferenciaDeCalor {
  protected readonly gerador = geradorTransferenciaDeCalor;
  protected readonly conceitos = TEORIA_TERMICA.map((teoria) => teoria.id);
  protected readonly materiais = CONDUTIVIDADES;

  protected readonly escolha = signal(2);
  /** Espessura em centímetros, que é como ela se mede na prática. */
  protected readonly centimetros = signal(20);
  protected readonly area = signal(2);
  protected readonly deltaT = signal(20);
  protected readonly coeficienteConveccao = signal(10);
  protected readonly celsius = signal(27);
  protected readonly emissividade = signal(9);

  protected readonly material = computed(() => CONDUTIVIDADES[this.escolha()]!);
  protected readonly espessura = computed(() => this.centimetros() / 100);
  protected readonly kelvin = computed(() => this.celsius() + ZERO_CELSIUS);

  protected readonly conducao = computed(
    () => (this.material().k * this.area() * this.deltaT()) / this.espessura(),
  );

  protected readonly conveccao = computed(
    () => this.coeficienteConveccao() * this.area() * this.deltaT(),
  );

  protected readonly radiacao = computed(
    () => (this.emissividade() / 10) * STEFAN_BOLTZMANN * this.area() * this.kelvin() ** 4,
  );

  protected readonly resistencia = computed(
    () => this.espessura() / (this.material().k * this.area()),
  );

  protected readonly conducaoTex = computed(
    () =>
      `\\frac{Q}{t} = \\frac{${this.tex(this.material().k)} \\cdot ${this.tex(this.area())} \\cdot ` +
      `${this.tex(this.deltaT())}}{${this.tex(this.espessura())}} = ${this.tex(this.conducao())}\\ \\text{W}`,
  );

  /** A emissão em função da temperatura: a quarta potência à vista. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const area = this.area();
    const emissividade = this.emissividade() / 10;

    return [
      {
        fn: (t) => (t > 0 ? emissividade * STEFAN_BOLTZMANN * area * t ** 4 : Number.NaN),
        cor: 'acento',
        rotulo: 'radiação',
      },
      {
        fn: (t) => this.coeficienteConveccao() * area * Math.max(0, t - 300),
        cor: 'serie-2',
        tracejada: true,
        rotulo: 'convecção (linear)',
      },
    ];
  });

  protected readonly dominio = computed(() => ({ xMin: 250, xMax: 700 }));

  protected readonly descricaoGrafico = computed(
    () =>
      'Potência emitida em função da temperatura absoluta: a radiação sobe com a quarta ' +
      'potência e, acima de certa temperatura, domina qualquer troca linear.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_TERMICA);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }

  private tex(valor: number): string {
    return String(Number(valor.toFixed(4))).replace('.', '{,}');
  }
}
