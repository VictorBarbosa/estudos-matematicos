import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  decomporComPassos,
  deModuloEAngulo,
  direcaoGraus,
  modulo,
  somar,
  somarComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { SegmentoPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorVetores } from './vetores-no-plano.gerador';
import { TEORIA_VETORES } from './vetores-no-plano.teoria';

@Component({
  selector: 'app-vetores-no-plano',
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
  templateUrl: './vetores-no-plano.html',
  styleUrl: './vetores-no-plano.scss',
})
export class VetoresNoPlano {
  protected readonly gerador = geradorVetores;
  protected readonly conceitos = TEORIA_VETORES.map((teoria) => teoria.id);

  /** Primeiro vetor, dado em forma polar. */
  protected readonly comprimentoA = signal(6);
  protected readonly anguloA = signal(30);

  /** Segundo vetor, em componentes. */
  protected readonly bx = signal(-2);
  protected readonly by = signal(5);

  protected readonly a = computed(() => deModuloEAngulo(this.comprimentoA(), this.anguloA()));
  protected readonly b = computed(() => ({ x: this.bx(), y: this.by() }));

  protected readonly decomposicao = computed(() =>
    decomporComPassos(this.comprimentoA(), this.anguloA()),
  );

  protected readonly analiseSoma = computed(() => somarComPassos(this.a(), this.b()));

  protected readonly soma = computed(() => somar(this.a(), this.b()));

  protected readonly moduloA = computed(() => modulo(this.a()));
  protected readonly moduloB = computed(() => modulo(this.b()));
  protected readonly moduloSoma = computed(() => modulo(this.soma()));

  /** A soma dos módulos, para comparar com o módulo da soma. */
  protected readonly somaDosModulos = computed(() => this.moduloA() + this.moduloB());

  protected readonly direcaoSoma = computed(() => direcaoGraus(this.soma()));

  protected readonly decomposicaoTex = computed(() => {
    const { x, y } = this.a();
    return (
      `\\vec{a} = (${this.formatar(x)},\\; ${this.formatar(y)}) \\qquad ` +
      `|\\vec{a}| = ${this.formatar(this.moduloA())}`
    );
  });

  protected readonly somaTex = computed(() => {
    const s = this.soma();
    return `\\vec{a} + \\vec{b} = (${this.formatar(s.x)},\\; ${this.formatar(s.y)})`;
  });

  /** Os dois vetores, a soma e as linhas do paralelogramo. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const a = this.a();
    const b = this.b();
    const s = this.soma();

    return [
      { x1: 0, y1: 0, x2: a.x, y2: a.y, cor: 'serie-1', seta: true, rotulo: 'a' },
      { x1: 0, y1: 0, x2: b.x, y2: b.y, cor: 'serie-2', seta: true, rotulo: 'b' },
      { x1: 0, y1: 0, x2: s.x, y2: s.y, cor: 'acento', seta: true, rotulo: 'a + b' },
      // O paralelogramo fecha visualmente a construção da soma.
      { x1: a.x, y1: a.y, x2: s.x, y2: s.y, cor: 'texto-suave', tracejado: true },
      { x1: b.x, y1: b.y, x2: s.x, y2: s.y, cor: 'texto-suave', tracejado: true },
    ];
  });

  /** As componentes do primeiro vetor, mostradas como cateto. */
  protected readonly componentes = computed<readonly SegmentoPlot[]>(() => {
    const a = this.a();

    return [
      { x1: 0, y1: 0, x2: a.x, y2: 0, cor: 'serie-3', tracejado: true },
      { x1: a.x, y1: 0, x2: a.x, y2: a.y, cor: 'serie-3', tracejado: true },
    ];
  });

  protected readonly todosOsSegmentos = computed<readonly SegmentoPlot[]>(() => [
    ...this.componentes(),
    ...this.segmentos(),
  ]);

  protected readonly dominio = computed(() => {
    const alcance =
      Math.max(
        Math.abs(this.a().x),
        Math.abs(this.a().y),
        Math.abs(this.b().x),
        Math.abs(this.b().y),
        Math.abs(this.soma().x),
        Math.abs(this.soma().y),
      ) + 2;

    return { xMin: -alcance, xMax: alcance, yMin: -alcance, yMax: alcance };
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_VETORES);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
