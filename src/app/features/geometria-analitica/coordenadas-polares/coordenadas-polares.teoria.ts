import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_POLARES: readonly Teoria[] = [
  {
    id: 'polares.conversao',
    titulo: 'De polar para cartesiano e de volta',
    resumo: 'x = r·cos θ e y = r·sen θ; r = √(x² + y²).',
    definicao:
      'Em coordenadas polares, um ponto é dado pela distância r até a origem e pelo ângulo θ ' +
      'que o segmento faz com o eixo x positivo. A ida para o cartesiano é a projeção nos eixos: ' +
      'x = r·cos θ, y = r·sen θ. A volta usa Pitágoras para r e a tangente para θ — com cuidado ' +
      'no quadrante. A distância entre dois pontos polares sai da lei dos cossenos.',
    formulas: [
      { tex: 'x = r\\cos\\theta \\qquad y = r\\sin\\theta' },
      { tex: 'r = \\sqrt{x^{2} + y^{2}} \\qquad \\tan\\theta = \\frac{y}{x}' },
      { tex: 'd^{2} = r_1^{2} + r_2^{2} - 2r_1r_2\\cos(\\theta_2 - \\theta_1)' },
    ],
    demonstracao: [
      {
        descricao:
          'O segmento até o ponto é a hipotenusa r de um triângulo retângulo com catetos x e y.',
        tex: '\\cos\\theta = \\frac{x}{r} \\qquad \\sin\\theta = \\frac{y}{r}',
      },
      {
        descricao: 'Isolando os catetos, e somando os quadrados.',
        tex: 'x = r\\cos\\theta,\\; y = r\\sin\\theta \\;\\Rightarrow\\; x^{2} + y^{2} = r^{2}',
      },
    ],
    exemplo: {
      enunciado: 'O ponto (r, θ) = (8, 150°) em cartesiano.',
      passos: [
        {
          descricao: 'x pelo cosseno.',
          tex: 'x = 8\\cos 150^{\\circ} = 8 \\cdot (-0{,}866) = -6{,}93',
        },
        { descricao: 'y pelo seno.', tex: 'y = 8\\sin 150^{\\circ} = 8 \\cdot 0{,}5 = 4' },
      ],
    },
    vejaTambem: ['polares.quadrante', 'polares.curvas'],
  },
  {
    id: 'polares.quadrante',
    titulo: 'O ângulo e o quadrante',
    resumo: 'arctg(y/x) só acerta nos quadrantes I e IV.',
    definicao:
      'A calculadora devolve arctg entre −90° e 90°, e y/x tem o mesmo valor para (x, y) e ' +
      '(−x, −y), pontos opostos. Por isso, depois do arctg, olha-se o quadrante pelos sinais: no ' +
      'II e no III soma-se 180°; no IV, para ficar em [0°, 360°), soma-se 360°.',
    formulas: [
      {
        tex: '\\theta = \\begin{cases} \\arctan(y/x) & \\text{I} \\\\ \\arctan(y/x) + 180^{\\circ} & \\text{II, III} \\\\ \\arctan(y/x) + 360^{\\circ} & \\text{IV} \\end{cases}',
      },
    ],
    demonstracao: [
      {
        descricao: 'Pontos opostos pela origem dão a mesma razão.',
        tex: '\\frac{y}{x} = \\frac{-y}{-x}',
        nota: 'A tangente tem período 180°: ela não distingue θ de θ + 180°.',
      },
    ],
    exemplo: {
      enunciado: 'O ângulo de (−3, 4).',
      passos: [
        {
          descricao: 'Quadrante II (x < 0, y > 0).',
          tex: '\\arctan\\left(\\frac{4}{-3}\\right) = -53{,}13^{\\circ}',
        },
        { descricao: 'Somando 180°.', tex: '\\theta = 126{,}87^{\\circ}' },
      ],
    },
    vejaTambem: ['polares.conversao', 'eqtrig.tangente'],
  },
  {
    id: 'polares.curvas',
    titulo: 'Curvas em forma polar',
    resumo: 'Multiplique por r e use r² = x² + y² para reconhecer a curva.',
    definicao:
      'Algumas curvas ficam muito mais simples em polar. r = c é uma circunferência centrada na ' +
      'origem; θ = c, uma reta pela origem. r = 2a·cos θ é uma circunferência de raio a que passa ' +
      'pela origem: multiplicando por r, r² = 2a·r·cos θ vira x² + y² = 2ax, e completando o ' +
      'quadrado aparece (x − a)² + y² = a².',
    formulas: [
      { tex: 'r = 2a\\cos\\theta \\iff (x - a)^{2} + y^{2} = a^{2}' },
      { tex: 'r = 2a\\sin\\theta \\iff x^{2} + (y - a)^{2} = a^{2}' },
    ],
    demonstracao: [
      { descricao: 'Multiplicamos por r.', tex: 'r^{2} = 2a\\,r\\cos\\theta' },
      {
        descricao: 'Trocamos por x e y e completamos o quadrado.',
        tex: 'x^{2} + y^{2} = 2ax \\;\\Rightarrow\\; (x - a)^{2} + y^{2} = a^{2}',
      },
    ],
    exemplo: {
      enunciado: 'r = 10·sen θ.',
      passos: [
        { descricao: 'Multiplicando por r.', tex: 'x^{2} + y^{2} = 10y' },
        { descricao: 'Completando o quadrado.', tex: 'x^{2} + (y - 5)^{2} = 25' },
        { descricao: 'Centro (0, 5), raio 5.', tex: 'R = 5' },
      ],
    },
    vejaTambem: ['polares.conversao', 'polares.orbita'],
  },
  {
    id: 'polares.orbita',
    titulo: 'A órbita em forma polar',
    resumo: 'r = p/(1 + e·cos θ): toda cônica com foco na origem.',
    definicao:
      'Com o foco na origem, elipse, parábola e hipérbole têm a mesma equação polar, ' +
      'r = p/(1 + e·cos θ), em que e é a excentricidade (0 ≤ e < 1 para elipses, as órbitas ' +
      'fechadas). O ponto mais próximo, o periélio, está em θ = 0°; o mais distante, o afélio, em ' +
      'θ = 180°. É a forma que Newton tirou da gravitação, e a que a mecânica orbital usa.',
    formulas: [
      { tex: 'r = \\frac{p}{1 + e\\cos\\theta}' },
      {
        tex: 'r_{min} = \\frac{p}{1 + e} \\qquad r_{max} = \\frac{p}{1 - e} \\qquad a = \\frac{r_{min} + r_{max}}{2} = \\frac{p}{1 - e^{2}}',
      },
    ],
    demonstracao: [
      {
        descricao: 'O denominador é máximo com cos θ = 1 e mínimo com cos θ = −1.',
        tex: '1 + e \\geq 1 + e\\cos\\theta \\geq 1 - e',
      },
      {
        descricao: 'Somando periélio e afélio, o eixo maior.',
        tex: '\\frac{p}{1 + e} + \\frac{p}{1 - e} = \\frac{2p}{1 - e^{2}} = 2a',
      },
    ],
    exemplo: {
      enunciado: 'r = 8000/(1 + 0,2·cos θ), em km.',
      passos: [
        { descricao: 'Periélio.', tex: 'r_{min} = \\frac{8000}{1{,}2} = 6666{,}67\\ \\text{km}' },
        { descricao: 'Afélio.', tex: 'r_{max} = \\frac{8000}{0{,}8} = 10000\\ \\text{km}' },
        {
          descricao: 'Semieixo maior.',
          tex: 'a = \\frac{6666{,}67 + 10000}{2} = 8333{,}33\\ \\text{km}',
        },
      ],
    },
    vejaTambem: ['polares.curvas', 'conicas.orbitas'],
  },
];
