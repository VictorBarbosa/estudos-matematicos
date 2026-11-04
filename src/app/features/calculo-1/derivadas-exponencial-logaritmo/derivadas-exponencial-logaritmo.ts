import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  TABELA_DAS_DERIVADAS_EXP_LOG,
  derivadaNumerica,
  exponencialParaTex,
  logaritmoParaTex,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot } from '@shared/components/math-plot/models/math-plot.model';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/calculo-1/derivadas-exponencial-logaritmo/derivadas-exponencial-logaritmo.i18n.json';
import { geradorDerivadasExpLog } from '@features/calculo-1/derivadas-exponencial-logaritmo/derivadas-exponencial-logaritmo.gerador';
import { TEORIA_DERIVADAS_EXP_LOG } from '@features/calculo-1/derivadas-exponencial-logaritmo/derivadas-exponencial-logaritmo.teoria';

/** A observação de cada linha da tabela vira uma chave do dicionário deste tópico. */
const OBSERVACOES_DA_TABELA = ['obsEx', 'obsExK', 'obsBx', 'obsLn', 'obsLnK', 'obsLogBase'] as const;

@Component({
  selector: 'app-derivadas-exponencial-logaritmo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './derivadas-exponencial-logaritmo.html',
  styleUrl: './derivadas-exponencial-logaritmo.scss',
})
export class DerivadasExponencialLogaritmo {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorDerivadasExpLog;
  protected readonly conceitos = TEORIA_DERIVADAS_EXP_LOG.map((teoria) => teoria.id);
  protected readonly tabela = TABELA_DAS_DERIVADAS_EXP_LOG.map((linha, indice) => ({
    ...linha,
    observacao: OBSERVACOES_DA_TABELA[indice] ?? '',
  }));

  protected readonly a = signal(1);
  protected readonly k = signal(1);
  protected readonly ponto = signal(1);
  /** O múltiplo dentro do logaritmo — aquele que desaparece ao derivar. */
  protected readonly multiplo = signal(5);

  protected readonly expTex = computed(() => `f(x) = ${exponencialParaTex(this.a(), this.k())}`);

  protected readonly expDerivadaTex = computed(() => {
    const fator = this.a() * this.k();
    const expoente = this.k() === 1 ? 'x' : `${this.k()}x`;
    return `f'(x) = ${fator === 1 ? '' : fator}e^{${expoente}}`;
  });

  protected readonly logTex = computed(() => `g(x) = ${logaritmoParaTex(1, this.multiplo())}`);

  protected readonly valorDaExponencial = computed(
    () => this.a() * Math.exp(this.k() * this.ponto()),
  );

  protected readonly derivadaDaExponencial = computed(
    () => this.a() * this.k() * Math.exp(this.k() * this.ponto()),
  );

  protected readonly razao = computed(
    () => this.derivadaDaExponencial() / this.valorDaExponencial(),
  );

  /** A derivada do logaritmo: a mesma, com ou sem o múltiplo dentro. */
  protected readonly derivadaDoLogaritmo = computed(() => 1 / Math.max(this.ponto(), 0.01));

  protected readonly conferenciaDoLogaritmo = computed(() =>
    derivadaNumerica((x) => Math.log(this.multiplo() * x), Math.max(this.ponto(), 0.01)),
  );

  protected readonly curvasExponencial = computed<readonly CurvaPlot[]>(() => {
    const [a, k] = [this.a(), this.k()];

    return [
      { fn: (x) => a * Math.exp(k * x), cor: 'serie-1', rotulo: 'f(x)' },
      { fn: (x) => a * k * Math.exp(k * x), cor: 'acento', tracejada: true, rotulo: "f'(x)" },
    ];
  });

  protected readonly curvasLogaritmo = computed<readonly CurvaPlot[]>(() => {
    const multiplo = this.multiplo();

    return [
      { fn: (x) => (x > 0 ? Math.log(x) : Number.NaN), cor: 'serie-2', rotulo: 'ln x' },
      {
        fn: (x) => (x > 0 ? Math.log(multiplo * x) : Number.NaN),
        cor: 'serie-3',
        rotulo: 'ln(kx)',
      },
      { fn: (x) => (x > 0 ? 1 / x : Number.NaN), cor: 'acento', tracejada: true, rotulo: '1/x' },
    ];
  });

  protected readonly dominioExponencial = computed(() => ({ xMin: -2, xMax: 2 }));
  protected readonly dominioLogaritmo = computed(() => ({ xMin: 0.1, xMax: 8, yMin: -2, yMax: 4 }));

  protected readonly descricaoExponencial = computed(() =>
    this.texto('descricaoExponencial', { k: this.k() }),
  );

  protected readonly descricaoLogaritmo = computed(() => this.texto('descricaoLogaritmo'));

  constructor() {
    inject(TeoriaService).registrar(TEORIA_DERIVADAS_EXP_LOG);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
