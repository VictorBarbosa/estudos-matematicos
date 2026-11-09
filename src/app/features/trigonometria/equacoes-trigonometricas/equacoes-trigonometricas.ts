import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  INVERSA_TEXTO,
  IMAGEM_DA_INVERSA,
  RAZAO_TEX,
  RazaoTrig,
  VALORES_NOTAVEIS,
  ValorNotavel,
  grausTex,
  inversaEmGraus,
  paraRadianos,
  resolverEquacaoTrigComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
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
} from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/trigonometria/equacoes-trigonometricas/equacoes-trigonometricas.i18n.json';
import { geradorEquacoesTrig } from '@features/trigonometria/equacoes-trigonometricas/equacoes-trigonometricas.gerador';
import { TEORIA_EQUACOES_TRIG } from '@features/trigonometria/equacoes-trigonometricas/equacoes-trigonometricas.teoria';

const FUNCAO_NUMERICA: Readonly<Record<RazaoTrig, (radianos: number) => number>> = {
  sen: Math.sin,
  cos: Math.cos,
  tg: Math.tan,
};

@Component({
  selector: 'app-equacoes-trigonometricas',
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
  templateUrl: './equacoes-trigonometricas.html',
  styleUrl: './equacoes-trigonometricas.scss',
})
export class EquacoesTrigonometricas {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorEquacoesTrig;
  protected readonly conceitos = TEORIA_EQUACOES_TRIG.map((teoria) => teoria.id);
  protected readonly razoes: readonly RazaoTrig[] = ['sen', 'cos', 'tg'];

  protected readonly razao = signal<RazaoTrig>('sen');
  /** O valor de k em centésimos, para o controle deslizante. */
  protected readonly centesimos = signal(50);
  /** Um valor notável escolhido nos botões: √3/2 exato, e não 0,87. */
  protected readonly notavelEscolhido = signal<ValorNotavel | null>(null);

  protected readonly limite = computed(() => (this.razao() === 'tg' ? 400 : 150));
  protected readonly notaveis = computed(() => VALORES_NOTAVEIS[this.razao()]);

  protected readonly k = computed(() => this.notavelEscolhido()?.valor ?? this.centesimos() / 100);
  protected readonly kTex = computed(
    () => this.notavelEscolhido()?.tex ?? grausTex(this.centesimos() / 100),
  );

  protected readonly resolucao = computed(() =>
    resolverEquacaoTrigComPassos(this.razao(), this.k(), this.kTex()),
  );
  protected readonly solucoes = computed(() => this.resolucao().resultado);
  protected readonly principal = computed(() => inversaEmGraus(this.razao(), this.k()));

  protected readonly equacaoTex = computed(() => `${RAZAO_TEX[this.razao()]} x = ${this.kTex()}`);
  protected readonly nomeInversa = computed(() => INVERSA_TEXTO[this.razao()]);
  protected readonly imagemInversa = computed(() => IMAGEM_DA_INVERSA[this.razao()]);

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const funcao = FUNCAO_NUMERICA[this.razao()];
    return [
      {
        fn: (graus) => funcao(paraRadianos(graus)),
        cor: 'serie-1',
        rotulo: `${this.razao()} x`,
      },
    ];
  });

  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => [
    { x1: 0, y1: this.k(), x2: 360, y2: this.k(), cor: 'acento', tracejado: true, rotulo: 'y = k' },
  ]);

  protected readonly pontos = computed<readonly PontoPlot[]>(() =>
    this.solucoes().map((graus) => ({
      x: graus,
      y: this.k(),
      cor: 'serie-2',
      rotulo: `${this.formatar(graus)}°`,
    })),
  );

  protected readonly dominio = computed(() => {
    const altura = this.razao() === 'tg' ? 4.5 : 1.6;
    return { xMin: 0, xMax: 360, yMin: -altura, yMax: altura };
  });

  protected readonly descricaoGrafico = computed(() =>
    this.texto('descricaoGrafico', {
      funcao: this.razao(),
      k: this.formatar(this.k()),
      quantas: this.solucoes().length,
    }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_EQUACOES_TRIG);
  }

  protected escolherRazao(razao: RazaoTrig): void {
    this.razao.set(razao);
    this.notavelEscolhido.set(null);
    this.centesimos.set(50);
  }

  protected escolherNotavel(notavel: ValorNotavel): void {
    this.notavelEscolhido.set(notavel);
    this.centesimos.set(Math.round(notavel.valor * 100));
  }

  /** Mexer no controle deslizante abandona o valor notável exato. */
  protected moverK(centesimos: number): void {
    this.notavelEscolhido.set(null);
    this.centesimos.set(centesimos);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
