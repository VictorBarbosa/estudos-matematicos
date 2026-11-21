import { paraRadianos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';

/**
 * De que tamanho pode ser o lado sorteado, dado o ângulo.
 *
 * ## O problema
 *
 * Uma escada de 6 m não encosta a 12 m de altura. Isso não é violação de
 * faixa: é incoerência DERIVADA — cada lado sozinho está dentro do que a cena
 * permite, e o triângulo inteiro é absurdo. Faixa por lado não pega.
 *
 * ## Por que não sortear até dar certo
 *
 * «Sorteie e repita enquanto a resposta for implausível» consome um número
 * VARIÁVEL de valores do gerador de aleatórios, e o projeto inteiro depende de
 * que a mesma semente produza o mesmo exercício (`verificar-geradores.mjs`).
 * Aqui o intervalo admissível é calculado em forma fechada ANTES do sorteio, e
 * o sorteio é um só.
 *
 * ## A conta
 *
 * Com o ângulo θ fixo, os três lados andam juntos:
 * `vertical = inclinado · sen θ` e `horizontal = inclinado · cos θ`. Então o
 * limite de qualquer um deles vira limite dos outros dois, e o intervalo do
 * lado que vai ser sorteado é a INTERSEÇÃO dos três.
 */

/** Os três lados do triângulo, pelo papel que fazem na cena. */
export type Lado = 'vertical' | 'horizontal' | 'inclinado';

/** Um intervalo fechado, sempre com o menor primeiro. */
export type Intervalo = readonly [minimo: number, maximo: number];

/** Os limites que a cena declara, todos obrigatórios. */
export interface Limites {
  readonly vertical: Intervalo;
  readonly horizontal: Intervalo;
  readonly inclinado: Intervalo;
  readonly angulo: Intervalo;
}

const interseccao = (a: Intervalo, b: Intervalo): Intervalo => [
  Math.max(a[0], b[0]),
  Math.min(a[1], b[1]),
];

const escalar = (intervalo: Intervalo, fator: number): Intervalo => [
  intervalo[0] * fator,
  intervalo[1] * fator,
];

/**
 * O intervalo em que o lado pode ser sorteado, ou `null` se não houver nenhum.
 *
 * `null` é defeito de DADOS — a cena declarou limites que não fecham com o
 * ângulo dela —, e `cenas.spec.ts` varre o catálogo inteiro atrás disso. Em
 * tempo de execução, o motor cai fora e o aluno recebe outro exercício.
 */
export function intervaloDoLado(
  lado: Lado,
  anguloGraus: number,
  limites: Limites,
): Intervalo | null {
  const radianos = paraRadianos(anguloGraus);
  const sen = Math.sin(radianos);
  const cos = Math.cos(radianos);

  if (sen <= 0 || cos <= 0) {
    return null;
  }

  // Tudo convertido para a medida do lado que será sorteado.
  const comoInclinado = interseccao(
    limites.inclinado,
    interseccao(escalar(limites.vertical, 1 / sen), escalar(limites.horizontal, 1 / cos)),
  );

  const intervalo =
    lado === 'inclinado'
      ? comoInclinado
      : lado === 'vertical'
        ? escalar(comoInclinado, sen)
        : escalar(comoInclinado, cos);

  return intervalo[0] <= intervalo[1] ? intervalo : null;
}

/**
 * Um valor do intervalo, em passos de meio metro, com UMA chamada ao rng.
 *
 * Meio metro porque é o que se lê bem num enunciado: «uma escada de 6,5 m».
 * Quando nenhum múltiplo de 0,5 cabe no intervalo — faixa estreita demais —, o
 * meio do intervalo com uma casa decimal serve, e o sorteio acontece do mesmo
 * jeito: o determinismo não pode depender do conteúdo da cena.
 */
export function valorNoIntervalo(rng: Rng, [minimo, maximo]: Intervalo): number {
  const primeiro = Math.ceil(minimo * 2) / 2;
  const ultimo = Math.floor(maximo * 2) / 2;
  const quantos = Math.round((ultimo - primeiro) * 2) + 1;

  // A chamada acontece sempre, caiba ou não um múltiplo de 0,5: é ela que
  // mantém o consumo do rng igual para todas as cenas.
  const passo = rng.inteiro(0, Math.max(quantos - 1, 0));

  return quantos > 0 ? primeiro + passo / 2 : Number(((minimo + maximo) / 2).toFixed(1));
}

/**
 * O ângulo da cena, no passo que o nível pede.
 *
 * `anguloRedondo` sorteia na faixa genérica do projeto (5° a 85°) e cortá-la
 * contra a faixa da cena empilharia resultados nos extremos: uma escada só
 * aparece entre 55° e 78°, e metade dos sorteios cairia exatamente em 55°.
 * Aqui o sorteio já nasce dentro da faixa — múltiplos de 5° no Fácil, onde o
 * ângulo redondo ajuda a situar o triângulo; de grau em grau nos demais.
 */
export function anguloDaCena(rng: Rng, facil: boolean, [minimo, maximo]: Intervalo): number {
  const passo = facil ? 5 : 1;
  const primeiro = Math.ceil(minimo / passo) * passo;
  const ultimo = Math.floor(maximo / passo) * passo;
  const quantos = Math.floor((ultimo - primeiro) / passo) + 1;

  return primeiro + rng.inteiro(0, Math.max(quantos - 1, 0)) * passo;
}
