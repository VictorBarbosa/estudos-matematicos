import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  Mensagem,
  ModeloOllama,
  SERVIDOR_PADRAO,
  instrucoes,
  lerATela,
  semPensamento,
} from '@core/assistente/models/assistente.model';
import { FalhaDoOllama, OllamaService } from '@core/assistente/services/ollama.service';
import { I18nService } from '@core/i18n/services/i18n.service';

const CHAVE = 'estudos-matematicos.assistente.v1';

/** Onde a janela está, em pixels a partir do canto superior esquerdo. */
export interface Posicao {
  readonly x: number;
  readonly y: number;
}

/** O tamanho que o aluno deu à janela, em pixels. */
export interface Tamanho {
  readonly largura: number;
  readonly altura: number;
}

interface EstadoSalvo {
  readonly aberto: boolean;
  readonly servidor: string;
  /** O último modelo escolhido, para não ter de escolher de novo. */
  readonly modelo: string;
  readonly posicao: Posicao | null;
  readonly tamanho: Tamanho | null;
}

const PADRAO: EstadoSalvo = {
  aberto: false,
  servidor: SERVIDOR_PADRAO,
  modelo: '',
  posicao: null,
  tamanho: null,
};

/**
 * O assistente: estado da janela e da conversa.
 *
 * A conversa fica só em memória, de propósito. Ela carrega trechos da tela e
 * dúvidas de estudo, e guardá-la no `localStorage` seria acumular isso sem que
 * ninguém tivesse pedido. O que persiste é o que poupa cliques: se a janela
 * estava aberta, onde ela estava e qual modelo foi escolhido.
 */
@Injectable({ providedIn: 'root' })
export class AssistenteService {
  private readonly ollama = inject(OllamaService);
  private readonly documento = inject(DOCUMENT);
  private readonly i18n = inject(I18nService);

  private readonly estado = signal<EstadoSalvo>(carregar());

  readonly aberto = computed(() => this.estado().aberto);
  readonly servidor = computed(() => this.estado().servidor);
  readonly modelo = computed(() => this.estado().modelo);
  readonly posicao = computed(() => this.estado().posicao);
  readonly tamanho = computed(() => this.estado().tamanho);

  private readonly conversa = signal<readonly Mensagem[]>([]);
  private readonly listaDeModelos = signal<readonly ModeloOllama[]>([]);
  private readonly emCurso = signal(false);
  private readonly problema = signal<string | null>(null);
  /** O texto que está chegando agora, antes de virar mensagem. */
  private readonly parcial = signal('');

  readonly mensagens = this.conversa.asReadonly();
  readonly modelos = this.listaDeModelos.asReadonly();
  readonly respondendo = this.emCurso.asReadonly();
  readonly erro = this.problema.asReadonly();
  readonly resposta = this.parcial.asReadonly();

  readonly vazia = computed(() => this.conversa().length === 0);

  private cancelador: AbortController | null = null;

  constructor() {
    effect(() => salvar(this.estado()));
  }

  alternar(): void {
    this.estado.update((atual) => ({ ...atual, aberto: !atual.aberto }));
    if (this.aberto() && this.listaDeModelos().length === 0) {
      void this.carregarModelos();
    }
  }

  fechar(): void {
    this.estado.update((atual) => ({ ...atual, aberto: false }));
  }

  definirModelo(modelo: string): void {
    this.estado.update((atual) => ({ ...atual, modelo }));
  }

  definirServidor(servidor: string): void {
    this.estado.update((atual) => ({ ...atual, servidor }));
  }

  definirPosicao(posicao: Posicao): void {
    this.estado.update((atual) => ({ ...atual, posicao }));
  }

  definirTamanho(tamanho: Tamanho): void {
    this.estado.update((atual) => ({ ...atual, tamanho }));
  }

  /** Pergunta ao servidor quais modelos estão instalados. */
  async carregarModelos(): Promise<void> {
    this.problema.set(null);

    try {
      const modelos = await this.ollama.modelos(this.servidor());
      this.listaDeModelos.set(modelos);

      // Sem escolha guardada — ou com uma que não existe mais — assume o
      // primeiro, que é o maior: quem instalou um modelo grande quer usá-lo.
      const atual = this.modelo();
      if (modelos.length > 0 && !modelos.some((modelo) => modelo.nome === atual)) {
        this.definirModelo(modelos[0]!.nome);
      }
    } catch (erro) {
      this.listaDeModelos.set([]);
      this.problema.set(mensagemDe(erro, this.i18n));
    }
  }

  /**
   * Manda a pergunta, com a tela junto.
   *
   * A tela é lida no momento da pergunta, e não quando a janela abriu: o aluno
   * troca de exercício com o assistente aberto, e a dúvida é sempre sobre o
   * que está na frente dele agora.
   */
  async perguntar(pergunta: string): Promise<void> {
    const texto = pergunta.trim();
    if (texto === '' || this.emCurso()) {
      return;
    }

    if (this.modelo() === '') {
      this.problema.set(this.i18n.t('assistente.escolhaModelo'));
      return;
    }

    this.problema.set(null);
    this.parcial.set('');
    this.conversa.update((atual) => [...atual, { papel: 'aluno', texto }]);
    this.emCurso.set(true);

    this.cancelador = new AbortController();

    try {
      const sistema = instrucoes(lerATela(this.documento));
      let completa = '';

      for await (const pedaco of this.ollama.conversar(
        this.servidor(),
        this.modelo(),
        sistema,
        this.conversa(),
        this.cancelador.signal,
      )) {
        completa += pedaco;
        // Modelo que escreve o rascunho dentro do texto não o mostra aqui: o
        // que o aluno vê é a resposta, e o cursor piscando diz que ela vem.
        this.parcial.set(semPensamento(completa));
      }

      const resposta = semPensamento(completa);
      if (resposta.trim() !== '') {
        this.conversa.update((atual) => [...atual, { papel: 'assistente', texto: resposta }]);
      }
    } catch (erro) {
      if (!(erro instanceof DOMException && erro.name === 'AbortError')) {
        this.problema.set(mensagemDe(erro, this.i18n));
      }
    } finally {
      this.parcial.set('');
      this.emCurso.set(false);
      this.cancelador = null;
    }
  }

  /** Interrompe a resposta que está chegando. */
  interromper(): void {
    this.cancelador?.abort();
  }

  /** Começa outra conversa, sem o histórico da anterior. */
  limpar(): void {
    this.interromper();
    this.conversa.set([]);
    this.parcial.set('');
    this.problema.set(null);
  }
}

function mensagemDe(erro: unknown, i18n: I18nService): string {
  return erro instanceof FalhaDoOllama || erro instanceof Error
    ? erro.message
    : i18n.t('assistente.algoDeuErrado');
}

function carregar(): EstadoSalvo {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto === null) {
      return PADRAO;
    }

    const salvo = JSON.parse(bruto) as Partial<EstadoSalvo> | null;
    if (salvo === null) {
      return PADRAO;
    }

    return {
      aberto: salvo.aberto === true,
      servidor: typeof salvo.servidor === 'string' && salvo.servidor !== '' ? salvo.servidor : SERVIDOR_PADRAO,
      modelo: typeof salvo.modelo === 'string' ? salvo.modelo : '',
      posicao:
        salvo.posicao != null &&
        Number.isFinite(salvo.posicao.x) &&
        Number.isFinite(salvo.posicao.y)
          ? salvo.posicao
          : null,
      tamanho:
        salvo.tamanho != null &&
        Number.isFinite(salvo.tamanho.largura) &&
        Number.isFinite(salvo.tamanho.altura)
          ? salvo.tamanho
          : null,
    };
  } catch {
    return PADRAO;
  }
}

function salvar(estado: EstadoSalvo): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    // Janela privada: a escolha vale só para esta sessão.
  }
}
