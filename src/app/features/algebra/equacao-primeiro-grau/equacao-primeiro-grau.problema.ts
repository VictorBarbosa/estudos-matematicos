import type { ProblemaDeTexto } from '@core/problemas/models/problema-de-texto';

/**
 * A declaração que permite a este tópico receber histórias de uma LLM local.
 *
 * Fica em arquivo próprio, e com `import type`, por um motivo prático: assim
 * `scripts/comparar-modelos.ts` a importa por caminho relativo e mede **esta**
 * declaração, não uma cópia. A cópia desanda — foi o que aconteceu antes, e
 * medir o prompt errado é pior que não medir.
 */
export const PROBLEMA_EQUACAO1: ProblemaDeTexto = {
  forma: 'ax-mais-b',
  pedido: {
    topico: 'Equação do primeiro grau',
    oQueExercita: 'resolver ax + b = c, achando o valor de x',
    relacao:
      '{0} × x + {1} = {2}, em que x é QUANTAS VEZES a quantidade {0} se repete — e x é ' +
      'justamente o que a pergunta cobra',
    dados: [
      {
        indice: 0,
        significado: 'quanto cada repetição acrescenta ao total',
        tipo: 'inteiro',
        faixa: [2, 12],
      },
      {
        indice: 1,
        significado:
          'uma quantidade da MESMA grandeza e da MESMA unidade do total, que já está lá ' +
          'desde o começo e não depende de x — uma taxa fixa, um estoque inicial, uma ' +
          'parcela de entrada. Se o total está em doces, esta também está em doces, nunca ' +
          'em caixas de doces',
        tipo: 'inteiro',
        faixa: [1, 20],
      },
      { indice: 2, significado: 'o total no fim', tipo: 'inteiro', faixa: [20, 200] },
    ],
    pergunta: 'quantas vezes a quantidade que se repete foi repetida, isto é, o x',
    contextos: ['oficina', 'transporte de carga', 'obra', 'linha de montagem'],
  },
  // A fórmula é a modelagem já feita: ao lado da história, entrega o passo
  // que o problema de palavra existe para treinar.
  esconderFormula: true,
};
