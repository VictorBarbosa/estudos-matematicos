import { Polinomio, fatorarComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_FATORACAO: readonly Teoria[] = [
  {
    id: 'fatoracao.ideia',
    titulo: 'Fatorar é fechar parênteses',
    resumo: 'O caminho inverso da distributiva.',
    definicao:
      'Fatorar é reescrever uma soma como um produto. É exatamente a distributiva lida de trás ' +
      'para frente — e serve para resolver equações, porque um produto só é zero quando um dos ' +
      'fatores é zero.',
    formulas: [
      { tex: 'ab + ac = a(b + c)', legenda: 'Fator comum em evidência.' },
      { tex: 'A \\cdot B = 0 \\iff A = 0 \;\\text{ou}\; B = 0', legenda: 'O motivo de fatorar.' },
    ],
    demonstracao: [
      {
        descricao: 'A distributiva abre parênteses.',
        tex: 'a(b + c) = ab + ac',
      },
      {
        descricao: 'Fatorar é percorrer o mesmo caminho na direção contrária.',
        tex: 'ab + ac = a(b + c)',
        nota: 'Expandir o resultado sempre confirma se a fatoração está certa.',
      },
      {
        descricao: 'A utilidade aparece nas equações: zero só surge de um fator nulo.',
        tex: 'x^{2} - 5x + 6 = 0 \;\\Rightarrow\; (x-2)(x-3) = 0 \;\\Rightarrow\; x = 2 \\text{ ou } x = 3',
      },
    ],
    exemplo: {
      enunciado: 'Fatorando 6x² + 9x.',
      passos: fatorarComPassos(Polinomio.de(0, 9, 6)).passos,
    },
    vejaTambem: ['fatoracao.diferenca', 'fatoracao.trinomio'],
  },
  {
    id: 'fatoracao.diferenca',
    titulo: 'Diferença de quadrados',
    resumo: 'a² − b² = (a + b)(a − b), e só vale para a diferença.',
    definicao:
      'Quando dois quadrados perfeitos aparecem subtraídos, a expressão fatora de imediato. ' +
      'A soma de quadrados, a² + b², NÃO fatora nos números reais — reconhecer essa diferença ' +
      'evita um erro muito comum.',
    formulas: [
      { tex: 'a^{2} - b^{2} = (a + b)(a - b)' },
      { tex: 'a^{2} + b^{2} \;\\text{não fatora em } \\mathbb{R}' },
    ],
    demonstracao: [
      {
        descricao: 'Partimos do produto e expandimos.',
        tex: '(a+b)(a-b) = a^{2} - ab + ab - b^{2}',
      },
      {
        descricao: 'Os termos cruzados se cancelam.',
        tex: '= a^{2} - b^{2}',
      },
      {
        descricao: 'Para reconhecer o padrão: dois termos, ambos quadrados, subtraídos.',
        tex: '9x^{2} - 16 = (3x)^{2} - 4^{2} = (3x+4)(3x-4)',
      },
    ],
    exemplo: {
      enunciado: 'Fatorando 9x² − 16.',
      passos: fatorarComPassos(Polinomio.de(-16, 0, 9)).passos,
    },
    vejaTambem: ['fatoracao.trinomio', 'produtos.diferenca-de-quadrados'],
  },
  {
    id: 'fatoracao.trinomio',
    titulo: 'Trinômios',
    resumo: 'Procure dois números com a soma e o produto certos.',
    definicao:
      'Um trinômio x² + bx + c fatora em (x + m)(x + n) quando m + n = b e m·n = c. Quando o ' +
      'discriminante é zero, os dois números coincidem e o trinômio é um quadrado perfeito.',
    formulas: [
      { tex: 'x^{2} + (m+n)x + mn = (x+m)(x+n)' },
      { tex: 'a^{2} \\pm 2ab + b^{2} = (a \\pm b)^{2}', legenda: 'Trinômio quadrado perfeito.' },
    ],
    demonstracao: [
      {
        descricao: 'Expandindo o produto de dois binômios.',
        tex: '(x+m)(x+n) = x^{2} + nx + mx + mn = x^{2} + (m+n)x + mn',
      },
      {
        descricao: 'Comparando com o trinômio, os coeficientes revelam soma e produto.',
        tex: 'm + n = b \\qquad m \\cdot n = c',
        nota: 'Basta então testar os pares de divisores de c até achar os que somam b.',
      },
      {
        descricao: 'Quando m = n, os dois fatores são iguais e surge o quadrado perfeito.',
        tex: 'x^{2} - 6x + 9 = (x-3)^{2}',
      },
    ],
    exemplo: {
      enunciado: 'Fatorando x² − 5x + 6.',
      passos: fatorarComPassos(Polinomio.de(6, -5, 1)).passos,
    },
    vejaTambem: ['fatoracao.ideia', 'fatoracao.diferenca'],
  },
];
