import { Injectable, computed, effect, signal } from '@angular/core';
// Só os tipos: importar o módulo inteiro traria o analisador de expressões
// para o carregamento inicial, desfazendo o `@defer` do shell.
import type { Angulo, ModoCalculadora } from '@core/calculadora/models/calculadora.model';

const CHAVE = 'estudos-matematicos.calculadora.v1';

/** Onde a janela está, em pixels a partir do canto superior esquerdo. */
export interface Posicao {
  readonly x: number;
  readonly y: number;
}

interface EstadoSalvo {
  readonly aberta: boolean;
  readonly modo: ModoCalculadora;
  readonly angulo: Angulo;
  readonly posicao: Posicao | null;
}

const PADRAO: EstadoSalvo = { aberta: false, modo: 'basica', angulo: 'rad', posicao: null };

/**
 * A calculadora flutuante: se está aberta, onde, e em que modo.
 *
 * Vive fora do componente porque quem abre e fecha é o botão do cabeçalho, do
 * outro lado da árvore. E é lembrado entre sessões pela mesma razão que o tema
 * é: quem usa a calculadora a cada exercício não quer reposicioná-la todo dia.
 */
@Injectable({ providedIn: 'root' })
export class CalculadoraService {
  private readonly estado = signal<EstadoSalvo>(carregar());

  readonly aberta = computed(() => this.estado().aberta);
  readonly modo = computed(() => this.estado().modo);
  readonly angulo = computed(() => this.estado().angulo);
  readonly posicao = computed(() => this.estado().posicao);

  constructor() {
    effect(() => salvar(this.estado()));
  }

  alternar(): void {
    this.estado.update((atual) => ({ ...atual, aberta: !atual.aberta }));
  }

  fechar(): void {
    this.estado.update((atual) => ({ ...atual, aberta: false }));
  }

  definirModo(modo: ModoCalculadora): void {
    this.estado.update((atual) => ({ ...atual, modo }));
  }

  alternarAngulo(): void {
    this.estado.update((atual) => ({
      ...atual,
      angulo: atual.angulo === 'rad' ? 'deg' : 'rad',
    }));
  }

  definirPosicao(posicao: Posicao): void {
    this.estado.update((atual) => ({ ...atual, posicao }));
  }
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
      aberta: salvo.aberta === true,
      modo: salvo.modo === 'cientifica' ? 'cientifica' : 'basica',
      angulo: salvo.angulo === 'deg' ? 'deg' : 'rad',
      posicao: posicaoValida(salvo.posicao) ? salvo.posicao : null,
    };
  } catch {
    return PADRAO;
  }
}

function posicaoValida(posicao: Posicao | null | undefined): posicao is Posicao {
  return (
    posicao !== null &&
    posicao !== undefined &&
    Number.isFinite(posicao.x) &&
    Number.isFinite(posicao.y)
  );
}

function salvar(estado: EstadoSalvo): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    // Janela privada: a posição vale só para esta sessão.
  }
}
