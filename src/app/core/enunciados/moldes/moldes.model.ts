import { Idioma } from '@core/i18n/models/i18n.model';
import { vestirTexto } from '@core/enunciados/models/enunciado.model';
import moldes from '@core/enunciados/moldes/moldes.json';

/**
 * Os MOLDES de enunciado: o texto fora do código.
 *
 * O banco de `enunciados.json` guarda perguntas prontas, com os números já
 * escritos. Isto aqui é a outra metade: o texto das perguntas que o gerador
 * monta, com os números sorteados a cada exercício. «{dados-calculo.a} kg de
 * farinha custam R$ {dados-calculo.b}» é molde; o gerador sorteia `a` e `b`,
 * calcula a resposta e pede o texto.
 *
 * ## Por que tirar o texto do gerador
 *
 * Cada gerador trazia as suas frases em três línguas como funções de template
 * — quarenta e seis delas só em Razão e proporção —, e mexer numa palavra
 * exigia abrir um arquivo de novecentas linhas de TypeScript, achar a função
 * certa entre as contas e as armadilhas, e compilar. O texto é conteúdo: quem
 * estuda tem de poder reescrevê-lo sem tocar na matemática, e é isso que um
 * arquivo JSON dá.
 *
 * O que FICA no gerador é o que não é texto: o sorteio dos números, a conta, a
 * resolução passo a passo, as armadilhas e os diagnósticos — que dependem de
 * saber qual erro produz qual número.
 *
 * ## A `forma`
 *
 * Um molde pode não ter lacuna nenhuma: «Calcule e escreva o resultado na forma
 * mais simples» é pergunta inteira, e o lugar dela é aqui também — o critério
 * é o texto estar fora do código, não ele ter números.
 *
 * Um tópico tem várias formas de pergunta — `direta`, `inversa`, `unitaria` —,
 * e cada uma tem vários moldes, que o gerador sorteia. A forma é o que liga o
 * molde ao ramo do código que sabe calcular aquela pergunta: trocar o texto de
 * um molde é livre, mudar a sua forma muda a conta que o responde.
 */

/** Um molde, exatamente como ele é escrito no arquivo. */
export interface MoldeDeEnunciado {
  /** O identificador do tópico, como ele aparece no currículo. */
  readonly topico: string;
  /** Qual pergunta este molde faz. O gerador escolhe os moldes por aqui. */
  readonly forma: string;
  /**
   * O texto. `br` é o português e é obrigatório; `fr` e `en` são opcionais.
   *
   * Opcionais porque 110 dos 122 geradores do site nunca tiveram tradução de
   * enunciado — o texto deles existia só em português, dentro do `.ts`. Exigir
   * as três línguas aqui significaria traduzir novecentas frases antes de
   * poder mover qualquer uma, e o texto continuaria preso ao código enquanto
   * isso. Sem o campo, a tela cai no português, que é exatamente o que ela já
   * fazia; com ele, passa a traduzir — e traduzir vira preencher um campo
   * neste arquivo, não editar um gerador.
   */
  readonly texto: {
    readonly br: string;
    readonly fr?: string;
    readonly en?: string;
  };
}

const TODOS = moldes as unknown as readonly MoldeDeEnunciado[];

/** Tudo o que está no arquivo, para os guardas conferirem. */
export function todosOsMoldes(): readonly MoldeDeEnunciado[] {
  return TODOS;
}

/**
 * Os moldes de uma forma de pergunta, na ordem do arquivo.
 *
 * A ordem importa: o gerador sorteia por índice com o `rng` da sessão, e
 * mover uma linha do arquivo muda qual exercício sai de uma semente. É por
 * isso que acrescentar um molde no FIM é sempre seguro.
 */
export function moldesDe(topico: string, forma: string): readonly MoldeDeEnunciado[] {
  const achados = TODOS.filter((molde) => molde.topico === topico && molde.forma === forma);

  if (achados.length === 0) {
    // Um molde que falta não pode virar enunciado vazio na tela: é defeito de
    // arquivo, e tem de aparecer como defeito.
    throw new Error(`Sem molde de enunciado para ${topico} / ${forma}`);
  }

  return achados;
}

/**
 * O texto do molde com os números no lugar, no idioma pedido.
 *
 * Os números passam por `numeroEscrito`, como no resto do site: o separador
 * decimal é do idioma, e «7.5» aparece como «7,5» em português e «7.5» em
 * inglês.
 */
export function textoDoMolde(
  molde: MoldeDeEnunciado,
  valores: Readonly<Record<string, number | string>>,
  idioma: Idioma,
): string {
  const comoTexto = Object.fromEntries(
    Object.entries(valores).map(([nome, valor]) => [nome, String(valor)]),
  );

  // Sem tradução, o português responde: é o que a tela já mostrava antes de o
  // texto sair do gerador, e meia tradução é pior que nenhuma.
  const escrito = idioma === 'pt' ? molde.texto.br : (molde.texto[idioma] ?? molde.texto.br);

  return vestirTexto(escrito, comoTexto, idioma);
}

/** O texto nas três línguas de uma vez, que é o formato que o exercício usa. */
export function textosDoMolde(
  molde: MoldeDeEnunciado,
  valores: Readonly<Record<string, number | string>>,
): { readonly pt: string; readonly fr: string; readonly en: string } {
  return {
    pt: textoDoMolde(molde, valores, 'pt'),
    fr: textoDoMolde(molde, valores, 'fr'),
    en: textoDoMolde(molde, valores, 'en'),
  };
}
