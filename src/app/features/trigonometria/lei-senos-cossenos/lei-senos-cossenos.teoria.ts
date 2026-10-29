import { leiDosCossenosComPassos, leiDosSenosComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_LEIS: readonly Teoria[] = [
  {
    id: 'leis.cossenos',
    titulo: 'Lei dos cossenos',
    resumo: 'Pitágoras com um termo de correção.',
    definicao:
      'A lei dos cossenos estende o teorema de Pitágoras a triângulos quaisquer. O termo ' +
      '−2bc·cos A é exatamente a correção necessária quando o ângulo deixa de ser reto: ele ' +
      'some quando A = 90°, e o teorema clássico reaparece.',
    formulas: [
      { tex: 'a^{2} = b^{2} + c^{2} - 2bc\\cos A' },
      { tex: 'A = 90° \\;\\Rightarrow\\; \\cos A = 0 \\;\\Rightarrow\\; a^{2} = b^{2} + c^{2}' },
    ],
    demonstracao: [
      {
        descricao: 'Com ângulo reto, o cosseno zera e o termo de correção desaparece.',
        tex: '\\cos 90° = 0',
      },
      {
        descricao: 'Com ângulo agudo, o cosseno é positivo e o lado oposto fica MENOR.',
        tex: 'A < 90° \\;\\Rightarrow\\; a^{2} < b^{2} + c^{2}',
        nota: 'Faz sentido: fechando o ângulo, aproximam-se as pontas.',
      },
      {
        descricao: 'Com ângulo obtuso, o cosseno é negativo e o lado oposto fica MAIOR.',
        tex: 'A > 90° \\;\\Rightarrow\\; a^{2} > b^{2} + c^{2}',
      },
    ],
    exemplo: {
      enunciado: 'Dois lados 5 e 7 com ângulo de 60° entre eles.',
      passos: leiDosCossenosComPassos(5, 7, 60).passos,
    },
    vejaTambem: ['leis.senos', 'leis.quando-usar'],
  },
  {
    id: 'leis.senos',
    titulo: 'Lei dos senos',
    resumo: 'Lado e seno do ângulo oposto são proporcionais.',
    definicao:
      'Em qualquer triângulo, a razão entre um lado e o seno do ângulo oposto a ele é a ' +
      'mesma para os três pares. Essa razão constante vale, inclusive, o diâmetro da ' +
      'circunferência que circunscreve o triângulo.',
    formulas: [
      { tex: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R' },
    ],
    demonstracao: [
      {
        descricao: 'Traçando a altura h a partir de um vértice, ela aparece em dois triângulos retângulos.',
        tex: 'h = b\\sin C \\qquad h = c\\sin B',
      },
      {
        descricao: 'Como é a mesma altura, as duas expressões são iguais.',
        tex: 'b\\sin C = c\\sin B',
      },
      {
        descricao: 'Reorganizando, surge a proporção.',
        tex: '\\frac{b}{\\sin B} = \\frac{c}{\\sin C}',
        nota: 'Repetindo com outra altura, inclui-se o terceiro par.',
      },
    ],
    exemplo: {
      enunciado: 'Lado 10 oposto a 30°; quanto mede o lado oposto a 90°?',
      passos: leiDosSenosComPassos(10, 30, 90).passos,
    },
    vejaTambem: ['leis.cossenos', 'leis.quando-usar'],
  },
  {
    id: 'leis.quando-usar',
    titulo: 'Qual lei usar',
    resumo: 'Depende do que o problema fornece.',
    definicao:
      'A escolha é mecânica quando se olha para os dados. A lei dos cossenos pede dois lados ' +
      'e o ângulo ENTRE eles, ou os três lados. A lei dos senos pede um par completo — um ' +
      'lado e o ângulo oposto a ele.',
    formulas: [
      { tex: '\\text{dois lados e o ângulo entre eles} \\to \\text{cossenos}' },
      { tex: '\\text{um lado e o ângulo oposto} \\to \\text{senos}' },
    ],
    demonstracao: [
      {
        descricao: 'Com LAL (lado-ângulo-lado), só a lei dos cossenos fecha.',
        tex: 'b,\\; c,\\; A \\;\\Rightarrow\\; a',
        nota: 'Não há par lado-ângulo oposto completo para aplicar a dos senos.',
      },
      {
        descricao: 'Com LLL, a lei dos cossenos isolada dá qualquer ângulo.',
        tex: '\\cos A = \\frac{b^{2} + c^{2} - a^{2}}{2bc}',
      },
      {
        descricao: 'Com ALA ou AAL, a soma dos ângulos dá o terceiro e a lei dos senos resolve.',
        tex: 'A + B + C = 180°',
      },
    ],
    exemplo: {
      enunciado: 'Dois lados e o ângulo entre eles pedem a lei dos cossenos.',
      passos: leiDosCossenosComPassos(8, 6, 45).passos,
    },
    vejaTambem: ['leis.cossenos', 'leis.senos'],
  },
];
