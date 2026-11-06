import {
  linearPrimeiraOrdemComPassos,
  meiaVidaComPassos,
  raizesCaracteristicas,
  segundaOrdemComPassos,
  separavelExponencialComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import {
  FORMATO_NUMERICO_AMPLO,
  analisarNumero,
  numeroComCasas,
} from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Armadilha,
  Exercicio,
  GeradorExercicio,
  Nivel,
  semColisoes,
} from '@core/treino/models/treino.model';

/**
 * Exercícios de aplicação de EDO.
 *
 * O trabalho aqui é o inverso do dos tópicos anteriores: em vez de receber a
 * equação, é preciso MONTÁ-LA a partir do enunciado — e essa é a habilidade
 * que a engenharia cobra. Resfriamento, decaimento, circuito e massa-mola são
 * quatro situações distintas que levam às mesmas três ou quatro equações.
 */

const CASAS = 4;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 4 casas decimais.';

type Tipo = 'resfriamento' | 'decaimento' | 'circuito-rl' | 'mola' | 'tanque';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['decaimento', 'resfriamento'],
  medio: ['resfriamento', 'circuito-rl', 'tanque'],
  dificil: ['circuito-rl', 'mola', 'tanque'],
  // Tanque e mola exigem montar a equação a partir do enunciado antes de
  // resolvê-la: a modelagem é a dificuldade.
  extremo: ['tanque', 'mola'],
};

export const geradorAplicacoesDeEdo: GeradorExercicio<number> = {
  topicoId: 'aplicacoes-de-edo',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'resfriamento':
        return doResfriamento(nivel, rng);
      case 'decaimento':
        return doDecaimento(nivel, rng);
      case 'circuito-rl':
        return doCircuito(nivel, rng);
      case 'mola':
        return daMola(nivel, rng);
      default:
        return doTanque(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

/** A lei de resfriamento de Newton, que é uma linear de primeira ordem. */
function doResfriamento(nivel: Nivel, rng: Rng): Exercicio<number> {
  const ambiente = rng.inteiro(15, 30);
  const inicial = ambiente + rng.inteiro(30, 70);
  const k = rng.inteiro(2, 20) / 100;
  const t = rng.inteiro(1, 20);

  const gabarito = ambiente + (inicial - ambiente) * Math.exp(-k * t);

  return montar({
    chave: `res-${ambiente}-${inicial}-${k}-${t}`,
    nivel,
    rng,
    enunciado:
      `Um corpo a ${inicial} °C é deixado num ambiente a ${ambiente} °C, e sua temperatura ` +
      `obedece à lei de resfriamento de Newton com constante ${String(k).replace('.', ',')} por ` +
      `minuto. Qual é a temperatura em ${t} minutos, em °C? ${PEDIDO}`,
    enunciadoTex: `\\frac{dT}{dt} = -${formatar(k)}\\left(T - ${ambiente}\\right)`,
    gabarito,
    resolucao: linearPrimeiraOrdemComPassos(k, k * ambiente, inicial, t),
    conceitos: ['aplicacoes.montar', 'aplicacoes.resfriamento'],
    armadilhas: [
      {
        resposta: inicial * Math.exp(-k * t),
        diagnostico:
          'O que decai exponencialmente é a DIFERENÇA para o ambiente, não a temperatura em si. ' +
          'Um corpo não esfria até o zero da escala Celsius.',
        passo: 3,
        conceito: 'aplicacoes.resfriamento',
      },
      {
        resposta: ambiente,
        diagnostico:
          'Essa é a temperatura final, atingida só no limite. Em tempo finito ainda resta ' +
          'diferença.',
        passo: 4,
        conceito: 'aplicacoes.resfriamento',
      },
      {
        resposta: ambiente + (inicial - ambiente) * (1 - k * t),
        diagnostico:
          'O decaimento é exponencial, não linear. A aproximação linear só vale para tempos ' +
          'muito curtos.',
        passo: 3,
        conceito: 'aplicacoes.montar',
      },
    ],
    dica:
      nivel === 'facil'
        ? 'Chame de u a diferença para o ambiente: ela obedece à equação exponencial simples.'
        : undefined,
  });
}

/** Decaimento radioativo, a partir da meia-vida. */
function doDecaimento(nivel: Nivel, rng: Rng): Exercicio<number> {
  const meiaVida = rng.inteiro(2, 60);
  const inicial = rng.inteiro(10, 100) * 10;
  const t = rng.inteiro(1, 5) * meiaVida;

  const k = Math.log(2) / meiaVida;
  const gabarito = inicial * Math.exp(-k * t);

  return montar({
    chave: `dec-${meiaVida}-${inicial}-${t}`,
    nivel,
    rng,
    enunciado:
      `Uma amostra de ${inicial} g tem meia-vida de ${meiaVida} anos. Quanto resta depois de ` +
      `${t} anos, em g? ${PEDIDO}`,
    enunciadoTex: `\\frac{dm}{dt} = -km, \\qquad k = \\frac{\\ln 2}{${meiaVida}}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...meiaVidaComPassos(-k).passos.slice(0, 2),
        {
          descricao: `Da meia-vida de ${meiaVida} anos sai a constante de decaimento.`,
          tex: `k = \\frac{\\ln 2}{${meiaVida}} = ${texNumero(k)}`,
        },
        ...separavelExponencialComPassos(-k, inicial, t).passos.slice(3),
      ],
    },
    conceitos: ['aplicacoes.decaimento', 'aplicacoes.montar'],
    armadilhas: [
      {
        resposta: inicial / (t / meiaVida),
        diagnostico:
          'O decaimento não divide a massa pelo número de meias-vidas: ele a divide por DOIS a ' +
          'cada meia-vida, o que é exponencial.',
        passo: 3,
        conceito: 'aplicacoes.decaimento',
      },
      {
        resposta: inicial - (inicial * t) / (2 * meiaVida),
        diagnostico:
          'A perda não é constante no tempo: ela é proporcional ao que ainda resta, e por isso ' +
          'diminui conforme a amostra encolhe.',
        passo: 2,
        conceito: 'aplicacoes.decaimento',
      },
      {
        resposta: 0,
        diagnostico:
          'A exponencial nunca chega exatamente a zero, por mais tempo que passe — ela só se ' +
          'aproxima dele.',
        passo: 4,
        conceito: 'aplicacoes.decaimento',
      },
    ],
  });
}

/** Circuito RL: corrente subindo até o regime permanente. */
function doCircuito(nivel: Nivel, rng: Rng): Exercicio<number> {
  const resistencia = rng.inteiro(2, 50);
  const indutancia = rng.inteiro(1, 20) / 10;
  const tensao = rng.inteiro(5, 48);
  const t = rng.inteiro(1, 20) / 100;

  const final = tensao / resistencia;
  const gabarito = final * (1 - Math.exp((-resistencia / indutancia) * t));

  return montar({
    chave: `rl-${resistencia}-${indutancia}-${tensao}-${t}`,
    nivel,
    rng,
    enunciado:
      `Num circuito RL com R = ${resistencia} Ω, L = ${String(indutancia).replace('.', ',')} H e ` +
      `tensão de ${tensao} V, ligado em t = 0 com corrente inicial nula, qual é a corrente em ` +
      `t = ${String(t).replace('.', ',')} s, em A? ${PEDIDO}`,
    enunciadoTex: `L\\frac{di}{dt} + Ri = V`,
    gabarito,
    resolucao: linearPrimeiraOrdemComPassos(resistencia / indutancia, tensao / indutancia, 0, t),
    conceitos: ['aplicacoes.circuito', 'aplicacoes.montar'],
    armadilhas: [
      {
        resposta: final,
        diagnostico:
          'Essa é a corrente de regime permanente, atingida só depois de muitas constantes de ' +
          'tempo. O indutor se opõe à variação, e a subida leva tempo.',
        passo: 3,
        conceito: 'aplicacoes.circuito',
      },
      {
        resposta: final * Math.exp((-resistencia / indutancia) * t),
        diagnostico:
          'Essa é a curva de DESCIDA. Partindo de corrente nula, o que cresce é o complemento: ' +
          'um menos a exponencial.',
        passo: 3,
        conceito: 'aplicacoes.circuito',
      },
      {
        resposta: tensao / indutancia,
        diagnostico:
          'A corrente final é a tensão dividida pela RESISTÊNCIA. A indutância aparece só na ' +
          'constante de tempo, que diz quão rápido se chega lá.',
        passo: 3,
        conceito: 'aplicacoes.montar',
      },
    ],
    dica: 'A constante de tempo é L dividido por R, e a corrente final é V sobre R.',
  });
}

/** Massa-mola com amortecimento: a EDO de segunda ordem na prática. */
function daMola(nivel: Nivel, rng: Rng): Exercicio<number> {
  const massa = rng.inteiro(1, 5);
  const amortecimento = rng.inteiro(1, 6);
  const rigidez = rng.inteiro(Math.ceil((amortecimento * amortecimento) / (4 * massa)) + 1, 40);
  const x0 = rng.inteiro(1, 10) / 10;
  const t = rng.inteiro(1, 10) / 10;

  const b = amortecimento / massa;
  const c = rigidez / massa;
  const raizes = raizesCaracteristicas(b, c);
  const gabarito =
    Math.exp(raizes.real * t) *
    (x0 * Math.cos(raizes.imaginaria * t) +
      ((0 - raizes.real * x0) / raizes.imaginaria) * Math.sin(raizes.imaginaria * t));

  return montar({
    chave: `mol-${massa}-${amortecimento}-${rigidez}-${x0}-${t}`,
    nivel,
    rng,
    enunciado:
      `Uma massa de ${massa} kg presa a uma mola de constante ${rigidez} N/m, com amortecimento ` +
      `${amortecimento} N·s/m, é solta do repouso a ${String(x0).replace('.', ',')} m do ` +
      `equilíbrio. Qual é a posição em t = ${String(t).replace('.', ',')} s, em m? ${PEDIDO}`,
    enunciadoTex: `m\\ddot{x} + c\\dot{x} + kx = 0`,
    gabarito,
    resolucao: segundaOrdemComPassos(b, c, x0, 0, t),
    conceitos: ['aplicacoes.mola', 'aplicacoes.montar'],
    armadilhas: [
      {
        resposta: x0 * Math.cos(Math.sqrt(rigidez / massa) * t),
        diagnostico:
          'O amortecimento foi ignorado. Sem ele a amplitude não decairia e a frequência seria ' +
          'a natural, que é maior que a amortecida.',
        passo: 2,
        conceito: 'aplicacoes.mola',
      },
      {
        resposta: x0,
        diagnostico:
          'Essa é a posição inicial. A massa foi solta do repouso, mas a mola age desde o ' +
          'primeiro instante.',
        passo: 3,
        conceito: 'aplicacoes.mola',
      },
      {
        resposta: x0 * Math.exp(raizes.real * t),
        diagnostico:
          'Essa é só a envoltória, que limita a amplitude. A posição oscila dentro dela.',
        passo: 2,
        conceito: 'aplicacoes.mola',
      },
    ],
  });
}

/** Tanque com entrada e saída: mistura, que é a linear de primeira ordem clássica. */
function doTanque(nivel: Nivel, rng: Rng): Exercicio<number> {
  const volume = rng.inteiro(10, 60) * 10;
  const vazao = rng.inteiro(2, 20);
  const concentracao = rng.inteiro(1, 10) / 10;
  const inicial = rng.inteiro(0, 30);
  const t = rng.inteiro(5, 60);

  const p = vazao / volume;
  const q = vazao * concentracao;
  const final = q / p;
  const gabarito = final + (inicial - final) * Math.exp(-p * t);

  return montar({
    chave: `tq-${volume}-${vazao}-${concentracao}-${inicial}-${t}`,
    nivel,
    rng,
    enunciado:
      `Um tanque com ${volume} L de água recebe ${vazao} L/min de solução a ` +
      `${String(concentracao).replace('.', ',')} kg/L e escoa na mesma vazão, bem misturado. ` +
      `Com ${inicial} kg de sal no início, quanto sal há em ${t} min, em kg? ${PEDIDO}`,
    enunciadoTex: `\\frac{dS}{dt} = ${formatar(q)} - \\frac{${vazao}}{${volume}}S`,
    gabarito,
    resolucao: linearPrimeiraOrdemComPassos(p, q, inicial, t),
    conceitos: ['aplicacoes.mistura', 'aplicacoes.montar'],
    armadilhas: [
      {
        resposta: final,
        diagnostico:
          'Essa é a quantidade de equilíbrio, atingida só no limite. Em tempo finito ainda há ' +
          'transiente.',
        passo: 4,
        conceito: 'aplicacoes.mistura',
      },
      {
        resposta: inicial + q * t,
        diagnostico:
          'A saída foi esquecida. O tanque escoa na mesma vazão, e o que sai leva sal junto, ' +
          'proporcionalmente ao que já há dentro.',
        passo: 0,
        conceito: 'aplicacoes.montar',
      },
      {
        resposta: inicial * Math.exp(-p * t),
        diagnostico:
          'Essa é a solução sem a entrada, em que o sal só seria lavado para fora. A entrada ' +
          'acrescenta a parcela constante.',
        passo: 3,
        conceito: 'aplicacoes.mistura',
      },
    ],
    dica: 'A taxa de entrada é constante; a de saída é proporcional ao que há no tanque.',
  });
}

function texNumero(valor: number): string {
  return String(Number(valor.toFixed(6))).replace('.', '{,}');
}

interface Pedido {
  readonly chave: string;
  readonly nivel: Nivel;
  readonly rng: Rng;
  readonly enunciado: string;
  readonly enunciadoTex: string;
  readonly gabarito: number;
  readonly resolucao: Exercicio<number>['resolucao'];
  readonly conceitos: readonly string[];
  readonly armadilhas: readonly Armadilha<number>[];
  readonly dica?: string;
}

function montar(pedido: Pedido): Exercicio<number> {
  return {
    id: `${pedido.chave}-${pedido.rng.inteiro(0, 9999)}`,
    nivel: pedido.nivel,
    enunciado: pedido.enunciado,
    enunciadoTex: pedido.enunciadoTex,
    gabarito: pedido.gabarito,
    resolucao: pedido.resolucao,
    conceitos: pedido.conceitos,
    armadilhas: semColisoes(
      pedido.armadilhas.filter((armadilha) => Number.isFinite(armadilha.resposta)),
      pedido.gabarito,
      saoEquivalentes,
    ),
    dica: pedido.dica,
  };
}
