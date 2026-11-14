import { PedidoDeProblema } from '@core/problemas/prompt/montar-prompt';
import { ContratoDaResposta } from '@core/problemas/vestir/vestir-enunciado';

/**
 * O que um tópico declara para poder receber histórias de uma LLM.
 *
 * Fica num arquivo próprio, sem Angular e sem nada do treino, porque é
 * referenciado de dois lados que não devem se conhecer: o modelo do gerador
 * (`treino.model.ts`) e o serviço que conversa com a LLM.
 *
 * A declaração é por TÓPICO, e o nível vem depois — ele muda só a carga de
 * leitura pedida à LLM, não o que a história precisa conter.
 */
export interface ProblemaDeTexto {
  /**
   * Qual forma de pergunta do tópico esta história serve.
   *
   * Um tópico tem várias formas — produto, sobra, rendimento — e a história de
   * uma não serve para a outra. A fila é separada por forma, e é esta etiqueta
   * que a separa.
   */
  readonly forma: string;
  /** O pedido à LLM, sem os números e sem o nível. */
  readonly pedido: Omit<PedidoDeProblema, 'quantas' | 'nivel'>;
  /**
   * O contrato da resposta, acrescentado pelo código ao fim do enunciado.
   *
   * «em gramas, 2 casas decimais» nunca é escrito pela LLM: o número de casas
   * é o que o corretor cobra, e um texto que prometa outra coisa faria o aluno
   * errar fazendo tudo certo.
   */
  readonly contrato?: ContratoDaResposta;
}
