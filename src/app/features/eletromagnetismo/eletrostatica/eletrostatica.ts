import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { K_COULOMB, coulombComPassos, cientificoTexto } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/eletromagnetismo/eletrostatica/eletrostatica.i18n.json';
import { geradorEletrostatica } from '@features/eletromagnetismo/eletrostatica/eletrostatica.gerador';
import { TEORIA_ELETROSTATICA } from '@features/eletromagnetismo/eletrostatica/eletrostatica.teoria';

@Component({
  selector: 'app-eletrostatica',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, MathPlot, PassoAPasso, TopicoLayout],
  templateUrl: './eletrostatica.html',
  styleUrl: './eletrostatica.scss',
})
export class Eletrostatica {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorEletrostatica;
  protected readonly conceitos = TEORIA_ELETROSTATICA.map((teoria) => teoria.id);

  protected readonly q1 = signal(3);
  protected readonly q2 = signal(-2);
  protected readonly rCm = signal(20);

  private readonly r = computed(() => Math.max(1, this.rCm()) / 100);

  protected readonly resolucao = computed(() => coulombComPassos(this.q1(), this.q2(), this.r()));

  protected readonly forca = computed(() => this.resolucao().resultado);

  protected readonly tipo = computed(() => {
    const f = this.forca();
    return f === 0 ? 'nenhuma' : f > 0 ? 'repulsao' : 'atracao';
  });

  protected readonly forcaTexto = computed(() => cientificoTexto(Math.abs(this.forca())));

  /** |F| em função da distância (em cm), para ver o 1/r². */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const produto = Math.abs(this.q1() * this.q2()) * 1e-12;
    return [
      {
        fn: (x) => (x > 0 ? (K_COULOMB * produto) / (x / 100) ** 2 : NaN),
        cor: 'serie-1',
        rotulo: this.texto('curvaForca'),
      },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    {
      x: this.rCm(),
      y: Math.abs(this.forca()),
      rotulo: `${this.forcaTexto()} N`,
      cor: 'acento',
    },
  ]);

  protected readonly dominio = computed(() => {
    const f = Math.abs(this.forca());
    return { xMin: 0, xMax: 100, yMin: 0, yMax: Math.max(f * 4, 1e-3) };
  });

  protected readonly descricaoGrafico = computed(() =>
    this.texto('descricaoGrafico', { r: String(this.rCm()), f: this.forcaTexto() }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_ELETROSTATICA);
  }
}
