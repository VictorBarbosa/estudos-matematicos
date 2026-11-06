import {
  linearPrimeiraOrdemComPassos,
  meiaVidaComPassos,
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
 * Exercícios de EDO de primeira ordem.
 *
 * Duas técnicas cobrem quase tudo: separar variáveis e usar fator integrante.
 * O que os exercícios cobram além da conta é a distinção entre solução GERAL e
 * solução PARTICULAR — a condição inicial não é um detalhe do enunciado, é o
 * que escolhe uma função dentro de uma família infinita.
 */

const CASAS = 4;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 4 casas decimais.';

type Tipo = 'separavel' | 'meia-vida' | 'linear' | 'equilibrio';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['separavel'],
  medio: ['separavel', 'meia-vida', 'linear'],
  dificil: ['linear', 'equilibrio', 'meia-vida'],
  // A linear pede fator integrante; o equilíbrio, analisar a estabilidade.
  extremo: ['linear', 'equilibrio'],
};

export const geradorEdoPrimeiraOrdem: GeradorExercicio<number> = {
  topicoId: 'edo-primeira-ordem',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'separavel':
        return daSeparavel(nivel, rng);
      case 'meia-vida':
        return daMeiaVida(nivel, rng);
      case 'linear':
        return daLinear(nivel, rng);
      default:
        return doEquilibrio(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

/** `y' = ky`: a EDO mais importante que existe. */
function daSeparavel(nivel: Nivel, rng: Rng): Exercicio<number> {
  const k = (rng.inteiro(1, 8) / 10) * (nivel === 'facil' ? 1 : rng.sinal());
  const y0 = rng.inteiro(1, 40) * 5;
  const t = rng.inteiro(1, 8);

  const gabarito = y0 * Math.exp(k * t);

  return montar({
    chave: `sep-${k}-${y0}-${t}`,
    nivel,
    rng,
    enunciado:
      `Uma grandeza obedece a esta equação, com valor inicial ${y0}. Quanto ela vale em ` +
      `t = ${t}? ${PEDIDO}`,
    enunciadoTex: `\\frac{dy}{dt} = ${formatar(k)}y, \\qquad y(0) = ${y0}`,
    gabarito,
    resolucao: separavelExponencialComPassos(k, y0, t),
    conceitos: ['edo1.separavel', 'edo1.condicao-inicial'],
    armadilhas: [
      {
        resposta: y0 * (1 + k * t),
        diagnostico:
          'A solução de uma EDO exponencial não é linear. Crescer a uma taxa PROPORCIONAL ao ' +
          'que já há produz uma exponencial, não uma reta.',
        passo: 2,
        conceito: 'edo1.separavel',
      },
      {
        resposta: Math.exp(k * t),
        diagnostico: `Faltou a condição inicial. Ela multiplica a exponencial, e aqui vale ${y0}.`,
        passo: 3,
        conceito: 'edo1.condicao-inicial',
      },
      {
        resposta: y0 * Math.exp(k),
        diagnostico:
          'O tempo não entrou no expoente: ele multiplica a taxa, e o produto é que vai lá em ' +
          'cima.',
        passo: 4,
        conceito: 'edo1.separavel',
      },
    ],
    dica:
      nivel === 'facil' ? 'Separe as variáveis, integre os dois lados e exponencie.' : undefined,
  });
}

/** A meia-vida, que não depende da quantidade inicial. */
function daMeiaVida(nivel: Nivel, rng: Rng): Exercicio<number> {
  const k = -rng.inteiro(1, 60) / 100;

  const gabarito = Math.log(2) / Math.abs(k);

  return montar({
    chave: `mv-${k}`,
    nivel,
    rng,
    enunciado:
      `Uma substância decai segundo esta equação, com t em anos. Qual é a meia-vida dela, em ` +
      `anos? ${PEDIDO}`,
    enunciadoTex: `\\frac{dy}{dt} = ${formatar(k)}y`,
    gabarito,
    resolucao: meiaVidaComPassos(k),
    conceitos: ['edo1.meia-vida', 'edo1.separavel'],
    armadilhas: [
      {
        resposta: 1 / Math.abs(k),
        diagnostico:
          'Esse é o tempo característico, em que resta uma fração 1/e do inicial. A meia-vida ' +
          'traz um fator logaritmo de 2.',
        passo: 2,
        conceito: 'edo1.meia-vida',
      },
      {
        resposta: 0.5 / Math.abs(k),
        diagnostico:
          'A metade entra dentro do logaritmo, não como fator. Resolver a equação exponencial ' +
          'exige aplicar o logaritmo aos dois lados.',
        passo: 1,
        conceito: 'edo1.meia-vida',
      },
      {
        resposta: Math.log(2) * Math.abs(k),
        diagnostico: 'A taxa divide, não multiplica: quanto maior ela for, mais curta a meia-vida.',
        passo: 2,
        conceito: 'edo1.meia-vida',
      },
    ],
  });
}

/** `y' + py = q`: fator integrante, transiente e regime permanente. */
function daLinear(nivel: Nivel, rng: Rng): Exercicio<number> {
  const p = rng.inteiro(1, 10) / 10;
  const q = rng.inteiro(1, 40);
  const y0 = rng.inteiro(0, 60);
  const t = rng.inteiro(1, 10);

  const equilibrio = q / p;
  const gabarito = equilibrio + (y0 - equilibrio) * Math.exp(-p * t);

  return montar({
    chave: `lin-${p}-${q}-${y0}-${t}`,
    nivel,
    rng,
    enunciado: `Resolva esta equação com y(0) igual a ${y0} e calcule y(${t}). ${PEDIDO}`,
    enunciadoTex: `y' + ${formatar(p)}y = ${formatar(q)}, \\qquad y(0) = ${y0}`,
    gabarito,
    resolucao: linearPrimeiraOrdemComPassos(p, q, y0, t),
    conceitos: ['edo1.fator-integrante', 'edo1.regime-permanente'],
    armadilhas: [
      {
        resposta: equilibrio,
        diagnostico:
          'Esse é o regime permanente, que só é atingido quando t tende ao infinito. Em tempo ' +
          'finito ainda sobra o transiente.',
        passo: 3,
        conceito: 'edo1.regime-permanente',
      },
      {
        resposta: y0 * Math.exp(-p * t),
        diagnostico:
          'Essa é a solução da equação HOMOGÊNEA, sem o termo constante do lado direito. Ele ' +
          'acrescenta o regime permanente à solução.',
        passo: 3,
        conceito: 'edo1.fator-integrante',
      },
      {
        resposta: equilibrio + (y0 - equilibrio) * Math.exp(p * t),
        diagnostico:
          'O sinal no expoente ficou invertido. O transiente DECAI, e por isso o expoente é ' +
          'negativo.',
        passo: 3,
        conceito: 'edo1.fator-integrante',
      },
    ],
  });
}

/** O regime permanente: para onde a solução caminha. */
function doEquilibrio(nivel: Nivel, rng: Rng): Exercicio<number> {
  const p = rng.inteiro(1, 12) / 10;
  const q = rng.inteiro(1, 60);
  const y0 = rng.inteiro(0, 80);

  const gabarito = q / p;

  return montar({
    chave: `eq-${p}-${q}-${y0}`,
    nivel,
    rng,
    enunciado:
      `Para onde a solução desta equação tende quando o tempo cresce, com y(0) igual a ${y0}? ` +
      PEDIDO,
    enunciadoTex: `y' + ${formatar(p)}y = ${formatar(q)}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'No regime permanente, a grandeza para de mudar.',
          tex: `y' = 0 \\;\\Longrightarrow\\; ${formatar(p)}y = ${formatar(q)}`,
          nota: 'É o estado em que entrada e saída se equilibram.',
        },
        {
          descricao: 'Isolando y.',
          tex: `y_{\\infty} = \\frac{${formatar(q)}}{${formatar(p)}} = ${texNumero(gabarito)}`,
        },
        {
          descricao: 'A condição inicial não altera o destino, só o caminho.',
          tex: `y(t) = ${texNumero(gabarito)} + \\left(${y0} - ${texNumero(gabarito)}\\right)e^{-${formatar(p)}t}`,
          nota: 'O transiente decai a zero, e o que sobra é sempre o mesmo valor.',
        },
      ],
    },
    conceitos: ['edo1.regime-permanente', 'edo1.fator-integrante'],
    armadilhas: [
      {
        resposta: y0,
        diagnostico:
          'O valor inicial não é o destino. Ele define de onde a solução parte; para onde ela ' +
          'vai depende só dos coeficientes da equação.',
        passo: 2,
        conceito: 'edo1.regime-permanente',
      },
      {
        resposta: p / q,
        diagnostico:
          'A razão está invertida: no equilíbrio, y é o termo constante dividido pelo coeficiente.',
        passo: 1,
        conceito: 'edo1.regime-permanente',
      },
      {
        resposta: 0,
        diagnostico:
          'A solução só tenderia a zero se o lado direito fosse zero. Com um termo constante, ' +
          'ela se acomoda num valor diferente dele.',
        passo: 0,
        conceito: 'edo1.regime-permanente',
      },
    ],
    dica: 'No equilíbrio a derivada zera — e isso transforma a EDO numa equação comum.',
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
