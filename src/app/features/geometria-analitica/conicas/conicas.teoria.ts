import { conicaComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

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
        tex: 'e > 1 \;\\Rightarrow\; \\text{hipérbole, com dois ramos}',
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
        tex: 'a^{2} = b^{2} + c^{2} \;\\Rightarrow\; c^{2} = a^{2} - b^{2}',
      },
      {
        descricao: 'Com a = b os focos coincidem no centro e a elipse vira círculo.',
        tex: 'c = 0 \;\\Rightarrow\; e = 0',
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
        tex: '\\frac{x^{2}}{a^{2}} - \\frac{y^{2}}{b^{2}} = 1 \;\\longrightarrow\; \\frac{x^{2}}{a^{2}} \\approx \\frac{y^{2}}{b^{2}}',
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
];
