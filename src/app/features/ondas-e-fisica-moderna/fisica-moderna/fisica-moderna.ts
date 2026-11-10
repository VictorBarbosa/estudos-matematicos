import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { fatorDeLorentzComPassos } from '@core/math';
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
import textos from '@features/ondas-e-fisica-moderna/fisica-moderna/fisica-moderna.i18n.json';
import { geradorFisicaModerna } from '@features/ondas-e-fisica-moderna/fisica-moderna/fisica-moderna.gerador';
import { TEORIA_FISICA_MODERNA } from '@features/ondas-e-fisica-moderna/fisica-moderna/fisica-moderna.teoria';

@Component({
  selector: 'app-fisica-moderna',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, MathPlot, PassoAPasso, TopicoLayout],
  templateUrl: './fisica-moderna.html',
  styleUrl: './fisica-moderna.scss',
})
export class FisicaModerna {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorFisicaModerna;
  protected readonly conceitos = TEORIA_FISICA_MODERNA.map((teoria) => teoria.id);

  /** A velocidade em porcentagem de c. */
  protected readonly porcento = signal(80);

  private readonly beta = computed(() => Math.min(Math.max(this.porcento(), 0), 99) / 100);
  protected readonly resolucao = computed(() => fatorDeLorentzComPassos(this.beta()));
  protected readonly gama = computed(() => this.resolucao().resultado);

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => [
    {
      fn: (x) => (x < 0 || x >= 1 ? Number.NaN : 1 / Math.sqrt(1 - x * x)),
      cor: 'serie-1',
      rotulo: this.texto('curvaGama'),
    },
  ]);

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    { x: this.beta(), y: this.gama(), rotulo: `γ = ${this.formatar(this.gama())}`, cor: 'acento' },
  ]);

  protected readonly dominio = { xMin: 0, xMax: 1, yMin: 0, yMax: 8 };

  protected readonly descricaoGrafico = computed(() =>
    this.texto('descricaoGrafico', {
      beta: this.formatar(this.beta()),
      gama: this.formatar(this.gama()),
    }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_FISICA_MODERNA);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
