import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { Polinomio, formatar, formatarEmTexto } from '@core/math/algebra/polinomio/polinomio';

/**
 * Funções racionais: um polinômio dividido por outro.
 *
 * O que elas trazem de novo é o que acontece onde o denominador zera. Nem todo
 * zero do denominador é uma assíntota vertical: quando o numerador zera no
 * mesmo ponto, o que há é um BURACO — um único ponto removido do gráfico, sem
 * nada de dramático acontecendo em volta. Distinguir os dois casos é metade do
 * tópico.
 *
 * A outra metade é o comportamento longe da origem, que depende só da
 * comparação entre os graus: numerador menor dá assíntota em zero, graus
 * iguais dão a razão dos coeficientes líderes, e numerador um grau maior dá
 * uma assíntota oblíqua, que é o quociente da divisão.
 */

export type TipoDeAssintotaFinal = 'horizontal-zero' | 'horizontal-razao' | 'obliqua' | 'nenhuma';

export interface FuncaoRacional {
  readonly numerador: Polinomio;
  readonly denominador: Polinomio;
}

export interface AnaliseRacional {
  /** Onde o denominador zera e o numerador não: o gráfico dispara. */
  readonly assintotasVerticais: readonly number[];
  /** Onde os dois zeram: um ponto removido, sem assíntota. */
  readonly buracos: readonly number[];
  readonly tipoFinal: TipoDeAssintotaFinal;
  /** O valor da assíntota horizontal, quando ela existe. */
  readonly horizontal: number | null;
  /** O quociente da divisão, quando a assíntota é oblíqua. */
  readonly obliqua: Polinomio | null;
  /** Zeros da função: raízes do numerador que sobrevivem. */
  readonly zeros: readonly number[];
}

/** `\frac{x + 1}{x - 2}`, pronto para o KaTeX. */
export function racionalParaTex({ numerador, denominador }: FuncaoRacional): string {
  return `\\frac{${numerador.paraTex()}}{${denominador.paraTex()}}`;
}

export function avaliarRacional(f: FuncaoRacional, x: number): number {
  const baixo = f.denominador.avaliar(x);
  return baixo === 0 ? Number.NaN : f.numerador.avaliar(x) / baixo;
}

/**
 * As raízes inteiras de um polinômio, achadas por varredura.
 *
 * Os exercícios do tópico são montados a partir de raízes inteiras pequenas,
 * então uma varredura é exata e dispensa qualquer método numérico.
 */
export function raizesInteiras(p: Polinomio, alcance = 30): readonly number[] {
  const achadas: number[] = [];

  for (let x = -alcance; x <= alcance; x++) {
    if (Math.abs(p.avaliar(x)) < 1e-9) {
      achadas.push(x);
    }
  }

  return achadas;
}

/** A análise completa de uma função racional. */
export function analisarRacional(f: FuncaoRacional): AnaliseRacional {
  const zerosDoDenominador = raizesInteiras(f.denominador);
  const zerosDoNumerador = raizesInteiras(f.numerador);

  const buracos = zerosDoDenominador.filter((x) => zerosDoNumerador.includes(x));
  const assintotasVerticais = zerosDoDenominador.filter((x) => !zerosDoNumerador.includes(x));
  const zeros = zerosDoNumerador.filter((x) => !zerosDoDenominador.includes(x));

  const grauCima = f.numerador.grau;
  const grauBaixo = f.denominador.grau;

  if (grauCima < grauBaixo) {
    return {
      assintotasVerticais,
      buracos,
      tipoFinal: 'horizontal-zero',
      horizontal: 0,
      obliqua: null,
      zeros,
    };
  }

  if (grauCima === grauBaixo) {
    return {
      assintotasVerticais,
      buracos,
      tipoFinal: 'horizontal-razao',
      horizontal: f.numerador.coeficiente(grauCima) / f.denominador.coeficiente(grauBaixo),
      obliqua: null,
      zeros,
    };
  }

  if (grauCima === grauBaixo + 1) {
    return {
      assintotasVerticais,
      buracos,
      tipoFinal: 'obliqua',
      horizontal: null,
      obliqua: quocienteDaDivisao(f.numerador, f.denominador),
      zeros,
    };
  }

  return {
    assintotasVerticais,
    buracos,
    tipoFinal: 'nenhuma',
    horizontal: null,
    obliqua: null,
    zeros,
  };
}

/**
 * Por que um zero do denominador vira assíntota, e outro vira buraco.
 *
 * É a distinção que o tópico existe para instalar, e ela se decide olhando o
 * numerador no mesmo ponto.
 */
export function assintotaOuBuracoComPassos(f: FuncaoRacional, ponto: number): Resolucao<boolean> {
  const cima = f.numerador.avaliar(ponto);
  const ehBuraco = Math.abs(cima) < 1e-9;

  const passos: Passo[] = [
    {
      descricao: `Em x igual a ${formatarEmTexto(ponto)}, o denominador zera.`,
      tex: `${f.denominador.paraTex()} \\big|_{x = ${formatar(ponto)}} = 0`,
      nota: 'Zerar o denominador exclui o ponto do domínio — mas não diz o que o gráfico faz.',
    },
    {
      descricao: 'O que decide é o numerador no mesmo ponto.',
      tex: `${f.numerador.paraTex()} \\big|_{x = ${formatar(ponto)}} = ${formatar(cima)}`,
    },
    ehBuraco
      ? {
          descricao: 'Os dois zeram: o fator se cancela e sobra um ponto removido.',
          tex: `\\lim_{x \\to ${formatar(ponto)}} f(x) \\;\\text{existe e é finito}`,
          nota: 'É um buraco: um único ponto que falta, sem nada acontecendo em volta.',
        }
      : {
          descricao: 'Só o denominador zera: a função dispara.',
          tex: `\\lim_{x \\to ${formatar(ponto)}} \\left|f(x)\\right| = \\infty`,
          nota: 'É uma assíntota vertical, e o gráfico se aproxima dela sem nunca tocá-la.',
        },
  ];

  return { resultado: ehBuraco, passos };
}

/**
 * O comportamento no infinito, decidido pela comparação de graus.
 *
 * Esta é a leitura que interessa em engenharia: o que a função faz longe da
 * origem, que é onde o regime permanente de um sistema costuma viver.
 */
export function comportamentoNoInfinitoComPassos(f: FuncaoRacional): Resolucao<number> {
  const analise = analisarRacional(f);
  const grauCima = f.numerador.grau;
  const grauBaixo = f.denominador.grau;

  const resultado = analise.horizontal ?? Number.NaN;

  const passos: Passo[] = [
    {
      descricao: 'Longe da origem, só o termo de maior grau de cada lado importa.',
      tex:
        `f(x) \\approx \\frac{${formatar(f.numerador.coeficiente(grauCima))}x^{${grauCima}}}` +
        `{${formatar(f.denominador.coeficiente(grauBaixo))}x^{${grauBaixo}}}`,
      nota: 'Os demais termos crescem mais devagar e somem na comparação.',
    },
    {
      descricao: `O numerador tem grau ${grauCima} e o denominador, ${grauBaixo}.`,
      tex: `\\frac{x^{${grauCima}}}{x^{${grauBaixo}}} = x^{${grauCima - grauBaixo}}`,
    },
    descricaoDoFinal(analise, f),
  ];

  return { resultado, passos };
}

/** Domínio, zeros e assíntotas de uma vez — o roteiro completo de leitura. */
export function analisarRacionalComPassos(f: FuncaoRacional): Resolucao<AnaliseRacional> {
  const analise = analisarRacional(f);

  const passos: Passo[] = [
    {
      descricao: 'O domínio exclui onde o denominador zera.',
      tex: `${f.denominador.paraTex()} = 0 \\;\\Longrightarrow\\; x \\in \\{${[
        ...analise.assintotasVerticais,
        ...analise.buracos,
      ]
        .map((x) => formatar(x))
        .join(',\\; ')}\\}`,
    },
    {
      descricao:
        analise.buracos.length === 0
          ? 'Nenhum desses pontos zera o numerador, então todos são assíntotas verticais.'
          : 'Onde os dois zeram há buraco; onde só o denominador zera há assíntota.',
      tex:
        `\\text{assíntotas: } ${listaTex(analise.assintotasVerticais)} \\qquad ` +
        `\\text{buracos: } ${listaTex(analise.buracos)}`,
    },
    {
      descricao: 'Os zeros da função são as raízes do numerador que sobrevivem.',
      tex: `f(x) = 0 \\;\\Longrightarrow\\; x \\in ${listaTex(analise.zeros)}`,
    },
    descricaoDoFinal(analise, f),
  ];

  return { resultado: analise, passos };
}

function descricaoDoFinal(analise: AnaliseRacional, f: FuncaoRacional): Passo {
  switch (analise.tipoFinal) {
    case 'horizontal-zero':
      return {
        descricao: 'Com o numerador de grau menor, a função tende a zero.',
        tex: '\\lim_{x \\to \\pm\\infty} f(x) = 0',
        nota: 'A assíntota horizontal é o próprio eixo x.',
      };
    case 'horizontal-razao':
      return {
        descricao: 'Com graus iguais, sobra a razão dos coeficientes líderes.',
        tex: `\\lim_{x \\to \\pm\\infty} f(x) = ${formatar(Number((analise.horizontal ?? 0).toFixed(6)))}`,
      };
    case 'obliqua':
      return {
        descricao: 'Com o numerador um grau acima, a assíntota é uma reta inclinada.',
        tex: `y = ${(analise.obliqua ?? Polinomio.ZERO).paraTex()}`,
        nota: 'Ela é o quociente da divisão do numerador pelo denominador.',
      };
    default:
      return {
        descricao: 'Com o numerador dois ou mais graus acima, não há assíntota no infinito.',
        tex: `\\lim_{x \\to \\infty} \\left|f(x)\\right| = \\infty`,
        nota: `O grau ${f.numerador.grau} contra ${f.denominador.grau} faz a função crescer sem limite.`,
      };
  }
}

/** O quociente da divisão de polinômios, que é a assíntota oblíqua. */
export function quocienteDaDivisao(numerador: Polinomio, denominador: Polinomio): Polinomio {
  const coeficientes = [...numerador.coeficientes];
  const grauBaixo = denominador.grau;
  const lider = denominador.coeficiente(grauBaixo);
  const quociente: number[] = [];

  for (let grau = numerador.grau; grau >= grauBaixo; grau--) {
    const fator = (coeficientes[grau] ?? 0) / lider;
    quociente[grau - grauBaixo] = fator;

    for (let k = 0; k <= grauBaixo; k++) {
      coeficientes[grau - grauBaixo + k] =
        (coeficientes[grau - grauBaixo + k] ?? 0) - fator * denominador.coeficiente(k);
    }
  }

  return Polinomio.de(...Array.from({ length: quociente.length }, (_, i) => quociente[i] ?? 0));
}

function listaTex(valores: readonly number[]): string {
  return valores.length === 0
    ? '\\emptyset'
    : `\\{${valores.map((x) => formatar(x)).join(',\\; ')}\\}`;
}
