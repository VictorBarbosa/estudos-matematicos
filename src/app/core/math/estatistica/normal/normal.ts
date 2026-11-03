import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { formatar, formatarEmTexto } from '@core/math/algebra/polinomio/polinomio';

/**
 * Distribuição normal.
 *
 * É a distribuição que aparece sempre que muitos efeitos pequenos e
 * independentes se somam — por isso ela descreve erro de medida, tolerância de
 * fabricação e ruído de sensor. O teorema central do limite é o motivo: a
 * média de qualquer amostra grande tende a ela, não importa a distribuição de
 * origem.
 *
 * Toda a prática se resume a um movimento: transformar o valor bruto em
 * DESVIOS a partir da média, o escore z. Feito isso, uma tabela só serve a
 * todas as normais do mundo.
 */

/** A regra empírica, que resolve a maioria dos problemas de cabeça. */
export const REGRA_EMPIRICA: readonly { readonly desvios: number; readonly dentro: number }[] = [
  { desvios: 1, dentro: 0.6827 },
  { desvios: 2, dentro: 0.9545 },
  { desvios: 3, dentro: 0.9973 },
];

/** O escore z: a quantos desvios padrão o valor está da média. */
export function escoreZ(valor: number, media: number, desvio: number): number {
  return (valor - media) / desvio;
}

/** A densidade da normal padrão. */
export function densidadePadrao(z: number): number {
  return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
}

/** A densidade de uma normal qualquer. */
export function densidade(x: number, media: number, desvio: number): number {
  return densidadePadrao(escoreZ(x, media, desvio)) / desvio;
}

/**
 * A função erro, por aproximação de Abramowitz e Stegun.
 *
 * Erro máximo de 1,5 × 10⁻⁷, bem abaixo das três ou quatro casas que qualquer
 * tabela impressa oferece — e que é a precisão com que o tópico trabalha.
 */
export function erf(x: number): number {
  const sinal = Math.sign(x);
  const t = 1 / (1 + 0.3275911 * Math.abs(x));

  const serie =
    t * (0.254829592 +
    t * (-0.284496736 +
    t * (1.421413741 +
    t * (-1.453152027 + t * 1.061405429))));

  return sinal * (1 - serie * Math.exp(-x * x));
}

/** A acumulada da normal padrão: a área à esquerda de z. */
export function acumuladaPadrao(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

/** A acumulada de uma normal qualquer. */
export function acumulada(x: number, media: number, desvio: number): number {
  return acumuladaPadrao(escoreZ(x, media, desvio));
}

/** A probabilidade entre dois valores. */
export function probabilidadeEntre(
  de: number,
  ate: number,
  media: number,
  desvio: number,
): number {
  return acumulada(ate, media, desvio) - acumulada(de, media, desvio);
}

/**
 * O inverso da acumulada, por bisseção.
 *
 * É o que responde "qual nota separa os 10% melhores" — a pergunta que a
 * tabela não responde direto.
 */
export function quantilPadrao(probabilidade: number): number {
  if (probabilidade <= 0 || probabilidade >= 1) {
    return probabilidade <= 0 ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
  }

  let baixo = -10;
  let alto = 10;

  for (let passo = 0; passo < 200; passo++) {
    const meio = (baixo + alto) / 2;
    if (acumuladaPadrao(meio) < probabilidade) {
      baixo = meio;
    } else {
      alto = meio;
    }
  }

  return (baixo + alto) / 2;
}

/** A padronização passo a passo: o movimento central do tópico. */
export function escoreZComPassos(
  valor: number,
  media: number,
  desvio: number,
): Resolucao<number> {
  const resultado = escoreZ(valor, media, desvio);

  const passos: Passo[] = [
    {
      descricao: 'O escore z mede a distância até a média em desvios padrão.',
      tex: 'z = \\frac{x - \\mu}{\\sigma}',
      nota: 'Com isso, uma tabela só serve a todas as normais.',
    },
    {
      descricao: 'Substituindo.',
      tex:
        `z = \\frac{${formatar(valor)} - ${formatar(media)}}{${formatar(desvio)}} = ` +
        `${formatar(Number(resultado.toFixed(4)))}`,
    },
    {
      descricao:
        resultado > 0
          ? 'O valor está acima da média, a essa quantidade de desvios.'
          : resultado < 0
            ? 'O valor está abaixo da média, a essa quantidade de desvios.'
            : 'O valor é exatamente a média.',
      tex: `z = ${formatar(Number(resultado.toFixed(4)))}`,
      nota: 'O z não tem unidade: ele mede em desvios, não em metros ou em gramas.',
    },
  ];

  return { resultado, passos };
}

/** A probabilidade abaixo de um valor, pela acumulada. */
export function probabilidadeAbaixoComPassos(
  valor: number,
  media: number,
  desvio: number,
): Resolucao<number> {
  const z = escoreZ(valor, media, desvio);
  const resultado = acumuladaPadrao(z);

  const passos: Passo[] = [
    {
      descricao: 'Primeiro padronizamos o valor.',
      tex: `z = \\frac{${formatar(valor)} - ${formatar(media)}}{${formatar(desvio)}} = ${formatar(Number(z.toFixed(4)))}`,
    },
    {
      descricao: 'A tabela dá a área à esquerda desse z.',
      tex: `P(Z < ${formatar(Number(z.toFixed(4)))}) = ${formatar(Number(resultado.toFixed(4)))}`,
      nota: 'A área total sob a curva vale 1, e é por isso que ela é uma probabilidade.',
    },
    {
      descricao: 'Em porcentagem.',
      tex: `${formatar(Number((resultado * 100).toFixed(2)))}\\%`,
    },
  ];

  return { resultado, passos };
}

/** A probabilidade entre dois valores: a diferença das acumuladas. */
export function probabilidadeEntreComPassos(
  de: number,
  ate: number,
  media: number,
  desvio: number,
): Resolucao<number> {
  const zDe = escoreZ(de, media, desvio);
  const zAte = escoreZ(ate, media, desvio);
  const resultado = acumuladaPadrao(zAte) - acumuladaPadrao(zDe);

  const passos: Passo[] = [
    {
      descricao: 'Padronizamos as duas bordas.',
      tex:
        `z_{1} = ${formatar(Number(zDe.toFixed(4)))} \\qquad z_{2} = ${formatar(Number(zAte.toFixed(4)))}`,
    },
    {
      descricao: 'A área entre elas é a diferença das acumuladas.',
      tex:
        `P = \\Phi(z_{2}) - \\Phi(z_{1}) = ${formatar(Number(acumuladaPadrao(zAte).toFixed(4)))} - ` +
        `${formatar(Number(acumuladaPadrao(zDe).toFixed(4)))}`,
      nota: 'Subtrair é o que sobra quando se recorta um pedaço de outro.',
    },
    {
      descricao: 'E o resultado.',
      tex: `P = ${formatar(Number(resultado.toFixed(4)))} = ${formatar(Number((resultado * 100).toFixed(2)))}\\%`,
    },
  ];

  return { resultado, passos };
}

/** O valor que deixa uma dada proporção abaixo de si. */
export function valorDoQuantilComPassos(
  probabilidade: number,
  media: number,
  desvio: number,
): Resolucao<number> {
  const z = quantilPadrao(probabilidade);
  const resultado = media + z * desvio;

  const passos: Passo[] = [
    {
      descricao: 'Buscamos o z que deixa essa área à esquerda.',
      tex: `\\Phi(z) = ${formatar(probabilidade)} \\;\\Longrightarrow\\; z = ${formatar(Number(z.toFixed(4)))}`,
      nota: 'É a leitura inversa da tabela: da área para o escore.',
    },
    {
      descricao: 'Desfazemos a padronização.',
      tex: 'x = \\mu + z\\sigma',
    },
    {
      descricao: 'Substituindo.',
      tex:
        `x = ${formatar(media)} + ${formatar(Number(z.toFixed(4)))} \\cdot ${formatar(desvio)} = ` +
        `${formatar(Number(resultado.toFixed(4)))}`,
    },
  ];

  return { resultado, passos };
}

/** A regra empírica aplicada a um intervalo centrado na média. */
export function regraEmpiricaComPassos(
  desvios: number,
  media: number,
  desvio: number,
): Resolucao<number> {
  const resultado = acumuladaPadrao(desvios) - acumuladaPadrao(-desvios);

  const passos: Passo[] = [
    {
      descricao: `O intervalo vai de ${formatarEmTexto(desvios)} desvios abaixo a ${formatarEmTexto(desvios)} acima.`,
      tex:
        `\\left[${formatar(Number((media - desvios * desvio).toFixed(4)))},\\; ` +
        `${formatar(Number((media + desvios * desvio).toFixed(4)))}\\right]`,
    },
    {
      descricao: 'Em escores, ele é simétrico em torno de zero.',
      tex: `-${formatar(desvios)} < z < ${formatar(desvios)}`,
      nota: 'A simetria da curva é o que torna a regra empírica fácil de lembrar.',
    },
    {
      descricao: 'A área dentro dele.',
      tex: `P = ${formatar(Number(resultado.toFixed(4)))} = ${formatar(Number((resultado * 100).toFixed(2)))}\\%`,
      nota: 'Um desvio pega cerca de 68 por cento; dois, 95; três, 99,7.',
    },
  ];

  return { resultado, passos };
}
