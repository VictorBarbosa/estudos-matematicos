import {
  Fracao,
  decimalParaFracaoComPassos,
  dizimaParaFracaoComPassos,
  fracaoParaDecimalComPassos,
} from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_DECIMAIS: readonly Teoria[] = [
  {
    id: 'decimais.posicional',
    titulo: 'O valor posicional',
    resumo: 'Cada casa decimal vale dez vezes menos que a anterior.',
    definicao:
      'O sistema decimal continua à direita da vírgula com a mesma lógica que usa à esquerda: ' +
      'cada posição vale um décimo da anterior. Por isso um decimal finito é sempre uma fração ' +
      'de denominador potência de dez.',
    formulas: [
      {
        tex: '0{,}d_1 d_2 d_3 = \\frac{d_1}{10} + \\frac{d_2}{100} + \\frac{d_3}{1000}',
        legenda: 'Décimos, centésimos, milésimos.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Decompondo 0,375 por posição.',
        tex: '0{,}375 = \\frac{3}{10} + \\frac{7}{100} + \\frac{5}{1000}',
      },
      {
        descricao: 'Reduzindo ao mesmo denominador, aparece a fração direta.',
        tex: '= \\frac{300 + 70 + 5}{1000} = \\frac{375}{1000}',
        nota: 'O denominador é 10 elevado ao número de casas decimais.',
      },
      {
        descricao: 'Simplificando.',
        tex: '= \\frac{3}{8}',
      },
    ],
    exemplo: {
      enunciado: 'Transformar 0,75 em fração.',
      passos: decimalParaFracaoComPassos(0.75).passos,
    },
    vejaTambem: ['decimais.quando-finito', 'decimais.dizima'],
  },
  {
    id: 'decimais.quando-finito',
    titulo: 'Quando o decimal é finito',
    resumo: 'Só quando o denominador irredutível tem apenas fatores 2 e 5.',
    definicao:
      'Dividir 1 por 8 dá um decimal exato; dividir 1 por 3 não. A razão não é acaso: o ' +
      'decimal termina exatamente quando o denominador, já simplificado, só tem os primos que ' +
      'dividem 10 — ou seja, 2 e 5.',
    formulas: [
      {
        tex: '\\frac{a}{2^{m} \\cdot 5^{n}} \\;\\longrightarrow\\; \\text{decimal finito}',
      },
    ],
    demonstracao: [
      {
        descricao:
          'Para o decimal terminar, a fração precisa virar algo sobre uma potência de dez.',
        tex: '\\frac{a}{b} = \\frac{c}{10^{k}}',
      },
      {
        descricao: 'Mas 10ᵏ é feito só de 2 e 5.',
        tex: '10^{k} = 2^{k} \\cdot 5^{k}',
      },
      {
        descricao: 'Logo b só pode conter esses dois primos; qualquer outro impede a conversão.',
        tex: '\\frac{1}{8} = \\frac{1}{2^{3}} = 0{,}125 \\qquad \\frac{1}{3} = 0{,}\\overline{3}',
        nota: 'O 3 do denominador nunca some, por mais que se multiplique por potências de dez.',
      },
    ],
    exemplo: {
      enunciado: 'Por que 1/7 não tem decimal exato.',
      passos: fracaoParaDecimalComPassos(Fracao.criar(1, 7)).passos,
    },
    vejaTambem: ['decimais.dizima', 'decimais.posicional'],
  },
  {
    id: 'decimais.dizima',
    titulo: 'Dízimas periódicas e a fração geratriz',
    resumo: 'Toda dízima periódica é uma fração — e dá para descobrir qual.',
    definicao:
      'Uma dízima periódica repete um bloco de dígitos para sempre. Parece um número ' +
      '"infinito demais" para ser uma fração, mas é: o truque é multiplicar por potências de ' +
      'dez até alinhar as caudas infinitas e subtrair, fazendo o infinito se cancelar.',
    formulas: [
      {
        tex: '0{,}\\overline{d} = \\frac{d}{9} \\qquad 0{,}\\overline{d_1 d_2} = \\frac{d_1 d_2}{99}',
        legenda: 'Um 9 no denominador para cada dígito do período.',
      },
      {
        tex: '0{,}a\\overline{p} = \\frac{ap - a}{90}',
        legenda: 'Com parte não periódica, entram zeros depois dos noves.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Chamamos a dízima de x.',
        tex: 'x = 0{,}\\overline{3} = 0{,}333\\ldots',
      },
      {
        descricao: 'Multiplicando por 10, a cauda infinita continua idêntica.',
        tex: '10x = 3{,}333\\ldots',
      },
      {
        descricao: 'Subtraindo, as infinitas casas se cancelam exatamente.',
        tex: '10x - x = 3{,}333\\ldots - 0{,}333\\ldots = 3',
        nota: 'É aqui que o problema deixa de ser infinito e vira uma equação comum.',
      },
      {
        descricao: 'Resolvendo a equação.',
        tex: '9x = 3 \\;\\Rightarrow\\; x = \\frac{3}{9} = \\frac{1}{3}',
      },
    ],
    exemplo: {
      enunciado: 'Qual é a fração geratriz de 0,1666…?',
      passos: dizimaParaFracaoComPassos(0, '1', '6').passos,
    },
    vejaTambem: ['decimais.quando-finito', 'decimais.posicional'],
  },
];
