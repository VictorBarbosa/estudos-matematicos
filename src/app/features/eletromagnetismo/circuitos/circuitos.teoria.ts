import { associacaoComPassos, cargaRcComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_CIRCUITOS: readonly Teoria[] = [
  {
    id: 'circuitos.ohm',
    titulo: 'Lei de Ohm',
    resumo: 'Num resistor, a tensão é proporcional à corrente: V = RI.',
    definicao:
      'A corrente (em ampères) é a carga que passa por segundo. Num resistor ôhmico, ela é ' +
      'proporcional à tensão aplicada: V = RI, com R em ohms. A mesma tensão empurra menos ' +
      'corrente por uma resistência maior. Correntes pequenas se medem em mA (10⁻³ A).',
    formulas: [{ tex: 'V = RI \\qquad I = \\frac{V}{R}' }],
    demonstracao: [
      {
        descricao: 'Dobrar a tensão dobra a corrente; dobrar a resistência a reduz à metade.',
        tex: 'I(2V) = 2I \\qquad I(2R) = \\frac{I}{2}',
      },
    ],
    exemplo: {
      enunciado: '12 V num resistor de 220 Ω.',
      passos: [
        { descricao: 'Ohm.', tex: 'I = \\frac{12}{220} = 0{,}0545\\ \\text{A}' },
        { descricao: 'Em mA.', tex: 'I = 54{,}55\\ \\text{mA}' },
      ],
    },
    vejaTambem: ['circuitos.potencia', 'circuitos.associacao'],
  },
  {
    id: 'circuitos.potencia',
    titulo: 'Potência elétrica',
    resumo: 'P = VI = RI² = V²/R: as três formas são a mesma, trocando por Ohm.',
    definicao:
      'A potência é a energia entregue por segundo: P = VI. Num resistor, usando V = RI, ela ' +
      'também vale RI² ou V²/R — escolhe-se a forma pelos dados que se tem. É a potência que ' +
      'aquece o resistor (efeito Joule), e é ela que a conta de luz cobra, em kWh.',
    formulas: [{ tex: 'P = VI = RI^{2} = \\frac{V^{2}}{R}' }],
    demonstracao: [
      { descricao: 'Trocando V por RI.', tex: 'P = (RI)I = RI^{2}' },
      { descricao: 'Trocando I por V/R.', tex: 'P = V\\,\\frac{V}{R} = \\frac{V^{2}}{R}' },
    ],
    exemplo: {
      enunciado: 'Um resistor de 10 Ω ligado a 12 V.',
      passos: [
        {
          descricao: 'Com V e R.',
          tex: 'P = \\frac{12^{2}}{10} = \\frac{144}{10} = 14{,}4\\ \\text{W}',
        },
      ],
    },
    vejaTambem: ['circuitos.ohm', 'energia.potencia'],
  },
  {
    id: 'circuitos.associacao',
    titulo: 'Resistores em série e em paralelo',
    resumo: 'Em série somam; em paralelo somam-se os inversos.',
    definicao:
      'Em série, a mesma corrente atravessa todos e as tensões se somam: R = R₁ + R₂. Em ' +
      'paralelo, todos têm a mesma tensão e as correntes se somam: 1/R = 1/R₁ + 1/R₂, e o ' +
      'equivalente fica menor que o menor resistor — mais caminhos, menos resistência. Num ' +
      'divisor de tensão (dois em série), cada um fica com a fração da tensão igual à sua fração ' +
      'da resistência.',
    formulas: [
      {
        tex: '\\text{série: } R = R_1 + R_2 \\qquad \\text{paralelo: } \\frac{1}{R} = \\frac{1}{R_1} + \\frac{1}{R_2}',
      },
      { tex: 'V_2 = V\\,\\frac{R_2}{R_1 + R_2}', legenda: 'Divisor de tensão.' },
    ],
    demonstracao: [
      {
        descricao: 'Em paralelo, a mesma tensão e as correntes somadas.',
        tex: 'I = \\frac{V}{R_1} + \\frac{V}{R_2} \\;\\Rightarrow\\; \\frac{1}{R} = \\frac{1}{R_1} + \\frac{1}{R_2}',
      },
    ],
    exemplo: {
      enunciado: '20 Ω e 30 Ω em paralelo.',
      passos: associacaoComPassos([20, 30], 'paralelo', 'resistor').passos,
    },
    vejaTambem: ['circuitos.ohm', 'capacitores.associacao'],
  },
  {
    id: 'circuitos.kirchhoff',
    titulo: 'Leis de Kirchhoff',
    resumo: 'Nos nós, a corrente que entra sai; nas malhas, as tensões somam zero.',
    definicao:
      'Quando o circuito não se reduz a série e paralelo, usam-se as duas leis de Kirchhoff. ' +
      'Lei dos nós (conservação da carga): a soma das correntes que chegam a um nó é igual à das ' +
      'que saem. Lei das malhas (conservação da energia): percorrendo uma malha fechada, a soma ' +
      'das fem é igual à soma das quedas RI. Fontes em oposição numa malha se subtraem.',
    formulas: [
      { tex: '\\sum I_{\\text{entram}} = \\sum I_{\\text{saem}}' },
      { tex: '\\sum \\varepsilon = \\sum RI \\quad (\\text{numa malha})' },
    ],
    demonstracao: [
      {
        descricao: 'Com o potencial V de um nó como incógnita, cada ramo leva (ε − V)/R.',
        tex: '\\frac{\\varepsilon_1 - V}{R_1} + \\frac{\\varepsilon_2 - V}{R_2} = \\frac{V}{R_3}',
      },
    ],
    exemplo: {
      enunciado: 'Baterias de 12 V e 6 V em oposição, com 2 Ω e 4 Ω.',
      passos: [
        { descricao: 'As fem se subtraem.', tex: '12 - 6 = (2 + 4)\\,I' },
        { descricao: 'Isolando I.', tex: 'I = \\frac{6}{6} = 1\\ \\text{A}' },
      ],
    },
    vejaTambem: ['circuitos.associacao', 'sistemas.metodos'],
  },
  {
    id: 'circuitos.rc',
    titulo: 'Circuito RC',
    resumo: 'O capacitor carrega exponencialmente, com constante de tempo τ = RC.',
    definicao:
      'Ligando um capacitor descarregado a uma fonte através de um resistor, a carga não ' +
      'aparece de uma vez: q(t) = Q(1 − e^(−t/τ)), com Q = CV e τ = RC. Depois de um τ o ' +
      'capacitor tem 63% da carga final; depois de 5τ, mais de 99%. Na descarga, q(t) = Q·e^(−t/τ). ' +
      'kΩ vezes μF dá milissegundos.',
    formulas: [
      { tex: 'q(t) = Q\\left(1 - e^{-t/RC}\\right) \\qquad \\tau = RC' },
      { tex: 'q(\\tau) = Q(1 - e^{-1}) \\approx 0{,}632\\,Q' },
    ],
    demonstracao: [
      {
        descricao: 'Malha: a fonte é a tensão no resistor mais a do capacitor.',
        tex: 'V = R\\,\\frac{dq}{dt} + \\frac{q}{C}',
      },
      {
        descricao:
          'É uma EDO de 1ª ordem; com q(0) = 0, a solução é a exponencial que se aproxima de CV.',
        tex: 'q(t) = CV\\left(1 - e^{-t/RC}\\right)',
      },
    ],
    exemplo: {
      enunciado: '10 kΩ, 100 μF e 9 V, depois de 1 s.',
      passos: cargaRcComPassos(10, 100, 9, 1).passos,
    },
    vejaTambem: ['circuitos.ohm', 'capacitores.definicao'],
  },
];
