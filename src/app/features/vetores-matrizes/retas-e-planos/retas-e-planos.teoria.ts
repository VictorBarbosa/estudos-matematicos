import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_RETAS_PLANOS: readonly Teoria[] = [
  {
    id: 'planos.combinacao',
    titulo: 'Combinação linear',
    resumo: 'Somar múltiplos de vetores: αu + βv, coordenada a coordenada.',
    definicao:
      'Uma combinação linear de u e v é qualquer vetor da forma αu + βv, com α e β números. ' +
      'Geometricamente, com u e v não paralelos, as combinações preenchem o plano que passa ' +
      'pela origem e contém os dois. É a ideia por trás de «gerar» um plano e de dependência ' +
      'linear: um terceiro vetor que é combinação dos dois primeiros está no mesmo plano.',
    formulas: [{ tex: 'α\\vec{u} + β\\vec{v} = (αu_x + βv_x,\\; αu_y + βv_y,\\; αu_z + βv_z)' }],
    demonstracao: [
      {
        descricao:
          'Multiplicar por um número estica cada coordenada; somar vetores soma coordenada a coordenada.',
        tex: 'α(u_x, u_y, u_z) = (αu_x, αu_y, αu_z)',
      },
    ],
    exemplo: {
      enunciado: 'w = 2u − 3v com u = (1, 0, 2) e v = (−1, 4, 1).',
      passos: [
        {
          descricao: 'Coordenada a coordenada.',
          tex: 'w = (2 + 3,\\; 0 - 12,\\; 4 - 3) = (5,\\; -12,\\; 1)',
        },
      ],
    },
    vejaTambem: ['planos.independencia', 'planos.equacao'],
  },
  {
    id: 'planos.equacao',
    titulo: 'A equação do plano',
    resumo: 'ax + by + cz = d: os coeficientes são a normal.',
    definicao:
      'Um plano fica determinado por um ponto P e por um vetor normal n, perpendicular a ele. Um ' +
      'ponto X está no plano exatamente quando o vetor PX é perpendicular a n, isto é, n·(X − P) = 0. ' +
      'Desenvolvendo, sai ax + by + cz = d com (a, b, c) = n e d = n·P. Com três pontos, a normal ' +
      'é o produto vetorial de dois vetores dentro do plano.',
    formulas: [
      { tex: '\\vec{n} \\cdot (X - P) = 0 \\iff ax + by + cz = d,\\quad d = \\vec{n} \\cdot P' },
      { tex: '\\vec{n} = \\vec{AB} \\times \\vec{AC}', legenda: 'Pelos três pontos A, B e C.' },
    ],
    demonstracao: [
      {
        descricao: 'Para X no plano, PX está «deitado» no plano, perpendicular à normal.',
        tex: '\\vec{n} \\cdot \\vec{PX} = 0',
      },
      {
        descricao: 'Distribuindo o produto escalar.',
        tex: 'a(x - x_0) + b(y - y_0) + c(z - z_0) = 0 \\;\\Rightarrow\\; ax + by + cz = ax_0 + by_0 + cz_0',
      },
    ],
    exemplo: {
      enunciado: 'Plano por P(1, −2, 3) com normal n = (2, 1, −1).',
      passos: [
        { descricao: 'd é n·P.', tex: 'd = 2 \\cdot 1 + 1 \\cdot (-2) + (-1) \\cdot 3 = -3' },
        { descricao: 'O plano.', tex: '2x + y - z = -3' },
      ],
    },
    vejaTambem: ['planos.distancia', 'vetores3.vetorial'],
  },
  {
    id: 'planos.distancia',
    titulo: 'Distância de ponto a plano',
    resumo: 'D = |n·P − d| / |n|: a projeção sobre a normal.',
    definicao:
      'O caminho mais curto de um ponto até um plano é perpendicular a ele, ou seja, na direção ' +
      'da normal. Pondo o ponto na equação do plano, ax₀ + by₀ + cz₀ − d mede quanto ele «sai» do ' +
      'plano, mas em unidades do tamanho de n; dividindo por |n| sai a distância de verdade.',
    formulas: [{ tex: 'D = \\frac{|ax_0 + by_0 + cz_0 - d|}{\\sqrt{a^{2} + b^{2} + c^{2}}}' }],
    demonstracao: [
      {
        descricao: 'Tome Q no plano: a distância é o tamanho da projeção de QP sobre a normal.',
        tex: 'D = \\frac{|\\vec{n} \\cdot \\vec{QP}|}{|\\vec{n}|}',
      },
      {
        descricao: 'Como n·Q = d, o numerador vira n·P − d.',
        tex: '\\vec{n} \\cdot (P - Q) = \\vec{n} \\cdot P - d',
      },
    ],
    exemplo: {
      enunciado: 'Distância de P(1, 2, 3) ao plano x + 2y + 2z = 4.',
      passos: [
        { descricao: 'Numerador.', tex: '|1 + 4 + 6 - 4| = 7' },
        { descricao: 'Módulo da normal.', tex: '\\sqrt{1 + 4 + 4} = 3' },
        { descricao: 'Distância.', tex: 'D = \\frac{7}{3} \\approx 2{,}33' },
      ],
    },
    vejaTambem: ['planos.equacao', 'ponto-reta.distancia-reta'],
  },
  {
    id: 'planos.angulo',
    titulo: 'Ângulo entre planos e entre retas',
    resumo: 'Pelas normais (planos) ou pelas direções (retas), tomando o ângulo agudo.',
    definicao:
      'Dois planos se cortam no mesmo ângulo que suas normais formam. Duas retas no espaço, mesmo ' +
      'que não se cruzem, formam o ângulo de seus vetores diretores. Como as normais e as direções ' +
      'podem ser tomadas com qualquer sentido, usa-se o ângulo agudo: o módulo do produto escalar.',
    formulas: [
      { tex: '\\cos\\theta = \\frac{|\\vec{u} \\cdot \\vec{v}|}{|\\vec{u}|\\,|\\vec{v}|}' },
    ],
    demonstracao: [
      {
        descricao: 'O produto escalar dá o cosseno do ângulo entre os vetores.',
        tex: '\\vec{u} \\cdot \\vec{v} = |\\vec{u}|\\,|\\vec{v}|\\cos\\varphi',
      },
      {
        descricao: 'Trocar o sentido de um vetor troca φ por 180° − φ; o módulo escolhe o agudo.',
        tex: '\\theta = \\min(\\varphi,\\; 180^{\\circ} - \\varphi)',
      },
    ],
    exemplo: {
      enunciado: 'Planos x + y = 1 e y + z = 4.',
      passos: [
        {
          descricao: 'Normais (1, 1, 0) e (0, 1, 1).',
          tex: '\\cos\\theta = \\frac{1}{\\sqrt{2}\\,\\sqrt{2}} = \\frac{1}{2}',
        },
        { descricao: 'O ângulo.', tex: '\\theta = 60^{\\circ}' },
      ],
    },
    vejaTambem: ['planos.equacao', 'vetores3.escalar'],
  },
  {
    id: 'planos.independencia',
    titulo: 'Independência linear e o determinante',
    resumo: 'Três vetores são dependentes quando o determinante deles é zero.',
    definicao:
      'Três vetores do espaço são linearmente dependentes quando um é combinação dos outros — ' +
      'então os três cabem num mesmo plano e o paralelepípedo que formam é achatado, de volume ' +
      'zero. Esse volume é o módulo do produto misto u·(v × w), que é o determinante 3×3 com os ' +
      'vetores nas linhas. Determinante não nulo: independentes, e eles servem de base do espaço.',
    formulas: [
      {
        tex: 'V = |\\vec{u} \\cdot (\\vec{v} \\times \\vec{w})| = |\\det[\\vec{u};\\, \\vec{v};\\, \\vec{w}]|',
      },
      { tex: '\\det = 0 \\iff \\text{dependentes}' },
    ],
    demonstracao: [
      {
        descricao: 'v × w é perpendicular à base e tem módulo igual à área dela.',
        tex: '|\\vec{v} \\times \\vec{w}| = \\text{área da base}',
      },
      {
        descricao:
          'O escalar com u mede a altura de u nessa direção: área vezes altura é o volume.',
        tex: '\\vec{u} \\cdot (\\vec{v} \\times \\vec{w}) = \\text{área} \\cdot \\text{altura}',
      },
    ],
    exemplo: {
      enunciado: 'u = (1, 0, 1), v = (2, 1, 0), w = (0, 1, k): para que k são dependentes?',
      passos: [
        { descricao: 'u × v.', tex: '(1, 0, 1) \\times (2, 1, 0) = (-1,\\; 2,\\; 1)' },
        {
          descricao: 'Escalar com w igual a zero.',
          tex: '0 + 2 + k = 0 \\;\\Rightarrow\\; k = -2',
        },
      ],
    },
    vejaTambem: ['planos.combinacao', 'matrizes.determinante'],
  },
];
