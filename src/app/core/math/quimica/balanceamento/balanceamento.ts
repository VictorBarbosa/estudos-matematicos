import { lerFormula } from '@core/math/quimica/formula/formula';
import { Resolucao } from '@core/math/tipos/tipos';

/**
 * Balanceamento: a equação só é uma equação quando os átomos fecham.
 *
 * Uma reação não cria nem destrói átomos — o que ela faz é rearranjá-los. Os
 * coeficientes são, portanto, a única coisa ajustável: mexer num ÍNDICE
 * trocaria a substância, e esse é o erro de quem está aprendendo. Escrever
 * `H₂O₂` para balancear o oxigênio da água não balanceia nada: passa a falar
 * de peróxido.
 *
 * O balanceamento é um sistema linear homogêneo. Cada elemento dá uma equação
 * — quantos átomos entram menos quantos saem, igual a zero — e os
 * coeficientes são o vetor do núcleo dessa matriz, tomado nos menores inteiros
 * positivos. É por isso que a solução é única a menos de escala: dobrar todos
 * os coeficientes continua balanceado, e a convenção é usar os menores.
 *
 * A aritmética aqui é EXATA, com frações de inteiros. Com ponto flutuante,
 * um coeficiente 3 sairia 2,9999999999999996 e o arredondamento decidiria a
 * química — num tópico cuja lição é que a conta fecha, isso seria contraditar
 * o próprio tópico.
 */

/** Uma fração de inteiros, sempre reduzida e com denominador positivo. */
interface Fracao {
  readonly n: number;
  readonly d: number;
}

function mdc(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y !== 0) {
    [x, y] = [y, x % y];
  }

  return x === 0 ? 1 : x;
}

function mmc(a: number, b: number): number {
  return Math.abs(a * b) / mdc(a, b);
}

function fracao(n: number, d = 1): Fracao {
  const sinal = d < 0 ? -1 : 1;
  const divisor = mdc(n, d);

  return { n: (sinal * n) / divisor, d: (sinal * d) / divisor };
}

function somar(a: Fracao, b: Fracao): Fracao {
  return fracao(a.n * b.d + b.n * a.d, a.d * b.d);
}

function multiplicar(a: Fracao, b: Fracao): Fracao {
  return fracao(a.n * b.n, a.d * b.d);
}

function dividir(a: Fracao, b: Fracao): Fracao {
  return fracao(a.n * b.d, a.d * b.n);
}

const ZERO: Fracao = { n: 0, d: 1 };

/**
 * Os coeficientes que balanceiam a equação, nos menores inteiros positivos.
 *
 * Devolve `undefined` quando alguma fórmula é ilegível, quando o sistema não
 * tem solução de dimensão um — equação impossível, ou ambígua porque admite
 * duas reações independentes — ou quando algum coeficiente sairia zero ou
 * negativo, que é como uma substância «não participa» ou «muda de lado».
 */
export function balancear(
  reagentes: readonly string[],
  produtos: readonly string[],
): readonly number[] | undefined {
  const especies = [...reagentes, ...produtos];
  const composicoes = especies.map((formula) => lerFormula(formula));

  if (composicoes.some((composicao) => composicao === undefined)) {
    return undefined;
  }

  const elementos = [...new Set(composicoes.flatMap((composicao) => [...composicao!.keys()]))];

  // Reagentes entram com sinal positivo e produtos com negativo: assim «entra
  // menos sai» é zero, e o sistema fica homogêneo.
  const matriz: Fracao[][] = elementos.map((elemento) =>
    composicoes.map((composicao, indice) => {
      const quantidade = composicao!.get(elemento) ?? 0;
      return fracao(indice < reagentes.length ? quantidade : -quantidade);
    }),
  );

  const colunas = especies.length;
  const pivos: number[] = [];
  let linha = 0;

  for (let coluna = 0; coluna < colunas && linha < matriz.length; coluna += 1) {
    const alvo = matriz.findIndex((atual, indice) => indice >= linha && atual[coluna]!.n !== 0);

    if (alvo === -1) {
      continue;
    }

    [matriz[linha], matriz[alvo]] = [matriz[alvo]!, matriz[linha]!];

    const pivo = matriz[linha]![coluna]!;
    matriz[linha] = matriz[linha]!.map((valor) => dividir(valor, pivo));

    for (let outra = 0; outra < matriz.length; outra += 1) {
      if (outra === linha || matriz[outra]![coluna]!.n === 0) {
        continue;
      }
      const fator = matriz[outra]![coluna]!;
      matriz[outra] = matriz[outra]!.map((valor, indice) =>
        somar(
          valor,
          multiplicar(fator, { n: -matriz[linha]![indice]!.n, d: matriz[linha]![indice]!.d }),
        ),
      );
    }

    pivos.push(coluna);
    linha += 1;
  }

  const livres = [...Array(colunas).keys()].filter((coluna) => !pivos.includes(coluna));

  // Dimensão um: uma só reação, a menos de escala. Mais de uma variável livre
  // significa equação ambígua, e zero significa equação impossível.
  if (livres.length !== 1) {
    return undefined;
  }

  const livre = livres[0]!;
  const solucao: Fracao[] = Array.from({ length: colunas }, () => ZERO);
  solucao[livre] = fracao(1);

  pivos.forEach((coluna, indice) => {
    const valor = matriz[indice]![livre]!;
    solucao[coluna] = { n: -valor.n, d: valor.d };
  });

  const denominadores = solucao.reduce((atual, valor) => mmc(atual, valor.d), 1);
  const inteiros = solucao.map((valor) => (valor.n * denominadores) / valor.d);
  const divisor = inteiros.reduce((atual, valor) => mdc(atual, valor), 0);
  const coeficientes = inteiros.map((valor) => valor / (divisor === 0 ? 1 : divisor));

  return coeficientes.every((valor) => valor > 0) ? coeficientes : undefined;
}

/** A equação em LaTeX, com os coeficientes dados (o 1 não se escreve). */
export function equacaoQuimicaParaTex(
  reagentes: readonly string[],
  produtos: readonly string[],
  coeficientes?: readonly number[],
): string {
  const escrever = (formula: string, indice: number): string => {
    const coeficiente = coeficientes?.[indice];
    const prefixo = coeficiente === undefined || coeficiente === 1 ? '' : `${coeficiente}\\,`;

    return `${prefixo}\\text{${formula.replace(/(\d+)/g, '}_{$1}\\text{')}}`;
  };

  const esquerda = reagentes.map((formula, indice) => escrever(formula, indice)).join(' + ');
  const direita = produtos
    .map((formula, indice) => escrever(formula, reagentes.length + indice))
    .join(' + ');

  return `${esquerda} \\to ${direita}`;
}

/** Quantos átomos de cada elemento há num lado, com os coeficientes dados. */
export function contarAtomos(
  formulas: readonly string[],
  coeficientes: readonly number[],
): ReadonlyMap<string, number> {
  const total = new Map<string, number>();

  formulas.forEach((formula, indice) => {
    const composicao = lerFormula(formula);
    if (composicao === undefined) {
      return;
    }
    for (const [simbolo, quantidade] of composicao) {
      total.set(simbolo, (total.get(simbolo) ?? 0) + quantidade * coeficientes[indice]!);
    }
  });

  return total;
}

/** Os dois lados têm os mesmos átomos, nas mesmas quantidades? */
export function estaBalanceada(
  reagentes: readonly string[],
  produtos: readonly string[],
  coeficientes: readonly number[],
): boolean {
  const esquerda = contarAtomos(reagentes, coeficientes.slice(0, reagentes.length));
  const direita = contarAtomos(produtos, coeficientes.slice(reagentes.length));

  if (esquerda.size !== direita.size) {
    return false;
  }

  for (const [simbolo, quantidade] of esquerda) {
    if (direita.get(simbolo) !== quantidade) {
      return false;
    }
  }

  return true;
}

/**
 * O balanceamento, mostrado elemento por elemento.
 *
 * A contagem dos dois lados é a demonstração: ver `4 H` à esquerda e `4 H` à
 * direita é o que convence, e é o que o aluno tem de aprender a fazer sozinho
 * para conferir a própria resposta.
 */
export function balanceamentoComPassos(
  reagentes: readonly string[],
  produtos: readonly string[],
): Resolucao<readonly number[]> | undefined {
  const coeficientes = balancear(reagentes, produtos);

  if (coeficientes === undefined) {
    return undefined;
  }

  const semCoeficientes = equacaoQuimicaParaTex(reagentes, produtos);
  const comCoeficientes = equacaoQuimicaParaTex(reagentes, produtos, coeficientes);

  const esquerda = contarAtomos(reagentes, coeficientes.slice(0, reagentes.length));
  const direita = contarAtomos(produtos, coeficientes.slice(reagentes.length));

  const contagem = [...esquerda]
    .map(([simbolo, quantidade]) => `${simbolo}: ${quantidade} = ${direita.get(simbolo)}`)
    .join(' \\qquad ');

  return {
    resultado: coeficientes,
    passos: [
      {
        descricao: 'A reação rearranja átomos, não os cria nem os destrói.',
        tex: semCoeficientes,
        nota:
          'O que se ajusta são os COEFICIENTES, nunca os índices: mexer num índice troca a ' +
          'substância de que se está falando.',
      },
      {
        descricao: 'Cada elemento dá uma condição, e os coeficientes saem dela.',
        tex: comCoeficientes,
        nota: 'A solução é única a menos de escala, e a convenção é usar os menores inteiros.',
      },
      {
        descricao: 'Conferindo átomo por átomo, os dois lados fecham.',
        tex: contagem,
        nota: 'Esta contagem é a prova, e é ela que se faz para conferir a própria resposta.',
      },
    ],
  };
}
