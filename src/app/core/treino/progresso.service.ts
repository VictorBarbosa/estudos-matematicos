import { Injectable, computed, signal } from '@angular/core';
import { Nivel } from './treino.model';

const CHAVE_ARMAZENAMENTO = 'estudos-matematicos.progresso.v1';

/**
 * Quantas tentativas recentes ficam guardadas por tópico.
 *
 * A liberação olha as 10 últimas; guardar 20 deixa margem para mudar o
 * critério sem perder o histórico de quem já estudou.
 */
export const TENTATIVAS_GUARDADAS = 20;

export interface EstatisticaTopico {
  readonly acertos: number;
  readonly erros: number;
  readonly melhorSequencia: number;
}

export interface EstatisticaConceito {
  readonly acertos: number;
  readonly erros: number;
}

/**
 * Uma tentativa, com o nível em que foi feita.
 *
 * O nível é o dado que faltava: sem ele, três acertos no Fácil — que nem
 * sorteia todos os tipos de questão — valiam tanto quanto três no Difícil.
 */
export interface Tentativa {
  readonly nivel: Nivel;
  readonly acertou: boolean;
  /** A resolução foi revelada em vez de respondida? */
  readonly desistiu: boolean;
}

interface EstadoProgresso {
  readonly versao: 2;
  readonly topicos: Record<string, EstatisticaTopico>;
  readonly conceitos: Record<string, EstatisticaConceito>;
  /** As últimas tentativas de cada tópico, da mais antiga para a mais nova. */
  readonly historico: Record<string, readonly Tentativa[]>;
  /**
   * Quando cada tópico foi treinado por último, em milissegundos.
   *
   * É o que permite revisão ESPAÇADA: sem data, "o que revisar hoje" só
   * poderia olhar a taxa de erro, e um tópico dominado há três meses pareceria
   * tão fresco quanto o de ontem.
   */
  readonly vistoEm: Record<string, number>;
}

export interface RegistroResposta {
  readonly topicoId: string;
  readonly conceitos: readonly string[];
  readonly acertou: boolean;
  readonly sequencia: number;
  readonly nivel: Nivel;
  /** `true` quando o aluno pediu a resolução em vez de responder. */
  readonly desistiu?: boolean;
}

export interface ConceitoFragil {
  readonly id: string;
  readonly erros: number;
  readonly total: number;
}

const ESTATISTICA_VAZIA: EstatisticaTopico = { acertos: 0, erros: 0, melhorSequencia: 0 };

function estadoVazio(): EstadoProgresso {
  return { versao: 2, topicos: {}, conceitos: {}, historico: {}, vistoEm: {} };
}

/**
 * Desempenho acumulado por tópico e por conceito.
 *
 * Guardar o erro no nível do *conceito*, e não só do tópico, é o que permite
 * dizer "você vem errando o MMC" em vez de apenas "você errou 4 de 10". O
 * painel de progresso usa isso para sugerir exatamente o que revisar.
 *
 * Além dos totais, guarda as últimas tentativas de cada tópico com o nível em
 * que foram feitas. É esse histórico que a progressão lê para decidir se o
 * tópico foi realmente dominado.
 *
 * A persistência é em `localStorage`: sem backend, sem conta. Toda leitura e
 * escrita é protegida porque em janela privada o acesso pode lançar — nesse
 * caso o treino continua funcionando, apenas sem lembrar entre sessões.
 */
@Injectable({ providedIn: 'root' })
export class ProgressoService {
  private readonly estado = signal<EstadoProgresso>(carregar());

  readonly porTopico = computed(() => this.estado().topicos);
  readonly porConceito = computed(() => this.estado().conceitos);
  readonly porHistorico = computed(() => this.estado().historico);
  readonly vistoEm = computed(() => this.estado().vistoEm);

  readonly totalRespondido = computed(() => {
    const topicos = Object.values(this.estado().topicos);
    return topicos.reduce((total, t) => total + t.acertos + t.erros, 0);
  });

  readonly totalAcertos = computed(() =>
    Object.values(this.estado().topicos).reduce((total, t) => total + t.acertos, 0),
  );

  /** Quantos tópicos distintos já foram treinados ao menos uma vez. */
  readonly topicosPraticados = computed(() => Object.keys(this.estado().topicos).length);

  estatisticaDe(topicoId: string): EstatisticaTopico {
    return this.estado().topicos[topicoId] ?? ESTATISTICA_VAZIA;
  }

  /** As últimas tentativas no tópico, da mais antiga para a mais nova. */
  historicoDe(topicoId: string): readonly Tentativa[] {
    return this.estado().historico[topicoId] ?? [];
  }

  /** Quando o tópico foi treinado por último, ou `null` se nunca foi. */
  ultimaPraticaDe(topicoId: string): number | null {
    return this.estado().vistoEm[topicoId] ?? null;
  }

  /** Percentual de acerto no tópico, ou `null` quando ainda não houve prática. */
  aproveitamentoDe(topicoId: string): number | null {
    const { acertos, erros } = this.estatisticaDe(topicoId);
    const total = acertos + erros;
    return total === 0 ? null : acertos / total;
  }

  registrar({
    topicoId,
    conceitos,
    acertou,
    sequencia,
    nivel,
    desistiu = false,
  }: RegistroResposta): void {
    const atual = this.estado();
    const anterior = atual.topicos[topicoId] ?? ESTATISTICA_VAZIA;

    const topicos: Record<string, EstatisticaTopico> = {
      ...atual.topicos,
      [topicoId]: {
        acertos: anterior.acertos + (acertou ? 1 : 0),
        erros: anterior.erros + (acertou ? 0 : 1),
        melhorSequencia: Math.max(anterior.melhorSequencia, sequencia),
      },
    };

    const conceitosAtualizados: Record<string, EstatisticaConceito> = { ...atual.conceitos };
    for (const conceito of conceitos) {
      const registro = conceitosAtualizados[conceito] ?? { acertos: 0, erros: 0 };
      conceitosAtualizados[conceito] = {
        acertos: registro.acertos + (acertou ? 1 : 0),
        erros: registro.erros + (acertou ? 0 : 1),
      };
    }

    const historico: Record<string, readonly Tentativa[]> = {
      ...atual.historico,
      [topicoId]: [...(atual.historico[topicoId] ?? []), { nivel, acertou, desistiu }].slice(
        -TENTATIVAS_GUARDADAS,
      ),
    };

    const novoEstado: EstadoProgresso = {
      versao: 2,
      topicos,
      conceitos: conceitosAtualizados,
      historico,
      vistoEm: { ...atual.vistoEm, [topicoId]: Date.now() },
    };
    this.estado.set(novoEstado);
    salvar(novoEstado);
  }

  /**
   * Conceitos com mais erros, para sugerir revisão.
   *
   * Ordena por quantidade de erros e desempata pela taxa de erro, de modo que
   * um conceito errado 3 de 3 vezes aparece antes de um errado 3 de 20.
   */
  conceitosParaRevisar(limite = 3): readonly ConceitoFragil[] {
    return this.conceitosFrageis().slice(0, limite);
  }

  /** Todos os conceitos com algum erro, do mais frágil ao menos frágil. */
  conceitosFrageis(): readonly ConceitoFragil[] {
    return Object.entries(this.estado().conceitos)
      .map(([id, { acertos, erros }]) => ({ id, erros, total: acertos + erros }))
      .filter((conceito) => conceito.erros > 0)
      .sort((a, b) => b.erros - a.erros || b.erros / b.total - a.erros / a.total);
  }

  limpar(): void {
    this.estado.set(estadoVazio());
    try {
      localStorage.removeItem(CHAVE_ARMAZENAMENTO);
    } catch {
      // Sem armazenamento disponível não há o que limpar.
    }
  }
}

function carregar(): EstadoProgresso {
  try {
    const bruto = localStorage.getItem(CHAVE_ARMAZENAMENTO);
    if (bruto === null) {
      return estadoVazio();
    }

    const dados = JSON.parse(bruto) as
      | (Omit<Partial<EstadoProgresso>, 'versao'> & { versao?: number })
      | null;

    // A versão 1 não guardava o histórico por nível. Em vez de descartar o
    // progresso de quem já estudou, ela é lida sem histórico: os totais e os
    // conceitos continuam valendo, e a liberação volta a ser medida na próxima
    // rodada de treino.
    if (dados === null || (dados.versao !== 1 && dados.versao !== 2)) {
      return estadoVazio();
    }

    return {
      versao: 2,
      topicos: dados.topicos ?? {},
      conceitos: dados.conceitos ?? {},
      historico: dados.versao === 2 ? (dados.historico ?? {}) : {},
      vistoEm: dados.versao === 2 ? (dados.vistoEm ?? {}) : {},
    };
  } catch {
    return estadoVazio();
  }
}

function salvar(estado: EstadoProgresso): void {
  try {
    localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(estado));
  } catch {
    // Janela privada ou cota estourada: seguimos apenas em memória.
  }
}
