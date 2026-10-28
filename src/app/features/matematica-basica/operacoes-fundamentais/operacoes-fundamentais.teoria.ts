import { resolverExpressaoComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_OPERACOES: readonly Teoria[] = [
  {
    id: 'operacoes.ordem',
    titulo: 'A ordem das operações',
    resumo: 'Parênteses, potências, multiplicação e divisão, e por fim adição e subtração.',
    definicao:
      'A ordem não é uma regra arbitrária de etiqueta matemática: ela existe para que uma ' +
      'mesma expressão escrita tenha um único significado. Sem uma convenção, 2 + 3 × 4 ' +
      'poderia valer 14 ou 20, e nenhuma fórmula seria confiável.',
    formulas: [
      {
        tex: '\\text{( )} \;\\to\; x^{n} \;\\to\; \\times \;\\div \;\\to\; + \;-',
        legenda: 'Dentro de cada nível, resolve-se da esquerda para a direita.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Multiplicação é soma repetida, então ela já é "mais forte" que a soma.',
        tex: '2 + 3 \\times 4 = 2 + (4 + 4 + 4) = 14',
        nota: 'Resolver da esquerda para a direita daria 20, que não corresponde ao significado.',
      },
      {
        descricao:
          'Pela mesma razão, a potência vem antes da multiplicação: ela é produto repetido.',
        tex: '3 \\times 2^{3} = 3 \\times 8 = 24',
      },
      {
        descricao: 'Os parênteses existem justamente para quebrar essa ordem quando se quer outra.',
        tex: '(2 + 3) \\times 4 = 5 \\times 4 = 20',
      },
    ],
    exemplo: {
      enunciado: 'Resolvendo 2 + 3 × (4 − 1)².',
      passos: resolverExpressaoComPassos('2 + 3 * (4 - 1)^2').passos,
    },
    vejaTambem: ['operacoes.propriedades', 'operacoes.sinais'],
  },
  {
    id: 'operacoes.propriedades',
    titulo: 'Propriedades das operações',
    resumo: 'Comutativa, associativa e distributiva — e onde cada uma NÃO vale.',
    definicao:
      'Adição e multiplicação são comutativas e associativas; subtração e divisão não são. ' +
      'A distributiva liga as duas operações e é a propriedade mais usada em toda a álgebra ' +
      'que vem depois.',
    formulas: [
      {
        tex: 'a + b = b + a \\qquad a \\cdot b = b \\cdot a',
        legenda: 'Comutativa: a ordem não importa.',
      },
      { tex: '(a + b) + c = a + (b + c)', legenda: 'Associativa: o agrupamento não importa.' },
      {
        tex: 'a \\cdot (b + c) = a \\cdot b + a \\cdot c',
        legenda: 'Distributiva: liga produto e soma.',
      },
    ],
    demonstracao: [
      {
        descricao: 'A comutativa vale para soma e produto.',
        tex: '3 + 5 = 5 + 3 = 8 \\qquad 3 \\cdot 5 = 5 \\cdot 3 = 15',
      },
      {
        descricao: 'Mas NÃO vale para subtração nem divisão.',
        tex: '7 - 3 = 4 \\quad \\text{enquanto} \\quad 3 - 7 = -4',
        nota: 'Inverter a ordem de uma subtração troca o sinal do resultado.',
      },
      {
        descricao: 'A distributiva pode ser vista como área: um retângulo dividido em dois.',
        tex: 'a(b + c) = ab + ac',
        nota: 'Um retângulo de altura a e base b+c tem a mesma área que dois retângulos ao lado.',
      },
    ],
    exemplo: {
      enunciado: 'Usando a distributiva para facilitar: 7 × 103.',
      passos: [
        { descricao: 'Decompomos o número maior.', tex: '7 \\times 103 = 7 \\times (100 + 3)' },
        { descricao: 'Distribuímos.', tex: '= 7 \\times 100 + 7 \\times 3 = 700 + 21' },
        { descricao: 'Somamos.', tex: '= 721' },
      ],
    },
    vejaTambem: ['operacoes.ordem', 'operacoes.sinais'],
  },
  {
    id: 'operacoes.sinais',
    titulo: 'Regra de sinais',
    resumo: 'Sinais iguais dão positivo; sinais diferentes dão negativo.',
    definicao:
      'Na multiplicação e na divisão, o sinal do resultado depende apenas de quantos fatores ' +
      'negativos há: um número par deles dá positivo, um número ímpar dá negativo. Na adição, ' +
      'a lógica é outra — é a de ganhos e perdas.',
    formulas: [
      { tex: '(+) \\cdot (+) = (+) \\qquad (-) \\cdot (-) = (+)' },
      { tex: '(+) \\cdot (-) = (-) \\qquad (-) \\cdot (+) = (-)' },
    ],
    demonstracao: [
      {
        descricao: 'Multiplicar por −1 significa inverter o sentido na reta numérica.',
        tex: '(-1) \\cdot 5 = -5',
      },
      {
        descricao: 'Inverter duas vezes devolve o sentido original.',
        tex: '(-1) \\cdot (-1) \\cdot 5 = (-1) \\cdot (-5) = 5',
        nota: 'É por isso que menos com menos dá mais: são duas inversões sucessivas.',
      },
      {
        descricao: 'Cuidado: na SOMA a regra é diferente, e é a de somar dívidas.',
        tex: '(-3) + (-4) = -7',
        nota: 'Dois negativos somados não dão positivo — isso só vale para produto e quociente.',
      },
    ],
    exemplo: {
      enunciado: 'Uma expressão com sinais e precedência juntos.',
      passos: resolverExpressaoComPassos('-2 * (3 - 7) + 10 / 5').passos,
    },
    vejaTambem: ['operacoes.ordem'],
  },
];
