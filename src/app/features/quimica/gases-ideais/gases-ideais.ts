import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { paraKelvin, volumeIdeal } from '@core/math';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import textos from '@features/quimica/gases-ideais/gases-ideais.i18n.json';
import { geradorGases } from '@features/quimica/gases-ideais/gases-ideais.gerador';
import { TEORIA_GASES } from '@features/quimica/gases-ideais/gases-ideais.teoria';

/**
 * Gases ideais — a aba Explorar.
 *
 * O controle da temperatura está em graus Celsius, como num problema real, e
 * logo abaixo aparecem o kelvin e o volume. Ao lado deles fica o volume que
 * sairia se a temperatura fosse usada em Celsius — e é mexer no controle que
 * mostra o essencial: perto de 0 °C a diferença é enorme e o resultado chega a
 * ser absurdo, enquanto a 100 °C ela encolhe sem nunca desaparecer. A régua da
 * conversão deixa de ser decorada quando se vê o estrago variar.
 */
@Component({
  selector: 'app-gases-ideais',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, TopicoLayout],
  templateUrl: './gases-ideais.html',
  styleUrl: './gases-ideais.scss',
})
export class GasesIdeais {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorGases;
  protected readonly conceitos = TEORIA_GASES.map((teoria) => teoria.id);

  /** Em centésimos, porque o controle é inteiro. */
  protected readonly centesimosDeMol = signal(100);
  protected readonly centesimosDeAtm = signal(100);
  protected readonly celsius = signal(25);

  protected readonly mols = computed(() => this.centesimosDeMol() / 100);
  protected readonly pressao = computed(() => this.centesimosDeAtm() / 100);
  protected readonly temperaturaK = computed(() => paraKelvin(this.celsius()));

  protected readonly volume = computed(() =>
    volumeIdeal(this.mols(), this.pressao(), this.temperaturaK()),
  );

  /** O volume que sairia com a temperatura deixada em Celsius: o erro do tópico. */
  protected readonly volumeComCelsius = computed(() =>
    volumeIdeal(this.mols(), this.pressao(), this.celsius()),
  );

  protected arredondar(valor: number, casas = 2): string {
    return valor.toLocaleString(this.i18n.idioma() === 'en' ? 'en-US' : 'pt-BR', {
      maximumFractionDigits: casas,
    });
  }
}
