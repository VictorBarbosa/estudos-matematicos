import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { balancear, contarAtomos, equacaoQuimicaParaTex } from '@core/math';
import { I18nService } from '@core/i18n/services/i18n.service';
import { textoLocal } from '@core/i18n/textos-locais';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { Formula } from '@shared/components/formula/formula';
import textos from '@features/quimica/equacoes-e-balanceamento/equacoes-e-balanceamento.i18n.json';
import { geradorBalanceamento } from '@features/quimica/equacoes-e-balanceamento/equacoes-e-balanceamento.gerador';
import { TEORIA_BALANCEAMENTO } from '@features/quimica/equacoes-e-balanceamento/equacoes-e-balanceamento.teoria';

/** As reações da aba Explorar, cruas: é o balanceamento que se mostra. */
const REACOES = [
  { rotulo: 'H₂ + O₂', reagentes: ['H2', 'O2'], produtos: ['H2O'] },
  { rotulo: 'CH₄ + O₂', reagentes: ['CH4', 'O2'], produtos: ['CO2', 'H2O'] },
  { rotulo: 'C₃H₈ + O₂', reagentes: ['C3H8', 'O2'], produtos: ['CO2', 'H2O'] },
  { rotulo: 'Fe + O₂', reagentes: ['Fe', 'O2'], produtos: ['Fe2O3'] },
  { rotulo: 'Al + HCl', reagentes: ['Al', 'HCl'], produtos: ['AlCl3', 'H2'] },
  { rotulo: 'NaHCO₃', reagentes: ['NaHCO3'], produtos: ['Na2CO3', 'H2O', 'CO2'] },
] as const;

/**
 * Equações e balanceamento — a aba Explorar.
 *
 * A equação aparece duas vezes: crua e balanceada. Embaixo, a contagem de
 * átomos de cada elemento nos dois lados, lado a lado — que é a prova do
 * balanceamento e, mais importante, o que o aluno tem de aprender a fazer
 * sozinho para conferir a própria resposta sem gabarito.
 */
@Component({
  selector: 'app-equacoes-e-balanceamento',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, Formula, TopicoLayout],
  templateUrl: './equacoes-e-balanceamento.html',
  styleUrl: './equacoes-e-balanceamento.scss',
})
export class EquacoesEBalanceamento {
  protected readonly i18n = inject(I18nService);
  protected readonly texto = textoLocal(textos);
  protected readonly gerador = geradorBalanceamento;
  protected readonly conceitos = TEORIA_BALANCEAMENTO.map((teoria) => teoria.id);
  protected readonly reacoes = REACOES;

  protected readonly escolhida = signal(0);

  protected readonly reacao = computed(() => REACOES[this.escolhida()] ?? REACOES[0]!);

  protected readonly coeficientes = computed(
    () => balancear(this.reacao().reagentes, this.reacao().produtos) ?? [],
  );

  protected readonly texCrua = computed(() =>
    equacaoQuimicaParaTex(this.reacao().reagentes, this.reacao().produtos),
  );

  protected readonly texBalanceada = computed(() =>
    equacaoQuimicaParaTex(this.reacao().reagentes, this.reacao().produtos, this.coeficientes()),
  );

  protected readonly soma = computed(() =>
    this.coeficientes().reduce((total, valor) => total + valor, 0),
  );

  protected readonly contagem = computed(() => {
    const { reagentes, produtos } = this.reacao();
    const coeficientes = this.coeficientes();

    const esquerda = contarAtomos(reagentes, coeficientes.slice(0, reagentes.length));
    const direita = contarAtomos(produtos, coeficientes.slice(reagentes.length));

    return [...esquerda].map(([simbolo, quantidade]) => ({
      simbolo,
      esquerda: quantidade,
      direita: direita.get(simbolo) ?? 0,
    }));
  });

  protected escolher(indice: number): void {
    this.escolhida.set(indice);
  }
}
