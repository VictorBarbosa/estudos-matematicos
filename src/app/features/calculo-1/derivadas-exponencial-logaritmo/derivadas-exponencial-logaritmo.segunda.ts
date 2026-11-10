import { Rng } from '@core/treino/rng/rng';
import { numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const { saoEquivalentes, formatar } = numeroComCasas(3);
const dec = (v: number): string => formatar(v).replace(',', '{,}');
const par = (v: number): string => (v < 0 ? `(${v})` : `${v}`);

/** `a·e^{kx}` em LaTeX, sem «1» nem «1x». */
const expTex = (a: number, k: number): string =>
  `${a === 1 ? '' : a}e^{${k === 1 ? '' : k === -1 ? '-' : k}x}`;

/**
 * A derivada segunda de a·e^(kx) ou de a·ln x num ponto.
 *
 * A exponencial devolve a si mesma com k² na frente; o logaritmo vira 1/x e
 * depois −1/x², com o sinal que quase todo mundo esquece.
 */
export function exercicioSegundaExpLog(nivel: Nivel, rng: Rng): Exercicio<number> {
  const exponencial = nivel === 'facil' || rng.booleano();
  const a = rng.inteiro(1, 5);

  if (exponencial) {
    const k = nivel === 'facil' ? rng.inteiro(1, 2) : rng.escolher([2, 3, -1, -2]);
    const x0 = rng.escolher([0, 1, -1]);
    const gabarito = a * k * k * Math.exp(k * x0);
    const primeira = a * k * Math.exp(k * x0);
    return {
      id: `explog-segunda-exp-${a}${k}-${x0}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Calcule a derivada SEGUNDA f''(${x0}). Responda com 3 casas decimais.`,
      enunciadoTex: `f(x) = ${expTex(a, k)}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: `Cada derivada de e^(${k}x) devolve e^(${k}x) com um fator ${k} da cadeia.`,
            tex: `f'(x) = ${a * k}e^{${k}x} \\qquad f''(x) = ${a * k * k}e^{${k}x}`,
          },
          {
            descricao: `Em x = ${x0}.`,
            tex: `f''(${x0}) = ${a * k * k} \\cdot e^{${k * x0}} = ${dec(gabarito)}`,
          },
        ],
      },
      conceitos: ['exp-log.exponencial'],
      armadilhas: semColisoes(
        [
          {
            resposta: primeira,
            diagnostico: 'Essa é a derivada PRIMEIRA. Derive mais uma vez: sai outro fator k.',
            passo: 0,
            conceito: 'exp-log.exponencial',
          },
          ...(k !== 1 && k !== -1
            ? [
                {
                  resposta: a * Math.exp(k * x0),
                  diagnostico: `Faltou o fator da cadeia: cada derivada multiplica por ${k}, e duas por ${k}² = ${k * k}.`,
                  passo: 0,
                  conceito: 'exp-log.exponencial',
                },
              ]
            : []),
        ],
        gabarito,
        saoEquivalentes,
      ),
      dica: `Derive duas vezes: cada derivada de e^(${k}x) multiplica por ${k}. Ao todo, ${k}² = ${k * k}.`,
    };
  }

  const x0 = rng.inteiro(1, 5);
  const gabarito = -a / (x0 * x0);
  return {
    id: `explog-segunda-ln-${a}-${x0}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Calcule a derivada SEGUNDA f''(${x0}). Responda com 3 casas decimais ou como fração.`,
    enunciadoTex: `f(x) = ${a === 1 ? '' : a}\\ln x`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A primeira derivada é a/x; escrita como potência, a·x⁻¹.',
          tex: `f'(x) = \\frac{${a}}{x} = ${a}x^{-1}`,
        },
        {
          descricao: 'A regra da potência com expoente −1 traz o sinal de menos.',
          tex: `f''(x) = -${a}x^{-2} = -\\frac{${a}}{x^{2}}`,
        },
        {
          descricao: `Em x = ${x0}.`,
          tex: `f''(${x0}) = -\\frac{${a}}{${x0 * x0}} = ${dec(gabarito)}`,
        },
      ],
    },
    conceitos: ['exp-log.logaritmo'],
    armadilhas: semColisoes(
      [
        {
          resposta: -gabarito,
          diagnostico: 'A derivada de 1/x é −1/x²: o expoente −1 desce e traz o sinal de menos.',
          passo: 1,
          conceito: 'exp-log.logaritmo',
        },
        {
          resposta: a / x0,
          diagnostico: 'Essa é a derivada PRIMEIRA, a/x. Falta derivar mais uma vez.',
          passo: 0,
          conceito: 'exp-log.logaritmo',
        },
      ],
      gabarito,
      saoEquivalentes,
    ),
    dica: 'A derivada de ln x é 1/x = x⁻¹. Derive de novo pela regra da potência: o expoente −1 desce.',
  };
}

/** Onde a tangente a a·e^(kx) ou a a·ln x num ponto corta o eixo y. */
export function exercicioRetaTangenteExpLog(nivel: Nivel, rng: Rng): Exercicio<number> {
  const exponencial = rng.booleano();
  const a = rng.inteiro(1, 5);
  const k = rng.escolher([1, 2, -1]);
  const x0 = exponencial ? rng.escolher([1, 2, -1]) : rng.inteiro(2, 6);
  const f0 = exponencial ? a * Math.exp(k * x0) : a * Math.log(x0);
  const m = exponencial ? a * k * Math.exp(k * x0) : a / x0;
  const gabarito = f0 - m * x0;
  const fTex = exponencial ? expTex(a, k) : `${a === 1 ? '' : a}\\ln x`;

  return {
    id: `explog-reta-${exponencial ? 'e' : 'l'}-${a}${k}-${x0}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Encontre a reta tangente ao gráfico em x = ${x0} e informe onde ela corta o eixo y. ` +
      '(3 casas decimais)',
    enunciadoTex: `f(x) = ${fTex}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'O ponto de tangência.',
          tex: `f(${x0}) = ${exponencial ? `${a}e^{${k * x0}}` : `${a}\\ln ${x0}`} = ${dec(f0)}`,
        },
        {
          descricao: 'A inclinação é a derivada no ponto.',
          tex: exponencial
            ? `f'(x) = ${a * k}e^{${k}x} \\;\\Rightarrow\\; m = ${a * k}e^{${k * x0}} = ${dec(m)}`
            : `f'(x) = \\frac{${a}}{x} \\;\\Rightarrow\\; m = \\frac{${a}}{${x0}} = ${dec(m)}`,
        },
        {
          descricao: 'A reta y = f(x₀) + m(x − x₀) corta o eixo y em x = 0.',
          tex: `y(0) = ${dec(f0)} - ${m < 0 ? `(${dec(m)})` : dec(m)} \\cdot ${par(x0)} = ${dec(gabarito)}`,
        },
      ],
    },
    conceitos: [exponencial ? 'exp-log.exponencial' : 'exp-log.logaritmo'],
    armadilhas: semColisoes(
      [
        {
          resposta: f0,
          diagnostico: 'Esse é o valor da função no ponto. A reta só corta o eixo y ali se x₀ = 0.',
          passo: 2,
          conceito: exponencial ? 'exp-log.exponencial' : 'exp-log.logaritmo',
        },
        {
          resposta: f0 + m * x0,
          diagnostico: 'O sinal ficou trocado: em x = 0, y = f(x₀) − m·x₀.',
          passo: 2,
          conceito: exponencial ? 'exp-log.exponencial' : 'exp-log.logaritmo',
        },
        {
          resposta: m,
          diagnostico:
            'Essa é a inclinação m. Falta montar a reta e achar onde ela corta o eixo y.',
          passo: 1,
          conceito: exponencial ? 'exp-log.exponencial' : 'exp-log.logaritmo',
        },
      ],
      gabarito,
      saoEquivalentes,
    ),
    dica: `A reta passa por (${x0}, f(${x0})) com inclinação f′(${x0}). Em x = 0: y = f(${x0}) − f′(${x0})·${par(x0)}.`,
  };
}
