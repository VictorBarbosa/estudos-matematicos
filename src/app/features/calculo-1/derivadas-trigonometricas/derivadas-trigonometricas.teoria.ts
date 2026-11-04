import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_DERIVADAS_TRIG: readonly Teoria[] = [
  {
    id: 'trig-derivada.tabela',
    titulo: 'O ciclo das quatro derivadas',
    resumo: 'Seno vira cosseno, cosseno vira menos seno — e em quatro passos tudo volta.',
    definicao:
      'As derivadas do seno e do cosseno não saem da regra da potência: elas saem do limite ' +
      'fundamental do seno. O resultado é um ciclo de período quatro, e é por isso que seno e ' +
      'cosseno descrevem tudo o que oscila, de uma mola a uma corrente alternada.',
    formulas: [
      { tex: "\\left[\\operatorname{sen}(x)\\right]' = \\cos(x)" },
      { tex: "\\left[\\cos(x)\\right]' = -\\operatorname{sen}(x)" },
      {
        tex: '\\operatorname{sen} \\to \\cos \\to -\\operatorname{sen} \\to -\\cos \\to \\operatorname{sen}',
        legenda: 'Derivar quatro vezes devolve a função original.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Partimos da definição e abrimos o seno da soma.',
        tex: "\\operatorname{sen}'(x) = \\lim_{h \\to 0} \\frac{\\operatorname{sen}(x+h) - \\operatorname{sen}(x)}{h}",
      },
      {
        descricao: 'A fórmula da soma separa o que depende de h.',
        tex: '\\operatorname{sen}(x+h) = \\operatorname{sen}(x)\\cos(h) + \\cos(x)\\operatorname{sen}(h)',
      },
      {
        descricao: 'Agrupando, sobram dois limites conhecidos.',
        tex: '\\operatorname{sen}(x)\\cdot\\frac{\\cos h - 1}{h} + \\cos(x)\\cdot\\frac{\\operatorname{sen} h}{h}',
      },
      {
        descricao: 'O primeiro tende a zero e o segundo a um — é o limite fundamental.',
        tex: '\\lim_{h \\to 0}\\frac{\\operatorname{sen} h}{h} = 1 \\qquad \\lim_{h \\to 0}\\frac{\\cos h - 1}{h} = 0',
        nota: 'É aqui que o radiano importa: em graus esses limites seriam outros.',
      },
      {
        descricao: 'Sobra apenas o cosseno.',
        tex: "\\operatorname{sen}'(x) = \\cos(x)",
      },
    ],
    vejaTambem: ['trig-derivada.sinal', 'trig-derivada.cadeia', 'trig-derivada.tangente'],
  },
  {
    id: 'trig-derivada.sinal',
    titulo: 'O menos que pertence ao cosseno',
    resumo: 'O cosseno começa descendo, e o sinal negativo registra isso.',
    definicao:
      'A derivada do cosseno é menos o seno, e o sinal não é convenção: em x igual a zero o ' +
      'cosseno está no seu máximo e começa a cair, de modo que a taxa de variação logo depois ' +
      'é negativa. Esquecer esse menos leva a um resultado exatamente simétrico do correto.',
    formulas: [
      { tex: "\\left[\\cos(x)\\right]' = -\\operatorname{sen}(x)" },
      { tex: "\\cos'(0) = 0 \\qquad \\cos'\\left(\\tfrac{\\pi}{2}\\right) = -1" },
    ],
    demonstracao: [
      {
        descricao: 'Em zero o cosseno vale 1, que é o maior valor que ele assume.',
        tex: '\\cos(0) = 1',
      },
      {
        descricao: 'Um pouco adiante ele já é menor.',
        tex: '\\cos\\left(\\tfrac{\\pi}{6}\\right) \\approx 0{,}866',
      },
      {
        descricao: 'Função que decresce tem derivada negativa, e o seno ali é positivo.',
        tex: "\\cos'\\left(\\tfrac{\\pi}{6}\\right) = -\\operatorname{sen}\\left(\\tfrac{\\pi}{6}\\right) = -\\tfrac{1}{2}",
        nota: 'O sinal de menos é o que faz a conta concordar com o gráfico.',
      },
    ],
    vejaTambem: ['trig-derivada.tabela', 'trig-derivada.potencia'],
  },
  {
    id: 'trig-derivada.cadeia',
    titulo: 'Quando o argumento não é x',
    resumo: 'Um múltiplo no argumento multiplica a derivada inteira.',
    definicao:
      'A tabela vale para o argumento x e mais nada. Quando o argumento é um múltiplo de x, a ' +
      'regra da cadeia acrescenta o fator interno, e a amplitude da derivada cresce com ele — ' +
      'é o que diz, fisicamente, que uma oscilação mais rápida tem velocidade maior.',
    formulas: [
      { tex: "\\left[\\operatorname{sen}(kx)\\right]' = k\\cos(kx)" },
      { tex: "\\left[\\cos(kx)\\right]' = -k\\operatorname{sen}(kx)" },
    ],
    demonstracao: [
      {
        descricao: 'Separamos as camadas: a função de fora e o múltiplo de dentro.',
        tex: 'u = 3x \\qquad f = \\operatorname{sen}(u)',
      },
      {
        descricao: 'A derivada externa mantém o miolo, e a interna vira fator.',
        tex: "f'(x) = \\cos(3x)\\cdot 3 = 3\\cos(3x)",
      },
      {
        descricao: 'Conferindo num ponto: em x igual a zero a inclinação é três vezes maior.',
        tex: "f'(0) = 3\\cos(0) = 3",
        nota: 'A onda de frequência tripla sobe três vezes mais depressa na origem.',
      },
    ],
    vejaTambem: ['trig-derivada.tabela', 'trig-derivada.tangente', 'trig-derivada.potencia'],
  },
  {
    id: 'trig-derivada.tangente',
    titulo: 'A derivada da tangente',
    resumo: 'Secante ao quadrado, e por isso nunca negativa.',
    definicao:
      'A tangente é o quociente do seno pelo cosseno, e derivá-la é aplicar a regra do ' +
      'quociente uma vez. O que sai é a secante ao quadrado: uma expressão sempre positiva, ' +
      'que explica por que a tangente é crescente em todo intervalo em que existe.',
    formulas: [
      { tex: "\\left[\\tan(x)\\right]' = \\sec^{2}(x) = \\frac{1}{\\cos^{2}(x)}" },
      {
        tex: "\\left[\\tan(x)\\right]' = 1 + \\tan^{2}(x)",
        legenda: 'A mesma derivada, por outra identidade.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Escrevemos a tangente como quociente.',
        tex: '\\tan(x) = \\frac{\\operatorname{sen}(x)}{\\cos(x)}',
      },
      {
        descricao: 'Aplicamos a regra do quociente.',
        tex: "\\tan'(x) = \\frac{\\cos(x)\\cos(x) - \\operatorname{sen}(x)\\left(-\\operatorname{sen}(x)\\right)}{\\cos^{2}(x)}",
      },
      {
        descricao: 'O numerador é a identidade fundamental.',
        tex: '\\frac{\\cos^{2}(x) + \\operatorname{sen}^{2}(x)}{\\cos^{2}(x)} = \\frac{1}{\\cos^{2}(x)}',
      },
      {
        descricao: 'E o inverso do cosseno ao quadrado é a secante ao quadrado.',
        tex: "\\tan'(x) = \\sec^{2}(x) \\geq 1",
        nota: 'Nunca é menor que 1, o que confirma que a tangente só cresce.',
      },
    ],
    vejaTambem: ['trig-derivada.tabela', 'trig-derivada.cadeia'],
  },
  {
    id: 'trig-derivada.produto',
    titulo: 'Potência vezes trigonométrica',
    resumo: 'Duas parcelas, nunca uma só.',
    definicao:
      'Produtos como x vezes o seno de x aparecem em toda oscilação que cresce ou se amortece. ' +
      'A regra do produto manda somar duas parcelas: a derivada do primeiro fator multiplicada ' +
      'pelo segundo, mais o primeiro multiplicado pela derivada do segundo.',
    formulas: [
      { tex: "(uv)' = u'v + uv'" },
      {
        tex: "\\left[x^{n}\\operatorname{sen}(x)\\right]' = nx^{n-1}\\operatorname{sen}(x) + x^{n}\\cos(x)",
      },
    ],
    demonstracao: [
      {
        descricao: 'Tomamos a potência como primeiro fator e o seno como segundo.',
        tex: 'u = x^{2} \\qquad v = \\operatorname{sen}(x)',
      },
      {
        descricao: 'Cada um entra uma vez derivado e uma vez intacto.',
        tex: "f'(x) = 2x\\operatorname{sen}(x) + x^{2}\\cos(x)",
      },
      {
        descricao: 'Em zero as duas parcelas se anulam, e a curva encosta no eixo.',
        tex: "f'(0) = 0 + 0 = 0",
        nota: 'Escrever só uma das parcelas é o erro mais frequente deste formato.',
      },
    ],
    vejaTambem: ['trig-derivada.tabela', 'trig-derivada.potencia'],
  },
  {
    id: 'trig-derivada.potencia',
    titulo: 'Potência de função trigonométrica',
    resumo: 'A potência por fora, a trigonométrica por dentro — e a cadeia entre as duas.',
    definicao:
      'Escrever o seno elevado a n quer dizer elevar o seno à potência n, e não calcular o seno ' +
      'de x elevado a n. A derivada tem duas camadas: desce o expoente, diminui o grau em um e ' +
      'multiplica pela derivada da função de dentro.',
    formulas: [
      { tex: "\\left[\\operatorname{sen}^{n}(x)\\right]' = n\\operatorname{sen}^{n-1}(x)\\cos(x)" },
      { tex: "\\left[\\cos^{n}(x)\\right]' = -n\\cos^{n-1}(x)\\operatorname{sen}(x)" },
    ],
    demonstracao: [
      {
        descricao: 'Nomeamos o miolo para enxergar as camadas.',
        tex: 'u = \\operatorname{sen}(x) \\qquad f = u^{2}',
      },
      {
        descricao: 'Derivamos a potência e multiplicamos pela derivada do miolo.',
        tex: "f'(x) = 2\\operatorname{sen}(x)\\cos(x)",
      },
      {
        descricao: 'Conferindo pela identidade do arco duplo.',
        tex: '2\\operatorname{sen}(x)\\cos(x) = \\operatorname{sen}(2x)',
        nota: 'A derivada do seno ao quadrado é o seno do arco duplo, o que fecha a conta.',
      },
    ],
    vejaTambem: ['trig-derivada.cadeia', 'trig-derivada.produto', 'trig-derivada.sinal'],
  },
];
