import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Vetor, direcaoGraus, modulo, somar, vetorParaTex } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { SegmentoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/fisica/cinematica-vetorial/cinematica-vetorial.i18n.json';
import { geradorCinematicaVetorial } from '@features/fisica/cinematica-vetorial/cinematica-vetorial.gerador';
import { TEORIA_CINEMATICA_VETORIAL } from '@features/fisica/cinematica-vetorial/cinematica-vetorial.teoria';

@Component({
  selector: 'app-cinematica-vetorial',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './cinematica-vetorial.html',
  styleUrl: './cinematica-vetorial.scss',
})
export class CinematicaVetorial {
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorCinematicaVetorial;
  protected readonly conceitos = TEORIA_CINEMATICA_VETORIAL.map((teoria) => teoria.id);

  protected readonly aeronaveX = signal(200);
  protected readonly aeronaveY = signal(0);
  protected readonly ventoX = signal(0);
  protected readonly ventoY = signal(50);

  protected readonly aeronave = computed<Vetor>(() => ({
    x: this.aeronaveX(),
    y: this.aeronaveY(),
  }));

  protected readonly vento = computed<Vetor>(() => ({ x: this.ventoX(), y: this.ventoY() }));

  protected readonly solo = computed(() => somar(this.aeronave(), this.vento()));

  protected readonly rapidezNoAr = computed(() => modulo(this.aeronave()));
  protected readonly rapidezNoSolo = computed(() => modulo(this.solo()));
  protected readonly somaDosModulos = computed(() => this.rapidezNoAr() + modulo(this.vento()));

  protected readonly rumoDoNariz = computed(() => direcaoGraus(this.aeronave()));
  protected readonly rumoEfetivo = computed(() => direcaoGraus(this.solo()));
  protected readonly deriva = computed(() => this.rumoEfetivo() - this.rumoDoNariz());

  protected readonly somaTex = computed(
    () =>
      `${vetorParaTex(this.aeronave())} + ${vetorParaTex(this.vento())} = ${vetorParaTex(this.solo())}`,
  );

  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const ar = this.aeronave();
    const solo = this.solo();

    return [
      {
        x1: 0,
        y1: 0,
        x2: ar.x,
        y2: ar.y,
        cor: 'serie-1',
        seta: true,
        rotulo: this.texto('segmentoAr'),
      },
      {
        x1: ar.x,
        y1: ar.y,
        x2: solo.x,
        y2: solo.y,
        cor: 'serie-3',
        seta: true,
        rotulo: this.texto('segmentoVento'),
      },
      {
        x1: 0,
        y1: 0,
        x2: solo.x,
        y2: solo.y,
        cor: 'acento',
        seta: true,
        rotulo: this.texto('segmentoSolo'),
      },
    ];
  });

  protected readonly dominio = computed(() => ({ xMin: -60, xMax: 280, yMin: -120, yMax: 120 }));

  protected readonly descricaoGrafico = computed(() => this.texto('descricaoGrafico'));

  constructor() {
    inject(TeoriaService).registrar(TEORIA_CINEMATICA_VETORIAL);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
