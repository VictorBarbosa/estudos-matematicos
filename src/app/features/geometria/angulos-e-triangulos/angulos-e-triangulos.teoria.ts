import { somaAngulosInternosComPassos } from '@core/math';
import { Teoria } from '@core/teoria/teoria.model';

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
        descricao: 'No triângulo, a soma é 180°: uma paralela a um lado mostra os três ângulos juntos.',
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
];
