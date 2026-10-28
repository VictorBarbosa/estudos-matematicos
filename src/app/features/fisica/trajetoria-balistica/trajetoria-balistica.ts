import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { GRAVIDADE, alturaEmFuncaoDeX, resolverLancamentoComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import {
  CurvaPlot,
  PontoPlot,
  SegmentoPlot,
} from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { alcanceDe, geradorBalistica } from './trajetoria-balistica.gerador';
import { TEORIA_BALISTICA } from './trajetoria-balistica.teoria';

@Component({
  selector: 'app-trajetoria-balistica',
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
  templateUrl: './trajetoria-balistica.html',
  styleUrl: './trajetoria-balistica.scss',
})
export class TrajetoriaBalistica {
  protected readonly gerador = geradorBalistica;
  protected readonly conceitos = TEORIA_BALISTICA.map((teoria) => teoria.id);

  protected readonly velocidade = signal(25);
  protected readonly angulo = signal(45);
  protected readonly altura = signal(0);
  /** Ângulo de comparação, para evidenciar o ótimo. */
  protected readonly anguloComparacao = signal(30);

  protected readonly lancamento = computed(() => ({
    velocidadeInicial: this.velocidade(),
    anguloGraus: this.angulo(),
    alturaInicial: this.altura(),
    gravidade: GRAVIDADE,
  }));

  protected readonly analise = computed(() => resolverLancamentoComPassos(this.lancamento()));
  protected readonly dados = computed(() => this.analise().resultado);

  /** O ângulo que maximiza o alcance, achado por varredura. */
  protected readonly anguloOtimo = computed(() => {
    let melhor = 1;
    let maior = 0;

    for (let graus = 1; graus <= 89; graus++) {
      const alcance = alcanceDe(this.velocidade(), graus, this.altura());
      if (alcance > maior) {
        maior = alcance;
        melhor = graus;
      }
    }

    return { graus: melhor, alcance: maior };
  });

  protected readonly trajetoria = computed(() => alturaEmFuncaoDeX(this.lancamento()));

  protected readonly trajetoriaComparacao = computed(() =>
    alturaEmFuncaoDeX({ ...this.lancamento(), anguloGraus: this.anguloComparacao() }),
  );

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const principal = this.trajetoria();
    const comparacao = this.trajetoriaComparacao();
    const alcance = this.dados().alcance;
    const alcanceComparacao = alcanceDe(
      this.velocidade(),
      this.anguloComparacao(),
      this.altura(),
    );

    return [
      {
        // Corta a curva no ponto em que o projétil toca o chão.
        fn: (x) => (x < 0 || x > alcance ? Number.NaN : principal(x)),
        cor: 'serie-1',
        rotulo: `${this.angulo()}°`,
      },
      {
        fn: (x) => (x < 0 || x > alcanceComparacao ? Number.NaN : comparacao(x)),
        cor: 'serie-2',
        tracejada: true,
        rotulo: `${this.anguloComparacao()}° (comparação)`,
      },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const { alcance, alturaMaxima } = this.dados();
    const xApice = alcance / 2;

    return [
      { x: 0, y: this.altura(), rotulo: 'lançamento', cor: 'texto-suave' },
      {
        x: this.altura() === 0 ? xApice : this.dados().vx * this.dados().tempoNoApice,
        y: alturaMaxima,
        rotulo: `h máx ${this.formatar(alturaMaxima)} m`,
        cor: 'acento',
      },
      { x: alcance, y: 0, rotulo: `${this.formatar(alcance)} m`, cor: 'acento' },
    ];
  });

  /** O solo, para dar referência visual. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => [
    { x1: 0, y1: 0, x2: this.dados().alcance * 1.15, y2: 0, cor: 'texto-suave' },
  ]);

  protected readonly dominio = computed(() => {
    const { alcance, alturaMaxima } = this.dados();
    return {
      xMin: -alcance * 0.08,
      xMax: alcance * 1.12,
      yMin: -alturaMaxima * 0.15,
      yMax: alturaMaxima * 1.25,
    };
  });

  protected readonly descricaoGrafico = computed(
    () =>
      `Trajetória parabólica atingindo ${this.formatar(this.dados().alturaMaxima)} metros de ` +
      `altura e ${this.formatar(this.dados().alcance)} metros de alcance.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_BALISTICA);
  }

  protected usarOtimo(): void {
    this.angulo.set(this.anguloOtimo().graus);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
