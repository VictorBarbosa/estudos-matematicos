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
import { DispositivoService } from '@core/dispositivo/services/dispositivo.service';
import { I18nService } from '@core/i18n/services/i18n.service';
import {
  ESTADO_INICIAL,
  EstadoCalculadora,
  alternarSinal,
  apagar,
  calcular,
  calcularFatores,
  calcularInteiros,
  digitar,
  fracaoSimplificada,
  normalizarSeparadores,
  inverso,
  limpar,
  porcentagem,
} from '@core/calculadora/models/calculadora.model';
import { CalculadoraService } from '@core/calculadora/services/calculadora.service';
import { TecladoService } from '@core/calculadora/services/teclado.service';

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
  /** Chave do nome para leitor de tela, quando o rótulo é um símbolo. */
  readonly nome?: string;
}

const inserir = (texto: string): Acao => ({ tipo: 'inserir', texto });

/** O teclado de sempre: quatro colunas, operações à direita. */
const BASICAS: readonly Tecla[] = [
  { rotulo: 'AC', estilo: 'funcao', acao: { tipo: 'limpar' }, nome: 'tecla.limpar' },
  { rotulo: '±', estilo: 'funcao', acao: { tipo: 'sinal' }, nome: 'tecla.sinal' },
  { rotulo: '%', estilo: 'funcao', acao: { tipo: 'porcento' }, nome: 'tecla.porcento' },
  { rotulo: '÷', estilo: 'operador', acao: inserir('÷'), nome: 'tecla.dividir' },

  { rotulo: '7', estilo: 'digito', acao: inserir('7') },
  { rotulo: '8', estilo: 'digito', acao: inserir('8') },
  { rotulo: '9', estilo: 'digito', acao: inserir('9') },
  { rotulo: '×', estilo: 'operador', acao: inserir('×'), nome: 'tecla.multiplicar' },

  { rotulo: '4', estilo: 'digito', acao: inserir('4') },
  { rotulo: '5', estilo: 'digito', acao: inserir('5') },
  { rotulo: '6', estilo: 'digito', acao: inserir('6') },
  { rotulo: '−', estilo: 'operador', acao: inserir('-'), nome: 'tecla.subtrair' },

  { rotulo: '1', estilo: 'digito', acao: inserir('1') },
  { rotulo: '2', estilo: 'digito', acao: inserir('2') },
  { rotulo: '3', estilo: 'digito', acao: inserir('3') },
  { rotulo: '+', estilo: 'operador', acao: inserir('+'), nome: 'tecla.somar' },

  { rotulo: '0', estilo: 'digito', acao: inserir('0'), largo: true },
  { rotulo: ',', estilo: 'digito', acao: inserir(','), nome: 'tecla.virgula' },
  { rotulo: '=', estilo: 'operador', acao: { tipo: 'igual' }, nome: 'tecla.calcular' },
];

/** A ala científica: três colunas que aparecem à esquerda das de sempre. */
const CIENTIFICAS: readonly Tecla[] = [
  { rotulo: 'sin', estilo: 'funcao', acao: inserir('sin('), nome: 'tecla.seno' },
  { rotulo: 'ln', estilo: 'funcao', acao: inserir('ln('), nome: 'tecla.lnNatural' },
  { rotulo: 'π', estilo: 'funcao', acao: inserir('π'), nome: 'tecla.pi' },

  { rotulo: 'cos', estilo: 'funcao', acao: inserir('cos('), nome: 'tecla.cosseno' },
  { rotulo: 'log', estilo: 'funcao', acao: inserir('log('), nome: 'tecla.logDecimal' },
  { rotulo: 'e', estilo: 'funcao', acao: inserir('e'), nome: 'tecla.euler' },

  { rotulo: 'tan', estilo: 'funcao', acao: inserir('tan('), nome: 'tecla.tangente' },
  { rotulo: '√', estilo: 'funcao', acao: inserir('√('), nome: 'tecla.raiz' },
  { rotulo: 'x²', estilo: 'funcao', acao: inserir('^2'), nome: 'tecla.quadrado' },

  { rotulo: '1/x', estilo: 'funcao', acao: { tipo: 'inverso' }, nome: 'tecla.inverso' },
  { rotulo: 'xʸ', estilo: 'funcao', acao: inserir('^'), nome: 'tecla.elevado' },
  { rotulo: 'x³', estilo: 'funcao', acao: inserir('^3'), nome: 'tecla.cubo' },

  { rotulo: 'RAD', estilo: 'funcao', acao: { tipo: 'angulo' }, nome: 'tecla.angulo' },
  { rotulo: '(', estilo: 'funcao', acao: inserir('('), nome: 'tecla.abreParentese' },
  { rotulo: ')', estilo: 'funcao', acao: inserir(')'), nome: 'tecla.fechaParentese' },
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
 * Quem decide se ela aparece é o `DispositivoService`, no cabeçalho: sempre no
 * tablet, onde não há papel na mesa; no computador, só com janela larga; nunca
 * no celular, onde a janela cobriria o exercício que deveria ajudar a resolver.
 */
@Component({
  selector: 'app-calculadora',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calculadora.html',
  styleUrl: './calculadora.scss',
})
export class Calculadora {
  protected readonly calculadora = inject(CalculadoraService);
  protected readonly i18n = inject(I18nService);
  private readonly dispositivo = inject(DispositivoService);

  private readonly painel = viewChild<ElementRef<HTMLElement>>('painel');

  protected readonly basicas = BASICAS;
  protected readonly cientificas = CIENTIFICAS;

  private readonly estado = signal<EstadoCalculadora>(ESTADO_INICIAL);

  /** Os números escritos na aba de MMC e MDC. */
  protected readonly numeros = signal('');

  /**
   * Onde o teclado do sistema termina — é o que posiciona a faixa de teclas.
   *
   * O campo dos números abre o teclado numérico do aparelho, que não tem
   * vírgula: sem esta faixa, no celular não há como separar 12 de 18.
   */
  protected readonly teclado = inject(TecladoService);

  /**
   * Qual campo está com o cursor, e o elemento dele.
   *
   * O ELEMENTO viaja junto porque a faixa é desenhada fora do bloco onde o
   * campo está — a referência de template só vale dentro do `@if` que a
   * declara, e a faixa mora no fim da janela.
   */
  protected readonly foco = signal<FocoDoCampo | null>(null);

  /**
   * A faixa de teclas aparece quando há um campo em foco — e só.
   *
   * Ela NÃO depende de medir o teclado: num WebView que encolhe junto com ele
   * a medida é zero, e exigir medida foi o que fez o separador sumir da tela
   * no aplicativo. A altura só diz ONDE a faixa fica; sem medida, o rodapé já
   * é o topo do teclado.
   */
  protected readonly comBarra = computed(() => this.foco() !== null);

  /**
   * O MMC, o MDC e a simplificação do que está escrito.
   *
   * As três vêm juntas: são leituras da mesma divisão simultânea, e é vendo as
   * duas lado a lado que se entende por que o MMC pega todos os divisores e o
   * MDC só os que couberam em todos os números.
   */
  protected readonly conta = computed(() => calcularInteiros(this.numeros()));

  /** A simplificação empilhada — só quando são dois números, que é uma fração. */
  protected readonly fracao = computed(() => fracaoSimplificada(this.conta()));

  protected readonly emInteiros = computed(() => this.calculadora.modo() === 'mmc-mdc');

  /** O produto e a soma procurados, como o aluno os escreveu. */
  protected readonly produto = signal('');
  protected readonly soma = signal('');

  /** O par de números com aquele produto e aquela soma. */
  protected readonly fatores = computed(() => calcularFatores(this.produto(), this.soma()));

  protected readonly emFatores = computed(() => this.calculadora.modo() === 'soma-produto');

  /** As abas de entrada por campo, onde o teclado da calculadora não aparece. */
  protected readonly emCampos = computed(() => this.emInteiros() || this.emFatores());

  /** A linha pequena: a conta que gerou o resultado, ou o aviso de erro. */
  protected readonly legenda = computed(() => {
    if (this.emFatores()) {
      const { produto, soma, par, erro } = this.fatores();
      if (erro !== null) {
        return this.i18n.t(erro.chave, erro.valores);
      }
      if (produto === null || soma === null) {
        return this.i18n.t('calculadora.pedidoFatores');
      }
      return par === null
        ? this.i18n.t('calculadora.semParInteiro')
        : this.i18n.t('calculadora.deFatores', { produto, soma });
    }

    if (this.emInteiros()) {
      const { numeros, erro } = this.conta();
      if (erro !== null) {
        return this.i18n.t(erro.chave, erro.valores);
      }
      return numeros.length >= 2
        ? this.i18n.t('calculadora.deNumeros', { numeros: numeros.join(', ') })
        : this.i18n.t('calculadora.pedidoInteiros');
    }

    const { expressao, resultado, erro } = this.estado();
    if (erro !== null) {
      return this.i18n.t(erro.chave, erro.valores);
    }
    return resultado === null ? '' : `${expressao} =`;
  });

  /** A linha grande: o resultado, ou a conta sendo escrita. */
  protected readonly visor = computed(() => {
    if (this.emFatores()) {
      const { parExato } = this.fatores();
      return parExato.length === 2
        ? this.i18n.t('calculadora.parEncontrado', { a: parExato[0]!, b: parExato[1]! })
        : '—';
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
    /*
     * Ao SAIR de um modo de campo, o foco é solto.
     *
     * Sem isto, trocar para o teclado deixava a faixa das teclas na tela: ela
     * aparece quando há campo em foco, e o foco ficava apontando para um campo
     * que não existe mais.
     */
    effect(() => {
      if (this.emCampos()) {
        return;
      }
      const entrada = this.foco()?.entrada;
      this.foco.set(null);
      entrada?.blur();
    });

    // Abrir leva o foco para a janela, que é o que faz o teclado físico valer.
    effect(() => {
      if (!this.calculadora.aberta()) {
        return;
      }

      queueMicrotask(() => {
        this.painel()?.nativeElement.focus();
        this.recolocarSePrecisar();
      });
    });
  }

  /**
   * Traz a janela de volta para dentro da tela, se ela ficou fora.
   *
   * A posição é lembrada entre sessões, e a mesma conta aberta num monitor
   * largo e depois num iPad deixaria a calculadora num canto que não existe
   * mais. Acontece ao abrir, quando a janela já tem tamanho medido.
   */
  private recolocarSePrecisar(): void {
    const guardada = this.calculadora.posicao();
    const painel = this.painel();
    if (guardada === null || painel === undefined) {
      return;
    }

    const dentro = this.dentroDaTela(guardada.x, guardada.y);
    if (dentro.x !== guardada.x || dentro.y !== guardada.y) {
      this.calculadora.definirPosicao(dentro);
    }
  }

  protected pressionar(acao: Acao): void {
    this.estado.update((atual) => this.aplicar(atual, acao));
  }

  /** O campo ganhou ou perdeu o cursor. */
  protected focar(campo: CampoDoCampo | null, entrada?: HTMLInputElement): void {
    this.foco.set(campo === null || entrada === undefined ? null : { campo, entrada });
  }

  /**
   * A barra da faixa: separa os números do campo em foco.
   *
   * O teclado do aparelho até tem uma tecla de separador com
   * `inputmode="decimal"`, mas ela é a do separador DECIMAL da língua do
   * aparelho — vem sem cor, e como `.` num aparelho em inglês, o que se lê como
   * decimal. A tecla do sistema não se reestiliza; esta fica ao lado dela,
   * colorida e com uma barra, que não é decimal em língua nenhuma.
   */
  protected separarNoFoco(): void {
    const entrada = this.foco()?.entrada;
    if (entrada === undefined) {
      return;
    }

    const atual = entrada.value.trimEnd();
    if (atual === '' || atual.endsWith('|')) {
      return;
    }

    const novo = `${atual} | `;
    entrada.value = novo;
    entrada.dispatchEvent(new Event('input'));

    // O cursor volta para o fim, senão o próximo dígito entra no meio.
    entrada.setSelectionRange(novo.length, novo.length);
    entrada.focus();
  }

  /**
   * Impede que um toque FORA do campo feche o teclado.
   *
   * No celular, tocar fora de um campo tira o foco dele e o teclado recolhe — e
   * com ele some a faixa das teclas. Quem digita «12 | 18 | 24» e quer conferir
   * a decomposição toca na tabela, e perdia o teclado no meio da digitação.
   *
   * O `preventDefault` no `pointerdown` segura o foco onde está **sem impedir o
   * `click`**: os botões continuam funcionando, e o navegador só deixa de mudar
   * o foco. Rolar continua, porque a rolagem é do `touchmove`.
   *
   * Três saídas, e cada uma tem um motivo:
   *
   * - toque em `input` passa direto — é o que TROCA de campo no Fatorar, que
   *   tem dois;
   * - toque na BARRA do topo passa direto, porque é a alça: `preventDefault`
   *   no `pointerdown` cancela a captura implícita do ponteiro, e a janela
   *   deixaria de se arrastar no toque;
   * - sem campo em foco, nada acontece — no teclado da calculadora (básica e
   *   científica) não há campo, e barrar o `pointerdown` ali apagaria o estado
   *   de tecla apertada.
   */
  protected protegerFocoDoCampo(evento: PointerEvent): void {
    if (!this.emCampos()) {
      return;
    }

    /*
     * Sem campo em foco, o toque ABRE o teclado em vez de não fazer nada.
     *
     * O iOS só deixa o `focus()` abrir o teclado dentro de um gesto do usuário,
     * e este `pointerdown` é o gesto. No computador não há teclado de tela para
     * abrir, e o foco automático só atrapalharia — daí a guarda.
     */
    if (this.foco() === null) {
      if (this.temTecladoDeTela()) {
        this.entradaPrincipal()?.focus({ preventScroll: true });
      }
      return;
    }

    const alvo = evento.target as HTMLElement | null;
    if (alvo === null || alvo.closest('input, textarea, .barra') !== null) {
      return;
    }

    evento.preventDefault();
  }

  /**
   * O campo perdeu o cursor — e o teclado de tela NÃO pode fechar junto.
   *
   * No celular e no tablet, tocar fora tira o foco e o sistema recolhe o
   * teclado. Nenhum `preventDefault` segura isso: quem manda no teclado é o
   * sistema. O que funciona é DEVOLVER o foco no quadro seguinte — o teclado
   * nunca chega a fechar, e quem digita não perde a lista no meio.
   *
   * No computador, nada disso: devolver o foco ali prenderia o cursor na
   * calculadora, e o aluno não conseguiria clicar no exercício ao lado.
   */
  protected perderFoco(campo: CampoDoCampo, entrada: HTMLInputElement): void {
    if (!this.temTecladoDeTela() || !this.emCampos()) {
      this.foco.set(null);
      return;
    }

    // `setTimeout` e não microtarefa: o sistema recolhe o teclado depois do
    // quadro, e refocar antes disso é ignorado.
    setTimeout(() => {
      if (!this.emCampos() || !this.temTecladoDeTela()) {
        return;
      }
      if (document.activeElement !== entrada) {
        entrada.focus({ preventScroll: true });
      }
      this.foco.set({ campo, entrada });
    }, 0);
  }

  /** A primeira entrada da calculadora — é nela que o primeiro toque foca. */
  private entradaPrincipal(): HTMLInputElement | undefined {
    return this.painel()?.nativeElement.querySelector('input') ?? undefined;
  }

  /**
   * Há teclado de tela para manter aberto?
   *
   * Só onde o apontador é dedo ou caneta. Sem esta guarda, o site prenderia o
   * foco na calculadora em qualquer computador — e o aluno não conseguiria
   * clicar no exercício ao lado.
   */
  private temTecladoDeTela(): boolean {
    return this.dispositivo.tipo() !== 'computador';
  }

  /**
   * O `C` da faixa: limpa o campo em foco.
   *
   * Fica ao lado da barra porque é o par dela: a barra separa, o `C` recomeça.
   * Sem ele, apagar uma lista de cinco números exige cinco toques no apagar do
   * teclado — e no campo de MMC a lista cresce rápido.
   */
  protected limparNoFoco(): void {
    const entrada = this.foco()?.entrada;
    if (entrada === undefined) {
      return;
    }

    entrada.value = '';
    entrada.dispatchEvent(new Event('input'));
    entrada.focus();
  }

  /** O `±` da faixa: troca o sinal do campo em foco. */
  protected sinalNoFoco(): void {
    const alvo = this.foco();
    if (alvo === null) {
      return;
    }

    const valor = alvo.entrada.value.trim();
    const novo = valor.startsWith('-') ? valor.slice(1) : `-${valor === '' ? '0' : valor}`;
    alvo.entrada.value = novo;
    alvo.entrada.dispatchEvent(new Event('input'));
    alvo.entrada.focus();
  }

  protected definirNumeros(valor: string): void {
    // Normaliza na ENTRADA: quem digita `12,18` no teclado do aparelho vê
    // `12 | 18` aparecer, e o ponto não fica parecendo decimal.
    this.numeros.set(normalizarSeparadores(valor));
  }

  protected definirProduto(valor: string): void {
    this.produto.set(valor);
  }

  protected definirSoma(valor: string): void {
    this.soma.set(valor);
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
    return tecla.acao.tipo === 'angulo' ? this.calculadora.angulo().toUpperCase() : tecla.rotulo;
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

/** O campo de texto que a faixa de teclas serve, e o elemento dele. */
interface FocoDoCampo {
  readonly campo: CampoDoCampo;
  readonly entrada: HTMLInputElement;
}

/** Os campos que a faixa atende: os dois de número da calculadora. */
type CampoDoCampo = 'numeros' | 'soma' | 'produto';
