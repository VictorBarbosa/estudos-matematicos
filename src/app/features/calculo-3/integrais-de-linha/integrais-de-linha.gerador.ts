import { Linear2, avaliarLinear2, linear2ParaTex, trabalhoNoSegmentoComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import {
  FORMATO_NUMERICO_AMPLO,
  analisarNumero,
  numeroComCasas,
} from '@core/treino/resposta-numerica/resposta-numerica';
import { Armadilha, Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

/**
 * Exercícios de integral de linha.
 *
 * A pergunta é sempre a mesma: quanto o campo empurra ao longo do caminho.
 * Dois enganos dominam — usar o campo inteiro em vez da componente ao longo do
 * trajeto, e tratar o caminho como se fosse só a distância entre as pontas,
 * que só vale quando o campo é conservativo.
 */

const CASAS = 3;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 3 casas decimais.';

type Tipo = 'constante' | 'linear' | 'fechado' | 'conservativo';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['constante'],
  medio: ['constante', 'linear'],
  dificil: ['linear', 'fechado', 'conservativo'],
};

export const geradorIntegraisDeLinha: GeradorExercicio<number> = {
  topicoId: 'integrais-de-linha',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'constante':
        return doCampoConstante(nivel, rng);
      case 'linear':
        return doCampoLinear(nivel, rng);
      case 'fechado':
        return doCaminhoFechado(nivel, rng);
      default:
        return doConservativo(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

/** Campo constante: o trabalho é o produto escalar com o deslocamento. */
function doCampoConstante(nivel: Nivel, rng: Rng): Exercicio<number> {
  const campoX: Linear2 = { kx: 0, ky: 0, k0: rng.inteiro(-6, 6) || 3 };
  const campoY: Linear2 = { kx: 0, ky: 0, k0: rng.inteiro(-6, 6) || 2 };
  const de = { x: rng.inteiro(-5, 5), y: rng.inteiro(-5, 5) };
  const ate = { x: rng.inteiro(-5, 5), y: rng.inteiro(-5, 5) };

  const dx = ate.x - de.x;
  const dy = ate.y - de.y;
  const gabarito = campoX.k0 * dx + campoY.k0 * dy;

  return montar({
    chave: `cte-${campoX.k0}${campoY.k0}-${de.x}${de.y}-${ate.x}${ate.y}`,
    nivel,
    rng,
    enunciado:
      `Qual é o trabalho deste campo ao longo do segmento que vai de (${de.x}, ${de.y}) a ` +
      `(${ate.x}, ${ate.y})? ${PEDIDO}`,
    enunciadoTex: `\\vec{F} = \\left(${formatar(campoX.k0)},\\; ${formatar(campoY.k0)}\\right)`,
    gabarito,
    resolucao: trabalhoNoSegmentoComPassos(campoX, campoY, de, ate),
    conceitos: ['linha.trabalho', 'linha.parametrizar'],
    armadilhas: [
      {
        resposta: Math.hypot(campoX.k0, campoY.k0) * Math.hypot(dx, dy),
        diagnostico:
          'Os módulos foram multiplicados, como se campo e deslocamento estivessem alinhados. ' +
          'Só a componente do campo AO LONGO do caminho realiza trabalho.',
        passo: 1,
        conceito: 'linha.trabalho',
      },
      {
        resposta: campoX.k0 * dy + campoY.k0 * dx,
        diagnostico: 'As componentes entraram cruzadas no produto escalar.',
        passo: 2,
        conceito: 'linha.trabalho',
      },
      {
        resposta: Math.hypot(dx, dy),
        diagnostico:
          'Esse é o comprimento do caminho, não o trabalho. O campo precisa entrar na conta.',
        passo: 0,
        conceito: 'linha.parametrizar',
      },
    ],
    dica: nivel === 'facil' ? 'Com campo constante, o trabalho é o produto escalar com o deslocamento.' : undefined,
  });
}

/** Campo que varia com a posição: aí a parametrização é necessária mesmo. */
function doCampoLinear(nivel: Nivel, rng: Rng): Exercicio<number> {
  const campoX: Linear2 = { kx: rng.inteiro(-3, 3), ky: rng.inteiro(-3, 3), k0: rng.inteiro(-4, 4) };
  const campoY: Linear2 = { kx: rng.inteiro(-3, 3), ky: rng.inteiro(-3, 3), k0: rng.inteiro(-4, 4) };
  const de = { x: rng.inteiro(-4, 4), y: rng.inteiro(-4, 4) };
  const ate = { x: rng.inteiro(-4, 4), y: rng.inteiro(-4, 4) };

  const resolucao = trabalhoNoSegmentoComPassos(campoX, campoY, de, ate);
  const gabarito = resolucao.resultado;

  const dx = ate.x - de.x;
  const dy = ate.y - de.y;

  return montar({
    chave: `lin-${campoX.kx}${campoX.ky}${campoX.k0}-${campoY.kx}${campoY.ky}${campoY.k0}-${de.x}${de.y}${ate.x}${ate.y}`,
    nivel,
    rng,
    enunciado:
      `Qual é o trabalho deste campo ao longo do segmento que vai de (${de.x}, ${de.y}) a ` +
      `(${ate.x}, ${ate.y})? ${PEDIDO}`,
    enunciadoTex:
      `\\vec{F} = \\left(${linear2ParaTex(campoX)},\\; ${linear2ParaTex(campoY)}\\right)`,
    gabarito,
    resolucao,
    conceitos: ['linha.parametrizar', 'linha.trabalho'],
    armadilhas: [
      {
        resposta: avaliarLinear2(campoX, de.x, de.y) * dx + avaliarLinear2(campoY, de.x, de.y) * dy,
        diagnostico:
          'O campo foi avaliado só no ponto inicial. Como ele varia ao longo do caminho, é ' +
          'preciso integrar — avaliar numa ponta só é uma aproximação grosseira.',
        passo: 1,
        conceito: 'linha.parametrizar',
      },
      {
        resposta: avaliarLinear2(campoX, ate.x, ate.y) * dx + avaliarLinear2(campoY, ate.x, ate.y) * dy,
        diagnostico:
          'O campo foi avaliado só no ponto final. O valor correto é a média integrada ao longo ' +
          'de todo o trajeto.',
        passo: 1,
        conceito: 'linha.parametrizar',
      },
      {
        resposta: -gabarito,
        diagnostico:
          'O sentido do percurso está invertido. Trocar as pontas troca o sinal do trabalho.',
        passo: 3,
        conceito: 'linha.trabalho',
      },
    ],
  });
}

/** Caminho fechado: ida e volta pelo mesmo segmento. */
function doCaminhoFechado(nivel: Nivel, rng: Rng): Exercicio<number> {
  const campoX: Linear2 = { kx: rng.inteiro(-3, 3), ky: rng.inteiro(-3, 3), k0: rng.inteiro(-4, 4) };
  const campoY: Linear2 = { kx: rng.inteiro(-3, 3), ky: rng.inteiro(-3, 3), k0: rng.inteiro(-4, 4) };
  const de = { x: rng.inteiro(-4, 4), y: rng.inteiro(-4, 4) };
  const ate = { x: rng.inteiro(-4, 4), y: rng.inteiro(-4, 4) };

  const ida = trabalhoNoSegmentoComPassos(campoX, campoY, de, ate);
  const volta = trabalhoNoSegmentoComPassos(campoX, campoY, ate, de);
  const gabarito = ida.resultado + volta.resultado;

  return montar({
    chave: `fec-${campoX.kx}${campoX.ky}-${campoY.kx}${campoY.ky}-${de.x}${de.y}${ate.x}${ate.y}`,
    nivel,
    rng,
    enunciado:
      `Qual é o trabalho deste campo ao percorrer o segmento de (${de.x}, ${de.y}) a ` +
      `(${ate.x}, ${ate.y}) e voltar pelo mesmo caminho? ${PEDIDO}`,
    enunciadoTex:
      `\\vec{F} = \\left(${linear2ParaTex(campoX)},\\; ${linear2ParaTex(campoY)}\\right)`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...ida.passos.slice(0, 3),
        {
          descricao: 'O trabalho de ida.',
          tex: `W_{ida} = ${texNumero(ida.resultado)}`,
        },
        {
          descricao: 'Na volta, o vetor tangente inverte e o integrando troca de sinal.',
          tex: `W_{volta} = ${texNumero(volta.resultado)}`,
          nota: 'Percorrer o mesmo caminho ao contrário desfaz exatamente o trabalho feito.',
        },
        {
          descricao: 'Somando as duas metades.',
          tex: `W_{total} = ${texNumero(gabarito)}`,
          nota: 'Ida e volta pelo mesmo caminho sempre se cancelam, em qualquer campo.',
        },
      ],
    },
    conceitos: ['linha.caminho-fechado', 'linha.trabalho'],
    armadilhas: [
      {
        resposta: ida.resultado,
        diagnostico:
          'Essa é só a ida. O enunciado pede o percurso completo, que inclui a volta.',
        passo: 3,
        conceito: 'linha.caminho-fechado',
      },
      {
        resposta: 2 * ida.resultado,
        diagnostico:
          'A volta não repete o trabalho da ida: ela o desfaz. O sentido do percurso inverte o ' +
          'sinal do integrando.',
        passo: 4,
        conceito: 'linha.caminho-fechado',
      },
    ],
    dica: 'Pense no que acontece com o vetor tangente quando o sentido se inverte.',
  });
}

/** Campo conservativo: o trabalho depende só das pontas. */
function doConservativo(nivel: Nivel, rng: Rng): Exercicio<number> {
  // F = ∇(a x² /2 + b y² /2) = (a x, b y): rotacional nulo, campo conservativo.
  const a = rng.inteiro(1, 5);
  const b = rng.inteiro(1, 5);
  const campoX: Linear2 = { kx: a, ky: 0, k0: 0 };
  const campoY: Linear2 = { kx: 0, ky: b, k0: 0 };

  const de = { x: rng.inteiro(-4, 4), y: rng.inteiro(-4, 4) };
  const ate = { x: rng.inteiro(-4, 4), y: rng.inteiro(-4, 4) };

  const potencial = (p: { x: number; y: number }) => (a * p.x * p.x) / 2 + (b * p.y * p.y) / 2;
  const gabarito = potencial(ate) - potencial(de);

  return montar({
    chave: `cns-${a}${b}-${de.x}${de.y}${ate.x}${ate.y}`,
    nivel,
    rng,
    enunciado:
      `Este campo é conservativo. Qual é o trabalho dele de (${de.x}, ${de.y}) até ` +
      `(${ate.x}, ${ate.y}), por qualquer caminho? ${PEDIDO}`,
    enunciadoTex: `\\vec{F} = \\left(${a === 1 ? '' : a}x,\\; ${b === 1 ? '' : b}y\\right)`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'O campo é o gradiente de uma função potencial.',
          tex: `\\varphi(x,y) = \\frac{${a}x^{2}}{2} + \\frac{${b}y^{2}}{2}`,
          nota: 'Quando isso acontece, o campo é conservativo e o caminho deixa de importar.',
        },
        {
          descricao: 'O trabalho é a diferença do potencial entre as pontas.',
          tex: 'W = \\varphi(B) - \\varphi(A)',
        },
        {
          descricao: 'Avaliando nas duas pontas.',
          tex:
            `\\varphi(B) = ${texNumero(potencial(ate))} \\qquad ` +
            `\\varphi(A) = ${texNumero(potencial(de))}`,
        },
        {
          descricao: 'E subtraindo.',
          tex: `W = ${texNumero(gabarito)}`,
          nota: 'Num campo conservativo, qualquer caminho fechado dá trabalho zero.',
        },
      ],
    },
    conceitos: ['linha.conservativo', 'linha.caminho-fechado'],
    armadilhas: [
      {
        resposta: potencial(de) - potencial(ate),
        diagnostico:
          'A diferença está invertida: é o potencial no FIM menos o potencial no início.',
        passo: 3,
        conceito: 'linha.conservativo',
      },
      {
        resposta: potencial(ate),
        diagnostico:
          'Esse é o potencial no ponto final. O trabalho é a DIFERENÇA entre os dois potenciais.',
        passo: 2,
        conceito: 'linha.conservativo',
      },
      {
        resposta: 0,
        diagnostico:
          'Trabalho zero acontece em caminho FECHADO. Aqui as pontas são diferentes, e o ' +
          'potencial muda entre elas.',
        passo: 3,
        conceito: 'linha.caminho-fechado',
      },
    ],
    dica: 'Ache a função cujo gradiente é o campo, e subtraia os valores dela nas pontas.',
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
