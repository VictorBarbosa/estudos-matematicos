import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_AUTOVALORES: readonly Teoria[] = [
  {
    id: 'autovalor.definicao',
    titulo: 'As direções que a matriz não torce',
    resumo: 'A·v = λ·v: o vetor sai paralelo ao que entrou, só esticado.',
    definicao:
      'Uma matriz, aplicada a um vetor, geralmente muda o tamanho E a direção dele. Para ' +
      'algumas direções especiais, porém, ela só muda o tamanho: o vetor sai paralelo ao que ' +
      'entrou, multiplicado por um número. Essa direção é um AUTOVETOR e esse número é o ' +
      'AUTOVALOR — é tudo o que a equação diz. O autovetor nunca é único: qualquer múltiplo ' +
      'dele também serve, porque o que interessa é a direção, não o comprimento. Por isso se ' +
      'escreve um representante, e não «o» autovetor.',
    formulas: [
      {
        tex: 'A\\,v = \\lambda\\,v, \\quad v \\neq 0',
        legenda: 'O v não nulo é essencial: o vetor zero não aponta para direção nenhuma.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Uma matriz e um vetor.',
        tex: 'A = \\begin{pmatrix} 4 & -1 \\\\ 2 & 1 \\end{pmatrix} \\qquad v = \\begin{pmatrix} 1 \\\\ 1 \\end{pmatrix}',
      },
      {
        descricao: 'Aplicando a matriz ao vetor.',
        tex: 'A\\,v = \\begin{pmatrix} 3 \\\\ 3 \\end{pmatrix}',
      },
      {
        descricao: 'Saiu o mesmo vetor, três vezes maior.',
        tex: '\\begin{pmatrix} 3 \\\\ 3 \\end{pmatrix} = 3 \\begin{pmatrix} 1 \\\\ 1 \\end{pmatrix}',
        nota: 'A direção (1, 1) é autovetor, e 3 é o autovalor. Nenhuma torção: só esticou.',
      },
    ],
    vejaTambem: ['autovalor.polinomio', 'autovalor.autovetor'],
  },
  {
    id: 'autovalor.polinomio',
    titulo: 'O polinômio característico',
    resumo: 'det(A − λI) = 0, que em 2×2 é λ² − tr·λ + det = 0.',
    definicao:
      'Procurar λ é procurar quando A − λI mata um vetor não nulo. Uma matriz só leva vetor ' +
      'não nulo a zero se for singular, e singular quer dizer determinante zero — então a ' +
      'condição é det(A − λI) = 0. Abrindo isso numa 2×2 aparece o polinômio característico ' +
      'λ² − tr(A)·λ + det(A) = 0, e as raízes são os autovalores. Quando o discriminante é ' +
      'negativo não há autovalor real, e isso tem significado geométrico: a matriz GIRA, e ' +
      'nenhuma direção sobrevive a ela. Uma rotação de 90° é o exemplo.',
    formulas: [
      {
        tex: '\\det(A - \\lambda I) = 0',
        legenda: 'A condição para existir autovetor não nulo.',
      },
      {
        tex: '\\lambda^2 - \\operatorname{tr}(A)\\lambda + \\det(A) = 0',
        legenda: 'A mesma condição, aberta numa 2×2. Note o MENOS no traço.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Para a matriz do exemplo, traço 5 e determinante 6.',
        tex: '\\operatorname{tr}(A) = 5 \\qquad \\det(A) = 6',
      },
      {
        descricao: 'O polinômio característico.',
        tex: '\\lambda^2 - 5\\lambda + 6 = 0',
      },
      {
        descricao: 'As raízes.',
        tex: '\\lambda_1 = 3 \\qquad \\lambda_2 = 2',
        nota: 'Trocar o sinal do termo em λ daria −3 e −2: é o erro mais comum do tópico.',
      },
    ],
    vejaTambem: ['autovalor.identidades', 'equacao2.bhaskara'],
  },
  {
    id: 'autovalor.identidades',
    titulo: 'A soma é o traço, o produto é o determinante',
    resumo: 'Duas conferências de graça, sem achar os autovalores.',
    definicao:
      'O polinômio característico tem os autovalores como raízes, e as relações entre ' +
      'coeficientes e raízes dão duas identidades que valem sempre: a soma dos autovalores é ' +
      'o traço da matriz e o produto é o determinante. Elas servem para duas coisas. A ' +
      'primeira é prática: quem achou os dois autovalores confere a própria resposta sem ' +
      'gabarito. A segunda é conceitual: se o produto é o determinante, uma matriz com ' +
      'autovalor zero tem determinante zero — ou seja, autovalor zero é a mesma coisa que ' +
      '«não tem inversa».',
    formulas: [
      {
        tex: '\\lambda_1 + \\lambda_2 = \\operatorname{tr}(A) \\qquad \\lambda_1 \\lambda_2 = \\det(A)',
        legenda: 'Valem em qualquer dimensão, somando e multiplicando todos.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Com os autovalores 3 e 2.',
        tex: '3 + 2 = 5 = \\operatorname{tr}(A)',
      },
      {
        descricao: 'E o produto.',
        tex: '3 \\times 2 = 6 = \\det(A)',
      },
      {
        descricao: 'Autovalor zero e determinante zero são a mesma notícia.',
        tex: '\\lambda = 0 \\iff \\det(A) = 0',
        nota: 'A matriz esmaga uma direção inteira em zero, e nada pode desfazer isso.',
      },
    ],
    vejaTambem: ['autovalor.polinomio', 'matrizes.determinante'],
  },
  {
    id: 'autovalor.autovetor',
    titulo: 'Achar a direção',
    resumo: 'Com λ na mão, (A − λI)v = 0 dá o autovetor — e uma linha basta.',
    definicao:
      'Encontrado o autovalor, o autovetor sai de um sistema homogêneo: (A − λI)v = 0. O ' +
      'sistema tem infinitas soluções, e é isso que se espera — qualquer múltiplo do ' +
      'autovetor também é autovetor. Na prática, as duas linhas da 2×2 são proporcionais, e ' +
      'por isso UMA delas resolve. Escrevendo v = (1, k), a primeira linha dá ' +
      '(a − λ) + bk = 0, de onde k = (λ − a)/b. O sinal aí é o tropeço: a conta é λ menos a, e ' +
      'não o contrário.',
    formulas: [
      {
        tex: '(A - \\lambda I)\\,v = 0',
        legenda: 'Sistema homogêneo. Infinitas soluções, todas a mesma direção.',
      },
      {
        tex: 'v = (1,\\, k), \\quad k = \\frac{\\lambda - a}{b}',
        legenda: 'Da primeira linha, quando b não é zero.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Para λ = 3 na matriz do exemplo.',
        tex: '(4 - 3) \\cdot 1 + (-1)k = 0',
      },
      {
        descricao: 'Isolando k.',
        tex: 'k = 1',
      },
      {
        descricao: 'O autovetor, e todos os seus múltiplos.',
        tex: 'v = (1,\\, 1) \\sim (2,\\, 2) \\sim (-5,\\, -5)',
        nota: 'A direção é a resposta; o comprimento é escolha de quem escreve.',
      },
    ],
    vejaTambem: ['autovalor.definicao', 'escalonamento.classificacao'],
  },
  {
    id: 'autovalor.triangular',
    titulo: 'Na triangular, está na diagonal',
    resumo: 'E é por isso que diagonalizar vale o esforço.',
    definicao:
      'Numa matriz triangular, det(A − λI) é o produto dos elementos da diagonal menos λ — os ' +
      'zeros de um dos lados fazem o determinante virar um produto só. As raízes aparecem de ' +
      'graça: são a própria diagonal. Isso não é um caso particular curioso; é o motivo de ' +
      'todo o esforço de diagonalizar uma matriz. Quem consegue escrever A = P D P⁻¹ com D ' +
      'diagonal transformou um problema de matriz num problema de números, e é assim que se ' +
      'resolvem sistemas de equações diferenciais acopladas e se acham modos de vibração.',
    formulas: [
      {
        tex: '\\det(A - \\lambda I) = \\prod (a_{ii} - \\lambda)',
        legenda: 'Para matriz triangular, de qualquer tamanho.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Uma triangular 3×3.',
        tex: '\\begin{pmatrix} 2 & 5 & 1 \\\\ 0 & 7 & 3 \\\\ 0 & 0 & 4 \\end{pmatrix}',
      },
      {
        descricao: 'O determinante deslocado é o produto da diagonal.',
        tex: '(2 - \\lambda)(7 - \\lambda)(4 - \\lambda) = 0',
      },
      {
        descricao: 'Os autovalores, sem conta nenhuma.',
        tex: '\\lambda \\in \\{7,\\, 4,\\, 2\\}',
        nota: 'Os números fora da diagonal não entram: eles não mudam os autovalores.',
      },
    ],
    vejaTambem: ['autovalor.polinomio', 'autovalor.identidades'],
  },
];
