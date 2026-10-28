import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TipoColisao, colisaoComPassos, impulsoComPassos, momentoLinear } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, SegmentoPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorMomento } from './impulso-e-momento.gerador';
import { TEORIA_MOMENTO } from './impulso-e-momento.teoria';

@Component({
  selector: 'app-impulso-e-momento',
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
  templateUrl: './impulso-e-momento.html',
  styleUrl: './impulso-e-momento.scss',
})
export class ImpulsoEMomento {
  protected readonly gerador = geradorMomento;
  protected readonly conceitos = TEORIA_MOMENTO.map((teoria) => teoria.id);

  protected readonly massaA = signal(2);
  protected readonly velocidadeA = signal(10);
  protected readonly massaB = signal(3);
  protected readonly velocidadeB = signal(0);

  protected readonly tipo = signal<TipoColisao>('perfeitamente-inelastica');

  /** Cenário do airbag: mesma variação de momento, tempos diferentes. */
  protected readonly massaOcupante = signal(70);
  protected readonly velocidadeImpacto = signal(15);
  protected readonly tempoParada = signal(0.2);

  protected readonly tipos: readonly { readonly id: TipoColisao; readonly rotulo: string }[] = [
    { id: 'perfeitamente-inelastica', rotulo: 'Inelástica (seguem juntos)' },
    { id: 'elastica', rotulo: 'Elástica (sem perda)' },
  ];

  protected readonly colisao = computed(() =>
    colisaoComPassos(
      this.massaA(),
      this.velocidadeA(),
      this.massaB(),
      this.velocidadeB(),
      this.tipo(),
    ),
  );

  protected readonly momentoAntes = computed(
    () =>
      momentoLinear(this.massaA(), this.velocidadeA()) +
      momentoLinear(this.massaB(), this.velocidadeB()),
  );

  protected readonly momentoDepois = computed(() => {
    const { velocidadeFinalA, velocidadeFinalB } = this.colisao().resultado;
    return (
      momentoLinear(this.massaA(), velocidadeFinalA) +
      momentoLinear(this.massaB(), velocidadeFinalB)
    );
  });

  protected readonly energiaPerdida = computed(() => {
    const { energiaAntes, energiaDepois } = this.colisao().resultado;
    return energiaAntes - energiaDepois;
  });

  protected readonly forcaMedia = computed(
    () => (this.massaOcupante() * this.velocidadeImpacto()) / this.tempoParada(),
  );

  protected readonly impulso = computed(() =>
    impulsoComPassos(this.forcaMedia(), this.tempoParada(), this.massaOcupante()),
  );

  protected readonly momentoTex = computed(
    () =>
      `p_i = ${this.formatar(this.momentoAntes())} \;\\to\; p_f = ` +
      `${this.formatar(this.momentoDepois())}\\,\\text{kg·m/s}`,
  );

  /** A força média necessária em função do tempo de parada. */
  protected readonly curvaForca = computed<readonly CurvaPlot[]>(() => {
    const variacaoMomento = this.massaOcupante() * this.velocidadeImpacto();

    return [
      {
        fn: (t) => (t <= 0.001 ? Number.NaN : variacaoMomento / t),
        cor: 'serie-1',
        rotulo: 'força média',
      },
    ];
  });

  protected readonly dominioForca = computed(() => ({
    xMin: 0,
    xMax: 1,
    yMin: 0,
    yMax: (this.massaOcupante() * this.velocidadeImpacto()) / 0.05,
  }));

  /** Antes e depois da colisão, como vetores de velocidade. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const { velocidadeFinalA, velocidadeFinalB } = this.colisao().resultado;

    return [
      { x1: 0, y1: 1, x2: this.velocidadeA(), y2: 1, cor: 'serie-1', seta: true, rotulo: 'A antes' },
      { x1: 0, y1: 0.5, x2: this.velocidadeB(), y2: 0.5, cor: 'serie-2', seta: true, rotulo: 'B antes' },
      {
        x1: 0,
        y1: -0.5,
        x2: velocidadeFinalA,
        y2: -0.5,
        cor: 'serie-3',
        seta: true,
        rotulo: 'A depois',
      },
      {
        x1: 0,
        y1: -1,
        x2: velocidadeFinalB,
        y2: -1,
        cor: 'acento',
        seta: true,
        rotulo: 'B depois',
      },
    ];
  });

  protected readonly dominioColisao = computed(() => {
    const maior = Math.max(
      Math.abs(this.velocidadeA()),
      Math.abs(this.velocidadeB()),
      Math.abs(this.colisao().resultado.velocidadeFinalA),
      Math.abs(this.colisao().resultado.velocidadeFinalB),
    );

    return { xMin: -maior - 2, xMax: maior + 2, yMin: -2, yMax: 2 };
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_MOMENTO);
  }

  protected selecionarTipo(tipo: TipoColisao): void {
    this.tipo.set(tipo);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
