import { Rng } from '@core/treino/rng/rng';
import { numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';
import { numeroEmTex } from '@core/math';

/**
 * As perguntas clássicas da equação do 2º grau além de «ache a raiz».
 *
 * Soma e produto sem resolver, o k que zera o discriminante, a biquadrada e
 * a soma dos quadrados das raízes: as que caem em prova justamente porque não
 * se resolvem aplicando Bhaskara no automático.
 */

const { saoEquivalentes: proximos } = numeroComCasas(2, 1e-4);

/** `ax² + bx + c` com os sinais certos; `variavel` permite x⁴/x² na biquadrada. */
function trinomioTex(a: number, b: number, c: number, quadrado = 'x^{2}', linear = 'x'): string {
  const termoA = a === 1 ? quadrado : a === -1 ? `-${quadrado}` : `${a}${quadrado}`;
  const termoB =
    b === 0 ? '' : ` ${b > 0 ? '+' : '-'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}${linear}`;
  const termoC = c === 0 ? '' : ` ${c > 0 ? '+' : '-'} ${Math.abs(c)}`;
  return `${termoA}${termoB}${termoC}`;
}

/** Soma ou produto das raízes, por Girard, sem resolver a equação. */
export function exercicioSomaProduto(nivel: Nivel, rng: Rng): Exercicio<number> {
  // Raízes racionais garantem Δ ≥ 0; o aluno não precisa achá-las.
  const a = nivel === 'facil' ? 1 : rng.escolher([1, 2, 3, -2]);
  const r1 = rng.inteiro(-6, 6);
  const r2 = rng.inteiro(-6, 6);
  const b = -a * (r1 + r2);
  const c = a * r1 * r2;
  const pedeSoma = rng.booleano();

  const soma = -b / a;
  const produto = c / a;
  const gabarito = pedeSoma ? soma : produto;
  const fracao = !Number.isInteger(gabarito);

  return {
    id: `equacao2-girard-${pedeSoma ? 's' : 'p'}-${a}${b}${c}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Sem resolver a equação, informe ${pedeSoma ? 'a SOMA' : 'o PRODUTO'} das raízes.` +
      (fracao ? ' Responda como fração.' : ''),
    enunciadoTex: `${trinomioTex(a, b, c)} = 0`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'As relações de Girard ligam as raízes aos coeficientes.',
          tex: 'x_1 + x_2 = -\\frac{b}{a} \\qquad x_1 \\cdot x_2 = \\frac{c}{a}',
        },
        {
          descricao: `Os coeficientes: a = ${a}, b = ${b}, c = ${c}.`,
          tex: `a = ${a},\\; b = ${b},\\; c = ${c}`,
        },
        pedeSoma
          ? {
              descricao: 'A soma é menos b sobre a.',
              tex: `x_1 + x_2 = -\\frac{${b}}{${a}} = ${numeroEmTex(soma)}`,
            }
          : {
              descricao: 'O produto é c sobre a.',
              tex: `x_1 \\cdot x_2 = \\frac{${c}}{${a}} = ${numeroEmTex(produto)}`,
            },
      ],
    },
    conceitos: ['equacao2.girard'],
    armadilhas: semColisoes(
      [
        {
          resposta: pedeSoma ? b / a : -c / a,
          diagnostico: pedeSoma
            ? 'O sinal saiu trocado: a soma é −b/a, com o MENOS na frente.'
            : 'O produto é c/a, sem sinal de menos — o menos fica só na soma.',
          passo: 2,
          conceito: 'equacao2.girard',
        },
        {
          resposta: pedeSoma ? produto : soma,
          diagnostico: pedeSoma
            ? 'Esse é o PRODUTO (c/a). A soma usa b: −b/a.'
            : 'Essa é a SOMA (−b/a). O produto usa c: c/a.',
          passo: 0,
          conceito: 'equacao2.girard',
        },
        ...(a !== 1
          ? [
              {
                resposta: pedeSoma ? -b : c,
                diagnostico: `Faltou dividir por a = ${a}. As relações só dão −b e c direto quando a = 1.`,
                passo: 2,
                conceito: 'equacao2.girard',
              },
            ]
          : []),
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'facil' ? 'Não precisa achar as raízes: soma = −b/a e produto = c/a.' : undefined,
  };
}

/** O valor de k para que a equação tenha raiz dupla (Δ = 0). */
export function exercicioRaizDupla(nivel: Nivel, rng: Rng): Exercicio<number> {
  // x² + bx + k = 0 com b par: Δ = b² − 4k = 0 ⟹ k = b²/4. No Difícil, o k fica no a.
  const noA = nivel !== 'medio' && rng.booleano();
  const b = rng.inteiro(1, 6) * 2 * rng.sinal();
  const c = rng.escolher([1, 2, 3, 4, 6, 8, 9]);

  if (noA) {
    // kx² + bx + c = 0: Δ = b² − 4kc = 0 ⟹ k = b²/(4c).
    const gabarito = (b * b) / (4 * c);
    return {
      id: `equacao2-kdupla-a-${b}${c}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        'Para que valor de k a equação tem uma raiz dupla (duas raízes iguais)?' +
        (Number.isInteger(gabarito) ? '' : ' Responda como fração.'),
      enunciadoTex: `kx^{2} ${b > 0 ? '+' : '-'} ${Math.abs(b)}x + ${c} = 0`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'Raiz dupla acontece exatamente quando o discriminante é zero.',
            tex: '\\Delta = b^{2} - 4ac = 0',
          },
          {
            descricao: `Aqui a = k, b = ${b} e c = ${c}.`,
            tex: `(${b})^{2} - 4 \\cdot k \\cdot ${c} = 0 \\;\\Rightarrow\\; ${b * b} - ${4 * c}k = 0`,
          },
          {
            descricao: 'Isolando k.',
            tex: `k = \\frac{${b * b}}{${4 * c}} = ${numeroEmTex(gabarito)}`,
            nota: 'k = 0 não serve: sem o x², a equação nem seria do 2º grau.',
          },
        ],
      },
      conceitos: ['equacao2.discriminante'],
      armadilhas: semColisoes(
        [
          {
            resposta: (b * b) / c,
            diagnostico: 'Faltou o 4 de 4ac: Δ = b² − 4·k·c.',
            passo: 1,
            conceito: 'equacao2.discriminante',
          },
          {
            resposta: Math.abs(b) / (2 * c),
            diagnostico: 'b precisa ir AO QUADRADO no discriminante: b² − 4ac.',
            passo: 1,
            conceito: 'equacao2.discriminante',
          },
        ],
        gabarito,
        proximos,
      ),
      dica:
        nivel === 'dificil' ? 'Raiz dupla ⟺ Δ = 0. Escreva b² − 4·k·c = 0 e isole k.' : undefined,
    };
  }

  const gabarito = (b * b) / 4;
  return {
    id: `equacao2-kdupla-c-${b}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Para que valor de k a equação tem uma raiz dupla (duas raízes iguais)?',
    enunciadoTex: `x^{2} ${b > 0 ? '+' : '-'} ${Math.abs(b)}x + k = 0`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Raiz dupla acontece exatamente quando o discriminante é zero.',
          tex: '\\Delta = b^{2} - 4ac = 0',
        },
        {
          descricao: `Aqui a = 1, b = ${b} e c = k.`,
          tex: `(${b})^{2} - 4 \\cdot 1 \\cdot k = 0 \\;\\Rightarrow\\; ${b * b} - 4k = 0`,
        },
        {
          descricao: 'Isolando k.',
          tex: `k = \\frac{${b * b}}{4} = ${gabarito}`,
          nota: `Conferindo: x² ${b > 0 ? '+' : '−'} ${Math.abs(b)}x + ${gabarito} = (x ${b > 0 ? '+' : '−'} ${Math.abs(b) / 2})², um quadrado perfeito.`,
        },
      ],
    },
    conceitos: ['equacao2.discriminante'],
    armadilhas: semColisoes(
      [
        {
          resposta: b * b,
          diagnostico: 'Faltou dividir por 4: Δ = b² − 4·1·k, então k = b²/4.',
          passo: 2,
          conceito: 'equacao2.discriminante',
        },
        {
          resposta: Math.abs(b) / 2,
          diagnostico: `Esse é o número dentro do quadrado, (x ${b > 0 ? '+' : '−'} ${Math.abs(b) / 2})². O k é ele AO QUADRADO.`,
          passo: 2,
          conceito: 'equacao2.discriminante',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: nivel === 'medio' ? 'Raiz dupla ⟺ Δ = 0. Escreva b² − 4·a·k = 0 e isole k.' : undefined,
  };
}

/**
 * Biquadrada: ax⁴ + bx² + c = 0, pela troca t = x².
 *
 * No Difícil pede a maior raiz; no Extremo, quantas raízes reais — e aí um
 * dos t sai negativo, e esse não dá raiz nenhuma.
 */
export function exercicioBiquadrada(nivel: Nivel, rng: Rng): Exercicio<number> {
  const contar = nivel === 'extremo';
  const quadrados = [1, 4, 9, 16, 25];
  const t1 = rng.escolher(quadrados);
  let t2 = rng.escolher(quadrados);
  while (t2 === t1) t2 = rng.escolher(quadrados);
  // No Extremo, às vezes um dos t é negativo: só um par de raízes.
  const t2Final = contar && rng.booleano(0.6) ? -t2 : t2;

  const b = -(t1 + t2Final);
  const c = t1 * t2Final;
  const positivos = [t1, t2Final].filter((t) => t > 0);
  const raizes = positivos.flatMap((t) => [Math.sqrt(t), -Math.sqrt(t)]);
  const gabarito = contar ? raizes.length : Math.max(...raizes);

  return {
    id: `equacao2-biq-${b}${c}-${contar ? 'n' : 'max'}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: contar
      ? 'Quantas raízes reais tem a equação biquadrada?'
      : 'Resolva a equação biquadrada e informe a MAIOR raiz real.',
    enunciadoTex: `${trinomioTex(1, b, c, 'x^{4}', 'x^{2}')} = 0`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Trocamos x² por t: a biquadrada vira uma equação do 2º grau em t.',
          tex: `t = x^{2} \\;\\Rightarrow\\; ${trinomioTex(1, b, c, 't^{2}', 't')} = 0`,
        },
        {
          descricao: 'Resolvemos em t (por soma e produto ou Bhaskara).',
          tex: `t_1 = ${t1} \\qquad t_2 = ${t2Final}`,
        },
        {
          descricao: 'Voltamos a x: x² = t só tem solução real quando t ≥ 0.',
          tex: [t1, t2Final]
            .map((t) =>
              t > 0
                ? `x^{2} = ${t} \\Rightarrow x = \\pm ${Math.sqrt(t)}`
                : `x^{2} = ${t} \\Rightarrow \\text{sem raiz real}`,
            )
            .join(' \\qquad '),
        },
        contar
          ? {
              descricao: 'Contamos as raízes reais.',
              tex: `${raizes.map((r) => numeroEmTex(r)).join(',\\; ')} \\;\\Rightarrow\\; ${gabarito} \\text{ raízes}`,
            }
          : {
              descricao: 'A maior delas.',
              tex: `x = ${gabarito}`,
            },
      ],
    },
    conceitos: ['equacao2.biquadrada'],
    armadilhas: semColisoes(
      contar
        ? [
            {
              resposta: 4,
              diagnostico: `x² = ${t2Final} não tem solução real: um quadrado nunca é negativo. Só t positivo dá raízes.`,
              passo: 2,
              conceito: 'equacao2.biquadrada',
            },
            {
              resposta: 2,
              diagnostico:
                'Cada t positivo dá DUAS raízes, x = +√t e x = −√t. Não esqueça a negativa.',
              passo: 2,
              conceito: 'equacao2.biquadrada',
            },
          ]
        : [
            {
              resposta: Math.max(t1, t2Final),
              diagnostico: `Esse é o valor de t = x². Falta voltar a x: x = √${Math.max(t1, t2Final)}.`,
              passo: 2,
              conceito: 'equacao2.biquadrada',
            },
          ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'dificil'
        ? 'Chame x² de t: fica t² + bt + c = 0. Ache t e depois x = ±√t.'
        : 'Troque x² por t e resolva. Cada t positivo dá duas raízes; t negativo não dá nenhuma.',
  };
}

/** x₁² + x₂² sem achar as raízes: S² − 2P. */
export function exercicioSomaDosQuadrados(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.escolher([1, 2, 3]);
  let b: number, c: number;
  do {
    b = rng.inteiro(-9, 9);
    c = rng.inteiro(-9, 9);
  } while (b * b - 4 * a * c < 0 || c === 0);

  const s = -b / a;
  const p = c / a;
  const gabarito = s * s - 2 * p;

  return {
    id: `equacao2-quadrados-${a}${b}${c}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'Sendo x₁ e x₂ as raízes, calcule x₁² + x₂² sem resolver a equação.' +
      (Number.isInteger(gabarito) ? '' : ' Responda como fração.'),
    enunciadoTex: `${trinomioTex(a, b, c)} = 0`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'O quadrado da soma tem os dois quadrados mais o dobro do produto.',
          tex: '(x_1 + x_2)^{2} = x_1^{2} + 2x_1x_2 + x_2^{2} \\;\\Rightarrow\\; x_1^{2} + x_2^{2} = S^{2} - 2P',
        },
        {
          descricao: 'Soma e produto por Girard.',
          tex: `S = -\\frac{${b}}{${a}} = ${numeroEmTex(s)} \\qquad P = \\frac{${c}}{${a}} = ${numeroEmTex(p)}`,
        },
        {
          descricao: 'Substituindo.',
          tex: `\\left(${numeroEmTex(s)}\\right)^{2} - 2 \\cdot \\left(${numeroEmTex(p)}\\right) = ${numeroEmTex(gabarito)}`,
        },
      ],
    },
    conceitos: ['equacao2.girard'],
    armadilhas: semColisoes(
      [
        {
          resposta: s * s,
          diagnostico: 'Faltou tirar 2P: (x₁ + x₂)² também tem o termo 2x₁x₂.',
          passo: 0,
          conceito: 'equacao2.girard',
        },
        {
          resposta: s * s + 2 * p,
          diagnostico: 'O 2P é SUBTRAÍDO: x₁² + x₂² = S² − 2P.',
          passo: 0,
          conceito: 'equacao2.girard',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: 'Não ache as raízes: x₁² + x₂² = (x₁ + x₂)² − 2·x₁·x₂, e soma e produto saem de Girard.',
  };
}
