import type { ProblemaDeTexto } from '@core/problemas/models/problema-de-texto';

/**
 * A declaração que permite a este tópico receber histórias de uma LLM local.
 *
 * Fica em arquivo próprio, e com `import type`, por um motivo prático: assim
 * `scripts/comparar-modelos.ts` a importa por caminho relativo e mede **esta**
 * declaração, não uma cópia. A cópia desanda — foi o que aconteceu antes, e
 * medir o prompt errado é pior que não medir.
 */
/**
 * Só o MMC recebe história, e não o MDC.
 *
 * São duas perguntas com histórias de forma oposta: o MMC é o reencontro —
 * dois ônibus que saem a cada tanto, duas engrenagens que voltam à posição —,
 * e o MDC é a partilha — o maior pedaço igual em que dois estoques cabem sem
 * sobra. Uma declaração que tentasse servir as duas produziria história de
 * reencontro para pergunta de partilha, e o exercício ficaria sem resposta.
 */
export const PROBLEMA_MMC: ProblemaDeTexto = {
  forma: 'mmc',
  pedido: {
    topico: 'Mínimo múltiplo comum',
    oQueExercita: 'achar o mínimo múltiplo comum de dois números',
    relacao:
      'dois acontecimentos se repetem, um a cada {0} e o outro a cada {1}, e a pergunta é ' +
      'quando voltam a acontecer juntos — o MMC de {0} e {1}',
    dados: [
      {
        indice: 0,
        significado: 'de quanto em quanto o primeiro acontecimento se repete',
        tipo: 'inteiro',
        faixa: [4, 150],
      },
      {
        indice: 1,
        significado: 'de quanto em quanto o segundo acontecimento se repete',
        tipo: 'inteiro',
        faixa: [4, 150],
      },
    ],
    pergunta: 'depois de quanto tempo, ou de quantas unidades, os dois coincidem outra vez',
    // «Dois ônibus partem…» é o enredo, não um dado: a história é SOBRE duas
    // coisas, e a regra geral do número por extenso recusava justamente as
    // melhores. Sem esta exceção, seis de seis caíam.
    permitidas: ['dois', 'duas', 'deux', 'two'],
    contextos: [
      'ônibus que partem de um terminal',
      'engrenagens que giram',
      'faróis que piscam',
      'turnos de manutenção',
      'regas de uma estufa',
    ],
  },
};
