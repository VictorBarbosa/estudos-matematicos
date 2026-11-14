import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { massaCorrespondente, massaPelaProporcaoCrua } from '@core/math';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import textos from '@features/quimica/estequiometria/estequiometria.i18n.json';
import { geradorEstequiometria } from '@features/quimica/estequiometria/estequiometria.gerador';
import { TEORIA_ESTEQUIOMETRIA } from '@features/quimica/estequiometria/estequiometria.teoria';

/** As reações da aba Explorar, já balanceadas. */
const REACOES = [
  {
    tex: '2\\,\\text{H}_2 + \\text{O}_2 \\to 2\\,\\text{H}_2\\text{O}',
    rotulo: 'H₂ → H₂O',
    de: { formula: 'H₂', coeficiente: 2, massaMolar: 2.02 },
    para: { formula: 'H₂O', coeficiente: 2, massaMolar: 18.02 },
  },
  {
    tex: '\\text{N}_2 + 3\\,\\text{H}_2 \\to 2\\,\\text{NH}_3',
    rotulo: 'N₂ → NH₃',
    de: { formula: 'N₂', coeficiente: 1, massaMolar: 28.01 },
    para: { formula: 'NH₃', coeficiente: 2, massaMolar: 17.03 },
  },
  {
    tex: '4\\,\\text{Fe} + 3\\,\\text{O}_2 \\to 2\\,\\text{Fe}_2\\text{O}_3',
    rotulo: 'Fe → Fe₂O₃',
    de: { formula: 'Fe', coeficiente: 4, massaMolar: 55.85 },
    para: { formula: 'Fe₂O₃', coeficiente: 2, massaMolar: 159.69 },
  },
] as const;

/**
 * Estequiometria — a aba Explorar.
 *
 * Os três trechos do trajeto aparecem **ao mesmo tempo**, e ao lado deles o
 * que a proporção crua daria. Ver os dois números lado a lado é o argumento
 * inteiro do tópico: o errado é plausível, da mesma ordem de grandeza, e não
 * há nada nele que denuncie o engano — só a comparação denuncia.
 */
@Component({
  selector: 'app-estequiometria',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, TopicoLayout],
  templateUrl: './estequiometria.html',
  styleUrl: './estequiometria.scss',
})
export class Estequiometria {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorEstequiometria;
  protected readonly conceitos = TEORIA_ESTEQUIOMETRIA.map((teoria) => teoria.id);
  protected readonly reacoes = REACOES;

  protected readonly escolhida = signal(0);
  /** Em décimos de grama, porque o controle é inteiro. */
  protected readonly decimos = signal(100);

  protected readonly reacao = computed(() => REACOES[this.escolhida()] ?? REACOES[0]!);
  protected readonly massa = computed(() => this.decimos() / 10);

  protected readonly molsDePartida = computed(() => this.massa() / this.reacao().de.massaMolar);

  protected readonly molsObtidos = computed(
    () => (this.molsDePartida() * this.reacao().para.coeficiente) / this.reacao().de.coeficiente,
  );

  protected readonly massaObtida = computed(() =>
    massaCorrespondente(this.massa(), this.reacao().de, this.reacao().para),
  );

  /** O que a proporção daria se fosse aplicada direto às massas. */
  protected readonly pelaProporcaoCrua = computed(() =>
    massaPelaProporcaoCrua(this.massa(), this.reacao().de, this.reacao().para),
  );

  protected escolher(indice: number): void {
    this.escolhida.set(indice);
  }

  protected arredondar(valor: number): string {
    return valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
