import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { combinacoes } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/estatistica/binomio-de-newton/binomio-de-newton.i18n.json';
import { geradorBinomio } from '@features/estatistica/binomio-de-newton/binomio-de-newton.gerador';
import { TEORIA_BINOMIO } from '@features/estatistica/binomio-de-newton/binomio-de-newton.teoria';

@Component({
  selector: 'app-binomio-de-newton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, TopicoLayout],
  templateUrl: './binomio-de-newton.html',
  styleUrl: './binomio-de-newton.scss',
})
export class BinomioDeNewton {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorBinomio;
  protected readonly conceitos = TEORIA_BINOMIO.map((teoria) => teoria.id);

  protected readonly n = signal(5);
  protected readonly b = signal(1);

  /** As linhas 0..n do triângulo, centralizadas numa matriz LaTeX. */
  protected readonly trianguloTex = computed(() => {
    const n = this.n();
    const largura = 2 * n + 1;
    const linhas = Array.from({ length: n + 1 }, (_, i) => {
      const celulas = Array<string>(largura).fill('');
      for (let k = 0; k <= i; k++) celulas[n - i + 2 * k] = String(combinacoes(i, k));
      return celulas.join(' & ');
    });
    return `\\begin{array}{${'c'.repeat(largura)}} ${linhas.join(' \\\\ ')} \\end{array}`;
  });

  /** (x + b)^n expandido, termo a termo. */
  protected readonly desenvolvimentoTex = computed(() => {
    const n = this.n();
    const b = this.b();
    const termos: string[] = [];
    for (let k = 0; k <= n; k++) {
      const coef = combinacoes(n, k) * b ** k;
      if (coef === 0) continue;
      const p = n - k;
      const x = p === 0 ? '' : p === 1 ? 'x' : `x^{${p}}`;
      const valor = Math.abs(coef) === 1 && x ? '' : String(Math.abs(coef));
      const sinal = coef < 0 ? '-' : termos.length === 0 ? '' : '+';
      termos.push(`${sinal} ${valor}${x}`.trim());
    }
    const bTex = b === 0 ? '' : ` ${b > 0 ? '+' : '-'} ${Math.abs(b)}`;
    return `(x${bTex})^{${n}} = ${termos.join(' ') || '0'}`;
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_BINOMIO);
  }
}
