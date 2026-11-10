import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_CINEMATICA_VETORIAL: readonly Teoria[] = [
  {
    id: 'cin-vetorial.deslocamento',
    titulo: 'Deslocamento não é distância',
    resumo: 'Um depende só das pontas; o outro, de todo o caminho.',
    definicao:
      'O deslocamento é o vetor que liga a posição inicial à final, e só isso: o caminho ' +
      'percorrido entre elas não entra na conta. A distância percorrida é o comprimento da ' +
      'trajetória, e nunca é menor que o módulo do deslocamento. Numa volta completa, o ' +
      'deslocamento é zero e a distância é a volta inteira.',
    formulas: [
      { tex: '\\Delta\\vec{r} = \\vec{r}_{2} - \\vec{r}_{1}' },
      { tex: '\\left|\\Delta\\vec{r}\\right| = \\sqrt{\\Delta x^{2} + \\Delta y^{2}}' },
    ],
    demonstracao: [
      {
        descricao: 'Indo de (0, 0) a (3, 4), o deslocamento é a diferença das posições.',
        tex: '\\Delta\\vec{r} = (3,\\; 4)',
      },
      {
        descricao: 'Seu módulo é a hipotenusa, por Pitágoras.',
        tex: '\\left|\\Delta\\vec{r}\\right| = \\sqrt{9 + 16} = 5\\ \\text{m}',
      },
      {
        descricao: 'Mas quem andou pelos catetos percorreu mais.',
        tex: '3 + 4 = 7\\ \\text{m}',
        nota: 'Mesmo começo, mesmo fim, distâncias diferentes — e o deslocamento é o mesmo.',
      },
    ],
    vejaTambem: ['cin-vetorial.velocidade-media', 'cin-vetorial.velocidade-relativa'],
  },
  {
    id: 'cin-vetorial.velocidade-media',
    titulo: 'Velocidade média vetorial',
    resumo: 'Deslocamento dividido por tempo — nunca distância.',
    definicao:
      'A velocidade média vetorial é o deslocamento dividido pelo intervalo de tempo. Ela ' +
      'herda do deslocamento a independência do caminho, e por isso pode ser zero num ' +
      'percurso longo: quem sai de casa e volta teve velocidade média vetorial nula, por mais ' +
      'que tenha corrido.',
    formulas: [
      { tex: '\\vec{v}_{m} = \\frac{\\Delta\\vec{r}}{\\Delta t}' },
      {
        tex: 'v_{m}^{escalar} = \\frac{\\text{distância percorrida}}{\\Delta t}',
        legenda: 'A outra média, que usa o caminho.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Numa volta completa de pista, a posição final é a inicial.',
        tex: '\\Delta\\vec{r} = \\vec{0}',
      },
      {
        descricao: 'Então a velocidade média vetorial é nula.',
        tex: '\\vec{v}_{m} = \\vec{0}',
      },
      {
        descricao: 'Mas a média escalar não é, porque a distância percorrida não é zero.',
        tex: 'v_{m}^{escalar} = \\frac{400\\ \\text{m}}{50\\ \\text{s}} = 8\\ \\text{m/s}',
        nota: 'As duas médias respondem perguntas diferentes, e ambas estão certas.',
      },
    ],
    exemplo: {
      enunciado:
        'Um corpo vai de (1, 2) m a (7, 10) m em 5 s. Qual é a velocidade média vetorial e seu módulo?',
      passos: [
        {
          descricao: 'O deslocamento é a diferença das posições.',
          tex: '\\Delta\\mathbf{r} = (7 - 1,\\; 10 - 2) = (6,\\; 8)\\ \\text{m}',
        },
        {
          descricao: 'Dividimos pelo tempo.',
          tex: '\\mathbf{v}_m = \\frac{(6,\\; 8)}{5} = (1{,}2;\\; 1{,}6)\\ \\text{m/s}',
        },
        {
          descricao: 'O módulo.',
          tex: '|\\mathbf{v}_m| = \\sqrt{1{,}2^{2} + 1{,}6^{2}} = \\sqrt{4} = 2\\ \\text{m/s}',
        },
      ],
    },
    vejaTambem: ['cin-vetorial.deslocamento', 'cin-vetorial.componentes-da-aceleracao'],
  },
  {
    id: 'cin-vetorial.velocidade-relativa',
    titulo: 'Velocidade relativa',
    resumo: 'Velocidades se somam como vetores, nunca como números.',
    definicao:
      'Um avião não voa em relação ao solo: voa em relação ao ar, e o ar inteiro se move. A ' +
      'velocidade em relação ao solo é a soma vetorial das duas. É por isso que uma aeronave ' +
      'apontada para o norte pode estar indo para nordeste, e por que o instrumento de bordo e ' +
      'o GPS discordam.',
    formulas: [
      { tex: '\\vec{v}_{A/C} = \\vec{v}_{A/B} + \\vec{v}_{B/C}' },
      { tex: '\\vec{v}_{solo} = \\vec{v}_{ar} + \\vec{v}_{vento}' },
    ],
    demonstracao: [
      {
        descricao: 'Aeronave a 200 para leste, vento de 50 para o norte.',
        tex: '\\vec{v}_{ar} = (200,\\; 0) \\qquad \\vec{v}_{vento} = (0,\\; 50)',
      },
      {
        descricao: 'Somando componente a componente.',
        tex: '\\vec{v}_{solo} = (200,\\; 50)',
      },
      {
        descricao: 'O módulo não é 250, e sim a hipotenusa.',
        tex: '\\left|\\vec{v}_{solo}\\right| = \\sqrt{200^{2} + 50^{2}} \\approx 206{,}2\\ \\text{m/s}',
        nota: 'Somar módulos só valeria com vento e rumo perfeitamente alinhados.',
      },
      {
        descricao: 'E o rumo efetivo se desvia do que o nariz aponta.',
        tex: '\\theta = \\arctan\\frac{50}{200} \\approx 14^\\circ',
      },
    ],
    vejaTambem: ['cin-vetorial.travessia', 'cin-vetorial.deslocamento'],
  },
  {
    id: 'cin-vetorial.travessia',
    titulo: 'Travessia de rio',
    resumo: 'Direções perpendiculares não interferem uma na outra.',
    definicao:
      'Ao atravessar um rio apontando perpendicularmente, o tempo depende só da velocidade ' +
      'própria: a correnteza empurra numa direção que não aproxima nem afasta da outra margem. ' +
      'Para chegar exatamente em frente é preciso apontar rio acima, num ângulo cujo seno é a ' +
      'razão entre as velocidades — e isso só existe se o barco for mais rápido que o rio.',
    formulas: [
      { tex: 't = \\frac{d}{v_{barco}}', legenda: 'A correnteza não entra aqui.' },
      { tex: '\\Delta x = v_{rio}\\,t', legenda: 'O arrasto rio abaixo.' },
      {
        tex: '\\operatorname{sen}\\theta = \\frac{v_{rio}}{v_{barco}}',
        legenda: 'O ângulo que compensa.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Barco a 4 metros por segundo cruzando 100 metros, rio a 3.',
        tex: 't = \\frac{100}{4} = 25\\ \\text{s}',
      },
      {
        descricao: 'Nesse tempo a correnteza arrasta.',
        tex: '\\Delta x = 3 \\cdot 25 = 75\\ \\text{m}',
      },
      {
        descricao: 'Para chegar em frente, o barco aponta rio acima.',
        tex: '\\operatorname{sen}\\theta = \\frac{3}{4} \\;\\Longrightarrow\\; \\theta \\approx 48{,}6^\\circ',
      },
      {
        descricao: 'Aí a travessia demora mais, porque sobra menos velocidade para atravessar.',
        tex: 'v_{\\perp} = 4\\cos 48{,}6^\\circ \\approx 2{,}65\\ \\text{m/s}',
        nota: 'Chegar em frente custa tempo: é um compromisso, não um almoço grátis.',
      },
    ],
    exemplo: {
      enunciado:
        'Um barco atravessa um rio de 80 m a 4 m/s, apontado perpendicular à margem; a correnteza é de 3 m/s. Quanto tempo leva e quanto é arrastado?',
      passos: [
        {
          descricao: 'Só a componente perpendicular atravessa o rio.',
          tex: 't = \\frac{80}{4} = 20\\ \\text{s}',
        },
        {
          descricao: 'Nesse tempo a correnteza arrasta o barco rio abaixo.',
          tex: 'd = 3 \\cdot 20 = 60\\ \\text{m}',
        },
        {
          descricao: 'A velocidade em relação à margem soma as duas.',
          tex: '|\\mathbf{v}| = \\sqrt{4^{2} + 3^{2}} = 5\\ \\text{m/s}',
        },
      ],
    },
    vejaTambem: ['cin-vetorial.velocidade-relativa', 'cin-vetorial.deslocamento'],
  },
  {
    id: 'cin-vetorial.componentes-da-aceleracao',
    titulo: 'Tangencial e normal',
    resumo: 'Uma muda a rapidez; a outra, a direção.',
    definicao:
      'A aceleração se decompõe em duas partes com papéis distintos. A componente tangencial é ' +
      'paralela à velocidade e é a única que altera o módulo dela. A componente normal é ' +
      'perpendicular e só curva a trajetória. Num movimento circular uniforme a tangencial é ' +
      'nula e toda a aceleração é normal — há aceleração sem mudança de rapidez.',
    formulas: [
      { tex: 'a_{t} = \\frac{\\vec{a} \\cdot \\vec{v}}{\\left|\\vec{v}\\right|}' },
      { tex: 'a_{n} = \\sqrt{\\left|\\vec{a}\\right|^{2} - a_{t}^{2}}' },
    ],
    demonstracao: [
      {
        descricao: 'Com velocidade e aceleração perpendiculares, o produto escalar é zero.',
        tex: '\\vec{v} \\cdot \\vec{a} = 0 \\;\\Longrightarrow\\; a_{t} = 0',
      },
      {
        descricao: 'Então toda a aceleração é normal, e só a direção muda.',
        tex: 'a_{n} = \\left|\\vec{a}\\right|',
        nota: 'É exatamente o movimento circular uniforme.',
      },
      {
        descricao: 'Com aceleração alinhada à velocidade, acontece o oposto.',
        tex: 'a_{n} = 0 \\;\\Longrightarrow\\; \\text{trajetória reta}',
      },
      {
        descricao: 'O sinal da tangencial diz se o movimento acelera ou freia.',
        tex: 'a_{t} > 0 \\;\\text{acelera} \\qquad a_{t} < 0 \\;\\text{freia}',
      },
    ],
    vejaTambem: ['cin-vetorial.curvatura', 'cin-vetorial.velocidade-media'],
  },
  {
    id: 'cin-vetorial.curvatura',
    titulo: 'Raio de curvatura',
    resumo: 'Toda curva, de perto, é um arco de círculo.',
    definicao:
      'A componente normal da aceleração se relaciona com o raio da curva exatamente como no ' +
      'movimento circular. Isso permite medir o quanto a trajetória está curvando num ponto: ' +
      'raio pequeno é curva fechada, raio grande é curva suave, raio infinito é reta. É a ' +
      'grandeza que limita o quanto uma aeronave pode manobrar sem exceder a carga estrutural.',
    formulas: [{ tex: 'a_{n} = \\frac{v^{2}}{R}' }, { tex: 'R = \\frac{v^{2}}{a_{n}}' }],
    demonstracao: [
      {
        descricao: 'A 100 metros por segundo com aceleração normal de 20.',
        tex: 'R = \\frac{100^{2}}{20} = 500\\ \\text{m}',
      },
      {
        descricao: 'Dobrando a velocidade e mantendo a aceleração, o raio quadruplica.',
        tex: 'R = \\frac{200^{2}}{20} = 2000\\ \\text{m}',
        nota: 'Voar mais rápido torna a curva muito mais aberta, para a mesma carga.',
      },
      {
        descricao: 'Sem componente normal, a curva se desfaz.',
        tex: 'a_{n} = 0 \\;\\Longrightarrow\\; R \\to \\infty',
      },
    ],
    vejaTambem: ['cin-vetorial.componentes-da-aceleracao', 'cin-vetorial.velocidade-media'],
  },
];
