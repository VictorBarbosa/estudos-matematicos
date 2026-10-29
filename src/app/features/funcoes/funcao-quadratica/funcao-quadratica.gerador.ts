import { resolverQuadraticaComPassos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const { saoEquivalentes: proximos } = numeroComCasas(2, 1e-4);

type Pergunta = 'vertice-x' | 'vertice-y' | 'valor';

/**
 * Exercícios de função quadrática.
 *
 * O foco é o vértice — o elemento que resolve problemas de otimização e que
 * costuma ser confundido com as raízes.
 */
export const geradorQuadratica: GeradorExercicio<number> = {
  topicoId: 'funcao-quadratica',
  formatoResposta: 'um número, ex.: 2,5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);
    const { a, b, c } = sortear(nivel, rng);

    const resolucao = resolverQuadraticaComPassos(a, b, c);
    const { vertice, raizes } = resolucao.resultado;

    const funcaoTex = montar(a, b, c);

    if (pergunta === 'valor') {
      const x = rng.inteiro(-4, 5);
      const gabarito = a * x * x + b * x + c;

      return {
        id: `quadratica-valor-${a}${b}${c}-${x}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: `Qual é o valor de f(${x})?`,
        enunciadoTex: `f(x) = ${funcaoTex}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            { descricao: `Substituímos x por ${x}.`, tex: `f(${x}) = ${a}(${x})^{2} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}(${x}) ${c >= 0 ? '+' : '-'} ${Math.abs(c)}` },
            { descricao: 'Resolvemos a potência primeiro.', tex: `= ${a} \\cdot ${x * x} ${b >= 0 ? '+' : '-'} ${Math.abs(b * x)} ${c >= 0 ? '+' : '-'} ${Math.abs(c)}` },
            { descricao: 'Somamos.', tex: `= ${gabarito}` },
          ],
        },
        conceitos: ['quadratica.parabola'],
        armadilhas: semColisoes(
          [
            {
              resposta: a * 2 * x + b * x + c,
              diagnostico: 'x² foi tratado como 2x. Elevar ao quadrado é multiplicar x por ele mesmo.',
              passo: 1,
              conceito: 'quadratica.parabola',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    const gabarito = pergunta === 'vertice-x' ? vertice.x : vertice.y;

    return {
      id: `quadratica-${pergunta}-${a}${b}${c}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        pergunta === 'vertice-x'
          ? 'Qual é a abscissa do vértice (o valor de x onde ocorre o máximo ou o mínimo)?'
          : 'Qual é o valor máximo ou mínimo da função, ou seja, a ordenada do vértice?',
      enunciadoTex: `f(x) = ${funcaoTex}`,
      gabarito,
      resolucao: { resultado: gabarito, passos: resolucao.passos },
      conceitos: ['quadratica.parabola', 'quadratica.otimizacao'],
      armadilhas: semColisoes(
        [
          {
            // Confundiu vértice com raiz.
            resposta: raizes.length > 0 ? raizes[0]! : vertice.x + 1,
            diagnostico:
              'Esse é o valor de uma RAIZ, onde a parábola cruza o eixo x. O vértice é o ponto ' +
              'extremo da curva, que fica a meio caminho entre as duas raízes.',
            passo: 3,
            conceito: 'quadratica.parabola',
          },
          {
            // Esqueceu o sinal negativo em -b/2a.
            resposta: pergunta === 'vertice-x' ? b / (2 * a) : resolucao.resultado.delta / (4 * a),
            diagnostico:
              pergunta === 'vertice-x'
                ? 'Faltou o sinal negativo: a fórmula é x_v = −b/(2a).'
                : 'Faltou o sinal negativo: a fórmula é y_v = −Δ/(4a).',
            passo: 3,
            conceito: 'quadratica.parabola',
          },
          {
            // Trocou x_v por y_v.
            resposta: pergunta === 'vertice-x' ? vertice.y : vertice.x,
            diagnostico:
              pergunta === 'vertice-x'
                ? 'Esse é o valor de y do vértice. A pergunta é pela abscissa, isto é, o x.'
                : 'Esse é o valor de x do vértice. A pergunta é pela ordenada, isto é, o y.',
            passo: 3,
            conceito: 'quadratica.parabola',
          },
        ],
        gabarito,
        proximos,
      ),
      dica: nivel === 'facil' ? 'Comece calculando x_v = −b/(2a).' : undefined,
    };
  },

  analisar: analisarNumero,

  ...numeroComCasas(2, 1e-4),
};

function montar(a: number, b: number, c: number): string {
  const termoA = a === 1 ? 'x^{2}' : a === -1 ? '-x^{2}' : `${a}x^{2}`;
  const termoB = b === 0 ? '' : ` ${b > 0 ? '+' : '-'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x`;
  const termoC = c === 0 ? '' : ` ${c > 0 ? '+' : '-'} ${Math.abs(c)}`;
  return `${termoA}${termoB}${termoC}`;
}

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['valor', 'vertice-x']);
    case 'medio':
      return rng.escolher<Pergunta>(['vertice-x', 'vertice-y', 'valor']);
    case 'dificil':
      return rng.escolher<Pergunta>(['vertice-x', 'vertice-y']);
  }
}

function sortear(nivel: Nivel, rng: Rng): { a: number; b: number; c: number } {
  if (nivel === 'facil') {
    // a = ±1 e b par, para que o vértice caia em valor inteiro.
    return { a: rng.booleano() ? 1 : -1, b: rng.inteiro(-5, 5) * 2, c: rng.inteiro(-8, 8) };
  }

  const a = rng.inteiro(1, nivel === 'dificil' ? 4 : 2) * rng.sinal();
  return { a, b: rng.inteiro(-10, 10), c: rng.inteiro(-10, 10) };
}
