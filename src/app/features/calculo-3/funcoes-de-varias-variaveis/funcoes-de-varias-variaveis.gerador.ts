import {
  Quadrica,
  avaliarQuadrica,
  corteVerticalComPassos,
  dominioDaRaizComPassos,
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
 * Exercícios de função de duas variáveis.
 *
 * O salto conceitual do tópico é o domínio: ele deixa de ser um intervalo na
 * reta e passa a ser uma REGIÃO do plano. E a superfície só se enxerga por
 * fatias — cortes verticais e curvas de nível —, que é exatamente o que os
 * exercícios treinam.
 */

const CASAS = 3;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 3 casas decimais.';

type Tipo = 'avaliar' | 'nivel' | 'corte' | 'dominio';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['avaliar', 'nivel'],
  medio: ['avaliar', 'nivel', 'dominio'],
  dificil: ['corte', 'dominio', 'nivel'],
};

export const geradorFuncoesVariasVariaveis: GeradorExercicio<number> = {
  topicoId: 'funcoes-de-varias-variaveis',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'avaliar':
        return daAvaliacao(nivel, rng);
      case 'nivel':
        return daCurvaDeNivel(nivel, rng);
      case 'corte':
        return doCorte(nivel, rng);
      default:
        return doDominio(nivel, rng);
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
    d: rng.inteiro(-5, 5),
    e: rng.inteiro(-5, 5),
    f0: rng.inteiro(-6, 6),
  };
}

/** O valor da função num ponto: substituir duas coordenadas, não uma. */
function daAvaliacao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const q = sortearQuadrica(nivel, rng);
  const x = rng.inteiro(-5, 5);
  const y = rng.inteiro(-5, 5);

  const gabarito = avaliarQuadrica(q, x, y);

  return montar({
    chave: `av-${q.a}${q.b}${q.c}${q.d}${q.e}${q.f0}-${x}-${y}`,
    nivel,
    rng,
    enunciado: `Quanto vale esta função no ponto (${x}, ${y})? ${PEDIDO}`,
    enunciadoTex: `f(x,y) = ${quadricaParaTex(q)}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Uma função de duas variáveis pede DUAS substituições.',
          tex: `f(x,y) = ${quadricaParaTex(q)}`,
          nota: 'Cada ponto do plano produz uma altura, e o conjunto delas é a superfície.',
        },
        {
          descricao: `Substituímos x igual a ${x} e y igual a ${y}.`,
          tex:
            `${formatar(q.a)}(${x})^{2} + ${formatar(q.b)}(${y})^{2} + ${formatar(q.c)}(${x})(${y}) + ` +
            `${formatar(q.d)}(${x}) + ${formatar(q.e)}(${y}) + ${formatar(q.f0)}`,
        },
        {
          descricao: 'E somamos as parcelas.',
          tex: `f(${x},\\; ${y}) = ${texNumero(gabarito)}`,
        },
      ],
    },
    conceitos: ['multivar.superficie', 'multivar.dominio'],
    armadilhas: [
      {
        resposta: avaliarQuadrica(q, y, x),
        diagnostico:
          'As coordenadas entraram trocadas. A ordem importa: o primeiro número é x, o segundo ' +
          'é y, e a função não é simétrica nelas.',
        passo: 1,
        conceito: 'multivar.superficie',
      },
      {
        resposta: q.a * x * x + q.d * x + q.f0,
        diagnostico:
          'Os termos em y foram ignorados. Em duas variáveis, nada se despreza: a altura depende ' +
          'das duas coordenadas ao mesmo tempo.',
        passo: 1,
        conceito: 'multivar.superficie',
      },
    ],
    dica: nivel === 'facil' ? 'Substitua as duas coordenadas e some com cuidado nos sinais.' : undefined,
  });
}

/** A curva de nível que passa por um ponto. */
function daCurvaDeNivel(nivel: Nivel, rng: Rng): Exercicio<number> {
  const q = sortearQuadrica(nivel, rng);
  const x = rng.inteiro(-4, 4);
  const y = rng.inteiro(-4, 4);

  const gabarito = avaliarQuadrica(q, x, y);

  return montar({
    chave: `nv-${q.a}${q.b}${q.c}${q.d}${q.e}${q.f0}-${x}-${y}`,
    nivel,
    rng,
    enunciado:
      `Qual é o valor de k da curva de nível que passa pelo ponto (${x}, ${y})? ${PEDIDO}`,
    enunciadoTex: `f(x,y) = ${quadricaParaTex(q)}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Uma curva de nível junta todos os pontos de mesma altura.',
          tex: 'f(x,y) = k',
          nota: 'É o que o mapa topográfico desenha: cada linha é uma altitude.',
        },
        {
          descricao: `Se a curva passa por (${x}, ${y}), o nível é a altura ali.`,
          tex: `k = f(${x},\\; ${y})`,
        },
        {
          descricao: 'Calculando essa altura.',
          tex: `k = ${texNumero(gabarito)}`,
          nota: 'Qualquer outro ponto dessa curva devolve exatamente o mesmo valor.',
        },
      ],
    },
    conceitos: ['multivar.curvas-de-nivel', 'multivar.superficie'],
    armadilhas: [
      {
        resposta: x,
        diagnostico:
          'Esse é o x do ponto, não o nível. O nível é a ALTURA da superfície ali, que é o valor ' +
          'da função.',
        passo: 1,
        conceito: 'multivar.curvas-de-nivel',
      },
      {
        resposta: 0,
        diagnostico:
          'Zero seria o nível de uma curva que passa por onde a função se anula. Aqui ela não ' +
          'se anula no ponto dado.',
        passo: 2,
        conceito: 'multivar.curvas-de-nivel',
      },
      {
        resposta: avaliarQuadrica(q, y, x),
        diagnostico: 'As coordenadas do ponto entraram trocadas.',
        passo: 1,
        conceito: 'multivar.superficie',
      },
    ],
  });
}

/** O corte vertical da superfície, que vira uma parábola. */
function doCorte(nivel: Nivel, rng: Rng): Exercicio<number> {
  const q = { ...sortearQuadrica(nivel, rng), a: rng.inteiro(1, 4) };
  const y0 = rng.inteiro(-4, 4);

  const gabarito = -(q.c * y0 + q.d) / (2 * q.a);

  return montar({
    chave: `ct-${q.a}${q.b}${q.c}${q.d}${q.e}${q.f0}-${y0}`,
    nivel,
    rng,
    enunciado:
      `Cortando a superfície com o plano y = ${y0}, sobra uma parábola em x. Qual é a abscissa ` +
      `do vértice dessa parábola? ${PEDIDO}`,
    enunciadoTex: `f(x,y) = ${quadricaParaTex(q)}`,
    gabarito,
    resolucao: corteVerticalComPassos(q, y0),
    conceitos: ['multivar.superficie', 'multivar.curvas-de-nivel'],
    armadilhas: [
      {
        resposta: (q.c * y0 + q.d) / (2 * q.a),
        diagnostico:
          'Faltou o sinal negativo da fórmula do vértice. Ela é menos b sobre dois a.',
        passo: 1,
        conceito: 'multivar.superficie',
      },
      {
        resposta: -q.d / (2 * q.a),
        diagnostico:
          `O termo misto também contribui: ao fixar y igual a ${y0}, ele vira parte do ` +
          'coeficiente de x, e não some.',
        passo: 0,
        conceito: 'multivar.superficie',
      },
      {
        resposta: y0,
        diagnostico: 'Esse é o plano de corte, não a abscissa do vértice da curva resultante.',
        passo: 2,
        conceito: 'multivar.superficie',
      },
    ],
    dica: 'Substitua o y fixo e trate o que sobra como uma função de uma variável só.',
  });
}

/** O domínio como região do plano, e não como intervalo. */
function doDominio(nivel: Nivel, rng: Rng): Exercicio<number> {
  const raio = rng.inteiro(2, 12);
  const y0 = rng.inteiro(-raio + 1, raio - 1);

  const gabarito = Math.sqrt(raio * raio - y0 * y0);

  return montar({
    chave: `dm-${raio}-${y0}`,
    nivel,
    rng,
    enunciado:
      `No domínio desta função, qual é o maior valor que x pode assumir quando y = ${y0}? ` +
      PEDIDO,
    enunciadoTex: `f(x,y) = \\sqrt{${raio * raio} - x^{2} - y^{2}}`,
    gabarito,
    resolucao: dominioDaRaizComPassos(raio, y0),
    conceitos: ['multivar.dominio', 'multivar.superficie'],
    armadilhas: [
      {
        resposta: raio,
        diagnostico:
          `Esse é o raio do disco, que seria o limite se y fosse zero. Com y igual a ${y0}, ` +
          'sobra menos espaço para x.',
        passo: 1,
        conceito: 'multivar.dominio',
      },
      {
        resposta: raio * raio - y0 * y0,
        diagnostico:
          'Faltou extrair a raiz quadrada: esse é o valor de x ao quadrado, não de x.',
        passo: 2,
        conceito: 'multivar.dominio',
      },
      {
        resposta: raio - Math.abs(y0),
        diagnostico:
          'O domínio é um DISCO, não um losango. A condição envolve a soma dos quadrados, e por ' +
          'isso o limite sai por Pitágoras, não por subtração.',
        passo: 1,
        conceito: 'multivar.dominio',
      },
    ],
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
