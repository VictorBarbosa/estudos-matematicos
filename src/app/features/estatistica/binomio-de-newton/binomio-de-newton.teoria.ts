import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_BINOMIO: readonly Teoria[] = [
  {
    id: 'binomio.pascal',
    titulo: 'O triângulo de Pascal',
    resumo: 'Cada número é a soma dos dois acima; a linha n traz os C(n, k).',
    definicao:
      'Ao multiplicar (a + b) por si mesmo n vezes, cada termo do resultado escolhe, em cada ' +
      'parêntese, a ou b. O número de modos de escolher b exatamente k vezes é C(n, k) — por isso ' +
      'os coeficientes de (a + b)ⁿ são as combinações. Dispostos em linhas, eles formam o ' +
      'triângulo de Pascal, em que cada número é a soma dos dois de cima (relação de Stifel).',
    formulas: [
      { tex: '\\binom{n}{k} = \\frac{n!}{k!\\,(n - k)!}' },
      {
        tex: '\\binom{n}{k} = \\binom{n - 1}{k - 1} + \\binom{n - 1}{k}',
        legenda: 'Stifel: a regra que monta o triângulo.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Para escolher k de n objetos, olhe para um objeto fixo: ou ele entra, ou não.',
        tex: '\\underbrace{\\binom{n-1}{k-1}}_{\\text{entra}} + \\underbrace{\\binom{n-1}{k}}_{\\text{não entra}}',
      },
      {
        descricao: 'As duas contagens somadas cobrem todas as escolhas, sem repetir.',
        tex: '= \\binom{n}{k}',
      },
    ],
    exemplo: {
      enunciado: 'A linha 5 do triângulo.',
      passos: [
        { descricao: 'A linha 4 é 1 4 6 4 1.', tex: '1 \\quad 4 \\quad 6 \\quad 4 \\quad 1' },
        {
          descricao: 'Somando vizinhos (e 1 nas pontas).',
          tex: '1 \\quad 5 \\quad 10 \\quad 10 \\quad 5 \\quad 1',
        },
        {
          descricao: 'São os coeficientes de (a + b)⁵.',
          tex: 'a^{5} + 5a^{4}b + 10a^{3}b^{2} + 10a^{2}b^{3} + 5ab^{4} + b^{5}',
        },
      ],
    },
    vejaTambem: ['binomio.termo-geral', 'combinatoria.combinacao'],
  },
  {
    id: 'binomio.termo-geral',
    titulo: 'O termo geral',
    resumo: 'T(k+1) = C(n, k)·aⁿ⁻ᵏ·bᵏ — e o primeiro termo é k = 0.',
    definicao:
      'Em (a + b)ⁿ, o termo em que b aparece k vezes é C(n, k)·aⁿ⁻ᵏ·bᵏ. Para achar o coeficiente ' +
      'de uma potência de x, escolha o k que dá aquela potência e calcule os três fatores — com o ' +
      'sinal, se b for negativo, e com a potência do número que acompanha o x. O termo de ordem ' +
      'k + 1 (contando do primeiro) usa o índice k.',
    formulas: [
      { tex: 'T_{k+1} = \\binom{n}{k} a^{n-k} b^{k}' },
      { tex: '(a - b)^{n}: \\text{ o sinal de } (-b)^{k} \\text{ alterna}' },
    ],
    demonstracao: [
      {
        descricao: 'Escolher b em k dos n parênteses e a nos outros dá aⁿ⁻ᵏbᵏ.',
        tex: '\\underbrace{(a + b)(a + b)\\cdots(a + b)}_{n}',
      },
      {
        descricao: 'Há C(n, k) modos de escolher quais k parênteses fornecem o b.',
        tex: '\\binom{n}{k}\\, a^{n-k} b^{k}',
      },
    ],
    exemplo: {
      enunciado: 'O coeficiente de x³ em (2x − 1)⁵.',
      passos: [
        { descricao: 'x³ vem de k = 3 escolhas do 2x.', tex: '\\binom{5}{3}(2x)^{3}(-1)^{2}' },
        { descricao: 'Calculando.', tex: '10 \\cdot 8 \\cdot 1 = 80' },
      ],
    },
    vejaTambem: ['binomio.pascal', 'binomio.independente'],
  },
  {
    id: 'binomio.soma-coeficientes',
    titulo: 'A soma dos coeficientes',
    resumo: 'Substitua x = 1: sobra só a soma.',
    definicao:
      'Num polinômio P(x), fazer x = 1 transforma cada termo no seu coeficiente. Então a soma ' +
      'dos coeficientes do desenvolvimento de (ax + b)ⁿ é (a + b)ⁿ, sem expandir nada. Em ' +
      'particular, a soma da linha n do triângulo de Pascal é 2ⁿ.',
    formulas: [
      { tex: '\\sum \\text{coeficientes} = P(1) = (a + b)^{n}' },
      { tex: '\\sum_{k=0}^{n} \\binom{n}{k} = 2^{n}' },
    ],
    demonstracao: [
      {
        descricao: 'Cada termo cₖxᵏ vale cₖ em x = 1.',
        tex: 'P(1) = c_0 + c_1 + \\cdots + c_n',
      },
    ],
    exemplo: {
      enunciado: 'A soma dos coeficientes de (3x − 1)⁴.',
      passos: [{ descricao: 'Com x = 1.', tex: '(3 - 1)^{4} = 2^{4} = 16' }],
    },
    vejaTambem: ['binomio.pascal'],
  },
  {
    id: 'binomio.independente',
    titulo: 'O termo independente',
    resumo: 'Escreva o expoente de x no termo geral e iguale a zero.',
    definicao:
      'Quando o binômio mistura x e 1/x, alguns termos podem ficar sem x. Para achá-los, ' +
      'escreva o expoente de x no termo geral em função de k e resolva «expoente = 0». O k que ' +
      'sai (se for inteiro entre 0 e n) dá o termo; se não for inteiro, não há termo independente.',
    formulas: [
      {
        tex: '\\left(x^{p} + \\frac{c}{x}\\right)^{n}: \\; x^{p(n-k)} \\cdot x^{-k} \\;\\Rightarrow\\; p(n - k) - k = 0',
      },
    ],
    demonstracao: [
      {
        descricao: 'O termo geral junta as potências de x dos dois fatores.',
        tex: '\\binom{n}{k}(x^{p})^{n-k}\\left(\\frac{c}{x}\\right)^{k} = \\binom{n}{k}c^{k}x^{p(n-k)-k}',
      },
    ],
    exemplo: {
      enunciado: 'O termo sem x em (x + 2/x)⁶.',
      passos: [
        { descricao: 'Expoente de x.', tex: '(6 - k) - k = 0 \\;\\Rightarrow\\; k = 3' },
        { descricao: 'O termo.', tex: '\\binom{6}{3} \\cdot 2^{3} = 20 \\cdot 8 = 160' },
      ],
    },
    vejaTambem: ['binomio.termo-geral'],
  },
];
