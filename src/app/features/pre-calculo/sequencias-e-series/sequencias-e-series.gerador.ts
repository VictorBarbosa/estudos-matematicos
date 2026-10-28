import { somaComPassos, somaInfinitaComPassos, termoGeral } from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;

type Pergunta = 'termo' | 'soma' | 'infinita';

/** Exercícios de progressões e séries. */
export const geradorSequencias: GeradorExercicio<number> = {
  topicoId: 'sequencias-e-series',
  formatoResposta: 'um número, ex.: 42 ou 1,5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);

    if (pergunta === 'infinita') {
      const primeiro = rng.inteiro(1, 10);
      const [num, den] = rng.escolher([
        [1, 2],
        [1, 3],
        [2, 3],
        [1, 4],
        [3, 4],
        [1, 5],
      ]);
      const razao = num / den;
      const gabarito = primeiro / (1 - razao);

      return {
        id: `seq-infinita-${primeiro}-${num}${den}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Qual é a soma INFINITA desta progressão geométrica? (2 casas decimais)',
        enunciadoTex: `a_1 = ${primeiro} \\qquad q = \\frac{${num}}{${den}}`,
        gabarito,
        resolucao: somaInfinitaComPassos(primeiro, razao) as never,
        conceitos: ['sequencias.convergencia'],
        armadilhas: semColisoes(
          [
            {
              resposta: primeiro / razao,
              diagnostico:
                'A fórmula tem 1 − q no denominador, não apenas q. É esse "1 menos" que ' +
                'faz a soma crescer quando a razão se aproxima de 1.',
              passo: 2,
              conceito: 'sequencias.convergencia',
            },
            {
              resposta: primeiro * (1 - razao),
              diagnostico:
                'O (1 − q) está no DENOMINADOR. Multiplicar por ele daria um resultado menor ' +
                'que o primeiro termo, o que é impossível numa soma de parcelas positivas.',
              passo: 2,
              conceito: 'sequencias.convergencia',
            },
          ],
          gabarito,
          proximos,
        ),
        dica: nivel === 'dificil' ? undefined : 'Use S = a₁ / (1 − q).',
      };
    }

    const geometrica = nivel === 'facil' ? false : rng.booleano();
    const primeiro = rng.inteiro(1, 10);
    const razao = geometrica ? rng.inteiro(2, 4) : rng.inteiro(2, 9) * (nivel === 'dificil' ? rng.sinal() : 1);
    const n = rng.inteiro(4, geometrica ? 7 : 12);

    const progressao = { primeiro, razao, geometrica };
    const tipo = geometrica ? 'geométrica' : 'aritmética';

    if (pergunta === 'termo') {
      const gabarito = termoGeral(progressao, n);

      return {
        id: `seq-termo-${primeiro}-${razao}-${n}-${geometrica}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: `Qual é o ${n}º termo desta progressão ${tipo}?`,
        enunciadoTex: `a_1 = ${primeiro} \\qquad ${geometrica ? 'q' : 'r'} = ${razao}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: geometrica
                ? 'Na PG, a razão é multiplicada n−1 vezes.'
                : 'Na PA, a razão é somada n−1 vezes.',
              tex: geometrica
                ? `a_n = a_1 \\cdot q^{n-1}`
                : `a_n = a_1 + (n-1)r`,
            },
            {
              descricao: `Com n = ${n}, são ${n - 1} passos a partir do primeiro termo.`,
              tex: geometrica
                ? `a_{${n}} = ${primeiro} \\cdot ${razao}^{${n - 1}} = ${gabarito}`
                : `a_{${n}} = ${primeiro} + ${n - 1} \\cdot ${razao} = ${gabarito}`,
            },
          ],
        },
        conceitos: ['sequencias.progressoes'],
        armadilhas: semColisoes(
          [
            {
              resposta: geometrica ? primeiro * razao ** n : primeiro + n * razao,
              diagnostico:
                `São n−1 passos, não n. Do 1º ao ${n}º termo percorremos ${n - 1} intervalos, ` +
                'porque o primeiro termo já está lá antes de qualquer passo.',
              passo: 1,
              conceito: 'sequencias.progressoes',
            },
            {
              resposta: geometrica ? primeiro + (n - 1) * razao : primeiro * razao ** (n - 1),
              diagnostico: geometrica
                ? 'Você usou a fórmula da PA. Numa progressão geométrica a razão MULTIPLICA, ' +
                  'não soma.'
                : 'Você usou a fórmula da PG. Numa progressão aritmética a razão SOMA, não ' +
                  'multiplica.',
              passo: 0,
              conceito: 'sequencias.progressoes',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    const resolucao = somaComPassos(progressao, n);
    const gabarito = resolucao.resultado;

    return {
      id: `seq-soma-${primeiro}-${razao}-${n}-${geometrica}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Qual é a soma dos ${n} primeiros termos desta progressão ${tipo}?`,
      enunciadoTex: `a_1 = ${primeiro} \\qquad ${geometrica ? 'q' : 'r'} = ${razao} \\qquad n = ${n}`,
      gabarito,
      resolucao,
      conceitos: ['sequencias.soma', 'sequencias.progressoes'],
      armadilhas: semColisoes(
        [
          {
            resposta: termoGeral(progressao, n),
            diagnostico:
              `Esse é o ${n}º TERMO, não a soma dos ${n} primeiros. A soma acumula todos ` +
              'eles, e por isso é bem maior.',
            passo: 0,
            conceito: 'sequencias.soma',
          },
          {
            resposta: primeiro * n,
            diagnostico:
              'Multiplicar o primeiro termo por n só valeria se todos fossem iguais. Como a ' +
              'sequência varia, é preciso a fórmula da soma.',
            passo: 1,
            conceito: 'sequencias.soma',
          },
        ],
        gabarito,
        proximos,
      ),
    };
  },

  analisar: (entrada) => {
    const limpo = entrada.trim().replace(/\s/g, '').replace(',', '.');
    return /^[+-]?\d*\.?\d+$/.test(limpo) ? Number(limpo) : null;
  },

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['termo', 'soma']);
    case 'medio':
      return rng.escolher<Pergunta>(['termo', 'soma', 'infinita']);
    case 'dificil':
      return rng.escolher<Pergunta>(['soma', 'infinita']);
  }
}
