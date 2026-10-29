import { analisarLogaritmicaComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_LOGARITMICA: readonly Teoria[] = [
  {
    id: 'logaritmica.definicao',
    titulo: 'Logaritmo é o expoente',
    resumo: 'log_b(x) responde: a que expoente elevar b para obter x?',
    definicao:
      'O logaritmo não é uma operação exótica: é a pergunta inversa da potenciação. Enquanto ' +
      'a potência pergunta "quanto dá b elevado a y?", o logaritmo pergunta "que expoente ' +
      'leva b até x?". As duas dizem a mesma coisa de trás para frente.',
    formulas: [
      { tex: '\\log_b x = y \\iff b^{y} = x' },
      { tex: '\\log_b 1 = 0 \\qquad \\log_b b = 1', legenda: 'Dois valores que saem direto da definição.' },
    ],
    demonstracao: [
      {
        descricao: 'Partimos de uma potência conhecida.',
        tex: '2^{3} = 8',
      },
      {
        descricao: 'O logaritmo lê a mesma igualdade perguntando pelo expoente.',
        tex: '\\log_2 8 = 3',
        nota: 'Mesma informação, apenas com outra incógnita em destaque.',
      },
      {
        descricao: 'Por isso aplicar as duas operações em sequência devolve o número original.',
        tex: 'b^{\\log_b x} = x \\qquad \\log_b (b^{y}) = y',
      },
    ],
    exemplo: {
      enunciado: 'A função logarítmica de base 2.',
      passos: analisarLogaritmicaComPassos(2).passos,
    },
    vejaTambem: ['logaritmica.dominio', 'logaritmica.propriedades'],
  },
  {
    id: 'logaritmica.dominio',
    titulo: 'Por que x precisa ser positivo',
    resumo: 'Nenhuma potência de base positiva dá zero ou negativo.',
    definicao:
      'O domínio do logaritmo é x > 0, e isso não é uma restrição arbitrária: é consequência ' +
      'direta da definição. Como bʸ é sempre positivo para base positiva, não existe expoente ' +
      'que leve b a zero ou a um número negativo.',
    formulas: [
      { tex: '\\log_b x \\;\\text{existe} \\iff x > 0' },
      { tex: '\\lim_{x \\to 0^{+}} \\log_b x = -\\infty \\quad (b > 1)' },
    ],
    demonstracao: [
      {
        descricao: 'Expoentes positivos dão números grandes; negativos, frações pequenas.',
        tex: '2^{3} = 8 \\qquad 2^{-3} = \\frac{1}{8}',
      },
      {
        descricao: 'Em nenhum dos casos o resultado chega a zero ou fica negativo.',
        tex: '2^{y} > 0 \\quad \\text{para todo } y \\in \\mathbb{R}',
      },
      {
        descricao: 'Logo não existe expoente que resolva essas equações.',
        tex: '2^{y} = 0 \\;\\text{e}\\; 2^{y} = -4 \\;\\text{não têm solução}',
        nota: 'É o espelho da assíntota da exponencial: o que lá era horizontal, aqui é vertical.',
      },
    ],
    exemplo: {
      enunciado: 'A função logarítmica de base 10.',
      passos: analisarLogaritmicaComPassos(10).passos,
    },
    vejaTambem: ['logaritmica.definicao', 'exponencial.assintota'],
  },
  {
    id: 'logaritmica.propriedades',
    titulo: 'As propriedades operatórias',
    resumo: 'O logaritmo transforma produto em soma.',
    definicao:
      'As propriedades do logaritmo são as propriedades das potências, lidas do outro lado. ' +
      'Como multiplicar potências soma expoentes, e o logaritmo É o expoente, o logaritmo de ' +
      'um produto é a soma dos logaritmos.',
    formulas: [
      { tex: '\\log_b (xy) = \\log_b x + \\log_b y' },
      { tex: '\\log_b \\frac{x}{y} = \\log_b x - \\log_b y' },
      { tex: '\\log_b x^{n} = n \\log_b x', legenda: 'A mais útil: tira a variável do expoente.' },
    ],
    demonstracao: [
      {
        descricao: 'Escrevemos x e y como potências da base.',
        tex: 'x = b^{m} \\qquad y = b^{n}',
      },
      {
        descricao: 'O produto soma os expoentes, pela propriedade das potências.',
        tex: 'xy = b^{m} \\cdot b^{n} = b^{m+n}',
      },
      {
        descricao: 'Lendo com logaritmo, o expoente do produto é m + n.',
        tex: '\\log_b(xy) = m + n = \\log_b x + \\log_b y',
        nota: 'Era isso que permitia multiplicar números enormes com tábuas, antes das calculadoras.',
      },
      {
        descricao: 'A propriedade da potência é o caso de fatores repetidos.',
        tex: '\\log_b x^{3} = \\log_b (x \\cdot x \\cdot x) = 3\\log_b x',
      },
    ],
    exemplo: {
      enunciado: 'A função logarítmica de base 3.',
      passos: analisarLogaritmicaComPassos(3).passos,
    },
    vejaTambem: ['logaritmica.definicao', 'potencias.propriedades'],
  },
];
