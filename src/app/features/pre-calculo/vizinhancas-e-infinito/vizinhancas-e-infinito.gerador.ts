import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.01;

type Pergunta = 'razao-mesmo-grau' | 'grau-menor' | 'assintota-vertical';

/**
 * Exercícios de limites no infinito e assíntotas.
 *
 * A pergunta central é sempre a comparação de graus: qual termo domina
 * quando x fica muito grande.
 */
export const geradorVizinhancas: GeradorExercicio<number> = {
  topicoId: 'vizinhancas-e-infinito',
  formatoResposta: 'um número, ex.: 2 ou 0',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);

    if (pergunta === 'assintota-vertical') {
      const k = rng.inteiro(-6, 6);
      const gabarito = k;

      return {
        id: `viz-assintota-${k}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Em que valor de x esta função tem uma assíntota vertical?',
        enunciadoTex: `f(x) = \\frac{1}{x ${k >= 0 ? '-' : '+'} ${Math.abs(k)}}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'A assíntota vertical aparece onde o denominador zera.',
              tex: `x ${k >= 0 ? '-' : '+'} ${Math.abs(k)} = 0`,
            },
            { descricao: 'Resolvendo.', tex: `x = ${k}` },
            {
              descricao: 'Ali a função explode, porque o numerador não zera junto.',
              tex: `\\lim_{x \\to ${k}} f(x) = \\pm\\infty`,
              nota: 'Se os dois zerassem juntos, haveria um buraco em vez de assíntota.',
            },
          ],
        },
        conceitos: ['vizinhancas.assintotas'],
        armadilhas: semColisoes(
          [
            {
              resposta: -k,
              diagnostico:
                'O sinal está trocado. Para anular x − k, é preciso que x seja igual a +k.',
              passo: 1,
              conceito: 'vizinhancas.assintotas',
            },
            {
              resposta: 0,
              diagnostico:
                'A assíntota só ficaria em x = 0 se o denominador fosse o próprio x. Com um ' +
                'deslocamento, ela acompanha esse deslocamento.',
              passo: 0,
              conceito: 'vizinhancas.assintotas',
            },
          ],
          gabarito,
          proximos,
        ),
        dica: nivel === 'facil' ? 'O que faz o denominador valer zero?' : undefined,
      };
    }

    if (pergunta === 'grau-menor') {
      const a = rng.inteiro(1, 9);
      const b = rng.inteiro(1, 9);
      const gabarito = 0;

      return {
        id: `viz-graumenor-${a}${b}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado: 'Qual é o limite quando x tende ao infinito?',
        enunciadoTex: `\\lim_{x \\to \\infty} \\frac{${a}x + ${b}}{${rng.inteiro(1, 5)}x^{2} + ${rng.inteiro(1, 9)}}`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'O denominador tem grau maior que o numerador.',
              tex: '\\text{grau } 1 < \\text{grau } 2',
            },
            {
              descricao: 'Dividindo tudo por x², o numerador vira termos que somem.',
              tex: `\\frac{\\frac{${a}}{x} + \\frac{${b}}{x^{2}}}{\\ldots}`,
            },
            {
              descricao: 'Quando o denominador cresce mais rápido, a fração tende a zero.',
              tex: '\\lim = 0',
              nota: 'A reta y = 0 é uma assíntota horizontal.',
            },
          ],
        },
        conceitos: ['vizinhancas.infinito'],
        armadilhas: semColisoes(
          [
            {
              resposta: a,
              diagnostico:
                'Você usou só o coeficiente do numerador. Os coeficientes só se dividem ' +
                'quando os GRAUS são iguais — aqui o denominador cresce mais rápido.',
              passo: 0,
              conceito: 'vizinhancas.infinito',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    // Mesmo grau: o limite é a razão dos coeficientes líderes.
    const a = rng.inteiro(1, 9);
    const b = rng.inteiro(1, 9);
    const grau = rng.inteiro(1, 2);
    const gabarito = a / b;

    const potencia = grau === 1 ? 'x' : `x^{${grau}}`;

    return {
      id: `viz-mesmograu-${a}${b}${grau}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Qual é o limite quando x tende ao infinito? (2 casas decimais)',
      enunciadoTex:
        `\\lim_{x \\to \\infty} \\frac{${a}${potencia} + ${rng.inteiro(1, 9)}}` +
        `{${b}${potencia} + ${rng.inteiro(1, 9)}}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: 'Numerador e denominador têm o mesmo grau.',
            tex: `\\text{grau } ${grau} = \\text{grau } ${grau}`,
          },
          {
            descricao: 'Dividindo tudo pela maior potência, os termos constantes somem.',
            tex: `\\frac{${a} + \\frac{\\ldots}{${potencia}}}{${b} + \\frac{\\ldots}{${potencia}}}`,
          },
          {
            descricao: 'Sobram apenas os coeficientes dos termos dominantes.',
            tex: `\\lim = \\frac{${a}}{${b}} = ${gabarito.toFixed(4)}`,
          },
        ],
      },
      conceitos: ['vizinhancas.infinito', 'vizinhancas.assintotas'],
      armadilhas: semColisoes(
        [
          {
            resposta: b / a,
            diagnostico:
              'A razão está invertida: é o coeficiente do NUMERADOR dividido pelo do ' +
              'denominador.',
            passo: 2,
            conceito: 'vizinhancas.infinito',
          },
          {
            resposta: 0,
            diagnostico:
              'O limite só seria zero se o denominador tivesse grau MAIOR. Com graus iguais, ' +
              'os dois crescem na mesma velocidade e a razão se estabiliza.',
            passo: 0,
            conceito: 'vizinhancas.infinito',
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
      return rng.escolher<Pergunta>(['assintota-vertical', 'grau-menor']);
    case 'medio':
      return rng.escolher<Pergunta>(['assintota-vertical', 'grau-menor', 'razao-mesmo-grau']);
    case 'dificil':
      return rng.escolher<Pergunta>(['razao-mesmo-grau', 'grau-menor']);
  }
}
