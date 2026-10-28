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
   * Interpreta texto digitado pelo aluno: `3/4`, `-2/5`, `7`, `0,5` ou `0.5`.
   * Devolve `null` quando não for uma fração reconhecível — a validação da
   * resposta trata esse caso como "formato inválido", não como erro de cálculo.
   */
  static analisar(texto: string): Fracao | null {
    const limpo = texto.trim().replace(/\s+/g, '');
    if (limpo === '') {
      return null;
    }

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

  toString(): string {
    return this.denominador === 1
      ? String(this.numerador)
      : `${this.numerador}/${this.denominador}`;
  }
}
