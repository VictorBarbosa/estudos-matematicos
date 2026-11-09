import { Polinomio, fatorarComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

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
      { tex: 'A \\cdot B = 0 \\iff A = 0 \\;\\text{ou}\\; B = 0', legenda: 'O motivo de fatorar.' },
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
        tex: 'x^{2} - 5x + 6 = 0 \\;\\Rightarrow\\; (x-2)(x-3) = 0 \\;\\Rightarrow\\; x = 2 \\text{ ou } x = 3',
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
      { tex: 'a^{2} + b^{2} \\;\\text{não fatora em } \\mathbb{R}' },
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
    vejaTambem: ['fatoracao.ideia', 'fatoracao.diferenca', 'fatoracao.agrupamento'],
  },
  {
    id: 'fatoracao.agrupamento',
    titulo: 'Fatoração por agrupamento',
    resumo: 'Quatro termos: fator comum em cada par, e o parêntese repetido vira fator.',
    definicao:
      'Quando a expressão tem quatro termos e nenhum fator comum a todos, separa-se em dois ' +
      'pares e tira-se o fator comum de cada par. Se a escolha foi boa, o mesmo parêntese ' +
      'aparece nos dois pares — e ele passa a ser fator comum da expressão inteira. É a ' +
      'técnica de ax + ay + bx + by = (a + b)(x + y), e também a de polinômios de grau 3 ' +
      'como x³ + 2x² − 9x − 18.',
    formulas: [
      { tex: 'ax + ay + bx + by = a(x + y) + b(x + y) = (a + b)(x + y)' },
      {
        tex: 'x^{3} + px^{2} + qx + pq = x^{2}(x + p) + q(x + p) = (x + p)(x^{2} + q)',
        legenda: 'O padrão do grau 3: o termo solto é o produto dos outros dois coeficientes.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Tiramos o fator comum de cada par.',
        tex: 'ax + ay = a(x + y) \\qquad bx + by = b(x + y)',
      },
      {
        descricao: 'O parêntese (x + y) se repete: colocamos ele em evidência.',
        tex: 'a(x + y) + b(x + y) = (x + y)(a + b)',
        nota: 'Se os parênteses saírem diferentes, troque o agrupamento ou o sinal do fator tirado.',
      },
    ],
    exemplo: {
      enunciado: 'Fatorando x³ + 2x² − 9x − 18 e achando as raízes.',
      passos: [
        {
          descricao: 'Dois pares.',
          tex: '\\left(x^{3} + 2x^{2}\\right) + \\left(-9x - 18\\right)',
        },
        {
          descricao: 'Fator comum de cada par: x² no primeiro, −9 no segundo.',
          tex: 'x^{2}(x + 2) - 9(x + 2)',
        },
        {
          descricao: 'O parêntese repetido em evidência, e o que sobra é diferença de quadrados.',
          tex: '(x + 2)(x^{2} - 9) = (x + 2)(x - 3)(x + 3)',
        },
        {
          descricao: 'Cada fator nulo dá uma raiz.',
          tex: 'x = -2,\\; x = 3,\\; x = -3',
        },
      ],
    },
    vejaTambem: ['fatoracao.ideia', 'fatoracao.diferenca', 'fatoracao.cubos'],
  },
  {
    id: 'fatoracao.cubos',
    titulo: 'Soma e diferença de cubos',
    resumo: 'u³ ± v³ = (u ± v)(u² ∓ uv + v²): o segundo fator nunca zera.',
    definicao:
      'A diferença de cubos fatora em (u − v)(u² + uv + v²) e a soma em (u + v)(u² − uv + v²). ' +
      'O fator do 1º grau carrega o mesmo sinal da expressão; o do 2º grau tem o sinal do meio ' +
      'trocado. Esse segundo fator tem discriminante negativo, então, nos reais, a única raiz ' +
      'vem do primeiro: u³ − v³ = 0 só quando u = v.',
    formulas: [
      { tex: 'u^{3} - v^{3} = (u - v)(u^{2} + uv + v^{2})' },
      { tex: 'u^{3} + v^{3} = (u + v)(u^{2} - uv + v^{2})' },
    ],
    demonstracao: [
      {
        descricao: 'Multiplicando o lado direito da diferença, os termos do meio se cancelam.',
        tex: '(u - v)(u^{2} + uv + v^{2}) = u^{3} + u^{2}v + uv^{2} - u^{2}v - uv^{2} - v^{3} = u^{3} - v^{3}',
      },
      {
        descricao: 'O fator do 2º grau não tem raiz real.',
        tex: '\\Delta = v^{2} - 4v^{2} = -3v^{2} < 0 \\quad (v \\neq 0)',
        nota: 'Por isso x³ − 8 = 0 tem só a raiz real x = 2.',
      },
    ],
    exemplo: {
      enunciado: 'Resolvendo 8x³ + 27 = 0.',
      passos: [
        {
          descricao: 'Os dois termos são cubos: 8x³ = (2x)³ e 27 = 3³.',
          tex: '8x^{3} + 27 = (2x)^{3} + 3^{3}',
        },
        {
          descricao: 'Soma de cubos, com u = 2x e v = 3.',
          tex: '(2x + 3)(4x^{2} - 6x + 9)',
        },
        {
          descricao: 'O segundo fator tem Δ = 36 − 144 < 0; a raiz real vem do primeiro.',
          tex: '2x + 3 = 0 \\;\\Rightarrow\\; x = \\frac{-3}{2}',
        },
      ],
    },
    vejaTambem: ['fatoracao.agrupamento', 'produtos.cubo'],
  },
];
