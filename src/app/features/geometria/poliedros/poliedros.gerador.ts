import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const exato = (a: number, b: number): boolean => Math.abs(a - b) < 1e-9;

type Pergunta = 'euler' | 'prisma-piramide' | 'faces-iguais' | 'faces-mistas' | 'grau';

/** Poliedros reais, com as contagens conferidas: V − A + F = 2 em todos. */
interface Exemplo {
  readonly nome: string;
  readonly v: number;
  readonly a: number;
  readonly f: number;
}

const NOME_BASE: Readonly<Record<number, string>> = {
  3: 'triangular',
  4: 'quadrangular',
  5: 'pentagonal',
  6: 'hexagonal',
  7: 'heptagonal',
  8: 'octogonal',
  10: 'decagonal',
};

const BASES = [3, 4, 5, 6, 7, 8, 10];

function catalogo(nivel: Nivel): Exemplo[] {
  // Nos níveis altos, famílias com bases de até 20 lados: os números crescem e
  // a fórmula precisa ser usada de verdade, não reconhecida de memória.
  const grandes = nivel === 'dificil' || nivel === 'extremo';
  const ns = grandes ? Array.from({ length: 18 }, (_, i) => i + 3) : [];
  return [
    ...ns.map((n) => ({ nome: `prisma de base com ${n} lados`, v: 2 * n, a: 3 * n, f: n + 2 })),
    ...ns.map((n) => ({ nome: `pirâmide de base com ${n} lados`, v: n + 1, a: 2 * n, f: n + 1 })),
    ...ns.map((n) => ({
      nome: `antiprisma de base com ${n} lados`,
      v: 2 * n,
      a: 4 * n,
      f: 2 * n + 2,
    })),
    { nome: 'tetraedro', v: 4, a: 6, f: 4 },
    { nome: 'cubo', v: 8, a: 12, f: 6 },
    { nome: 'octaedro', v: 6, a: 12, f: 8 },
    { nome: 'dodecaedro', v: 20, a: 30, f: 12 },
    { nome: 'icosaedro', v: 12, a: 30, f: 20 },
    { nome: 'cuboctaedro', v: 12, a: 24, f: 14 },
    { nome: 'icosaedro truncado (a bola de futebol)', v: 60, a: 90, f: 32 },
    ...BASES.map((n) => ({ nome: `prisma de base ${NOME_BASE[n]}`, v: 2 * n, a: 3 * n, f: n + 2 })),
    ...BASES.map((n) => ({
      nome: `pirâmide de base ${NOME_BASE[n]}`,
      v: n + 1,
      a: 2 * n,
      f: n + 1,
    })),
  ];
}

/**
 * Poliedros e a relação de Euler.
 *
 * Contar vértices, arestas e faces sem desenhar tudo: V − A + F = 2 liga as
 * três contagens, e «cada aresta está em duas faces» (ou «liga dois
 * vértices») dá a segunda equação. As perguntas sobem da fórmula pronta ao
 * sistema que essas duas ideias montam juntas.
 */
export const geradorPoliedros: GeradorExercicio<number> = {
  topicoId: 'poliedros',
  formatoResposta: 'um número inteiro, ex.: 12',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'euler':
        return euler(nivel, rng);
      case 'prisma-piramide':
        return prismaPiramide(nivel, rng);
      case 'faces-iguais':
        return facesIguais(nivel, rng);
      case 'faces-mistas':
        return facesMistas(nivel, rng);
      case 'grau':
        return grau(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes: exato,
  formatar: (v) => String(v),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['euler', 'prisma-piramide']);
    case 'medio':
      return rng.escolher<Pergunta>(['prisma-piramide', 'faces-iguais', 'euler']);
    case 'dificil':
      return rng.escolher<Pergunta>(['faces-mistas', 'faces-iguais', 'euler']);
    // Pelo grau dos vértices: as duas contagens (faces e vértices) entram
    // juntas com Euler, e a resposta sai de um sistema, não de uma fórmula.
    case 'extremo':
      return rng.escolher<Pergunta>(['grau', 'faces-mistas', 'euler']);
  }
}

function euler(nivel: Nivel, rng: Rng): Exercicio<number> {
  const p = rng.escolher(catalogo(nivel));
  const falta = rng.escolher(['v', 'a', 'f'] as const);
  const gabarito = p[falta];
  const nomes = { v: 'vértices', a: 'arestas', f: 'faces' };
  const dados = (['v', 'a', 'f'] as const).filter((k) => k !== falta);
  const formula = {
    v: `V = A - F + 2 = ${p.a} - ${p.f} + 2 = ${p.v}`,
    a: `A = V + F - 2 = ${p.v} + ${p.f} - 2 = ${p.a}`,
    f: `F = A - V + 2 = ${p.a} - ${p.v} + 2 = ${p.f}`,
  }[falta];

  return {
    id: `poli-euler-${p.v}-${p.a}-${p.f}-${falta}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um poliedro convexo tem ${p[dados[0]!]} ${nomes[dados[0]!]} e ${p[dados[1]!]} ${nomes[dados[1]!]}. ` +
      `Quantos ${nomes[falta]} ele tem?`,
    enunciadoTex: `V - A + F = 2`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Em todo poliedro convexo vale a relação de Euler.',
          tex: 'V - A + F = 2',
        },
        { descricao: `Isolando ${nomes[falta]} e substituindo.`, tex: formula },
        {
          descricao: `É o ${p.nome}.`,
          tex: `${falta.toUpperCase()} = ${gabarito}`,
        },
      ],
    },
    conceitos: ['poliedros.euler'],
    armadilhas: semColisoes(
      [
        {
          resposta: falta === 'a' ? p.v + p.f + 2 : falta === 'v' ? p.a - p.f - 2 : p.a - p.v - 2,
          diagnostico:
            'O 2 entrou com o sinal trocado. Confira: V − A + F = 2, então A = V + F − 2.',
          passo: 1,
          conceito: 'poliedros.euler',
        },
        {
          resposta: p[dados[0]!] + p[dados[1]!],
          diagnostico:
            'Somar os dois números não é a relação. Arestas entram com sinal de menos: V − A + F = 2.',
          passo: 0,
          conceito: 'poliedros.euler',
        },
      ],
      gabarito,
      exato,
    ),
    dica:
      nivel === 'facil' || nivel === 'medio'
        ? `Use V − A + F = 2 com os dois números dados e isole o que falta.`
        : undefined,
  };
}

function prismaPiramide(nivel: Nivel, rng: Rng): Exercicio<number> {
  const n = rng.escolher(BASES);
  const ePrisma = rng.booleano();
  const pede = rng.escolher(['v', 'a', 'f'] as const);
  const contagens = ePrisma ? { v: 2 * n, a: 3 * n, f: n + 2 } : { v: n + 1, a: 2 * n, f: n + 1 };
  const gabarito = contagens[pede];
  const solido = ePrisma ? 'prisma' : 'pirâmide';
  const nomes = { v: 'vértices', a: 'arestas', f: 'faces' };
  const explicacao = ePrisma
    ? {
        v: `${n} na base de baixo e ${n} na de cima`,
        a: `${n} em cada base e ${n} laterais`,
        f: `${n} faces laterais mais as 2 bases`,
      }
    : {
        v: `${n} na base mais o vértice do topo`,
        a: `${n} na base e ${n} subindo até o topo`,
        f: `${n} faces laterais triangulares mais a base`,
      };
  const formula = ePrisma
    ? { v: `2n = 2 \\cdot ${n}`, a: `3n = 3 \\cdot ${n}`, f: `n + 2 = ${n} + 2` }
    : { v: `n + 1 = ${n} + 1`, a: `2n = 2 \\cdot ${n}`, f: `n + 1 = ${n} + 1` };

  return {
    id: `poli-pp-${solido}-${n}-${pede}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Quantos ${nomes[pede]} tem ${ePrisma ? 'um' : 'uma'} ${solido} de base ${NOME_BASE[n]}?`,
    enunciadoTex: `n = ${n} \\text{ lados na base}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        { descricao: `A base ${NOME_BASE[n]} tem ${n} lados.`, tex: `n = ${n}` },
        {
          descricao: `Contamos: ${explicacao[pede]}.`,
          tex: `${pede.toUpperCase()} = ${formula[pede]} = ${gabarito}`,
        },
        {
          descricao: 'Conferindo com Euler.',
          tex: `${contagens.v} - ${contagens.a} + ${contagens.f} = 2`,
        },
      ],
    },
    conceitos: ['poliedros.prismas'],
    armadilhas: semColisoes(
      [
        {
          resposta: pede === 'a' ? (ePrisma ? 2 * n : n) : pede === 'v' ? (ePrisma ? n : n) : n,
          diagnostico:
            pede === 'a'
              ? ePrisma
                ? `Faltaram as ${n} arestas laterais: são ${n} em cada base e mais ${n} ligando as bases.`
                : `Faltaram as ${n} arestas que sobem da base até o topo.`
              : pede === 'v'
                ? ePrisma
                  ? `O prisma tem duas bases: ${n} vértices em cada uma.`
                  : 'Falta o vértice do topo da pirâmide.'
                : ePrisma
                  ? 'Faltaram as 2 bases: além das faces laterais, o prisma tem a base de baixo e a de cima.'
                  : 'Falta a base: além das faces laterais, a pirâmide tem a face da base.',
          passo: 1,
          conceito: 'poliedros.prismas',
        },
      ],
      gabarito,
      exato,
    ),
    dica:
      nivel === 'facil' || nivel === 'medio'
        ? ePrisma
          ? `O prisma tem duas bases de ${n} lados ligadas por ${n} faces laterais.`
          : `A pirâmide tem uma base de ${n} lados e um vértice no topo ligado a cada vértice da base.`
        : undefined,
  };
}

/** Todas as faces com o mesmo número de lados: A = k·F/2, e Euler dá V. */
function facesIguais(nivel: Nivel, rng: Rng): Exercicio<number> {
  const k = rng.escolher([3, 3, 4, 5]);
  const f =
    k === 3
      ? rng.escolher([4, 6, 8, 10, 12, 14, 16, 20])
      : k === 4
        ? rng.inteiro(3, 12) * 2
        : rng.escolher([12, 24, 60]);
  const nomeFace = { 3: 'triangulares', 4: 'quadrangulares', 5: 'pentagonais' }[k]!;
  const a = (k * f) / 2;
  const v = a - f + 2;
  const pedeV = nivel !== 'medio' || rng.booleano();
  const gabarito = pedeV ? v : a;

  return {
    id: `poli-iguais-${k}-${f}-${pedeV ? 'v' : 'a'}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Um poliedro convexo tem ${f} faces, todas ${nomeFace}. Quantos ${pedeV ? 'vértices' : 'arestas'} ele tem?`,
    enunciadoTex: `F = ${f} \\qquad \\text{cada face com } ${k} \\text{ lados}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `Somando os lados de todas as faces, cada aresta é contada duas vezes (ela é a divisa entre duas faces).`,
          tex: `2A = ${k} \\cdot ${f} \\;\\Rightarrow\\; A = ${a}`,
        },
        ...(pedeV
          ? [
              {
                descricao: 'Pela relação de Euler.',
                tex: `V = A - F + 2 = ${a} - ${f} + 2 = ${v}`,
              },
            ]
          : []),
      ],
    },
    conceitos: ['poliedros.contagem', 'poliedros.euler'],
    armadilhas: semColisoes(
      [
        {
          resposta: pedeV ? k * f - f + 2 : k * f,
          diagnostico:
            'Faltou dividir por 2: cada aresta pertence a duas faces e foi contada duas vezes.',
          passo: 0,
          conceito: 'poliedros.contagem',
        },
        ...(pedeV
          ? [
              {
                resposta: a,
                diagnostico: `${a} é o número de arestas. Use Euler para chegar aos vértices.`,
                passo: 1,
                conceito: 'poliedros.euler',
              },
            ]
          : []),
      ],
      gabarito,
      exato,
    ),
    dica:
      nivel === 'medio' || nivel === 'dificil'
        ? `Some os lados de todas as faces (${f} vezes ${k}) e divida por 2: cada aresta está em duas faces.${pedeV ? ' Depois use V − A + F = 2.' : ''}`
        : undefined,
  };
}

interface Misto {
  readonly nome: string;
  readonly faces: readonly (readonly [quantidade: number, lados: number])[];
}

const NOME_POLIGONO: Readonly<Record<number, string>> = {
  3: 'triângulos',
  4: 'quadrados',
  5: 'pentágonos',
  6: 'hexágonos',
  7: 'heptágonos',
  8: 'octógonos',
  9: 'eneágonos',
  10: 'decágonos',
  11: 'undecágonos',
  12: 'dodecágonos',
  13: 'tridecágonos',
};

/** Faces de dois tipos: a soma dos lados por 2 dá A; Euler, V. */
function facesMistas(nivel: Nivel, rng: Rng): Exercicio<number> {
  // n ≥ 5: com 3 ou 4 lados o prisma e o antiprisma repetiriam o tipo de face.
  const n = rng.inteiro(5, 12);
  const familia: Misto[] = [
    {
      nome: `pirâmide de base com ${n + 1} lados`,
      faces: [
        [1, n + 1],
        [n + 1, 3],
      ],
    },
    {
      nome: `antiprisma de base com ${n} lados`,
      faces: [
        [2, n],
        [2 * n, 3],
      ],
    },
    {
      nome: `prisma de base com ${n} lados`,
      faces: [
        [2, n],
        [n, 4],
      ],
    },
  ];
  const opcoes: Misto[] = [
    {
      nome: 'icosaedro truncado (a bola de futebol)',
      faces: [
        [12, 5],
        [20, 6],
      ],
    },
    {
      nome: 'cuboctaedro',
      faces: [
        [8, 3],
        [6, 4],
      ],
    },
    {
      nome: 'cubo truncado',
      faces: [
        [8, 3],
        [6, 8],
      ],
    },
    {
      nome: 'icosidodecaedro',
      faces: [
        [20, 3],
        [12, 5],
      ],
    },
    {
      nome: 'rombicuboctaedro',
      faces: [
        [8, 3],
        [18, 4],
      ],
    },
    {
      nome: `prisma de base com ${n} lados`,
      faces: [
        [2, n],
        [n, 4],
      ],
    },
  ];
  // As famílias com n variável pesam mais no sorteio, para variar os números.
  const m = rng.booleano(0.6) ? rng.escolher(familia) : rng.escolher(opcoes);
  const somaLados = m.faces.reduce((s, [q, l]) => s + q * l, 0);
  const f = m.faces.reduce((s, [q]) => s + q, 0);
  const a = somaLados / 2;
  const v = a - f + 2;
  const descreve = m.faces
    .map(([q, l]) => `${q} ${q === 1 ? NOME_POLIGONO[l]!.slice(0, -1) : NOME_POLIGONO[l]}`)
    .join(' e ');
  const somaTex = m.faces.map(([q, l]) => `${q} \\cdot ${l}`).join(' + ');

  return {
    id: `poli-mistas-${m.faces.flat().join('')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Um poliedro convexo tem como faces ${descreve}. Quantos vértices ele tem?`,
    enunciadoTex: `F = ${f} \\qquad ${m.faces.map(([q, l]) => `${q} \\times ${l}\\text{ lados}`).join(',\\; ')}`,
    gabarito: v,
    resolucao: {
      resultado: v,
      passos: [
        {
          descricao: 'Somamos os lados de todas as faces; cada aresta foi contada duas vezes.',
          tex: `2A = ${somaTex} = ${somaLados} \\;\\Rightarrow\\; A = ${a}`,
        },
        {
          descricao: 'O total de faces.',
          tex: `F = ${m.faces.map(([q]) => q).join(' + ')} = ${f}`,
        },
        {
          descricao: `Pela relação de Euler. É o ${m.nome}.`,
          tex: `V = A - F + 2 = ${a} - ${f} + 2 = ${v}`,
        },
      ],
    },
    conceitos: ['poliedros.contagem', 'poliedros.euler'],
    armadilhas: semColisoes(
      [
        {
          resposta: somaLados - f + 2,
          diagnostico:
            'Faltou dividir a soma dos lados por 2: cada aresta é a divisa de duas faces.',
          passo: 0,
          conceito: 'poliedros.contagem',
        },
        {
          resposta: a,
          diagnostico: `${a} são as arestas. Os vértices saem de Euler: V = A − F + 2.`,
          passo: 2,
          conceito: 'poliedros.euler',
        },
      ],
      v,
      exato,
    ),
    dica: `Some os lados de todas as faces (${somaTex.replace(/ \\cdot /g, '·')}) e divida por 2 para ter A. Depois, V = A − F + 2.`,
  };
}

/** Pelo grau dos vértices: 2A = k·V e V − A + F = 2 ⟹ V = 2(F − 2)/(k − 2). */
function grau(nivel: Nivel, rng: Rng): Exercicio<number> {
  const n = rng.inteiro(3, 14);
  const familia = [
    { nome: `prisma de base com ${n} lados`, f: n + 2, k: 3 },
    { nome: `antiprisma de base com ${n} lados`, f: 2 * n + 2, k: 4 },
  ];
  const opcoes = [
    { nome: 'cubo', f: 6, k: 3 },
    { nome: 'dodecaedro', f: 12, k: 3 },
    { nome: 'octaedro', f: 8, k: 4 },
    { nome: 'icosaedro', f: 20, k: 5 },
    { nome: 'cuboctaedro', f: 14, k: 4 },
    { nome: 'icosaedro truncado (a bola de futebol)', f: 32, k: 3 },
    { nome: `prisma de base com ${n} lados`, f: n + 2, k: 3 },
  ];
  const o = rng.booleano(0.6) ? rng.escolher(familia) : rng.escolher(opcoes);
  const v = (2 * (o.f - 2)) / (o.k - 2);
  const a = (o.k * v) / 2;

  return {
    id: `poli-grau-${o.f}-${o.k}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Um poliedro convexo tem ${o.f} faces, e em cada vértice se encontram exatamente ${o.k} arestas. ` +
      'Quantos vértices ele tem?',
    enunciadoTex: `F = ${o.f} \\qquad \\text{${o.k} arestas por vértice}`,
    gabarito: v,
    resolucao: {
      resultado: v,
      passos: [
        {
          descricao: `Cada aresta liga dois vértices: somando ${o.k} arestas por vértice, cada uma foi contada duas vezes.`,
          tex: `2A = ${o.k}V \\;\\Rightarrow\\; A = \\frac{${o.k}V}{2}`,
        },
        {
          descricao: 'Substituímos em Euler.',
          tex: `V - \\frac{${o.k}V}{2} + ${o.f} = 2`,
        },
        {
          descricao: 'Resolvendo para V.',
          tex: `V\\left(1 - \\frac{${o.k}}{2}\\right) = 2 - ${o.f} \\;\\Rightarrow\\; V = \\frac{2(${o.f} - 2)}{${o.k} - 2} = ${v}`,
          nota: `Com A = ${a}: ${v} − ${a} + ${o.f} = 2. É o ${o.nome}.`,
        },
      ],
    },
    conceitos: ['poliedros.contagem', 'poliedros.euler'],
    armadilhas: semColisoes(
      [
        {
          resposta: a,
          diagnostico: `${a} são as arestas. A pergunta é quantos vértices.`,
          passo: 2,
          conceito: 'poliedros.euler',
        },
        {
          resposta: (o.f - 2) / (o.k - 2),
          diagnostico:
            'Faltou o 2 da contagem dupla: 2A = k·V, porque cada aresta tem duas pontas.',
          passo: 0,
          conceito: 'poliedros.contagem',
        },
      ],
      v,
      exato,
    ),
    dica: `Cada aresta tem duas pontas: 2A = ${o.k}·V. Substitua A em V − A + F = 2 e resolva para V.`,
  };
}
