import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_ELETRONS: readonly Teoria[] = [
  {
    id: 'eletrons.ordem',
    titulo: 'A ordem é de energia, não de número',
    resumo: 'O 4s vem antes do 3d, e é isso que o diagrama diz.',
    definicao:
      'Os elétrons ocupam os subníveis do mais baixo para o mais alto em ENERGIA. Acontece ' +
      'que a energia do 4s é menor que a do 3d, e por isso o 4s se preenche primeiro, embora ' +
      'o número da camada seja maior. A regra diagonal — o diagrama de Linus Pauling — é só ' +
      'um jeito de ler essa ordem num desenho, e não uma lei à parte. Quem preenche na ordem ' +
      'dos números erra todos os elementos do quarto período, e erra sempre, não por ' +
      'descuido: está usando a regra errada.',
    formulas: [
      {
        tex: '1s\;2s\;2p\;3s\;3p\;4s\;3d\;4p\;5s\;4d\;5p\;6s',
        legenda: 'A ordem de preenchimento. Note o 4s antes do 3d.',
      },
      {
        tex: 's: 2 \\qquad p: 6 \\qquad d: 10 \\qquad f: 14',
        legenda: 'Quanto cada subnível cabe. Caber não é ter.',
      },
    ],
    demonstracao: [
      {
        descricao: 'O potássio tem 19 elétrons.',
        tex: 'Z = 19',
      },
      {
        descricao: 'Depois do 3p, o próximo é o 4s — e não o 3d.',
        tex: '1s^{2}\;2s^{2}\;2p^{6}\;3s^{2}\;3p^{6}\;4s^{1}',
        nota: 'O 3d do potássio está VAZIO, e zero também é resposta.',
      },
      {
        descricao: 'O 3d só começa no escândio, o elemento seguinte.',
        tex: '\\text{Sc}: \\ldots\;4s^{2}\;3d^{1}',
      },
    ],
    vejaTambem: ['eletrons.camadas', 'eletrons.valencia'],
  },
  {
    id: 'eletrons.camadas',
    titulo: 'Camadas, subníveis e o período',
    resumo: 'A camada reúne subníveis; o número de camadas é o período.',
    definicao:
      'Camada e subnível não são a mesma contagem. A camada é o valor de n, e reúne vários ' +
      'subníveis: a camada 2 tem o 2s e o 2p, oito elétrons quando cheia. Contar subníveis no ' +
      'lugar de camadas dá um número maior e errado. O número de camadas OCUPADAS é o período ' +
      'do elemento na tabela — a tabela periódica não é uma lista arbitrária, é o desenho da ' +
      'distribuição eletrônica.',
    formulas: [
      {
        tex: '\\text{capacidade da camada} = 2n^2',
        legenda: 'Quanto a camada cabe; a última quase nunca está cheia.',
      },
    ],
    demonstracao: [
      {
        descricao: 'O cloro, com 17 elétrons, distribuído.',
        tex: '1s^{2}\;2s^{2}\;2p^{6}\;3s^{2}\;3p^{5}',
      },
      {
        descricao: 'Juntando por camada: 2, 8 e 7.',
        tex: 'n=1: 2 \\qquad n=2: 8 \\qquad n=3: 7',
        nota: 'Cinco subníveis, três camadas: as duas contagens são diferentes.',
      },
      {
        descricao: 'Três camadas ocupadas, terceiro período.',
        tex: '\\text{período} = 3',
        nota: 'A camada 3 cabe 18 e tem 7: capacidade não é ocupação.',
      },
    ],
    vejaTambem: ['eletrons.ordem', 'eletrons.valencia'],
  },
  {
    id: 'eletrons.valencia',
    titulo: 'A última camada explica a química',
    resumo: 'Elementos de última camada parecida reagem parecido.',
    definicao:
      'O que um átomo faz numa reação depende dos elétrons mais externos: são eles que se ' +
      'encontram com os outros átomos. Daí a regularidade da tabela: sódio e potássio têm um ' +
      'elétron na última camada e reagem do mesmo jeito; flúor e cloro têm sete e também. Os ' +
      'gases nobres têm a última camada completa, e é por isso que quase não reagem — não por ' +
      'nobreza, por não ter o que ganhar. Cuidado com a confusão mais comum: a contagem da ' +
      'última camada não é o número atômico, que conta TODOS os elétrons.',
    formulas: [
      {
        tex: '\\text{Na}: 2\\,|\\,8\\,|\\,1 \\qquad \\text{K}: 2\\,|\\,8\\,|\\,8\\,|\\,1',
        legenda: 'Camadas diferentes, última camada igual: química igual.',
      },
    ],
    demonstracao: [
      {
        descricao: 'O neônio fecha a segunda camada com oito.',
        tex: '1s^{2}\;2s^{2}\;2p^{6}',
      },
      {
        descricao: 'O sódio tem um elétron a mais, sozinho numa camada nova.',
        tex: '1s^{2}\;2s^{2}\;2p^{6}\;3s^{1}',
        nota: 'Perder esse elétron deixa o sódio com a configuração do neônio — e é o que ele faz.',
      },
      {
        descricao: 'O cloro está a um elétron de fechar.',
        tex: '\\ldots\;3s^{2}\;3p^{5}',
        nota: 'Um quer dar, o outro quer receber: é daí que sai o NaCl.',
      },
    ],
    vejaTambem: ['eletrons.camadas', 'atomo.ions'],
  },
];
