import { Passo } from '@core/math/tipos/tipos';
import { Rng } from '@core/treino/rng/rng';
import { numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Armadilha, Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

/**
 * Método de Newton-Raphson: x₁ = x₀ − f(x₀)/f′(x₀).
 *
 * A avaliação de 09/11 o listou entre as ausências de Cálculo 4. É a tangente
 * usada ao contrário: em vez de aproximar a função perto de um ponto, ela
 * aponta onde a função provavelmente zera. Os erros típicos são o sinal da
 * correção, a fração de cabeça para baixo e parar antes da iteração pedida.
 */

const { saoEquivalentes, formatar } = numeroComCasas(5);
const PEDIDO = 'Responda com 5 casas decimais.';
const tex = (v: number): string =>
  Number.isInteger(v) ? String(v) : formatar(v).replace(',', '{,}');
const par = (v: number): string => (v < 0 ? `(${tex(v)})` : tex(v));

interface Funcao {
  readonly f: (x: number) => number;
  readonly df: (x: number) => number;
  readonly fTex: string;
  readonly dfTex: string;
  /** f(x₀) escrito com o número no lugar de x, para o passo da substituição. */
  readonly substituir: (x: number) => string;
}

function quadrado(a: number): Funcao {
  return {
    f: (x) => x * x - a,
    df: (x) => 2 * x,
    fTex: `x^{2} - ${a}`,
    dfTex: '2x',
    substituir: (x) => `${par(x)}^{2} - ${a}`,
  };
}

function cubica(p: number, q: number): Funcao {
  const termo = (v: number, corpo: string): string =>
    v === 0 ? '' : ` ${v < 0 ? '-' : '+'} ${Math.abs(v) === 1 && corpo ? '' : Math.abs(v)}${corpo}`;
  return {
    f: (x) => x ** 3 + p * x + q,
    df: (x) => 3 * x * x + p,
    fTex: `x^{3}${termo(p, 'x')}${termo(q, '')}`,
    dfTex: `3x^{2}${termo(p, '')}`,
    substituir: (x) =>
      `${par(x)}^{3}${p === 0 ? '' : ` ${p < 0 ? '-' : '+'} ${Math.abs(p)} \\cdot ${par(x)}`}${termo(q, '')}`,
  };
}

function exponencial(a: number): Funcao {
  return {
    f: (x) => Math.exp(x) - a,
    df: (x) => Math.exp(x),
    fTex: `e^{x} - ${a}`,
    dfTex: 'e^{x}',
    substituir: (x) => `e^{${tex(x)}} - ${a}`,
  };
}

/** Os passos de uma iteração, com os números de f(xₙ) e f′(xₙ) à vista. */
function iteracao(fn: Funcao, x: number, n: number): { passos: Passo[]; proximo: number } {
  const fx = fn.f(x);
  const dfx = fn.df(x);
  const proximo = x - fx / dfx;
  return {
    passos: [
      {
        descricao: `Calculamos f e f′ em x${indice(n)} = ${formatarTexto(x)}.`,
        tex: `f(${tex(x)}) = ${fn.substituir(x)} = ${tex(fx)} \\qquad f'(${tex(x)}) = ${tex(dfx)}`,
      },
      {
        descricao: 'Aplicamos a fórmula: o ponto atual menos f sobre f′.',
        tex: `x_{${n + 1}} = ${tex(x)} - \\frac{${tex(fx)}}{${tex(dfx)}} = ${tex(proximo)}`,
      },
    ],
    proximo,
  };
}

const indice = (n: number): string => '₀₁₂₃'[n] ?? String(n);
const formatarTexto = (v: number): string => tex(v).replace('{,}', ',');

/**
 * - Fácil: x² − a a partir de um inteiro, uma iteração.
 * - Médio: uma cúbica, uma iteração.
 * - Difícil: eˣ − a, uma iteração (a derivada é a própria função).
 * - Extremo: duas iterações, pedindo x₂.
 */
export function exercicioNewton(nivel: Nivel, rng: Rng): Exercicio<number> {
  let fn: Funcao;
  let x0: number;

  if (nivel === 'facil') {
    const a = rng.escolher([2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15, 17]);
    fn = quadrado(a);
    x0 = Math.round(Math.sqrt(a)) || 1;
  } else if (nivel === 'dificil') {
    const a = rng.inteiro(2, 9);
    fn = exponencial(a);
    x0 = rng.inteiro(1, 2);
  } else {
    let p: number, q: number;
    do {
      p = rng.inteiro(-4, 4);
      q = rng.inteiro(-6, 6);
      x0 = rng.inteiro(1, 3) * rng.sinal();
    } while (3 * x0 * x0 + p === 0 || q === 0);
    fn = cubica(p, q);
  }

  const iteracoes = nivel === 'extremo' ? 2 : 1;
  const primeira = iteracao(fn, x0, 0);
  const segunda = iteracoes === 2 ? iteracao(fn, primeira.proximo, 1) : null;
  const gabarito = segunda ? segunda.proximo : primeira.proximo;

  const fx0 = fn.f(x0);
  const dfx0 = fn.df(x0);
  const armadilhas: Armadilha<number>[] = [
    {
      resposta: x0 + fx0 / dfx0,
      diagnostico: 'O sinal da correção saiu trocado: a fórmula SUBTRAI f/f′ do ponto atual.',
      passo: 2,
      conceito: 'numerico.newton',
    },
    {
      resposta: x0 - dfx0 / fx0,
      diagnostico:
        'A fração saiu de cabeça para baixo: é f sobre f′, a altura dividida pela inclinação.',
      passo: 2,
      conceito: 'numerico.newton',
    },
    {
      resposta: fx0 / dfx0,
      diagnostico: 'Essa é só a correção f/f′. O novo ponto é o anterior MENOS ela.',
      passo: 2,
      conceito: 'numerico.newton',
    },
  ];
  if (segunda) {
    armadilhas.push({
      resposta: primeira.proximo,
      diagnostico: 'Esse é x₁. O pedido é x₂: repita a fórmula partindo de x₁.',
      passo: 2,
      conceito: 'numerico.newton',
    });
  }

  return {
    id: `newton-${nivel}-${fn.fTex.replace(/\W/g, '')}-${x0}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Use o método de Newton-Raphson partindo de x₀ = ${x0} e informe ` +
      `${segunda ? 'x₂ (duas iterações)' : 'x₁ (uma iteração)'}. ${PEDIDO}`,
    enunciadoTex: `f(x) = ${fn.fTex} \\qquad x_{n+1} = x_{n} - \\frac{f(x_{n})}{f'(x_{n})}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A derivada, que dá a inclinação da tangente.',
          tex: `f'(x) = ${fn.dfTex}`,
          nota: 'A tangente em xₙ corta o eixo x em xₙ₊₁ — por isso a fórmula.',
        },
        ...primeira.passos,
        ...(segunda ? segunda.passos : []),
      ],
    },
    conceitos: ['numerico.newton'],
    armadilhas: semColisoes(
      armadilhas.filter((a) => Number.isFinite(a.resposta)),
      gabarito,
      saoEquivalentes,
    ),
    dica:
      nivel === 'facil'
        ? 'x₁ = x₀ − f(x₀)/f′(x₀). Calcule f e f′ no ponto de partida e substitua.'
        : nivel === 'dificil'
          ? 'A derivada de eˣ − a é eˣ. Use e elevado a x₀ com várias casas antes de arredondar.'
          : nivel === 'extremo'
            ? 'Faça a primeira iteração, guarde x₁ com todas as casas e repita a fórmula a partir dele.'
            : undefined,
  };
}
