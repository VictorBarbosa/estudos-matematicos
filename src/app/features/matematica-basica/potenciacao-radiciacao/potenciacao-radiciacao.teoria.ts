import {
  potenciaDePotenciaComPassos,
  produtoDePotenciasComPassos,
  quocienteDePotenciasComPassos,
  simplificarRaizComPassos,
} from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_POTENCIAS: readonly Teoria[] = [
  {
    id: 'potencias.definicao',
    titulo: 'Potência é multiplicação repetida',
    resumo: 'A base é o fator; o expoente conta quantas vezes ele aparece.',
    definicao:
      'aⁿ significa multiplicar a por ele mesmo n vezes. Toda propriedade de potência sai ' +
      'dessa definição — não é preciso decorar nenhuma delas, basta contar fatores.',
    formulas: [
      { tex: 'a^{n} = \\underbrace{a \\cdot a \\cdots a}_{n \\text{ fatores}}' },
      {
        tex: '(-a)^{n} \\neq -a^{n}',
        legenda: 'Sem parênteses, o expoente age só na base; o sinal fica de fora.',
      },
    ],
    demonstracao: [
      {
        descricao: 'O expoente conta fatores, não parcelas.',
        tex: '2^{3} = 2 \\cdot 2 \\cdot 2 = 8',
        nota: 'Confundir com 2 × 3 = 6 é o erro mais comum de quem está começando.',
      },
      {
        descricao: 'Com base negativa, o sinal do resultado depende da paridade do expoente.',
        tex: '(-2)^{2} = 4 \\qquad (-2)^{3} = -8',
        nota: 'Expoente par neutraliza o sinal, porque os negativos se cancelam aos pares.',
      },
    ],
    exemplo: {
      enunciado: 'Multiplicando potências de mesma base.',
      passos: produtoDePotenciasComPassos(2, 3, 4).passos,
    },
    vejaTambem: ['potencias.propriedades', 'potencias.expoentes-especiais'],
  },
  {
    id: 'potencias.propriedades',
    titulo: 'Propriedades das potências',
    resumo: 'Multiplicar soma expoentes; dividir subtrai; elevar multiplica.',
    definicao:
      'As três propriedades centrais seguem de contar fatores. Elas só valem para potências de ' +
      'MESMA BASE — tentar aplicá-las a bases diferentes é a origem de boa parte dos erros.',
    formulas: [
      { tex: 'a^{m} \\cdot a^{n} = a^{m+n}' },
      { tex: '\\frac{a^{m}}{a^{n}} = a^{m-n}' },
      { tex: '\\left(a^{m}\\right)^{n} = a^{m \\cdot n}' },
      {
        tex: '(a \\cdot b)^{n} = a^{n} \\cdot b^{n}',
        legenda: 'A potência distribui sobre o produto, mas NÃO sobre a soma.',
      },
    ],
    demonstracao: [
      {
        descricao: 'No produto, os dois grupos de fatores simplesmente se juntam.',
        tex: 'a^{2} \\cdot a^{3} = (a \\cdot a)(a \\cdot a \\cdot a) = a^{5}',
      },
      {
        descricao: 'No quociente, cada fator de baixo cancela um de cima.',
        tex: '\\frac{a^{5}}{a^{2}} = \\frac{a \\cdot a \\cdot a \\cdot \\cancel{a} \\cdot \\cancel{a}}{\\cancel{a} \\cdot \\cancel{a}} = a^{3}',
      },
      {
        descricao: 'Na potência de potência, são n grupos de m fatores.',
        tex: '\\left(a^{2}\\right)^{3} = a^{2} \\cdot a^{2} \\cdot a^{2} = a^{6}',
      },
      {
        descricao: 'Atenção: a potência não distribui sobre a soma.',
        tex: '(a+b)^{2} \\neq a^{2} + b^{2}',
        nota: 'O correto é (a+b)² = a² + 2ab + b² — sobra o termo do meio.',
      },
    ],
    exemplo: {
      enunciado: 'Dividindo potências de mesma base.',
      passos: quocienteDePotenciasComPassos(3, 5, 2).passos,
    },
    vejaTambem: ['potencias.expoentes-especiais', 'potencias.raizes'],
  },
  {
    id: 'potencias.expoentes-especiais',
    titulo: 'Expoente zero e negativo',
    resumo: 'Não são convenções arbitrárias: a divisão de potências as exige.',
    definicao:
      'a⁰ = 1 e a⁻ⁿ = 1/aⁿ são consequências da regra do quociente. Expoente negativo inverte ' +
      'o número — ele não o torna negativo, que é a confusão mais frequente aqui.',
    formulas: [
      { tex: 'a^{0} = 1 \\quad (a \\neq 0)' },
      { tex: 'a^{-n} = \\frac{1}{a^{n}}' },
      {
        tex: '\\left(\\frac{a}{b}\\right)^{-n} = \\left(\\frac{b}{a}\\right)^{n}',
        legenda: 'Expoente negativo vira inversão da fração.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Dividir uma potência por ela mesma dá 1, por definição de divisão.',
        tex: '\\frac{a^{3}}{a^{3}} = 1',
      },
      {
        descricao: 'Pela regra do quociente, a mesma conta dá expoente zero.',
        tex: '\\frac{a^{3}}{a^{3}} = a^{3-3} = a^{0}',
        nota: 'Para que as duas leituras concordem, a⁰ tem de valer 1.',
      },
      {
        descricao: 'Do mesmo modo, um expoente menor embaixo deixa fatores no denominador.',
        tex: '\\frac{a^{2}}{a^{5}} = \\frac{1}{a^{3}} \\qquad \\text{e} \\qquad a^{2-5} = a^{-3}',
        nota: 'Logo a⁻³ = 1/a³. O sinal do expoente inverte, não nega.',
      },
    ],
    exemplo: {
      enunciado: 'O que acontece quando o expoente de baixo é maior.',
      passos: quocienteDePotenciasComPassos(2, 2, 5).passos,
    },
    vejaTambem: ['potencias.propriedades', 'potencias.raizes'],
  },
  {
    id: 'potencias.raizes',
    titulo: 'Raízes são potências',
    resumo: 'A raiz de índice n é a potência de expoente 1/n.',
    definicao:
      'Radiciação não é uma operação nova: é potenciação com expoente fracionário. Entendido ' +
      'isso, todas as propriedades das potências passam a valer para as raízes, e simplificar ' +
      'um radical vira apenas fatorar.',
    formulas: [
      { tex: '\\sqrt[n]{a} = a^{\\frac{1}{n}}' },
      { tex: '\\sqrt[n]{a^{m}} = a^{\\frac{m}{n}}' },
      {
        tex: '\\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b}',
        legenda: 'Vale para produto; NÃO vale para soma.',
      },
    ],
    demonstracao: [
      {
        descricao: 'A raiz é definida como a operação que desfaz a potência.',
        tex: '\\left(\\sqrt[n]{a}\\right)^{n} = a',
      },
      {
        descricao: 'O expoente 1/n é exatamente o que cumpre essa condição.',
        tex: '\\left(a^{\\frac{1}{n}}\\right)^{n} = a^{\\frac{1}{n} \\cdot n} = a^{1} = a',
      },
      {
        descricao: 'Por isso, simplificar uma raiz é procurar expoentes múltiplos do índice.',
        tex: '\\sqrt{72} = \\sqrt{2^{3} \\cdot 3^{2}} = 2 \\cdot 3 \\sqrt{2} = 6\\sqrt{2}',
        nota: 'Cada par de fatores iguais sai da raiz quadrada como um fator único.',
      },
      {
        descricao: 'Cuidado: a raiz não se distribui sobre a soma.',
        tex: '\\sqrt{a + b} \\neq \\sqrt{a} + \\sqrt{b}',
        nota: '√(9+16) = √25 = 5, enquanto √9 + √16 = 3 + 4 = 7.',
      },
    ],
    exemplo: {
      enunciado: 'Simplificar √72.',
      passos: simplificarRaizComPassos(72).passos,
    },
    vejaTambem: ['potencias.propriedades', 'potencias.definicao'],
  },
];

/** Reexportado para o componente poder mostrar a demonstração da potência de potência. */
export const EXEMPLO_POTENCIA_DE_POTENCIA = potenciaDePotenciaComPassos(2, 3, 2);
