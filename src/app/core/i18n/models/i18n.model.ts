/**
 * Tradução da interface.
 *
 * O projeto nasceu em português, mas existe para preparar um ingresso em
 * engenharia no Québec — e lá a graduação é em francês (Polytechnique, ÉTS,
 * Sherbrooke, Laval) ou em inglês (Concordia, McGill). O glossário trilíngue
 * já cuidava do vocabulário matemático; isto cuida do resto da tela, para que
 * seja possível estudar inteiramente na língua da prova.
 *
 * O dicionário é um JSON plano de chaves pontuadas. Plano de propósito: a
 * trava que compara os três idiomas fica trivial, e um tradutor consegue abrir
 * o arquivo sem saber TypeScript.
 */

export type Idioma = 'pt' | 'fr' | 'en';

export const IDIOMAS: readonly Idioma[] = ['pt', 'fr', 'en'];

export const IDIOMA_PADRAO: Idioma = 'pt';

/** Como cada idioma se chama na própria língua. */
export const NOME_DO_IDIOMA: Readonly<Record<Idioma, string>> = {
  pt: 'Português',
  fr: 'Français',
  en: 'English',
};

/** A etiqueta curta do seletor, para caber no cabeçalho. */
export const SIGLA_DO_IDIOMA: Readonly<Record<Idioma, string>> = {
  pt: 'PT',
  fr: 'FR',
  en: 'EN',
};

/** O código de idioma que vai para o atributo `lang` do documento. */
export const LOCALE_DO_IDIOMA: Readonly<Record<Idioma, string>> = {
  pt: 'pt-BR',
  fr: 'fr-CA',
  en: 'en-CA',
};

export type Dicionario = Readonly<Record<string, string>>;

export function ehIdioma(valor: unknown): valor is Idioma {
  return typeof valor === 'string' && (IDIOMAS as readonly string[]).includes(valor);
}

/**
 * Substitui os marcadores `{nome}` pelos valores dados.
 *
 * Os marcadores existem porque a ordem das palavras muda entre as línguas:
 * concatenar pedaços no template produziria frases certas em português e
 * tortas em francês. Com a frase inteira no dicionário, cada idioma a escreve
 * à sua maneira.
 */
export function preencher(
  modelo: string,
  valores: Readonly<Record<string, string | number>> = {},
): string {
  return modelo.replace(/\{(\w+)\}/g, (inteiro, nome: string) => {
    const valor = valores[nome];
    return valor === undefined ? inteiro : String(valor);
  });
}

/**
 * A tradução de uma chave, com o português como rede de segurança.
 *
 * Uma chave que falte num idioma cai no português em vez de sumir da tela —
 * uma frase na língua errada atrapalha menos que um espaço em branco. A trava
 * de testes impede que isso aconteça em produção, mas o comportamento precisa
 * ser definido de qualquer forma.
 */
export function traduzir(
  dicionario: Dicionario,
  reserva: Dicionario,
  chave: string,
  valores?: Readonly<Record<string, string | number>>,
): string {
  const modelo = dicionario[chave] ?? reserva[chave];
  return modelo === undefined ? chave : preencher(modelo, valores);
}
