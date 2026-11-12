import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { I18nService } from '@core/i18n/services/i18n.service';
import { inject } from '@angular/core';
import {
  Arvore,
  Caminho,
  filhosDe,
  paraTexto,
  precisaParenteses,
  produtoImplicito,
  textoDoNumero,
} from '@core/rascunho/models/peca/peca';

/** Como cada operador se desenha. */
const SINAL: Record<string, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' };

/**
 * A conta desenhada, peça por peça, com cada uma tocável.
 *
 * O desenho é nosso e não do KaTeX, e a razão é o dedo: o KaTeX devolve HTML
 * sem alças nossas — `formula.html` o injeta com `innerHTML` —, e aqui cada
 * peça precisa ser um alvo de toque. Em troca, a notação é aproximada: o
 * alinhamento pelo eixo da fração vale num nível e se afasta quando há fração
 * ao lado de fração. É rascunho, não livro.
 *
 * **Nada encolhe com a profundidade.** A tipografia mandaria reduzir cada nível
 * — é o que o KaTeX faz —, mas três níveis a 70% levam a peça a 5 px, e 5 px
 * nenhum polegar acerta. Toda peça tem o mesmo corpo em qualquer nível, e o
 * aninhamento tem teto (ver `LIMITE_DE_FRACOES`).
 *
 * **Quem se toca, em cada estrutura, é o sinal.** Botão dentro de botão não
 * existe em HTML, então a operação se seleciona pelo seu operador, a fração
 * pela barra e a igualdade pelo `=`. O produto implícito — `2x`, que não tem
 * sinal desenhado — é o caso que sobra, e é para ele que serve o `⬆` da
 * bandeja.
 */
@Component({
  selector: 'app-rascunho-tabuleiro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  templateUrl: './rascunho-tabuleiro.html',
  styleUrl: './rascunho-tabuleiro.scss',
})
export class RascunhoTabuleiro {
  readonly arvore = input.required<Arvore>();
  readonly selecao = input<Caminho | null>(null);

  readonly escolher = output<Caminho>();

  protected readonly i18n = inject(I18nService);

  /** A seleção como texto, para comparar sem criar array a cada verificação. */
  protected readonly selecionada = computed(() => {
    const caminho = this.selecao();

    return caminho === null ? null : caminho.join('.');
  });

  /** A conta inteira, falada — é o que `role="math"` anuncia. */
  protected readonly rotuloDaConta = computed(() => paraTexto(this.arvore()));

  protected ehSelecionada(caminho: Caminho): boolean {
    return this.selecionada() === caminho.join('.');
  }

  protected filho(caminho: Caminho, indice: number): Caminho {
    return [...caminho, indice];
  }

  protected filhos(no: Arvore): readonly Arvore[] {
    return filhosDe(no);
  }

  protected sinalDe(operador: string): string {
    return SINAL[operador] ?? operador;
  }

  protected numero(no: Arvore): string {
    return no.tipo === 'numero' ? textoDoNumero(no) : '';
  }

  protected implicito(no: Arvore): boolean {
    return produtoImplicito(no);
  }

  protected comParenteses(pai: Arvore, indice: number): boolean {
    const filho = filhosDe(pai)[indice];

    return filho === undefined ? false : precisaParenteses(pai, filho, indice === 1);
  }

  /**
   * O rótulo falado de uma peça.
   *
   * Uma árvore tocável sem isto é ilegível para quem usa leitor de tela — e o
   * padrão da casa é alto: a barra de fração didática já descreve o que mostra.
   * O rótulo diz o papel da peça e o que há dentro dela.
   */
  protected rotulo(no: Arvore, papel: string): string {
    const conteudo = no.tipo === 'buraco' ? this.i18n.t('rascunho.buraco') : paraTexto(no);

    return `${this.i18n.t(papel)}: ${conteudo}`;
  }

  protected aoEscolher(caminho: Caminho): void {
    this.escolher.emit(caminho);
  }
}
