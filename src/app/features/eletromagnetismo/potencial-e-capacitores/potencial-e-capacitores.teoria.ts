import {
  associacaoComPassos,
  capacitorPlanoComPassos,
  potencialPontualComPassos,
} from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_POTENCIAL_CAPACITORES: readonly Teoria[] = [
  {
    id: 'potencial.definicao',
    titulo: 'Potencial elétrico',
    resumo: 'Energia por unidade de carga: um número, com sinal, que se soma sem vetores.',
    definicao:
      'O potencial V num ponto é a energia potencial que uma carga de 1 C teria ali. De uma ' +
      'carga pontual, V = kq/r — cai com r (e não com r², como o campo) e tem o sinal da carga. ' +
      'Por ser escalar, o potencial de várias cargas é a soma simples dos potenciais de cada uma, ' +
      'com sinais: não há componentes a decompor.',
    formulas: [
      { tex: 'V = k\\,\\frac{q}{r}' },
      { tex: 'V_P = \\sum k\\,\\frac{q_i}{r_i}', legenda: 'Superposição: soma com sinal.' },
    ],
    demonstracao: [
      {
        descricao:
          'A energia potencial de duas cargas é kq₁q₂/r; dividindo pela carga de prova, sobra kq/r.',
        tex: 'U = k\\,\\frac{q\\,q_0}{r} \\;\\Rightarrow\\; V = \\frac{U}{q_0} = k\\,\\frac{q}{r}',
      },
    ],
    exemplo: {
      enunciado: 'O potencial a 0,3 m de uma carga de −4 μC.',
      passos: potencialPontualComPassos(-4, 0.3).passos,
    },
    vejaTambem: ['potencial.trabalho', 'eletrostatica.campo'],
  },
  {
    id: 'potencial.trabalho',
    titulo: 'Diferença de potencial e trabalho',
    resumo: 'Levar uma carga de A a B custa q·(V_B − V_A).',
    definicao:
      'A diferença de potencial (a «tensão», em volts) entre dois pontos mede a energia por ' +
      'coulomb que se ganha ou perde ao passar de um ao outro. O trabalho que um agente externo ' +
      'faz para levar devagar uma carga q de A até B é W = q(V_B − V_A). Uma carga positiva ' +
      'sozinha «desce» espontaneamente para potenciais menores; uma negativa, para maiores.',
    formulas: [{ tex: 'W_{A \\to B} = q\\,(V_B - V_A) = q\\,\\Delta V' }],
    demonstracao: [
      {
        descricao: 'O trabalho do agente é a variação da energia potencial, e U = qV.',
        tex: 'W = U_B - U_A = qV_B - qV_A',
      },
    ],
    exemplo: {
      enunciado: 'Levar 2 μC de 100 V até 400 V.',
      passos: [
        { descricao: 'A diferença de potencial.', tex: '\\Delta V = 400 - 100 = 300\\ \\text{V}' },
        {
          descricao: 'O trabalho.',
          tex: 'W = 2 \\times 10^{-6} \\cdot 300 = 6 \\times 10^{-4}\\ \\text{J} = 0{,}6\\ \\text{mJ}',
        },
      ],
    },
    vejaTambem: ['potencial.definicao', 'energia.trabalho'],
  },
  {
    id: 'capacitores.definicao',
    titulo: 'O capacitor',
    resumo: 'Guarda carga proporcional à tensão: Q = CV; nas placas paralelas, C = ε₀A/d.',
    definicao:
      'Dois condutores separados por um isolante formam um capacitor. Ligado a uma tensão V, ' +
      'ele acumula +Q numa placa e −Q na outra, com Q = CV; a capacitância C (em farads) depende ' +
      'só da geometria. Para placas paralelas de área A a uma distância d, C = ε₀A/d: placas ' +
      'maiores e mais próximas guardam mais carga. Os valores práticos são de pF a μF.',
    formulas: [
      { tex: 'Q = CV' },
      {
        tex: 'C = \\frac{\\varepsilon_0 A}{d} \\qquad \\varepsilon_0 = 8{,}85 \\times 10^{-12}\\ \\text{F/m}',
      },
    ],
    demonstracao: [
      {
        descricao: 'Entre as placas o campo é uniforme, E = Q/(ε₀A), e a tensão é E·d.',
        tex: 'V = Ed = \\frac{Qd}{\\varepsilon_0 A} \\;\\Rightarrow\\; C = \\frac{Q}{V} = \\frac{\\varepsilon_0 A}{d}',
      },
    ],
    exemplo: {
      enunciado: 'Placas de 200 cm² a 1 mm.',
      passos: capacitorPlanoComPassos(200, 1).passos,
    },
    vejaTambem: ['capacitores.energia', 'capacitores.associacao'],
  },
  {
    id: 'capacitores.energia',
    titulo: 'Energia no capacitor',
    resumo: 'U = ½CV²: a carga entra contra uma tensão que cresce.',
    definicao:
      'Carregar o capacitor custa trabalho, porque cada nova porção de carga é empurrada contra ' +
      'a tensão que as anteriores já criaram. Como essa tensão sobe de 0 a V, a energia guardada ' +
      'é a média, ½·V, vezes a carga: U = ½QV = ½CV². É essa energia que o flash de uma câmera ' +
      'libera de uma vez.',
    formulas: [{ tex: 'U = \\tfrac{1}{2}QV = \\tfrac{1}{2}CV^{2} = \\frac{Q^{2}}{2C}' }],
    demonstracao: [
      {
        descricao: 'No gráfico V × Q a reta vai de 0 a V; a energia é a área do triângulo.',
        tex: 'U = \\tfrac{1}{2} \\cdot Q \\cdot V',
      },
    ],
    exemplo: {
      enunciado: '100 μF a 12 V.',
      passos: [
        {
          descricao: 'Substituindo.',
          tex: 'U = \\tfrac{1}{2} \\cdot 100 \\times 10^{-6} \\cdot 12^{2}',
        },
        {
          descricao: 'Calculando.',
          tex: 'U = 7{,}2 \\times 10^{-3}\\ \\text{J} = 7{,}2\\ \\text{mJ}',
        },
      ],
    },
    vejaTambem: ['capacitores.definicao', 'potencial.trabalho'],
  },
  {
    id: 'capacitores.associacao',
    titulo: 'Capacitores em série e em paralelo',
    resumo: 'O espelho dos resistores: em paralelo somam, em série somam-se os inversos.',
    definicao:
      'Em paralelo, todos ficam com a mesma tensão e as cargas se somam: é como uma placa ' +
      'maior, C = C₁ + C₂. Em série, todos guardam a mesma carga e as tensões se somam: é como ' +
      'afastar as placas, 1/C = 1/C₁ + 1/C₂, e o equivalente fica menor que o menor deles. Para ' +
      'dois em série, vale o atalho produto sobre soma.',
    formulas: [
      { tex: '\\text{paralelo: } C = C_1 + C_2 + \\cdots' },
      { tex: '\\text{série: } \\frac{1}{C} = \\frac{1}{C_1} + \\frac{1}{C_2} + \\cdots' },
    ],
    demonstracao: [
      {
        descricao: 'Em série, a mesma carga Q e as tensões somadas.',
        tex: 'V = \\frac{Q}{C_1} + \\frac{Q}{C_2} \\;\\Rightarrow\\; \\frac{1}{C} = \\frac{1}{C_1} + \\frac{1}{C_2}',
      },
    ],
    exemplo: {
      enunciado: '3 μF e 6 μF em série.',
      passos: associacaoComPassos([3, 6], 'serie', 'capacitor').passos,
    },
    vejaTambem: ['capacitores.definicao', 'circuitos.associacao'],
  },
];
