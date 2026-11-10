import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';
import {
  Monomio,
  avaliar,
  derivar,
  integrarCubo,
  integrarRetangulo,
  mono,
  monoTex,
  monoTexto,
} from '@features/calculo-3/teoremas-integrais/teoremas-integrais.monomios';

const { saoEquivalentes: proximos, formatar } = numeroComCasas(2, 1e-4);

/** Número para o LaTeX, com vírgula decimal. */
const dec = (v: number): string => formatar(v).replace(',', '{,}');
const par = (v: number): string => (v < 0 ? `(${dec(v)})` : dec(v));
const casas = (v: number): string => (Number.isInteger(v) ? '' : ' (2 casas decimais)');

type Pergunta =
  | 'div-ponto'
  | 'area-plano'
  | 'rot-ponto'
  | 'green-retangulo'
  | 'divergencia'
  | 'stokes-disco'
  | 'divergencia-cilindro'
  | 'area-green';

const campo2 = (p: Monomio, q: Monomio): string =>
  `\\vec{F} = \\left(${monoTex(p)},\\; ${monoTex(q)}\\right)`;
const campo3 = (p: Monomio, q: Monomio, r: Monomio): string =>
  `\\vec{F} = \\left(${monoTex(p)},\\; ${monoTex(q)},\\; ${monoTex(r)}\\right)`;

/**
 * Integrais de superfície e os teoremas de Green, Stokes e da divergência.
 *
 * Os três dizem a mesma coisa em dimensões diferentes: o que sai pela borda
 * é a soma do que nasce dentro. As perguntas cobram as duas metades — a
 * derivada local (divergente, rotacional) e a troca de uma integral difícil
 * na borda por uma fácil no interior.
 */
export const geradorTeoremasIntegrais: GeradorExercicio<number> = {
  topicoId: 'teoremas-integrais',
  formatoResposta: 'um número, ex.: 24 · 12,57 · 4π',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'div-ponto':
        return divergenteNoPonto(nivel, rng);
      case 'area-plano':
        return areaDoPlano(nivel, rng);
      case 'rot-ponto':
        return rotacionalNoPonto(nivel, rng);
      case 'green-retangulo':
        return greenNoRetangulo(nivel, rng);
      case 'divergencia':
        return divergenciaCuboOuEsfera(nivel, rng);
      case 'stokes-disco':
        return stokesNoDisco(nivel, rng);
      case 'divergencia-cilindro':
        return divergenciaCilindro(nivel, rng);
      case 'area-green':
        return areaPorGreen(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['div-ponto', 'area-plano']);
    case 'medio':
      return rng.escolher<Pergunta>(['green-retangulo', 'div-ponto', 'rot-ponto']);
    case 'dificil':
      return rng.escolher<Pergunta>(['green-retangulo', 'divergencia', 'area-plano']);
    // Stokes, a divergência com divergente variável e a área por Green: as três
    // pedem escolher o lado do teorema que se calcula, não só aplicar a fórmula.
    case 'extremo':
      return rng.escolher<Pergunta>(['stokes-disco', 'divergencia-cilindro', 'area-green']);
  }
}

/** Um monômio cujo expoente na variável dada é ao menos 1, para a derivada não sumir. */
function monomioQueDepende(rng: Rng, v: 'x' | 'y' | 'z', grau = 2): Monomio {
  const c = rng.inteiro(1, 5) * rng.sinal();
  const e = rng.inteiro(1, grau);
  const outras = rng.booleano() ? 1 : 0;
  if (v === 'x') return mono(c, e, outras, 0);
  if (v === 'y') return mono(c, 0, e, outras);
  return mono(c, outras, 0, e);
}

function divergenteNoPonto(nivel: Nivel, rng: Rng): Exercicio<number> {
  const p = monomioQueDepende(rng, 'x');
  const q = monomioQueDepende(rng, 'y');
  const r = monomioQueDepende(rng, 'z');
  const [x0, y0, z0] = [rng.inteiro(-2, 3), rng.inteiro(-2, 3), rng.inteiro(-2, 3)];
  const dp = derivar(p, 'x');
  const dq = derivar(q, 'y');
  const dr = derivar(r, 'z');
  const valores = [avaliar(dp, x0, y0, z0), avaliar(dq, x0, y0, z0), avaliar(dr, x0, y0, z0)];
  const gabarito = valores[0]! + valores[1]! + valores[2]!;

  return {
    id: `teor-div-${monoTex(p)}-${monoTex(q)}-${monoTex(r)}-${x0}${y0}${z0}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Calcule o divergente do campo no ponto (${x0}, ${y0}, ${z0}).`,
    enunciadoTex: campo3(p, q, r),
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'O divergente soma a derivada de cada componente na SUA variável.',
          tex: '\\nabla \\cdot \\vec{F} = \\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} + \\frac{\\partial R}{\\partial z}',
        },
        {
          descricao: 'As três derivadas parciais.',
          tex: `${monoTex(dp)} + ${monoTex(dq)} + ${monoTex(dr)}`,
        },
        {
          descricao: `Avaliando em (${x0}, ${y0}, ${z0}).`,
          tex: `${par(valores[0]!)} + ${par(valores[1]!)} + ${par(valores[2]!)} = ${dec(gabarito)}`,
        },
      ],
    },
    conceitos: ['teoremas.divergencia'],
    armadilhas: semColisoes(
      [
        {
          resposta: avaliar(p, x0, y0, z0) + avaliar(q, x0, y0, z0) + avaliar(r, x0, y0, z0),
          diagnostico: 'Isso é a soma das componentes. O divergente soma as DERIVADAS de cada uma.',
          passo: 0,
          conceito: 'teoremas.divergencia',
        },
        {
          resposta:
            avaliar(derivar(p, 'y'), x0, y0, z0) +
            avaliar(derivar(q, 'z'), x0, y0, z0) +
            avaliar(derivar(r, 'x'), x0, y0, z0),
          diagnostico: 'Variáveis trocadas: P deriva em x, Q em y e R em z.',
          passo: 1,
          conceito: 'teoremas.divergencia',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Derive ${monoTexto(p)} em x, ${monoTexto(q)} em y e ${monoTexto(r)} em z, some e substitua o ponto.`,
  };
}

/** Pares (a, b) com 1 + a² + b² quadrado perfeito, para o Fácil ter raiz exata. */
const INCLINACOES_EXATAS: readonly (readonly [number, number, number])[] = [
  [2, 2, 3],
  [4, 8, 9],
  [8, 4, 9],
  [6, 18, 19],
  [2, 14, 15],
];

function areaDoPlano(nivel: Nivel, rng: Rng): Exercicio<number> {
  let a: number, b: number;
  if (nivel === 'facil') {
    [a, b] = rng.escolher(INCLINACOES_EXATAS);
    if (rng.booleano()) a = -a;
  } else {
    a = rng.inteiro(1, 4) * rng.sinal();
    b = rng.inteiro(1, 4) * rng.sinal();
  }
  const c = rng.inteiro(-5, 5);
  const L = rng.inteiro(1, 4);
  const M = rng.inteiro(1, 4);
  const fator = Math.sqrt(1 + a * a + b * b);
  const gabarito = fator * L * M;
  const plano = `z = ${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}y ${c >= 0 ? '+' : '-'} ${Math.abs(c)}`;

  return {
    id: `teor-area-${a}${b}${c}-${L}${M}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Qual é a área do pedaço do plano que fica acima do retângulo 0 ≤ x ≤ ${L}, 0 ≤ y ≤ ${M}?` +
      casas(gabarito),
    enunciadoTex: plano,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'Para z = f(x, y), cada pedacinho dA da sombra vira √(1 + fx² + fy²)·dA na superfície.',
          tex: 'A = \\iint_R \\sqrt{1 + f_x^{2} + f_y^{2}}\\, dA',
        },
        {
          descricao: `As derivadas parciais são constantes: fx = ${a} e fy = ${b}.`,
          tex: `\\sqrt{1 + (${a})^{2} + (${b})^{2}} = \\sqrt{${1 + a * a + b * b}} = ${dec(fator)}`,
          nota: 'O plano inclinado é maior que a sua sombra; esse fator mede o quanto.',
        },
        {
          descricao: `Fator constante vezes a área do retângulo (${L} por ${M}).`,
          tex: `A = ${dec(fator)} \\cdot ${L * M} = ${dec(gabarito)}`,
        },
      ],
    },
    conceitos: ['teoremas.superficie'],
    armadilhas: semColisoes(
      [
        {
          resposta: L * M,
          diagnostico: `Essa é a área da SOMBRA no plano xy. O plano é inclinado: multiplique por √(1 + ${a}² + ${b}²).`,
          passo: 1,
          conceito: 'teoremas.superficie',
        },
        {
          resposta: (1 + a * a + b * b) * L * M,
          diagnostico: 'Faltou a raiz quadrada no fator √(1 + fx² + fy²).',
          passo: 1,
          conceito: 'teoremas.superficie',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `O fator de inclinação é √(1 + ${a}² + ${b}²); multiplique pela área do retângulo, ${L} vezes ${M}.`,
  };
}

function rotacionalNoPonto(nivel: Nivel, rng: Rng): Exercicio<number> {
  // Campo plano: rot F = (∂Q/∂x − ∂P/∂y) k.
  const p = monomioQueDepende(rng, 'y');
  const q = monomioQueDepende(rng, 'x');
  const pXY = mono(p.c, p.i, p.j, 0);
  const qXY = mono(q.c, q.i, q.j, 0);
  const [x0, y0] = [rng.inteiro(-2, 3), rng.inteiro(-2, 3)];
  const dq = derivar(qXY, 'x');
  const dp = derivar(pXY, 'y');
  const vq = avaliar(dq, x0, y0);
  const vp = avaliar(dp, x0, y0);
  const gabarito = vq - vp;

  return {
    id: `teor-rot-${monoTex(pXY)}-${monoTex(qXY)}-${x0}${y0}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Calcule a componente z do rotacional do campo plano no ponto (${x0}, ${y0}).`,
    enunciadoTex: campo2(pXY, qXY),
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Num campo plano (P, Q), o rotacional aponta em z e mede o giro local.',
          tex: '(\\nabla \\times \\vec{F})_z = \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}',
        },
        {
          descricao: 'As duas derivadas cruzadas.',
          tex: `\\frac{\\partial Q}{\\partial x} = ${monoTex(dq)} \\qquad \\frac{\\partial P}{\\partial y} = ${monoTex(dp)}`,
        },
        {
          descricao: `Em (${x0}, ${y0}).`,
          tex: `${par(vq)} - ${par(vp)} = ${dec(gabarito)}`,
        },
      ],
    },
    conceitos: ['teoremas.stokes'],
    armadilhas: semColisoes(
      [
        {
          resposta: -gabarito,
          diagnostico: 'Ordem trocada: é ∂Q/∂x MENOS ∂P/∂y, não o contrário.',
          passo: 0,
          conceito: 'teoremas.stokes',
        },
        {
          resposta: avaliar(derivar(pXY, 'x'), x0, y0) + avaliar(derivar(qXY, 'y'), x0, y0),
          diagnostico:
            'Isso é o divergente (∂P/∂x + ∂Q/∂y). O rotacional usa as derivadas CRUZADAS.',
          passo: 0,
          conceito: 'teoremas.stokes',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Derive Q = ${monoTexto(qXY)} em x e P = ${monoTexto(pXY)} em y; a resposta é a primeira menos a segunda.`,
  };
}

/** ∮ P dx + Q dy na borda do retângulo [0, L] × [0, M], anti-horário. */
function greenNoRetangulo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const L = rng.inteiro(1, 4);
  const M = rng.inteiro(1, 4);
  let p: Monomio, q: Monomio;
  if (nivel === 'medio') {
    p = mono(rng.inteiro(1, 5) * rng.sinal(), 0, 1);
    q = mono(rng.inteiro(1, 5) * rng.sinal(), 1, 0);
    if (p.c === q.c) q = mono(q.c + 1, 1, 0);
  } else {
    p = mono(rng.inteiro(1, 4) * rng.sinal(), rng.inteiro(0, 1), rng.inteiro(1, 2));
    q = mono(rng.inteiro(1, 4) * rng.sinal(), rng.inteiro(1, 2), rng.inteiro(0, 1));
  }
  const dq = derivar(q, 'x');
  const dp = derivar(p, 'y');
  const iq = integrarRetangulo(dq, L, M);
  const ip = integrarRetangulo(dp, L, M);
  const gabarito = iq - ip;

  return {
    id: `teor-green-${monoTex(p)}-${monoTex(q)}-${L}${M}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Use o teorema de Green para calcular a circulação ∮ P dx + Q dy na borda do retângulo ` +
      `0 ≤ x ≤ ${L}, 0 ≤ y ≤ ${M}, percorrida no sentido anti-horário.` +
      casas(gabarito),
    enunciadoTex: campo2(p, q),
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Green troca a integral na borda pela integral dupla do giro no interior.',
          tex: '\\oint_C P\\,dx + Q\\,dy = \\iint_R \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right) dA',
        },
        {
          descricao: 'O integrando.',
          tex: `\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} = ${monoTex(dq)} - (${monoTex(dp)})`,
        },
        {
          descricao: `Integramos cada parte em 0 ≤ x ≤ ${L}, 0 ≤ y ≤ ${M}.`,
          tex: `\\iint_R ${monoTex(dq)}\\,dA = ${dec(iq)} \\qquad \\iint_R ${monoTex(dp)}\\,dA = ${dec(ip)}`,
        },
        {
          descricao: 'A diferença é a circulação.',
          tex: `${dec(iq)} - ${par(ip)} = ${dec(gabarito)}`,
        },
      ],
    },
    conceitos: ['teoremas.green'],
    armadilhas: semColisoes(
      [
        {
          resposta: -gabarito,
          diagnostico:
            'Sinal trocado: o integrando é ∂Q/∂x − ∂P/∂y (e a borda é percorrida no sentido anti-horário).',
          passo: 1,
          conceito: 'teoremas.green',
        },
        {
          resposta: iq + ip,
          diagnostico: 'As duas derivadas se SUBTRAEM: ∂Q/∂x MENOS ∂P/∂y.',
          passo: 1,
          conceito: 'teoremas.green',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'medio'
        ? `Pelo teorema de Green: ∂Q/∂x − ∂P/∂y dá um número constante; multiplique pela área ${L} vezes ${M}.`
        : `Calcule ∂Q/∂x − ∂P/∂y e integre em 0 ≤ x ≤ ${L}, 0 ≤ y ≤ ${M}: ∫ xⁿ dx = xⁿ⁺¹/(n + 1).`,
  };
}

/** Fluxo para fora de um cubo [0, L]³ (div variável) ou de uma esfera (div constante). */
function divergenciaCuboOuEsfera(nivel: Nivel, rng: Rng): Exercicio<number> {
  if (rng.booleano()) {
    const a = rng.inteiro(1, 4) * rng.sinal();
    const b = rng.inteiro(1, 4) * rng.sinal();
    const c = rng.inteiro(1, 4);
    const R = rng.inteiro(1, 3);
    const div = a + b + c;
    const volume = (4 / 3) * Math.PI * R ** 3;
    const gabarito = div * volume;
    return {
      id: `teor-fluxo-esfera-${a}${b}${c}-${R}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Pelo teorema da divergência, qual é o fluxo do campo para fora da esfera de raio ${R} centrada na origem? (2 casas decimais)`,
      enunciadoTex: campo3(mono(a, 1), mono(b, 0, 1), mono(c, 0, 0, 1)),
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'O fluxo pela superfície fechada é a integral do divergente no volume.',
            tex: '\\oiint_S \\vec{F} \\cdot \\vec{n}\\,dS = \\iiint_V \\nabla \\cdot \\vec{F}\\,dV',
          },
          {
            descricao: 'O divergente é constante.',
            tex: `\\nabla \\cdot \\vec{F} = ${a} + ${par(b)} + ${c} = ${div}`,
          },
          {
            descricao: `Constante vezes o volume da esfera, (4/3)π·${R}³.`,
            tex: `${div} \\cdot \\frac{4}{3}\\pi \\cdot ${R}^{3} = ${dec(gabarito)}`,
          },
        ],
      },
      conceitos: ['teoremas.divergencia'],
      armadilhas: semColisoes(
        [
          {
            resposta: div * 4 * Math.PI * R * R,
            diagnostico:
              'Isso usa a ÁREA da esfera. O teorema integra o divergente no VOLUME: (4/3)πR³.',
            passo: 2,
            conceito: 'teoremas.divergencia',
          },
          {
            resposta: div,
            diagnostico: 'Esse é só o divergente; falta multiplicar pelo volume.',
            passo: 2,
            conceito: 'teoremas.divergencia',
          },
        ],
        gabarito,
        proximos,
      ),
      dica: `O divergente é ${a} + ${b} + ${c}, constante: multiplique pelo volume da esfera, (4/3)π·${R}³.`,
    };
  }

  const L = rng.inteiro(1, 3);
  const p = monomioQueDepende(rng, 'x');
  const q = monomioQueDepende(rng, 'y');
  const r = monomioQueDepende(rng, 'z');
  const partes = [derivar(p, 'x'), derivar(q, 'y'), derivar(r, 'z')];
  const integrais = partes.map((m) => integrarCubo(m, L));
  const gabarito = integrais[0]! + integrais[1]! + integrais[2]!;

  return {
    id: `teor-fluxo-cubo-${monoTex(p)}-${monoTex(q)}-${monoTex(r)}-${L}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Pelo teorema da divergência, qual é o fluxo do campo para fora do cubo 0 ≤ x, y, z ≤ ${L}?` +
      casas(gabarito),
    enunciadoTex: campo3(p, q, r),
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Em vez de seis integrais nas faces, uma integral tripla do divergente.',
          tex: '\\oiint_S \\vec{F} \\cdot \\vec{n}\\,dS = \\iiint_V \\nabla \\cdot \\vec{F}\\,dV',
        },
        {
          descricao: 'O divergente.',
          tex: `\\nabla \\cdot \\vec{F} = ${partes.map(monoTex).join(' + ')}`,
        },
        {
          descricao: `Integramos cada termo no cubo de lado ${L}.`,
          tex: integrais.map(dec).join(' + ') + ` = ${dec(gabarito)}`,
        },
      ],
    },
    conceitos: ['teoremas.divergencia'],
    armadilhas: semColisoes(
      [
        {
          resposta: partes.reduce((s, m) => s + avaliar(m, 0, 0, 0), 0) * L ** 3,
          diagnostico:
            'O divergente não é constante: não dá para avaliar na origem e multiplicar pelo volume. Integre cada termo.',
          passo: 2,
          conceito: 'teoremas.divergencia',
        },
        {
          resposta: integrarCubo(p, L) + integrarCubo(q, L) + integrarCubo(r, L),
          diagnostico: 'Integrou as componentes do campo. O teorema integra o DIVERGENTE.',
          passo: 1,
          conceito: 'teoremas.divergencia',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Calcule o divergente (∂P/∂x + ∂Q/∂y + ∂R/∂z) e integre no cubo de lado ${L}, termo a termo.`,
  };
}

/** Circulação na circunferência de raio R pelo fluxo do rotacional no disco. */
function stokesNoDisco(nivel: Nivel, rng: Rng): Exercicio<number> {
  const alfa = rng.inteiro(1, 4) * rng.sinal();
  let beta = rng.inteiro(1, 4) * rng.sinal();
  if (beta === alfa) beta += 1;
  const extraP = rng.inteiro(1, 3);
  const extraQ = rng.inteiro(1, 3);
  const R = rng.inteiro(1, 4);
  const rot = beta - alfa;
  const gabarito = rot * Math.PI * R * R;
  // P = α·y + extraP·x², Q = β·x + extraQ·y²: os termos extras não giram.
  const tex = `\\vec{F} = \\left(${alfa}y + ${extraP}x^{2},\\; ${beta}x + ${extraQ}y^{2},\\; z\\right)`;

  return {
    id: `teor-stokes-${alfa}${beta}${extraP}${extraQ}-${R}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Use o teorema de Stokes para calcular a circulação do campo na circunferência x² + y² = ${R * R}, ` +
      'no plano z = 0, percorrida no sentido anti-horário. (2 casas decimais)',
    enunciadoTex: tex,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'Stokes troca a circulação pela integral do rotacional no disco que a curva cerca.',
          tex: '\\oint_C \\vec{F} \\cdot d\\vec{r} = \\iint_S (\\nabla \\times \\vec{F}) \\cdot \\vec{n}\\,dS',
        },
        {
          descricao: 'No disco horizontal, n = k: só a componente z do rotacional conta.',
          tex: `(\\nabla \\times \\vec{F})_z = \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} = ${beta} - ${par(alfa)} = ${rot}`,
          nota: `Os termos ${extraP}x² e ${extraQ}y² não giram: suas derivadas cruzadas são zero.`,
        },
        {
          descricao: `Constante vezes a área do disco, π·${R}².`,
          tex: `${rot} \\cdot \\pi \\cdot ${R * R} = ${dec(gabarito)}`,
        },
      ],
    },
    conceitos: ['teoremas.stokes'],
    armadilhas: semColisoes(
      [
        {
          resposta: -gabarito,
          diagnostico: 'Sinal trocado: anti-horário com n = k para cima dá ∂Q/∂x − ∂P/∂y.',
          passo: 1,
          conceito: 'teoremas.stokes',
        },
        {
          resposta: rot * 2 * Math.PI * R,
          diagnostico:
            'Isso usa o comprimento da circunferência. Stokes integra o rotacional na ÁREA do disco: πR².',
          passo: 2,
          conceito: 'teoremas.stokes',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Stokes: calcule ∂Q/∂x − ∂P/∂y (os termos em x² e y² somem) e multiplique pela área do disco, π·${R}².`,
  };
}

/** F = (a·x, b·y, c·z²) no cilindro de raio R e altura H: divergente a + b + 2cz. */
function divergenciaCilindro(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(1, 3);
  const b = rng.inteiro(1, 3);
  const c = rng.inteiro(1, 3) * rng.sinal();
  const R = rng.inteiro(1, 3);
  const H = rng.inteiro(1, 4);
  const base = Math.PI * R * R;
  const parteConstante = (a + b) * base * H;
  const parteZ = c * base * H * H; // ∭ 2cz dV = 2c·πR²·H²/2
  const gabarito = parteConstante + parteZ;

  return {
    id: `teor-cil-${a}${b}${c}-${R}${H}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Pelo teorema da divergência, qual é o fluxo do campo para fora do cilindro x² + y² ≤ ${R * R}, ` +
      `0 ≤ z ≤ ${H} (com as tampas)? (2 casas decimais)`,
    enunciadoTex: campo3(mono(a, 1), mono(b, 0, 1), mono(c, 0, 0, 2)),
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'O divergente agora depende de z.',
          tex: `\\nabla \\cdot \\vec{F} = ${a} + ${b} + ${2 * c}z`,
        },
        {
          descricao: 'Integramos em fatias horizontais: cada fatia tem área πR².',
          tex: `\\iiint_V (${a + b} + ${2 * c}z)\\,dV = \\pi \\cdot ${R * R} \\int_0^{${H}} (${a + b} + ${2 * c}z)\\,dz`,
        },
        {
          descricao: 'A integral em z.',
          tex: `\\int_0^{${H}} (${a + b} + ${2 * c}z)\\,dz = ${(a + b) * H} + ${par(c * H * H)} = ${(a + b) * H + c * H * H}`,
        },
        {
          descricao: 'Vezes a área da base.',
          tex: `\\pi \\cdot ${R * R} \\cdot ${(a + b) * H + c * H * H} = ${dec(gabarito)}`,
        },
      ],
    },
    conceitos: ['teoremas.divergencia'],
    armadilhas: semColisoes(
      [
        {
          resposta: (a + b) * base * H,
          diagnostico: `Faltou a parte que depende de z: ${2 * c}z integrado de 0 a ${H}.`,
          passo: 2,
          conceito: 'teoremas.divergencia',
        },
        {
          resposta: (a + b + 2 * c) * base * H,
          diagnostico: 'O termo em z não é constante: integre de 0 a H em vez de trocar z por 1.',
          passo: 1,
          conceito: 'teoremas.divergencia',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `O divergente é ${a} + ${b} + ${2 * c}z. Integre em z de 0 a ${H} e multiplique pela área da base, π·${R}².`,
  };
}

/** A área da elipse por Green: ½∮(x dy − y dx). */
function areaPorGreen(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(2, 7);
  let b = rng.inteiro(1, 6);
  if (b === a) b += 1;
  const gabarito = Math.PI * a * b;

  return {
    id: `teor-areagreen-${a}-${b}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'Pelo teorema de Green com o campo F = (−y/2, x/2), a área da região é igual à circulação ' +
      'na borda. Calcule a área da elipse. (2 casas decimais)',
    enunciadoTex: `\\frac{x^{2}}{${a * a}} + \\frac{y^{2}}{${b * b}} = 1`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'Com P = −y/2 e Q = x/2, o integrando de Green vale 1: a integral dupla é a área.',
          tex: '\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} = \\frac{1}{2} + \\frac{1}{2} = 1 \\;\\Rightarrow\\; A = \\frac{1}{2}\\oint_C x\\,dy - y\\,dx',
        },
        {
          descricao: `Parametrizamos a elipse: x = ${a}·cos t, y = ${b}·sen t.`,
          tex: `x\\,dy - y\\,dx = ${a * b}\\cos^{2} t\\,dt + ${a * b}\\sin^{2} t\\,dt = ${a * b}\\,dt`,
        },
        {
          descricao: 'Integrando de 0 a 2π e dividindo por 2.',
          tex: `A = \\frac{1}{2} \\cdot ${a * b} \\cdot 2\\pi = ${a * b}\\pi = ${dec(gabarito)}`,
        },
      ],
    },
    conceitos: ['teoremas.green'],
    armadilhas: semColisoes(
      [
        {
          resposta: 2 * gabarito,
          diagnostico:
            'Faltou o 1/2: com F = (−y/2, x/2) a circulação já é a área; ∮(x dy − y dx) é o DOBRO dela.',
          passo: 2,
          conceito: 'teoremas.green',
        },
        {
          resposta: Math.PI * a * a * b * b,
          diagnostico: `Os semieixos são ${a} e ${b} (as raízes de ${a * a} e ${b * b}), não os quadrados.`,
          passo: 1,
          conceito: 'teoremas.green',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Parametrize x = ${a}·cos t, y = ${b}·sen t e calcule (1/2)·∮(x dy − y dx) de 0 a 2π.`,
  };
}
