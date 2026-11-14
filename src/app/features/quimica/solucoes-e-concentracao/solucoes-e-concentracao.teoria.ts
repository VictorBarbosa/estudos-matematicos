import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_SOLUCOES: readonly Teoria[] = [
  {
    id: 'solucao.concentracao',
    titulo: 'Concentração: o que há em cada litro',
    resumo: 'Mols de soluto por litro de solução — e o volume em litros, sempre.',
    definicao:
      'Uma reação em solução não enxerga quanto soluto há no frasco: enxerga quanto há onde ' +
      'ela acontece. Por isso a medida da química em solução é a concentração, e a mais usada ' +
      'é a molaridade — mols de soluto por litro de SOLUÇÃO, não por litro de solvente. A ' +
      'distinção parece pedante e não é: dissolver um mol em um litro de água dá mais de um ' +
      'litro de solução. Os dois tropeços de sempre são deixar o volume em mililitros, erro ' +
      'de fator mil, e dividir gramas por litro sem passar pelos mols.',
    formulas: [
      {
        tex: 'C = \\frac{n}{V}',
        legenda: 'n em mols, V em litros de solução pronta.',
      },
      {
        tex: 'n = \\frac{m}{M}',
        legenda: 'A balança dá gramas; a massa molar os traduz em quantidade.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Pesam-se 5,84 g de NaCl e completa-se até 250 mL.',
        tex: 'm = 5{,}84\\;\\text{g} \\qquad V = 250\\;\\text{mL}',
      },
      {
        descricao: 'A massa vira quantidade pela massa molar.',
        tex: 'n = \\frac{5{,}84}{58{,}44} = 0{,}10\\;\\text{mol}',
      },
      {
        descricao: 'O volume passa a litros.',
        tex: 'V = 0{,}25\\;\\text{L}',
        nota: 'Esquecer esta linha multiplica a resposta por mil, em qualquer exercício.',
      },
      {
        descricao: 'A concentração é a razão entre os dois.',
        tex: 'C = \\frac{0{,}10}{0{,}25} = 0{,}40\\;\\text{mol/L}',
      },
    ],
    vejaTambem: ['solucao.diluicao', 'mol.massa-molar'],
  },
  {
    id: 'solucao.diluicao',
    titulo: 'Diluição: mais água, os mesmos mols',
    resumo: 'C₁V₁ = C₂V₂ não é macete: é dizer que o soluto não mudou.',
    definicao:
      'Acrescentar solvente não cria nem destrói soluto. A quantidade de mols antes é a ' +
      'quantidade de mols depois, e é só isso que a fórmula da diluição afirma. Quem a decora ' +
      'sem essa frase costuma aplicá-la onde ela não vale — a misturas de solutos diferentes, ' +
      'por exemplo. O outro erro é de leitura: o volume final é o que havia MAIS o que se ' +
      'acrescentou, e não a água sozinha.',
    formulas: [
      {
        tex: 'C_1 V_1 = C_2 V_2',
        legenda: 'Os dois lados são o mesmo número de mols.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Cem mililitros a 2 mol/L contêm dois décimos de mol.',
        tex: 'n = 2 \\times 0{,}10 = 0{,}20\\;\\text{mol}',
      },
      {
        descricao: 'Acrescentam-se 300 mL de água: o volume final é 400 mL.',
        tex: 'V_2 = 0{,}10 + 0{,}30 = 0{,}40\\;\\text{L}',
        nota: 'O volume final não é o acrescentado: é a soma.',
      },
      {
        descricao: 'A mesma quantidade, em mais litros, dá menos concentração.',
        tex: 'C_2 = \\frac{0{,}20}{0{,}40} = 0{,}50\\;\\text{mol/L}',
        nota: 'O volume quadruplicou e a concentração caiu a um quarto: é a mesma frase.',
      },
    ],
    vejaTambem: ['solucao.concentracao', 'solucao.mistura'],
  },
  {
    id: 'solucao.mistura',
    titulo: 'Misturar duas soluções',
    resumo: 'Somam-se os mols e somam-se os volumes: média ponderada, não simples.',
    definicao:
      'Juntando duas soluções do mesmo soluto, as quantidades se somam e os volumes também. ' +
      'A concentração final é a razão entre esses dois totais, o que a faz uma média ' +
      'PONDERADA pelos volumes: o frasco maior pesa mais no resultado. A média simples das ' +
      'concentrações é tentadora e só acerta quando os dois volumes são iguais — justamente o ' +
      'caso em que ninguém erraria.',
    formulas: [
      {
        tex: 'C = \\frac{C_1 V_1 + C_2 V_2}{V_1 + V_2}',
        legenda: 'Mols somados em cima, litros somados embaixo.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Um litro a 1 mol/L com três litros a 3 mol/L.',
        tex: 'n = 1 \\times 1 + 3 \\times 3 = 10\\;\\text{mol}',
      },
      {
        descricao: 'O volume final são quatro litros.',
        tex: 'C = \\frac{10}{4} = 2{,}5\\;\\text{mol/L}',
      },
      {
        descricao: 'A média simples daria outra coisa, e estaria errada.',
        tex: '\\frac{1 + 3}{2} = 2',
        nota: 'O frasco de três litros manda mais, e a resposta pende para o lado dele.',
      },
    ],
    vejaTambem: ['solucao.diluicao', 'solucao.concentracao'],
  },
];
