import { Injectable, computed, signal } from '@angular/core';
import { I18nService } from '@core/i18n/services/i18n.service';
import { Idioma } from '@core/i18n/models/i18n.model';

/** Entrada no dicionário de traduções do motor matemático. */
interface EntradaTraducao {
  readonly pt: string;
  readonly fr?: string;
  readonly en?: string;
}

/** Dicionário: chave → entrada trilingue. */
type DicionarioMatematico = Readonly<Record<string, EntradaTraducao>>;

/**
 * Traduz os textos do motor matemático conforme o idioma da interface.
 *
 * O dicionário foi gerado automaticamente a partir de todas as strings
 * encontradas nos arquivos do motor (`descricao` e `nota` de cada `Passo`).
 * Cada string recebeu uma chave única (`math.NNNN`) e foi traduzida para
 * francês e inglês. As strings com templates (`${...}`) receberam
 * tradução literal (mesmo texto) — elas serão ajustadas manualmente depois.
 *
 * O serviço é injetado pelo `PassoAPasso` para traduzir cada passo
 * antes de exibir. Se uma chave não for encontrada (ex: strings novas),
 * o português é usado como fallback — nenhum texto fica em branco.
 */
@Injectable({ providedIn: 'root' })
export class MathTranslationsService {
  private readonly dicionario = signal<DicionarioMatematico>({});

  constructor(private i18n: I18nService) {
    this.carregar();
  }

  /** Carrega o dicionário de traduções (lazy import). */
  private async carregar(): Promise<void> {
    try {
      const mod = await import('./math-translations.json');
      // Angular/ESM pode envolver o JSON em `default`; trate ambos os casos.
      const raw = (mod as unknown as { default: DicionarioMatematico }).default ?? mod;
      this.dicionario.set(raw);
    } catch {
      // Falha no carregamento: o dicionário fica vazio e o fallback é o pt.
    }
  }

  /**
   * Retorna a tradução da string em português no idioma atual.
   *
   * A string é procurada exata no dicionário. Se não for encontrada,
   * o próprio texto em português é devolvido como fallback.
   */
  traduzir(textoPT: string): string {
    const idioma = this.i18n.idioma();

    // Busca direta pela string exata
    const entrada = this.buscarPorValor(textoPT);

    if (entrada) {
      return (entrada[idioma] as string | undefined) ?? entrada.pt;
    }

    // Fallback: retorna o texto original (português)
    return textoPT;
  }

  /** Encontra a entrada cujo valor em pt corresponde a `valor`. */
  private buscarPorValor(valor: string): EntradaTraducao | null {
    const dict = this.dicionario();

    for (const entrada of Object.values(dict)) {
      if (entrada.pt === valor) {
        return entrada;
      }
    }

    return null;
  }
}
