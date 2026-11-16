import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { I18nService } from '@core/i18n/services/i18n.service';
import {
  normalizarTexto,
  numerosDe,
  vestirCuringas,
} from '@core/math/translations/texto-normalizado';

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
 * O dicionário é `texto em português com os números trocados por # → {fr, en}`.
 * A normalização existe porque estas frases carregam os dados: «Substituímos x
 * por 3 em cada termo» tem uma variante por valor de x, e indexar pelo texto
 * literal exigiria uma entrada por variante. Com o curinga, uma entrada cobre
 * todas — e a tradução devolve os números do texto original nos lugares certos.
 *
 * A mesma tabela serve às descrições de passo, às notas, às dicas e aos
 * diagnósticos de erro: os quatro são texto corrido em português, e os quatro
 * aparecem na tela.
 *
 * A tradução é O(1): normalizar a frase é uma passada de regex, e a busca é um
 * acesso a objeto. Quando a frase não está no dicionário — porque o gerador
 * mudou depois —, o texto em português volta como rede de segurança: uma frase
 * na língua errada atrapalha menos que uma tela vazia. O guarda
 * `traducoes-de-resolucao.spec.ts` mede o que ainda falta e reprova quando a
 * cobertura cai.
 *
 * O dicionário é baixado só quando alguém estuda em francês ou inglês: são
 * centenas de kB, e quem estuda em português nunca os consulta.
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
    return this.traduzirCom(this.dicionario(), textoPT, this.i18n.idioma());
  }

  /**
   * A tradução de um texto, dado o dicionário e o idioma.
   *
   * Separado do `traduzir` para o guarda poder exercitar a MESMA lógica sem
   * passar pelo Angular: um teste que reimplementasse a busca estaria medindo a
   * reimplementação, não o serviço.
   */
  traduzirCom(dicionario: Dicionario, textoPT: string, idioma: string): string {
    const traducao = dicionario[normalizarTexto(textoPT)]?.[idioma as 'fr' | 'en'];

    // Sem entrada, o português volta: é a rede de segurança de sempre. Uma
    // entrada igual ao português também não serve — seria tradução de fachada.
    if (traducao === undefined || traducao === textoPT) {
      return textoPT;
    }

    return vestirCuringas(traducao, numerosDe(textoPT));
  }

  /** Exporta o dicionário carregado — o guarda usa isto para medir cobertura. */
  dicionarioCarregado(): Dicionario {
    return this.dicionario();
  }
}
