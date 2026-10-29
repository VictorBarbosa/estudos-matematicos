import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  anguloEntreComPassos,
  areaParalelogramoComPassos,
  modulo,
  produtoEscalar,
  produtoVetorialZ,
  projecaoComPassos,
  vetoresParalelos,
  vetoresPerpendiculares,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { SegmentoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorProdutos } from '@features/vetores-matrizes/produto-escalar-vetorial/produto-escalar-vetorial.gerador';
import { TEORIA_PRODUTOS } from '@features/vetores-matrizes/produto-escalar-vetorial/produto-escalar-vetorial.teoria';

@Component({
  selector: 'app-produto-escalar-vetorial',
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
  templateUrl: './produto-escalar-vetorial.html',
  styleUrl: './produto-escalar-vetorial.scss',
})
export class ProdutoEscalarVetorial {
  protected readonly gerador = geradorProdutos;
  protected readonly conceitos = TEORIA_PRODUTOS.map((teoria) => teoria.id);

  protected readonly ax = signal(4);
  protected readonly ay = signal(1);
  protected readonly bx = signal(1);
  protected readonly by = signal(3);

  protected readonly a = computed(() => ({ x: this.ax(), y: this.ay() }));
  protected readonly b = computed(() => ({ x: this.bx(), y: this.by() }));

  protected readonly escalar = computed(() => produtoEscalar(this.a(), this.b()));
  protected readonly vetorial = computed(() => produtoVetorialZ(this.a(), this.b()));

  protected readonly analiseAngulo = computed(() => anguloEntreComPassos(this.a(), this.b()));
  protected readonly analiseProjecao = computed(() => projecaoComPassos(this.a(), this.b()));
  protected readonly analiseArea = computed(() => areaParalelogramoComPassos(this.a(), this.b()));

  protected readonly perpendiculares = computed(() =>
    vetoresPerpendiculares(this.a(), this.b()),
  );

  protected readonly paralelos = computed(() => vetoresParalelos(this.a(), this.b()));

  protected readonly escalarTex = computed(() => {
    const a = this.a();
    const b = this.b();
    return (
      `\\vec{a}\\cdot\\vec{b} = (${a.x})(${b.x}) + (${a.y})(${b.y}) = ` +
      `${this.formatar(this.escalar())}`
    );
  });

  protected readonly vetorialTex = computed(() => {
    const a = this.a();
    const b = this.b();
    return (
      `(\\vec{a}\\times\\vec{b})_z = (${a.x})(${b.y}) - (${a.y})(${b.x}) = ` +
      `${this.formatar(this.vetorial())}`
    );
  });

  /** Os dois vetores, o paralelogramo e a projeção de a sobre b. */
  protected readonly segmentos = computed<readonly SegmentoPlot[]>(() => {
    const a = this.a();
    const b = this.b();
    const moduloB = modulo(b);

    const base: SegmentoPlot[] = [
      { x1: 0, y1: 0, x2: a.x, y2: a.y, cor: 'serie-1', seta: true, rotulo: 'a' },
      { x1: 0, y1: 0, x2: b.x, y2: b.y, cor: 'serie-2', seta: true, rotulo: 'b' },
      { x1: a.x, y1: a.y, x2: a.x + b.x, y2: a.y + b.y, cor: 'texto-suave', tracejado: true },
      { x1: b.x, y1: b.y, x2: a.x + b.x, y2: a.y + b.y, cor: 'texto-suave', tracejado: true },
    ];

    if (moduloB > 0) {
      // A projeção desenhada sobre a direção de b, com a perpendicular.
      const fator = this.analiseProjecao().resultado / moduloB;
      const pe = { x: b.x * fator, y: b.y * fator };

      base.push(
        { x1: 0, y1: 0, x2: pe.x, y2: pe.y, cor: 'acento', rotulo: 'projeção' },
        { x1: a.x, y1: a.y, x2: pe.x, y2: pe.y, cor: 'acento', tracejado: true },
      );
    }

    return base;
  });

  protected readonly dominio = computed(() => {
    const alcance =
      Math.max(
        Math.abs(this.ax()),
        Math.abs(this.ay()),
        Math.abs(this.bx()),
        Math.abs(this.by()),
        Math.abs(this.ax() + this.bx()),
        Math.abs(this.ay() + this.by()),
      ) + 1.5;

    return { xMin: -alcance, xMax: alcance, yMin: -alcance, yMax: alcance };
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_PRODUTOS);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
