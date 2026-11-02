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
import {
  ESTADO_INICIAL,
  EstadoCalculadora,
  OperacaoInteiros,
  alternarSinal,
  apagar,
  calcular,
  calcularInteiros,
  digitar,
  inverso,
  limpar,
  porcentagem,
} from '@core/calculadora/models/calculadora.model';
import { CalculadoraService } from '@core/calculadora/services/calculadora.service';

/** O que uma tecla faz. */
type Acao =
  | { readonly tipo: 'inserir'; readonly texto: string }
  | { readonly tipo: 'limpar' }
  | { readonly tipo: 'apagar' }
  | { readonly tipo: 'igual' }
  | { readonly tipo: 'sinal' }
  | { readonly tipo: 'porcento' }
  | { readonly tipo: 'inverso' }
  | { readonly tipo: 'angulo' };

interface Tecla {
  readonly rotulo: string;
  /** Pinta a tecla: cinza-claro para função, laranja para operação. */
  readonly estilo: 'digito' | 'funcao' | 'operador';
  readonly acao: Acao;
  /** O zero ocupa duas colunas, como no iPhone. */
  readonly largo?: boolean;
  /** Nome para leitor de tela, quando o rótulo é um símbolo. */
  readonly nome?: string;
}

const inserir = (texto: string): Acao => ({ tipo: 'inserir', texto });

/** O teclado de sempre: quatro colunas, operações à direita. */
const BASICAS: readonly Tecla[] = [
  { rotulo: 'AC', estilo: 'funcao', acao: { tipo: 'limpar' }, nome: 'Limpar' },
  { rotulo: '±', estilo: 'funcao', acao: { tipo: 'sinal' }, nome: 'Trocar o sinal' },
  { rotulo: '%', estilo: 'funcao', acao: { tipo: 'porcento' }, nome: 'Porcentagem' },
  { rotulo: '÷', estilo: 'operador', acao: inserir('÷'), nome: 'Dividir' },

  { rotulo: '7', estilo: 'digito', acao: inserir('7') },
  { rotulo: '8', estilo: 'digito', acao: inserir('8') },
  { rotulo: '9', estilo: 'digito', acao: inserir('9') },
  { rotulo: '×', estilo: 'operador', acao: inserir('×'), nome: 'Multiplicar' },

  { rotulo: '4', estilo: 'digito', acao: inserir('4') },
  { rotulo: '5', estilo: 'digito', acao: inserir('5') },
  { rotulo: '6', estilo: 'digito', acao: inserir('6') },
  { rotulo: '−', estilo: 'operador', acao: inserir('-'), nome: 'Subtrair' },

  { rotulo: '1', estilo: 'digito', acao: inserir('1') },
  { rotulo: '2', estilo: 'digito', acao: inserir('2') },
  { rotulo: '3', estilo: 'digito', acao: inserir('3') },
  { rotulo: '+', estilo: 'operador', acao: inserir('+'), nome: 'Somar' },

  { rotulo: '0', estilo: 'digito', acao: inserir('0'), largo: true },
  { rotulo: ',', estilo: 'digito', acao: inserir(','), nome: 'Vírgula' },
  { rotulo: '=', estilo: 'operador', acao: { tipo: 'igual' }, nome: 'Calcular' },
];

/** A ala científica: três colunas que aparecem à esquerda das de sempre. */
const CIENTIFICAS: readonly Tecla[] = [
  { rotulo: 'sin', estilo: 'funcao', acao: inserir('sin('), nome: 'Seno' },
  { rotulo: 'ln', estilo: 'funcao', acao: inserir('ln('), nome: 'Logaritmo natural' },
  { rotulo: 'π', estilo: 'funcao', acao: inserir('π'), nome: 'Pi' },

  { rotulo: 'cos', estilo: 'funcao', acao: inserir('cos('), nome: 'Cosseno' },
  { rotulo: 'log', estilo: 'funcao', acao: inserir('log('), nome: 'Logaritmo decimal' },
  { rotulo: 'e', estilo: 'funcao', acao: inserir('e'), nome: 'Número de Euler' },

  { rotulo: 'tan', estilo: 'funcao', acao: inserir('tan('), nome: 'Tangente' },
  { rotulo: '√', estilo: 'funcao', acao: inserir('√('), nome: 'Raiz quadrada' },
  { rotulo: 'x²', estilo: 'funcao', acao: inserir('^2'), nome: 'Ao quadrado' },

  { rotulo: '1/x', estilo: 'funcao', acao: { tipo: 'inverso' }, nome: 'Inverso' },
  { rotulo: 'xʸ', estilo: 'funcao', acao: inserir('^'), nome: 'Elevado a' },
  { rotulo: 'x³', estilo: 'funcao', acao: inserir('^3'), nome: 'Ao cubo' },

  { rotulo: 'RAD', estilo: 'funcao', acao: { tipo: 'angulo' }, nome: 'Unidade de ângulo' },
  { rotulo: '(', estilo: 'funcao', acao: inserir('('), nome: 'Abre parêntese' },
  { rotulo: ')', estilo: 'funcao', acao: inserir(')'), nome: 'Fecha parêntese' },
];

/** O que cada tecla do teclado físico faz. */
const DO_TECLADO: Readonly<Record<string, Acao>> = {
  '+': inserir('+'),
  '-': inserir('-'),
  '*': inserir('×'),
  x: inserir('×'),
  '/': inserir('÷'),
  '^': inserir('^'),
  '(': inserir('('),
  ')': inserir(')'),
  ',': inserir(','),
  '.': inserir(','),
  '%': { tipo: 'porcento' },
  Enter: { tipo: 'igual' },
  '=': { tipo: 'igual' },
  Backspace: { tipo: 'apagar' },
  Delete: { tipo: 'limpar' },
  Escape: { tipo: 'limpar' },
};

/** Margem mínima entre a janela e a borda da tela, ao arrastar. */
const FOLGA = 8;

/**
 * Calculadora flutuante, no feitio da do iPhone.
 *
 * Arrasta pela barra do topo e fica onde foi deixada, entre sessões. O que
 * muda em relação à do iPhone é o visor: em vez de um número solto, ele mostra
 * a expressão inteira. Num site que ensina a ordem das operações, esconder que
 * `2 + 3 × 4` é 14 e não 20 seria contraproducente.
 *
 * Some abaixo de 60rem — a mesma largura em que a navegação lateral vira menu.
 * Num celular ela cobriria o exercício que deveria ajudar a resolver.
 */
@Component({
  selector: 'app-calculadora',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calculadora.html',
  styleUrl: './calculadora.scss',
})
export class Calculadora {
  protected readonly calculadora = inject(CalculadoraService);

  private readonly painel = viewChild<ElementRef<HTMLElement>>('painel');

  protected readonly basicas = BASICAS;
  protected readonly cientificas = CIENTIFICAS;

  private readonly estado = signal<EstadoCalculadora>(ESTADO_INICIAL);

  /** Os números escritos na aba de MMC e MDC. */
  protected readonly numeros = signal('');

  /** O MMC ou o MDC do que está escrito, com as fatorações. */
  protected readonly conta = computed(() =>
    calcularInteiros(this.numeros(), this.calculadora.operacao()),
  );

  protected readonly emInteiros = computed(() => this.calculadora.modo() === 'mmc-mdc');

  /** A linha pequena: a conta que gerou o resultado, ou o aviso de erro. */
  protected readonly legenda = computed(() => {
    if (this.emInteiros()) {
      const { numeros, erro } = this.conta();
      if (erro !== null) {
        return erro;
      }
      return numeros.length >= 2
        ? `${this.calculadora.operacao().toUpperCase()} de ${numeros.join(', ')}`
        : 'Dois ou mais inteiros, separados por vírgula.';
    }

    const { expressao, resultado, erro } = this.estado();
    if (erro !== null) {
      return erro;
    }
    return resultado === null ? '' : `${expressao} =`;
  });

  /** A linha grande: o resultado, ou a conta sendo escrita. */
  protected readonly visor = computed(() => {
    if (this.emInteiros()) {
      const { valor } = this.conta();
      return valor === null ? '—' : String(valor);
    }

    const { expressao, resultado } = this.estado();
    return resultado ?? (expressao === '' ? '0' : expressao);
  });

  /** `AC` enquanto não há nada escrito, `C` depois — como no iPhone. */
  protected readonly rotuloLimpar = computed(() =>
    this.estado().expressao === '' && this.estado().resultado === null ? 'AC' : 'C',
  );

  /** O visor encolhe quando a conta cresce, para não transbordar. */
  protected readonly visorApertado = computed(() => this.visor().length > 16);

  private arrastando: { readonly dx: number; readonly dy: number } | null = null;
  private readonly canto = signal<{ x: number; y: number } | null>(null);

  /** Onde a janela está. Sem posição guardada, nasce no canto inferior direito. */
  protected readonly local = computed(() => this.canto() ?? this.calculadora.posicao());

  constructor() {
    // Abrir leva o foco para a janela, que é o que faz o teclado físico valer.
    effect(() => {
      if (this.calculadora.aberta()) {
        queueMicrotask(() => this.painel()?.nativeElement.focus());
      }
    });
  }

  protected pressionar(acao: Acao): void {
    this.estado.update((atual) => this.aplicar(atual, acao));
  }

  protected definirNumeros(valor: string): void {
    this.numeros.set(valor);
  }

  protected escolher(operacao: OperacaoInteiros): void {
    this.calculadora.definirOperacao(operacao);
  }

  protected aoDigitar(evento: KeyboardEvent): void {
    // Dentro do campo de números quem manda é o campo: sem isto, digitar 12
    // na aba de MMC acionaria as teclas 1 e 2 do teclado de trás.
    if ((evento.target as HTMLElement).tagName === 'INPUT') {
      return;
    }

    const acao = /^\d$/.test(evento.key) ? inserir(evento.key) : DO_TECLADO[evento.key];
    if (acao === undefined) {
      return;
    }

    // O Enter em cima de um botão já o aciona; sem isto, a conta sairia duas vezes.
    evento.preventDefault();
    this.pressionar(acao);
  }

  private aplicar(atual: EstadoCalculadora, acao: Acao): EstadoCalculadora {
    switch (acao.tipo) {
      case 'inserir':
        return digitar(atual, acao.texto);
      case 'limpar':
        return limpar();
      case 'apagar':
        return apagar(atual);
      case 'igual':
        return calcular(atual, this.calculadora.angulo());
      case 'sinal':
        return alternarSinal(atual);
      case 'porcento':
        return porcentagem(atual);
      case 'inverso':
        return inverso(atual);
      case 'angulo':
        this.calculadora.alternarAngulo();
        return atual;
    }
  }

  /** O rótulo da tecla de ângulo mostra a unidade em uso. */
  protected rotuloDe(tecla: Tecla): string {
    return tecla.acao.tipo === 'angulo'
      ? this.calculadora.angulo().toUpperCase()
      : tecla.rotulo;
  }

  protected aoPegar(evento: PointerEvent): void {
    /*
     * Os botões da barra não arrastam a janela.
     *
     * Capturar o ponteiro na barra faz o `pointerup` ser entregue a ela, e o
     * clique passa a ser disparado no ancestral comum — a própria barra — em
     * vez do botão. Era por isso que a aba Científica e o X não respondiam a
     * um clique de verdade.
     */
    if ((evento.target as HTMLElement).closest('button') !== null) {
      return;
    }

    const alvo = evento.currentTarget as HTMLElement;
    const caixa = this.painel()!.nativeElement.getBoundingClientRect();

    this.arrastando = { dx: evento.clientX - caixa.left, dy: evento.clientY - caixa.top };
    alvo.setPointerCapture(evento.pointerId);
  }

  protected aoArrastar(evento: PointerEvent): void {
    if (this.arrastando === null) {
      return;
    }
    this.canto.set(this.dentroDaTela(evento.clientX - this.arrastando.dx, evento.clientY - this.arrastando.dy));
  }

  protected aoSoltar(): void {
    const parada = this.canto();
    this.arrastando = null;

    if (parada !== null) {
      this.calculadora.definirPosicao(parada);
    }
  }

  /** Impede que a janela seja largada fora da tela, de onde não voltaria. */
  private dentroDaTela(x: number, y: number): { x: number; y: number } {
    const caixa = this.painel()!.nativeElement.getBoundingClientRect();

    return {
      x: Math.min(Math.max(x, FOLGA), Math.max(FOLGA, window.innerWidth - caixa.width - FOLGA)),
      y: Math.min(Math.max(y, FOLGA), Math.max(FOLGA, window.innerHeight - caixa.height - FOLGA)),
    };
  }
}
