import { camadas, eletronsNoSubnivel } from '@core/math/quimica/eletrons/eletrons';
import { Resolucao } from '@core/math/tipos/tipos';

/**
 * Tabela periódica e ligação: a periodicidade é consequência, não coincidência.
 *
 * A tabela está arrumada por número atômico, e o que se repete a cada linha é
 * a configuração da última camada. Daí tudo o mais: o GRUPO reúne elementos de
 * última camada igual, e é por isso que eles reagem parecido; o PERÍODO conta
 * as camadas ocupadas; e o tamanho do átomo cresce para baixo (mais camadas) e
 * encolhe para a direita (mais prótons puxando a mesma camada).
 *
 * A ligação sai da mesma leitura. Um átomo com um elétron sobrando na última
 * camada e outro com uma vaga trocam: o primeiro vira cátion, o segundo
 * ânion, e o composto é iônico. Dois átomos que ambos precisam ganhar
 * COMPARTILHAM, e a ligação é covalente. O critério prático é a diferença de
 * eletronegatividade — e ele é uma faixa, não uma fronteira: compostos perto do
 * limite são «parcialmente iônicos», e nenhuma régua decide por eles.
 */

/** Eletronegatividade na escala de Pauling. Gases nobres não têm valor. */
const ELETRONEGATIVIDADE: Readonly<Record<string, number>> = {
  H: 2.2,
  Li: 0.98,
  Be: 1.57,
  B: 2.04,
  C: 2.55,
  N: 3.04,
  O: 3.44,
  F: 3.98,
  Na: 0.93,
  Mg: 1.31,
  Al: 1.61,
  Si: 1.9,
  P: 2.19,
  S: 2.58,
  Cl: 3.16,
  K: 0.82,
  Ca: 1.0,
  Ti: 1.54,
  Cr: 1.66,
  Mn: 1.55,
  Fe: 1.83,
  Co: 1.88,
  Ni: 1.91,
  Cu: 1.9,
  Zn: 1.65,
  Br: 2.96,
  Ag: 1.93,
  Sn: 1.96,
  I: 2.66,
  Ba: 0.89,
  Pt: 2.28,
  Au: 2.54,
  Hg: 2.0,
  Pb: 2.33,
};

export function eletronegatividade(simbolo: string): number | undefined {
  return ELETRONEGATIVIDADE[simbolo];
}

/**
 * A diferença de eletronegatividade entre dois elementos, sempre positiva.
 *
 * É o critério prático do tipo de ligação, e o número que se compara com a
 * faixa — não com uma fronteira.
 */
export function diferencaDeEletronegatividade(
  primeiro: string,
  segundo: string,
): number | undefined {
  const a = eletronegatividade(primeiro);
  const b = eletronegatividade(segundo);

  return a === undefined || b === undefined ? undefined : Math.abs(a - b);
}

export type TipoDeLigacao = 'ionica' | 'covalente-polar' | 'covalente-apolar';

/**
 * O tipo de ligação pela diferença de eletronegatividade.
 *
 * Os cortes — 1,7 e 0,4 — são convenção de ensino, e não lei da natureza. O
 * HF, com 1,78, é tratado como iônico por esta régua e se comporta como
 * molécula covalente muito polar: é o exemplo que mostra que a régua é
 * aproximação, e é por isso que o site não faz dela pergunta de treino.
 */
export function tipoDeLigacao(primeiro: string, segundo: string): TipoDeLigacao | undefined {
  const diferenca = diferencaDeEletronegatividade(primeiro, segundo);

  if (diferenca === undefined) {
    return undefined;
  }
  if (diferenca >= 1.7) {
    return 'ionica';
  }

  return diferenca >= 0.4 ? 'covalente-polar' : 'covalente-apolar';
}

/**
 * O grupo na tabela, na numeração de 1 a 18.
 *
 * Vale para os elementos representativos, que são os que o tópico cobra: o
 * grupo sai dos elétrons da última camada, e é por isso que ele agrupa
 * elementos de química parecida. No bloco d a conta é outra, e por isso esta
 * função devolve `undefined` em vez de inventar um número.
 */
export function grupo(numeroAtomico: number): number | undefined {
  const nUltima = camadas(numeroAtomico).length;

  // A primeira camada só tem s: o hidrogênio abre a tabela e o hélio a fecha.
  if (nUltima === 1) {
    return numeroAtomico === 1 ? 1 : 18;
  }

  const s = eletronsNoSubnivel(numeroAtomico, nUltima, 's');
  const p = eletronsNoSubnivel(numeroAtomico, nUltima, 'p');
  const d = eletronsNoSubnivel(numeroAtomico, nUltima - 1, 'd');
  const f = eletronsNoSubnivel(numeroAtomico, nUltima - 2, 'f');

  // Bloco d ou f em preenchimento: o grupo não sai da última camada, e
  // inventar um número seria pior que não dar nenhum.
  if ((d > 0 && d < 10) || (f > 0 && f < 14)) {
    return undefined;
  }

  // d cheio e p ainda vazio são os grupos 11 e 12 — cobre e zinco —, que
  // também não se leem pela última camada.
  if (d === 10 && p === 0) {
    return undefined;
  }

  const valencia = s + p;

  return valencia <= 2 ? valencia : valencia + 10;
}

/**
 * A carga mais provável do íon de um elemento representativo.
 *
 * Quem tem poucos elétrons na última camada perde-os; quem está perto de
 * fechar, ganha os que faltam. A conta é essa, e é por isso que o sódio é +1 e
 * o oxigênio −2: nenhum dos dois «escolhe» — os dois chegam na configuração do
 * gás nobre mais próximo.
 */
export function cargaMaisProvavel(numeroAtomico: number): number | undefined {
  const grupoDoElemento = grupo(numeroAtomico);

  if (grupoDoElemento === undefined || grupoDoElemento === 18) {
    return undefined;
  }
  if (grupoDoElemento <= 2) {
    return grupoDoElemento;
  }
  if (grupoDoElemento === 13) {
    return 3;
  }
  // 14 a 17: faltam 18 − grupo elétrons para fechar a camada.
  return grupoDoElemento === 14 ? undefined : grupoDoElemento - 18;
}

export interface Ion {
  readonly simbolo: string;
  readonly carga: number;
}

/**
 * A fórmula do composto iônico, pelo cruzamento das cargas.
 *
 * O composto é neutro: a carga total do cátion tem de anular a do ânion. Daí o
 * «cruzamento» que se ensina — o índice de cada um é a carga do outro —, e daí
 * também a redução: `Mg²⁺` com `O²⁻` dá MgO, e não Mg₂O₂, porque a proporção
 * mais simples é a que se escreve.
 */
export function formulaIonica(cation: Ion, anion: Ion): string | undefined {
  const positiva = cation.carga;
  const negativa = Math.abs(anion.carga);

  if (positiva <= 0 || negativa <= 0) {
    return undefined;
  }

  const divisor = mdc(positiva, negativa);
  const indiceDoCation = negativa / divisor;
  const indiceDoAnion = positiva / divisor;

  const escrever = (simbolo: string, indice: number): string =>
    indice === 1 ? simbolo : `${simbolo}${indice}`;

  return `${escrever(cation.simbolo, indiceDoCation)}${escrever(anion.simbolo, indiceDoAnion)}`;
}

function mdc(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y !== 0) {
    [x, y] = [y, x % y];
  }

  return x === 0 ? 1 : x;
}

export function formulaIonicaComPassos(cation: Ion, anion: Ion): Resolucao<string> {
  const resultado = formulaIonica(cation, anion)!;
  const negativa = Math.abs(anion.carga);
  const divisor = mdc(cation.carga, negativa);

  return {
    resultado,
    passos: [
      {
        descricao: 'Cada um chega à configuração do gás nobre mais próximo.',
        tex:
          `\\text{${cation.simbolo}}^{${cation.carga}+} \\qquad ` +
          `\\text{${anion.simbolo}}^{${negativa}-}`,
        nota: 'Quem tem pouco na última camada perde; quem está perto de fechar, ganha.',
      },
      {
        descricao: 'O composto é neutro: as cargas totais têm de se anular.',
        tex: `${negativa} \\times (+${cation.carga}) + ${cation.carga} \\times (-${negativa}) = 0`,
        nota: 'É daí que vem o cruzamento: o índice de cada um é a carga do outro.',
      },
      {
        descricao:
          divisor > 1
            ? 'Os índices se reduzem: o que se escreve é a proporção mais simples.'
            : 'Os índices já estão na proporção mais simples.',
        tex: `\\text{${resultado.replace(/(\d+)/g, '}_{$1}\\text{')}}`,
        nota: divisor > 1 ? 'Mg²⁺ com O²⁻ dá MgO, e não Mg₂O₂.' : undefined,
      },
    ],
  };
}

/**
 * O raio atômico cresce para baixo e encolhe para a direita.
 *
 * Para baixo porque há mais camadas; para a direita porque o número de prótons
 * aumenta enquanto a camada é a mesma, e a atração puxa a eletrosfera para
 * dentro. Esta função não devolve um raio em picômetros — devolve a COMPARAÇÃO,
 * que é o que a tabela ensina e o que uma prova cobra.
 */
export function temRaioMaior(primeiro: number, segundo: number): boolean | undefined {
  const camadasA = camadas(primeiro).length;
  const camadasB = camadas(segundo).length;

  if (camadasA !== camadasB) {
    return camadasA > camadasB;
  }

  // Mesmo período: o de menos prótons é o maior.
  return primeiro === segundo ? undefined : primeiro < segundo;
}
