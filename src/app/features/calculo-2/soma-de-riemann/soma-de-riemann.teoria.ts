import { riemannComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_RIEMANN: readonly Teoria[] = [
  {
    id: 'riemann.ideia',
    titulo: 'Área por retângulos',
    resumo: 'Aproximar o que não sabemos medir pelo que sabemos.',
    definicao:
      'Não sabemos calcular diretamente a área sob uma curva, mas sabemos calcular a de um ' +
      'retângulo. A soma de Riemann cobre a região com retângulos finos e soma suas áreas — ' +
      'quanto mais finos, melhor a aproximação.',
    formulas: [
      { tex: 'S_n = \\sum_{i=1}^{n} f(x_i)\\,\\Delta x' },
      { tex: '\\Delta x = \\frac{b - a}{n}' },
    ],
    demonstracao: [
      {
        descricao: 'Dividimos o intervalo em n partes iguais.',
        tex: '\\Delta x = \\frac{b-a}{n}',
      },
      {
        descricao: 'Cada retângulo tem essa largura e altura dada pela função.',
        tex: '\\text{área}_i = f(x_i) \\cdot \\Delta x',
      },
      {
        descricao: 'Somando todos, temos uma estimativa da área total.',
        tex: 'S_n = \\sum_{i=1}^{n} f(x_i)\\,\\Delta x',
        nota: 'O erro vem dos pedacinhos que sobram ou faltam no topo de cada retângulo.',
      },
    ],
    exemplo: {
      enunciado: 'Aproximando a área sob x² de 0 a 1 com 8 retângulos.',
      passos: riemannComPassos((x) => x * x, 0, 1, 8, 'esquerda').passos,
    },
    vejaTambem: ['riemann.escolha', 'riemann.limite'],
  },
  {
    id: 'riemann.escolha',
    titulo: 'Esquerda, direita ou meio',
    resumo: 'A altura pode ser tomada em qualquer ponto do subintervalo.',
    definicao:
      'Cada retângulo precisa de uma altura, e há várias escolhas razoáveis: o valor da ' +
      'função na borda esquerda, na direita ou no meio. Numa função crescente, a esquerda ' +
      'subestima e a direita superestima — e o ponto médio costuma acertar bem mais.',
    formulas: [
      { tex: 'x_i^{\\text{esq}} = a + (i-1)\\Delta x' },
      { tex: 'x_i^{\\text{dir}} = a + i\\,\\Delta x' },
      { tex: 'x_i^{\\text{med}} = a + \\left(i - \\tfrac{1}{2}\\right)\\Delta x' },
    ],
    demonstracao: [
      {
        descricao: 'Numa função crescente, a borda esquerda é o ponto mais baixo do subintervalo.',
        tex: 'S^{\\text{esq}} < A',
      },
      {
        descricao: 'E a direita é o mais alto.',
        tex: 'S^{\\text{dir}} > A',
        nota: 'A área verdadeira fica sempre espremida entre as duas.',
      },
      {
        descricao: 'O ponto médio compensa: erra para menos de um lado e para mais do outro.',
        tex: 'S^{\\text{med}} \\approx A',
      },
      {
        descricao: 'No limite, todas as escolhas convergem para o mesmo valor.',
        tex: '\\lim_{n \\to \\infty} S_n = A',
      },
    ],
    exemplo: {
      enunciado: 'A mesma área, aproximada pela direita.',
      passos: riemannComPassos((x) => x * x, 0, 1, 8, 'direita').passos,
    },
    vejaTambem: ['riemann.ideia', 'riemann.limite'],
  },
  {
    id: 'riemann.limite',
    titulo: 'O limite que define a integral',
    resumo: 'Refinando infinitamente, a aproximação vira igualdade.',
    definicao:
      'A integral definida é o limite da soma de Riemann quando o número de retângulos tende ' +
      'ao infinito. É o mesmo movimento conceitual da derivada: uma aproximação que melhora ' +
      'indefinidamente até virar valor exato.',
    formulas: [
      { tex: '\\int_{a}^{b} f(x)\\,dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_i)\\,\\Delta x' },
    ],
    demonstracao: [
      {
        descricao: 'Com poucos retângulos, sobram espaços grandes.',
        tex: 'n = 4 \\;\\Rightarrow\\; \\text{erro visível}',
      },
      {
        descricao: 'Dobrando n, o erro cai pela metade.',
        tex: 'n = 8,\\; 16,\\; 32,\\; \\ldots',
      },
      {
        descricao: 'No limite, o erro desaparece e sobra a área exata.',
        tex: '\\lim_{n \\to \\infty} S_n = \\int_{a}^{b} f(x)\\,dx',
        nota: 'O símbolo ∫ é um S alongado, de "soma" — a notação guarda a origem da ideia.',
      },
    ],
    exemplo: {
      enunciado: 'A convergência da soma conforme n cresce.',
      passos: riemannComPassos((x) => x * x, 0, 2, 10, 'ponto-medio').passos,
    },
    vejaTambem: ['riemann.ideia', 'integral-def.definicao'],
  },
];
