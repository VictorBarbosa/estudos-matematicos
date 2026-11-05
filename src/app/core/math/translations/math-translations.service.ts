import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { I18nService } from '@core/i18n/services/i18n.service';

/**
 * Entrada no dicionário de traduções do motor matemático.
 *
 * O português não entra: ele É a chave. A assinatura de índice é o que
 * permite buscar pelo idioma da vez sem um `switch`.
 */
interface EntradaTraducao {
  readonly [idioma: string]: string | undefined;
  readonly fr: string;
  readonly en: string;
}

/**
 * Traduz os textos do motor matemático conforme o idioma da interface.
 *
 * O dicionário é um mapeamento direto: string em português → {fr, en}.
 * Cada string do motor (`descricao` e `nota` de cada `Passo`) foi extraída
 * e traduzida manualmente para francês e inglês. Strings com templates
 * (`${...}`) receberam tradução literal (mesmo texto em todas as línguas)
 * — elas serão ajustadas conforme necessidade.
 *
 * A tradução é O(1) por chamada: o dicionário é um objeto normal onde
 * cada string em português é uma chave. Se uma string não for encontrada
 * (ex: strings novas adicionadas depois da geração), o próprio texto em
 * português é devolvido como fallback.
 *
 * O serviço é injetado pelo `PassoAPasso` para traduzir cada passo
 * antes de exibir. Nenhum texto fica em branco — o português sempre
 * serve como rede de segurança.
 */
type Dicionario = Readonly<Record<string, EntradaTraducao>>;

@Injectable({ providedIn: 'root' })
export class MathTranslationsService {
  private readonly i18n = inject(I18nService);

  private readonly dicionario = signal<Dicionario>({});
  private pedido = false;

  /** Em português o dicionário não serve para nada: ele nem é baixado. */
  private readonly precisa = computed(() => this.i18n.idioma() !== 'pt');

  constructor() {
    /*
     * São 216 kB de dicionário, maiores que o resto da aplicação somado.
     * Importá-lo de cima estourava o orçamento do pacote inicial e fazia todo
     * aluno baixá-lo — inclusive os que estudam em português, que nunca o
     * consultam. Ele chega depois, e enquanto não chega o passo aparece em
     * português, que é a mesma rede de segurança de sempre.
     */
    effect(() => {
      if (!this.precisa() || this.pedido) {
        return;
      }
      this.pedido = true;
      void import('@core/math/translations/math-translations.json').then((modulo) => {
        this.dicionario.set(modulo.default as Dicionario);
      });
    });
  }

  /**
   * Retorna a tradução da string em português no idioma atual.
   *
   * A string é procurada exata no dicionário. Se não for encontrada — ou se o
   * dicionário ainda estiver a caminho —, o próprio texto em português é
   * devolvido como fallback.
   */
  traduzir(textoPT: string): string {
    const idioma = this.i18n.idioma();
    return this.dicionario()[textoPT]?.[idioma] ?? textoPT;
  }
}
