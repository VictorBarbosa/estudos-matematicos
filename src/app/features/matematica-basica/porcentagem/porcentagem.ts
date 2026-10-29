import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  fatorDe,
  porcentagemDeComPassos,
  sucessivasComPassos,
  variacaoComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { PontoPlot, SegmentoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorPorcentagem } from '@features/matematica-basica/porcentagem/porcentagem.gerador';
import { TEORIA_PORCENTAGEM } from '@features/matematica-basica/porcentagem/porcentagem.teoria';

@Component({
  selector: 'app-porcentagem',
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
  templateUrl: './porcentagem.html',
  styleUrl: './porcentagem.scss',
})
export class Porcentagem {
  protected readonly gerador = geradorPorcentagem;
  protected readonly conceitos = TEORIA_PORCENTAGEM.map((teoria) => teoria.id);

  protected readonly valor = signal(200);
  protected readonly primeira = signal(10);
  protected readonly segunda = signal(-10);

  protected readonly parte = computed(() => porcentagemDeComPassos(this.primeira(), this.valor()));
  protected readonly umaVariacao = computed(() => variacaoComPassos(this.valor(), this.primeira()));
  protected readonly sucessivas = computed(() =>
    sucessivasComPassos(this.valor(), [this.primeira(), this.segunda()]),
  );

  protected readonly fatorAcumulado = computed(
    () => fatorDe(this.primeira()) * fatorDe(this.segunda()),
  );

  protected readonly variacaoEquivalente = computed(() => (this.fatorAcumulado() - 1) * 100);

  /** O que daria somar os percentuais — o atalho errado. */
  protected readonly somaIngenua = computed(() => this.primeira() + this.segunda());

  protected readonly diferenca = computed(
    () => this.sucessivas().resultado - this.valor() * fatorDe(this.somaIngenua()),
  );

  protected readonly intermediario = computed(() => this.valor() * fatorDe(this.primeira()));

  /** Os três momentos do valor, para mostrar o caminho em vez do salto. */
  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    { x: 0, y: this.valor(), rotulo: `inicial ${arredondar(this.valor())}`, cor: 'texto-suave' },
    {
      x: 1,
      y: this.intermediario(),
      rotulo: `após ${this.primeira()}%`,
      cor: 'serie-1',
    },
    {
      x: 2,
      y: this.sucessivas().resultado,
      rotulo: `final ${arredondar(this.sucessivas().resultado)}`,
      cor: 'acento',
    },
  ]);

  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => [
    { x1: 0, y1: this.valor(), x2: 1, y2: this.intermediario(), cor: 'serie-1' },
    { x1: 1, y1: this.intermediario(), x2: 2, y2: this.sucessivas().resultado, cor: 'serie-2' },
    // Referência: onde o valor estaria se nada tivesse mudado.
    { x1: 0, y1: this.valor(), x2: 2, y2: this.valor(), cor: 'texto-suave', tracejado: true },
  ]);

  protected readonly dominio = computed(() => {
    const valores = [this.valor(), this.intermediario(), this.sucessivas().resultado];
    const minimo = Math.min(...valores);
    const maximo = Math.max(...valores);
    const folga = Math.max(1, (maximo - minimo) * 0.4);

    return { xMin: -0.3, xMax: 2.4, yMin: minimo - folga, yMax: maximo + folga };
  });

  protected readonly descricaoGrafico = computed(
    () =>
      `Valor partindo de ${arredondar(this.valor())}, passando por ` +
      `${arredondar(this.intermediario())} e terminando em ` +
      `${arredondar(this.sucessivas().resultado)}. A linha tracejada marca o valor original.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_PORCENTAGEM);
  }

  protected formatar(valor: number): string {
    return arredondar(valor);
  }
}

function arredondar(valor: number): string {
  return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}
