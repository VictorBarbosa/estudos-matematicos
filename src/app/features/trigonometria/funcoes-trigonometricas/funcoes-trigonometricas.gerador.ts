import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;

type Pergunta = 'periodo' | 'amplitude' | 'maximo' | 'minimo';

/**
 * Exercícios sobre os parâmetros de uma onda senoidal.
 *
 * Para que as respostas sejam números limpos, o período é pedido em múltiplos
 * de π quando B divide 2π de forma exata.
 */
export const geradorOndas: GeradorExercicio<number> = {
  topicoId: 'funcoes-trigonometricas',
  formatoResposta: 'um número, ex.: 4 ou 3,14',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);

    const amplitude = rng.inteiro(1, 6) * (nivel === 'dificil' && rng.booleano(0.3) ? -1 : 1);
    const frequencia = rng.escolher(nivel === 'facil' ? [1, 2] : [1, 2, 3, 4]);
    const deslocamento = nivel === 'facil' ? 0 : rng.inteiro(-4, 4);

    const funcaoTex =
      `y = ${amplitude === 1 ? '' : amplitude === -1 ? '-' : amplitude}` +
      `\\sin(${frequencia === 1 ? '' : frequencia}x)` +
      (deslocamento === 0 ? '' : ` ${deslocamento > 0 ? '+' : '-'} ${Math.abs(deslocamento)}`);

    const periodo = (2 * Math.PI) / frequencia;
    const maximo = deslocamento + Math.abs(amplitude);
    const minimo = deslocamento - Math.abs(amplitude);

    const configuracoes = {
      periodo: {
        gabarito: periodo,
        enunciado: 'Qual é o período desta função? (2 casas decimais)',
        passos: [
          { descricao: 'O período é 2π dividido pelo coeficiente de x.', tex: 'T = \\frac{2\\pi}{|B|}' },
          {
            descricao: `Com B = ${frequencia}.`,
            tex: `T = \\frac{2\\pi}{${frequencia}} = ${periodo.toFixed(4)}`,
          },
        ],
        conceito: 'funcoes-trig.periodo',
        armadilhas: [
          {
            resposta: 2 * Math.PI * frequencia,
            diagnostico:
              'O coeficiente de x DIVIDE 2π, não multiplica. Quanto maior B, mais a onda se ' +
              'comprime, e portanto menor o período.',
            passo: 0,
            conceito: 'funcoes-trig.periodo',
          },
          {
            resposta: 2 * Math.PI,
            diagnostico:
              '2π é o período do seno puro. Aqui o argumento tem um coeficiente que altera ' +
              'a velocidade da oscilação.',
            passo: 1,
            conceito: 'funcoes-trig.periodo',
          },
        ],
      },
      amplitude: {
        gabarito: Math.abs(amplitude),
        enunciado: 'Qual é a amplitude desta função?',
        passos: [
          {
            descricao: 'A amplitude é o módulo do coeficiente que multiplica o seno.',
            tex: `|A| = |${amplitude}| = ${Math.abs(amplitude)}`,
          },
          {
            descricao: 'Ela mede o afastamento máximo em relação ao eixo da oscilação.',
            tex: `y \\in [${minimo},\; ${maximo}]`,
          },
        ],
        conceito: 'funcoes-trig.amplitude',
        armadilhas: [
          {
            resposta: maximo - minimo,
            diagnostico:
              'Esse é o intervalo TOTAL percorrido, que vale o dobro da amplitude. A ' +
              'amplitude mede só a metade: do eixo até o pico.',
            passo: 0,
            conceito: 'funcoes-trig.amplitude',
          },
          {
            resposta: amplitude,
            diagnostico:
              'A amplitude é sempre positiva, por ser uma distância. O sinal negativo de A ' +
              'apenas espelha a onda verticalmente.',
            passo: 0,
            conceito: 'funcoes-trig.amplitude',
          },
        ],
      },
      maximo: {
        gabarito: maximo,
        enunciado: 'Qual é o valor MÁXIMO que esta função atinge?',
        passos: [
          { descricao: 'O seno vale no máximo 1.', tex: '\\sin(Bx) \\leq 1' },
          {
            descricao: 'Multiplicando pela amplitude e somando o deslocamento.',
            tex: `y_{\\max} = |${amplitude}| ${deslocamento >= 0 ? '+' : '-'} ${Math.abs(deslocamento)} = ${maximo}`,
          },
        ],
        conceito: 'funcoes-trig.amplitude',
        armadilhas: [
          {
            resposta: Math.abs(amplitude),
            diagnostico:
              'Faltou somar o deslocamento vertical. A onda não oscila em torno de zero, e ' +
              'sim em torno da reta y = D.',
            passo: 1,
            conceito: 'funcoes-trig.amplitude',
          },
          {
            resposta: 1 + deslocamento,
            diagnostico:
              'O máximo do SENO é 1, mas ele ainda é multiplicado pela amplitude antes de ' +
              'somar o deslocamento.',
            passo: 1,
            conceito: 'funcoes-trig.amplitude',
          },
        ],
      },
      minimo: {
        gabarito: minimo,
        enunciado: 'Qual é o valor MÍNIMO que esta função atinge?',
        passos: [
          { descricao: 'O seno vale no mínimo −1.', tex: '\\sin(Bx) \\geq -1' },
          {
            descricao: 'Multiplicando pela amplitude e somando o deslocamento.',
            tex: `y_{\\min} = -|${amplitude}| ${deslocamento >= 0 ? '+' : '-'} ${Math.abs(deslocamento)} = ${minimo}`,
          },
        ],
        conceito: 'funcoes-trig.amplitude',
        armadilhas: [
          {
            resposta: -Math.abs(amplitude),
            diagnostico: 'Faltou somar o deslocamento vertical ao mínimo.',
            passo: 1,
            conceito: 'funcoes-trig.amplitude',
          },
        ],
      },
    } as const;

    const config = configuracoes[pergunta];

    return {
      id: `ondas-${pergunta}-${amplitude}-${frequencia}-${deslocamento}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: config.enunciado,
      enunciadoTex: funcaoTex,
      gabarito: config.gabarito,
      resolucao: { resultado: config.gabarito, passos: [...config.passos] },
      conceitos: [config.conceito, 'funcoes-trig.periodo'],
      armadilhas: semColisoes([...config.armadilhas], config.gabarito, proximos),
      dica: nivel === 'facil' && pergunta === 'periodo' ? 'O período é 2π sobre B.' : undefined,
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
      return rng.escolher<Pergunta>(['periodo', 'amplitude']);
    case 'medio':
      return rng.escolher<Pergunta>(['periodo', 'amplitude', 'maximo']);
    case 'dificil':
      return rng.escolher<Pergunta>(['maximo', 'minimo', 'periodo']);
  }
}
