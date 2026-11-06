import {
  Quadrica,
  avaliarLinear2,
  parcialComPassos,
  parcialX,
  parcialY,
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
 * Exercícios de derivada parcial.
 *
 * A ideia nova é uma só, e os exercícios a repetem de todos os ângulos:
 * derivar em relação a uma variável tratando a outra como constante. As
 * armadilhas atacam os dois descuidos previsíveis — derivar na variável errada
 * e deixar o termo misto escapar.
 */

const CASAS = 3;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 3 casas decimais.';

type Tipo = 'parcial-x' | 'parcial-y' | 'segunda' | 'mista';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['parcial-x', 'parcial-y'],
  medio: ['parcial-x', 'parcial-y', 'segunda'],
  dificil: ['parcial-x', 'segunda', 'mista'],
  // A mista deriva em x e depois em y: duas passagens, e o produto no meio.
  extremo: ['mista', 'segunda'],
};

export const geradorDerivadasParciais: GeradorExercicio<number> = {
  topicoId: 'derivadas-parciais',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'parcial-x':
        return daParcial(nivel, rng, true);
      case 'parcial-y':
        return daParcial(nivel, rng, false);
      case 'segunda':
        return daSegunda(nivel, rng);
      default:
        return daMista(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

function sortearQuadrica(nivel: Nivel, rng: Rng): Quadrica {
  return {
    a: rng.inteiro(1, 5) * rng.sinal(),
    b: rng.inteiro(1, 5) * rng.sinal(),
    c: nivel === 'facil' ? 0 : rng.inteiro(-4, 4) || 2,
    d: rng.inteiro(-6, 6),
    e: rng.inteiro(-6, 6),
    f0: rng.inteiro(-5, 5),
  };
}

/** A parcial em x ou em y, avaliada num ponto. */
function daParcial(nivel: Nivel, rng: Rng, emX: boolean): Exercicio<number> {
  const q = sortearQuadrica(nivel, rng);
  const x = rng.inteiro(-5, 5);
  const y = rng.inteiro(-5, 5);

  const gabarito = avaliarLinear2(emX ? parcialX(q) : parcialY(q), x, y);
  const aOutra = avaliarLinear2(emX ? parcialY(q) : parcialX(q), x, y);
  const variavel = emX ? 'x' : 'y';

  return montar({
    chave: `p${variavel}-${q.a}${q.b}${q.c}${q.d}${q.e}-${x}-${y}`,
    nivel,
    rng,
    enunciado:
      `Qual é a derivada parcial em relação a ${variavel}, avaliada no ponto (${x}, ${y})? ` +
      PEDIDO,
    enunciadoTex: `f(x,y) = ${quadricaParaTex(q)}`,
    gabarito,
    resolucao: parcialComPassos(q, x, y, emX),
    conceitos: ['parciais.uma-de-cada-vez', 'parciais.significado'],
    armadilhas: [
      {
        resposta: aOutra,
        diagnostico:
          `Essa é a parcial em relação à OUTRA variável. Cada parcial mede a taxa ao andar numa ` +
          'direção só, e elas costumam ser bem diferentes.',
        passo: 1,
        conceito: 'parciais.uma-de-cada-vez',
      },
      {
        resposta: avaliarLinear2(emX ? { ...parcialX(q), ky: 0 } : { ...parcialY(q), kx: 0 }, x, y),
        diagnostico:
          'O termo misto foi esquecido. Ao derivar em uma variável, o produto xy deixa a OUTRA ' +
          'variável como coeficiente — ele não desaparece.',
        passo: 1,
        conceito: 'parciais.termo-misto',
      },
      {
        resposta: q.f0,
        diagnostico: 'O termo constante é o único que some ao derivar. Todos os outros contribuem.',
        passo: 1,
        conceito: 'parciais.uma-de-cada-vez',
      },
    ],
    dica:
      nivel === 'facil'
        ? `Trate a outra variável como se fosse um número, e derive normalmente em ${variavel}.`
        : undefined,
  });
}

/** A segunda derivada parcial, que mede a concavidade numa direção. */
function daSegunda(nivel: Nivel, rng: Rng): Exercicio<number> {
  const q = sortearQuadrica(nivel, rng);
  const emX = rng.booleano();

  const gabarito = emX ? 2 * q.a : 2 * q.b;
  const variavel = emX ? 'x' : 'y';

  return montar({
    chave: `s${variavel}-${q.a}${q.b}${q.c}${q.d}${q.e}`,
    nivel,
    rng,
    enunciado: `Qual é a segunda derivada parcial em relação a ${variavel}, duas vezes? ${PEDIDO}`,
    enunciadoTex: `f(x,y) = ${quadricaParaTex(q)}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `Primeiro derivamos em ${variavel}, com a outra variável constante.`,
          tex: `\\frac{\\partial f}{\\partial ${variavel}} = ${linearTex(emX ? parcialX(q) : parcialY(q))}`,
        },
        {
          descricao: `Agora derivamos de novo em ${variavel}.`,
          tex: `\\frac{\\partial^{2} f}{\\partial ${variavel}^{2}} = ${texNumero(gabarito)}`,
          nota: 'Numa quádrica a segunda parcial é constante: a concavidade é a mesma em todo ponto.',
        },
        {
          descricao: 'O sinal dela diz a forma do corte naquela direção.',
          tex: `${texNumero(gabarito)} ${gabarito > 0 ? '> 0' : '< 0'}`,
          nota:
            gabarito > 0
              ? 'Positiva: o corte é uma parábola com concavidade para cima.'
              : 'Negativa: o corte abre para baixo.',
        },
      ],
    },
    conceitos: ['parciais.segunda-ordem', 'parciais.uma-de-cada-vez'],
    armadilhas: [
      {
        resposta: emX ? q.a : q.b,
        diagnostico: 'Faltou o fator 2 que a regra da potência traz ao derivar o termo quadrático.',
        passo: 0,
        conceito: 'parciais.segunda-ordem',
      },
      {
        resposta: q.c,
        diagnostico:
          'Essa é a parcial MISTA, que deriva uma vez em cada variável. A pedida deriva duas ' +
          'vezes na mesma.',
        passo: 1,
        conceito: 'parciais.mista',
      },
      {
        resposta: emX ? 2 * q.b : 2 * q.a,
        diagnostico: 'A derivada foi feita na outra variável.',
        passo: 0,
        conceito: 'parciais.uma-de-cada-vez',
      },
    ],
  });
}

/** A parcial mista, e o teorema de Clairaut. */
function daMista(nivel: Nivel, rng: Rng): Exercicio<number> {
  const q = { ...sortearQuadrica(nivel, rng), c: rng.inteiro(1, 6) * rng.sinal() };

  const gabarito = q.c;

  return montar({
    chave: `mx-${q.a}${q.b}${q.c}${q.d}${q.e}`,
    nivel,
    rng,
    enunciado:
      'Qual é a derivada parcial mista desta função, derivando primeiro em x e depois em y? ' +
      PEDIDO,
    enunciadoTex: `f(x,y) = ${quadricaParaTex(q)}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Derivamos primeiro em x.',
          tex: `\\frac{\\partial f}{\\partial x} = ${linearTex(parcialX(q))}`,
        },
        {
          descricao: 'E agora derivamos esse resultado em y.',
          tex: `\\frac{\\partial^{2} f}{\\partial y\\,\\partial x} = ${texNumero(gabarito)}`,
          nota: 'Só o termo que tinha as duas variáveis sobrevive às duas derivadas.',
        },
        {
          descricao: 'Pela ordem inversa dá o mesmo — é o teorema de Clairaut.',
          tex: `\\frac{\\partial^{2} f}{\\partial x\\,\\partial y} = ${texNumero(gabarito)}`,
          nota: 'Com as parciais contínuas, a ordem de derivação não altera o resultado.',
        },
      ],
    },
    conceitos: ['parciais.mista', 'parciais.termo-misto'],
    armadilhas: [
      {
        resposta: 2 * q.a,
        diagnostico:
          'Essa é a segunda parcial em x. A mista deriva uma vez em CADA variável, e por isso ' +
          'só o termo com as duas sobrevive.',
        passo: 1,
        conceito: 'parciais.segunda-ordem',
      },
      {
        resposta: 0,
        diagnostico:
          'A mista só seria zero se não houvesse termo com x e y juntos. Aqui há, e é ele que ' +
          'resta depois das duas derivadas.',
        passo: 1,
        conceito: 'parciais.termo-misto',
      },
      {
        resposta: 2 * q.c,
        diagnostico:
          'O termo misto é linear em cada variável, então não aparece fator 2: derivar xy em x ' +
          'dá y, e derivar y em y dá 1.',
        passo: 0,
        conceito: 'parciais.mista',
      },
    ],
    dica: 'Só o termo que tem x e y ao mesmo tempo sobrevive às duas derivadas.',
  });
}

function linearTex(l: { readonly kx: number; readonly ky: number; readonly k0: number }): string {
  const partes: string[] = [];
  if (l.kx !== 0) partes.push(`${l.kx === 1 ? '' : l.kx === -1 ? '-' : formatar(l.kx)}x`);
  if (l.ky !== 0)
    partes.push(
      `${l.ky > 0 && partes.length > 0 ? '+ ' : ''}${l.ky === 1 ? '' : l.ky === -1 ? '-' : formatar(l.ky)}y`,
    );
  if (l.k0 !== 0) partes.push(`${l.k0 > 0 && partes.length > 0 ? '+ ' : ''}${formatar(l.k0)}`);
  return partes.length === 0 ? '0' : partes.join(' ');
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
