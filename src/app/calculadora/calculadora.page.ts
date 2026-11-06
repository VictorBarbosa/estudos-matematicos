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
  OperacaoInteiros,
  alternarSinal,
  apagar,
  calcular,
  calcularFatores,
  calcularInteiros,
  digitar,
  inverso,
  limpar,
  porcentagem,
} from '@core/calculadora/models/calculadora.model';
import { ModoService } from './modo.service';
import { Acao, BASICAS, CIENTIFICAS, Tecla, rotuloLimpar } from './teclas';

const CHAVE = 'calculadora-matematica.estado.v1';

/**
 * O que fica guardado entre aberturas do aplicativo.
 *
 * O modo não entra aqui: ele é do menu, e mora no {@link ModoService}.
 */
interface Preferencias {
  readonly angulo: Angulo;
  readonly operacao: OperacaoInteiros;
}

const PADRAO: Preferencias = { angulo: 'rad', operacao: 'mmc' };

/** Como cada modo se chama no menu e no título. */
export const NOME_DO_MODO: Readonly<Record<ModoCalculadora, string>> = {
  basica: 'Básica',
  cientifica: 'Científica',
  'mmc-mdc': 'MMC e MDC',
  'soma-produto': 'Fatorar',
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

  protected readonly modo = this.modos.modo;
  protected readonly angulo = computed(() => this.preferencias().angulo);
  protected readonly operacao = computed(() => this.preferencias().operacao);
  protected readonly titulo = computed(() => NOME_DO_MODO[this.modo()]);

  private readonly estado = signal<EstadoCalculadora>(ESTADO_INICIAL);

  /** Os números escritos na aba de MMC e MDC. */
  protected readonly numeros = signal('');
  /** O produto e a soma procurados na aba de fatorar. */
  protected readonly produto = signal('');
  protected readonly soma = signal('');

  protected readonly basicas = BASICAS;
  protected readonly cientificas = CIENTIFICAS;

  protected readonly emInteiros = computed(() => this.modo() === 'mmc-mdc');
  protected readonly emFatores = computed(() => this.modo() === 'soma-produto');
  protected readonly emTeclado = computed(() => !this.emInteiros() && !this.emFatores());

  protected readonly conta = computed(() => calcularInteiros(this.numeros(), this.operacao()));
  protected readonly fatores = computed(() => calcularFatores(this.produto(), this.soma()));

  protected readonly nomeDaOperacao = computed(() =>
    this.operacao() === 'mmc' ? 'MMC' : 'MDC',
  );

  /** A linha pequena: a conta que gerou o resultado, ou o aviso de erro. */
  protected readonly legenda = computed(() => {
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
        ? `${this.nomeDaOperacao()} de ${numeros.join(', ')}`
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
    if (this.emFatores()) {
      const { parExato } = this.fatores();
      return parExato.length === 2 ? `${parExato[0]} e ${parExato[1]}` : '—';
    }

    if (this.emInteiros()) {
      const { valor } = this.conta();
      return valor === null ? '—' : String(valor);
    }

    const { expressao, resultado } = this.estado();
    return resultado ?? (expressao === '' ? '0' : expressao);
  });

  protected readonly rotuloLimpar = computed(() => rotuloLimpar(this.estado()));

  /** O visor encolhe quando a conta cresce, para não transbordar. */
  protected readonly visorApertado = computed(() => this.visor().length > 14);

  constructor() {
    effect(() => salvar(this.preferencias()));
  }

  protected escolher(operacao: OperacaoInteiros): void {
    this.preferencias.update((atual) => ({ ...atual, operacao }));
  }

  protected pressionar(acao: Acao): void {
    this.estado.update((atual) => this.aplicar(atual, acao));
  }

  protected rotuloDe(tecla: Tecla): string {
    return tecla.acao.tipo === 'angulo' ? this.angulo().toUpperCase() : tecla.rotulo;
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
      operacao: salvo.operacao === 'mdc' ? 'mdc' : 'mmc',
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
