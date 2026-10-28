import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  G,
  MASSA_TERRA,
  RAIO_TERRA,
  gravidadeNaAltitudeComPassos,
  orbitaCircularComPassos,
  terceiraLeiKeplerComPassos,
  velocidadeEscapeComPassos,
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
import { geradorGravitacao } from './gravitacao-e-orbitas.gerador';
import { TEORIA_GRAVITACAO } from './gravitacao-e-orbitas.teoria';

/** Órbitas de referência, para situar a altitude escolhida. */
const REFERENCIAS: readonly { readonly altitudeKm: number; readonly nome: string }[] = [
  { altitudeKm: 400, nome: 'Estação Espacial Internacional' },
  { altitudeKm: 550, nome: 'constelação Starlink' },
  { altitudeKm: 20_200, nome: 'satélites de GPS' },
  { altitudeKm: 35_786, nome: 'órbita geoestacionária' },
];

@Component({
  selector: 'app-gravitacao-e-orbitas',
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
  templateUrl: './gravitacao-e-orbitas.html',
  styleUrl: './gravitacao-e-orbitas.scss',
})
export class GravitacaoEOrbitas {
  protected readonly gerador = geradorGravitacao;
  protected readonly conceitos = TEORIA_GRAVITACAO.map((teoria) => teoria.id);
  protected readonly referencias = REFERENCIAS;

  /** Altitude em km, que é a unidade com que se fala de órbitas. */
  protected readonly altitudeKm = signal(400);

  protected readonly altitude = computed(() => this.altitudeKm() * 1000);

  protected readonly gravidade = computed(() => gravidadeNaAltitudeComPassos(this.altitude()));

  protected readonly orbita = computed(() => orbitaCircularComPassos(this.altitude()));

  protected readonly escape = computed(() =>
    velocidadeEscapeComPassos(MASSA_TERRA, RAIO_TERRA + this.altitude()),
  );

  /** A gravidade na superfície, para comparar. */
  protected readonly gravidadeSuperficie = (G * MASSA_TERRA) / RAIO_TERRA ** 2;

  protected readonly fracaoDaGravidade = computed(
    () => this.gravidade().resultado / this.gravidadeSuperficie,
  );

  /** O período previsto por Kepler a partir da órbita da ISS. */
  protected readonly kepler = computed(() => {
    const referencia = orbitaCircularComPassos(400_000);

    return terceiraLeiKeplerComPassos(
      referencia.resultado.raio,
      referencia.resultado.periodo,
      this.orbita().resultado.raio,
    );
  });

  protected readonly orbitaTex = computed(
    () =>
      `v = \\sqrt{\\frac{GM}{r}} = ${this.formatar(this.orbita().resultado.velocidade / 1000)}` +
      `\\,\\text{km/s}`,
  );

  protected readonly referenciaProxima = computed(() =>
    REFERENCIAS.reduce((melhor, candidata) =>
      Math.abs(candidata.altitudeKm - this.altitudeKm()) <
      Math.abs(melhor.altitudeKm - this.altitudeKm())
        ? candidata
        : melhor,
    ),
  );

  /** A gravidade caindo com a distância ao centro, em raios terrestres. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => [
    {
      fn: (raios) =>
        raios < 1 ? Number.NaN : (G * MASSA_TERRA) / (raios * RAIO_TERRA) ** 2,
      cor: 'serie-1',
      rotulo: 'g(r)',
    },
  ]);

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    {
      x: (RAIO_TERRA + this.altitude()) / RAIO_TERRA,
      y: this.gravidade().resultado,
      rotulo: `${this.formatar(this.gravidade().resultado)} m/s²`,
      cor: 'acento',
    },
  ]);

  protected readonly dominio = computed(() => ({ xMin: 0, xMax: 8, yMin: 0, yMax: 11 }));

  constructor() {
    inject(TeoriaService).registrar(TEORIA_GRAVITACAO);
  }

  protected irPara(altitudeKm: number): void {
    this.altitudeKm.set(altitudeKm);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }

  protected formatarPeriodo(segundos: number): string {
    const horas = segundos / 3600;
    return horas >= 2
      ? `${this.formatar(horas)} h`
      : `${this.formatar(segundos / 60)} min`;
  }

  protected percentual(valor: number): string {
    return `${(valor * 100).toFixed(1).replace('.', ',')}%`;
  }
}
