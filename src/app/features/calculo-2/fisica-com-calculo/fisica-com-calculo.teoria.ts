import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_FISICA_COM_CALCULO: readonly Teoria[] = [
  {
    id: 'fcc.integral-acumula',
    titulo: 'A integral acumula',
    resumo: 'Deslocamento é a integral da velocidade; velocidade, a da aceleração.',
    definicao:
      'Na Física sem cálculo, «distância = velocidade × tempo» exige velocidade constante. Quando ' +
      'ela varia, cortamos o tempo em pedacinhos dt em que ela quase não muda, somamos v·dt de cada ' +
      'um, e a soma vira a integral. O mesmo vale um degrau acima: a velocidade acumula a ' +
      'aceleração. É o teorema fundamental lido ao contrário da derivada: v = ds/dt, então ' +
      'Δs = ∫ v dt.',
    formulas: [
      {
        tex: '\\Delta s = \\int_{t_1}^{t_2} v(t)\\,dt \\qquad v(t) = v_0 + \\int_{0}^{t} a(\\tau)\\,d\\tau',
      },
    ],
    demonstracao: [
      {
        descricao: 'Num intervalo curto, v quase não muda: o deslocamento é v·Δt.',
        tex: '\\Delta s \\approx \\sum v(t_i)\\,\\Delta t',
      },
      {
        descricao: 'Com Δt → 0, a soma de Riemann vira a integral.',
        tex: '\\Delta s = \\int_{t_1}^{t_2} v(t)\\,dt',
      },
    ],
    exemplo: {
      enunciado: 'v(t) = 3t + 2 (m/s), de t = 1 s a t = 4 s.',
      passos: [
        { descricao: 'Primitiva.', tex: '\\int (3t + 2)\\,dt = 1{,}5t^{2} + 2t' },
        { descricao: 'Avaliando.', tex: '(24 + 8) - (1{,}5 + 2) = 28{,}5\\ \\text{m}' },
      ],
    },
    vejaTambem: ['fcc.trabalho', 'tfc.enunciado'],
  },
  {
    id: 'fcc.trabalho',
    titulo: 'Trabalho de uma força variável',
    resumo: 'W = ∫ F(x) dx: a área sob a força ao longo do caminho.',
    definicao:
      'W = F·d vale para força constante. Se a força muda com a posição — uma mola, que puxa mais ' +
      'quanto mais é esticada —, o trabalho é a soma de F·dx em cada trecho: a integral. Na mola, ' +
      'F = kx e o trabalho de x₁ a x₂ é ½k(x₂² − x₁²), que é exatamente a variação da energia ' +
      'elástica.',
    formulas: [
      { tex: 'W = \\int_{x_1}^{x_2} F(x)\\,dx' },
      {
        tex: 'W_{mola} = \\int_{x_1}^{x_2} kx\\,dx = \\tfrac{1}{2}k\\left(x_2^{2} - x_1^{2}\\right)',
      },
    ],
    demonstracao: [
      {
        descricao: 'Num deslocamento curto dx, a força é quase constante.',
        tex: 'dW = F(x)\\,dx',
      },
      { descricao: 'Somando todos os trechos.', tex: 'W = \\int_{x_1}^{x_2} F(x)\\,dx' },
    ],
    exemplo: {
      enunciado: 'Mola com k = 200 N/m, esticada de 0,1 m a 0,3 m.',
      passos: [
        {
          descricao: 'Pela fórmula integrada.',
          tex: 'W = 100\\left(0{,}3^{2} - 0{,}1^{2}\\right) = 100 \\cdot 0{,}08 = 8\\ \\text{J}',
        },
        {
          descricao:
            'Força final × distância daria 200 · 0,3 · 0,2 = 12 J: superestima, porque a força começou menor.',
          tex: '12\\ \\text{J} \\neq 8\\ \\text{J}',
        },
      ],
    },
    vejaTambem: ['fcc.integral-acumula', 'fcc.gravidade'],
  },
  {
    id: 'fcc.centro-de-massa',
    titulo: 'Centro de massa de um corpo contínuo',
    resumo: 'A média das posições pesada pela densidade, com integrais no lugar das somas.',
    definicao:
      'Para pontos, x_cm = Σ mᵢxᵢ / Σ mᵢ. Numa barra com densidade linear λ(x), cada pedacinho dx ' +
      'tem massa λ(x)dx: as somas viram integrais. Se a barra é homogênea, o centro fica no meio; ' +
      'se a densidade cresce para um lado, o centro se desloca para ele.',
    formulas: [{ tex: 'x_{cm} = \\frac{\\int x\\,\\lambda(x)\\,dx}{\\int \\lambda(x)\\,dx}' }],
    demonstracao: [
      { descricao: 'Massa de um pedacinho.', tex: 'dm = \\lambda(x)\\,dx' },
      {
        descricao: 'A média ponderada contínua.',
        tex: 'x_{cm} = \\frac{\\int x\\,dm}{\\int dm}',
      },
    ],
    exemplo: {
      enunciado: 'Barra de 2 m com λ(x) = 1 + x (kg/m).',
      passos: [
        {
          descricao: 'Massa.',
          tex: 'M = \\left[x + \\tfrac{x^{2}}{2}\\right]_0^{2} = 4\\ \\text{kg}',
        },
        {
          descricao: 'Momento.',
          tex: '\\int_0^{2} (x + x^{2})\\,dx = 2 + \\tfrac{8}{3} = \\tfrac{14}{3}',
        },
        {
          descricao: 'Dividindo.',
          tex: 'x_{cm} = \\frac{14/3}{4} = \\frac{7}{6} \\approx 1{,}17\\ \\text{m}',
        },
      ],
    },
    vejaTambem: ['fcc.trabalho', 'aplic-integral.area'],
  },
  {
    id: 'fcc.gravidade',
    titulo: 'Trabalho contra a gravidade de longe',
    resumo: 'Com g caindo com 1/r², m·g·h deixa de valer: W = GMm(1/R − 1/(R + h)).',
    definicao:
      'Perto do chão, g é quase constante e o trabalho para subir h é mgh. Para um satélite, a ' +
      'altura é comparável ao raio da Terra e a força GMm/r² enfraquece no caminho. Integrando de R ' +
      'a R + h, sai GMm(1/R − 1/(R + h)) — menos que mgh. No limite h → ∞ sai GMm/R, a energia que ' +
      'leva à velocidade de escape.',
    formulas: [
      {
        tex: 'W = \\int_{R}^{R+h} \\frac{GMm}{r^{2}}\\,dr = GMm\\left(\\frac{1}{R} - \\frac{1}{R + h}\\right)',
      },
    ],
    demonstracao: [
      { descricao: 'A primitiva de 1/r².', tex: '\\int \\frac{dr}{r^{2}} = -\\frac{1}{r}' },
      {
        descricao: 'Com h pequeno diante de R, volta mgh.',
        tex: 'GMm\\,\\frac{h}{R(R + h)} \\approx \\frac{GM}{R^{2}}\\,m h = mgh',
      },
    ],
    exemplo: {
      enunciado: '1000 kg até 6371 km de altitude (r dobra).',
      passos: [
        {
          descricao: 'Com R + h = 2R, a diferença é 1/(2R).',
          tex: 'W = \\frac{GMm}{2R} = \\frac{6{,}674 \\times 10^{-11} \\cdot 5{,}972 \\times 10^{24} \\cdot 1000}{2 \\cdot 6{,}371 \\times 10^{6}} \\approx 31{,}3\\ \\text{GJ}',
        },
        {
          descricao: 'mgh daria o dobro, 62,5 GJ: o erro de supor g constante.',
          tex: 'mgh \\approx 62{,}5\\ \\text{GJ}',
        },
      ],
    },
    vejaTambem: ['fcc.trabalho', 'gravitacao.escape'],
  },
];
