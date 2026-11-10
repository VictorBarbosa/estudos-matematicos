import { Rng } from '@core/treino/rng/rng';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;
const exato = (a: number, b: number): boolean => a === b;
const dec = (v: number): string =>
  Number(v.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 }).replace(',', '{,}');

/**
 * O limite fundamental sen(u)/u → 1, em quatro roupas.
 *
 * Fácil sen(kx)/x; Médio sen(kx)/(mx); Difícil sen(kx)/sen(mx); Extremo
 * (1 − cos kx)/x², que sai do fundamental com a identidade 1 − cos θ = 2sen²(θ/2).
 */
export function exercicioLimiteFundamental(nivel: Nivel, rng: Rng): Exercicio<number> {
  const k = rng.inteiro(2, 7);
  let m = rng.inteiro(2, 6);
  if (m === k) m += 1;

  if (nivel === 'extremo') {
    const gabarito = (k * k) / 2;
    return {
      id: `lim-fund-cos-${k}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Calcule o limite usando o limite fundamental. (2 casas decimais)',
      enunciadoTex: `\\lim_{x \\to 0} \\frac{1 - \\cos(${k}x)}{x^{2}}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'A identidade do arco metade troca 1 − cos por um seno ao quadrado.',
            tex: `1 - \\cos(${k}x) = 2\\sin^{2}\\left(\\frac{${k}x}{2}\\right)`,
          },
          {
            descricao: 'Arrumamos para aparecer sen(u)/u com u = kx/2.',
            tex: `\\frac{2\\sin^{2}(${k}x/2)}{x^{2}} = 2\\left(\\frac{\\sin(${k}x/2)}{${k}x/2}\\right)^{2} \\cdot \\frac{${k * k}}{4}`,
          },
          {
            descricao: 'Com sen(u)/u → 1.',
            tex: `2 \\cdot 1 \\cdot \\frac{${k * k}}{4} = \\frac{${k * k}}{2} = ${dec(gabarito)}`,
          },
        ],
      },
      conceitos: ['limites.notaveis'],
      armadilhas: semColisoes(
        [
          {
            resposta: k / 2,
            diagnostico: `O ${k} entra ao QUADRADO: ele aparece dentro do seno, e o seno está ao quadrado.`,
            passo: 1,
            conceito: 'limites.notaveis',
          },
          {
            resposta: k * k,
            diagnostico: 'Faltou o 1/2 que vem de 2·(1/4): 1 − cos θ = 2·sen²(θ/2).',
            passo: 2,
            conceito: 'limites.notaveis',
          },
          {
            resposta: 0,
            diagnostico: '0/0 não é zero: é uma indeterminação a desfazer.',
            passo: 0,
            conceito: 'limites.notaveis',
          },
        ],
        gabarito,
        proximos,
      ),
      dica: `Use 1 − cos θ = 2·sen²(θ/2) e arrume para aparecer (sen u / u)² com u = ${k}x/2.`,
    };
  }

  const forma = nivel === 'facil' ? 'x' : nivel === 'medio' ? 'mx' : 'senmx';
  const den = forma === 'x' ? 1 : m;
  const gabarito = k / den;
  const denTex = forma === 'x' ? 'x' : forma === 'mx' ? `${m}x` : `\\sin(${m}x)`;

  return {
    id: `lim-fund-${forma}-${k}-${m}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'Calcule o limite usando o limite fundamental sen(u)/u → 1.' +
      (Number.isInteger(gabarito) ? '' : ' (2 casas decimais, ou como fração)'),
    enunciadoTex: `\\lim_{x \\to 0} \\frac{\\sin(${k}x)}{${denTex}}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `Multiplicamos e dividimos por ${k}x para formar sen(u)/u.`,
          tex:
            forma === 'senmx'
              ? `\\frac{\\sin(${k}x)}{\\sin(${m}x)} = \\frac{\\sin(${k}x)}{${k}x} \\cdot \\frac{${m}x}{\\sin(${m}x)} \\cdot \\frac{${k}x}{${m}x}`
              : `\\frac{\\sin(${k}x)}{${denTex}} = \\frac{\\sin(${k}x)}{${k}x} \\cdot \\frac{${k}x}{${denTex}}`,
        },
        {
          descricao: 'Cada sen(u)/u tende a 1; sobra a razão dos coeficientes.',
          tex: `1 \\cdot \\frac{${k}}{${den}} = ${Number.isInteger(gabarito) ? gabarito : `\\frac{${k}}{${den}} = ${dec(gabarito)}`}`,
        },
      ],
    },
    conceitos: ['limites.notaveis'],
    armadilhas: semColisoes(
      [
        {
          resposta: 1,
          diagnostico: `sen(u)/u → 1 só quando o ângulo e o denominador são iguais. Aqui o ângulo é ${k}x: falta o fator ${k}.`,
          passo: 0,
          conceito: 'limites.notaveis',
        },
        ...(den !== 1
          ? [
              {
                resposta: den / k,
                diagnostico: 'A fração saiu invertida: o coeficiente do seno de cima vai em cima.',
                passo: 1,
                conceito: 'limites.notaveis',
              },
            ]
          : []),
        {
          resposta: 0,
          diagnostico: 'Substituir x = 0 dá 0/0, que não é zero: é preciso o limite fundamental.',
          passo: 0,
          conceito: 'limites.notaveis',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      forma === 'senmx'
        ? `Escreva como [sen(${k}x)/(${k}x)]·[(${m}x)/sen(${m}x)]·(${k}x)/(${m}x): os colchetes tendem a 1.`
        : `Multiplique e divida por ${k}x: sen(${k}x)/(${k}x) tende a 1 e sobra ${k}x/(${denTex === 'x' ? 'x' : `${m}x`}).`,
  };
}

type Caso = 'existe' | 'infinito' | 'salto';

/**
 * O limite existe? Três casos que parecem iguais na substituição.
 *
 * (x² − a²)/(x − a) dá 0/0 e existe; 1/(x − a)² dá número/0 e vai a +∞;
 * |x − a|/(x − a) dá 0/0 mas os laterais são −1 e +1: não existe.
 */
export function exercicioLimiteExiste(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(-4, 5) || 2;
  const caso = rng.escolher<Caso>(['existe', 'infinito', 'salto']);
  const codigo = { existe: 1, infinito: 2, salto: 3 }[caso];
  const k = rng.inteiro(1, 5);
  const xa = `x ${a >= 0 ? '-' : '+'} ${Math.abs(a)}`;
  const tex = {
    existe: `\\lim_{x \\to ${a}} \\frac{x^{2} - ${a * a}}{${xa}}`,
    infinito: `\\lim_{x \\to ${a}} \\frac{${k}}{(${xa})^{2}}`,
    salto: `\\lim_{x \\to ${a}} \\frac{${k === 1 ? '' : k}|${xa}|}{${xa}}`,
  }[caso];

  const passos = {
    existe: [
      {
        descricao: 'Substituindo dá 0/0: fatoramos.',
        tex: `\\frac{(x - ${a})(x + ${a})}{x - ${a}} = x + ${a}`
          .replace(/- -/g, '+ ')
          .replace(/\+ -/g, '- '),
      },
      {
        descricao: `O limite existe e vale ${2 * a}.`,
        tex: `\\lim = ${2 * a} \\;\\Rightarrow\\; 1`,
      },
    ],
    infinito: [
      {
        descricao: `Em cima ${k}, embaixo um quadrado que tende a 0 pelos positivos.`,
        tex: `\\frac{${k}}{0^{+}}`,
      },
      {
        descricao: 'A função cresce sem limite: o limite é +∞ (assíntota vertical).',
        tex: `\\lim = +\\infty \\;\\Rightarrow\\; 2`,
      },
    ],
    salto: [
      {
        descricao: `Pela direita, |x − a| = x − a e a fração vale ${k}; pela esquerda, |x − a| = −(x − a) e vale −${k}.`,
        tex: `\\lim_{x \\to ${a}^{+}} = ${k} \\qquad \\lim_{x \\to ${a}^{-}} = -${k}`,
      },
      {
        descricao: 'Laterais diferentes: o limite não existe.',
        tex: `${k} \\neq -${k} \\;\\Rightarrow\\; 3`,
      },
    ],
  }[caso];

  return {
    id: `lim-existe-${caso}-${a}-${k}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'Classifique o limite: responda 1 se ele existe (é um número), 2 se é infinito ' +
      '(+∞ ou −∞), 3 se não existe porque os laterais são diferentes.',
    enunciadoTex: tex,
    gabarito: codigo,
    resolucao: { resultado: codigo, passos },
    conceitos: ['limites.existencia'],
    armadilhas: semColisoes(
      ([1, 2, 3] as const)
        .filter((c) => c !== codigo)
        .map((c) => ({
          resposta: c,
          diagnostico: {
            existe:
              'Dar 0/0 na substituição não decide nada. Aqui, depois de fatorar, o fator que zera ' +
              'se cancela e o limite é um número.',
            infinito:
              'Um número diferente de zero sobre algo que tende a zero não tem limite finito. Como ' +
              'o denominador é um quadrado, ele é positivo dos dois lados: o limite é +∞.',
            salto:
              'O módulo muda de sinal no ponto: os laterais são opostos. Laterais diferentes = ' +
              'limite inexistente, mesmo sem nada ir ao infinito.',
          }[caso],
          passo: 0,
          conceito: 'limites.existencia',
        })),
      codigo,
      exato,
    ),
    dica: 'Substitua o ponto. Se der 0/0, simplifique ou olhe os dois laterais; se der número/0, é infinito.',
  };
}
