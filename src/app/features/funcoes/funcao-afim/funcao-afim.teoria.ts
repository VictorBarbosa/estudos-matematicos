import { analisarAfimComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_AFIM: readonly Teoria[] = [
  {
    id: 'afim.coeficientes',
    titulo: 'O que a e b significam',
    resumo: 'a é a inclinação; b é onde a reta corta o eixo y.',
    definicao:
      'Na função f(x) = ax + b, o coeficiente a diz quanto y muda a cada passo de x — é a taxa ' +
      'de variação. O coeficiente b é o valor inicial, onde a reta cruza o eixo vertical. ' +
      'Juntos, eles determinam a reta inteira.',
    formulas: [
      { tex: 'f(x) = ax + b' },
      { tex: 'a = \\frac{\\Delta y}{\\Delta x} = \\frac{f(x_2) - f(x_1)}{x_2 - x_1}', legenda: 'A taxa de variação.' },
    ],
    demonstracao: [
      {
        descricao: 'Em x = 0 o termo com a desaparece, sobrando apenas b.',
        tex: 'f(0) = a \\cdot 0 + b = b',
      },
      {
        descricao: 'Avançando uma unidade em x, o valor aumenta exatamente a.',
        tex: 'f(x+1) - f(x) = [a(x+1) + b] - [ax + b] = a',
        nota: 'É o que caracteriza a função afim: crescimento constante, sempre o mesmo passo.',
      },
      {
        descricao: 'Entre dois pontos quaisquer, a razão é sempre a mesma.',
        tex: '\\frac{\\Delta y}{\\Delta x} = a',
        nota: 'É por isso que o gráfico é uma reta, e não uma curva.',
      },
    ],
    exemplo: {
      enunciado: 'Analisando f(x) = 2x − 6.',
      passos: analisarAfimComPassos(2, -6).passos,
    },
    vejaTambem: ['afim.raiz', 'afim.crescimento'],
  },
  {
    id: 'afim.raiz',
    titulo: 'A raiz da função',
    resumo: 'O x que anula f, onde a reta cruza o eixo horizontal.',
    definicao:
      'A raiz é o valor de x para o qual f(x) = 0. Graficamente, é o ponto em que a reta ' +
      'atravessa o eixo x. Toda função afim com a ≠ 0 tem exatamente uma raiz, porque uma ' +
      'reta inclinada cruza o eixo uma única vez.',
    formulas: [{ tex: 'ax + b = 0 \\;\\Rightarrow\\; x = -\\frac{b}{a}' }],
    demonstracao: [
      {
        descricao: 'Igualamos a função a zero.',
        tex: 'ax + b = 0',
      },
      {
        descricao: 'Isolando x.',
        tex: 'x = -\\frac{b}{a}',
      },
      {
        descricao: 'Com a = 0 a reta fica horizontal e o raciocínio muda.',
        tex: 'f(x) = b \\quad \\text{para todo } x',
        nota: 'Ou não há raiz (b ≠ 0), ou todo x é raiz (b = 0).',
      },
    ],
    exemplo: {
      enunciado: 'A raiz de f(x) = −3x + 9.',
      passos: analisarAfimComPassos(-3, 9).passos,
    },
    vejaTambem: ['afim.coeficientes', 'equacao1.raiz'],
  },
  {
    id: 'afim.crescimento',
    titulo: 'Crescente, decrescente ou constante',
    resumo: 'O sinal de a decide, sozinho.',
    definicao:
      'Se a > 0, a cada passo à direita o valor sobe: a função é crescente. Se a < 0, desce: ' +
      'é decrescente. Se a = 0, nada muda: é constante. O coeficiente b não tem influência ' +
      'nenhuma sobre isso — ele apenas desloca a reta para cima ou para baixo.',
    formulas: [
      { tex: 'a > 0 \\to \\text{crescente} \\qquad a < 0 \\to \\text{decrescente} \\qquad a = 0 \\to \\text{constante}' },
    ],
    demonstracao: [
      {
        descricao: 'Tomamos dois pontos com x₂ > x₁.',
        tex: 'f(x_2) - f(x_1) = a(x_2 - x_1)',
      },
      {
        descricao: 'Como x₂ − x₁ é positivo, o sinal da diferença é o sinal de a.',
        tex: 'x_2 - x_1 > 0 \\;\\Rightarrow\\; \\operatorname{sinal}[f(x_2) - f(x_1)] = \\operatorname{sinal}(a)',
        nota: 'Mudar b soma a mesma constante aos dois lados e se cancela na diferença.',
      },
    ],
    exemplo: {
      enunciado: 'Uma função decrescente: f(x) = −2x + 5.',
      passos: analisarAfimComPassos(-2, 5).passos,
    },
    vejaTambem: ['afim.coeficientes'],
  },
];
