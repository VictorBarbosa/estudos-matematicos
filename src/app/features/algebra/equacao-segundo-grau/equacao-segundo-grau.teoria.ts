import { resolverQuadraticaComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_EQUACAO_2: readonly Teoria[] = [
  {
    id: 'equacao2.discriminante',
    titulo: 'O discriminante',
    resumo: 'Δ decide quantas raízes existem, antes de qualquer conta.',
    definicao:
      'O discriminante Δ = b² − 4ac é o que fica sob a raiz quadrada na fórmula de Bhaskara. ' +
      'Como não existe raiz quadrada real de número negativo, só o sinal de Δ já responde ' +
      'quantas raízes reais a equação tem — sem precisar terminar o cálculo.',
    formulas: [
      { tex: '\\Delta = b^{2} - 4ac' },
      {
        tex: '\\Delta > 0 \\to 2 \\text{ raízes} \\qquad \\Delta = 0 \\to 1 \\qquad \\Delta < 0 \\to 0',
      },
    ],
    demonstracao: [
      {
        descricao: 'Na fórmula, o discriminante aparece dentro da raiz.',
        tex: 'x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}',
      },
      {
        descricao: 'Se Δ > 0, a raiz é um número positivo e o ± gera dois valores distintos.',
        tex: '\\frac{-b + \\sqrt{\\Delta}}{2a} \\neq \\frac{-b - \\sqrt{\\Delta}}{2a}',
      },
      {
        descricao: 'Se Δ = 0, somar ou subtrair zero dá o mesmo: a raiz é única.',
        tex: 'x = \\frac{-b}{2a}',
        nota: 'Esse valor é exatamente a abscissa do vértice — a parábola tangencia o eixo x.',
      },
      {
        descricao: 'Se Δ < 0, não há raiz quadrada real, e a parábola não toca o eixo x.',
        tex: '\\sqrt{\\Delta} \\notin \\mathbb{R}',
      },
    ],
    exemplo: {
      enunciado: 'Resolvendo x² − 5x + 6 = 0.',
      passos: resolverQuadraticaComPassos(1, -5, 6).passos,
    },
    vejaTambem: ['equacao2.bhaskara', 'equacao2.vertice'],
  },
  {
    id: 'equacao2.bhaskara',
    titulo: 'De onde vem a fórmula',
    resumo: 'Bhaskara é o completamento de quadrado feito uma vez, no caso geral.',
    definicao:
      'A fórmula não caiu do céu: ela é o resultado de completar o quadrado em ax² + bx + c = 0 ' +
      'com letras em vez de números. Fazer isso uma vez poupa fazê-lo em todos os exercícios.',
    formulas: [{ tex: 'x = \\frac{-b \\pm \\sqrt{b^{2} - 4ac}}{2a}' }],
    demonstracao: [
      {
        descricao: 'Dividimos tudo por a para deixar o x² sozinho.',
        tex: 'x^{2} + \\frac{b}{a}x + \\frac{c}{a} = 0',
      },
      {
        descricao:
          'Completamos o quadrado: somamos e subtraímos o quadrado da metade do coeficiente de x.',
        tex: '\\left(x + \\frac{b}{2a}\\right)^{2} - \\frac{b^{2}}{4a^{2}} + \\frac{c}{a} = 0',
      },
      {
        descricao: 'Isolamos o quadrado.',
        tex: '\\left(x + \\frac{b}{2a}\\right)^{2} = \\frac{b^{2} - 4ac}{4a^{2}}',
        nota: 'O numerador que apareceu é justamente o discriminante.',
      },
      {
        descricao: 'Extraímos a raiz dos dois lados — e é aqui que entra o ±.',
        tex: 'x + \\frac{b}{2a} = \\pm\\frac{\\sqrt{\\Delta}}{2a}',
      },
      {
        descricao: 'Isolando x, chegamos à fórmula.',
        tex: 'x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}',
      },
    ],
    exemplo: {
      enunciado: 'Uma equação com raiz dupla: x² − 4x + 4 = 0.',
      passos: resolverQuadraticaComPassos(1, -4, 4).passos,
    },
    vejaTambem: ['equacao2.discriminante', 'equacao2.girard'],
  },
  {
    id: 'equacao2.vertice',
    titulo: 'Vértice e concavidade',
    resumo: 'O sinal de a diz para onde a parábola abre; o vértice é o extremo.',
    definicao:
      'A parábola é simétrica em relação à reta vertical que passa pelo vértice. Por isso as ' +
      'duas raízes, quando existem, ficam à mesma distância dele — e o vértice está sempre na ' +
      'média delas.',
    formulas: [
      { tex: 'x_v = \\frac{-b}{2a} \\qquad y_v = \\frac{-\\Delta}{4a}' },
      {
        tex: 'a > 0 \\to \\text{abre para cima, mínimo} \\qquad a < 0 \\to \\text{abre para baixo, máximo}',
      },
    ],
    demonstracao: [
      {
        descricao: 'As duas raízes são simétricas em torno de −b/2a.',
        tex: 'x_{1,2} = \\frac{-b}{2a} \\pm \\frac{\\sqrt{\\Delta}}{2a}',
        nota: 'O primeiro termo é o centro; o segundo é o mesmo deslocamento para cada lado.',
      },
      {
        descricao: 'A média das raízes elimina o deslocamento e devolve o centro.',
        tex: '\\frac{x_1 + x_2}{2} = \\frac{-b}{2a} = x_v',
      },
      {
        descricao: 'Substituindo na função, obtemos a altura do vértice.',
        tex: 'y_v = f(x_v) = \\frac{-\\Delta}{4a}',
      },
    ],
    exemplo: {
      enunciado: 'Uma parábola que não cruza o eixo x: x² + 4 = 0.',
      passos: resolverQuadraticaComPassos(1, 0, 4).passos,
    },
    vejaTambem: ['equacao2.discriminante', 'equacao2.girard'],
  },
  {
    id: 'equacao2.girard',
    titulo: 'Soma e produto das raízes',
    resumo: 'Dá para achar as raízes sem Bhaskara, quando elas são inteiras.',
    definicao:
      'As relações de Girard ligam os coeficientes diretamente à soma e ao produto das ' +
      'raízes. Em equações com raízes inteiras pequenas, procurar dois números com essa soma ' +
      'e esse produto é mais rápido que aplicar a fórmula.',
    formulas: [{ tex: 'x_1 + x_2 = -\\frac{b}{a} \\qquad x_1 \\cdot x_2 = \\frac{c}{a}' }],
    demonstracao: [
      {
        descricao: 'Toda equação com raízes r₁ e r₂ pode ser escrita na forma fatorada.',
        tex: 'a(x - x_1)(x - x_2) = 0',
      },
      {
        descricao: 'Expandindo o produto.',
        tex: 'a\\left[x^{2} - (x_1 + x_2)x + x_1 x_2\\right] = 0',
      },
      {
        descricao: 'Comparando com ax² + bx + c, os coeficientes têm de coincidir.',
        tex: 'b = -a(x_1 + x_2) \\qquad c = a \\, x_1 x_2',
        nota: 'Dividindo por a, chegamos às duas relações.',
      },
    ],
    exemplo: {
      enunciado: 'Em x² − 5x + 6, procuramos dois números que somem 5 e multipliquem 6.',
      passos: resolverQuadraticaComPassos(1, -5, 6).passos,
    },
    vejaTambem: ['equacao2.bhaskara', 'equacao2.vertice'],
  },
];
