import {
  Quadrica,
  avaliarQuadrica,
  integralDuplaComPassos,
  integralPolarComPassos,
  quadricaParaTex,
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
 * Exercícios de integral múltipla.
 *
 * A integral dupla soma alturas sobre uma região em vez de sobre um intervalo,
 * e no retângulo ela vira duas integrais simples encadeadas. O exercício em
 * polares existe por causa do jacobiano: o fator r que aparece não é detalhe,
 * é o que corrige a área de cada pedacinho.
 */

const CASAS = 3;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 3 casas decimais.';

type Tipo = 'retangulo' | 'volume' | 'media' | 'polar';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['retangulo'],
  medio: ['retangulo', 'volume', 'media'],
  dificil: ['volume', 'media', 'polar'],
  // Em polares entra o jacobiano r, que some com frequência.
  extremo: ['polar', 'media'],
};

export const geradorIntegraisMultiplas: GeradorExercicio<number> = {
  topicoId: 'integrais-multiplas',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'retangulo':
        return doRetangulo(nivel, rng, false);
      case 'volume':
        return doRetangulo(nivel, rng, true);
      case 'media':
        return daMedia(nivel, rng);
      default:
        return daPolar(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

function sortearQuadrica(nivel: Nivel, rng: Rng, positiva: boolean): Quadrica {
  // Quando o enunciado fala em VOLUME, a função precisa ser positiva em toda a
  // região — senão a resposta certa seria negativa, e volume negativo não
  // existe. Sem termos lineares nem misto, e com coeficientes quadráticos não
  // negativos, a quádrica nunca desce abaixo da constante.
  if (positiva) {
    return {
      a: rng.inteiro(0, 3),
      b: rng.inteiro(0, 3),
      c: 0,
      d: 0,
      e: 0,
      f0: rng.inteiro(1, 12),
    };
  }

  return {
    a: rng.inteiro(0, 3),
    b: rng.inteiro(0, 3),
    c: nivel === 'facil' ? 0 : rng.inteiro(-2, 2),
    d: rng.inteiro(-3, 3),
    e: rng.inteiro(-3, 3),
    f0: rng.inteiro(-4, 6),
  };
}

function sortearRetangulo(rng: Rng): { x0: number; x1: number; y0: number; y1: number } {
  const x0 = rng.inteiro(-3, 2);
  const y0 = rng.inteiro(-3, 2);
  return { x0, x1: x0 + rng.inteiro(1, 4), y0, y1: y0 + rng.inteiro(1, 4) };
}

/** A integral dupla sobre um retângulo — como integral e como volume. */
function doRetangulo(nivel: Nivel, rng: Rng, comoVolume: boolean): Exercicio<number> {
  const q = sortearQuadrica(nivel, rng, comoVolume);
  const { x0, x1, y0, y1 } = sortearRetangulo(rng);

  const resolucao = integralDuplaComPassos(q, x0, x1, y0, y1);
  const gabarito = resolucao.resultado;
  const area = (x1 - x0) * (y1 - y0);

  return montar({
    chave: `${comoVolume ? 'vl' : 'rt'}-${q.a}${q.b}${q.c}${q.d}${q.e}${q.f0}-${x0}${x1}${y0}${y1}`,
    nivel,
    rng,
    enunciado: comoVolume
      ? `Qual é o volume sob esta superfície e acima do retângulo de ${x0} a ${x1} em x e de ` +
        `${y0} a ${y1} em y? ${PEDIDO}`
      : `Calcule a integral dupla desta função sobre o retângulo de ${x0} a ${x1} em x e de ` +
        `${y0} a ${y1} em y. ${PEDIDO}`,
    enunciadoTex: `f(x,y) = ${quadricaParaTex(q)}`,
    gabarito,
    resolucao,
    conceitos: comoVolume
      ? ['multiplas.volume', 'multiplas.iterada']
      : ['multiplas.iterada', 'multiplas.fubini'],
    armadilhas: [
      {
        resposta: avaliarQuadrica(q, (x0 + x1) / 2, (y0 + y1) / 2),
        diagnostico:
          'Esse é o valor da função no centro do retângulo. A integral soma todas as alturas, ' +
          'não apenas uma delas.',
        passo: 0,
        conceito: 'multiplas.iterada',
      },
      {
        resposta: avaliarQuadrica(q, (x0 + x1) / 2, (y0 + y1) / 2) * area,
        diagnostico:
          'Multiplicar a altura do centro pela área só daria o resultado exato se a superfície ' +
          'fosse um plano. Com termos quadráticos, ela não é.',
        passo: 1,
        conceito: 'multiplas.iterada',
      },
      {
        resposta: gabarito / area,
        diagnostico:
          'Esse é o valor MÉDIO da função na região. A integral é esse valor multiplicado pela ' +
          'área, não dividido por ela.',
        passo: 3,
        conceito: 'multiplas.volume',
      },
    ],
    // O volume só é sorteado do Médio em diante; a dica o acompanha na estreia.
    dica:
      nivel === 'facil' || (nivel === 'medio' && comoVolume)
        ? 'Integre primeiro em x, tratando y como constante; depois integre o resultado em y.'
        : undefined,
  });
}

/** O valor médio da função numa região. */
function daMedia(nivel: Nivel, rng: Rng): Exercicio<number> {
  const q = sortearQuadrica(nivel, rng, false);
  const { x0, x1, y0, y1 } = sortearRetangulo(rng);

  const integral = integralDuplaComPassos(q, x0, x1, y0, y1);
  const area = (x1 - x0) * (y1 - y0);
  const gabarito = integral.resultado / area;

  return montar({
    chave: `md-${q.a}${q.b}${q.c}${q.d}${q.e}${q.f0}-${x0}${x1}${y0}${y1}`,
    nivel,
    rng,
    enunciado:
      `Qual é o valor médio desta função sobre o retângulo de ${x0} a ${x1} em x e de ${y0} a ` +
      `${y1} em y? ${PEDIDO}`,
    enunciadoTex: `\\bar{f} = \\frac{1}{A}\\iint_{R} f\\,dA`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...integral.passos.slice(0, 3),
        {
          descricao: 'A integral acumulada sobre a região.',
          tex: `\\iint_{R} f\\,dA = ${texNumero(integral.resultado)}`,
        },
        {
          descricao: `Dividindo pela área da região, que vale ${area}.`,
          tex: `\\bar{f} = \\frac{${texNumero(integral.resultado)}}{${area}} = ${texNumero(gabarito)}`,
          nota: 'É a mesma ideia da média em uma variável, com área no lugar de comprimento.',
        },
      ],
    },
    conceitos: ['multiplas.valor-medio', 'multiplas.iterada'],
    armadilhas: [
      {
        resposta: integral.resultado,
        diagnostico: `Essa é a integral. Falta dividir pela área da região, que vale ${area}.`,
        passo: 4,
        conceito: 'multiplas.valor-medio',
      },
      {
        resposta: integral.resultado * area,
        diagnostico:
          'A área foi multiplicada em vez de dividida. A média é o total distribuído pela ' +
          'região, não concentrado nela.',
        passo: 4,
        conceito: 'multiplas.valor-medio',
      },
      {
        resposta: avaliarQuadrica(q, (x0 + x1) / 2, (y0 + y1) / 2),
        diagnostico:
          'Esse é o valor no centro. Ele coincide com a média apenas em superfícies planas.',
        passo: 0,
        conceito: 'multiplas.valor-medio',
      },
    ],
    dica:
      nivel === 'medio'
        ? `Valor médio = integral dupla dividida pela área do retângulo, (${x1} − ${x0})·(${y1} − ${y0}).`
        : undefined,
  });
}

/** Coordenadas polares e o jacobiano que todo mundo esquece. */
function daPolar(nivel: Nivel, rng: Rng): Exercicio<number> {
  const constante = rng.inteiro(1, 6);
  const raio = rng.inteiro(1, 8);
  const doze = rng.inteiro(1, 12);
  const angulo = (doze / 12) * 2 * Math.PI;

  const resolucao = integralPolarComPassos(constante, raio, angulo);
  const gabarito = resolucao.resultado;

  return montar({
    chave: `pl-${constante}-${raio}-${doze}`,
    nivel,
    rng,
    enunciado:
      `Integre a função constante ${constante} sobre um setor circular de raio ${raio} e ` +
      `ângulo de ${doze} doze avos de volta, usando coordenadas polares. ${PEDIDO}`,
    enunciadoTex: `\\iint_{S} ${constante}\\,dA, \\quad dA = r\\,dr\\,d\\theta`,
    gabarito,
    resolucao,
    conceitos: ['multiplas.polares', 'multiplas.iterada'],
    armadilhas: [
      {
        resposta: constante * angulo * raio,
        diagnostico:
          'Faltou o fator r do jacobiano. Sem ele a integral em r dá apenas o raio, e não a ' +
          'metade do raio ao quadrado — e o resultado deixa de ser uma área.',
        passo: 0,
        conceito: 'multiplas.polares',
      },
      {
        resposta: constante * Math.PI * raio * raio,
        diagnostico: `Essa é a integral sobre o círculo INTEIRO. O setor cobre só ${doze} doze avos dele.`,
        passo: 3,
        conceito: 'multiplas.polares',
      },
      {
        resposta: (angulo * raio * raio) / 2,
        diagnostico: `Faltou multiplicar pela constante ${constante} que está sendo integrada.`,
        passo: 3,
        conceito: 'multiplas.iterada',
      },
    ],
    dica: 'Em polares, o elemento de área traz um fator r — ele é o jacobiano da mudança.',
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
