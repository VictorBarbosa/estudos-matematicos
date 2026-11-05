import { CONFIGURACAO_PADRAO, RegraDaProva } from '@core/configuracao/models/configuracao.model';
import { REQUISITOS_POR_TOPICO } from '@core/progressao/models/progressao.model';
import { Nivel } from '@core/treino/models/treino.model';
import { CURRICULO } from '@curriculo/curriculo';

/**
 * A prova de fim de sessão.
 *
 * Uma sessão é uma área do currículo — Álgebra, Física, Cálculo 2 — com os
 * tópicos que ela reúne. Vencer todas as etapas de uma sessão não abre mais a
 * sessão seguinte por si: falta a prova final, que cobra o assunto inteiro de
 * uma vez.
 *
 * O que a prova acrescenta ao critério de domínio por tópico é a memória de
 * longo prazo. As etapas olham uma janela de dez tentativas recentes, então é
 * possível vencer Frações, passar três semanas em Álgebra e ter esquecido
 * frações sem que nada reclame. A prova pergunta tudo de novo no fim, e aí o
 * esquecimento aparece.
 *
 * O preço de falhar é alto de propósito: a sessão inteira é zerada e se
 * recomeça do primeiro tópico. É o que faz a prova valer alguma coisa — uma
 * prova que se refaz sem custo não mede nada.
 */

/**
 * Erros que a prova tolera.
 *
 * Com {@link ERROS_TOLERADOS} igual a 2, o terceiro erro zera a sessão. O
 * aviso aparece quando o segundo erro é cometido, porque chegar ao limite sem
 * ter sido avisado seria injusto: o aluno precisa saber que o próximo erro
 * custa a sessão antes de responder a próxima questão.
 */
export const ERROS_TOLERADOS = CONFIGURACAO_PADRAO.prova.errosTolerados;

/**
 * Quantas questões a prova tem, no mínimo.
 *
 * Numa sessão curta — Pré-cálculo tem dois tópicos — uma questão por tópico
 * seria uma prova de duas perguntas, e duas perguntas com dois erros tolerados
 * não separam quem sabe de quem adivinhou.
 */
export const MINIMO_DE_QUESTOES = CONFIGURACAO_PADRAO.prova.minimoDeQuestoes;

/** Uma sessão de estudo: a área do currículo e as etapas que ela reúne. */
export interface Sessao {
  readonly id: string;
  readonly topicoIds: readonly string[];
}

/**
 * As sessões, na ordem do currículo.
 *
 * Só entram os tópicos prontos, porque são eles que formam a trilha — e uma
 * prova não pode cobrar o que ainda não existe para treinar. Um tópico tirado
 * do plano some da prova pela mesma razão: ela cobra o que foi estudado.
 *
 * Uma área sem nenhum tópico no plano não vira sessão, e portanto não tem
 * prova.
 */
export function montarSessoes(removidos: ReadonlySet<string> = new Set()): readonly Sessao[] {
  return CURRICULO.map((area) => ({
    id: area.id,
    topicoIds: area.topicos
      .filter((topico) => topico.pronto && !removidos.has(topico.id))
      .map((topico) => topico.id),
  })).filter((sessao) => sessao.topicoIds.length > 0);
}

/** As sessões inteiras, como o currículo as define. */
export const SESSOES: readonly Sessao[] = montarSessoes();

export function sessaoPorId(id: string, sessoes: readonly Sessao[] = SESSOES): Sessao | null {
  return sessoes.find((sessao) => sessao.id === id) ?? null;
}

export function sessaoDoTopico(
  topicoId: string,
  sessoes: readonly Sessao[] = SESSOES,
): Sessao | null {
  return sessoes.find((sessao) => sessao.topicoIds.includes(topicoId)) ?? null;
}

/** A sessão seguinte a esta, ou `null` quando é a última. */
export function sessaoSeguinte(id: string, sessoes: readonly Sessao[] = SESSOES): Sessao | null {
  const indice = sessoes.findIndex((sessao) => sessao.id === id);
  return indice === -1 ? null : (sessoes[indice + 1] ?? null);
}

/** Uma questão da prova, antes de o exercício ser sorteado. */
export interface ItemDaProva {
  readonly topicoId: string;
  /**
   * O tipo de exercício que este item cobra, quando o tópico declara tipos.
   *
   * Vira o `pendentes` de `gerar`, que é como os geradores com cobertura por
   * tipo escolhem o que sortear. Frações declara nove tipos, e a prova pede um
   * de cada em vez de arriscar nove somas.
   */
  readonly conceito?: string;
  readonly nivel: Nivel;
}

/**
 * O que a prova vai cobrar, questão por questão.
 *
 * Um item por tipo declarado, nos tópicos que declaram tipos; um item por
 * tópico nos demais. Se a conta não chega a {@link MINIMO_DE_QUESTOES}, os
 * tópicos são percorridos de novo até chegar — sempre em ordem, para que a
 * prova caminhe pela sessão em vez de pular de um lado a outro.
 *
 * Os níveis alternam entre Médio e Difícil. O Fácil não entra: ele não sorteia
 * todos os tipos de questão de um tópico, e numa prova final isso seria uma
 * amostra enviesada do que o aluno deveria saber.
 */
export function planoDaProva(
  sessao: Sessao,
  regra: RegraDaProva = CONFIGURACAO_PADRAO.prova,
): readonly ItemDaProva[] {
  const base: { readonly topicoId: string; readonly conceito?: string }[] = [];

  for (const topicoId of sessao.topicoIds) {
    const requisitos = REQUISITOS_POR_TOPICO[topicoId] ?? [];

    if (requisitos.length === 0) {
      base.push({ topicoId });
      continue;
    }

    for (const requisito of requisitos) {
      base.push({ topicoId, conceito: requisito.conceito });
    }
  }

  const completo = [...base];
  while (completo.length < regra.minimoDeQuestoes) {
    completo.push(base[completo.length % base.length]!);
  }

  return completo.map((item, indice) => ({
    ...item,
    nivel: indice % 2 === 0 ? 'medio' : 'dificil',
  }));
}

/** Quantos erros ainda cabem antes de a sessão zerar. */
export function errosRestantes(erros: number, tolerados: number = ERROS_TOLERADOS): number {
  return Math.max(0, tolerados - erros);
}

/** O próximo erro zera a sessão? É o gatilho do aviso. */
export function noLimite(erros: number, tolerados: number = ERROS_TOLERADOS): boolean {
  return errosRestantes(erros, tolerados) === 0;
}

/** A sessão foi perdida? */
export function reprovou(erros: number, tolerados: number = ERROS_TOLERADOS): boolean {
  return erros > tolerados;
}

/** Como a prova de uma sessão está. */
export type EstadoDaProva =
  /** Faltam etapas da sessão. */
  | 'trancada'
  /** Todas as etapas vencidas, prova por fazer. */
  | 'disponivel'
  /** Prova já passada. */
  | 'vencida';
