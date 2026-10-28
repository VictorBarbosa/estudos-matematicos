import { CURRICULO, rotaDoTopico } from '@curriculo/curriculo';

/**
 * Acertos seguidos exigidos para vencer uma etapa.
 *
 * É sequência, e não total de acertos: o que libera o próximo tópico é
 * demonstrar domínio, não insistir até acertar por eliminação.
 */
export const ACERTOS_PARA_LIBERAR = 3;

/** Um tópico dentro da trilha linear de estudo. */
export interface Etapa {
  /** Posição na trilha, começando em 1. */
  readonly numero: number;
  readonly areaId: string;
  readonly areaTitulo: string;
  readonly topicoId: string;
  readonly titulo: string;
  readonly descricao: string;
  readonly rota: string;
}

/**
 * A trilha: todos os tópicos prontos, na ordem do currículo.
 *
 * A ordem do currículo já é pedagógica — frações antes de álgebra, limites
 * antes de derivadas —, então ela própria serve de roteiro do jogo.
 */
export const TRILHA: readonly Etapa[] = CURRICULO.flatMap((area) =>
  area.topicos
    .filter((topico) => topico.pronto)
    .map((topico) => ({
      areaId: area.id,
      areaTitulo: area.titulo,
      topicoId: topico.id,
      titulo: topico.titulo,
      descricao: topico.descricao,
      rota: rotaDoTopico(area.id, topico.id),
    })),
).map((etapa, indice) => ({ ...etapa, numero: indice + 1 }));

/** Posição de um tópico na trilha, ou −1 se ele não faz parte dela. */
export function indiceNaTrilha(topicoId: string): number {
  return TRILHA.findIndex((etapa) => etapa.topicoId === topicoId);
}
