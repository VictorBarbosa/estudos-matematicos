import { Sintagma } from '@core/treino/cenas/cenas.contextos';

/**
 * Quem aparece na história.
 *
 * ## Por que o nome vem inteiro, e sempre no começo da frase
 *
 * Guardar `artigo` + `nome` para o código colar quebra nas duas línguas que
 * não são a nossa: em francês o artigo elide antes de vogal (`l'astronaute`,
 * nunca `le astronaute`) e contrai com a preposição (`du maçon`); em inglês
 * muda com o som (`a baker`, `an engineer`). Por isso cada entrada é a
 * expressão inteira, escrita à mão, **já com a maiúscula** — a pessoa abre a
 * frase da cena, e abrindo a frase não há preposição antes dela para contrair.
 *
 * ## Por que a cena escolhe quem cabe
 *
 * «Um astronauta mede a sombra do poste» é a incoerência que o sorteio livre
 * produz. Cada cena declara a sua lista, e o padeiro aparece onde o ofício
 * explica a medição: na escada do depósito, não na torre de transmissão.
 */
export interface Profissao {
  readonly id: string;
  readonly nome: Sintagma;
}

export const PROFISSOES: readonly Profissao[] = [
  { id: 'pedreiro', nome: { pt: 'O pedreiro', fr: 'Le maçon', en: 'The bricklayer' } },
  { id: 'bombeira', nome: { pt: 'A bombeira', fr: 'La pompière', en: 'The firefighter' } },
  { id: 'eletricista', nome: { pt: 'O eletricista', fr: "L'électricien", en: 'The electrician' } },
  { id: 'padeiro', nome: { pt: 'O padeiro', fr: 'Le boulanger', en: 'The baker' } },
  { id: 'pintora', nome: { pt: 'A pintora', fr: 'La peintre', en: 'The painter' } },
  { id: 'topografa', nome: { pt: 'A topógrafa', fr: 'La géomètre', en: 'The surveyor' } },
  { id: 'arquiteta', nome: { pt: 'A arquiteta', fr: "L'architecte", en: 'The architect' } },
  { id: 'engenheiro', nome: { pt: 'O engenheiro', fr: "L'ingénieur", en: 'The engineer' } },
  { id: 'piloto', nome: { pt: 'O piloto', fr: 'Le pilote', en: 'The pilot' } },
  { id: 'capita', nome: { pt: 'A capitã', fr: 'La capitaine', en: 'The captain' } },
  { id: 'astronauta', nome: { pt: 'A astronauta', fr: "L'astronaute", en: 'The astronaut' } },
  { id: 'jardineiro', nome: { pt: 'O jardineiro', fr: 'Le jardinier', en: 'The gardener' } },
  { id: 'alpinista', nome: { pt: 'A alpinista', fr: "L'alpiniste", en: 'The climber' } },
  { id: 'marceneiro', nome: { pt: 'O marceneiro', fr: 'Le menuisier', en: 'The carpenter' } },
  { id: 'socorrista', nome: { pt: 'A socorrista', fr: 'La secouriste', en: 'The paramedic' } },
  { id: 'estivador', nome: { pt: 'O estivador', fr: 'Le docker', en: 'The dockworker' } },
  { id: 'guia', nome: { pt: 'A guia', fr: 'La guide', en: 'The guide' } },
  { id: 'fotografo', nome: { pt: 'O fotógrafo', fr: 'Le photographe', en: 'The photographer' } },
  { id: 'telhadista', nome: { pt: 'O telhadista', fr: 'Le couvreur', en: 'The roofer' } },
  { id: 'agrimensor', nome: { pt: 'O agrimensor', fr: "L'arpenteur", en: 'The land surveyor' } },
];

/** A profissão de um id, para o motor e para os guardas. */
export function profissaoDe(id: string): Profissao | undefined {
  return PROFISSOES.find((profissao) => profissao.id === id);
}
