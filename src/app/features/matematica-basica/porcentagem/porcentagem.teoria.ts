import { sucessivasComPassos, variacaoComPassos, variacaoPercentualComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_PORCENTAGEM: readonly Teoria[] = [
  {
    id: 'porcentagem.definicao',
    titulo: 'Porcentagem é uma fração',
    resumo: 'Por cento significa literalmente "por cem".',
    definicao:
      'p% é apenas outro nome para a fração p/100. Não há nenhuma operação nova aqui: tudo que ' +
      'se faz com porcentagem é multiplicação de frações, com a vantagem de que o denominador ' +
      'cem torna os valores fáceis de comparar.',
    formulas: [
      { tex: 'p\\% = \\frac{p}{100}', legenda: '25% = 25/100 = 1/4 = 0,25.' },
      {
        tex: 'p\\% \\text{ de } V = \\frac{p}{100} \\times V',
        legenda: '"de" significa multiplicar.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Dividir em cem partes iguais e tomar p delas.',
        tex: 'p\\% \\text{ de } V = p \\times \\frac{V}{100}',
      },
      {
        descricao: 'Reagrupando, aparece a forma mais usada.',
        tex: '= \\frac{p}{100} \\times V',
        nota: 'As duas leituras dão o mesmo número; a segunda é mais prática na calculadora.',
      },
    ],
    exemplo: {
      enunciado: 'Quanto é 15% de 240?',
      passos: [
        {
          descricao: 'Escrevemos a porcentagem como fração.',
          tex: '15\\% = \\frac{15}{100} = 0{,}15',
        },
        { descricao: 'Multiplicamos pelo valor.', tex: '0{,}15 \\times 240 = 36' },
      ],
    },
    vejaTambem: ['porcentagem.fator', 'porcentagem.sucessivas'],
  },
  {
    id: 'porcentagem.fator',
    titulo: 'O fator multiplicativo',
    resumo: 'Aumentar 20% é multiplicar por 1,20 — numa única conta.',
    definicao:
      'Em vez de calcular a parte e depois somar, multiplica-se o valor por (1 ± p/100). O 1 ' +
      'preserva o valor original e a fração acrescenta ou retira a parte. Essa é a ideia que ' +
      'faz tudo o mais no tema funcionar.',
    formulas: [
      {
        tex: 'V_{\\text{final}} = V \\times \\left(1 + \\frac{p}{100}\\right)',
        legenda: 'Acréscimo de p%.',
      },
      {
        tex: 'V_{\\text{final}} = V \\times \\left(1 - \\frac{p}{100}\\right)',
        legenda: 'Desconto de p%.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Aumentar significa somar a parte ao próprio valor.',
        tex: 'V + \\frac{p}{100}V',
      },
      {
        descricao: 'Pondo V em evidência, os dois passos viram um só.',
        tex: '= V\\left(1 + \\frac{p}{100}\\right)',
        nota: 'O 1 é o próprio valor original, escrito como 100%.',
      },
    ],
    exemplo: {
      enunciado: 'Um produto de R$ 80,00 com acréscimo de 25%.',
      passos: variacaoComPassos(80, 25).passos,
    },
    vejaTambem: ['porcentagem.sucessivas', 'porcentagem.variacao'],
  },
  {
    id: 'porcentagem.sucessivas',
    titulo: 'Variações sucessivas',
    resumo: 'Os fatores se multiplicam; os percentuais não se somam.',
    definicao:
      'Quando uma variação vem depois da outra, a segunda incide sobre o valor já alterado. ' +
      'Por isso os fatores se multiplicam, e somar os percentuais dá errado. É daqui que sai o ' +
      'resultado contraintuitivo: subir 10% e depois cair 10% não devolve o valor inicial.',
    formulas: [
      {
        tex: 'V_{\\text{final}} = V \\times f_1 \\times f_2 \\times \\cdots \\times f_n',
        legenda: 'Cada fᵢ é o fator (1 ± pᵢ/100) da sua etapa.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Um aumento de 10% leva o valor a 1,1V.',
        tex: 'V \\to 1{,}1V',
      },
      {
        descricao: 'A queda de 10% seguinte incide sobre 1,1V, não sobre V.',
        tex: '1{,}1V \\times 0{,}9 = 0{,}99V',
        nota: 'Perdeu-se 1% do valor original — e a conta é simétrica: a ordem não muda o resultado.',
      },
      {
        descricao: 'O fator acumulado revela a variação equivalente numa etapa só.',
        tex: '0{,}99 \\to -1\\%',
      },
    ],
    exemplo: {
      enunciado: 'R$ 200,00 com aumento de 10% e depois desconto de 10%.',
      passos: sucessivasComPassos(200, [10, -10]).passos,
    },
    vejaTambem: ['porcentagem.fator', 'porcentagem.variacao'],
  },
  {
    id: 'porcentagem.variacao',
    titulo: 'Variação percentual',
    resumo: 'A diferença sempre se compara ao valor INICIAL.',
    definicao:
      'Para saber de quantos por cento algo variou, divide-se a diferença pelo valor de ' +
      'partida. Trocar o denominador pelo valor de chegada é o erro mais comum do tema e muda ' +
      'o resultado.',
    formulas: [
      {
        tex: '\\text{variação} = \\frac{V_{\\text{final}} - V_{\\text{inicial}}}{V_{\\text{inicial}}} \\times 100\\%',
      },
    ],
    demonstracao: [
      {
        descricao: 'A porcentagem compara uma parte com um todo de referência.',
        tex: '\\frac{\\text{parte}}{\\text{todo}}',
      },
      {
        descricao: 'Numa variação, a parte é o quanto mudou e o todo é de onde se partiu.',
        tex: '\\frac{\\Delta V}{V_{\\text{inicial}}}',
        nota: 'De 50 para 100 é um aumento de 100%; de 100 para 50, uma queda de 50%. Mesma diferença, percentuais diferentes.',
      },
    ],
    exemplo: {
      enunciado: 'Um preço passou de R$ 80,00 para R$ 100,00.',
      passos: variacaoPercentualComPassos(80, 100).passos,
    },
    vejaTambem: ['porcentagem.fator'],
  },
];
