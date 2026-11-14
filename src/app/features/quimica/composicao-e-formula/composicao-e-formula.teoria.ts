import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_COMPOSICAO: readonly Teoria[] = [
  {
    id: 'formula.percentual',
    titulo: 'Composição percentual',
    resumo: 'Quanto da massa do composto é de cada elemento.',
    definicao:
      'A fórmula diz quantos átomos de cada elemento há na molécula; a composição percentual ' +
      'diz quanto da MASSA cada elemento responde. As duas coisas não coincidem, porque os ' +
      'átomos não pesam igual: em H₂O há dois hidrogênios para um oxigênio, e ainda assim o ' +
      'oxigênio é quase noventa por cento da massa. O erro de quem está aprendendo é pôr a ' +
      'massa atômica crua em cima, esquecendo o índice — e o índice conta átomos, por isso ' +
      'ele multiplica.',
    formulas: [
      {
        tex: '\\%_{\\text{elemento}} = \\frac{n \\cdot m_{\\text{atômica}}}{M} \\times 100',
        legenda: 'Em cima, a massa de TODOS os átomos daquele elemento.',
      },
    ],
    demonstracao: [
      {
        descricao: 'A massa molar da água é a soma das parcelas.',
        tex: 'M = 2 \\times 1{,}01 + 16{,}00 = 18{,}02\\;\\text{g/mol}',
      },
      {
        descricao: 'Os dois hidrogênios pesam juntos.',
        tex: '2 \\times 1{,}01 = 2{,}02\\;\\text{g/mol}',
      },
      {
        descricao: 'A parte sobre o todo, vezes cem.',
        tex: '\\frac{2{,}02}{18{,}02} \\times 100 = 11{,}21\\%',
        nota: 'Dois terços dos átomos, e um nono da massa: contagem e massa são coisas diferentes.',
      },
    ],
    vejaTambem: ['formula.empirica', 'mol.massa-molar'],
  },
  {
    id: 'formula.empirica',
    titulo: 'Fórmula empírica: a proporção mais simples',
    resumo: 'Das porcentagens volta-se à razão entre os átomos — e só a ela.',
    definicao:
      'O laboratório mede massa, não átomos. Da composição percentual volta-se à fórmula em ' +
      'três passos: fingir 100 g, para que cada porcentagem seja um número de gramas; passar ' +
      'cada massa a mols pela massa atômica; e dividir todos os mols pelo MENOR deles, que é o ' +
      'passo que transforma quantidade em proporção. Se a proporção sair com meio átomo, ' +
      'multiplicam-se todos para inteirar, porque meio átomo não existe. O resultado é a ' +
      'fórmula EMPÍRICA: a razão mais simples, e nada além dela.',
    formulas: [
      {
        tex: 'n_i = \\frac{\\%_i}{m_i} \\qquad \\text{razão} = \\frac{n_i}{n_{\\min}}',
        legenda: 'Primeiro mols, depois a divisão pelo menor.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Um composto com 40,00% de C, 6,71% de H e 53,29% de O.',
        tex: 'C: 40{,}00 \\qquad H: 6{,}71 \\qquad O: 53{,}29',
      },
      {
        descricao: 'Cada massa vira quantidade.',
        tex: '\\frac{40{,}00}{12{,}01} = 3{,}33 \\qquad \\frac{6{,}71}{1{,}01} = 6{,}64 \\qquad \\frac{53{,}29}{16{,}00} = 3{,}33',
      },
      {
        descricao: 'Dividindo todos pelo menor, a proporção aparece.',
        tex: '1 : 2 : 1',
        nota: 'A fórmula empírica é CH₂O — e ela não diz qual composto é.',
      },
    ],
    vejaTambem: ['formula.molecular', 'formula.percentual'],
  },
  {
    id: 'formula.molecular',
    titulo: 'Da empírica à molecular',
    resumo: 'A massa molar escolhe entre os compostos de mesma proporção.',
    definicao:
      'A composição percentual não distingue CH₂O de C₆H₁₂O₆: os dois têm a mesma proporção, e ' +
      'por isso as mesmas porcentagens. Formaldeído e glicose são o mesmo resultado para quem ' +
      'só mediu massa. O que separa um do outro é a massa molar, medida por outro experimento: ' +
      'dividindo-a pela massa da fórmula empírica sai um número INTEIRO, e é por ele que todos ' +
      'os índices se multiplicam. Sair inteiro, aliás, é a confirmação de que a empírica estava ' +
      'certa.',
    formulas: [
      {
        tex: 'n = \\frac{M_{\\text{molecular}}}{M_{\\text{empírica}}}',
        legenda: 'Um inteiro; cada índice da empírica se multiplica por ele.',
      },
    ],
    demonstracao: [
      {
        descricao: 'A fórmula empírica CH₂O pesa 30,02 g/mol.',
        tex: 'M_{\\text{empírica}} = 12{,}01 + 2 \\times 1{,}01 + 16{,}00 = 30{,}03',
      },
      {
        descricao: 'O composto medido tem 180,16 g/mol.',
        tex: 'n = \\frac{180{,}16}{30{,}03} = 6',
      },
      {
        descricao: 'Multiplicando os índices por seis.',
        tex: '\\text{CH}_2\\text{O} \\times 6 = \\text{C}_6\\text{H}_{12}\\text{O}_6',
        nota: 'É glicose. Com 30 g/mol seria formaldeído, com a mesma composição percentual.',
      },
    ],
    vejaTambem: ['formula.empirica', 'mol.massa-molar'],
  },
];
