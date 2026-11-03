import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ARCOS_DA_DERIVADA,
  TABELA_DAS_DERIVADAS_TRIG,
  arcoTex,
  arcoTexto,
  arcoValor,
  derivadaNumerica,
  derivadaTrigExata,
  exatoTex,
  exatoValor,
  trigParaTex,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { geradorDerivadasTrig } from '@features/calculo-1/derivadas-trigonometricas/derivadas-trigonometricas.gerador';
import { TEORIA_DERIVADAS_TRIG } from '@features/calculo-1/derivadas-trigonometricas/derivadas-trigonometricas.teoria';

@Component({
  selector: 'app-derivadas-trigonometricas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './derivadas-trigonometricas.html',
  styleUrl: './derivadas-trigonometricas.scss',
})
export class DerivadasTrigonometricas {
  protected readonly gerador = geradorDerivadasTrig;
  protected readonly conceitos = TEORIA_DERIVADAS_TRIG.map((teoria) => teoria.id);
  protected readonly tabela = TABELA_DAS_DERIVADAS_TRIG;

  /** 0 é o seno, 1 é o cosseno — o controle só sabe mexer em números. */
  protected readonly escolha = signal(0);
  protected readonly a = signal(2);
  protected readonly b = signal(1);
  /** Índice dentro dos arcos notáveis. */
  protected readonly indiceDoArco = signal(3);

  protected readonly funcao = computed<'sen' | 'cos'>(() =>
    this.escolha() === 0 ? 'sen' : 'cos',
  );

  protected readonly arco = computed(() => ARCOS_DA_DERIVADA[this.indiceDoArco()]!);

  protected readonly nomeDaFuncao = computed(() =>
    this.funcao() === 'sen' ? 'seno' : 'cosseno',
  );

  protected readonly arcoEscrito = computed(() => arcoTexto(this.arco()));

  protected readonly funcaoTex = computed(() =>
    `f(x) = ${trigParaTex(this.funcao(), this.a(), this.b())}`,
  );

  protected readonly derivadaTex = computed(() => {
    const exato = derivadaTrigExata(this.funcao(), this.a(), this.b(), this.arco());
    return `f'\\left(${arcoTex(this.arco())}\\right) = ${exatoTex(exato)}`;
  });

  protected readonly valorExato = computed(() =>
    exatoValor(derivadaTrigExata(this.funcao(), this.a(), this.b(), this.arco())),
  );

  /** Conferência independente: a mesma derivada, por diferença finita. */
  protected readonly valorNumerico = computed(() =>
    derivadaNumerica(this.fn(), arcoValor(this.arco())),
  );

  protected readonly fn = computed(() => {
    const [a, b] = [this.a(), this.b()];
    const base = this.funcao() === 'sen' ? Math.sin : Math.cos;
    return (x: number) => a * base(b * x);
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const [a, b] = [this.a(), this.b()];
    const derivada =
      this.funcao() === 'sen'
        ? (x: number) => a * b * Math.cos(b * x)
        : (x: number) => -a * b * Math.sin(b * x);

    return [
      { fn: this.fn(), cor: 'serie-1', rotulo: 'f(x)' },
      { fn: derivada, cor: 'acento', rotulo: "f'(x)" },
    ];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => [
    {
      x: arcoValor(this.arco()),
      y: this.valorExato(),
      cor: 'acento',
      rotulo: `f'(${this.arcoEscrito()})`,
    },
  ]);

  protected readonly dominio = computed(() => ({ xMin: -Math.PI, xMax: 2 * Math.PI }));

  protected readonly descricaoGrafico = computed(
    () =>
      `Gráfico de ${this.a()} vezes o ${this.nomeDaFuncao()} e de sua derivada; ` +
      'onde uma cruza o eixo, a outra atinge um extremo.',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_DERIVADAS_TRIG);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }
}
