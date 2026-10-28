import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { comoFuncao, equacaoParaTex, resolverSistemaComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorSistemas } from './sistemas-lineares.gerador';
import { TEORIA_SISTEMAS } from './sistemas-lineares.teoria';

@Component({
  selector: 'app-sistemas-lineares',
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
  templateUrl: './sistemas-lineares.html',
  styleUrl: './sistemas-lineares.scss',
})
export class SistemasLineares {
  protected readonly gerador = geradorSistemas;
  protected readonly conceitos = TEORIA_SISTEMAS.map((teoria) => teoria.id);

  protected readonly a1 = signal(1);
  protected readonly b1 = signal(1);
  protected readonly c1 = signal(5);
  protected readonly a2 = signal(1);
  protected readonly b2 = signal(-1);
  protected readonly c2 = signal(1);

  protected readonly sistema = computed(() => ({
    a1: this.a1(),
    b1: this.b1(),
    c1: this.c1(),
    a2: this.a2(),
    b2: this.b2(),
    c2: this.c2(),
  }));

  protected readonly resolucao = computed(() => resolverSistemaComPassos(this.sistema()));
  protected readonly solucao = computed(() => this.resolucao().resultado);

  protected readonly sistemaTex = computed(() => {
    const { a1, b1, c1, a2, b2, c2 } = this.sistema();
    return `\\begin{cases} ${equacaoParaTex(a1, b1, c1)} \\\\ ${equacaoParaTex(a2, b2, c2)} \\end{cases}`;
  });

  protected readonly classificacao = computed(() => {
    switch (this.solucao().tipo) {
      case 'determinado':
        return 'Sistema possível e determinado: as retas se cruzam em um único ponto.';
      case 'impossivel':
        return 'Sistema impossível: as retas são paralelas distintas e nunca se encontram.';
      case 'indeterminado':
        return 'Sistema possível e indeterminado: as duas equações descrevem a MESMA reta.';
    }
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const { a1, b1, c1, a2, b2, c2 } = this.sistema();

    const primeira = comoFuncao(a1, b1, c1);
    const segunda = comoFuncao(a2, b2, c2);

    const retas: CurvaPlot[] = [];
    if (primeira) {
      retas.push({ fn: primeira, cor: 'serie-1', rotulo: '1ª equação' });
    }
    if (segunda) {
      retas.push({ fn: segunda, cor: 'serie-2', rotulo: '2ª equação' });
    }
    return retas;
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const { tipo, x, y } = this.solucao();

    if (tipo !== 'determinado' || x === undefined || y === undefined) {
      return [];
    }

    return [
      {
        x,
        y,
        rotulo: `(${Number(x.toFixed(2))}, ${Number(y.toFixed(2))})`,
        cor: 'acento',
      },
    ];
  });

  protected readonly dominio = computed(() => {
    const { x, y } = this.solucao();
    const centroX = x ?? 0;
    const centroY = y ?? 0;
    const alcance = Math.max(8, Math.abs(centroX) + Math.abs(centroY));

    return {
      xMin: centroX - alcance,
      xMax: centroX + alcance,
      yMin: centroY - alcance * 0.7,
      yMax: centroY + alcance * 0.7,
    };
  });

  protected readonly descricaoGrafico = computed(() => {
    const { tipo } = this.solucao();
    return tipo === 'determinado'
      ? 'Duas retas cruzando-se no ponto solução do sistema.'
      : tipo === 'impossivel'
        ? 'Duas retas paralelas que nunca se cruzam.'
        : 'Duas equações que descrevem a mesma reta, sobrepostas.';
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_SISTEMAS);
  }
}
