import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { concentracaoDiluida, molaridade } from '@core/math';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import textos from '@features/quimica/solucoes-e-concentracao/solucoes-e-concentracao.i18n.json';
import { geradorSolucoes } from '@features/quimica/solucoes-e-concentracao/solucoes-e-concentracao.gerador';
import { TEORIA_SOLUCOES } from '@features/quimica/solucoes-e-concentracao/solucoes-e-concentracao.teoria';

/** Solutos de bancada, com a massa molar como a tabela a dá. */
const SOLUTOS = [
  { formula: 'NaCl', massaMolar: 58.44 },
  { formula: 'NaOH', massaMolar: 40.0 },
  { formula: 'CuSO₄', massaMolar: 159.61 },
  { formula: 'C₆H₁₂O₆', massaMolar: 180.16 },
] as const;

/**
 * Soluções e concentração — a aba Explorar.
 *
 * O volume aparece em mililitros, como na bancada, e logo abaixo em litros:
 * ver os dois juntos é o que ensina a conversão sem transformá-la em regra
 * decorada. A terceira linha acrescenta água sem mexer no soluto, e a
 * concentração cai enquanto a quantidade de mols fica parada — que é a frase
 * inteira da diluição.
 */
@Component({
  selector: 'app-solucoes-e-concentracao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, TopicoLayout],
  templateUrl: './solucoes-e-concentracao.html',
  styleUrl: './solucoes-e-concentracao.scss',
})
export class SolucoesEConcentracao {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorSolucoes;
  protected readonly conceitos = TEORIA_SOLUCOES.map((teoria) => teoria.id);
  protected readonly solutos = SOLUTOS;

  protected readonly escolhido = signal(0);
  /** Em centigramas, porque o controle é inteiro. */
  protected readonly centigramas = signal(584);
  protected readonly mililitros = signal(250);
  protected readonly aguaEmMililitros = signal(0);

  protected readonly soluto = computed(() => SOLUTOS[this.escolhido()] ?? SOLUTOS[0]!);
  protected readonly massa = computed(() => this.centigramas() / 100);
  protected readonly litros = computed(() => this.mililitros() / 1000);

  protected readonly mols = computed(() => this.massa() / this.soluto().massaMolar);

  protected readonly concentracao = computed(() => molaridade(this.mols(), this.litros()));

  protected readonly concentracaoDepois = computed(() =>
    concentracaoDiluida(
      this.concentracao(),
      this.litros(),
      this.litros() + this.aguaEmMililitros() / 1000,
    ),
  );

  protected escolher(indice: number): void {
    this.escolhido.set(indice);
  }

  protected arredondar(valor: number, casas = 2): string {
    return valor.toLocaleString(this.i18n.idioma() === 'en' ? 'en-US' : 'pt-BR', {
      maximumFractionDigits: casas,
    });
  }
}
