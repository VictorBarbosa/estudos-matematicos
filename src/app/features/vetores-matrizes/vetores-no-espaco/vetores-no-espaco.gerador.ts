import {
  Vetor3,
  anguloEntreVetores3ComPassos,
  modulo3ComPassos,
  produtoEscalar3,
  produtoEscalar3ComPassos,
  produtoVetorial,
  produtoVetorial3ComPassos,
  unitario3ComPassos,
  vetor3ParaTex,
  volumeDoParalelepipedoComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const { saoEquivalentes: proximos } = numeroComCasas(2, 1e-4);

/**
 * Vetores no espaço.
 *
 * O plano é onde se aprende; o espaço é onde a engenharia acontece. Dois dos
 * exercícios daqui nem existem no plano: o produto vetorial, que lá é um
 * número solto e aqui é um vetor perpendicular aos dois, e o produto misto,
 * que responde se três vetores cabem num mesmo plano.
 *
 * Toda resposta é um número — inclusive nos exercícios que produzem vetores,
 * em que se pede uma componente. É o que permite corrigir com a tolerância do
 * campo numérico em vez de inventar um formato de resposta para vetor.
 */
export const geradorVetores3: GeradorExercicio<number> = {
  topicoId: 'vetores-no-espaco',
  formatoResposta: 'um número, ex.: 7 ou -2,5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    return rng.escolher(SORTEADORES[nivel])(rng, nivel);
  },

  analisar: (entrada) => analisarNumero(entrada),

  ...numeroComCasas(2, 1e-4),
};

type Sorteador = (rng: Rng, nivel: Nivel) => Exercicio<number>;

/** Componentes pequenas no Fácil; no Difícil elas crescem e ganham sinal. */
function sortearVetor(rng: Rng, nivel: Nivel): Vetor3 {
  const limite = nivel === 'facil' ? 5 : nivel === 'medio' ? 8 : 12;
  const componente = (): number =>
    nivel === 'facil' ? rng.inteiro(1, limite) : rng.inteiro(-limite, limite);

  return { x: componente(), y: componente(), z: componente() };
}

/** Um vetor com módulo inteiro, para o Fácil não cair em raiz feia. */
function sortearPitagorico(rng: Rng): Vetor3 {
  const ternos: readonly Vetor3[] = [
    { x: 1, y: 2, z: 2 },
    { x: 2, y: 3, z: 6 },
    { x: 1, y: 4, z: 8 },
    { x: 2, y: 6, z: 9 },
    { x: 4, y: 4, z: 7 },
    { x: 3, y: 4, z: 12 },
  ];
  return rng.escolher(ternos);
}

function exercicioModulo(rng: Rng, nivel: Nivel): Exercicio<number> {
  const v = nivel === 'facil' ? sortearPitagorico(rng) : sortearVetor(rng, nivel);
  const resolucao = modulo3ComPassos(v);

  return {
    id: `v3-modulo-${v.x}-${v.y}-${v.z}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Qual é o módulo deste vetor?',
    enunciadoTex: `\\vec{v} = ${vetor3ParaTex(v)}`,
    gabarito: resolucao.resultado,
    resolucao,
    conceitos: ['vetores3.modulo', 'vetores3.componentes'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.abs(v.x) + Math.abs(v.y) + Math.abs(v.z),
          diagnostico:
            'Você somou as componentes. O módulo não é a soma: é a raiz da soma dos QUADRADOS, ' +
            'porque as três direções são perpendiculares entre si.',
          passo: 0,
          conceito: 'vetores3.modulo',
        },
        {
          resposta: Math.sqrt(v.x * v.x + v.y * v.y),
          diagnostico:
            'O z ficou de fora. No espaço são três componentes: Pitágoras se aplica duas ' +
            'vezes, primeiro no plano xy e depois com a altura.',
          passo: 1,
          conceito: 'vetores3.componentes',
        },
      ],
      resolucao.resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'Eleve cada componente ao quadrado, some e tire a raiz.' : undefined,
  };
}

function exercicioEscalar(rng: Rng, nivel: Nivel): Exercicio<number> {
  const a = sortearVetor(rng, nivel);
  const b = sortearVetor(rng, nivel);
  const resolucao = produtoEscalar3ComPassos(a, b);

  return {
    id: `v3-escalar-${a.x}${a.y}${a.z}-${b.x}${b.y}${b.z}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Calcule o produto escalar dos dois vetores.',
    enunciadoTex: `\\vec{a} = ${vetor3ParaTex(a)} \\qquad \\vec{b} = ${vetor3ParaTex(b)}`,
    gabarito: resolucao.resultado,
    resolucao,
    conceitos: ['vetores3.escalar', 'vetores3.componentes'],
    armadilhas: semColisoes(
      [
        {
          resposta: produtoVetorial(a, b).z,
          diagnostico:
            'Essa é a componente z do produto VETORIAL. O escalar multiplica componentes de ' +
            'mesmo nome e soma tudo — e devolve um número, não um vetor.',
          passo: 0,
          conceito: 'vetores3.escalar',
        },
        {
          resposta: a.x * b.x + a.y * b.y,
          diagnostico: 'Faltou o termo em z: o produto escalar soma as TRÊS parcelas.',
          passo: 1,
          conceito: 'vetores3.escalar',
        },
      ],
      resolucao.resultado,
      proximos,
    ),
  };
}

/** No produto vetorial a resposta é uma componente, sorteada no enunciado. */
function exercicioVetorial(rng: Rng, nivel: Nivel): Exercicio<number> {
  const a = sortearVetor(rng, nivel);
  const b = sortearVetor(rng, nivel);
  const eixo = rng.escolher(['x', 'y', 'z'] as const);

  const resolucao = produtoVetorial3ComPassos(a, b);
  const resultado = resolucao.resultado[eixo];
  const trocado = produtoVetorial(b, a)[eixo];

  return {
    id: `v3-vetorial-${eixo}-${a.x}${a.y}${a.z}-${b.x}${b.y}${b.z}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Calcule a componente ${eixo} do produto vetorial a × b.`,
    enunciadoTex: `\\vec{a} = ${vetor3ParaTex(a)} \\qquad \\vec{b} = ${vetor3ParaTex(b)}`,
    gabarito: resultado,
    resolucao: { resultado, passos: resolucao.passos },
    conceitos: ['vetores3.vetorial', 'vetores3.componentes'],
    armadilhas: semColisoes(
      [
        {
          resposta: trocado,
          diagnostico:
            'Esse é o resultado de b × a. A ordem importa: trocar os vetores troca o sinal do ' +
            'produto vetorial inteiro.',
          passo: 0,
          conceito: 'vetores3.vetorial',
        },
        {
          resposta: produtoEscalar3(a, b),
          diagnostico:
            'Esse é o produto ESCALAR, que devolve um número só. O vetorial devolve um vetor, ' +
            'perpendicular aos dois, e aqui a pergunta é por uma das componentes dele.',
          passo: 0,
          conceito: 'vetores3.vetorial',
        },
      ],
      resultado,
      proximos,
    ),
    dica:
      eixo === 'y'
        ? 'Atenção ao y: a ordem dos termos é trocada, e é aí que o sinal costuma se perder.'
        : undefined,
  };
}

function exercicioAngulo(rng: Rng, nivel: Nivel): Exercicio<number> {
  let a = sortearVetor(rng, nivel);
  let b = sortearVetor(rng, nivel);

  // Vetor nulo não tem direção, e o ângulo com ele não existe.
  if (a.x === 0 && a.y === 0 && a.z === 0) {
    a = { x: 1, y: 1, z: 1 };
  }
  if (b.x === 0 && b.y === 0 && b.z === 0) {
    b = { x: 1, y: 0, z: 1 };
  }

  const resolucao = anguloEntreVetores3ComPassos(a, b);

  return {
    id: `v3-angulo-${a.x}${a.y}${a.z}-${b.x}${b.y}${b.z}-${rng.inteiro(0, 9999)}`,
    nivel,
    // Duas casas, que é a tolerância da correção deste tópico: prometer uma
    // casa seria prometer um arredondamento que o campo recusa.
    enunciado:
      'Qual é o ângulo entre os dois vetores, em graus? Arredonde para duas casas decimais.',
    enunciadoTex: `\\vec{a} = ${vetor3ParaTex(a)} \\qquad \\vec{b} = ${vetor3ParaTex(b)}`,
    gabarito: resolucao.resultado,
    resolucao,
    conceitos: ['vetores3.angulo', 'vetores3.escalar'],
    armadilhas: semColisoes(
      [
        {
          resposta: 90 - resolucao.resultado,
          diagnostico:
            'Você respondeu o complementar. O arco-cosseno já devolve o ângulo entre os ' +
            'vetores — não é preciso subtrair de 90°.',
          passo: 2,
          conceito: 'vetores3.angulo',
        },
      ],
      resolucao.resultado,
      proximos,
    ),
  };
}

function exercicioUnitario(rng: Rng, nivel: Nivel): Exercicio<number> {
  const v = nivel === 'facil' ? sortearPitagorico(rng) : sortearVetor(rng, nivel);
  const eixo = rng.escolher(['x', 'y', 'z'] as const);
  const resolucao = unitario3ComPassos(v);
  const resultado = resolucao.resultado[eixo];

  return {
    id: `v3-unitario-${eixo}-${v.x}${v.y}${v.z}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é a componente ${eixo} do vetor unitário na direção de v? Arredonde para duas casas decimais.`,
    enunciadoTex: `\\vec{v} = ${vetor3ParaTex(v)}`,
    gabarito: resultado,
    resolucao: { resultado, passos: resolucao.passos },
    conceitos: ['vetores3.unitario', 'vetores3.modulo'],
    armadilhas: semColisoes(
      [
        {
          resposta: v[eixo],
          diagnostico:
            'Essa é a componente do vetor original. O unitário é o vetor DIVIDIDO pelo próprio ' +
            'módulo — ele guarda a direção e joga fora o tamanho.',
          passo: 0,
          conceito: 'vetores3.unitario',
        },
        {
          resposta: v[eixo] / (Math.abs(v.x) + Math.abs(v.y) + Math.abs(v.z)),
          diagnostico:
            'Você dividiu pela soma das componentes, não pelo módulo. O módulo é a raiz da soma ' +
            'dos quadrados.',
          passo: 1,
          conceito: 'vetores3.modulo',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

function exercicioVolume(rng: Rng, nivel: Nivel): Exercicio<number> {
  const a = sortearVetor(rng, nivel);
  const b = sortearVetor(rng, nivel);
  const c = sortearVetor(rng, nivel);
  const resolucao = volumeDoParalelepipedoComPassos(a, b, c);

  return {
    id: `v3-volume-${a.x}${b.y}${c.z}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Qual é o volume do paralelepípedo formado pelos três vetores?',
    enunciadoTex:
      `\\vec{a} = ${vetor3ParaTex(a)} \\quad \\vec{b} = ${vetor3ParaTex(b)} \\quad ` +
      `\\vec{c} = ${vetor3ParaTex(c)}`,
    gabarito: resolucao.resultado,
    resolucao,
    conceitos: ['vetores3.misto', 'vetores3.vetorial'],
    armadilhas: semColisoes(
      [
        {
          resposta: produtoEscalar3(a, produtoVetorial(b, c)),
          diagnostico:
            'Falta o módulo. O produto misto pode dar negativo — o sinal diz a orientação dos ' +
            'três vetores —, mas volume é sempre positivo.',
          passo: 2,
          conceito: 'vetores3.misto',
        },
      ],
      resolucao.resultado,
      proximos,
    ),
    dica: 'Primeiro b × c, depois o escalar com a, e por fim o módulo.',
  };
}

const SORTEADORES: Readonly<Record<Nivel, readonly Sorteador[]>> = {
  facil: [exercicioModulo, exercicioEscalar, exercicioUnitario],
  medio: [exercicioModulo, exercicioEscalar, exercicioVetorial, exercicioUnitario, exercicioAngulo],
  dificil: [
    exercicioEscalar,
    exercicioVetorial,
    exercicioAngulo,
    exercicioUnitario,
    exercicioVolume,
  ],
  /*
   * O volume do paralelepípedo é o produto misto: um vetorial, um escalar e
   * um módulo em sequência. O ângulo pede os dois módulos além do escalar.
   * São os dois exercícios do tópico que encadeiam operações.
   */
  extremo: [exercicioVolume, exercicioAngulo],
};
