import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  GRAVIDADE_PADRAO,
  anguloCriticoComPassos,
  planoInclinadoComPassos,
  segundaLeiComPassos,
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
import { geradorNewton } from './leis-de-newton.gerador';
import { TEORIA_NEWTON } from './leis-de-newton.teoria';

@Component({
  selector: 'app-leis-de-newton',
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
  templateUrl: './leis-de-newton.html',
  styleUrl: './leis-de-newton.scss',
})
export class LeisDeNewton {
  protected readonly gerador = geradorNewton;
  protected readonly conceitos = TEORIA_NEWTON.map((teoria) => teoria.id);

  protected readonly massa = signal(10);
  protected readonly angulo = signal(30);
  protected readonly atrito = signal(0.2);

  /** Forças horizontais de um segundo cenário, mais simples. */
  protected readonly forcaAplicada = signal(50);
  protected readonly forcaAtrito = signal(20);

  protected readonly plano = computed(() =>
    planoInclinadoComPassos(this.massa(), this.angulo(), this.atrito()),
  );

  protected readonly horizontal = computed(() =>
    segundaLeiComPassos(this.massa(), [
      { valor: this.forcaAplicada(), descricao: 'força aplicada' },
      { valor: -this.forcaAtrito(), descricao: 'atrito' },
    ]),
  );

  protected readonly anguloCritico = computed(() => anguloCriticoComPassos(this.atrito()));

  protected readonly peso = computed(() => this.massa() * GRAVIDADE_PADRAO);

  protected readonly planoTex = computed(
    () =>
      `P_x = mg\\sin\\theta = ${this.formatar(this.plano().resultado.componentePeso)}\\,\\text{N} ` +
      `\\qquad N = mg\\cos\\theta = ${this.formatar(this.plano().resultado.normal)}\\,\\text{N}`,
  );

  /** O diagrama de corpo livre no plano inclinado. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const radianos = (this.angulo() * Math.PI) / 180;

    // Escala as forças para caber no gráfico, preservando as proporções.
    const escala = 2 / Math.max(1, this.peso());
    const { componentePeso, normal, atritoMaximo, desliza } = this.plano().resultado;

    // A rampa, com o bloco no meio.
    const comprimento = 3;
    const rampa: SegmentoPlot[] = [
      { x1: 0, y1: 0, x2: comprimento, y2: 0, cor: 'texto-suave' },
      {
        x1: 0,
        y1: 0,
        x2: comprimento * Math.cos(radianos),
        y2: comprimento * Math.sin(radianos),
        cor: 'serie-1',
      },
      {
        x1: comprimento * Math.cos(radianos),
        y1: comprimento * Math.sin(radianos),
        x2: comprimento * Math.cos(radianos),
        y2: 0,
        cor: 'texto-suave',
        tracejado: true,
      },
    ];

    // O bloco fica no meio da rampa; as forças saem dele.
    const bx = (comprimento / 2) * Math.cos(radianos);
    const by = (comprimento / 2) * Math.sin(radianos);

    const forcas: SegmentoPlot[] = [
      // Peso, sempre para baixo.
      {
        x1: bx,
        y1: by,
        x2: bx,
        y2: by - this.peso() * escala,
        cor: 'serie-2',
        seta: true,
        rotulo: 'P',
      },
      // Normal, perpendicular à rampa.
      {
        x1: bx,
        y1: by,
        x2: bx - normal * escala * Math.sin(radianos),
        y2: by + normal * escala * Math.cos(radianos),
        cor: 'serie-3',
        seta: true,
        rotulo: 'N',
      },
      // Componente do peso ao longo da rampa, para baixo do plano.
      {
        x1: bx,
        y1: by,
        x2: bx - componentePeso * escala * Math.cos(radianos),
        y2: by - componentePeso * escala * Math.sin(radianos),
        cor: 'aviso',
        seta: true,
        rotulo: 'Pₓ',
      },
    ];

    if (atritoMaximo > 0) {
      // O atrito aponta contra o deslizamento, subindo a rampa.
      const modulo = desliza ? atritoMaximo : componentePeso;
      forcas.push({
        x1: bx,
        y1: by,
        x2: bx + modulo * escala * Math.cos(radianos),
        y2: by + modulo * escala * Math.sin(radianos),
        cor: 'acerto',
        seta: true,
        rotulo: 'f',
      });
    }

    return [...rampa, ...forcas];
  });

  protected readonly dominio = computed(() => ({
    xMin: -1.5,
    xMax: 4,
    yMin: -3,
    yMax: 3,
  }));

  constructor() {
    inject(TeoriaService).registrar(TEORIA_NEWTON);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
