import { ErroMatematico, exigirInteiro } from '@core/math/tipos';
import { mdc, mmc } from './inteiros';

/**
 * Número racional exato, imutável.
 *
 * A representação é sempre normalizada quanto ao sinal: o denominador é
 * positivo e o sinal fica no numerador. Isso garante que duas frações
 * equivalentes tenham a mesma forma simplificada, o que é o que permite
 * aceitar `6/8` como resposta correta onde o gabarito é `3/4`.
 *
 * A fração **não** é simplificada automaticamente na criação — simplificar é
 * justamente uma das etapas que o aluno precisa ver acontecendo.
 */
export class Fracao {
  private constructor(
    readonly numerador: number,
    readonly denominador: number,
  ) {}

  static readonly ZERO = new Fracao(0, 1);
  static readonly UM = new Fracao(1, 1);

  /** Cria uma fração, normalizando o sinal para o numerador. */
  static criar(numerador: number, denominador: number): Fracao {
    exigirInteiro(numerador, 'O numerador');
    exigirInteiro(denominador, 'O denominador');

    if (denominador === 0) {
      throw new ErroMatematico('O denominador não pode ser zero: divisão por zero é indefinida.');
    }

    return denominador < 0
      ? new Fracao(-numerador, -denominador)
      : new Fracao(numerador, denominador);
  }

  static deInteiro(valor: number): Fracao {
    return Fracao.criar(valor, 1);
  }

  /**
   * Interpreta texto digitado pelo aluno: `3/4`, `-2/5`, `7`, `0,5`, `0.5` ou
   * o número misto `2 1/3` (e `-2 1/3`).
   *
   * Devolve `null` quando não for uma fração reconhecível — a validação da
   * resposta trata esse caso como "formato inválido", não como erro de cálculo.
   */
  static analisar(texto: string): Fracao | null {
    const aparado = texto.trim();
    if (aparado === '') {
      return null;
    }

    /*
     * O número misto é lido ANTES de remover os espaços, porque é justamente o
     * espaço que o define: sem este passo, "1 1/2" virava "11/2" — onze meios
     * em vez de um e meio.
     *
     * O sinal vale para o número inteiro: −2 1/3 é −(2 + 1/3), e não −2 + 1/3.
     */
    const comoMista = /^([+-]?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(aparado);
    if (comoMista) {
      const denominador = Number(comoMista[4]);
      if (denominador === 0) {
        return null;
      }

      const inteiro = Number(comoMista[2]);
      const numerador = Number(comoMista[3]);
      const sinal = comoMista[1] === '-' ? -1 : 1;

      return Fracao.criar(sinal * (inteiro * denominador + numerador), denominador);
    }

    /*
     * Fora do número misto, espaço entre dígitos é ambiguidade, não folga:
     * remover os espaços de "1 2 1/2" produziria 121/2, um valor que ninguém
     * digitou. Espaço em volta do traço — "3 / 4" — continua tolerado.
     */
    if (/\d\s+\d/.test(aparado)) {
      return null;
    }

    const limpo = aparado.replace(/\s+/g, '');

    const comoFracao = /^([+-]?\d+)\/([+-]?\d+)$/.exec(limpo);
    if (comoFracao) {
      const numerador = Number(comoFracao[1]);
      const denominador = Number(comoFracao[2]);
      if (denominador === 0) {
        return null;
      }
      return Fracao.criar(numerador, denominador);
    }

    const comoInteiro = /^[+-]?\d+$/.exec(limpo);
    if (comoInteiro) {
      return Fracao.deInteiro(Number(limpo));
    }

    // Decimal finito: 0,75 vira 75/100. Vírgula e ponto são aceitos.
    const comoDecimal = /^([+-]?)(\d*)[.,](\d+)$/.exec(limpo);
    if (comoDecimal) {
      const sinal = comoDecimal[1] === '-' ? -1 : 1;
      const inteira = comoDecimal[2] === '' ? '0' : comoDecimal[2];
      const decimais = comoDecimal[3];
      const potencia = 10 ** decimais.length;
      const numerador = Number(inteira) * potencia + Number(decimais);
      return Fracao.criar(sinal * numerador, potencia);
    }

    return null;
  }

  get ehInteira(): boolean {
    return this.simplificar().denominador === 1;
  }

  get ehNegativa(): boolean {
    return this.numerador < 0;
  }

  get ehZero(): boolean {
    return this.numerador === 0;
  }

  /** Verdadeiro quando |numerador| ≥ denominador, isto é, a fração é imprópria. */
  get ehImpropria(): boolean {
    return Math.abs(this.numerador) >= this.denominador;
  }

  /** Já está na forma irredutível? */
  get estaSimplificada(): boolean {
    return mdc(this.numerador, this.denominador) === 1 || this.ehZero;
  }

  /** Divide numerador e denominador pelo mdc. */
  simplificar(): Fracao {
    if (this.ehZero) {
      return Fracao.ZERO;
    }

    const divisor = mdc(this.numerador, this.denominador);
    return divisor === 1
      ? this
      : Fracao.criar(this.numerador / divisor, this.denominador / divisor);
  }

  /** Reescreve a fração com o denominador pedido, que deve ser múltiplo do atual. */
  comDenominador(novoDenominador: number): Fracao {
    exigirInteiro(novoDenominador, 'O denominador');

    if (novoDenominador % this.denominador !== 0) {
      throw new ErroMatematico(
        `${novoDenominador} não é múltiplo de ${this.denominador}; a conversão mudaria o valor da fração.`,
      );
    }

    const fator = novoDenominador / this.denominador;
    return Fracao.criar(this.numerador * fator, novoDenominador);
  }

  somar(outra: Fracao): Fracao {
    const denominadorComum = mmc(this.denominador, outra.denominador);
    const esquerda = this.comDenominador(denominadorComum);
    const direita = outra.comDenominador(denominadorComum);
    return Fracao.criar(esquerda.numerador + direita.numerador, denominadorComum).simplificar();
  }

  subtrair(outra: Fracao): Fracao {
    return this.somar(outra.negar());
  }

  multiplicar(outra: Fracao): Fracao {
    return Fracao.criar(
      this.numerador * outra.numerador,
      this.denominador * outra.denominador,
    ).simplificar();
  }

  dividir(outra: Fracao): Fracao {
    if (outra.ehZero) {
      throw new ErroMatematico('Não é possível dividir por zero.');
    }
    return this.multiplicar(outra.inverter());
  }

  /** Troca numerador e denominador. */
  inverter(): Fracao {
    if (this.ehZero) {
      throw new ErroMatematico('Zero não tem inverso.');
    }
    return Fracao.criar(this.denominador, this.numerador);
  }

  negar(): Fracao {
    return Fracao.criar(-this.numerador, this.denominador);
  }

  elevar(expoente: number): Fracao {
    exigirInteiro(expoente, 'O expoente');

    if (expoente === 0) {
      return Fracao.UM;
    }
    if (expoente < 0) {
      return this.inverter().elevar(-expoente);
    }

    return Fracao.criar(this.numerador ** expoente, this.denominador ** expoente).simplificar();
  }

  /** Devolve -1, 0 ou 1, comparando com a outra fração. */
  comparar(outra: Fracao): number {
    const esquerda = this.numerador * outra.denominador;
    const direita = outra.numerador * this.denominador;
    return Math.sign(esquerda - direita);
  }

  /**
   * Igualdade por *valor*, não por forma: `6/8` é igual a `3/4`.
   * É esta a noção usada para corrigir as respostas do treino.
   */
  igualA(outra: Fracao): boolean {
    return this.numerador * outra.denominador === outra.numerador * this.denominador;
  }

  paraDecimal(): number {
    return this.numerador / this.denominador;
  }

  /**
   * A fração como número misto: parte inteira e o que sobra dela.
   *
   * Sete terços são dois inteiros e um terço. Essa é a forma em que se diz a
   * quantidade em voz alta — "duas pizzas e um terço" —, e por isso é a forma
   * que o aluno precisa saber ler e escrever.
   *
   * O sinal acompanha a parte inteira: −7/3 é −(2 + 1/3).
   */
  paraMista(): { readonly inteiro: number; readonly numerador: number; readonly denominador: number } {
    const simplificada = this.simplificar();
    const absoluto = Math.abs(simplificada.numerador);
    const sinal = simplificada.numerador < 0 ? -1 : 1;

    return {
      inteiro: sinal * Math.trunc(absoluto / simplificada.denominador),
      numerador: absoluto % simplificada.denominador,
      denominador: simplificada.denominador,
    };
  }

  /** `\frac{3}{4}`, ou apenas `3` quando a fração equivale a um inteiro. */
  paraTex(): string {
    if (this.denominador === 1) {
      return String(this.numerador);
    }
    if (this.numerador < 0) {
      return `-\\frac{${Math.abs(this.numerador)}}{${this.denominador}}`;
    }
    return `\\frac{${this.numerador}}{${this.denominador}}`;
  }

  /** `2\\frac{1}{3}` para sete terços; a forma simples quando não há parte inteira. */
  paraTexMisto(): string {
    const { inteiro, numerador, denominador } = this.paraMista();

    if (numerador === 0) {
      return String(inteiro);
    }
    if (inteiro === 0) {
      return this.simplificar().paraTex();
    }

    const sinal = inteiro < 0 ? '-' : '';
    return `${sinal}${Math.abs(inteiro)}\\frac{${numerador}}{${denominador}}`;
  }

  toString(): string {
    return this.denominador === 1
      ? String(this.numerador)
      : `${this.numerador}/${this.denominador}`;
  }

  /** `2 1/3`, a forma que o campo de resposta também aceita de volta. */
  toStringMisto(): string {
    const { inteiro, numerador, denominador } = this.paraMista();

    if (numerador === 0) {
      return String(inteiro);
    }
    if (inteiro === 0) {
      return this.simplificar().toString();
    }

    const sinal = inteiro < 0 ? '-' : '';
    return `${sinal}${Math.abs(inteiro)} ${numerador}/${denominador}`;
  }
}
