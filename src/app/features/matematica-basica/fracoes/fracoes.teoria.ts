import { Fracao, resolverComPassos } from '@core/math';
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
];
