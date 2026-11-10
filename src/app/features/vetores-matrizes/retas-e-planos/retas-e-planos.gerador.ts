import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;
const dec = (v: number, casas = 2): string => v.toFixed(casas).replace('.', '{,}');
const par = (v: number): string => (v < 0 ? `(${v})` : `${v}`);

type V3 = readonly [number, number, number];
type Pergunta =
  | 'combinacao'
  | 'plano-d'
  | 'distancia'
  | 'angulo-planos'
  | 'determinante'
  | 'k-dependentes'
  | 'angulo-retas'
  | 'plano-tres-pontos';

const escalar = (u: V3, v: V3): number => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const modulo = (u: V3): number => Math.sqrt(escalar(u, u));
const vetorial = (u: V3, v: V3): V3 => [
  u[1] * v[2] - u[2] * v[1],
  u[2] * v[0] - u[0] * v[2],
  u[0] * v[1] - u[1] * v[0],
];
const det3 = (u: V3, v: V3, w: V3): number => escalar(u, vetorial(v, w));
const vTex = (u: V3): string => `(${u[0]},\\; ${u[1]},\\; ${u[2]})`;

/** ax + by + cz = d com os sinais certos. */
function planoTex([a, b, c]: V3, d: number): string {
  const termo = (coef: number, letra: string, primeiro: boolean): string => {
    if (coef === 0) return '';
    const valor = Math.abs(coef) === 1 ? '' : String(Math.abs(coef));
    if (primeiro) return `${coef < 0 ? '-' : ''}${valor}${letra}`;
    return ` ${coef < 0 ? '-' : '+'} ${valor}${letra}`;
  };
  const x = termo(a, 'x', true);
  const y = termo(b, 'y', x === '');
  const z = termo(c, 'z', x === '' && y === '');
  return `${x}${y}${z} = ${d}`;
}

/** Normais com módulo inteiro: a distância sai exata no Médio. */
const NORMAIS_INTEIRAS: readonly V3[] = [
  [1, 2, 2],
  [2, 1, 2],
  [2, 2, 1],
  [2, 3, 6],
  [3, 6, 2],
  [1, 4, 8],
  [4, 4, 7],
  [2, 6, 9],
];

const naoNulo = (rng: Rng, min: number, max: number): number => rng.inteiro(min, max) || 1;
const vetor = (rng: Rng, alcance = 4): V3 => [
  rng.inteiro(-alcance, alcance),
  rng.inteiro(-alcance, alcance),
  rng.inteiro(-alcance, alcance),
];

/**
 * Retas e planos no espaço, e independência linear.
 *
 * O plano é «tudo o que é perpendicular a uma normal»: a equação, a distância
 * de um ponto e o ângulo entre planos saem do produto escalar com a normal. A
 * independência de três vetores sai do determinante — que o aluno já viu em
 * matrizes, por isso o tópico vem depois de escalonamento.
 */
export const geradorRetasPlanos: GeradorExercicio<number> = {
  topicoId: 'retas-e-planos',
  formatoResposta: 'um número, ex.: 7 · 2,33',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'combinacao':
        return combinacao(nivel, rng);
      case 'plano-d':
        return planoD(nivel, rng);
      case 'distancia':
        return distancia(nivel, rng);
      case 'angulo-planos':
        return anguloEntre(nivel, rng, 'planos');
      case 'angulo-retas':
        return anguloEntre(nivel, rng, 'retas');
      case 'determinante':
        return determinante(nivel, rng);
      case 'k-dependentes':
        return kDependentes(nivel, rng);
      case 'plano-tres-pontos':
        return planoTresPontos(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes: proximos,
  formatar: (v) => Number(v.toFixed(2)).toLocaleString('pt-BR', { maximumFractionDigits: 2 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['combinacao', 'plano-d']);
    case 'medio':
      return rng.escolher<Pergunta>(['plano-d', 'distancia', 'combinacao']);
    case 'dificil':
      return rng.escolher<Pergunta>(['distancia', 'angulo-planos', 'determinante']);
    // Descobrir o k que torna os vetores dependentes, o ângulo entre retas e o
    // plano por três pontos (normal pelo produto vetorial) pedem montar a conta.
    case 'extremo':
      return rng.escolher<Pergunta>(['k-dependentes', 'angulo-retas', 'plano-tres-pontos']);
  }
}

/** w = αu + βv: uma coordenada da combinação linear. */
function combinacao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const u = vetor(rng, 5);
  const v = vetor(rng, 5);
  const alfa = naoNulo(rng, -3, 3);
  const beta = naoNulo(rng, -3, 3);
  const i = rng.inteiro(0, 2);
  const nome = ['x', 'y', 'z'][i]!;
  const gabarito = alfa * u[i]! + beta * v[i]! || 0;

  return {
    id: `planos-comb-${u.join('')}-${v.join('')}-${alfa}${beta}-${i}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Com u e v abaixo, qual é a coordenada ${nome} da combinação linear w = ${alfa}u ${beta < 0 ? '−' : '+'} ${Math.abs(beta)}v?`,
    enunciadoTex: `\\vec{u} = ${vTex(u)} \\qquad \\vec{v} = ${vTex(v)}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'Uma combinação linear multiplica cada vetor pelo seu número e soma coordenada a coordenada.',
          tex: `\\vec{w} = ${alfa}\\,${vTex(u)} ${beta < 0 ? '-' : '+'} ${Math.abs(beta)}\\,${vTex(v)}`,
        },
        {
          descricao: `Só a coordenada ${nome}.`,
          tex: `w_${nome} = ${alfa} \\cdot ${par(u[i]!)} + ${par(beta)} \\cdot ${par(v[i]!)} = ${gabarito}`,
        },
      ],
    },
    conceitos: ['planos.combinacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: alfa * u[i]! - beta * v[i]!,
          diagnostico: `O sinal de ${beta} vai junto com v: some ${alfa}·${par(u[i]!)} com (${beta})·${par(v[i]!)}.`,
          passo: 1,
          conceito: 'planos.combinacao',
        },
        {
          resposta: u[i]! + v[i]!,
          diagnostico: `Faltou multiplicar pelos coeficientes ${alfa} e ${beta} antes de somar.`,
          passo: 0,
          conceito: 'planos.combinacao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Coordenada ${nome}: ${alfa} vezes a de u mais (${beta}) vezes a de v.`,
  };
}

/** Plano por P com normal n: ax + by + cz = d, com d = n·P. */
function planoD(nivel: Nivel, rng: Rng): Exercicio<number> {
  const n: V3 = [naoNulo(rng, -4, 4), rng.inteiro(-4, 4), naoNulo(rng, -4, 4)];
  const p = vetor(rng, 5);
  // `|| 0` evita o −0, que aparece quando todos os produtos zeram.
  const gabarito = escalar(n, p) || 0;

  return {
    id: `planos-d-${n.join('')}-${p.join('')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `O plano passa por P(${p.join(', ')}) e tem vetor normal n = (${n.join(', ')}). ` +
      'Escrito como ax + by + cz = d, quanto vale d?',
    enunciadoTex: `P = ${vTex(p)} \\qquad \\vec{n} = ${vTex(n)}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Os coeficientes de x, y e z são as coordenadas da normal.',
          tex: `${n[0]}x + ${par(n[1])}y + ${par(n[2])}z = d`,
        },
        {
          descricao: 'O ponto P está no plano: substituímos para achar d.',
          tex: `d = ${n[0]} \\cdot ${par(p[0])} + ${par(n[1])} \\cdot ${par(p[1])} + ${par(n[2])} \\cdot ${par(p[2])} = ${gabarito}`,
        },
        { descricao: 'O plano.', tex: planoTex(n, gabarito) },
      ],
    },
    conceitos: ['planos.equacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: -gabarito,
          diagnostico:
            'Sinal trocado: com tudo do lado esquerdo e d à direita, d = n·P (sem o menos).',
          passo: 1,
          conceito: 'planos.equacao',
        },
        {
          resposta: p[0] + p[1] + p[2],
          diagnostico:
            'Cada coordenada de P se multiplica pela coordenada correspondente da normal antes de somar.',
          passo: 1,
          conceito: 'planos.equacao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Os coeficientes são a normal: ${n[0]}x + (${n[1]})y + (${n[2]})z = d. Ponha as coordenadas de P e calcule d.`,
  };
}

/** Distância de um ponto a um plano: |n·P − d| / |n|. */
function distancia(nivel: Nivel, rng: Rng): Exercicio<number> {
  const exata = nivel === 'medio';
  const n: V3 = exata
    ? (rng.escolher(NORMAIS_INTEIRAS).map((c) => c * (rng.booleano() ? 1 : -1)) as unknown as V3)
    : [naoNulo(rng, -5, 5), naoNulo(rng, -5, 5), naoNulo(rng, -5, 5)];
  const d = rng.inteiro(-12, 12);
  const p = vetor(rng, 6);
  const valor = escalar(n, p) - d;
  const mod = modulo(n);
  const gabarito = Math.abs(valor) / mod;

  return {
    id: `planos-dist-${n.join('')}-${d}-${p.join('')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é a distância do ponto P ao plano?${Number.isInteger(Number(gabarito.toFixed(9))) ? '' : ' (2 casas decimais)'}`,
    enunciadoTex: `P = ${vTex(p)} \\qquad ${planoTex(n, d)}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A distância é a projeção de P sobre a normal, medida a partir do plano.',
          tex: 'D = \\frac{|a x_0 + b y_0 + c z_0 - d|}{\\sqrt{a^{2} + b^{2} + c^{2}}}',
        },
        {
          descricao: 'O numerador: P na equação do plano.',
          tex: `|${n[0]} \\cdot ${par(p[0])} + ${par(n[1])} \\cdot ${par(p[1])} + ${par(n[2])} \\cdot ${par(p[2])} - ${par(d)}| = |${valor}| = ${Math.abs(valor)}`,
        },
        {
          descricao: 'O denominador: o módulo da normal.',
          tex: `\\sqrt{${n[0] ** 2} + ${n[1] ** 2} + ${n[2] ** 2}} = ${Number.isInteger(mod) ? mod : dec(mod, 4)}`,
        },
        {
          descricao: 'Dividindo.',
          tex: `D = \\frac{${Math.abs(valor)}}{${Number.isInteger(mod) ? mod : dec(mod, 4)}} = ${dec(gabarito)}`,
        },
      ],
    },
    conceitos: ['planos.distancia'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.abs(valor),
          diagnostico: `Faltou dividir pelo módulo da normal (${Number.isInteger(mod) ? mod : dec(mod, 2).replace('{,}', ',')}): o numerador sozinho depende do tamanho de n.`,
          passo: 2,
          conceito: 'planos.distancia',
        },
        {
          resposta: Math.abs(escalar(n, p)) / mod,
          diagnostico: `Faltou subtrair d = ${d}: o numerador é P na equação inteira, a·x₀ + b·y₀ + c·z₀ − d.`,
          passo: 1,
          conceito: 'planos.distancia',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Distância = |n·P − d| / |n|. Aqui |n| = raiz de ${n[0]}² + ${n[1]}² + ${n[2]}².`,
  };
}

/** Ângulo entre planos (pelas normais) ou entre retas (pelas direções), em graus. */
function anguloEntre(nivel: Nivel, rng: Rng, tipo: 'planos' | 'retas'): Exercicio<number> {
  let u: V3, v: V3;
  do {
    u = vetor(rng, 4);
    v = vetor(rng, 4);
  } while (
    modulo(u) === 0 ||
    modulo(v) === 0 ||
    Math.abs(Math.abs(escalar(u, v)) - modulo(u) * modulo(v)) < 1e-9
  );
  const cosBruto = escalar(u, v) / (modulo(u) * modulo(v));
  // Entre planos e entre retas toma-se o ângulo agudo: |cos|.
  const cos = Math.abs(cosBruto);
  const gabarito = (Math.acos(cos) * 180) / Math.PI;
  const d1 = rng.inteiro(-6, 6);
  const d2 = rng.inteiro(-6, 6);
  const nome = tipo === 'planos' ? 'normais' : 'direções';

  return {
    id: `planos-ang-${tipo}-${u.join('')}-${v.join('')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é o ângulo agudo entre ${tipo === 'planos' ? 'os dois planos' : 'as duas retas'}, em graus? (2 casas decimais)`,
    enunciadoTex:
      tipo === 'planos'
        ? `\\pi_1:\\; ${planoTex(u, d1)} \\qquad \\pi_2:\\; ${planoTex(v, d2)}`
        : `r:\\; (x, y, z) = (1, 0, 2) + t\\,${vTex(u)} \\qquad s:\\; (x, y, z) = (0, 3, -1) + t\\,${vTex(v)}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `O ângulo entre ${tipo === 'planos' ? 'os planos é o das normais' : 'as retas é o das direções'}, tomado agudo (módulo do cosseno).`,
          tex: `\\cos\\theta = \\frac{|\\vec{u} \\cdot \\vec{v}|}{|\\vec{u}|\\,|\\vec{v}|} \\qquad \\vec{u} = ${vTex(u)},\\; \\vec{v} = ${vTex(v)}`,
        },
        {
          descricao: `Produto escalar e módulos das ${nome}.`,
          tex: `\\vec{u} \\cdot \\vec{v} = ${escalar(u, v)} \\qquad |\\vec{u}| = ${dec(modulo(u), 4)} \\qquad |\\vec{v}| = ${dec(modulo(v), 4)}`,
        },
        {
          descricao: 'O cosseno e o ângulo.',
          tex: `\\cos\\theta = ${dec(cos, 4)} \\;\\Rightarrow\\; \\theta = ${dec(gabarito)}^{\\circ}`,
        },
      ],
    },
    conceitos: ['planos.angulo'],
    armadilhas: semColisoes(
      [
        {
          resposta: (Math.acos(cosBruto) * 180) / Math.PI,
          diagnostico:
            'Esse é o ângulo obtuso. Entre planos (ou retas) usa-se o agudo: tome o módulo do produto escalar.',
          passo: 0,
          conceito: 'planos.angulo',
        },
        {
          resposta: Math.acos(cos),
          diagnostico: 'Esse é o ângulo em radianos. A pergunta pede graus.',
          passo: 2,
          conceito: 'planos.angulo',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Use as ${nome}: cos θ = |u·v| / (|u|·|v|), com u = (${u.join(', ')}) e v = (${v.join(', ')}).`,
  };
}

/** O determinante dos três vetores: o volume (com sinal) do paralelepípedo. */
function determinante(nivel: Nivel, rng: Rng): Exercicio<number> {
  const u = vetor(rng, 3);
  const v = vetor(rng, 3);
  const w = vetor(rng, 3);
  const gabarito = Math.abs(det3(u, v, w));
  const c = vetorial(v, w);

  return {
    id: `planos-det-${u.join('')}-${v.join('')}-${w.join('')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'Qual é o volume do paralelepípedo formado pelos três vetores? (Volume zero significa que eles são linearmente dependentes.)',
    enunciadoTex: `\\vec{u} = ${vTex(u)} \\qquad \\vec{v} = ${vTex(v)} \\qquad \\vec{w} = ${vTex(w)}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'O volume é o módulo do produto misto, que é o determinante dos três vetores.',
          tex: `V = |\\vec{u} \\cdot (\\vec{v} \\times \\vec{w})| = \\left|\\det\\begin{pmatrix} ${u.join(' & ')} \\\\ ${v.join(' & ')} \\\\ ${w.join(' & ')} \\end{pmatrix}\\right|`,
        },
        {
          descricao: 'O produto vetorial de v e w.',
          tex: `\\vec{v} \\times \\vec{w} = ${vTex(c)}`,
        },
        {
          descricao: 'O escalar com u, em módulo.',
          tex: `V = |${u[0]} \\cdot ${par(c[0])} + ${par(u[1])} \\cdot ${par(c[1])} + ${par(u[2])} \\cdot ${par(c[2])}| = ${gabarito}`,
          nota:
            gabarito === 0
              ? 'Volume zero: os três vetores estão num mesmo plano — são dependentes.'
              : 'Volume não nulo: os três vetores são linearmente independentes.',
        },
      ],
    },
    conceitos: ['planos.independencia'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.abs(escalar(u, v) + escalar(v, w) + escalar(u, w)),
          diagnostico:
            'Produtos escalares dois a dois não dão volume. O volume é o produto misto u·(v × w), o determinante.',
          passo: 0,
          conceito: 'planos.independencia',
        },
        {
          resposta: modulo(c),
          diagnostico:
            'Esse é o módulo de v × w, a ÁREA da base. Falta o produto escalar com u para ter o volume.',
          passo: 2,
          conceito: 'planos.independencia',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: 'O volume é o módulo do determinante 3×3 com u, v e w nas linhas. Calcule v × w e depois o escalar com u.',
  };
}

/** O k que deixa os três vetores dependentes: det = 0, linear em k. */
function kDependentes(nivel: Nivel, rng: Rng): Exercicio<number> {
  let u: V3, v: V3, a: number, b: number;
  do {
    u = vetor(rng, 3);
    v = vetor(rng, 3);
    a = rng.inteiro(-3, 3);
    b = rng.inteiro(-3, 3);
  } while (vetorial(u, v)[2] === 0);
  // w = (a, b, k): det(u, v, w) = (u × v)·w = c0·a + c1·b + c2·k.
  const c = vetorial(u, v);
  const gabarito = -(c[0] * a + c[1] * b) / c[2] || 0;

  return {
    id: `planos-k-${u.join('')}-${v.join('')}-${a}${b}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'Para que valor de k os três vetores são linearmente dependentes (estão num mesmo plano)?' +
      (Number.isInteger(gabarito) ? '' : ' Responda como fração ou com 2 casas decimais.'),
    enunciadoTex: `\\vec{u} = ${vTex(u)} \\qquad \\vec{v} = ${vTex(v)} \\qquad \\vec{w} = (${a},\\; ${b},\\; k)`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Dependentes ⟺ volume zero ⟺ determinante zero.',
          tex: `\\det\\begin{pmatrix} ${u.join(' & ')} \\\\ ${v.join(' & ')} \\\\ ${a} & ${b} & k \\end{pmatrix} = 0`,
        },
        {
          descricao: 'Pelo produto misto: (u × v)·w.',
          tex: `\\vec{u} \\times \\vec{v} = ${vTex(c)} \\;\\Rightarrow\\; ${c[0]} \\cdot ${par(a)} + ${par(c[1])} \\cdot ${par(b)} + ${par(c[2])}\\,k = 0`,
        },
        {
          descricao: 'Isolando k.',
          tex: `k = \\frac{${-(c[0] * a + c[1] * b)}}{${c[2]}} = ${Number.isInteger(gabarito) ? gabarito : dec(gabarito, 4)}`,
        },
      ],
    },
    conceitos: ['planos.independencia'],
    armadilhas: semColisoes(
      [
        {
          resposta: (c[0] * a + c[1] * b) / c[2],
          diagnostico: 'Sinal trocado ao isolar k: o termo que soma passa subtraindo.',
          passo: 2,
          conceito: 'planos.independencia',
        },
        {
          resposta: 0,
          diagnostico: 'k = 0 não zera o determinante aqui. Monte o produto misto e iguale a zero.',
          passo: 0,
          conceito: 'planos.independencia',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: 'Dependentes ⟺ determinante zero. Calcule u × v, faça o escalar com w = (a, b, k) e iguale a zero.',
  };
}

/** O plano por três pontos: normal = AB × AC, depois d = n·A. */
function planoTresPontos(nivel: Nivel, rng: Rng): Exercicio<number> {
  let A: V3, B: V3, C: V3, n: V3;
  do {
    A = vetor(rng, 3);
    B = vetor(rng, 3);
    C = vetor(rng, 3);
    n = vetorial([B[0] - A[0], B[1] - A[1], B[2] - A[2]], [C[0] - A[0], C[1] - A[1], C[2] - A[2]]);
  } while (modulo(n) === 0 || n[0] === 0);
  // Normaliza o sinal: primeiro coeficiente positivo, para d ficar bem definido.
  if (n[0] < 0) n = [-n[0], -n[1], -n[2]];
  const ab: V3 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
  const ac: V3 = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
  const gabarito = escalar(n, A) || 0;

  return {
    id: `planos-3p-${A.join('')}-${B.join('')}-${C.join('')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'O plano passa por A, B e C. Escrito como ax + by + cz = d com a > 0 e (a, b, c) = AB × AC (ou o oposto, para deixar a positivo), quanto vale d?',
    enunciadoTex: `A = ${vTex(A)} \\qquad B = ${vTex(B)} \\qquad C = ${vTex(C)}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Dois vetores no plano.',
          tex: `\\vec{AB} = ${vTex(ab)} \\qquad \\vec{AC} = ${vTex(ac)}`,
        },
        {
          descricao: 'A normal é perpendicular aos dois: o produto vetorial (com a positivo).',
          tex: `\\vec{n} = ${vTex(n)}`,
        },
        {
          descricao: 'd sai de substituir A.',
          tex: `d = ${n[0]} \\cdot ${par(A[0])} + ${par(n[1])} \\cdot ${par(A[1])} + ${par(n[2])} \\cdot ${par(A[2])} = ${gabarito}`,
        },
      ],
    },
    conceitos: ['planos.equacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: -gabarito,
          diagnostico: 'Sinal de d trocado: com a normal escolhida com a > 0, d = n·A.',
          passo: 2,
          conceito: 'planos.equacao',
        },
        {
          resposta: escalar(ab, A),
          diagnostico: 'AB está DENTRO do plano, não é normal a ele. A normal é AB × AC.',
          passo: 1,
          conceito: 'planos.equacao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: 'Faça AB e AC, a normal é AB × AC (troque o sinal se a primeira coordenada sair negativa) e d = n·A.',
  };
}
