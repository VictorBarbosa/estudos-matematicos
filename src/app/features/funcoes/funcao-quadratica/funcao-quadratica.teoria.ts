import { resolverQuadraticaComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_QUADRATICA: readonly Teoria[] = [
  {
    id: 'quadratica.parabola',
    titulo: 'A parábola e seus elementos',
    resumo: 'Concavidade, vértice e eixo de simetria.',
    definicao:
      'O gráfico de f(x) = ax² + bx + c é sempre uma parábola. O sinal de a decide para onde ' +
      'ela abre; o vértice é seu ponto extremo; e o eixo vertical que passa pelo vértice ' +
      'divide a curva em duas metades espelhadas.',
    formulas: [
      { tex: 'f(x) = ax^{2} + bx + c \\quad (a \\neq 0)' },
      { tex: 'x_v = -\\frac{b}{2a} \\qquad y_v = f(x_v) = -\\frac{\\Delta}{4a}' },
    ],
    demonstracao: [
      {
        descricao: 'Completando o quadrado, a função revela sua forma canônica.',
        tex: 'f(x) = a\\left(x + \\frac{b}{2a}\\right)^{2} - \\frac{\\Delta}{4a}',
      },
      {
        descricao: 'O quadrado é sempre ≥ 0, então o menor valor da parcela ocorre quando ele é zero.',
        tex: '\\left(x + \\frac{b}{2a}\\right)^{2} = 0 \\;\\Rightarrow\\; x = -\\frac{b}{2a}',
        nota: 'É exatamente a abscissa do vértice — e ela sai da álgebra, não de memorização.',
      },
      {
        descricao: 'Nesse ponto sobra apenas a constante, que é a altura do vértice.',
        tex: 'y_v = -\\frac{\\Delta}{4a}',
      },
      {
        descricao: 'Com a > 0 o quadrado soma, e o vértice é mínimo; com a < 0, é máximo.',
        tex: 'a > 0 \\to \\text{mínimo} \\qquad a < 0 \\to \\text{máximo}',
      },
    ],
    exemplo: {
      enunciado: 'Analisando f(x) = x² − 4x + 3.',
      passos: resolverQuadraticaComPassos(1, -4, 3).passos,
    },
    vejaTambem: ['quadratica.raizes', 'quadratica.otimizacao'],
  },
  {
    id: 'quadratica.raizes',
    titulo: 'Raízes e o discriminante',
    resumo: 'Quantas vezes a parábola cruza o eixo x.',
    definicao:
      'As raízes da função são os pontos em que a parábola encontra o eixo horizontal. O ' +
      'discriminante decide a quantidade: duas, uma ou nenhuma — e, graficamente, isso ' +
      'corresponde a cruzar, tangenciar ou passar longe do eixo.',
    formulas: [
      { tex: '\\Delta = b^{2} - 4ac' },
      { tex: 'x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}' },
    ],
    demonstracao: [
      {
        descricao: 'Com Δ > 0, o vértice está de um lado do eixo e a curva o atravessa duas vezes.',
        tex: '\\Delta > 0 \\;\\Rightarrow\\; 2 \\text{ raízes}',
      },
      {
        descricao: 'Com Δ = 0, o vértice ESTÁ sobre o eixo: a parábola apenas encosta.',
        tex: 'y_v = -\\frac{0}{4a} = 0',
      },
      {
        descricao: 'Com Δ < 0, o vértice e toda a curva ficam do mesmo lado do eixo.',
        tex: '\\Delta < 0 \\;\\Rightarrow\\; \\text{nenhuma raiz real}',
        nota: 'A função nunca muda de sinal — ou é sempre positiva, ou sempre negativa.',
      },
    ],
    exemplo: {
      enunciado: 'Uma parábola que não toca o eixo x: f(x) = x² + x + 2.',
      passos: resolverQuadraticaComPassos(1, 1, 2).passos,
    },
    vejaTambem: ['quadratica.parabola', 'equacao2.discriminante'],
  },
  {
    id: 'quadratica.otimizacao',
    titulo: 'Máximos e mínimos',
    resumo: 'O vértice responde problemas de otimização sem cálculo.',
    definicao:
      'Muitos problemas práticos — área máxima, custo mínimo, altura máxima de um lançamento — ' +
      'levam a uma função quadrática. Como o vértice é o ponto extremo da parábola, basta ' +
      'calculá-lo para resolver.',
    formulas: [
      { tex: '\\text{valor ótimo em } x_v = -\\frac{b}{2a}' },
    ],
    demonstracao: [
      {
        descricao: 'Exemplo: com 20 m de cerca, qual retângulo tem área máxima?',
        tex: '2x + 2y = 20 \\;\\Rightarrow\\; y = 10 - x',
      },
      {
        descricao: 'A área em função de um lado é uma quadrática.',
        tex: 'A(x) = x(10 - x) = -x^{2} + 10x',
      },
      {
        descricao: 'Como a < 0, a parábola abre para baixo e o vértice é o máximo.',
        tex: 'x_v = \\frac{-10}{2 \\cdot (-1)} = 5',
        nota: 'O retângulo de área máxima é o quadrado de lado 5 — um resultado clássico.',
      },
      {
        descricao: 'A área máxima é a altura do vértice.',
        tex: 'A(5) = 25',
      },
    ],
    exemplo: {
      enunciado: 'A função da área: A(x) = −x² + 10x.',
      passos: resolverQuadraticaComPassos(-1, 10, 0).passos,
    },
    vejaTambem: ['quadratica.parabola', 'quadratica.raizes'],
  },
];
