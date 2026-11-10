import { Rng } from '@core/treino/rng/rng';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const exato = (a: number, b: number): boolean => Math.abs(a - b) < 1e-9;
type Lado = 'esquerda' | 'direita';

const xMenos = (a: number): string => `x ${a >= 0 ? '-' : '+'} ${Math.abs(a)}`;

/**
 * O lateral de k·|x − a|/(x − a) + c.
 *
 * O módulo vale x − a de um lado e −(x − a) do outro: a fração é +k pela
 * direita e −k pela esquerda. É o exemplo mínimo de laterais diferentes.
 */
export function exercicioLateralModulo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(-4, 5);
  const k = rng.inteiro(1, nivel === 'facil' ? 3 : 6);
  const c = rng.inteiro(-5, 5);
  const lado: Lado = rng.booleano() ? 'esquerda' : 'direita';
  const sinal = lado === 'direita' ? 1 : -1;
  const gabarito = c + sinal * k;
  const cTex = c === 0 ? '' : ` ${c > 0 ? '+' : '-'} ${Math.abs(c)}`;

  return {
    id: `laterais-modulo-${a}${k}${c}-${lado}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Calcule o limite pela ${lado} no ponto x = ${a}.`,
    enunciadoTex:
      `f(x) = \\frac{${k === 1 ? '' : k}|${xMenos(a)}|}{${xMenos(a)}}${cTex} \\qquad ` +
      `\\lim_{x \\to ${a}^{${sinal > 0 ? '+' : '-'}}} f(x) = \\;?`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            lado === 'direita'
              ? `Pela direita, x > ${a}: o que está dentro do módulo é positivo e o módulo não muda nada.`
              : `Pela esquerda, x < ${a}: o que está dentro do módulo é negativo e o módulo troca o sinal.`,
          tex: `|${xMenos(a)}| = ${sinal > 0 ? '' : '-'}(${xMenos(a)})`,
        },
        {
          descricao: 'A fração se simplifica num número.',
          tex: `\\frac{${k === 1 ? '' : k}|${xMenos(a)}|}{${xMenos(a)}} = ${sinal * k}`,
        },
        { descricao: 'Somando a constante.', tex: `${sinal * k}${cTex} = ${gabarito}` },
      ],
    },
    conceitos: ['laterais.definicao'],
    armadilhas: semColisoes(
      [
        {
          resposta: c - sinal * k,
          diagnostico: `Esse é o lateral do outro lado. Pela ${lado}, x − a é ${sinal > 0 ? 'positivo' : 'negativo'}, e o módulo ${sinal > 0 ? 'não muda' : 'troca'} o sinal.`,
          passo: 0,
          conceito: 'laterais.definicao',
        },
        {
          resposta: c,
          diagnostico: 'O termo do módulo não some: ele vale +k ou −k perto do ponto, nunca 0.',
          passo: 1,
          conceito: 'laterais.definicao',
        },
      ],
      gabarito,
      exato,
    ),
    dica: `Pela ${lado}, x − ${a} é ${sinal > 0 ? 'positivo' : 'negativo'}: o módulo de um número ${sinal > 0 ? 'positivo é ele mesmo' : 'negativo é o oposto dele'}.`,
  };
}

/**
 * O lateral de k/(x − a)ⁿ: +∞ ou −∞.
 *
 * O numerador fixa um sinal; o denominador tende a zero por um lado só. Com
 * expoente ímpar o sinal do denominador muda de um lado para o outro; com
 * expoente par, não.
 */
export function exercicioLateralInfinito(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(-4, 5);
  const k = rng.inteiro(1, 6) * (nivel === 'medio' ? 1 : rng.sinal());
  const n = nivel === 'medio' ? 1 : rng.escolher([1, 2, 3]);
  const lado: Lado = rng.booleano() ? 'esquerda' : 'direita';
  // Sinal de (x − a)ⁿ perto de a pelo lado escolhido.
  const sinalDen = lado === 'direita' || n % 2 === 0 ? 1 : -1;
  const positivo = Math.sign(k) * sinalDen > 0;
  const gabarito = positivo ? 1 : 2;
  const pot = n === 1 ? `(${xMenos(a)})` : `(${xMenos(a)})^{${n}}`;

  return {
    id: `laterais-infinito-${a}${k}${n}-${lado}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `O limite pela ${lado} em x = ${a} é infinito. Responda 1 se for +∞ ou 2 se for −∞.`,
    enunciadoTex: `\\lim_{x \\to ${a}^{${lado === 'direita' ? '+' : '-'}}} \\frac{${k}}{${pot}}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            `Pela ${lado}, x − ${a} é ${lado === 'direita' ? 'positivo' : 'negativo'} e pequeno` +
            (n === 1 ? '.' : `; elevado a ${n}, fica ${sinalDen > 0 ? 'positivo' : 'negativo'}.`),
          tex: `${pot} \\to 0^{${sinalDen > 0 ? '+' : '-'}}`,
        },
        {
          descricao: `Numerador ${k > 0 ? 'positivo' : 'negativo'} sobre um denominador ${sinalDen > 0 ? 'positivo' : 'negativo'} quase zero.`,
          tex: `\\frac{${k}}{0^{${sinalDen > 0 ? '+' : '-'}}} = ${positivo ? '+' : '-'}\\infty \\;\\Rightarrow\\; ${gabarito}`,
        },
      ],
    },
    conceitos: ['laterais.definicao'],
    armadilhas: semColisoes(
      [
        {
          resposta: positivo ? 2 : 1,
          diagnostico:
            n % 2 === 0
              ? `Com expoente par, (x − a)^${n} é positivo dos DOIS lados: o sinal vem só do numerador ${k}.`
              : `Confira o sinal: pela ${lado}, x − a é ${lado === 'direita' ? 'positivo' : 'negativo'}, e o numerador é ${k}.`,
          passo: 0,
          conceito: 'laterais.definicao',
        },
      ],
      gabarito,
      exato,
    ),
    dica: `Veja o sinal de cada parte: o numerador é ${k}; pela ${lado}, x − ${a} é ${lado === 'direita' ? 'positivo' : 'negativo'}${n % 2 === 0 ? ', mas elevado a expoente par fica positivo' : ''}.`,
  };
}
