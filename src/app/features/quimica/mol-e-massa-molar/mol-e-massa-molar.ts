import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AVOGADRO, massaMolar } from '@core/math';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import textos from '@features/quimica/mol-e-massa-molar/mol-e-massa-molar.i18n.json';
import { geradorMol } from '@features/quimica/mol-e-massa-molar/mol-e-massa-molar.gerador';
import { TEORIA_MOL } from '@features/quimica/mol-e-massa-molar/mol-e-massa-molar.teoria';

/** As substâncias da aba Explorar, com a fórmula já decomposta. */
const SUBSTANCIAS = [
  {
    formula: 'H₂O',
    partes: [
      { simbolo: 'H', massaAtomica: 1.008, quantidade: 2 },
      { simbolo: 'O', massaAtomica: 15.999, quantidade: 1 },
    ],
  },
  {
    formula: 'CO₂',
    partes: [
      { simbolo: 'C', massaAtomica: 12.011, quantidade: 1 },
      { simbolo: 'O', massaAtomica: 15.999, quantidade: 2 },
    ],
  },
  {
    formula: 'NaCl',
    partes: [
      { simbolo: 'Na', massaAtomica: 22.99, quantidade: 1 },
      { simbolo: 'Cl', massaAtomica: 35.45, quantidade: 1 },
    ],
  },
  {
    formula: 'C₆H₁₂O₆',
    partes: [
      { simbolo: 'C', massaAtomica: 12.011, quantidade: 6 },
      { simbolo: 'H', massaAtomica: 1.008, quantidade: 12 },
      { simbolo: 'O', massaAtomica: 15.999, quantidade: 6 },
    ],
  },
] as const;

/**
 * O mol e a massa molar — a aba Explorar.
 *
 * O controle é um só: a quantidade de mols. Mexer nele move a massa e a
 * contagem de partículas **juntas**, e é essa simultaneidade que mostra o que
 * o mol é — a mesma quantidade, lida numa balança ou numa contagem. Trocar a
 * substância mostra a outra metade: o punhado é sempre o mesmo em partículas,
 * e muda de peso.
 */
@Component({
  selector: 'app-mol-e-massa-molar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, TopicoLayout],
  templateUrl: './mol-e-massa-molar.html',
  styleUrl: './mol-e-massa-molar.scss',
})
export class MolEMassaMolar {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorMol;
  protected readonly conceitos = TEORIA_MOL.map((teoria) => teoria.id);
  protected readonly substancias = SUBSTANCIAS;

  /** Em décimos de mol, porque o controle é inteiro. */
  protected readonly decimos = signal(10);
  protected readonly escolhida = signal(0);

  protected readonly mols = computed(() => this.decimos() / 10);

  protected readonly substancia = computed(() => SUBSTANCIAS[this.escolhida()] ?? SUBSTANCIAS[0]!);

  protected readonly molar = computed(() => massaMolar(this.substancia().partes));

  protected readonly massa = computed(() => this.mols() * this.molar());

  /** O coeficiente da notação científica; a potência é 10²³. */
  protected readonly particulas = computed(() => (this.mols() * AVOGADRO) / 1e23);

  protected readonly formulaTex = computed(
    () => `n = ${this.mols()}\;\\text{mol de } \\text{${this.substancia().formula}}`,
  );

  protected escolher(indice: number): void {
    this.escolhida.set(indice);
  }

  protected arredondar(valor: number): string {
    return valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
}
