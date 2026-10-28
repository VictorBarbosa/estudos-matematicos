import { areaComPassos, perimetroCirculoComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_CIRCULO: readonly Teoria[] = [
  {
    id: 'circulo.pi',
    titulo: 'O que π realmente é',
    resumo: 'Uma razão que não depende do tamanho do círculo.',
    definicao:
      'π é definido como a razão entre o comprimento de uma circunferência e seu diâmetro. ' +
      'O fato notável não é o valor 3,14159…, e sim que essa razão seja a MESMA para todo ' +
      'círculo, do anel ao equador da Terra. É isso que a torna uma constante.',
    formulas: [
      { tex: '\\pi = \\frac{C}{d} \;\\Rightarrow\; C = 2\\pi r' },
      { tex: 'A = \\pi r^{2}' },
    ],
    demonstracao: [
      {
        descricao: 'Todos os círculos são semelhantes entre si, com razão igual à dos raios.',
        tex: 'k = \\frac{r_2}{r_1}',
        nota: 'Não existe círculo "de outro formato" — só de outro tamanho.',
      },
      {
        descricao: 'Comprimentos escalam com k, então C/d não muda.',
        tex: '\\frac{C_2}{d_2} = \\frac{kC_1}{kd_1} = \\frac{C_1}{d_1}',
      },
      {
        descricao: 'Essa razão invariável é o que chamamos de π.',
        tex: '\\pi \\approx 3{,}14159',
      },
    ],
    exemplo: {
      enunciado: 'O comprimento de uma circunferência de raio 5.',
      passos: perimetroCirculoComPassos(5).passos,
    },
    vejaTambem: ['circulo.area', 'circulo.poligonos'],
  },
  {
    id: 'circulo.area',
    titulo: 'A área do círculo, por fatias',
    resumo: 'Cortar em setores e rearranjar num retângulo.',
    definicao:
      'Fatiando o círculo em setores muito finos e alternando-os ponta a ponta, o arranjo ' +
      'tende a um retângulo de altura r e base igual a metade do perímetro. Daí a área ser ' +
      'πr² — a fórmula não cai do céu, ela é o retângulo disfarçado. Para um setor, basta a ' +
      'fração do ângulo.',
    formulas: [
      { tex: 'A = \\frac{C}{2} \\cdot r = \\pi r \\cdot r = \\pi r^{2}' },
      {
        tex: 'A_{\\text{setor}} = \\frac{\\theta}{360^\\circ} \\cdot \\pi r^{2}',
        legenda: 'O setor é a fração do círculo correspondente ao ângulo.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Dividimos o círculo em 2n setores iguais, como gomos.',
        tex: '2n \\text{ setores}',
      },
      {
        descricao: 'Alternando-os, forma-se uma figura quase retangular.',
        tex: 'b \\approx \\frac{C}{2} = \\pi r \\qquad h \\approx r',
        nota: 'Quanto mais finos os setores, mais reto fica o contorno.',
      },
      {
        descricao: 'No limite, a figura é exatamente um retângulo.',
        tex: 'A = \\pi r \\cdot r = \\pi r^{2}',
        nota: 'É um argumento de limite, feito séculos antes do cálculo formal.',
      },
    ],
    exemplo: {
      enunciado: 'A área de um círculo de raio 2.',
      passos: areaComPassos('circulo', { raio: 2 }).passos,
    },
    vejaTambem: ['circulo.pi', 'circulo.poligonos', 'riemann.particao'],
  },
  {
    id: 'circulo.poligonos',
    titulo: 'Polígonos regulares e o círculo',
    resumo: 'O círculo é o polígono de infinitos lados.',
    definicao:
      'A área de um polígono regular é o perímetro vezes o apótema, pela metade — basta ligar ' +
      'o centro aos vértices e somar os triângulos. Aumentando o número de lados, o apótema ' +
      'se aproxima do raio e o perímetro se aproxima de 2πr, e a fórmula se torna πr².',
    formulas: [
      { tex: 'A = \\frac{p \\cdot a}{2}' },
      {
        tex: 'n \\to \\infty: \\quad a \\to r, \; p \\to 2\\pi r, \; A \\to \\pi r^{2}',
        legenda: 'O círculo como limite dos polígonos.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Ligando o centro aos n vértices, surgem n triângulos iguais.',
        tex: 'A_{\\triangle} = \\frac{\\ell \\cdot a}{2}',
      },
      {
        descricao: 'Somando os n triângulos, o lado total vira o perímetro.',
        tex: 'A = n \\cdot \\frac{\\ell a}{2} = \\frac{p a}{2}',
      },
      {
        descricao: 'Com muitos lados, o apótema encosta no raio e o perímetro no comprimento.',
        tex: 'A \\to \\frac{2\\pi r \\cdot r}{2} = \\pi r^{2}',
        nota: 'Arquimedes estimou π encaixotando o círculo entre polígonos de 96 lados.',
      },
    ],
    exemplo: {
      enunciado: 'A área de um hexágono regular de lado 2.',
      passos: areaComPassos('poligono-regular', { lados: 6, base: 2, apotema: Math.sqrt(3) }).passos,
    },
    vejaTambem: ['circulo.area', 'angulos.soma'],
  },
];
