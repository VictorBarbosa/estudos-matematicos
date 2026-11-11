import { resolverInequacaoComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

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
  {
    id: 'inequacoes.modelagem',
    titulo: 'Do texto à inequação',
    resumo: '«No máximo», «pelo menos», «a partir de»: a inequação já está no vocabulário.',
    definicao:
      'Quase todo problema de inequação do 1º grau é uma frase com um gasto por unidade, um ' +
      'gasto fixo e um limite. O trabalho não é dividir dos dois lados — é decidir o que é x, ' +
      'o que se repete a cada unidade, o que é cobrado uma vez só e de que lado fica o limite. ' +
      'As palavras do enunciado já dizem o sentido: «no máximo» e «até» fecham a bolinha (≤); ' +
      '«pelo menos» e «a partir de» também fecham (≥); «acima de» e «abaixo de» não fecham ' +
      '(< e >). Trocar uma pela outra é o erro mais comum do tema, e nenhuma conta conserta.',
    formulas: [
      {
        tex: '\\text{total}(x) = (\\text{por unidade}) \\cdot x + \\text{cobrado uma vez}',
        legenda: 'O mesmo modelo de toda situação de orçamento, plano ou capacidade.',
      },
      {
        tex: '\\text{no máximo} \\to \\le \\qquad \\text{pelo menos} \\to \\ge',
        legenda: 'A fronteira ENTRA: o limite é permitido.',
      },
      {
        tex: '\\text{acima de} \\to > \\qquad \\text{abaixo de} \\to <',
        legenda: 'A fronteira NÃO entra: ela é exatamente o valor que não se quer.',
      },
    ],
    demonstracao: [
      {
        descricao:
          'Tenho R$ 60; cada caderno custa R$ 8 e o frete é R$ 4, cobrado uma vez. Chamando de ' +
          'x a quantidade, o gasto é 8x + 4.',
        tex: '8x + 4 \\le 60',
      },
      {
        descricao: '«Cabem no orçamento» é «no máximo o orçamento»: a fronteira entra.',
        tex: '8x \\le 56 \\;\\Rightarrow\\; x \\le 7',
      },
      {
        descricao:
          'A resposta tem de ser lida na grandeza do problema: 7 cadernos, e 8 já estouram ' +
          '(8·8 + 4 = 68 > 60).',
        tex: 'x \\le 7 \\quad \\text{isto é, até 7 cadernos}',
        nota: 'Conferir um valor de cada lado é o teste que pega o sentido trocado.',
      },
    ],
    exemplo: {
      enunciado:
        'Um tanque tem 60 litros e perde 5 litros por hora. Por quantas horas ainda restam ' +
        'pelo menos 20 litros?',
      passos: resolverInequacaoComPassos(-5, 60, '>=', 20).passos,
    },
    vejaTambem: ['inequacoes.conjunto', 'inequacoes.inversao'],
  },
];
