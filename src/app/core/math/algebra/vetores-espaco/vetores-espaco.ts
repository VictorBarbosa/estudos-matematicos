import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { formatar } from '@core/math/algebra/polinomio/polinomio';

/**
 * Vetores em três dimensões.
 *
 * O plano é onde se aprende; o espaço é onde a engenharia acontece. Uma força
 * sobre uma asa, a posição de um satélite e o torque de um motor têm três
 * componentes, e dois deles — o produto vetorial e o produto misto — nem
 * existem no plano: no plano, o produto vetorial é um número solto, e aqui é
 * um vetor perpendicular aos dois, que é o que dá sentido a torque e a momento
 * angular.
 */

export interface Vetor3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/** `(3,\; -1,\; 2)`. */
export function vetor3ParaTex({ x, y, z }: Vetor3): string {
  return `(${formatar(x)},\\; ${formatar(y)},\\; ${formatar(z)})`;
}

/** `3\vec{i} - \vec{j} + 2\vec{k}`, a outra escrita usual. */
export function vetor3ParaTexUnitarios({ x, y, z }: Vetor3): string {
  const termo = (valor: number, letra: string, primeiro: boolean): string => {
    if (valor === 0) {
      return '';
    }
    const sinal = valor < 0 ? '-' : primeiro ? '' : '+';
    const magnitude = Math.abs(valor) === 1 ? '' : formatar(Math.abs(valor));
    return `${sinal} ${magnitude}\\vec{${letra}} `;
  };

  const corpo = termo(x, 'i', true) + termo(y, 'j', x === 0) + termo(z, 'k', x === 0 && y === 0);
  return corpo.trim() === '' ? '\\vec{0}' : corpo.trim();
}

export function modulo3({ x, y, z }: Vetor3): number {
  return Math.sqrt(x * x + y * y + z * z);
}

export function somar3(a: Vetor3, b: Vetor3): Vetor3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function subtrair3(a: Vetor3, b: Vetor3): Vetor3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function escalar3(v: Vetor3, fator: number): Vetor3 {
  return { x: v.x * fator, y: v.y * fator, z: v.z * fator };
}

export function produtoEscalar3(a: Vetor3, b: Vetor3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * O produto vetorial.
 *
 * Devolve um VETOR perpendicular aos dois, e não um número — é a diferença que
 * separa o espaço do plano, e o motivo de torque e momento angular só fazerem
 * sentido completo aqui.
 */
export function produtoVetorial(a: Vetor3, b: Vetor3): Vetor3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

/** O módulo do vetor, passo a passo — Pitágoras em três dimensões. */
export function modulo3ComPassos(v: Vetor3): Resolucao<number> {
  const quadrados = v.x * v.x + v.y * v.y + v.z * v.z;
  const resultado = Math.sqrt(quadrados);

  const passos: Passo[] = [
    {
      descricao: 'O módulo é a raiz da soma dos quadrados das três componentes.',
      tex: `\\left|\\vec{v}\\right| = \\sqrt{x^2 + y^2 + z^2}`,
      nota: 'É Pitágoras duas vezes: primeiro no plano xy, depois com o z.',
    },
    {
      descricao: 'Substituímos as componentes.',
      tex:
        `\\sqrt{(${formatar(v.x)})^2 + (${formatar(v.y)})^2 + (${formatar(v.z)})^2} = ` +
        `\\sqrt{${formatar(quadrados)}}`,
    },
    {
      descricao: 'Extraímos a raiz.',
      tex: `\\left|\\vec{v}\\right| = ${formatar(Number(resultado.toFixed(4)))}`,
    },
  ];

  return { resultado, passos };
}

/** O produto escalar, com a leitura geométrica no fim. */
export function produtoEscalar3ComPassos(a: Vetor3, b: Vetor3): Resolucao<number> {
  const resultado = produtoEscalar3(a, b);

  const passos: Passo[] = [
    {
      descricao: 'Multiplicamos componente a componente e somamos.',
      tex: `\\vec{a} \\cdot \\vec{b} = a_x b_x + a_y b_y + a_z b_z`,
      nota: 'O resultado é um NÚMERO, não um vetor.',
    },
    {
      descricao: 'Substituímos.',
      tex:
        `(${formatar(a.x)})(${formatar(b.x)}) + (${formatar(a.y)})(${formatar(b.y)}) + ` +
        `(${formatar(a.z)})(${formatar(b.z)}) = ${formatar(resultado)}`,
    },
    {
      descricao:
        resultado === 0
          ? 'Produto escalar zero: os vetores são perpendiculares.'
          : `O sinal diz o ângulo: positivo é menos de 90°, negativo é mais.`,
      tex: `\\vec{a} \\cdot \\vec{b} = ${formatar(resultado)}`,
    },
  ];

  return { resultado, passos };
}

/** O produto vetorial pelo determinante simbólico. */
export function produtoVetorial3ComPassos(a: Vetor3, b: Vetor3): Resolucao<Vetor3> {
  const resultado = produtoVetorial(a, b);

  const passos: Passo[] = [
    {
      descricao: 'Montamos o determinante com os unitários na primeira linha.',
      tex:
        `\\vec{a} \\times \\vec{b} = \\begin{vmatrix} \\vec{i} & \\vec{j} & \\vec{k} \\\\ ` +
        `${formatar(a.x)} & ${formatar(a.y)} & ${formatar(a.z)} \\\\ ` +
        `${formatar(b.x)} & ${formatar(b.y)} & ${formatar(b.z)} \\end{vmatrix}`,
      nota: 'A ordem importa: trocar os vetores troca o sinal do resultado.',
    },
    {
      descricao: 'Cada componente é o determinante 2×2 que sobra ao riscar a linha e a coluna.',
      tex:
        `x = ${formatar(a.y)}\\cdot${formatar(b.z)} - ${formatar(a.z)}\\cdot${formatar(b.y)} \\quad ` +
        `y = ${formatar(a.z)}\\cdot${formatar(b.x)} - ${formatar(a.x)}\\cdot${formatar(b.z)} \\quad ` +
        `z = ${formatar(a.x)}\\cdot${formatar(b.y)} - ${formatar(a.y)}\\cdot${formatar(b.x)}`,
      nota: 'Repare no y: a ordem dos termos é trocada, e é aí que o sinal se perde.',
    },
    {
      descricao: 'O resultado é um vetor perpendicular aos dois.',
      tex: `\\vec{a} \\times \\vec{b} = ${vetor3ParaTex(resultado)}`,
    },
  ];

  return { resultado, passos };
}

/** O ângulo entre dois vetores, em graus. */
export function anguloEntreVetores3ComPassos(a: Vetor3, b: Vetor3): Resolucao<number> {
  const escalar = produtoEscalar3(a, b);
  const produtoDosModulos = modulo3(a) * modulo3(b);
  const cosseno = produtoDosModulos === 0 ? 0 : escalar / produtoDosModulos;
  const resultado = (Math.acos(Math.min(1, Math.max(-1, cosseno))) * 180) / Math.PI;

  const passos: Passo[] = [
    {
      descricao: 'O produto escalar também se escreve com o cosseno do ângulo.',
      tex: `\\vec{a} \\cdot \\vec{b} = \\left|\\vec{a}\\right|\\left|\\vec{b}\\right|\\cos\\theta`,
    },
    {
      descricao: 'Isolamos o cosseno e substituímos.',
      tex:
        `\\cos\\theta = \\frac{${formatar(escalar)}}{${formatar(Number(modulo3(a).toFixed(4)))} \\cdot ` +
        `${formatar(Number(modulo3(b).toFixed(4)))}} = ${formatar(Number(cosseno.toFixed(4)))}`,
    },
    {
      descricao: 'Tomamos o arco-cosseno.',
      tex: `\\theta = ${formatar(Number(resultado.toFixed(2)))}^\\circ`,
    },
  ];

  return { resultado, passos };
}

/** O vetor unitário na mesma direção. */
export function unitario3ComPassos(v: Vetor3): Resolucao<Vetor3> {
  const comprimento = modulo3(v);
  const resultado = comprimento === 0 ? { x: 0, y: 0, z: 0 } : escalar3(v, 1 / comprimento);

  const passos: Passo[] = [
    {
      descricao: 'O unitário é o vetor dividido pelo próprio módulo.',
      tex: `\\hat{v} = \\frac{\\vec{v}}{\\left|\\vec{v}\\right|}`,
      nota: 'Ele guarda a direção e o sentido, e joga fora o tamanho.',
    },
    {
      descricao: 'Calculamos o módulo e dividimos cada componente por ele.',
      tex:
        `\\left|\\vec{v}\\right| = ${formatar(Number(comprimento.toFixed(4)))} \\quad\\Rightarrow\\quad ` +
        `\\hat{v} = ${vetor3ParaTex({
          x: Number(resultado.x.toFixed(4)),
          y: Number(resultado.y.toFixed(4)),
          z: Number(resultado.z.toFixed(4)),
        })}`,
    },
    {
      descricao: 'Conferindo: o módulo do unitário é 1.',
      tex: `\\left|\\hat{v}\\right| = ${formatar(Number(modulo3(resultado).toFixed(4)))}`,
    },
  ];

  return { resultado, passos };
}

/**
 * O volume do paralelepípedo montado por três vetores.
 *
 * É o produto misto, e ele responde uma pergunta geométrica de uma vez: se der
 * zero, os três vetores estão no mesmo plano.
 */
export function volumeDoParalelepipedoComPassos(
  a: Vetor3,
  b: Vetor3,
  c: Vetor3,
): Resolucao<number> {
  const cruzado = produtoVetorial(b, c);
  const misto = produtoEscalar3(a, cruzado);
  const resultado = Math.abs(misto);

  const passos: Passo[] = [
    {
      descricao: 'O produto misto é o escalar de um com o vetorial dos outros dois.',
      tex: `V = \\left|\\vec{a} \\cdot (\\vec{b} \\times \\vec{c})\\right|`,
    },
    {
      descricao: 'Primeiro o produto vetorial.',
      tex: `\\vec{b} \\times \\vec{c} = ${vetor3ParaTex(cruzado)}`,
    },
    {
      descricao: 'Depois o escalar, e o módulo do resultado.',
      tex: `V = \\left|${formatar(misto)}\\right| = ${formatar(resultado)}`,
      nota:
        resultado === 0
          ? 'Volume zero: os três vetores cabem num mesmo plano.'
          : 'Volume diferente de zero: os três vetores ocupam o espaço.',
    },
  ];

  return { resultado, passos };
}
