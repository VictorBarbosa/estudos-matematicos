import { conicaComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_CONICAS: readonly Teoria[] = [
  {
    id: 'conicas.familia',
    titulo: 'Uma família, três curvas',
    resumo: 'Todas saem de cortar um cone com um plano.',
    definicao:
      'Elipse, parábola e hipérbole são secções de um mesmo cone duplo: o que muda é a ' +
      'inclinação do plano que o corta. A circunferência é o caso particular da elipse com o ' +
      'plano perpendicular ao eixo.',
    formulas: [
      { tex: '\\frac{x^{2}}{a^{2}} + \\frac{y^{2}}{b^{2}} = 1', legenda: 'Elipse: soma.' },
      { tex: '\\frac{x^{2}}{a^{2}} - \\frac{y^{2}}{b^{2}} = 1', legenda: 'Hipérbole: diferença.' },
      { tex: 'y = ax^{2} + bx + c', legenda: 'Parábola: um termo ao quadrado só.' },
    ],
    demonstracao: [
      {
        descricao: 'Plano perpendicular ao eixo do cone: a secção é um círculo.',
        tex: 'e = 0',
      },
      {
        descricao: 'Inclinando um pouco, o círculo se alonga e vira elipse.',
        tex: '0 < e < 1',
      },
      {
        descricao: 'Paralelo a uma geratriz, a curva deixa de fechar: é a parábola.',
        tex: 'e = 1',
      },
      {
        descricao: 'Mais inclinado ainda, o plano corta as duas folhas do cone.',
        tex: 'e > 1 \\;\\Rightarrow\\; \\text{hipérbole, com dois ramos}',
        nota: 'A excentricidade é o parâmetro único que percorre toda a família.',
      },
    ],
    exemplo: {
      enunciado: 'Uma elipse de semieixos 5 e 3.',
      passos: conicaComPassos(5, 3, false).passos,
    },
    vejaTambem: ['conicas.elipse', 'conicas.hiperbole'],
  },
  {
    id: 'conicas.elipse',
    titulo: 'Elipse',
    resumo: 'A soma das distâncias aos dois focos é constante.',
    definicao:
      'A elipse é o conjunto dos pontos cuja soma das distâncias a dois pontos fixos — os ' +
      'focos — é sempre a mesma. É a construção do barbante preso em dois pregos: esticando ' +
      'com o lápis, desenha-se uma elipse.',
    formulas: [
      { tex: 'd_1 + d_2 = 2a', legenda: 'A soma vale o dobro do semieixo maior.' },
      { tex: 'c^{2} = a^{2} - b^{2}', legenda: 'Distância focal.' },
      { tex: 'e = \\frac{c}{a}, \\quad 0 \\leq e < 1' },
    ],
    demonstracao: [
      {
        descricao: 'No ponto extremo do eixo maior, as duas distâncias somam o eixo inteiro.',
        tex: '(a - c) + (a + c) = 2a',
      },
      {
        descricao: 'No extremo do eixo menor, por simetria as duas distâncias são iguais.',
        tex: 'd_1 = d_2 = a',
      },
      {
        descricao: 'Pitágoras nesse ponto dá a relação entre os semieixos e a distância focal.',
        tex: 'a^{2} = b^{2} + c^{2} \\;\\Rightarrow\\; c^{2} = a^{2} - b^{2}',
      },
      {
        descricao: 'Com a = b os focos coincidem no centro e a elipse vira círculo.',
        tex: 'c = 0 \\;\\Rightarrow\\; e = 0',
      },
    ],
    exemplo: {
      enunciado: 'Elipse de semieixos 5 e 4.',
      passos: conicaComPassos(5, 4, false).passos,
    },
    vejaTambem: ['conicas.familia', 'conicas.hiperbole'],
  },
  {
    id: 'conicas.hiperbole',
    titulo: 'Hipérbole',
    resumo: 'A diferença das distâncias é que fica constante.',
    definicao:
      'Trocando a soma por uma diferença, a curva se abre em dois ramos que se afastam ' +
      'indefinidamente. As assíntotas são as retas que esses ramos se aproximam sem nunca ' +
      'tocar.',
    formulas: [
      { tex: '|d_1 - d_2| = 2a' },
      { tex: 'c^{2} = a^{2} + b^{2}', legenda: 'Soma, ao contrário da elipse.' },
      { tex: 'y = \\pm\\frac{b}{a}x', legenda: 'As assíntotas.' },
    ],
    demonstracao: [
      {
        descricao: 'Na elipse a relação é uma subtração; aqui, uma soma.',
        tex: 'c^{2} = a^{2} + b^{2}',
        nota: 'Por isso na hipérbole os focos ficam mais afastados que os vértices.',
      },
      {
        descricao: 'Para x muito grande, o termo constante da equação perde importância.',
        tex: '\\frac{x^{2}}{a^{2}} - \\frac{y^{2}}{b^{2}} = 1 \\;\\longrightarrow\\; \\frac{x^{2}}{a^{2}} \\approx \\frac{y^{2}}{b^{2}}',
      },
      {
        descricao: 'Isolando y, aparecem as duas retas que guiam os ramos.',
        tex: 'y \\approx \\pm\\frac{b}{a}x',
        nota: 'A curva encosta nelas no infinito, mas nunca as alcança.',
      },
    ],
    exemplo: {
      enunciado: 'Hipérbole de semieixos 3 e 4.',
      passos: conicaComPassos(3, 4, true).passos,
    },
    vejaTambem: ['conicas.elipse', 'conicas.familia'],
  },
  {
    id: 'conicas.orbitas',
    titulo: 'Cônicas como órbitas',
    resumo: 'A excentricidade decide se a trajetória fecha, escapa ou fica no limite.',
    definicao:
      'Sob gravidade de um corpo central, toda trajetória possível é uma cônica com o foco no ' +
      'centro de atração — é a primeira lei de Kepler, que Newton deduziu da lei do inverso do ' +
      'quadrado. Qual das três depende da excentricidade e, por sua vez, da energia: elipse ' +
      '(e < 1) para quem fica em órbita, parábola (e = 1) para quem parte exatamente com a ' +
      'velocidade de escape, e hipérbole (e > 1) para quem escapa com sobra. É por isso que a ' +
      'mesma geometria serve para o corte de um cone e para o projeto de uma missão.',
    formulas: [
      {
        tex: 'r(\\theta) = \\frac{p}{1 + e\\cos\\theta}',
        legenda: 'A cônica em coordenadas polares, com o foco na origem.',
      },
      {
        tex: 'e = 0 \\text{ (círculo)} \\quad e < 1 \\text{ (elipse)} \\quad e = 1 \\text{ (parábola)} \\quad e > 1 \\text{ (hipérbole)}',
      },
      {
        tex: 'E = -\\frac{GMm}{2a} \\;\\Rightarrow\\; E < 0 \\text{ fecha} \\;\\cdot\\; E = 0 \\text{ escapa no limite} \\;\\cdot\\; E > 0 \\text{ escapa}',
        legenda: 'A energia total decide a forma da órbita.',
      },
    ],
    demonstracao: [
      {
        descricao: 'A Terra descreve uma elipse de excentricidade pequena, quase um círculo.',
        tex: 'e_{\\text{Terra}} \\approx 0{,}0167',
        nota:
          'O periélio fica a 147,1 milhões de km e o afélio a 152,1 — uma diferença de 3,4%, ' +
          'suficiente para alterar a intensidade da luz solar recebida.',
      },
      {
        descricao: 'Uma transferência de Hohmann é meia elipse tangente às duas órbitas.',
        tex: 'a = \\frac{r_1 + r_2}{2}',
        nota: 'O semieixo maior é a média dos dois raios: é a manobra mais econômica em Δv.',
      },
      {
        descricao: 'Partindo com a velocidade de escape exata, a cônica degenera em parábola.',
        tex: 'v = \\sqrt{\\frac{2GM}{r}} \\;\\Rightarrow\\; E = 0 \\;\\Rightarrow\\; e = 1',
      },
      {
        descricao: 'Acima dela, a trajetória é hiperbólica e sobra velocidade no infinito.',
        tex: 'v_{\\infty}^{2} = v^{2} - \\frac{2GM}{r} > 0',
        nota: 'É o caso das sondas interplanetárias e dos sobrevoos de assistência gravitacional.',
      },
    ],
    vejaTambem: ['conicas.elipse', 'conicas.hiperbole', 'gravitacao.orbita', 'gravitacao.escape'],
  },
  {
    id: 'conicas.parabola',
    titulo: 'Parábola: foco e diretriz',
    resumo: 'Cada ponto fica à mesma distância do foco e da diretriz.',
    definicao:
      'A parábola é o conjunto dos pontos que estão à mesma distância de um ponto, o foco, e ' +
      'de uma reta, a diretriz. Com o vértice na origem e o eixo vertical, ela é x² = 4py: o ' +
      'foco fica em (0, p) e a diretriz é y = −p. Se p > 0, abre para cima; se p < 0, para ' +
      'baixo. Deslocada para o vértice (h, k), vira (x − h)² = 4p(y − k), com foco (h, k + p). ' +
      'É a forma das antenas parabólicas: todo raio paralelo ao eixo reflete para o foco.',
    formulas: [
      { tex: 'x^{2} = 4py \\qquad F = (0,\\; p) \\qquad \\text{diretriz: } y = -p' },
      {
        tex: '(x - h)^{2} = 4p(y - k) \\qquad F = (h,\\; k + p)',
        legenda: 'Vértice em (h, k).',
      },
    ],
    demonstracao: [
      {
        descricao: 'Distância de (x, y) ao foco (0, p) igual à distância à diretriz y = −p.',
        tex: '\\sqrt{x^{2} + (y - p)^{2}} = |y + p|',
      },
      {
        descricao: 'Elevando ao quadrado e expandindo.',
        tex: 'x^{2} + y^{2} - 2py + p^{2} = y^{2} + 2py + p^{2}',
      },
      {
        descricao: 'Os termos y² e p² se cancelam.',
        tex: 'x^{2} = 4py',
        nota: 'Por isso o coeficiente de y é 4p: p é a distância do vértice ao foco.',
      },
    ],
    exemplo: {
      enunciado: 'Foco e diretriz de x² = 12y.',
      passos: [
        { descricao: 'Comparando com x² = 4py.', tex: '4p = 12 \\;\\Rightarrow\\; p = 3' },
        {
          descricao: 'O foco fica p acima do vértice; a diretriz, p abaixo.',
          tex: 'F = (0,\\; 3) \\qquad y = -3',
        },
      ],
    },
    vejaTambem: ['conicas.familia', 'quadratica.parabola'],
  },
];
