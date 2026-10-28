import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ErroMatematico,
  Fracao,
  OperacaoFracao,
  Resolucao,
  operacaoParaTex,
  resolverComPassos,
} from '@core/math';
import { TeoriaService } from '@core/teoria/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { BarraFracao } from '@shared/components/barra-fracao/barra-fracao';
import { BotaoTeoria } from '@shared/components/botao-teoria/botao-teoria';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { MarcaPlot } from '@shared/components/math-plot/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { geradorFracoes } from './fracoes.gerador';
import { TEORIA_FRACOES } from './fracoes.teoria';

interface OpcaoOperacao {
  readonly valor: OperacaoFracao;
  readonly simbolo: string;
  readonly nome: string;
}

@Component({
  selector: 'app-fracoes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AreaTreino,
    BarraFracao,
    BotaoTeoria,
    ControleParametro,
    DecimalPipe,
    Formula,
    MathPlot,
    PassoAPasso,
    TopicoLayout,
  ],
  templateUrl: './fracoes.html',
  styleUrl: './fracoes.scss',
})
export class Fracoes {
  protected readonly gerador = geradorFracoes;

  protected readonly operacoes: readonly OpcaoOperacao[] = [
    { valor: 'somar', simbolo: '+', nome: 'Somar' },
    { valor: 'subtrair', simbolo: '−', nome: 'Subtrair' },
    { valor: 'multiplicar', simbolo: '×', nome: 'Multiplicar' },
    { valor: 'dividir', simbolo: '÷', nome: 'Dividir' },
  ];

  protected readonly numeradorA = signal(1);
  protected readonly denominadorA = signal(4);
  protected readonly numeradorB = signal(1);
  protected readonly denominadorB = signal(6);
  protected readonly operacao = signal<OperacaoFracao>('somar');

  protected readonly fracaoA = computed(() => Fracao.criar(this.numeradorA(), this.denominadorA()));
  protected readonly fracaoB = computed(() => Fracao.criar(this.numeradorB(), this.denominadorB()));

  protected readonly expressaoTex = computed(() =>
    operacaoParaTex(this.fracaoA(), this.operacao(), this.fracaoB()),
  );

  /**
   * A resolução, ou `null` quando a operação é impossível — dividir por zero é
   * o único caso aqui, e ele é tratado na interface em vez de lançar.
   */
  protected readonly resolucao = computed<Resolucao<Fracao> | null>(() => {
    try {
      return resolverComPassos(this.fracaoA(), this.operacao(), this.fracaoB());
    } catch (erro) {
      if (erro instanceof ErroMatematico) {
        return null;
      }
      throw erro;
    }
  });

  protected readonly erro = computed(() =>
    this.resolucao() === null
      ? 'Não é possível dividir por zero. Ajuste o numerador da segunda fração.'
      : null,
  );

  protected readonly resultado = computed(() => this.resolucao()?.resultado ?? null);

  /** As três frações posicionadas na reta numérica. */
  protected readonly marcas = computed<readonly MarcaPlot[]>(() => {
    const marcas: MarcaPlot[] = [
      { x: this.fracaoA().paraDecimal(), rotulo: this.fracaoA().toString(), cor: 'serie-1' },
      { x: this.fracaoB().paraDecimal(), rotulo: this.fracaoB().toString(), cor: 'serie-2' },
    ];

    const resultado = this.resultado();
    if (resultado) {
      marcas.push({ x: resultado.paraDecimal(), rotulo: resultado.toString(), cor: 'acento' });
    }

    return marcas;
  });

  protected readonly dominioReta = computed(() => {
    const valores = this.marcas().map((marca) => marca.x);
    const minimo = Math.min(0, ...valores);
    const maximo = Math.max(1, ...valores);
    const folga = Math.max(0.5, (maximo - minimo) * 0.15);

    return { xMin: minimo - folga, xMax: maximo + folga };
  });

  protected readonly descricaoReta = computed(() => {
    const resultado = this.resultado();
    return (
      `Reta numérica com ${this.fracaoA()} e ${this.fracaoB()} marcadas` +
      (resultado ? `, e o resultado ${resultado}.` : '.')
    );
  });

  /** Verdadeiro quando a conta exige igualar denominadores. */
  protected readonly precisaDenominadorComum = computed(() => {
    const operacao = this.operacao();
    const aditiva = operacao === 'somar' || operacao === 'subtrair';
    return aditiva && this.fracaoA().denominador !== this.fracaoB().denominador;
  });

  constructor() {
    // Registra a teoria junto com o tópico, para que ela acompanhe o chunk
    // lazy-loaded desta área em vez de pesar no bundle inicial.
    inject(TeoriaService).registrar(TEORIA_FRACOES);
  }

  protected definirOperacao(operacao: OperacaoFracao): void {
    this.operacao.set(operacao);
  }
}
