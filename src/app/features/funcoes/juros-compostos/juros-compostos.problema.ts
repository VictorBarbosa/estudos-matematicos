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
 * Só o montante recebe história, e não o juro total.
 *
 * As duas perguntas têm a mesma conta e respostas diferentes — uma inclui o
 * capital, a outra o desconta —, e uma história que diga «quanto rendeu» com
 * gabarito de montante faz o aluno errar fazendo tudo certo. É o tipo de
 * defeito que nenhum validador de texto pega.
 */
export const PROBLEMA_MONTANTE: ProblemaDeTexto = {
  forma: 'montante',
  pedido: {
    topico: 'Juros compostos',
    oQueExercita: 'achar o montante de um capital a juros compostos: M = C·(1 + i)^n',
    relacao:
      'um valor de {0} é aplicado a {1} por cento por período, durante {2} períodos, e os ' +
      'juros de cada período incidem sobre o que já rendeu; a pergunta é o VALOR TOTAL no ' +
      'fim, capital mais juros, e não quanto rendeu',
    dados: [
      {
        indice: 0,
        significado: 'o valor aplicado no começo',
        tipo: 'dinheiro',
        faixa: [500, 10000],
      },
      {
        indice: 1,
        significado: 'a taxa de juros por período, em por cento',
        tipo: 'decimal',
        faixa: [1, 30],
      },
      {
        indice: 2,
        significado: 'quantos períodos a aplicação dura',
        tipo: 'inteiro',
        faixa: [2, 12],
      },
    ],
    pergunta: 'o valor total no fim, capital mais juros',
    contextos: [
      'poupança de uma pessoa',
      'empréstimo de uma loja',
      'reserva de uma oficina',
      'financiamento de um equipamento',
    ],
  },
  contrato: {
    pt: '2 casas decimais',
    fr: '2 décimales',
    en: '2 decimal places',
  },
};
