import { razaoDeVolumesComPassos, superficieComPassos, volumeComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_SOLIDOS: readonly Teoria[] = [
  {
    id: 'solidos.base-altura',
    titulo: 'Volume por empilhamento',
    resumo: 'Seção constante: área da base vezes altura.',
    definicao:
      'Num prisma ou cilindro, qualquer corte horizontal dá a mesma figura. Empilhar essas ' +
      'fatias é o que produz o volume, e por isso ele é simplesmente área da base vezes ' +
      'altura — não importa se a base é um quadrado, um círculo ou uma forma irregular.',
    formulas: [
      { tex: 'V = A_b \\cdot h' },
      { tex: 'V_{\\text{cilindro}} = \\pi r^{2} h' },
    ],
    demonstracao: [
      {
        descricao: 'Fatiamos o sólido em camadas finas de espessura Δh.',
        tex: '\\Delta V = A_b \\cdot \\Delta h',
      },
      {
        descricao: 'Como a seção não muda, todas as camadas têm a mesma área.',
        tex: 'A_b \\text{ constante}',
        nota: 'É o princípio de Cavalieri: sólidos com as mesmas seções têm o mesmo volume.',
      },
      {
        descricao: 'Somando todas as camadas, a altura total aparece multiplicando.',
        tex: 'V = A_b \\cdot h',
      },
    ],
    exemplo: {
      enunciado: 'O volume de um cilindro de raio 2 e altura 5.',
      passos: volumeComPassos('cilindro', { raio: 2, altura: 5 }).passos,
    },
    vejaTambem: ['solidos.terco', 'solidos.esfera', 'solidos.escala'],
  },
  {
    id: 'solidos.terco',
    titulo: 'Por que pirâmide e cone valem um terço',
    resumo: 'Três pirâmides preenchem um prisma.',
    definicao:
      'Um sólido que afina até um vértice tem um terço do volume do prisma ou cilindro de ' +
      'mesma base e altura. O fator 1/3 não é convenção: três pirâmides de base quadrada ' +
      'montam exatamente um cubo, e o mesmo argumento vale para qualquer base.',
    formulas: [
      { tex: 'V = \\frac{A_b \\cdot h}{3}' },
      { tex: 'V_{\\text{cone}} = \\frac{\\pi r^{2} h}{3}' },
    ],
    demonstracao: [
      {
        descricao: 'Um cubo pode ser partido em três pirâmides congruentes.',
        tex: '3V_{\\text{pirâmide}} = V_{\\text{cubo}}',
        nota: 'Cada uma tem por base uma face e por ápice o vértice oposto.',
      },
      {
        descricao: 'Logo cada pirâmide vale um terço do cubo.',
        tex: 'V = \\frac{A_b h}{3}',
      },
      {
        descricao: 'Por Cavalieri, o resultado vale para qualquer base, inclusive circular.',
        tex: 'V_{\\text{cone}} = \\frac{\\pi r^{2} h}{3}',
        nota: 'As seções do cone e de uma pirâmide equivalente têm sempre a mesma área.',
      },
    ],
    exemplo: {
      enunciado: 'O volume de um cone de raio 3 e altura 6.',
      passos: volumeComPassos('cone', { raio: 3, altura: 6 }).passos,
    },
    vejaTambem: ['solidos.base-altura', 'solidos.esfera'],
  },
  {
    id: 'solidos.esfera',
    titulo: 'A esfera de Arquimedes',
    resumo: 'Dois terços do cilindro que a envolve.',
    definicao:
      'A esfera ocupa exatamente dois terços do cilindro de mesmo raio e altura igual ao ' +
      'diâmetro — e sua superfície é igual à lateral desse cilindro. Arquimedes considerou ' +
      'este o seu melhor resultado, e pediu que fosse gravado em seu túmulo.',
    formulas: [
      { tex: 'V = \\frac{4}{3}\\pi r^{3}' },
      { tex: 'A = 4\\pi r^{2}' },
    ],
    demonstracao: [
      {
        descricao: 'O cilindro que envolve a esfera tem altura 2r.',
        tex: 'V_{\\text{cil}} = \\pi r^{2}(2r) = 2\\pi r^{3}',
      },
      {
        descricao: 'A esfera ocupa dois terços desse volume.',
        tex: 'V = \\frac{2}{3}(2\\pi r^{3}) = \\frac{4}{3}\\pi r^{3}',
        nota: 'O terço restante é o que sobra nas duas calotas vazias.',
      },
      {
        descricao: 'E a superfície da esfera é a lateral do cilindro.',
        tex: 'A = 2\\pi r(2r) = 4\\pi r^{2}',
        nota: 'Quatro círculos máximos: é fácil de lembrar e difícil de adivinhar.',
      },
    ],
    exemplo: {
      enunciado: 'A superfície de uma esfera de raio 2.',
      passos: superficieComPassos('esfera', { raio: 2 }).passos,
    },
    vejaTambem: ['solidos.base-altura', 'solidos.escala'],
  },
  {
    id: 'solidos.escala',
    titulo: 'Escala cúbica',
    resumo: 'Dobrar o tamanho multiplica o volume por oito.',
    definicao:
      'Em sólidos semelhantes, comprimentos escalam com k, superfícies com k² e volumes com ' +
      'k³. A consequência prática é que a razão superfície/volume cai com 1/k: quanto maior o ' +
      'corpo, menos superfície ele tem por unidade de massa. Isso governa resfriamento, ' +
      'resistência estrutural e o projeto de qualquer veículo.',
    formulas: [
      { tex: '\\frac{V\'}{V} = k^{3} \\qquad \\frac{A\'}{A} = k^{2}' },
      {
        tex: '\\frac{A\'/V\'}{A/V} = \\frac{1}{k}',
        legenda: 'A razão superfície/volume diminui com o tamanho.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Três dimensões multiplicadas por k.',
        tex: "V' = k^{3}V",
      },
      {
        descricao: 'Duas dimensões, no caso da superfície.',
        tex: "A' = k^{2}A",
      },
      {
        descricao: 'Dividindo uma pela outra, sobra 1/k.',
        tex: "\\frac{A'}{V'} = \\frac{1}{k} \\cdot \\frac{A}{V}",
        nota: 'Um foguete maior precisa dissipar mais calor com proporcionalmente menos área.',
      },
    ],
    exemplo: {
      enunciado: 'A razão de volumes quando a razão linear é 2.',
      passos: razaoDeVolumesComPassos(2).passos,
    },
    vejaTambem: ['solidos.esfera', 'semelhanca.razao', 'areas.escala'],
  },
];
