import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { empuxoDeMotorComPassos, tsiolkovskyComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, MarcaPlot, PontoPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorPropulsao } from './propulsao-de-foguetes.gerador';
import { TEORIA_PROPULSAO } from './propulsao-de-foguetes.teoria';

/** Alvos de delta-v, em km/s, para situar o resultado. */
const MISSOES: readonly { readonly nome: string; readonly deltaV: number }[] = [
  { nome: 'órbita baixa', deltaV: 9.4 },
  { nome: 'órbita geoestacionária', deltaV: 13.5 },
  { nome: 'pousar na Lua', deltaV: 15.9 },
  { nome: 'escapar da Terra', deltaV: 12.4 },
];

@Component({
  selector: 'app-propulsao-de-foguetes',
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
  templateUrl: './propulsao-de-foguetes.html',
  styleUrl: './propulsao-de-foguetes.scss',
})
export class PropulsaoDeFoguetes {
  protected readonly gerador = geradorPropulsao;
  protected readonly conceitos = TEORIA_PROPULSAO.map((teoria) => teoria.id);
  protected readonly missoes = MISSOES;

  /** Massas em toneladas, que é como se fala de foguetes. */
  protected readonly massaSeca = signal(10);
  protected readonly massaPropelente = signal(90);

  protected readonly exaustao = signal(3000);
  protected readonly vazao = signal(250);

  protected readonly massaInicial = computed(() => this.massaSeca() + this.massaPropelente());

  protected readonly analise = computed(() =>
    tsiolkovskyComPassos(this.massaInicial() * 1000, this.massaSeca() * 1000, this.exaustao()),
  );

  protected readonly empuxo = computed(() =>
    empuxoDeMotorComPassos(this.vazao(), this.exaustao()),
  );

  protected readonly impulsoEspecifico = computed(() => this.exaustao() / 9.81);

  protected readonly deltaVKm = computed(() => this.analise().resultado.deltaV / 1000);

  /** Relação empuxo/peso: abaixo de 1, o foguete não sai do chão. */
  protected readonly empuxoPeso = computed(
    () => this.empuxo().resultado / (this.massaInicial() * 1000 * 9.81),
  );

  protected readonly tempoDeQueima = computed(
    () => (this.massaPropelente() * 1000) / this.vazao(),
  );

  /** A missão mais ambiciosa que esse delta-v alcança. */
  protected readonly missaoAlcancada = computed(() => {
    const alcancadas = MISSOES.filter((missao) => missao.deltaV <= this.deltaVKm());
    return alcancadas.length === 0
      ? null
      : alcancadas.reduce((melhor, atual) => (atual.deltaV > melhor.deltaV ? atual : melhor));
  });

  protected readonly tsiolkovskyTex = computed(
    () =>
      `\\Delta v = ${this.exaustao()} \\ln ${this.formatar(this.analise().resultado.razaoMassas)} = ` +
      `${this.formatar(this.deltaVKm())}\\,\\text{km/s}`,
  );

  /** O delta-v em função da fração de propelente: a curva logarítmica. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const ve = this.exaustao();

    return [
      {
        fn: (fracao) =>
          fracao <= 0 || fracao >= 0.999 ? Number.NaN : (ve * Math.log(1 / (1 - fracao))) / 1000,
        cor: 'serie-1',
        rotulo: 'Δv disponível',
      },
      { fn: () => 9.4, cor: 'erro', tracejada: true, rotulo: 'órbita baixa (9,4 km/s)' },
    ];
  });

  protected readonly fracaoPropelente = computed(
    () => this.massaPropelente() / this.massaInicial(),
  );

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    {
      x: this.fracaoPropelente(),
      y: this.deltaVKm(),
      rotulo: `${this.formatar(this.deltaVKm())} km/s`,
      cor: 'acento',
    },
  ]);

  protected readonly marcas = computed<readonly MarcaPlot[]>(() => [
    { x: this.fracaoPropelente(), rotulo: this.percentual(this.fracaoPropelente()), cor: 'acento' },
  ]);

  protected readonly dominio = computed(() => ({ xMin: 0, xMax: 1, yMin: 0, yMax: 20 }));

  constructor() {
    inject(TeoriaService).registrar(TEORIA_PROPULSAO);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }

  protected percentual(valor: number): string {
    return `${(valor * 100).toFixed(1).replace('.', ',')}%`;
  }
}
