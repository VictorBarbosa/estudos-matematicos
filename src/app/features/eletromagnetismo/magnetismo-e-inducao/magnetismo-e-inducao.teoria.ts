import { campoFioComPassos, faradayComPassos, lorentzComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_MAGNETISMO: readonly Teoria[] = [
  {
    id: 'magnetismo.lorentz',
    titulo: 'Força magnética',
    resumo: 'F = qvB sen θ numa carga, F = BIL sen θ num fio — sempre perpendicular ao movimento.',
    definicao:
      'Um campo magnético só age sobre cargas em movimento, e só com a componente da velocidade ' +
      'perpendicular a ele: por isso o sen θ. A força é perpendicular tanto à velocidade quanto ' +
      'ao campo (F = qv × B), com o sentido dado pela regra da mão direita para carga positiva e ' +
      'o oposto para negativa. Num fio, a corrente é carga em movimento: F = BIL sen θ.',
    formulas: [
      { tex: '\\vec{F} = q\\,\\vec{v} \\times \\vec{B} \\qquad F = |q|vB\\sin\\theta' },
      { tex: 'F = BIL\\sin\\theta', legenda: 'Num fio de comprimento L com corrente I.' },
    ],
    demonstracao: [
      {
        descricao: 'Num fio, I = q/t e L = vt: substituindo em qvB.',
        tex: 'qvB = (It)\\,\\frac{L}{t}\\,B = BIL',
      },
    ],
    exemplo: {
      enunciado: 'Carga de 4 μC a 2000 m/s, 30° com um campo de 0,5 T.',
      passos: lorentzComPassos(4, 2000, 0.5, 30).passos,
    },
    vejaTambem: ['magnetismo.movimento', 'vetores3.vetorial'],
  },
  {
    id: 'magnetismo.movimento',
    titulo: 'Carga em órbita num campo',
    resumo: 'A força magnética é centrípeta: r = mv/(qB).',
    definicao:
      'Como a força magnética é sempre perpendicular à velocidade, ela não muda a rapidez — só ' +
      'curva a trajetória. Uma carga que entra perpendicular a um campo uniforme descreve um ' +
      'círculo, com qvB = mv²/r, ou seja, r = mv/(qB). É o princípio do espectrômetro de massa e ' +
      'dos aceleradores: partículas mais pesadas ou mais rápidas fazem círculos maiores.',
    formulas: [
      { tex: '|q|vB = \\frac{mv^{2}}{r} \\;\\Rightarrow\\; r = \\frac{mv}{|q|B}' },
      {
        tex: 'q\\Delta V = \\tfrac{1}{2}mv^{2}',
        legenda: 'Se a partícula foi acelerada por uma ddp antes.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Igualamos força magnética e centrípeta; um v se cancela.',
        tex: 'qvB = \\frac{mv^{2}}{r}',
      },
    ],
    exemplo: {
      enunciado: 'Próton a 10⁶ m/s num campo de 0,1 T.',
      passos: [
        {
          descricao: 'Substituindo.',
          tex: 'r = \\frac{1{,}67 \\times 10^{-27} \\cdot 10^{6}}{1{,}6 \\times 10^{-19} \\cdot 0{,}1}',
        },
        { descricao: 'Calculando.', tex: 'r = 0{,}104\\ \\text{m} = 10{,}44\\ \\text{cm}' },
      ],
    },
    vejaTambem: ['magnetismo.lorentz', 'circular.centripeta'],
  },
  {
    id: 'magnetismo.fontes',
    titulo: 'Campos criados por correntes',
    resumo: 'Fio longo: B = μ₀I/(2πr). Solenoide: B = μ₀nI, uniforme por dentro.',
    definicao:
      'Correntes criam campos magnéticos. Em volta de um fio longo, as linhas são círculos e a ' +
      'intensidade cai com 1/r: B = μ₀I/(2πr), com μ₀ = 4π×10⁻⁷ T·m/A. Dentro de um solenoide ' +
      'comprido, o campo é uniforme e vale μ₀nI, com n o número de espiras por METRO. Os campos ' +
      'de laboratório vão de μT a alguns teslas.',
    formulas: [
      { tex: 'B_{fio} = \\frac{\\mu_0 I}{2\\pi r} \\qquad B_{sol} = \\mu_0 n I' },
      { tex: '\\mu_0 = 4\\pi \\times 10^{-7}\\ \\text{T·m/A}' },
    ],
    demonstracao: [
      {
        descricao: 'Lei de Ampère num círculo de raio r em volta do fio.',
        tex: 'B \\cdot 2\\pi r = \\mu_0 I \\;\\Rightarrow\\; B = \\frac{\\mu_0 I}{2\\pi r}',
      },
    ],
    exemplo: {
      enunciado: 'A 5 cm de um fio com 10 A.',
      passos: campoFioComPassos(10, 5).passos,
    },
    vejaTambem: ['magnetismo.lorentz', 'magnetismo.inducao'],
  },
  {
    id: 'magnetismo.inducao',
    titulo: 'Indução: Faraday e Lenz',
    resumo: 'Fluxo que varia induz fem: ε = −N ΔΦ/Δt, contra a variação.',
    definicao:
      'O fluxo magnético Φ = BA cos θ (θ entre o campo e a NORMAL da espira) mede quanto campo ' +
      'atravessa uma espira. Se ele varia — o campo muda, a área muda ou a espira gira —, surge ' +
      'uma fem: ε = −N ΔΦ/Δt (Faraday). O sinal de menos é a lei de Lenz: a corrente induzida ' +
      'cria um campo que se opõe à variação. Numa barra que corre sobre trilhos, ε = BLv, e a ' +
      'força sobre a corrente induzida freia a barra.',
    formulas: [
      { tex: '\\Phi = BA\\cos\\theta' },
      {
        tex: '\\varepsilon = -N\\,\\frac{\\Delta\\Phi}{\\Delta t} \\qquad \\varepsilon_{barra} = BLv',
      },
    ],
    demonstracao: [
      {
        descricao: 'Na barra, a área cresce L·v por segundo; o fluxo, B·L·v.',
        tex: '\\frac{\\Delta\\Phi}{\\Delta t} = B\\,\\frac{L\\,\\Delta x}{\\Delta t} = BLv',
      },
    ],
    exemplo: {
      enunciado: '100 espiras de 50 cm², campo de 0 a 0,4 T em 0,1 s.',
      passos: faradayComPassos(100, 50, 0, 0.4, 0.1).passos,
    },
    vejaTambem: ['magnetismo.fontes', 'circuitos.ohm'],
  },
];
