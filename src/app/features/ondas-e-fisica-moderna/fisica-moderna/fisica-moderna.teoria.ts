import {
  MASSA_ELETRON,
  contracaoDoComprimentoComPassos,
  deBroglieComPassos,
  dilatacaoDoTempoComPassos,
  energiaDoFotonComPassos,
  fatorDeLorentzComPassos,
  fotoeletricoComPassos,
} from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_FISICA_MODERNA: readonly Teoria[] = [
  {
    id: 'moderna.lorentz',
    titulo: 'O fator de Lorentz',
    resumo: 'γ = 1/√(1 − v²/c²): perto de 1 no dia a dia, infinito em c.',
    definicao:
      'Einstein partiu de dois postulados: as leis da física são as mesmas para todo observador ' +
      'em movimento uniforme, e a velocidade da luz é a mesma para todos. Para que os dois valham ' +
      'juntos, tempo e espaço precisam depender de quem mede, e a correção é sempre o mesmo fator ' +
      'γ. A 10% de c ele vale só 1,005; a 99% de c, cerca de 7.',
    formulas: [
      { tex: '\\gamma = \\frac{1}{\\sqrt{1 - (v/c)^{2}}} \\geq 1' },
      { tex: '\\frac{v}{c} = \\sqrt{1 - \\frac{1}{\\gamma^{2}}}' },
    ],
    demonstracao: [
      {
        descricao:
          'Um relógio de luz em movimento: o pulso percorre a diagonal, mais longa, à mesma velocidade c.',
        tex: '(c\\,\\Delta t)^{2} = (c\\,\\Delta t_0)^{2} + (v\\,\\Delta t)^{2}',
      },
      {
        descricao: 'Isolando Δt.',
        tex: '\\Delta t = \\frac{\\Delta t_0}{\\sqrt{1 - v^{2}/c^{2}}} = \\gamma\\,\\Delta t_0',
      },
    ],
    exemplo: { enunciado: 'A 0,8c.', passos: fatorDeLorentzComPassos(0.8).passos },
    vejaTambem: ['moderna.dilatacao', 'moderna.energia'],
  },
  {
    id: 'moderna.dilatacao',
    titulo: 'Dilatação do tempo e contração do comprimento',
    resumo: 'Relógios em movimento atrasam; réguas em movimento encolhem.',
    definicao:
      'O tempo próprio Δt₀ é o medido por um relógio parado em relação ao evento. Quem vê esse ' +
      'relógio passar mede Δt = γΔt₀, um intervalo MAIOR. Por isso múons criados no alto da ' +
      'atmosfera, que viveriam só 2,2 µs, chegam ao solo. Na direção do movimento, os comprimentos ' +
      'encolhem pelo mesmo fator: L = L₀/γ, sendo L₀ o comprimento em repouso.',
    formulas: [{ tex: '\\Delta t = \\gamma\\,\\Delta t_0' }, { tex: 'L = \\frac{L_0}{\\gamma}' }],
    demonstracao: [
      {
        descricao:
          'Para o múon, a atmosfera vem ao encontro dele encolhida; para nós, o relógio dele atrasa. As duas contas dão o mesmo resultado.',
        tex: '\\frac{L_0}{v} = \\gamma \\cdot \\frac{L_0/\\gamma}{v}',
      },
    ],
    exemplo: {
      enunciado: 'Um múon (Δt₀ = 2,2 µs) a 0,99c; e uma nave de 100 m a 0,6c.',
      passos: [
        ...dilatacaoDoTempoComPassos(2.2, 0.99).passos,
        ...contracaoDoComprimentoComPassos(100, 0.6).passos.slice(-1),
      ],
    },
    vejaTambem: ['moderna.lorentz'],
  },
  {
    id: 'moderna.energia',
    titulo: 'Massa é energia',
    resumo: 'E = γmc²; parado, ainda há mc².',
    definicao:
      'A energia total de uma partícula é E = γmc². Mesmo parada (γ = 1) ela tem a energia de ' +
      'repouso mc² — para o elétron, 511 keV. A energia cinética é o que passa disso: ' +
      'K = (γ − 1)mc². Para v pequeno, essa expressão volta a ser ½mv², mas perto de c ela cresce ' +
      'sem limite: nenhuma quantidade finita de energia leva uma massa até c.',
    formulas: [
      { tex: 'E = \\gamma mc^{2} \\qquad E_0 = mc^{2}' },
      { tex: 'K = (\\gamma - 1)mc^{2} \\approx \\tfrac{1}{2}mv^{2} \\quad (v \\ll c)' },
    ],
    demonstracao: [
      {
        descricao: 'Para β pequeno, γ ≈ 1 + β²/2 (série de Taylor).',
        tex: '(\\gamma - 1)mc^{2} \\approx \\frac{\\beta^{2}}{2}mc^{2} = \\frac{1}{2}mv^{2}',
      },
    ],
    exemplo: {
      enunciado: 'Elétron a 0,6c: γ = 1,25.',
      passos: [
        { descricao: 'Fator de Lorentz.', tex: '\\gamma = \\frac{1}{\\sqrt{1 - 0{,}36}} = 1{,}25' },
        {
          descricao: 'Energia cinética.',
          tex: 'K = (1{,}25 - 1) \\cdot 511 = 127{,}75\\ \\text{keV}',
        },
      ],
    },
    vejaTambem: ['moderna.lorentz', 'series.potencias'],
  },
  {
    id: 'moderna.foton',
    titulo: 'O fóton',
    resumo: 'A luz troca energia em pacotes E = hf = hc/λ.',
    definicao:
      'Planck e Einstein mostraram que a luz é absorvida e emitida em pacotes — fótons — de ' +
      'energia E = hf. Com λ em nanômetros, hc vale 1240 eV·nm, o que dá uma conta de cabeça: luz ' +
      'vermelha (620 nm) carrega 2 eV por fóton; ultravioleta (310 nm), 4 eV. Quanto menor o ' +
      'comprimento de onda, mais energético o fóton.',
    formulas: [
      { tex: 'E = hf = \\frac{hc}{\\lambda} \\qquad hc = 1240\\ \\text{eV·nm}' },
      { tex: '1\\ \\text{eV} = 1{,}6 \\times 10^{-19}\\ \\text{J}' },
    ],
    demonstracao: [
      {
        descricao: 'Juntando E = hf e c = λf.',
        tex: 'E = h\\frac{c}{\\lambda}',
      },
    ],
    exemplo: { enunciado: 'Luz verde de 500 nm.', passos: energiaDoFotonComPassos(500).passos },
    vejaTambem: ['moderna.fotoeletrico', 'ondas.relacao'],
  },
  {
    id: 'moderna.fotoeletrico',
    titulo: 'O efeito fotoelétrico',
    resumo: 'K_max = hf − φ: abaixo de uma frequência, nenhum elétron sai.',
    definicao:
      'Luz sobre um metal arranca elétrons — mas só se cada fóton tiver energia para pagar a ' +
      'função trabalho φ do metal. Mais intensidade dá mais elétrons, não elétrons mais rápidos; ' +
      'abaixo do comprimento de onda de corte λc = hc/φ, nada sai, por mais forte que seja a luz. ' +
      'Foi por explicar isso que Einstein recebeu o Nobel.',
    formulas: [
      { tex: 'K_{max} = hf - \\phi = \\frac{1240}{\\lambda} - \\phi \\quad (\\text{eV, nm})' },
      { tex: '\\lambda_c = \\frac{1240}{\\phi}' },
    ],
    demonstracao: [
      {
        descricao: 'Conservação de energia para um fóton e um elétron.',
        tex: 'hf = \\phi + K_{max}',
      },
    ],
    exemplo: {
      enunciado: 'Luz de 400 nm sobre potássio (φ = 2,3 eV).',
      passos: fotoeletricoComPassos(400, 2.3).passos,
    },
    vejaTambem: ['moderna.foton'],
  },
  {
    id: 'moderna.de-broglie',
    titulo: 'Ondas de matéria',
    resumo: 'λ = h/p: o elétron também é onda.',
    definicao:
      'De Broglie propôs que, se a luz (onda) se comporta como partícula, partículas também se ' +
      'comportam como ondas, com λ = h/p. Para objetos do dia a dia λ é absurdamente pequeno; para ' +
      'um elétron, é da ordem do espaçamento entre átomos — e elétrons de fato difratam num cristal. ' +
      'É o princípio do microscópio eletrônico.',
    formulas: [
      {
        tex: '\\lambda = \\frac{h}{p} = \\frac{h}{mv} \\qquad h = 6{,}626 \\times 10^{-34}\\ \\text{J·s}',
      },
    ],
    demonstracao: [
      {
        descricao:
          'Para o fóton, p = E/c = h/λ. De Broglie inverteu a relação para qualquer partícula.',
        tex: 'p = \\frac{h}{\\lambda} \\;\\Rightarrow\\; \\lambda = \\frac{h}{p}',
      },
    ],
    exemplo: {
      enunciado: 'Um elétron a 2 × 10⁶ m/s.',
      passos: deBroglieComPassos(MASSA_ELETRON, 2e6).passos,
    },
    vejaTambem: ['moderna.foton'],
  },
];
