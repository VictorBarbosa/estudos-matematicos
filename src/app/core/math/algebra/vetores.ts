import { formatar } from '@core/math/algebra/polinomio';
import { paraGraus, paraRadianos } from '@core/math/trigonometria/trigonometria';
import { ErroMatematico, Resolucao } from '@core/math/tipos';

/**
 * Vetores no plano.
 *
 * O ponto da matéria não é a aritmética — é a ideia de que uma grandeza pode
 * precisar de direção para estar completa. Força, velocidade e aceleração são
 * vetores, e quase todo erro de física vem de somá-los como se fossem números.
 */

export interface Vetor {
  readonly x: number;
  readonly y: number;
}

export function vetorParaTex({ x, y }: Vetor): string {
  return `(${formatar(x)},\\; ${formatar(y)})`;
}

export function modulo({ x, y }: Vetor): number {
  return Math.hypot(x, y);
}

/** Ângulo com o eixo x, em graus, no intervalo [0, 360). */
export function direcaoGraus({ x, y }: Vetor): number {
  const bruto = paraGraus(Math.atan2(y, x));
  return (bruto + 360) % 360;
}

export function somar(a: Vetor, b: Vetor): Vetor {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function subtrair(a: Vetor, b: Vetor): Vetor {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function escalar(v: Vetor, fator: number): Vetor {
  return { x: v.x * fator, y: v.y * fator };
}

/** Vetor de módulo 1 na mesma direção. */
export function normalizar(v: Vetor): Vetor {
  const comprimento = modulo(v);
  if (comprimento === 0) {
    throw new ErroMatematico('O vetor nulo não tem direção definida.');
  }
  return escalar(v, 1 / comprimento);
}

/** Constrói o vetor a partir de módulo e ângulo — a forma polar. */
export function deModuloEAngulo(comprimento: number, anguloGraus: number): Vetor {
  const radianos = paraRadianos(anguloGraus);
  return {
    x: comprimento * Math.cos(radianos),
    y: comprimento * Math.sin(radianos),
  };
}

/**
 * Decompõe um vetor em componentes, mostrando de onde vêm o seno e o cosseno.
 *
 * É o passo que transforma um problema com ângulo em dois problemas sem
 * ângulo — e é a razão pela qual trigonometria vem antes de física.
 */
export function decomporComPassos(
  comprimento: number,
  anguloGraus: number,
): Resolucao<Vetor> {
  if (comprimento < 0) {
    throw new ErroMatematico('O módulo de um vetor não é negativo.');
  }

  const resultado = deModuloEAngulo(comprimento, anguloGraus);

  return {
    resultado,
    passos: [
      {
        descricao: 'O vetor e suas componentes formam um triângulo retângulo.',
        tex: `|\\vec{v}| = ${formatar(comprimento)} \\qquad \\theta = ${formatar(anguloGraus)}^\\circ`,
      },
      {
        descricao: 'A componente horizontal é o cateto adjacente ao ângulo.',
        tex: `v_x = |\\vec{v}|\\cos\\theta = ${formatar(Number(resultado.x.toFixed(4)))}`,
      },
      {
        descricao: 'A vertical é o cateto oposto.',
        tex: `v_y = |\\vec{v}|\\sin\\theta = ${formatar(Number(resultado.y.toFixed(4)))}`,
        nota: 'Trocar seno por cosseno aqui é o erro mais comum do assunto.',
      },
      {
        descricao: 'Conferindo por Pitágoras, as componentes reconstroem o módulo.',
        tex: `\\sqrt{v_x^{2} + v_y^{2}} = ${formatar(Number(modulo(resultado).toFixed(4)))}`,
      },
    ],
  };
}

/**
 * Soma de vetores, com o módulo do resultado.
 *
 * O passo a passo insiste no ponto que mais confunde: o módulo da soma não é a
 * soma dos módulos, exceto quando os vetores têm a mesma direção e sentido.
 */
export function somarComPassos(a: Vetor, b: Vetor): Resolucao<Vetor> {
  const resultado = somar(a, b);
  const somaDosModulos = modulo(a) + modulo(b);

  return {
    resultado,
    passos: [
      {
        descricao: 'Somamos componente por componente.',
        tex: `\\vec{a} + \\vec{b} = ${vetorParaTex(a)} + ${vetorParaTex(b)}`,
      },
      {
        descricao: 'Cada eixo é independente do outro.',
        tex: `= ${vetorParaTex(resultado)}`,
        nota: 'Geometricamente, é a diagonal do paralelogramo formado pelos dois vetores.',
      },
      {
        descricao: 'O módulo da soma sai de Pitágoras.',
        tex: `|\\vec{a}+\\vec{b}| = ${formatar(Number(modulo(resultado).toFixed(4)))}`,
        nota:
          Math.abs(modulo(resultado) - somaDosModulos) < 1e-9
            ? 'Aqui os vetores têm a mesma direção e sentido, e só por isso os módulos somam.'
            : `A soma dos módulos daria ${formatar(Number(somaDosModulos.toFixed(4)))} — ` +
              'maior, porque parte de cada vetor cancela a do outro.',
      },
    ],
  };
}

/** Produto escalar: o quanto um vetor "vai na direção" do outro. */
export function produtoEscalar(a: Vetor, b: Vetor): number {
  return a.x * b.x + a.y * b.y;
}

/**
 * Componente z do produto vetorial de dois vetores do plano.
 *
 * No plano, o produto vetorial aponta para fora da tela, então basta um número.
 * Seu módulo é a área do paralelogramo — e é também o torque de uma força.
 */
export function produtoVetorialZ(a: Vetor, b: Vetor): number {
  return a.x * b.y - a.y * b.x;
}

/** Ângulo entre dois vetores, em graus. */
export function anguloEntreComPassos(a: Vetor, b: Vetor): Resolucao<number> {
  const modA = modulo(a);
  const modB = modulo(b);

  if (modA === 0 || modB === 0) {
    throw new ErroMatematico('Não há ângulo definido com o vetor nulo.');
  }

  const escalarAB = produtoEscalar(a, b);
  // Clampe antes do arco-cosseno: erro de ponto flutuante pode passar de 1.
  const cosseno = Math.min(1, Math.max(-1, escalarAB / (modA * modB)));
  const resultado = paraGraus(Math.acos(cosseno));

  return {
    resultado,
    passos: [
      {
        descricao: 'O produto escalar relaciona os módulos com o cosseno do ângulo.',
        tex: '\\vec{a}\\cdot\\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\theta',
      },
      {
        descricao: 'Calculamos o produto escalar pelas componentes.',
        tex:
          `\\vec{a}\\cdot\\vec{b} = ${formatar(a.x)}\\cdot${formatar(b.x)} + ` +
          `${formatar(a.y)}\\cdot${formatar(b.y)} = ${formatar(escalarAB)}`,
      },
      {
        descricao: 'Isolamos o cosseno.',
        tex: `\\cos\\theta = \\frac{${formatar(escalarAB)}}{${formatar(Number((modA * modB).toFixed(4)))}} = ${formatar(Number(cosseno.toFixed(4)))}`,
      },
      {
        descricao: 'E tomamos o arco-cosseno.',
        tex: `\\theta = ${formatar(Number(resultado.toFixed(2)))}^\\circ`,
        nota:
          Math.abs(escalarAB) < 1e-9
            ? 'Produto escalar zero: os vetores são perpendiculares.'
            : escalarAB > 0
              ? 'Produto positivo: o ângulo é agudo.'
              : 'Produto negativo: o ângulo é obtuso.',
      },
    ],
  };
}

/**
 * Projeção de a sobre b: a "sombra" de um vetor na direção do outro.
 *
 * É exatamente o que o trabalho de uma força mede — só a parte da força que
 * aponta na direção do deslocamento realiza trabalho.
 */
export function projecaoComPassos(a: Vetor, b: Vetor): Resolucao<number> {
  const modB = modulo(b);

  if (modB === 0) {
    throw new ErroMatematico('Não há projeção sobre o vetor nulo.');
  }

  const escalarAB = produtoEscalar(a, b);
  const resultado = escalarAB / modB;

  return {
    resultado,
    passos: [
      {
        descricao: 'A projeção é o módulo de a vezes o cosseno do ângulo entre eles.',
        tex: 'a_b = |\\vec{a}|\\cos\\theta',
      },
      {
        descricao: 'Usando a definição do produto escalar, isso é o escalar dividido pelo módulo de b.',
        tex: `a_b = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{b}|} = \\frac{${formatar(escalarAB)}}{${formatar(Number(modB.toFixed(4)))}}`,
      },
      {
        descricao: 'Calculamos.',
        tex: `a_b = ${formatar(Number(resultado.toFixed(4)))}`,
        nota:
          resultado < 0
            ? 'Projeção negativa: a aponta para o lado oposto ao de b.'
            : 'A projeção não depende do comprimento de b, só da sua direção.',
      },
    ],
  };
}

/** Área do paralelogramo formado por dois vetores. */
export function areaParalelogramoComPassos(a: Vetor, b: Vetor): Resolucao<number> {
  const cruzado = produtoVetorialZ(a, b);
  const resultado = Math.abs(cruzado);

  return {
    resultado,
    passos: [
      {
        descricao: 'O módulo do produto vetorial é a área do paralelogramo.',
        tex: '|\\vec{a}\\times\\vec{b}| = |\\vec{a}||\\vec{b}|\\sin\\theta',
      },
      {
        descricao: 'No plano, ele se reduz a um determinante 2×2.',
        tex:
          `\\begin{vmatrix} ${formatar(a.x)} & ${formatar(a.y)} \\\\ ` +
          `${formatar(b.x)} & ${formatar(b.y)} \\end{vmatrix} = ${formatar(cruzado)}`,
      },
      {
        descricao: 'A área é o valor absoluto — o sinal indica apenas a orientação.',
        tex: `A = ${formatar(resultado)}`,
        nota:
          resultado < 1e-9
            ? 'Área zero: os vetores são paralelos, e não formam paralelogramo.'
            : undefined,
      },
    ],
  };
}

/** Perpendiculares: produto escalar nulo. */
export function vetoresPerpendiculares(a: Vetor, b: Vetor): boolean {
  const escala = modulo(a) * modulo(b);
  return escala > 0 && Math.abs(produtoEscalar(a, b)) < 1e-9 * escala;
}

/** Paralelos: produto vetorial nulo, logo área zero. */
export function vetoresParalelos(a: Vetor, b: Vetor): boolean {
  const escala = modulo(a) * modulo(b);
  return escala > 0 && Math.abs(produtoVetorialZ(a, b)) < 1e-9 * escala;
}
