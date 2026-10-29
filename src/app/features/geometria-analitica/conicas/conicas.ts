import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { conicaComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorConicas } from '@features/geometria-analitica/conicas/conicas.gerador';
import { TEORIA_CONICAS } from '@features/geometria-analitica/conicas/conicas.teoria';

type Tipo = 'elipse' | 'hiperbole' | 'parabola';

@Component({
  selector: 'app-conicas',
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
  templateUrl: './conicas.html',
  styleUrl: './conicas.scss',
})
export class Conicas {
  protected readonly gerador = geradorConicas;
  protected readonly conceitos = TEORIA_CONICAS.map((teoria) => teoria.id);

  protected readonly tipo = signal<Tipo>('elipse');
  protected readonly a = signal(5);
  protected readonly b = signal(3);

  protected readonly tipos: readonly { valor: Tipo; rotulo: string }[] = [
    { valor: 'elipse', rotulo: 'Elipse' },
    { valor: 'parabola', rotulo: 'Parábola' },
    { valor: 'hiperbole', rotulo: 'Hipérbole' },
  ];

  protected readonly analise = computed(() =>
    this.tipo() === 'parabola'
      ? null
      : conicaComPassos(this.a(), this.b(), this.tipo() === 'hiperbole'),
  );

  protected readonly equacaoTex = computed(() => {
    const a = this.a();
    const b = this.b();

    switch (this.tipo()) {
      case 'elipse':
        return `\\frac{x^{2}}{${a * a}} + \\frac{y^{2}}{${b * b}} = 1`;
      case 'hiperbole':
        return `\\frac{x^{2}}{${a * a}} - \\frac{y^{2}}{${b * b}} = 1`;
      case 'parabola':
        return `y = \\frac{x^{2}}{${a}}`;
    }
  });

  protected readonly excentricidade = computed(() => {
    const analise = this.analise();
    return analise === null ? 1 : analise.resultado.excentricidade;
  });

  protected readonly descricaoExcentricidade = computed(() => {
    const e = this.excentricidade();

    if (this.tipo() === 'parabola') {
      return 'A parábola é o caso de fronteira: e = 1, exatamente entre elipse e hipérbole.';
    }
    if (e < 0.001) {
      return 'Com e = 0 os focos coincidem: a elipse é uma circunferência.';
    }
    if (e < 1) {
      return `e = ${this.formatar(e)}: quanto mais perto de 1, mais achatada a elipse.`;
    }
    return `e = ${this.formatar(e)}: acima de 1, a curva se abre em dois ramos.`;
  });

  /** Cada cônica precisa de dois ramos, porque não são funções de x. */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const a = this.a();
    const b = this.b();

    if (this.tipo() === 'parabola') {
      return [{ fn: (x) => (x * x) / a, cor: 'serie-1', rotulo: 'parábola' }];
    }

    if (this.tipo() === 'elipse') {
      const metade = (sinal: number) => (x: number) => {
        const dentro = 1 - (x * x) / (a * a);
        return dentro < 0 ? Number.NaN : sinal * b * Math.sqrt(dentro);
      };
      return [
        { fn: metade(1), cor: 'serie-1' },
        { fn: metade(-1), cor: 'serie-1' },
      ];
    }

    const ramo = (sinal: number) => (x: number) => {
      const dentro = (x * x) / (a * a) - 1;
      return dentro < 0 ? Number.NaN : sinal * b * Math.sqrt(dentro);
    };

    return [
      { fn: ramo(1), cor: 'serie-1' },
      { fn: ramo(-1), cor: 'serie-1' },
      { fn: (x) => (b / a) * x, cor: 'texto-suave', tracejada: true, rotulo: 'assíntotas' },
      { fn: (x) => -(b / a) * x, cor: 'texto-suave', tracejada: true },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const analise = this.analise();
    if (analise === null) {
      return [{ x: 0, y: 0, rotulo: 'vértice', cor: 'acento' }];
    }

    return analise.resultado.focos.map((foco, indice) => ({
      x: foco.x,
      y: foco.y,
      rotulo: `F${indice + 1}`,
      cor: 'acento' as const,
    }));
  });

  protected readonly dominio = computed(() => {
    const limite = Math.max(this.a(), this.b()) * 2 + 2;
    return { xMin: -limite, xMax: limite, yMin: -limite * 0.7, yMax: limite * 0.7 };
  });

  protected readonly descricaoGrafico = computed(
    () => `Gráfico de uma ${this.tipo()} com os focos destacados.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_CONICAS);
  }

  protected definirTipo(tipo: Tipo): void {
    this.tipo.set(tipo);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
