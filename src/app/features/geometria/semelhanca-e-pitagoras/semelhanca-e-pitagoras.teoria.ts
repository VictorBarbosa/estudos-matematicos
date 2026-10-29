import { escalaComPassos, pitagorasComPassos, talesComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_SEMELHANCA: readonly Teoria[] = [
  {
    id: 'semelhanca.razao',
    titulo: 'Semelhança e razão',
    resumo: 'Mesma forma, tamanho diferente — e o preço disso.',
    definicao:
      'Duas figuras são semelhantes quando têm ângulos iguais e lados proporcionais. A razão ' +
      'k multiplica todos os comprimentos, mas a área é multiplicada por k² e o volume por ' +
      'k³. Essa diferença de expoentes é um dos fatos mais úteis da engenharia: nada pode ser ' +
      'simplesmente ampliado.',
    formulas: [
      { tex: '\\frac{a\'}{a} = \\frac{b\'}{b} = k' },
      { tex: '\\frac{A\'}{A} = k^{2} \\qquad \\frac{V\'}{V} = k^{3}' },
    ],
    demonstracao: [
      {
        descricao: 'A área é um produto de dois comprimentos, e cada um foi multiplicado por k.',
        tex: "A' = (k b)(k h) = k^{2}(bh) = k^{2} A",
      },
      {
        descricao: 'O volume envolve três comprimentos.',
        tex: "V' = k^{3} V",
        nota: 'Dobrar a altura de um foguete multiplica sua massa por oito.',
      },
      {
        descricao: 'Logo a razão superfície/volume cai quando a figura cresce.',
        tex: '\\frac{A\'}{V\'} = \\frac{k^{2}A}{k^{3}V} = \\frac{1}{k}\\cdot\\frac{A}{V}',
        nota: 'É por isso que animais grandes dissipam calor com mais dificuldade.',
      },
    ],
    exemplo: {
      enunciado: 'O que acontece com a área quando a razão de semelhança é 3.',
      passos: escalaComPassos(3, 2).passos,
    },
    vejaTambem: ['semelhanca.tales', 'semelhanca.pitagoras'],
  },
  {
    id: 'semelhanca.tales',
    titulo: 'Teorema de Tales',
    resumo: 'Paralelas cortam transversais em partes proporcionais.',
    definicao:
      'Um feixe de retas paralelas, cortado por duas transversais, determina segmentos ' +
      'proporcionais. É a ferramenta que resolve "quanto mede o lado que não dá para medir" — ' +
      'e foi assim que Tales calculou a altura da pirâmide pela sombra.',
    formulas: [
      { tex: '\\frac{AB}{BC} = \\frac{A\'B\'}{B\'C\'}' },
      {
        tex: '\\frac{a}{b} = \\frac{c}{x} \\;\\Rightarrow\\; x = \\frac{bc}{a}',
        legenda: 'A quarta proporcional, por multiplicação em cruz.',
      },
    ],
    demonstracao: [
      {
        descricao: 'As paralelas garantem ângulos correspondentes iguais.',
        tex: '\\alpha = \\alpha\' \\quad \\beta = \\beta\'',
      },
      {
        descricao: 'Com dois ângulos iguais, os triângulos são semelhantes.',
        tex: '\\triangle ABC \\sim \\triangle A\'B\'C\'',
        nota: 'O terceiro ângulo vem de graça: a soma é sempre 180°.',
      },
      {
        descricao: 'Em figuras semelhantes, os lados correspondentes são proporcionais.',
        tex: '\\frac{AB}{A\'B\'} = \\frac{BC}{B\'C\'}',
      },
    ],
    exemplo: {
      enunciado: 'Com 2/3 = 4/x, quanto vale x?',
      passos: talesComPassos(2, 3, 4).passos,
    },
    vejaTambem: ['semelhanca.razao', 'proporcao.regra-de-tres'],
  },
  {
    id: 'semelhanca.pitagoras',
    titulo: 'Pitágoras, demonstrado',
    resumo: 'A relação mais usada da matemática, e por que ela é verdadeira.',
    definicao:
      'Num triângulo retângulo, o quadrado da hipotenusa é a soma dos quadrados dos catetos. ' +
      'A prova por semelhança é a mais curta: a altura sobre a hipotenusa divide o triângulo ' +
      'em dois semelhantes ao original, e a proporção entre os lados faz o resto.',
    formulas: [
      { tex: 'a^{2} = b^{2} + c^{2}' },
      {
        tex: 'b^{2} = a \\cdot m \\qquad c^{2} = a \\cdot n',
        legenda: 'Relações métricas: cada cateto ao quadrado é a hipotenusa vezes sua projeção.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Traçamos a altura relativa à hipotenusa, que a divide em projeções m e n.',
        tex: 'a = m + n',
      },
      {
        descricao: 'Os dois triângulos menores têm os mesmos ângulos do original.',
        tex: '\\frac{b}{a} = \\frac{m}{b} \\;\\Rightarrow\\; b^{2} = a m',
        nota: 'Mesmos ângulos significa lados proporcionais.',
      },
      {
        descricao: 'O mesmo vale para o outro cateto.',
        tex: '\\frac{c}{a} = \\frac{n}{c} \\;\\Rightarrow\\; c^{2} = a n',
      },
      {
        descricao: 'Somando as duas relações e usando m + n = a.',
        tex: 'b^{2} + c^{2} = a(m + n) = a \\cdot a = a^{2}',
        nota: 'Nada além de semelhança foi usado.',
      },
    ],
    exemplo: {
      enunciado: 'A hipotenusa de um triângulo de catetos 3 e 4.',
      passos: pitagorasComPassos(3, 4).passos,
    },
    vejaTambem: ['semelhanca.razao', 'triangulo.razoes', 'angulos.triangulo'],
  },
];
