/**
 * Leitura do que o aluno digita num campo de resposta numérico.
 *
 * Um gerador só sabe corrigir o que consegue ler. Quando cada tópico aceitava
 * apenas `/^[+-]?\d*\.?\d+$/`, havia gabaritos impossíveis de digitar: a maior
 * raiz de uma quadrática de coeficientes livres é irracional em metade dos
 * sorteios, e a raiz de uma diferença de quadrados costuma ser uma dízima.
 * O aluno resolvia certo e era reprovado pelo formato.
 *
 * Esta função lê a resposta como uma pequena expressão aritmética — fração,
 * raiz, π, potência e parênteses —, de modo que a forma exata seja sempre
 * digitável. A comparação com o gabarito continua sendo numérica, com a
 * tolerância que cada tópico escolhe (ver {@link proximosEmCasas}).
 *
 * Aceita, por exemplo:
 *
 * - `0,75`, `-1.5`, `1,2e3`
 * - `3/4`, `-2/3`, `7/(2*3)`
 * - `√2`, `sqrt(2)`, `2√3`, `(1+√5)/2`
 * - `pi`, `π/2`, `3π`
 * - `2^10`, `-(3+1)/2`
 */

/**
 * Multiplicação implícita: `2√3` e `3π` são produtos, não erros de digitação.
 *
 * O `e` de Euler fica de fora de propósito: em `3e` o mais provável é uma
 * notação científica incompleta, não um produto. Quem quiser o número de
 * Euler multiplicado escreve `3*e`.
 */
const INICIA_FATOR = /^(?:[\d(.√]|sqrt|pi|π)/;

/** Um número puro, com sinal, separador decimal e notação científica. */
const NUMERO_SIMPLES = /^[+-]?(?:\d+[.,]?\d*|[.,]\d+)(?:e[+-]?\d+)?$/i;

/**
 * Converte o texto digitado em número, ou devolve `null` se não entender.
 *
 * Nunca lança: formato irreconhecível é um caso previsto, que a área de treino
 * trata sem contar como erro de matemática.
 */
export function analisarNumero(entrada: string): number | null {
  const texto = normalizar(entrada);
  if (texto === '') {
    return null;
  }

  let posicao = 0;

  const iniciaFator = (): boolean => INICIA_FATOR.test(texto.slice(posicao));

  const consumiu = (literal: string): boolean => {
    if (texto.startsWith(literal, posicao)) {
      posicao += literal.length;
      return true;
    }
    return false;
  };

  // soma := produto (('+' | '-') produto)*
  const soma = (): number => {
    let valor = produto();
    for (;;) {
      if (consumiu('+')) {
        valor += produto();
      } else if (consumiu('-')) {
        valor -= produto();
      } else {
        return valor;
      }
    }
  };

  // produto := unario (('*' | '/' | justaposição) unario)*
  const produto = (): number => {
    let valor = unario();
    for (;;) {
      if (consumiu('*')) {
        valor *= unario();
      } else if (consumiu('/')) {
        valor /= unario();
      } else if (iniciaFator()) {
        // `2√3`, `3π`, `2(1+1)`: justapor é multiplicar.
        valor *= unario();
      } else {
        return valor;
      }
    }
  };

  const unario = (): number => {
    if (consumiu('-')) {
      return -unario();
    }
    if (consumiu('+')) {
      return unario();
    }
    return potencia();
  };

  // potencia := primario ('^' unario)?  — associativa à direita
  const potencia = (): number => {
    const base = primario();
    return consumiu('^') ? base ** unario() : base;
  };

  const primario = (): number => {
    if (consumiu('(')) {
      const interno = soma();
      if (!consumiu(')')) {
        throw new FormatoInvalido();
      }
      return interno;
    }

    if (consumiu('sqrt') || consumiu('√')) {
      // `√2` vale sem parênteses: a raiz morde só o fator seguinte.
      const radicando = potencia();
      if (radicando < 0) {
        throw new FormatoInvalido();
      }
      return Math.sqrt(radicando);
    }

    if (consumiu('pi') || consumiu('π')) {
      return Math.PI;
    }

    const numero = /^\d*\.?\d+(?:e[+-]?\d+)?/.exec(texto.slice(posicao));
    if (numero !== null) {
      posicao += numero[0].length;
      return Number(numero[0]);
    }

    // `e` isolado é o número de Euler; `2e3` já foi lido como notação científica.
    if (consumiu('e')) {
      return Math.E;
    }

    throw new FormatoInvalido();
  };

  try {
    const valor = soma();
    if (posicao !== texto.length || !Number.isFinite(valor)) {
      return null;
    }
    return valor;
  } catch (erro) {
    if (erro instanceof FormatoInvalido) {
      return null;
    }
    throw erro;
  }
}

/**
 * Variante estrita, para quando a tarefa É efetuar a conta.
 *
 * Em "quanto é 2 + 3?" ou "qual o valor de 2¹⁰?", aceitar a expressão de volta
 * deixaria o aluno devolver o enunciado sem calcular nada. Aqui entram apenas
 * um número — inclusive em notação científica — ou uma fração simples.
 */
export function analisarValorSimples(entrada: string): number | null {
  const limpo = semSeparadorDeMilhar(entrada.trim().replace(/\s+/g, ''));

  const fracao = /^([+-]?\d+)\/([+-]?\d+)$/.exec(limpo);
  if (fracao) {
    const denominador = Number(fracao[2]);
    return denominador === 0 ? null : Number(fracao[1]) / denominador;
  }

  if (!NUMERO_SIMPLES.test(limpo)) {
    return null;
  }

  const valor = Number(limpo.replace(',', '.'));
  return Number.isFinite(valor) ? valor : null;
}

/**
 * Comparador coerente com o arredondamento que o enunciado pede.
 *
 * `casas` é o número de casas decimais pedido: quem arredonda corretamente
 * erra, no máximo, meia unidade na última casa. Era esse o descompasso de
 * vários tópicos — pedir 2 casas e corrigir com 1e-9, ou com 0,5% relativos
 * sobre um valor grande.
 *
 * A parcela `relativa` cobre o outro lado: gabaritos da ordem de 10⁸ exigem
 * mais algarismos do que uma calculadora mostra.
 */
export function proximosEmCasas(
  casas: number,
  relativa = 1e-6,
): (a: number, b: number) => boolean {
  // Meia unidade na última casa, com uma folga mínima para o ponto flutuante:
  // sem ela, 0,88 contra 0,875 dá 0,005000000000000004 e seria recusado — o
  // arredondamento de "meio" é justamente o caso mais comum.
  const absoluta = 0.5 * 10 ** -casas * (1 + 1e-9);

  return (a: number, b: number): boolean =>
    a === b || Math.abs(a - b) <= Math.max(absoluta, Math.abs(b) * relativa);
}

/**
 * Exibição legível — e re-digitável — de um número.
 *
 * Fora da faixa em que a notação decimal é curta, cai na científica, que o
 * campo também aceita: exibir "0" como resposta correta de 1,2×10⁻¹¹ não
 * ajudava ninguém.
 */
export function formatarNumero(valor: number, casas: number): string {
  if (!Number.isFinite(valor)) {
    return String(valor);
  }

  const magnitude = Math.abs(valor);
  if (valor !== 0 && (magnitude < 10 ** -casas || magnitude >= 1e9)) {
    return valor.toExponential(Math.max(casas, 4)).replace('.', ',');
  }

  return Number(valor.toFixed(casas)).toLocaleString('pt-BR', {
    maximumFractionDigits: casas,
  });
}

/**
 * Exibição e comparação coerentes para um gabarito numérico.
 *
 * As duas pontas vinham de lugares independentes em cada tópico — `formatar`
 * arredondava em 4 casas e `saoEquivalentes` exigia 1e-9 —, e o resultado era
 * o site recusar exatamente a resposta que acabara de mostrar como correta.
 * Aqui as duas saem do mesmo número de casas.
 */
export function numeroComCasas(
  casas: number,
  relativa = 1e-6,
): {
  saoEquivalentes: (a: number, b: number) => boolean;
  formatar: (valor: number) => string;
} {
  return {
    saoEquivalentes: proximosEmCasas(casas, relativa),
    formatar: (valor) => formatarNumero(valor, casas),
  };
}

/** Texto de apoio padrão para os campos que aceitam fração e raiz. */
export const FORMATO_NUMERICO_AMPLO = 'um número, fração ou raiz, ex.: -1,5 · 3/4 · (1+√5)/2';

class FormatoInvalido extends Error {}

/**
 * "50.000.000" e "1.072,5" são separadores de milhar, não produtos.
 *
 * O site exibe o gabarito com `toLocaleString('pt-BR')`, então essa é
 * exatamente a forma que o aluno vê escrita como resposta correta — e, antes
 * disto, era a forma que o campo recusava.
 */
const COM_MILHAR = /^[+-]?\d{1,3}(?:\.\d{3})+(?:,\d+)?$/;

function semSeparadorDeMilhar(texto: string): string {
  return COM_MILHAR.test(texto) ? texto.replace(/\./g, '') : texto;
}

function normalizar(entrada: string): string {
  return semSeparadorDeMilhar(entrada.trim().replace(/\s+/g, ''))
    .toLowerCase()
    .replace(/,/g, '.')
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/[−–—]/g, '-')
    .replace(/raiz(?:quadrada)?(?:de)?/g, 'sqrt');
}
