import { cramerComPassos, determinanteComPassos, multiplicarComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

export const TEORIA_MATRIZES: readonly Teoria[] = [
  {
    id: 'matrizes.produto',
    titulo: 'Linha por coluna',
    resumo: 'Cada entrada do produto é um produto escalar.',
    definicao:
      'Multiplicar matrizes não é multiplicar entrada por entrada. Cada posição do resultado ' +
      'é o produto escalar entre uma linha da primeira e uma coluna da segunda — e é por isso ' +
      'que as ordens precisam encaixar, e que o produto não comuta.',
    formulas: [
      { tex: 'c_{ij} = \\sum_k a_{ik} b_{kj}' },
      {
        tex: '(m \\times n)(n \\times p) = (m \\times p)',
        legenda: 'As colunas da primeira precisam igualar as linhas da segunda.',
      },
      {
        tex: 'AB \\ne BA',
        legenda: 'Em geral, a ordem dos fatores altera o produto.',
      },
    ],
    demonstracao: [
      {
        descricao: 'A matriz representa uma transformação; o produto representa aplicá-las em sequência.',
        tex: '(AB)\\vec{v} = A(B\\vec{v})',
        nota: 'B age primeiro — daí a ordem importar.',
      },
      {
        descricao: 'Girar e depois esticar não é o mesmo que esticar e depois girar.',
        tex: 'AB \\ne BA',
      },
      {
        descricao: 'Cada entrada acumula as contribuições de uma linha sobre uma coluna.',
        tex: 'c_{ij} = \\sum_k a_{ik} b_{kj}',
      },
    ],
    exemplo: {
      enunciado: 'O produto de duas matrizes 2×2.',
      passos: multiplicarComPassos(
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ],
      ).passos,
    },
    vejaTambem: ['matrizes.determinante', 'matrizes.cramer'],
  },
  {
    id: 'matrizes.determinante',
    titulo: 'Determinante como área',
    resumo: 'O quanto a transformação estica — e zero significa achatar.',
    definicao:
      'O determinante de uma matriz 2×2 é, em módulo, a área do paralelogramo formado por ' +
      'suas linhas. Ele diz por quanto a transformação multiplica áreas; quando é zero, a ' +
      'transformação esmaga o plano numa reta, e informação é perdida de forma irreversível.',
    formulas: [
      { tex: '\\det \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc' },
      {
        tex: '\\det(AB) = \\det A \\cdot \\det B',
        legenda: 'Áreas se multiplicam quando transformações se compõem.',
      },
      {
        tex: '\\det A = 0 \\iff \\text{linhas proporcionais}',
        legenda: 'Sem área, sem inversa, sem solução única.',
      },
    ],
    demonstracao: [
      {
        descricao: 'As linhas da matriz, vistas como vetores, formam um paralelogramo.',
        tex: '\\vec{u} = (a, b) \\qquad \\vec{v} = (c, d)',
      },
      {
        descricao: 'A área desse paralelogramo é o módulo do produto vetorial.',
        tex: '|u_x v_y - u_y v_x| = |ad - bc|',
        nota: 'O determinante 2×2 é exatamente o produto vetorial no plano.',
      },
      {
        descricao: 'Se as linhas são proporcionais, elas são paralelas e não há área.',
        tex: '\\vec{v} = k\\vec{u} \;\\Rightarrow\; \\det = 0',
      },
      {
        descricao: 'Em ordens maiores, a expansão em cofatores reduz o problema.',
        tex: '\\det A = \\sum_j (-1)^{1+j} a_{1j}\\det A_{1j}',
      },
    ],
    exemplo: {
      enunciado: 'O determinante de uma matriz com linhas proporcionais.',
      passos: determinanteComPassos([
        [2, 4],
        [1, 2],
      ]).passos,
    },
    vejaTambem: ['matrizes.produto', 'matrizes.cramer', 'produtos.vetorial'],
  },
  {
    id: 'matrizes.cramer',
    titulo: 'Regra de Cramer',
    resumo: 'O determinante no denominador explica tudo.',
    definicao:
      'Cramer resolve um sistema linear com determinantes: cada incógnita é a razão entre o ' +
      'determinante da matriz com uma coluna substituída e o determinante principal. Como o ' +
      'principal aparece dividindo, determinante zero significa que não existe solução única.',
    formulas: [
      { tex: 'x_j = \\frac{\\det A_j}{\\det A}' },
      {
        tex: '\\det A = 0 \;\\Rightarrow\; \\text{sem solução única}',
        legenda: 'Sistema impossível ou indeterminado.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Escrevemos o sistema na forma matricial.',
        tex: 'A\\vec{x} = \\vec{b}',
      },
      {
        descricao: 'Substituir a coluna j pelas constantes e dividir isola a incógnita.',
        tex: 'x_j = \\frac{\\det A_j}{\\det A}',
      },
      {
        descricao: 'Com determinante nulo, a divisão é impossível — e geometricamente as retas são paralelas.',
        tex: '\\det A = 0',
        nota: 'Retas paralelas nunca se cruzam; coincidentes se cruzam em infinitos pontos.',
      },
    ],
    exemplo: {
      enunciado: 'Resolvendo x + y = 5 e x − y = 1.',
      passos: cramerComPassos(
        [
          [1, 1],
          [1, -1],
        ],
        [5, 1],
      ).passos,
    },
    vejaTambem: ['matrizes.determinante', 'sistemas.substituicao'],
  },
];
