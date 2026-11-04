import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Ponto, Traco, FolhaService } from '@core/folha/services/folha.service';
import { I18nService } from '@core/i18n/services/i18n.service';

/** Margem mínima entre a janela e a borda da tela, ao arrastar. */
const FOLGA = 8;

/** Espessura do lápis, em pixels, com pressão média. */
const ESPESSURA = 2.4;

/** Espessura da borracha: grossa, porque apagar é gesto grosso. */
const ESPESSURA_DA_BORRACHA = 24;

/**
 * Folha de rascunho flutuante, para quem estuda sem papel.
 *
 * Só aparece no tablet, e a razão é prática: com caneta na mão, armar uma
 * divisão longa na tela é mais rápido que ir buscar um caderno; com mouse, é
 * pior que qualquer papel. Quem decide é o `DispositivoService`, no cabeçalho.
 *
 * O desenho é guardado como lista de traços, não como imagem. Isso é o que
 * permite desfazer o último traço, redesenhar nítido quando a janela muda de
 * tamanho ou de densidade de pixels, e trocar de tema sem o rascunho virar
 * tinta preta sobre fundo preto — a cor vem do tema na hora de pintar.
 */
@Component({
  selector: 'app-folha',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './folha.html',
  styleUrl: './folha.scss',
})
export class Folha {
  protected readonly folha = inject(FolhaService);
  protected readonly i18n = inject(I18nService);

  private readonly painel = viewChild<ElementRef<HTMLElement>>('painel');
  private readonly tela = viewChild<ElementRef<HTMLCanvasElement>>('tela');

  private arrastando: { readonly dx: number; readonly dy: number } | null = null;
  private readonly canto = signal<{ x: number; y: number } | null>(null);

  /** Onde a janela está. Sem posição guardada, nasce onde o CSS a põe. */
  protected readonly local = computed(() => this.canto() ?? this.folha.posicao());

  /** O ponteiro que está desenhando agora; os demais são ignorados. */
  private escrevendo: number | null = null;

  constructor() {
    // Redesenha a cada traço novo, e também ao abrir ou trocar de tema.
    effect(() => {
      this.folha.tracos();
      queueMicrotask(() => this.pintar());
    });

    effect(() => {
      if (!this.folha.aberta()) {
        return;
      }

      queueMicrotask(() => {
        this.recolocarSePrecisar();
        this.ajustarTela();
      });
    });
  }

  protected aoApoiar(evento: PointerEvent): void {
    // Dois dedos na tela quase sempre é rolagem ou zoom, não escrita.
    if (this.escrevendo !== null) {
      return;
    }

    const tela = this.tela();
    if (tela === undefined) {
      return;
    }

    this.escrevendo = evento.pointerId;
    tela.nativeElement.setPointerCapture(evento.pointerId);
    this.folha.comecarTraco(this.pontoDe(evento));
  }

  protected aoMover(evento: PointerEvent): void {
    if (this.escrevendo !== evento.pointerId) {
      return;
    }

    /*
     * Os pontos intermediários importam.
     *
     * O navegador junta vários movimentos num só evento quando a mão corre; sem
     * `getCoalescedEvents`, um traço rápido viraria uma linha reta entre dois
     * pontos distantes.
     */
    const movimentos = evento.getCoalescedEvents?.() ?? [];
    for (const movimento of movimentos.length > 0 ? movimentos : [evento]) {
      this.folha.estenderTraco(this.pontoDe(movimento));
    }
  }

  protected aoLevantar(evento: PointerEvent): void {
    if (this.escrevendo === evento.pointerId) {
      this.escrevendo = null;
    }
  }

  protected aoPegar(evento: PointerEvent): void {
    if ((evento.target as HTMLElement).closest('button') !== null) {
      return;
    }

    const painel = this.painel();
    if (painel === undefined) {
      return;
    }

    const caixa = painel.nativeElement.getBoundingClientRect();
    this.arrastando = { dx: evento.clientX - caixa.left, dy: evento.clientY - caixa.top };
    (evento.currentTarget as HTMLElement).setPointerCapture(evento.pointerId);
  }

  protected aoArrastar(evento: PointerEvent): void {
    if (this.arrastando === null) {
      return;
    }

    this.canto.set(
      this.dentroDaTela(evento.clientX - this.arrastando.dx, evento.clientY - this.arrastando.dy),
    );
  }

  protected aoSoltar(): void {
    const parada = this.canto();
    this.arrastando = null;

    if (parada !== null) {
      this.folha.definirPosicao(parada);
    }
  }

  /** O ponto do evento em coordenadas da folha, com a pressão da caneta. */
  private pontoDe(evento: PointerEvent): Ponto {
    const caixa = this.tela()!.nativeElement.getBoundingClientRect();

    return {
      x: evento.clientX - caixa.left,
      y: evento.clientY - caixa.top,
      // O dedo não informa pressão e manda 0,5 ou 0; meio é o neutro.
      pressao: evento.pressure > 0 ? evento.pressure : 0.5,
    };
  }

  /**
   * Casa o tamanho do bitmap com o tamanho na tela.
   *
   * Sem isso o traço sai borrado no iPad, que desenha a dois ou três pixels
   * físicos por pixel de CSS.
   */
  private ajustarTela(): void {
    const tela = this.tela();
    if (tela === undefined) {
      return;
    }

    const elemento = tela.nativeElement;
    const caixa = elemento.getBoundingClientRect();
    const densidade = window.devicePixelRatio || 1;

    const largura = Math.round(caixa.width * densidade);
    const altura = Math.round(caixa.height * densidade);

    if (elemento.width !== largura || elemento.height !== altura) {
      elemento.width = largura;
      elemento.height = altura;
    }

    this.pintar();
  }

  /** Redesenha todos os traços, do primeiro ao último. */
  private pintar(): void {
    const tela = this.tela();
    if (tela === undefined) {
      return;
    }

    const elemento = tela.nativeElement;
    const pincel = elemento.getContext('2d');
    if (pincel === null) {
      return;
    }

    const densidade = window.devicePixelRatio || 1;
    pincel.setTransform(densidade, 0, 0, densidade, 0, 0);
    pincel.clearRect(0, 0, elemento.width / densidade, elemento.height / densidade);

    // A cor vem do tema: o mesmo rascunho serve ao claro e ao escuro.
    const tinta = getComputedStyle(elemento).getPropertyValue('--tinta').trim() || '#222';

    pincel.lineCap = 'round';
    pincel.lineJoin = 'round';

    for (const traco of this.folha.tracos()) {
      this.pintarTraco(pincel, traco, tinta);
    }
  }

  private pintarTraco(pincel: CanvasRenderingContext2D, traco: Traco, tinta: string): void {
    if (traco.pontos.length === 0) {
      return;
    }

    pincel.globalCompositeOperation = traco.apaga ? 'destination-out' : 'source-over';
    pincel.strokeStyle = tinta;

    // Um toque sem arrastar é um ponto, e um ponto não tem linha para traçar.
    if (traco.pontos.length === 1) {
      const unico = traco.pontos[0]!;
      pincel.beginPath();
      pincel.arc(unico.x, unico.y, this.espessura(traco, unico) / 2, 0, Math.PI * 2);
      pincel.fillStyle = tinta;
      pincel.fill();
      pincel.globalCompositeOperation = 'source-over';
      return;
    }

    /*
     * Um segmento por par de pontos, e não um caminho único.
     *
     * A espessura acompanha a pressão da caneta, e `lineWidth` vale para o
     * traçado inteiro — num caminho só, a pressão do último ponto valeria para
     * tudo.
     */
    for (let i = 1; i < traco.pontos.length; i++) {
      const anterior = traco.pontos[i - 1]!;
      const atual = traco.pontos[i]!;

      pincel.lineWidth = this.espessura(traco, atual);
      pincel.beginPath();
      pincel.moveTo(anterior.x, anterior.y);
      pincel.lineTo(atual.x, atual.y);
      pincel.stroke();
    }

    pincel.globalCompositeOperation = 'source-over';
  }

  private espessura(traco: Traco, ponto: Ponto): number {
    return traco.apaga ? ESPESSURA_DA_BORRACHA : ESPESSURA * (0.5 + ponto.pressao);
  }

  /** Impede que a janela seja largada fora da tela, de onde não voltaria. */
  private dentroDaTela(x: number, y: number): { x: number; y: number } {
    const caixa = this.painel()!.nativeElement.getBoundingClientRect();

    return {
      x: Math.min(Math.max(x, FOLGA), Math.max(FOLGA, window.innerWidth - caixa.width - FOLGA)),
      y: Math.min(Math.max(y, FOLGA), Math.max(FOLGA, window.innerHeight - caixa.height - FOLGA)),
    };
  }

  /** Traz a janela de volta para dentro da tela, se ela ficou fora. */
  private recolocarSePrecisar(): void {
    const guardada = this.folha.posicao();
    if (guardada === null || this.painel() === undefined) {
      return;
    }

    const dentro = this.dentroDaTela(guardada.x, guardada.y);
    if (dentro.x !== guardada.x || dentro.y !== guardada.y) {
      this.folha.definirPosicao(dentro);
    }
  }
}
