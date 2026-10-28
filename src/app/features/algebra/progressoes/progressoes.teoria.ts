import { somaComPassos, somaInfinitaComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_PROGRESSOES: readonly Teoria[] = [
  {
    id: 'progressoes.aritmetica',
    titulo: 'Progressão aritmética',
    resumo: 'Somar sempre a mesma coisa.',
    definicao:
      'Numa PA, cada termo é o anterior mais uma razão constante. O termo geral é uma função ' +
      'afim de n — e é por isso que os pontos de uma PA, num gráfico, ficam alinhados: a ' +
      'razão é o coeficiente angular.',
    formulas: [
      { tex: 'a_n = a_1 + (n - 1)r' },
      {
        tex: 'S_n = \\frac{(a_1 + a_n) \\cdot n}{2}',
        legenda: 'A média dos extremos, multiplicada pela quantidade.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Escrevemos a soma duas vezes, a segunda de trás para frente.',
        tex: 'S = a_1 + a_2 + \\dots + a_n \\quad\\text{e}\\quad S = a_n + a_{n-1} + \\dots + a_1',
      },
      {
        descricao: 'Somando as duas linhas, cada par vertical dá o mesmo total.',
        tex: '2S = \\underbrace{(a_1 + a_n) + \\dots + (a_1 + a_n)}_{n \\text{ parcelas}}',
        nota: 'O que um termo ganha, o par dele perde — é a sacada do Gauss criança.',
      },
      {
        descricao: 'Logo, a soma é metade disso.',
        tex: 'S_n = \\frac{(a_1 + a_n)n}{2}',
      },
    ],
    exemplo: {
      enunciado: 'Somando os 10 primeiros termos da PA que começa em 3, de razão 5.',
      passos: somaComPassos({ primeiro: 3, razao: 5, geometrica: false }, 10).passos,
    },
    vejaTambem: ['progressoes.geometrica', 'afim.coeficientes'],
  },
  {
    id: 'progressoes.geometrica',
    titulo: 'Progressão geométrica',
    resumo: 'Multiplicar sempre pela mesma coisa.',
    definicao:
      'Numa PG, cada termo é o anterior multiplicado por uma razão constante. O termo geral ' +
      'é uma função exponencial de n, e é por isso que uma PG de razão maior que 1 sempre ' +
      'ultrapassa qualquer PA, por lenta que pareça no começo.',
    formulas: [
      { tex: 'a_n = a_1 \\cdot q^{\\,n-1}' },
      {
        tex: 'S_n = a_1 \\frac{q^{n} - 1}{q - 1}, \\quad q \\ne 1',
        legenda: 'A soma dos n primeiros termos.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Multiplicamos a soma inteira pela razão.',
        tex: 'qS = a_1 q + a_1 q^{2} + \\dots + a_1 q^{n}',
      },
      {
        descricao: 'Subtraindo da original, quase tudo se cancela.',
        tex: 'qS - S = a_1 q^{n} - a_1',
        nota: 'Sobram apenas as duas pontas: é um telescópio.',
      },
      {
        descricao: 'Isolando S, chega-se à fórmula.',
        tex: 'S(q - 1) = a_1(q^{n} - 1) \;\\Rightarrow\; S_n = a_1\\frac{q^{n}-1}{q-1}',
      },
    ],
    exemplo: {
      enunciado: 'Somando os 8 primeiros termos da PG que começa em 2, de razão 3.',
      passos: somaComPassos({ primeiro: 2, razao: 3, geometrica: true }, 8).passos,
    },
    vejaTambem: ['progressoes.aritmetica', 'progressoes.infinita', 'exponencial.crescimento'],
  },
  {
    id: 'progressoes.infinita',
    titulo: 'Quando somar infinitos termos dá um número',
    resumo: 'Se cada parcela encolhe rápido o bastante, a soma para.',
    definicao:
      'Uma PG de razão com módulo menor que 1 tem soma infinita finita. Parece contradição, ' +
      'mas não é: cada parcela é tão menor que a anterior que o total nunca passa de um ' +
      'limite. É o primeiro encontro honesto com a ideia de convergência.',
    formulas: [
      { tex: 'S_\\infty = \\frac{a_1}{1 - q}, \\qquad |q| < 1' },
      {
        tex: '|q| \\ge 1 \;\\Rightarrow\; \\text{a soma diverge}',
        legenda: 'Parcelas que não encolhem não deixam a soma parar.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Partimos da soma dos n primeiros termos.',
        tex: 'S_n = a_1\\frac{1 - q^{n}}{1 - q}',
      },
      {
        descricao: 'Com |q| < 1, elevar a potências cada vez maiores leva a zero.',
        tex: 'q^{n} \\to 0 \\quad (n \\to \\infty)',
        nota: 'Metade de metade de metade… nunca volta a crescer.',
      },
      {
        descricao: 'O que sobra é a soma infinita.',
        tex: 'S_\\infty = \\frac{a_1}{1 - q}',
      },
      {
        descricao: 'Com |q| ≥ 1 a potência não encolhe, e a soma cresce sem limite.',
        tex: '\\text{diverge}',
      },
    ],
    exemplo: {
      enunciado: 'A soma de 1 + 1/2 + 1/4 + 1/8 + …',
      passos: somaInfinitaComPassos(1, 0.5).passos,
    },
    vejaTambem: ['progressoes.geometrica', 'limite.intuicao'],
  },
];
