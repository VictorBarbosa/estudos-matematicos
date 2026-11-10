import { circunferenciaComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_CIRCUNFERENCIA: readonly Teoria[] = [
  {
    id: 'circunferencia.definicao',
    titulo: 'A equação reduzida',
    resumo: 'O conjunto dos pontos a uma distância fixa do centro.',
    definicao:
      'Uma circunferência é a definição de distância transformada em equação: todos os pontos ' +
      'que estão exatamente a r unidades do centro. Escrever essa condição com a fórmula da ' +
      'distância já produz a equação reduzida.',
    formulas: [
      { tex: '(x - a)^{2} + (y - b)^{2} = r^{2}', legenda: 'Centro (a, b) e raio r.' },
      { tex: 'x^{2} + y^{2} = r^{2}', legenda: 'Centrada na origem.' },
    ],
    demonstracao: [
      {
        descricao: 'Partimos da condição: a distância de (x, y) ao centro vale r.',
        tex: '\\sqrt{(x-a)^{2} + (y-b)^{2}} = r',
      },
      {
        descricao: 'Elevando os dois lados ao quadrado, some a raiz.',
        tex: '(x-a)^{2} + (y-b)^{2} = r^{2}',
        nota: 'A equação é apenas a definição geométrica, sem a raiz atrapalhando.',
      },
      {
        descricao: 'Atenção ao sinal: o centro é o OPOSTO do que aparece no parêntese.',
        tex: '(x - 3)^{2} + (y + 2)^{2} = 25 \\;\\Rightarrow\\; C(3,\\, -2)',
      },
    ],
    exemplo: {
      enunciado: 'Da equação geral x² + y² − 6x − 8y = 0.',
      passos: circunferenciaComPassos(-6, -8, 0).passos,
    },
    vejaTambem: ['circunferencia.geral', 'circunferencia.posicao'],
  },
  {
    id: 'circunferencia.geral',
    titulo: 'Da equação geral à reduzida',
    resumo: 'Completar quadrados revela centro e raio.',
    definicao:
      'A forma geral x² + y² + Dx + Ey + F = 0 esconde o centro e o raio. Completando o ' +
      'quadrado em x e em y, a equação volta à forma reduzida, onde os dois são imediatos.',
    formulas: [
      { tex: 'a = -\\frac{D}{2} \\qquad b = -\\frac{E}{2}' },
      { tex: 'r^{2} = a^{2} + b^{2} - F' },
    ],
    demonstracao: [
      {
        descricao: 'Agrupamos os termos de x e os de y.',
        tex: '(x^{2} + Dx) + (y^{2} + Ey) = -F',
      },
      {
        descricao: 'Completamos cada quadrado somando o quadrado da metade do coeficiente.',
        tex: '\\left(x + \\frac{D}{2}\\right)^{2} + \\left(y + \\frac{E}{2}\\right)^{2} = \\frac{D^{2}}{4} + \\frac{E^{2}}{4} - F',
      },
      {
        descricao: 'O lado direito é r². Se ele for negativo, não existe circunferência real.',
        tex: 'r^{2} > 0 \\;\\Rightarrow\\; \\text{circunferência} \\qquad r^{2} = 0 \\;\\Rightarrow\\; \\text{um ponto}',
      },
    ],
    exemplo: {
      enunciado: 'Convertendo x² + y² − 4x + 6y − 12 = 0.',
      passos: circunferenciaComPassos(-4, 6, -12).passos,
    },
    vejaTambem: ['circunferencia.definicao', 'circunferencia.posicao'],
  },
  {
    id: 'circunferencia.posicao',
    titulo: 'Posições relativas',
    resumo: 'Tudo se decide comparando distâncias com o raio.',
    definicao:
      'Para saber se um ponto está dentro, sobre ou fora, compara-se sua distância ao centro ' +
      'com o raio. Para uma reta, compara-se a distância do centro à reta com o raio: maior, ' +
      'não há interseção; igual, é tangente; menor, corta em dois pontos.',
    formulas: [
      {
        tex: 'd < r \\to \\text{dentro} \\qquad d = r \\to \\text{sobre} \\qquad d > r \\to \\text{fora}',
      },
      { tex: 'd_{\\text{centro, reta}} = \\frac{|ax_0 + by_0 + c|}{\\sqrt{a^{2} + b^{2}}}' },
    ],
    demonstracao: [
      {
        descricao: 'A circunferência é exatamente o conjunto onde a distância vale r.',
        tex: 'd = r',
      },
      {
        descricao: 'Pontos mais próximos do centro estão na região interna.',
        tex: 'd < r',
      },
      {
        descricao: 'Para a reta, o que importa é a MENOR distância até o centro.',
        tex: 'd = r \\;\\Rightarrow\\; \\text{reta tangente, um único ponto em comum}',
      },
    ],
    exemplo: {
      enunciado: 'A circunferência de centro (3, 4) e raio 5 passa pela origem.',
      passos: circunferenciaComPassos(-6, -8, 0).passos,
    },
    vejaTambem: ['circunferencia.definicao', 'ponto-reta.distancia'],
  },
  {
    id: 'circunferencia.tangente',
    titulo: 'A reta tangente',
    resumo: 'A tangente é perpendicular ao raio no ponto de contato.',
    definicao:
      'A reta tangente toca a circunferência num único ponto P, e ali ela faz ângulo reto com o ' +
      'raio CP. Então a inclinação da tangente é a do raio invertida e com sinal trocado: se o ' +
      'raio sobe dy enquanto avança dx, a tangente tem inclinação −dx/dy. Com a inclinação e o ' +
      'ponto P, a reta fica determinada.',
    formulas: [
      {
        tex: 'm_{CP} = \\frac{y_P - b}{x_P - a} \\qquad m_t = -\\frac{1}{m_{CP}} = -\\frac{x_P - a}{y_P - b}',
      },
      { tex: 'y - y_P = m_t\\,(x - x_P)' },
    ],
    demonstracao: [
      {
        descricao:
          'Se a tangente não fosse perpendicular ao raio, haveria pontos dela mais perto de C que P — dentro do círculo.',
        tex: 'CP \\perp t',
      },
      {
        descricao: 'Retas perpendiculares têm inclinações de produto −1.',
        tex: 'm_{CP} \\cdot m_t = -1',
      },
    ],
    exemplo: {
      enunciado: 'Circunferência de centro (1, 2) e o ponto P(4, 6) sobre ela.',
      passos: [
        { descricao: 'Inclinação do raio.', tex: 'm_{CP} = \\frac{6 - 2}{4 - 1} = \\frac{4}{3}' },
        { descricao: 'Da tangente.', tex: 'm_t = -\\frac{3}{4}' },
        {
          descricao: 'A reta.',
          tex: 'y - 6 = -\\tfrac{3}{4}(x - 4) \\;\\Rightarrow\\; y = -\\tfrac{3}{4}x + 9',
        },
      ],
    },
    vejaTambem: ['circunferencia.geral', 'ponto-reta.posicoes'],
  },
];
