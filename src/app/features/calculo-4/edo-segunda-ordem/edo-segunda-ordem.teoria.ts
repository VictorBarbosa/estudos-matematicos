import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_EDO2: readonly Teoria[] = [
  {
    id: 'edo2.caracteristica',
    titulo: 'A equação característica',
    resumo: 'Uma EDO de segunda ordem vira uma quadrática.',
    definicao:
      'Tentar uma solução exponencial transforma a equação diferencial numa equação do segundo ' +
      'grau — e aí o problema inteiro se resolve com a fórmula que já se conhece. É a ponte ' +
      'mais surpreendente do assunto: derivadas viram potências, e a álgebra toma conta.',
    formulas: [
      { tex: "y'' + by' + cy = 0" },
      { tex: 'y = e^{rt} \\;\\Longrightarrow\\; r^{2} + br + c = 0' },
    ],
    demonstracao: [
      {
        descricao: 'Substituímos a exponencial e suas derivadas.',
        tex: "y = e^{rt} \\qquad y' = re^{rt} \\qquad y'' = r^{2}e^{rt}",
      },
      {
        descricao: 'A exponencial aparece em todos os termos e pode ser cancelada.',
        tex: 'e^{rt}\\left(r^{2} + br + c\\right) = 0',
        nota: 'Como a exponencial nunca é zero, só o parêntese pode anular.',
      },
      {
        descricao: 'Sobra uma equação do segundo grau.',
        tex: 'r^{2} + br + c = 0',
      },
      {
        descricao: 'E o discriminante decide tudo que vem depois.',
        tex: '\\Delta = b^{2} - 4c',
      },
    ],
    vejaTambem: ['edo2.regimes', 'edo2.duas-condicoes', 'edo2.oscilacao'],
  },
  {
    id: 'edo2.regimes',
    titulo: 'Três regimes, um discriminante',
    resumo: 'O sinal de Δ separa oscilar, não oscilar e o caso limite.',
    definicao:
      'Duas raízes reais dão um sistema que volta ao repouso sem oscilar; raízes complexas dão ' +
      'oscilação com amplitude decrescente; raiz dupla é o caso limite, em que o retorno é o ' +
      'mais rápido possível sem passar do ponto. É exatamente assim que se escolhe o ' +
      'amortecedor de uma suspensão ou o ganho de um controlador.',
    formulas: [
      { tex: '\\Delta > 0 \\;\\Longrightarrow\\; y = C_{1}e^{r_{1}t} + C_{2}e^{r_{2}t}' },
      { tex: '\\Delta = 0 \\;\\Longrightarrow\\; y = \\left(C_{1} + C_{2}t\\right)e^{rt}' },
      {
        tex: '\\Delta < 0 \\;\\Longrightarrow\\; y = e^{\\alpha t}\\left(C_{1}\\cos\\beta t + C_{2}\\operatorname{sen}\\beta t\\right)',
      },
    ],
    demonstracao: [
      {
        descricao: 'Muito atrito: o sistema volta devagar, sem oscilar.',
        tex: "y'' + 5y' + 4y = 0 \\;\\Longrightarrow\\; r = -1,\\; -4",
        nota: 'É o superamortecido — a porta pesada que fecha lentamente.',
      },
      {
        descricao: 'Atrito exato: o retorno mais rápido possível sem passar do ponto.',
        tex: "y'' + 4y' + 4y = 0 \\;\\Longrightarrow\\; r = -2 \\;(\\text{dupla})",
        nota: 'É o criticamente amortecido, e é o que se busca numa suspensão.',
      },
      {
        descricao: 'Pouco atrito: oscila enquanto perde amplitude.',
        tex: "y'' + 2y' + 10y = 0 \\;\\Longrightarrow\\; r = -1 \\pm 3i",
      },
      {
        descricao: 'Sem atrito nenhum, a oscilação nunca morre.',
        tex: "y'' + 9y = 0 \\;\\Longrightarrow\\; y = C_{1}\\cos 3t + C_{2}\\operatorname{sen} 3t",
        nota: 'É o oscilador harmônico simples, o caso idealizado da física.',
      },
    ],
    vejaTambem: ['edo2.oscilacao', 'edo2.caracteristica'],
  },
  {
    id: 'edo2.duas-condicoes',
    titulo: 'Duas constantes, duas condições',
    resumo: 'Segunda ordem pede posição E velocidade iniciais.',
    definicao:
      'A solução geral de uma EDO de segunda ordem tem duas constantes livres, e por isso são ' +
      'necessárias duas condições para fixá-las. Fisicamente isso é óbvio: saber onde a massa ' +
      'está não basta, é preciso saber também com que velocidade ela parte.',
    formulas: [
      { tex: "y(0) = y_{0} \\qquad y'(0) = v_{0}" },
      { tex: 'C_{1} = y_{0} \\qquad C_{2} \\;\\text{sai da derivada}' },
    ],
    demonstracao: [
      {
        descricao: 'A solução geral tem duas constantes.',
        tex: 'y = C_{1}e^{-t} + C_{2}e^{-4t}',
      },
      {
        descricao: 'A primeira condição dá uma equação.',
        tex: 'y(0) = C_{1} + C_{2} = 5',
      },
      {
        descricao: 'A derivada dá a segunda.',
        tex: "y'(0) = -C_{1} - 4C_{2} = -8",
      },
      {
        descricao: 'E o sistema fixa as duas constantes.',
        tex: 'C_{1} = 4 \\qquad C_{2} = 1',
        nota: 'Uma condição só deixaria infinitas soluções ainda possíveis.',
      },
    ],
    vejaTambem: ['edo2.regimes', 'edo2.caracteristica'],
  },
  {
    id: 'edo2.oscilacao',
    titulo: 'Oscilação amortecida',
    resumo: 'A parte real decai; a imaginária oscila.',
    definicao:
      'Quando as raízes são complexas, a parte real controla o decaimento da amplitude e a ' +
      'parte imaginária é a frequência angular da oscilação. O amortecimento sempre alonga o ' +
      'período em relação ao sistema ideal — e quanto mais atrito, mais lenta e mais curta a ' +
      'oscilação, até que ela desapareça por completo.',
    formulas: [
      {
        tex: 'r = \\alpha \\pm i\\beta, \\qquad \\alpha = -\\frac{b}{2}, \\quad \\beta = \\frac{\\sqrt{4c - b^{2}}}{2}',
      },
      { tex: 'T = \\frac{2\\pi}{\\beta}' },
      {
        tex: '\\omega_{0} = \\sqrt{c} \\;>\\; \\beta',
        legenda: 'A frequência natural é sempre maior que a amortecida.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Sem amortecimento, a frequência é a natural.',
        tex: "y'' + 25y = 0 \\;\\Longrightarrow\\; \\omega_{0} = 5",
      },
      {
        descricao: 'Com atrito, ela diminui.',
        tex: "y'' + 6y' + 25y = 0 \\;\\Longrightarrow\\; \\beta = \\sqrt{25 - 9} = 4",
      },
      {
        descricao: 'E o período, portanto, aumenta.',
        tex: 'T = \\frac{2\\pi}{4} \\approx 1{,}57 \\;>\\; \\frac{2\\pi}{5} \\approx 1{,}26',
        nota: 'O atrito atrasa a oscilação, além de encolher a amplitude.',
      },
      {
        descricao: 'A envoltória limita a amplitude.',
        tex: '\\left|y(t)\\right| \\leq Ae^{-3t}',
      },
    ],
    vejaTambem: ['edo2.regimes', 'edo2.duas-condicoes'],
  },
  {
    id: 'edo2.amortecimento',
    titulo: 'Massa, mola e amortecedor',
    resumo: 'A fronteira entre oscilar e não oscilar é c² = 4mk.',
    definicao:
      'Uma massa m numa mola de rigidez k, com amortecedor de coeficiente c, obedece a ' +
      'm·y″ + c·y′ + k·y = 0. O discriminante da característica, c² − 4mk, decide o regime: ' +
      'negativo, o sistema oscila com amplitude decrescente (subamortecido); zero, volta ao ' +
      'repouso o mais rápido possível sem passar do ponto (crítico); positivo, volta devagar ' +
      'sem oscilar (superamortecido). No subamortecido, a amplitude encolhe como e^(−ct/2m).',
    formulas: [
      {
        tex: 'c_{\\text{crítico}} = 2\\sqrt{mk}',
        legenda: 'O amortecimento que zera o discriminante.',
      },
      {
        tex: 'r = -\\frac{c}{2m} \\pm i\\,\\frac{\\sqrt{4mk - c^{2}}}{2m}',
        legenda: 'Parte real: decaimento. Parte imaginária: frequência da oscilação.',
      },
      {
        tex: 't_{1/2} = \\frac{2m\\ln 2}{c}',
        legenda: 'Tempo para a amplitude cair à metade.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Trocando y por eʳᵗ, a EDO vira uma equação do 2º grau em r.',
        tex: 'mr^{2} + cr + k = 0 \\;\\Rightarrow\\; \\Delta = c^{2} - 4mk',
      },
      {
        descricao:
          'Com Δ < 0, as raízes são complexas e a solução é um cosseno dentro de uma exponencial.',
        tex: 'y = A\\,e^{-\\frac{c}{2m}t}\\cos(\\omega t + \\varphi)',
        nota: 'A exponencial é a envoltória: ela, e não o cosseno, decide quanto a amplitude encolhe.',
      },
    ],
    exemplo: {
      enunciado: 'm = 2 kg, k = 8 N/m: que c dá amortecimento crítico?',
      passos: [
        { descricao: 'Discriminante zero.', tex: 'c^{2} - 4 \\cdot 2 \\cdot 8 = 0' },
        {
          descricao: 'Isolando c.',
          tex: 'c = 2\\sqrt{2 \\cdot 8} = 2\\sqrt{16} = 8\\ \\text{N·s/m}',
          nota: 'Com c = 4, o sistema oscilaria; com c = 12, voltaria devagar.',
        },
      ],
    },
    vejaTambem: ['edo2.regimes', 'edo2.oscilacao'],
  },
];
