import { analisarNumero } from './resposta-numerica';

/**
 * Respostas que são EXPRESSÕES, e não números.
 *
 * Todo gerador do site aceitava apenas um valor numérico. Isso obrigava os
 * tópicos de cálculo a perguntar "quanto vale f′(2)?" quando a pergunta real
 * do curso é "qual é f′(x)?" — e um aluno pode acertar o número avaliando o
 * limite na mão, sem saber derivar.
 *
 * A comparação não é textual: `2x + 3`, `3 + 2x` e `2(x + 1) + 1` são a mesma
 * função, e nenhuma tabela de formas equivalentes daria conta. O critério é
 * avaliar as duas expressões em vários pontos: se concordam em todos, são a
 * mesma função no intervalo testado.
 */

/** Uma expressão em x, pronta para avaliar e para exibir. */
export interface Simbolica {
  /** A forma como ela foi escrita, para exibir no gabarito. */
  readonly tex: string;
  avaliar(x: number): number;
}

/** Pontos de teste: irracionais de propósito, para não cair em raízes bonitas. */
const PONTOS: readonly number[] = [
  -2.7182818, -1.4142136, -0.6180339, 0.3183099, 0.7071068, 1.2599211, 2.2360679, 3.1415927,
  4.6692016, 7.3890561,
];

/** Quantos pontos precisam concordar — todos os que forem finitos nos dois lados. */
const MINIMO_DE_PONTOS = 4;

/**
 * Lê uma expressão em x.
 *
 * Aceita `+ - * / ^`, parênteses, as funções usuais (`sin`, `cos`, `tan`,
 * `ln`, `log`, `exp`, `sqrt`, `abs`), as constantes `pi` e `e`, e
 * multiplicação implícita (`3x`, `2sin(x)`, `x(x+1)`). Também entende `sen`,
 * `tg` e `√`, que é como se escreve em português.
 */
export function analisarSimbolica(entrada: string): Simbolica | null {
  const original = entrada.trim();
  if (original === '') {
    return null;
  }

  const texto = normalizar(original);

  // Uma constante continua sendo uma expressão — a função constante.
  if (!texto.includes('x')) {
    const valor = analisarNumero(original);
    return valor === null ? null : { tex: original, avaliar: () => valor };
  }

  // Compila uma vez e falha rápido se a expressão não fizer sentido.
  const avaliar = compilar(texto);
  if (avaliar === null) {
    return null;
  }

  // Precisa valer em ALGUM ponto: `1/0` ou `ln(-x²-1)` não são respostas.
  const algumFinito = PONTOS.some((x) => Number.isFinite(avaliar(x)));
  return algumFinito ? { tex: original, avaliar } : null;
}

/**
 * As duas expressões são a mesma função?
 *
 * Compara ponto a ponto, com tolerância relativa. Pontos em que qualquer dos
 * lados não é finito são ignorados — é o caso de `1/x` em zero —, mas é
 * preciso que sobrem pontos suficientes para a conclusão ter valor.
 */
export function simbolicasEquivalentes(a: Simbolica, b: Simbolica): boolean {
  let comparados = 0;

  for (const x of PONTOS) {
    const esquerda = a.avaliar(x);
    const direita = b.avaliar(x);

    if (!Number.isFinite(esquerda) || !Number.isFinite(direita)) {
      continue;
    }

    const escala = Math.max(1, Math.abs(esquerda), Math.abs(direita));
    if (Math.abs(esquerda - direita) > escala * 1e-6) {
      return false;
    }

    comparados++;
  }

  return comparados >= MINIMO_DE_PONTOS;
}

/** Embala uma função conhecida como resposta esperada. */
export function simbolica(tex: string, avaliar: (x: number) => number): Simbolica {
  return { tex, avaliar };
}

/**
 * Versão legível — e digitável — de uma expressão escrita em LaTeX.
 *
 * O gabarito das derivadas nasce em LaTeX, porque é assim que o motor
 * matemático escreve polinômios. Exibir "6x^{2} + 4" na linha "Resposta
 * correta" mostraria a marcação; aqui ela vira "6x^2 + 4", que é como o aluno
 * escreveria — e que o campo aceita de volta.
 */
export function texParaTexto(tex: string): string {
  return tex
    .replace(/\\left|\\right/g, '')
    .replace(/\\cdot/g, '·')
    .replace(/\^\{([^{}]*)\}/g, '^$1')
    .replace(/\{,\}/g, ',')
    .replace(/\\,/g, ' ')
    .replace(/\\(sin|cos|tan|ln|log|exp|sqrt|pi)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Texto de apoio para os campos que esperam uma expressão. */
export const FORMATO_SIMBOLICO = 'uma expressão em x, ex.: 3x^2 - 2x + 1 ou 2cos(x)';

const FUNCOES: Readonly<Record<string, (valor: number) => number>> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  ln: Math.log,
  log: Math.log10,
  exp: Math.exp,
  sqrt: Math.sqrt,
  abs: Math.abs,
};

const NOMES_DE_FUNCAO = Object.keys(FUNCOES).sort((a, b) => b.length - a.length);

/** Multiplicação implícita: o que pode começar um fator. */
const INICIA_FATOR = new RegExp(`^(?:[\\d(.x]|pi|${NOMES_DE_FUNCAO.join('|')})`);

class FormatoInvalido extends Error {}

/**
 * Compila a expressão num avaliador.
 *
 * Analisador recursivo descendente, pela mesma gramática do campo numérico,
 * com a variável e as funções a mais. Nada de `eval`: a expressão vem do
 * aluno, e interpretá-la aqui é o que garante que ela não execute nada.
 */
function compilar(texto: string): ((x: number) => number) | null {
  let posicao = 0;

  const consumiu = (literal: string): boolean => {
    if (texto.startsWith(literal, posicao)) {
      posicao += literal.length;
      return true;
    }
    return false;
  };

  const iniciaFator = (): boolean => INICIA_FATOR.test(texto.slice(posicao));

  type No = (x: number) => number;

  const soma = (): No => {
    let no = produto();
    for (;;) {
      if (consumiu('+')) {
        const direita = produto();
        const esquerda = no;
        no = (x) => esquerda(x) + direita(x);
      } else if (consumiu('-')) {
        const direita = produto();
        const esquerda = no;
        no = (x) => esquerda(x) - direita(x);
      } else {
        return no;
      }
    }
  };

  const produto = (): No => {
    let no = unario();
    for (;;) {
      if (consumiu('*')) {
        const direita = unario();
        const esquerda = no;
        no = (x) => esquerda(x) * direita(x);
      } else if (consumiu('/')) {
        const direita = unario();
        const esquerda = no;
        no = (x) => esquerda(x) / direita(x);
      } else if (iniciaFator()) {
        const direita = unario();
        const esquerda = no;
        no = (x) => esquerda(x) * direita(x);
      } else {
        return no;
      }
    }
  };

  const unario = (): No => {
    if (consumiu('-')) {
      const dentro = unario();
      return (x) => -dentro(x);
    }
    if (consumiu('+')) {
      return unario();
    }
    return potencia();
  };

  const potencia = (): No => {
    const base = primario();
    if (!consumiu('^')) {
      return base;
    }
    const expoente = unario();
    return (x) => base(x) ** expoente(x);
  };

  const primario = (): No => {
    if (consumiu('(')) {
      const dentro = soma();
      if (!consumiu(')')) {
        throw new FormatoInvalido();
      }
      return dentro;
    }

    for (const nome of NOMES_DE_FUNCAO) {
      if (consumiu(nome)) {
        const f = FUNCOES[nome]!;

        // Com parênteses, o argumento é só o que está dentro deles: em
        // `sin(x)^2` o expoente é do SENO, não do x — é quem chama este
        // primário que aplica a potência. Sem parênteses, `sin x^2` segue a
        // convenção usual e vale sin(x²).
        if (texto[posicao] === '(') {
          posicao++;
          const dentro = soma();
          if (!consumiu(')')) {
            throw new FormatoInvalido();
          }
          return (x) => f(dentro(x));
        }

        const argumento = potencia();
        return (x) => f(argumento(x));
      }
    }

    if (consumiu('pi')) {
      return () => Math.PI;
    }

    if (consumiu('x')) {
      return (x) => x;
    }

    const numero = /^\d*\.?\d+(?:e[+-]?\d+)?/.exec(texto.slice(posicao));
    if (numero !== null) {
      posicao += numero[0].length;
      const valor = Number(numero[0]);
      return () => valor;
    }

    if (consumiu('e')) {
      return () => Math.E;
    }

    throw new FormatoInvalido();
  };

  try {
    const arvore = soma();
    return posicao === texto.length ? arvore : null;
  } catch (erro) {
    if (erro instanceof FormatoInvalido) {
      return null;
    }
    throw erro;
  }
}

function normalizar(entrada: string): string {
  return (
    entrada
      .trim()
      .toLowerCase()
      // O site exibe o gabarito em LaTeX; aceitar essa forma de volta permite
      // copiar a resposta correta e permite digitar `x^{2}` ou `x^2`.
      .replace(/\\left|\\right|\\!|\\,|\\;|\\:/g, '')
      .replace(/\\cdot|\\times/g, '*')
      .replace(/\\div/g, '/')
      .replace(/\\(sin|cos|tan|ln|log|exp|sqrt|pi|arcsin|arccos|arctan)/g, '$1')
      .replace(/\^\{([^{}]*)\}/g, '^($1)')
      .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '(($1)/($2))')
  )
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/[−–—]/g, '-')
    .replace(/√/g, 'sqrt')
    // Como se escreve em português.
    .replace(/sen/g, 'sin')
    .replace(/arcsin/g, 'asin')
    .replace(/arccos/g, 'acos')
    .replace(/arctan|arctg/g, 'atan')
    .replace(/tg/g, 'tan')
    .replace(/\btn\b/g, 'tan');
}
