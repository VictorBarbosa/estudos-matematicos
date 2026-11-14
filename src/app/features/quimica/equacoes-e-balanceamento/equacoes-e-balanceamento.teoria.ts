import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_BALANCEAMENTO: readonly Teoria[] = [
  {
    id: 'balanceamento.conservacao',
    titulo: 'Átomos não se criam nem se destroem',
    resumo: 'A reação rearranja; a conta de cada elemento tem de fechar.',
    definicao:
      'Numa reação química os átomos mudam de companhia, não de existência. Se entram quatro ' +
      'hidrogênios, saem quatro hidrogênios — em outra substância, mas os mesmos quatro. É ' +
      'daí que vem a exigência de balancear: uma equação com contas diferentes nos dois lados ' +
      'não descreve reação nenhuma. E é daí que vem a forma de conferir a própria resposta: ' +
      'contar, elemento por elemento, coeficiente vezes índice, nos dois lados.',
    formulas: [
      {
        tex: '\\text{átomos de X à esquerda} = \\text{átomos de X à direita}',
        legenda: 'Para cada elemento X, sem exceção.',
      },
    ],
    demonstracao: [
      {
        descricao: 'A combustão do metano, balanceada.',
        tex: '\\text{CH}_4 + 2\\,\\text{O}_2 \\to \\text{CO}_2 + 2\\,\\text{H}_2\\text{O}',
      },
      {
        descricao: 'O carbono: um de cada lado.',
        tex: 'C: 1 = 1',
      },
      {
        descricao: 'O hidrogênio: quatro no metano, quatro nas duas águas.',
        tex: 'H: 4 = 2 \\times 2',
      },
      {
        descricao: 'O oxigênio: quatro nas duas moléculas, quatro repartidos.',
        tex: 'O: 2 \\times 2 = 2 + 2 \\times 1',
        nota: 'Esta contagem é a prova, e é o que se faz para conferir sem gabarito.',
      },
    ],
    vejaTambem: ['balanceamento.coeficiente', 'esteq.proporcao'],
  },
  {
    id: 'balanceamento.coeficiente',
    titulo: 'Coeficiente e índice não são a mesma coisa',
    resumo: 'O coeficiente diz quantas; o índice diz o que a substância é.',
    definicao:
      'O índice, o número pequeno embaixo, faz parte da identidade da substância: H₂O é água ' +
      'e H₂O₂ é peróxido, que corrói. O coeficiente, o número da frente, diz quantas ' +
      'moléculas daquela substância participam. Balancear é ajustar COEFICIENTES, e mexer num ' +
      'índice para fechar a conta não resolve o problema: troca a reação por outra. ' +
      'O coeficiente 1 não se escreve, mas existe — ele conta na soma e na contagem de ' +
      'átomos.',
    formulas: [
      {
        tex: '2\\,\\text{H}_2\\text{O}',
        legenda: 'Coeficiente 2 (duas moléculas); índice 2 (dois hidrogênios em cada).',
      },
    ],
    demonstracao: [
      {
        descricao: 'Querendo fechar o oxigênio da água, a tentação é mexer no índice.',
        tex: '\\text{H}_2 + \\text{O}_2 \\to \\text{H}_2\\text{O}_2',
        nota: 'A conta fecha, e a química não: isso é peróxido de hidrogênio, não água.',
      },
      {
        descricao: 'O ajuste legítimo é nos coeficientes.',
        tex: '2\\,\\text{H}_2 + \\text{O}_2 \\to 2\\,\\text{H}_2\\text{O}',
      },
      {
        descricao: 'Dobrar tudo também fecha, e por isso a convenção é a forma reduzida.',
        tex: '4\\,\\text{H}_2 + 2\\,\\text{O}_2 \\to 4\\,\\text{H}_2\\text{O}',
        nota: 'Os menores inteiros positivos: é a resposta que se cobra.',
      },
    ],
    vejaTambem: ['balanceamento.conservacao'],
  },
  {
    id: 'balanceamento.sistema',
    titulo: 'Balancear é resolver um sistema',
    resumo: 'Cada elemento dá uma equação; os coeficientes são a solução.',
    definicao:
      'A tentativa e erro funciona nas equações da escola, mas não é o que está acontecendo. ' +
      'Chamando os coeficientes de incógnitas, cada elemento dá uma equação linear — átomos ' +
      'que entram menos átomos que saem, igual a zero — e balancear é resolver esse sistema. ' +
      'Ele é homogêneo, e por isso a solução é única A MENOS DE ESCALA: multiplicar tudo por ' +
      'dois continua resolvendo, e é só por convenção que se usam os menores inteiros. ' +
      'Quando o sistema admite duas soluções independentes, a equação é ambígua de verdade: ' +
      'C + O₂ → CO + CO₂ não tem uma resposta, porque são duas reações ao mesmo tempo.',
    formulas: [
      {
        tex: 'a\\,\\text{C}_3\\text{H}_8 + b\\,\\text{O}_2 \\to c\\,\\text{CO}_2 + d\\,\\text{H}_2\\text{O}',
        legenda: 'Quatro incógnitas, três elementos, uma escala livre.',
      },
    ],
    demonstracao: [
      {
        descricao: 'O carbono liga a com c, e o hidrogênio liga a com d.',
        tex: '3a = c \\qquad 8a = 2d',
      },
      {
        descricao: 'O oxigênio fecha o sistema.',
        tex: '2b = 2c + d',
      },
      {
        descricao: 'Tomando a = 1, tudo se decide.',
        tex: '\\text{C}_3\\text{H}_8 + 5\\,\\text{O}_2 \\to 3\\,\\text{CO}_2 + 4\\,\\text{H}_2\\text{O}',
        nota: 'Se a escolha de a desse fração, multiplicar-se-ia tudo para inteirar.',
      },
    ],
    vejaTambem: ['balanceamento.coeficiente', 'sistemas.metodos'],
  },
];
