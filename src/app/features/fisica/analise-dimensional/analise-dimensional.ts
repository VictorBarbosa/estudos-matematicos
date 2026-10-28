import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  Dimensao,
  GRANDEZAS,
  Grandeza,
  dimensaoParaTex,
  dimensoesIguais,
  dividirDimensoes,
  elevarDimensao,
  multiplicarDimensoes,
  verificarEquacaoComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { Formula } from '@shared/components/formula/formula';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorDimensional } from './analise-dimensional.gerador';
import { TEORIA_DIMENSIONAL } from './analise-dimensional.teoria';

type Operacao = 'multiplicar' | 'dividir' | 'quadrado';

@Component({
  selector: 'app-analise-dimensional',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, Formula, PassoAPasso, TopicoLayout],
  templateUrl: './analise-dimensional.html',
  styleUrl: './analise-dimensional.scss',
})
export class AnaliseDimensional {
  protected readonly gerador = geradorDimensional;
  protected readonly conceitos = TEORIA_DIMENSIONAL.map((teoria) => teoria.id);
  protected readonly grandezas = GRANDEZAS;

  protected readonly primeira = signal<Grandeza>(GRANDEZAS.find((g) => g.nome === 'massa')!);
  protected readonly segunda = signal<Grandeza>(
    GRANDEZAS.find((g) => g.nome === 'aceleração')!,
  );

  protected readonly operacao = signal<Operacao>('multiplicar');

  protected readonly operacoes: readonly { readonly id: Operacao; readonly rotulo: string }[] = [
    { id: 'multiplicar', rotulo: 'A × B' },
    { id: 'dividir', rotulo: 'A ÷ B' },
    { id: 'quadrado', rotulo: 'A × B²' },
  ];

  protected readonly resultado = computed<Dimensao>(() => {
    const a = this.primeira().dimensao;
    const b = this.segunda().dimensao;

    switch (this.operacao()) {
      case 'multiplicar':
        return multiplicarDimensoes(a, b);
      case 'dividir':
        return dividirDimensoes(a, b);
      case 'quadrado':
        return multiplicarDimensoes(a, elevarDimensao(b, 2));
    }
  });

  /** A grandeza conhecida que tem essa dimensão, se houver. */
  protected readonly reconhecida = computed(() =>
    GRANDEZAS.find((grandeza) => dimensoesIguais(grandeza.dimensao, this.resultado())),
  );

  protected readonly resultadoTex = computed(() => {
    const simbolo =
      this.operacao() === 'multiplicar'
        ? '\\cdot'
        : this.operacao() === 'dividir'
          ? '/'
          : '\\cdot';

    const segunda =
      this.operacao() === 'quadrado'
        ? `\\left(${dimensaoParaTex(this.segunda().dimensao)}\\right)^{2}`
        : dimensaoParaTex(this.segunda().dimensao);

    return (
      `${dimensaoParaTex(this.primeira().dimensao)} ${simbolo} ${segunda} = ` +
      dimensaoParaTex(this.resultado())
    );
  });

  /** As candidatas a fórmula do período do pêndulo, testadas por dimensão. */
  protected readonly candidatasPendulo = computed(() => {
    const comprimento = GRANDEZAS.find((g) => g.nome === 'comprimento')!.dimensao;
    const gravidade = GRANDEZAS.find((g) => g.nome === 'aceleração')!.dimensao;
    const tempo = GRANDEZAS.find((g) => g.nome === 'tempo')!.dimensao;

    const candidatas = [
      { tex: '2\\pi\\sqrt{L/g}', dimensao: elevarDimensao(dividirDimensoes(comprimento, gravidade), 0.5) },
      { tex: '2\\pi\\sqrt{g/L}', dimensao: elevarDimensao(dividirDimensoes(gravidade, comprimento), 0.5) },
      { tex: '2\\pi\\sqrt{Lg}', dimensao: elevarDimensao(multiplicarDimensoes(comprimento, gravidade), 0.5) },
      { tex: '2\\pi L/g', dimensao: dividirDimensoes(comprimento, gravidade) },
    ];

    return candidatas.map((candidata) => ({
      ...candidata,
      correta: dimensoesIguais(candidata.dimensao, tempo),
    }));
  });

  protected readonly verificacao = computed(() => {
    const energia = GRANDEZAS.find((g) => g.nome === 'energia')!.dimensao;

    return verificarEquacaoComPassos(energia, this.resultado(), 'energia', 'sua expressão');
  });

  constructor() {
    inject(TeoriaService).registrar(TEORIA_DIMENSIONAL);
  }

  protected selecionarPrimeira(evento: Event): void {
    const nome = (evento.target as HTMLSelectElement).value;
    this.primeira.set(GRANDEZAS.find((grandeza) => grandeza.nome === nome)!);
  }

  protected selecionarSegunda(evento: Event): void {
    const nome = (evento.target as HTMLSelectElement).value;
    this.segunda.set(GRANDEZAS.find((grandeza) => grandeza.nome === nome)!);
  }

  protected selecionarOperacao(operacao: Operacao): void {
    this.operacao.set(operacao);
  }

  protected dimensaoTex(dimensao: Dimensao): string {
    return dimensaoParaTex(dimensao);
  }
}
