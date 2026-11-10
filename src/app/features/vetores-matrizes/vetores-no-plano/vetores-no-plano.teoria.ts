import { decomporComPassos, somarComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_VETORES: readonly Teoria[] = [
  {
    id: 'vetores.definicao',
    titulo: 'O que um vetor acrescenta',
    resumo: 'Algumas grandezas não ficam completas com um número só.',
    definicao:
      'Temperatura e massa se descrevem com um número e uma unidade. Força, velocidade e ' +
      'aceleração não: elas têm direção, e duas forças de mesma intensidade podem se somar ou ' +
      'se cancelar. O vetor é o objeto que carrega módulo, direção e sentido de uma vez.',
    formulas: [
      { tex: '\\vec{v} = (v_x,\\; v_y)' },
      { tex: '|\\vec{v}| = \\sqrt{v_x^{2} + v_y^{2}}' },
      {
        tex: '\\theta = \\arctan\\frac{v_y}{v_x}',
        legenda: 'Atenção ao quadrante: a tangente não distingue θ de θ + 180°.',
      },
    ],
    demonstracao: [
      {
        descricao: 'As componentes e o vetor formam um triângulo retângulo.',
        tex: 'v_x = |\\vec{v}|\\cos\\theta \\qquad v_y = |\\vec{v}|\\sin\\theta',
      },
      {
        descricao: 'Por Pitágoras, as componentes reconstroem o módulo.',
        tex: 'v_x^{2} + v_y^{2} = |\\vec{v}|^{2}(\\cos^{2}\\theta + \\sin^{2}\\theta) = |\\vec{v}|^{2}',
        nota: 'A identidade fundamental da trigonometria entra exatamente aqui.',
      },
      {
        descricao: 'Então as duas descrições — polar e cartesiana — carregam a mesma informação.',
        tex: '(|\\vec{v}|, \\theta) \\longleftrightarrow (v_x, v_y)',
      },
    ],
    exemplo: {
      enunciado: 'Decompondo um vetor de módulo 10 a 30° da horizontal.',
      passos: decomporComPassos(10, 30).passos,
    },
    vejaTambem: ['vetores.soma', 'triangulo.razoes'],
  },
  {
    id: 'vetores.soma',
    titulo: 'Somar vetores',
    resumo: 'Componente por componente — e o módulo não acompanha.',
    definicao:
      'A soma de vetores se faz eixo por eixo, porque cada direção é independente da outra. ' +
      'Geometricamente, é a diagonal do paralelogramo. O ponto que mais confunde: o módulo da ' +
      'soma NÃO é a soma dos módulos, exceto quando os vetores apontam para o mesmo lado.',
    formulas: [
      { tex: '\\vec{a} + \\vec{b} = (a_x + b_x,\\; a_y + b_y)' },
      {
        tex: '|\\vec{a}+\\vec{b}| \\le |\\vec{a}| + |\\vec{b}|',
        legenda: 'A desigualdade triangular, de novo.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Deslocar-se por a e depois por b leva ao mesmo ponto que o vetor soma.',
        tex: '\\vec{a} + \\vec{b}',
      },
      {
        descricao: 'Nos eixos, os deslocamentos se acumulam separadamente.',
        tex: '(a_x + b_x,\\; a_y + b_y)',
        nota: 'O que acontece no eixo x não interfere no eixo y — é isso que a decomposição compra.',
      },
      {
        descricao: 'O módulo da soma sai de Pitágoras, e em geral é menor que a soma dos módulos.',
        tex: '|\\vec{a}+\\vec{b}| = \\sqrt{(a_x+b_x)^{2} + (a_y+b_y)^{2}}',
        nota: 'Igualdade só quando os dois têm a mesma direção e sentido.',
      },
    ],
    exemplo: {
      enunciado: 'Somando (3, 0) e (0, 4): o módulo é 5, não 7.',
      passos: somarComPassos({ x: 3, y: 0 }, { x: 0, y: 4 }).passos,
    },
    vejaTambem: ['vetores.definicao', 'angulos.triangulo'],
  },
  {
    id: 'vetores.direcao',
    titulo: 'A direção de um vetor',
    resumo: 'θ = arctg(v_y / vₓ), corrigido pelo quadrante.',
    definicao:
      'A direção de um vetor é o ângulo θ que ele faz com o eixo x positivo, medido no sentido ' +
      'anti-horário. A tangente desse ângulo é v_y / vₓ, mas a calculadora devolve arctg só entre ' +
      '−90° e 90°: vetores apontando para a esquerda (vₓ < 0) precisam de 180° a mais, e os do 4º ' +
      'quadrante, de 360° para ficar entre 0° e 360°.',
    formulas: [
      { tex: '\\tan\\theta = \\frac{v_y}{v_x}' },
      {
        tex: '\\theta = \\arctan\\frac{v_y}{v_x} + \\begin{cases} 0^{\\circ} & \\text{1º quadrante} \\\\ 180^{\\circ} & \\text{2º e 3º} \\\\ 360^{\\circ} & \\text{4º} \\end{cases}',
      },
    ],
    demonstracao: [
      {
        descricao: 'As componentes são os catetos do triângulo cujo ângulo na origem é θ.',
        tex: 'v_x = |\\vec{v}|\\cos\\theta \\qquad v_y = |\\vec{v}|\\sin\\theta',
      },
      {
        descricao: 'Dividindo, o módulo some e sobra a tangente — que não distingue θ de θ + 180°.',
        tex: '\\frac{v_y}{v_x} = \\tan\\theta = \\tan(\\theta + 180^{\\circ})',
      },
    ],
    exemplo: {
      enunciado: 'A direção de v = (−4, 3).',
      passos: [
        {
          descricao: 'arctg da razão.',
          tex: '\\arctan\\left(\\frac{3}{-4}\\right) = -36{,}87^{\\circ}',
        },
        {
          descricao: 'vₓ < 0 e v_y > 0: 2º quadrante, soma 180°.',
          tex: '\\theta = 143{,}13^{\\circ}',
        },
      ],
    },
    vejaTambem: ['vetores.definicao', 'vetores.soma'],
  },
];
