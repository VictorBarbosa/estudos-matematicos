import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { AreaPlot, CurvaPlot } from '@shared/components/math-plot/models/math-plot.model';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/calculo-2/fisica-com-calculo/fisica-com-calculo.i18n.json';
import { geradorFisicaComCalculo } from '@features/calculo-2/fisica-com-calculo/fisica-com-calculo.gerador';
import { TEORIA_FISICA_COM_CALCULO } from '@features/calculo-2/fisica-com-calculo/fisica-com-calculo.teoria';

@Component({
  selector: 'app-fisica-com-calculo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './fisica-com-calculo.html',
  styleUrl: './fisica-com-calculo.scss',
})
export class FisicaComCalculo {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorFisicaComCalculo;
  protected readonly conceitos = TEORIA_FISICA_COM_CALCULO.map((teoria) => teoria.id);

  protected readonly c = signal(4);
  protected readonly p = signal(1);
  protected readonly a = signal(1);
  protected readonly b = signal(3);

  /** O intervalo sempre da esquerda para a direita. */
  private readonly limites = computed(() => {
    const [a, b] = [this.a(), this.b()];
    return a <= b ? [a, b] : [b, a];
  });

  private readonly forca = computed(() => {
    const [c, p] = [this.c(), this.p()];
    return (x: number) => c * x ** p;
  });

  protected readonly trabalho = computed(() => {
    const [a, b] = this.limites() as [number, number];
    const [c, p] = [this.c(), this.p()];
    return (c / (p + 1)) * (b ** (p + 1) - a ** (p + 1));
  });

  protected readonly ingenuo = computed(() => {
    const [a, b] = this.limites() as [number, number];
    return this.forca()(b) * (b - a);
  });

  protected readonly formulaTex = computed(() => {
    const [a, b] = this.limites() as [number, number];
    const [c, p] = [this.c(), this.p()];
    const f = p === 0 ? `${c}` : p === 1 ? `${c}x` : `${c}x^{${p}}`;
    const w = this.formatar(this.trabalho()).replace(',', '{,}');
    return `W = \\int_{${a}}^{${b}} ${f}\\,dx = \\frac{${c}}{${p + 1}}\\left(${b}^{${p + 1}} - ${a}^{${p + 1}}\\right) = ${w}\\ \\text{J}`;
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => [
    { fn: this.forca(), cor: 'serie-1', rotulo: this.texto('curvaForca') },
  ]);

  protected readonly areas = computed<readonly AreaPlot[]>(() => {
    const [a, b] = this.limites() as [number, number];
    return [{ fn: this.forca(), de: a, ate: b, cor: 'serie-1' }];
  });

  protected readonly dominio = computed(() => {
    const [, b] = this.limites() as [number, number];
    return { xMin: -0.5, xMax: Math.max(4, b + 1) };
  });

  protected readonly descricaoGrafico = computed(() => {
    const [a, b] = this.limites() as [number, number];
    return this.texto('descricaoGrafico', {
      a: String(a),
      b: String(b),
      w: this.formatar(this.trabalho()),
    });
  });

  protected readonly comparacao = computed(() =>
    this.texto('comparacao', {
      ingenuo: this.formatar(this.ingenuo()),
      w: this.formatar(this.trabalho()),
    }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_FISICA_COM_CALCULO);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
