import {
  forcaGravitacionalComPassos,
  orbitaCircularComPassos,
  terceiraLeiKeplerComPassos,
  velocidadeEscapeComPassos,
} from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_GRAVITACAO: readonly Teoria[] = [
  {
    id: 'gravitacao.lei',
    titulo: 'Lei da gravitação universal',
    resumo: 'Cai com o quadrado da distância.',
    definicao:
      'Dois corpos quaisquer se atraem com força proporcional ao produto das massas e ' +
      'inversamente proporcional ao quadrado da distância entre seus CENTROS. O "universal" ' +
      'não é retórica: a mesma lei descreve a maçã e a Lua, e foi essa unificação que fundou a ' +
      'física moderna.',
    formulas: [
      { tex: 'F = G\\frac{m_1 m_2}{d^{2}}' },
      { tex: 'g = \\frac{GM}{r^{2}}', legenda: 'A gravidade local é a força por unidade de massa.' },
    ],
    demonstracao: [
      {
        descricao: 'A força é proporcional a cada massa, pela simetria da atração.',
        tex: 'F \\propto m_1 m_2',
      },
      {
        descricao: 'E cai com o quadrado da distância, como tudo que se espalha por uma esfera.',
        tex: 'F \\propto \\frac{1}{d^{2}}',
        nota: 'A área da esfera cresce com r², e o efeito se dilui na mesma proporção.',
      },
      {
        descricao: 'Dividindo pela massa do corpo atraído, sobra a gravidade local.',
        tex: 'g = \\frac{F}{m} = \\frac{GM}{r^{2}}',
        nota: 'Daí a aceleração de queda não depender da massa que cai.',
      },
    ],
    exemplo: {
      enunciado: 'A força entre a Terra e um corpo de 100 kg na superfície.',
      passos: forcaGravitacionalComPassos(5.972e24, 100, 6.371e6).passos,
    },
    vejaTambem: ['gravitacao.orbita', 'gravitacao.escape', 'gravitacao.kepler'],
  },
  {
    id: 'gravitacao.orbita',
    titulo: 'Órbita circular',
    resumo: 'Cair para sempre, sem nunca chegar.',
    definicao:
      'Um satélite em órbita está em queda livre permanente — ele cai, mas a curvatura da ' +
      'Terra "escapa" dele na mesma taxa. Matematicamente, a gravidade é exatamente a força ' +
      'centrípeta necessária. Dessa igualdade sai a velocidade orbital, e a massa do satélite ' +
      'se cancela.',
    formulas: [
      { tex: '\\frac{GMm}{r^{2}} = \\frac{mv^{2}}{r}' },
      { tex: 'v = \\sqrt{\\frac{GM}{r}}' },
      { tex: 'T = \\frac{2\\pi r}{v}' },
    ],
    demonstracao: [
      {
        descricao: 'Em movimento circular, é preciso uma força apontando para o centro.',
        tex: 'F_c = \\frac{mv^{2}}{r}',
      },
      {
        descricao: 'Em órbita, essa força é a própria gravidade — não há outra.',
        tex: '\\frac{GMm}{r^{2}} = \\frac{mv^{2}}{r}',
        nota: 'Não existe "força centrífuga" atuando no satélite: só gravidade.',
      },
      {
        descricao: 'A massa do satélite se cancela.',
        tex: 'v^{2} = \\frac{GM}{r}',
        nota: 'A ISS e um parafuso solto na mesma altitude orbitam com a mesma velocidade.',
      },
      {
        descricao: 'Órbitas mais altas são mais lentas.',
        tex: 'r \\uparrow \\;\\Rightarrow\\; v \\downarrow',
      },
    ],
    exemplo: {
      enunciado: 'Órbita a 400 km de altitude, como a da Estação Espacial.',
      passos: orbitaCircularComPassos(400_000).passos,
    },
    vejaTambem: ['gravitacao.lei', 'gravitacao.escape', 'gravitacao.kepler'],
  },
  {
    id: 'gravitacao.escape',
    titulo: 'Velocidade de escape',
    resumo: 'Apenas √2 vezes a de orbitar.',
    definicao:
      'Escapar de um corpo celeste significa chegar ao infinito com velocidade nula — ou seja, ' +
      'ter energia cinética suficiente para cancelar a energia potencial gravitacional. O ' +
      'resultado é surpreendentemente modesto: a velocidade de escape é só √2 vezes a ' +
      'velocidade orbital no mesmo raio, cerca de 41% mais.',
    formulas: [
      { tex: 'v_e = \\sqrt{\\frac{2GM}{r}} = \\sqrt{2}\\,v_{orb}' },
      { tex: 'v_e(\\text{Terra}) \\approx 11{,}2\\,\\text{km/s}' },
    ],
    demonstracao: [
      {
        descricao: 'A energia potencial gravitacional é negativa e tende a zero no infinito.',
        tex: 'E_p = -\\frac{GMm}{r}',
      },
      {
        descricao: 'Escapar exige energia total não negativa.',
        tex: '\\frac{mv^{2}}{2} - \\frac{GMm}{r} \\ge 0',
      },
      {
        descricao: 'No limite, a igualdade dá a velocidade mínima.',
        tex: 'v_e = \\sqrt{\\frac{2GM}{r}}',
        nota: 'A massa do corpo que escapa se cancela — vale para uma sonda ou um átomo.',
      },
      {
        descricao: 'Comparando com a velocidade orbital no mesmo raio.',
        tex: 'v_e = \\sqrt{2}\\,v_{orb}',
      },
    ],
    exemplo: {
      enunciado: 'A velocidade de escape da superfície da Terra.',
      passos: velocidadeEscapeComPassos().passos,
    },
    vejaTambem: ['gravitacao.orbita', 'propulsao.tsiolkovsky'],
  },
  {
    id: 'gravitacao.kepler',
    titulo: 'As leis de Kepler, deduzidas',
    resumo: 'T² proporcional a r³ sai da órbita circular.',
    definicao:
      'Kepler descobriu suas leis observando dados, décadas antes de Newton. A terceira — ' +
      'T² proporcional a r³ — sai em três linhas da gravitação, e foi essa concordância que ' +
      'convenceu o mundo de que Newton estava certo.',
    formulas: [
      { tex: '\\frac{T^{2}}{r^{3}} = \\frac{4\\pi^{2}}{GM}' },
      {
        tex: '\\frac{T_B^{2}}{T_A^{2}} = \\frac{r_B^{3}}{r_A^{3}}',
        legenda: 'Comparando dois satélites do mesmo corpo central.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Partimos da velocidade orbital e do período.',
        tex: 'v = \\sqrt{\\frac{GM}{r}} \\qquad v = \\frac{2\\pi r}{T}',
      },
      {
        descricao: 'Igualando as duas expressões e elevando ao quadrado.',
        tex: '\\frac{4\\pi^{2}r^{2}}{T^{2}} = \\frac{GM}{r}',
      },
      {
        descricao: 'Reorganizando, a razão T²/r³ é a mesma para todos os satélites.',
        tex: '\\frac{T^{2}}{r^{3}} = \\frac{4\\pi^{2}}{GM}',
        nota: 'A constante depende só da massa central: o Sol para os planetas, a Terra para a Lua.',
      },
    ],
    exemplo: {
      enunciado: 'Prevendo o período de uma órbita mais alta a partir de outra conhecida.',
      passos: terceiraLeiKeplerComPassos(6.771e6, 5560, 4.2164e7).passos,
    },
    vejaTambem: ['gravitacao.orbita', 'conicas.elipse', 'conicas.orbitas'],
  },
];
