import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  GRAVIDADE_PADRAO,
  conservacaoEnergiaComPassos,
  energiaCinetica,
  energiaPotencialGravitacional,
  potenciaMediaComPassos,
  trabalhoComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorEnergia } from '@features/fisica/trabalho-e-energia/trabalho-e-energia.gerador';
import { TEORIA_ENERGIA } from '@features/fisica/trabalho-e-energia/trabalho-e-energia.teoria';

@Component({
  selector: 'app-trabalho-e-energia',
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
  templateUrl: './trabalho-e-energia.html',
  styleUrl: './trabalho-e-energia.scss',
})
export class TrabalhoEEnergia {
  protected readonly gerador = geradorEnergia;
  protected readonly conceitos = TEORIA_ENERGIA.map((teoria) => teoria.id);

  protected readonly massa = signal(2);
  protected readonly alturaInicial = signal(20);
  protected readonly alturaAtual = signal(20);

  protected readonly forca = signal(40);
  protected readonly deslocamento = signal(5);
  protected readonly angulo = signal(60);
  protected readonly tempo = signal(4);

  protected readonly queda = computed(() =>
    conservacaoEnergiaComPassos(this.massa(), this.alturaInicial(), this.alturaAtual()),
  );

  protected readonly cinetica = computed(() =>
    energiaCinetica(this.massa(), this.queda().resultado.velocidadeFinal),
  );

  protected readonly potencial = computed(() =>
    energiaPotencialGravitacional(this.massa(), this.alturaAtual()),
  );

  protected readonly total = computed(() => this.cinetica() + this.potencial());

  protected readonly analiseTrabalho = computed(() =>
    trabalhoComPassos(this.forca(), this.deslocamento(), this.angulo()),
  );

  protected readonly analisePotencia = computed(() =>
    potenciaMediaComPassos(Math.abs(this.analiseTrabalho().resultado), this.tempo()),
  );

  protected readonly trabalhoTex = computed(
    () =>
      `W = ${this.forca()} \\cdot ${this.deslocamento()} \\cdot \\cos ${this.angulo()}^\\circ = ` +
      `${this.formatar(this.analiseTrabalho().resultado)}\\,\\text{J}`,
  );

  protected readonly energiaTex = computed(
    () =>
      `E_c + E_p = ${this.formatar(this.cinetica())} + ${this.formatar(this.potencial())} = ` +
      `${this.formatar(this.total())}\\,\\text{J}`,
  );

  /** As três energias em função da altura, numa queda sem atrito. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const m = this.massa();
    const h0 = this.alturaInicial();
    const total = m * GRAVIDADE_PADRAO * h0;

    return [
      {
        fn: (h) => (h < 0 || h > h0 ? Number.NaN : m * GRAVIDADE_PADRAO * h),
        cor: 'serie-1',
        rotulo: 'potencial',
      },
      {
        fn: (h) => (h < 0 || h > h0 ? Number.NaN : total - m * GRAVIDADE_PADRAO * h),
        cor: 'serie-2',
        rotulo: 'cinética',
      },
      {
        fn: (h) => (h < 0 || h > h0 ? Number.NaN : total),
        cor: 'acento',
        tracejada: true,
        rotulo: 'total (constante)',
      },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    { x: this.alturaAtual(), y: this.potencial(), cor: 'serie-1' },
    { x: this.alturaAtual(), y: this.cinetica(), cor: 'serie-2' },
  ]);

  protected readonly dominio = computed(() => ({
    xMin: 0,
    xMax: this.alturaInicial() * 1.05,
    yMin: 0,
  }));

  constructor() {
    inject(TeoriaService).registrar(TEORIA_ENERGIA);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
