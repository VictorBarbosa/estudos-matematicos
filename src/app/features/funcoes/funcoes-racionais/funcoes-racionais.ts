import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  FuncaoRacional,
  Polinomio,
  analisarRacional,
  avaliarRacional,
  racionalParaTex,
} from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { MathPlot } from '@shared/components/math-plot/math-plot';
import { CurvaPlot, PontoPlot } from '@shared/components/math-plot/models/math-plot.model';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import textos from '@features/funcoes/funcoes-racionais/funcoes-racionais.i18n.json';
import { geradorFuncoesRacionais } from '@features/funcoes/funcoes-racionais/funcoes-racionais.gerador';
import { TEORIA_RACIONAIS } from '@features/funcoes/funcoes-racionais/funcoes-racionais.teoria';

@Component({
  selector: 'app-funcoes-racionais',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, MathPlot, TopicoLayout],
  templateUrl: './funcoes-racionais.html',
  styleUrl: './funcoes-racionais.scss',
})
export class FuncoesRacionais {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorFuncoesRacionais;
  protected readonly conceitos = TEORIA_RACIONAIS.map((teoria) => teoria.id);

  protected readonly zero = signal(-1);
  protected readonly polo = signal(2);
  /** Quando ligado, o numerador ganha o mesmo fator do denominador. */
  protected readonly comBuraco = signal(0);

  protected readonly funcao = computed<FuncaoRacional>(() => {
    const base = Polinomio.de(-this.zero(), 1);
    const fatorDoPolo = Polinomio.de(-this.polo(), 1);

    return this.comBuraco() === 1
      ? {
          numerador: base.multiplicar(fatorDoPolo),
          denominador: fatorDoPolo.multiplicar(Polinomio.de(-(this.polo() + 3), 1)),
        }
      : { numerador: base, denominador: fatorDoPolo };
  });

  protected readonly analise = computed(() => analisarRacional(this.funcao()));

  protected readonly funcaoTex = computed(() => `f(x) = ${racionalParaTex(this.funcao())}`);

  protected readonly assintotas = computed(() => this.analise().assintotasVerticais);
  protected readonly buracos = computed(() => this.analise().buracos);
  protected readonly zeros = computed(() => this.analise().zeros);

  protected readonly horizontalEscrita = computed(() => {
    const { tipoFinal, horizontal, obliqua } = this.analise();
    if (tipoFinal === 'obliqua') {
      return this.texto('obliqua', { reta: (obliqua ?? Polinomio.ZERO).toString() });
    }
    return horizontal === null
      ? this.texto('naoHa')
      : this.texto('horizontalY', { valor: this.formatar(horizontal) });
  });

  protected readonly curvas = computed<readonly CurvaPlot[]>(() => {
    const f = this.funcao();
    return [{ fn: (x) => avaliarRacional(f, x), cor: 'serie-1', rotulo: this.texto('curvaF') }];
  });

  /** Os buracos aparecem como círculos vazados — é o que eles são. */
  protected readonly pontos = computed<readonly PontoPlot[]>(() => {
    const f = this.funcao();

    return this.buracos().map((x) => {
      const vizinho = x + 1e-6;
      return {
        x,
        y: avaliarRacional(f, vizinho),
        cor: 'acento' as const,
        vazado: true,
        rotulo: this.texto('pontoBuraco'),
      };
    });
  });

  protected readonly dominio = computed(() => ({
    xMin: -10,
    xMax: 10,
    yMin: -8,
    yMax: 8,
  }));

  protected readonly descricaoGrafico = computed(() => this.texto('descricaoGrafico'));

  constructor() {
    inject(TeoriaService).registrar(TEORIA_RACIONAIS);
  }

  protected formatar(valor: number): string {
    return Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }

  protected lista(valores: readonly number[]): string {
    return valores.length === 0
      ? this.texto('nenhuma')
      : valores.map((x) => this.formatar(x)).join(', ');
  }
}
