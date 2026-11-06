import {
  aceleracaoCentripeta,
  formatar as formatarTex,
  movimentoCircularComPassos,
  velocidadeAngular,
  velocidadeTangencial,
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
 * Exercícios de movimento circular uniforme.
 *
 * O tópico existe para desfazer uma confusão específica: velocidade constante
 * em MÓDULO não é velocidade constante. O vetor muda de direção a cada
 * instante, e mudar de direção já é acelerar — daí a aceleração centrípeta,
 * que aponta sempre para o centro e não altera a rapidez.
 */

/**
 * A cadeia período → angular → tangencial → centrípeta → força é uma só, e
 * cada tipo de exercício para num elo diferente dela. Recortar os passos é o
 * que faz a resolução terminar exatamente no que foi perguntado.
 */
function ate(
  base: Exercicio<number>['resolucao'],
  passos: number,
  gabarito: number,
): Exercicio<number>['resolucao'] {
  return { resultado: gabarito, passos: base.passos.slice(0, passos) };
}

const CASAS = 3;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 3 casas decimais.';

type Tipo = 'angular' | 'tangencial' | 'centripeta' | 'forca' | 'frequencia';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['angular', 'frequencia', 'tangencial'],
  medio: ['tangencial', 'centripeta', 'frequencia'],
  dificil: ['centripeta', 'forca', 'tangencial'],
  // A aceleração tangencial coexiste com a centrípeta: são perpendiculares,
  // e a resultante é a composição das duas.
  extremo: ['tangencial', 'forca'],
};

export const geradorMovimentoCircular: GeradorExercicio<number> = {
  topicoId: 'movimento-circular',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'angular':
        return daAngular(nivel, rng);
      case 'tangencial':
        return daTangencial(nivel, rng);
      case 'centripeta':
        return daCentripeta(nivel, rng);
      case 'forca':
        return daForca(nivel, rng);
      default:
        return daFrequencia(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

/** Período para velocidade angular: a conversão mais básica do tópico. */
function daAngular(nivel: Nivel, rng: Rng): Exercicio<number> {
  const periodo = rng.inteiro(1, 60);
  const raio = rng.inteiro(1, 20) / 10;

  const gabarito = velocidadeAngular(periodo);

  return montar({
    chave: `ang-${periodo}-${raio}`,
    nivel,
    rng,
    enunciado:
      `Um ponto descreve uma circunferência com período de ${periodo} s. Qual é a ` +
      `velocidade angular, em rad/s? ${PEDIDO}`,
    enunciadoTex: `T = ${periodo}\\ \\text{s} \\qquad \\omega = \\frac{2\\pi}{T}`,
    gabarito,
    resolucao: ate(movimentoCircularComPassos(periodo, raio, 1), 1, gabarito),
    conceitos: ['circular.periodo-frequencia', 'circular.velocidade-angular'],
    armadilhas: [
      {
        resposta: 1 / periodo,
        diagnostico:
          'Isso é a frequência, em voltas por segundo. A velocidade angular mede radianos por ' +
          'segundo, e uma volta inteira vale 2 pi radianos.',
        passo: 0,
        conceito: 'circular.periodo-frequencia',
      },
      {
        resposta: Math.PI / periodo,
        diagnostico: 'Uma volta completa são 2 pi radianos, não pi. Meia volta é que vale pi.',
        passo: 0,
        conceito: 'circular.velocidade-angular',
      },
      {
        resposta: periodo / (2 * Math.PI),
        diagnostico:
          'A fração está invertida. A velocidade angular é o ângulo dividido pelo tempo, de modo ' +
          'que o período vai no denominador.',
        passo: 0,
        conceito: 'circular.velocidade-angular',
      },
    ],
    dica: nivel === 'facil' ? 'Uma volta inteira são 2 pi radianos.' : undefined,
  });
}

/** Frequência e período, a conversão inversa. */
function daFrequencia(nivel: Nivel, rng: Rng): Exercicio<number> {
  const rotacoesPorMinuto = rng.inteiro(10, 60) * 10;

  const gabarito = (2 * Math.PI * rotacoesPorMinuto) / 60;

  return montar({
    chave: `freq-${rotacoesPorMinuto}`,
    nivel,
    rng,
    enunciado:
      `Um rotor gira a ${rotacoesPorMinuto} rotações por minuto. Qual é a velocidade angular, ` +
      `em rad/s? ${PEDIDO}`,
    enunciadoTex: `n = ${rotacoesPorMinuto}\\ \\text{rpm} \\qquad \\omega = 2\\pi f`,
    gabarito,
    resolucao: daRotacaoPorMinuto(rotacoesPorMinuto, gabarito),
    conceitos: ['circular.periodo-frequencia', 'circular.velocidade-angular'],
    armadilhas: [
      {
        resposta: 2 * Math.PI * rotacoesPorMinuto,
        diagnostico:
          'Faltou converter minutos em segundos. Rotações por minuto precisam ser divididas por ' +
          '60 antes de virarem frequência em hertz.',
        passo: 0,
        conceito: 'circular.periodo-frequencia',
      },
      {
        resposta: rotacoesPorMinuto / 60,
        diagnostico:
          'Isso é a frequência em hertz. Para chegar à velocidade angular, ainda falta ' +
          'multiplicar por 2 pi.',
        passo: 0,
        conceito: 'circular.velocidade-angular',
      },
      {
        resposta: 60 / rotacoesPorMinuto,
        diagnostico: 'Isso é o período, em segundos por volta, e não a velocidade angular.',
        passo: 0,
        conceito: 'circular.periodo-frequencia',
      },
    ],
  });
}

/** Velocidade tangencial: onde o raio entra na conta. */
function daTangencial(nivel: Nivel, rng: Rng): Exercicio<number> {
  const periodo = rng.inteiro(2, 30);
  const raio = rng.inteiro(5, 80) / 10;

  const omega = velocidadeAngular(periodo);
  const gabarito = velocidadeTangencial(omega, raio);

  return montar({
    chave: `tan-${periodo}-${raio}`,
    nivel,
    rng,
    enunciado:
      `Um ponto a ${String(raio).replace('.', ',')} metros do eixo completa uma volta em ` +
      `${periodo} s. Qual é a velocidade tangencial, em m/s? ${PEDIDO}`,
    enunciadoTex: `r = ${String(raio).replace('.', '{,}')}\\ \\text{m} \\qquad T = ${periodo}\\ \\text{s}`,
    gabarito,
    resolucao: ate(movimentoCircularComPassos(periodo, raio, 1), 2, gabarito),
    conceitos: ['circular.velocidade-angular', 'circular.centripeta'],
    armadilhas: [
      {
        resposta: omega,
        diagnostico:
          'Essa é a velocidade angular, em rad/s. Ela é a mesma para todo ponto ' +
          'do corpo; a tangencial cresce com a distância ao eixo.',
        passo: 0,
        conceito: 'circular.velocidade-angular',
      },
      {
        resposta: omega / raio,
        diagnostico:
          'O raio multiplica, não divide. Quanto mais longe do eixo, mais caminho o ponto ' +
          'percorre no mesmo tempo.',
        passo: 1,
        conceito: 'circular.velocidade-angular',
      },
      {
        resposta: raio / periodo,
        diagnostico:
          'Faltou o fator 2 pi: numa volta o ponto percorre a circunferência inteira, que vale ' +
          '2 pi vezes o raio.',
        passo: 0,
        conceito: 'circular.periodo-frequencia',
      },
    ],
  });
}

/** Aceleração centrípeta: a que existe mesmo com rapidez constante. */
function daCentripeta(nivel: Nivel, rng: Rng): Exercicio<number> {
  const periodo = rng.inteiro(2, 40);
  const raio = rng.inteiro(5, 120) / 10;

  const omega = velocidadeAngular(periodo);
  const v = velocidadeTangencial(omega, raio);
  const gabarito = aceleracaoCentripeta(v, raio);

  return montar({
    chave: `cen-${periodo}-${raio}`,
    nivel,
    rng,
    enunciado:
      `Um corpo gira em círculo de ${String(raio).replace('.', ',')} m de raio, com ` +
      `período de ${periodo} s. Qual é a aceleração centrípeta, em m/s ` +
      `ao quadrado? ${PEDIDO}`,
    enunciadoTex: `a_{c} = \\frac{v^{2}}{r} = \\omega^{2}r`,
    gabarito,
    resolucao: ate(movimentoCircularComPassos(periodo, raio, 1), 3, gabarito),
    conceitos: ['circular.centripeta', 'circular.velocidade-angular'],
    armadilhas: [
      {
        resposta: 0,
        diagnostico:
          'A rapidez é constante, mas a velocidade não: o vetor muda de direção a cada instante. ' +
          'Mudar de direção já é acelerar, e é disso que trata a aceleração centrípeta.',
        passo: 2,
        conceito: 'circular.centripeta',
      },
      {
        resposta: v / raio,
        diagnostico:
          'A velocidade entra ao QUADRADO. Dobrar a rapidez quadruplica a aceleração centrípeta, ' +
          'e é por isso que curvas rápidas exigem tanto das estruturas.',
        passo: 2,
        conceito: 'circular.centripeta',
      },
      {
        resposta: omega * omega,
        diagnostico:
          'Faltou multiplicar pelo raio. Na forma com velocidade angular, a aceleração é omega ' +
          'ao quadrado VEZES o raio.',
        passo: 2,
        conceito: 'circular.centripeta',
      },
      {
        resposta: v,
        diagnostico: 'Essa é a velocidade tangencial, não a aceleração.',
        passo: 1,
        conceito: 'circular.velocidade-angular',
      },
    ],
  });
}

/** Força centrípeta: o nome do papel que alguma força já cumpre. */
function daForca(nivel: Nivel, rng: Rng): Exercicio<number> {
  const periodo = rng.inteiro(2, 25);
  const raio = rng.inteiro(5, 100) / 10;
  const massa = rng.inteiro(1, 40) / 2;

  const omega = velocidadeAngular(periodo);
  const v = velocidadeTangencial(omega, raio);
  const aceleracao = aceleracaoCentripeta(v, raio);
  const gabarito = massa * aceleracao;

  return montar({
    chave: `for-${periodo}-${raio}-${massa}`,
    nivel,
    rng,
    enunciado:
      `Um corpo de ${String(massa).replace('.', ',')} kg gira em círculo de ` +
      `${String(raio).replace('.', ',')} m de raio com período de ${periodo} s. ` +
      `Qual é o módulo da força centrípeta, em N? ${PEDIDO}`,
    enunciadoTex: `F_{c} = m\\frac{v^{2}}{r}`,
    gabarito,
    resolucao: ate(movimentoCircularComPassos(periodo, raio, massa), 4, gabarito),
    conceitos: ['circular.forca-centripeta', 'circular.centripeta'],
    armadilhas: [
      {
        resposta: aceleracao,
        diagnostico: 'Faltou multiplicar pela massa: isso é a aceleração, em m/s².',
        passo: 3,
        conceito: 'circular.forca-centripeta',
      },
      {
        resposta: massa * 9.81,
        diagnostico:
          'Esse é o peso do corpo. A força centrípeta não é o peso: é a resultante que aponta ' +
          'para o centro, e pode ser tensão, atrito, normal ou qualquer combinação delas.',
        passo: 3,
        conceito: 'circular.forca-centripeta',
      },
      {
        resposta: massa * v,
        diagnostico:
          'Isso tem unidade de momento linear, não de força. A força centrípeta é massa vezes ' +
          'ACELERAÇÃO centrípeta.',
        passo: 3,
        conceito: 'circular.forca-centripeta',
      },
    ],
    dica: 'Força centrípeta não é uma força nova: é o nome do papel que a resultante cumpre.',
  });
}

/** A conversão de rotações por minuto, que tem passos próprios. */
function daRotacaoPorMinuto(rpm: number, omega: number): Exercicio<number>['resolucao'] {
  const hertz = rpm / 60;

  return {
    resultado: omega,
    passos: [
      {
        descricao: 'Rotações por minuto viram hertz dividindo por 60.',
        tex: `f = \\frac{${rpm}}{60} = ${formatarTex(Number(hertz.toFixed(4)))}\\ \\text{Hz}`,
        nota: 'Hertz é voltas por segundo, e é a unidade que entra na fórmula.',
      },
      {
        descricao: 'Cada volta vale 2 pi radianos.',
        tex: `\\omega = 2\\pi f = ${formatarTex(Number(omega.toFixed(4)))}\\ \\text{rad/s}`,
      },
    ],
  };
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
