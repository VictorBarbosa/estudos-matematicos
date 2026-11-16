import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
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

  /** Teclas na faixa: precisa de teclado aberto E de um campo em foco. */
  protected readonly comBarra = computed(
    () => this.teclado.aberto() && this.foco() !== null,
  );

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
        : 'Dois ou mais inteiros, separados por vírgula.';
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
  }

  protected pressionar(acao: Acao): void {
    this.estado.update((atual) => this.aplicar(atual, acao));
  }

  protected rotuloDe(tecla: Tecla): string {
    return tecla.acao.tipo === 'angulo' ? this.angulo().toUpperCase() : tecla.rotulo;
  }

  /**
   * O campo ganhou ou perdeu o cursor.
   *
   * `pointerdown` barrado nas teclas da faixa mantém o foco no campo, então o
   * teclado não fecha ao tocar na vírgula — e é por isso que o `blur` só
   * acontece quando o aluno realmente sai do campo.
   */
  protected focar(campo: CampoDoCampo | null, entrada?: HTMLInputElement): void {
    this.foco.set(campo === null || entrada === undefined ? null : { campo, entrada });
  }

  /** A vírgula da faixa: separa os números do campo em foco. */
  protected separarDoFoco(): void {
    const entrada = this.foco()?.entrada;
    if (entrada !== undefined) {
      this.acrescentarSeparador(entrada);
    }
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
    this.numeros.set(valor);
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
   * Com `inputmode="numeric"` o aparelho mostra só algarismos: não há vírgula
   * para separar os números do MMC, nem sinal de menos para um produto
   * negativo em Fatorar. Em vez de trocar o teclado por um completo — que
   * traria letras no caminho —, cada campo ganha ao lado a tecla que lhe
   * falta.
   */

  /** Acrescenta o separador ao fim da lista de inteiros. */
  protected acrescentarSeparador(entrada: HTMLInputElement): void {
    this.numeros.update((atual) => {
      const limpo = atual.trimEnd();
      return limpo === '' || limpo.endsWith(',') ? atual : `${limpo}, `;
    });
    this.devolverOCursor(entrada);
  }

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
