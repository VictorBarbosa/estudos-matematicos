import { Idioma } from '@core/i18n/models/i18n.model';
import {
  EnunciadoDoBanco,
  ehPerguntaPronta,
  todasAsEntradas,
  vestirTexto,
} from '@core/enunciados/models/enunciado.model';

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

/**
 * Um molde é uma entrada do arquivo que tem `forma` e não tem `dados-calculo`.
 *
 * O tipo é o mesmo do banco de propósito: o arquivo é um só, e a diferença
 * entre uma pergunta pronta e um molde está no que a entrada traz, não em
 * onde ela mora.
 */
export type MoldeDeEnunciado = EnunciadoDoBanco & {
  readonly forma: string;
};

const TODOS = todasAsEntradas().filter(
  (entrada): entrada is MoldeDeEnunciado =>
    entrada.forma !== undefined && !ehPerguntaPronta(entrada),
);

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
  const escrito =
    idioma === 'pt' ? molde.enunciado.br : (molde.enunciado[idioma] ?? molde.enunciado.br);

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
