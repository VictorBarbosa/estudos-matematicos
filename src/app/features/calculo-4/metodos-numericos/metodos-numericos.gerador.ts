import { comparacaoNumericaComPassos, eulerComPassos, rungeKutta4 } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { exercicioNewton } from '@features/calculo-4/metodos-numericos/metodos-numericos.newton';
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
 * Exercícios de solução numérica de EDO.
 *
 * Quase nenhuma equação diferencial real tem solução fechada — o que se faz na
 * prática é integrá-la numericamente. O tópico existe para instalar duas
 * coisas: que o método tem erro, e que esse erro depende do passo de um jeito
 * previsível. Euler erra proporcionalmente ao passo; Runge-Kutta, à quarta
 * potência dele.
 */

const CASAS = 5;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 5 casas decimais.';

type Tipo = 'euler' | 'erro-euler' | 'rk4' | 'ordem' | 'newton';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['euler', 'newton'],
  medio: ['euler', 'erro-euler', 'newton'],
  dificil: ['rk4', 'ordem', 'erro-euler', 'newton'],
  // RK4 são quatro inclinações numa média ponderada: a conta mais longa do
  // tópico, e a que não perdoa um coeficiente trocado. Newton, aqui, pede
  // duas iterações.
  extremo: ['rk4', 'ordem', 'newton'],
};

export const geradorMetodosNumericos: GeradorExercicio<number> = {
  topicoId: 'metodos-numericos',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'euler':
        return doEuler(nivel, rng);
      case 'erro-euler':
        return doErroDeEuler(nivel, rng);
      case 'rk4':
        return doRungeKutta(nivel, rng);
      case 'newton':
        return exercicioNewton(nivel, rng);
      default:
        return daOrdemDoMetodo(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

function sortear(rng: Rng): { k: number; y0: number; passo: number; quantos: number } {
  return {
    k: (rng.inteiro(1, 8) / 10) * rng.sinal(),
    y0: rng.inteiro(1, 20),
    passo: rng.escolher([0.05, 0.1, 0.2, 0.25, 0.5]),
    quantos: rng.inteiro(2, 8),
  };
}

/** O método de Euler, passo a passo. */
function doEuler(nivel: Nivel, rng: Rng): Exercicio<number> {
  const { k, y0, passo, quantos } = sortear(rng);

  let y = y0;
  for (let i = 0; i < quantos; i++) {
    y += passo * k * y;
  }

  return montar({
    chave: `eu-${k}-${y0}-${passo}-${quantos}`,
    nivel,
    rng,
    enunciado:
      `Aplique o método de Euler com passo h = ${String(passo).replace('.', ',')} e ${quantos} ` +
      `passos, partindo de y(0) = ${y0}. Qual é o valor aproximado obtido? ${PEDIDO}`,
    enunciadoTex: `y' = ${formatar(k)}y, \\qquad y_{n+1} = y_{n} + h\\,f(t_{n},\\, y_{n})`,
    gabarito: y,
    resolucao: eulerComPassos(k, y0, passo, quantos),
    conceitos: ['numerico.euler', 'numerico.passo'],
    armadilhas: [
      {
        resposta: y0 * Math.exp(k * passo * quantos),
        diagnostico:
          'Esse é o valor EXATO da solução. O exercício pede o que o método de Euler devolve, ' +
          'que é diferente — e a diferença é justamente o que o tópico estuda.',
        passo: 3,
        conceito: 'numerico.euler',
      },
      {
        resposta: y0 * (1 + k * passo * quantos),
        diagnostico:
          'Isso aplicaria a fórmula de um passo só, com o tempo total. Euler reaplica a ' +
          'tangente a cada passo, sempre a partir do novo valor.',
        passo: 1,
        conceito: 'numerico.euler',
      },
      {
        resposta: y0 + passo * k * y0 * quantos,
        diagnostico:
          'O incremento foi tratado como constante. Na verdade ele muda a cada passo, porque ' +
          'depende do valor atual de y.',
        passo: 1,
        conceito: 'numerico.passo',
      },
    ],
    dica:
      nivel === 'facil'
        ? 'Repita a conta passo a passo, sempre usando o y mais recente.'
        : undefined,
  });
}

/** O erro de Euler frente à solução exata. */
function doErroDeEuler(nivel: Nivel, rng: Rng): Exercicio<number> {
  const { k, y0, passo, quantos } = sortear(rng);

  let euler = y0;
  for (let i = 0; i < quantos; i++) {
    euler += passo * k * euler;
  }

  const exato = y0 * Math.exp(k * passo * quantos);
  const gabarito = Math.abs(exato - euler);

  return montar({
    chave: `er-${k}-${y0}-${passo}-${quantos}`,
    nivel,
    rng,
    enunciado:
      `Com passo h = ${String(passo).replace('.', ',')} e ${quantos} passos, de quanto é o erro ` +
      `do método de Euler frente à solução exata, partindo de y(0) = ${y0}? ${PEDIDO}`,
    enunciadoTex: `y' = ${formatar(k)}y, \\qquad y(t) = ${y0}e^{${formatar(k)}t}`,
    gabarito,
    resolucao: { resultado: gabarito, passos: eulerComPassos(k, y0, passo, quantos).passos },
    conceitos: ['numerico.erro', 'numerico.euler'],
    armadilhas: [
      {
        resposta: exato - euler,
        diagnostico:
          'O erro é medido em módulo. O sinal diria apenas se o método ficou acima ou abaixo da ' +
          'solução verdadeira.',
        passo: 3,
        conceito: 'numerico.erro',
      },
      {
        resposta: euler,
        diagnostico: 'Esse é o valor aproximado, não o erro. O erro é a diferença até o exato.',
        passo: 2,
        conceito: 'numerico.erro',
      },
      {
        resposta: gabarito / exato,
        diagnostico:
          'Esse é o erro RELATIVO. O enunciado pede o erro absoluto, na mesma unidade da grandeza.',
        passo: 3,
        conceito: 'numerico.erro',
      },
    ],
  });
}

/** Runge-Kutta de quarta ordem. */
function doRungeKutta(nivel: Nivel, rng: Rng): Exercicio<number> {
  const { k, y0, passo, quantos } = sortear(rng);

  const gabarito = rungeKutta4(k, y0, passo, quantos);

  return montar({
    chave: `rk-${k}-${y0}-${passo}-${quantos}`,
    nivel,
    rng,
    enunciado:
      `Aplique Runge-Kutta de quarta ordem com passo h = ${String(passo).replace('.', ',')} e ` +
      `${quantos} passos, partindo de y(0) = ${y0}. Qual é o valor obtido? ${PEDIDO}`,
    enunciadoTex: `y' = ${formatar(k)}y, \\qquad y_{n+1} = y_{n} + \\frac{h}{6}\\left(k_{1} + 2k_{2} + 2k_{3} + k_{4}\\right)`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: comparacaoNumericaComPassos(k, y0, passo, quantos).passos,
    },
    conceitos: ['numerico.runge-kutta', 'numerico.erro'],
    armadilhas: [
      {
        resposta: (() => {
          let y = y0;
          for (let i = 0; i < quantos; i++) {
            y += passo * k * y;
          }
          return y;
        })(),
        diagnostico:
          'Esse é o resultado de Euler. Runge-Kutta avalia a inclinação quatro vezes por passo, ' +
          'e por isso acerta muitas casas a mais.',
        passo: 0,
        conceito: 'numerico.runge-kutta',
      },
      {
        resposta: y0 * Math.exp(k * passo * quantos),
        diagnostico:
          'Esse é o valor exato. Runge-Kutta chega muito perto dele, mas não é igual — o erro ' +
          'existe, só é pequeno.',
        passo: 2,
        conceito: 'numerico.erro',
      },
    ],
    dica: 'Cada passo combina quatro inclinações numa média ponderada, com peso dobrado no meio.',
  });
}

/** A ordem do método: como o erro responde ao passo. */
function daOrdemDoMetodo(nivel: Nivel, rng: Rng): Exercicio<number> {
  // A razão entre os erros só se aproxima de 2 no regime assintótico, com
  // passo pequeno. Com h grande ela se afasta, e o exercício passaria a
  // contradizer o que a própria resolução afirma.
  const k = (rng.inteiro(1, 5) / 10) * rng.sinal();
  const y0 = rng.inteiro(1, 10);
  const passo = rng.escolher([0.05, 0.1]);
  const tempo = rng.inteiro(1, 2);

  const quantos = Math.round(tempo / passo);
  const quantosFino = quantos * 2;

  const comPasso = (h: number, n: number): number => {
    let y = y0;
    for (let i = 0; i < n; i++) {
      y += h * k * y;
    }
    return y;
  };

  const exato = y0 * Math.exp(k * tempo);
  const erroGrosso = Math.abs(exato - comPasso(passo, quantos));
  const erroFino = Math.abs(exato - comPasso(passo / 2, quantosFino));

  const gabarito = erroGrosso / erroFino;

  return montar({
    chave: `or-${k}-${y0}-${passo}-${tempo}`,
    nivel,
    rng,
    enunciado:
      `Com Euler, integre de 0 a ${tempo} partindo de y(0) = ${y0}, primeiro com passo ` +
      `${String(passo).replace('.', ',')} e depois com metade dele. Por qual fator o erro foi ` +
      `dividido? ${PEDIDO}`,
    enunciadoTex: `y' = ${formatar(k)}y`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `Com passo ${String(passo).replace('.', ',')}, o erro é este.`,
          tex: `e_{1} = ${texNumero(erroGrosso)}`,
        },
        {
          descricao: 'Com metade do passo, e o dobro de iterações.',
          tex: `e_{2} = ${texNumero(erroFino)}`,
        },
        {
          descricao: 'A razão entre os dois erros.',
          tex: `\\frac{e_{1}}{e_{2}} = ${texNumero(gabarito)}`,
          nota: 'Perto de 2: Euler é de primeira ordem, e o erro cai junto com o passo.',
        },
        {
          descricao: 'Com Runge-Kutta de quarta ordem, a razão seria bem outra.',
          tex: '2^{4} = 16',
          nota: 'É isso que quer dizer "ordem do método": o expoente com que o erro responde ao passo.',
        },
      ],
    },
    conceitos: ['numerico.ordem', 'numerico.erro'],
    armadilhas: [
      {
        resposta: 16,
        diagnostico:
          'Dezesseis é o fator de um método de QUARTA ordem, como o Runge-Kutta. Euler é de ' +
          'primeira, e por isso o erro cai só pela metade.',
        passo: 2,
        conceito: 'numerico.ordem',
      },
      {
        resposta: 4,
        diagnostico:
          'Quatro seria um método de segunda ordem. A ordem de Euler é 1, e o fator ' +
          'correspondente é 2.',
        passo: 2,
        conceito: 'numerico.ordem',
      },
      {
        resposta: erroGrosso - erroFino,
        diagnostico:
          'O enunciado pede o FATOR, que é a razão entre os erros, e não a diferença entre eles.',
        passo: 2,
        conceito: 'numerico.erro',
      },
    ],
  });
}

function texNumero(valor: number): string {
  return String(Number(valor.toFixed(8))).replace('.', '{,}');
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
