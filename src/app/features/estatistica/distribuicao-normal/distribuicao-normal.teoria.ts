import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_NORMAL: readonly Teoria[] = [
  {
    id: 'normal.curva',
    titulo: 'A curva que aparece sozinha',
    resumo: 'Muitos efeitos pequenos somados produzem uma normal.',
    definicao:
      'A distribuição normal não é uma escolha de modelagem: ela surge sempre que muitos ' +
      'efeitos pequenos e independentes se somam. É o teorema central do limite, e é por isso ' +
      'que erro de medida, tolerância de fabricação e ruído de sensor são normais mesmo quando ' +
      'nada na origem deles é.',
    formulas: [
      { tex: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{(x - \\mu)^{2}}{2\\sigma^{2}}}' },
      {
        tex: '\\int_{-\\infty}^{\\infty} f(x)\\,dx = 1',
        legenda: 'A área total vale 1: por isso ela é probabilidade.',
      },
    ],
    demonstracao: [
      {
        descricao: 'A média localiza o pico da curva.',
        tex: 'f(\\mu) = \\frac{1}{\\sigma\\sqrt{2\\pi}}',
      },
      {
        descricao: 'O desvio padrão controla a largura.',
        tex: '\\sigma \\;\\text{pequeno} \\Longrightarrow \\;\\text{curva estreita e alta}',
        nota: 'A área é sempre 1: estreitar obriga a subir.',
      },
      {
        descricao: 'E a curva é simétrica em torno da média.',
        tex: 'f(\\mu + a) = f(\\mu - a)',
      },
    ],
    vejaTambem: ['normal.padronizacao', 'normal.regra-empirica', 'normal.simetria'],
  },
  {
    id: 'normal.padronizacao',
    titulo: 'Medir em desvios',
    resumo: 'O escore z transforma qualquer normal na mesma.',
    definicao:
      'Padronizar é trocar a unidade original por desvios padrão a partir da média. Feito ' +
      'isso, toda normal vira a mesma curva, e uma tabela única resolve qualquer problema. O ' +
      'escore z não tem unidade: ele não mede milímetros nem quilos, mede distância em ' +
      'desvios.',
    formulas: [
      { tex: 'z = \\frac{x - \\mu}{\\sigma}' },
      { tex: 'x = \\mu + z\\sigma', legenda: 'O caminho de volta.' },
    ],
    demonstracao: [
      {
        descricao: 'Uma peça de 52 mm numa produção de média 50 e desvio 2.',
        tex: 'z = \\frac{52 - 50}{2} = 1',
      },
      {
        descricao: 'Outra produção, com média 500 e desvio 20, numa peça de 520.',
        tex: 'z = \\frac{520 - 500}{20} = 1',
        nota: 'Os dois casos são o mesmo problema: um desvio acima da média.',
      },
      {
        descricao: 'E a proporção abaixo é a mesma nos dois.',
        tex: '\\Phi(1) \\approx 0{,}8413',
      },
    ],
    vejaTambem: ['normal.area', 'normal.quantil', 'normal.curva'],
  },
  {
    id: 'normal.area',
    titulo: 'Probabilidade é área',
    resumo: 'A tabela dá sempre a área à esquerda.',
    definicao:
      'Numa distribuição contínua, a probabilidade de um valor exato é zero — o que tem ' +
      'sentido é a probabilidade de cair num intervalo, e ela é a área sob a curva ali. A ' +
      'tabela da normal entrega a área à ESQUERDA de um z; qualquer outra região se obtém dela ' +
      'por subtração.',
    formulas: [
      { tex: '\\Phi(z) = P(Z < z)' },
      { tex: 'P(Z > z) = 1 - \\Phi(z)' },
      { tex: 'P(a < Z < b) = \\Phi(b) - \\Phi(a)' },
    ],
    demonstracao: [
      {
        descricao: 'A área à esquerda de 1 desvio.',
        tex: '\\Phi(1) \\approx 0{,}8413',
      },
      {
        descricao: 'À direita, o que sobra de 1.',
        tex: '1 - 0{,}8413 = 0{,}1587',
      },
      {
        descricao: 'E entre menos um e um, a diferença das duas acumuladas.',
        tex: '\\Phi(1) - \\Phi(-1) = 0{,}8413 - 0{,}1587 = 0{,}6827',
        nota: 'Somar em vez de subtrair contaria a parte de baixo duas vezes.',
      },
    ],
    vejaTambem: ['normal.simetria', 'normal.padronizacao', 'normal.regra-empirica'],
  },
  {
    id: 'normal.simetria',
    titulo: 'A simetria poupa metade da tabela',
    resumo: 'A área à esquerda de menos z é a área à direita de z.',
    definicao:
      'A curva é simétrica em torno da média, e isso tem consequência prática: tabelas antigas ' +
      'traziam só os valores positivos de z, porque os negativos se obtêm por reflexão. A ' +
      'relação vale sempre, e é o atalho mais útil para conferir se uma área foi calculada do ' +
      'lado certo.',
    formulas: [
      { tex: '\\Phi(-z) = 1 - \\Phi(z)' },
      { tex: '\\Phi(0) = 0{,}5', legenda: 'Metade da área fica de cada lado da média.' },
    ],
    demonstracao: [
      {
        descricao: 'A área à esquerda de menos um.',
        tex: '\\Phi(-1) = 1 - \\Phi(1) = 1 - 0{,}8413 = 0{,}1587',
      },
      {
        descricao: 'Que é exatamente a área à direita de um.',
        tex: 'P(Z > 1) = 0{,}1587 \\;\\checkmark',
      },
      {
        descricao: 'E na média, a curva se divide ao meio.',
        tex: 'P(Z < 0) = P(Z > 0) = 0{,}5',
      },
    ],
    vejaTambem: ['normal.area', 'normal.curva'],
  },
  {
    id: 'normal.regra-empirica',
    titulo: 'A regra de 68, 95 e 99,7',
    resumo: 'Três números que resolvem a maioria dos casos de cabeça.',
    definicao:
      'Num intervalo de um desvio em torno da média cabem cerca de 68 por cento dos valores; ' +
      'de dois desvios, 95; de três, 99,7. É a regra que permite julgar uma medida sem tabela ' +
      'nenhuma — e é a base do critério de controle de qualidade que descarta tudo o que passa ' +
      'de três desvios.',
    formulas: [
      { tex: 'P(\\mu - \\sigma < X < \\mu + \\sigma) \\approx 0{,}6827' },
      { tex: 'P(\\mu - 2\\sigma < X < \\mu + 2\\sigma) \\approx 0{,}9545' },
      { tex: 'P(\\mu - 3\\sigma < X < \\mu + 3\\sigma) \\approx 0{,}9973' },
    ],
    demonstracao: [
      {
        descricao: 'Cada faixa sai da diferença das acumuladas.',
        tex: '\\Phi(2) - \\Phi(-2) = 0{,}9772 - 0{,}0228',
      },
      {
        descricao: 'O que dá pouco mais de 95 por cento.',
        tex: '= 0{,}9545',
      },
      {
        descricao: 'Fora de três desvios sobra quase nada.',
        tex: '1 - 0{,}9973 = 0{,}0027',
        nota: 'Menos de 3 em mil: é por isso que três desvios servem de critério de rejeição.',
      },
    ],
    vejaTambem: ['normal.area', 'normal.curva'],
  },
  {
    id: 'normal.quantil',
    titulo: 'Da área para o valor',
    resumo: 'A leitura inversa da tabela.',
    definicao:
      'A pergunta mais útil em engenharia costuma vir ao contrário: não "que proporção fica ' +
      'abaixo de 52 mm", mas "que medida deixa 95 por cento abaixo dela". O caminho é o mesmo, ' +
      'percorrido de trás para frente — da área para o z, e do z para o valor.',
    formulas: [
      { tex: '\\Phi(z) = p \\;\\Longrightarrow\\; z = \\Phi^{-1}(p)' },
      { tex: 'x = \\mu + z\\sigma' },
    ],
    demonstracao: [
      {
        descricao: 'Procuramos o z que deixa 95 por cento à esquerda.',
        tex: '\\Phi(z) = 0{,}95 \\;\\Longrightarrow\\; z \\approx 1{,}645',
      },
      {
        descricao: 'Desfazemos a padronização, com média 50 e desvio 2.',
        tex: 'x = 50 + 1{,}645 \\cdot 2 \\approx 53{,}29',
      },
      {
        descricao: 'Esse é o limite que 95 por cento das peças respeitam.',
        tex: 'P(X < 53{,}29) \\approx 0{,}95',
        nota: 'É assim que se fixa uma tolerância de projeto a partir de uma meta de refugo.',
      },
    ],
    vejaTambem: ['normal.padronizacao', 'normal.area'],
  },
];
