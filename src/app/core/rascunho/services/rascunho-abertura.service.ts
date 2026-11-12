import { Injectable, signal } from '@angular/core';

/**
 * Só isto: a gaveta do monta monta está aberta?
 *
 * Existe para manter o resto fora do pacote inicial. O cabeçalho precisa saber
 * se a gaveta está aberta — para o botão e para o `@defer` —, e se ele
 * perguntasse isso ao `RascunhoService` traria junto a árvore de peças, as três
 * ações, a pilha de linhas e a guarda do disco: quase 13 kB que todo visitante
 * baixaria, inclusive quem está no computador e nunca verá a ferramenta.
 *
 * Com a pergunta separada, o `RascunhoService` nasce quando a gaveta abre pela
 * primeira vez. Ele é de raiz, então o que foi montado sobrevive a fechar e
 * reabrir — e o que foi montado também está no disco, de todo modo.
 *
 * A medida importa mais aqui que em qualquer outra ferramenta do site: esta é a
 * que existe para o ônibus e o avião, onde a rede é ruim ou não há rede.
 */
@Injectable({ providedIn: 'root' })
export class RascunhoAberturaService {
  private readonly estado = signal(false);

  readonly aberto = this.estado.asReadonly();

  alternar(): void {
    this.estado.update((aberto) => !aberto);
  }

  fechar(): void {
    this.estado.set(false);
  }
}
