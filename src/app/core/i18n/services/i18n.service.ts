import { Injectable, computed, effect, signal } from '@angular/core';
import {
  Dicionario,
  DicionarioBruto,
  IDIOMA_PADRAO,
  Idioma,
  LOCALE_DO_IDIOMA,
  achatar,
  ehIdioma,
  traduzir,
} from '@core/i18n/models/i18n.model';
import pt from '@core/i18n/dicionarios/pt.json';

const CHAVE = 'estudos-matematicos.idioma';

/** O português vem junto do pacote; os outros dois chegam sob demanda. */
const PORTUGUES = achatar(pt as DicionarioBruto);

const CARREGADORES: Readonly<Record<Idioma, () => Promise<Dicionario>>> = {
  pt: async () => PORTUGUES,
  fr: async () =>
    achatar((await import('@core/i18n/dicionarios/fr.json')).default as DicionarioBruto),
  en: async () =>
    achatar((await import('@core/i18n/dicionarios/en.json')).default as DicionarioBruto),
};

/**
 * O idioma da interface.
 *
 * O português é empacotado junto e os outros dois são baixados quando
 * escolhidos: três dicionários no pacote inicial seriam peso morto para quem
 * nunca troca de língua, e quem troca espera um instante uma vez só.
 *
 * Enquanto o dicionário novo não chega, a tela continua em português em vez de
 * piscar vazia — trocar de idioma não deve parecer um erro de carregamento.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly dicionarios = signal<Partial<Record<Idioma, Dicionario>>>({ pt: PORTUGUES });

  readonly idioma = signal<Idioma>(carregarEscolha());

  /** O dicionário em vigor, ou o português enquanto o escolhido não chegou. */
  private readonly ativo = computed<Dicionario>(
    () => this.dicionarios()[this.idioma()] ?? PORTUGUES,
  );

  /** O idioma escolhido já está carregado? */
  readonly carregado = computed(() => this.dicionarios()[this.idioma()] !== undefined);

  constructor() {
    effect(() => {
      const idioma = this.idioma();

      document.documentElement.setAttribute('lang', LOCALE_DO_IDIOMA[idioma]);

      try {
        localStorage.setItem(CHAVE, idioma);
      } catch {
        // Sem armazenamento, a escolha vale apenas para esta sessão.
      }

      if (this.dicionarios()[idioma] === undefined) {
        void this.buscar(idioma);
      }
    });
  }

  /** Traduz uma chave, preenchendo os marcadores `{nome}` que ela tiver. */
  t(chave: string, valores?: Readonly<Record<string, string | number>>): string {
    return traduzir(this.ativo(), PORTUGUES, chave, valores);
  }

  definir(idioma: Idioma): void {
    this.idioma.set(idioma);
  }

  /**
   * O título e a descrição de uma área ou de um tópico do currículo.
   *
   * O `curriculo.ts` continua sendo a fonte da ordem, dos identificadores e do
   * texto em português; o dicionário guarda as outras duas línguas. Assim não
   * há duas listas de tópicos para manter em sincronia — há uma, e traduções
   * ao lado dela.
   */
  tituloDaArea(id: string): string {
    return this.t(`curriculo.area.${id}.titulo`);
  }

  descricaoDaArea(id: string): string {
    return this.t(`curriculo.area.${id}.descricao`);
  }

  tituloDoTopico(id: string): string {
    return this.t(`curriculo.topico.${id}.titulo`);
  }

  descricaoDoTopico(id: string): string {
    return this.t(`curriculo.topico.${id}.descricao`);
  }

  private async buscar(idioma: Idioma): Promise<void> {
    try {
      const dicionario = await CARREGADORES[idioma]();
      this.dicionarios.update((atuais) => ({ ...atuais, [idioma]: dicionario }));
    } catch {
      // Falhou o download: a tela segue em português, que já está em memória.
    }
  }
}

function carregarEscolha(): Idioma {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (ehIdioma(salvo)) {
      return salvo;
    }
  } catch {
    // Ignora e cai no padrão.
  }

  return IDIOMA_PADRAO;
}
