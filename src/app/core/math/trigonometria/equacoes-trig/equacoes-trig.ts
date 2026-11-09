import { Passo, Resolucao } from '@core/math/tipos/tipos';

/**
 * Funções inversas e equações trigonométricas na primeira volta.
 *
 * Tudo em graus, que é como o enunciado pede e como a calculadora do aluno
 * costuma estar. O ponto delicado é a imagem restrita das inversas: arcsen e
 * arctg devolvem um ângulo entre −90° e 90°, arccos entre 0° e 180° — e a
 * equação, ao contrário, quase sempre tem DUAS soluções na volta.
 */

export type RazaoTrig = 'sen' | 'cos' | 'tg';

export const RAZAO_TEX: Readonly<Record<RazaoTrig, string>> = {
  sen: '\\sin',
  cos: '\\cos',
  tg: '\\tan',
};

export const INVERSA_TEX: Readonly<Record<RazaoTrig, string>> = {
  sen: '\\arcsin',
  cos: '\\arccos',
  tg: '\\arctan',
};

export const INVERSA_TEXTO: Readonly<Record<RazaoTrig, string>> = {
  sen: 'arcsen',
  cos: 'arccos',
  tg: 'arctg',
};

/** A imagem de cada inversa, como texto. */
export const IMAGEM_DA_INVERSA: Readonly<Record<RazaoTrig, string>> = {
  sen: '[−90°, 90°]',
  cos: '[0°, 180°]',
  tg: '(−90°, 90°)',
};

export interface ValorNotavel {
  readonly valor: number;
  readonly tex: string;
  /** A mesma forma em texto corrido, para enunciados e dicas. */
  readonly texto: string;
}

const MEIO: ValorNotavel = { valor: 0.5, tex: '\\frac{1}{2}', texto: '1/2' };
const RAIZ2: ValorNotavel = { valor: Math.SQRT2 / 2, tex: '\\frac{\\sqrt{2}}{2}', texto: '√2/2' };
const RAIZ3: ValorNotavel = { valor: Math.sqrt(3) / 2, tex: '\\frac{\\sqrt{3}}{2}', texto: '√3/2' };
const UM: ValorNotavel = { valor: 1, tex: '1', texto: '1' };
const ZERO: ValorNotavel = { valor: 0, tex: '0', texto: '0' };

const negativo = (v: ValorNotavel): ValorNotavel => ({
  valor: -v.valor,
  tex: `-${v.tex}`,
  texto: `−${v.texto}`,
});

const SENO_COSSENO = [ZERO, MEIO, RAIZ2, RAIZ3, UM].flatMap((v) =>
  v.valor === 0 ? [v] : [v, negativo(v)],
);

const TANGENTE = [
  ZERO,
  { valor: Math.sqrt(3) / 3, tex: '\\frac{\\sqrt{3}}{3}', texto: '√3/3' },
  UM,
  { valor: Math.sqrt(3), tex: '\\sqrt{3}', texto: '√3' },
].flatMap((v) => (v.valor === 0 ? [v] : [v, negativo(v)]));

/** Os valores das tabelas de ângulos notáveis, com sinal. */
export const VALORES_NOTAVEIS: Readonly<Record<RazaoTrig, readonly ValorNotavel[]>> = {
  sen: SENO_COSSENO,
  cos: SENO_COSSENO,
  tg: TANGENTE,
};

/** Tira o ruído do ponto flutuante: 29,999999 vira 30, e −0 vira 0. */
function arredondar(graus: number): number {
  const valor = Math.round(graus * 1e6) / 1e6;
  return valor === 0 ? 0 : valor;
}

/** O ângulo reduzido a [0°, 360°). */
export function naPrimeiraVolta(graus: number): number {
  const valor = arredondar(((graus % 360) + 360) % 360);
  return valor === 360 ? 0 : valor;
}

/**
 * O valor da inversa, em graus, ou `null` fora do domínio.
 *
 * É o valor que a calculadora mostra — sempre dentro da imagem restrita.
 */
export function inversaEmGraus(funcao: RazaoTrig, valor: number): number | null {
  if (funcao !== 'tg' && Math.abs(valor) > 1 + 1e-12) {
    return null;
  }

  const limitado = Math.max(-1, Math.min(1, valor));
  const radianos =
    funcao === 'sen'
      ? Math.asin(limitado)
      : funcao === 'cos'
        ? Math.acos(limitado)
        : Math.atan(valor);

  return arredondar((radianos * 180) / Math.PI);
}

/** Todas as soluções de f(x) = valor em [0°, 360°), em ordem crescente. */
export function solucoesNaVolta(funcao: RazaoTrig, valor: number): readonly number[] {
  const principal = inversaEmGraus(funcao, valor);
  if (principal === null) {
    return [];
  }

  const candidatos =
    funcao === 'sen'
      ? [principal, 180 - principal]
      : funcao === 'cos'
        ? [principal, 360 - principal]
        : [principal, principal + 180];

  return [...new Set(candidatos.map(naPrimeiraVolta))].sort((a, b) => a - b);
}

/** Um número em LaTeX, com até duas casas e vírgula decimal. */
export function grausTex(graus: number): string {
  return String(Number(graus.toFixed(2))).replace('.', '{,}');
}

const entreParenteses = (graus: number): string =>
  graus < 0 ? `(${grausTex(graus)}°)` : `${grausTex(graus)}°`;

/**
 * Resolve f(x) = valor em [0°, 360°), passo a passo.
 *
 * `valorTex` deixa a resolução mostrar √3/2 em vez de 0,866 quando o valor é
 * notável.
 */
export function resolverEquacaoTrigComPassos(
  funcao: RazaoTrig,
  valor: number,
  valorTex: string = grausTex(valor),
): Resolucao<readonly number[]> {
  const principal = inversaEmGraus(funcao, valor);

  if (principal === null) {
    return {
      resultado: [],
      passos: [
        {
          descricao: 'Seno e cosseno só assumem valores entre −1 e 1: a equação não tem solução.',
          tex: `${valorTex} \\notin [-1, 1]`,
        },
      ],
    };
  }

  const solucoes = solucoesNaVolta(funcao, valor);
  const passos: Passo[] = [
    {
      descricao: `A inversa dá uma primeira solução, dentro da imagem dela, ${IMAGEM_DA_INVERSA[funcao]}.`,
      tex: `x_{0} = ${INVERSA_TEX[funcao]}\\left(${valorTex}\\right) = ${grausTex(principal)}°`,
    },
  ];

  if (funcao === 'sen') {
    const segunda = 180 - principal;
    passos.push({
      descricao: 'O seno se repete no ângulo simétrico em relação ao eixo vertical: 180° − x₀.',
      tex: `180° - ${entreParenteses(principal)} = ${grausTex(segunda)}°`,
      nota:
        naPrimeiraVolta(segunda) === naPrimeiraVolta(principal)
          ? 'Coincide com x₀ na volta: aqui há uma solução só.'
          : undefined,
    });
  } else if (funcao === 'cos') {
    const segunda = 360 - principal;
    passos.push({
      descricao:
        'O cosseno se repete no ângulo simétrico em relação ao eixo horizontal: 360° − x₀.',
      tex: `360° - ${grausTex(principal)}° = ${grausTex(segunda)}°`,
      nota:
        naPrimeiraVolta(segunda) === principal
          ? 'Coincide com x₀ na volta: aqui há uma solução só.'
          : undefined,
    });
  } else {
    passos.push({
      descricao: 'A tangente se repete a cada 180°.',
      tex: `${entreParenteses(principal)} + 180° = ${grausTex(principal + 180)}°`,
    });
  }

  if (principal < 0) {
    passos.push({
      descricao: 'Um ângulo negativo volta para [0°, 360°) somando 360°.',
      tex: `${entreParenteses(principal)} + 360° = ${grausTex(principal + 360)}°`,
    });
  }

  passos.push({
    descricao: `Na primeira volta, ${solucoes.length === 1 ? 'a solução' : 'as soluções'}.`,
    tex: `x \\in \\left\\{${solucoes.map((s) => `${grausTex(s)}°`).join(',\\; ')}\\right\\}`,
  });

  return { resultado: solucoes, passos };
}
