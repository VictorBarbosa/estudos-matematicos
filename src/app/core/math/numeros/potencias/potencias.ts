import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos/tipos';
import { fatorar } from '@core/math/numeros/inteiros/inteiros';

/**
 * Potenciação e radiciação.
 *
 * Todas as propriedades são demonstradas voltando à definição — potência é
 * multiplicação repetida —, porque decorar as regras sem isso leva ao erro
 * clássico de somar as bases em vez dos expoentes.
 */

export interface Potencia {
  readonly base: number;
  readonly expoente: number;
}

export function potenciaParaTex({ base, expoente }: Potencia): string {
  const corpo = base < 0 ? `(${base})` : `${base}`;
  return expoente === 1 ? corpo : `${corpo}^{${expoente}}`;
}

export function avaliarPotencia({ base, expoente }: Potencia): number {
  return base ** expoente;
}

/** Repetição explícita da base, que é a definição por trás de toda propriedade. */
function expandir(base: number, expoente: number): string {
  if (expoente <= 0 || expoente > 6) {
    return potenciaParaTex({ base, expoente });
  }
  return Array.from({ length: expoente }, () => String(base)).join(' \\cdot ');
}

/** a^m · a^n = a^(m+n): as repetições simplesmente se juntam. */
export function produtoDePotenciasComPassos(
  base: number,
  m: number,
  n: number,
): Resolucao<Potencia> {
  const resultado: Potencia = { base, expoente: m + n };

  return {
    resultado,
    passos: [
      {
        descricao: 'Partimos do produto de duas potências de mesma base.',
        tex: `${potenciaParaTex({ base, expoente: m })} \\cdot ${potenciaParaTex({ base, expoente: n })}`,
      },
      {
        descricao:
          'Cada potência é a base repetida; juntando os dois grupos, continuamos multiplicando a mesma base.',
        tex: `\\underbrace{${expandir(base, m)}}_{${m}} \\cdot \\underbrace{${expandir(base, n)}}_{${n}}`,
        nota: 'A base nunca muda — o que se acumula é a quantidade de fatores.',
      },
      {
        descricao: 'Somando as quantidades de fatores, obtemos o novo expoente.',
        tex: `${potenciaParaTex(resultado)} = ${avaliarPotencia(resultado)}`,
      },
    ],
  };
}

/** a^m ÷ a^n = a^(m−n): cada fator de baixo cancela um de cima. */
export function quocienteDePotenciasComPassos(
  base: number,
  m: number,
  n: number,
): Resolucao<Potencia> {
  const resultado: Potencia = { base, expoente: m - n };

  const passos: Passo[] = [
    {
      descricao: 'Partimos do quociente de duas potências de mesma base.',
      tex: `\\frac{${potenciaParaTex({ base, expoente: m })}}{${potenciaParaTex({ base, expoente: n })}}`,
    },
    {
      descricao: 'Cada fator do denominador cancela um fator do numerador.',
      tex: `\\frac{\\overbrace{${expandir(base, m)}}^{${m}}}{\\underbrace{${expandir(base, n)}}_{${n}}}`,
    },
    {
      descricao: 'Sobram os fatores não cancelados: subtraímos os expoentes.',
      tex: `${potenciaParaTex(resultado)}`,
    },
  ];

  if (resultado.expoente === 0) {
    passos.push({
      descricao: 'Cancelou tudo, e o que sobra é 1 — é daí que vem a regra do expoente zero.',
      tex: `${base}^{0} = 1`,
      nota: 'Não é uma convenção arbitrária: é o que a divisão de uma potência por ela mesma exige.',
    });
  } else if (resultado.expoente < 0) {
    passos.push({
      descricao: 'Sobraram fatores no denominador, e o expoente negativo registra exatamente isso.',
      tex: `${base}^{${resultado.expoente}} = \\frac{1}{${potenciaParaTex({ base, expoente: -resultado.expoente })}} = \\frac{1}{${base ** -resultado.expoente}}`,
      nota: 'Expoente negativo não deixa o número negativo: ele o inverte.',
    });
  } else {
    passos.push({
      descricao: 'Calculamos o valor.',
      tex: `${potenciaParaTex(resultado)} = ${avaliarPotencia(resultado)}`,
    });
  }

  return { resultado, passos };
}

/** (a^m)^n = a^(m·n): são n grupos de m fatores. */
export function potenciaDePotenciaComPassos(
  base: number,
  m: number,
  n: number,
): Resolucao<Potencia> {
  const resultado: Potencia = { base, expoente: m * n };

  return {
    resultado,
    passos: [
      {
        descricao: 'Partimos de uma potência elevada a outro expoente.',
        tex: `\\left(${potenciaParaTex({ base, expoente: m })}\\right)^{${n}}`,
      },
      {
        descricao: `O expoente externo manda repetir a potência interna ${n} vezes.`,
        tex:
          Array.from({ length: Math.min(n, 4) }, () => potenciaParaTex({ base, expoente: m })).join(
            ' \\cdot ',
          ) + (n > 4 ? ' \\cdots' : ''),
      },
      {
        descricao: `São ${n} grupos de ${m} fatores, ou seja ${m} × ${n} fatores ao todo: os expoentes se multiplicam.`,
        tex: `${potenciaParaTex(resultado)} = ${avaliarPotencia(resultado)}`,
      },
    ],
  };
}

export interface RaizSimplificada {
  /** O que saiu da raiz. */
  readonly coeficiente: number;
  /** O que permaneceu sob o radical; 1 significa raiz exata. */
  readonly radicando: number;
  readonly indice: number;
}

export function raizParaTex({ coeficiente, radicando, indice }: RaizSimplificada): string {
  if (radicando === 1) {
    return String(coeficiente);
  }
  const radical = indice === 2 ? `\\sqrt{${radicando}}` : `\\sqrt[${indice}]{${radicando}}`;
  return coeficiente === 1 ? radical : `${coeficiente}${radical}`;
}

/**
 * Simplifica uma raiz extraindo os fatores com expoente suficiente.
 *
 * √72 = √(2³·3²) = 2·3·√2 = 6√2. A fatoração em primos é o que torna o
 * procedimento mecânico em vez de adivinhação.
 */
export function simplificarRaizComPassos(
  radicando: number,
  indice = 2,
): Resolucao<RaizSimplificada> {
  if (radicando < 0) {
    throw new ErroMatematico('Este tópico trata apenas de radicandos não negativos.');
  }
  if (indice < 2) {
    throw new ErroMatematico('O índice da raiz deve ser pelo menos 2.');
  }
  if (radicando === 0 || radicando === 1) {
    return {
      resultado: { coeficiente: radicando, radicando: 1, indice },
      passos: [
        { descricao: 'A raiz é imediata.', tex: `\\sqrt[${indice}]{${radicando}} = ${radicando}` },
      ],
    };
  }

  const fatores = fatorar(radicando);

  let coeficiente = 1;
  let dentro = 1;

  for (const { primo, expoente } of fatores) {
    coeficiente *= primo ** Math.floor(expoente / indice);
    dentro *= primo ** (expoente % indice);
  }

  const resultado: RaizSimplificada = { coeficiente, radicando: dentro, indice };

  const texFatorado = fatores
    .map(({ primo, expoente }) => (expoente === 1 ? `${primo}` : `${primo}^{${expoente}}`))
    .join(' \\cdot ');

  const passos: Passo[] = [
    {
      descricao: 'Fatoramos o radicando em primos.',
      tex: `\\sqrt[${indice}]{${radicando}} = \\sqrt[${indice}]{${texFatorado}}`,
    },
    {
      descricao: `Cada grupo de ${indice} fatores iguais sai da raiz como um único fator.`,
      tex: fatores
        .map(({ primo, expoente }) => {
          const saem = Math.floor(expoente / indice);
          const ficam = expoente % indice;
          return `${primo}^{${expoente}} \\to ${saem > 0 ? `${primo}^{${saem}}` : '1'} \\text{ fora}${ficam > 0 ? `,\\; ${primo}^{${ficam}} \\text{ dentro}` : ''}`;
        })
        .join(' \\quad '),
      nota: `A raiz de índice ${indice} desfaz exatamente um expoente ${indice}.`,
    },
    {
      descricao:
        dentro === 1
          ? 'Nada permanece sob o radical: a raiz era exata.'
          : 'O que sobra permanece sob o radical.',
      tex: `\\sqrt[${indice}]{${radicando}} = ${raizParaTex(resultado)}`,
    },
  ];

  return { resultado, passos };
}

/** Raiz como potência de expoente fracionário. */
export function raizComoPotenciaComPassos(
  radicando: number,
  indice: number,
  expoente = 1,
): Resolucao<string> {
  const tex = `${radicando}^{\\frac{${expoente}}{${indice}}}`;

  return {
    resultado: tex,
    passos: [
      {
        descricao: 'Toda raiz é uma potência de expoente fracionário.',
        tex: `\\sqrt[${indice}]{${radicando}^{${expoente}}} = ${tex}`,
      },
      {
        descricao: 'A razão é a propriedade da potência de potência.',
        tex: `\\left(${radicando}^{\\frac{${expoente}}{${indice}}}\\right)^{${indice}} = ${radicando}^{\\frac{${expoente}}{${indice}} \\cdot ${indice}} = ${radicando}^{${expoente}}`,
        nota: 'Elevar ao índice devolve o radicando, que é exatamente o que define a raiz.',
      },
    ],
  };
}
