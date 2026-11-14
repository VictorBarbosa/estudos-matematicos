import { PedidoDeProblema } from '@core/problemas/prompt/montar-prompt';
import { ContratoDaResposta } from '@core/problemas/vestir/vestir-enunciado';

/**
 * O que um tópico declara para poder receber histórias de uma LLM.
 *
 * Fica num arquivo próprio, sem Angular e sem nada do treino, porque é
 * referenciado de dois lados que não devem se conhecer: o modelo do gerador
 * (`treino.model.ts`) e o serviço que conversa com a LLM.
 *
 * A declaração é por TÓPICO, e os níveis vêm depois — eles mudam só a carga
 * de leitura pedida à LLM, não o que a história precisa conter. Quem decide
 * quais níveis pedir é a fila, no momento do pedido: o mesmo tópico pede um
 * lote cobrindo os quatro de uma vez.
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
  readonly pedido: Omit<PedidoDeProblema, 'quantas' | 'niveis'>;
  /**
   * O contrato da resposta, acrescentado pelo código ao fim do enunciado.
   *
   * «em gramas, 2 casas decimais» nunca é escrito pela LLM: o número de casas
   * é o que o corretor cobra, e um texto que prometa outra coisa faria o aluno
   * errar fazendo tudo certo.
   */
  readonly contrato?: ContratoDaResposta;
  /**
   * A fórmula do enunciado sai de cena quando a história entra?
   *
   * Depende do que a fórmula É. Em equação do primeiro grau ela é
   * `3x + 7 = 22` — ou seja, a modelagem já feita —, e deixá-la ao lado da
   * história entrega o passo que o problema de palavra existe para treinar.
   * Em estequiometria ela é a equação balanceada, que a história não diz e o
   * aluno precisa: ali ela fica.
   *
   * Vale só quando a história está vestindo o exercício. Sem história, o
   * enunciado seco precisa da fórmula — senão não há o que resolver.
   */
  readonly esconderFormula?: boolean;
}
