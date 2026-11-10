import { Teoria } from '@core/teoria/models/teoria.model';

export const TEORIA_POLIEDROS: readonly Teoria[] = [
  {
    id: 'poliedros.euler',
    titulo: 'A relação de Euler',
    resumo: 'Em todo poliedro convexo, V − A + F = 2.',
    definicao:
      'Um poliedro é um sólido limitado por faces planas; arestas são os segmentos onde duas ' +
      'faces se encontram e vértices, os pontos onde as arestas se encontram. Para qualquer ' +
      'poliedro convexo, o número de vértices menos o de arestas mais o de faces dá sempre 2. ' +
      'Com dois desses números, o terceiro sai de graça.',
    formulas: [{ tex: 'V - A + F = 2' }],
    demonstracao: [
      {
        descricao:
          'Tire uma face e achate o resto no plano: vira uma rede de polígonos, com F − 1 regiões.',
        tex: 'V - A + (F - 1) = 1 \\;\\text{ (a rede plana)}',
      },
      {
        descricao:
          'Apagar uma aresta que separa duas regiões tira uma aresta e uma região: a conta não muda.',
        tex: '(V) - (A - 1) + (F - 2) = V - A + F - 1',
        nota: 'Repetindo até sobrar um só triângulo: 3 − 3 + 1 = 1. Devolvendo a face retirada, 2.',
      },
    ],
    exemplo: {
      enunciado: 'Um poliedro tem 12 vértices e 30 arestas. Quantas faces?',
      passos: [
        { descricao: 'Euler.', tex: 'F = 2 - V + A = 2 - 12 + 30 = 20' },
        { descricao: 'É o icosaedro.', tex: 'F = 20' },
      ],
    },
    vejaTambem: ['poliedros.contagem', 'poliedros.platao'],
  },
  {
    id: 'poliedros.contagem',
    titulo: 'Contar arestas pelas faces ou pelos vértices',
    resumo: 'Cada aresta está em duas faces e tem duas pontas: conta-se tudo e divide-se por 2.',
    definicao:
      'Somando os lados de todas as faces, cada aresta aparece duas vezes, porque ela é a divisa ' +
      'entre duas faces: 2A = soma dos lados. Do mesmo modo, somando quantas arestas chegam a cada ' +
      'vértice, cada aresta aparece duas vezes (uma por ponta): 2A = soma dos graus. Junto com ' +
      'Euler, essas contagens resolvem quase tudo.',
    formulas: [
      {
        tex: '2A = \\sum_{\\text{faces}} (\\text{lados}) \\qquad 2A = \\sum_{\\text{vértices}} (\\text{arestas que chegam})',
      },
    ],
    demonstracao: [
      {
        descricao: 'Num cubo, 6 faces de 4 lados dão 24 lados; mas cada aresta está em duas faces.',
        tex: '2A = 6 \\cdot 4 = 24 \\;\\Rightarrow\\; A = 12',
      },
      {
        descricao: 'Pelos vértices: 8 vértices com 3 arestas cada dão 24 pontas.',
        tex: '2A = 8 \\cdot 3 = 24 \\;\\Rightarrow\\; A = 12',
      },
    ],
    exemplo: {
      enunciado: 'Bola de futebol: 12 pentágonos e 20 hexágonos. Quantos vértices?',
      passos: [
        {
          descricao: 'Arestas pelas faces.',
          tex: '2A = 12 \\cdot 5 + 20 \\cdot 6 = 180 \\;\\Rightarrow\\; A = 90',
        },
        { descricao: 'Faces.', tex: 'F = 12 + 20 = 32' },
        { descricao: 'Euler.', tex: 'V = 90 - 32 + 2 = 60' },
      ],
    },
    vejaTambem: ['poliedros.euler'],
  },
  {
    id: 'poliedros.platao',
    titulo: 'Os cinco poliedros de Platão',
    resumo: 'Só existem cinco poliedros com faces regulares iguais e vértices iguais.',
    definicao:
      'Se todas as faces são o mesmo polígono regular e em cada vértice se encontram o mesmo ' +
      'número de faces, a soma dos ângulos em volta de um vértice precisa ser menor que 360° (senão ' +
      'achata). Com triângulos cabem 3, 4 ou 5 por vértice; com quadrados, 3; com pentágonos, 3. ' +
      'São cinco: tetraedro, octaedro, icosaedro, cubo e dodecaedro.',
    formulas: [
      {
        tex: '\\text{tetraedro } (4, 6, 4) \\quad \\text{cubo } (8, 12, 6) \\quad \\text{octaedro } (6, 12, 8)',
      },
      {
        tex: '\\text{dodecaedro } (20, 30, 12) \\quad \\text{icosaedro } (12, 30, 20)',
        legenda: '(V, A, F)',
      },
    ],
    demonstracao: [
      {
        descricao: 'Em volta de um vértice, os ângulos das faces somam menos de 360°.',
        tex: 'k \\cdot a_i < 360^\\circ',
      },
      {
        descricao: 'Hexágonos já não servem: três de 120° fecham 360° e ficam planos.',
        tex: '3 \\cdot 120^\\circ = 360^\\circ',
      },
    ],
    exemplo: {
      enunciado: 'Quantas arestas tem o dodecaedro (12 faces pentagonais)?',
      passos: [
        {
          descricao: 'Contando pelas faces.',
          tex: '2A = 12 \\cdot 5 = 60 \\;\\Rightarrow\\; A = 30',
        },
      ],
    },
    vejaTambem: ['poliedros.contagem', 'angulos.poligono-regular'],
  },
  {
    id: 'poliedros.prismas',
    titulo: 'Prismas e pirâmides',
    resumo: 'Base de n lados: prisma (2n, 3n, n + 2); pirâmide (n + 1, 2n, n + 1).',
    definicao:
      'O prisma tem duas bases iguais de n lados ligadas por n faces laterais (paralelogramos): ' +
      '2n vértices, 3n arestas (n em cada base e n laterais) e n + 2 faces. A pirâmide tem uma base ' +
      'de n lados e um vértice no topo ligado a cada vértice da base: n + 1 vértices, 2n arestas ' +
      'e n + 1 faces (n triângulos e a base).',
    formulas: [
      { tex: '\\text{prisma: } V = 2n,\\; A = 3n,\\; F = n + 2' },
      { tex: '\\text{pirâmide: } V = n + 1,\\; A = 2n,\\; F = n + 1' },
    ],
    demonstracao: [
      { descricao: 'Euler confere o prisma.', tex: '2n - 3n + (n + 2) = 2' },
      { descricao: 'E a pirâmide.', tex: '(n + 1) - 2n + (n + 1) = 2' },
    ],
    exemplo: {
      enunciado: 'Prisma de base hexagonal.',
      passos: [
        { descricao: 'n = 6.', tex: 'V = 12,\\; A = 18,\\; F = 8' },
        { descricao: 'Conferindo.', tex: '12 - 18 + 8 = 2' },
      ],
    },
    vejaTambem: ['poliedros.euler', 'solidos.base-altura'],
  },
];
