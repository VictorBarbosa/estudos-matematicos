import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Polinomio, pontosCriticos } from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/math-plot.model';
import { geradorAplicacoesDerivada } from './aplicacoes-da-derivada.gerador';
import { TEORIA_APLICACOES_DERIVADA } from './aplicacoes-da-derivada.teoria';

const ROTULO_TIPO: Readonly<Record<string, string>> = {
  maximo: 'máximo local',
  minimo: 'mínimo local',
  inflexao: 'inflexão',
};

@Component({
  selector: 'app-aplicacoes-da-derivada',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    ConceitosTopico,
    ControleParametro,
    Formula,
    MathPlot,
    TopicoLayout,
  ],
  templateUrl: './aplicacoes-da-derivada.html',
  styleUrl: './aplicacoes-da-derivada.scss',
})
export class AplicacoesDaDerivada {
  protected readonly gerador = geradorAplicacoesDerivada;
  protected readonly conceitos = TEORIA_APLICACOES_DERIVADA.map((teoria) => teoria.id);

  protected readonly a = signal(1);
  protected readonly b = signal(0);
  protected readonly c = signal(-3);
  protected readonly d = signal(0);

  /** Perímetro do problema da cerca. */
  protected readonly perimetro = signal(100);

  protected readonly funcao = computed(() =>
    Polinomio.de(this.d(), this.c(), this.b(), this.a()),
  );

  protected readonly derivada = computed(() => this.funcao().derivar());
  protected readonly segunda = computed(() => this.derivada().derivar());

  /**
   * Rótulos em TeX montados aqui, e não no template: a notação de linha usa
   * apóstrofo, que brigaria com as aspas da expressão no HTML.
   */
  protected readonly funcaoTex = computed(() => `f(x) = ${this.funcao().paraTex()}`);
  protected readonly derivadaTex = computed(() => `f'(x) = ${this.derivada().paraTex()}`);

  protected readonly criticos = computed(() => {
    const f = this.funcao();
    return pontosCriticos((x) => f.avaliar(x), -5, 5);
  });

  protected readonly rotuloTipo = ROTULO_TIPO;

  /** O problema clássico da cerca, resolvido em tempo real. */
  protected readonly cerca = computed(() => {
    const p = this.perimetro();
    const lado = p / 4;

    return {
      lado,
      area: lado * lado,
      // Uma alternativa qualquer, para comparação.
      alternativa: { largura: lado / 2, area: (lado / 2) * (p / 2 - lado / 2) },
    };
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const f = this.funcao();
    const df = this.derivada();
    const d2f = this.segunda();

    return [
      { fn: (x) => f.avaliar(x), cor: 'serie-1', rotulo: 'f(x)' },
      { fn: (x) => df.avaliar(x), cor: 'serie-2', tracejada: true, rotulo: "f'(x)" },
      { fn: (x) => d2f.avaliar(x), cor: 'serie-3', tracejada: true, rotulo: "f''(x)" },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() =>
    this.criticos().map((critico) => ({
      x: critico.x,
      y: critico.y,
      rotulo: ROTULO_TIPO[critico.tipo],
      cor: critico.tipo === 'maximo' ? 'erro' : critico.tipo === 'minimo' ? 'acerto' : 'aviso',
    })),
  );

  protected readonly dominio = computed(() => ({ xMin: -4, xMax: 4 }));

  protected readonly descricaoGrafico = computed(
    () =>
      `Função com ${this.criticos().length} ponto(s) crítico(s), junto da primeira e da ` +
      'segunda derivada.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_APLICACOES_DERIVADA);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  }
}
