import { distanciaComPassos, retaPorDoisPontosComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_PONTO_RETA: readonly Teoria[] = [
  {
    id: 'ponto-reta.distancia',
    titulo: 'Distância entre dois pontos',
    resumo: 'Pitágoras aplicado às diferenças de coordenadas.',
    definicao:
      'As diferenças Δx e Δy são os catetos de um triângulo retângulo cuja hipotenusa é a ' +
      'distância procurada. Não há fórmula nova a decorar: é Pitágoras escrito com ' +
      'coordenadas.',
    formulas: [
      { tex: 'd = \\sqrt{(x_2 - x_1)^{2} + (y_2 - y_1)^{2}}' },
      {
        tex: 'M = \\left(\\frac{x_1 + x_2}{2},\\; \\frac{y_1 + y_2}{2}\\right)',
        legenda: 'Ponto médio: a média das coordenadas.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Ligando os dois pontos e traçando os segmentos horizontal e vertical.',
        tex: '\\Delta x = x_2 - x_1 \\qquad \\Delta y = y_2 - y_1',
      },
      {
        descricao: 'Forma-se um triângulo retângulo com catetos Δx e Δy.',
        tex: 'd^{2} = (\\Delta x)^{2} + (\\Delta y)^{2}',
      },
      {
        descricao: 'Como os catetos são elevados ao quadrado, a ordem dos pontos não altera nada.',
        tex: '(x_2 - x_1)^{2} = (x_1 - x_2)^{2}',
      },
    ],
    exemplo: {
      enunciado: 'Distância entre (0, 0) e (3, 4).',
      passos: distanciaComPassos({ x: 0, y: 0 }, { x: 3, y: 4 }).passos,
    },
    vejaTambem: ['ponto-reta.equacao', 'ponto-reta.posicoes'],
  },
  {
    id: 'ponto-reta.equacao',
    titulo: 'Equação da reta',
    resumo: 'Dois pontos bastam para determiná-la.',
    definicao:
      'O coeficiente angular mede a inclinação: quanto y sobe a cada unidade que x avança. ' +
      'Com ele e um ponto conhecido, a reta fica completamente determinada.',
    formulas: [
      { tex: 'm = \\frac{y_2 - y_1}{x_2 - x_1}' },
      { tex: 'y - y_0 = m(x - x_0)', legenda: 'Forma ponto-inclinação.' },
      { tex: 'y = mx + n', legenda: 'Forma reduzida.' },
    ],
    demonstracao: [
      {
        descricao: 'A inclinação é a mesma entre quaisquer dois pontos da reta.',
        tex: '\\frac{y - y_0}{x - x_0} = m',
      },
      {
        descricao: 'Multiplicando em cruz, obtém-se a forma ponto-inclinação.',
        tex: 'y - y_0 = m(x - x_0)',
      },
      {
        descricao: 'Isolando y, chega-se à forma reduzida.',
        tex: 'y = mx + (y_0 - mx_0)',
        nota: 'O termo entre parênteses é o coeficiente linear n.',
      },
      {
        descricao: 'Retas verticais são a exceção: não têm coeficiente angular.',
        tex: 'x = k',
        nota: 'A divisão por Δx = 0 seria impossível.',
      },
    ],
    exemplo: {
      enunciado: 'A reta por (0, 1) e (2, 5).',
      passos: retaPorDoisPontosComPassos({ x: 0, y: 1 }, { x: 2, y: 5 }).passos,
    },
    vejaTambem: ['ponto-reta.distancia', 'ponto-reta.posicoes'],
  },
  {
    id: 'ponto-reta.posicoes',
    titulo: 'Paralelas e perpendiculares',
    resumo: 'Mesma inclinação, ou produto das inclinações igual a −1.',
    definicao:
      'Duas retas são paralelas quando têm a mesma inclinação. São perpendiculares quando o ' +
      'produto dos coeficientes angulares vale −1 — o que equivale a dizer que uma é o ' +
      'inverso negativo da outra.',
    formulas: [
      { tex: 'm_1 = m_2 \\;\\Rightarrow\\; \\text{paralelas}' },
      { tex: 'm_1 \\cdot m_2 = -1 \\;\\Rightarrow\\; \\text{perpendiculares}' },
    ],
    demonstracao: [
      {
        descricao: 'Mesma inclinação significa que as retas sobem na mesma proporção.',
        tex: 'm_1 = m_2 \\;\\Rightarrow\\; \\text{nunca se encontram (ou coincidem)}',
      },
      {
        descricao: 'Girar uma reta em 90° troca Δx por Δy e inverte um dos sinais.',
        tex: "m = \\frac{\\Delta y}{\\Delta x} \\;\\longrightarrow\\; m' = \\frac{-\\Delta x}{\\Delta y} = -\\frac{1}{m}",
      },
      {
        descricao: 'Multiplicando as duas inclinações.',
        tex: 'm \\cdot \\left(-\\frac{1}{m}\\right) = -1',
        nota: 'Daí a condição de perpendicularidade.',
      },
    ],
    exemplo: {
      enunciado: 'A reta y = 2x + 1 é perpendicular a y = −x/2 + 3.',
      passos: [
        { descricao: 'As inclinações são 2 e −1/2.', tex: 'm_1 = 2 \\qquad m_2 = -\\frac{1}{2}' },
        {
          descricao: 'O produto delas.',
          tex: '2 \\cdot \\left(-\\frac{1}{2}\\right) = -1 \\;\\checkmark',
        },
      ],
    },
    vejaTambem: ['ponto-reta.equacao'],
  },
  {
    id: 'ponto-reta.distancia-reta',
    titulo: 'Distância de ponto a reta',
    resumo: 'Substitua o ponto na equação da reta e divida pelo comprimento de (a, b).',
    definicao:
      'A distância de um ponto a uma reta é medida pelo caminho mais curto, que é ' +
      'perpendicular à reta. Com a reta na forma geral ax + by + c = 0, o vetor (a, b) é ' +
      'perpendicular a ela; substituir o ponto na expressão ax + by + c mede quanto ele está ' +
      'fora da reta, e dividir por √(a² + b²) transforma isso em comprimento. Se a reta vier ' +
      'como y = mx + q, primeiro passe tudo para um lado.',
    formulas: [
      {
        tex: 'd = \\frac{|ax_0 + by_0 + c|}{\\sqrt{a^{2} + b^{2}}}',
        legenda: 'Ponto (x₀, y₀), reta ax + by + c = 0.',
      },
      {
        tex: 'y = mx + q \\;\\Rightarrow\\; mx - y + q = 0',
        legenda: 'Da forma reduzida para a geral: a = m, b = −1, c = q.',
      },
    ],
    demonstracao: [
      {
        descricao: 'O vetor (a, b) é perpendicular à reta: andar sobre ela não muda ax + by.',
        tex: 'a(x + b t) + b(y - a t) = ax + by',
      },
      {
        descricao: 'Num ponto fora da reta, ax₀ + by₀ + c deixa de ser zero.',
        tex: 'ax_0 + by_0 + c \\neq 0',
      },
      {
        descricao:
          'Dividir pelo comprimento de (a, b) normaliza: multiplicar a equação por 2 não muda a distância.',
        tex: '\\frac{|2ax_0 + 2by_0 + 2c|}{\\sqrt{4a^{2} + 4b^{2}}} = \\frac{|ax_0 + by_0 + c|}{\\sqrt{a^{2} + b^{2}}}',
        nota: 'O módulo garante distância positiva, de qualquer lado da reta.',
      },
    ],
    exemplo: {
      enunciado: 'Distância de P(1, 2) à reta 3x + 4y − 1 = 0.',
      passos: [
        {
          descricao: 'Numerador: o ponto na expressão da reta.',
          tex: '|3 \\cdot 1 + 4 \\cdot 2 - 1| = |10| = 10',
        },
        { descricao: 'Denominador: o comprimento de (3, 4).', tex: '\\sqrt{3^{2} + 4^{2}} = 5' },
        { descricao: 'Dividindo.', tex: 'd = \\frac{10}{5} = 2' },
      ],
    },
    vejaTambem: ['ponto-reta.distancia', 'ponto-reta.posicoes'],
  },
  {
    id: 'ponto-reta.intersecao',
    titulo: 'Interseção de duas retas',
    resumo: 'O ponto comum resolve as duas equações ao mesmo tempo.',
    definicao:
      'Duas retas com inclinações diferentes se cruzam em exatamente um ponto, que satisfaz as ' +
      'duas equações. Na forma reduzida, iguala-se os dois y; na forma geral, resolve-se o ' +
      'sistema (eliminação ou Cramer). Se as inclinações forem iguais, as retas são paralelas ' +
      '(nenhum ponto) ou a mesma reta (todos).',
    formulas: [
      { tex: 'm_1 x + q_1 = m_2 x + q_2 \\;\\Rightarrow\\; x = \\frac{q_2 - q_1}{m_1 - m_2}' },
      {
        tex: 'x = \\frac{c_1 b_2 - c_2 b_1}{a_1 b_2 - a_2 b_1} \\qquad y = \\frac{a_1 c_2 - a_2 c_1}{a_1 b_2 - a_2 b_1}',
      },
    ],
    demonstracao: [
      {
        descricao: 'No ponto comum, o mesmo x dá o mesmo y nas duas retas.',
        tex: 'y = m_1 x + q_1 = m_2 x + q_2',
      },
      {
        descricao: 'Com m₁ ≠ m₂, a equação em x tem uma única solução.',
        tex: '(m_1 - m_2)\\,x = q_2 - q_1',
      },
    ],
    exemplo: {
      enunciado: 'r: y = 2x − 1 e s: y = −x + 5.',
      passos: [
        {
          descricao: 'Igualando.',
          tex: '2x - 1 = -x + 5 \\;\\Rightarrow\\; 3x = 6 \\;\\Rightarrow\\; x = 2',
        },
        { descricao: 'Substituindo em r.', tex: 'y = 2 \\cdot 2 - 1 = 3 \\qquad P = (2,\\; 3)' },
      ],
    },
    vejaTambem: ['ponto-reta.equacao', 'sistemas.intersecao'],
  },
];
