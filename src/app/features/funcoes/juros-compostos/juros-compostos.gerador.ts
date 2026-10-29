import { jurosCompostosComPassos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { analisarNumero } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.05;

type Pergunta = 'montante' | 'juro' | 'tempo-para-dobrar';

/** Exercícios de juros compostos. */
export const geradorJuros: GeradorExercicio<number> = {
  topicoId: 'juros-compostos',
  formatoResposta: 'um número, ex.: 1610,51',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);
    const capital = rng.inteiro(1, 20) * 500;
    const taxa = rng.escolher([1, 2, 3, 5, 8, 10, 12]);
    const periodos = rng.inteiro(2, nivel === 'facil' ? 5 : 12);

    if (pergunta === 'tempo-para-dobrar') {
      const gabarito = Math.log(2) / Math.log(1 + taxa / 100);

      return {
        id: `juros-dobrar-${taxa}-${rng.inteiro(0, 9999)}`,
        nivel,
        enunciado:
          `A uma taxa de ${taxa}% por período, em quantos períodos um capital dobra? ` +
          '(2 casas decimais)',
        enunciadoTex: `i = ${taxa}\\% \\qquad M = 2C`,
        gabarito,
        resolucao: {
          resultado: gabarito,
          passos: [
            {
              descricao: 'Escrevemos a condição de dobrar.',
              tex: `C\\left(1 + ${taxa / 100}\\right)^{n} = 2C`,
            },
            {
              descricao: 'O capital se cancela — o tempo independe do valor investido.',
              tex: `${(1 + taxa / 100).toFixed(4)}^{n} = 2`,
            },
            {
              descricao: 'Aplicamos logaritmo para tirar n do expoente.',
              tex: `n = \\frac{\\ln 2}{\\ln ${(1 + taxa / 100).toFixed(4)}} = ${gabarito.toFixed(4)}`,
            },
            {
              descricao: 'Conferindo com a regra de 72.',
              tex: `\\frac{72}{${taxa}} \\approx ${(72 / taxa).toFixed(2)}`,
              nota: 'A aproximação é boa para taxas pequenas.',
            },
          ],
        },
        conceitos: ['juros.tempo', 'juros.compostos'],
        armadilhas: semColisoes(
          [
            {
              resposta: 100 / taxa,
              diagnostico:
                'Dividir 100 pela taxa daria o tempo nos juros SIMPLES. Nos compostos o ' +
                'capital rende sobre si mesmo, e dobra antes disso.',
              passo: 0,
              conceito: 'juros.simples',
            },
            {
              resposta: 2 / (taxa / 100),
              diagnostico:
                'O n está no EXPOENTE, então é preciso logaritmo para isolá-lo — não basta ' +
                'dividir.',
              passo: 2,
              conceito: 'juros.tempo',
            },
          ],
          gabarito,
          proximos,
        ),
      };
    }

    const resolucao = jurosCompostosComPassos(capital, taxa, periodos);
    const montante = resolucao.resultado;
    const simples = capital * (1 + (taxa / 100) * periodos);

    const gabarito = pergunta === 'montante' ? montante : montante - capital;

    return {
      id: `juros-${pergunta}-${capital}${taxa}${periodos}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        `Um capital de R$ ${capital},00 é aplicado a ${taxa}% ao período, por ${periodos} ` +
        `períodos, a juros compostos. Qual é ${pergunta === 'montante' ? 'o montante final' : 'o juro total'}? (2 casas)`,
      enunciadoTex: `C = ${capital} \\qquad i = ${taxa}\\% \\qquad n = ${periodos}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          ...resolucao.passos,
          {
            descricao:
              pergunta === 'montante'
                ? 'A pergunta é pelo montante final.'
                : 'A pergunta é pelo JURO, que é o montante menos o capital aplicado.',
            tex:
              pergunta === 'montante'
                ? `M = ${montante.toFixed(2).replace('.', '{,}')}`
                : `J = ${montante.toFixed(2).replace('.', '{,}')} - ${capital} = ` +
                  `${gabarito.toFixed(2).replace('.', '{,}')}`,
          },
        ],
      },
      conceitos: ['juros.compostos', 'juros.simples'],
      armadilhas: semColisoes(
        [
          {
            resposta: pergunta === 'montante' ? simples : simples - capital,
            diagnostico:
              'Esse é o resultado dos juros SIMPLES, em que só o capital inicial rende. Nos ' +
              'compostos o montante inteiro rende a cada período, e o crescimento é ' +
              'exponencial.',
            passo: 1,
            conceito: 'juros.simples',
          },
          {
            resposta: pergunta === 'montante' ? montante - capital : montante,
            diagnostico:
              pergunta === 'montante'
                ? 'Esse é apenas o JURO. O montante inclui também o capital inicial.'
                : 'Esse é o MONTANTE. O juro é só a parte que foi acrescentada: M − C.',
            passo: 2,
            conceito: 'juros.compostos',
          },
          {
            resposta: capital * (taxa / 100) ** periodos,
            diagnostico:
              'O fator é (1 + i), não apenas i. Sem o 1, o capital encolheria em vez de ' +
              'crescer — o 1 é o que preserva o valor original.',
            passo: 0,
            conceito: 'juros.compostos',
          },
        ],
        gabarito,
        proximos,
      ),
      dica: nivel === 'facil' ? 'Use M = C(1 + i)ⁿ, com i em decimal.' : undefined,
    };
  },

  /**
   * Aceita "1610,51", "1610.51", "R$ 1.610,51" e "1610".
   *
   * O ponto só conta como separador de milhar quando a vírgula já ocupa a casa
   * decimal, ou quando ele separa grupos de três dígitos. Fora disso é o
   * próprio separador decimal — é assim que se digita direto do teclado.
   */
  analisar: (entrada) => {
    const semRuido = entrada.trim().replace(/\s|R\$/g, '');
    // "1.200" é mil e duzentos, não 1,2: separador de milhar só quando não há
    // vírgula decimal e os grupos têm três dígitos.
    const milhar = semRuido.includes(',') || /^[+-]?\d{1,3}(\.\d{3})+$/.test(semRuido);

    return analisarNumero(milhar ? semRuido.replace(/\./g, '') : semRuido);
  },

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(2)).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['montante', 'juro']);
    case 'medio':
      return rng.escolher<Pergunta>(['montante', 'juro', 'tempo-para-dobrar']);
    case 'dificil':
      return rng.escolher<Pergunta>(['tempo-para-dobrar', 'juro']);
  }
}
