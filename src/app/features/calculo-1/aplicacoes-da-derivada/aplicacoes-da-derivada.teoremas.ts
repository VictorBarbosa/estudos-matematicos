import { Polinomio } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

/**
 * Regra de L'Hôpital e teorema do valor médio.
 *
 * Os dois resultados que o 0M02 (Calcul différentiel) cobra e que o site não
 * tinha: a avaliação de 09/11 os listou entre os pré-requisitos ausentes.
 */

const { saoEquivalentes: proximos, formatar } = numeroComCasas(3, 1e-4);

/** O número com vírgula decimal, pronto para o LaTeX. */
const tex = (valor: number): string => formatar(valor).replace(',', '{,}');

/** `−3` entre parênteses, para não sair «2 · −3». */
const par = (valor: number): string => (valor < 0 ? `(${valor})` : `${valor}`);

const CASAS = ' (3 casas decimais, ou como fração)';

type Casca = 'sen' | 'exp' | 'ln';

/**
 * L'Hôpital em três degraus.
 *
 * - Médio: uma função transcendente sobre mx em x → 0, uma derivada só.
 * - Difícil: dois polinômios que se anulam no mesmo ponto a ≠ 0.
 * - Extremo: 0/0 de novo depois da primeira derivada — a regra aplicada duas vezes.
 */
export function exercicioLHopital(nivel: Nivel, rng: Rng): Exercicio<number> {
  if (nivel === 'extremo') {
    return lhopitalDuasVezes(nivel, rng);
  }

  if (nivel === 'dificil') {
    return lhopitalPolinomios(nivel, rng);
  }

  const casca = rng.escolher<Casca>(['sen', 'exp', 'ln']);
  const k = rng.inteiro(2, 6);
  let m = rng.inteiro(2, 5);
  if (m === k) m = k + 1;

  const gabarito = k / m;
  const numerador = { sen: `\\sin(${k}x)`, exp: `e^{${k}x} - 1`, ln: `\\ln(1 + ${k}x)` }[casca];
  const derivada = {
    sen: `${k}\\cos(${k}x)`,
    exp: `${k}e^{${k}x}`,
    ln: `\\frac{${k}}{1 + ${k}x}`,
  }[casca];
  const emZero = { sen: `${k}\\cos 0`, exp: `${k}e^{0}`, ln: `\\frac{${k}}{1}` }[casca];

  return {
    id: `aplic-lhopital-${casca}-${k}-${m}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Calcule o limite.${CASAS}`,
    enunciadoTex: `\\lim_{x \\to 0} \\frac{${numerador}}{${m}x}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Substituindo x = 0, em cima e embaixo dá zero: a forma 0/0 é indeterminada.',
          tex: `\\frac{${numerador.replaceAll('x', '\\cdot 0')}}{${m} \\cdot 0} = \\frac{0}{0}`,
          nota: '0/0 não vale 0 nem 1: é só o aviso de que é preciso outra ferramenta.',
        },
        {
          descricao:
            "L'Hôpital: derivamos o numerador e o denominador SEPARADAMENTE (não é a regra do quociente).",
          tex: `\\lim_{x \\to 0} \\frac{${derivada}}{${m}}`,
        },
        {
          descricao: 'Agora a substituição funciona.',
          tex: `\\frac{${emZero}}{${m}} = \\frac{${k}}{${m}} = ${tex(gabarito)}`,
        },
      ],
    },
    conceitos: ['aplic-derivada.lhopital'],
    armadilhas: semColisoes(
      [
        {
          resposta: m / k,
          diagnostico:
            'A fração saiu de cabeça para baixo: a derivada de CIMA vai em cima, a de baixo, embaixo.',
          passo: 1,
          conceito: 'aplic-derivada.lhopital',
        },
        {
          resposta: 0,
          diagnostico:
            '0/0 não é zero — é uma forma indeterminada. Derive em cima e embaixo antes de substituir.',
          passo: 0,
          conceito: 'aplic-derivada.lhopital',
        },
        {
          resposta: 1 / m,
          diagnostico: `Faltou o fator ${k} que sai de dentro pela regra da cadeia ao derivar o numerador.`,
          passo: 1,
          conceito: 'aplic-derivada.lhopital',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'medio'
        ? 'Em x = 0 dá 0 sobre 0. Derive só o de cima e só o de baixo, e substitua x = 0 de novo.'
        : undefined,
  };
}

/** P(x)/Q(x) em x → a, com P(a) = Q(a) = 0 e a ≠ 0, para que fatorar de cabeça não baste. */
function lhopitalPolinomios(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.escolher([-3, -2, -1, 1, 2, 3, 4]);
  let p: number, q: number;
  do {
    p = rng.inteiro(-5, 5);
    q = rng.inteiro(-5, 5);
  } while (p === a || q === a || p === q);
  const c = rng.inteiro(1, 3);

  // P = (x − a)(x − p), Q = c(x − a)(x − q)
  const P = Polinomio.de(a * p, -(a + p), 1);
  const Q = Polinomio.de(c * a * q, -c * (a + q), c);
  const dP = P.derivar();
  const dQ = Q.derivar();
  const topo = dP.avaliar(a);
  const base = dQ.avaliar(a);
  const gabarito = topo / base;

  return {
    id: `aplic-lhopital-poli-${a}${p}${q}${c}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Calcule o limite usando a regra de L'Hôpital.${CASAS}`,
    enunciadoTex: `\\lim_{x \\to ${a}} \\frac{${P.paraTex()}}{${Q.paraTex()}}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `Em x = ${a}, os dois polinômios se anulam.`,
          tex: `P(${a}) = ${P.avaliar(a)} \\qquad Q(${a}) = ${Q.avaliar(a)} \\;\\Rightarrow\\; \\frac{0}{0}`,
        },
        {
          descricao: 'Derivamos cada um separadamente.',
          tex: `P'(x) = ${dP.paraTex()} \\qquad Q'(x) = ${dQ.paraTex()}`,
        },
        {
          descricao: `Substituímos x = ${a} nas derivadas.`,
          tex: `P'(${a}) = 2 \\cdot ${par(a)} ${a + p >= 0 ? '-' : '+'} ${Math.abs(a + p)} = ${topo} \\qquad Q'(${a}) = ${base}`,
        },
        {
          descricao: 'O limite é a razão das derivadas.',
          tex: `\\frac{${topo}}{${base}} = ${tex(gabarito)}`,
          nota: `Conferindo: o fator (x − ${par(a)}) é comum e se cancela — L'Hôpital chega ao mesmo lugar.`,
        },
      ],
    },
    conceitos: ['aplic-derivada.lhopital'],
    armadilhas: semColisoes(
      [
        {
          resposta: base / topo,
          diagnostico: 'A razão saiu invertida: a derivada do numerador vai em cima.',
          passo: 3,
          conceito: 'aplic-derivada.lhopital',
        },
        {
          resposta: 1 / c,
          diagnostico:
            'Essa é a razão dos coeficientes líderes — vale para x → ∞, não para x tendendo a um número.',
          passo: 2,
          conceito: 'aplic-derivada.lhopital',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'dificil'
        ? `Confira que dá 0/0 em x = ${a}; depois derive em cima e embaixo e substitua.`
        : undefined,
  };
}

/** A forma 0/0 persiste depois da primeira derivada: é preciso a segunda. */
function lhopitalDuasVezes(nivel: Nivel, rng: Rng): Exercicio<number> {
  const cosseno = rng.booleano();
  const k = rng.inteiro(2, 6);
  const m = rng.inteiro(1, 4);
  const gabarito = (k * k) / (2 * m);
  const mx = m === 1 ? '' : m;

  const numerador = cosseno ? `1 - \\cos(${k}x)` : `e^{${k}x} - 1 - ${k}x`;
  const primeira = cosseno ? `${k}\\sin(${k}x)` : `${k}e^{${k}x} - ${k}`;
  const segunda = cosseno ? `${k * k}\\cos(${k}x)` : `${k * k}e^{${k}x}`;

  return {
    id: `aplic-lhopital-dupla-${cosseno ? 'cos' : 'exp'}-${k}-${m}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Calcule o limite.${CASAS}`,
    enunciadoTex: `\\lim_{x \\to 0} \\frac{${numerador}}{${mx}x^{2}}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Em x = 0 dá 0/0.',
          tex: `\\frac{${cosseno ? '1 - 1' : '1 - 1 - 0'}}{0} = \\frac{0}{0}`,
        },
        {
          descricao: 'Primeira aplicação: derivadas de cima e de baixo.',
          tex: `\\lim_{x \\to 0} \\frac{${primeira}}{${2 * m}x}`,
          nota: 'Em x = 0 ainda dá 0/0 — então aplicamos de novo.',
        },
        {
          descricao: 'Segunda aplicação.',
          tex: `\\lim_{x \\to 0} \\frac{${segunda}}{${2 * m}}`,
        },
        {
          descricao: 'Agora a substituição funciona.',
          tex: `\\frac{${k * k} \\cdot 1}{${2 * m}} = \\frac{${k * k}}{${2 * m}} = ${tex(gabarito)}`,
        },
      ],
    },
    conceitos: ['aplic-derivada.lhopital'],
    armadilhas: semColisoes(
      [
        {
          resposta: k / (2 * m),
          diagnostico: `Na segunda derivada o fator ${k} sai de novo pela cadeia: fica ${k}·${k} = ${k * k}, não ${k}.`,
          passo: 2,
          conceito: 'aplic-derivada.lhopital',
        },
        {
          resposta: (k * k) / m,
          diagnostico: `A derivada de ${mx}x² é ${2 * m}x: o 2 do expoente desce e fica no denominador.`,
          passo: 1,
          conceito: 'aplic-derivada.lhopital',
        },
        {
          resposta: 0,
          diagnostico:
            'Depois da primeira derivada ainda é 0/0, não zero. Aplique a regra mais uma vez.',
          passo: 1,
          conceito: 'aplic-derivada.lhopital',
        },
      ],
      gabarito,
      proximos,
    ),
  };
}

/**
 * Teorema do valor médio: o ponto c onde a tangente é paralela à secante.
 *
 * - Médio: parábola, e o c é sempre o ponto médio — vale a pena descobrir isso.
 * - Difícil: cúbica em [0, b], c = b/√3.
 * - Extremo: cúbica em [a, b] com a > 0.
 */
export function exercicioValorMedio(nivel: Nivel, rng: Rng): Exercicio<number> {
  if (nivel === 'medio' || nivel === 'facil') {
    return valorMedioParabola(nivel, rng);
  }

  const p = rng.inteiro(1, 3);
  const q = rng.inteiro(-6, 6);
  const a = nivel === 'extremo' ? rng.inteiro(1, 3) : 0;
  const b = a + rng.inteiro(1, 4);

  const f = Polinomio.de(0, q, 0, p);
  const fa = f.avaliar(a);
  const fb = f.avaliar(b);
  const inclinacao = (fb - fa) / (b - a);
  const quadrado = (a * a + a * b + b * b) / 3;
  const gabarito = Math.sqrt(quadrado);

  return {
    id: `aplic-tvm-cubica-${p}${q}-${a}${b}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Pelo teorema do valor médio, existe c em (${a}, ${b}) onde a tangente é paralela à ` +
      'secante pelos extremos do intervalo. Encontre c. (3 casas decimais)',
    enunciadoTex: `f(x) = ${f.paraTex()} \\qquad x \\in [${a}, ${b}]`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A inclinação da secante entre os extremos.',
          tex: `\\frac{f(${b}) - f(${a})}{${b} - ${a}} = \\frac{${fb} - ${par(fa)}}{${b - a}} = ${tex(inclinacao)}`,
        },
        {
          descricao: 'A derivada, que dá a inclinação da tangente.',
          tex: `f'(x) = ${f.derivar().paraTex()}`,
        },
        {
          descricao: 'Igualamos a tangente em c à secante.',
          tex: `${3 * p}c^{2} ${q >= 0 ? '+' : '-'} ${Math.abs(q)} = ${tex(inclinacao)} \\;\\Rightarrow\\; c^{2} = ${tex(quadrado)}`,
          nota: 'O q some dos dois lados: ele inclina a curva inteira por igual.',
        },
        {
          descricao: `Ficamos com a raiz que está dentro de (${a}, ${b}).`,
          tex: `c = \\sqrt{${tex(quadrado)}} = ${tex(gabarito)}`,
        },
      ],
    },
    conceitos: ['aplic-derivada.tvm'],
    armadilhas: semColisoes(
      [
        {
          resposta: (a + b) / 2,
          diagnostico:
            'O ponto médio só vale para parábolas. Numa cúbica é preciso resolver f′(c) = inclinação da secante.',
          passo: 2,
          conceito: 'aplic-derivada.tvm',
        },
        {
          resposta: quadrado,
          diagnostico: 'Esse é c², não c: falta tirar a raiz quadrada.',
          passo: 3,
          conceito: 'aplic-derivada.tvm',
        },
        {
          resposta: inclinacao,
          diagnostico:
            'Essa é a inclinação da secante. O pedido é o PONTO c onde a tangente a iguala.',
          passo: 0,
          conceito: 'aplic-derivada.tvm',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'dificil'
        ? `Calcule a inclinação da secante, iguale a f′(c) e resolva. A resposta é c, não a inclinação.`
        : undefined,
  };
}

function valorMedioParabola(nivel: Nivel, rng: Rng): Exercicio<number> {
  const p = rng.inteiro(1, 4) * rng.sinal();
  const q = rng.inteiro(-6, 6);
  const r = rng.inteiro(-5, 5);
  const a = rng.inteiro(-3, 3);
  const b = a + rng.inteiro(2, 5);

  const f = Polinomio.de(r, q, p);
  const fa = f.avaliar(a);
  const fb = f.avaliar(b);
  const inclinacao = (fb - fa) / (b - a);
  const gabarito = (a + b) / 2;

  return {
    id: `aplic-tvm-parabola-${p}${q}${r}-${a}${b}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Pelo teorema do valor médio, existe c em (${a}, ${b}) onde a tangente é paralela à ` +
      'secante pelos extremos do intervalo. Encontre c.',
    enunciadoTex: `f(x) = ${f.paraTex()} \\qquad x \\in [${a}, ${b}]`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Os valores de f nos extremos do intervalo.',
          tex: `f(${a}) = ${fa} \\qquad f(${b}) = ${fb}`,
        },
        {
          descricao: 'A inclinação da secante.',
          tex: `\\frac{${fb} - ${par(fa)}}{${b} - ${par(a)}} = \\frac{${fb - fa}}{${b - a}} = ${tex(inclinacao)}`,
        },
        {
          descricao: 'A tangente em c tem de ter a mesma inclinação.',
          tex: `f'(c) = ${2 * p}c ${q >= 0 ? '+' : '-'} ${Math.abs(q)} = ${tex(inclinacao)}`,
        },
        {
          descricao: 'Resolvendo a equação do 1º grau.',
          tex: `c = \\frac{${tex(inclinacao)} ${q >= 0 ? '-' : '+'} ${Math.abs(q)}}{${2 * p}} = ${tex(gabarito)}`,
          nota: 'Numa parábola, c é SEMPRE o ponto médio do intervalo — qualquer que seja a parábola.',
        },
      ],
    },
    conceitos: ['aplic-derivada.tvm'],
    armadilhas: semColisoes(
      [
        {
          resposta: inclinacao,
          diagnostico:
            'Essa é a inclinação da secante. O pedido é o PONTO c onde a tangente a iguala.',
          passo: 2,
          conceito: 'aplic-derivada.tvm',
        },
        {
          resposta: (b - a) / 2,
          diagnostico:
            'Essa é a metade do COMPRIMENTO do intervalo. O ponto c fica dentro dele, entre os extremos.',
          passo: 3,
          conceito: 'aplic-derivada.tvm',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'medio'
        ? 'Inclinação da secante = (f(b) − f(a)) / (b − a). Depois resolva f′(c) igual a ela.'
        : undefined,
  };
}
