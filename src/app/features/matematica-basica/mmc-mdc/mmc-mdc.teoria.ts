import { mdcComPassos, mmcComPassos, relacaoMdcMmcComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_MMC_MDC: readonly Teoria[] = [
  {
    id: 'mmc-mdc.fatoracao',
    titulo: 'Fatoração em primos',
    resumo: 'Todo inteiro se escreve de um único jeito como produto de primos.',
    definicao:
      'Fatorar é decompor um número no produto dos primos que o formam. O Teorema Fundamental ' +
      'da Aritmética garante que essa decomposição é única — por isso ela serve de "impressão ' +
      'digital" do número, e é dela que MMC e MDC saem sem adivinhação.',
    formulas: [
      {
        tex: 'n = p_1^{a_1} \\cdot p_2^{a_2} \\cdots p_k^{a_k}',
        legenda: 'Cada pᵢ é primo e cada expoente aᵢ diz quantas vezes ele aparece.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Dividimos sucessivamente pelos primos, do menor para o maior.',
        tex: '360 \\div 2 = 180 \\div 2 = 90 \\div 2 = 45 \\div 3 = 15 \\div 3 = 5 \\div 5 = 1',
      },
      {
        descricao: 'Os divisores usados, agrupados em potências, são a fatoração.',
        tex: '360 = 2^{3} \\cdot 3^{2} \\cdot 5',
      },
    ],
    exemplo: {
      enunciado: 'Fatorar 12 e 18 para compará-los.',
      passos: mdcComPassos(12, 18).passos,
    },
    vejaTambem: ['mmc-mdc.mdc', 'mmc-mdc.mmc'],
  },
  {
    id: 'mmc-mdc.mdc',
    titulo: 'MDC — máximo divisor comum',
    resumo: 'Primos comuns, cada um com o MENOR expoente.',
    definicao:
      'O MDC é o maior número que divide todos os dados ao mesmo tempo. Na fatoração, ele ' +
      'reúne apenas os primos que aparecem em todos, cada um elevado ao menor expoente — só ' +
      'assim o resultado ainda cabe dentro de cada número.',
    formulas: [
      { tex: '\\operatorname{mdc}(a, b) = \\prod p_i^{\\min(a_i,\\, b_i)}' },
      {
        tex: '\\operatorname{mdc}(a, b) = \\operatorname{mdc}(b,\\; a \\bmod b)',
        legenda: 'O algoritmo de Euclides, que chega ao mesmo valor sem fatorar nada.',
      },
    ],
    demonstracao: [
      {
        descricao:
          'Para dividir os dois números, o resultado só pode usar primos presentes em ambos.',
        tex: '12 = 2^{2} \\cdot 3 \\qquad 18 = 2 \\cdot 3^{2}',
      },
      {
        descricao: 'E não pode usar um primo mais vezes do que o número que o tem menos vezes.',
        tex: '\\min(2, 1) = 1 \\text{ para o } 2 \\qquad \\min(1, 2) = 1 \\text{ para o } 3',
        nota: 'Usar 2² deixaria de dividir 18, que só tem um fator 2.',
      },
      {
        descricao: 'O produto dessas potências mínimas é o maior divisor possível.',
        tex: '\\operatorname{mdc}(12, 18) = 2 \\cdot 3 = 6',
      },
    ],
    exemplo: {
      enunciado: 'Qual o MDC de 48 e 60?',
      passos: mdcComPassos(48, 60).passos,
    },
    vejaTambem: ['mmc-mdc.mmc', 'mmc-mdc.relacao'],
  },
  {
    id: 'mmc-mdc.mmc',
    titulo: 'MMC — mínimo múltiplo comum',
    resumo: 'Todos os primos, cada um com o MAIOR expoente.',
    definicao:
      'O MMC é o menor número que é múltiplo de todos os dados. Na fatoração, ele reúne todos ' +
      'os primos que aparecem em qualquer um deles, cada um elevado ao maior expoente — é o ' +
      'mínimo necessário para conter cada número por inteiro.',
    formulas: [{ tex: '\\operatorname{mmc}(a, b) = \\prod p_i^{\\max(a_i,\\, b_i)}' }],
    demonstracao: [
      {
        descricao:
          'Para ser múltiplo dos dois, o resultado precisa conter todos os primos de cada um.',
        tex: '12 = 2^{2} \\cdot 3 \\qquad 18 = 2 \\cdot 3^{2}',
      },
      {
        descricao:
          'E cada primo tem de aparecer ao menos tantas vezes quanto no número que o tem mais vezes.',
        tex: '\\max(2, 1) = 2 \\text{ para o } 2 \\qquad \\max(1, 2) = 2 \\text{ para o } 3',
        nota: 'Com 3¹ apenas, o resultado deixaria de ser múltiplo de 18.',
      },
      {
        descricao: 'O produto dessas potências máximas é o menor múltiplo comum.',
        tex: '\\operatorname{mmc}(12, 18) = 2^{2} \\cdot 3^{2} = 36',
      },
    ],
    exemplo: {
      enunciado: 'Dois ônibus saem a cada 12 e 18 minutos. Quando coincidem de novo?',
      passos: mmcComPassos(12, 18).passos,
    },
    vejaTambem: ['mmc-mdc.mdc', 'mmc-mdc.relacao'],
  },
  {
    id: 'mmc-mdc.relacao',
    titulo: 'A relação entre MMC e MDC',
    resumo: 'Multiplicados, devolvem o produto dos próprios números.',
    definicao:
      'MDC e MMC são complementares: um guarda o menor expoente de cada primo, o outro o maior. ' +
      'Somados, esses expoentes reconstroem exatamente os dos números originais — por isso o ' +
      'produto dos dois é igual ao produto dos números.',
    formulas: [
      {
        tex: '\\operatorname{mdc}(a,b) \\cdot \\operatorname{mmc}(a,b) = a \\cdot b',
        legenda: 'Conhecendo um deles, o outro sai por divisão.',
      },
    ],
    demonstracao: [
      {
        descricao:
          'Para cada primo, o menor e o maior expoente são os dois expoentes originais, em alguma ordem.',
        tex: '\\min(a_i, b_i) + \\max(a_i, b_i) = a_i + b_i',
      },
      {
        descricao: 'Somar expoentes é multiplicar potências, então o produto reconstrói a·b.',
        tex: '\\prod p_i^{\\min} \\cdot \\prod p_i^{\\max} = \\prod p_i^{a_i + b_i} = a \\cdot b',
      },
    ],
    exemplo: {
      enunciado: 'Conferindo com 12 e 18.',
      passos: relacaoMdcMmcComPassos(12, 18).passos,
    },
    vejaTambem: ['mmc-mdc.mdc', 'mmc-mdc.mmc'],
  },
];
