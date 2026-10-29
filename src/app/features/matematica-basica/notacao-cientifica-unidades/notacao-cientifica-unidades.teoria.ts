import {
  converterPrefixoComPassos,
  multiplicarNotacaoComPassos,
  paraNotacaoCientificaComPassos,
  prefixoPorSimbolo,
} from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_NOTACAO: readonly Teoria[] = [
  {
    id: 'notacao.cientifica',
    titulo: 'Notação científica',
    resumo: 'Um dígito, uma vírgula e uma potência de dez.',
    definicao:
      'Todo número positivo pode ser escrito como uma mantissa entre 1 e 10 multiplicada por ' +
      'uma potência de dez. A forma é única, e é isso que a torna útil: dois números em ' +
      'notação científica se comparam só pelo expoente.',
    formulas: [
      { tex: 'N = m \\times 10^{n}, \\qquad 1 \\le |m| < 10' },
      {
        tex: 'a \\times 10^{p} \\cdot b \\times 10^{q} = (ab) \\times 10^{p+q}',
        legenda: 'Multiplicar é multiplicar mantissas e somar expoentes.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Mover a vírgula uma casa para a esquerda divide o número por dez.',
        tex: '45\\,000 = 4\\,500 \\times 10',
      },
      {
        descricao: 'Repetindo, cada casa vira um fator dez a mais no expoente.',
        tex: '45\\,000 = 4{,}5 \\times 10^{4}',
        nota: 'O expoente não é um enfeite: ele devolve exatamente o que a vírgula tirou.',
      },
      {
        descricao: 'Em números pequenos a vírgula anda para a direita, e o expoente fica negativo.',
        tex: '0{,}00031 = 3{,}1 \\times 10^{-4}',
      },
    ],
    exemplo: {
      enunciado: 'A velocidade da luz, 299 792 458 m/s, em notação científica.',
      passos: paraNotacaoCientificaComPassos(299792458).passos,
    },
    vejaTambem: ['notacao.unidades', 'notacao.significativos', 'potencias.propriedades'],
  },
  {
    id: 'notacao.unidades',
    titulo: 'Unidades e prefixos do SI',
    resumo: 'Trocar de unidade é só mudar o expoente.',
    definicao:
      'Cada prefixo do SI é uma potência de dez com nome próprio: quilo é 10³, mili é 10⁻³. ' +
      'Converter entre dois prefixos é multiplicar pela potência da diferença dos expoentes — ' +
      'nunca uma conta nova, sempre a mesma.',
    formulas: [
      { tex: '\\text{k} = 10^{3} \\quad \\text{m} = 10^{-3} \\quad \\mu = 10^{-6}' },
      {
        tex: 'v_{\\text{destino}} = v_{\\text{origem}} \\times 10^{\\,e_{\\text{origem}} - e_{\\text{destino}}}',
        legenda: 'A diferença de expoentes diz quantas casas o número anda.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Escrevemos as duas unidades em termos da base.',
        tex: '1\\,\\text{km} = 10^{3}\\,\\text{m} \\qquad 1\\,\\text{mm} = 10^{-3}\\,\\text{m}',
      },
      {
        descricao: 'A razão entre elas é a potência da diferença.',
        tex: '\\frac{10^{3}}{10^{-3}} = 10^{6}',
        nota: 'Um quilômetro tem um milhão de milímetros.',
      },
      {
        descricao: 'Ir de unidade grande para pequena aumenta o número, e vice-versa.',
        tex: '2{,}5\\,\\text{km} = 2{,}5 \\times 10^{6}\\,\\text{mm}',
        nota: 'Se o número encolheu ao trocar por uma unidade menor, o sentido foi invertido.',
      },
    ],
    exemplo: {
      enunciado: 'Converter 2,5 km para metros.',
      passos: converterPrefixoComPassos(2.5, prefixoPorSimbolo('k')!, prefixoPorSimbolo('')!).passos,
    },
    vejaTambem: ['notacao.cientifica', 'notacao.significativos'],
  },
  {
    id: 'notacao.significativos',
    titulo: 'Algarismos significativos',
    resumo: 'Quanto da sua medida é medida, e quanto é ruído.',
    definicao:
      'Algarismos significativos são os dígitos que a medição realmente garante. Zeros à ' +
      'esquerda apenas posicionam a vírgula e não contam; zeros à direita da vírgula contam, ' +
      'porque alguém precisou medir até ali. O resultado de uma conta não pode ter mais ' +
      'precisão do que o dado menos preciso que entrou nela.',
    formulas: [
      { tex: '0{,}00420 \\;\\to\\; 3 \\text{ algarismos significativos}' },
      {
        tex: '1{,}5 \\times 2{,}00 = 3{,}0',
        legenda: 'O produto herda a menor quantidade de significativos.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Zeros à esquerda somem na notação científica — logo, não são significativos.',
        tex: '0{,}00420 = 4{,}20 \\times 10^{-3}',
        nota: 'Sobraram três dígitos: 4, 2 e 0.',
      },
      {
        descricao: 'O zero final sobrevive, porque informa precisão.',
        tex: '4{,}20 \\ne 4{,}2 \\;\\text{como medida}',
        nota: 'O primeiro diz "medi o centésimo e deu zero"; o segundo não mediu o centésimo.',
      },
      {
        descricao: 'Numa multiplicação, a precisão do resultado é a do pior dado.',
        tex: '\\underbrace{1{,}5}_{2} \\times \\underbrace{2{,}00}_{3} = 3{,}0',
        nota: 'Escrever 3,00 alegaria uma precisão que a régua não tinha.',
      },
    ],
    exemplo: {
      enunciado: 'Multiplicando 3 × 10⁸ por 2 × 10⁻³.',
      passos: multiplicarNotacaoComPassos({ mantissa: 3, expoente: 8 }, { mantissa: 2, expoente: -3 })
        .passos,
    },
    vejaTambem: ['notacao.cientifica', 'notacao.unidades'],
  },
];
