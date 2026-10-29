import { expandirComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_PRODUTOS: readonly Teoria[] = [
  {
    id: 'produtos.quadrado',
    titulo: 'Quadrado da soma e da diferença',
    resumo: 'O termo do meio é o que todo mundo esquece — e ele tem uma área.',
    definicao:
      'Elevar um binômio ao quadrado não é elevar cada parcela ao quadrado. Ao multiplicar o ' +
      'binômio por ele mesmo, surgem dois termos cruzados iguais, e a soma deles é o 2ab que ' +
      'completa a identidade.',
    formulas: [
      { tex: '(a + b)^{2} = a^{2} + 2ab + b^{2}' },
      {
        tex: '(a - b)^{2} = a^{2} - 2ab + b^{2}',
        legenda: 'O sinal do meio acompanha o da diferença.',
      },
      { tex: '(a + b)^{2} \\neq a^{2} + b^{2}', legenda: 'O erro mais comum de toda a álgebra.' },
    ],
    demonstracao: [
      {
        descricao: 'Um quadrado é o binômio multiplicado por ele mesmo.',
        tex: '(a + b)^{2} = (a + b)(a + b)',
      },
      {
        descricao: 'Distribuindo, surgem quatro termos.',
        tex: '= a \\cdot a + a \\cdot b + b \\cdot a + b \\cdot b',
      },
      {
        descricao: 'Os dois termos do meio são iguais e se somam.',
        tex: '= a^{2} + 2ab + b^{2}',
      },
      {
        descricao: 'Na figura: um quadrado de lado (a+b) contém dois retângulos de área ab.',
        tex: '(a+b)^{2} = \\underbrace{a^{2}}_{\\text{quadrado}} + \\underbrace{2ab}_{\\text{2 retângulos}} + \\underbrace{b^{2}}_{\\text{quadrado}}',
        nota: 'Escrever só a² + b² seria esquecer dois pedaços inteiros da figura.',
      },
    ],
    exemplo: {
      enunciado: 'Expandindo (2x + 3)².',
      passos: expandirComPassos('quadrado-da-soma', 2, 3).passos,
    },
    vejaTambem: ['produtos.diferenca-de-quadrados', 'produtos.cubo'],
  },
  {
    id: 'produtos.diferenca-de-quadrados',
    titulo: 'Diferença de quadrados',
    resumo: 'A única identidade em que o termo do meio desaparece.',
    definicao:
      'O produto da soma pela diferença dos mesmos dois termos gera termos cruzados com ' +
      'sinais opostos, que se cancelam. Sobra apenas a diferença dos quadrados — e lida de ' +
      'trás para frente, esta é a fatoração mais útil do ensino médio.',
    formulas: [{ tex: '(a + b)(a - b) = a^{2} - b^{2}' }],
    demonstracao: [
      {
        descricao: 'Distribuímos o produto.',
        tex: '(a + b)(a - b) = a^{2} - ab + ba - b^{2}',
      },
      {
        descricao: 'Os termos cruzados têm sinais opostos e se anulam.',
        tex: '-ab + ab = 0',
      },
      {
        descricao: 'Resta a diferença dos quadrados.',
        tex: '= a^{2} - b^{2}',
        nota: 'Atenção: não existe identidade análoga para a SOMA de quadrados nos reais.',
      },
    ],
    exemplo: {
      enunciado: 'Expandindo (3x + 4)(3x − 4).',
      passos: expandirComPassos('diferenca-de-quadrados', 3, 4).passos,
    },
    vejaTambem: ['produtos.quadrado', 'fatoracao.diferenca'],
  },
  {
    id: 'produtos.cubo',
    titulo: 'Cubo da soma',
    resumo: 'Coeficientes 1, 3, 3, 1 — a linha do triângulo de Pascal.',
    definicao:
      'O cubo segue o mesmo princípio do quadrado, com um nível a mais de distribuição. Os ' +
      'coeficientes que aparecem não são aleatórios: são os números binomiais, os mesmos do ' +
      'triângulo de Pascal.',
    formulas: [
      { tex: '(a + b)^{3} = a^{3} + 3a^{2}b + 3ab^{2} + b^{3}' },
      { tex: '(a - b)^{3} = a^{3} - 3a^{2}b + 3ab^{2} - b^{3}', legenda: 'Os sinais alternam.' },
    ],
    demonstracao: [
      {
        descricao: 'O cubo é o quadrado vezes mais um binômio.',
        tex: '(a+b)^{3} = (a+b)^{2}(a+b) = (a^{2} + 2ab + b^{2})(a+b)',
      },
      {
        descricao: 'Distribuindo e agrupando os termos semelhantes.',
        tex: '= a^{3} + 3a^{2}b + 3ab^{2} + b^{3}',
      },
      {
        descricao: 'Os coeficientes são a quarta linha do triângulo de Pascal.',
        tex: '1 \\quad 3 \\quad 3 \\quad 1',
        nota: 'Para a quarta potência seriam 1, 4, 6, 4, 1 — e assim por diante.',
      },
    ],
    exemplo: {
      enunciado: 'Expandindo (x + 1)³.',
      passos: expandirComPassos('cubo-da-soma', 1, 1).passos,
    },
    vejaTambem: ['produtos.quadrado'],
  },
];
