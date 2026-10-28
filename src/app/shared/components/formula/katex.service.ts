import { Injectable } from '@angular/core';

type Katex = typeof import('katex').default;

/**
 * Carrega o KaTeX sob demanda e renderiza LaTeX para HTML.
 *
 * O import dinâmico mantém a biblioteca fora do bundle inicial: ela só é
 * baixada quando a primeira fórmula da sessão aparece na tela. A promessa é
 * memorizada, então o download acontece uma única vez por sessão.
 */
@Injectable({ providedIn: 'root' })
export class KatexService {
  private modulo?: Promise<Katex>;

  async renderizar(tex: string, bloco: boolean): Promise<string> {
    const katex = await this.carregar();

    // `throwOnError: false` faz o KaTeX desenhar a expressão problemática em
    // vermelho em vez de derrubar a tela — preferível num app de estudo.
    return katex.renderToString(tex, {
      displayMode: bloco,
      throwOnError: false,
      strict: false,
    });
  }

  private carregar(): Promise<Katex> {
    this.modulo ??= import('katex').then((m) => m.default);
    return this.modulo;
  }
}
