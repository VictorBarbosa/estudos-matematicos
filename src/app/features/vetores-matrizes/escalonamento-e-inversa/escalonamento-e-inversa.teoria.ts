import { gaussJordanComPassos, inversaComPassos } from '@core/math';
import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_ESCALONAMENTO: readonly Teoria[] = [
  {
    id: 'escalonamento.operacoes',
    titulo: 'Operações elementares de linha',
    resumo: 'Três mexidas que mudam a cara do sistema sem mudar as soluções.',
    definicao:
      'Um sistema linear pode ser escrito como uma matriz aumentada (A | b): cada linha é uma ' +
      'equação, cada coluna uma incógnita, e a última coluna guarda os termos independentes. ' +
      'Três operações não alteram o conjunto solução: trocar duas linhas de lugar; multiplicar ' +
      'uma linha por um número diferente de zero; e somar a uma linha um múltiplo de outra. ' +
      'Todo o escalonamento é feito só com elas.',
    formulas: [
      { tex: 'L_{i} \\leftrightarrow L_{j}', legenda: 'Troca: a ordem das equações não importa.' },
      {
        tex: 'L_{i} \\to c\\,L_{i} \\quad (c \\neq 0)',
        legenda: 'Escala: as duas equações são equivalentes.',
      },
      {
        tex: 'L_{i} \\to L_{i} - k\\,L_{j}, \\qquad k = \\frac{a_{ij}}{a_{jj}}',
        legenda: 'Eliminação: k é a entrada a zerar dividida pelo pivô.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Se (x, y, z) satisfaz as equações i e j, satisfaz qualquer combinação delas.',
        tex: 'L_{i} = b_{i},\\; L_{j} = b_{j} \\;\\Rightarrow\\; L_{i} - kL_{j} = b_{i} - kb_{j}',
      },
      {
        descricao:
          'E a operação se desfaz somando k·Lⱼ de volta, então nenhuma solução nasce nem some.',
        tex: '(L_{i} - kL_{j}) + kL_{j} = L_{i}',
        nota: 'Multiplicar por zero não se desfaz — por isso a escala exige c ≠ 0.',
      },
    ],
    exemplo: {
      enunciado: 'Zerar a entrada abaixo do pivô 2 em (2 1 | 5) e (6 4 | 17).',
      passos: [
        {
          descricao: 'O pivô é 2 e a entrada a zerar é 6, então k = 6/2 = 3.',
          tex: 'L_{2} \\to L_{2} - 3L_{1}',
        },
        {
          descricao: 'Entrada por entrada.',
          tex: '(6,\\; 4,\\; 17) - 3\\,(2,\\; 1,\\; 5) = (0,\\; 1,\\; 2)',
          nota: 'A segunda equação virou y = 2.',
        },
      ],
    },
    vejaTambem: ['escalonamento.gauss', 'sistemas.metodos'],
  },
  {
    id: 'escalonamento.gauss',
    titulo: 'Escalonamento e Gauss-Jordan',
    resumo: 'Zerar abaixo de cada pivô, coluna por coluna, até as incógnitas saírem uma a uma.',
    definicao:
      'O método de Gauss usa as operações elementares para deixar a matriz aumentada em forma ' +
      'escalonada: cada linha começa com mais zeros que a de cima. Então a última equação tem ' +
      'uma incógnita só, e as outras saem por substituição de baixo para cima. Gauss-Jordan vai ' +
      'além: divide cada linha pelo seu pivô e zera também ACIMA dele, até a parte das ' +
      'incógnitas virar a identidade — e a última coluna ser a solução. Se um pivô for zero, ' +
      'troca-se a linha com uma de baixo que tenha entrada não nula naquela coluna.',
    formulas: [
      {
        tex: '\\left(\\begin{array}{ccc|c} a & b & c & d \\\\ 0 & e & f & g \\\\ 0 & 0 & h & i \\end{array}\\right)',
        legenda: 'Forma escalonada: triangular, resolvida de baixo para cima.',
      },
      {
        tex: '\\left(\\begin{array}{ccc|c} 1 & 0 & 0 & x \\\\ 0 & 1 & 0 & y \\\\ 0 & 0 & 1 & z \\end{array}\\right)',
        legenda: 'Forma reduzida de Gauss-Jordan: a solução já está na última coluna.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Com o pivô da coluna 1, zeramos a coluna 1 nas outras linhas.',
        tex: 'L_{i} \\to L_{i} - \\frac{a_{i1}}{a_{11}}\\,L_{1}',
      },
      {
        descricao: 'Repetimos com o pivô da coluna 2, depois o da coluna 3.',
        tex: 'L_{i} \\to L_{i} - \\frac{a_{i2}}{a_{22}}\\,L_{2}',
        nota: 'Cada coluna resolvida reduz o problema em uma incógnita.',
      },
      {
        descricao: 'Com tudo triangular, a última linha dá z, e a substituição sobe.',
        tex: 'hz = i \\;\\Rightarrow\\; z = \\frac{i}{h}',
      },
    ],
    exemplo: {
      enunciado: 'x + y + z = 6, 2x + 3y + z = 11, x − y + 2z = 5.',
      passos: gaussJordanComPassos([
        [1, 1, 1, 6],
        [2, 3, 1, 11],
        [1, -1, 2, 5],
      ]).passos,
    },
    vejaTambem: ['escalonamento.operacoes', 'escalonamento.classificacao'],
  },
  {
    id: 'escalonamento.classificacao',
    titulo: 'Classificar o sistema pela forma escalonada',
    resumo: 'Uma linha 0 = c diz impossível; uma coluna sem pivô diz infinitas soluções.',
    definicao:
      'Depois de escalonar, o tipo do sistema se lê nas últimas linhas. Se aparecer uma linha ' +
      '0 0 0 | c com c ≠ 0, ela diz 0 = c: o sistema é impossível (SI), sem solução. Se não ' +
      'houver contradição e todas as colunas das incógnitas tiverem pivô, a solução é única: ' +
      'possível e determinado (SPD). Se alguma coluna ficar sem pivô — típico de uma linha ' +
      '0 0 0 | 0 —, a variável dela é livre e há infinitas soluções: possível e indeterminado ' +
      '(SPI). Para matriz quadrada, solução única equivale a det A ≠ 0.',
    formulas: [
      {
        tex: '\\text{posto}(A) < \\text{posto}(A|b) \\;\\Rightarrow\\; \\text{SI}',
        legenda: 'Uma linha 0 = c a mais na aumentada.',
      },
      {
        tex: '\\text{posto}(A) = \\text{posto}(A|b) = n \\;\\Rightarrow\\; \\text{SPD}',
        legenda: 'Um pivô por incógnita.',
      },
      {
        tex: '\\text{posto}(A) = \\text{posto}(A|b) < n \\;\\Rightarrow\\; \\text{SPI}',
        legenda: 'Variáveis livres: n menos o posto.',
      },
    ],
    demonstracao: [
      {
        descricao: 'A linha 0x + 0y + 0z = c com c ≠ 0 não é satisfeita por nenhum (x, y, z).',
        tex: '0 = c \\neq 0 \\;\\Rightarrow\\; S = \\varnothing',
      },
      {
        descricao:
          'Já 0 = 0 vale sempre: a equação era combinação das outras e não restringe nada.',
        tex: '0 = 0',
        nota: 'Sobram menos equações úteis que incógnitas, e uma delas fica livre.',
      },
    ],
    exemplo: {
      enunciado:
        'x + y + z = 3, x + 2y + 3z = 6, 2x + 3y + 4z = 10 (a terceira linha é a soma das duas primeiras, com 10 no lugar de 9).',
      passos: gaussJordanComPassos([
        [1, 1, 1, 3],
        [1, 2, 3, 6],
        [2, 3, 4, 10],
      ]).passos,
    },
    vejaTambem: ['escalonamento.gauss', 'sistemas.classificacao', 'matrizes.determinante'],
  },
  {
    id: 'escalonamento.inversa',
    titulo: 'Matriz inversa',
    resumo: 'A⁻¹ desfaz A; existe exatamente quando det A ≠ 0.',
    definicao:
      'A inversa de uma matriz quadrada A é a matriz A⁻¹ com A·A⁻¹ = A⁻¹·A = I. Ela existe ' +
      'se, e só se, det A ≠ 0. Na 2×2 há uma fórmula: troca-se a diagonal principal, muda-se ' +
      'o sinal da outra diagonal (é a adjunta) e divide-se tudo pelo determinante. Em ordem ' +
      'maior, escreve-se A ao lado da identidade, (A | I), e escalona-se até a esquerda virar ' +
      'I: a direita é A⁻¹. Com ela, o sistema Ax = b se resolve como x = A⁻¹b.',
    formulas: [
      {
        tex: 'A^{-1} = \\frac{1}{ad - bc}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}',
        legenda: 'Para A = (a b; c d), com ad − bc ≠ 0.',
      },
      {
        tex: '(A \\mid I) \\;\\to\\; (I \\mid A^{-1})',
        legenda: 'Gauss-Jordan, em qualquer ordem.',
      },
      { tex: 'Ax = b \\;\\Rightarrow\\; x = A^{-1}b' },
    ],
    demonstracao: [
      {
        descricao: 'Multiplicando A pela adjunta, os termos cruzados se cancelam.',
        tex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix} = \\begin{pmatrix} ad - bc & 0 \\\\ 0 & ad - bc \\end{pmatrix}',
      },
      {
        descricao: 'Dividindo pelo determinante, sobra a identidade.',
        tex: 'A \\cdot \\frac{\\text{adj}\\,A}{\\det A} = I',
        nota: 'Com det A = 0 a divisão é impossível — e não há inversa.',
      },
    ],
    exemplo: {
      enunciado: 'A inversa de A = (2 1; 5 3).',
      passos: inversaComPassos([
        [2, 1],
        [5, 3],
      ]).passos,
    },
    vejaTambem: ['matrizes.determinante', 'escalonamento.gauss'],
  },
];
