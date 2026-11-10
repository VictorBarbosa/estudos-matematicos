import { numeroEmTex } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;

/** O valor exato e, se não for inteiro, o decimal ao lado. */
const exatoEDecimal = (v: number): string =>
  Number.isInteger(v)
    ? `${v}`
    : `${numeroEmTex(v)} \\approx ${String(Number(v.toFixed(4))).replace('.', '{,}')}`;

const par = (v: number): string => (v < 0 ? `(${v})` : `${v}`);

/** `y = mx + q` com sinais e frações em LaTeX. */
function reduzidaTex(m: number, q: number): string {
  const termoM = m === 1 ? 'x' : m === -1 ? '-x' : `${numeroEmTex(m)}x`;
  const termoQ = q === 0 ? '' : ` ${q > 0 ? '+' : '-'} ${numeroEmTex(Math.abs(q))}`;
  return `y = ${termoM}${termoQ}`;
}

/** `ax + by = c` com sinais certos. */
function geralTex(a: number, b: number, c: number): string {
  const termoX = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
  const termoY = ` ${b > 0 ? '+' : '-'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}y`;
  return `${termoX}${termoY} = ${c}`;
}

/**
 * A reta que passa por dois pontos: inclinação pelos dois, depois o
 * coeficiente linear substituindo um deles.
 */
export function exercicioRetaPorDoisPontos(nivel: Nivel, rng: Rng): Exercicio<number> {
  const x1 = rng.inteiro(-5, 4);
  const x2 = x1 + rng.inteiro(1, 5);
  // No Médio a inclinação é inteira; no Difícil pode ser fração.
  const m =
    nivel === 'medio' ? rng.inteiro(-3, 3) || 2 : rng.inteiro(-6, 6) / rng.escolher([1, 2, 3]) || 1;
  const q = rng.inteiro(-6, 6);
  const y1 = m * x1 + q;
  const y2 = m * x2 + q;
  // Pontos com coordenadas «bonitas»: arredondamos y no Difícil e recalculamos m e q.
  const Y1 = Number.isInteger(y1) ? y1 : Math.round(y1);
  const Y2 = Number.isInteger(y2) ? y2 : Math.round(y2);
  const M = (Y2 - Y1) / (x2 - x1);
  const Q = Y1 - M * x1;
  const gabarito = Q;

  return {
    id: `ponto-reta-dois-${x1}${Y1}-${x2}${Y2}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `A reta passa por A(${x1}, ${Y1}) e B(${x2}, ${Y2}). Escrita como y = mx + q, quanto vale q, ` +
      'o ponto onde ela corta o eixo y?' +
      (Number.isInteger(gabarito) ? '' : ' Responda como fração ou com 2 casas decimais.'),
    enunciadoTex: `A(${x1},\\; ${Y1}) \\qquad B(${x2},\\; ${Y2}) \\qquad y = mx + q`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A inclinação é a variação de y sobre a variação de x.',
          tex: `m = \\frac{${Y2} - ${par(Y1)}}{${x2} - ${par(x1)}} = \\frac{${Y2 - Y1}}{${x2 - x1}} = ${exatoEDecimal(M)}`,
        },
        {
          descricao: 'Substituímos o ponto A em y = mx + q e isolamos q.',
          tex: `${Y1} = ${numeroEmTex(M)} \\cdot ${par(x1)} + q \\;\\Rightarrow\\; q = ${Y1} - ${par(Number((M * x1).toFixed(6)))}`,
        },
        {
          descricao: 'A reta e o coeficiente linear.',
          tex: `${reduzidaTex(M, Q)} \\qquad q = ${exatoEDecimal(gabarito)}`,
        },
      ],
    },
    conceitos: ['ponto-reta.equacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: M,
          diagnostico:
            'Essa é a inclinação m. O pedido é q: substitua um dos pontos em y = mx + q e isole q.',
          passo: 2,
          conceito: 'ponto-reta.equacao',
        },
        {
          resposta: Y1 + M * x1,
          diagnostico: `Sinal trocado ao isolar q: de ${Y1} = m·(${x1}) + q, q = ${Y1} − m·(${x1}).`,
          passo: 1,
          conceito: 'ponto-reta.equacao',
        },
        {
          resposta: Y1 - ((x2 - x1) / (Y2 - Y1 || 1)) * x1,
          diagnostico: 'A inclinação ficou invertida: m = Δy / Δx, não Δx / Δy.',
          passo: 0,
          conceito: 'ponto-reta.equacao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Primeiro m = (${Y2} − ${par(Y1)}) / (${x2} − ${par(x1)}). Depois ponha A em y = mx + q e isole q.`,
  };
}

/**
 * Interseção de duas retas: o ponto que satisfaz as duas equações.
 *
 * Médio e Difícil com retas na forma reduzida (iguala-se y); Extremo na forma
 * geral, com solução fracionária.
 */
export function exercicioIntersecao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const pedeX = rng.booleano();

  if (nivel !== 'extremo') {
    const x = rng.inteiro(-4, 5);
    const y = rng.inteiro(-5, 6);
    const m1 = rng.inteiro(-3, 3) || 1;
    let m2 = rng.inteiro(-3, 3) || -1;
    if (m2 === m1) m2 = m1 + 2;
    const q1 = y - m1 * x;
    const q2 = y - m2 * x;
    const gabarito = pedeX ? x : y;

    return {
      id: `ponto-reta-inter-${m1}${q1}-${m2}${q2}-${pedeX ? 'x' : 'y'}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `As retas r e s se cruzam num ponto P. Qual é a coordenada ${pedeX ? 'x' : 'y'} de P?`,
      enunciadoTex: `r:\\; ${reduzidaTex(m1, q1)} \\qquad s:\\; ${reduzidaTex(m2, q2)}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'No ponto de encontro, as duas retas têm o mesmo y: igualamos.',
            tex: `${reduzidaTex(m1, q1).slice(4)} = ${reduzidaTex(m2, q2).slice(4)}`,
          },
          {
            descricao: 'Isolando x.',
            tex: `${m1 - m2}x = ${q2 - q1} \\;\\Rightarrow\\; x = ${x}`,
          },
          {
            descricao: 'Substituindo x numa das retas para achar y.',
            tex: `y = ${m1} \\cdot ${par(x)} ${q1 >= 0 ? '+' : '-'} ${Math.abs(q1)} = ${y} \\qquad P = (${x},\\; ${y})`,
          },
        ],
      },
      conceitos: ['ponto-reta.intersecao'],
      armadilhas: semColisoes(
        [
          {
            resposta: pedeX ? y : x,
            diagnostico: `Essa é a coordenada ${pedeX ? 'y' : 'x'} de P. O pedido é a ${pedeX ? 'x' : 'y'}.`,
            passo: 2,
            conceito: 'ponto-reta.intersecao',
          },
          {
            resposta: pedeX ? -x : y - 2 * m1 * x,
            diagnostico:
              'Sinal trocado ao passar os termos de lado: o que soma de um lado passa subtraindo.',
            passo: 1,
            conceito: 'ponto-reta.intersecao',
          },
        ],
        gabarito,
        proximos,
      ),
      dica: `No cruzamento os dois y são iguais: ${m1}x ${q1 >= 0 ? '+' : '−'} ${Math.abs(q1)} = ${m2}x ${q2 >= 0 ? '+' : '−'} ${Math.abs(q2)}. Resolva para x${pedeX ? '' : ' e substitua numa das retas'}.`,
    };
  }

  // Forma geral a1x + b1y = c1, a2x + b2y = c2, determinante ≠ 0, solução fracionária.
  let a1: number, b1: number, a2: number, b2: number;
  do {
    a1 = rng.inteiro(1, 5);
    b1 = rng.inteiro(-5, 5) || 1;
    a2 = rng.inteiro(-5, 5) || 2;
    b2 = rng.inteiro(1, 5);
  } while (a1 * b2 - a2 * b1 === 0);
  const c1 = rng.inteiro(-9, 9);
  const c2 = rng.inteiro(-9, 9);
  const det = a1 * b2 - a2 * b1;
  const x = (c1 * b2 - c2 * b1) / det;
  const y = (a1 * c2 - a2 * c1) / det;
  const gabarito = pedeX ? x : y;

  return {
    id: `ponto-reta-inter-geral-${a1}${b1}${c1}-${a2}${b2}${c2}-${pedeX ? 'x' : 'y'}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `As retas r e s se cruzam num ponto P. Qual é a coordenada ${pedeX ? 'x' : 'y'} de P?` +
      (Number.isInteger(gabarito) ? '' : ' Responda como fração ou com 2 casas decimais.'),
    enunciadoTex: `r:\\; ${geralTex(a1, b1, c1)} \\qquad s:\\; ${geralTex(a2, b2, c2)}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'O ponto de encontro resolve o sistema das duas equações. O determinante dos coeficientes não é zero: há um único ponto.',
          tex: `D = ${a1} \\cdot ${b2} - ${par(a2)} \\cdot ${par(b1)} = ${det}`,
        },
        {
          descricao: 'Pela regra de Cramer (ou por eliminação).',
          tex: `x = \\frac{${c1} \\cdot ${b2} - ${par(c2)} \\cdot ${par(b1)}}{${det}} = ${exatoEDecimal(x)} \\qquad y = \\frac{${a1} \\cdot ${par(c2)} - ${par(a2)} \\cdot ${par(c1)}}{${det}} = ${exatoEDecimal(y)}`,
        },
        {
          descricao: `A coordenada pedida.`,
          tex: `${pedeX ? 'x' : 'y'} = ${exatoEDecimal(gabarito)}`,
        },
      ],
    },
    conceitos: ['ponto-reta.intersecao'],
    armadilhas: semColisoes(
      [
        {
          resposta: pedeX ? y : x,
          diagnostico: `Essa é a coordenada ${pedeX ? 'y' : 'x'} de P. O pedido é a ${pedeX ? 'x' : 'y'}.`,
          passo: 2,
          conceito: 'ponto-reta.intersecao',
        },
        {
          resposta: -gabarito,
          diagnostico:
            'O sinal saiu trocado: confira a ordem a₁b₂ − a₂b₁ no determinante e nos numeradores.',
          passo: 1,
          conceito: 'ponto-reta.intersecao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Resolva o sistema das duas equações (eliminação ou Cramer). D = ${a1}·${b2} − (${a2})·(${b1}) = ${det}.`,
  };
}
