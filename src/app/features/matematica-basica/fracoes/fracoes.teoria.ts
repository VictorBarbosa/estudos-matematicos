import { Fracao, decimalParaFracaoComPassos, resolverComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

/**
 * Conteúdo dos popups de teoria deste tópico.
 *
 * Os exemplos não são escritos à mão: saem do mesmo motor que resolve os
 * exercícios, o que garante que a explicação e a correção nunca divirjam.
 */
export const TEORIA_FRACOES: readonly Teoria[] = [
  {
    id: 'fracoes.definicao',
    titulo: 'O que é uma fração',
    resumo: 'Um inteiro dividido em partes iguais, das quais se tomam algumas.',
    definicao:
      'Uma fração a/b indica que um inteiro foi dividido em b partes iguais (o denominador) ' +
      'e que estamos tomando a dessas partes (o numerador). A barra da fração é, literalmente, ' +
      'um sinal de divisão.',
    formulas: [
      {
        tex: '\\frac{a}{b} \\quad\\text{com}\\quad b \\neq 0',
        legenda:
          'a é o numerador: quantas partes tomamos. b é o denominador: em quantas partes o inteiro foi dividido.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Dividir o inteiro em b partes iguais define o tamanho de cada parte.',
        tex: '1 = \\underbrace{\\frac{1}{b} + \\frac{1}{b} + \\cdots + \\frac{1}{b}}_{b \\text{ parcelas}} = \\frac{b}{b}',
        nota: 'É por isso que toda fração com numerador igual ao denominador vale 1.',
      },
      {
        descricao: 'Tomar a dessas partes é somar a parcelas de tamanho 1/b.',
        tex: '\\underbrace{\\frac{1}{b} + \\cdots + \\frac{1}{b}}_{a \\text{ parcelas}} = \\frac{a}{b}',
      },
      {
        descricao: 'O denominador não pode ser zero: não há como dividir algo em zero partes.',
        tex: '\\frac{a}{0} \\quad \\text{é indefinido}',
      },
    ],
    exemplo: {
      enunciado:
        'Uma pizza cortada em 4 fatias iguais, das quais 3 foram servidas, corresponde a 3/4 da pizza.',
      passos: [
        {
          descricao: 'Cada fatia é uma das 4 partes iguais.',
          tex: '1 \\text{ fatia} = \\frac{1}{4} \\text{ da pizza}',
        },
        {
          descricao: 'Três fatias são três dessas partes.',
          tex: '3 \\times \\frac{1}{4} = \\frac{3}{4} = 0{,}75',
        },
      ],
    },
    vejaTambem: ['fracoes.simplificacao', 'fracoes.operacoes'],
  },

  {
    id: 'fracoes.simplificacao',
    titulo: 'Equivalência e simplificação',
    resumo: 'Multiplicar ou dividir os dois termos pelo mesmo número não muda o valor.',
    definicao:
      'Duas frações são equivalentes quando representam a mesma quantidade, ainda que escritas ' +
      'com números diferentes. Simplificar é reescrever a fração com os menores números possíveis, ' +
      'dividindo numerador e denominador pelo mdc entre eles. O resultado é a forma irredutível.',
    formulas: [
      {
        tex: '\\frac{a}{b} = \\frac{a \\cdot k}{b \\cdot k} \\quad (k \\neq 0)',
        legenda: 'Multiplicar os dois termos pelo mesmo fator preserva o valor.',
      },
      {
        tex: '\\frac{a}{b} = \\frac{a \\div d}{b \\div d} \\quad \\text{com } d = \\operatorname{mdc}(a, b)',
        legenda: 'Dividir pelo mdc leva direto à forma irredutível, em um único passo.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Multiplicar por 1 nunca altera um número.',
        tex: '\\frac{a}{b} = \\frac{a}{b} \\times 1',
      },
      {
        descricao: 'E o número 1 pode ser escrito como k/k, para qualquer k diferente de zero.',
        tex: '\\frac{a}{b} \\times \\frac{k}{k} = \\frac{a \\cdot k}{b \\cdot k}',
        nota: 'Daí a equivalência: só mudamos a forma de escrever, não a quantidade.',
      },
      {
        descricao: 'Lendo a mesma igualdade da direita para a esquerda, obtemos a simplificação.',
        tex: '\\frac{a \\cdot k}{b \\cdot k} = \\frac{a}{b}',
        nota: 'Dividir por k desfaz exatamente o que a multiplicação por k fez.',
      },
    ],
    exemplo: {
      enunciado: 'Simplificar 18/24.',
      passos: [
        {
          descricao: 'Procuramos o maior divisor comum entre 18 e 24.',
          tex: '\\operatorname{mdc}(18, 24) = 6',
          nota: '18 = 2 · 3² e 24 = 2³ · 3; os fatores comuns com o menor expoente dão 2 · 3 = 6.',
        },
        {
          descricao: 'Dividimos os dois termos por 6.',
          tex: '\\frac{18 \\div 6}{24 \\div 6} = \\frac{3}{4}',
          nota: 'Como mdc(3, 4) = 1, não há mais o que simplificar.',
        },
      ],
    },
    vejaTambem: ['fracoes.definicao', 'fracoes.mmc'],
  },

  {
    id: 'fracoes.mmc',
    titulo: 'Denominador comum e MMC',
    resumo: 'Só se somam partes do mesmo tamanho — o MMC dá o menor tamanho que serve às duas.',
    definicao:
      'O mínimo múltiplo comum de dois denominadores é o menor número que é múltiplo de ambos. ' +
      'Ele é o menor denominador capaz de representar as duas frações ao mesmo tempo, o que é ' +
      'exatamente o que a soma e a subtração exigem.',
    formulas: [
      {
        tex: '\\operatorname{mmc}(a, b) = \\frac{a \\cdot b}{\\operatorname{mdc}(a, b)}',
        legenda: 'O produto conta os fatores comuns duas vezes; dividir pelo mdc corrige isso.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Fatoramos cada denominador em números primos.',
        tex: '12 = 2^{2} \\cdot 3 \\qquad 18 = 2 \\cdot 3^{2}',
      },
      {
        descricao: 'O MMC toma cada primo com o maior expoente que aparece em qualquer um deles.',
        tex: '\\operatorname{mmc}(12, 18) = 2^{2} \\cdot 3^{2} = 36',
        nota:
          'Com o maior expoente, o resultado é divisível por ambos; com qualquer expoente menor, ' +
          'deixaria de ser múltiplo de um dos dois.',
      },
      {
        descricao: 'O produto dos denominadores também serviria, mas não é o menor.',
        tex: '12 \\cdot 18 = 216 = 6 \\cdot 36',
        nota:
          'Usar 216 dá a resposta certa, só que com números seis vezes maiores e mais trabalho ' +
          'de simplificação no fim.',
      },
    ],
    exemplo: {
      enunciado: 'Por que 1/4 + 1/6 precisa de denominador 12?',
      passos: resolverComPassos(Fracao.criar(1, 4), 'somar', Fracao.criar(1, 6)).passos,
    },
    vejaTambem: ['fracoes.operacoes', 'fracoes.simplificacao'],
  },

  {
    id: 'fracoes.operacoes',
    titulo: 'As quatro operações',
    resumo: 'Somar exige partes iguais; multiplicar e dividir, não.',
    definicao:
      'Na adição e na subtração, as frações precisam ter o mesmo denominador, porque só se somam ' +
      'partes do mesmo tamanho. Na multiplicação, multiplicam-se numeradores e denominadores em ' +
      'linha. Na divisão, multiplica-se pelo inverso da segunda fração.',
    formulas: [
      {
        tex: '\\frac{a}{b} \\pm \\frac{c}{d} = \\frac{a \\cdot d \\pm c \\cdot b}{b \\cdot d}',
        legenda:
          'Com o MMC no lugar de b · d, os números ficam menores, mas o resultado é o mesmo.',
      },
      {
        tex: '\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\cdot c}{b \\cdot d}',
      },
      {
        tex: '\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}',
      },
    ],
    demonstracao: [
      {
        descricao: 'Com o mesmo denominador, somar frações é contar parcelas de tamanho 1/b.',
        tex: '\\frac{a}{b} + \\frac{c}{b} = (a + c) \\times \\frac{1}{b} = \\frac{a + c}{b}',
        nota: 'O denominador permanece: o tamanho das partes não mudou, só a quantidade delas.',
      },
      {
        descricao:
          'Multiplicar por 1/d significa dividir em d partes; por isso os denominadores se multiplicam.',
        tex: '\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\cdot c}{b \\cdot d}',
        nota: 'Tomar 2/3 de 3/4 é dividir os 3/4 em 3 partes e pegar 2 delas.',
      },
      {
        descricao: 'Dividir por c/d é multiplicar pelo inverso, porque o produto dos dois dá 1.',
        tex: '\\frac{c}{d} \\times \\frac{d}{c} = \\frac{c \\cdot d}{d \\cdot c} = 1',
        nota:
          'Multiplicar pelo inverso desfaz a multiplicação, exatamente como dividir desfaz ' +
          'multiplicar entre números inteiros.',
      },
    ],
    exemplo: {
      enunciado: 'Quanto é 2/3 ÷ 4/9?',
      passos: resolverComPassos(Fracao.criar(2, 3), 'dividir', Fracao.criar(4, 9)).passos,
    },
    vejaTambem: ['fracoes.mmc', 'fracoes.simplificacao'],
  },
  {
    id: 'fracoes.soma',
    titulo: 'Somar frações',
    resumo: 'Só se somam partes do mesmo tamanho.',
    definicao:
      'Somar frações é juntar quantidades, e isso só funciona quando as partes têm o mesmo ' +
      'tamanho. Com denominadores iguais, basta somar os numeradores: o denominador diz o ' +
      'tamanho da parte, e ele não muda ao juntar. Com denominadores diferentes, é preciso ' +
      'primeiro reescrever as duas frações com um denominador comum — e é só aí que a soma faz ' +
      'sentido.',
    formulas: [
      { tex: '\\frac{a}{c} + \\frac{b}{c} = \\frac{a + b}{c}', legenda: 'Mesmo denominador.' },
      {
        tex: '\\frac{a}{b} + \\frac{c}{d} = \\frac{a \\cdot d + c \\cdot b}{b \\cdot d}',
        legenda: 'Denominadores diferentes; com o MMC, os números ficam menores.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Com partes iguais, somar é contar: três quintos mais um quinto são quatro quintos.',
        tex: '\\frac{3}{5} + \\frac{1}{5} = \\frac{4}{5}',
      },
      {
        descricao: 'Com partes diferentes, não dá para contar antes de igualar os tamanhos.',
        tex: '\\frac{1}{2} + \\frac{1}{3} = \\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}',
        nota:
          'Somar numerador com numerador e denominador com denominador daria 2/5, que é MENOR ' +
          'que 1/2 — impossível, já que somamos algo positivo.',
      },
    ],
    exemplo: {
      enunciado: 'Quanto é 1/4 + 1/6?',
      passos: resolverComPassos(Fracao.criar(1, 4), 'somar', Fracao.criar(1, 6)).passos,
    },
    vejaTambem: ['fracoes.mmc', 'fracoes.subtracao', 'fracoes.simplificacao'],
  },
  {
    id: 'fracoes.subtracao',
    titulo: 'Subtrair frações',
    resumo: 'A mesma regra da soma, com atenção ao sinal.',
    definicao:
      'Subtrair segue a soma: iguala-se o denominador e subtraem-se os numeradores. A diferença ' +
      'está em duas coisas. Primeira, a ordem importa — 1/4 − 3/4 não é o mesmo que 3/4 − 1/4. ' +
      'Segunda, o resultado pode ser negativo, e isso não é erro: é um ponto à esquerda do zero ' +
      'na reta numérica.',
    formulas: [
      { tex: '\\frac{a}{c} - \\frac{b}{c} = \\frac{a - b}{c}' },
      {
        tex: '\\frac{a}{b} - \\frac{c}{d} = \\frac{a}{b} + \\left(-\\frac{c}{d}\\right)',
        legenda: 'Subtrair é somar o oposto — por isso as duas regras são a mesma.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Igualamos os denominadores, como na soma.',
        tex: '\\frac{3}{4} - \\frac{1}{6} = \\frac{9}{12} - \\frac{2}{12}',
      },
      {
        descricao: 'Subtraímos os numeradores e mantemos o denominador.',
        tex: '= \\frac{7}{12}',
      },
      {
        descricao: 'Invertendo a ordem, o resultado é o oposto.',
        tex: '\\frac{1}{6} - \\frac{3}{4} = -\\frac{7}{12}',
        nota: 'O sinal negativo pertence à fração inteira, não só ao numerador.',
      },
    ],
    exemplo: {
      enunciado: 'Quanto é 2/3 − 5/6?',
      passos: resolverComPassos(Fracao.criar(2, 3), 'subtrair', Fracao.criar(5, 6)).passos,
    },
    vejaTambem: ['fracoes.soma', 'fracoes.mmc'],
  },
  {
    id: 'fracoes.multiplicacao',
    titulo: 'Multiplicar frações',
    resumo: 'Em linha, e sem igualar denominadores.',
    definicao:
      'Multiplicar é a operação mais simples das quatro: numerador com numerador, denominador ' +
      'com denominador. Não se iguala denominador nenhum — igualar é exigência da soma, e aqui ' +
      'só atrapalha. O significado ajuda a lembrar: 2/3 × 3/4 é "dois terços DE três quartos", ' +
      'isto é, dividir os 3/4 em três partes e tomar duas.',
    formulas: [
      { tex: '\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\cdot c}{b \\cdot d}' },
      {
        tex: '\\frac{a}{b} \\times \\frac{c}{d} \\;\\Rightarrow\\; \\text{simplificar em cruz antes de multiplicar}',
        legenda: 'Cortar fatores comuns antes deixa os números pequenos.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Multiplicar por 1/d é dividir em d partes iguais.',
        tex: '\\frac{3}{4} \\times \\frac{1}{3} = \\frac{3}{12} = \\frac{1}{4}',
      },
      {
        descricao: 'Por isso os denominadores se multiplicam, em linha.',
        tex: '\\frac{2}{3} \\times \\frac{3}{4} = \\frac{6}{12} = \\frac{1}{2}',
        nota:
          'Multiplicar em cruz — numerador de uma pelo denominador da outra — é o procedimento ' +
          'da DIVISÃO, e aqui daria outro número.',
      },
      {
        descricao: 'Multiplicar por uma fração menor que 1 DIMINUI o valor.',
        tex: '\\frac{1}{2} \\times \\frac{1}{2} = \\frac{1}{4}',
        nota: 'É o que mais surpreende quem vem dos inteiros, onde multiplicar costuma aumentar.',
      },
    ],
    exemplo: {
      enunciado: 'Quanto é 2/5 × 10/3?',
      passos: resolverComPassos(Fracao.criar(2, 5), 'multiplicar', Fracao.criar(10, 3)).passos,
    },
    vejaTambem: ['fracoes.divisao', 'fracoes.simplificacao'],
  },
  {
    id: 'fracoes.divisao',
    titulo: 'Dividir frações',
    resumo: 'Multiplicar pelo inverso do divisor.',
    definicao:
      'Dividir por uma fração é multiplicar pelo inverso dela. Isso não é truque: o inverso de ' +
      'c/d é o número que, multiplicado por c/d, dá 1 — e dividir é exatamente desfazer uma ' +
      'multiplicação. Quem se inverte é sempre o divisor, a segunda fração.',
    formulas: [
      { tex: '\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}' },
      {
        tex: '\\frac{c}{d} \\times \\frac{d}{c} = 1',
        legenda: 'A razão de ser da regra: o inverso é quem devolve 1.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Perguntar 3/4 ÷ 1/8 é perguntar quantos oitavos cabem em três quartos.',
        tex: '\\frac{3}{4} \\div \\frac{1}{8} = \\frac{3}{4} \\times \\frac{8}{1} = 6',
        nota: 'Cabem seis — e o resultado é MAIOR que o número de partida.',
      },
      {
        descricao: 'Dividir por um número menor que 1 aumenta o valor.',
        tex: '2 \\div \\frac{1}{2} = 2 \\times 2 = 4',
      },
      {
        descricao: 'Inverter a primeira fração, e não o divisor, dá outro número.',
        tex: '\\frac{2}{3} \\div \\frac{4}{5} = \\frac{2}{3} \\times \\frac{5}{4} = \\frac{5}{6}',
      },
    ],
    exemplo: {
      enunciado: 'Quanto é 3/8 ÷ 9/4?',
      passos: resolverComPassos(Fracao.criar(3, 8), 'dividir', Fracao.criar(9, 4)).passos,
    },
    vejaTambem: ['fracoes.multiplicacao', 'fracoes.operacoes'],
  },
  {
    id: 'fracoes.mistas',
    titulo: 'Números mistos',
    resumo: 'Duas escritas para a mesma quantidade.',
    definicao:
      'Um número misto junta a parte inteira e a fração que sobra: 7/3 são dois inteiros e um ' +
      'terço, escritos 2 1/3. É a forma em que a quantidade se diz em voz alta e a que aparece ' +
      'em receita, régua e planta baixa. Para calcular, porém, converte-se o misto em fração ' +
      'imprópria — operar com a parte inteira solta é onde o erro aparece.',
    formulas: [
      {
        tex: 'n\\frac{a}{b} = \\frac{n \\cdot b + a}{b}',
        legenda: 'Do misto para a fração imprópria: é com ela que se calcula.',
      },
      {
        tex: '-n\\frac{a}{b} = -\\frac{n \\cdot b + a}{b}',
        legenda: 'O sinal vale para o número inteiro, não só para a parte inteira.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Dois inteiros são seis terços; mais um terço, sete.',
        tex: '2\\frac{1}{3} = \\frac{2 \\cdot 3 + 1}{3} = \\frac{7}{3}',
      },
      {
        descricao: 'No caminho de volta, a divisão com resto separa as duas partes.',
        tex: '\\frac{7}{3} \\;\\Rightarrow\\; 7 \\div 3 = 2 \\text{ resto } 1 \\;\\Rightarrow\\; 2\\frac{1}{3}',
      },
      {
        descricao: 'Com sinal, o inteiro inteiro é que fica negativo.',
        tex: '-2\\frac{1}{3} = -\\frac{7}{3} \\neq -2 + \\frac{1}{3}',
        nota:
          'Este é o erro clássico: somar a fração em vez de subtraí-la daria −5/3, que está a ' +
          'uma distância diferente do zero.',
      },
    ],
    exemplo: {
      enunciado: 'Somando 2 1/3 com 1 1/2, ou seja, 7/3 + 3/2.',
      passos: resolverComPassos(Fracao.criar(7, 3), 'somar', Fracao.criar(3, 2)).passos,
    },
    vejaTambem: ['fracoes.definicao', 'fracoes.soma', 'fracoes.simplificacao'],
  },
  {
    id: 'fracoes.decimais',
    titulo: 'De decimal para fração',
    resumo: 'A última casa diz o denominador.',
    definicao:
      'Todo decimal finito já é uma fração escrita de outro jeito: o que a vírgula faz é dizer ' +
      'em quantas partes o inteiro foi dividido. Uma casa são décimos, duas são centésimos, ' +
      'três são milésimos — então 0,75 são 75 centésimos, ou 75/100. O denominador é 10 elevado ' +
      'ao número de casas; o numerador são os dígitos sem a vírgula. Depois é só simplificar, e ' +
      'a conta acaba.',
    formulas: [
      {
        tex: '0{,}d_1d_2\\ldots d_n = \\frac{d_1d_2\\ldots d_n}{10^{n}}',
        legenda: 'n é o número de casas depois da vírgula.',
      },
      {
        tex: '0{,}75 = \\frac{75}{100} = \\frac{3}{4}',
        legenda: 'A forma irredutível é a resposta pedida.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Contamos as casas para achar o denominador.',
        tex: '0{,}375 \\;\\Rightarrow\\; 3 \\text{ casas} \\;\\Rightarrow\\; 10^{3} = 1000',
      },
      {
        descricao: 'Os dígitos, sem a vírgula, são o numerador.',
        tex: '0{,}375 = \\frac{375}{1000}',
        nota: 'O denominador NÃO é sempre 10: é 10 elevado ao número de casas.',
      },
      {
        descricao: 'Simplificamos pelo mdc até a forma irredutível.',
        tex: '\\frac{375 \\div 125}{1000 \\div 125} = \\frac{3}{8}',
      },
      {
        descricao: 'Com parte inteira, ela permanece — e o sinal vale para tudo.',
        tex: '-1{,}25 = -\\frac{125}{100} = -\\frac{5}{4}',
        nota:
          'Inverter o número não é convertê-lo: 0,25 vira 1/4 por simplificação, não por ' +
          'dividir 1 por 0,25 — que daria 4.',
      },
    ],
    exemplo: {
      enunciado: 'Escrevendo 0,875 como fração irredutível.',
      passos: decimalParaFracaoComPassos(0.875).passos,
    },
    vejaTambem: ['fracoes.simplificacao', 'fracoes.definicao', 'decimais.quando-finito'],
  },
];
