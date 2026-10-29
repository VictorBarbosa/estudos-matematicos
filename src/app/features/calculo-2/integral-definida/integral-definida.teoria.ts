import { Polinomio, teoremaFundamentalComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_DEFINIDA: readonly Teoria[] = [
  {
    id: 'integral-def.definicao',
    titulo: 'Área com sinal',
    resumo: 'Abaixo do eixo, a área conta como negativa.',
    definicao:
      'A integral definida é o limite das somas de Riemann no intervalo. Como as alturas ' +
      'entram com seu sinal, trechos abaixo do eixo contribuem negativamente — por isso ' +
      'falamos em área COM SINAL, e não simplesmente em área.',
    formulas: [
      { tex: '\\int_{a}^{b} f(x)\\,dx = \\lim_{n \\to \\infty} \\sum f(x_i)\\Delta x' },
      { tex: '\\int_{a}^{b} f\\,dx < 0 \\;\\text{se}\\; f < 0 \\;\\text{no intervalo}' },
    ],
    demonstracao: [
      {
        descricao: 'Nos retângulos, a altura é f(xᵢ), que pode ser negativa.',
        tex: 'f(x_i) < 0 \\;\\Rightarrow\\; \\text{contribuição negativa}',
      },
      {
        descricao: 'Num intervalo simétrico de função ímpar, tudo se cancela.',
        tex: '\\int_{-1}^{1} x\\,dx = 0',
        nota: 'A área à esquerda do eixo anula exatamente a da direita.',
      },
      {
        descricao: 'Para a área geométrica, integra-se o módulo da função.',
        tex: '\\text{área} = \\int_{a}^{b} |f(x)|\\,dx',
      },
    ],
    exemplo: {
      enunciado: 'A integral de x² de 0 a 3.',
      passos: teoremaFundamentalComPassos(Polinomio.de(0, 0, 1), 0, 3).passos,
    },
    vejaTambem: ['integral-def.propriedades', 'tfc.enunciado'],
  },
  {
    id: 'integral-def.propriedades',
    titulo: 'Propriedades da integral definida',
    resumo: 'Linearidade, aditividade e inversão de limites.',
    definicao:
      'A integral é linear, pode ser quebrada em subintervalos e troca de sinal quando os ' +
      'limites são invertidos. Essas três propriedades resolvem boa parte dos exercícios ' +
      'sem nenhuma conta nova.',
    formulas: [
      { tex: '\\int_{a}^{b} = \\int_{a}^{c} + \\int_{c}^{b}', legenda: 'Aditividade.' },
      { tex: '\\int_{b}^{a} f\\,dx = -\\int_{a}^{b} f\\,dx', legenda: 'Inverter limites troca o sinal.' },
      { tex: '\\int_{a}^{a} f\\,dx = 0' },
    ],
    demonstracao: [
      {
        descricao: 'Partir o intervalo em dois é partir a área em duas.',
        tex: '[a, b] = [a, c] \\cup [c, b]',
      },
      {
        descricao: 'Invertendo os limites, o Δx fica negativo e o sinal da soma vira.',
        tex: '\\Delta x = \\frac{a - b}{n} < 0',
      },
      {
        descricao: 'Com limites iguais, não há intervalo e a área é nula.',
        tex: '\\int_{a}^{a} f\\,dx = 0',
      },
    ],
    exemplo: {
      enunciado: 'Integrando x de −2 a 2: as metades se cancelam.',
      passos: teoremaFundamentalComPassos(Polinomio.de(0, 1), -2, 2).passos,
    },
    vejaTambem: ['integral-def.definicao', 'tfc.enunciado'],
  },
  {
    id: 'integral-def.area-geometrica',
    titulo: 'Integral e área não são a mesma coisa',
    resumo: 'Integral nula não significa região vazia.',
    definicao:
      'Uma integral pode dar zero com uma área geométrica enorme, desde que metade esteja ' +
      'acima e metade abaixo do eixo. Para obter a área de fato, é preciso separar os ' +
      'trechos pelo sinal e somar os módulos.',
    formulas: [
      { tex: '\\int_{-1}^{1} x\\,dx = 0 \\qquad \\text{mas a área é } 1' },
    ],
    demonstracao: [
      {
        descricao: 'De −1 a 0 a função é negativa; de 0 a 1, positiva.',
        tex: '\\int_{-1}^{0} x\\,dx = -\\tfrac{1}{2} \\qquad \\int_{0}^{1} x\\,dx = \\tfrac{1}{2}',
      },
      {
        descricao: 'Somando, os sinais se cancelam.',
        tex: '-\\tfrac{1}{2} + \\tfrac{1}{2} = 0',
      },
      {
        descricao: 'Somando os módulos, obtemos a área geométrica.',
        tex: '\\left|-\\tfrac{1}{2}\\right| + \\left|\\tfrac{1}{2}\\right| = 1',
        nota: 'Por isso é preciso localizar as raízes antes de calcular áreas.',
      },
    ],
    exemplo: {
      enunciado: 'A integral de x no intervalo simétrico.',
      passos: teoremaFundamentalComPassos(Polinomio.de(0, 1), -1, 1).passos,
    },
    vejaTambem: ['integral-def.definicao', 'aplic-integral.area'],
  },
];
