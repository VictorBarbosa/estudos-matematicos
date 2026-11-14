import { Idioma } from '@core/i18n/models/i18n.model';
import { ModeloDeProblema } from '@core/problemas/validacao/validar-modelo';
import { numeroEscrito } from '@core/treino/textos/numero-escrito';

/**
 * Troca as lacunas pelos números do exercício.
 *
 * É aqui que a história genérica vira o enunciado daquele exercício. A troca
 * passa por `numeroEscrito`, e não por interpolação direta, porque o separador
 * decimal é do idioma: vírgula em português e francês, ponto em inglês. Foi um
 * defeito real do site — «Um círculo tem área 452.39 cm²» num texto em
 * português —, e deixar a LLM perto disso seria repeti-lo em três línguas ao
 * mesmo tempo.
 *
 * O contrato da resposta («em gramas, 2 casas decimais») é acrescentado pelo
 * código, nunca escrito pela LLM. Não é desconfiança: é que o número de casas
 * decidido pelo gerador é o que o corretor cobra, e um texto que diga outra
 * coisa faria o aluno errar fazendo tudo certo.
 */

/**
 * O que entra numa lacuna.
 *
 * Número quase sempre; texto quando o dado é uma FÓRMULA QUÍMICA. A fórmula
 * precisa vir do código por um motivo descoberto na comparação de modelos: os
 * dois modelos inventaram reações que não existem, e «o reagente» sozinho é
 * ambíguo numa equação de dois reagentes — o exercício ficaria sem resposta.
 * Com a fórmula como dado, a LLM se refere a ela e nunca a escolhe.
 */
export type ValorDaLacuna = number | string;

/** O que a resposta deve ter, nas três línguas. Escrito à mão, por tópico. */
export interface ContratoDaResposta {
  readonly pt: string;
  readonly fr: string;
  readonly en: string;
}

/**
 * O enunciado vestido, ou `undefined` quando a história não serve.
 *
 * Recusa quando a quantidade de valores não é a que a história espera: um
 * enunciado com `{2}` aparecendo na tela seria pior que o enunciado seco de
 * sempre. Quem chama cai no de sempre.
 */
export function vestirEnunciado(
  modelo: ModeloDeProblema,
  valores: readonly ValorDaLacuna[],
  idioma: Idioma,
  contrato?: ContratoDaResposta,
): string | undefined {
  if (valores.length !== modelo.lacunas) {
    return undefined;
  }

  const invalido = valores.some((valor) =>
    typeof valor === 'number' ? !Number.isFinite(valor) : valor.trim().length === 0,
  );

  if (invalido) {
    return undefined;
  }

  const historia = modelo[idioma] || modelo.pt;

  const vestido = historia.replace(/\{(\d+)\}/g, (_, indice: string) => {
    const valor = valores[Number(indice)];

    if (valor === undefined) {
      return '';
    }

    // Texto entra como está: é a fórmula química que o site escreveu, e ela
    // não tem separador decimal nem tradução.
    return typeof valor === 'number' ? numeroEscrito(valor, idioma) : valor;
  });

  // Se sobrou lacuna, a troca não cobriu tudo e o texto iria quebrado à tela.
  if (/\{\d+\}/.test(vestido)) {
    return undefined;
  }

  const fecho = contrato?.[idioma] ?? contrato?.pt;

  return fecho === undefined ? vestido : `${vestido} (${fecho})`;
}
