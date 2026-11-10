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
      { tex: '\\frac{dy}{dt} = ky \\;\\Longrightarrow\\; y(t) = y_{0}e^{kt}' },
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
      {
        tex: 'y(t) = y_{0}\\left(\\frac{1}{2}\\right)^{t/t_{1/2}}',
        legenda: 'A mesma solução, escrita em meias-vidas.',
      },
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
      {
        tex: '\\tau = \\frac{1}{p}',
        legenda: 'A constante de tempo: quanto o transiente demora a sumir.',
      },
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
  {
    id: 'edo1.exata',
    titulo: 'Equação exata',
    resumo: 'Se M dx + N dy é a diferencial de uma F, as soluções são as curvas F(x, y) = C.',
    definicao:
      'Uma equação M dx + N dy = 0 é exata quando existe uma função F(x, y) com ∂F/∂x = M e ' +
      '∂F/∂y = N. Então a equação diz dF = 0, e as soluções são as curvas de nível F(x, y) = C. ' +
      'O teste é a igualdade das derivadas cruzadas, ∂M/∂y = ∂N/∂x. Para achar F, integra-se M ' +
      'em x somando uma g(y) — a «constante» que pode depender de y — e acha-se g comparando a ' +
      'derivada em y com N.',
    formulas: [
      {
        tex: '\\frac{\\partial M}{\\partial y} = \\frac{\\partial N}{\\partial x}',
        legenda: 'O teste de exatidão.',
      },
      {
        tex: "F = \\int M\\,dx + g(y), \\qquad \\frac{\\partial F}{\\partial y} = N \\;\\Rightarrow\\; g'(y)",
        legenda: 'A receita para montar F.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Se M = ∂F/∂x e N = ∂F/∂y, as derivadas cruzadas são as derivadas mistas de F.',
        tex: '\\frac{\\partial M}{\\partial y} = \\frac{\\partial^{2} F}{\\partial y\\,\\partial x} = \\frac{\\partial^{2} F}{\\partial x\\,\\partial y} = \\frac{\\partial N}{\\partial x}',
        nota: 'As derivadas mistas de uma função suave não dependem da ordem (teorema de Schwarz).',
      },
      {
        descricao: 'Ao longo de uma solução, dF = M dx + N dy = 0: F não muda.',
        tex: 'dF = 0 \\;\\Rightarrow\\; F(x, y) = C',
      },
    ],
    exemplo: {
      enunciado: '(2xy + 3) dx + (x² + 4y) dy = 0, pela curva que passa por (1, 2).',
      passos: [
        {
          descricao: 'Teste: as derivadas cruzadas coincidem.',
          tex: '\\frac{\\partial M}{\\partial y} = 2x = \\frac{\\partial N}{\\partial x}',
        },
        { descricao: 'Integrando M em x.', tex: 'F = x^{2}y + 3x + g(y)' },
        {
          descricao: 'Derivando em y e comparando com N.',
          tex: "x^{2} + g'(y) = x^{2} + 4y \\;\\Rightarrow\\; g(y) = 2y^{2}",
        },
        {
          descricao: 'O ponto (1, 2) escolhe a curva.',
          tex: 'C = 1 \\cdot 2 + 3 \\cdot 1 + 2 \\cdot 4 = 13',
          nota: 'A solução é x²y + 3x + 2y² = 13.',
        },
      ],
    },
    vejaTambem: ['edo1.separavel', 'edo1.fator-integrante'],
  },
];
