import { somaAngulosInternosComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_ANGULOS: readonly Teoria[] = [
  {
    id: 'angulos.soma',
    titulo: 'Soma dos ângulos internos',
    resumo: 'Todo polígono se reparte em triângulos.',
    definicao:
      'A soma dos ângulos internos de um polígono de n lados é (n − 2)·180°. O motivo é ' +
      'direto: traçando as diagonais de um único vértice, o polígono se divide em n − 2 ' +
      'triângulos, e cada um contribui com 180°.',
    formulas: [
      { tex: 'S_i = (n - 2) \\cdot 180^\\circ' },
      {
        tex: 'a_i = \\frac{(n-2) \\cdot 180^\\circ}{n}',
        legenda: 'Ângulo interno de um polígono regular.',
      },
      {
        tex: 'S_e = 360^\\circ',
        legenda: 'A soma dos externos é sempre 360°, para qualquer n.',
      },
    ],
    demonstracao: [
      {
        descricao:
          'No triângulo, a soma é 180°: uma paralela a um lado mostra os três ângulos juntos.',
        tex: '\\alpha + \\beta + \\gamma = 180^\\circ',
        nota: 'Os ângulos alternos internos reposicionam os três num mesmo lado da reta.',
      },
      {
        descricao: 'De um vértice, as diagonais recortam o polígono em triângulos.',
        tex: 'n - 2 \\text{ triângulos}',
      },
      {
        descricao: 'Cada triângulo contribui 180°, e nenhum ângulo é contado duas vezes.',
        tex: 'S_i = (n-2) \\cdot 180^\\circ',
      },
      {
        descricao: 'Dando uma volta completa pelos externos, o giro total é 360°.',
        tex: 'S_e = 360^\\circ',
        nota: 'Caminhar pelo contorno e voltar ao ponto de partida gira o corpo uma vez.',
      },
    ],
    exemplo: {
      enunciado: 'A soma dos ângulos internos de um octógono.',
      passos: somaAngulosInternosComPassos(8).passos,
    },
    vejaTambem: ['angulos.triangulo', 'semelhanca.pitagoras'],
  },
  {
    id: 'angulos.triangulo',
    titulo: 'Quando três medidas formam um triângulo',
    resumo: 'O maior lado não pode vencer a soma dos outros dois.',
    definicao:
      'Três comprimentos só fecham um triângulo se cada um for menor que a soma dos outros ' +
      'dois — a desigualdade triangular. E uma vez fechado, comparar o quadrado do maior lado ' +
      'com a soma dos quadrados dos outros diz se o triângulo é retângulo, acutângulo ou ' +
      'obtusângulo, sem medir ângulo nenhum.',
    formulas: [
      { tex: '|b - c| < a < b + c' },
      {
        tex: 'a^{2} = b^{2} + c^{2} \\;\\Rightarrow\\; \\text{retângulo}',
        legenda: 'Maior que: obtusângulo. Menor que: acutângulo.',
      },
    ],
    demonstracao: [
      {
        descricao: 'O caminho reto entre dois vértices é o mais curto possível.',
        tex: 'a < b + c',
        nota: 'Ir por um terceiro ponto nunca encurta o percurso.',
      },
      {
        descricao: 'Se o maior lado empata com a soma, os três pontos ficam alinhados.',
        tex: 'a = b + c \\;\\Rightarrow\\; \\text{triângulo degenerado}',
      },
      {
        descricao: 'Pela lei dos cossenos, o sinal da diferença revela o maior ângulo.',
        tex: 'a^{2} = b^{2} + c^{2} - 2bc\\cos\\alpha',
      },
      {
        descricao: 'Com α = 90° o cosseno zera, e sobra exatamente Pitágoras.',
        tex: '\\cos 90^\\circ = 0 \\;\\Rightarrow\\; a^{2} = b^{2} + c^{2}',
        nota: 'Pitágoras é o caso particular da lei dos cossenos.',
      },
    ],
    exemplo: {
      enunciado: 'A soma dos internos de um triângulo, o caso n = 3.',
      passos: somaAngulosInternosComPassos(3).passos,
    },
    vejaTambem: ['angulos.soma', 'semelhanca.pitagoras', 'leis.cossenos'],
  },
  {
    id: 'angulos.congruencia',
    titulo: 'Congruência de triângulos',
    resumo: 'Mesma forma e mesmo tamanho: três medidas certas bastam.',
    definicao:
      'Dois triângulos são congruentes quando um se sobrepõe exatamente ao outro: lados e ' +
      'ângulos correspondentes iguais. Não é preciso conferir as seis medidas — quatro casos ' +
      'garantem a congruência com três: LAL (dois lados e o ângulo entre eles), ALA (dois ' +
      'ângulos e o lado entre eles), LLL (os três lados) e LAAₒ (um lado, um ângulo adjacente e ' +
      'o ângulo oposto). A notação ABC ≅ DEF já diz quem corresponde a quem: A↔D, B↔E, C↔F.',
    formulas: [
      {
        tex: '\\triangle ABC \\cong \\triangle DEF \\;\\Rightarrow\\; AB = DE,\\; BC = EF,\\; \\hat{A} = \\hat{D},\\; \\dots',
      },
      {
        tex: '\\text{LAL} \\quad \\text{ALA} \\quad \\text{LLL} \\quad \\text{LAA}_{o}',
        legenda: 'LLA (dois lados e um ângulo que não está entre eles) NÃO garante.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Com dois lados e o ângulo entre eles, o terceiro vértice fica determinado.',
        tex: '\\text{LAL: } a^{2} = b^{2} + c^{2} - 2bc\\cos\\hat{A}',
        nota: 'A lei dos cossenos mostra que o terceiro lado não tem escolha.',
      },
      {
        descricao: 'Com dois ângulos, o terceiro sai da soma 180°; o lado fixa o tamanho.',
        tex: '\\hat{C} = 180^\\circ - \\hat{A} - \\hat{B}',
      },
    ],
    exemplo: {
      enunciado: 'ABC ≅ DEF, AB = 2x + 3 cm e DE = 5x − 9 cm. Quanto mede AB?',
      passos: [
        { descricao: 'AB e DE são correspondentes: iguais.', tex: '2x + 3 = 5x - 9' },
        { descricao: 'Resolvendo.', tex: '12 = 3x \\;\\Rightarrow\\; x = 4' },
        { descricao: 'Substituindo.', tex: 'AB = 2 \\cdot 4 + 3 = 11\\ \\text{cm}' },
      ],
    },
    vejaTambem: ['angulos.triangulo', 'angulos.classificacao', 'semelhanca.razao'],
  },
  {
    id: 'angulos.classificacao',
    titulo: 'Classificação de triângulos',
    resumo:
      'Pelos lados (equilátero, isósceles, escaleno) e pelos ângulos (acutângulo, retângulo, obtusângulo).',
    definicao:
      'Pelos lados: equilátero tem os três iguais (e os três ângulos de 60°); isósceles, dois ' +
      'iguais (e os ângulos da base iguais); escaleno, nenhum. Pelos ângulos: acutângulo tem os ' +
      'três agudos; retângulo, um de 90°; obtusângulo, um maior que 90°. Como a soma é 180°, um ' +
      'triângulo nunca tem dois ângulos retos ou obtusos.',
    formulas: [
      { tex: '\\text{isósceles: } AB = AC \\iff \\hat{B} = \\hat{C}' },
      { tex: '\\hat{A} + \\hat{B} + \\hat{C} = 180^\\circ' },
    ],
    demonstracao: [
      {
        descricao:
          'No isósceles, a altura pelo vértice A divide o triângulo em dois congruentes (LAL).',
        tex: 'AB = AC,\\; AH \\text{ comum} \\;\\Rightarrow\\; \\hat{B} = \\hat{C}',
      },
      {
        descricao:
          'Se dois ângulos fossem de 90°, já somariam 180° e não sobraria nada para o terceiro.',
        tex: '90^\\circ + 90^\\circ + \\hat{C} = 180^\\circ \\;\\Rightarrow\\; \\hat{C} = 0^\\circ',
      },
    ],
    exemplo: {
      enunciado: 'Um triângulo isósceles tem ângulo do vértice de 40°. Quanto medem os da base?',
      passos: [
        { descricao: 'Os da base são iguais.', tex: '40^\\circ + 2x = 180^\\circ' },
        { descricao: 'Resolvendo.', tex: 'x = 70^\\circ' },
      ],
    },
    vejaTambem: ['angulos.congruencia', 'angulos.triangulo'],
  },
  {
    id: 'angulos.poligono-regular',
    titulo: 'Polígono regular: ângulos e diagonais',
    resumo: 'Externo = 360°/n, interno = 180° − externo, diagonais = n(n − 3)/2.',
    definicao:
      'Num polígono regular de n lados todos os ângulos são iguais. O caminho mais curto passa ' +
      'pelo ângulo externo: como os externos somam 360°, cada um mede 360°/n, e o interno é o ' +
      'suplementar. Já as diagonais saem de cada vértice para os n − 3 vértices que não são ele ' +
      'nem os vizinhos; contando por todos os vértices, cada diagonal aparece duas vezes.',
    formulas: [
      { tex: 'a_e = \\frac{360^\\circ}{n} \\qquad a_i = 180^\\circ - a_e' },
      { tex: 'd = \\frac{n(n - 3)}{2}' },
    ],
    demonstracao: [
      {
        descricao: 'Cada um dos n vértices vê n − 3 vértices não vizinhos.',
        tex: 'n \\cdot (n - 3) \\text{ pontas de diagonal}',
      },
      {
        descricao: 'Cada diagonal tem duas pontas: divide-se por 2.',
        tex: 'd = \\frac{n(n - 3)}{2}',
      },
    ],
    exemplo: {
      enunciado: 'Polígono regular com ângulo interno de 150°: quantas diagonais?',
      passos: [
        { descricao: 'O externo.', tex: 'a_e = 180^\\circ - 150^\\circ = 30^\\circ' },
        { descricao: 'O número de lados.', tex: 'n = \\frac{360^\\circ}{30^\\circ} = 12' },
        { descricao: 'As diagonais.', tex: 'd = \\frac{12 \\cdot 9}{2} = 54' },
      ],
    },
    vejaTambem: ['angulos.soma', 'angulos.quadrilateros'],
  },
  {
    id: 'angulos.quadrilateros',
    titulo: 'Quadriláteros e suas propriedades',
    resumo: 'Os quatro ângulos somam 360°; paralelas dão ângulos suplementares.',
    definicao:
      'Todo quadrilátero tem ângulos internos somando 360° (uma diagonal o divide em dois ' +
      'triângulos). Nos que têm lados paralelos, os ângulos do mesmo lado de uma transversal ' +
      'somam 180°. Paralelogramo: lados e ângulos opostos iguais, consecutivos suplementares, ' +
      'diagonais que se cortam ao meio. Losango: paralelogramo de lados iguais, com diagonais ' +
      'perpendiculares que cortam os ângulos ao meio. Retângulo: quatro ângulos retos, ' +
      'diagonais iguais. Trapézio: um par de lados paralelos; se isósceles, ângulos da base iguais.',
    formulas: [
      { tex: '\\hat{A} + \\hat{B} + \\hat{C} + \\hat{D} = 360^\\circ' },
      { tex: '\\text{paralelogramo: } \\hat{A} + \\hat{B} = 180^\\circ,\\; \\hat{A} = \\hat{C}' },
    ],
    demonstracao: [
      {
        descricao: 'A diagonal AC parte o quadrilátero em dois triângulos.',
        tex: '180^\\circ + 180^\\circ = 360^\\circ',
      },
      {
        descricao: 'Num paralelogramo, AB ∥ CD: os ângulos A e D são colaterais internos.',
        tex: '\\hat{A} + \\hat{D} = 180^\\circ',
      },
    ],
    exemplo: {
      enunciado: 'Losango com ângulo A = 120°: que ângulo a diagonal BD faz com o lado AB?',
      passos: [
        {
          descricao: 'O ângulo B, consecutivo.',
          tex: '\\hat{B} = 180^\\circ - 120^\\circ = 60^\\circ',
        },
        { descricao: 'BD corta B ao meio.', tex: 'A\\hat{B}D = 30^\\circ' },
      ],
    },
    vejaTambem: ['angulos.soma', 'angulos.poligono-regular'],
  },
];
