import { ternosPitagoricos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;

type Pergunta = 'distancia-focal' | 'excentricidade' | 'semieixo';

/**
 * Exercícios de cônicas.
 *
 * Os semieixos são escolhidos entre ternos pitagóricos, de modo que a
 * distância focal sai inteira e o foco permanece no raciocínio, não na conta.
 */
export const geradorConicas: GeradorExercicio<number> = {
  topicoId: 'conicas',
  formatoResposta: 'um número, ex.: 4 ou 0,6',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);
    const hiperbole = nivel === 'facil' ? false : rng.booleano();

    // Ternos pitagóricos garantem c inteiro nos dois casos. Gerados, e não
    // escolhidos de uma lista de seis: com a lista, o tópico tinha pouquíssimas
    // cônicas distintas.
    const ternos = ternosPitagoricos(90);
    const terno = ternos[rng.inteiro(0, ternos.length - 1)]!;
    const [menor, maior] = rng.booleano()
      ? [terno[0], terno[2]]
      : [terno[1], terno[2]];

    // Elipse: a = maior, b = menor, c² = a² − b².
    // Hipérbole: a e b são os catetos, c = hipotenusa.
    const a = hiperbole ? menor : maior;
    const b = hiperbole ? Math.sqrt(maior * maior - menor * menor) : menor;
    const c = hiperbole ? maior : Math.sqrt(maior * maior - menor * menor);

    const equacaoTex = hiperbole
      ? `\\frac{x^{2}}{${a * a}} - \\frac{y^{2}}{${Math.round(b * b)}} = 1`
      : `\\frac{x^{2}}{${a * a}} + \\frac{y^{2}}{${b * b}} = 1`;

    const nome = hiperbole ? 'hipérbole' : 'elipse';

    if (pergunta === 'excentricidade') {
      const gabarito = c / a;

      return {
        id: `conicas-exc-${a}-${b}-${hiperbole}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: `Qual é a excentricidade desta ${nome}? (2 casas decimais)`,
        enunciadoTex: equacaoTex,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: hiperbole
                ? 'Na hipérbole, c² = a² + b².'
                : 'Na elipse, c² = a² − b².',
              tex: `c = ${c}`,
            },
            {
              descricao: 'A excentricidade é a razão entre c e o semieixo a.',
              tex: `e = \\frac{${c}}{${a}} = ${gabarito.toFixed(4)}`,
            },
            {
              descricao: hiperbole
                ? 'Na hipérbole a excentricidade é sempre maior que 1.'
                : 'Na elipse a excentricidade fica entre 0 e 1.',
              tex: hiperbole ? 'e > 1' : '0 \\leq e < 1',
            },
          ],
        },
        conceitos: [hiperbole ? 'conicas.hiperbole' : 'conicas.elipse', 'conicas.familia'],
        armadilhas: semColisoes(
          [
            {
              resposta: a / c,
              diagnostico:
                'A razão está invertida. A excentricidade é c/a — a distância focal dividida ' +
                'pelo semieixo, e não o contrário.',
              passo: 1,
              conceito: 'conicas.familia',
            },
            {
              resposta: hiperbole
                ? Math.sqrt(Math.abs(a * a - b * b)) / a
                : Math.hypot(a, b) / a,
              diagnostico: hiperbole
                ? 'Você usou c² = a² − b², que é a relação da ELIPSE. Na hipérbole os termos ' +
                  'se somam: c² = a² + b².'
                : 'Você usou c² = a² + b², que é a relação da HIPÉRBOLE. Na elipse é uma ' +
                  'subtração: c² = a² − b².',
              passo: 0,
              conceito: hiperbole ? 'conicas.hiperbole' : 'conicas.elipse',
            },
          ],
          gabarito,
          proximos,
        ),
        dica: nivel === 'facil' ? 'Primeiro encontre c, depois divida por a.' : undefined,
      };
    }

    if (pergunta === 'semieixo') {
      const gabarito = a;

      return {
        id: `conicas-semieixo-${a}-${b}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: `Qual é o valor do semieixo a desta ${nome}?`,
        enunciadoTex: equacaoTex,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'O denominador do termo em x é a AO QUADRADO.',
              tex: `a^{2} = ${a * a}`,
            },
            { descricao: 'Extraímos a raiz.', tex: `a = ${a}` },
          ],
        },
        conceitos: ['conicas.familia'],
        armadilhas: semColisoes(
          [
            {
              resposta: a * a,
              diagnostico:
                'Esse é o denominador da equação, que vale a². O semieixo é a raiz quadrada dele.',
              passo: 0,
              conceito: 'conicas.familia',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    const gabarito = c;

    return {
      id: `conicas-focal-${a}-${b}-${hiperbole}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: `Qual é a distância focal c desta ${nome}?`,
      enunciadoTex: equacaoTex,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: hiperbole
              ? 'Na hipérbole os quadrados se SOMAM.'
              : 'Na elipse subtrai-se o menor do maior.',
            tex: hiperbole
              ? `c^{2} = ${a * a} + ${Math.round(b * b)} = ${c * c}`
              : `c^{2} = ${a * a} - ${b * b} = ${Math.round(c * c)}`,
          },
          { descricao: 'Extraímos a raiz.', tex: `c = ${c}` },
        ],
      },
      conceitos: [hiperbole ? 'conicas.hiperbole' : 'conicas.elipse'],
      armadilhas: semColisoes(
        [
          {
            resposta: hiperbole ? Math.sqrt(Math.abs(a * a - b * b)) : Math.hypot(a, b),
            diagnostico: hiperbole
              ? 'Essa é a relação da elipse. Na hipérbole, c² = a² + b².'
              : 'Essa é a relação da hipérbole. Na elipse, c² = a² − b².',
            passo: 0,
            conceito: 'conicas.familia',
          },
        ],
        gabarito,
        proximos,
      ),
    };
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(3)).toLocaleString('pt-BR', { maximumFractionDigits: 3 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['semieixo', 'distancia-focal']);
    case 'medio':
      return rng.escolher<Pergunta>(['distancia-focal', 'excentricidade', 'semieixo']);
    case 'dificil':
      return rng.escolher<Pergunta>(['excentricidade', 'distancia-focal']);
  }
}
