import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ehContinua, limitesLaterais } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/math-plot.model';
import { geradorContinuidade } from './continuidade.gerador';
import { TEORIA_CONTINUIDADE } from './continuidade.teoria';

interface Caso {
  readonly id: string;
  readonly rotulo: string;
  readonly tex: string;
  readonly fn: (x: number) => number;
  readonly ponto: number;
  readonly tipo: string;
  readonly explicacao: string;
}

const CASOS: readonly Caso[] = [
  {
    id: 'continua',
    rotulo: 'Contínua',
    tex: 'x^{2} + 1',
    fn: (x) => x * x + 1,
    ponto: 2,
    tipo: 'Nenhuma descontinuidade',
    explicacao: 'As três condições valem: existe f(2), existe o limite, e os dois coincidem.',
  },
  {
    id: 'removivel',
    rotulo: 'Buraco (removível)',
    tex: '\\frac{x^{2}-4}{x-2}',
    fn: (x) => (x * x - 4) / (x - 2),
    ponto: 2,
    tipo: 'Descontinuidade removível',
    explicacao:
      'O limite existe e vale 4, mas a função não está definida no ponto. Bastaria definir ' +
      'f(2) = 4 para consertar — por isso "removível".',
  },
  {
    id: 'salto',
    rotulo: 'Salto',
    tex: '\\frac{|x-2|}{x-2}',
    fn: (x) => Math.abs(x - 2) / (x - 2),
    ponto: 2,
    tipo: 'Descontinuidade de salto',
    explicacao:
      'Os laterais discordam: −1 de um lado, +1 do outro. Nenhum valor atribuído ao ponto ' +
      'resolve, porque sempre discordaria de um dos lados.',
  },
  {
    id: 'infinita',
    rotulo: 'Explosão',
    tex: '\\frac{1}{(x-2)^{2}}',
    fn: (x) => 1 / ((x - 2) * (x - 2)),
    ponto: 2,
    tipo: 'Descontinuidade infinita',
    explicacao:
      'A função dispara para o infinito. Não há valor finito a atribuir, e a assíntota ' +
      'vertical torna a descontinuidade irremovível.',
  },
];

@Component({
  selector: 'app-continuidade',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, Formula, MathPlot, TopicoLayout],
  templateUrl: './continuidade.html',
  styleUrl: './continuidade.scss',
})
export class Continuidade {
  protected readonly gerador = geradorContinuidade;
  protected readonly conceitos = TEORIA_CONTINUIDADE.map((teoria) => teoria.id);
  protected readonly casos = CASOS;

  protected readonly indice = signal(0);

  protected readonly caso = computed(() => CASOS[this.indice()] ?? CASOS[0]!);

  protected readonly lateral = computed(() =>
    limitesLaterais(this.caso().fn, this.caso().ponto),
  );

  protected readonly valorNoPonto = computed(() => {
    const valor = this.caso().fn(this.caso().ponto);
    return Number.isFinite(valor) ? valor : null;
  });

  protected readonly continua = computed(() =>
    ehContinua(this.caso().fn, this.caso().ponto),
  );

  /** As três condições da definição, avaliadas uma a uma. */
  protected readonly condicoes = computed(() => {
    const valor = this.valorNoPonto();
    const lateral = this.lateral();

    return [
      {
        texto: `f(${this.caso().ponto}) está definido`,
        cumprida: valor !== null,
      },
      {
        texto: 'o limite existe',
        cumprida: lateral.existe,
      },
      {
        texto: 'limite e valor coincidem',
        cumprida: valor !== null && lateral.existe && Math.abs(valor - lateral.valor!) < 1e-6,
      },
    ];
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => [
    { fn: this.caso().fn, cor: 'serie-1', rotulo: 'f(x)' },
  ]);

  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const lateral = this.lateral();
    if (!lateral.existe) {
      return [];
    }

    return [
      {
        x: this.caso().ponto,
        y: lateral.valor!,
        rotulo: this.valorNoPonto() === null ? 'buraco' : 'ponto',
        cor: this.continua() ? 'acerto' : 'erro',
        vazado: this.valorNoPonto() === null,
      },
    ];
  });

  protected readonly dominio = computed(() => {
    const { ponto } = this.caso();
    return { xMin: ponto - 4, xMax: ponto + 4 };
  });

  protected readonly descricaoGrafico = computed(
    () => `Gráfico mostrando ${this.caso().tipo.toLowerCase()} em x igual a ${this.caso().ponto}.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_CONTINUIDADE);
  }

  protected selecionar(indice: number): void {
    this.indice.set(indice);
  }

  protected formatar(valor: number | null): string {
    if (valor === null || !Number.isFinite(valor)) {
      return 'não existe';
    }
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
