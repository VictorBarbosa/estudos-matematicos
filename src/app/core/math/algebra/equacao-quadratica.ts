import { Passo, Resolucao } from '@core/math/tipos';
import { ErroMatematico } from '@core/math/tipos';
import { Polinomio, formatar } from './polinomio';

/**
 * Equação do 2º grau: ax² + bx + c = 0.
 *
 * O discriminante é tratado como o personagem central — ele decide a
 * quantidade de raízes antes de qualquer conta, e é isso que a demonstração
 * procura deixar claro.
 */
export interface SolucaoQuadratica {
  readonly delta: number;
  readonly raizes: readonly number[];
  /** Coordenadas do vértice da parábola associada. */
  readonly vertice: { readonly x: number; readonly y: number };
  readonly quantidadeDeRaizes: 0 | 1 | 2;
}

export function resolverQuadraticaComPassos(
  a: number,
  b: number,
  c: number,
): Resolucao<SolucaoQuadratica> {
  if (a === 0) {
    throw new ErroMatematico('Com a = 0 a equação não é do 2º grau; é do 1º.');
  }

  const delta = b * b - 4 * a * c;
  const xVertice = -b / (2 * a);
  const yVertice = -delta / (4 * a);

  const raizes =
    delta > 0
      ? [(-b - Math.sqrt(delta)) / (2 * a), (-b + Math.sqrt(delta)) / (2 * a)].sort((x, y) => x - y)
      : delta === 0
        ? [-b / (2 * a)]
        : [];

  const equacao = Polinomio.de(c, b, a).paraTex();

  const passos: Passo[] = [
    {
      descricao: 'Identificamos os coeficientes.',
      tex: `${equacao} = 0 \\qquad a = ${formatar(a)},\\; b = ${formatar(b)},\\; c = ${formatar(c)}`,
    },
    {
      descricao: 'Calculamos o discriminante, que decide quantas raízes existem.',
      tex:
        `\\Delta = b^{2} - 4ac = (${formatar(b)})^{2} - 4 \\cdot (${formatar(a)}) \\cdot ` +
        `(${formatar(c)}) = ${formatar(delta)}`,
      nota: 'Ele é o que está sob a raiz quadrada na fórmula — daí seu poder de decisão.',
    },
  ];

  if (delta < 0) {
    passos.push({
      descricao: 'O discriminante é negativo, e não existe raiz quadrada real de número negativo.',
      tex: `\\sqrt{${formatar(delta)}} \\notin \\mathbb{R}`,
      nota: 'A parábola não cruza o eixo x: ela fica inteiramente acima ou abaixo dele.',
    });
  } else {
    passos.push({
      descricao: 'Aplicamos a fórmula de Bhaskara.',
      tex: `x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a} = \\frac{${formatar(-b)} \\pm \\sqrt{${formatar(delta)}}}{${formatar(2 * a)}}`,
    });

    if (delta === 0) {
      passos.push({
        descricao: 'Com discriminante zero, o ± deixa de fazer diferença: há uma única raiz.',
        tex: `x = \\frac{${formatar(-b)}}{${formatar(2 * a)}} = ${formatar(raizes[0]!)}`,
        nota: 'A parábola toca o eixo x em um único ponto, que é o próprio vértice.',
      });
    } else {
      passos.push({
        descricao: 'O ± gera as duas raízes.',
        tex: `x_1 = ${formatar(raizes[0]!)} \\qquad x_2 = ${formatar(raizes[1]!)}`,
        nota: 'São os dois pontos em que a parábola cruza o eixo x.',
      });
    }
  }

  passos.push({
    descricao: 'O vértice fica na média das raízes, no eixo de simetria da parábola.',
    tex:
      `x_v = \\frac{-b}{2a} = ${formatar(xVertice)} \\qquad ` +
      `y_v = \\frac{-\\Delta}{4a} = ${formatar(yVertice)}`,
    nota:
      a > 0
        ? 'Com a > 0 a parábola abre para cima, e o vértice é o ponto de mínimo.'
        : 'Com a < 0 a parábola abre para baixo, e o vértice é o ponto de máximo.',
  });

  return {
    resultado: {
      delta,
      raizes,
      vertice: { x: xVertice, y: yVertice },
      quantidadeDeRaizes: raizes.length as 0 | 1 | 2,
    },
    passos,
  };
}

/** Forma fatorada a(x − r₁)(x − r₂), quando as raízes são reais. */
export function formaFatoradaParaTex(a: number, raizes: readonly number[]): string | null {
  if (raizes.length === 0) {
    return null;
  }

  const fator = (raiz: number): string =>
    raiz === 0 ? 'x' : `\\left(x ${raiz > 0 ? '-' : '+'} ${formatar(Math.abs(raiz))}\\right)`;

  const coeficiente = a === 1 ? '' : a === -1 ? '-' : formatar(a);

  return raizes.length === 1
    ? `${coeficiente}${fator(raizes[0]!)}^{2}`
    : `${coeficiente}${fator(raizes[0]!)}${fator(raizes[1]!)}`;
}

/** Soma e produto das raízes — as relações de Girard. */
export function relacoesDeGirard(
  a: number,
  b: number,
  c: number,
): {
  readonly soma: number;
  readonly produto: number;
} {
  return { soma: -b / a, produto: c / a };
}
