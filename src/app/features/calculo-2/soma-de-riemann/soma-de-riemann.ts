import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  Polinomio,
  TipoSoma,
  integralNumerica,
  retangulosDeRiemann,
  riemannComPassos,
  somaDeRiemann,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, RetanguloPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/calculo-2/soma-de-riemann/soma-de-riemann.i18n.json';
import { geradorRiemann } from '@features/calculo-2/soma-de-riemann/soma-de-riemann.gerador';
import { TEORIA_RIEMANN } from '@features/calculo-2/soma-de-riemann/soma-de-riemann.teoria';

const TIPOS: readonly TipoSoma[] = ['esquerda', 'direita', 'ponto-medio', 'trapezio'];

/** O nome de cada tipo de soma vira uma chave do dicionário deste tópico. */
const NOME_SOMA_CHAVE: Readonly<Record<TipoSoma, string>> = {
  esquerda: 'nomeEsquerda',
  direita: 'nomeDireita',
  'ponto-medio': 'nomePontoMedio',
  trapezio: 'nomeTrapezio',
};

@Component({
  selector: 'app-soma-de-riemann',
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
  templateUrl: './soma-de-riemann.html',
  styleUrl: './soma-de-riemann.scss',
})
export class SomaDeRiemann {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorRiemann;
  protected readonly conceitos = TEORIA_RIEMANN.map((teoria) => teoria.id);
  protected readonly tipos = TIPOS;
  protected readonly nomeTipo = NOME_SOMA_CHAVE;

  protected readonly n = signal(8);
  protected readonly tipo = signal<TipoSoma>('esquerda');
  protected readonly de = signal(0);
  protected readonly ate = signal(2);

  private readonly polinomio = Polinomio.de(0, 0, 1); // x²
  protected readonly fn = (x: number): number => this.polinomio.avaliar(x);

  protected readonly soma = computed(() =>
    somaDeRiemann(this.fn, this.de(), this.ate(), this.n(), this.tipo()),
  );

  protected readonly exata = computed(() =>
    integralNumerica(this.fn, this.de(), this.ate()),
  );

  protected readonly erro = computed(() => Math.abs(this.soma() - this.exata()));

  protected readonly erroPercentual = computed(() =>
    this.exata() === 0 ? 0 : (this.erro() / Math.abs(this.exata())) * 100,
  );

  protected readonly analise = computed(() =>
    riemannComPassos(this.fn, this.de(), this.ate(), this.n(), this.tipo()),
  );

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => [
    { fn: this.fn, cor: 'serie-1', rotulo: 'f(x) = x²' },
  ]);

  /** O trapézio não é um retângulo, então mostramos os de ponto médio. */
  protected readonly retangulos = computed<readonly RetanguloPlot[]>(() => {
    const tipo = this.tipo() === 'trapezio' ? 'ponto-medio' : this.tipo();

    return retangulosDeRiemann(this.fn, this.de(), this.ate(), this.n(), tipo).map(
      (retangulo) => ({
        x: retangulo.x,
        largura: retangulo.largura,
        altura: retangulo.altura,
        cor: 'serie-2' as const,
      }),
    );
  });

  protected readonly dominio = computed(() => {
    const folga = (this.ate() - this.de()) * 0.2;
    return { xMin: this.de() - folga, xMax: this.ate() + folga };
  });

  protected readonly descricaoGrafico = computed(() =>
    this.texto('descricaoGrafico', {
      n: this.n(),
      soma: this.formatar(this.soma()),
      exata: this.formatar(this.exata()),
    }),
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_RIEMANN);
  }

  protected definirTipo(tipo: TipoSoma): void {
    this.tipo.set(tipo);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(5)).toLocaleString('pt-BR', { maximumFractionDigits: 5 });
  }
}
