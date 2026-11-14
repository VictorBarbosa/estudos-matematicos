import type { ProblemaDeTexto } from '@core/problemas/models/problema-de-texto';

/**
 * A história que uma LLM local pode escrever em volta do trajeto da massa.
 *
 * As duas fórmulas entram como DADO, escritas pelo site. Na comparação de
 * modelos de 14/11 os dois modelos inventaram reações que não existem —
 * «sulfato de potássio como reagente principal» para produzir ácido
 * sulfúrico —, e química falsa com aparência de verdadeira é o pior tipo de
 * exercício. Pedir que a história diga só «o reagente» também não serve:
 * numa equação de dois reagentes isso é ambíguo, e o exercício ficaria sem
 * resposta. Com a fórmula como lacuna, a LLM escreve o contexto e o site
 * escreve a química.
 */
export const PROBLEMA_ESTEQUIOMETRIA: ProblemaDeTexto = {
  forma: 'massa-de-produto',
  pedido: {
    topico: 'Estequiometria',
    oQueExercita:
      'converter massa de um reagente em massa de produto pela equação balanceada, que ' +
      'aparece abaixo do enunciado',
    dados: [
      {
        indice: 0,
        significado: 'a massa de reagente disponível, em gramas',
        tipo: 'decimal',
        faixa: [1, 500],
      },
      { indice: 1, significado: 'a fórmula do reagente de partida', tipo: 'formula' },
      { indice: 2, significado: 'a fórmula do produto que se quer', tipo: 'formula' },
    ],
    relacao:
      'de {0} gramas de {1} sai uma massa de {2}, pela proporção da equação balanceada que ' +
      'aparece abaixo do enunciado — a massa do produto é o que se pergunta',
    pergunta: 'a massa de produto formada',
    unidade: 'gramas',
    contextos: ['laboratório', 'indústria química', 'tratamento de água', 'controle de qualidade'],
    // A LLM recebeu a fórmula, não a identidade: classificar a substância é
    // inventar química. Os dois modelos escreveram «massa de sal formado» e
    // «excesso de monômero» para reações em que nem uma nem outra palavra
    // cabia.
    proibidas: [
      'sal',
      'sel',
      'salt',
      'ácido',
      'acido',
      'acide',
      'acid',
      'base',
      'bases',
      'óxido',
      'oxido',
      'oxyde',
      'oxide',
      'polímero',
      'polimero',
      'polymère',
      'polymere',
      'polymer',
      'monômero',
      'monomero',
      'monomère',
      'monomere',
      'monomer',
      'excesso',
      'excès',
      'exces',
      'excess',
      'puro',
      'pura',
      'pure',
      'impureza',
      'impureté',
      'impurete',
      'impurity',
    ],
  },
  contrato: {
    pt: 'em gramas, 2 casas decimais',
    fr: 'en grammes, 2 décimales',
    en: 'in grams, 2 decimal places',
  },
  // A equação balanceada FICA: a história não a diz, e sem ela não há
  // proporção para aplicar.
  esconderFormula: false,
};
