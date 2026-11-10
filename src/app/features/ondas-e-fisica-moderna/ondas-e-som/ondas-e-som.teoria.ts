import {
  dopplerComPassos,
  harmonicoComPassos,
  nivelSonoroComPassos,
  velocidadeDaOndaComPassos,
  velocidadeNaCordaComPassos,
} from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_ONDAS_E_SOM: readonly Teoria[] = [
  {
    id: 'ondas.relacao',
    titulo: 'v = λ·f',
    resumo: 'Em cada oscilação a onda avança um comprimento de onda.',
    definicao:
      'Uma onda transporta energia sem transportar matéria: cada ponto do meio oscila no lugar, e ' +
      'o padrão é que se desloca. A distância entre duas cristas é o comprimento de onda λ; o ' +
      'número de cristas que passam por segundo é a frequência f. Em um período a onda anda um λ, ' +
      'por isso v = λ·f. A velocidade depende do MEIO; a frequência, da FONTE — ao mudar de meio, ' +
      'f fica e λ se ajusta.',
    formulas: [
      { tex: 'v = \\lambda f = \\frac{\\lambda}{T}' },
      {
        tex: 'v_{som,\\,ar} \\approx 340\\ \\text{m/s} \\qquad v_{luz} = 3 \\times 10^{8}\\ \\text{m/s}',
      },
    ],
    demonstracao: [
      {
        descricao:
          'Num período T, a crista que estava aqui é substituída pela seguinte: a onda andou λ.',
        tex: 'v = \\frac{\\lambda}{T}',
      },
      { descricao: 'Como f = 1/T.', tex: 'v = \\lambda f' },
    ],
    exemplo: {
      enunciado: 'Uma onda com λ = 0,77 m e f = 440 Hz.',
      passos: velocidadeDaOndaComPassos(0.77, 440).passos,
    },
    vejaTambem: ['ondas.corda', 'mhs.periodo'],
  },
  {
    id: 'ondas.corda',
    titulo: 'A velocidade numa corda',
    resumo: 'Mais tensa, mais rápida; mais pesada, mais lenta: v = √(T/μ).',
    definicao:
      'Numa corda esticada a força restauradora é a tração T, e a inércia é a massa por unidade ' +
      'de comprimento μ (em kg/m). A velocidade da onda cresce com a raiz da tração e cai com a ' +
      'raiz de μ. É por isso que se afina um violão apertando a tarraxa, e que as cordas graves são ' +
      'mais grossas.',
    formulas: [{ tex: 'v = \\sqrt{\\frac{T}{\\mu}}' }],
    demonstracao: [
      {
        descricao: 'Por análise dimensional: N dividido por kg/m dá (kg·m/s²)·(m/kg) = m²/s².',
        tex: '\\left[\\frac{T}{\\mu}\\right] = \\frac{\\text{m}^{2}}{\\text{s}^{2}} \\;\\Rightarrow\\; \\sqrt{T/\\mu} \\text{ é uma velocidade}',
      },
    ],
    exemplo: {
      enunciado: 'Uma corda com T = 80 N e μ = 5 g/m = 0,005 kg/m.',
      passos: velocidadeNaCordaComPassos(80, 0.005).passos,
    },
    vejaTambem: ['ondas.relacao', 'ondas.harmonicos'],
  },
  {
    id: 'ondas.harmonicos',
    titulo: 'Ondas estacionárias e harmônicos',
    resumo: 'Só cabem as ondas que «fecham» no comprimento disponível.',
    definicao:
      'Numa corda presa nas pontas, a onda refletida se soma à de ida e forma uma onda ' +
      'estacionária, com nós fixos nas pontas. Só cabem números inteiros de meias ondas: ' +
      'L = n·λ/2, logo fₙ = n·v/(2L). Um tubo aberto nas duas pontas segue a mesma regra. Um tubo ' +
      'fechado numa ponta tem nó de um lado e ventre do outro: cabem quartos de onda ímpares, ' +
      'fₙ = n·v/(4L), só com n ímpar. Duas notas próximas tocadas juntas pulsam com a frequência ' +
      'da diferença: o batimento.',
    formulas: [
      { tex: 'f_n = \\frac{n v}{2L} \\quad (\\text{corda, tubo aberto})' },
      { tex: 'f_n = \\frac{n v}{4L},\\ n \\text{ ímpar} \\quad (\\text{tubo fechado})' },
      { tex: 'f_{bat} = |f_1 - f_2|' },
    ],
    demonstracao: [
      {
        descricao: 'Nós nas duas pontas: o comprimento é um número inteiro de meias ondas.',
        tex: 'L = n\\frac{\\lambda}{2} \\;\\Rightarrow\\; \\lambda_n = \\frac{2L}{n}',
      },
      { descricao: 'Com v = λf.', tex: 'f_n = \\frac{v}{\\lambda_n} = \\frac{n v}{2L}' },
    ],
    exemplo: {
      enunciado: 'Tubo fechado de 0,5 m, 3º harmônico, som a 340 m/s.',
      passos: harmonicoComPassos(3, 0.5, 340, true).passos,
    },
    vejaTambem: ['ondas.corda', 'ondas.relacao'],
  },
  {
    id: 'ondas.decibel',
    titulo: 'O decibel',
    resumo: 'Cada 10 dB a mais é uma intensidade 10 vezes maior.',
    definicao:
      'O ouvido responde a razões de intensidade, numa faixa de 10¹² vezes entre o limiar da ' +
      'audição e o da dor. A escala em decibéis comprime essa faixa com um logaritmo: β = 10·log(I/I₀), ' +
      'com I₀ = 10⁻¹² W/m². Por isso 60 dB não é o dobro de 30 dB: é mil vezes mais intenso.',
    formulas: [{ tex: '\\beta = 10\\log\\frac{I}{I_0} \\qquad I_0 = 10^{-12}\\ \\text{W/m}^{2}' }],
    demonstracao: [
      {
        descricao: 'Multiplicar I por 10 soma 1 ao logaritmo, e 10 ao nível em dB.',
        tex: '10\\log\\frac{10 I}{I_0} = 10\\log\\frac{I}{I_0} + 10',
      },
    ],
    exemplo: {
      enunciado: 'Uma conversa com I = 10⁻⁶ W/m².',
      passos: nivelSonoroComPassos(1e-6).passos,
    },
    vejaTambem: ['exponencial.definicao', 'ondas.relacao'],
  },
  {
    id: 'ondas.doppler',
    titulo: 'O efeito Doppler',
    resumo: 'Aproximar-se aumenta a frequência ouvida; afastar-se diminui.',
    definicao:
      'Quando a fonte se aproxima, cada crista sai de um ponto mais próximo do ouvinte: as cristas ' +
      'chegam mais juntas, e a frequência ouvida sobe. Quando o ouvinte corre em direção à fonte, ' +
      'encontra mais cristas por segundo. As duas coisas entram na mesma fórmula, com sinais que ' +
      'se escolhem pelo sentido do movimento.',
    formulas: [
      {
        tex: "f' = f\\,\\frac{v + v_o}{v - v_f}",
        legenda: 'vₒ e v_f positivos quando cada um se aproxima do outro.',
      },
    ],
    demonstracao: [
      {
        descricao:
          'Fonte em movimento: entre duas cristas ela anda v_f·T, e o comprimento de onda à frente encurta.',
        tex: "\\lambda' = (v - v_f)T \\;\\Rightarrow\\; f' = \\frac{v}{\\lambda'} = f\\frac{v}{v - v_f}",
      },
      {
        descricao:
          'Ouvinte em movimento: as cristas passam por ele com velocidade relativa v + vₒ.',
        tex: "f' = \\frac{v + v_o}{\\lambda}",
      },
    ],
    exemplo: {
      enunciado: 'Sirene de 600 Hz se aproximando a 20 m/s, ouvinte parado.',
      passos: dopplerComPassos(600, 340, 0, 20).passos,
    },
    vejaTambem: ['ondas.relacao'],
  },
];
