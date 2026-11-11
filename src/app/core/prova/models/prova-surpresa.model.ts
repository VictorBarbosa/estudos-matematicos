import {
  ConfiguracaoSurpresa,
  CriterioDaEtapa,
} from '@core/configuracao/models/configuracao.model';
import { Etapa, dominioDe } from '@core/progressao/models/progressao.model';
import { Nivel } from '@core/treino/models/treino.model';
import { EstatisticaConceito, Tentativa } from '@core/treino/services/progresso.service';
import { Rng } from '@core/treino/rng/rng';

/**
 * A prova surpresa.
 *
 * A prova de fim de área cobra uma área e chega anunciada: o aluno vence a
 * última etapa, vê o convite, e decide quando fazê-la. Isso mede o que ele
 * sabe no dia escolhido — não o que ficou do estudo.
 *
 * Esta é a outra régua. Ela aparece sem aviso, cobre TUDO o que já foi vencido
 * até ali, e não tem «depois»: enquanto não é feita, ela é a primeira coisa da
 * página. O que a torna desconfortável é o que a torna útil — não dá para
 * revisar o tópico específico antes, porque não se sabe qual virá.
 *
 * ## O que conta como «aprendido»
 *
 * Só os tópicos da trilha — os que o aluno não tirou do plano nas
 * configurações — cujo domínio está vencido pelo critério de {@link dominioDe}.
 * Um tópico tirado do plano não aparece: tirar é dizer «não preciso disto», e
 * uma prova que cobrasse o que foi tirado seria uma prova desonesta.
 *
 * ## O que ela deixa para trás
 *
 * Abaixo do acerto mínimo, os tópicos em que o aluno errou voltam a ser
 * exigidos: o histórico deles é apagado (as etapas seguintes, por
 * consequência, voltam a ficar trancadas) e eles ficam marcados como
 * trancados por reprovação. O trancamento não é um estado separado do
 * progresso: ele se desfaz sozinho quando o domínio daquele tópico volta a ser
 * vencido, que é exactamente o «reestudar» que se quer exigir.
 */

/** Um dia em milissegundos. */
export const DIA = 24 * 60 * 60 * 1000;

/**
 * O teto de questões da prova surpresa.
 *
 * Ela cobre tudo o que foi aprendido, e tudo o que foi aprendido chega a 120
 * tópicos. Uma prova de 120 questões não é uma prova: é uma sessão de estudo
 * com prazo, e o aluno a abandona no meio. Vinte questões medem uma amostra
 * larga do que ficou e cabem numa sentada.
 */
export const MAXIMO_DE_QUESTOES = 20;

/** Uma questão da prova, antes de o exercício ser sorteado. */
export interface ItemSurpresa {
  readonly topicoId: string;
  readonly nivel: Nivel;
}

/** O que o aluno respondeu numa questão. */
export interface RespostaSurpresa {
  readonly topicoId: string;
  /** O texto digitado, guardado para a revisão do resultado. */
  readonly entrada: string;
  readonly acertou: boolean;
}

/**
 * A prova em andamento.
 *
 * Guarda o PLANO e a SEMENTE, não os exercícios. Persistir os exercícios
 * prontos seria mais direto e não funciona: o gabarito de Frações é uma
 * instância de classe, e o `JSON.stringify` a transforma num objeto sem
 * `igualA` — a correção quebraria depois de um refresh. Com a semente e o
 * plano, os exercícios são sorteados de novo idênticos, porque os geradores
 * são determinísticos por contrato (`verificar-geradores` garante isso).
 */
export interface SessaoSurpresa {
  readonly id: string;
  readonly criadaEm: number;
  readonly semente: number;
  readonly itens: readonly ItemSurpresa[];
  /** Índice da questão atual. Igual ao tamanho da lista quando acabou. */
  readonly indice: number;
  readonly respostas: readonly RespostaSurpresa[];
}

/** Como a prova terminou. */
export interface ResultadoSurpresa {
  readonly total: number;
  readonly acertos: number;
  readonly percentual: number;
  readonly aprovado: boolean;
  /** Os tópicos que voltam a ser exigidos. Vazio quando aprovada. */
  readonly reprovados: readonly string[];
  readonly em: number;
}

export interface EstadoSurpresa {
  readonly versao: 1;
  readonly ativa: SessaoSurpresa | null;
  /** Quando a última prova terminou, em milissegundos. */
  readonly ultimaEm: number | null;
  /** Tópicos trancados por reprovação, com o instante em que foram trancados. */
  readonly trancados: Readonly<Record<string, number>>;
  readonly feitas: number;
  readonly reprovadas: number;
  /** O resultado da última prova, para a tela poder explicar o que aconteceu. */
  readonly ultimo: ResultadoSurpresa | null;
}

export function estadoSurpresaVazio(): EstadoSurpresa {
  return {
    versao: 1,
    ativa: null,
    ultimaEm: null,
    trancados: {},
    feitas: 0,
    reprovadas: 0,
    ultimo: null,
  };
}

/**
 * Os tópicos que a prova pode cobrar: vencidos e dentro do plano.
 *
 * A trilha já vem sem os tópicos removidos nas configurações, então basta
 * perguntar pelo domínio de cada um.
 */
export function topicosElegiveis(
  trilha: readonly Etapa[],
  historicos: Readonly<Record<string, readonly Tentativa[]>>,
  conceitos: Readonly<Record<string, EstatisticaConceito>>,
  criterio: CriterioDaEtapa,
): readonly string[] {
  return trilha
    .map((etapa) => etapa.topicoId)
    .filter(
      (topicoId) => dominioDe(historicos[topicoId] ?? [], topicoId, conceitos, criterio).vencido,
    );
}

/**
 * A prova já está vencida de tempo e pode ser criada?
 *
 * A primeira aparece assim que o aluno tem tópicos suficientes — é o momento
 * em que ela tem o que medir. As seguintes esperam o intervalo inteiro, contado
 * do fim da última.
 */
export function surpresaDevida(
  estado: EstadoSurpresa,
  elegiveis: number,
  config: ConfiguracaoSurpresa,
  agora: number,
): boolean {
  if (config.ativa !== 1 || estado.ativa !== null) {
    return false;
  }

  if (elegiveis < config.minimoDeTopicos) {
    return false;
  }

  if (estado.ultimaEm === null) {
    return true;
  }

  return agora - estado.ultimaEm >= config.intervaloEmDias * DIA;
}

/** Quantas questões a prova terá: o plano inteiro, limitado ao teto. */
export function tamanhoDaSurpresa(elegiveis: number, config: ConfiguracaoSurpresa): number {
  return Math.min(MAXIMO_DE_QUESTOES, elegiveis * config.questoesPorTopico);
}

/**
 * O plano da prova: uma amostra dos tópicos vencidos, com a pergunta certa.
 *
 * Os tópicos são embaralhados antes de entrar. Sem isso, a prova cobraria
 * sempre os primeiros da trilha — frações, álgebra, geometria — e nunca o que
 * o aluno estudou nas últimas semanas, que é justamente o que se esquece.
 *
 * O nível alterna entre Médio e Difícil, e vai ao Extremo na terceira
 * aparição: o Fácil não entra, pelo mesmo motivo da prova de área — ele não
 * sorteia todos os tipos de questão do tópico.
 */
export function planoDaSurpresa(
  elegiveis: readonly string[],
  config: ConfiguracaoSurpresa,
  rng: Rng,
): readonly ItemSurpresa[] {
  const total = tamanhoDaSurpresa(elegiveis.length, config);
  if (total === 0) {
    return [];
  }

  const embaralhados = rng.embaralhar(elegiveis);
  const itens: ItemSurpresa[] = [];
  const vezes = new Map<string, number>();

  for (let i = 0; i < total; i++) {
    const topicoId = embaralhados[i % embaralhados.length]!;
    const vez = vezes.get(topicoId) ?? 0;
    vezes.set(topicoId, vez + 1);

    itens.push({ topicoId, nivel: vez === 0 ? 'medio' : vez === 1 ? 'dificil' : 'extremo' });
  }

  return itens;
}

/**
 * Quantos erros a prova tolera com esta régua.
 *
 * A mesma conta da prova de área: o acerto mínimo, aplicado ao tamanho. Com
 * 75%, uma prova de 4 questões tolera 1 erro; uma de 20, cinco.
 */
export function toleranciaDaSurpresa(total: number, percentual: number): number {
  return Math.floor(Number((total * (100 - percentual)) / 100 + 1e-9));
}

/** A prova foi aprovada? */
export function aprovada(acertos: number, total: number, percentual: number): boolean {
  return total > 0 && acertos >= total - toleranciaDaSurpresa(total, percentual);
}

/** Os tópicos em que o aluno errou, sem repetição e na ordem da prova. */
export function topicosReprovados(
  itens: readonly ItemSurpresa[],
  respostas: readonly RespostaSurpresa[],
): readonly string[] {
  const errados = new Set(
    respostas.filter((resposta) => !resposta.acertou).map((resposta) => resposta.topicoId),
  );

  return [...new Set(itens.map((item) => item.topicoId))].filter((topicoId) =>
    errados.has(topicoId),
  );
}
