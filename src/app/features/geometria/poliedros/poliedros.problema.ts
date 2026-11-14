import type { ProblemaDeTexto } from '@core/problemas/models/problema-de-texto';

/**
 * A declaração que permite a este tópico receber histórias de uma LLM local.
 *
 * **Por que ele precisa de uma escrita à mão.** A derivação automática cobriu
 * a maior parte da trilha, mas barra justamente este tópico: a barreira exige
 * uma grandeza com unidade, e «um poliedro tem 12 vértices e 14 faces» é
 * contagem pura. Foi a barreira que nasceu de um defeito real — reescrever
 * esse enunciado produziu um «cubo», uma «caixa de madeira» e um «avião de
 * papel», e nenhum tem 12 vértices. O cenário inventado contradizia o dado.
 *
 * Aqui a contradição não acontece, e a diferença é o que a história PODE
 * dizer: com a declaração, o modelo recebe a relação `V − A + F = 2` e a
 * instrução de manter o poliedro convexo anônimo. Medido com o `gpt-oss:20b`:
 * seis de oito aprovadas, e as duas recusas foram número por extenso — o
 * portão funcionando, não a história errada.
 *
 * **Só a pergunta de Euler recebe história.** As outras formas do tópico
 * (`prisma-piramide`, `faces-iguais`, `faces-mistas`, `grau`) perguntam sobre
 * um poliedro NOMEADO — «quantas arestas tem uma pirâmide de base octogonal?».
 * Ali o nome carrega a resposta, e vestir de história daria «uma pirâmide de
 * base octogonal tem {0} arestas», que é a resposta escrita no enunciado.
 */
export const PROBLEMA_POLIEDROS: ProblemaDeTexto = {
  forma: 'euler',
  pedido: {
    topico: 'Poliedros convexos',
    oQueExercita: 'usar a relação de Euler V − A + F = 2 para achar o termo que falta',
    relacao:
      'um poliedro convexo tem duas das três contagens (vértices, arestas, faces) e a ' +
      'pergunta cobra a terceira, pela relação V − A + F = 2',
    dados: [
      {
        indice: 0,
        significado: 'a primeira contagem dada, em vértices ou em arestas ou em faces',
        tipo: 'inteiro',
        faixa: [4, 60],
      },
      {
        indice: 1,
        significado: 'a segunda contagem dada, de outra das três grandezas',
        tipo: 'inteiro',
        faixa: [4, 60],
      },
    ],
    pergunta:
      'quantas arestas, ou quantos vértices, ou quantas faces o poliedro tem — a que faltou',
    // «dois poliedros», «três faces»: o numeral é enredo, não dado.
    permitidas: ['dois', 'duas', 'três', 'tres', 'quatro', 'deux', 'trois', 'two', 'three'],
    contextos: [
      'uma oficina de modelagem',
      'uma aula de geometria',
      'um designer construindo um objeto',
      'um engenheiro conferindo uma peça',
      'uma fábrica de brinquedos',
    ],
  },
  /*
   * A fórmula em tela é `V − A + F = 2`, que é a modelagem pronta. Ao lado da
   * história ela entrega o passo que o problema de palavra existe para treinar.
   */
  esconderFormula: true,
};
