import {
  Quadrica,
  classificarCritico,
  derivadaDirecionalComPassos,
  gradienteComPassos,
  gradienteEm,
  pontoCriticoComPassos,
  quadricaParaTex,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import {
  FORMATO_NUMERICO_AMPLO,
  analisarNumero,
  numeroComCasas,
} from '@core/treino/resposta-numerica/resposta-numerica';
import { Armadilha, Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

/**
 * Exercícios de gradiente e derivada direcional.
 *
 * O gradiente é o objeto que o tópico existe para instalar: ele aponta para a
 * subida mais íngreme, e seu módulo é a inclinação nessa direção. A armadilha
 * central é a da normalização — quem esquece de dividir pelo comprimento da
 * direção obtém uma taxa escalada, que parece certa e não é.
 */

const CASAS = 3;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 3 casas decimais.';

type Tipo = 'componente' | 'modulo' | 'direcional' | 'critico';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['componente', 'modulo'],
  medio: ['modulo', 'direcional', 'componente'],
  dificil: ['direcional', 'critico', 'modulo'],
};

export const geradorGradiente: GeradorExercicio<number> = {
  topicoId: 'gradiente-e-direcional',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'componente':
        return daComponente(nivel, rng);
      case 'modulo':
        return doModulo(nivel, rng);
      case 'direcional':
        return daDirecional(nivel, rng);
      default:
        return doCritico(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

function sortearQuadrica(nivel: Nivel, rng: Rng): Quadrica {
  return {
    a: rng.inteiro(1, 4) * (nivel === 'facil' ? 1 : rng.sinal()),
    b: rng.inteiro(1, 4) * (nivel === 'facil' ? 1 : rng.sinal()),
    c: nivel === 'facil' ? 0 : rng.inteiro(-3, 3),
    d: rng.inteiro(-6, 6),
    e: rng.inteiro(-6, 6),
    f0: rng.inteiro(-4, 4),
  };
}

/** Uma componente do gradiente — a parcial, vista como parte de um vetor. */
function daComponente(nivel: Nivel, rng: Rng): Exercicio<number> {
  const q = sortearQuadrica(nivel, rng);
  const x = rng.inteiro(-4, 4);
  const y = rng.inteiro(-4, 4);
  const emX = rng.booleano();

  const g = gradienteEm(q, x, y);
  const gabarito = emX ? g.x : g.y;

  return montar({
    chave: `cp-${q.a}${q.b}${q.c}${q.d}${q.e}-${x}${y}-${emX}`,
    nivel,
    rng,
    enunciado:
      `Qual é a componente ${emX ? 'x' : 'y'} do gradiente desta função no ponto (${x}, ${y})? ` +
      PEDIDO,
    enunciadoTex: `f(x,y) = ${quadricaParaTex(q)}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: gradienteComPassos(q, x, y).passos.slice(0, 2),
    },
    conceitos: ['gradiente.vetor', 'gradiente.direcao-de-subida'],
    armadilhas: [
      {
        resposta: emX ? g.y : g.x,
        diagnostico: 'Essa é a outra componente do gradiente.',
        passo: 1,
        conceito: 'gradiente.vetor',
      },
      {
        resposta: Math.hypot(g.x, g.y),
        diagnostico:
          'Esse é o MÓDULO do gradiente. A pergunta é por uma componente, que é apenas uma das ' +
          'duas parcelas do vetor.',
        passo: 1,
        conceito: 'gradiente.vetor',
      },
    ],
    dica: nivel === 'facil' ? 'Cada componente do gradiente é uma derivada parcial.' : undefined,
  });
}

/** O módulo do gradiente: a inclinação máxima naquele ponto. */
function doModulo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const q = sortearQuadrica(nivel, rng);
  const x = rng.inteiro(-4, 4);
  const y = rng.inteiro(-4, 4);

  const g = gradienteEm(q, x, y);
  const gabarito = Math.hypot(g.x, g.y);

  return montar({
    chave: `md-${q.a}${q.b}${q.c}${q.d}${q.e}-${x}${y}`,
    nivel,
    rng,
    enunciado:
      `Qual é a maior taxa de variação possível desta função no ponto (${x}, ${y}), em qualquer ` +
      `direção? ${PEDIDO}`,
    enunciadoTex: `f(x,y) = ${quadricaParaTex(q)}`,
    gabarito,
    resolucao: gradienteComPassos(q, x, y),
    conceitos: ['gradiente.direcao-de-subida', 'gradiente.vetor'],
    armadilhas: [
      {
        resposta: g.x + g.y,
        diagnostico:
          'As componentes foram somadas. O módulo de um vetor sai por Pitágoras, não por soma ' +
          'simples.',
        passo: 2,
        conceito: 'gradiente.vetor',
      },
      {
        resposta: Math.max(Math.abs(g.x), Math.abs(g.y)),
        diagnostico:
          'A maior componente não é a maior taxa: andando na diagonal certa, a função sobe mais ' +
          'rápido que em qualquer eixo.',
        passo: 2,
        conceito: 'gradiente.direcao-de-subida',
      },
      {
        resposta: g.x * g.x + g.y * g.y,
        diagnostico: 'Faltou extrair a raiz quadrada.',
        passo: 2,
        conceito: 'gradiente.vetor',
      },
    ],
  });
}

/** A derivada direcional, onde a normalização decide. */
function daDirecional(nivel: Nivel, rng: Rng): Exercicio<number> {
  const q = sortearQuadrica(nivel, rng);
  const x = rng.inteiro(-4, 4);
  const y = rng.inteiro(-4, 4);
  const direcao = { x: rng.inteiro(-5, 5) || 3, y: rng.inteiro(-5, 5) || 4 };

  const comprimento = Math.hypot(direcao.x, direcao.y);
  const g = gradienteEm(q, x, y);
  const gabarito = (g.x * direcao.x + g.y * direcao.y) / comprimento;

  return montar({
    chave: `dd-${q.a}${q.b}${q.c}${q.d}${q.e}-${x}${y}-${direcao.x}${direcao.y}`,
    nivel,
    rng,
    enunciado:
      `Qual é a derivada direcional desta função no ponto (${x}, ${y}), na direção do vetor ` +
      `(${direcao.x}, ${direcao.y})? ${PEDIDO}`,
    enunciadoTex: `f(x,y) = ${quadricaParaTex(q)}`,
    gabarito,
    resolucao: derivadaDirecionalComPassos(q, x, y, direcao),
    conceitos: ['gradiente.direcional', 'gradiente.vetor'],
    armadilhas: [
      {
        resposta: g.x * direcao.x + g.y * direcao.y,
        diagnostico:
          'Faltou normalizar a direção. Sem dividir pelo comprimento do vetor, a taxa sai ' +
          'escalada por ele — e um vetor maior daria uma inclinação maior, o que não faz sentido.',
        passo: 0,
        conceito: 'gradiente.direcional',
      },
      {
        resposta: Math.hypot(g.x, g.y),
        diagnostico:
          'Esse é o módulo do gradiente, que é a taxa na MELHOR direção. A pedida é numa direção ' +
          'específica, e ela nunca passa dessa.',
        passo: 2,
        conceito: 'gradiente.direcao-de-subida',
      },
      {
        resposta: (g.x * direcao.y + g.y * direcao.x) / comprimento,
        diagnostico:
          'As componentes da direção entraram trocadas no produto escalar.',
        passo: 2,
        conceito: 'gradiente.direcional',
      },
    ],
    dica: 'Normalize a direção antes de projetar o gradiente nela.',
  });
}

/** O ponto crítico e sua natureza, pelo teste da hessiana. */
function doCritico(nivel: Nivel, rng: Rng): Exercicio<number> {
  // Coeficientes que garantem determinante não nulo e ponto crítico razoável.
  const a = rng.inteiro(1, 4) * rng.sinal();
  const b = rng.inteiro(1, 4) * rng.sinal();
  const c = rng.inteiro(-2, 2);
  const q: Quadrica = { a, b, c, d: rng.inteiro(-8, 8), e: rng.inteiro(-8, 8), f0: rng.inteiro(-4, 4) };

  const determinante = 4 * q.a * q.b - q.c * q.c;
  if (determinante === 0) {
    return doCritico(nivel, rng);
  }

  const gabarito = (q.c * q.e - 2 * q.b * q.d) / determinante;

  return montar({
    chave: `pc-${q.a}${q.b}${q.c}${q.d}${q.e}`,
    nivel,
    rng,
    enunciado:
      `Esta função tem um único ponto crítico. Qual é a abscissa dele? ${PEDIDO}`,
    enunciadoTex: `f(x,y) = ${quadricaParaTex(q)}`,
    gabarito,
    resolucao: pontoCriticoComPassos(q),
    conceitos: ['gradiente.ponto-critico', 'gradiente.vetor'],
    armadilhas: [
      {
        resposta: (q.c * q.d - 2 * q.a * q.e) / determinante,
        diagnostico: 'Essa é a ordenada do ponto crítico, não a abscissa.',
        passo: 2,
        conceito: 'gradiente.ponto-critico',
      },
      {
        resposta: -q.d / (2 * q.a),
        diagnostico:
          'O termo misto acopla as duas equações: não dá para resolver cada parcial isoladamente ' +
          'quando ele existe.',
        passo: 1,
        conceito: 'gradiente.ponto-critico',
      },
      {
        resposta: 0,
        diagnostico:
          'A origem só seria crítica se os termos lineares fossem nulos. Aqui eles deslocam o ' +
          'ponto crítico para longe dela.',
        passo: 0,
        conceito: 'gradiente.ponto-critico',
      },
    ],
    dica: `No ponto crítico o gradiente é o vetor nulo — e aqui o ponto é ${classificarCritico(q)}.`,
  });
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
