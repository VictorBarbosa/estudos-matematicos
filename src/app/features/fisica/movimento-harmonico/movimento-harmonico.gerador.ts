import { resolverOscilacaoComPassos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { analisarNumero } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;

type Pergunta = 'periodo' | 'frequencia-angular' | 'velocidade-maxima';

/** Exercícios de movimento harmônico simples. */
export const geradorMhs: GeradorExercicio<number> = {
  topicoId: 'movimento-harmonico',
  formatoResposta: 'um número com até 3 casas, ex.: 3,142',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);

    // Escolhemos k e m para que ω saia inteiro na maioria dos casos.
    const massa = rng.escolher([1, 2, 4]);
    const omega = rng.inteiro(1, 5);
    const constante = omega * omega * massa;
    const amplitude = rng.inteiro(1, 20) / 10;

    const resolucao = resolverOscilacaoComPassos(amplitude, constante, massa);
    const { periodo, frequenciaAngular } = resolucao.resultado;
    const velocidadeMaxima = amplitude * frequenciaAngular;

    const gabarito =
      pergunta === 'periodo'
        ? periodo
        : pergunta === 'frequencia-angular'
          ? frequenciaAngular
          : velocidadeMaxima;

    const nome =
      pergunta === 'periodo'
        ? 'o período da oscilação, em segundos'
        : pergunta === 'frequencia-angular'
          ? 'a frequência angular ω, em rad/s'
          : 'a velocidade máxima, em m/s';

    return {
      id: `mhs-${pergunta}-${massa}${constante}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        `Uma massa de ${massa} kg oscila presa a uma mola de constante ${constante} N/m, ` +
        `com amplitude de ${amplitude} m. Qual é ${nome}? (3 casas)`,
      enunciadoTex: `m = ${massa}\\text{ kg} \\qquad k = ${constante}\\text{ N/m} \\qquad A = ${amplitude}\\text{ m}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          ...resolucao.passos,
          {
            descricao: `A pergunta é por ${nome}.`,
            tex:
              pergunta === 'velocidade-maxima'
                ? `v_{max} = A\\omega = ${amplitude} \\cdot ` +
                  `${frequenciaAngular.toFixed(3).replace('.', '{,}')} = ` +
                  `${gabarito.toFixed(3).replace('.', '{,}')}`
                : `${pergunta === 'periodo' ? 'T' : '\\omega'} = ` +
                  `${gabarito.toFixed(3).replace('.', '{,}')}`,
          },
        ],
      },
      conceitos: ['mhs.periodo', 'mhs.equacao'],
      armadilhas: semColisoes(
        [
          {
            // Esqueceu a raiz quadrada.
            resposta: pergunta === 'periodo' ? (2 * Math.PI * massa) / constante : constante / massa,
            diagnostico:
              'Faltou a raiz quadrada. A frequência angular é √(k/m), não k/m — e é ela que ' +
              'entra no período.',
            passo: 3,
            conceito: 'mhs.equacao',
          },
          {
            // Inverteu k e m.
            resposta:
              pergunta === 'periodo'
                ? 2 * Math.PI * Math.sqrt(constante / massa)
                : Math.sqrt(massa / constante),
            diagnostico:
              'A razão está invertida. Em ω = √(k/m) a constante da mola fica em cima; no ' +
              'período, T = 2π√(m/k), a massa é que sobe.',
            passo: 3,
            conceito: 'mhs.periodo',
          },
          {
            // Achou que a amplitude afeta o período.
            resposta: pergunta === 'periodo' ? periodo * amplitude : frequenciaAngular * amplitude,
            diagnostico:
              'A amplitude NÃO entra no período nem na frequência. Puxar mais a mola faz o ' +
              'corpo percorrer mais distância, mas também ir mais rápido — os efeitos se ' +
              'cancelam.',
            passo: 4,
            conceito: 'mhs.periodo',
          },
        ],
        gabarito,
        proximos,
      ),
      dica: nivel === 'facil' ? 'Comece calculando ω = √(k/m).' : undefined,
    };
  },

  // A unidade digitada no fim é ruído; o "s" não pode ser removido do meio,
  // ou "sqrt(2)" viraria "qrt(2)".
  analisar: (entrada) => analisarNumero(entrada.trim().replace(/\s*(rad\/s|m\/s|s)$/, '')),

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['frequencia-angular', 'periodo']);
    case 'medio':
      return rng.escolher<Pergunta>(['periodo', 'frequencia-angular', 'velocidade-maxima']);
    case 'dificil':
      return rng.escolher<Pergunta>(['velocidade-maxima', 'periodo']);
  }
}
