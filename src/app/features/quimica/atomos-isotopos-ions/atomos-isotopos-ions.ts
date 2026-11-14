import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { contarParticulasComPassos } from '@core/math';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import textos from '@features/quimica/atomos-isotopos-ions/atomos-isotopos-ions.i18n.json';
import { geradorAtomos } from '@features/quimica/atomos-isotopos-ions/atomos-isotopos-ions.gerador';
import { TEORIA_ATOMOS } from '@features/quimica/atomos-isotopos-ions/atomos-isotopos-ions.teoria';

/**
 * Átomos, isótopos e íons — a aba Explorar.
 *
 * Os três controles são as três contagens que o tópico separa: mexer em Z muda
 * o ELEMENTO, mexer em A muda o ISÓTOPO, e mexer na carga muda o ÍON. Ver as
 * três agindo sobre o mesmo átomo é o que dissolve a confusão entre elas — e é
 * por isso que elas são deslizantes em vez de digitadas.
 */
@Component({
  selector: 'app-atomos-isotopos-ions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, PassoAPasso, TopicoLayout],
  templateUrl: './atomos-isotopos-ions.html',
  styleUrl: './atomos-isotopos-ions.scss',
})
export class AtomosIsotoposIons {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorAtomos;
  protected readonly conceitos = TEORIA_ATOMOS.map((teoria) => teoria.id);

  protected readonly z = signal(20);
  protected readonly a = signal(40);
  protected readonly carga = signal(2);

  /**
   * O número de massa nunca fica abaixo do atômico.
   *
   * Um átomo com menos partículas no núcleo que prótons não existe, e deixar o
   * controle produzir isso mostraria uma contagem de nêutrons negativa — que o
   * aluno leria como regra, não como limite da brincadeira.
   */
  protected readonly massaValida = computed(() => Math.max(this.a(), this.z()));

  protected readonly resolucao = computed(() =>
    contarParticulasComPassos({ z: this.z(), a: this.massaValida(), carga: this.carga() }),
  );

  protected readonly contagem = computed(() => this.resolucao().resultado);

  protected readonly simboloTex = computed(
    () => `^{${this.massaValida()}}_{${this.z()}}X^{${this.cargaTex()}}`,
  );

  private cargaTex(): string {
    const q = this.carga();
    if (q === 0) {
      return '\;';
    }

    return q > 0 ? `${q}+` : `${-q}-`;
  }
}
