import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_LIGACAO: readonly Teoria[] = [
  {
    id: 'tabela.grupo',
    titulo: 'O grupo é a última camada',
    resumo: 'A coluna reúne elementos de última camada igual — e de química igual.',
    definicao:
      'A tabela está arrumada por número atômico, e o que se repete a cada linha é a ' +
      'configuração da última camada. O GRUPO é a coluna, e ele agrupa elementos com a mesma ' +
      'contagem de elétrons externos: é por isso que sódio e potássio reagem do mesmo jeito, e ' +
      'não por acaso. O PERÍODO é a linha, e conta as camadas ocupadas. Na numeração de 1 a ' +
      '18, os elementos de até dois elétrons na última camada estão nos grupos 1 e 2; de três ' +
      'em diante soma-se 10, porque as colunas 3 a 12 são o bloco d.',
    formulas: [
      {
        tex: '\\text{grupo} = \\text{elétrons da última camada} \;(+10 \\text{ se} \\geq 3)',
        legenda: 'Vale para os representativos; no bloco d a leitura é outra.',
      },
    ],
    demonstracao: [
      {
        descricao: 'O cloro tem sete elétrons na última camada.',
        tex: '\\ldots\;3s^{2}\;3p^{5}',
      },
      {
        descricao: 'Sete, mais dez: grupo 17.',
        tex: '7 + 10 = 17',
        nota: 'Na numeração antiga, 7A — o mesmo lugar com outro nome.',
      },
      {
        descricao: 'Três camadas ocupadas: terceiro período.',
        tex: '2\\,|\\,8\\,|\\,7',
      },
    ],
    vejaTambem: ['tabela.ions', 'eletrons.valencia'],
  },
  {
    id: 'tabela.ions',
    titulo: 'A carga do íon não é escolha',
    resumo: 'Cada átomo vai à configuração do gás nobre mais próximo.',
    definicao:
      'Um átomo com poucos elétrons na última camada perde-os; um átomo perto de fechar a ' +
      'camada ganha os que faltam. Nos dois casos o destino é o mesmo: a configuração do gás ' +
      'nobre mais próximo, que é a arrumação estável. Daí as cargas serem previsíveis por ' +
      'grupo — sódio +1, magnésio +2, alumínio +3, oxigênio −2, cloro −1 — e daí o cuidado ' +
      'com o sinal: ganhar elétron, que é carga negativa, deixa o átomo negativo.',
    formulas: [
      {
        tex: '\\text{Na} \\to \\text{Na}^{+} + e^{-} \\qquad \\text{Cl} + e^{-} \\to \\text{Cl}^{-}',
        legenda: 'Um dá, o outro recebe: é daí que sai o NaCl.',
      },
    ],
    demonstracao: [
      {
        descricao: 'O magnésio tem dois elétrons sobrando na terceira camada.',
        tex: '2\\,|\\,8\\,|\\,2',
      },
      {
        descricao: 'Perdendo os dois, fica com a configuração do neônio.',
        tex: '\\text{Mg}^{2+}: 2\\,|\\,8',
        nota: 'Perder dois elétrons deixa duas cargas positivas a descoberto.',
      },
      {
        descricao: 'O oxigênio está a dois de fechar, e ganha dois.',
        tex: '\\text{O}^{2-}: 2\\,|\\,8',
      },
    ],
    vejaTambem: ['tabela.ligacao-ionica', 'atomo.ions'],
  },
  {
    id: 'tabela.ligacao-ionica',
    titulo: 'A fórmula iônica é uma proporção',
    resumo: 'O índice de cada um é a carga do outro — e depois se reduz.',
    definicao:
      'Um composto iônico é neutro: a carga positiva total anula a negativa. Daí o cruzamento ' +
      'que se ensina — o índice de cada elemento é a carga do outro —, que não é truque e sim ' +
      'a condição de neutralidade escrita de um jeito curto. E daí a redução: a fórmula iônica ' +
      'não descreve uma molécula, descreve a PROPORÇÃO dos íons no retículo, e proporção se ' +
      'escreve na forma mais simples. Mg²⁺ com O²⁻ dá MgO, nunca Mg₂O₂.',
    formulas: [
      {
        tex: '\\text{A}^{x+} + \\text{B}^{y-} \\to \\text{A}_{y}\\text{B}_{x}',
        legenda: 'Depois de reduzir os índices pelo maior divisor comum.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Alumínio dá três elétrons; oxigênio recebe dois.',
        tex: '\\text{Al}^{3+} \\qquad \\text{O}^{2-}',
      },
      {
        descricao: 'Cruzando: dois alumínios e três oxigênios.',
        tex: '2 \\times (+3) + 3 \\times (-2) = 0',
      },
      {
        descricao: 'A fórmula é Al₂O₃, já na forma mais simples.',
        tex: '\\text{Al}_{2}\\text{O}_{3}',
        nota: 'Com Mg e O o cruzamento daria Mg₂O₂, e a redução leva a MgO.',
      },
    ],
    vejaTambem: ['tabela.ions', 'tabela.eletronegatividade'],
  },
  {
    id: 'tabela.eletronegatividade',
    titulo: 'Eletronegatividade, e o que ela decide',
    resumo: 'A diferença diz se os elétrons mudam de dono ou são repartidos.',
    definicao:
      'Eletronegatividade é o quanto um átomo puxa para si os elétrons da ligação. Ela cresce ' +
      'para a direita na tabela e para cima, pelo mesmo motivo do raio: mais prótons puxando ' +
      'camadas menores. Quando a diferença entre dois átomos é grande, os elétrons mudam de ' +
      'dono e a ligação é iônica; quando é pequena, eles são compartilhados e a ligação é ' +
      'covalente. Os cortes usados na escola — 1,7 e 0,4 — são CONVENÇÃO, não lei: o HF tem ' +
      '1,78 e se comporta como molécula covalente muito polar. A régua é uma faixa, e os ' +
      'compostos perto do limite são parcialmente iônicos; nenhum número decide por eles. É ' +
      'por isso que o treino deste tópico pede a diferença, e não o rótulo.',
    formulas: [
      {
        tex: '\\Delta\\chi = |\\chi_1 - \\chi_2|',
        legenda: 'Acima de 1,7: iônica. Entre 0,4 e 1,7: covalente polar. Abaixo: apolar.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Sódio e cloro: os extremos da linha.',
        tex: '\\Delta\\chi = |0{,}93 - 3{,}16| = 2{,}23',
        nota: 'Muito acima de 1,7: o elétron muda de dono, e o sal é um retículo de íons.',
      },
      {
        descricao: 'Hidrogênio e oxigênio: diferença média.',
        tex: '\\Delta\\chi = |2{,}20 - 3{,}44| = 1{,}24',
        nota: 'Covalente polar: compartilham, mas o oxigênio puxa mais — e a água é polar por isso.',
      },
      {
        descricao: 'Carbono e enxofre: quase iguais.',
        tex: '\\Delta\\chi = |2{,}55 - 2{,}58| = 0{,}03',
        nota: 'Covalente apolar: repartem o par quase em partes iguais.',
      },
    ],
    vejaTambem: ['tabela.ligacao-ionica', 'tabela.grupo'],
  },
];
