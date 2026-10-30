import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { formatar, formatarEmTexto } from '@core/math/algebra/polinomio/polinomio';

/**
 * Limites, abordados numericamente.
 *
 * A ideia central é que o limite descreve para onde a função TENDE, e não
 * quanto ela vale no ponto — distinção que a aproximação numérica torna
 * palpável antes de qualquer formalismo.
 */

export interface Aproximacao {
  readonly x: number;
  readonly fx: number;
}

/** Tabela de valores aproximando-se de um ponto por um dos lados. */
export function aproximar(
  f: (x: number) => number,
  ponto: number,
  pelaEsquerda: boolean,
  passos = 5,
): readonly Aproximacao[] {
  return Array.from({ length: passos }, (_, indice) => {
    const distancia = 10 ** -(indice + 1);
    const x = pelaEsquerda ? ponto - distancia : ponto + distancia;
    return { x, fx: f(x) };
  });
}

export interface LimiteLateral {
  readonly esquerda: number;
  readonly direita: number;
  readonly existe: boolean;
  /** O valor do limite, quando os dois lados concordam. */
  readonly valor: number | null;
}

/** Calcula os dois limites laterais por aproximação numérica. */
export function limitesLaterais(f: (x: number) => number, ponto: number): LimiteLateral {
  const estimar = (pelaEsquerda: boolean): number => {
    const amostras = aproximar(f, ponto, pelaEsquerda, 7)
      .map((a) => a.fx)
      .filter((valor) => Number.isFinite(valor));

    return amostras.at(-1) ?? Number.NaN;
  };

  const esquerda = estimar(true);
  const direita = estimar(false);

  // Tolerância relativa: valores grandes merecem folga proporcional.
  const escala = Math.max(1, Math.abs(esquerda), Math.abs(direita));
  const existe =
    Number.isFinite(esquerda) &&
    Number.isFinite(direita) &&
    Math.abs(esquerda - direita) < escala * 1e-3;

  return { esquerda, direita, existe, valor: existe ? (esquerda + direita) / 2 : null };
}

/**
 * Demonstra um limite pela aproximação numérica dos dois lados.
 *
 * O caso mais instrutivo é o da indeterminação 0/0: a função não existe no
 * ponto, mas o limite existe — e é exatamente essa diferença que o cálculo
 * explora.
 */
export function limiteComPassos(
  f: (x: number) => number,
  ponto: number,
  descricaoFuncao: string,
): Resolucao<LimiteLateral> {
  const lateral = limitesLaterais(f, ponto);
  const noPonto = f(ponto);
  const indefinido = !Number.isFinite(noPonto);

  const passos: Passo[] = [
    {
      descricao: indefinido
        ? 'No próprio ponto a função não está definida.'
        : 'Primeiro verificamos o valor no ponto.',
      tex: indefinido
        ? `f(${formatar(ponto)}) \\text{ é indeterminado}`
        : `f(${formatar(ponto)}) = ${formatar(noPonto)}`,
      nota: indefinido
        ? 'Mas o limite pergunta para onde a função TENDE, não quanto ela vale ali.'
        : undefined,
    },
    {
      descricao: 'Aproximamos pela esquerda, com valores cada vez mais próximos.',
      tex: aproximar(f, ponto, true, 3)
        .map((a) => `f(${formatar(a.x)}) = ${formatar(a.fx)}`)
        .join(' \\quad '),
    },
    {
      descricao: 'E pela direita.',
      tex: aproximar(f, ponto, false, 3)
        .map((a) => `f(${formatar(a.x)}) = ${formatar(a.fx)}`)
        .join(' \\quad '),
    },
  ];

  if (lateral.existe) {
    passos.push({
      descricao: 'Os dois lados convergem para o mesmo valor, então o limite existe.',
      tex: `\\lim_{x \\to ${formatar(ponto)}} ${descricaoFuncao} = ${formatar(lateral.valor!)}`,
      nota: indefinido
        ? 'O limite existe mesmo com a função indefinida no ponto — são perguntas diferentes.'
        : undefined,
    });
  } else {
    passos.push({
      descricao: 'Os lados discordam: o limite NÃO existe.',
      tex: `\\lim_{x \\to ${formatar(ponto)}^{-}} \\neq \\lim_{x \\to ${formatar(ponto)}^{+}}`,
      nota: `Pela esquerda tende a ${formatarEmTexto(lateral.esquerda)}; pela direita, a ${formatarEmTexto(lateral.direita)}.`,
    });
  }

  return { resultado: lateral, passos };
}

/** Limite no infinito, estimado com valores cada vez maiores. */
export function limiteNoInfinito(f: (x: number) => number, positivo = true): number {
  const sinal = positivo ? 1 : -1;
  const valores = [1e3, 1e4, 1e5, 1e6].map((x) => f(sinal * x)).filter(Number.isFinite);
  return valores.at(-1) ?? Number.NaN;
}

/** Uma função é contínua no ponto quando limite e valor coincidem. */
export function ehContinua(f: (x: number) => number, ponto: number): boolean {
  const { existe, valor } = limitesLaterais(f, ponto);
  const noPonto = f(ponto);

  if (!existe || !Number.isFinite(noPonto)) {
    return false;
  }

  const escala = Math.max(1, Math.abs(noPonto));
  return Math.abs(valor! - noPonto) < escala * 1e-3;
}
