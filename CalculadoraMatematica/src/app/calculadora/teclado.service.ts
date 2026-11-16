import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';

/**
 * Onde o teclado do sistema termina, em pixels.
 *
 * O teclado do iPhone não aceita botão novo: não há como pôr a vírgula entre
 * as teclas dele. O que o iOS oferece é a *input accessory view* — uma faixa
 * logo acima do teclado —, e é isso que esta medida permite desenhar aqui.
 *
 * A medida vem do `visualViewport`, e não de um plugin: ele existe no WebView
 * do Capacitor e no Safari, encolhe quando o teclado abre, e não depende de
 * nenhuma permissão. A conta é a diferença entre a janela do layout e a área
 * que o teclado ainda deixa ver.
 *
 * ## Por que a conta funciona nos dois comportamentos de teclado
 *
 * O WebView pode reagir ao teclado de duas maneiras, e a fórmula cobre as duas:
 *
 * - **O teclado cobre a página** (Safari): a janela continua com 800 px, a
 *   área visível cai para 500 — a diferença são os 300 px do teclado, e a
 *   faixa sobe 300 px.
 * - **O WebView encolhe** (Capacitor com `resize: native`): a janela passa a
 *   500 px e a área visível também — a diferença é zero, e a faixa fica no
 *   rodapé do WebView, que agora termina no teclado.
 *
 * Somar `offsetTop` é o que cobre o terceiro caso: quando o Safari rola a
 * página para o campo não ficar escondido, a área visível se desloca, e sem
 * essa parcela a faixa apareceria dentro do teclado.
 */
@Injectable({ providedIn: 'root' })
export class TecladoService {
  private readonly alturaEmPixels = signal(0);

  /** A altura do teclado. Zero quando ele está fechado. */
  readonly altura = this.alturaEmPixels.asReadonly();

  /**
   * Há teclado na tela?
   *
   * Abaixo de 80 px não é teclado: é a barra do navegador aparecendo, ou o
   * `visualViewport` ajustando a área por outro motivo. Tratar isso como
   * teclado aberto faria a faixa piscar sem motivo.
   */
  readonly aberto = computed(() => this.alturaEmPixels() >= ALTURA_MINIMA);

  private readonly destruir = inject(DestroyRef);

  constructor() {
    // O `visualViewport` falta em navegador antigo e nos testes de unidade;
    // sem ele não há como medir o teclado, e a faixa simplesmente não aparece —
    // as teclas ao lado do campo continuam valendo.
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
