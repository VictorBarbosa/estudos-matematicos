import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_GRADIENTE: readonly Teoria[] = [
  {
    id: 'gradiente.vetor',
    titulo: 'As parciais num vetor só',
    resumo: 'O gradiente reúne todas as derivadas parciais.',
    definicao:
      'O gradiente é o vetor cujas componentes são as derivadas parciais. Ele não é uma taxa, ' +
      'é um objeto com direção e módulo — e é dele que saem todas as taxas: a de qualquer ' +
      'direção se obtém projetando-o nela.',
    formulas: [
      { tex: '\\nabla f = \\left(\\frac{\\partial f}{\\partial x},\\; \\frac{\\partial f}{\\partial y}\\right)' },
      { tex: '\\left|\\nabla f\\right| = \\sqrt{f_{x}^{2} + f_{y}^{2}}' },
    ],
    demonstracao: [
      {
        descricao: 'Calculamos as duas parciais.',
        tex: 'f = x^{2} + 3y^{2} \\;\\Longrightarrow\\; f_{x} = 2x,\\quad f_{y} = 6y',
      },
      {
        descricao: 'E as juntamos num vetor.',
        tex: '\\nabla f(1,\\; 2) = (2,\\; 12)',
      },
      {
        descricao: 'O módulo sai por Pitágoras, como em qualquer vetor.',
        tex: '\\left|\\nabla f\\right| = \\sqrt{4 + 144} \\approx 12{,}17',
        nota: 'Somar as componentes daria 14, que não é o módulo de nada.',
      },
    ],
    vejaTambem: ['gradiente.direcao-de-subida', 'gradiente.direcional'],
  },
  {
    id: 'gradiente.direcao-de-subida',
    titulo: 'A subida mais íngreme',
    resumo: 'O gradiente aponta para onde a função cresce mais rápido.',
    definicao:
      'Entre todas as direções possíveis, a do gradiente é a de maior crescimento, e o módulo ' +
      'dele é exatamente essa taxa máxima. Nenhuma direção sobe mais rápido. É essa ' +
      'propriedade que sustenta todo método de otimização: descer um gradiente é o algoritmo ' +
      'mais usado da computação numérica.',
    formulas: [
      { tex: 'D_{\\hat{u}}f = \\nabla f \\cdot \\hat{u} = \\left|\\nabla f\\right|\\cos\\theta' },
      { tex: '\\max_{\\hat{u}} D_{\\hat{u}}f = \\left|\\nabla f\\right|, \\;\\text{quando } \\hat{u} \\parallel \\nabla f' },
    ],
    demonstracao: [
      {
        descricao: 'A taxa numa direção é o gradiente vezes o cosseno do ângulo.',
        tex: 'D_{\\hat{u}}f = \\left|\\nabla f\\right|\\cos\\theta',
      },
      {
        descricao: 'O cosseno é máximo quando o ângulo é zero.',
        tex: '\\theta = 0 \\;\\Longrightarrow\\; D_{\\hat{u}}f = \\left|\\nabla f\\right|',
      },
      {
        descricao: 'E é mínimo no sentido oposto.',
        tex: '\\theta = 180^\\circ \\;\\Longrightarrow\\; D_{\\hat{u}}f = -\\left|\\nabla f\\right|',
        nota: 'Descer o gradiente é a maneira mais rápida de diminuir a função.',
      },
      {
        descricao: 'Perpendicular ao gradiente, a taxa é nula.',
        tex: '\\theta = 90^\\circ \\;\\Longrightarrow\\; D_{\\hat{u}}f = 0',
        nota: 'Essa direção é tangente à curva de nível — andar nela mantém a altura.',
      },
    ],
    vejaTambem: ['gradiente.direcional', 'gradiente.vetor'],
  },
  {
    id: 'gradiente.direcional',
    titulo: 'A taxa numa direção qualquer',
    resumo: 'Projetar o gradiente — depois de normalizar a direção.',
    definicao:
      'A derivada direcional é o produto escalar do gradiente com um vetor UNITÁRIO. A palavra ' +
      'unitário é o ponto: sem normalizar, um vetor duas vezes maior devolveria uma taxa duas ' +
      'vezes maior, o que não faz sentido nenhum — a inclinação de uma encosta não depende do ' +
      'comprimento da seta que se desenha sobre ela.',
    formulas: [
      { tex: 'D_{\\hat{u}}f = \\nabla f \\cdot \\hat{u}, \\qquad \\hat{u} = \\frac{\\vec{v}}{\\left|\\vec{v}\\right|}' },
    ],
    demonstracao: [
      {
        descricao: 'Partimos de um gradiente e de uma direção não unitária.',
        tex: '\\nabla f = (3,\\; 4) \\qquad \\vec{v} = (6,\\; 8)',
      },
      {
        descricao: 'Normalizando o vetor direção.',
        tex: '\\hat{u} = \\frac{(6,\\; 8)}{10} = (0{,}6,\\; 0{,}8)',
      },
      {
        descricao: 'E projetando.',
        tex: 'D_{\\hat{u}}f = 3(0{,}6) + 4(0{,}8) = 5',
      },
      {
        descricao: 'Sem normalizar, o resultado sairia dez vezes maior.',
        tex: '3(6) + 4(8) = 50 \\;\\times',
        nota: 'E repare que 5 é exatamente o módulo do gradiente: a direção coincidia com ele.',
      },
    ],
    vejaTambem: ['gradiente.direcao-de-subida', 'gradiente.vetor'],
  },
  {
    id: 'gradiente.ponto-critico',
    titulo: 'Onde o gradiente zera',
    resumo: 'E o teste que distingue mínimo, máximo e sela.',
    definicao:
      'Num ponto crítico o gradiente é o vetor nulo: nenhuma direção sobe nem desce. Mas isso ' +
      'não diz qual é o caso — e aqui surge uma possibilidade que não existe em uma variável, ' +
      'a sela: um ponto que é mínimo numa direção e máximo noutra. O determinante da hessiana ' +
      'decide.',
    formulas: [
      { tex: '\\nabla f = \\vec{0} \\;\\Longleftrightarrow\\; f_{x} = f_{y} = 0' },
      { tex: '\\det H = f_{xx}f_{yy} - f_{xy}^{2}' },
      { tex: '\\det H > 0 \\;\\text{e}\\; f_{xx} > 0 \\;\\Longrightarrow\\; \\text{mínimo}' },
    ],
    demonstracao: [
      {
        descricao: 'As duas parciais zeram ao mesmo tempo.',
        tex: 'f = x^{2} + y^{2} \\;\\Longrightarrow\\; (0,\\; 0)',
      },
      {
        descricao: 'A hessiana tem determinante positivo.',
        tex: '\\det H = 2 \\cdot 2 - 0 = 4 > 0',
      },
      {
        descricao: 'E a segunda parcial em x é positiva: é mínimo.',
        tex: 'f_{xx} = 2 > 0 \\;\\Longrightarrow\\; \\text{mínimo}',
      },
      {
        descricao: 'Já na sela, o determinante é negativo.',
        tex: 'f = x^{2} - y^{2} \\;\\Longrightarrow\\; \\det H = -4 < 0',
        nota: 'Mínimo numa direção, máximo noutra — um caso que não existe em uma variável.',
      },
    ],
    vejaTambem: ['gradiente.vetor', 'gradiente.direcao-de-subida'],
  },
];
