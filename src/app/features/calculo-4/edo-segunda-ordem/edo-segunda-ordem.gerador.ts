import {
  avaliarSegundaOrdem,
  periodoAmortecidoComPassos,
  raizesCaracteristicas,
  segundaOrdemComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import {
  exercicioAmortecimentoCritico,
  exercicioMeiaAmplitude,
  exercicioRigidezLimite,
} from '@features/calculo-4/edo-segunda-ordem/edo-segunda-ordem.amortecimento';
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
 * Exercícios de EDO linear de segunda ordem.
 *
 * Toda a física de oscilação está aqui, e o discriminante da equação
 * característica decide o regime. Os exercícios cobram as três raízes
 * possíveis e o que cada uma significa fisicamente — porque é essa leitura,
 * não a conta, que se usa ao projetar uma suspensão ou um circuito.
 */

const CASAS = 4;
const { saoEquivalentes, formatar } = numeroComCasas(CASAS);

const PEDIDO = 'Responda com 4 casas decimais.';

type Tipo =
  'raiz' | 'valor' | 'periodo' | 'discriminante' | 'critico' | 'rigidez-limite' | 'meia-amplitude';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['discriminante', 'raiz'],
  medio: ['raiz', 'valor', 'discriminante', 'critico'],
  dificil: ['valor', 'periodo', 'raiz', 'rigidez-limite'],
  // As raízes da característica decidem a forma da solução — e com
  // complexas a resposta muda de natureza. A meia-amplitude pede ler a
  // envoltória da oscilação amortecida.
  extremo: ['raiz', 'valor', 'meia-amplitude'],
};

export const geradorEdoSegundaOrdem: GeradorExercicio<number> = {
  topicoId: 'edo-segunda-ordem',
  formatoResposta: FORMATO_NUMERICO_AMPLO,

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'raiz':
        return daRaiz(nivel, rng);
      case 'valor':
        return doValor(nivel, rng);
      case 'periodo':
        return doPeriodo(nivel, rng);
      case 'critico':
        return exercicioAmortecimentoCritico(nivel, rng);
      case 'rigidez-limite':
        return exercicioRigidezLimite(nivel, rng);
      case 'meia-amplitude':
        return exercicioMeiaAmplitude(nivel, rng);
      default:
        return doDiscriminante(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes,
  formatar,
};

/** Coeficientes que garantem raízes reais distintas. */
function sortearReais(rng: Rng): { b: number; c: number } {
  const r1 = -rng.inteiro(1, 6);
  const r2 = -rng.inteiro(1, 6) - 1;
  return { b: -(r1 + r2), c: r1 * r2 };
}

/** Coeficientes que garantem raízes complexas. */
function sortearComplexas(rng: Rng): { b: number; c: number } {
  const b = rng.inteiro(1, 5);
  const c = rng.inteiro(Math.ceil((b * b) / 4) + 1, Math.ceil((b * b) / 4) + 12);
  return { b, c };
}

/** A maior raiz da equação característica. */
function daRaiz(nivel: Nivel, rng: Rng): Exercicio<number> {
  const { b, c } = sortearReais(rng);
  const raizes = raizesCaracteristicas(b, c);
  const gabarito = Math.max(raizes.r1, raizes.r2);

  return montar({
    chave: `rz-${b}-${c}`,
    nivel,
    rng,
    enunciado: `Qual é a MAIOR raiz da equação característica desta EDO? ${PEDIDO}`,
    enunciadoTex: `y'' + ${formatar(b)}y' + ${formatar(c)}y = 0`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: segundaOrdemComPassos(b, c, 1, 0, 0).passos.slice(0, 3),
    },
    conceitos: ['edo2.caracteristica', 'edo2.regimes'],
    armadilhas: [
      {
        resposta: Math.min(raizes.r1, raizes.r2),
        diagnostico:
          'Essa é a menor raiz. A maior é a que domina o comportamento para t grande, porque ' +
          'ela decai mais devagar.',
        passo: 2,
        conceito: 'edo2.caracteristica',
      },
      {
        resposta: -gabarito,
        diagnostico:
          'O sinal está invertido. Com b e c positivos, as duas raízes são negativas — é isso ' +
          'que faz o sistema voltar ao repouso.',
        passo: 2,
        conceito: 'edo2.regimes',
      },
      {
        resposta: b * b - 4 * c,
        diagnostico: 'Esse é o discriminante, que decide o regime, mas não é uma raiz.',
        passo: 1,
        conceito: 'edo2.caracteristica',
      },
    ],
    dica:
      nivel === 'facil'
        ? 'Substitua y igual a e elevado a rt e resolva a quadrática que aparece.'
        : undefined,
  });
}

/** O valor da solução num instante, com as duas condições iniciais. */
function doValor(nivel: Nivel, rng: Rng): Exercicio<number> {
  const { b, c } = rng.booleano() ? sortearReais(rng) : sortearComplexas(rng);
  const y0 = rng.inteiro(1, 10);
  const v0 = rng.inteiro(-8, 8);
  const t = rng.inteiro(1, 5) / 2;

  const raizes = raizesCaracteristicas(b, c);
  const gabarito = avaliarSegundaOrdem(raizes, y0, v0, t);

  return montar({
    chave: `vl-${b}-${c}-${y0}-${v0}-${t}`,
    nivel,
    rng,
    enunciado:
      `Com y(0) = ${y0} e y'(0) = ${v0}, quanto vale a solução em t = ` +
      `${String(t).replace('.', ',')}? ${PEDIDO}`,
    enunciadoTex: `y'' + ${formatar(b)}y' + ${formatar(c)}y = 0`,
    gabarito,
    resolucao: segundaOrdemComPassos(b, c, y0, v0, t),
    conceitos: ['edo2.duas-condicoes', 'edo2.regimes'],
    armadilhas: [
      {
        resposta: y0,
        diagnostico:
          'Esse é o valor inicial. O sistema evolui a partir dele, e em t positivo já se moveu.',
        passo: 3,
        conceito: 'edo2.duas-condicoes',
      },
      {
        resposta: avaliarSegundaOrdem(raizes, y0, 0, t),
        diagnostico:
          `A velocidade inicial foi ignorada. Uma EDO de segunda ordem precisa de DUAS ` +
          'condições, e a segunda é justamente a derivada em zero.',
        passo: 2,
        conceito: 'edo2.duas-condicoes',
      },
      {
        resposta: y0 * Math.exp(raizes.real * t),
        diagnostico:
          'Só a envoltória exponencial foi considerada. A solução completa tem ainda as duas ' +
          'constantes ajustadas às condições iniciais.',
        passo: 2,
        conceito: 'edo2.regimes',
      },
    ],
    dica:
      nivel === 'medio'
        ? `Ache as raízes da característica, escreva a solução geral com duas constantes e use y(0) = ${y0} e y′(0) = ${v0} para achá-las.`
        : undefined,
  });
}

/** O período da oscilação amortecida. */
function doPeriodo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const { b, c } = sortearComplexas(rng);
  const raizes = raizesCaracteristicas(b, c);
  const gabarito = (2 * Math.PI) / raizes.imaginaria;

  return montar({
    chave: `pr-${b}-${c}`,
    nivel,
    rng,
    enunciado: `Qual é o período da oscilação descrita por esta EDO? ${PEDIDO}`,
    enunciadoTex: `y'' + ${formatar(b)}y' + ${formatar(c)}y = 0`,
    gabarito,
    resolucao: periodoAmortecidoComPassos(b, c),
    conceitos: ['edo2.oscilacao', 'edo2.caracteristica'],
    armadilhas: [
      {
        resposta: (2 * Math.PI) / Math.sqrt(c),
        diagnostico:
          'Essa é a frequência NATURAL, sem amortecimento. O atrito alonga o período, e a ' +
          'frequência amortecida é menor que a natural.',
        passo: 1,
        conceito: 'edo2.oscilacao',
      },
      {
        resposta: raizes.imaginaria,
        diagnostico:
          'Essa é a frequência angular amortecida, em radianos por unidade de tempo. O período ' +
          'é uma volta inteira dividida por ela.',
        passo: 2,
        conceito: 'edo2.oscilacao',
      },
      {
        resposta: 1 / raizes.imaginaria,
        diagnostico: 'Faltou o fator 2 pi: uma volta completa não é 1 radiano.',
        passo: 2,
        conceito: 'edo2.oscilacao',
      },
    ],
    dica: 'A parte imaginária das raízes é a frequência angular da oscilação.',
  });
}

/** O discriminante, que decide o regime. */
function doDiscriminante(nivel: Nivel, rng: Rng): Exercicio<number> {
  const b = rng.inteiro(1, 10);
  const c = rng.inteiro(1, 25);

  const gabarito = b * b - 4 * c;
  const raizes = raizesCaracteristicas(b, c);

  return montar({
    chave: `ds-${b}-${c}`,
    nivel,
    rng,
    enunciado: `Qual é o discriminante da equação característica desta EDO? ${PEDIDO}`,
    enunciadoTex: `y'' + ${formatar(b)}y' + ${formatar(c)}y = 0`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Substituindo uma exponencial, a EDO vira uma equação do segundo grau.',
          tex: `r^{2} + ${formatar(b)}r + ${formatar(c)} = 0`,
        },
        {
          descricao: 'O discriminante é o de sempre.',
          tex: `\\Delta = ${formatar(b)}^{2} - 4\\cdot${formatar(c)} = ${texNumero(gabarito)}`,
        },
        {
          descricao: 'E é o sinal dele que decide o comportamento do sistema.',
          tex: `\\Delta ${gabarito > 0 ? '> 0' : gabarito < 0 ? '< 0' : '= 0'}`,
          nota:
            raizes.regime === 'superamortecido'
              ? 'Positivo: duas raízes reais, e o sistema volta ao repouso sem oscilar.'
              : raizes.regime === 'subamortecido'
                ? 'Negativo: raízes complexas, e o sistema oscila enquanto a amplitude decai.'
                : 'Nulo: o caso crítico, em que o retorno é o mais rápido possível sem oscilar.',
        },
      ],
    },
    conceitos: ['edo2.caracteristica', 'edo2.regimes'],
    armadilhas: [
      {
        resposta: b * b + 4 * c,
        diagnostico:
          'O sinal do segundo termo está errado: o discriminante é b ao quadrado MENOS quatro ' +
          'vezes o produto.',
        passo: 1,
        conceito: 'edo2.caracteristica',
      },
      {
        resposta: b * b - c,
        diagnostico: 'Faltou o fator 4, que vem da fórmula da quadrática.',
        passo: 1,
        conceito: 'edo2.caracteristica',
      },
      {
        resposta: Math.sqrt(Math.abs(gabarito)),
        diagnostico:
          'Essa é a raiz do discriminante, que aparece na fórmula das raízes. O discriminante ' +
          'em si é o que está dentro dela.',
        passo: 1,
        conceito: 'edo2.caracteristica',
      },
    ],
    dica:
      nivel === 'facil'
        ? `A equação característica é r² + b·r + c = 0, com b = ${String(b).replace('.', ',')} e c = ${String(c).replace('.', ',')}; o discriminante é b² − 4c.`
        : undefined,
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
