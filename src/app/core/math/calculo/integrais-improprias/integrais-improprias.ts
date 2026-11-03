import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { formatar, formatarEmTexto } from '@core/math/algebra/polinomio/polinomio';

/**
 * Integrais impróprias.
 *
 * São as integrais que o Teorema Fundamental não alcança direto: ou o
 * intervalo não termina, ou o integrando explode dentro dele. A saída é a
 * mesma nos dois casos — trocar a borda problemática por um limite — e a
 * pergunta deixa de ser "quanto vale" para ser "existe?".
 *
 * O resultado disso é o critério da potência, que é o que se usa de verdade:
 * no infinito, `1/xᵖ` converge quando p passa de 1; na origem, converge quando
 * p fica abaixo de 1. O expoente 1 é a fronteira e diverge dos dois lados — é
 * o logaritmo, que cresce devagar demais para convergir e depressa demais para
 * ser integrável na origem.
 */

/** Um expoente racional `num/den`, para que `1/√x` seja exato. */
export interface ExpoenteRacional {
  readonly num: number;
  readonly den: number;
}

/** O veredito de uma integral imprópria. */
export interface ValorImproprio {
  readonly converge: boolean;
  /** O valor, quando ela converge. Sem significado quando diverge. */
  readonly valor: number;
}

export const DIVERGE: ValorImproprio = { converge: false, valor: Number.NaN };

export function converge(valor: number): ValorImproprio {
  return { converge: true, valor };
}

export function expoenteValor({ num, den }: ExpoenteRacional): number {
  return num / den;
}

/** `\frac{1}{2}` ou `3`, conforme o expoente seja fracionário ou inteiro. */
export function expoenteTex({ num, den }: ExpoenteRacional): string {
  return den === 1 ? `${num}` : `\\frac{${num}}{${den}}`;
}

/** O mesmo expoente numa frase: `1/2`, sem LaTeX. */
export function expoenteTexto({ num, den }: ExpoenteRacional): string {
  return den === 1 ? `${num}` : `${num}/${den}`;
}

/** `\frac{1}{x^{2}}`, ou `\frac{1}{\sqrt{x}}` quando o expoente é meio. */
export function integrandoPotenciaTex(p: ExpoenteRacional): string {
  if (p.num === 1 && p.den === 2) {
    return '\\frac{1}{\\sqrt{x}}';
  }
  if (p.den === 1 && p.num === 1) {
    return '\\frac{1}{x}';
  }
  return `\\frac{1}{x^{${expoenteTex(p)}}}`;
}

/**
 * O critério da potência, que é o que o tópico ensina a aplicar de olho.
 *
 * No infinito o que importa é a cauda: `1/xᵖ` precisa cair rápido o bastante,
 * e isso quer dizer p maior que 1. Na origem é o contrário: perto de zero a
 * função explode, e só um expoente pequeno deixa a área finita.
 */
export function criterioDaPotencia(
  p: ExpoenteRacional,
  naOrigem: boolean,
): { readonly converge: boolean; readonly motivo: string } {
  const valor = expoenteValor(p);

  if (naOrigem) {
    return {
      converge: valor < 1,
      motivo:
        valor < 1
          ? `Na origem converge porque o expoente ${expoenteTexto(p)} é menor que 1.`
          : `Na origem diverge porque o expoente ${expoenteTexto(p)} não é menor que 1.`,
    };
  }

  return {
    converge: valor > 1,
    motivo:
      valor > 1
        ? `No infinito converge porque o expoente ${expoenteTexto(p)} é maior que 1.`
        : `No infinito diverge porque o expoente ${expoenteTexto(p)} não passa de 1.`,
  };
}

/**
 * `∫ₐ^∞ dx/xᵖ`, com a resolução pelo limite.
 *
 * Converge quando p passa de 1, e aí vale `a^{1−p}/(p−1)`.
 */
export function potenciaNoInfinitoComPassos(
  a: number,
  p: ExpoenteRacional,
): Resolucao<ValorImproprio> {
  const expoente = expoenteValor(p);
  const criterio = criterioDaPotencia(p, false);
  const resultado = criterio.converge
    ? converge(a ** (1 - expoente) / (expoente - 1))
    : DIVERGE;

  const integral = `\\int_{${formatar(a)}}^{\\infty} ${integrandoPotenciaTex(p)}\\,dx`;

  const passos: Passo[] = [
    {
      descricao: 'O intervalo não termina, então trocamos a borda infinita por um limite.',
      tex: `${integral} = \\lim_{t \\to \\infty} \\int_{${formatar(a)}}^{t} ${integrandoPotenciaTex(p)}\\,dx`,
      nota: 'Até aqui nada se decidiu: a integral de dentro é comum, e tem limites finitos.',
    },
    {
      descricao: 'Integramos a potência pela regra de sempre.',
      tex: primitivaPotenciaTex(p),
    },
    {
      descricao: `Avaliamos entre ${formatarEmTexto(a)} e t.`,
      tex: avaliacaoNoInfinitoTex(a, p),
    },
    criterio.converge
      ? {
          descricao: 'Com o expoente acima de 1, o termo em t tende a zero e sobra um número.',
          tex: `${integral} = ${formatar(Number(resultado.valor.toFixed(6)))}`,
          nota: criterio.motivo,
        }
      : {
          descricao: 'Com o expoente até 1, o termo em t cresce sem parar.',
          tex: `${integral} = \\infty`,
          nota: criterio.motivo,
        },
  ];

  return { resultado, passos };
}

/**
 * `∫₀^b dx/xᵖ`, em que o integrando explode na borda de baixo.
 *
 * Converge quando p fica abaixo de 1, e aí vale `b^{1−p}/(1−p)`.
 */
export function potenciaNaOrigemComPassos(
  b: number,
  p: ExpoenteRacional,
): Resolucao<ValorImproprio> {
  const expoente = expoenteValor(p);
  const criterio = criterioDaPotencia(p, true);
  const resultado = criterio.converge
    ? converge(b ** (1 - expoente) / (1 - expoente))
    : DIVERGE;

  const integral = `\\int_{0}^{${formatar(b)}} ${integrandoPotenciaTex(p)}\\,dx`;

  const passos: Passo[] = [
    {
      descricao: 'O integrando explode em zero, então afastamos a borda com um limite.',
      tex: `${integral} = \\lim_{\\varepsilon \\to 0^{+}} \\int_{\\varepsilon}^{${formatar(b)}} ${integrandoPotenciaTex(p)}\\,dx`,
      nota: 'A borda ruim é a de baixo: o zero não pertence ao domínio do integrando.',
    },
    {
      descricao: 'A primitiva é a mesma de qualquer potência.',
      tex: primitivaPotenciaTex(p),
    },
    {
      descricao: `Avaliamos entre épsilon e ${formatarEmTexto(b)}.`,
      tex: avaliacaoNaOrigemTex(b, p),
    },
    criterio.converge
      ? {
          descricao: 'Com o expoente abaixo de 1, o termo em épsilon some e a área é finita.',
          tex: `${integral} = ${formatar(Number(resultado.valor.toFixed(6)))}`,
          nota: criterio.motivo,
        }
      : {
          descricao: 'Com o expoente a partir de 1, o termo em épsilon cresce sem parar.',
          tex: `${integral} = \\infty`,
          nota: criterio.motivo,
        },
  ];

  return { resultado, passos };
}

/**
 * `∫ₐ^∞ e^{−kx} dx`, que converge para todo k positivo.
 *
 * É o caso que aparece em decaimento e em vida média: por mais devagar que a
 * exponencial caia, a área acumulada é sempre finita.
 */
export function exponencialNoInfinitoComPassos(a: number, k: number): Resolucao<ValorImproprio> {
  const valor = Math.exp(-k * a) / k;
  const integral = `\\int_{${formatar(a)}}^{\\infty} e^{-${formatar(k)}x}\\,dx`;

  const passos: Passo[] = [
    {
      descricao: 'Trocamos a borda infinita por um limite.',
      tex: `${integral} = \\lim_{t \\to \\infty} \\int_{${formatar(a)}}^{t} e^{-${formatar(k)}x}\\,dx`,
    },
    {
      descricao: 'A primitiva da exponencial é ela mesma, dividida pelo fator do expoente.',
      tex: `\\int e^{-${formatar(k)}x}\\,dx = -\\frac{1}{${formatar(k)}}e^{-${formatar(k)}x} + C`,
    },
    {
      descricao: 'Avaliando, o termo em t tende a zero porque a exponencial negativa desaba.',
      tex:
        `\\left[-\\frac{1}{${formatar(k)}}e^{-${formatar(k)}x}\\right]_{${formatar(a)}}^{t} ` +
        `\\xrightarrow{t \\to \\infty} \\frac{e^{-${formatar(k * a)}}}{${formatar(k)}}`,
      nota: 'A exponencial vence qualquer potência: por isso este caso converge sempre.',
    },
    {
      descricao: 'E sobra um número.',
      tex: `${integral} = ${formatar(Number(valor.toFixed(6)))}`,
    },
  ];

  return { resultado: converge(valor), passos };
}

/**
 * `∫ₐ^∞ dx/(1 + x²)`, que é arco-tangente e converge sempre.
 *
 * Aqui o expoente efetivo é 2, e a cauda cai rápido o bastante — mas o valor
 * só aparece porque a primitiva é um arco, não uma potência.
 */
export function arcotangenteNoInfinitoComPassos(a: number): Resolucao<ValorImproprio> {
  const valor = Math.PI / 2 - Math.atan(a);
  const integral = `\\int_{${formatar(a)}}^{\\infty} \\frac{dx}{1 + x^{2}}`;

  const passos: Passo[] = [
    {
      descricao: 'Trocamos a borda infinita por um limite.',
      tex: `${integral} = \\lim_{t \\to \\infty} \\int_{${formatar(a)}}^{t} \\frac{dx}{1 + x^{2}}`,
    },
    {
      descricao: 'A primitiva é o arco-tangente.',
      tex: '\\int \\frac{dx}{1 + x^{2}} = \\arctan x + C',
    },
    {
      descricao: 'O arco-tangente tem assíntota horizontal, e é por isso que o limite existe.',
      tex: `\\lim_{t \\to \\infty} \\arctan t = \\frac{\\pi}{2}`,
      nota: 'Uma função limitada na ponta é o que garante a convergência aqui.',
    },
    {
      descricao: `Subtraindo o valor em ${formatarEmTexto(a)}.`,
      tex: `${integral} = \\frac{\\pi}{2} - \\arctan ${formatar(a)} = ${formatar(Number(valor.toFixed(6)))}`,
    },
  ];

  return { resultado: converge(valor), passos };
}

/**
 * A comparação, que decide convergência sem calcular nada.
 *
 * É o instrumento que o engenheiro usa: quando o integrando não tem primitiva
 * elementar, ainda assim dá para saber se a integral existe, comparando com
 * uma potência conhecida.
 */
export function comparacaoComPassos(
  descricaoDoIntegrando: string,
  texDoIntegrando: string,
  a: number,
  p: ExpoenteRacional,
  menorQueAPotencia: boolean,
): Resolucao<boolean> {
  const criterio = criterioDaPotencia(p, false);
  const convergeMesmo = menorQueAPotencia && criterio.converge;

  const passos: Passo[] = [
    {
      descricao: `O integrando não tem primitiva elementar, então comparamos com uma potência.`,
      tex: `\\int_{${formatar(a)}}^{\\infty} ${texDoIntegrando}\\,dx`,
      nota: descricaoDoIntegrando,
    },
    {
      descricao: menorQueAPotencia
        ? 'Para x grande, o integrando fica abaixo da potência de comparação.'
        : 'Para x grande, o integrando fica acima da potência de comparação.',
      tex: menorQueAPotencia
        ? `${texDoIntegrando} \\leq ${integrandoPotenciaTex(p)}`
        : `${texDoIntegrando} \\geq ${integrandoPotenciaTex(p)}`,
    },
    {
      descricao: 'E a potência de comparação já sabemos decidir.',
      tex: `\\int_{${formatar(a)}}^{\\infty} ${integrandoPotenciaTex(p)}\\,dx \\; ${criterio.converge ? '\\text{converge}' : '\\text{diverge}'}`,
      nota: criterio.motivo,
    },
    {
      descricao: convergeMesmo
        ? 'Menor que algo que converge também converge.'
        : 'A comparação não garante um número, só o veredito.',
      tex: convergeMesmo ? '\\text{converge}' : '\\text{diverge}',
      nota: convergeMesmo
        ? 'A comparação dá o veredito, não o valor — e é justamente isso que se quer.'
        : 'Maior que algo que diverge também diverge.',
    },
  ];

  return { resultado: convergeMesmo, passos };
}

/** A primitiva de `x^{-p}`, com o caso p = 1 destacado. */
function primitivaPotenciaTex(p: ExpoenteRacional): string {
  if (expoenteValor(p) === 1) {
    return '\\int \\frac{dx}{x} = \\ln|x| + C';
  }
  const novoExpoente = `1 - ${expoenteTex(p)}`;
  return `\\int x^{-${expoenteTex(p)}}\\,dx = \\frac{x^{${novoExpoente}}}{${novoExpoente}} + C`;
}

function avaliacaoNoInfinitoTex(a: number, p: ExpoenteRacional): string {
  if (expoenteValor(p) === 1) {
    return `\\left[\\ln x\\right]_{${formatar(a)}}^{t} = \\ln t - \\ln ${formatar(a)} \\xrightarrow{t \\to \\infty} \\infty`;
  }
  const e = 1 - expoenteValor(p);
  return (
    `\\left[\\frac{x^{${formatar(e)}}}{${formatar(e)}}\\right]_{${formatar(a)}}^{t} = ` +
    `\\frac{t^{${formatar(e)}} - ${formatar(a)}^{${formatar(e)}}}{${formatar(e)}}`
  );
}

function avaliacaoNaOrigemTex(b: number, p: ExpoenteRacional): string {
  if (expoenteValor(p) === 1) {
    return `\\left[\\ln x\\right]_{\\varepsilon}^{${formatar(b)}} = \\ln ${formatar(b)} - \\ln\\varepsilon \\xrightarrow{\\varepsilon \\to 0^{+}} \\infty`;
  }
  const e = 1 - expoenteValor(p);
  return (
    `\\left[\\frac{x^{${formatar(e)}}}{${formatar(e)}}\\right]_{\\varepsilon}^{${formatar(b)}} = ` +
    `\\frac{${formatar(b)}^{${formatar(e)}} - \\varepsilon^{${formatar(e)}}}{${formatar(e)}}`
  );
}
