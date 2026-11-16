import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import {
  Angulo,
  ESTADO_INICIAL,
  EstadoCalculadora,
  ModoCalculadora,
  alternarSinal,
  apagar,
  calcular,
  calcularFatores,
  calcularInteiros,
  fracaoSimplificada,
  normalizarSeparadores,
  digitar,
  inverso,
  limpar,
  porcentagem,
} from '@core/calculadora/models/calculadora.model';
import { ContaDeDecimal, decimalEmFracao } from './decimal-em-fracao';
import { Modo, ModoService } from './modo.service';
import { TecladoService } from './teclado.service';
import { Acao, BASICAS, CIENTIFICAS, Tecla, rotuloLimpar } from './teclas';

const CHAVE = 'calculadora-matematica.estado.v1';

/**
 * O que fica guardado entre aberturas do aplicativo.
 *
 * O modo não entra aqui: ele é do menu, e mora no {@link ModoService}.
 */
interface Preferencias {
  readonly angulo: Angulo;
}

const PADRAO: Preferencias = { angulo: 'rad' };

/** Como cada modo se chama no menu e no título. */
export const NOME_DO_MODO: Readonly<Record<Modo, string>> = {
  basica: 'Básica',
  cientifica: 'Científica',
  'mmc-mdc': 'MMC e MDC',
  'soma-produto': 'Fatorar',
  'decimal-fracao': 'Decimal em fração',
};

/**
 * A calculadora do site, numa página inteira de iPhone.
 *
 * A mecânica é a mesma — o módulo `calculadora.model` veio copiado, sem uma
 * linha mudada —, e o que muda é a moldura: em vez de uma janela flutuante
 * que se arrasta, uma página só, com os quatro modos no menu lateral em vez
 * de abas. Abas roubariam a faixa de baixo, que no telefone é onde a mão
 * alcança sem esticar.
 */
@Component({
  selector: 'app-calculadora',
  templateUrl: './calculadora.page.html',
  styleUrl: './calculadora.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, IonContent],
})
export class CalculadoraPage {
  private readonly modos = inject(ModoService);
  private readonly preferencias = signal<Preferencias>(carregar());

  /** Onde o teclado do sistema termina — é o que posiciona a faixa de teclas. */
  protected readonly teclado = inject(TecladoService);

  private readonly destruir = inject(DestroyRef);

  /** O bloco dos campos, para achar a primeira entrada do modo. */
  private readonly camposRef = viewChild<ElementRef<HTMLElement>>('campos');

  /** Onde começou o último toque. Ver `veioDoTopo`. */
  private readonly ultimoToque = signal<HTMLElement | null>(null);

  /**
   * Qual campo está com o cursor — e o elemento dele.
   *
   * A faixa acima do teclado mostra as teclas DAQUELE campo: a vírgula em MMC
   * e MDC, o `±` em Fatorar, e as quatro do decimal. Um campo por vez, porque
   * o teclado também é um só.
   *
   * O ELEMENTO viaja junto porque a faixa é desenhada FORA do bloco onde o
   * campo está: a referência de template (`#entradaNumeros`) só vale dentro
   * do `@if` que a declara, e a faixa mora no fim da página. Guardar o próprio
   * input no foco resolve isso sem `viewChild` por campo.
   */
  protected readonly foco = signal<FocoDoCampo | null>(null);

  /**
   * A faixa de teclas aparece quando há um campo em foco — e só.
   *
   * Ela NÃO depende de medir o teclado. A primeira versão dependia, e no
   * aplicativo a medida dava zero (o plugin redimensiona o WebView, e janela e
   * área visível encolhem juntas): a faixa nunca aparecia, e o separador sumiu
   * da tela. A altura só diz ONDE a faixa fica; sem medida, o rodapé da área
   * visível já é o topo do teclado.
   */
  protected readonly comBarra = computed(() => this.foco() !== null);

  protected readonly modo = this.modos.modo;
  protected readonly angulo = computed(() => this.preferencias().angulo);
  protected readonly titulo = computed(() => NOME_DO_MODO[this.modo()]);

  private readonly estado = signal<EstadoCalculadora>(ESTADO_INICIAL);

  /** Os números escritos na aba de MMC e MDC. */
  protected readonly numeros = signal('');
  /** O produto e a soma procurados na aba de fatorar. */
  protected readonly produto = signal('');
  protected readonly soma = signal('');
  /** O decimal a converter em fração. */
  protected readonly decimal = signal('');

  protected readonly basicas = BASICAS;
  protected readonly cientificas = CIENTIFICAS;

  protected readonly emInteiros = computed(() => this.modo() === 'mmc-mdc');
  protected readonly emFatores = computed(() => this.modo() === 'soma-produto');
  protected readonly emDecimal = computed(() => this.modo() === 'decimal-fracao');
  protected readonly emTeclado = computed(
    () => !this.emInteiros() && !this.emFatores() && !this.emDecimal(),
  );

  /** O modo tem campo de texto? É o que decide se o teclado deve ficar aberto. */
  protected readonly emCampos = computed(() => !this.emTeclado());

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
  protected readonly fatores = computed(() => calcularFatores(this.produto(), this.soma()));
  protected readonly conversao = computed<ContaDeDecimal>(() => decimalEmFracao(this.decimal()));

  /** A linha pequena: a conta que gerou o resultado, ou o aviso de erro. */
  protected readonly legenda = computed(() => {
    if (this.emDecimal()) {
      const { decimal, erro } = this.conversao();
      if (erro !== null) {
        return traduzirErro(erro.chave, erro.valores);
      }
      return decimal === null ? 'Escreva um decimal, como 0,375 ou 0,1(6).' : `${decimal} =`;
    }

    if (this.emFatores()) {
      const { produto, soma, par, erro } = this.fatores();
      if (erro !== null) {
        return traduzirErro(erro.chave, erro.valores);
      }
      if (produto === null || soma === null) {
        return 'Escreva o produto e a soma.';
      }
      return par === null
        ? 'Nenhum par de inteiros serve'
        : `Produto ${produto}, soma ${soma}`;
    }

    if (this.emInteiros()) {
      const { numeros, erro } = this.conta();
      if (erro !== null) {
        return traduzirErro(erro.chave, erro.valores);
      }
      return numeros.length >= 2
        ? `MMC e MDC de ${numeros.join(', ')}`
        : 'Dois ou mais inteiros, separados por barra.';
    }

    const { expressao, resultado, erro } = this.estado();
    if (erro !== null) {
      return traduzirErro(erro.chave, erro.valores);
    }
    return resultado === null ? '' : `${expressao} =`;
  });

  /** A linha grande: o resultado, ou a conta sendo escrita. */
  protected readonly visor = computed(() => {
    if (this.emDecimal()) {
      const { fracao } = this.conversao();
      return fracao === null ? '—' : `${fracao.numerador}/${fracao.denominador}`;
    }

    if (this.emFatores()) {
      const { parExato } = this.fatores();
      return parExato.length === 2 ? `${parExato[0]} e ${parExato[1]}` : '—';
    }

    const { expressao, resultado } = this.estado();
    return resultado ?? (expressao === '' ? '0' : expressao);
  });

  protected readonly rotuloLimpar = computed(() => rotuloLimpar(this.estado()));

  /**
   * Quantos caracteres o visor mostra.
   *
   * Vai para o CSS como `--digitos`, e é de lá que sai o tamanho da fonte: um
   * degrau só — «apertado» acima de catorze — resolvia `0,3` e falhava numa
   * dízima como `0,333333333333`, que sumia pela esquerda da tela.
   */
  protected readonly digitosDoVisor = computed(() => Math.max(1, this.visor().length));

  /** A legenda tem o mesmo problema, com a conta inteira escrita nela. */
  protected readonly digitosDaLegenda = computed(() => Math.max(1, this.legenda().length));

  /**
   * Quantos dígitos tem cada uma das duas contas.
   *
   * No modo de inteiros o visor mostra dois números, e cada um encolhe por
   * conta própria: o MMC de 12, 18 e 24 tem dois dígitos, o de 999 e 998 tem
   * seis, e uma fonte só para os dois estouraria num deles.
   */
  protected digitosDe(valor: number | null): number {
    return Math.max(1, String(valor ?? 0).length);
  }

  constructor() {
    effect(() => salvar(this.preferencias()));

    /*
     * O último toque, na fase de captura.
     *
     * O `blur` do campo chega DEPOIS de o dedo pousar no novo alvo, e nessa
     * hora `document.activeElement` já é outro. Guardar o alvo no `pointerdown`
     * é o que permite saber se o toque veio do cabeçalho — menu, troca de modo
     * — ou do corpo da calculadora.
     */
    const registrar = (evento: PointerEvent): void => {
      this.ultimoToque.set(evento.target as HTMLElement | null);
    };
    document.addEventListener('pointerdown', registrar, true);
    this.destruir.onDestroy(() =>
      document.removeEventListener('pointerdown', registrar, true),
    );

    /*
     * Ao entrar num modo de campo, o teclado abre sozinho.
     *
     * Antes ele só abria com um toque no campo, e quem escolhia «MMC e MDC» no
     * menu via a calculadora sem teclado e sem as teclas da faixa. O foco é
     * pedido depois da renderização, porque o campo daquele modo ainda não
     * existe quando o modo muda.
     */
    effect(() => {
      /*
       * Ao SAIR de um modo de campo, o foco é solto.
       *
       * Sem isto, voltar para o teclado deixava a faixa das teclas na tela:
       * ela aparece quando há campo em foco, e o foco ficava apontando para um
       * campo que não existe mais.
       */
      if (!this.emCampos()) {
        this.foco.set(null);
        return;
      }

      setTimeout(() => {
        const entrada = this.entradaPrincipal();
        if (entrada === undefined || document.activeElement === entrada) {
          return;
        }
        entrada.focus({ preventScroll: true });
      }, 0);
    });
  }

  protected pressionar(acao: Acao): void {
    this.estado.update((atual) => this.aplicar(atual, acao));
  }

  protected rotuloDe(tecla: Tecla): string {
    return tecla.acao.tipo === 'angulo' ? this.angulo().toUpperCase() : tecla.rotulo;
  }

  /** O campo ganhou o cursor. */
  protected focar(campo: CampoDoCampo, entrada: HTMLInputElement): void {
    this.foco.set({ campo, entrada });
  }

  /**
   * O campo perdeu o cursor — e o teclado NÃO pode fechar junto.
   *
   * Era aqui que o teclado fechava. No iPhone, tocar fora tira o foco e o iOS
   * recolhe o teclado; nenhum `preventDefault` segura isso, porque quem manda
   * no teclado é o sistema, não a página. O que funciona é DEVOLVER o foco no
   * quadro seguinte: o teclado nunca chega a fechar, e quem digita não perde a
   * lista no meio.
   *
   * A exceção é o cabeçalho: abrir o menu ou trocar de modo é sair de
   * propósito, e aí o teclado pode — e deve — fechar.
   */
  protected perderFoco(campo: CampoDoCampo, entrada: HTMLInputElement): void {
    if (!this.emCampos() || this.veioDoTopo()) {
      this.foco.set(null);
      return;
    }

    // `setTimeout` e não microtarefa: o iOS recolhe o teclado depois do quadro,
    // e refocar antes disso é ignorado.
    setTimeout(() => {
      if (!this.emCampos() || this.veioDoTopo()) {
        return;
      }
      if (document.activeElement !== entrada) {
        entrada.focus({ preventScroll: true });
      }
      this.foco.set({ campo, entrada });
    }, 0);
  }

  /** A primeira entrada do modo — é nela que o primeiro toque abre o teclado. */
  private entradaPrincipal(): HTMLInputElement | undefined {
    return this.camposRef()?.nativeElement.querySelector('input') ?? undefined;
  }

  /**
   * O último toque começou no cabeçalho?
   *
   * Separa «toquei na tabela para conferir» — e o teclado deve ficar — de «abri
   * o menu para trocar de modo» — e o teclado deve sair. Gravado na fase de
   * CAPTURA, antes de qualquer `blur`, porque na hora do `blur` o alvo do toque
   * já não está disponível.
   */
  private veioDoTopo(): boolean {
    const alvo = this.ultimoToque();
    return alvo !== null && alvo.closest('ion-toolbar, ion-menu, ion-menu-button') !== null;
  }

  /**
   * A barra da faixa: separa os números do campo em foco.
   *
   * Ela existe porque a tecla do teclado do iPhone é a do separador DECIMAL da
   * língua do aparelho — sem cor, e como `.` num aparelho em inglês, o que se
   * confunde com decimal. A tecla do sistema não se reestiliza; esta fica ao
   * lado dela, colorida e com uma barra, que não é decimal em língua nenhuma.
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
   * No iPhone, tocar fora de um campo tira o foco dele e o teclado recolhe — e
   * com ele some a faixa das teclas. Quem digita «12 | 18 | 24» e quer conferir
   * a decomposição toca na tabela, e perdia o teclado no meio da digitação,
   * tendo de tocar no campo outra vez para continuar.
   *
   * O `preventDefault` no `pointerdown` segura o foco onde está **sem impedir o
   * `click`**: os botões continuam funcionando, e o navegador só deixa de mudar
   * o foco. Rolar a página também continua, porque a rolagem é do `touchmove`,
   * não daqui.
   *
   * Duas saídas de propósito:
   *
   * - toque em `input` passa direto — é o que TROCA de campo no Fatorar, que
   *   tem dois;
   * - sem campo em foco, nada acontece — no teclado da calculadora (básica e
   *   científica) não há campo, e barrar o `pointerdown` ali apagaria o estado
   *   de tecla apertada.
   *
   * A barra do topo fica de fora porque está fora da `section`: abrir o menu
   * fecha o teclado, e é o que se espera de quem vai trocar de modo.
   */
  protected protegerFocoDoCampo(evento: PointerEvent): void {
    if (!this.emCampos()) {
      return;
    }

    /*
     * Sem campo em foco, o toque ABRE o teclado em vez de não fazer nada.
     *
     * O iOS só deixa o `focus()` abrir o teclado dentro de um gesto do usuário,
     * e este `pointerdown` é o gesto: o primeiro toque em qualquer ponto da
     * calculadora já deixa o campo com o cursor.
     */
    if (this.foco() === null) {
      this.entradaPrincipal()?.focus({ preventScroll: true });
      return;
    }

    const alvo = evento.target as HTMLElement | null;
    if (alvo === null || alvo.closest('input, textarea') !== null) {
      return;
    }

    evento.preventDefault();
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
  protected sinalDoFoco(): void {
    const alvo = this.foco();
    if (alvo === null) {
      return;
    }
    if (alvo.campo === 'decimal') {
      this.alternarSinalDoDecimal(alvo.entrada);
    } else if (alvo.campo === 'soma' || alvo.campo === 'produto') {
      this.alternarSinalDoCampo(alvo.campo, alvo.entrada);
    }
  }

  /** Uma tecla de texto da faixa (`,`, `(`, `)`) no campo decimal. */
  protected textoNoDecimal(texto: string): void {
    const entrada = this.foco()?.entrada;
    if (entrada !== undefined) {
      this.acrescentarAoDecimal(texto, entrada);
    }
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

  protected definirDecimal(valor: string): void {
    this.decimal.set(valor);
  }

  /** Acrescenta ao decimal o caractere que o teclado numérico não tem. */
  protected acrescentarAoDecimal(texto: string, entrada: HTMLInputElement): void {
    this.decimal.update((atual) => atual + texto);
    this.devolverOCursor(entrada);
  }

  /** Troca o sinal do decimal. */
  protected alternarSinalDoDecimal(entrada: HTMLInputElement): void {
    this.decimal.update((atual) => {
      const limpo = atual.trim();
      return limpo.startsWith('-') ? limpo.slice(1) : `-${limpo}`;
    });
    this.devolverOCursor(entrada);
  }

  /*
   * As duas teclas que o teclado numérico do iPhone não tem.
   *
   * Com `inputmode="numeric"` o aparelho mostra só algarismos: não há sinal de
   * menos para um produto negativo em Fatorar. Em vez de trocar o
   * teclado por um completo — que traria letras no caminho —, cada campo ganha
   * ao lado a tecla que lhe falta.
   *
   * O separador dos números do MMC saiu desta lista: ele mora no próprio
   * teclado desde que o campo passou a abrir com `inputmode="decimal"`.
   */

  /** Troca o sinal de um dos campos de fatorar. */
  protected alternarSinalDoCampo(qual: 'produto' | 'soma', entrada: HTMLInputElement): void {
    const campo = qual === 'produto' ? this.produto : this.soma;
    campo.update((atual) => {
      const limpo = atual.trim();
      return limpo.startsWith('-') ? limpo.slice(1) : `-${limpo}`;
    });
    this.devolverOCursor(entrada);
  }

  /**
   * Deixa o campo com o foco e o cursor no fim, depois de usar a tecla.
   *
   * Quem impede o teclado de fechar é o `preventDefault` no `pointerdown` do
   * botão, no template: sem ele o toque tira o foco do campo e o iPhone
   * recolhe o teclado a cada vírgula. Isto aqui é a rede de segurança — se
   * algum aparelho ainda assim tirar o foco, ele volta — e é o que põe o
   * cursor depois do que acabou de ser inserido.
   */
  private devolverOCursor(entrada: HTMLInputElement): void {
    queueMicrotask(() => {
      entrada.focus();
      const fim = entrada.value.length;
      entrada.setSelectionRange(fim, fim);
    });
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
        return calcular(atual, this.angulo());
      case 'sinal':
        return alternarSinal(atual);
      case 'porcento':
        return porcentagem(atual);
      case 'inverso':
        return inverso(atual);
      case 'angulo':
        this.preferencias.update((p) => ({ ...p, angulo: p.angulo === 'rad' ? 'deg' : 'rad' }));
        return atual;
    }
  }
}

/**
 * As mensagens de erro do modelo, em português.
 *
 * O modelo devolve a CHAVE do recado, e não a frase, porque no site ele fala
 * três línguas. Aqui o aplicativo fala uma só, e a tabela cabe em vinte linhas.
 */
const ERROS: Readonly<Record<string, string>> = {
  'calculadora.naoCalcula': 'Não dá para calcular isso.',
  'calculadora.semZero': 'O zero fica de fora: use inteiros maiores que zero.',
  'calculadora.naoInteiro': '"{parte}" não é um número inteiro.',
  'calculadora.limite': 'Use números até 1 000 000 000.',
  'calculadora.aoMenosDois': 'Informe pelo menos dois números.',
  'calculadora.passaDoExato': 'O resultado passa do que dá para calcular exato.',
  'calculadora.limiteFatores': 'Use números até 1 000 000.',
  'calculadora.semParReal': 'Não existem dois números reais com esse produto e essa soma.',
  'decimal.naoEntendi': 'Não consegui ler esse decimal.',
  'decimal.useParenteses': 'Escreva o período entre parênteses: 0,(3) em vez de 0,333…',
  'decimal.algarismosDemais': 'Algarismos demais para a conta sair exata.',
};

function traduzirErro(chave: string, valores?: Readonly<Record<string, string | number>>): string {
  const frase = ERROS[chave] ?? chave;
  return valores === undefined
    ? frase
    : frase.replace(/\{(\w+)\}/g, (inteiro, nome: string) => String(valores[nome] ?? inteiro));
}

function carregar(): Preferencias {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto === null) {
      return PADRAO;
    }
    const salvo = JSON.parse(bruto) as Partial<Preferencias>;
    return {
      angulo: salvo.angulo === 'deg' ? 'deg' : 'rad',
    };
  } catch {
    return PADRAO;
  }
}

function salvar(preferencias: Preferencias): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(preferencias));
  } catch {
    // Sem armazenamento: as preferências valem só para esta sessão.
  }
}

/** O campo de texto que a faixa de teclas serve. */
type CampoDoCampo = 'numeros' | 'soma' | 'produto' | 'decimal';

/** O campo de texto que a faixa de teclas serve, e o elemento dele. */
interface FocoDoCampo {
  readonly campo: CampoDoCampo;
  readonly entrada: HTMLInputElement;
}
