import { Injectable, computed, effect, signal } from '@angular/core';

const CHAVE = 'estudos-matematicos.folha.v1';

/** Onde a janela está, em pixels a partir do canto superior esquerdo. */
export interface Posicao {
  readonly x: number;
  readonly y: number;
}

/** Um ponto de um traço, com a pressão da caneta quando o aparelho informa. */
export interface Ponto {
  readonly x: number;
  readonly y: number;
  readonly pressao: number;
}

/** Um traço inteiro, do apoiar ao levantar da caneta. */
export interface Traco {
  readonly pontos: readonly Ponto[];
  /** Traço de borracha apaga o que estiver abaixo dele. */
  readonly apaga: boolean;
}

export type Ferramenta = 'lapis' | 'borracha';

interface EstadoSalvo {
  readonly aberta: boolean;
  readonly posicao: Posicao | null;
}

const PADRAO: EstadoSalvo = { aberta: false, posicao: null };

/**
 * A folha de rascunho: se está aberta, onde, e o que foi escrito nela.
 *
 * Existe para o aluno que estuda num iPad sem papel por perto. Uma conta de
 * cabeça que não cabe na cabeça precisa de algum lugar para ser armada, e sem
 * isso o jeito é abandonar o exercício para buscar um caderno.
 *
 * **Os traços ficam só em memória**, de propósito. Guardá-los faria o
 * `localStorage` crescer sem teto — um rascunho de uma página são milhares de
 * pontos — e rascunho é por definição descartável. Eles sobrevivem a fechar e
 * reabrir a janela, e a trocar de tópico, porque o serviço é único; vão embora
 * ao recarregar a página, que é quando o estudo recomeça mesmo.
 *
 * O que persiste é só o que poupa cliques: se a folha estava aberta e onde.
 */
@Injectable({ providedIn: 'root' })
export class FolhaService {
  private readonly estado = signal<EstadoSalvo>(carregar());
  private readonly riscos = signal<readonly Traco[]>([]);
  private readonly escolhida = signal<Ferramenta>('lapis');

  readonly aberta = computed(() => this.estado().aberta);
  readonly posicao = computed(() => this.estado().posicao);
  readonly tracos = this.riscos.asReadonly();
  readonly ferramenta = this.escolhida.asReadonly();

  readonly vazia = computed(() => this.riscos().length === 0);

  constructor() {
    effect(() => salvar(this.estado()));
  }

  alternar(): void {
    this.estado.update((atual) => ({ ...atual, aberta: !atual.aberta }));
  }

  fechar(): void {
    this.estado.update((atual) => ({ ...atual, aberta: false }));
  }

  definirPosicao(posicao: Posicao): void {
    this.estado.update((atual) => ({ ...atual, posicao }));
  }

  definirFerramenta(ferramenta: Ferramenta): void {
    this.escolhida.set(ferramenta);
  }

  /** Começa um traço novo com a ferramenta da vez. */
  comecarTraco(ponto: Ponto): void {
    this.riscos.update((atuais) => [
      ...atuais,
      { pontos: [ponto], apaga: this.escolhida() === 'borracha' },
    ]);
  }

  /** Estende o traço em andamento. Sem traço aberto, não faz nada. */
  estenderTraco(ponto: Ponto): void {
    this.riscos.update((atuais) => {
      const ultimo = atuais.at(-1);
      if (ultimo === undefined) {
        return atuais;
      }

      return [...atuais.slice(0, -1), { ...ultimo, pontos: [...ultimo.pontos, ponto] }];
    });
  }

  /** Desfaz o último traço. */
  desfazer(): void {
    this.riscos.update((atuais) => atuais.slice(0, -1));
  }

  limpar(): void {
    this.riscos.set([]);
  }
}

function carregar(): EstadoSalvo {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto === null) {
      return PADRAO;
    }

    const lido = JSON.parse(bruto) as Partial<EstadoSalvo>;
    const posicao =
      lido.posicao !== null &&
      typeof lido.posicao === 'object' &&
      typeof lido.posicao.x === 'number' &&
      typeof lido.posicao.y === 'number'
        ? { x: lido.posicao.x, y: lido.posicao.y }
        : null;

    return { aberta: lido.aberta === true, posicao };
  } catch {
    return PADRAO;
  }
}

function salvar(estado: EstadoSalvo): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    // Janela privada: a folha vale só para esta sessão.
  }
}
