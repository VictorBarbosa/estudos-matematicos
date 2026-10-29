import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  somaComPassos,
  somaInfinitaComPassos,
  somasParciais,
  termoGeral,
  termosIniciais,
} from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { PontoPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorProgressoes } from './progressoes.gerador';
import { TEORIA_PROGRESSOES } from './progressoes.teoria';

@Component({
  selector: 'app-progressoes',
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
  templateUrl: './progressoes.html',
  styleUrl: './progressoes.scss',
})
export class Progressoes {
  protected readonly gerador = geradorProgressoes;
  protected readonly conceitos = TEORIA_PROGRESSOES.map((teoria) => teoria.id);

  protected readonly geometrica = signal(false);
  protected readonly primeiro = signal(3);
  protected readonly razao = signal(5);
  protected readonly quantidade = signal(8);

  protected readonly progressao = computed(() => ({
    primeiro: this.primeiro(),
    razao: this.razao(),
    geometrica: this.geometrica(),
  }));

  protected readonly termos = computed(() =>
    termosIniciais(this.progressao(), this.quantidade()),
  );

  protected readonly parciais = computed(() =>
    somasParciais(this.progressao(), this.quantidade()),
  );

  protected readonly analise = computed(() =>
    somaComPassos(this.progressao(), this.quantidade()),
  );

  protected readonly ultimo = computed(() => termoGeral(this.progressao(), this.quantidade()));

  /** A soma infinita só existe na PG com |q| < 1. */
  protected readonly somaInfinita = computed(() =>
    this.geometrica() ? somaInfinitaComPassos(this.primeiro(), this.razao()) : null,
  );

  protected readonly convergente = computed(
    () => this.geometrica() && Math.abs(this.razao()) < 1 && this.razao() !== 0,
  );

  protected readonly termoGeralTex = computed(() =>
    this.geometrica()
      ? `a_n = ${this.primeiro()} \\cdot ${this.formatar(this.razao())}^{\\,n-1}`
      : `a_n = ${this.primeiro()} + (n-1) \\cdot ${this.formatar(this.razao())}`,
  );

  protected readonly somaTex = computed(
    () => `S_{${this.quantidade()}} = ${this.formatar(this.analise().resultado)}`,
  );

  /** Os termos como pontos: alinhados na PA, em curva na PG. */
  protected readonly pontos = computed<readonly PontoPlot[]>(() =>
    this.termos().map((valor, indice) => ({
      x: indice + 1,
      y: valor,
      cor: 'serie-1',
    })),
  );

  /** As somas parciais, para ver o acumulado estabilizar ou disparar. */
  protected readonly pontosParciais = computed<readonly PontoPlot[]>(() =>
    this.parciais().map((valor, indice) => ({
      x: indice + 1,
      y: valor,
      cor: 'serie-3',
    })),
  );

  protected readonly todosOsPontos = computed<readonly PontoPlot[]>(() => [
    ...this.pontos(),
    ...this.pontosParciais(),
  ]);

  protected readonly dominio = computed(() => ({
    xMin: 0,
    xMax: this.quantidade() + 1,
  }));

  protected readonly descricaoGrafico = computed(
    () =>
      `Os ${this.quantidade()} primeiros termos da progressão ` +
      `${this.geometrica() ? 'geométrica' : 'aritmética'} e suas somas parciais.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_PROGRESSOES);
  }

  /** Trocar de tipo ajusta a razão para uma que faça sentido no novo. */
  protected definirTipo(geometrica: boolean): void {
    if (geometrica === this.geometrica()) {
      return;
    }

    this.geometrica.set(geometrica);
    this.razao.set(geometrica ? 2 : 5);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
