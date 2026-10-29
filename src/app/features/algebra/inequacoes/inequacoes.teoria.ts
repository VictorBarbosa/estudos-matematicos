import { resolverInequacaoComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_INEQUACOES: readonly Teoria[] = [
  {
    id: 'inequacoes.conjunto',
    titulo: 'A solução é um intervalo',
    resumo: 'Em vez de um número, um pedaço inteiro da reta.',
    definicao:
      'Uma equação pergunta qual valor torna os dois lados iguais; uma inequação pergunta ' +
      'quais valores tornam um lado maior (ou menor) que o outro. A resposta quase nunca é um ' +
      'número só — é um conjunto, e representá-lo bem faz parte de resolver.',
    formulas: [
      { tex: 'S = \\{x \\in \\mathbb{R} \\mid x > a\\} = (a, +\\infty)' },
      {
        tex: 'S = \\{x \\in \\mathbb{R} \\mid x \\geq a\\} = [a, +\\infty)',
        legenda: 'Colchete inclui a fronteira.',
      },
    ],
    demonstracao: [
      {
        descricao: 'A fronteira é o valor que torna os dois lados iguais.',
        tex: '2x > 6 \\;\\Rightarrow\\; \\text{fronteira em } 2x = 6,\\; x = 3',
      },
      {
        descricao: 'Ela divide a reta em duas partes; basta testar um ponto de cada lado.',
        tex: 'x = 4 \\to 8 > 6 \\;\\checkmark \\qquad x = 0 \\to 0 > 6 \\;\\times',
        nota: 'O lado que passa no teste é o conjunto solução.',
      },
      {
        descricao: 'Com > a fronteira fica de fora; com ≥ ela entra.',
        tex: '(3, +\\infty) \\quad \\text{versus} \\quad [3, +\\infty)',
      },
    ],
    exemplo: {
      enunciado: 'Resolvendo 2x + 1 > 7.',
      passos: resolverInequacaoComPassos(2, 1, '>', 7).passos,
    },
    vejaTambem: ['inequacoes.inversao', 'inequacoes.representacao'],
  },
  {
    id: 'inequacoes.inversao',
    titulo: 'A inversão do sinal',
    resumo: 'Multiplicar ou dividir por negativo vira a desigualdade de lado.',
    definicao:
      'Somar e subtrair preservam a desigualdade. Multiplicar e dividir também — desde que ' +
      'por um número POSITIVO. Por um número negativo, a ordem se inverte, e esquecer disso é ' +
      'de longe o erro mais comum de todo o tema.',
    formulas: [
      { tex: 'a < b \\;\\Longrightarrow\\; a + k < b + k', legenda: 'Soma não afeta o sentido.' },
      { tex: 'a < b \\;\\text{e}\\; k > 0 \\;\\Longrightarrow\\; ak < bk' },
      {
        tex: 'a < b \\;\\text{e}\\; k < 0 \\;\\Longrightarrow\\; ak > bk',
        legenda: 'O sentido se inverte.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Partimos de uma desigualdade verdadeira.',
        tex: '2 < 3',
      },
      {
        descricao: 'Multiplicando por −1, os dois números espelham na reta.',
        tex: '-2 \\quad \\text{e} \\quad -3',
        nota: 'O que estava mais à direita passa a estar mais à esquerda.',
      },
      {
        descricao: 'E a desigualdade correta entre eles é a oposta da inicial.',
        tex: '-2 > -3',
        nota: 'Não é uma regra decorada: é o que a reta numérica mostra.',
      },
    ],
    exemplo: {
      enunciado: 'Resolvendo −2x > 6, onde o sinal se inverte.',
      passos: resolverInequacaoComPassos(-2, 0, '>', 6).passos,
    },
    vejaTambem: ['inequacoes.conjunto', 'inequacoes.representacao'],
  },
  {
    id: 'inequacoes.representacao',
    titulo: 'Representar o conjunto',
    resumo: 'Bolinha vazada exclui; bolinha cheia inclui.',
    definicao:
      'A mesma solução pode ser escrita de três formas: por compreensão, como intervalo e na ' +
      'reta numérica. As três precisam concordar quanto à fronteira — se ela entra ou não no ' +
      'conjunto.',
    formulas: [
      { tex: '\\{x \\mid x \\geq 3\\} = [3, +\\infty)', legenda: 'Bolinha cheia na reta.' },
      { tex: '\\{x \\mid x > 3\\} = (3, +\\infty)', legenda: 'Bolinha vazada na reta.' },
    ],
    demonstracao: [
      {
        descricao: 'Em x ≥ 3, o próprio 3 satisfaz a condição.',
        tex: '3 \\geq 3 \\;\\checkmark',
        nota: 'Por isso ele pertence ao conjunto: colchete e bolinha preenchida.',
      },
      {
        descricao: 'Em x > 3, o 3 não satisfaz.',
        tex: '3 > 3 \\;\\times',
        nota: 'Ele fica de fora: parêntese e bolinha vazada.',
      },
      {
        descricao: 'O infinito nunca é incluído, porque não é um número.',
        tex: '(3, +\\infty) \\quad \\text{e nunca} \\quad (3, +\\infty]',
      },
    ],
    exemplo: {
      enunciado: 'Uma inequação com fronteira incluída.',
      passos: resolverInequacaoComPassos(3, -2, '>=', 7).passos,
    },
    vejaTambem: ['inequacoes.conjunto'],
  },
];
