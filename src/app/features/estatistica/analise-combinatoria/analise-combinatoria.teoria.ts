import { arranjosComPassos, combinacoesComPassos, permutacoesComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_COMBINATORIA: readonly Teoria[] = [
  {
    id: 'combinatoria.multiplicativo',
    titulo: 'Princípio multiplicativo',
    resumo: 'Etapas independentes multiplicam suas opções.',
    definicao:
      'Se uma escolha tem m opções e a seguinte tem n, o total de caminhos é m·n. Esse é o ' +
      'único princípio realmente necessário em combinatória: arranjos, permutações e ' +
      'combinações são todos ele, com ajustes para o que foi contado mais de uma vez.',
    formulas: [
      { tex: 'N = n_1 \\cdot n_2 \\cdot \\ldots \\cdot n_k' },
      { tex: 'A_{n,p} = \\frac{n!}{(n-p)!}' },
    ],
    demonstracao: [
      {
        descricao: 'Para cada opção da primeira etapa, todas as da segunda ficam disponíveis.',
        tex: 'n_1 \\text{ blocos de } n_2 \\text{ caminhos}',
      },
      {
        descricao: 'Somar os blocos é multiplicar.',
        tex: 'N = n_1 \\cdot n_2',
      },
      {
        descricao: 'Em escolhas sem reposição, cada etapa tem uma opção menos.',
        tex: 'n(n-1)(n-2)\\cdots',
        nota: 'É esse encadeamento decrescente que produz o fatorial.',
      },
    ],
    exemplo: {
      enunciado: 'Quantas senhas de 3 dígitos distintos há com 10 algarismos?',
      passos: arranjosComPassos(10, 3).passos,
    },
    vejaTambem: ['combinatoria.combinacao', 'combinatoria.permutacao'],
  },
  {
    id: 'combinatoria.combinacao',
    titulo: 'Quando a ordem não importa',
    resumo: 'Conte com ordem e divida pelas repetições.',
    definicao:
      'A pergunta que decide toda a combinatória é "a ordem importa?". Se importa, pare no ' +
      'arranjo. Se não importa, cada grupo foi contado p! vezes — uma para cada ordem em que ' +
      'seus elementos poderiam aparecer — e é preciso dividir por p!.',
    formulas: [
      { tex: 'C_{n,p} = \\frac{n!}{p!\\,(n-p)!}' },
      {
        tex: 'C_{n,p} = C_{n,\\,n-p}',
        legenda: 'Escolher p é o mesmo que descartar n − p.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Primeiro contamos como se a ordem importasse.',
        tex: 'A_{n,p} = \\frac{n!}{(n-p)!}',
      },
      {
        descricao: 'Cada grupo de p elementos aparece p! vezes nessa contagem.',
        tex: 'p! \\text{ ordens por grupo}',
        nota: 'As mesmas pessoas num comitê são o mesmo comitê, em qualquer ordem.',
      },
      {
        descricao: 'Dividir elimina a repetição.',
        tex: 'C_{n,p} = \\frac{A_{n,p}}{p!}',
      },
      {
        descricao: 'A simetria aparece de graça: escolher quem entra é escolher quem sai.',
        tex: 'C_{n,p} = C_{n,n-p}',
      },
    ],
    exemplo: {
      enunciado: 'De quantos modos escolher 3 pessoas entre 10, sem cargos?',
      passos: combinacoesComPassos(10, 3).passos,
    },
    vejaTambem: ['combinatoria.multiplicativo', 'combinatoria.permutacao', 'probabilidade.espaco'],
  },
  {
    id: 'combinatoria.permutacao',
    titulo: 'Permutações com repetição',
    resumo: 'Elementos iguais não geram ordens novas.',
    definicao:
      'Permutar n elementos distintos dá n! ordens. Quando alguns são iguais, trocá-los de ' +
      'lugar não produz nada novo, e é preciso dividir pelo fatorial de cada grupo repetido. ' +
      'É o mesmo raciocínio das combinações: contar e depois descontar as repetições.',
    formulas: [
      { tex: 'P_n = n!' },
      { tex: 'P = \\frac{n!}{n_1!\\,n_2!\\cdots}' },
    ],
    demonstracao: [
      {
        descricao: 'Com elementos distintos, cada posição esgota uma opção.',
        tex: 'n(n-1)(n-2)\\cdots 1 = n!',
      },
      {
        descricao: 'Se há n₁ cópias de um elemento, suas n₁! trocas internas são invisíveis.',
        tex: 'n_1! \\text{ arranjos idênticos}',
        nota: 'Trocar dois "A" de lugar em ARARA não gera palavra nova.',
      },
      {
        descricao: 'Dividimos por cada grupo de repetidos.',
        tex: 'P = \\frac{n!}{n_1!\\,n_2!\\cdots}',
      },
    ],
    exemplo: {
      enunciado: 'Quantos anagramas tem ARARA (3 A e 2 R)?',
      passos: permutacoesComPassos(5, [3, 2]).passos,
    },
    vejaTambem: ['combinatoria.combinacao', 'combinatoria.multiplicativo'],
  },
];
