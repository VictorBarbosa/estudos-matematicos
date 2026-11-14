import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_MOL: readonly Teoria[] = [
  {
    id: 'mol.conceito',
    titulo: 'O mol: a ponte entre pesar e contar',
    resumo: 'Uma reação acontece entre partículas; a balança mede gramas. O mol traduz.',
    definicao:
      'Uma reação química acontece entre PARTÍCULAS, numa proporção de contagem: dois ' +
      'hidrogênios para um oxigênio. Mas ninguém conta átomos — pesa-se. O mol é a unidade ' +
      'que traduz uma coisa na outra, e é por isso que ele é o conceito central da química, e ' +
      'não um detalhe de unidade. Um mol de qualquer substância tem o mesmo número de ' +
      'partículas; o que muda de uma para outra é quanto esse punhado pesa.',
    formulas: [
      { tex: 'n = \\frac{m}{M}', legenda: 'Quantos mols cabem numa massa.' },
      { tex: 'm = n \\cdot M', legenda: 'A mesma relação, lida ao contrário.' },
    ],
    demonstracao: [
      {
        descricao: 'A massa molar da água é 18 g/mol: um mol de água pesa 18 g.',
        tex: 'M = 18{,}02\;\\text{g/mol}',
      },
      {
        descricao: 'Numa amostra de 36 g cabem dois desses punhados.',
        tex: 'n = \\frac{36{,}03}{18{,}02} = 2\;\\text{mol}',
      },
      {
        descricao: 'E dois mols de água pesam o dobro de um.',
        tex: 'm = 2 \\times 18{,}02 = 36{,}03\;\\text{g}',
        nota: 'A divisão e a multiplicação são a mesma relação, lida nos dois sentidos.',
      },
    ],
    vejaTambem: ['mol.massa-molar', 'mol.avogadro'],
  },
  {
    id: 'mol.massa-molar',
    titulo: 'Massa molar: a soma pesada pelos índices',
    resumo: 'Some as massas atômicas da fórmula — cada uma vezes o seu índice.',
    definicao:
      'A massa molar de uma substância é a soma das massas atômicas dos seus elementos, cada ' +
      'uma multiplicada pelo índice que aparece na fórmula. O índice não é enfeite: ele conta ' +
      'ÁTOMOS, e cada átomo pesa. Ignorá-lo é o erro número um do tópico — quem o comete ' +
      'acerta na água, onde o índice do oxigênio é 1, e erra em tudo o mais.',
    formulas: [
      { tex: 'M = \\sum (\\text{massa atômica}) \\times (\\text{índice})', legenda: 'A regra.' },
      {
        tex: 'M(\\text{CO}_2) = 12{,}01 + 2 \\times 16{,}00 = 44{,}01',
        legenda: 'Dois oxigênios, e por isso o 16 entra duas vezes.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Cada elemento entra com a sua massa atômica.',
        tex: '\\text{C}: 12{,}01 \\qquad \\text{O}: 16{,}00',
      },
      {
        descricao: 'O índice do oxigênio é 2, então ele entra duas vezes.',
        tex: '2 \\times 16{,}00 = 32{,}00',
      },
      {
        descricao: 'A soma é a massa molar.',
        tex: '12{,}01 + 32{,}00 = 44{,}01\;\\text{g/mol}',
        nota: 'Somar 12,01 + 16,00 daria 28,01 — o erro clássico, que esquece o índice.',
      },
    ],
    vejaTambem: ['mol.conceito', 'atomo.massa-media'],
  },
  {
    id: 'mol.avogadro',
    titulo: 'O número de Avogadro',
    resumo: 'Por que 6,022 × 10²³, e não um número redondo.',
    definicao:
      'Um mol contém 6,022 × 10²³ partículas. O número parece arbitrário e não é: ele é a ' +
      'quantidade de partículas cuja massa, em GRAMAS, dá o mesmo valor que a massa de uma ' +
      'partícula em unidades atômicas. É esse acordo que faz a massa molar sair pronta da ' +
      'tabela periódica, sem fator de conversão nenhum. E ele é grande porque a unidade de ' +
      'massa que escolhemos — o grama — é enorme comparada a um átomo.',
    formulas: [
      { tex: 'N_A = 6{,}022 \\times 10^{23}\;\\text{mol}^{-1}', legenda: 'A constante.' },
      { tex: 'N = n \\cdot N_A', legenda: 'Mais mols, mais partículas: a quantidade multiplica.' },
    ],
    demonstracao: [
      {
        descricao: 'Um mol de água tem o número de Avogadro de moléculas.',
        tex: 'N = 1 \\times 6{,}022 \\times 10^{23}',
      },
      {
        descricao: 'Dois mols têm o dobro.',
        tex: 'N = 2 \\times 6{,}022 \\times 10^{23} = 1{,}2044 \\times 10^{24}',
        nota: 'A potência só muda quando o coeficiente passa de 10.',
      },
      {
        descricao: 'E essas duas moléculas pesam 36 g, que a balança mede.',
        tex: 'm = 2 \\times 18{,}02 = 36{,}03\;\\text{g}',
        nota: 'É a tradução completa: da contagem impossível para a massa possível.',
      },
    ],
    vejaTambem: ['mol.conceito'],
  },
];
