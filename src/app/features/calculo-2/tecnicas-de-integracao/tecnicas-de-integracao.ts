import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { integralNumerica } from '@core/math';
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
import textos from '@features/calculo-2/tecnicas-de-integracao/tecnicas-de-integracao.i18n.json';
import { geradorTecnicas } from '@features/calculo-2/tecnicas-de-integracao/tecnicas-de-integracao.gerador';
import { TEORIA_TECNICAS } from '@features/calculo-2/tecnicas-de-integracao/tecnicas-de-integracao.teoria';

type Tecnica = 'substituicao' | 'por-partes';

@Component({
  selector: 'app-tecnicas-de-integracao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    ConceitosTopico,
    ControleParametro,
    Formula,
    MathPlot,
    TopicoLayout,
  ],
  templateUrl: './tecnicas-de-integracao.html',
  styleUrl: './tecnicas-de-integracao.scss',
})
export class TecnicasDeIntegracao {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorTecnicas;
  protected readonly conceitos = TEORIA_TECNICAS.map((teoria) => teoria.id);

  protected readonly tecnica = signal<Tecnica>('substituicao');

  protected readonly a = signal(2);
  protected readonly b = signal(1);
  protected readonly n = signal(3);
  protected readonly ate = signal(2);

  protected readonly integrando = computed(() => {
    const [a, b, n] = [this.a(), this.b(), this.n()];

    if (this.tecnica() === 'substituicao') {
      return (x: number) => (a * x + b) ** n;
    }
    // Por partes: x · e^(x/2), mantido suave para caber no gráfico.
    return (x: number) => x * Math.exp(x / 2);
  });

  protected readonly valor = computed(() =>
    integralNumerica(this.integrando(), 0, this.ate()),
  );

  protected readonly enunciadoTex = computed(() => {
    const interno = `${this.a() === 1 ? '' : this.a()}x ${this.b() >= 0 ? '+' : '-'} ${Math.abs(this.b())}`;

    return this.tecnica() === 'substituicao'
      ? `\\int_{0}^{${this.ate()}} \\left(${interno}\\right)^{${this.n()}} dx`
      : `\\int_{0}^{${this.ate()}} x\\,e^{x/2}\\,dx`;
  });

  /** Os passos da técnica escolhida, escritos para leitura. */
  protected readonly passos = computed(() => {
    const [a, b, n] = [this.a(), this.b(), this.n()];
    const interno = `${a === 1 ? '' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`;

    if (this.tecnica() === 'substituicao') {
      return [
        {
          descricao: 'p1',
          tex: `u = ${interno} \\qquad du = ${a}\\,dx`,
        },
        {
          descricao: 'p2',
          tex: `dx = \\frac{du}{${a}} \\;\\Rightarrow\\; \\frac{1}{${a}}\\int u^{${n}}\\,du`,
        },
        {
          descricao: 'p3',
          tex: `= \\frac{u^{${n + 1}}}{${a * (n + 1)}}`,
        },
        {
          descricao: 'p4',
          tex: `= \\frac{\\left(${interno}\\right)^{${n + 1}}}{${a * (n + 1)}} + C`,
        },
      ];
    }

    return [
      {
        descricao: 'p5',
        tex: 'u = x \\qquad dv = e^{x/2}\\,dx',
      },
      {
        descricao: 'p6',
        tex: 'du = dx \\qquad v = 2e^{x/2}',
      },
      {
        descricao: 'p7',
        tex: '\\int u\\,dv = uv - \\int v\\,du = 2xe^{x/2} - \\int 2e^{x/2}\\,dx',
      },
      {
        descricao: 'p8',
        tex: '= 2xe^{x/2} - 4e^{x/2} + C',
        nota: 'p8nota',
      },
    ];
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => [
    { fn: this.integrando(), cor: 'serie-1', rotulo: this.texto('integrando') },
  ]);

  protected readonly areas = computed<readonly AreaPlot[]>(() => [
    { fn: this.integrando(), de: 0, ate: this.ate(), cor: 'acento' },
  ]);

  protected readonly dominio = computed(() => ({ xMin: -0.5, xMax: this.ate() + 1 }));

  protected readonly descricaoGrafico = computed(() =>
    this.texto('descricaoGrafico', { ate: this.ate(), valor: this.formatar(this.valor()) }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_TECNICAS);
  }

  protected definirTecnica(tecnica: Tecnica): void {
    this.tecnica.set(tecnica);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
