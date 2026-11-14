import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_NOMENCLATURA: readonly Teoria[] = [
  {
    id: 'nomenclatura.binario',
    titulo: 'O nome diz a fórmula',
    resumo: 'Ânion com terminação, «de», metal — e a fórmula sai das cargas.',
    definicao:
      'O nome de um composto binário não é um rótulo arbitrário: ele é uma descrição. Em ' +
      'português e em francês o ânion vem primeiro, com a terminação que o identifica ' +
      '(cloreto, óxido, sulfeto), e o metal vem depois do «de»; em inglês a ordem é a ' +
      'inversa — sodium chloride. Sabendo o nome, sabem-se os dois elementos; sabendo os dois ' +
      'elementos, sabem-se as cargas; e das cargas sai a fórmula, cruzada e reduzida. É por ' +
      'isso que este tópico é o fim da trilha de ligação, e não o começo.',
    formulas: [
      {
        tex: '\\text{cloreto de sódio} \\to \\text{Na}^{+} + \\text{Cl}^{-} \\to \\text{NaCl}',
        legenda: 'Do nome aos íons, dos íons à fórmula.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Óxido de alumínio: os elementos são alumínio e oxigênio.',
        tex: '\\text{Al} \\qquad \\text{O}',
      },
      {
        descricao: 'As cargas vêm do grupo de cada um.',
        tex: '\\text{Al}^{3+} \\qquad \\text{O}^{2-}',
      },
      {
        descricao: 'Cruzando e reduzindo.',
        tex: '\\text{Al}_{2}\\text{O}_{3}',
        nota: 'Nenhum passo aqui é de memória: o nome deu os elementos e a tabela deu as cargas.',
      },
    ],
    vejaTambem: ['nomenclatura.nox', 'tabela.ligacao-ionica'],
  },
  {
    id: 'nomenclatura.nox',
    titulo: 'O numeral romano é a carga',
    resumo: 'Sem ele, «cloreto de ferro» não diz se é FeCl₂ ou FeCl₃.',
    definicao:
      'Alguns metais formam íons de mais de uma carga: o ferro é +2 ou +3, o cobre é +1 ou +2, ' +
      'o chumbo é +2 ou +4. Para eles o nome só fica completo com o numeral romano, que É a ' +
      'carga escrita — a nomenclatura de Stock. «Cloreto de ferro» é um nome ambíguo, e ' +
      '«cloreto de ferro(III)» é FeCl₃ sem dúvida nenhuma. Com metal de carga fixa o numeral ' +
      'não se usa, porque não há o que desambiguar.',
    formulas: [
      {
        tex: '\\text{FeCl}_{2} \\to \\text{ferro(II)} \\qquad \\text{FeCl}_{3} \\to \\text{ferro(III)}',
        legenda: 'O numeral é informação, não decoração.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Cloreto de ferro(III): a carga está no nome.',
        tex: '\\text{Fe}^{3+} \\qquad \\text{Cl}^{-}',
      },
      {
        descricao: 'Cruzando: três cloros para um ferro.',
        tex: '\\text{FeCl}_{3}',
      },
      {
        descricao: 'Com ferro(II), a mesma regra dá outra fórmula.',
        tex: '\\text{FeCl}_{2}',
        nota: 'Mesmos elementos, nomes diferentes, compostos diferentes.',
      },
    ],
    vejaTambem: ['nomenclatura.soma-zero', 'nomenclatura.binario'],
  },
  {
    id: 'nomenclatura.soma-zero',
    titulo: 'A soma dos nox é zero',
    resumo: 'Com um elemento de nox conhecido, o outro sai por subtração.',
    definicao:
      'O número de oxidação é a carga que o átomo teria se a ligação fosse iônica. É uma ' +
      'ficção útil: numa ligação covalente nenhum átomo fica com a carga inteira, e ainda ' +
      'assim contá-la como se ficasse permite fechar a conta e saber quem oxidou e quem ' +
      'reduziu. A regra é uma só — num composto neutro a soma dos nox, cada um multiplicado ' +
      'pelo seu índice, é ZERO —, e ela resolve o nox do metal a partir de uma âncora: o ' +
      'flúor é sempre −1, o oxigênio é −2 fora dos peróxidos. No H₂O₂ ele é −1, e é por isso ' +
      'que o «quase sempre» importa.',
    formulas: [
      {
        tex: '\\sum (\\text{índice} \\times \\text{nox}) = 0',
        legenda: 'Num composto neutro. Num íon, a soma é a carga dele.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Em Fe₂O₃, o oxigênio é a âncora.',
        tex: '\\text{O}: -2',
      },
      {
        descricao: 'A soma, com os índices, tem de dar zero.',
        tex: '2x + 3 \\times (-2) = 0',
      },
      {
        descricao: 'Os dois ferros repartem a conta.',
        tex: 'x = \\frac{6}{2} = +3',
        nota: 'Esquecer de dividir pelo índice do metal daria +6, que não existe aqui.',
      },
    ],
    vejaTambem: ['nomenclatura.nox', 'tabela.ions'],
  },
];
