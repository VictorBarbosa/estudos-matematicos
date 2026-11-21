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

/** A linha com que o ângulo é formado, escrita em cada língua. */
export const REFERENCIA_ESCRITA: Readonly<Record<Referencia, Sintagma>> = {
  chao: { pt: 'o chão', fr: 'le sol', en: 'the ground' },
  horizontal: { pt: 'a horizontal', fr: "l'horizontale", en: 'the horizontal' },
  /*
   * Quando quem olha está com os olhos acima do chão, o ângulo não parte do
   * chão: parte da horizontal que passa pelos olhos. Dizer «com o chão» aí
   * seria mentira, e é justamente essa linha que o aluno precisa enxergar para
   * entender por que a altura dos olhos se soma no fim.
   */
  'horizontal-do-olhar': {
    pt: 'a horizontal dos olhos',
    fr: "l'horizontale des yeux",
    en: 'the horizontal at eye level',
  },
};

/** Com o que o ângulo da cena é formado. */
export type Referencia = 'chao' | 'horizontal' | 'horizontal-do-olhar';

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
  /**
   * O ângulo, a partir dos dois catetos.
   *
   * É a pergunta que o enunciado NUNCA pode fazer sem dizer com o que o ângulo
   * é formado — «qual é o ângulo?» sozinho não tem resposta. Por isso a
   * pergunta nomeia a linha de referência da cena e o objeto que a encontra.
   */
  | 'angulo'
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
  /** A hipotenusa, pelo objeto que ela é: «a escada», «a rampa». */
  readonly inclinado: Sintagma;
  /**
   * A hipotenusa quando é ela que se PERGUNTA.
   *
   * «A escada mede 6 metros» é a frase do dado; «Quanto mede o comprimento da
   * escada?» é a da pergunta. Em inglês a diferença é gritante — «What is the
   * ladder?» não é pergunta de geometria —, e por isso o comprimento tem nome
   * próprio em vez de o código tentar derivá-lo do objeto: a contração do
   * artigo muda com a palavra em português e em francês.
   */
  readonly comprimento: Sintagma;
  /** A unidade em que a cena mede, escrita por extenso em cada língua. */
  readonly unidade: Sintagma;
  /**
   * Com o que o ângulo é formado.
   *
   * O molde da cena é obrigado a dizê-lo com todas as letras: é o que o aluno
   * precisa para saber qual cateto é o oposto.
   */
  readonly referencia: Referencia;
  /** As perguntas que fazem sentido nesta história. */
  readonly formas: readonly Forma[];
  /**
   * Quem pode aparecer nela, por id de `profissoes.contextos.ts`.
   *
   * Vazia quando a história fala só de objetos — e aí o molde da cena não tem
   * a lacuna da pessoa. É aqui que mora a coerência que o sorteio livre
   * destrói: «uma astronauta mede a sombra do poste» não acontece porque a
   * cena da sombra não lista astronauta.
   */
  readonly profissoes: readonly string[];
  /** Os limites de cada lado e do ângulo, todos obrigatórios. */
  readonly limites: Limites;
  /**
   * A altura que se SOMA ao cateto vertical no fim da conta.
   *
   * Quem mede o ângulo com os olhos a 1,7 m do chão não mede a altura do
   * prédio: mede a altura ACIMA DOS OLHOS. O triângulo dá essa parte, e a
   * altura dos olhos entra depois, somando — é o passo que mais se esquece, e
   * por isso ele é um passo visível e uma armadilha com diagnóstico próprio.
   *
   * Ausente na maioria das cenas: a escada começa no chão.
   */
  readonly correcao?: readonly [number, number];
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
    comprimento: {
      pt: 'o comprimento da escada',
      fr: "la longueur de l'échelle",
      en: 'the length of the ladder',
    },
    unidade: { pt: 'metros', fr: 'mètres', en: 'metres' },
    referencia: 'chao',
    formas: ['angulo', 'vertical-por-inclinado', 'horizontal-por-inclinado', 'vertical-por-horizontal'],
    profissoes: ['pedreiro', 'bombeira', 'eletricista', 'padeiro', 'pintora'],
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
  {
    id: 'rampa-acesso',
    vertical: {
      pt: 'o desnível vencido pela rampa',
      fr: 'la dénivellation franchie par la rampe',
      en: 'the height the ramp rises',
    },
    horizontal: {
      pt: 'o avanço horizontal da rampa',
      fr: "l'avancée horizontale de la rampe",
      en: 'the horizontal run of the ramp',
    },
    inclinado: {
      pt: 'a rampa',
      fr: 'la rampe',
      en: 'the ramp',
    },
    comprimento: {
      pt: 'o comprimento da rampa',
      fr: 'la longueur de la rampe',
      en: 'the length of the ramp',
    },
    unidade: {
      pt: 'metros',
      fr: 'mètres',
      en: 'metres',
    },
    referencia: 'horizontal',
    formas: ['angulo', 'vertical-por-inclinado', 'horizontal-por-inclinado', 'vertical-por-horizontal', 'inclinado-por-vertical'],
    profissoes: ['arquiteta', 'engenheiro', 'pedreiro'],
    limites: {
      vertical: [0.3, 2.5],
      horizontal: [3, 25],
      inclinado: [3, 25],
      angulo: [4, 12],
    },
  },
  {
    id: 'rampa-garagem',
    vertical: {
      pt: 'a profundidade que a rampa desce',
      fr: 'la profondeur descendue par la rampe',
      en: 'the depth the ramp goes down',
    },
    horizontal: {
      pt: 'o comprimento da rampa medido no chão',
      fr: 'la longueur de la rampe mesurée au sol',
      en: 'the length of the ramp measured along the ground',
    },
    inclinado: {
      pt: 'a rampa',
      fr: 'la rampe',
      en: 'the ramp',
    },
    comprimento: {
      pt: 'o comprimento da rampa',
      fr: 'la longueur de la rampe',
      en: 'the length of the ramp',
    },
    unidade: {
      pt: 'metros',
      fr: 'mètres',
      en: 'metres',
    },
    referencia: 'horizontal',
    formas: ['vertical-por-inclinado', 'horizontal-por-inclinado', 'vertical-por-horizontal', 'inclinado-por-horizontal'],
    profissoes: ['eletricista', 'pintora', 'fotografo'],
    limites: {
      vertical: [1, 4],
      horizontal: [5, 30],
      inclinado: [5, 30],
      angulo: [6, 18],
    },
  },
  {
    id: 'sombra-poste',
    vertical: {
      pt: 'a altura do poste',
      fr: 'la hauteur du poteau',
      en: 'the height of the pole',
    },
    horizontal: {
      pt: 'o comprimento da sombra',
      fr: "la longueur de l'ombre",
      en: 'the length of the shadow',
    },
    inclinado: {
      pt: 'a distância do topo do poste até a ponta da sombra',
      fr: "la distance du sommet du poteau au bout de l'ombre",
      en: 'the distance from the top of the pole to the tip of the shadow',
    },
    comprimento: {
      pt: 'a distância do topo do poste até a ponta da sombra',
      fr: "la distance du sommet du poteau au bout de l'ombre",
      en: 'the distance from the top of the pole to the tip of the shadow',
    },
    unidade: {
      pt: 'metros',
      fr: 'mètres',
      en: 'metres',
    },
    referencia: 'chao',
    formas: ['angulo', 'vertical-por-horizontal', 'horizontal-por-vertical', 'inclinado-por-vertical', 'vertical-por-inclinado'],
    profissoes: ['topografa', 'agrimensor', 'fotografo'],
    limites: {
      vertical: [3, 12],
      horizontal: [2, 20],
      inclinado: [4, 24],
      angulo: [20, 70],
    },
  },
  {
    id: 'sombra-arvore',
    vertical: {
      pt: 'a altura da árvore',
      fr: "la hauteur de l'arbre",
      en: 'the height of the tree',
    },
    horizontal: {
      pt: 'o comprimento da sombra',
      fr: "la longueur de l'ombre",
      en: 'the length of the shadow',
    },
    inclinado: {
      pt: 'a distância do topo da árvore até a ponta da sombra',
      fr: "la distance du sommet de l'arbre au bout de l'ombre",
      en: 'the distance from the top of the tree to the tip of the shadow',
    },
    comprimento: {
      pt: 'a distância do topo da árvore até a ponta da sombra',
      fr: "la distance du sommet de l'arbre au bout de l'ombre",
      en: 'the distance from the top of the tree to the tip of the shadow',
    },
    unidade: {
      pt: 'metros',
      fr: 'mètres',
      en: 'metres',
    },
    referencia: 'chao',
    formas: ['angulo', 'vertical-por-horizontal', 'horizontal-por-vertical', 'vertical-por-inclinado'],
    profissoes: ['jardineiro', 'guia', 'topografa'],
    limites: {
      vertical: [2, 15],
      horizontal: [1.5, 25],
      inclinado: [3, 28],
      angulo: [18, 72],
    },
  },
  {
    id: 'pipa',
    vertical: {
      pt: 'a altura da pipa',
      fr: 'la hauteur du cerf-volant',
      en: 'the height of the kite',
    },
    horizontal: {
      pt: 'a distância no chão entre quem segura a linha e o ponto abaixo da pipa',
      fr: 'la distance au sol entre la personne qui tient le fil et le point sous le cerf-volant',
      en: 'the distance along the ground between the person holding the line and the point below the kite',
    },
    inclinado: {
      pt: 'a linha esticada',
      fr: 'le fil tendu',
      en: 'the taut line',
    },
    comprimento: {
      pt: 'o comprimento da linha esticada',
      fr: 'la longueur du fil tendu',
      en: 'the length of the taut line',
    },
    unidade: {
      pt: 'metros',
      fr: 'mètres',
      en: 'metres',
    },
    referencia: 'chao',
    formas: ['vertical-por-inclinado', 'horizontal-por-inclinado', 'inclinado-por-vertical'],
    profissoes: [],
    limites: {
      vertical: [5, 60],
      horizontal: [4, 60],
      inclinado: [8, 80],
      angulo: [25, 70],
    },
  },
  {
    id: 'escorregador',
    vertical: {
      pt: 'a altura da plataforma do escorregador',
      fr: 'la hauteur de la plateforme du toboggan',
      en: 'the height of the slide platform',
    },
    horizontal: {
      pt: 'o espaço ocupado no chão pelo escorregador',
      fr: "l'espace occupé au sol par le toboggan",
      en: 'the ground space taken up by the slide',
    },
    inclinado: {
      pt: 'o escorregador',
      fr: 'le toboggan',
      en: 'the slide',
    },
    comprimento: {
      pt: 'o comprimento do escorregador',
      fr: 'la longueur du toboggan',
      en: 'the length of the slide',
    },
    unidade: {
      pt: 'metros',
      fr: 'mètres',
      en: 'metres',
    },
    referencia: 'chao',
    formas: ['angulo', 'vertical-por-inclinado', 'horizontal-por-inclinado', 'vertical-por-horizontal'],
    profissoes: ['marceneiro', 'engenheiro'],
    limites: {
      vertical: [1, 3.5],
      horizontal: [1, 6],
      inclinado: [1.5, 7],
      angulo: [28, 48],
    },
  },
  {
    id: 'telhado',
    vertical: {
      pt: 'a altura ganha do beiral até a cumeeira',
      fr: "la hauteur gagnée de l'avant-toit au faîtage",
      en: 'the height gained from the eaves to the ridge',
    },
    horizontal: {
      pt: 'o vão horizontal coberto pelo telhado',
      fr: 'la portée horizontale couverte par la toiture',
      en: 'the horizontal span covered by the roof',
    },
    inclinado: {
      pt: 'o caibro do telhado',
      fr: 'le chevron de la toiture',
      en: 'the rafter of the roof',
    },
    comprimento: {
      pt: 'o comprimento do caibro do telhado',
      fr: 'la longueur du chevron de la toiture',
      en: 'the length of the rafter of the roof',
    },
    unidade: {
      pt: 'metros',
      fr: 'mètres',
      en: 'metres',
    },
    referencia: 'horizontal',
    formas: ['angulo', 'vertical-por-horizontal', 'inclinado-por-horizontal', 'vertical-por-inclinado'],
    profissoes: ['telhadista', 'pedreiro', 'arquiteta'],
    limites: {
      vertical: [0.8, 4],
      horizontal: [2, 10],
      inclinado: [2.2, 11],
      angulo: [15, 40],
    },
  },
  {
    id: 'cabo-antena',
    vertical: {
      pt: 'a altura em que o cabo se prende à antena',
      fr: "la hauteur à laquelle le hauban est fixé à l'antenne",
      en: 'the height at which the wire is fixed to the antenna',
    },
    horizontal: {
      pt: 'a distância da base da antena até o ponto de ancoragem',
      fr: "la distance de la base de l'antenne au point d'ancrage",
      en: 'the distance from the base of the antenna to the anchor point',
    },
    inclinado: {
      pt: 'o cabo de sustentação',
      fr: 'le hauban',
      en: 'the guy wire',
    },
    comprimento: {
      pt: 'o comprimento do cabo de sustentação',
      fr: 'la longueur du hauban',
      en: 'the length of the guy wire',
    },
    unidade: {
      pt: 'metros',
      fr: 'mètres',
      en: 'metres',
    },
    referencia: 'chao',
    formas: ['angulo', 'vertical-por-inclinado', 'horizontal-por-inclinado', 'inclinado-por-vertical', 'vertical-por-horizontal'],
    profissoes: ['eletricista', 'engenheiro', 'alpinista'],
    limites: {
      vertical: [6, 40],
      horizontal: [3, 30],
      inclinado: [8, 50],
      angulo: [40, 72],
    },
  },
  {
    id: 'teleferico',
    vertical: {
      pt: 'a altura ganha pelo teleférico',
      fr: 'la hauteur gagnée par le téléphérique',
      en: 'the height the cable car gains',
    },
    horizontal: {
      pt: 'o avanço horizontal do teleférico',
      fr: "l'avancée horizontale du téléphérique",
      en: 'the horizontal advance of the cable car',
    },
    inclinado: {
      pt: 'o cabo do teleférico',
      fr: 'le câble du téléphérique',
      en: 'the cable of the cable car',
    },
    comprimento: {
      pt: 'o comprimento do cabo do teleférico',
      fr: 'la longueur du câble du téléphérique',
      en: 'the length of the cable of the cable car',
    },
    unidade: {
      pt: 'metros',
      fr: 'mètres',
      en: 'metres',
    },
    referencia: 'horizontal',
    formas: ['angulo', 'vertical-por-inclinado', 'horizontal-por-inclinado', 'vertical-por-horizontal', 'inclinado-por-vertical'],
    profissoes: ['guia', 'engenheiro', 'fotografo'],
    limites: {
      vertical: [40, 400],
      horizontal: [60, 900],
      inclinado: [80, 1000],
      angulo: [12, 35],
    },
  },
  {
    id: 'trilha-montanha',
    vertical: {
      pt: 'a altitude ganha na subida',
      fr: "l'altitude gagnée dans la montée",
      en: 'the altitude gained on the climb',
    },
    horizontal: {
      pt: 'a distância percorrida no mapa',
      fr: 'la distance parcourue sur la carte',
      en: 'the distance covered on the map',
    },
    inclinado: {
      pt: 'a trilha',
      fr: 'le sentier',
      en: 'the trail',
    },
    comprimento: {
      pt: 'o comprimento da trilha',
      fr: 'la longueur du sentier',
      en: 'the length of the trail',
    },
    unidade: {
      pt: 'metros',
      fr: 'mètres',
      en: 'metres',
    },
    referencia: 'horizontal',
    formas: ['angulo', 'vertical-por-inclinado', 'horizontal-por-inclinado', 'vertical-por-horizontal', 'inclinado-por-vertical'],
    profissoes: ['guia', 'alpinista', 'socorrista'],
    limites: {
      vertical: [30, 300],
      horizontal: [60, 900],
      inclinado: [80, 950],
      angulo: [8, 25],
    },
  },
  {
    id: 'aviao-decolagem',
    vertical: {
      pt: 'a altitude ganha pelo avião',
      fr: "l'altitude gagnée par l'avion",
      en: 'the altitude the plane gains',
    },
    horizontal: {
      pt: 'a distância percorrida sobre o solo',
      fr: 'la distance parcourue au sol',
      en: 'the distance covered over the ground',
    },
    inclinado: {
      pt: 'a trajetória do avião',
      fr: "la trajectoire de l'avion",
      en: 'the flight path of the plane',
    },
    comprimento: {
      pt: 'o comprimento da trajetória do avião',
      fr: "la longueur de la trajectoire de l'avion",
      en: 'the length of the flight path',
    },
    unidade: {
      pt: 'quilômetros',
      fr: 'kilomètres',
      en: 'kilometres',
    },
    referencia: 'horizontal',
    formas: ['vertical-por-horizontal', 'vertical-por-inclinado', 'horizontal-por-vertical', 'inclinado-por-horizontal'],
    profissoes: ['piloto', 'engenheiro'],
    limites: {
      vertical: [0.5, 6],
      horizontal: [4, 45],
      inclinado: [4, 46],
      angulo: [6, 16],
    },
  },
  {
    id: 'aviao-aproximacao',
    vertical: {
      pt: 'a altitude que o avião ainda tem de perder',
      fr: "l'altitude qu'il reste à perdre",
      en: 'the altitude the plane still has to lose',
    },
    horizontal: {
      pt: 'a distância até a cabeceira da pista',
      fr: "la distance jusqu'au seuil de piste",
      en: 'the distance to the runway threshold',
    },
    inclinado: {
      pt: 'a reta de descida',
      fr: 'la droite de descente',
      en: 'the descent line',
    },
    comprimento: {
      pt: 'o comprimento da reta de descida',
      fr: 'la longueur de la droite de descente',
      en: 'the length of the descent line',
    },
    unidade: {
      pt: 'quilômetros',
      fr: 'kilomètres',
      en: 'kilometres',
    },
    referencia: 'horizontal',
    formas: ['vertical-por-horizontal', 'horizontal-por-vertical', 'vertical-por-inclinado'],
    profissoes: ['piloto'],
    limites: {
      vertical: [0.3, 2.5],
      horizontal: [5, 50],
      inclinado: [5, 50],
      angulo: [3, 7],
    },
  },
  {
    id: 'esteira-bagagem',
    vertical: {
      pt: 'a altura da porta do porão',
      fr: 'la hauteur de la porte de la soute',
      en: 'the height of the hold door',
    },
    horizontal: {
      pt: 'a distância no chão entre a base da esteira e o avião',
      fr: "la distance au sol entre le pied du tapis et l'avion",
      en: 'the distance along the ground between the foot of the belt and the plane',
    },
    inclinado: {
      pt: 'a esteira',
      fr: 'le tapis',
      en: 'the belt',
    },
    comprimento: {
      pt: 'o comprimento da esteira',
      fr: 'la longueur du tapis',
      en: 'the length of the belt',
    },
    unidade: {
      pt: 'metros',
      fr: 'mètres',
      en: 'metres',
    },
    referencia: 'chao',
    formas: ['angulo', 'vertical-por-inclinado', 'horizontal-por-inclinado', 'vertical-por-horizontal'],
    profissoes: ['estivador', 'engenheiro'],
    limites: {
      vertical: [1.5, 5],
      horizontal: [2, 9],
      inclinado: [2.5, 10],
      angulo: [18, 38],
    },
  },
  {
    id: 'corda-barraca',
    vertical: {
      pt: 'a altura do ponto de amarração na barraca',
      fr: "la hauteur du point d'attache sur la tente",
      en: 'the height of the tie point on the tent',
    },
    horizontal: {
      pt: 'a distância da barraca até a estaca',
      fr: 'la distance de la tente au piquet',
      en: 'the distance from the tent to the peg',
    },
    inclinado: {
      pt: 'a corda',
      fr: 'la corde',
      en: 'the rope',
    },
    comprimento: {
      pt: 'o comprimento da corda',
      fr: 'la longueur de la corde',
      en: 'the length of the rope',
    },
    unidade: {
      pt: 'metros',
      fr: 'mètres',
      en: 'metres',
    },
    referencia: 'chao',
    formas: ['vertical-por-inclinado', 'horizontal-por-inclinado', 'inclinado-por-vertical'],
    profissoes: ['guia', 'alpinista'],
    limites: {
      vertical: [0.8, 2.5],
      horizontal: [0.8, 3],
      inclinado: [1.2, 4],
      angulo: [30, 60],
    },
  },
  {
    id: 'lanca-guindaste',
    vertical: {
      pt: 'a altura alcançada pela ponta da lança',
      fr: 'la hauteur atteinte par la pointe de la flèche',
      en: 'the height reached by the tip of the boom',
    },
    horizontal: {
      pt: 'o alcance horizontal do guindaste',
      fr: 'la portée horizontale de la grue',
      en: 'the horizontal reach of the crane',
    },
    inclinado: {
      pt: 'a lança do guindaste',
      fr: 'la flèche de la grue',
      en: 'the boom of the crane',
    },
    comprimento: {
      pt: 'o comprimento da lança do guindaste',
      fr: 'la longueur de la flèche de la grue',
      en: 'the length of the boom of the crane',
    },
    unidade: {
      pt: 'metros',
      fr: 'mètres',
      en: 'metres',
    },
    referencia: 'horizontal',
    formas: ['angulo', 'vertical-por-inclinado', 'horizontal-por-inclinado', 'vertical-por-horizontal', 'inclinado-por-vertical'],
    profissoes: ['engenheiro', 'estivador', 'pedreiro'],
    limites: {
      vertical: [5, 35],
      horizontal: [4, 30],
      inclinado: [8, 40],
      angulo: [25, 70],
    },
  },
  {
    id: 'escada-rolante',
    vertical: {
      pt: 'a altura entre os dois pisos',
      fr: 'la hauteur entre les deux étages',
      en: 'the height between the two floors',
    },
    horizontal: {
      pt: 'o comprimento ocupado no piso de baixo',
      fr: "la longueur occupée à l'étage inférieur",
      en: 'the length taken up on the lower floor',
    },
    inclinado: {
      pt: 'a escada rolante',
      fr: "l'escalier mécanique",
      en: 'the escalator',
    },
    comprimento: {
      pt: 'o comprimento da escada rolante',
      fr: "la longueur de l'escalier mécanique",
      en: 'the length of the escalator',
    },
    unidade: {
      pt: 'metros',
      fr: 'mètres',
      en: 'metres',
    },
    referencia: 'chao',
    formas: ['angulo', 'vertical-por-inclinado', 'horizontal-por-inclinado', 'vertical-por-horizontal'],
    profissoes: ['engenheiro', 'marceneiro'],
    limites: {
      vertical: [3, 8],
      horizontal: [5, 14],
      inclinado: [6, 16],
      angulo: [27, 35],
    },
  },
  {
    id: 'ponte-levadica',
    vertical: {
      pt: 'a altura da ponta da folha levantada',
      fr: "la hauteur de l'extrémité du tablier levé",
      en: 'the height of the tip of the raised leaf',
    },
    horizontal: {
      pt: 'o avanço horizontal da folha levantada',
      fr: "l'avancée horizontale du tablier levé",
      en: 'the horizontal advance of the raised leaf',
    },
    inclinado: {
      pt: 'a folha da ponte',
      fr: 'le tablier du pont',
      en: 'the leaf of the bridge',
    },
    comprimento: {
      pt: 'o comprimento da folha da ponte',
      fr: 'la longueur du tablier du pont',
      en: 'the length of the leaf of the bridge',
    },
    unidade: {
      pt: 'metros',
      fr: 'mètres',
      en: 'metres',
    },
    referencia: 'horizontal',
    formas: ['vertical-por-inclinado', 'horizontal-por-inclinado', 'vertical-por-horizontal'],
    profissoes: ['capita', 'engenheiro'],
    limites: {
      vertical: [2, 14],
      horizontal: [2, 14],
      inclinado: [4, 16],
      angulo: [20, 65],
    },
  },
  {
    id: 'prancha-navio',
    vertical: {
      pt: 'a altura do convés acima do cais',
      fr: 'la hauteur du pont au-dessus du quai',
      en: 'the height of the deck above the quay',
    },
    horizontal: {
      pt: 'a distância no cais entre o navio e o pé da prancha',
      fr: 'la distance sur le quai entre le navire et le pied de la passerelle',
      en: 'the distance along the quay between the ship and the foot of the gangway',
    },
    inclinado: {
      pt: 'a prancha de embarque',
      fr: 'la passerelle',
      en: 'the gangway',
    },
    comprimento: {
      pt: 'o comprimento da prancha de embarque',
      fr: 'la longueur de la passerelle',
      en: 'the length of the gangway',
    },
    unidade: {
      pt: 'metros',
      fr: 'mètres',
      en: 'metres',
    },
    referencia: 'chao',
    formas: ['angulo', 'vertical-por-inclinado', 'horizontal-por-inclinado', 'inclinado-por-vertical'],
    profissoes: ['capita', 'estivador'],
    limites: {
      vertical: [1.5, 8],
      horizontal: [2, 12],
      inclinado: [3, 14],
      angulo: [15, 45],
    },
  },
  {
    id: 'mastro-cabo',
    vertical: {
      pt: 'a altura do mastro',
      fr: 'la hauteur du mât',
      en: 'the height of the mast',
    },
    horizontal: {
      pt: 'a distância no convés entre a base do mastro e o ponto de amarração',
      fr: "la distance sur le pont entre le pied du mât et le point d'attache",
      en: 'the distance on the deck between the foot of the mast and the tie point',
    },
    inclinado: {
      pt: 'o cabo',
      fr: 'le câble',
      en: 'the cable',
    },
    comprimento: {
      pt: 'o comprimento do cabo',
      fr: 'la longueur du câble',
      en: 'the length of the cable',
    },
    unidade: {
      pt: 'metros',
      fr: 'mètres',
      en: 'metres',
    },
    referencia: 'chao',
    formas: ['vertical-por-inclinado', 'horizontal-por-inclinado', 'vertical-por-horizontal', 'inclinado-por-vertical'],
    profissoes: ['capita', 'marceneiro'],
    limites: {
      vertical: [4, 18],
      horizontal: [2, 12],
      inclinado: [5, 22],
      angulo: [45, 75],
    },
  },
  {
    id: 'painel-solar',
    vertical: {
      pt: 'a altura da borda mais alta do painel',
      fr: 'la hauteur du bord supérieur du panneau',
      en: 'the height of the upper edge of the panel',
    },
    horizontal: {
      pt: 'o espaço que o painel ocupa no telhado',
      fr: "l'emprise du panneau sur le toit",
      en: 'the space the panel takes up on the roof',
    },
    inclinado: {
      pt: 'o painel solar',
      fr: 'le panneau solaire',
      en: 'the solar panel',
    },
    comprimento: {
      pt: 'o comprimento do painel solar',
      fr: 'la longueur du panneau solaire',
      en: 'the length of the solar panel',
    },
    unidade: {
      pt: 'metros',
      fr: 'mètres',
      en: 'metres',
    },
    referencia: 'horizontal',
    formas: ['angulo', 'vertical-por-inclinado', 'horizontal-por-inclinado', 'vertical-por-horizontal'],
    profissoes: ['eletricista', 'telhadista', 'arquiteta'],
    limites: {
      vertical: [0.4, 1.6],
      horizontal: [0.8, 2.4],
      inclinado: [1, 2.6],
      angulo: [15, 40],
    },
  },
  {
    /*
     * A cena que trouxe a correção aditiva.
     *
     * Era `exercicioAltura` escrito à mão; virou cena para que a mesma
     * história ganhe as perguntas e as profissões das outras.
     */
    id: 'predio-visado',
    vertical: {
      pt: 'a altura do prédio',
      fr: "la hauteur de l'immeuble",
      en: 'the height of the building',
    },
    horizontal: {
      pt: 'a distância de quem observa até o prédio',
      fr: "la distance entre l'observateur et l'immeuble",
      en: 'the distance from the observer to the building',
    },
    inclinado: {
      pt: 'a linha de visada',
      fr: 'la ligne de visée',
      en: 'the line of sight',
    },
    comprimento: {
      pt: 'o comprimento da linha de visada',
      fr: 'la longueur de la ligne de visée',
      en: 'the length of the line of sight',
    },
    unidade: { pt: 'metros', fr: 'mètres', en: 'metres' },
    referencia: 'horizontal-do-olhar',
    formas: ['vertical-por-horizontal'],
    profissoes: ['topografa', 'arquiteta', 'fotografo', 'agrimensor', 'engenheiro'],
    limites: {
      vertical: [4, 70],
      horizontal: [10, 80],
      inclinado: [11, 110],
      angulo: [20, 62],
    },
    correcao: [1.5, 1.8],
  },
];

/** A cena de um id, para os guardas e para o motor. */
export function cenaDe(id: string): Cena | undefined {
  return CENAS.find((cena) => cena.id === id);
}
