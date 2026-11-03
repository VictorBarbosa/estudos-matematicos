import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Mensagem, interpretar, tamanhoLegivel } from '@core/assistente/models/assistente.model';
import { AssistenteService } from '@core/assistente/services/assistente.service';
import { NgTemplateOutlet } from '@angular/common';
import { Formula } from '@shared/components/formula/formula';

/** Margem mínima entre a janela e a borda da tela, ao arrastar. */
const FOLGA = 8;

/**
 * O assistente, numa janela flutuante.
 *
 * Flutua pela mesma razão da calculadora: a dúvida é sobre o exercício que
 * está atrás dela, e um modal cobriria justamente o que se quer perguntar.
 *
 * Some abaixo de 60rem — não é só questão de espaço. O Ollama roda na máquina
 * do aluno, e `localhost:11434` visto do celular é o próprio celular, onde não
 * há servidor nenhum.
 */
@Component({
  selector: 'app-assistente-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Formula, NgTemplateOutlet],
  templateUrl: './assistente-dialog.html',
  styleUrl: './assistente-dialog.scss',
})
export class AssistenteDialog {
  protected readonly assistente = inject(AssistenteService);

  private readonly painel = viewChild<ElementRef<HTMLElement>>('painel');
  private readonly campo = viewChild<ElementRef<HTMLTextAreaElement>>('campo');
  private readonly fim = viewChild<ElementRef<HTMLElement>>('fim');

  protected readonly pergunta = signal('');
  protected readonly tamanho = tamanhoLegivel;

  /** O texto que está chegando, já lido como Markdown. */
  protected readonly parcial = computed(() => interpretar(this.assistente.resposta()));

  protected readonly podeEnviar = computed(
    () => this.pergunta().trim() !== '' && !this.assistente.respondendo(),
  );

  private arrastando: { readonly dx: number; readonly dy: number } | null = null;
  private readonly canto = signal<{ x: number; y: number } | null>(null);

  protected readonly local = computed(() => this.canto() ?? this.assistente.posicao());

  constructor() {
    effect(() => {
      if (this.assistente.aberto()) {
        queueMicrotask(() => this.campo()?.nativeElement.focus());
      }
    });

    // Rola para o fim a cada pedaço que chega, para que a resposta se leia
    // enquanto nasce em vez de exigir rolagem manual.
    effect(() => {
      this.assistente.mensagens();
      this.assistente.resposta();
      queueMicrotask(() => {
        // `scrollIntoView` não existe no jsdom. Sem a guarda, a chamada vira
        // erro não tratado dentro do microtask — não reprova nenhum teste, mas
        // derruba o processo, que foi como a publicação quebrou.
        this.fim()?.nativeElement.scrollIntoView?.({ block: 'end' });
      });
    });

    /*
     * O tamanho é do aluno, não do Angular.
     *
     * A alça nativa do `resize` escreve direto no `style` do elemento. Se o
     * template também escrevesse largura e altura, os dois brigariam a cada
     * arrasto. Então o tamanho guardado é aplicado uma vez, quando a janela
     * nasce, e dali em diante quem manda é o navegador — o observador só
     * anota onde ele parou.
     */
    effect((aoLimpar) => {
      const elemento = this.painel()?.nativeElement;
      if (elemento === undefined) {
        return;
      }

      const guardado = untracked(() => this.assistente.tamanho());
      if (guardado !== null) {
        elemento.style.width = `${guardado.largura}px`;
        elemento.style.height = `${guardado.altura}px`;
      }

      // Onde não existe `ResizeObserver` — jsdom nos testes — a janela segue
      // redimensionável; o que se perde é só guardar o tamanho.
      if (typeof ResizeObserver !== 'function') {
        return;
      }

      const observador = new ResizeObserver(() => this.anotarTamanho(elemento));
      observador.observe(elemento);
      aoLimpar(() => {
        observador.disconnect();
        clearTimeout(this.anotacao);
      });
    });
  }

  protected blocosDe(mensagem: Mensagem) {
    return interpretar(mensagem.texto);
  }

  protected async enviar(): Promise<void> {
    if (!this.podeEnviar()) {
      return;
    }

    const texto = this.pergunta();
    this.pergunta.set('');
    await this.assistente.perguntar(texto);
  }

  /** Enter envia; Shift+Enter quebra linha, como em qualquer chat. */
  protected aoTeclar(evento: KeyboardEvent): void {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault();
      void this.enviar();
    }
  }

  private anotacao: ReturnType<typeof setTimeout> | undefined;

  /** Guarda o tamanho, mas só depois que a alça para de se mexer. */
  private anotarTamanho(elemento: HTMLElement): void {
    clearTimeout(this.anotacao);

    this.anotacao = setTimeout(() => {
      const { width, height } = elemento.getBoundingClientRect();
      const guardado = this.assistente.tamanho();

      if (guardado?.largura !== Math.round(width) || guardado.altura !== Math.round(height)) {
        this.assistente.definirTamanho({
          largura: Math.round(width),
          altura: Math.round(height),
        });
      }
    }, 300);
  }

  protected aoPegar(evento: PointerEvent): void {
    // Os botões da barra não arrastam a janela: capturar o ponteiro faria o
    // clique ser entregue à barra em vez de a eles.
    if ((evento.target as HTMLElement).closest('button, select, input') !== null) {
      return;
    }

    const alvo = evento.currentTarget as HTMLElement;
    const caixa = this.painel()!.nativeElement.getBoundingClientRect();

    this.arrastando = { dx: evento.clientX - caixa.left, dy: evento.clientY - caixa.top };
    // Como `scrollIntoView`, não existe no jsdom; sem ele o arrasto ainda
    // funciona, só perde a captura do ponteiro fora da janela.
    alvo.setPointerCapture?.(evento.pointerId);
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
      this.assistente.definirPosicao(parada);
    }
  }

  private dentroDaTela(x: number, y: number): { x: number; y: number } {
    const caixa = this.painel()!.nativeElement.getBoundingClientRect();

    return {
      x: Math.min(Math.max(x, FOLGA), Math.max(FOLGA, window.innerWidth - caixa.width - FOLGA)),
      y: Math.min(Math.max(y, FOLGA), Math.max(FOLGA, window.innerHeight - caixa.height - FOLGA)),
    };
  }
}
