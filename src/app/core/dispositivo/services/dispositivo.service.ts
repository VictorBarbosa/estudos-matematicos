import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';

/** Largura mínima, em pixels, para a calculadora caber ao lado do conteúdo. */
const LARGURA_PARA_JANELAS = 960;

/**
 * Menor lado que separa um tablet de um celular, em pixels.
 *
 * O menor lado não muda ao girar o aparelho, e é por isso que ele serve de
 * medida: um iPad mini tem 744 no menor lado, um iPhone Pro Max tem 430.
 */
const MENOR_LADO_DE_TABLET = 600;

export type TipoDeDispositivo = 'celular' | 'tablet' | 'computador';

/**
 * Que aparelho está na frente do aluno.
 *
 * Existe porque duas ferramentas do site dependem disso, e a resposta não cabe
 * numa media query. A calculadora precisa aparecer no iPad — onde não há papel
 * nem caneta — e sumir no celular, onde a janela cobriria o exercício; e a
 * folha de rascunho só faz sentido onde há dedo ou caneta para escrever.
 *
 * Largura sozinha não decide: um iPad em retrato tem 820 px, estreito como um
 * notebook pequeno, e os dois merecem tratamento oposto. O que separa é o tipo
 * de apontador — `pointer: coarse` quer dizer dedo ou caneta — combinado com o
 * tamanho da tela.
 *
 * O iPad ainda pede um cuidado extra: desde o iPadOS 13 o Safari se apresenta
 * como um Mac. O que o delata é ter mais de um ponto de toque, coisa que
 * nenhum Mac de verdade tem.
 */
@Injectable({ providedIn: 'root' })
export class DispositivoService {
  private readonly documento = inject(DOCUMENT);
  private readonly janela = this.documento.defaultView;

  /** Medidas da tela, relidas a cada redimensionamento ou giro. */
  private readonly tela = signal(this.medir());

  readonly tipo = computed<TipoDeDispositivo>(() => {
    const { menorLado, apontadorGrosso, ehIpad } = this.tela();

    if (!apontadorGrosso && !ehIpad) {
      return 'computador';
    }

    return menorLado >= MENOR_LADO_DE_TABLET ? 'tablet' : 'celular';
  });

  readonly ehTablet = computed(() => this.tipo() === 'tablet');
  readonly ehCelular = computed(() => this.tipo() === 'celular');

  /**
   * A calculadora pode aparecer?
   *
   * No tablet, sempre: é justamente ali que não há papel por perto. No
   * computador, só com janela larga o bastante para ela não cobrir o
   * exercício. No celular, nunca.
   */
  readonly calculadoraPermitida = computed(() => {
    if (this.tipo() === 'celular') {
      return false;
    }

    return this.tipo() === 'tablet' || this.tela().largura >= LARGURA_PARA_JANELAS;
  });

  /**
   * A folha de rascunho pode aparecer?
   *
   * Só no tablet. Com mouse, rabiscar uma conta é pior que escrever no papel
   * que já está na mesa; com caneta na mão, é o contrário.
   */
  readonly folhaPermitida = computed(() => this.tipo() === 'tablet');

  constructor() {
    const janela = this.janela;
    if (janela === null) {
      return;
    }

    const reavaliar = (): void => this.tela.set(this.medir());

    janela.addEventListener('resize', reavaliar);
    janela.addEventListener('orientationchange', reavaliar);

    // O tipo de apontador muda ao acoplar um teclado com trackpad ao iPad.
    janela.matchMedia?.('(pointer: coarse)')?.addEventListener?.('change', reavaliar);
  }

  private medir(): {
    readonly largura: number;
    readonly menorLado: number;
    readonly apontadorGrosso: boolean;
    readonly ehIpad: boolean;
  } {
    const janela = this.janela;

    if (janela === null) {
      return { largura: 0, menorLado: 0, apontadorGrosso: false, ehIpad: false };
    }

    const largura = janela.innerWidth;
    const altura = janela.innerHeight;
    const agente = janela.navigator.userAgent;
    const toques = janela.navigator.maxTouchPoints ?? 0;

    return {
      largura,
      menorLado: Math.min(largura, altura),
      apontadorGrosso: janela.matchMedia?.('(pointer: coarse)')?.matches ?? false,
      // O segundo teste pega o iPad que se diz Mac: Mac com toque não existe.
      ehIpad: /iPad/i.test(agente) || (/Macintosh/i.test(agente) && toques > 1),
    };
  }
}
