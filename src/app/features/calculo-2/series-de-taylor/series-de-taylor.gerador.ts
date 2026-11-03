import {
  FUNCAO_TEX,
  FuncaoDeSerie,
  NOME_DA_SERIE,
  avaliarMaclaurin,
  coeficienteComPassos,
  coeficienteDeMaclaurin,
  cotaDeLagrangeComPassos,
  erroDaAproximacaoComPassos,
  fatorial,
  maclaurinComPassos,
  taylorDaRaizComPassos,
  valorDaFuncaoDeSerie,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import {
  FORMATO_NUMERICO_AMPLO,
  analisarNumero,
  numeroComCasas,
} from '@core/treino/resposta-numerica/resposta-numerica';
import { Armadilha, Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

/**
 * Exercícios de série de Taylor e de Maclaurin.
 *
 * As três perguntas do tópico são distintas e vão sendo cobradas nessa ordem:
 * qual é o coeficiente, quanto vale a aproximação, e de quanto é o erro. A
 * última é a que separa quem decorou a fórmula de quem sabe usá-la, porque na
 * prática o valor exato nunca está disponível — se estivesse, não haveria por
 * que aproximar.
 */

const CASAS = 5;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 5 casas decimais.';

/** Os pontos de avaliação, respeitando o raio de cada série. */
const PONTOS_AMPLOS: readonly number[] = [-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2];
const PONTOS_ESTREITOS: readonly number[] = [-0.75, -0.5, -0.25, 0.25, 0.5, 0.75];

const TODAS: readonly FuncaoDeSerie[] = ['exp', 'sen', 'cos', 'ln1x', 'geometrica'];
const SEM_RAIO: readonly FuncaoDeSerie[] = ['exp', 'sen', 'cos'];

type Tipo = 'coeficiente' | 'aproximar' | 'erro' | 'lagrange' | 'raiz';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['coeficiente', 'aproximar'],
  medio: ['coeficiente', 'aproximar', 'erro'],
  dificil: ['aproximar', 'erro', 'lagrange', 'raiz'],
};

export const geradorSeriesDeTaylor: GeradorExercicio<number> = {
  topicoId: 'series-de-taylor',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'coeficiente':
        return doCoeficiente(nivel, rng);
      case 'aproximar':
        return daAproximacao(nivel, rng);
      case 'erro':
        return doErro(nivel, rng);
      case 'lagrange':
        return daCota(nivel, rng);
      default:
        return daRaiz(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

/** Qual é o coeficiente de xⁿ — a pergunta que checa o padrão das derivadas. */
function doCoeficiente(nivel: Nivel, rng: Rng): Exercicio<number> {
  const funcao = rng.escolher(TODAS);
  const n = rng.inteiro(nivel === 'facil' ? 1 : 2, nivel === 'facil' ? 4 : 6);

  const gabarito = coeficienteDeMaclaurin(funcao, n);

  return montar({
    chave: `coef-${funcao}-${n}`,
    nivel,
    rng,
    enunciado: `Qual é o coeficiente de x elevado a ${n} na série de Maclaurin desta função? ${PEDIDO}`,
    enunciadoTex: FUNCAO_TEX[funcao],
    gabarito,
    resolucao: coeficienteComPassos(funcao, n),
    conceitos: ['taylor.coeficientes', 'taylor.series-conhecidas'],
    armadilhas: [
      {
        resposta: -gabarito,
        diagnostico:
          'O sinal alterna, e a ordem do termo decide qual é. Vale escrever os primeiros ' +
          'termos da série e conferir em qual deles o sinal vira.',
        passo: 1,
        conceito: 'taylor.series-conhecidas',
      },
      {
        resposta: 1 / fatorial(n),
        diagnostico:
          `O denominador nem sempre é ${n} fatorial. No logaritmo e na geométrica ele é outro, ` +
          'porque as derivadas sucessivas seguem um padrão diferente.',
        passo: 0,
        conceito: 'taylor.coeficientes',
      },
      {
        resposta: gabarito * fatorial(n),
        diagnostico:
          'Isso é a derivada de ordem n em zero, e não o coeficiente. Falta dividir pelo ' +
          'fatorial da ordem, que é o que a fórmula manda.',
        passo: 0,
        conceito: 'taylor.coeficientes',
      },
      {
        resposta: 0,
        diagnostico:
          'O coeficiente só é zero quando a paridade da função elimina o termo: o seno não tem ' +
          'potências pares, o cosseno não tem ímpares. Fora disso, há coeficiente.',
        passo: 2,
        conceito: 'taylor.series-conhecidas',
      },
    ],
    dica: nivel === 'facil' ? 'Escreva os primeiros termos da série e localize o termo pedido.' : undefined,
  });
}

/** Quanto vale a aproximação — a pergunta operacional. */
function daAproximacao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const funcao = rng.escolher(TODAS);
  const x = rng.escolher(pontosDe(funcao));
  const grau = rng.inteiro(1, nivel === 'facil' ? 3 : 5);

  const gabarito = avaliarMaclaurin(funcao, grau, x);
  const exato = valorDaFuncaoDeSerie(funcao, x);

  return montar({
    chave: `apx-${funcao}-${grau}-${x}`,
    nivel,
    rng,
    enunciado:
      `Use o polinômio de Maclaurin de grau ${grau} para aproximar esta função em ` +
      `x = ${String(x).replace('.', ',')}. ${PEDIDO}`,
    enunciadoTex: FUNCAO_TEX[funcao],
    gabarito,
    resolucao: maclaurinComPassos(funcao, grau, x),
    conceitos: ['taylor.polinomio', 'taylor.series-conhecidas'],
    armadilhas: [
      {
        resposta: exato,
        diagnostico:
          'Esse é o valor exato da função, não o da aproximação. O exercício pede o que o ' +
          'polinômio devolve, justamente para que a diferença entre os dois fique visível.',
        passo: 2,
        conceito: 'taylor.polinomio',
      },
      {
        resposta: avaliarMaclaurin(funcao, grau - 1, x),
        diagnostico:
          `O polinômio parou um grau antes. Grau ${grau} inclui o termo de ordem ${grau}, e é ` +
          'justamente o último termo que mais muda o resultado.',
        passo: 1,
        conceito: 'taylor.polinomio',
      },
      {
        resposta: avaliarMaclaurin(funcao, grau + 1, x),
        diagnostico:
          `Entrou um termo a mais do que o grau ${grau} permite. A aproximação fica melhor, mas ` +
          'não é a que o enunciado pediu.',
        passo: 1,
        conceito: 'taylor.polinomio',
      },
    ],
  });
}

/** De quanto é o erro — a pergunta que o tópico existe para responder. */
function doErro(nivel: Nivel, rng: Rng): Exercicio<number> {
  const funcao = rng.escolher(TODAS);
  const x = rng.escolher(pontosDe(funcao).filter((ponto) => Math.abs(ponto) >= 0.5));
  const grau = rng.inteiro(1, 3);

  const aproximado = avaliarMaclaurin(funcao, grau, x);
  const exato = valorDaFuncaoDeSerie(funcao, x);
  const gabarito = Math.abs(exato - aproximado);

  return montar({
    chave: `err-${funcao}-${grau}-${x}`,
    nivel,
    rng,
    enunciado:
      `Aproximando esta função em x = ${String(x).replace('.', ',')} pelo polinômio de ` +
      `Maclaurin de grau ${grau}, de quanto é o erro cometido? ${PEDIDO}`,
    enunciadoTex: FUNCAO_TEX[funcao],
    gabarito,
    resolucao: erroDaAproximacaoComPassos(funcao, grau, x),
    conceitos: ['taylor.erro', 'taylor.polinomio'],
    armadilhas: [
      {
        resposta: exato - aproximado,
        diagnostico:
          'O erro é medido em módulo. O sinal diria apenas se o polinômio ficou acima ou abaixo ' +
          'da função, e não é isso que se pergunta.',
        passo: 3,
        conceito: 'taylor.erro',
      },
      {
        resposta: Math.abs(exato - avaliarMaclaurin(funcao, grau + 1, x)),
        diagnostico:
          `Esse é o erro do polinômio de grau ${grau + 1}, um termo além do pedido. Repare como ` +
          'ele é bem menor — é esse ganho que justifica cada termo a mais.',
        passo: 1,
        conceito: 'taylor.erro',
      },
      {
        resposta: Math.abs(coeficienteDeMaclaurin(funcao, grau + 1) * x ** (grau + 1)),
        diagnostico:
          'Esse é só o primeiro termo desprezado. Ele costuma dominar o erro, mas não é o erro: ' +
          'depois dele ainda vem toda a cauda da série.',
        passo: 0,
        conceito: 'taylor.erro',
      },
    ],
  });
}

/** A cota de Lagrange: estimar o erro sem conhecer a resposta. */
function daCota(nivel: Nivel, rng: Rng): Exercicio<number> {
  const grau = rng.inteiro(2, 5);
  const x = rng.escolher([0.25, 0.5, 0.75, 1, 1.5, 2]);
  const funcao = rng.escolher(SEM_RAIO);

  // Para seno e cosseno toda derivada é limitada por 1; para a exponencial, o
  // maior valor dela no intervalo serve de cota.
  const cota = funcao === 'exp' ? Math.exp(Math.abs(x)) : 1;
  const gabarito = (cota * Math.abs(x) ** (grau + 1)) / fatorial(grau + 1);

  return montar({
    chave: `lag-${funcao}-${grau}-${x}`,
    nivel,
    rng,
    enunciado:
      `Estime, pelo resto de Lagrange, o erro máximo ao aproximar ${NOME_DA_SERIE[funcao]} em ` +
      `x = ${String(x).replace('.', ',')} com o polinômio de grau ${grau}. ` +
      `Use M = ${Number(cota.toFixed(4)).toString().replace('.', ',')}. ${PEDIDO}`,
    enunciadoTex: `\\left|R_{${grau}}(x)\\right| \\leq \\frac{M\\left|x\\right|^{${grau + 1}}}{(${grau + 1})!}`,
    gabarito,
    resolucao: cotaDeLagrangeComPassos(grau, x, cota),
    conceitos: ['taylor.lagrange', 'taylor.erro'],
    armadilhas: [
      {
        resposta: (cota * Math.abs(x) ** grau) / fatorial(grau),
        diagnostico:
          `O resto usa a ordem SEGUINTE: expoente ${grau + 1} e fatorial de ${grau + 1}. Usar a ` +
          'própria ordem do polinômio superestima bastante o erro.',
        passo: 0,
        conceito: 'taylor.lagrange',
      },
      {
        resposta: (cota * Math.abs(x) ** (grau + 1)) / fatorial(grau),
        diagnostico:
          `O expoente está certo, mas o fatorial ficou um atrás: o denominador é ${grau + 1} ` +
          'fatorial, o mesmo número do expoente.',
        passo: 1,
        conceito: 'taylor.lagrange',
      },
      {
        resposta: Math.abs(x) ** (grau + 1) / fatorial(grau + 1),
        diagnostico:
          'Faltou multiplicar pela cota M da derivada. Com M igual a 1 dá no mesmo, mas na ' +
          'exponencial ela é bem maior que 1.',
        passo: 1,
        conceito: 'taylor.lagrange',
      },
    ],
    dica: 'O resto tem a cara do termo seguinte da série, com M no lugar da derivada.',
  });
}

/** Taylor fora da origem: aproximar uma raiz perto de um quadrado perfeito. */
function daRaiz(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.escolher([4, 9, 16, 25, 36, 49, 64, 81, 100]);
  const desvio = rng.escolher([-0.6, -0.4, -0.2, 0.2, 0.4, 0.6, 0.8, 1]);
  const x = Number((a + desvio).toFixed(4));
  const grau = rng.inteiro(1, 2);

  const resolucao = taylorDaRaizComPassos(a, x, grau);
  const gabarito = resolucao.resultado;

  return montar({
    chave: `raiz-${a}-${desvio}-${grau}`,
    nivel,
    rng,
    enunciado:
      `Aproxime a raiz quadrada de ${String(x).replace('.', ',')} pelo polinômio de Taylor de ` +
      `grau ${grau} centrado em ${a}. ${PEDIDO}`,
    enunciadoTex: `f(x) = \\sqrt{x} \\quad\\text{em torno de } x = ${a}`,
    gabarito,
    resolucao,
    conceitos: ['taylor.fora-da-origem', 'taylor.polinomio'],
    armadilhas: [
      {
        resposta: Math.sqrt(x),
        diagnostico:
          'Esse é o valor exato da raiz, não o da aproximação. O exercício pede o que o ' +
          'polinômio devolve.',
        passo: 3,
        conceito: 'taylor.fora-da-origem',
      },
      {
        resposta: Math.sqrt(a),
        diagnostico:
          `Essa é a raiz do centro, que é só o primeiro termo. Falta a correção proporcional ao ` +
          'afastamento, que é o que a derivada traz.',
        passo: 2,
        conceito: 'taylor.fora-da-origem',
      },
      {
        resposta: Math.sqrt(a) + (x - a) / (2 * a),
        diagnostico:
          'O denominador do termo linear é 2 vezes a RAIZ do centro, e não 2 vezes o centro. ' +
          'A derivada da raiz traz uma raiz no denominador.',
        passo: 1,
        conceito: 'taylor.fora-da-origem',
      },
    ],
  });
}

function pontosDe(funcao: FuncaoDeSerie): readonly number[] {
  return funcao === 'ln1x' || funcao === 'geometrica' ? PONTOS_ESTREITOS : PONTOS_AMPLOS;
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
