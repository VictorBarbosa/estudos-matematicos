import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';

/**
 * Onde o teclado do sistema termina, em pixels.
 *
 * Existe para uma tecla que o teclado do aparelho não tem: o separador dos
 * números digitados no MMC e MDC. A faixa que a desenha precisa saber a que
 * altura ficar, e é isso que este serviço mede.
 *
 * ## A medida NÃO decide se a faixa existe
 *
 * Isso está escrito com todas as letras porque já falhou uma vez: a primeira
 * versão exigia medida maior que 80 px para mostrar a faixa. Num WebView que
 * encolhe junto com o teclado — o padrão do `@capacitor/keyboard` é
 * `resize: native` — a medida é **zero**, e o separador desapareceu da tela.
 *
 * Quem decide mostrar é o campo em foco (ver `comBarra` na página). A altura só
 * diz ONDE a faixa fica: com medida zero, `bottom: 0` já é o topo do teclado,
 * porque a área visível termina nele.
 *
 * ## Por que só o `visualViewport`, e não o plugin
 *
 * O plugin `@capacitor/keyboard` informa a altura do teclado, mas **não diz se
 * o WebView encolheu**. Usar essa altura como `bottom` acerta no modo
 * `resize: none` e erra feio no `native`: a área visível já perdeu os 300 px, e
 * a faixa subiria outros 300 por cima do conteúdo, no meio da tela.
 *
 * O `visualViewport` responde as duas perguntas de uma vez, porque a conta é a
 * diferença entre a janela e a área visível:
 *
 * - **`resize: native`** (aplicativo): janela e área visível encolhem juntas, a
 *   diferença é zero, e a faixa fica no rodapé — que é o topo do teclado.
 * - **`resize: none`, ou o teclado cobrindo a página** (Safari): a janela
 *   mantém o tamanho, a área visível cai, e a diferença é a altura do teclado.
 *
 * Somar `offsetTop` cobre o terceiro caso: quando o navegador rola a página
 * para o campo não ficar escondido, a área visível se desloca, e sem essa
 * parcela a faixa apareceria DENTRO do teclado.
 */
@Injectable({ providedIn: 'root' })
export class TecladoService {
  private readonly alturaEmPixels = signal(0);

  /** A altura do teclado. Zero quando ele está fechado ou o WebView encolheu. */
  readonly altura = this.alturaEmPixels.asReadonly();

  /** Há teclado medido na tela? Serve de informação; não decide a faixa. */
  readonly aberto = computed(() => this.alturaEmPixels() >= ALTURA_MINIMA);

  private readonly destruir = inject(DestroyRef);

  constructor() {
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
