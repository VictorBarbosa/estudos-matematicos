import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_TEOREMAS_INTEGRAIS: readonly Teoria[] = [
  {
    id: 'teoremas.superficie',
    titulo: 'Integral de superfície',
    resumo: 'Cada pedacinho da sombra dA vira √(1 + fx² + fy²)·dA na superfície.',
    definicao:
      'Para uma superfície z = f(x, y) sobre uma região R do plano xy, a área não é a da ' +
      'sombra: cada retângulo dA, levantado até a superfície, vira um paralelogramo inclinado ' +
      'de área √(1 + fx² + fy²)·dA. Integrar esse fator dá a área; integrar uma função g ' +
      'multiplicada por ele dá a integral de superfície de g — o ingrediente dos fluxos.',
    formulas: [
      { tex: 'A(S) = \\iint_R \\sqrt{1 + f_x^{2} + f_y^{2}}\\,dA' },
      { tex: '\\iint_S g\\,dS = \\iint_R g(x, y, f(x, y))\\sqrt{1 + f_x^{2} + f_y^{2}}\\,dA' },
    ],
    demonstracao: [
      {
        descricao:
          'Os lados do retângulo dx e dy, levantados, viram os vetores (dx, 0, fx dx) e (0, dy, fy dy).',
        tex: '\\vec{u} = (1, 0, f_x)\\,dx \\qquad \\vec{v} = (0, 1, f_y)\\,dy',
      },
      {
        descricao: 'A área do paralelogramo é o módulo do produto vetorial.',
        tex: '|\\vec{u} \\times \\vec{v}| = |(-f_x, -f_y, 1)|\\,dx\\,dy = \\sqrt{1 + f_x^{2} + f_y^{2}}\\,dA',
      },
    ],
    exemplo: {
      enunciado: 'A área do plano z = 2x + 2y + 1 acima de 0 ≤ x ≤ 3, 0 ≤ y ≤ 2.',
      passos: [
        { descricao: 'O fator é constante.', tex: '\\sqrt{1 + 2^{2} + 2^{2}} = \\sqrt{9} = 3' },
        { descricao: 'Vezes a área da sombra.', tex: 'A = 3 \\cdot (3 \\cdot 2) = 18' },
      ],
    },
    vejaTambem: ['teoremas.divergencia', 'multiplas.iterada'],
  },
  {
    id: 'teoremas.green',
    titulo: 'Teorema de Green',
    resumo: 'A circulação na borda é a soma do giro no interior.',
    definicao:
      'Para uma região R do plano cercada por uma curva C percorrida no sentido anti-horário, ' +
      'a circulação ∮ P dx + Q dy é igual à integral dupla de ∂Q/∂x − ∂P/∂y em R. Essa ' +
      'diferença mede o giro local do campo; somando o giro de todos os pedacinhos, os giros ' +
      'internos se cancelam aos pares e sobra só o da borda. Com F = (−y/2, x/2), o integrando ' +
      'vale 1 e o teorema calcula ÁREAS a partir da borda.',
    formulas: [
      {
        tex: '\\oint_C P\\,dx + Q\\,dy = \\iint_R \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right) dA',
      },
      { tex: 'A(R) = \\frac{1}{2}\\oint_C x\\,dy - y\\,dx' },
    ],
    demonstracao: [
      {
        descricao: 'Num retângulo pequeno, os lados de cima e de baixo dão a variação de P em y.',
        tex: '\\big[P(x, y) - P(x, y + \\Delta y)\\big]\\Delta x \\approx -\\frac{\\partial P}{\\partial y}\\,\\Delta x\\,\\Delta y',
      },
      {
        descricao: 'Os lados verticais dão a variação de Q em x; somando, o giro do retângulo.',
        tex: '\\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right)\\Delta A',
        nota: 'Ao juntar retângulos vizinhos, o lado comum é percorrido duas vezes em sentidos opostos e se cancela.',
      },
    ],
    exemplo: {
      enunciado: 'F = (−2y, 3x) na borda do retângulo 0 ≤ x ≤ 2, 0 ≤ y ≤ 1.',
      passos: [
        {
          descricao: 'O integrando.',
          tex: '\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} = 3 - (-2) = 5',
        },
        { descricao: 'Constante vezes a área.', tex: '\\oint = 5 \\cdot 2 = 10' },
      ],
    },
    vejaTambem: ['teoremas.stokes', 'linha.caminho-fechado'],
  },
  {
    id: 'teoremas.divergencia',
    titulo: 'Teorema da divergência',
    resumo: 'O fluxo que sai pela superfície fechada é o divergente somado no volume.',
    definicao:
      'O divergente ∇·F = ∂P/∂x + ∂Q/∂y + ∂R/∂z mede quanto o campo «nasce» em cada ponto ' +
      '(positivo: fonte; negativo: sumidouro). O teorema de Gauss diz que o fluxo total para ' +
      'fora de uma superfície fechada S é a integral do divergente no volume V que ela cerca. ' +
      'Troca seis integrais nas faces de um cubo, ou uma integral numa esfera, por uma integral ' +
      'tripla — e com divergente constante, por constante vezes volume.',
    formulas: [
      { tex: '\\oiint_S \\vec{F} \\cdot \\vec{n}\\,dS = \\iiint_V \\nabla \\cdot \\vec{F}\\,dV' },
      {
        tex: '\\nabla \\cdot \\vec{F} = \\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} + \\frac{\\partial R}{\\partial z}',
      },
    ],
    demonstracao: [
      {
        descricao:
          'Num cubinho, as faces x e x + Δx deixam sair P(x + Δx) e entrar P(x), cada uma com área Δy Δz.',
        tex: '\\big[P(x + \\Delta x) - P(x)\\big]\\Delta y\\,\\Delta z \\approx \\frac{\\partial P}{\\partial x}\\,\\Delta V',
      },
      {
        descricao: 'Somando as três direções, o fluxo do cubinho é o divergente vezes o volume.',
        tex: '\\left(\\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} + \\frac{\\partial R}{\\partial z}\\right)\\Delta V',
        nota: 'Faces internas compartilhadas se cancelam: só a superfície externa sobra.',
      },
    ],
    exemplo: {
      enunciado: 'F = (2x, −y, 3z) para fora da esfera de raio 1.',
      passos: [
        { descricao: 'O divergente é constante.', tex: '\\nabla \\cdot \\vec{F} = 2 - 1 + 3 = 4' },
        {
          descricao: 'Vezes o volume.',
          tex: '4 \\cdot \\frac{4}{3}\\pi \\cdot 1^{3} = \\frac{16\\pi}{3} \\approx 16{,}76',
        },
      ],
    },
    vejaTambem: ['teoremas.superficie', 'teoremas.stokes'],
  },
  {
    id: 'teoremas.stokes',
    titulo: 'Teorema de Stokes',
    resumo: 'A circulação na borda é o fluxo do rotacional pela superfície.',
    definicao:
      'O rotacional ∇×F mede o giro do campo em cada ponto, como um vetor ao longo do eixo de ' +
      'rotação. Stokes generaliza Green para superfícies no espaço: a circulação de F na curva ' +
      'que borda uma superfície S é o fluxo do rotacional por S, com a orientação da regra da ' +
      'mão direita (dedos no sentido da curva, polegar na normal). Num disco horizontal, só a ' +
      'componente z do rotacional, ∂Q/∂x − ∂P/∂y, importa — e Stokes vira Green.',
    formulas: [
      {
        tex: '\\oint_C \\vec{F} \\cdot d\\vec{r} = \\iint_S (\\nabla \\times \\vec{F}) \\cdot \\vec{n}\\,dS',
      },
      {
        tex: '\\nabla \\times \\vec{F} = \\left(\\frac{\\partial R}{\\partial y} - \\frac{\\partial Q}{\\partial z},\\; \\frac{\\partial P}{\\partial z} - \\frac{\\partial R}{\\partial x},\\; \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right)',
      },
    ],
    demonstracao: [
      {
        descricao: 'Num pedaço plano da superfície, Stokes é Green no plano desse pedaço.',
        tex: '\\oint_{\\partial(\\Delta S)} \\vec{F} \\cdot d\\vec{r} \\approx (\\nabla \\times \\vec{F}) \\cdot \\vec{n}\\,\\Delta S',
      },
      {
        descricao: 'Somando todos os pedaços, as bordas internas se cancelam e sobra a borda C.',
        tex: '\\sum (\\nabla \\times \\vec{F}) \\cdot \\vec{n}\\,\\Delta S \\;\\to\\; \\oint_C \\vec{F} \\cdot d\\vec{r}',
      },
    ],
    exemplo: {
      enunciado: 'F = (−y, x, z) na circunferência x² + y² = 4, plano z = 0, anti-horário.',
      passos: [
        {
          descricao: 'Componente z do rotacional.',
          tex: '\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} = 1 - (-1) = 2',
        },
        {
          descricao: 'Vezes a área do disco.',
          tex: '2 \\cdot \\pi \\cdot 4 = 8\\pi \\approx 25{,}13',
        },
      ],
    },
    vejaTambem: ['teoremas.green', 'vetores3.vetorial'],
  },
];
