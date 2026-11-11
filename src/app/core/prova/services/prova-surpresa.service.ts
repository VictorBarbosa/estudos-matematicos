import { Injectable, computed, inject, signal } from '@angular/core';
import { ConfiguracaoService } from '@core/configuracao/services/configuracao.service';
import { montarTrilha, dominioDe } from '@core/progressao/models/progressao.model';
import { ProvaService } from '@core/prova/services/prova.service';
import { ProgressoService } from '@core/treino/services/progresso.service';
import { criarRng, sementeAleatoria } from '@core/treino/rng/rng';
import { sessaoDoTopico } from '@core/prova/models/prova.model';
import {
  EstadoSurpresa,
  ItemSurpresa,
  ResultadoSurpresa,
  aprovada,
  estadoSurpresaVazio,
  planoDaSurpresa,
  surpresaDevida,
  tamanhoDaSurpresa,
  topicosElegiveis,
  topicosReprovados,
} from '@core/prova/models/prova-surpresa.model';

const CHAVE = 'estudos-matematicos.surpresa.v1';

/**
 * A prova surpresa: quando aparece, o que ela cobra e o que ela tranca.
 *
 * Três decisões merecem registro.
 *
 * **A prova em andamento sobrevive ao refresh.** O estado inteiro — plano,
 * semente, questão atual e respostas dadas — vai para o `localStorage` a cada
 * resposta. Recarregar a página devolve o aluno à mesma questão, com as
 * mesmas perguntas: sem isso, a prova seria uma loteria que se refaz até sair
 * a prova fácil.
 *
 * **A reprovação grava na hora**, antes de qualquer tela nova. É a mesma regra
 * da prova de área: um resultado que se pode fugir recarregando não mede nada.
 *
 * **O trancamento é derivado, não um segundo estado.** A lista de trancados é
 * guardada, mas quem decide se o tópico continua trancado é o domínio dele: no
 * instante em que o aluno o vence de novo, a tranca some sozinha. Guardar
 * «destrancado» exigiria que alguém se lembrasse de destrancar.
 */
@Injectable({ providedIn: 'root' })
export class ProvaSurpresaService {
  private readonly progresso = inject(ProgressoService);
  private readonly configuracao = inject(ConfiguracaoService);
  private readonly provas = inject(ProvaService);

  private readonly estado = signal<EstadoSurpresa>(carregar());

  /** A prova em andamento, ou `null`. */
  readonly ativa = computed(() => this.estado().ativa);
  readonly ultimaEm = computed(() => this.estado().ultimaEm);
  readonly ultimoResultado = computed(() => this.estado().ultimo);
  readonly feitas = computed(() => this.estado().feitas);
  readonly reprovadas = computed(() => this.estado().reprovadas);

  readonly total = computed(() => this.ativa()?.itens.length ?? 0);
  readonly indice = computed(() => this.ativa()?.indice ?? 0);
  readonly respostas = computed(() => this.ativa()?.respostas ?? []);
  readonly acertos = computed(() => this.respostas().filter((resposta) => resposta.acertou).length);

  /** O item da questão atual, para a tela saber o tópico. */
  readonly itemAtual = computed<ItemSurpresa | null>(
    () => this.ativa()?.itens[this.indice()] ?? null,
  );

  /**
   * Tópicos trancados que ainda valem.
   *
   * Um tópico sai desta lista quando o aluno o vence de novo — é o reestudar
   * que a reprovação exige. A entrada antiga continua guardada, inofensiva.
   */
  readonly trancadosAtivos = computed<ReadonlySet<string>>(() => {
    const historicos = this.progresso.porHistorico();
    const conceitos = this.progresso.porConceito();
    const criterio = this.configuracao.etapa();

    return new Set(
      Object.keys(this.estado().trancados).filter(
        (topicoId) => !dominioDe(historicos[topicoId] ?? [], topicoId, conceitos, criterio).vencido,
      ),
    );
  });

  /** Todos os tópicos já trancados alguma vez, para a tela explicar. */
  readonly algumTrancado = computed(() => Object.keys(this.estado().trancados).length > 0);

  /**
   * Cria a prova, se ela já é devida.
   *
   * Chamada na abertura do aplicativo, de minuto em minuto, e ao entrar numa
   * rota de estudo — o guard pergunta antes de deixar passar. Devolve `true`
   * quando criou alguma coisa, o que é o que o teste usa.
   */
  avaliar(agora: number = Date.now()): boolean {
    const config = this.configuracao.surpresa();
    const elegiveis = this.elegiveis();

    if (!surpresaDevida(this.estado(), elegiveis.length, config, agora)) {
      return false;
    }

    const itens = planoDaSurpresa(elegiveis, config, criarRng(sementeAleatoria()));
    if (itens.length === 0) {
      return false;
    }

    this.guardar({
      ...this.estado(),
      ativa: {
        id: `surpresa-${agora}`,
        criadaEm: agora,
        semente: sementeAleatoria(),
        itens,
        indice: 0,
        respostas: [],
      },
    });

    return true;
  }

  /** Quantas questões a próxima prova teria agora — a tela de ajustes mostra. */
  readonly tamanhoPrevisto = computed(() =>
    tamanhoDaSurpresa(this.elegiveis().length, this.configuracao.surpresa()),
  );

  /** Quantos tópicos já vencidos a prova cobraria agora. */
  readonly quantosElegiveis = computed(() => this.elegiveis().length);

  /**
   * Registra a resposta e avança.
   *
   * `entrada` é o texto digitado, guardado para a revisão; `acertou` vem da
   * correção, feita pela tela com o mesmo `corrigir` do treino.
   */
  registrarResposta(topicoId: string, entrada: string, acertou: boolean): void {
    const ativa = this.estado().ativa;
    if (ativa === null) {
      return;
    }

    this.guardar({
      ...this.estado(),
      ativa: {
        ...ativa,
        indice: ativa.indice + 1,
        respostas: [...ativa.respostas, { topicoId, entrada, acertou }],
      },
    });
  }

  /**
   * Encerra a prova e devolve o resultado.
   *
   * Grava o trancamento ANTES de apagar o histórico: se algo falhar no meio, o
   * pior cenário é o tópico ficar trancado sem o progresso apagado — que se
   * destranca sozinho na próxima vez que ele for vencido —, e não o contrário,
   * que deixaria a reprovação sem consequência.
   */
  concluir(agora: number = Date.now()): ResultadoSurpresa | null {
    const ativa = this.estado().ativa;
    if (ativa === null) {
      return this.estado().ultimo;
    }

    const total = ativa.itens.length;
    const acertos = ativa.respostas.filter((resposta) => resposta.acertou).length;
    const regra = this.configuracao.surpresa();
    const passou = aprovada(acertos, total, regra.percentualDeAcerto);
    const reprovados = passou ? [] : topicosReprovados(ativa.itens, ativa.respostas);

    const resultado: ResultadoSurpresa = {
      total,
      acertos,
      percentual: total === 0 ? 0 : Math.round((acertos / total) * 100),
      aprovado: passou,
      reprovados,
      em: agora,
    };

    this.guardar({
      ...this.estado(),
      ativa: null,
      ultimaEm: agora,
      ultimo: resultado,
      feitas: this.estado().feitas + 1,
      reprovadas: this.estado().reprovadas + (passou ? 0 : 1),
      trancados: { ...this.estado().trancados, ...trancamentos(reprovados, agora) },
    });

    if (!passou && reprovados.length > 0) {
      this.progresso.limparTopicos(reprovados);

      // A aprovação da área vale como «todos os tópicos dela vencidos»; sem
      // revogá-la, o tópico reprovado continuaria contando como vencido pela
      // porta dos fundos, e o trancamento não teria efeito nenhum.
      for (const topicoId of reprovados) {
        const sessao = sessaoDoTopico(topicoId, this.provas.sessoes());
        if (sessao !== null) {
          this.provas.esquecerVitoria(sessao.id);
        }
      }
    }

    return resultado;
  }

  /**
   * Encerra a prova sem corrigir nada.
   *
   * Existe como saída de emergência — um gerador que falhe, por exemplo,
   * deixaria o aluno preso dentro de uma prova que ele não consegue terminar.
   * Não é um botão de fuga: as respostas dadas são descartadas e o tópico em
   * que ele estava não conta como acerto, mas também não tranca ninguém. Quem
   * usa isto sabe que está perdendo a medida.
   */
  encerrarSemAvaliar(agora: number = Date.now()): void {
    this.guardar({ ...this.estado(), ativa: null, ultimaEm: agora });
  }

  /** Esquece tudo: a prova em andamento, o histórico e as trancas. */
  limpar(): void {
    this.estado.set(estadoSurpresaVazio());

    try {
      localStorage.removeItem(CHAVE);
    } catch {
      // Sem armazenamento não há o que limpar.
    }
  }

  /** Os tópicos vencidos, dentro do plano do aluno. */
  private elegiveis(): readonly string[] {
    return topicosElegiveis(
      montarTrilha(this.configuracao.topicosRemovidos()),
      this.progresso.porHistorico(),
      this.progresso.porConceito(),
      this.configuracao.etapa(),
    );
  }

  private guardar(novo: EstadoSurpresa): void {
    this.estado.set(novo);

    try {
      localStorage.setItem(CHAVE, JSON.stringify(novo));
    } catch {
      // Janela privada: a prova vale só para esta sessão do navegador.
    }
  }
}

function trancamentos(
  topicoIds: readonly string[],
  agora: number,
): Readonly<Record<string, number>> {
  return Object.fromEntries(topicoIds.map((topicoId) => [topicoId, agora]));
}

function carregar(): EstadoSurpresa {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto === null) {
      return estadoSurpresaVazio();
    }

    const lido = JSON.parse(bruto) as Partial<EstadoSurpresa> | null;
    if (lido === null || lido.versao !== 1) {
      return estadoSurpresaVazio();
    }

    return {
      versao: 1,
      ativa: sessaoValida(lido.ativa),
      ultimaEm: typeof lido.ultimaEm === 'number' ? lido.ultimaEm : null,
      trancados: trancadosValidos(lido.trancados),
      feitas: numeroOuZero(lido.feitas),
      reprovadas: numeroOuZero(lido.reprovadas),
      ultimo: lido.ultimo ?? null,
    };
  } catch {
    return estadoSurpresaVazio();
  }
}

function sessaoValida(
  bruto: unknown,
): import('@core/prova/models/prova-surpresa.model').SessaoSurpresa | null {
  if (bruto === null || typeof bruto !== 'object') {
    return null;
  }

  const sessao = bruto as Partial<import('@core/prova/models/prova-surpresa.model').SessaoSurpresa>;
  if (
    !Array.isArray(sessao.itens) ||
    sessao.itens.length === 0 ||
    typeof sessao.semente !== 'number' ||
    typeof sessao.indice !== 'number'
  ) {
    return null;
  }

  const itens = sessao.itens.filter(
    (item): item is ItemSurpresa =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as ItemSurpresa).topicoId === 'string' &&
      typeof (item as ItemSurpresa).nivel === 'string',
  );

  if (itens.length === 0) {
    return null;
  }

  return {
    id: typeof sessao.id === 'string' ? sessao.id : `surpresa-${sessao.criadaEm ?? 0}`,
    criadaEm: typeof sessao.criadaEm === 'number' ? sessao.criadaEm : 0,
    semente: sessao.semente,
    itens,
    indice: Math.min(Math.max(0, Math.round(sessao.indice)), itens.length),
    respostas: Array.isArray(sessao.respostas) ? sessao.respostas : [],
  };
}

function trancadosValidos(bruto: unknown): Readonly<Record<string, number>> {
  if (bruto === null || typeof bruto !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(bruto as Record<string, unknown>)
      .filter(([topicoId, quando]) => typeof topicoId === 'string' && typeof quando === 'number')
      .map(([topicoId, quando]) => [topicoId, quando as number]),
  );
}

function numeroOuZero(valor: unknown): number {
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : 0;
}
