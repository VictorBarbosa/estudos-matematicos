import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { acharLimitante, massaDeProduto, massaQueSobra, receitasAlcancadas } from '@core/math';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import textos from '@features/quimica/limitante-e-rendimento/limitante-e-rendimento.i18n.json';
import { geradorLimitante } from '@features/quimica/limitante-e-rendimento/limitante-e-rendimento.gerador';
import { TEORIA_LIMITANTE } from '@features/quimica/limitante-e-rendimento/limitante-e-rendimento.teoria';

/** As reações da aba Explorar, já balanceadas, com dois reagentes. */
const REACOES = [
  {
    tex: '2\\,\\text{H}_2 + \\text{O}_2 \\to 2\\,\\text{H}_2\\text{O}',
    rotulo: 'H₂ + O₂',
    primeiro: { formula: 'H₂', coeficiente: 2, massaMolar: 2.02 },
    segundo: { formula: 'O₂', coeficiente: 1, massaMolar: 32.0 },
    produto: { formula: 'H₂O', coeficiente: 2, massaMolar: 18.02 },
  },
  {
    tex: '\\text{N}_2 + 3\\,\\text{H}_2 \\to 2\\,\\text{NH}_3',
    rotulo: 'N₂ + H₂',
    primeiro: { formula: 'N₂', coeficiente: 1, massaMolar: 28.01 },
    segundo: { formula: 'H₂', coeficiente: 3, massaMolar: 2.02 },
    produto: { formula: 'NH₃', coeficiente: 2, massaMolar: 17.03 },
  },
  {
    tex: '4\\,\\text{Fe} + 3\\,\\text{O}_2 \\to 2\\,\\text{Fe}_2\\text{O}_3',
    rotulo: 'Fe + O₂',
    primeiro: { formula: 'Fe', coeficiente: 4, massaMolar: 55.85 },
    segundo: { formula: 'O₂', coeficiente: 3, massaMolar: 32.0 },
    produto: { formula: 'Fe₂O₃', coeficiente: 2, massaMolar: 159.69 },
  },
] as const;

/**
 * Reagente limitante — a aba Explorar.
 *
 * As duas massas se movem independentes, e o que aparece é a medida certa:
 * quantas «receitas» cada reagente alcança. Mexer num dos controles até o
 * limitante trocar é o tópico inteiro numa imagem — e o caso que vale a pena
 * procurar é aquele em que o reagente de MAIS gramas é o que limita, porque é
 * exatamente o que a intuição da massa nega.
 */
@Component({
  selector: 'app-limitante-e-rendimento',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, TopicoLayout],
  templateUrl: './limitante-e-rendimento.html',
  styleUrl: './limitante-e-rendimento.scss',
})
export class LimitanteERendimento {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorLimitante;
  protected readonly conceitos = TEORIA_LIMITANTE.map((teoria) => teoria.id);
  protected readonly reacoes = REACOES;

  protected readonly escolhida = signal(0);
  /** Em décimos de grama, porque o controle é inteiro. */
  protected readonly decimosDoPrimeiro = signal(200);
  protected readonly decimosDoSegundo = signal(600);

  protected readonly reacao = computed(() => REACOES[this.escolhida()] ?? REACOES[0]!);

  protected readonly disponivelPrimeiro = computed(() => ({
    participante: this.reacao().primeiro,
    massa: this.decimosDoPrimeiro() / 10,
  }));

  protected readonly disponivelSegundo = computed(() => ({
    participante: this.reacao().segundo,
    massa: this.decimosDoSegundo() / 10,
  }));

  protected readonly receitasDoPrimeiro = computed(() =>
    receitasAlcancadas(this.disponivelPrimeiro()),
  );

  protected readonly receitasDoSegundo = computed(() =>
    receitasAlcancadas(this.disponivelSegundo()),
  );

  protected readonly analise = computed(() =>
    acharLimitante(this.disponivelPrimeiro(), this.disponivelSegundo()),
  );

  protected readonly produtoFormado = computed(() =>
    massaDeProduto(this.disponivelPrimeiro(), this.disponivelSegundo(), this.reacao().produto),
  );

  protected readonly sobra = computed(() =>
    massaQueSobra(this.disponivelPrimeiro(), this.disponivelSegundo()),
  );

  /** O primeiro é o limitante? Decide qual coluna fica destacada. */
  protected readonly primeiroLimita = computed(
    () => this.analise().limitante.participante.formula === this.reacao().primeiro.formula,
  );

  protected escolher(indice: number): void {
    this.escolhida.set(indice);
  }

  protected arredondar(valor: number): string {
    return valor.toLocaleString(this.i18n.idioma() === 'en' ? 'en-US' : 'pt-BR', {
      maximumFractionDigits: 2,
    });
  }
}
