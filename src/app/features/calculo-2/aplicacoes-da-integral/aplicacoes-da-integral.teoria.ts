import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_APLICACOES_INTEGRAL: readonly Teoria[] = [
  {
    id: 'aplic-integral.area',
    titulo: 'Área entre duas curvas',
    resumo: 'Integra-se a diferença entre a de cima e a de baixo.',
    definicao:
      'Para a região entre dois gráficos, integra-se a diferença (superior − inferior). O ' +
      'resultado já é a área geométrica, porque a diferença é positiva em toda a região — ' +
      'desde que se respeite quem está em cima.',
    formulas: [
      { tex: 'A = \\int_{a}^{b} \\left[f(x) - g(x)\\right] dx, \\quad f \\geq g' },
    ],
    demonstracao: [
      {
        descricao: 'Uma tira vertical fina tem altura igual à diferença das funções.',
        tex: 'h = f(x) - g(x)',
      },
      {
        descricao: 'Sua área é altura vezes largura.',
        tex: 'dA = [f(x) - g(x)]\\,dx',
      },
      {
        descricao: 'Somando todas as tiras, obtemos a integral.',
        tex: 'A = \\int_{a}^{b} [f(x) - g(x)]\\,dx',
      },
      {
        descricao: 'Os limites são os pontos onde as curvas se cruzam.',
        tex: 'f(x) = g(x) \\;\\Rightarrow\\; \\text{limites de integração}',
        nota: 'Se as curvas trocam de posição, é preciso dividir em partes.',
      },
    ],
    vejaTambem: ['aplic-integral.volume', 'aplic-integral.comprimento'],
  },
  {
    id: 'aplic-integral.volume',
    titulo: 'Volume de sólidos de revolução',
    resumo: 'Fatias circulares empilhadas.',
    definicao:
      'Girando uma curva em torno do eixo x, cada fatia perpendicular vira um disco de raio ' +
      'f(x). Somando as áreas desses discos ao longo do intervalo, obtém-se o volume do ' +
      'sólido.',
    formulas: [
      { tex: 'V = \\pi\\int_{a}^{b} \\left[f(x)\\right]^{2} dx' },
    ],
    demonstracao: [
      {
        descricao: 'Uma fatia fina do sólido é praticamente um disco.',
        tex: 'dV = \\pi r^{2}\\,dx, \\quad r = f(x)',
      },
      {
        descricao: 'Somando as fatias ao longo do eixo.',
        tex: 'V = \\pi\\int_{a}^{b} [f(x)]^{2}\\,dx',
      },
      {
        descricao: 'Girando a reta y = x de 0 a h, obtemos um cone.',
        tex: 'V = \\pi\\int_{0}^{h} x^{2}\\,dx = \\frac{\\pi h^{3}}{3}',
        nota: 'É a fórmula clássica do cone, deduzida em duas linhas.',
      },
    ],
    vejaTambem: ['aplic-integral.area', 'aplic-integral.comprimento'],
  },
  {
    id: 'aplic-integral.comprimento',
    titulo: 'Comprimento de arco',
    resumo: 'Pitágoras aplicado a pedaços infinitesimais.',
    definicao:
      'Um pedacinho da curva é quase um segmento de reta, com catetos dx e dy. Somando os ' +
      'comprimentos desses segmentos ao longo do intervalo, obtém-se o comprimento total.',
    formulas: [
      { tex: 'L = \\int_{a}^{b} \\sqrt{1 + \\left[f\'(x)\\right]^{2}}\\,dx' },
    ],
    demonstracao: [
      {
        descricao: 'Um pedaço infinitesimal da curva é a hipotenusa de dx e dy.',
        tex: 'ds = \\sqrt{(dx)^{2} + (dy)^{2}}',
      },
      {
        descricao: 'Pondo dx em evidência dentro da raiz.',
        tex: "= \\sqrt{1 + \\left(\\frac{dy}{dx}\\right)^{2}}\\,dx",
      },
      {
        descricao: 'A razão dy/dx é a derivada.',
        tex: "L = \\int_{a}^{b} \\sqrt{1 + [f'(x)]^{2}}\\,dx",
        nota: 'Numa reta horizontal a derivada é zero, e o comprimento vira apenas b − a.',
      },
    ],
    vejaTambem: ['aplic-integral.area', 'ponto-reta.distancia'],
  },
];
