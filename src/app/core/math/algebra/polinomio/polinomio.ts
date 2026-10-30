import { ErroMatematico } from '@core/math/tipos/tipos';

/**
 * Polinômio de uma variável, imutável.
 *
 * Os coeficientes são guardados do grau 0 para cima: `[3, -2, 1]` é
 * 3 − 2x + x². Essa representação atravessa o currículo inteiro — a mesma
 * classe serve à equação do 2º grau, à função quadrática, à derivada e à
 * integral, de modo que nenhum desses tópicos reimplementa a aritmética.
 */
export class Polinomio {
  private constructor(readonly coeficientes: readonly number[]) {}

  /** Coeficientes do grau 0 em diante: `Polinomio.de(3, -2, 1)` é 3 − 2x + x². */
  static de(...coeficientes: readonly number[]): Polinomio {
    return new Polinomio(normalizar(coeficientes));
  }

  /** A partir de um mapa grau → coeficiente, útil para polinômios esparsos. */
  static deGraus(graus: Readonly<Record<number, number>>): Polinomio {
    const maior = Math.max(0, ...Object.keys(graus).map(Number));
    const coeficientes = Array.from({ length: maior + 1 }, (_, grau) => graus[grau] ?? 0);
    return new Polinomio(normalizar(coeficientes));
  }

  static readonly ZERO = new Polinomio([0]);

  /** Grau do polinômio; o polinômio nulo tem grau 0 por convenção aqui. */
  get grau(): number {
    return this.coeficientes.length - 1;
  }

  get ehNulo(): boolean {
    return this.coeficientes.every((coeficiente) => coeficiente === 0);
  }

  /** Coeficiente de xⁿ, ou zero se o termo não existe. */
  coeficiente(grau: number): number {
    return this.coeficientes[grau] ?? 0;
  }

  /** Avaliação por Horner: menos multiplicações e menos erro acumulado. */
  avaliar(x: number): number {
    let resultado = 0;
    for (let grau = this.grau; grau >= 0; grau--) {
      resultado = resultado * x + this.coeficiente(grau);
    }
    return resultado;
  }

  somar(outro: Polinomio): Polinomio {
    const tamanho = Math.max(this.coeficientes.length, outro.coeficientes.length);
    return new Polinomio(
      normalizar(
        Array.from(
          { length: tamanho },
          (_, grau) => this.coeficiente(grau) + outro.coeficiente(grau),
        ),
      ),
    );
  }

  subtrair(outro: Polinomio): Polinomio {
    return this.somar(outro.escalar(-1));
  }

  escalar(fator: number): Polinomio {
    return new Polinomio(normalizar(this.coeficientes.map((coeficiente) => coeficiente * fator)));
  }

  multiplicar(outro: Polinomio): Polinomio {
    const produto = new Array<number>(
      this.coeficientes.length + outro.coeficientes.length - 1,
    ).fill(0);

    for (let i = 0; i < this.coeficientes.length; i++) {
      for (let j = 0; j < outro.coeficientes.length; j++) {
        produto[i + j] += this.coeficiente(i) * outro.coeficiente(j);
      }
    }

    return new Polinomio(normalizar(produto));
  }

  /** Derivada termo a termo: a regra da potência aplicada a cada parcela. */
  derivar(): Polinomio {
    if (this.grau === 0) {
      return Polinomio.ZERO;
    }
    return new Polinomio(
      normalizar(
        this.coeficientes.slice(1).map((coeficiente, indice) => coeficiente * (indice + 1)),
      ),
    );
  }

  /** Antiderivada com constante de integração explícita. */
  integrar(constante = 0): Polinomio {
    return new Polinomio(
      normalizar([
        constante,
        ...this.coeficientes.map((coeficiente, grau) => coeficiente / (grau + 1)),
      ]),
    );
  }

  /** Escreve em LaTeX, omitindo coeficientes 1 e termos nulos. */
  paraTex(variavel = 'x'): string {
    if (this.ehNulo) {
      return '0';
    }

    let escrita = '';

    for (let grau = this.grau; grau >= 0; grau--) {
      const coeficiente = this.coeficiente(grau);
      if (coeficiente === 0) {
        continue;
      }

      const absoluto = Math.abs(coeficiente);
      // O coeficiente 1 some diante de uma variável, mas não sozinho.
      const parteNumerica = absoluto === 1 && grau > 0 ? '' : formatar(absoluto);
      const parteVariavel = grau === 0 ? '' : grau === 1 ? variavel : `${variavel}^{${grau}}`;
      const corpo = `${parteNumerica}${parteVariavel}`;

      if (escrita === '') {
        // O sinal do primeiro termo cola no corpo: "-x^{2}", não "- x^{2}".
        escrita = coeficiente < 0 ? `-${corpo}` : corpo;
      } else {
        escrita += `${coeficiente < 0 ? ' - ' : ' + '}${corpo}`;
      }
    }

    return escrita;
  }

  toString(): string {
    return this.paraTex();
  }
}

/** Remove zeros à esquerda do maior grau, mantendo ao menos o termo constante. */
function normalizar(coeficientes: readonly number[]): readonly number[] {
  if (coeficientes.length === 0) {
    return [0];
  }

  let ultimo = coeficientes.length - 1;
  while (ultimo > 0 && Math.abs(coeficientes[ultimo]!) < 1e-12) {
    ultimo--;
  }

  const recortado = coeficientes.slice(0, ultimo + 1);

  if (recortado.some((coeficiente) => !Number.isFinite(coeficiente))) {
    throw new ErroMatematico('Os coeficientes de um polinômio devem ser finitos.');
  }

  return recortado;
}

/** Número legível: sem casas decimais inúteis e com vírgula. */
export function formatar(valor: number): string {
  const arredondado = Number(valor.toFixed(6));
  return Number.isInteger(arredondado)
    ? String(arredondado)
    : String(arredondado).replace('.', '{,}');
}

/**
 * O mesmo número, escrito para uma frase.
 *
 * As notas dos passos são parágrafos e não passam pelo KaTeX: `{,}` é como o
 * LaTeX escreve o separador decimal, e numa nota ele chegava cru à tela —
 * "Na superfície seriam 9{,}82 m/s²".
 */
export function formatarEmTexto(valor: number): string {
  return formatar(valor).replace('{,}', ',');
}

/** Escreve `ax + b` com os sinais corretos, útil nos enunciados. */
export function binomioParaTex(a: number, b: number, variavel = 'x'): string {
  return Polinomio.de(b, a).paraTex(variavel);
}
