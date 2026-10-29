import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  argumentoGraus,
  complexoParaTex,
  moduloComplexo,
  multiplicarComplexosComPassos,
  paraPolarComPassos,
  potenciaComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { PontoPlot, SegmentoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorComplexos } from '@features/vetores-matrizes/numeros-complexos/numeros-complexos.gerador';
import { TEORIA_COMPLEXOS } from '@features/vetores-matrizes/numeros-complexos/numeros-complexos.teoria';

@Component({
  selector: 'app-numeros-complexos',
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
  templateUrl: './numeros-complexos.html',
  styleUrl: './numeros-complexos.scss',
})
export class NumerosComplexos {
  protected readonly gerador = geradorComplexos;
  protected readonly conceitos = TEORIA_COMPLEXOS.map((teoria) => teoria.id);

  protected readonly a1 = signal(2);
  protected readonly b1 = signal(1);
  protected readonly a2 = signal(1);
  protected readonly b2 = signal(2);

  /** Até que potência de z₁ mostrar a espiral. */
  protected readonly expoente = signal(5);

  protected readonly z1 = computed(() => ({ real: this.a1(), imaginario: this.b1() }));
  protected readonly z2 = computed(() => ({ real: this.a2(), imaginario: this.b2() }));

  protected readonly produto = computed(() =>
    multiplicarComplexosComPassos(this.z1(), this.z2()),
  );

  protected readonly polar = computed(() => {
    try {
      return paraPolarComPassos(this.z1());
    } catch {
      return null;
    }
  });

  protected readonly potencia = computed(() => potenciaComPassos(this.z1(), this.expoente()));

  protected readonly z1Tex = computed(() => `z_1 = ${complexoParaTex(this.z1())}`);
  protected readonly z2Tex = computed(() => `z_2 = ${complexoParaTex(this.z2())}`);

  protected readonly produtoTex = computed(
    () => `z_1 z_2 = ${complexoParaTex(this.produto().resultado)}`,
  );

  protected readonly moduloZ1 = computed(() => moduloComplexo(this.z1()));
  protected readonly moduloZ2 = computed(() => moduloComplexo(this.z2()));
  protected readonly moduloProduto = computed(() => moduloComplexo(this.produto().resultado));

  protected readonly argumentoZ1 = computed(() => argumentoGraus(this.z1()));
  protected readonly argumentoZ2 = computed(() => argumentoGraus(this.z2()));
  protected readonly argumentoProduto = computed(() => argumentoGraus(this.produto().resultado));

  /** As potências sucessivas de z₁: a espiral que De Moivre descreve. */
  protected readonly potencias = computed<readonly PontoPlot[]>(() => {
    const pontos: PontoPlot[] = [];

    for (let n = 1; n <= this.expoente(); n++) {
      const { resultado } = potenciaComPassos(this.z1(), n);
      pontos.push({
        x: resultado.real,
        y: resultado.imaginario,
        rotulo: `z^${n}`,
        cor: n === this.expoente() ? 'acento' : 'serie-3',
      });
    }

    return pontos;
  });

  /** Os três números em destaque, como vetores a partir da origem. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const z1 = this.z1();
    const z2 = this.z2();
    const produto = this.produto().resultado;

    return [
      { x1: 0, y1: 0, x2: z1.real, y2: z1.imaginario, cor: 'serie-1', seta: true, rotulo: 'z₁' },
      { x1: 0, y1: 0, x2: z2.real, y2: z2.imaginario, cor: 'serie-2', seta: true, rotulo: 'z₂' },
      {
        x1: 0,
        y1: 0,
        x2: produto.real,
        y2: produto.imaginario,
        cor: 'acerto',
        seta: true,
        rotulo: 'z₁z₂',
      },
    ];
  });

  protected readonly dominio = computed(() => {
    const valores = [
      ...this.potencias().flatMap((ponto) => [Math.abs(ponto.x), Math.abs(ponto.y)]),
      Math.abs(this.produto().resultado.real),
      Math.abs(this.produto().resultado.imaginario),
      3,
    ];

    const alcance = Math.min(60, Math.max(...valores) * 1.2);
    return { xMin: -alcance, xMax: alcance, yMin: -alcance, yMax: alcance };
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_COMPLEXOS);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
