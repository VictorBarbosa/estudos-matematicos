import { ErroMatematico, Resolucao } from '@core/math/tipos';
import { formatar } from '@core/math/algebra/polinomio';
import { paraRadianos } from '@core/math/trigonometria/trigonometria';

/**
 * Cinemática do lançamento oblíquo.
 *
 * É o exemplo em que quase todo o currículo se encontra: a trajetória é uma
 * parábola (função quadrática), as componentes da velocidade saem da
 * trigonometria, e a velocidade instantânea é a derivada da posição.
 */

export const GRAVIDADE = 9.81;

export interface Lancamento {
  readonly velocidadeInicial: number;
  readonly anguloGraus: number;
  readonly alturaInicial: number;
  readonly gravidade: number;
}

export interface TrajetoriaCalculada {
  readonly alcance: number;
  readonly alturaMaxima: number;
  readonly tempoDeVoo: number;
  readonly tempoNoApice: number;
  /** Componentes da velocidade inicial. */
  readonly vx: number;
  readonly vy: number;
}

/** Posição horizontal e vertical em função do tempo. */
export function posicao(lancamento: Lancamento, t: number): { x: number; y: number } {
  const radianos = paraRadianos(lancamento.anguloGraus);
  const vx = lancamento.velocidadeInicial * Math.cos(radianos);
  const vy = lancamento.velocidadeInicial * Math.sin(radianos);

  return {
    x: vx * t,
    y: lancamento.alturaInicial + vy * t - (lancamento.gravidade * t * t) / 2,
  };
}

/** A trajetória como função de x — é aqui que a parábola aparece. */
export function alturaEmFuncaoDeX(lancamento: Lancamento): (x: number) => number {
  const radianos = paraRadianos(lancamento.anguloGraus);
  const vx = lancamento.velocidadeInicial * Math.cos(radianos);

  if (Math.abs(vx) < 1e-9) {
    // Lançamento vertical: não há trajetória em função de x.
    return () => Number.NaN;
  }

  const tangente = Math.tan(radianos);
  const fator = lancamento.gravidade / (2 * vx * vx);

  return (x: number) => lancamento.alturaInicial + tangente * x - fator * x * x;
}

export function resolverLancamentoComPassos(
  lancamento: Lancamento,
): Resolucao<TrajetoriaCalculada> {
  const { velocidadeInicial: v0, anguloGraus, alturaInicial: h0, gravidade: g } = lancamento;

  if (v0 <= 0) {
    throw new ErroMatematico('A velocidade inicial deve ser positiva.');
  }

  const radianos = paraRadianos(anguloGraus);
  const vx = v0 * Math.cos(radianos);
  const vy = v0 * Math.sin(radianos);

  const tempoNoApice = vy / g;
  const alturaMaxima = h0 + (vy * vy) / (2 * g);

  // Resolve h0 + vy·t − g·t²/2 = 0 para o tempo de voo.
  const delta = vy * vy + 2 * g * h0;
  const tempoDeVoo = (vy + Math.sqrt(delta)) / g;
  const alcance = vx * tempoDeVoo;

  return {
    resultado: { alcance, alturaMaxima, tempoDeVoo, tempoNoApice, vx, vy },
    passos: [
      {
        descricao: 'Decompomos a velocidade inicial em duas componentes independentes.',
        tex:
          `v_x = ${formatar(v0)}\\cos ${anguloGraus}° = ${formatar(vx)} \\qquad ` +
          `v_y = ${formatar(v0)}\\sin ${anguloGraus}° = ${formatar(vy)}`,
        nota: 'A horizontal é constante; só a vertical sofre a gravidade.',
      },
      {
        descricao: 'Na vertical, a velocidade zera no ponto mais alto.',
        tex: `v_y - g\\,t = 0 \;\\Rightarrow\; t = \\frac{${formatar(vy)}}{${formatar(g)}} = ${formatar(tempoNoApice)}\\text{ s}`,
      },
      {
        descricao: 'Substituindo esse tempo na equação da altura.',
        tex: `h_{\\max} = ${formatar(h0)} + \\frac{v_y^{2}}{2g} = ${formatar(alturaMaxima)}\\text{ m}`,
      },
      {
        descricao: 'O voo termina quando a altura volta a zero.',
        tex: `${formatar(h0)} + ${formatar(vy)}t - \\frac{${formatar(g)}t^{2}}{2} = 0 \;\\Rightarrow\; t = ${formatar(tempoDeVoo)}\\text{ s}`,
      },
      {
        descricao: 'O alcance é a velocidade horizontal vezes o tempo total.',
        tex: `A = ${formatar(vx)} \\cdot ${formatar(tempoDeVoo)} = ${formatar(alcance)}\\text{ m}`,
        nota:
          h0 === 0
            ? 'Com altura inicial zero, o alcance é máximo em 45°.'
            : 'Com altura inicial, o ângulo ótimo fica abaixo de 45°.',
      },
    ],
  };
}

export interface Oscilacao {
  readonly amplitude: number;
  readonly periodo: number;
  readonly frequencia: number;
  readonly frequenciaAngular: number;
}

/**
 * Movimento harmônico simples.
 *
 * A posição é um cosseno, a velocidade é sua derivada e a aceleração a
 * derivada da velocidade — e esta última é proporcional à posição, com sinal
 * trocado. É a assinatura do MHS.
 */
export function resolverOscilacaoComPassos(
  amplitude: number,
  constanteElastica: number,
  massa: number,
): Resolucao<Oscilacao> {
  if (massa <= 0 || constanteElastica <= 0) {
    throw new ErroMatematico('Massa e constante elástica devem ser positivas.');
  }

  const frequenciaAngular = Math.sqrt(constanteElastica / massa);
  const periodo = (2 * Math.PI) / frequenciaAngular;

  return {
    resultado: {
      amplitude,
      periodo,
      frequencia: 1 / periodo,
      frequenciaAngular,
    },
    passos: [
      {
        descricao: 'A força da mola é proporcional ao deslocamento, e aponta de volta ao centro.',
        tex: 'F = -k\\,x',
      },
      {
        descricao: 'Pela segunda lei de Newton, isso dá uma equação para a aceleração.',
        tex: `a = -\\frac{k}{m}x = -\\frac{${formatar(constanteElastica)}}{${formatar(massa)}}x`,
      },
      {
        descricao: 'A função cujo "derivar duas vezes" devolve ela mesma com sinal trocado é o cosseno.',
        tex: `x(t) = ${formatar(amplitude)}\\cos(\\omega t)`,
        nota: 'Derivando duas vezes o cosseno, voltamos ao cosseno com sinal negativo.',
      },
      {
        descricao: 'Substituindo, encontramos a frequência angular.',
        tex: `\\omega = \\sqrt{\\frac{k}{m}} = ${formatar(frequenciaAngular)}\\text{ rad/s}`,
      },
      {
        descricao: 'E daí o período da oscilação.',
        tex: `T = \\frac{2\\pi}{\\omega} = ${formatar(periodo)}\\text{ s}`,
        nota: 'O período não depende da amplitude — por isso o pêndulo serve de relógio.',
      },
    ],
  };
}

/** Juros compostos: crescimento exponencial aplicado a dinheiro. */
export function jurosCompostosComPassos(
  capital: number,
  taxaPercentual: number,
  periodos: number,
): Resolucao<number> {
  const taxa = taxaPercentual / 100;
  const montante = capital * (1 + taxa) ** periodos;
  const simples = capital * (1 + taxa * periodos);

  return {
    resultado: montante,
    passos: [
      {
        descricao: 'A cada período, o montante é multiplicado pelo mesmo fator.',
        tex: `1 + ${formatar(taxa)} = ${formatar(1 + taxa)}`,
      },
      {
        descricao: 'Após n períodos, o fator é aplicado n vezes.',
        tex: `M = ${formatar(capital)} \\cdot ${formatar(1 + taxa)}^{${periodos}}`,
      },
      {
        descricao: 'Calculando.',
        tex: `M = ${formatar(montante)}`,
      },
      {
        descricao: 'Nos juros simples, os rendimentos não rendem — o crescimento é linear.',
        tex: `M_{\\text{simples}} = ${formatar(capital)}(1 + ${formatar(taxa)} \\cdot ${periodos}) = ${formatar(simples)}`,
        nota: `A diferença de ${formatar(montante - simples)} é o juro que rendeu sobre juro.`,
      },
    ],
  };
}
