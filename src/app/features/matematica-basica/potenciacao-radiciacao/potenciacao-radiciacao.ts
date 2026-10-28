import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/math-plot.model';
import {
  avaliarPotencia,
  potenciaDePotenciaComPassos,
  potenciaParaTex,
  produtoDePotenciasComPassos,
  quocienteDePotenciasComPassos,
  raizParaTex,
  simplificarRaizComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorPotencias } from './potenciacao-radiciacao.gerador';
import { TEORIA_POTENCIAS } from './potenciacao-radiciacao.teoria';

type Propriedade = 'produto' | 'quociente' | 'potencia';

@Component({
  selector: 'app-potenciacao-radiciacao',
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
  templateUrl: './potenciacao-radiciacao.html',
  styleUrl: './potenciacao-radiciacao.scss',
})
export class PotenciacaoRadiciacao {
  protected readonly gerador = geradorPotencias;
  protected readonly conceitos = TEORIA_POTENCIAS.map((teoria) => teoria.id);

  protected readonly base = signal(2);
  protected readonly m = signal(3);
  protected readonly n = signal(2);
  protected readonly radicando = signal(72);

  protected readonly propriedade = signal<Propriedade>('produto');

  protected readonly propriedades: readonly { valor: Propriedade; rotulo: string }[] = [
    { valor: 'produto', rotulo: 'aᵐ · aⁿ' },
    { valor: 'quociente', rotulo: 'aᵐ ÷ aⁿ' },
    { valor: 'potencia', rotulo: '(aᵐ)ⁿ' },
  ];

  protected readonly resolucao = computed(() => {
    const base = this.base();
    const m = this.m();
    const n = this.n();

    switch (this.propriedade()) {
      case 'produto':
        return produtoDePotenciasComPassos(base, m, n);
      case 'quociente':
        return quocienteDePotenciasComPassos(base, m, n);
      case 'potencia':
        return potenciaDePotenciaComPassos(base, m, n);
    }
  });

  protected readonly valor = computed(() => avaliarPotencia(this.resolucao().resultado));
  protected readonly potenciaTex = computed(() => potenciaParaTex(this.resolucao().resultado));

  protected readonly raiz = computed(() => simplificarRaizComPassos(this.radicando()));
  protected readonly raizTex = computed(() => raizParaTex(this.raiz().resultado));
  protected readonly raizEhExata = computed(() => this.raiz().resultado.radicando === 1);

  /**
   * A curva aˣ com o expoente resultante destacado.
   *
   * Ver a potência como ponto sobre uma curva contínua é o que prepara o
   * terreno para a função exponencial, mais adiante no currículo.
   */
  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const base = this.base();
    return [{ fn: (x) => base ** x, cor: 'serie-1', rotulo: `y = ${base}^x` }];
  });

  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const expoente = this.resolucao().resultado.expoente;
    return [
      {
        x: expoente,
        y: this.valor(),
        rotulo: `${this.potenciaTex().replace(/[{}^]/g, '')} = ${this.valor()}`,
        cor: 'acento',
      },
    ];
  });

  protected readonly dominio = computed(() => {
    const expoente = this.resolucao().resultado.expoente;
    const limite = Math.max(4, Math.abs(expoente) + 1);
    return { xMin: -limite, xMax: limite };
  });

  protected readonly descricaoCurva = computed(
    () =>
      `Curva de ${this.base()} elevado a x, com o ponto do expoente ` +
      `${this.resolucao().resultado.expoente} destacado.`,
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_POTENCIAS);
  }

  protected definirPropriedade(propriedade: Propriedade): void {
    this.propriedade.set(propriedade);
  }
}
