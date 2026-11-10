import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/funcoes/equacoes-exponenciais/equacoes-exponenciais.i18n.json';
import { geradorEquacoesExponenciais } from '@features/funcoes/equacoes-exponenciais/equacoes-exponenciais.gerador';
import { TEORIA_EQUACOES_EXPONENCIAIS } from '@features/funcoes/equacoes-exponenciais/equacoes-exponenciais.teoria';

@Component({
  selector: 'app-equacoes-exponenciais',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './equacoes-exponenciais.html',
  styleUrl: './equacoes-exponenciais.scss',
})
export class EquacoesExponenciais {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorEquacoesExponenciais;
  protected readonly conceitos = TEORIA_EQUACOES_EXPONENCIAIS.map((teoria) => teoria.id);

  protected readonly base = signal(2);
  protected readonly c = signal(7);

  /** Base 1 não é exponencial de verdade; trocamos por 2. */
  protected readonly baseEfetiva = computed(() => (this.base() === 1 ? 2 : this.base()));

  protected readonly solucao = computed(() =>
    this.c() > 0 ? Math.log(this.c()) / Math.log(this.baseEfetiva()) : null,
  );

  protected readonly exata = computed(() => {
    const x = this.solucao();
    return x !== null && Math.abs(x - Math.round(x)) < 1e-9;
  });

  protected readonly equacaoTex = computed(() => `${this.baseEfetiva()}^{x} = ${this.c()}`);

  protected readonly solucaoTex = computed(() => {
    const x = this.solucao();
    const b = this.baseEfetiva();
    const c = this.c();
    if (x === null) return `${b}^{x} > 0 \\;\\Rightarrow\\; \\text{sem solução}`;
    if (this.exata())
      return `${c} = ${b}^{${Math.round(x)}} \\;\\Rightarrow\\; x = ${Math.round(x)}`;
    return `x = \\frac{\\ln ${c}}{\\ln ${b}} \\approx ${this.formatar(x).replace(',', '{,}')}`;
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const b = this.baseEfetiva();
    const c = this.c();
    return [
      { fn: (x) => b ** x, cor: 'serie-1', rotulo: this.texto('curvaPotencia') },
      { fn: () => c, cor: 'serie-2', tracejada: true, rotulo: this.texto('curvaReta') },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const x = this.solucao();
    return x === null ? [] : [{ x, y: this.c(), rotulo: `x ≈ ${this.formatar(x)}`, cor: 'acento' }];
  });

  protected readonly dominio = computed(() => {
    const x = this.solucao() ?? 0;
    // Altura fixa pelo c: a exponencial dispara e achataria a reta.
    const topo = Math.max(this.c(), 4) * 1.4;
    return {
      xMin: Math.min(-3, x - 2),
      xMax: Math.max(4, x + 2),
      yMin: Math.min(-2, this.c() - 2),
      yMax: topo,
    };
  });

  protected readonly descricaoGrafico = computed(() =>
    this.texto('descricaoGrafico', {
      base: String(this.baseEfetiva()),
      c: String(this.c()),
      x: this.solucao() === null ? '—' : this.formatar(this.solucao()!),
    }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_EQUACOES_EXPONENCIAIS);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
