import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { comSubscritos, massaMolarDaFormula, partesDaFormula } from '@core/math';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { Formula } from '@shared/components/formula/formula';
import textos from '@features/quimica/composicao-e-formula/composicao-e-formula.i18n.json';
import { geradorComposicao } from '@features/quimica/composicao-e-formula/composicao-e-formula.gerador';
import { TEORIA_COMPOSICAO } from '@features/quimica/composicao-e-formula/composicao-e-formula.teoria';

/** Compostos da aba Explorar, com a empírica ao lado da molecular. */
const COMPOSTOS = [
  { molecular: 'H2O', empirica: 'H2O' },
  { molecular: 'CO2', empirica: 'CO2' },
  { molecular: 'C6H12O6', empirica: 'CH2O' },
  { molecular: 'H2SO4', empirica: 'H2SO4' },
  { molecular: 'Fe2O3', empirica: 'Fe2O3' },
  { molecular: 'C6H6', empirica: 'CH' },
] as const;

/**
 * Composição percentual e fórmula empírica — a aba Explorar.
 *
 * Ao lado da porcentagem de cada elemento aparece quantos átomos dele a
 * fórmula traz. Ver os dois juntos é o argumento do tópico: em H₂O o
 * hidrogênio é dois terços dos ÁTOMOS e um nono da MASSA, e nenhuma das duas
 * leituras substitui a outra.
 *
 * A empírica fica ao lado da molecular para que o caso da glicose fale por si:
 * C₆H₁₂O₆ e CH₂O têm exatamente a mesma composição percentual, e por isso a
 * porcentagem sozinha nunca chega à molécula.
 */
@Component({
  selector: 'app-composicao-e-formula',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, Formula, TopicoLayout],
  templateUrl: './composicao-e-formula.html',
  styleUrl: './composicao-e-formula.scss',
})
export class ComposicaoEFormula {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorComposicao;
  protected readonly conceitos = TEORIA_COMPOSICAO.map((teoria) => teoria.id);
  protected readonly compostos = COMPOSTOS;

  protected readonly escolhido = signal(0);

  protected readonly composto = computed(() => COMPOSTOS[this.escolhido()] ?? COMPOSTOS[0]!);

  protected readonly massaMolar = computed(
    () => massaMolarDaFormula(this.composto().molecular) ?? 0,
  );

  protected readonly linhas = computed(() => {
    const partes = partesDaFormula(this.composto().molecular) ?? [];
    const total = this.massaMolar();

    return partes.map((parte) => ({
      simbolo: parte.elemento.simbolo,
      quantidade: parte.quantidade,
      percentual: ((parte.elemento.massaAtomica * parte.quantidade) / total) * 100,
    }));
  });

  protected readonly moleculaEscrita = computed(() => comSubscritos(this.composto().molecular));
  protected readonly empiricaEscrita = computed(() => comSubscritos(this.composto().empirica));

  /** A empírica é diferente da molecular? É o caso que ensina. */
  protected readonly proporcaoSeRepete = computed(
    () => this.composto().empirica !== this.composto().molecular,
  );

  protected escolher(indice: number): void {
    this.escolhido.set(indice);
  }

  protected arredondar(valor: number): string {
    return valor.toLocaleString(this.i18n.idioma() === 'en' ? 'en-US' : 'pt-BR', {
      maximumFractionDigits: 2,
    });
  }
}
