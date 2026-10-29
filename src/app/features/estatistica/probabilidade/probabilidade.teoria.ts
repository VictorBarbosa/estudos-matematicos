import {
  aoMenosUmComPassos,
  probabilidadeComPassos,
  probabilidadeConjuntaComPassos,
} from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_PROBABILIDADE: readonly Teoria[] = [
  {
    id: 'probabilidade.espaco',
    titulo: 'Espaço amostral',
    resumo: 'Probabilidade é contar duas vezes.',
    definicao:
      'No caso equiprovável, a probabilidade é a razão entre os casos favoráveis e os casos ' +
      'possíveis. Por isso probabilidade é, antes de tudo, um problema de contagem — e o erro ' +
      'mais frequente não está na divisão, mas em contar mal um dos dois lados.',
    formulas: [
      { tex: 'P(A) = \\frac{n(A)}{n(\\Omega)}' },
      { tex: '0 \\le P(A) \\le 1' },
      {
        tex: 'P(\\bar{A}) = 1 - P(A)',
        legenda: 'O complementar costuma ser mais fácil de contar.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Se todos os resultados são igualmente prováveis, cada um vale 1/n.',
        tex: 'P(\\text{um resultado}) = \\frac{1}{n(\\Omega)}',
      },
      {
        descricao: 'Um evento é um conjunto de resultados, e suas probabilidades somam.',
        tex: 'P(A) = \\frac{n(A)}{n(\\Omega)}',
      },
      {
        descricao: 'Como A está contido em Ω, a razão nunca passa de 1.',
        tex: 'n(A) \\le n(\\Omega)',
        nota: 'Probabilidade maior que 1 é sinal de erro de contagem, não de sorte.',
      },
    ],
    exemplo: {
      enunciado: 'A probabilidade de tirar um número par num dado de seis faces.',
      passos: probabilidadeComPassos(3, 6).passos,
    },
    vejaTambem: ['probabilidade.independencia', 'probabilidade.complementar', 'combinatoria.combinacao'],
  },
  {
    id: 'probabilidade.independencia',
    titulo: 'Independência e condicional',
    resumo: 'O primeiro evento altera o segundo?',
    definicao:
      'A probabilidade de dois eventos ocorrerem é sempre P(A)·P(B|A). Quando os eventos são ' +
      'independentes, P(B|A) = P(B) e basta multiplicar as duas. Quando não são — retirada ' +
      'sem reposição, por exemplo —, o segundo fator precisa ser recalculado.',
    formulas: [
      { tex: 'P(A \\cap B) = P(A) \\cdot P(B \\mid A)' },
      {
        tex: 'A, B \\text{ independentes} \\;\\Rightarrow\\; P(A \\cap B) = P(A)P(B)',
        legenda: 'Moedas e dados não guardam memória.',
      },
      {
        tex: 'P(A \\cup B) = P(A) + P(B) - P(A \\cap B)',
        legenda: 'Na união, subtrai-se a interseção contada duas vezes.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Para ambos ocorrerem, A ocorre e depois B ocorre dentro do que sobrou.',
        tex: 'P(A \\cap B) = P(A)P(B\\mid A)',
      },
      {
        descricao: 'Sem reposição, o espaço amostral da segunda retirada encolheu.',
        tex: 'P(B\\mid A) \\ne P(B)',
        nota: 'Tirar uma bola vermelha deixa menos vermelhas e menos bolas no total.',
      },
      {
        descricao: 'Com reposição, nada mudou, e os eventos são independentes.',
        tex: 'P(B\\mid A) = P(B)',
      },
    ],
    exemplo: {
      enunciado: 'Duas caras em dois lançamentos de moeda honesta.',
      passos: probabilidadeConjuntaComPassos(0.5, 0.5, true).passos,
    },
    vejaTambem: ['probabilidade.espaco', 'probabilidade.complementar'],
  },
  {
    id: 'probabilidade.complementar',
    titulo: 'A força do complementar',
    resumo: '"Ao menos um" é 1 menos "nenhum".',
    definicao:
      'Contar "ao menos um" caso a caso exige somar muitos cenários. Contar "nenhum" exige um ' +
      'só. Como os dois eventos são complementares, a conta difícil se resolve pela fácil — e ' +
      'essa é a ferramenta mais útil de toda a probabilidade elementar.',
    formulas: [
      { tex: 'P(\\text{ao menos um}) = 1 - P(\\text{nenhum})' },
      { tex: 'P = 1 - (1-p)^{n}' },
    ],
    demonstracao: [
      {
        descricao: 'Ou ocorre ao menos um sucesso, ou não ocorre nenhum: não há terceira opção.',
        tex: 'P(\\text{ao menos um}) + P(\\text{nenhum}) = 1',
      },
      {
        descricao: 'Nenhum sucesso significa falhar em todas as tentativas, independentes.',
        tex: 'P(\\text{nenhum}) = (1-p)^{n}',
      },
      {
        descricao: 'Subtraindo de 1, chega-se ao resultado.',
        tex: 'P = 1 - (1-p)^{n}',
        nota: 'Com n grande, até um evento raro se torna quase certo — a lógica da redundância em engenharia.',
      },
    ],
    exemplo: {
      enunciado: 'Ao menos um seis em três lançamentos de um dado.',
      passos: aoMenosUmComPassos(1 / 6, 3).passos,
    },
    vejaTambem: ['probabilidade.independencia', 'probabilidade.espaco'],
  },
];
