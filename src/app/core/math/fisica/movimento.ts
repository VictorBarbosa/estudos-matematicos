import { Polinomio, formatar } from '@core/math/algebra/polinomio';
import { ErroMatematico, Resolucao } from '@core/math/tipos';

/**
 * Taxa de variação: a derivada vista como ritmo de mudança.
 *
 * É a mesma derivada de Cálculo 1, só que com nome de grandeza física. Dada a
 * posição em função do tempo, derivar uma vez dá a velocidade e derivar de
 * novo dá a aceleração. O mesmo raciocínio vale para qualquer par de
 * grandezas: custo por unidade produzida, população por ano, volume por
 * segundo.
 */

/** O estado do movimento num instante, junto das funções que o descrevem. */
export interface Movimento {
  /** Posição, velocidade e aceleração no instante pedido. */
  readonly posicao: number;
  readonly velocidade: number;
  readonly aceleracao: number;
  /** As funções s(t), v(t) e a(t). */
  readonly s: Polinomio;
  readonly v: Polinomio;
  readonly a: Polinomio;
}

/**
 * Deriva a posição duas vezes e avalia tudo no instante pedido.
 *
 * A velocidade é a taxa de variação da posição; a aceleração é a taxa de
 * variação da velocidade. Derivar é a única operação envolvida nas duas.
 */
export function analisarMovimentoComPassos(s: Polinomio, t: number): Resolucao<Movimento> {
  if (!Number.isFinite(t)) {
    throw new ErroMatematico(`O instante deve ser um número finito, recebido: ${t}`);
  }

  const v = s.derivar();
  const a = v.derivar();

  const posicao = s.avaliar(t);
  const velocidade = v.avaliar(t);
  const aceleracao = a.avaliar(t);

  return {
    resultado: { posicao, velocidade, aceleracao, s, v, a },
    passos: [
      {
        descricao: 'Partimos da posição em função do tempo.',
        tex: `s(t) = ${s.paraTex('t')}`,
      },
      {
        descricao: 'A velocidade é a taxa de variação da posição: derivamos uma vez.',
        tex: `v(t) = s'(t) = ${v.paraTex('t')}`,
        nota: 'Em metros por segundo, se a posição está em metros e o tempo em segundos.',
      },
      {
        descricao: 'A aceleração é a taxa de variação da velocidade: derivamos de novo.',
        tex: `a(t) = v'(t) = s''(t) = ${a.paraTex('t')}`,
      },
      {
        descricao: `Avaliamos as três no instante t = ${formatar(t)}.`,
        tex:
          `s(${formatar(t)}) = ${formatar(posicao)} \\qquad ` +
          `v(${formatar(t)}) = ${formatar(velocidade)} \\qquad ` +
          `a(${formatar(t)}) = ${formatar(aceleracao)}`,
        nota:
          velocidade === 0
            ? 'Velocidade nula: nesse instante o corpo está parado — a posição atingiu um extremo.'
            : velocidade > 0
              ? 'Velocidade positiva: a posição está aumentando.'
              : 'Velocidade negativa: a posição está diminuindo.',
      },
    ],
  };
}

/**
 * Taxa média de variação entre dois instantes.
 *
 * É a inclinação da reta secante que liga os dois pontos do gráfico — a média
 * do ritmo no intervalo, não o ritmo de um instante.
 */
export function taxaMediaComPassos(s: Polinomio, t0: number, t1: number): Resolucao<number> {
  if (t0 === t1) {
    throw new ErroMatematico('A taxa média exige dois instantes distintos.');
  }

  const s0 = s.avaliar(t0);
  const s1 = s.avaliar(t1);
  const taxa = (s1 - s0) / (t1 - t0);

  return {
    resultado: taxa,
    passos: [
      {
        descricao: 'A taxa média é a variação da posição dividida pela variação do tempo.',
        tex: '\\bar{v} = \\frac{\\Delta s}{\\Delta t} = \\frac{s(t_1) - s(t_0)}{t_1 - t_0}',
      },
      {
        descricao: 'Avaliamos a posição nos dois instantes.',
        tex: `s(${formatar(t0)}) = ${formatar(s0)} \\qquad s(${formatar(t1)}) = ${formatar(s1)}`,
      },
      {
        descricao: 'Dividimos uma variação pela outra.',
        tex:
          `\\bar{v} = \\frac{${formatar(s1)} - ${formatar(s0)}}{${formatar(t1)} - ${formatar(t0)}}` +
          ` = ${formatar(taxa)}`,
        nota: 'Geometricamente, é a inclinação da reta secante entre os dois pontos.',
      },
    ],
  };
}

/** Uma linha da tabela de aproximação: o intervalo e a taxa média nele. */
export interface AproximacaoDaTaxa {
  readonly delta: number;
  readonly taxaMedia: number;
  /** Distância até a velocidade instantânea. */
  readonly erro: number;
}

/**
 * Mostra a taxa média se aproximando da instantânea quando o intervalo encolhe.
 *
 * É a passagem do secante para o tangente, que é a própria definição de
 * derivada — aqui exibida numericamente, para ser vista acontecendo.
 */
export function aproximacoesDaTaxa(
  s: Polinomio,
  t: number,
  deltas: readonly number[] = [1, 0.5, 0.1, 0.01, 0.001],
): readonly AproximacaoDaTaxa[] {
  const instantanea = s.derivar().avaliar(t);

  return deltas.map((delta) => {
    const taxaMedia = (s.avaliar(t + delta) - s.avaliar(t)) / delta;
    return { delta, taxaMedia, erro: Math.abs(taxaMedia - instantanea) };
  });
}
