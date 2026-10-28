import { Polinomio, analisarMovimentoComPassos, taxaMediaComPassos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 0.05;

type Pergunta = 'velocidade' | 'aceleracao' | 'media' | 'parada';

/**
 * Exercícios de taxa de variação.
 *
 * Os coeficientes são sorteados inteiros e os instantes também, de modo que
 * velocidade e aceleração saiam exatas — o aluno erra por confundir conceitos,
 * nunca por arredondamento.
 */
export const geradorTaxa: GeradorExercicio<number> = {
  topicoId: 'taxa-de-variacao',
  formatoResposta: 'um número, ex.: -3 ou 2,5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pergunta = sortearPergunta(nivel, rng);

    return pergunta === 'parada'
      ? exercicioDeParada(nivel, rng)
      : exercicioDeMovimento(pergunta, nivel, rng);
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
      return rng.escolher<Pergunta>(['velocidade', 'media']);
    case 'medio':
      return rng.escolher<Pergunta>(['velocidade', 'aceleracao', 'media']);
    case 'dificil':
      return rng.escolher<Pergunta>(['aceleracao', 'media', 'parada']);
  }
}

/** Velocidade, aceleração ou taxa média de uma posição polinomial sorteada. */
function exercicioDeMovimento(
  pergunta: Exclude<Pergunta, 'parada'>,
  nivel: Nivel,
  rng: Rng,
): Exercicio<number> {
  const a = nivel === 'facil' ? 0 : rng.escolher([1, 2, -1]);
  const b = rng.escolher([-5, -3, -2, 2, 3, 4, 5]);
  const c = rng.inteiro(-9, 9);
  const d = rng.inteiro(0, 10);

  const s = Polinomio.de(d, c, b, a);
  const t0 = rng.inteiro(1, 4);
  const t1 = t0 + rng.inteiro(1, 3);

  const { resultado, passos } = analisarMovimentoComPassos(s, t0);
  const media = taxaMediaComPassos(s, t0, t1);

  const gabarito =
    pergunta === 'velocidade'
      ? resultado.velocidade
      : pergunta === 'aceleracao'
        ? resultado.aceleracao
        : media.resultado;

  return {
    id: `taxa-${pergunta}-${a}${b}${c}${d}-${t0}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: enunciadoDe(pergunta, t0, t1),
    enunciadoTex: `s(t) = ${s.paraTex('t')}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: pergunta === 'media' ? media.passos : passos,
    },
    conceitos:
      pergunta === 'media' ? ['taxa.media', 'taxa.instantanea'] : ['taxa.instantanea', 'taxa.sinais'],
    armadilhas: semColisoes(
      armadilhasDe(pergunta, resultado, media.resultado, t0, t1),
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'facil'
        ? 'Derive a posição para obter a velocidade; a taxa média não precisa de derivada.'
        : undefined,
  };
}

function enunciadoDe(pergunta: Exclude<Pergunta, 'parada'>, t0: number, t1: number): string {
  const corpo = 'A posição de um corpo, em metros, é dada em função do tempo em segundos.';

  switch (pergunta) {
    case 'velocidade':
      return `${corpo} Qual é a velocidade instantânea em t = ${t0} s?`;
    case 'aceleracao':
      return `${corpo} Qual é a aceleração em t = ${t0} s?`;
    case 'media':
      return `${corpo} Qual é a velocidade média entre t = ${t0} s e t = ${t1} s?`;
  }
}

function armadilhasDe(
  pergunta: Exclude<Pergunta, 'parada'>,
  movimento: { posicao: number; velocidade: number; aceleracao: number },
  media: number,
  t0: number,
  t1: number,
) {
  switch (pergunta) {
    case 'velocidade':
      return [
        {
          resposta: movimento.posicao,
          diagnostico:
            'Esse é o valor da POSIÇÃO no instante, não da velocidade. A velocidade é a taxa ' +
            'de variação da posição: é preciso derivar antes de avaliar.',
          passo: 1,
          conceito: 'taxa.instantanea',
        },
        {
          resposta: movimento.aceleracao,
          diagnostico:
            'Você derivou duas vezes e chegou à ACELERAÇÃO. Para a velocidade, basta uma ' +
            'derivada da posição.',
          passo: 2,
          conceito: 'taxa.instantanea',
        },
        {
          resposta: media,
          diagnostico:
            'Essa é a velocidade MÉDIA num intervalo, não a instantânea. A média usa dois ' +
            'instantes; a instantânea usa a derivada em um só.',
          passo: 1,
          conceito: 'taxa.media',
        },
      ];
    case 'aceleracao':
      return [
        {
          resposta: movimento.velocidade,
          diagnostico:
            'Essa é a VELOCIDADE. A aceleração é a taxa de variação dela, ou seja, a segunda ' +
            'derivada da posição — falta derivar mais uma vez.',
          passo: 2,
          conceito: 'taxa.instantanea',
        },
        {
          resposta: movimento.posicao,
          diagnostico:
            'Esse é o valor da POSIÇÃO. Entre ela e a aceleração há duas derivadas.',
          passo: 0,
          conceito: 'taxa.instantanea',
        },
      ];
    case 'media':
      return [
        {
          resposta: movimento.velocidade,
          diagnostico:
            'Essa é a velocidade INSTANTÂNEA no início do intervalo. A média compara as ' +
            'posições nos dois extremos.',
          passo: 0,
          conceito: 'taxa.instantanea',
        },
        {
          resposta: media * (t1 - t0),
          diagnostico:
            'Você calculou a variação da posição, Δs, mas esqueceu de dividir por Δt. Taxa é ' +
            'sempre uma divisão.',
          passo: 2,
          conceito: 'taxa.media',
        },
      ];
  }
}

/**
 * Pergunta em que instante o corpo para.
 *
 * A posição é montada a partir das raízes da velocidade — s = ∫6(t−r₁)(t−r₂)dt —
 * para que o instante procurado seja inteiro e a conta feche na mão.
 */
function exercicioDeParada(nivel: Nivel, rng: Rng): Exercicio<number> {
  const primeira = rng.inteiro(1, 3);
  const segunda = primeira + rng.inteiro(1, 3);

  // ∫6(t − r₁)(t − r₂) dt = 2t³ − 3(r₁+r₂)t² + 6r₁r₂t.
  const s = Polinomio.de(0, 6 * primeira * segunda, -3 * (primeira + segunda), 2);
  const { passos } = analisarMovimentoComPassos(s, primeira);

  return {
    id: `taxa-parada-${primeira}-${segunda}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'A posição de um corpo, em metros, é dada em função do tempo em segundos, com t ≥ 0. ' +
      'Em que instante ele para pela primeira vez?',
    enunciadoTex: `s(t) = ${s.paraTex('t')}`,
    gabarito: primeira,
    resolucao: {
      resultado: primeira,
      passos: [
        ...passos.slice(0, 2),
        {
          descricao: 'Parar significa velocidade nula: igualamos a derivada a zero.',
          tex: `${s.derivar().paraTex('t')} = 0`,
        },
        {
          descricao: 'Fatorando, as raízes aparecem.',
          tex: `6(t - ${primeira})(t - ${segunda}) = 0`,
          nota: 'O corpo para duas vezes; a pergunta é pela primeira.',
        },
        {
          descricao: 'A primeira parada é a menor raiz não negativa.',
          tex: `t = ${primeira}\\text{ s}`,
        },
      ],
    },
    conceitos: ['taxa.sinais', 'taxa.instantanea'],
    armadilhas: semColisoes(
      [
        {
          resposta: segunda,
          diagnostico:
            'Esse é o SEGUNDO instante em que o corpo para. A pergunta é pela primeira vez — ' +
            'use a menor raiz não negativa.',
          passo: 4,
          conceito: 'taxa.sinais',
        },
        {
          resposta: (primeira + segunda) / 2,
          diagnostico:
            'Aí a ACELERAÇÃO é que se anula, não a velocidade. Nesse instante o corpo está no ' +
            'seu ponto mais rápido no sentido contrário, não parado.',
          passo: 2,
          conceito: 'taxa.sinais',
        },
        {
          resposta: s.avaliar(primeira),
          diagnostico:
            'Esse é o valor da posição no instante da parada, não o instante em si. A ' +
            'pergunta pede um tempo, em segundos.',
          passo: 4,
          conceito: 'taxa.instantanea',
        },
      ],
      primeira,
      proximos,
    ),
    dica: nivel === 'facil' ? 'Parar é ter velocidade zero.' : undefined,
  };
}
