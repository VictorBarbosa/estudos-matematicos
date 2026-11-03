import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_EDO1: readonly Teoria[] = [
  {
    id: 'edo1.separavel',
    titulo: 'Separar as variáveis',
    resumo: 'Cada variável de um lado, e integra-se os dois.',
    definicao:
      'Uma EDO não descreve uma grandeza: descreve a REGRA pela qual ela muda. Quando a ' +
      'equação permite agrupar tudo que tem y de um lado e tudo que tem t do outro, basta ' +
      'integrar os dois lados. O caso mais importante é a taxa proporcional ao próprio valor, ' +
      'que produz a exponencial — e descreve juros, decaimento e população sem limite.',
    formulas: [
      { tex: "\\frac{dy}{dt} = ky \\;\\Longrightarrow\\; y(t) = y_{0}e^{kt}" },
      { tex: '\\frac{dy}{y} = k\\,dt' },
    ],
    demonstracao: [
      {
        descricao: 'Separamos as variáveis.',
        tex: '\\frac{dy}{y} = k\\,dt',
      },
      {
        descricao: 'Integramos os dois lados.',
        tex: '\\ln|y| = kt + C',
      },
      {
        descricao: 'Exponenciando, a constante vira fator.',
        tex: 'y = Ae^{kt}',
        nota: 'A solução não é uma função: é uma família inteira delas.',
      },
      {
        descricao: 'A taxa é sempre proporcional ao valor atual.',
        tex: "y'(t) = kAe^{kt} = ky(t) \\;\\checkmark",
        nota: 'É essa proporcionalidade que faz a exponencial aparecer em tantos lugares.',
      },
    ],
    vejaTambem: ['edo1.condicao-inicial', 'edo1.meia-vida', 'edo1.fator-integrante'],
  },
  {
    id: 'edo1.condicao-inicial',
    titulo: 'A condição inicial escolhe uma solução',
    resumo: 'A solução geral é uma família; a inicial aponta um membro.',
    definicao:
      'Integrar uma EDO de primeira ordem deixa uma constante livre, e com ela uma família ' +
      'infinita de soluções. A condição inicial é o que escolhe uma delas — e por isso ela não ' +
      'é um detalhe do enunciado, é parte do problema. Sem ela, a resposta certa é a família.',
    formulas: [
      { tex: 'y(t) = Ae^{kt} \\qquad \\text{(geral)}' },
      { tex: 'y(0) = y_{0} \\;\\Longrightarrow\\; A = y_{0} \\qquad \\text{(particular)}' },
    ],
    demonstracao: [
      {
        descricao: 'A solução geral tem uma constante livre.',
        tex: 'y(t) = Ae^{0{,}3t}',
      },
      {
        descricao: 'Cada valor de A é uma curva diferente.',
        tex: 'A = 1,\\; 2,\\; 5 \\;\\Longrightarrow\\; \\text{três soluções distintas}',
      },
      {
        descricao: 'A condição inicial aponta uma.',
        tex: 'y(0) = 50 \\;\\Longrightarrow\\; A = 50',
        nota: 'Por cada ponto do plano passa exatamente uma solução — é o que o teorema de existência garante.',
      },
    ],
    vejaTambem: ['edo1.separavel', 'edo1.regime-permanente'],
  },
  {
    id: 'edo1.meia-vida',
    titulo: 'Meia-vida',
    resumo: 'O tempo para restar metade — e ele não depende da quantidade.',
    definicao:
      'Num decaimento exponencial, o tempo para restar metade é o mesmo não importa quanto ' +
      'havia no começo. É uma consequência direta da proporcionalidade: a quantidade inicial ' +
      'se cancela na equação. Por isso a meia-vida é propriedade do material, e não da ' +
      'amostra.',
    formulas: [
      { tex: 't_{1/2} = \\frac{\\ln 2}{|k|}' },
      { tex: 'y(t) = y_{0}\\left(\\frac{1}{2}\\right)^{t/t_{1/2}}', legenda: 'A mesma solução, escrita em meias-vidas.' },
    ],
    demonstracao: [
      {
        descricao: 'Procuramos quando resta metade.',
        tex: '\\frac{1}{2}y_{0} = y_{0}e^{kt}',
      },
      {
        descricao: 'A quantidade inicial se cancela.',
        tex: '\\frac{1}{2} = e^{kt}',
        nota: 'É exatamente isso que torna a meia-vida independente da amostra.',
      },
      {
        descricao: 'Aplicando o logaritmo.',
        tex: 't = \\frac{\\ln 2}{|k|} \\approx \\frac{0{,}693}{|k|}',
      },
      {
        descricao: 'Depois de três meias-vidas, resta um oitavo.',
        tex: '\\left(\\frac{1}{2}\\right)^{3} = \\frac{1}{8}',
      },
    ],
    vejaTambem: ['edo1.separavel', 'edo1.condicao-inicial'],
  },
  {
    id: 'edo1.fator-integrante',
    titulo: 'Fator integrante',
    resumo: 'Multiplicar por uma exponencial transforma o lado esquerdo numa derivada de produto.',
    definicao:
      'Quando a equação não separa, mas é linear, o fator integrante resolve. A ideia é ' +
      'multiplicar tudo por uma exponencial escolhida de modo que o lado esquerdo vire a ' +
      'derivada de um produto — e aí basta integrar. É a técnica por trás de circuitos RL, ' +
      'resfriamento e problemas de mistura.',
    formulas: [
      { tex: "y' + p(t)y = q(t)" },
      { tex: '\\mu(t) = e^{\\int p\\,dt}' },
      { tex: "\\left(\\mu y\\right)' = \\mu q" },
    ],
    demonstracao: [
      {
        descricao: 'Multiplicamos a equação pelo fator.',
        tex: "e^{pt}y' + pe^{pt}y = qe^{pt}",
      },
      {
        descricao: 'O lado esquerdo é exatamente a derivada de um produto.',
        tex: "\\left(e^{pt}y\\right)' = qe^{pt}",
        nota: 'É a regra do produto lida ao contrário — e é toda a mágica da técnica.',
      },
      {
        descricao: 'Integrando e isolando.',
        tex: 'y(t) = \\frac{q}{p} + Ce^{-pt}',
      },
      {
        descricao: 'A solução tem duas partes com papéis distintos.',
        tex: '\\underbrace{\\frac{q}{p}}_{\\text{permanente}} + \\underbrace{Ce^{-pt}}_{\\text{transiente}}',
      },
    ],
    vejaTambem: ['edo1.regime-permanente', 'edo1.separavel'],
  },
  {
    id: 'edo1.regime-permanente',
    titulo: 'Transiente e regime permanente',
    resumo: 'Uma parte some com o tempo; a outra fica.',
    definicao:
      'Numa equação linear com termo constante, a solução se divide em duas: o regime ' +
      'permanente, que é o valor de equilíbrio, e o transiente, que decai e desaparece. A ' +
      'condição inicial afeta só o transiente — o destino é sempre o mesmo, e depende apenas ' +
      'dos coeficientes da equação.',
    formulas: [
      { tex: 'y_{\\infty} = \\frac{q}{p}' },
      { tex: 'y(t) = y_{\\infty} + \\left(y_{0} - y_{\\infty}\\right)e^{-pt}' },
      { tex: '\\tau = \\frac{1}{p}', legenda: 'A constante de tempo: quanto o transiente demora a sumir.' },
    ],
    demonstracao: [
      {
        descricao: 'No equilíbrio, a derivada zera.',
        tex: "y' = 0 \\;\\Longrightarrow\\; y_{\\infty} = \\frac{q}{p}",
      },
      {
        descricao: 'Depois de uma constante de tempo, resta cerca de 37 por cento do transiente.',
        tex: 'e^{-1} \\approx 0{,}368',
      },
      {
        descricao: 'Depois de cinco, menos de 1 por cento.',
        tex: 'e^{-5} \\approx 0{,}0067',
        nota: 'É a regra prática de engenharia: cinco constantes de tempo, e o sistema chegou.',
      },
      {
        descricao: 'E o destino independe de onde se começou.',
        tex: '\\lim_{t \\to \\infty} y(t) = y_{\\infty}',
      },
    ],
    vejaTambem: ['edo1.fator-integrante', 'edo1.condicao-inicial'],
  },
];
