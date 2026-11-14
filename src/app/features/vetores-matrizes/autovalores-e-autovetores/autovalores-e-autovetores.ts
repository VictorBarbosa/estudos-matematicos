import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  Matriz,
  autovalores,
  autovetorPara,
  determinante,
  matrizParaTex,
  polinomioCaracteristicoTex,
  traco,
} from '@core/math';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import textos from '@features/vetores-matrizes/autovalores-e-autovetores/autovalores-e-autovetores.i18n.json';
import { geradorAutovalores } from '@features/vetores-matrizes/autovalores-e-autovetores/autovalores-e-autovetores.gerador';
import { TEORIA_AUTOVALORES } from '@features/vetores-matrizes/autovalores-e-autovetores/autovalores-e-autovetores.teoria';

/**
 * Autovalores e autovetores — a aba Explorar.
 *
 * Os quatro números da matriz se movem livremente, e isso é o ponto: dá para
 * atravessar a fronteira em que o discriminante vira negativo e ver os
 * autovalores desaparecerem. Quando isso acontece a tela DIZ que a matriz gira
 * — em vez de mostrar um número que não existe —, e essa é a lição que um
 * exercício de conta não dá.
 *
 * Ao lado dos autovalores ficam o traço e o determinante, com o nome da
 * identidade: ver que a soma bate com um e o produto com o outro é a
 * conferência que o aluno vai usar na prova.
 */
@Component({
  selector: 'app-autovalores-e-autovetores',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, TopicoLayout],
  templateUrl: './autovalores-e-autovetores.html',
  styleUrl: './autovalores-e-autovetores.scss',
})
export class AutovaloresEAutovetores {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorAutovalores;
  protected readonly conceitos = TEORIA_AUTOVALORES.map((teoria) => teoria.id);

  protected readonly a = signal(4);
  protected readonly b = signal(-1);
  protected readonly c = signal(2);
  protected readonly d = signal(1);

  protected readonly matriz = computed<Matriz>(() => [
    [this.a(), this.b()],
    [this.c(), this.d()],
  ]);

  protected readonly matrizTex = computed(() => matrizParaTex(this.matriz()));
  protected readonly polinomioTex = computed(() => polinomioCaracteristicoTex(this.matriz()));

  protected readonly traco = computed(() => traco(this.matriz()));
  protected readonly determinante = computed(() => determinante(this.matriz()));

  protected readonly valores = computed(() => autovalores(this.matriz()));

  /** Cada autovalor com o seu autovetor e o resultado de aplicar a matriz. */
  protected readonly direcoes = computed(() => {
    const valores = this.valores();

    if (valores === undefined) {
      return [];
    }

    return valores.map((autovalor) => {
      const v = autovetorPara(this.matriz(), autovalor) ?? [0, 0];
      const aplicado = this.matriz().map((linha) =>
        linha.reduce((soma, valor, i) => soma + valor * v[i]!, 0),
      );

      return {
        autovalor: this.arredondar(autovalor),
        vetor: `(${this.arredondar(v[0]!)}, ${this.arredondar(v[1]!)})`,
        aplicado: `(${this.arredondar(aplicado[0]!)}, ${this.arredondar(aplicado[1]!)})`,
      };
    });
  });

  protected arredondar(valor: number): string {
    return valor.toLocaleString(this.i18n.idioma() === 'en' ? 'en-US' : 'pt-BR', {
      maximumFractionDigits: 2,
    });
  }
}
