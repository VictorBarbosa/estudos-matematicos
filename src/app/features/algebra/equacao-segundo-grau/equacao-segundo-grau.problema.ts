import type { ProblemaDeTexto } from '@core/problemas/models/problema-de-texto';

/**
 * A única história que serve a uma equação do segundo grau genérica.
 *
 * «Resolva e informe a maior raiz» não tem contexto do mundo: a situação que
 * produz `ax² + bx + c = 0` depende de qual é a situação — área com recuo,
 * projétil, lucro —, e cada uma fixa os coeficientes de um jeito. Vestir
 * coeficientes sorteados numa história qualquer daria enunciado falso.
 *
 * Mas há um caso em que a história é exata, e é clássica: com `a = 1` e as
 * duas raízes inteiras positivas, a equação É o problema «dois números somam
 * S e multiplicam P» — soma e produto são `−b` e `c`, e a maior raiz é o maior
 * dos dois números. É por isso que o gerador só manda dados nesse caso.
 */
export const PROBLEMA_SOMA_PRODUTO: ProblemaDeTexto = {
  forma: 'soma-e-produto',
  pedido: {
    topico: 'Dois números pela soma e pelo produto',
    oQueExercita: 'achar dois números conhecendo a soma e o produto deles',
    relacao:
      'dois números somam {0} e multiplicam {1}; a pergunta é o MAIOR dos dois. Os dois são ' +
      'inteiros positivos',
    dados: [
      { indice: 0, significado: 'a soma dos dois números', tipo: 'inteiro', faixa: [3, 40] },
      { indice: 1, significado: 'o produto dos dois números', tipo: 'inteiro', faixa: [2, 400] },
    ],
    pergunta: 'o maior dos dois números',
    // «Dois números somam…» é o enunciado inteiro: sem esta exceção, a regra
    // do número por extenso recusava quatro de quatro.
    permitidas: ['dois', 'duas', 'deux', 'two'],
    contextos: [
      'dois lotes de peças',
      'duas turmas de uma oficina',
      'dois trechos de uma viagem',
      'dois terrenos vizinhos',
    ],
  },
  esconderFormula: true,
};
