import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { escalaComPassos, pitagorasComPassos, talesComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { SegmentoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorSemelhanca } from '@features/geometria/semelhanca-e-pitagoras/semelhanca-e-pitagoras.gerador';
import { TEORIA_SEMELHANCA } from '@features/geometria/semelhanca-e-pitagoras/semelhanca-e-pitagoras.teoria';

@Component({
  selector: 'app-semelhanca-e-pitagoras',
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
  templateUrl: './semelhanca-e-pitagoras.html',
  styleUrl: './semelhanca-e-pitagoras.scss',
})
export class SemelhancaEPitagoras {
  protected readonly gerador = geradorSemelhanca;
  protected readonly conceitos = TEORIA_SEMELHANCA.map((teoria) => teoria.id);

  protected readonly cateto1 = signal(3);
  protected readonly cateto2 = signal(4);

  protected readonly k = signal(2);

  protected readonly analise = computed(() =>
    pitagorasComPassos(this.cateto1(), this.cateto2()),
  );

  protected readonly hipotenusa = computed(() => this.analise().resultado);

  /** As projeções dos catetos sobre a hipotenusa, que a prova por semelhança usa. */
  protected readonly projecoes = computed(() => {
    const b = this.cateto1();
    const c = this.cateto2();
    const a = this.hipotenusa();

    return { m: (b * b) / a, n: (c * c) / a, altura: (b * c) / a };
  });

  protected readonly pitagorasTex = computed(() => {
    const b = this.cateto1();
    const c = this.cateto2();

    return `${b}^{2} + ${c}^{2} = ${b * b + c * c} \\;\\Rightarrow\\; a = ${this.formatar(this.hipotenusa())}`;
  });

  /** O triângulo retângulo com a altura relativa à hipotenusa. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const b = this.cateto1();
    const c = this.cateto2();
    const { m, altura } = this.projecoes();

    if (b <= 0 || c <= 0) {
      return [];
    }

    // Hipotenusa no eixo x; o vértice do ângulo reto sobe sobre a projeção m.
    const a = this.hipotenusa();

    return [
      { x1: 0, y1: 0, x2: a, y2: 0, cor: 'serie-1' },
      { x1: 0, y1: 0, x2: m, y2: altura, cor: 'serie-2' },
      { x1: a, y1: 0, x2: m, y2: altura, cor: 'serie-3' },
      { x1: m, y1: 0, x2: m, y2: altura, cor: 'acento', tracejado: true },
    ];
  });

  protected readonly dominioTriangulo = computed(() => {
    const a = this.hipotenusa();
    return { xMin: -0.5, xMax: a + 0.5, yMin: -0.5, yMax: a * 0.8 };
  });

  protected readonly escalaArea = computed(() => escalaComPassos(this.k(), 2));
  protected readonly escalaVolume = computed(() => escalaComPassos(this.k(), 3));

  protected readonly tales = computed(() => talesComPassos(2, 3, 4));

  protected readonly razaoSuperficieVolume = computed(() => 1 / this.k());

  constructor() {
    inject(TeoriaService).registrar(TEORIA_SEMELHANCA);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
