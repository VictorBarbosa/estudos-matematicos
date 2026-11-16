/**
 * Uma entrada do arquivo de enunciados, com o que o CAMINHO dela diz.
 *
 * O tipo mora aqui, e não no catálogo, porque o catálogo agora é uma pilha de
 * índices por tópico: cada `catalogos/<tópico>.ts` precisa do tipo para tipar a
 * sua lista, e se ele viesse do catálogo haveria um ciclo — o catálogo importa
 * os tópicos, e os tópicos importariam o catálogo.
 *
 * Este arquivo não importa nada, de propósito.
 */
export interface EntradaDeEnunciado {
  readonly topico: string;
  readonly nivel?: string;
  readonly forma?: string;
  readonly conteudo: unknown;
}
