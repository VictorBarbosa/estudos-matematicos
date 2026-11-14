import { Resolucao } from '@core/math/tipos/tipos';

/**
 * Distribuição eletrônica: onde os elétrons ficam, e por que nessa ordem.
 *
 * Os elétrons ocupam os subníveis em ordem de ENERGIA, não em ordem de número
 * quântico. É por isso que o 4s se preenche antes do 3d, embora o 3 venha
 * antes do 4: o que manda é a energia, e a energia do 4s é menor. A regra
 * diagonal — o diagrama de Linus Pauling — é só um jeito de ler essa ordem num
 * desenho.
 *
 * A distribuição explica a tabela periódica, e não o contrário. O período é o
 * número de camadas ocupadas; o grupo, nos elementos representativos, vem dos
 * elétrons da última camada. Elementos que se parecem são elementos com a
 * última camada parecida — é a mesma razão por que o sódio e o potássio reagem
 * do mesmo jeito.
 *
 * A regra diagonal ERRA em alguns elementos. O cromo deveria terminar em
 * 3d⁴ 4s², e termina em 3d⁵ 4s¹, porque o subnível semicheio é mais estável; o
 * cobre faz o mesmo. São exceções medidas, não ajustes de conveniência, e
 * {@link SEGUE_A_REGRA} existe para que nenhum exercício as cobre como se a
 * regra bastasse.
 */

export interface Subnivel {
  /** A camada: 1, 2, 3… */
  readonly n: number;
  readonly letra: 's' | 'p' | 'd' | 'f';
  readonly eletrons: number;
}

interface Vaga {
  readonly n: number;
  readonly letra: 's' | 'p' | 'd' | 'f';
  readonly capacidade: number;
}

/**
 * Os subníveis na ordem em que se preenchem — a ordem da regra diagonal.
 *
 * Não é a ordem numérica, e é justamente aí que está a lição: 4s antes de 3d.
 */
export const ORDEM_DE_PREENCHIMENTO: readonly Vaga[] = [
  { n: 1, letra: 's', capacidade: 2 },
  { n: 2, letra: 's', capacidade: 2 },
  { n: 2, letra: 'p', capacidade: 6 },
  { n: 3, letra: 's', capacidade: 2 },
  { n: 3, letra: 'p', capacidade: 6 },
  { n: 4, letra: 's', capacidade: 2 },
  { n: 3, letra: 'd', capacidade: 10 },
  { n: 4, letra: 'p', capacidade: 6 },
  { n: 5, letra: 's', capacidade: 2 },
  { n: 4, letra: 'd', capacidade: 10 },
  { n: 5, letra: 'p', capacidade: 6 },
  { n: 6, letra: 's', capacidade: 2 },
  { n: 4, letra: 'f', capacidade: 14 },
  { n: 5, letra: 'd', capacidade: 10 },
  { n: 6, letra: 'p', capacidade: 6 },
  { n: 7, letra: 's', capacidade: 2 },
  { n: 5, letra: 'f', capacidade: 14 },
  { n: 6, letra: 'd', capacidade: 10 },
  { n: 7, letra: 'p', capacidade: 6 },
];

/**
 * Os elementos em que a regra diagonal NÃO acerta a configuração medida.
 *
 * Quase todos são do bloco d e f, e o motivo é o mesmo: um subnível semicheio
 * ou cheio custa menos energia do que a regra prevê. Nenhum exercício deve
 * sortear estes números atômicos — cobrar a regra onde ela falha ensinaria a
 * regra errada.
 */
const EXCECOES = new Set([
  24, 29, 41, 42, 44, 45, 46, 47, 57, 58, 64, 78, 79, 89, 90, 91, 92, 93, 96,
]);

export function SEGUE_A_REGRA(numeroAtomico: number): boolean {
  return !EXCECOES.has(numeroAtomico);
}

/** A distribuição eletrônica, na ordem de preenchimento. */
export function configuracao(eletrons: number): readonly Subnivel[] {
  const distribuicao: Subnivel[] = [];
  let restam = eletrons;

  for (const vaga of ORDEM_DE_PREENCHIMENTO) {
    if (restam <= 0) {
      break;
    }
    const cabem = Math.min(restam, vaga.capacidade);
    distribuicao.push({ n: vaga.n, letra: vaga.letra, eletrons: cabem });
    restam -= cabem;
  }

  return distribuicao;
}

const EXPOENTES = '⁰¹²³⁴⁵⁶⁷⁸⁹';

function expoente(valor: number): string {
  return String(valor)
    .split('')
    .map((digito) => EXPOENTES[Number(digito)]!)
    .join('');
}

/** `1s² 2s² 2p⁶ 3s¹`, como se escreve. */
export function configuracaoEmTexto(eletrons: number): string {
  return configuracao(eletrons)
    .map((subnivel) => `${subnivel.n}${subnivel.letra}${expoente(subnivel.eletrons)}`)
    .join(' ');
}

/** Em LaTeX, com os expoentes de verdade. */
export function configuracaoParaTex(eletrons: number): string {
  return configuracao(eletrons)
    .map((subnivel) => `${subnivel.n}${subnivel.letra}^{${subnivel.eletrons}}`)
    .join('\\;');
}

/** Quantos elétrons em cada camada, da primeira à última ocupada. */
export function camadas(eletrons: number): readonly number[] {
  const porCamada = new Map<number, number>();

  for (const subnivel of configuracao(eletrons)) {
    porCamada.set(subnivel.n, (porCamada.get(subnivel.n) ?? 0) + subnivel.eletrons);
  }

  return [...porCamada.keys()].sort((a, b) => a - b).map((n) => porCamada.get(n)!);
}

/** O período: quantas camadas estão ocupadas. */
export function periodo(eletrons: number): number {
  return camadas(eletrons).length;
}

/**
 * Os elétrons da última camada.
 *
 * É a contagem que a escola chama de «elétrons de valência» nos elementos
 * representativos, e é ela que explica o grupo. Nos metais de transição a
 * conta é outra — o 3d incompleto também participa —, e por isso o tópico não
 * pergunta valência deles.
 */
export function eletronsDaUltimaCamada(eletrons: number): number {
  const porCamada = camadas(eletrons);

  return porCamada[porCamada.length - 1]!;
}

/** Quantos elétrons há num subnível, como `3p`. */
export function eletronsNoSubnivel(eletrons: number, n: number, letra: Subnivel['letra']): number {
  return (
    configuracao(eletrons).find((subnivel) => subnivel.n === n && subnivel.letra === letra)
      ?.eletrons ?? 0
  );
}

export function configuracaoComPassos(eletrons: number, simbolo: string): Resolucao<string> {
  const distribuicao = configuracao(eletrons);
  const resultado = configuracaoEmTexto(eletrons);
  const porCamada = camadas(eletrons);

  // O 4s antes do 3d é a surpresa da ordem, e vale ser apontada quando aparece.
  const temInversao = distribuicao.some(
    (subnivel, indice) => indice > 0 && subnivel.n < distribuicao[indice - 1]!.n,
  );

  return {
    resultado,
    passos: [
      {
        descricao: `${simbolo} neutro tem ${eletrons} elétrons, tantos quantos prótons.`,
        tex: `Z = ${eletrons}`,
      },
      {
        descricao: 'Eles ocupam os subníveis em ordem de ENERGIA, não de número.',
        tex: configuracaoParaTex(eletrons),
        nota: temInversao
          ? 'Note o 4s antes do 3d: a energia do 4s é menor, e é a energia que manda.'
          : 'Cada subnível só recebe o seguinte depois de encher.',
      },
      {
        descricao: 'Juntando por camada, aparece o período e a última camada.',
        tex: porCamada.map((quantos, indice) => `n=${indice + 1}: ${quantos}`).join('\\qquad '),
        nota:
          'O número de camadas ocupadas é o período; os elétrons da última explicam o grupo, ' +
          'e por que elementos de última camada parecida reagem parecido.',
      },
    ],
  };
}
