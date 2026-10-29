import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NOME_PRODUTO, TipoProdutoNotavel, enunciadoParaTex, expandirComPassos } from '@core/math';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TopicoLayout } from '@layout/topico-layout/topico-layout';
import { AreaTreino } from '@shared/components/area-treino/area-treino';
import { ConceitosTopico } from '@shared/components/conceitos-topico/conceitos-topico';
import { ControleParametro } from '@shared/components/controle-parametro/controle-parametro';
import { Formula } from '@shared/components/formula/formula';
import { PassoAPasso } from '@shared/components/passo-a-passo/passo-a-passo';
import { TIPOS_DISPONIVEIS, geradorProdutos } from '@features/algebra/produtos-notaveis/produtos-notaveis.gerador';
import { TEORIA_PRODUTOS } from '@features/algebra/produtos-notaveis/produtos-notaveis.teoria';

@Component({
  selector: 'app-produtos-notaveis',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AreaTreino, ConceitosTopico, ControleParametro, Formula, PassoAPasso, TopicoLayout],
  templateUrl: './produtos-notaveis.html',
  styleUrl: './produtos-notaveis.scss',
})
export class ProdutosNotaveis {
  protected readonly gerador = geradorProdutos;
  protected readonly conceitos = TEORIA_PRODUTOS.map((teoria) => teoria.id);
  protected readonly tipos = TIPOS_DISPONIVEIS;
  protected readonly nomeDoTipo = NOME_PRODUTO;

  protected readonly tipo = signal<TipoProdutoNotavel>('quadrado-da-soma');
  protected readonly a = signal(2);
  protected readonly b = signal(3);

  /** A diferença exige b negativo para que a identidade seja a correta. */
  private readonly bEfetivo = computed(() =>
    this.tipo() === 'quadrado-da-diferenca' ? -Math.abs(this.b()) : Math.abs(this.b()),
  );

  protected readonly resolucao = computed(() =>
    expandirComPassos(this.tipo(), this.a(), this.bEfetivo()),
  );

  protected readonly enunciado = computed(() =>
    enunciadoParaTex(this.tipo(), this.a(), this.bEfetivo()),
  );

  protected readonly expandido = computed(() => this.resolucao().resultado);

  /** O erro clássico, mostrado lado a lado com o resultado correto. */
  protected readonly ingenuo = computed(() => {
    const a = this.a();
    const b = Math.abs(this.b());

    if (this.tipo() === 'quadrado-da-soma' || this.tipo() === 'quadrado-da-diferenca') {
      return `${a * a}x^{2} + ${b * b}`;
    }
    return null;
  });

  protected readonly termoDoMeio = computed(() => this.expandido().coeficiente(1));

  /** As dimensões do quadrado geométrico que ilustra a identidade. */
  protected readonly areas = computed(() => {
    const a = this.a();
    const b = Math.abs(this.b());
    const total = a + b;

    return {
      a,
      b,
      total,
      proporcaoA: (a / total) * 100,
      proporcaoB: (b / total) * 100,
    };
  });

  protected readonly mostraGeometria = computed(
    () => this.tipo() === 'quadrado-da-soma' || this.tipo() === 'quadrado-da-diferenca',
  );

  constructor() {
    inject(TeoriaService).registrar(TEORIA_PRODUTOS);
  }

  protected definirTipo(tipo: TipoProdutoNotavel): void {
    this.tipo.set(tipo);
  }
}
