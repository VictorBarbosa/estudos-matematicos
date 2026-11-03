import { Teoria } from '@core/teoria/models/teoria.model';
import {
  anguloEntreVetores3ComPassos,
  modulo3ComPassos,
  produtoVetorial3ComPassos,
  volumeDoParalelepipedoComPassos,
} from '@core/math';

export const TEORIA_VETORES_ESPACO: readonly Teoria[] = [
  {
    id: 'vetores3.componentes',
    titulo: 'Três componentes',
    resumo: 'O plano é onde se aprende; o espaço é onde a engenharia acontece.',
    definicao:
      'Um vetor no espaço tem três componentes, uma para cada eixo perpendicular. Escreve-se ' +
      'como terna ordenada — (3, −1, 2) — ou somando os vetores unitários dos eixos: ' +
      '3i − j + 2k. As duas formas dizem a mesma coisa, e a segunda deixa explícito que cada ' +
      'componente é um deslocamento ao longo de uma direção.',
    formulas: [
      {
        tex: '\\vec{v} = (v_x,\\; v_y,\\; v_z) = v_x\\vec{i} + v_y\\vec{j} + v_z\\vec{k}',
        legenda: 'A mesma informação, escrita de dois jeitos.',
      },
      {
        tex: '\\vec{a} + \\vec{b} = (a_x + b_x,\\; a_y + b_y,\\; a_z + b_z)',
        legenda: 'Soma e subtração são componente a componente, como no plano.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Os três eixos são perpendiculares dois a dois.',
        tex: '\\vec{i} \\cdot \\vec{j} = \\vec{j} \\cdot \\vec{k} = \\vec{i} \\cdot \\vec{k} = 0',
        nota: 'É isso que permite tratar cada direção separadamente.',
      },
      {
        descricao: 'E cada um tem módulo 1.',
        tex: '\\left|\\vec{i}\\right| = \\left|\\vec{j}\\right| = \\left|\\vec{k}\\right| = 1',
      },
    ],
    vejaTambem: ['vetores3.modulo', 'vetores3.escalar', 'vetores.definicao'],
  },
  {
    id: 'vetores3.modulo',
    titulo: 'Módulo no espaço',
    resumo: 'Pitágoras aplicado duas vezes.',
    definicao:
      'O módulo é o comprimento do vetor, e sai do mesmo teorema de sempre — só que em duas ' +
      'etapas. Primeiro a diagonal no plano xy, que vale √(x² + y²); depois a diagonal do ' +
      'bloco, que combina essa com o z. O resultado é a raiz da soma dos três quadrados, e ' +
      'nunca é negativo.',
    formulas: [
      { tex: '\\left|\\vec{v}\\right| = \\sqrt{v_x^2 + v_y^2 + v_z^2}' },
      { tex: '\\left|(1,\\,2,\\,2)\\right| = \\sqrt{1 + 4 + 4} = 3', legenda: 'Um terno que dá inteiro.' },
    ],
    demonstracao: [
      {
        descricao: 'A diagonal da base, por Pitágoras.',
        tex: 'd_{xy} = \\sqrt{v_x^2 + v_y^2}',
      },
      {
        descricao: 'Essa diagonal e a altura formam outro triângulo retângulo.',
        tex: '\\left|\\vec{v}\\right| = \\sqrt{d_{xy}^2 + v_z^2} = \\sqrt{v_x^2 + v_y^2 + v_z^2}',
        nota: 'Somar as componentes daria outro número — e maior.',
      },
    ],
    exemplo: {
      enunciado: 'O módulo de (2, 3, 6).',
      passos: modulo3ComPassos({ x: 2, y: 3, z: 6 }).passos,
    },
    vejaTambem: ['vetores3.unitario', 'vetores3.componentes'],
  },
  {
    id: 'vetores3.escalar',
    titulo: 'Produto escalar',
    resumo: 'Devolve um número, e esse número é o ângulo disfarçado.',
    definicao:
      'Multiplicar componentes de mesmo nome e somar tudo dá um número — não um vetor. Esse ' +
      'número carrega o ângulo entre os dois: é positivo quando eles apontam para o mesmo ' +
      'lado, negativo quando apontam para lados opostos, e exatamente zero quando são ' +
      'perpendiculares. É por isso que o produto escalar é o teste de perpendicularidade.',
    formulas: [
      { tex: '\\vec{a} \\cdot \\vec{b} = a_x b_x + a_y b_y + a_z b_z' },
      {
        tex: '\\vec{a} \\cdot \\vec{b} = \\left|\\vec{a}\\right|\\left|\\vec{b}\\right|\\cos\\theta',
        legenda: 'A mesma conta, lida geometricamente.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Perpendiculares dão zero, porque o cosseno de 90° é zero.',
        tex: '(1,\\,0,\\,0) \\cdot (0,\\,1,\\,0) = 0',
      },
      {
        descricao: 'O escalar de um vetor com ele mesmo é o quadrado do módulo.',
        tex: '\\vec{v} \\cdot \\vec{v} = \\left|\\vec{v}\\right|^2',
        nota: 'Atalho útil: evita a raiz quando só se quer comparar comprimentos.',
      },
    ],
    vejaTambem: ['vetores3.angulo', 'vetores3.vetorial'],
  },
  {
    id: 'vetores3.vetorial',
    titulo: 'Produto vetorial',
    resumo: 'Só existe no espaço — e devolve um vetor perpendicular aos dois.',
    definicao:
      'É a operação que o plano não tem. O resultado é um vetor perpendicular aos dois ' +
      'originais, com módulo igual à área do paralelogramo que eles formam e sentido dado pela ' +
      'regra da mão direita. Torque e momento angular são produtos vetoriais, e é por isso que ' +
      'os dois apontam numa direção que não é a do movimento.',
    formulas: [
      {
        tex:
          '\\vec{a} \\times \\vec{b} = \\begin{vmatrix} \\vec{i} & \\vec{j} & \\vec{k} \\\\ ' +
          'a_x & a_y & a_z \\\\ b_x & b_y & b_z \\end{vmatrix}',
        legenda: 'O determinante simbólico organiza as seis multiplicações.',
      },
      {
        tex: '\\left|\\vec{a} \\times \\vec{b}\\right| = \\left|\\vec{a}\\right|\\left|\\vec{b}\\right|\\sin\\theta',
        legenda: 'Máximo quando são perpendiculares; zero quando são paralelos.',
      },
    ],
    demonstracao: [
      {
        descricao: 'A ordem importa: trocar os vetores troca o sinal.',
        tex: '\\vec{a} \\times \\vec{b} = -\\,\\vec{b} \\times \\vec{a}',
        nota: 'No escalar isso não acontece — lá a ordem é indiferente.',
      },
      {
        descricao: 'O resultado é perpendicular aos dois, o que dá para conferir.',
        tex: '\\vec{a} \\cdot (\\vec{a} \\times \\vec{b}) = 0',
      },
      {
        descricao: 'A componente y tem a ordem dos termos trocada.',
        tex: '(\\vec{a} \\times \\vec{b})_y = a_z b_x - a_x b_z',
        nota: 'É o erro de sinal mais comum do assunto.',
      },
    ],
    exemplo: {
      enunciado: 'O produto vetorial de (2, 1, −1) por (1, 3, 2).',
      passos: produtoVetorial3ComPassos({ x: 2, y: 1, z: -1 }, { x: 1, y: 3, z: 2 }).passos,
    },
    vejaTambem: ['vetores3.escalar', 'vetores3.misto'],
  },
  {
    id: 'vetores3.angulo',
    titulo: 'Ângulo entre vetores',
    resumo: 'O produto escalar dividido pelos módulos é o cosseno.',
    definicao:
      'Das duas escritas do produto escalar sai o ângulo: isolando o cosseno, basta dividir o ' +
      'produto escalar pelo produto dos módulos e tomar o arco-cosseno. O resultado vem entre ' +
      '0° e 180°, que é a faixa em que o ângulo entre dois vetores faz sentido.',
    formulas: [
      {
        tex: '\\cos\\theta = \\frac{\\vec{a} \\cdot \\vec{b}}{\\left|\\vec{a}\\right|\\left|\\vec{b}\\right|}',
      },
    ],
    demonstracao: [
      {
        descricao: 'Cosseno positivo: ângulo agudo.',
        tex: '\\cos\\theta > 0 \\;\\Rightarrow\\; \\theta < 90^\\circ',
      },
      {
        descricao: 'Cosseno negativo: os vetores apontam para lados opostos.',
        tex: '\\cos\\theta < 0 \\;\\Rightarrow\\; \\theta > 90^\\circ',
      },
    ],
    exemplo: {
      enunciado: 'O ângulo entre (1, 0, 0) e (1, 1, 0).',
      passos: anguloEntreVetores3ComPassos({ x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }).passos,
    },
    vejaTambem: ['vetores3.escalar', 'vetores3.unitario'],
  },
  {
    id: 'vetores3.unitario',
    titulo: 'Vetor unitário',
    resumo: 'A direção, sem o tamanho.',
    definicao:
      'Dividir um vetor pelo próprio módulo produz outro de comprimento 1, na mesma direção e ' +
      'sentido. Serve para separar duas informações que costumam vir juntas: para onde a coisa ' +
      'aponta e quão intensa ela é. Uma força de 50 N numa direção se escreve como 50 vezes o ' +
      'unitário daquela direção.',
    formulas: [
      { tex: '\\hat{v} = \\frac{\\vec{v}}{\\left|\\vec{v}\\right|} \\qquad \\left|\\hat{v}\\right| = 1' },
      {
        tex: '\\vec{F} = \\left|\\vec{F}\\right| \\cdot \\hat{u}',
        legenda: 'Intensidade vezes direção — o jeito de escrever uma força.',
      },
    ],
    demonstracao: [
      {
        descricao: 'As componentes do unitário são os cossenos diretores.',
        tex: '\\hat{v} = (\\cos\\alpha,\\; \\cos\\beta,\\; \\cos\\gamma)',
        nota: 'Cada uma é o cosseno do ângulo com o eixo correspondente.',
      },
      {
        descricao: 'E eles satisfazem uma identidade.',
        tex: '\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1',
      },
    ],
    vejaTambem: ['vetores3.modulo', 'vetores3.componentes'],
  },
  {
    id: 'vetores3.misto',
    titulo: 'Produto misto e volume',
    resumo: 'Zero significa que os três cabem num mesmo plano.',
    definicao:
      'O escalar de um vetor com o produto vetorial dos outros dois é o produto misto, e o ' +
      'módulo dele é o volume do paralelepípedo que os três formam. O sinal diz a orientação ' +
      'da terna; o zero diz que os três são coplanares — que é a pergunta geométrica que esse ' +
      'número responde de uma vez.',
    formulas: [
      { tex: 'V = \\left|\\vec{a} \\cdot (\\vec{b} \\times \\vec{c})\\right|' },
      {
        tex:
          '\\vec{a} \\cdot (\\vec{b} \\times \\vec{c}) = \\begin{vmatrix} a_x & a_y & a_z \\\\ ' +
          'b_x & b_y & b_z \\\\ c_x & c_y & c_z \\end{vmatrix}',
        legenda: 'É o determinante da matriz montada com os três.',
      },
    ],
    demonstracao: [
      {
        descricao: 'Três vetores no mesmo plano não cercam volume nenhum.',
        tex: '\\vec{a} \\cdot (\\vec{b} \\times \\vec{c}) = 0 \\;\\Leftrightarrow\\; \\text{coplanares}',
      },
      {
        descricao: 'Trocar dois vetores de lugar troca o sinal, mas não o volume.',
        tex: '\\left|\\vec{a} \\cdot (\\vec{b} \\times \\vec{c})\\right| = \\left|\\vec{b} \\cdot (\\vec{a} \\times \\vec{c})\\right|',
      },
    ],
    exemplo: {
      enunciado: 'O volume formado por (1,0,0), (0,2,0) e (0,0,3).',
      passos: volumeDoParalelepipedoComPassos({ x: 1, y: 0, z: 0 }, { x: 0, y: 2, z: 0 }, { x: 0, y: 0, z: 3 }).passos,
    },
    vejaTambem: ['vetores3.vetorial', 'matrizes.determinante'],
  },
];
