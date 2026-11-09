import { Polinomio, fatorarComPassos, formatar, mdc } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

/** A mesma tolerância da correção, para não listar armadilhas indistinguíveis. */
const { saoEquivalentes: proximos } = numeroComCasas(2, 1e-4);

type Pergunta =
  | 'trinomio'
  | 'diferenca'
  | 'trinomio-sinais'
  | 'fator-comum'
  | 'nao-monico'
  | 'cubos'
  | 'agrupamento';

const COMO_FRACAO = ' Responda como fração, ex.: 5/2.';

/**
 * Exercícios de fatoração.
 *
 * Pedimos a MAIOR das raízes reais que a fatoração revela — um único número
 * que só é possível obter tendo fatorado corretamente.
 */
export const geradorFatoracao: GeradorExercicio<number> = {
  topicoId: 'fatoracao',
  // Até o Difícil a raiz é inteira; no Extremo os coeficientes líderes passam
  // de 1 e ela sai fracionária, então o campo precisa anunciar as duas formas.
  formatoResposta: 'inteiro ou fração, ex.: 3 ou 5/2 — decimal só se for exato',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);

    if (pergunta === 'cubos') {
      return exercicioCubos(nivel, rng);
    }

    if (pergunta === 'agrupamento') {
      return exercicioAgrupamento(nivel, rng);
    }

    const { polinomio, raizes, tipo } = sortear(pergunta, nivel, rng);
    const resolucao = fatorarComPassos(polinomio);
    const gabarito = Math.max(...raizes);

    return {
      id: `fatoracao-${nivel}-${polinomio.paraTex()}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        'Fatore a expressão e informe a MAIOR raiz, ou seja, o maior valor de x que a anula.' +
        (Number.isInteger(gabarito) ? '' : COMO_FRACAO),
      enunciadoTex: `${polinomio.paraTex()} = 0`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        // A fatoração é o meio; a pergunta é pela raiz. Sem este passo, a
        // resolução parava na forma fatorada e não respondia o que foi pedido.
        passos: [
          ...resolucao.passos,
          {
            descricao: 'Cada fator nulo dá uma raiz; o enunciado pede a maior delas.',
            tex:
              raizes.length > 1
                ? `x = ${formatar(Math.min(...raizes))} \\text{ ou } x = ${formatar(gabarito)}` +
                  ` \\Rightarrow \\max = ${formatar(gabarito)}`
                : `x = ${formatar(gabarito)}`,
          },
        ],
      },
      conceitos: ['fatoracao.ideia', tipo],
      armadilhas: semColisoes(
        [
          {
            resposta: Math.min(...raizes),
            diagnostico:
              'Essa é a menor das raízes. As duas anulam a expressão, mas o enunciado pede a maior.',
            passo: 1,
            conceito: 'fatoracao.ideia',
          },
          {
            // Trocou o sinal: leu o fator (x − 3) como raiz −3.
            resposta: -Math.max(...raizes),
            diagnostico:
              'O sinal está invertido. No fator (x − r), a raiz é +r, porque é esse valor que ' +
              'faz o fator valer zero. Confira substituindo de volta.',
            passo: 1,
            conceito: 'fatoracao.ideia',
          },
        ],
        gabarito,
        proximos,
      ),
      dica:
        pergunta === 'trinomio' && nivel === 'facil'
          ? 'Procure dois números cuja soma e produto batam com a expressão.'
          : pergunta === 'diferenca' && nivel === 'facil'
            ? 'Dois quadrados subtraídos: x² − r² = (x − r)(x + r). Qual número ao quadrado dá o termo solto?'
            : pergunta === 'nao-monico'
              ? 'O coeficiente de x² não é 1: procure dois números que somem b e multipliquem a·c, e agrupe.'
              : undefined,
    };
  },

  analisar: analisarNumero,

  ...numeroComCasas(2, 1e-4),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['trinomio', 'diferenca']);
    case 'medio':
      return rng.escolher<Pergunta>(['trinomio-sinais', 'diferenca', 'cubos']);
    case 'dificil':
      return rng.escolher<Pergunta>(['fator-comum', 'agrupamento', 'cubos']);
    // O trinômio não mônico só existe aqui; cubos e agrupamento voltam com
    // coeficiente líder diferente de 1, e a raiz sai fracionária.
    case 'extremo':
      return rng.escolher<Pergunta>(['nao-monico', 'agrupamento', 'cubos']);
  }
}

/** Fração reduzida em LaTeX, com o sinal no numerador: `\frac{-3}{2}`, ou um inteiro. */
function fracaoTex(numerador: number, denominador: number): string {
  const divisor = mdc(numerador, denominador) || 1;
  const sinal = Math.sign(numerador) * Math.sign(denominador);
  const n = Math.abs(numerador / divisor) * sinal;
  const d = Math.abs(denominador / divisor);
  return d === 1 ? `${n}` : `\\frac{${n}}{${d}}`;
}

/**
 * Soma ou diferença de cubos: (ax)³ ± b³.
 *
 * O segundo fator, a²x² ∓ abx + b², tem Δ negativo: a expressão tem uma raiz
 * real só, e a pergunta é por ela.
 */
function exercicioCubos(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = nivel === 'extremo' ? rng.inteiro(2, 4) : 1;
  let b = rng.inteiro(1, nivel === 'medio' ? 4 : 6);
  if (nivel === 'extremo' && b % a === 0) b += 1;
  const soma = rng.booleano();

  const [a3, b3] = [a ** 3, b ** 3];
  const polinomio = Polinomio.de(soma ? b3 : -b3, 0, 0, a3);
  const gabarito = (soma ? -b : b) / a;
  const u = a === 1 ? 'x' : `${a}x`;
  const op = soma ? '+' : '-';
  const opMeio = soma ? '-' : '+';
  const fatorLinear = `${u} ${op} ${b}`;
  const coefMeio = a * b === 1 ? '' : a * b;
  const fatorQuadratico = `${a === 1 ? '' : a * a}x^{2} ${opMeio} ${coefMeio}x + ${b * b}`;
  const delta = (a * b) ** 2 - 4 * a * a * b * b;

  return {
    id: `fatoracao-cubos-${a}${op}${b}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'Fatore a expressão e informe a raiz REAL — só existe uma.' +
      (Number.isInteger(gabarito) ? '' : COMO_FRACAO),
    enunciadoTex: `${polinomio.paraTex()} = 0`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `Os dois termos são cubos perfeitos: ${a3}x³ é o cubo de ${u} e ${b3} é o cubo de ${b}.`,
          tex: `${polinomio.paraTex()} = (${u})^{3} ${op} ${b}^{3}`,
        },
        {
          descricao: soma
            ? 'Soma de cubos: o primeiro fator leva +, e o segundo tem − no meio.'
            : 'Diferença de cubos: o primeiro fator leva −, e o segundo tem + no meio.',
          tex: soma
            ? 'u^{3} + v^{3} = (u + v)(u^{2} - uv + v^{2})'
            : 'u^{3} - v^{3} = (u - v)(u^{2} + uv + v^{2})',
        },
        {
          descricao: `Com u = ${u} e v = ${b}.`,
          tex: `(${fatorLinear})(${fatorQuadratico})`,
        },
        {
          descricao: 'O segundo fator nunca zera: o discriminante dele é negativo.',
          tex: `\\Delta = (${a * b})^{2} - 4 \\cdot ${a * a} \\cdot ${b * b} = ${delta} < 0`,
          nota: 'Vale para toda soma ou diferença de cubos: o fator do 2º grau não tem raiz real.',
        },
        {
          descricao: 'A única raiz real vem do primeiro fator.',
          tex: `${fatorLinear} = 0 \\;\\Rightarrow\\; x = ${fracaoTex(soma ? -b : b, a)}`,
        },
      ],
    },
    conceitos: ['fatoracao.cubos', 'fatoracao.ideia'],
    armadilhas: semColisoes(
      [
        {
          resposta: -gabarito,
          diagnostico: soma
            ? `Na SOMA de cubos o primeiro fator é (${fatorLinear}), e ele zera num x NEGATIVO.`
            : `Na DIFERENÇA de cubos o primeiro fator é (${fatorLinear}), e ele zera num x POSITIVO.`,
          passo: 4,
          conceito: 'fatoracao.cubos',
        },
        {
          resposta: (soma ? -b3 : b3) / a3,
          diagnostico: `Esse é o termo solto dividido por ${a3}, sem tirar a raiz cúbica. O cubo de qual número dá ${b3}?`,
          passo: 0,
          conceito: 'fatoracao.cubos',
        },
        {
          resposta: soma ? -b : b,
          diagnostico: `Faltou dividir por ${a}: o fator é ${u} ${op} ${b}, então x = ${soma ? '−' : ''}${b}/${a}.`,
          passo: 4,
          conceito: 'fatoracao.cubos',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'medio'
        ? `${b3} é um cubo perfeito (${b}³). Use u³ ${op} v³ = (u ${op} v)(u² ${opMeio} uv + v²) e iguale o primeiro fator a zero.`
        : undefined,
  };
}

/**
 * Fatoração por agrupamento: ax³ + bx² ± ak²x ± bk².
 *
 * Agrupando dois a dois, o mesmo parêntese (ax + b) aparece nos dois grupos e
 * vira fator comum. O que sobra, x² ± k², ou é diferença de quadrados (mais
 * duas raízes) ou não tem raiz real.
 */
function exercicioAgrupamento(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = nivel === 'extremo' ? rng.inteiro(2, 4) : 1;
  const k = rng.inteiro(1, 5);
  const menos = rng.booleano();
  let b: number;
  do {
    b = rng.inteiro(-9, 9);
  } while (b === 0 || (a > 1 && b % a === 0) || (menos && Math.abs(b) === a * k));

  const k2 = k * k;
  const s = menos ? -1 : 1;
  const polinomio = Polinomio.de(s * b * k2, s * a * k2, b, a);
  const linear = Polinomio.de(b, a).paraTex();
  const grupo1 = Polinomio.de(0, 0, b, a).paraTex();
  const grupo2 = Polinomio.de(s * b * k2, s * a * k2).paraTex();

  const raizLinear = -b / a;
  const raizes = menos ? [raizLinear, k, -k] : [raizLinear];
  const gabarito = Math.max(...raizes);
  const gabaritoTex = gabarito === raizLinear ? fracaoTex(-b, a) : `${gabarito}`;

  return {
    id: `fatoracao-agrupamento-${a}${b}${s * k2}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'Fatore por agrupamento e informe a MAIOR raiz real.' +
      (Number.isInteger(gabarito) ? '' : COMO_FRACAO),
    enunciadoTex: `${polinomio.paraTex()} = 0`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Agrupamos os termos dois a dois.',
          tex: `\\left(${grupo1}\\right) + \\left(${grupo2}\\right)`,
        },
        {
          descricao: `Em cada grupo, o fator comum em evidência: x² no primeiro, ${menos ? '−' : ''}${k2} no segundo.`,
          tex: `x^{2}\\left(${linear}\\right) ${menos ? '-' : '+'} ${k2}\\left(${linear}\\right)`,
        },
        {
          descricao: 'O mesmo parêntese aparece nos dois grupos: ele vira o fator comum.',
          tex: `\\left(${linear}\\right)\\left(x^{2} ${menos ? '-' : '+'} ${k2}\\right)`,
        },
        menos
          ? {
              descricao: `O segundo fator é diferença de quadrados: x² − ${k2} = (x − ${k})(x + ${k}).`,
              tex: `\\left(${linear}\\right)(x - ${k})(x + ${k})`,
            }
          : {
              descricao: `O segundo fator, x² + ${k2}, é sempre positivo: não dá raiz real.`,
              tex: `x^{2} + ${k2} > 0 \\quad \\text{para todo } x`,
            },
        {
          descricao: menos
            ? 'Cada fator nulo dá uma raiz; o enunciado pede a maior.'
            : 'A única raiz real vem do primeiro fator.',
          tex: menos
            ? `x = ${fracaoTex(-b, a)},\\; x = ${k},\\; x = ${-k} \\;\\Rightarrow\\; \\max = ${gabaritoTex}`
            : `${linear} = 0 \\;\\Rightarrow\\; x = ${gabaritoTex}`,
        },
      ],
    },
    conceitos: ['fatoracao.agrupamento', 'fatoracao.ideia'],
    armadilhas: semColisoes(
      [
        {
          resposta: menos ? Math.min(...raizes) : -raizLinear,
          diagnostico: menos
            ? 'Essa é a menor das raízes. Todas anulam a expressão, mas o enunciado pede a maior.'
            : `O sinal está invertido: o fator (${linear}) zera no número de sinal contrário ao que está dentro dele.`,
          passo: 4,
          conceito: 'fatoracao.ideia',
        },
        {
          resposta: menos ? -raizLinear : k,
          diagnostico: menos
            ? `O fator (${linear}) zera no número de sinal contrário ao que está dentro dele.`
            : `x² + ${k2} não é diferença de quadrados: com +, ele não se anula para nenhum x real.`,
          passo: 3,
          conceito: menos ? 'fatoracao.ideia' : 'fatoracao.diferenca',
        },
        {
          resposta: -b,
          diagnostico: `Faltou dividir por ${a}: o fator é ${linear}, então x = ${-b}/${a}.`,
          passo: 4,
          conceito: 'fatoracao.agrupamento',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'dificil'
        ? 'Separe os quatro termos em dois pares e tire o fator comum de cada par: o mesmo parêntese deve aparecer nos dois.'
        : undefined,
  };
}

interface Sorteio {
  readonly polinomio: Polinomio;
  readonly raizes: readonly number[];
  readonly tipo: string;
}

function sortear(pergunta: Pergunta, nivel: Nivel, rng: Rng): Sorteio {
  switch (pergunta) {
    case 'diferenca': {
      /*
       * Diferença de quadrados, com raiz inteira.
       *
       * `a²x² - k²` tem raízes `±k/a`, e com `k` e `a` sorteados à solta elas
       * saem dízimas: o tópico pedia «um número inteiro» e esperava 0,8333.
       * Pior, quem escrevia `0.833` era reprovado — o ponto era lido como
       * separador de milhar. Tomando `k = a·r`, a conta é a mesma e a
       * resposta é `±r`. No Fácil, a = 1.
       */
      const a = nivel === 'facil' ? 1 : rng.inteiro(1, 6);
      const r = rng.inteiro(1, 10);
      return {
        polinomio: Polinomio.de(-(a * r * (a * r)), 0, a * a),
        raizes: [r, -r],
        tipo: 'fatoracao.diferenca',
      };
    }
    case 'trinomio-sinais': {
      // Trinômio com raízes de sinais diferentes.
      const r1 = rng.inteiro(-14, -1);
      const r2 = rng.inteiro(1, 7);
      return {
        polinomio: Polinomio.de(r1 * r2, -(r1 + r2), 1),
        raizes: [r1, r2],
        tipo: 'fatoracao.trinomio',
      };
    }
    case 'fator-comum': {
      // Fator comum somado a um trinômio: exige as duas técnicas em sequência.
      const comum = rng.inteiro(2, 5);
      const r1 = rng.inteiro(-6, 6);
      let r2 = rng.inteiro(-6, 6);
      if (r1 === r2) {
        r2 = r1 + 1;
      }

      const base = Polinomio.de(r1 * r2, -(r1 + r2), 1).escalar(comum);
      return { polinomio: base, raizes: [r1, r2], tipo: 'fatoracao.trinomio' };
    }
    case 'nao-monico': {
      /*
       * Trinômio não mônico: `ax² + bx + c` com `a` diferente de 1 e SEM
       * fator comum para tirar antes.
       *
       * É outra técnica, não o mesmo exercício com números maiores: não dá
       * para procurar dois números que somam `b` e multiplicam `c`; é preciso
       * trabalhar com `a·c` e agrupar. As raízes saem fracionárias, e o
       * enunciado pede a maior delas.
       */
      const p = rng.inteiro(2, 7);
      const q = rng.inteiro(2, 7);
      const r = rng.inteiro(-9, 9) || 1;
      let t = rng.inteiro(-9, 9) || 2;
      // Raízes distintas: `r/p` e `t/q` são iguais quando `r·q = t·p`.
      if (r * q === t * p) {
        t = t + 1;
      }

      // (px - r)(qx - t) = pq x² - (pt + qr) x + rt
      const polinomio = Polinomio.de(r * t, -(p * t + q * r), p * q);
      return { polinomio, raizes: [r / p, t / q], tipo: 'fatoracao.trinomio' };
    }
    default: {
      // Trinômio simples com raízes inteiras distintas.
      const r1 = rng.inteiro(1, 20);
      let r2 = rng.inteiro(1, 20);
      if (r1 === r2) {
        r2 = r1 + 1;
      }
      return {
        polinomio: Polinomio.de(r1 * r2, -(r1 + r2), 1),
        raizes: [r1, r2],
        tipo: 'fatoracao.trinomio',
      };
    }
  }
}

/** O maior fator inteiro comum aos coeficientes, usado pelo componente. */
export function fatorComum(polinomio: Polinomio): number {
  const naoNulos = polinomio.coeficientes
    .filter((c) => c !== 0)
    .map((c) => Math.abs(Math.round(c)));
  return naoNulos.length === 0 ? 1 : naoNulos.reduce((acumulado, valor) => mdc(acumulado, valor));
}
