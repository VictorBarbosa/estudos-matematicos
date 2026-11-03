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
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { BarraFracao } from '@shared/components/barra-fracao/barra-fracao';
import { BotaoTeoria } from '@shared/components/botao-teoria/botao-teoria';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { MarcaPlot } from '@shared/components/math-plot/models/math-plot.model';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/matematica-basica/fracoes/fracoes.i18n.json';
import { geradorFracoes } from '@features/matematica-basica/fracoes/fracoes.gerador';
import { TEORIA_FRACOES } from '@features/matematica-basica/fracoes/fracoes.teoria';

interface OpcaoOperacao {
  readonly valor: OperacaoFracao;
  readonly simbolo: string;
  /** Chave do nome no dicionário deste tópico. */
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
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);

  protected readonly operacoes: readonly OpcaoOperacao[] = [
    { valor: 'somar', simbolo: '+', nome: 'somar' },
    { valor: 'subtrair', simbolo: '−', nome: 'subtrair' },
    { valor: 'multiplicar', simbolo: '×', nome: 'multiplicar' },
    { valor: 'dividir', simbolo: '÷', nome: 'dividir' },
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
    this.resolucao() === null ? this.texto('divisaoPorZero') : null,
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
    const valores = { a: this.fracaoA().toString(), b: this.fracaoB().toString() };

    return resultado === null
      ? this.texto('descricaoReta', valores)
      : this.texto('descricaoRetaComResultado', {
          ...valores,
          resultado: resultado.toString(),
        });
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
