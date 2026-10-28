import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { centroDeMassaComPassos, equilibrioAlavancaComPassos, torqueComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { PontoPlot, SegmentoPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorTorque } from './estatica-e-torque.gerador';
import { TEORIA_TORQUE } from './estatica-e-torque.teoria';

@Component({
  selector: 'app-estatica-e-torque',
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
  templateUrl: './estatica-e-torque.html',
  styleUrl: './estatica-e-torque.scss',
})
export class EstaticaETorque {
  protected readonly gerador = geradorTorque;
  protected readonly conceitos = TEORIA_TORQUE.map((teoria) => teoria.id);

  protected readonly forca = signal(50);
  protected readonly braco = signal(2);
  protected readonly angulo = signal(90);

  /** A alavanca: peso de um lado, força do outro. */
  protected readonly pesoEsquerda = signal(100);
  protected readonly distanciaEsquerda = signal(0.5);
  protected readonly forcaDireita = signal(25);

  /** Dois corpos sobre uma barra, para o centro de massa. */
  protected readonly massa1 = signal(1);
  protected readonly massa2 = signal(9);

  protected readonly analiseTorque = computed(() =>
    torqueComPassos(this.forca(), this.braco(), this.angulo()),
  );

  protected readonly alavanca = computed(() =>
    equilibrioAlavancaComPassos(
      this.pesoEsquerda(),
      this.distanciaEsquerda(),
      this.forcaDireita(),
    ),
  );

  protected readonly centroMassa = computed(() =>
    centroDeMassaComPassos([
      { massa: this.massa1(), posicao: 0 },
      { massa: this.massa2(), posicao: 10 },
    ]),
  );

  protected readonly torqueTex = computed(
    () =>
      `\\tau = ${this.braco()} \\cdot ${this.forca()} \\cdot \\sin ${this.angulo()}^\\circ = ` +
      `${this.formatar(this.analiseTorque().resultado)}\\,\\text{N·m}`,
  );

  /** O torque máximo possível com essa força e esse braço. */
  protected readonly torqueMaximo = computed(() => this.forca() * this.braco());

  protected readonly aproveitamento = computed(() =>
    this.torqueMaximo() === 0 ? 0 : this.analiseTorque().resultado / this.torqueMaximo(),
  );

  /** O braço, a força aplicada e sua componente perpendicular. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const r = this.braco();
    const radianos = (this.angulo() * Math.PI) / 180;
    const escala = 2 / Math.max(1, this.forca());

    const ponta = { x: r, y: 0 };
    const direcao = { x: Math.cos(radianos), y: Math.sin(radianos) };
    const comprimento = this.forca() * escala;

    return [
      // O braço, do eixo até o ponto de aplicação.
      { x1: 0, y1: 0, x2: ponta.x, y2: ponta.y, cor: 'texto-suave', rotulo: 'braço r' },
      // A força aplicada, no ângulo escolhido.
      {
        x1: ponta.x,
        y1: ponta.y,
        x2: ponta.x + direcao.x * comprimento,
        y2: ponta.y + direcao.y * comprimento,
        cor: 'serie-1',
        seta: true,
        rotulo: 'F',
      },
      // A componente perpendicular, que é a que gira.
      {
        x1: ponta.x,
        y1: ponta.y,
        x2: ponta.x,
        y2: ponta.y + direcao.y * comprimento,
        cor: 'acerto',
        seta: true,
        rotulo: 'F⊥',
      },
    ];
  });

  protected readonly dominioTorque = computed(() => ({
    xMin: -1,
    xMax: this.braco() + 3,
    yMin: -2.5,
    yMax: 2.5,
  }));

  /** A barra com os dois corpos e o centro de massa marcado. */
  protected readonly pontosCentro = computed<readonly PontoPlot[]>(() => [
    { x: 0, y: 0, rotulo: `${this.massa1()} kg`, cor: 'serie-1' },
    { x: 10, y: 0, rotulo: `${this.massa2()} kg`, cor: 'serie-2' },
    {
      x: this.centroMassa().resultado,
      y: 0,
      rotulo: `centro de massa`,
      cor: 'acento',
    },
  ]);

  protected readonly segmentosBarra = computed<readonly SegmentoPlot[]>(() => [
    { x1: 0, y1: 0, x2: 10, y2: 0, cor: 'texto-suave' },
  ]);

  protected readonly dominioBarra = computed(() => ({
    xMin: -1.5,
    xMax: 11.5,
    yMin: -1,
    yMax: 1,
  }));

  constructor() {
    inject(TeoriaService).registrar(TEORIA_TORQUE);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }

  protected percentual(valor: number): string {
    return `${(valor * 100).toFixed(1).replace('.', ',')}%`;
  }
}
