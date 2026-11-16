import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';

/**
 * Onde o teclado do sistema termina, em pixels.
 *
 * Existe por um defeito concreto: o campo dos números usa `inputmode="numeric"`
 * — o teclado que o iPhone abre não tem vírgula —, e sem vírgula não há como
 * separar `12` de `18`. O teclado do sistema não aceita botão novo; o que dá
 * para fazer é desenhar uma faixa logo acima dele.
 *
 * A medida vem do `visualViewport`, e não de um plugin: ele existe no Safari e
 * no WebView, encolhe quando o teclado abre e não depende de permissão.
 *
 * ## Por que a conta funciona nos dois comportamentos de teclado
 *
 * - **O teclado cobre a página** (Safari): a janela continua com 800 px, a área
 *   visível cai para 500 — a diferença são os 300 px do teclado.
 * - **O WebView encolhe** (aplicativo com `resize: native`): janela e área
 *   visível encolhem juntas, a diferença é zero, e a faixa colada no rodapé já
 *   está acima do teclado.
 *
 * Somar `offsetTop` cobre o terceiro caso: quando o Safari rola a página para o
 * campo não ficar escondido, a área visível se desloca, e sem essa parcela a
 * faixa apareceria DENTRO do teclado.
 */
@Injectable({ providedIn: 'root' })
export class TecladoService {
  private readonly alturaEmPixels = signal(0);

  /** A altura do teclado. Zero quando ele está fechado. */
  readonly altura = this.alturaEmPixels.asReadonly();

  /** Há teclado na tela? Abaixo de 80 px é a barra do navegador, não teclado. */
  readonly aberto = computed(() => this.alturaEmPixels() >= ALTURA_MINIMA);

  private readonly destruir = inject(DestroyRef);

  constructor() {
    // Falta em navegador antigo e nos testes de unidade; sem ele não há como
    // medir, e as teclas ficam onde sempre estiveram.
    const janela = typeof window === 'undefined' ? undefined : window.visualViewport;
    if (janela === undefined || janela === null) {
      return;
    }

    const medir = (): void => {
      this.alturaEmPixels.set(
        alturaDoTeclado(window.innerHeight, {
          height: janela.height,
          offsetTop: janela.offsetTop,
        }),
      );
    };

    medir();
    janela.addEventListener('resize', medir);
    janela.addEventListener('scroll', medir);

    this.destruir.onDestroy(() => {
      janela.removeEventListener('resize', medir);
      janela.removeEventListener('scroll', medir);
    });
  }
}

/** Abaixo disto não é teclado; é a barra do navegador ou arredondamento. */
const ALTURA_MINIMA = 80;

/**
 * A altura do teclado a partir das duas medidas da janela.
 *
 * Separada do serviço para poder ser medida sem navegador: a conta é o que
 * importa, e ela tem três casos — teclado que cobre a página, WebView que
 * encolhe, e página que rola para o campo aparecer.
 */
export function alturaDoTeclado(
  alturaDaJanela: number,
  recorte: { readonly height: number; readonly offsetTop: number },
): number {
  const escondido = alturaDaJanela - (recorte.height + recorte.offsetTop);

  // Um recorte negativo é ruído de arredondamento, não teclado.
  return Math.max(0, Math.round(escondido));
}
