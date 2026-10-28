import { distanciaComPassos, retaPorDoisPontosComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

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
      { tex: 'M = \\left(\\frac{x_1 + x_2}{2},\; \\frac{y_1 + y_2}{2}\\right)', legenda: 'Ponto médio: a média das coordenadas.' },
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
      { tex: 'm_1 = m_2 \;\\Rightarrow\; \\text{paralelas}' },
      { tex: 'm_1 \\cdot m_2 = -1 \;\\Rightarrow\; \\text{perpendiculares}' },
    ],
    demonstracao: [
      {
        descricao: 'Mesma inclinação significa que as retas sobem na mesma proporção.',
        tex: 'm_1 = m_2 \;\\Rightarrow\; \\text{nunca se encontram (ou coincidem)}',
      },
      {
        descricao: 'Girar uma reta em 90° troca Δx por Δy e inverte um dos sinais.',
        tex: 'm = \\frac{\\Delta y}{\\Delta x} \;\\longrightarrow\; m\' = \\frac{-\\Delta x}{\\Delta y} = -\\frac{1}{m}',
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
        { descricao: 'O produto delas.', tex: '2 \\cdot \\left(-\\frac{1}{2}\\right) = -1 \;\\checkmark' },
      ],
    },
    vejaTambem: ['ponto-reta.equacao'],
  },
];
