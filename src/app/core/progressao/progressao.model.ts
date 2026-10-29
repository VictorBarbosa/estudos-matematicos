import { EstatisticaConceito, Tentativa } from '@core/treino/progresso.service';
import { Nivel } from '@core/treino/treino.model';
import { CURRICULO, rotaDoTopico } from '@curriculo/curriculo';

/**
 * O que é preciso para vencer uma etapa.
 *
 * O critério anterior era "3 acertos seguidos", medido sem olhar o nível. Dava
 * para liberar o próximo tópico acertando três exercícios Fáceis em sequência
 * — e o Fácil nem sorteia todos os tipos de questão de um tópico. Uma simulação
 * mostrou o tamanho do furo: quem acerta 50% dos exercícios liberava a etapa em
 * até 20 tentativas em 79% das vezes; com 60% de acerto, em 93%.
 *
 * O critério novo tem três exigências, e todas olham só as tentativas
 * recentes, para que o domínio seja atual e não histórico:
 *
 * - acertar {@link ACERTOS_NA_JANELA} das últimas {@link RESPOSTAS_NA_JANELA};
 * - entre elas, {@link ACERTOS_EXIGENTES} acertos no nível Médio ou Difícil;
 * - terminar com {@link ACERTOS_SEGUIDOS_FINAIS} acertos seguidos, para que a
 *   etapa não abra logo depois de um erro.
 *
 * A mesma simulação, com o critério novo, dá 15% para quem acerta 50% e 37%
 * para quem acerta 60% — contra 79% e 93% de antes —, enquanto quem acerta 85%
 * vence em praticamente todas as rodadas de 30 exercícios. E, como são
 * necessárias pelo menos dez tentativas, não há mais como liberar um tópico
 * com três cliques.
 */
export const RESPOSTAS_NA_JANELA = 10;
export const ACERTOS_NA_JANELA = 8;
export const ACERTOS_EXIGENTES = 3;
export const ACERTOS_SEGUIDOS_FINAIS = 3;

/** Níveis que contam como prova de domínio. */
export const NIVEIS_EXIGENTES: readonly Nivel[] = ['medio', 'dificil'];

/**
 * Uma exigência de cobertura dentro de um tópico.
 *
 * A janela de domínio mede CONSTÂNCIA, não abrangência: dá para acertar dez
 * somas seguidas e nunca ter dividido uma fração. Onde o tópico tem partes
 * distintas que precisam ser todas praticadas, esta lista nomeia cada uma e
 * quantos acertos ela exige.
 */
export interface RequisitoDeConceito {
  readonly conceito: string;
  /** Como a exigência aparece para o aluno: "soma", "divisão". */
  readonly rotulo: string;
  readonly acertos: number;
}

/** Quantos acertos cada operação de frações exige para a etapa abrir. */
export const ACERTOS_POR_OPERACAO = 5;

/**
 * Exigências extras por tópico.
 *
 * Só Frações tem uma por enquanto: as quatro operações têm regras diferentes —
 * somar pede denominador comum, multiplicar não, dividir inverte o divisor —, e
 * passar da etapa sem ter praticado cada uma delas deixaria um buraco que
 * aparece inteiro no Cálculo.
 */
export const REQUISITOS_POR_TOPICO: Readonly<Record<string, readonly RequisitoDeConceito[]>> = {
  fracoes: [
    { conceito: 'fracoes.soma', rotulo: 'soma', acertos: ACERTOS_POR_OPERACAO },
    { conceito: 'fracoes.subtracao', rotulo: 'subtração', acertos: ACERTOS_POR_OPERACAO },
    { conceito: 'fracoes.multiplicacao', rotulo: 'multiplicação', acertos: ACERTOS_POR_OPERACAO },
    { conceito: 'fracoes.divisao', rotulo: 'divisão', acertos: ACERTOS_POR_OPERACAO },
  ],
};

/** Como está cada exigência extra de um tópico. */
export interface ProgressoDoRequisito extends RequisitoDeConceito {
  readonly feitos: number;
  readonly cumprido: boolean;
}

/** Onde o estudo está em relação ao critério de domínio de um tópico. */
export interface Dominio {
  /** Tentativas consideradas, no máximo {@link RESPOSTAS_NA_JANELA}. */
  readonly respostas: number;
  readonly acertos: number;
  /** Acertos no Médio ou no Difícil dentro da janela. */
  readonly acertosExigentes: number;
  /** Acertos seguidos no fim da janela. */
  readonly seguidosNoFim: number;
  /** As exigências de cobertura do tópico, vazia quando não há nenhuma. */
  readonly requisitos: readonly ProgressoDoRequisito[];
  readonly vencido: boolean;
}

const DOMINIO_VAZIO: Dominio = {
  respostas: 0,
  acertos: 0,
  acertosExigentes: 0,
  seguidosNoFim: 0,
  requisitos: [],
  vencido: false,
};

/** Avalia as exigências de cobertura de um tópico. */
function requisitosDe(
  topicoId: string,
  porConceito: Readonly<Record<string, EstatisticaConceito>>,
): readonly ProgressoDoRequisito[] {
  return (REQUISITOS_POR_TOPICO[topicoId] ?? []).map((requisito) => {
    const feitos = porConceito[requisito.conceito]?.acertos ?? 0;
    return { ...requisito, feitos, cumprido: feitos >= requisito.acertos };
  });
}

/**
 * Avalia o critério de domínio de um tópico.
 *
 * A janela mede a constância recente; `porConceito` responde pela cobertura —
 * as duas coisas precisam valer para a etapa abrir.
 */
export function dominioDe(
  historico: readonly Tentativa[],
  topicoId = '',
  porConceito: Readonly<Record<string, EstatisticaConceito>> = {},
): Dominio {
  const requisitos = requisitosDe(topicoId, porConceito);

  if (historico.length === 0) {
    return requisitos.length === 0 ? DOMINIO_VAZIO : { ...DOMINIO_VAZIO, requisitos };
  }

  const janela = historico.slice(-RESPOSTAS_NA_JANELA);
  const acertos = janela.filter((tentativa) => tentativa.acertou).length;
  const acertosExigentes = janela.filter(
    (tentativa) => tentativa.acertou && NIVEIS_EXIGENTES.includes(tentativa.nivel),
  ).length;

  let seguidosNoFim = 0;
  for (let i = janela.length - 1; i >= 0 && janela[i]!.acertou; i--) {
    seguidosNoFim++;
  }

  return {
    respostas: janela.length,
    acertos,
    acertosExigentes,
    seguidosNoFim,
    requisitos,
    vencido:
      janela.length >= RESPOSTAS_NA_JANELA &&
      acertos >= ACERTOS_NA_JANELA &&
      acertosExigentes >= ACERTOS_EXIGENTES &&
      seguidosNoFim >= ACERTOS_SEGUIDOS_FINAIS &&
      requisitos.every((requisito) => requisito.cumprido),
  };
}

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
