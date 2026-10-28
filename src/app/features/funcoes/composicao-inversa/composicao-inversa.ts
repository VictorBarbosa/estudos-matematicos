import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Afim, afimParaTex, comporComPassos, inverterComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorComposicao } from './composicao-inversa.gerador';
import { TEORIA_COMPOSICAO } from './composicao-inversa.teoria';

type Aba = 'composicao' | 'inversa';

@Component({
  selector: 'app-composicao-inversa',
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
  templateUrl: './composicao-inversa.html',
  styleUrl: './composicao-inversa.scss',
})
export class ComposicaoInversa {
  protected readonly gerador = geradorComposicao;
  protected readonly conceitos = TEORIA_COMPOSICAO.map((teoria) => teoria.id);

  protected readonly fa = signal(2);
  protected readonly fb = signal(1);
  protected readonly ga = signal(1);
  protected readonly gb = signal(-3);

  protected readonly foco = signal<Aba>('composicao');

  protected readonly f = computed<Afim>(() => ({ a: this.fa() === 0 ? 1 : this.fa(), b: this.fb() }));
  protected readonly g = computed<Afim>(() => ({ a: this.ga() === 0 ? 1 : this.ga(), b: this.gb() }));

  protected readonly fTex = computed(() => afimParaTex(this.f(), 'f'));
  protected readonly gTex = computed(() => afimParaTex(this.g(), 'g'));

  protected readonly fComG = computed(() => comporComPassos(this.f(), this.g()));
  protected readonly gComF = computed(() => comporComPassos(this.g(), this.f()));

  protected readonly inversa = computed(() => inverterComPassos(this.f()));

  /** As duas ordens dão o mesmo resultado? Quase nunca — e vale mostrar. */
  protected readonly ordemImporta = computed(() => {
    const direta = this.fComG().resultado;
    const contraria = this.gComF().resultado;
    return direta.a !== contraria.a || direta.b !== contraria.b;
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const f = this.f();

    if (this.foco() === 'inversa') {
      const inversa = this.inversa().resultado;
      return [
        { fn: (x) => f.a * x + f.b, cor: 'serie-1', rotulo: 'f' },
        { fn: (x) => inversa.a * x + inversa.b, cor: 'serie-2', rotulo: 'f⁻¹' },
        { fn: (x) => x, cor: 'texto-suave', tracejada: true, rotulo: 'y = x (espelho)' },
      ];
    }

    const direta = this.fComG().resultado;
    const contraria = this.gComF().resultado;
    const g = this.g();

    return [
      { fn: (x) => f.a * x + f.b, cor: 'texto-suave', tracejada: true, rotulo: 'f' },
      { fn: (x) => g.a * x + g.b, cor: 'texto-suave', tracejada: true, rotulo: 'g' },
      { fn: (x) => direta.a * x + direta.b, cor: 'serie-1', rotulo: 'f ∘ g' },
      { fn: (x) => contraria.a * x + contraria.b, cor: 'serie-2', rotulo: 'g ∘ f' },
    ];
  });

  /** Um ponto e seu reflexo, para tornar a simetria visível. */
  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    if (this.foco() !== 'inversa') {
      return [];
    }

    const f = this.f();
    const x = 1;
    const y = f.a * x + f.b;

    return [
      { x, y, rotulo: `(${x}, ${formatar(y)})`, cor: 'serie-1' },
      { x: y, y: x, rotulo: `(${formatar(y)}, ${x})`, cor: 'serie-2' },
    ];
  });

  protected readonly dominio = computed(() => ({ xMin: -8, xMax: 8, yMin: -8, yMax: 8 }));

  protected readonly descricaoGrafico = computed(() =>
    this.foco() === 'inversa'
      ? 'Função e sua inversa, espelhadas pela reta y igual a x.'
      : 'As duas composições possíveis, f composta com g e g composta com f, em geral distintas.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_COMPOSICAO);
  }

  protected definirFoco(foco: Aba): void {
    this.foco.set(foco);
  }

  protected formatar(valor: number): string {
    return formatar(valor);
  }
}

function formatar(valor: number): string {
  return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
}
