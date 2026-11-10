import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_MOVIMENTO_CIRCULAR: readonly Teoria[] = [
  {
    id: 'circular.periodo-frequencia',
    titulo: 'Período e frequência',
    resumo: 'Um é o tempo de uma volta; o outro, as voltas por segundo.',
    definicao:
      'Período é quanto tempo leva uma volta completa; frequência é quantas voltas cabem num ' +
      'segundo. São inversos um do outro, e é por aí que começa qualquer problema de rotação. ' +
      'A unidade de frequência é o hertz, e rotações por minuto precisam ser divididas por 60 ' +
      'antes de entrar em qualquer fórmula.',
    formulas: [
      { tex: 'f = \\frac{1}{T}' },
      { tex: 'f\\;[\\text{Hz}] = \\frac{n\\;[\\text{rpm}]}{60}' },
    ],
    demonstracao: [
      {
        descricao: 'Um rotor a 3000 rotações por minuto.',
        tex: 'f = \\frac{3000}{60} = 50\\ \\text{Hz}',
      },
      {
        descricao: 'O período é o inverso.',
        tex: 'T = \\frac{1}{50} = 0{,}02\\ \\text{s}',
      },
      {
        descricao: 'Ou seja, 20 milésimos de segundo por volta.',
        tex: 'T = 20\\ \\text{ms}',
        nota: 'Esquecer de converter o minuto é o erro mais comum do tópico.',
      },
    ],
    vejaTambem: ['circular.velocidade-angular', 'circular.centripeta'],
  },
  {
    id: 'circular.velocidade-angular',
    titulo: 'Angular e tangencial',
    resumo: 'A angular é a mesma para todo o corpo; a tangencial cresce com o raio.',
    definicao:
      'A velocidade angular mede quantos radianos são percorridos por segundo, e é a mesma ' +
      'para todos os pontos de um corpo rígido. A tangencial mede metros por segundo e cresce ' +
      'com a distância ao eixo: a ponta de uma pá de turbina anda muito mais rápido que a raiz ' +
      'dela, embora as duas deem o mesmo número de voltas.',
    formulas: [{ tex: '\\omega = \\frac{2\\pi}{T} = 2\\pi f' }, { tex: 'v = \\omega r' }],
    demonstracao: [
      {
        descricao: 'Uma volta inteira são 2 pi radianos.',
        tex: '\\omega = \\frac{2\\pi}{T}',
      },
      {
        descricao: 'Com período de 4 segundos.',
        tex: '\\omega = \\frac{2\\pi}{4} \\approx 1{,}571\\ \\text{rad/s}',
      },
      {
        descricao: 'A 2 metros do eixo, a velocidade tangencial é o dobro da de 1 metro.',
        tex: 'v_{2} = 1{,}571 \\cdot 2 \\approx 3{,}14\\ \\text{m/s}',
        nota: 'Mesma velocidade angular, velocidades tangenciais diferentes.',
      },
    ],
    vejaTambem: ['circular.periodo-frequencia', 'circular.centripeta'],
  },
  {
    id: 'circular.centripeta',
    titulo: 'Aceleração sem mudar de rapidez',
    resumo: 'Mudar de direção já é acelerar.',
    definicao:
      'No movimento circular uniforme o módulo da velocidade é constante, mas o vetor muda de ' +
      'direção a cada instante — e isso é acelerar. A aceleração resultante aponta sempre para ' +
      'o centro, é perpendicular à velocidade e por isso não altera a rapidez: ela só curva a ' +
      'trajetória. Dobrar a velocidade quadruplica essa aceleração.',
    formulas: [
      { tex: 'a_{c} = \\frac{v^{2}}{r} = \\omega^{2}r' },
      {
        tex: '\\vec{a}_{c} \\perp \\vec{v}',
        legenda: 'Perpendicular, e por isso não acelera nem freia.',
      },
    ],
    demonstracao: [
      {
        descricao: 'A velocidade tem módulo constante, mas direção variável.',
        tex: '\\left|\\vec{v}\\right| = \\text{const.} \\qquad \\vec{v} \\neq \\text{const.}',
      },
      {
        descricao: 'Aceleração é variação de VETOR velocidade, não de módulo.',
        tex: '\\vec{a} = \\frac{d\\vec{v}}{dt}',
        nota: 'É aqui que mora a confusão que o tópico desfaz.',
      },
      {
        descricao: 'Num raio de 2 metros a 10 metros por segundo.',
        tex: 'a_{c} = \\frac{100}{2} = 50\\ \\text{m/s}^{2}',
      },
      {
        descricao: 'Dobrando a velocidade, a aceleração quadruplica.',
        tex: 'a_{c} = \\frac{400}{2} = 200\\ \\text{m/s}^{2}',
        nota: 'É por isso que curvas rápidas exigem tanto das estruturas.',
      },
    ],
    exemplo: {
      enunciado: 'Um carro faz uma curva de raio 50 m a 20 m/s. Qual é a aceleração centrípeta?',
      passos: [
        {
          descricao: 'A aceleração centrípeta aponta para o centro e vale v²/r.',
          tex: 'a_c = \\frac{v^{2}}{r}',
        },
        {
          descricao: 'Substituindo.',
          tex: 'a_c = \\frac{20^{2}}{50} = \\frac{400}{50} = 8\\ \\text{m/s}^{2}',
          nota: 'Cerca de 0,8 g: é o atrito dos pneus que precisa fornecer essa força.',
        },
      ],
    },
    vejaTambem: ['circular.forca-centripeta', 'circular.velocidade-angular'],
  },
  {
    id: 'circular.forca-centripeta',
    titulo: 'A força que não existe sozinha',
    resumo: 'Centrípeta é um papel, não uma força nova.',
    definicao:
      'Força centrípeta não é uma força à parte que se soma às outras: é o nome da resultante ' +
      'que aponta para o centro. Num carro em curva ela é o atrito; num satélite, a gravidade; ' +
      'numa pedra girando na corda, a tensão. Listá-la junto das outras forças num diagrama é ' +
      'contá-la duas vezes.',
    formulas: [{ tex: 'F_{c} = ma_{c} = m\\frac{v^{2}}{r}' }, { tex: 'F_{c} = m\\omega^{2}r' }],
    demonstracao: [
      {
        descricao: 'Num satélite em órbita circular, quem faz o papel é a gravidade.',
        tex: '\\frac{GMm}{r^{2}} = m\\frac{v^{2}}{r}',
      },
      {
        descricao: 'A massa do satélite se cancela, e sobra a velocidade orbital.',
        tex: 'v = \\sqrt{\\frac{GM}{r}}',
        nota: 'A órbita não depende da massa do que orbita — é a mesma para um parafuso e para a Lua.',
      },
      {
        descricao: 'Num carro em curva, o papel é do atrito.',
        tex: '\\mu mg \\geq m\\frac{v^{2}}{r}',
      },
      {
        descricao: 'E daí sai a velocidade máxima da curva.',
        tex: 'v_{max} = \\sqrt{\\mu g r}',
        nota: 'A massa some de novo: um caminhão e um carro derrapam na mesma velocidade.',
      },
    ],
    vejaTambem: ['circular.centripeta', 'circular.velocidade-angular'],
  },
];
