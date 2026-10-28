import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos';
import { formatar } from '@core/math/algebra/polinomio';

/**
 * Sequências e séries.
 *
 * O foco é a diferença entre somar sempre a mesma coisa (progressão
 * aritmética) e multiplicar sempre pela mesma coisa (geométrica) — e o que
 * acontece quando essa soma não termina nunca.
 */

export interface Progressao {
  readonly primeiro: number;
  /** Razão: diferença na PA, quociente na PG. */
  readonly razao: number;
  readonly geometrica: boolean;
}

export function termoGeral({ primeiro, razao, geometrica }: Progressao, n: number): number {
  return geometrica ? primeiro * razao ** (n - 1) : primeiro + (n - 1) * razao;
}

export function termosIniciais(progressao: Progressao, quantidade: number): readonly number[] {
  return Array.from({ length: quantidade }, (_, indice) => termoGeral(progressao, indice + 1));
}

/** Soma dos n primeiros termos, com a dedução ao lado. */
export function somaComPassos(progressao: Progressao, n: number): Resolucao<number> {
  const { primeiro, razao, geometrica } = progressao;

  if (n < 1) {
    throw new ErroMatematico('A quantidade de termos deve ser pelo menos 1.');
  }

  if (!geometrica) {
    const ultimo = termoGeral(progressao, n);
    const resultado = ((primeiro + ultimo) * n) / 2;

    return {
      resultado,
      passos: [
        {
          descricao: 'Somando a sequência com ela mesma de trás para frente, cada par dá o mesmo total.',
          tex: `(a_1 + a_n) = ${formatar(primeiro)} + ${formatar(ultimo)} = ${formatar(primeiro + ultimo)}`,
          nota: 'É o truque atribuído a Gauss: o primeiro com o último, o segundo com o penúltimo.',
        },
        {
          descricao: 'São n pares, e a soma dobrada precisa ser dividida por dois.',
          tex: `S_n = \\frac{(a_1 + a_n) \\cdot n}{2} = \\frac{${formatar(primeiro + ultimo)} \\cdot ${n}}{2}`,
        },
        { descricao: 'Calculando.', tex: `S_{${n}} = ${formatar(resultado)}` },
      ],
    };
  }

  if (razao === 1) {
    return {
      resultado: primeiro * n,
      passos: [
        {
          descricao: 'Com razão 1, todos os termos são iguais.',
          tex: `S_n = ${formatar(primeiro)} \\cdot ${n} = ${formatar(primeiro * n)}`,
        },
      ],
    };
  }

  const resultado = (primeiro * (razao ** n - 1)) / (razao - 1);

  return {
    resultado,
    passos: [
      {
        descricao: 'Escrevemos a soma e a multiplicamos pela razão.',
        tex: `S_n = a_1 + a_1q + \\cdots + a_1q^{n-1} \\qquad qS_n = a_1q + \\cdots + a_1q^{n}`,
      },
      {
        descricao: 'Subtraindo uma da outra, quase tudo se cancela.',
        tex: `qS_n - S_n = a_1q^{n} - a_1`,
        nota: 'Restam apenas o último termo da segunda e o primeiro da primeira.',
      },
      {
        descricao: 'Isolando a soma.',
        tex: `S_n = \\frac{a_1(q^{n} - 1)}{q - 1} = \\frac{${formatar(primeiro)}(${formatar(razao)}^{${n}} - 1)}{${formatar(razao - 1)}}`,
      },
      { descricao: 'Calculando.', tex: `S_{${n}} = ${formatar(resultado)}` },
    ],
  };
}

/**
 * Soma infinita de uma PG.
 *
 * Só existe quando |q| < 1: nesse caso os termos encolhem rápido o bastante
 * para que o total se estabilize num valor finito.
 */
export function somaInfinitaComPassos(primeiro: number, razao: number): Resolucao<number | null> {
  if (Math.abs(razao) >= 1) {
    return {
      resultado: null,
      passos: [
        {
          descricao: 'Com |q| ≥ 1, os termos não encolhem.',
          tex: `|${formatar(razao)}| \\geq 1`,
        },
        {
          descricao: 'A soma cresce sem limite: a série diverge.',
          tex: 'S_\\infty \\text{ não existe}',
          nota: 'Para convergir, cada termo precisa ser uma fração do anterior.',
        },
      ],
    };
  }

  const resultado = primeiro / (1 - razao);

  return {
    resultado,
    passos: [
      {
        descricao: 'Com |q| < 1, qⁿ tende a zero quando n cresce.',
        tex: `\\lim_{n \\to \\infty} ${formatar(razao)}^{n} = 0`,
      },
      {
        descricao: 'Na fórmula da soma finita, o termo com qⁿ desaparece.',
        tex: `S_n = \\frac{a_1(1 - q^{n})}{1 - q} \;\\longrightarrow\; \\frac{a_1}{1 - q}`,
      },
      {
        descricao: 'Chegamos a um total finito, apesar de somar infinitas parcelas.',
        tex: `S_\\infty = \\frac{${formatar(primeiro)}}{1 - ${formatar(razao)}} = ${formatar(resultado)}`,
        nota: 'É o que resolve o paradoxo de Zenão: infinitos passos, distância finita.',
      },
    ],
  };
}

/** As somas parciais, que mostram a convergência acontecendo. */
export function somasParciais(progressao: Progressao, quantidade: number): readonly number[] {
  const parciais: number[] = [];
  let acumulado = 0;

  for (let n = 1; n <= quantidade; n++) {
    acumulado += termoGeral(progressao, n);
    parciais.push(acumulado);
  }

  return parciais;
}
