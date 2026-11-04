import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_TERMICA: readonly Teoria[] = [
  {
    id: 'termica.conducao',
    titulo: 'Condução: calor por contato',
    resumo: 'A lei de Fourier liga o fluxo à geometria e ao material.',
    definicao:
      'Na condução, a energia passa de partícula para partícula sem que a matéria se desloque. ' +
      'O fluxo cresce com a área e com a diferença de temperatura, e cai com a espessura — por ' +
      'isso paredes grossas isolam melhor. O que distingue um metal de um isolante é a ' +
      'condutividade, e entre o cobre e a lã de vidro ela varia quatro ordens de grandeza.',
    formulas: [
      { tex: '\\frac{Q}{t} = \\frac{kA\\,\\Delta T}{L}' },
      {
        tex: 'k_{cobre} \\approx 401 \\qquad k_{l\\tilde{a}} \\approx 0{,}04 \\;\\text{W/(m}\\cdot\\text{K)}',
      },
    ],
    demonstracao: [
      {
        descricao: 'Numa parede de 1 metro quadrado e 20 centímetros de espessura.',
        tex: 'A = 1\\ \\text{m}^{2} \\qquad L = 0{,}2\\ \\text{m}',
      },
      {
        descricao: 'Com 20 kelvin de diferença, em alvenaria.',
        tex: '\\frac{0{,}8 \\cdot 1 \\cdot 20}{0{,}2} = 80\\ \\text{W}',
      },
      {
        descricao: 'Trocando por lã de vidro, o fluxo despenca.',
        tex: '\\frac{0{,}04 \\cdot 1 \\cdot 20}{0{,}2} = 4\\ \\text{W}',
        nota: 'Vinte vezes menos, com a mesma espessura: é para isso que serve um isolante.',
      },
    ],
    vejaTambem: ['termica.resistencia', 'termica.conveccao', 'termica.fluxo-e-energia'],
  },
  {
    id: 'termica.resistencia',
    titulo: 'Resistência térmica',
    resumo: 'Camadas em série somam resistências, como resistores.',
    definicao:
      'A analogia com circuitos é exata: a diferença de temperatura faz o papel da tensão, o ' +
      'fluxo de calor faz o da corrente, e a resistência térmica é o quociente entre os dois. ' +
      'Camadas em série somam resistências, e é isso que permite dimensionar um isolamento ' +
      'multicamada sem resolver nada de novo.',
    formulas: [
      { tex: 'R = \\frac{L}{kA}' },
      { tex: '\\frac{Q}{t} = \\frac{\\Delta T}{R_{total}} \\qquad R_{total} = \\sum R_{i}' },
    ],
    demonstracao: [
      {
        descricao: 'A lei de Fourier reescrita no formato de resistência.',
        tex: '\\frac{Q}{t} = \\frac{\\Delta T}{L/(kA)}',
      },
      {
        descricao: 'Uma parede dupla soma as duas camadas.',
        tex: 'R_{total} = \\frac{L_{1}}{k_{1}A} + \\frac{L_{2}}{k_{2}A}',
      },
      {
        descricao: 'E a camada mais isolante domina a soma.',
        tex: 'R_{total} \\approx R_{isolante}',
        nota: 'É por isso que vale tanto acrescentar pouca espessura de um bom isolante.',
      },
    ],
    vejaTambem: ['termica.conducao', 'termica.conveccao'],
  },
  {
    id: 'termica.conveccao',
    titulo: 'Convecção: calor carregado pelo fluido',
    resumo: 'O coeficiente depende do escoamento, não do material.',
    definicao:
      'Na convecção, o fluido se move e leva a energia consigo. A forma da lei é simples, mas ' +
      'o coeficiente não é propriedade do material: ele depende da velocidade do escoamento, ' +
      'da geometria e de ser convecção natural ou forçada. Soprar sobre a superfície aumenta ' +
      'esse coeficiente, e é por isso que assoprar a comida funciona.',
    formulas: [
      { tex: '\\frac{Q}{t} = hA\\,\\Delta T' },
      {
        tex: 'h_{natural} \\approx 5\\text{–}25 \\qquad h_{for\\c{c}ada} \\approx 25\\text{–}250 \\;\\text{W/(m}^{2}\\cdot\\text{K)}',
      },
    ],
    demonstracao: [
      {
        descricao: 'Uma superfície de meio metro quadrado, 30 kelvin acima do ar.',
        tex: 'A = 0{,}5\\ \\text{m}^{2} \\qquad \\Delta T = 30\\ \\text{K}',
      },
      {
        descricao: 'Em convecção natural.',
        tex: '10 \\cdot 0{,}5 \\cdot 30 = 150\\ \\text{W}',
      },
      {
        descricao: 'Com um ventilador, o coeficiente sobe e o fluxo acompanha.',
        tex: '100 \\cdot 0{,}5 \\cdot 30 = 1500\\ \\text{W}',
        nota: 'Dez vezes mais, sem mudar nem a área nem a temperatura.',
      },
    ],
    vejaTambem: ['termica.conducao', 'termica.radiacao'],
  },
  {
    id: 'termica.radiacao',
    titulo: 'Radiação: a única que atravessa o vácuo',
    resumo: 'Vai com a QUARTA potência da temperatura absoluta.',
    definicao:
      'Todo corpo acima do zero absoluto emite ondas eletromagnéticas, e essa é a única forma ' +
      'de transferência que não precisa de meio. A dependência com a quarta potência é o que a ' +
      'separa das outras duas: dobrar a temperatura em kelvin multiplica a emissão por ' +
      'dezesseis. A emissividade mede o quanto o corpo se aproxima de um emissor perfeito.',
    formulas: [
      { tex: '\\frac{Q}{t} = \\varepsilon\\sigma A T^{4}' },
      { tex: '\\sigma = 5{,}67 \\times 10^{-8}\\ \\text{W/(m}^{2}\\cdot\\text{K}^{4})' },
    ],
    demonstracao: [
      {
        descricao: 'Um metro quadrado de corpo negro a 300 kelvin.',
        tex: '1 \\cdot 5{,}67 \\times 10^{-8} \\cdot 300^{4} \\approx 459\\ \\text{W}',
      },
      {
        descricao: 'A 600 kelvin, o dobro da temperatura.',
        tex: '5{,}67 \\times 10^{-8} \\cdot 600^{4} \\approx 7348\\ \\text{W}',
      },
      {
        descricao: 'Dezesseis vezes mais, com apenas o dobro da temperatura.',
        tex: '2^{4} = 16',
        nota: 'É esse expoente que torna o controle térmico orbital um problema de área e emissividade.',
      },
    ],
    vejaTambem: ['termica.kelvin', 'termica.vacuo', 'termica.conveccao'],
  },
  {
    id: 'termica.kelvin',
    titulo: 'Por que kelvin, e não Celsius',
    resumo: 'Na radiação, a escala errada não desloca: ela destrói o resultado.',
    definicao:
      'Em condução e convecção aparece apenas a DIFERENÇA de temperatura, e uma diferença em ' +
      'Celsius vale o mesmo que em kelvin. Na radiação aparece a temperatura absoluta elevada ' +
      'à quarta, e aí a escala importa de verdade: usar Celsius não muda o resultado por uma ' +
      'constante, muda por um fator que pode passar de mil.',
    formulas: [
      { tex: 'T\\,[\\text{K}] = T\\,[^\\circ\\text{C}] + 273{,}15' },
      {
        tex: '\\Delta T\\,[\\text{K}] = \\Delta T\\,[^\\circ\\text{C}]',
        legenda: 'As diferenças coincidem.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Um corpo a 27 graus Celsius está a 300 kelvin.',
        tex: '27 + 273{,}15 = 300{,}15\\ \\text{K}',
      },
      {
        descricao: 'Na radiação, a diferença entre as duas escalas é brutal.',
        tex: '\\frac{300^{4}}{27^{4}} \\approx 1524',
        nota: 'Mil e quinhentas vezes: não é um ajuste, é outro problema.',
      },
      {
        descricao: 'Já numa diferença, as duas escalas dão o mesmo número.',
        tex: '(50 - 20)\\ ^\\circ\\text{C} = (323{,}15 - 293{,}15)\\ \\text{K} = 30',
      },
    ],
    vejaTambem: ['termica.radiacao', 'termica.conducao'],
  },
  {
    id: 'termica.vacuo',
    titulo: 'Controle térmico no vácuo',
    resumo: 'Sem ar, só a radiação dissipa.',
    definicao:
      'Em órbita não há ar para conduzir nem para convectar: a única saída de calor é a ' +
      'radiação. A temperatura de um satélite se acomoda onde o que ele absorve do Sol iguala ' +
      'o que ele emite para o espaço — e dimensionar radiador vira um problema de área e de ' +
      'emissividade, não de ventilação.',
    formulas: [
      { tex: 'P_{absorvida} = \\varepsilon\\sigma A T^{4}' },
      { tex: 'T = \\left(\\frac{P}{\\varepsilon\\sigma A}\\right)^{1/4}' },
    ],
    demonstracao: [
      {
        descricao: 'Um radiador de 2 metros quadrados precisa dissipar 500 watts.',
        tex: 'P = 500\\ \\text{W} \\qquad A = 2\\ \\text{m}^{2} \\qquad \\varepsilon = 0{,}9',
      },
      {
        descricao: 'Isolamos a quarta potência da temperatura.',
        tex: 'T^{4} = \\frac{500}{0{,}9 \\cdot 5{,}67 \\times 10^{-8} \\cdot 2}',
      },
      {
        descricao: 'E tiramos a raiz quarta.',
        tex: 'T \\approx 322\\ \\text{K} \\approx 49\\ ^\\circ\\text{C}',
        nota: 'Dobrar a área baixaria a temperatura só pela raiz quarta de 2, cerca de 16 por cento.',
      },
    ],
    vejaTambem: ['termica.radiacao', 'termica.kelvin'],
  },
  {
    id: 'termica.calor-sensivel',
    titulo: 'Calor sensível',
    resumo: 'Quanto custa aquecer, sem mudar de fase.',
    definicao:
      'O calor sensível é o que muda a temperatura de um corpo sem alterar seu estado físico. ' +
      'O calor específico é o preço dessa mudança por quilo e por kelvin — e a água tem um dos ' +
      'maiores de todos, o que explica por que ela é usada como refrigerante e por que o mar ' +
      'modera o clima da costa.',
    formulas: [
      { tex: 'Q = mc\\,\\Delta T' },
      { tex: 'c_{\\acute{a}gua} = 4186 \\qquad c_{ferro} = 450 \\;\\text{J/(kg}\\cdot\\text{K)}' },
    ],
    demonstracao: [
      {
        descricao: 'Aquecer um quilo de água em dez graus.',
        tex: 'Q = 1 \\cdot 4186 \\cdot 10 = 41860\\ \\text{J}',
      },
      {
        descricao: 'O mesmo com um quilo de ferro.',
        tex: 'Q = 1 \\cdot 450 \\cdot 10 = 4500\\ \\text{J}',
      },
      {
        descricao: 'Quase dez vezes menos energia para o mesmo aquecimento.',
        tex: '\\frac{4186}{450} \\approx 9{,}3',
        nota: 'A mesma razão explica por que o ferro esfria tão rápido quanto esquenta.',
      },
    ],
    vejaTambem: ['termica.equilibrio', 'termica.fluxo-e-energia'],
  },
  {
    id: 'termica.equilibrio',
    titulo: 'A temperatura final de uma mistura',
    resumo: 'Média ponderada pelas capacidades térmicas.',
    definicao:
      'Num recipiente isolado, o calor que um corpo perde é exatamente o que o outro ganha. ' +
      'Isolando a temperatura final, aparece uma média ponderada — e o peso de cada corpo não é ' +
      'a massa sozinha, é a capacidade térmica: massa vezes calor específico.',
    formulas: [
      { tex: 'Q_{1} + Q_{2} = 0' },
      { tex: 'T_{f} = \\frac{m_{1}c_{1}T_{1} + m_{2}c_{2}T_{2}}{m_{1}c_{1} + m_{2}c_{2}}' },
    ],
    demonstracao: [
      {
        descricao: 'Um quilo de água a 20 graus com um quilo de ferro a 100.',
        tex: 'm_{1}c_{1} = 4186 \\qquad m_{2}c_{2} = 450',
      },
      {
        descricao: 'A média ponderada pende fortemente para a água.',
        tex: 'T_{f} = \\frac{4186 \\cdot 20 + 450 \\cdot 100}{4186 + 450} \\approx 27{,}8\\ ^\\circ\\text{C}',
      },
      {
        descricao: 'A média simples daria outro número, bem distante.',
        tex: '\\frac{20 + 100}{2} = 60\\ ^\\circ\\text{C}',
        nota: 'Ela só valeria se as duas capacidades térmicas fossem iguais.',
      },
    ],
    vejaTambem: ['termica.calor-sensivel', 'termica.fluxo-e-energia'],
  },
  {
    id: 'termica.fluxo-e-energia',
    titulo: 'Fluxo não é energia',
    resumo: 'Watt é por segundo; joule, não.',
    definicao:
      'As três leis de transferência dão um FLUXO, em watts — energia por unidade de tempo. A ' +
      'energia trocada só aparece ao multiplicar pelo intervalo. Confundir os dois é o engano ' +
      'de unidade mais comum do tópico, e ele passa despercebido porque o número continua ' +
      'parecendo razoável.',
    formulas: [
      { tex: '\\frac{Q}{t}\\;[\\text{W}] \\qquad Q\\;[\\text{J}]' },
      { tex: 'Q = \\frac{Q}{t} \\cdot t' },
    ],
    demonstracao: [
      {
        descricao: 'Uma parede deixa passar 80 watts.',
        tex: '\\frac{Q}{t} = 80\\ \\text{W}',
      },
      {
        descricao: 'Em uma hora, isso dá muito mais que 80.',
        tex: 'Q = 80 \\cdot 3600 = 288\\,000\\ \\text{J}',
      },
      {
        descricao: 'Que é quase 0,3 megajoule, ou 80 watt-hora.',
        tex: '288\\,000\\ \\text{J} = 0{,}08\\ \\text{kWh}',
        nota: 'A conta da energia vem em kWh justamente porque fluxo e energia diferem pelo tempo.',
      },
    ],
    vejaTambem: ['termica.conducao', 'termica.calor-sensivel'],
  },
];
