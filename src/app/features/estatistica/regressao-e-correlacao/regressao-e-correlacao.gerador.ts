import {
  Par,
  ajustarRetaComPassos,
  covariancia,
  desvioAmostral,
  determinacaoComPassos,
  media,
  pearson,
  pearsonComPassos,
  preverComPassos,
  residuoComPassos,
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
  nivelAoMenos,
  semColisoes,
} from '@core/treino/models/treino.model';

/**
 * Exercícios de regressão e correlação.
 *
 * As duas perguntas vivem juntas e são confundidas o tempo todo: a regressão
 * diz QUAL reta descreve melhor os dados, a correlação diz SE eles realmente
 * seguem uma reta. Os exercícios cobram as duas separadamente, e as armadilhas
 * trocam uma pela outra de propósito.
 */

const CASAS = 4;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 4 casas decimais.';

type Tipo = 'inclinacao' | 'intercepto' | 'pearson' | 'determinacao' | 'prever' | 'residuo';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['inclinacao', 'intercepto'],
  medio: ['inclinacao', 'intercepto', 'pearson', 'prever'],
  dificil: ['pearson', 'determinacao', 'residuo', 'prever'],
  // Pearson percorre as cinco somas; o resíduo exige prever antes de subtrair.
  extremo: ['pearson', 'residuo'],
};

export const geradorRegressaoCorrelacao: GeradorExercicio<number> = {
  topicoId: 'regressao-e-correlacao',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const pares = sortearAmostra(nivel, rng);

    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'inclinacao':
        return daInclinacao(nivel, rng, pares);
      case 'intercepto':
        return doIntercepto(nivel, rng, pares);
      case 'pearson':
        return doPearson(nivel, rng, pares);
      case 'determinacao':
        return daDeterminacao(nivel, rng, pares);
      case 'prever':
        return daPrevisao(nivel, rng, pares);
      default:
        return doResiduo(nivel, rng, pares);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

/**
 * Uma amostra com tendência linear mais ruído.
 *
 * O ruído é de propósito: sem ele, o R² daria 1 em todos os exercícios e a
 * correlação deixaria de informar qualquer coisa.
 */
function sortearAmostra(nivel: Nivel, rng: Rng): readonly Par[] {
  const n = nivel === 'facil' ? 5 : rng.inteiro(5, 8);
  const inclinacao = rng.inteiro(-5, 5) || 2;
  const intercepto = rng.inteiro(-10, 10);
  const ruido = nivel === 'facil' ? 0 : rng.inteiro(1, 4);

  return Array.from({ length: n }, (_, i) => {
    const x = i + 1;
    return { x, y: inclinacao * x + intercepto + (ruido === 0 ? 0 : rng.inteiro(-ruido, ruido)) };
  });
}

/** A inclinação da reta ajustada. */
function daInclinacao(nivel: Nivel, rng: Rng, pares: readonly Par[]): Exercicio<number> {
  const resolucao = ajustarRetaComPassos(pares);
  const gabarito = resolucao.resultado.inclinacao;

  return montar({
    chave: `inc-${chaveDa(pares)}`,
    nivel,
    rng,
    enunciado: `Qual é a inclinação da reta de mínimos quadrados para estes dados? ${PEDIDO}`,
    enunciadoTex: tabelaTex(pares),
    gabarito,
    resolucao: { resultado: gabarito, passos: resolucao.passos },
    conceitos: ['regressao.minimos-quadrados', 'regressao.reta'],
    armadilhas: [
      {
        resposta: resolucao.resultado.intercepto,
        diagnostico:
          'Esse é o intercepto, que é onde a reta corta o eixo vertical. A inclinação é o ' +
          'quanto y muda por unidade de x.',
        passo: 2,
        conceito: 'regressao.reta',
      },
      {
        resposta: pearson(pares),
        diagnostico:
          'Esse é o coeficiente de correlação. Ele e a inclinação têm sempre o mesmo SINAL, mas ' +
          'medem coisas diferentes: um mede a taxa, o outro mede o alinhamento.',
        passo: 1,
        conceito: 'correlacao.pearson',
      },
      {
        resposta: covariancia(pares),
        diagnostico:
          'Essa é a covariância, que ainda carrega as unidades das duas variáveis. A inclinação ' +
          'é ela dividida pela variância de x.',
        passo: 1,
        conceito: 'regressao.minimos-quadrados',
      },
    ],
    dica: nivel === 'facil' ? 'A inclinação é o quanto y avança a cada unidade de x.' : undefined,
  });
}

/** O intercepto: onde a reta corta o eixo vertical. */
function doIntercepto(nivel: Nivel, rng: Rng, pares: readonly Par[]): Exercicio<number> {
  const resolucao = ajustarRetaComPassos(pares);
  const gabarito = resolucao.resultado.intercepto;

  return montar({
    chave: `int-${chaveDa(pares)}`,
    nivel,
    rng,
    enunciado: `Qual é o intercepto da reta de mínimos quadrados para estes dados? ${PEDIDO}`,
    enunciadoTex: tabelaTex(pares),
    gabarito,
    resolucao: { resultado: gabarito, passos: resolucao.passos },
    conceitos: ['regressao.reta', 'regressao.minimos-quadrados'],
    armadilhas: [
      {
        resposta: resolucao.resultado.inclinacao,
        diagnostico: 'Essa é a inclinação, não o intercepto.',
        passo: 2,
        conceito: 'regressao.reta',
      },
      {
        resposta: media(pares.map((par) => par.y)),
        diagnostico:
          'Essa é a média de y. O intercepto só coincide com ela quando a média de x é zero, ' +
          'o que aqui não acontece.',
        passo: 2,
        conceito: 'regressao.reta',
      },
      {
        resposta: pares[0]!.y,
        diagnostico:
          'Esse é o primeiro valor observado. O intercepto é o valor PREVISTO em x igual a ' +
          'zero, que costuma estar fora da faixa medida.',
        passo: 2,
        conceito: 'regressao.extrapolar',
      },
    ],
  });
}

/** O coeficiente de Pearson. */
function doPearson(nivel: Nivel, rng: Rng, pares: readonly Par[]): Exercicio<number> {
  const gabarito = pearson(pares);
  const sx = desvioAmostral(pares.map((par) => par.x));

  return montar({
    chave: `pe-${chaveDa(pares)}`,
    nivel,
    rng,
    enunciado: `Qual é o coeficiente de correlação de Pearson destes dados? ${PEDIDO}`,
    enunciadoTex: tabelaTex(pares),
    gabarito,
    resolucao: pearsonComPassos(pares),
    conceitos: ['correlacao.pearson', 'correlacao.nao-e-causa'],
    armadilhas: [
      {
        resposta: covariancia(pares),
        diagnostico:
          'Essa é a covariância, que depende das unidades. O Pearson é ela normalizada pelos ' +
          'dois desvios padrão, e por isso cabe sempre entre menos um e um.',
        passo: 2,
        conceito: 'correlacao.pearson',
      },
      {
        resposta: gabarito * gabarito,
        diagnostico:
          'Esse é o coeficiente de determinação, que é o QUADRADO do de correlação. Ele nunca é ' +
          'negativo, e por isso perde a informação de sentido.',
        passo: 3,
        conceito: 'correlacao.determinacao',
      },
      {
        resposta: covariancia(pares) / sx,
        diagnostico:
          'A normalização ficou pela metade: é preciso dividir pelos DOIS desvios padrão, o de ' +
          'x e o de y.',
        passo: 2,
        conceito: 'correlacao.pearson',
      },
    ],
  });
}

/** O coeficiente de determinação, e o que ele realmente diz. */
function daDeterminacao(nivel: Nivel, rng: Rng, pares: readonly Par[]): Exercicio<number> {
  const r = pearson(pares);
  const gabarito = r * r;

  return montar({
    chave: `de-${chaveDa(pares)}`,
    nivel,
    rng,
    enunciado:
      'Que fração da variação de y a reta ajustada explica nestes dados? Responda entre 0 e 1, ' +
      'com 4 casas decimais.',
    enunciadoTex: tabelaTex(pares),
    gabarito,
    resolucao: determinacaoComPassos(r),
    conceitos: ['correlacao.determinacao', 'correlacao.pearson'],
    armadilhas: [
      {
        resposta: r,
        diagnostico:
          'Esse é o coeficiente de CORRELAÇÃO. A fração explicada é o quadrado dele — e é por ' +
          'isso que uma correlação de 0,7 explica menos da metade da variação.',
        passo: 0,
        conceito: 'correlacao.determinacao',
      },
      {
        resposta: 1 - gabarito,
        diagnostico: 'Essa é a fração NÃO explicada, que é o que sobra para os resíduos.',
        passo: 2,
        conceito: 'correlacao.determinacao',
      },
      {
        resposta: Math.abs(r),
        diagnostico:
          'Tomar o módulo remove o sinal, mas não é isso que o quadrado faz. A fração explicada ' +
          'é r ao quadrado, que é sempre menor que o módulo quando r está entre 0 e 1.',
        passo: 1,
        conceito: 'correlacao.determinacao',
      },
    ],
  });
}

/** A previsão pela reta — dentro ou fora da faixa observada. */
function daPrevisao(nivel: Nivel, rng: Rng, pares: readonly Par[]): Exercicio<number> {
  const { inclinacao, intercepto } = ajustarRetaComPassos(pares).resultado;
  const xs = pares.map((par) => par.x);
  const faixa = { min: Math.min(...xs), max: Math.max(...xs) };
  const x = nivelAoMenos(nivel, 'dificil')
    ? faixa.max + rng.inteiro(3, 10)
    : rng.inteiro(faixa.min, faixa.max);

  const gabarito = inclinacao * x + intercepto;

  return montar({
    chave: `pr-${chaveDa(pares)}-${x}`,
    nivel,
    rng,
    enunciado: `Use a reta de mínimos quadrados destes dados para prever y quando x vale ${x}. ${PEDIDO}`,
    enunciadoTex: tabelaTex(pares),
    gabarito,
    resolucao: preverComPassos(inclinacao, intercepto, x, faixa),
    conceitos: ['regressao.reta', 'regressao.extrapolar'],
    armadilhas: [
      {
        resposta: inclinacao * x,
        diagnostico: 'Faltou somar o intercepto, que é o valor da reta em x igual a zero.',
        passo: 1,
        conceito: 'regressao.reta',
      },
      {
        resposta: media(pares.map((par) => par.y)),
        diagnostico:
          'Essa é a média de y, que seria a melhor previsão se não houvesse relação nenhuma com ' +
          'x. A reta existe justamente para fazer melhor que isso.',
        passo: 0,
        conceito: 'regressao.reta',
      },
    ],
    dica: nivelAoMenos(nivel, 'dificil')
      ? 'Repare em que faixa de x os dados foram medidos antes de confiar na previsão.'
      : undefined,
  });
}

/** O resíduo de um ponto observado. */
function doResiduo(nivel: Nivel, rng: Rng, pares: readonly Par[]): Exercicio<number> {
  const { inclinacao, intercepto } = ajustarRetaComPassos(pares).resultado;
  const par = rng.escolher(pares);

  const gabarito = par.y - (inclinacao * par.x + intercepto);

  return montar({
    chave: `rs-${chaveDa(pares)}-${par.x}`,
    nivel,
    rng,
    enunciado:
      `Qual é o resíduo do ponto de x igual a ${par.x} em relação à reta de mínimos quadrados ` +
      `destes dados? ${PEDIDO}`,
    enunciadoTex: tabelaTex(pares),
    gabarito,
    resolucao: residuoComPassos(inclinacao, intercepto, par),
    conceitos: ['regressao.residuos', 'regressao.minimos-quadrados'],
    armadilhas: [
      {
        resposta: -gabarito,
        diagnostico:
          'O sinal ficou invertido: o resíduo é o OBSERVADO menos o previsto. Positivo quer ' +
          'dizer que o ponto está acima da reta.',
        passo: 2,
        conceito: 'regressao.residuos',
      },
      {
        resposta: inclinacao * par.x + intercepto,
        diagnostico: 'Esse é o valor previsto pela reta, não o resíduo.',
        passo: 0,
        conceito: 'regressao.residuos',
      },
      {
        resposta: gabarito * gabarito,
        diagnostico:
          'Esse é o resíduo ao quadrado — o que se soma no critério dos mínimos quadrados. O ' +
          'resíduo em si tem sinal.',
        passo: 2,
        conceito: 'regressao.minimos-quadrados',
      },
    ],
  });
}

/** A amostra escrita como tabela, que é como ela chega na prática. */
function tabelaTex(pares: readonly Par[]): string {
  const xs = pares.map((par) => par.x).join(' & ');
  const ys = pares.map((par) => par.y).join(' & ');

  return `\\begin{array}{c|${'c'.repeat(pares.length)}} x & ${xs} \\\\ \\hline y & ${ys} \\end{array}`;
}

function chaveDa(pares: readonly Par[]): string {
  return pares.map((par) => `${par.x}_${par.y}`).join('-');
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
