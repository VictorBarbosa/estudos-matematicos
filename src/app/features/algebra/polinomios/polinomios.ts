import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  Polinomio,
  candidatasRacionais,
  dividirComPassos,
  raizesRacionais,
  restoPorBinomioComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorPolinomios } from './polinomios.gerador';
import { TEORIA_POLINOMIOS } from './polinomios.teoria';

@Component({
  selector: 'app-polinomios',
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
  templateUrl: './polinomios.html',
  styleUrl: './polinomios.scss',
})
export class Polinomios {
  protected readonly gerador = geradorPolinomios;
  protected readonly conceitos = TEORIA_POLINOMIOS.map((teoria) => teoria.id);

  /** P(x) = a·x³ + b·x² + c·x + d. */
  protected readonly a = signal(1);
  protected readonly b = signal(-6);
  protected readonly c = signal(11);
  protected readonly d = signal(-6);

  /** O divisor é o binômio (x − raizTeste). */
  protected readonly raizTeste = signal(1);

  protected readonly polinomio = computed(() =>
    Polinomio.de(this.d(), this.c(), this.b(), this.a()),
  );

  protected readonly divisor = computed(() => Polinomio.de(-this.raizTeste(), 1));

  protected readonly divisao = computed(() =>
    dividirComPassos(this.polinomio(), this.divisor()),
  );

  protected readonly resto = computed(() =>
    restoPorBinomioComPassos(this.polinomio(), this.raizTeste()),
  );

  protected readonly ehFator = computed(() => Math.abs(this.resto().resultado) < 1e-9);

  protected readonly raizes = computed(() => raizesRacionais(this.polinomio()));

  /** As candidatas do teorema das raízes racionais, com o veredito de cada uma. */
  protected readonly candidatas = computed(() => {
    const p = this.polinomio();

    return candidatasRacionais(p)
      .slice(0, 16)
      .map((valor) => ({
        valor,
        anula: Math.abs(p.avaliar(valor)) < 1e-9,
      }));
  });

  protected readonly polinomioTex = computed(() => `P(x) = ${this.polinomio().paraTex()}`);

  protected readonly divisaoTex = computed(() => {
    const { quociente, resto } = this.divisao().resultado;
    const fatorado = `\\left(${this.divisor().paraTex()}\\right)\\left(${quociente.paraTex()}\\right)`;

    return resto.ehNulo
      ? `P(x) = ${fatorado}`
      : `P(x) = ${fatorado} + ${resto.paraTex()}`;
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const p = this.polinomio();
    const { quociente } = this.divisao().resultado;

    return [
      { fn: (x) => p.avaliar(x), cor: 'serie-1', rotulo: 'P(x)' },
      { fn: (x) => quociente.avaliar(x), cor: 'serie-3', tracejada: true, rotulo: 'quociente' },
    ];
  });

  /** As raízes marcadas no gráfico, mais o ponto que está sendo testado. */
  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const p = this.polinomio();
    const testada = this.raizTeste();

    const marcas: PontoPlot[] = this.raizes().map((raiz) => ({
      x: raiz,
      y: 0,
      rotulo: `raiz ${this.formatar(raiz)}`,
      cor: 'acerto',
    }));

    if (!this.ehFator()) {
      marcas.push({
        x: testada,
        y: p.avaliar(testada),
        rotulo: `P(${this.formatar(testada)}) = ${this.formatar(p.avaliar(testada))}`,
        cor: 'aviso',
      });
    }

    return marcas;
  });

  protected readonly dominio = computed(() => ({ xMin: -5, xMax: 5 }));

  protected readonly descricaoGrafico = computed(
    () =>
      `Polinômio de grau ${this.polinomio().grau} com ${this.raizes().length} raiz(es) ` +
      'racional(is), ao lado do quociente da divisão.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_POLINOMIOS);
  }

  protected testar(valor: number): void {
    this.raizTeste.set(valor);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
