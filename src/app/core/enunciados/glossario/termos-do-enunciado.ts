import { Idioma } from '@core/i18n/models/i18n.model';
import TERMOS from '@core/enunciados/glossario/termos-do-enunciado.json';

/**
 * As palavras do enunciado que valem uma explicação ao lado.
 *
 * «Qual é a abscissa do vértice desta parábola?» é uma pergunta que o aluno
 * não responde por não saber o que é abscissa — e não por não saber a conta.
 * Mandar procurar no glossário é mandar sair do exercício; a explicação tem de
 * estar ali, ao alcance do cursor.
 *
 * O arquivo é JSON e traz o termo e a definição NAS TRÊS LÍNGUAS, porque a
 * palavra a reconhecer na tela francesa é «abscisse», não «abscissa».
 */
export interface TermoExplicado {
  readonly termo: string;
  readonly definicao: string;
}

type Catalogo = Readonly<Record<string, Readonly<Record<Idioma, TermoExplicado>>>>;

const CATALOGO = TERMOS as Catalogo;

/** Todos os termos, para os guardas conferirem. */
export function todosOsTermos(): Catalogo {
  return CATALOGO;
}

/** Sem acento e em minúsculas: é assim que o texto da tela é comparado. */
function achatar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * Os termos de um idioma, do mais longo para o mais curto.
 *
 * A ordem importa: «coeficiente angular» tem de ser reconhecido inteiro, antes
 * que «coeficiente» sozinho — se houvesse — tome a primeira palavra e deixe a
 * segunda solta.
 */
function termosDoIdioma(idioma: Idioma): readonly TermoExplicado[] {
  return Object.values(CATALOGO)
    .map((porIdioma) => porIdioma[idioma])
    .filter((termo): termo is TermoExplicado => termo !== undefined)
    .sort((a, b) => b.termo.length - a.termo.length);
}

/** Um pedaço do texto: palavra comum, ou termo com explicação. */
export interface PedacoDeTexto {
  readonly valor: string;
  /** A explicação, quando este pedaço é um termo do glossário. */
  readonly definicao?: string;
}

/**
 * Parte o texto nos termos que o glossário explica.
 *
 * Só reconhece a palavra INTEIRA — «raiz» não casa dentro de «raízes» nem de
 * «raiz quadrada» —, e cada termo é marcado uma vez por frase: sublinhar a
 * mesma palavra quatro vezes vira ruído, e a explicação é a mesma.
 */
export function pedacosComTermos(texto: string, idioma: Idioma): readonly PedacoDeTexto[] {
  const achatado = achatar(texto);
  const usados = new Set<string>();
  const marcas: { readonly inicio: number; readonly fim: number; readonly definicao: string }[] =
    [];

  const letra = /[a-z0-9]/;

  for (const termo of termosDoIdioma(idioma)) {
    const alvo = achatar(termo.termo);
    if (usados.has(alvo)) {
      continue;
    }

    /*
     * Procura em TODAS as ocorrências, não só na primeira.
     *
     * «As raízes e a raiz quadrada» tem «raiz» dentro de «raízes» logo no
     * começo: parar ali deixaria a palavra de verdade, mais adiante, sem
     * explicação.
     */
    for (
      let inicio = achatado.indexOf(alvo);
      inicio >= 0;
      inicio = achatado.indexOf(alvo, inicio + 1)
    ) {
      const fim = inicio + alvo.length;

      // Palavra inteira: o que vem antes e depois não pode ser letra.
      const antes = achatado[inicio - 1];
      const depois = achatado[fim];
      if (
        (antes !== undefined && letra.test(antes)) ||
        (depois !== undefined && letra.test(depois))
      ) {
        continue;
      }

      // Não marca dentro de um termo já marcado.
      if (marcas.some((marca) => inicio < marca.fim && fim > marca.inicio)) {
        continue;
      }

      usados.add(alvo);
      marcas.push({ inicio, fim, definicao: termo.definicao });
      break;
    }
  }

  if (marcas.length === 0) {
    return [{ valor: texto }];
  }

  const ordenadas = [...marcas].sort((a, b) => a.inicio - b.inicio);
  const pedacos: PedacoDeTexto[] = [];
  let cursor = 0;

  for (const marca of ordenadas) {
    if (marca.inicio > cursor) {
      pedacos.push({ valor: texto.slice(cursor, marca.inicio) });
    }
    pedacos.push({ valor: texto.slice(marca.inicio, marca.fim), definicao: marca.definicao });
    cursor = marca.fim;
  }

  if (cursor < texto.length) {
    pedacos.push({ valor: texto.slice(cursor) });
  }

  return pedacos;
}
