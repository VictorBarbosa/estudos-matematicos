import { GRAVIDADE, paraRadianos, resolverLancamentoComPassos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { analisarNumero } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.05;

type Pergunta = 'alcance' | 'altura-maxima' | 'tempo-de-voo';

/** Exercícios de lançamento oblíquo. */
export const geradorBalistica: GeradorExercicio<number> = {
  topicoId: 'trajetoria-balistica',
  formatoResposta: 'um número com até 2 casas, ex.: 40,77',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);

    const velocidadeInicial = rng.inteiro(10, 40);
    const anguloGraus = rng.escolher(
      nivel === 'facil' ? [30, 45, 60] : [15, 25, 30, 40, 45, 55, 60, 70, 75],
    );
    const alturaInicial = nivel === 'dificil' ? rng.inteiro(0, 30) : 0;

    const lancamento = {
      velocidadeInicial,
      anguloGraus,
      alturaInicial,
      gravidade: GRAVIDADE,
    };

    const resolucao = resolverLancamentoComPassos(lancamento);
    const { alcance, alturaMaxima, tempoDeVoo, vx, vy } = resolucao.resultado;

    const gabarito =
      pergunta === 'alcance' ? alcance : pergunta === 'altura-maxima' ? alturaMaxima : tempoDeVoo;

    const nome =
      pergunta === 'alcance'
        ? 'o alcance horizontal'
        : pergunta === 'altura-maxima'
          ? 'a altura máxima'
          : 'o tempo total de voo';

    const unidade = pergunta === 'tempo-de-voo' ? 's' : 'm';

    // Erros clássicos, específicos de cada pergunta.
    const armadilhas = [
      {
        resposta:
          pergunta === 'altura-maxima'
            ? alturaInicial + (velocidadeInicial * velocidadeInicial) / (2 * GRAVIDADE)
            : pergunta === 'alcance'
              ? velocidadeInicial * tempoDeVoo
              : (2 * velocidadeInicial) / GRAVIDADE,
        diagnostico:
          'Você usou a velocidade TOTAL onde cabia apenas uma das componentes. Na vertical ' +
          'entra v₀·sen θ; na horizontal, v₀·cos θ.',
        passo: 0,
        conceito: 'balistica.independencia',
      },
      {
        resposta:
          pergunta === 'altura-maxima'
            ? alturaInicial + (vx * vx) / (2 * GRAVIDADE)
            : pergunta === 'alcance'
              ? vy * tempoDeVoo
              : vx / GRAVIDADE,
        diagnostico:
          'As componentes foram trocadas: o seno cuida da vertical e o cosseno da ' +
          'horizontal, e não o contrário.',
        passo: 0,
        conceito: 'balistica.independencia',
      },
    ];

    if (pergunta === 'tempo-de-voo' && alturaInicial === 0) {
      armadilhas.push({
        resposta: vy / GRAVIDADE,
        diagnostico:
          'Esse é o tempo até o PONTO MAIS ALTO. O voo completo inclui também a descida, e ' +
          'leva o dobro desse tempo quando o lançamento parte do chão.',
        passo: 1,
        conceito: 'balistica.independencia',
      });
    }

    return {
      id: `balistica-${pergunta}-${velocidadeInicial}${anguloGraus}${alturaInicial}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        `Um projétil é lançado a ${velocidadeInicial} m/s formando ${anguloGraus}° com a ` +
        `horizontal${alturaInicial > 0 ? `, de uma altura de ${alturaInicial} m` : ''}. ` +
        `Qual é ${nome}? (em ${unidade}, 2 casas)`,
      enunciadoTex:
        `v_0 = ${velocidadeInicial}\\text{ m/s} \\qquad \\theta = ${anguloGraus}° \\qquad ` +
        `h_0 = ${alturaInicial}\\text{ m} \\qquad g = 9{,}81\\text{ m/s}^{2}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          ...resolucao.passos,
          {
            descricao: `Entre as grandezas do lançamento, a pergunta é por ${nome}.`,
            tex: `${gabarito.toFixed(2).replace('.', '{,}')}\\text{ ${unidade}}`,
          },
        ],
      },
      conceitos: ['balistica.independencia', 'balistica.alcance'],
      armadilhas: semColisoes(armadilhas, gabarito, proximos),
      dica:
        nivel === 'facil'
          ? 'Decomponha a velocidade antes de qualquer conta.'
          : undefined,
    };
  },

  // A unidade digitada no fim é ruído; o "s" e o "m" não podem ser removidos
  // do meio, ou "sqrt(2)" viraria "qrt(2)".
  analisar: (entrada) => analisarNumero(entrada.trim().replace(/\s*(m\/s|m|s)$/, '')),

  saoEquivalentes: proximos,
  formatar: (valor) => valor.toFixed(2).replace('.', ','),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['altura-maxima', 'tempo-de-voo']);
    case 'medio':
      return rng.escolher<Pergunta>(['alcance', 'altura-maxima', 'tempo-de-voo']);
    case 'dificil':
      return rng.escolher<Pergunta>(['alcance', 'altura-maxima']);
  }
}

/** Exposto para o componente comparar ângulos. */
export const alcanceDe = (v0: number, graus: number, h0: number): number =>
  resolverLancamentoComPassos({
    velocidadeInicial: v0,
    anguloGraus: graus,
    alturaInicial: h0,
    gravidade: GRAVIDADE,
  }).resultado.alcance;

export const radianos = paraRadianos;
