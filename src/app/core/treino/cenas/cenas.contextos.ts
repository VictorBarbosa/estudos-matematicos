import { Limites } from '@core/treino/cenas/faixas';

/**
 * As cenas: a história onde o triângulo retângulo aparece.
 *
 * ## O que é uma cena
 *
 * Uma escada apoiada na parede, a sombra de um poste, a rampa de um
 * estacionamento. A cena guarda **o que cada lado do triângulo é naquela
 * história** e **com o que o ângulo é formado** — nunca «um ângulo de 35°»
 * solto, sempre «35° com o chão» ou «com a horizontal». A história em si, nas
 * três línguas, está no molde `cena-<id>.json`; aqui ficam os números e as
 * palavras.
 *
 * ## Por que os nomes dos lados moram aqui, e não no molde
 *
 * A pergunta é a mesma para todas as cenas — «Quanto mede …?» — e o que muda é
 * o nome do lado procurado. Um molde por cena × pergunta seriam 140 arquivos;
 * um molde por cena mais um por pergunta são 27. O nome do lado entra na
 * lacuna com o valor de cada língua, que é o caminho que
 * `enunciadoDoMoldePorIdioma` abriu.
 *
 * ## A regra que faz o francês sair certo
 *
 * **O sintagma traz o seu próprio determinante, já elidido e contraído.**
 * Guardar `artigo` + `nome` para o código colar quebra em francês (`de + le =
 * du`, `l'échelle`) e em inglês (`a/an`, adjetivo antes do substantivo). Por
 * isso cada campo é a expressão inteira, escrita à mão nas três línguas — e
 * nada no molde concorda com ela: nem artigo, nem preposição, nem
 * `quel/quelle`.
 */

/** Uma expressão nominal escrita por extenso em cada língua. */
export interface Sintagma {
  readonly pt: string;
  readonly fr: string;
  readonly en: string;
}

/**
 * O que a pergunta dá e o que ela pede.
 *
 * O nome diz o papel do lado PROCURADO e o do lado CONHECIDO, nessa ordem.
 */
export type Forma =
  | 'vertical-por-inclinado'
  | 'horizontal-por-inclinado'
  | 'vertical-por-horizontal'
  | 'horizontal-por-vertical'
  | 'inclinado-por-vertical'
  | 'inclinado-por-horizontal';

export interface Cena {
  /** Também o nome do molde: `cena-escada-parede.json`. */
  readonly id: string;
  /** O cateto vertical, pelo que ele é na história. */
  readonly vertical: Sintagma;
  /** O cateto horizontal. */
  readonly horizontal: Sintagma;
  /** A hipotenusa. */
  readonly inclinado: Sintagma;
  /** A unidade em que a cena mede, escrita por extenso em cada língua. */
  readonly unidade: Sintagma;
  /**
   * Com o que o ângulo é formado.
   *
   * O molde da cena é obrigado a dizê-lo com todas as letras: é o que o aluno
   * precisa para saber qual cateto é o oposto.
   */
  readonly referencia: 'chao' | 'horizontal';
  /** As perguntas que fazem sentido nesta história. */
  readonly formas: readonly Forma[];
  /** Os limites de cada lado e do ângulo, todos obrigatórios. */
  readonly limites: Limites;
}

/**
 * O catálogo.
 *
 * A ordem importa pouco — o sorteio é uniforme —, mas acrescentar uma cena
 * muda o exercício de todas as sementes anteriores, e é por isso que os pisos
 * de `variedade-de-formas.spec.ts` são remedidos a cada lote.
 */
export const CENAS: readonly Cena[] = [
  {
    id: 'escada-parede',
    vertical: {
      pt: 'a altura que a escada alcança na parede',
      fr: "la hauteur que l'échelle atteint sur le mur",
      en: 'the height the ladder reaches on the wall',
    },
    horizontal: {
      pt: 'a distância do pé da escada até a parede',
      fr: "la distance du pied de l'échelle au mur",
      en: 'the distance from the foot of the ladder to the wall',
    },
    inclinado: {
      pt: 'a escada',
      fr: "l'échelle",
      en: 'the ladder',
    },
    unidade: { pt: 'metros', fr: 'mètres', en: 'metres' },
    referencia: 'chao',
    formas: ['vertical-por-inclinado', 'horizontal-por-inclinado', 'vertical-por-horizontal'],
    /*
     * Escada de verdade: entre 2 m e 10 m, inclinada entre 55° e 78°. Abaixo
     * de 55° ela escorrega; acima de 78° o pé fica encostado na parede.
     */
    limites: {
      vertical: [1.5, 9.5],
      horizontal: [0.5, 5],
      inclinado: [2, 10],
      angulo: [55, 78],
    },
  },
];

/** A cena de um id, para os guardas e para o motor. */
export function cenaDe(id: string): Cena | undefined {
  return CENAS.find((cena) => cena.id === id);
}
