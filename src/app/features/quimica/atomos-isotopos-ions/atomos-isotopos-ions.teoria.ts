import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_ATOMOS: readonly Teoria[] = [
  {
    id: 'atomo.particulas',
    titulo: 'Prótons, nêutrons e elétrons',
    resumo: 'Quem conta para a identidade, quem conta para a massa e quem conta para a carga.',
    definicao:
      'Um átomo tem três contagens que respondem a três perguntas diferentes. Os prótons dizem ' +
      'QUAL elemento é — mudar essa contagem muda o elemento. Prótons e nêutrons juntos dizem ' +
      'quanto ele PESA, porque o elétron tem massa cerca de 1 800 vezes menor e some na conta. ' +
      'E a diferença entre prótons e elétrons diz a CARGA. Separar as três é o que torna o ' +
      'resto da química aritmética simples.',
    formulas: [
      {
        tex: 'Z = p',
        legenda: 'Número atômico: a contagem de prótons, e a identidade do elemento.',
      },
      { tex: 'A = p + n', legenda: 'Número de massa: o elétron não entra.' },
      { tex: 'n = A - Z', legenda: 'Os nêutrons são o que sobra.' },
    ],
    demonstracao: [
      {
        descricao: 'O ferro-56 tem Z = 26, então tem 26 prótons.',
        tex: 'Z = 26 \\;\\Rightarrow\\; p = 26',
      },
      {
        descricao: 'O número de massa 56 conta prótons e nêutrons juntos.',
        tex: 'n = A - Z = 56 - 26 = 30',
      },
      {
        descricao: 'Sendo neutro, há um elétron para cada próton.',
        tex: 'e = p = 26',
        nota: 'A massa do elétron é ~1/1836 da do próton: por isso ele não entra em A.',
      },
    ],
    vejaTambem: ['atomo.isotopos', 'atomo.ions'],
  },
  {
    id: 'atomo.isotopos',
    titulo: 'Isótopos: o mesmo elemento, massas diferentes',
    resumo: 'Mudar nêutrons não muda o elemento — muda só a massa.',
    definicao:
      'Isótopos são átomos do mesmo elemento com números de nêutrons diferentes. Como é o ' +
      'próton que define o elemento, trocar nêutrons não transforma carbono em nitrogênio: ' +
      'produz outro carbono, mais pesado. É por isso que existe carbono-12 e carbono-14, e por ' +
      'que os dois se comportam igual numa reação química — a química acontece nos elétrons, ' +
      'e eles não mudaram.',
    formulas: [
      { tex: '^{12}_{6}\\text{C} \\qquad ^{14}_{6}\\text{C}', legenda: 'Mesmo Z, A diferente.' },
      { tex: 'n_{12} = 6 \\qquad n_{14} = 8', legenda: 'A diferença está toda nos nêutrons.' },
    ],
    demonstracao: [
      {
        descricao: 'Os dois têm o mesmo número atômico.',
        tex: 'Z = 6 \\;\\Rightarrow\\; \\text{ambos são carbono}',
      },
      {
        descricao: 'As contagens de nêutrons diferem.',
        tex: '12 - 6 = 6 \\qquad 14 - 6 = 8',
      },
      {
        descricao: 'Os elétrons são os mesmos, e é por isso que a química é a mesma.',
        tex: 'e = 6 \\quad \\text{nos dois}',
        nota: 'O que difere é a massa — e, no caso do carbono-14, a estabilidade do núcleo.',
      },
    ],
    vejaTambem: ['atomo.particulas', 'atomo.massa-media'],
  },
  {
    id: 'atomo.ions',
    titulo: 'Íons: a carga é um desequilíbrio',
    resumo: 'Carga positiva é elétron que falta; negativa é elétron a mais.',
    definicao:
      'Um íon é um átomo que ganhou ou perdeu elétrons. O sinal engana quem está começando: ' +
      'carga POSITIVA não significa «tem mais alguma coisa», significa que falta elétron — ' +
      'sobrou próton sem par. Por isso a carga entra SUBTRAINDO na contagem de elétrons. O ' +
      'número de prótons nunca muda num íon: mudá-lo seria mudar o elemento.',
    formulas: [
      { tex: 'e = Z - q', legenda: 'q é a carga, com sinal. Cátion tem q > 0.' },
      { tex: '\\text{Ca}^{2+}: e = 20 - 2 = 18', legenda: 'Perdeu dois elétrons.' },
      { tex: '\\text{Cl}^{-}: e = 17 - (-1) = 18', legenda: 'Ganhou um.' },
    ],
    demonstracao: [
      {
        descricao: 'O cálcio tem 20 prótons, e o íon continua tendo 20.',
        tex: 'Z = 20 \\;\\Rightarrow\\; p = 20',
        nota: 'Mudar a contagem de prótons mudaria o elemento, não a carga.',
      },
      {
        descricao: 'A carga 2+ diz que faltam dois elétrons.',
        tex: 'e = 20 - 2 = 18',
      },
      {
        descricao: 'O cloreto, vindo do outro lado, chega à mesma contagem.',
        tex: 'e = 17 + 1 = 18',
        nota: 'Os dois ficam com 18 elétrons — a configuração do argônio, que é estável.',
      },
    ],
    vejaTambem: ['atomo.particulas'],
  },
  {
    id: 'atomo.massa-media',
    titulo: 'Massa atômica média',
    resumo: 'Por que a tabela periódica mostra 35,45 e nenhum átomo de cloro pesa isso.',
    definicao:
      'A massa que a tabela periódica traz é a média PONDERADA das massas dos isótopos, com a ' +
      'abundância de cada um como peso. É por isso que ela quase nunca é inteira: 35,45 para o ' +
      'cloro não é a massa de nenhum átomo de cloro — é o que se mede numa amostra onde ' +
      'convivem o 35 e o 37. Tratar isso como média simples é o erro clássico, e ele ignora ' +
      'justamente a informação que o enunciado deu.',
    formulas: [
      {
        tex: '\\bar{M} = \\sum M_i \\cdot \\frac{a_i}{100}',
        legenda: 'Cada massa vezes a sua fração de abundância.',
      },
      {
        tex: '35{,}45 = 34{,}97 \\times 0{,}7577 + 36{,}97 \\times 0{,}2423',
        legenda: 'O cloro, com os números reais.',
      },
    ],
    demonstracao: [
      {
        descricao: 'As abundâncias viram frações da unidade.',
        tex: '75{,}77\\% = 0{,}7577 \\qquad 24{,}23\\% = 0{,}2423',
      },
      {
        descricao: 'Cada isótopo entra com o seu peso.',
        tex: '34{,}97 \\times 0{,}7577 = 26{,}50 \\qquad 36{,}97 \\times 0{,}2423 = 8{,}96',
      },
      {
        descricao: 'A soma é a massa que a tabela mostra.',
        tex: '26{,}50 + 8{,}96 = 35{,}45',
        nota:
          'A média simples daria 35,97 — longe, porque o isótopo 35 é três vezes mais ' +
          'abundante e puxa o resultado.',
      },
    ],
    vejaTambem: ['atomo.isotopos'],
  },
];
