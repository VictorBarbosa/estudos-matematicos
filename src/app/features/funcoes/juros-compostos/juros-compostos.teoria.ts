import { jurosCompostosComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_JUROS: readonly Teoria[] = [
  {
    id: 'juros.compostos',
    titulo: 'Juro sobre juro',
    resumo: 'Crescimento exponencial aplicado a dinheiro.',
    definicao:
      'Nos juros compostos, o rendimento de cada período passa a render também. O montante ' +
      'é multiplicado pelo mesmo fator a cada período — exatamente a definição de função ' +
      'exponencial.',
    formulas: [
      { tex: 'M = C(1 + i)^{n}' },
      { tex: 'J = M - C', legenda: 'O juro é a diferença entre montante e capital.' },
    ],
    demonstracao: [
      {
        descricao: 'Após o primeiro período, o capital é multiplicado pelo fator.',
        tex: 'M_1 = C(1 + i)',
      },
      {
        descricao: 'No segundo, o fator incide sobre o montante já acrescido.',
        tex: 'M_2 = M_1(1+i) = C(1+i)^{2}',
        nota: 'É aqui que o juro passa a render juro.',
      },
      {
        descricao: 'Repetindo n vezes, o expoente conta os períodos.',
        tex: 'M_n = C(1+i)^{n}',
      },
    ],
    exemplo: {
      enunciado: '$ 1.000 a 10% ao período, por 5 períodos.',
      passos: jurosCompostosComPassos(1000, 10, 5).passos,
    },
    vejaTambem: ['juros.simples', 'juros.tempo'],
  },
  {
    id: 'juros.simples',
    titulo: 'Simples contra compostos',
    resumo: 'Linear contra exponencial.',
    definicao:
      'Nos juros simples, só o capital inicial rende, e o crescimento é linear. Nos ' +
      'compostos, o montante inteiro rende, e o crescimento é exponencial. A diferença é ' +
      'pequena no começo e enorme no longo prazo.',
    formulas: [
      { tex: 'M_{\\text{simples}} = C(1 + i\\,n)', legenda: 'Função afim em n.' },
      { tex: 'M_{\\text{compostos}} = C(1 + i)^{n}', legenda: 'Função exponencial em n.' },
    ],
    demonstracao: [
      {
        descricao: 'No primeiro período os dois coincidem.',
        tex: 'C(1 + i) = C(1+i)^{1}',
      },
      {
        descricao: 'A partir daí, o composto cresce mais depressa.',
        tex: '(1+i)^{n} > 1 + in \\quad \\text{para } n > 1',
      },
      {
        descricao: 'É a mesma diferença entre função afim e exponencial.',
        tex: '\\text{somar sempre o mesmo} \\;\\times\\; \\text{multiplicar sempre pelo mesmo}',
        nota: 'A exponencial sempre acaba ultrapassando qualquer reta.',
      },
    ],
    exemplo: {
      enunciado: 'A diferença acumulada após 10 períodos.',
      passos: jurosCompostosComPassos(1000, 10, 10).passos,
    },
    vejaTambem: ['juros.compostos', 'juros.tempo'],
  },
  {
    id: 'juros.tempo',
    titulo: 'Quanto tempo para dobrar',
    resumo: 'O logaritmo responde, e há um atalho prático.',
    definicao:
      'Para descobrir em quantos períodos o capital dobra, é preciso tirar n do expoente — ' +
      'e isso pede logaritmo. Na prática, a "regra de 72" dá uma boa estimativa de cabeça.',
    formulas: [
      { tex: 'n = \\frac{\\ln 2}{\\ln(1+i)}' },
      { tex: 'n \\approx \\frac{72}{i_{\\%}}', legenda: 'A regra de 72.' },
    ],
    demonstracao: [
      {
        descricao: 'Queremos o n que dobra o capital.',
        tex: 'C(1+i)^{n} = 2C \\;\\Rightarrow\\; (1+i)^{n} = 2',
      },
      {
        descricao: 'O capital se cancela: o tempo não depende de quanto foi investido.',
        tex: '(1+i)^{n} = 2',
      },
      {
        descricao: 'Aplicamos logaritmo para tirar n do expoente.',
        tex: 'n = \\frac{\\ln 2}{\\ln(1+i)}',
      },
      {
        descricao: 'Para taxas pequenas, ln(1+i) ≈ i, e surge a regra prática.',
        tex: 'n \\approx \\frac{0{,}693}{i} \\approx \\frac{72}{i_{\\%}}',
        nota: 'A 8% ao ano, o dinheiro dobra em cerca de 9 anos.',
      },
    ],
    exemplo: {
      enunciado: 'Um capital a 8% por período.',
      passos: jurosCompostosComPassos(1000, 8, 9).passos,
    },
    vejaTambem: ['juros.compostos', 'logaritmica.definicao'],
  },
  {
    id: 'juros.equivalente',
    titulo: 'Taxas equivalentes',
    resumo: '1% ao mês não é 12% ao ano: em juros compostos, a conversão é por potência.',
    definicao:
      'Duas taxas são equivalentes quando levam o mesmo capital ao mesmo montante no mesmo ' +
      'prazo. Em juros compostos, os juros de cada mês rendem juros nos meses seguintes, então ' +
      'um ano a i ao mês multiplica o capital por (1 + i)¹², e não por 1 + 12i. A taxa ' +
      'proporcional, que só multiplica pelo número de períodos, é a dos juros simples. Para ' +
      'voltar da anual para a mensal, desfaz-se a potência com a raiz de índice 12.',
    formulas: [
      { tex: '1 + i_{\\text{anual}} = \\left(1 + i_{\\text{mensal}}\\right)^{12}' },
      {
        tex: 'i_{\\text{mensal}} = \\sqrt[12]{1 + i_{\\text{anual}}} - 1',
        legenda: 'O mesmo vale para trimestre (índice 4) e semestre (índice 2).',
      },
    ],
    demonstracao: [
      {
        descricao: 'Em 12 meses, o capital é multiplicado por (1 + i) doze vezes.',
        tex: 'M = C(1 + i_{\\text{mensal}})^{12}',
      },
      {
        descricao: 'Em 1 ano à taxa anual, uma vez só por (1 + i_anual). Igualando os montantes:',
        tex: 'C(1 + i_{\\text{anual}}) = C(1 + i_{\\text{mensal}})^{12}',
        nota: 'O capital se cancela: a equivalência não depende do valor aplicado.',
      },
    ],
    exemplo: {
      enunciado: '1% ao mês equivale a quanto ao ano?',
      passos: [
        { descricao: 'Potência 12 do fator mensal.', tex: '(1{,}01)^{12} = 1{,}126825' },
        {
          descricao: 'Tirando o 1.',
          tex: 'i_{\\text{anual}} = 0{,}126825 = 12{,}68\\%',
          nota: 'Mais que os 12% da conta proporcional: é o juro sobre juro.',
        },
      ],
    },
    vejaTambem: ['juros.compostos', 'juros.simples'],
  },
];
