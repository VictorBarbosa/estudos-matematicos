import { Injectable, computed, signal } from '@angular/core';

const CHAVE_ARMAZENAMENTO = 'estudos-matematicos.progresso.v1';

export interface EstatisticaTopico {
  readonly acertos: number;
  readonly erros: number;
  readonly melhorSequencia: number;
}

export interface EstatisticaConceito {
  readonly acertos: number;
  readonly erros: number;
}

interface EstadoProgresso {
  readonly versao: 1;
  readonly topicos: Record<string, EstatisticaTopico>;
  readonly conceitos: Record<string, EstatisticaConceito>;
}

export interface RegistroResposta {
  readonly topicoId: string;
  readonly conceitos: readonly string[];
  readonly acertou: boolean;
  readonly sequencia: number;
}

export interface ConceitoFragil {
  readonly id: string;
  readonly erros: number;
  readonly total: number;
}

const ESTATISTICA_VAZIA: EstatisticaTopico = { acertos: 0, erros: 0, melhorSequencia: 0 };

function estadoVazio(): EstadoProgresso {
  return { versao: 1, topicos: {}, conceitos: {} };
}

/**
 * Desempenho acumulado por tópico e por conceito.
 *
 * Guardar o erro no nível do *conceito*, e não só do tópico, é o que permite
 * dizer "você vem errando o MMC" em vez de apenas "você errou 4 de 10". O
 * painel de progresso usa isso para sugerir exatamente o que revisar.
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

  /** Percentual de acerto no tópico, ou `null` quando ainda não houve prática. */
  aproveitamentoDe(topicoId: string): number | null {
    const { acertos, erros } = this.estatisticaDe(topicoId);
    const total = acertos + erros;
    return total === 0 ? null : acertos / total;
  }

  registrar({ topicoId, conceitos, acertou, sequencia }: RegistroResposta): void {
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

    const novoEstado: EstadoProgresso = { versao: 1, topicos, conceitos: conceitosAtualizados };
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
    return Object.entries(this.estado().conceitos)
      .map(([id, { acertos, erros }]) => ({ id, erros, total: acertos + erros }))
      .filter((conceito) => conceito.erros > 0)
      .sort((a, b) => b.erros - a.erros || b.erros / b.total - a.erros / a.total)
      .slice(0, limite);
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

    const dados = JSON.parse(bruto) as Partial<EstadoProgresso> | null;
    // Versão desconhecida: descarta em vez de arriscar um formato incompatível.
    if (dados === null || dados.versao !== 1) {
      return estadoVazio();
    }

    return {
      versao: 1,
      topicos: dados.topicos ?? {},
      conceitos: dados.conceitos ?? {},
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
