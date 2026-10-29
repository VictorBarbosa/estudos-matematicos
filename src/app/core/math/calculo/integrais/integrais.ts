import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos/tipos';
import { Polinomio, formatar } from '@core/math/algebra/polinomio/polinomio';

/**
 * Integrais.
 *
 * A integral definida é construída como ela foi historicamente: aproximando
 * a área por retângulos e refinando a partição. Só depois o Teorema
 * Fundamental mostra o atalho pela antiderivada.
 */

export type TipoSoma = 'esquerda' | 'direita' | 'ponto-medio' | 'trapezio';

export const NOME_SOMA: Readonly<Record<TipoSoma, string>> = {
  esquerda: 'Pela esquerda',
  direita: 'Pela direita',
  'ponto-medio': 'Ponto médio',
  trapezio: 'Trapézios',
};

export interface Retangulo {
  readonly x: number;
  readonly largura: number;
  readonly altura: number;
}

/** Os retângulos da aproximação, prontos para desenhar. */
export function retangulosDeRiemann(
  f: (x: number) => number,
  de: number,
  ate: number,
  n: number,
  tipo: TipoSoma = 'esquerda',
): readonly Retangulo[] {
  const largura = (ate - de) / n;

  return Array.from({ length: n }, (_, indice) => {
    const inicio = de + indice * largura;
    const amostra =
      tipo === 'esquerda'
        ? inicio
        : tipo === 'direita'
          ? inicio + largura
          : inicio + largura / 2;

    return { x: inicio, largura, altura: f(amostra) };
  });
}

/** Soma de Riemann: a área aproximada pelos retângulos. */
export function somaDeRiemann(
  f: (x: number) => number,
  de: number,
  ate: number,
  n: number,
  tipo: TipoSoma = 'esquerda',
): number {
  if (n < 1) {
    throw new ErroMatematico('A partição precisa de pelo menos um subintervalo.');
  }

  const largura = (ate - de) / n;

  if (tipo === 'trapezio') {
    let total = (f(de) + f(ate)) / 2;
    for (let i = 1; i < n; i++) {
      total += f(de + i * largura);
    }
    return total * largura;
  }

  return retangulosDeRiemann(f, de, ate, n, tipo).reduce(
    (total, retangulo) => total + retangulo.altura * retangulo.largura,
    0,
  );
}

/**
 * Integral numérica por Simpson, usada como valor de referência.
 *
 * Simpson aproxima a curva por parábolas em vez de retas, o que a torna
 * exata para polinômios até o terceiro grau.
 */
export function integralNumerica(
  f: (x: number) => number,
  de: number,
  ate: number,
  n = 1000,
): number {
  const pares = n % 2 === 0 ? n : n + 1;
  const h = (ate - de) / pares;

  let total = f(de) + f(ate);
  for (let i = 1; i < pares; i++) {
    total += f(de + i * h) * (i % 2 === 0 ? 2 : 4);
  }

  return (total * h) / 3;
}

/** Mostra a soma de Riemann convergindo conforme a partição se refina. */
export function riemannComPassos(
  f: (x: number) => number,
  de: number,
  ate: number,
  n: number,
  tipo: TipoSoma,
): Resolucao<number> {
  const resultado = somaDeRiemann(f, de, ate, n, tipo);
  const exata = integralNumerica(f, de, ate);
  const largura = (ate - de) / n;

  const refinamentos = [4, 16, 64, 256].map((quantidade) => ({
    quantidade,
    valor: somaDeRiemann(f, de, ate, quantidade, tipo),
  }));

  return {
    resultado,
    passos: [
      {
        descricao: 'Dividimos o intervalo em partes iguais.',
        tex: `\\Delta x = \\frac{${formatar(ate)} - ${formatar(de)}}{${n}} = ${formatar(largura)}`,
      },
      {
        descricao: 'Cada retângulo tem essa largura e altura dada pela função.',
        tex: `S = \\sum_{i=1}^{${n}} f(x_i)\\,\\Delta x = ${formatar(resultado)}`,
      },
      {
        descricao: 'Refinando a partição, a aproximação melhora.',
        tex: refinamentos
          .map((r) => `n = ${r.quantidade} \\to ${formatar(r.valor)}`)
          .join(' \\quad '),
      },
      {
        descricao: 'No limite, a soma converge para a área exata.',
        tex: `\\int_{${formatar(de)}}^{${formatar(ate)}} f(x)\\,dx = ${formatar(exata)}`,
        nota: `A diferença atual para o valor exato é ${formatar(Math.abs(resultado - exata))}.`,
      },
    ],
  };
}

/** Integra um polinômio pela regra da potência, com a constante explícita. */
export function integrarPolinomioComPassos(p: Polinomio): Resolucao<Polinomio> {
  const resultado = p.integrar(0);

  const termos = p.coeficientes
    .map((coeficiente, grau) => ({ coeficiente, grau }))
    .filter(({ coeficiente }) => coeficiente !== 0)
    .map(
      ({ coeficiente, grau }) =>
        `\\int ${formatar(coeficiente)}x^{${grau}}\\,dx = \\frac{${formatar(coeficiente)}}{${grau + 1}}x^{${grau + 1}}`,
    );

  return {
    resultado,
    passos: [
      { descricao: 'Partimos do integrando.', tex: `f(x) = ${p.paraTex()}` },
      {
        descricao: 'A regra da potência para integrais aumenta o expoente e divide por ele.',
        tex: '\\int x^{n}\\,dx = \\frac{x^{n+1}}{n+1} + C',
        nota: 'É a regra da derivada lida ao contrário.',
      },
      {
        descricao: 'Aplicamos termo a termo.',
        tex: termos.join(' \\qquad '),
      },
      {
        descricao: 'E somamos a constante de integração.',
        tex: `\\int f(x)\\,dx = ${resultado.paraTex()} + C`,
        nota:
          'A constante aparece porque infinitas funções têm a mesma derivada — elas diferem ' +
          'apenas por um deslocamento vertical.',
      },
    ],
  };
}

/** Teorema Fundamental: a integral definida pela antiderivada nos extremos. */
export function teoremaFundamentalComPassos(
  p: Polinomio,
  de: number,
  ate: number,
): Resolucao<number> {
  const primitiva = p.integrar(0);
  const noFim = primitiva.avaliar(ate);
  const noInicio = primitiva.avaliar(de);
  const resultado = noFim - noInicio;

  return {
    resultado,
    passos: [
      {
        descricao: 'Encontramos uma antiderivada do integrando.',
        tex: `F(x) = ${primitiva.paraTex()}`,
      },
      {
        descricao: 'O Teorema Fundamental diz que a integral é a variação de F nos extremos.',
        tex: `\\int_{${formatar(de)}}^{${formatar(ate)}} f(x)\\,dx = F(${formatar(ate)}) - F(${formatar(de)})`,
      },
      {
        descricao: 'Avaliando nos dois pontos.',
        tex: `= ${formatar(noFim)} - (${formatar(noInicio)}) = ${formatar(resultado)}`,
      },
      {
        descricao: 'A constante de integração não interfere: ela se cancela na subtração.',
        tex: '(F(b) + C) - (F(a) + C) = F(b) - F(a)',
        nota: 'Por isso não é preciso escrever o C nas integrais definidas.',
      },
    ],
  };
}

/** Área entre duas curvas no intervalo dado. */
export function areaEntreCurvas(
  superior: (x: number) => number,
  inferior: (x: number) => number,
  de: number,
  ate: number,
): number {
  return integralNumerica((x) => superior(x) - inferior(x), de, ate);
}
