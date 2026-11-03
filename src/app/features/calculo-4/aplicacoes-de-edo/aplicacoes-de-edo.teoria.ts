import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_APLICACOES_EDO: readonly Teoria[] = [
  {
    id: 'aplicacoes.montar',
    titulo: 'Montar a equação',
    resumo: 'A parte difícil não é resolver, é escrever.',
    definicao:
      'Em engenharia a equação não vem pronta: ela sai de um balanço. O que entra menos o que ' +
      'sai é a taxa de variação, e traduzir essa frase em símbolos é o trabalho real. Resolver ' +
      'a equação, depois disso, costuma ser a parte mecânica.',
    formulas: [
      { tex: '\\frac{d}{dt}(\\text{acumulado}) = \\text{entra} - \\text{sai}' },
      { tex: "y' = \\text{taxa de entrada} - \\text{taxa de saída}" },
    ],
    demonstracao: [
      {
        descricao: 'Num tanque, entra solução a uma taxa constante.',
        tex: '\\text{entra} = 5 \\cdot 0{,}3 = 1{,}5\\ \\text{kg/min}',
      },
      {
        descricao: 'E sai o que há no tanque, na proporção da vazão.',
        tex: '\\text{sai} = 5 \\cdot \\frac{S}{200}',
        nota: 'A saída depende do que já há dentro — e é isso que cria a equação diferencial.',
      },
      {
        descricao: 'O balanço produz uma linear de primeira ordem.',
        tex: "S' = 1{,}5 - 0{,}025S",
      },
      {
        descricao: 'E o equilíbrio aparece sem resolver nada.',
        tex: "S' = 0 \\;\\Longrightarrow\\; S_{\\infty} = 60\\ \\text{kg}",
      },
    ],
    vejaTambem: ['aplicacoes.mistura', 'aplicacoes.resfriamento', 'aplicacoes.circuito'],
  },
  {
    id: 'aplicacoes.resfriamento',
    titulo: 'Lei de resfriamento de Newton',
    resumo: 'O que decai é a DIFERENÇA para o ambiente.',
    definicao:
      'Um corpo esfria a uma taxa proporcional à diferença entre sua temperatura e a do ' +
      'ambiente. O detalhe que mais escapa é esse: quem decai exponencialmente é a diferença, ' +
      'não a temperatura — um corpo não esfria até zero grau, ele esfria até o ambiente.',
    formulas: [
      { tex: '\\frac{dT}{dt} = -k\\left(T - T_{amb}\\right)' },
      { tex: 'T(t) = T_{amb} + \\left(T_{0} - T_{amb}\\right)e^{-kt}' },
    ],
    demonstracao: [
      {
        descricao: 'Trocamos a variável pela diferença.',
        tex: 'u = T - T_{amb} \\;\\Longrightarrow\\; u\' = -ku',
        nota: 'A substituição transforma o problema na equação exponencial simples.',
      },
      {
        descricao: 'A diferença decai exponencialmente.',
        tex: 'u(t) = u_{0}e^{-kt}',
      },
      {
        descricao: 'E a temperatura volta somando o ambiente.',
        tex: 'T(t) = T_{amb} + u_{0}e^{-kt}',
      },
      {
        descricao: 'Um café a 90 graus num ambiente a 20, com k igual a 0,05.',
        tex: 'T(10) = 20 + 70e^{-0{,}5} \\approx 62{,}5\\ ^\\circ\\text{C}',
      },
    ],
    vejaTambem: ['aplicacoes.montar', 'aplicacoes.decaimento'],
  },
  {
    id: 'aplicacoes.decaimento',
    titulo: 'Decaimento radioativo',
    resumo: 'A perda é proporcional ao que resta.',
    definicao:
      'Num decaimento, a quantidade que se perde por unidade de tempo é proporcional ao que ' +
      'ainda há — e por isso a perda diminui conforme a amostra encolhe. É a razão de o ' +
      'decaimento ser exponencial e nunca chegar a zero, e de a meia-vida ser constante.',
    formulas: [
      { tex: "m' = -km \\;\\Longrightarrow\\; m(t) = m_{0}e^{-kt}" },
      { tex: 'k = \\frac{\\ln 2}{t_{1/2}}' },
    ],
    demonstracao: [
      {
        descricao: 'Da meia-vida sai a constante de decaimento.',
        tex: 't_{1/2} = 5730 \\;\\Longrightarrow\\; k \\approx 1{,}21 \\times 10^{-4}',
        nota: 'É o carbono-14, usado para datar material orgânico.',
      },
      {
        descricao: 'Depois de uma meia-vida resta metade.',
        tex: 'm(5730) = 0{,}5m_{0}',
      },
      {
        descricao: 'Depois de duas, um quarto — não zero.',
        tex: 'm(11460) = 0{,}25m_{0}',
        nota: 'Duas meias-vidas não zeram a amostra: elas a dividem por quatro.',
      },
      {
        descricao: 'E a datação inverte a conta.',
        tex: 't = -\\frac{1}{k}\\ln\\frac{m}{m_{0}}',
      },
    ],
    vejaTambem: ['aplicacoes.resfriamento', 'aplicacoes.montar'],
  },
  {
    id: 'aplicacoes.circuito',
    titulo: 'Circuito RL',
    resumo: 'O indutor se opõe à variação, e a corrente sobe devagar.',
    definicao:
      'Num circuito com resistor e indutor, a corrente não salta ao valor final: o indutor se ' +
      'opõe à variação, e ela sobe exponencialmente. A constante de tempo é a indutância ' +
      'dividida pela resistência, e a corrente final é a tensão sobre a resistência — o ' +
      'indutor não participa do regime permanente.',
    formulas: [
      { tex: 'L\\frac{di}{dt} + Ri = V' },
      { tex: 'i(t) = \\frac{V}{R}\\left(1 - e^{-Rt/L}\\right)' },
      { tex: '\\tau = \\frac{L}{R}' },
    ],
    demonstracao: [
      {
        descricao: 'No instante inicial, o indutor bloqueia a corrente.',
        tex: 'i(0) = 0',
      },
      {
        descricao: 'Depois de uma constante de tempo, já chegou a 63 por cento.',
        tex: '1 - e^{-1} \\approx 0{,}632',
      },
      {
        descricao: 'E no regime permanente o indutor some da conta.',
        tex: 'i_{\\infty} = \\frac{V}{R}',
        nota: 'Com corrente constante, a tensão sobre o indutor é zero.',
      },
      {
        descricao: 'Com 12 V, 4 ohms e 0,2 henry.',
        tex: 'i_{\\infty} = 3\\ \\text{A} \\qquad \\tau = 0{,}05\\ \\text{s}',
      },
    ],
    vejaTambem: ['aplicacoes.montar', 'aplicacoes.mola'],
  },
  {
    id: 'aplicacoes.mola',
    titulo: 'Massa-mola amortecida',
    resumo: 'A segunda lei de Newton é uma EDO de segunda ordem.',
    definicao:
      'Uma massa presa a uma mola, com atrito, obedece à segunda lei de Newton — e escrever ' +
      'essa lei dá exatamente uma EDO linear de segunda ordem. Os três regimes do capítulo ' +
      'anterior reaparecem aqui como comportamentos físicos: oscilar, não oscilar, e o limite ' +
      'entre os dois.',
    formulas: [
      { tex: 'm\\ddot{x} + c\\dot{x} + kx = 0' },
      { tex: '\\omega_{0} = \\sqrt{\\frac{k}{m}} \\qquad \\zeta = \\frac{c}{2\\sqrt{km}}' },
    ],
    demonstracao: [
      {
        descricao: 'A mola puxa de volta, proporcionalmente ao deslocamento.',
        tex: 'F_{mola} = -kx',
      },
      {
        descricao: 'E o atrito se opõe ao movimento, proporcionalmente à velocidade.',
        tex: 'F_{atrito} = -c\\dot{x}',
      },
      {
        descricao: 'A segunda lei junta as duas.',
        tex: 'm\\ddot{x} = -kx - c\\dot{x}',
        nota: 'Reorganizando, aparece a EDO linear de segunda ordem.',
      },
      {
        descricao: 'O fator de amortecimento decide o regime.',
        tex: '\\zeta < 1 \\;\\text{oscila} \\qquad \\zeta = 1 \\;\\text{crítico} \\qquad \\zeta > 1 \\;\\text{não oscila}',
        nota: 'Uma suspensão é projetada perto de ζ igual a 1, e um sismógrafo também.',
      },
    ],
    vejaTambem: ['aplicacoes.circuito', 'aplicacoes.montar'],
  },
  {
    id: 'aplicacoes.mistura',
    titulo: 'Problemas de mistura',
    resumo: 'Entra a taxa constante, sai o proporcional ao que há.',
    definicao:
      'Num tanque que recebe e escoa ao mesmo tempo, a taxa de entrada é constante e a de ' +
      'saída é proporcional à concentração atual — o que dá uma linear de primeira ordem. A ' +
      'concentração de equilíbrio é a da entrada, e o tanque leva algumas constantes de tempo ' +
      'para chegar lá.',
    formulas: [
      { tex: "S' = q_{e}c_{e} - \\frac{q_{s}}{V}S" },
      { tex: 'S_{\\infty} = V c_{e}', legenda: 'Com vazões iguais, o tanque termina na concentração de entrada.' },
    ],
    demonstracao: [
      {
        descricao: 'A entrada traz sal a uma taxa fixa.',
        tex: 'q_{e}c_{e} = 5 \\cdot 0{,}3 = 1{,}5\\ \\text{kg/min}',
      },
      {
        descricao: 'A saída leva o que há, diluído no volume.',
        tex: '\\frac{5}{200}S = 0{,}025S',
      },
      {
        descricao: 'No equilíbrio, as duas se igualam.',
        tex: '1{,}5 = 0{,}025S \\;\\Longrightarrow\\; S_{\\infty} = 60\\ \\text{kg}',
      },
      {
        descricao: 'Que é a concentração de entrada vezes o volume.',
        tex: '0{,}3 \\cdot 200 = 60 \\;\\checkmark',
        nota: 'O tanque termina com a mesma concentração que entra — nada mais razoável.',
      },
    ],
    vejaTambem: ['aplicacoes.montar', 'aplicacoes.circuito'],
  },
];
