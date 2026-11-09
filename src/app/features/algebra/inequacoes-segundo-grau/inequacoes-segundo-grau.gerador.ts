import {
  ConjuntoSolucaoReal,
  Polinomio,
  Relacao,
  SIMBOLO_RELACAO,
  binomioParaTex,
  solucaoRealEmTexto,
  resolverInequacaoProdutoComPassos,
  resolverInequacaoQuadraticaComPassos,
  resolverInequacaoQuocienteComPassos,
} from '@core/math';
import { Resolucao } from '@core/math/tipos/tipos';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, proximosEmCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Armadilha,
  Exercicio,
  GeradorExercicio,
  Nivel,
  TeclaDeSimbolo,
  semColisoes,
} from '@core/treino/models/treino.model';

type Pergunta =
  'produto' | 'trinomio' | 'trinomio-negativo' | 'racional' | 'sem-raiz' | 'quociente';

const RELACOES: readonly Relacao[] = ['<', '<=', '>', '>='];

const proximo = proximosEmCasas(2, 1e-4);

/** Dois conjuntos são o mesmo: mesma forma, mesmas fronteiras, mesmas bolinhas. */
export function mesmoConjunto(x: ConjuntoSolucaoReal, y: ConjuntoSolucaoReal): boolean {
  if (x.tipo !== y.tipo) return false;
  switch (x.tipo) {
    case 'vazio':
    case 'todos':
      return true;
    case 'ponto':
    case 'exceto':
      return proximo(x.a, (y as typeof x).a);
    case 'entre':
    case 'fora': {
      const z = y as typeof x;
      return (
        proximo(x.a, z.a) && proximo(x.b, z.b) && x.fechaA === z.fechaA && x.fechaB === z.fechaB
      );
    }
  }
}

/** Uma desigualdade solta, `x < 3` ou `3 > x`, lida como «x de que lado de quanto». */
function lerLado(texto: string): { menorQue: boolean; fecha: boolean; valor: number } | null {
  const direta = /^x(<=|>=|<|>)(.+)$/.exec(texto);
  const invertida = /^(.+?)(<=|>=|<|>)x$/.exec(texto);
  const achado = direta ?? invertida;
  if (achado === null) return null;

  const relacao = direta ? achado[1]! : achado[2]!;
  const valor = analisarNumero(direta ? achado[2]! : achado[1]!);
  if (valor === null) return null;

  const aponta = relacao.startsWith('<');
  return { menorQue: direta ? aponta : !aponta, fecha: relacao.endsWith('='), valor };
}

/** Lê `-2 < x < 3`, `x <= 1 ou x >= 4`, `x ≠ 2`, `x = 2`, `vazio` e `todos`. */
export function analisarConjunto(entrada: string): ConjuntoSolucaoReal | null {
  const t = entrada
    .trim()
    .toLowerCase()
    .replace(/≤|=<|⩽/g, '<=')
    .replace(/≥|=>|⩾/g, '>=')
    .replace(/≠|<>|=\//g, '!=')
    .replace(/[−–]/g, '-')
    .replace(/\s+/g, '');

  if (/^(s=)?(vazio|∅|ø|\{\}|nenhum|nenhumx|nenhumreal)$/.test(t)) return { tipo: 'vazio' };
  if (/^(s=)?(todos|todososreais|todoreal|todox|qualquerx|r|ℝ|ir)$/.test(t))
    return { tipo: 'todos' };

  const igualdade = /^x(!=|=)(.+)$/.exec(t);
  if (igualdade) {
    const valor = analisarNumero(igualdade[2]!);
    if (valor === null) return null;
    return { tipo: igualdade[1] === '=' ? 'ponto' : 'exceto', a: valor };
  }

  const partes = t.split(/ou|or|∪|\|\|/).filter((p) => p !== '');
  if (partes.length === 2) {
    const lados = partes.map(lerLado);
    const esquerda = lados.find((l) => l?.menorQue);
    const direita = lados.find((l) => l && !l.menorQue);
    if (!esquerda || !direita || esquerda.valor > direita.valor) return null;
    return {
      tipo: 'fora',
      a: esquerda.valor,
      b: direita.valor,
      fechaA: esquerda.fecha,
      fechaB: direita.fecha,
    };
  }

  const entre = /^(.+?)(<=|<)x(<=|<)(.+)$/.exec(t);
  if (entre) {
    const a = analisarNumero(entre[1]!);
    const b = analisarNumero(entre[4]!);
    if (a === null || b === null || a > b) return null;
    return { tipo: 'entre', a, b, fechaA: entre[2] === '<=', fechaB: entre[3] === '<=' };
  }

  return null;
}

const SIMBOLOS: readonly TeclaDeSimbolo[] = [
  { rotulo: '≤', insere: ' ≤ ', nome: 'menor ou igual' },
  { rotulo: '≥', insere: ' ≥ ', nome: 'maior ou igual' },
  { rotulo: '≠', insere: ' ≠ ', nome: 'diferente' },
  { rotulo: 'ou', insere: ' ou ', nome: 'ou' },
  { rotulo: '∅', insere: 'vazio', nome: 'conjunto vazio' },
  { rotulo: 'ℝ', insere: 'todos', nome: 'todos os reais' },
];

/**
 * Exercícios de estudo de sinal e inequações do 2º grau.
 *
 * A resposta é o conjunto solução, escrito como se escreve no caderno. As
 * armadilhas são as três que o tópico existe para desfazer: o pedaço errado
 * (entre × fora), a bolinha errada (≤ × <) e, na fração, o zero do
 * denominador incluído.
 */
export const geradorInequacoesSegundoGrau: GeradorExercicio<ConjuntoSolucaoReal> = {
  topicoId: 'inequacoes-segundo-grau',
  formatoResposta: 'o conjunto, ex.: -2 < x < 3 · x <= 1 ou x >= 4 · x ≠ 2 · vazio · todos',
  simbolos: SIMBOLOS,

  gerar(nivel: Nivel, rng: Rng): Exercicio<ConjuntoSolucaoReal> {
    const pergunta = sortearPergunta(nivel, rng);
    const relacao = rng.escolher(RELACOES);

    switch (pergunta) {
      case 'produto':
        return exercicioProduto(nivel, rng, relacao);
      case 'quociente':
        return exercicioQuociente(nivel, rng, relacao);
      case 'sem-raiz':
        return exercicioSemRaiz(nivel, rng, relacao);
      default:
        return exercicioTrinomio(nivel, rng, relacao, pergunta);
    }
  },

  analisar: analisarConjunto,
  saoEquivalentes: mesmoConjunto,
  formatar: solucaoRealEmTexto,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['produto', 'trinomio']);
    case 'medio':
      return rng.escolher<Pergunta>(['trinomio-negativo', 'produto', 'trinomio']);
    case 'dificil':
      return rng.escolher<Pergunta>(['racional', 'sem-raiz', 'trinomio-negativo']);
    // A fração é a única que pede o zero do denominador de fora — o erro que
    // separa quem aplicou a regra de quem decorou «≥ fecha a bolinha».
    case 'extremo':
      return rng.escolher<Pergunta>(['quociente', 'racional', 'sem-raiz']);
  }
}

const ENUNCIADO = 'Resolva a inequação e escreva o conjunto solução.';
const COMO_FRACAO = ' Fronteiras não inteiras como fração, ex.: 3/2.';

/** As armadilhas que valem para qualquer conjunto com duas fronteiras. */
function armadilhasDeIntervalo(
  gabarito: ConjuntoSolucaoReal,
  passoDoPedaco: number,
  passoDaBolinha: number,
  conceito: string,
): Armadilha<ConjuntoSolucaoReal>[] {
  if (gabarito.tipo !== 'entre' && gabarito.tipo !== 'fora') return [];
  const trocado: ConjuntoSolucaoReal = {
    ...gabarito,
    tipo: gabarito.tipo === 'entre' ? 'fora' : 'entre',
  };
  const bolinha: ConjuntoSolucaoReal = {
    ...gabarito,
    fechaA: !gabarito.fechaA,
    fechaB: !gabarito.fechaB,
  };
  return [
    {
      resposta: trocado,
      diagnostico:
        'As fronteiras estão certas, mas o pedaço não: a solução fica ' +
        `${gabarito.tipo === 'entre' ? 'ENTRE as raízes' : 'FORA das raízes'}. Teste um número de cada ` +
        'pedaço na expressão para conferir o sinal.',
      passo: passoDoPedaco,
      conceito,
    },
    {
      resposta: bolinha,
      diagnostico: gabarito.fechaA
        ? 'O pedaço está certo, mas as fronteiras ENTRAM: a relação tem «ou igual», e nelas a expressão vale 0.'
        : 'O pedaço está certo, mas as fronteiras NÃO entram: a desigualdade é estrita, e nelas a expressão vale 0.',
      passo: passoDaBolinha,
      conceito: 'sinal.trinomio',
    },
  ];
}

function montar(
  id: string,
  nivel: Nivel,
  enunciadoTex: string,
  resolucao: Resolucao<ConjuntoSolucaoReal>,
  conceitos: readonly string[],
  armadilhas: Armadilha<ConjuntoSolucaoReal>[],
  dica: string | undefined,
  fracao = false,
): Exercicio<ConjuntoSolucaoReal> {
  const gabarito = resolucao.resultado;
  return {
    id,
    nivel,
    enunciado: ENUNCIADO + (fracao ? COMO_FRACAO : ''),
    enunciadoTex,
    gabarito,
    resolucao: { resultado: gabarito, passos: resolucao.passos },
    conceitos,
    armadilhas: semColisoes(armadilhas, gabarito, mesmoConjunto),
    dica,
  };
}

/** Duas raízes inteiras distintas, em ordem. */
function duasRaizes(rng: Rng, alcance = 6): [number, number] {
  const r1 = rng.inteiro(-alcance, alcance);
  let r2 = rng.inteiro(-alcance, alcance);
  while (r2 === r1) r2 = rng.inteiro(-alcance, alcance);
  return r1 < r2 ? [r1, r2] : [r2, r1];
}

function exercicioProduto(
  nivel: Nivel,
  rng: Rng,
  relacao: Relacao,
): Exercicio<ConjuntoSolucaoReal> {
  const [r1, r2] = duasRaizes(rng);
  // No Médio, um fator vem «ao contrário» (3 − x): o sinal dele se inverte.
  const invertido = nivel !== 'facil' && rng.booleano();
  const [p, q] = invertido ? [-1, r1] : [1, -r1];
  const [r, s] = [1, -r2];

  const resolucao = resolverInequacaoProdutoComPassos(p, q, r, s, relacao);
  const tex = `\\left(${binomioParaTex(p, q)}\\right)\\left(${binomioParaTex(r, s)}\\right) ${SIMBOLO_RELACAO[relacao]} 0`;

  return montar(
    `sinal-produto-${p}${q}${r}${s}-${relacao}-${rng.inteiro(0, 9999)}`,
    nivel,
    tex,
    resolucao,
    ['sinal.produto'],
    armadilhasDeIntervalo(
      resolucao.resultado,
      resolucao.passos.length - 2,
      resolucao.passos.length - 1,
      'sinal.produto',
    ),
    nivel === 'facil'
      ? `Cada fator troca de sinal na sua raiz (${r1} e ${r2}). Marque as duas na reta e veja o sinal do produto em cada pedaço.`
      : invertido && nivel === 'medio'
        ? `O fator ${binomioParaTex(p, q)} tem coeficiente de x negativo: ele é POSITIVO à esquerda da raiz.`
        : undefined,
  );
}

function exercicioTrinomio(
  nivel: Nivel,
  rng: Rng,
  relacao: Relacao,
  pergunta: Pergunta,
): Exercicio<ConjuntoSolucaoReal> {
  let a: number, b: number, c: number;
  let fracao = false;

  if (pergunta === 'racional') {
    // (px − q)(rx − s): raízes q/p e s/r, ao menos uma não inteira.
    let p: number, q: number, r: number, s: number;
    do {
      p = rng.inteiro(1, 3);
      r = rng.inteiro(2, 3);
      q = rng.inteiro(-7, 7);
      s = rng.inteiro(-7, 7);
    } while (q * r === s * p || (q % p === 0 && s % r === 0));
    const k = rng.booleano(0.3) ? -1 : 1;
    [a, b, c] = [k * p * r, -k * (p * s + q * r), k * q * s];
    fracao = true;
  } else {
    const [r1, r2] = duasRaizes(rng);
    const k = pergunta === 'trinomio-negativo' ? -rng.inteiro(1, 3) : 1;
    [a, b, c] = [k, -k * (r1 + r2), k * r1 * r2];
  }

  const p = Polinomio.de(c, b, a);
  const resolucao = resolverInequacaoQuadraticaComPassos(a, b, c, relacao);
  const ultimo = resolucao.passos.length - 1;

  const dica =
    pergunta === 'trinomio' && nivel === 'facil'
      ? 'Ache as raízes. Com a positivo, o trinômio é NEGATIVO entre elas e POSITIVO fora delas.'
      : pergunta === 'trinomio-negativo' && nivel === 'medio'
        ? `a = ${a} é negativo: a parábola abre para baixo, então o trinômio é POSITIVO entre as raízes.`
        : pergunta === 'racional' && nivel === 'dificil'
          ? 'Use Bhaskara: as raízes são frações. Depois, fora delas o trinômio tem o sinal de a.'
          : undefined;

  return montar(
    `sinal-${pergunta}-${a}${b}${c}-${relacao}-${rng.inteiro(0, 9999)}`,
    nivel,
    `${p.paraTex()} ${SIMBOLO_RELACAO[relacao]} 0`,
    resolucao,
    ['sinal.trinomio'],
    armadilhasDeIntervalo(resolucao.resultado, ultimo - 1, ultimo, 'sinal.trinomio'),
    dica,
    fracao,
  );
}

function exercicioSemRaiz(
  nivel: Nivel,
  rng: Rng,
  relacao: Relacao,
): Exercicio<ConjuntoSolucaoReal> {
  // a(x − h)² + k: com k do sinal de a, Δ < 0; com k = 0, raiz dupla.
  const sinalA = rng.sinal();
  const a = sinalA * rng.inteiro(1, 3);
  const h = rng.inteiro(-4, 4);
  const dupla = rng.booleano();
  const k = dupla ? 0 : sinalA * rng.inteiro(1, 6);
  const [b, c] = [-2 * a * h, a * h * h + k];

  const p = Polinomio.de(c, b, a);
  const resolucao = resolverInequacaoQuadraticaComPassos(a, b, c, relacao);
  const gabarito = resolucao.resultado;
  const ultimo = resolucao.passos.length - 1;

  const oposto: Record<ConjuntoSolucaoReal['tipo'], ConjuntoSolucaoReal | null> = {
    vazio: { tipo: 'todos' },
    todos: dupla ? { tipo: 'exceto', a: h } : { tipo: 'vazio' },
    ponto: { tipo: 'vazio' },
    exceto: { tipo: 'todos' },
    entre: null,
    fora: null,
  };
  const armadilhas: Armadilha<ConjuntoSolucaoReal>[] = [];
  const outra = oposto[gabarito.tipo];
  if (outra) {
    armadilhas.push({
      resposta: outra,
      diagnostico: dupla
        ? `Δ = 0: o trinômio só vale 0 em x = ${h}; fora dali tem o sinal de a. Decida se o ponto x = ${h} entra pela relação: ` +
          `${relacao.endsWith('=') ? 'com «ou igual», entra' : 'estrita, não entra'}.`
        : `Δ < 0: o trinômio tem SEMPRE o sinal de a (${a > 0 ? 'positivo' : 'negativo'}). A resposta é tudo ou nada.`,
      passo: ultimo - 1,
      conceito: 'sinal.delta',
    });
  }

  return montar(
    `sinal-semraiz-${a}${b}${c}-${relacao}-${rng.inteiro(0, 9999)}`,
    nivel,
    `${p.paraTex()} ${SIMBOLO_RELACAO[relacao]} 0`,
    resolucao,
    ['sinal.delta', 'sinal.trinomio'],
    armadilhas,
    nivel === 'dificil'
      ? 'Calcule Δ primeiro. Se Δ < 0, o trinômio tem sempre o sinal de a: a resposta é «todos» ou «vazio».'
      : undefined,
  );
}

function exercicioQuociente(
  nivel: Nivel,
  rng: Rng,
  relacao: Relacao,
): Exercicio<ConjuntoSolucaoReal> {
  const [zN, zD] = rng.booleano() ? duasRaizes(rng, 5) : duasRaizes(rng, 5).reverse();
  const p = rng.escolher([1, 1, -1, 2]);
  const r = rng.escolher([1, 1, -1, 3]);
  const [q, s] = [-p * zN!, -r * zD!];

  const resolucao = resolverInequacaoQuocienteComPassos(p, q, r, s, relacao);
  const gabarito = resolucao.resultado;
  const ultimo = resolucao.passos.length - 1;
  const armadilhas = armadilhasDeIntervalo(gabarito, ultimo - 1, ultimo, 'sinal.quociente');

  // O erro clássico: fechar também a fronteira do denominador.
  if ((gabarito.tipo === 'entre' || gabarito.tipo === 'fora') && relacao.endsWith('=')) {
    armadilhas.push({
      resposta: { ...gabarito, fechaA: true, fechaB: true },
      diagnostico:
        `x = ${zD} zera o DENOMINADOR: ali a fração não existe, então essa fronteira fica de fora mesmo com ` +
        `«ou igual». Só a do numerador (x = ${zN}) entra.`,
      passo: ultimo,
      conceito: 'sinal.quociente',
    });
  }

  return montar(
    `sinal-quociente-${p}${q}${r}${s}-${relacao}-${rng.inteiro(0, 9999)}`,
    nivel,
    `\\frac{${binomioParaTex(p, q)}}{${binomioParaTex(r, s)}} ${SIMBOLO_RELACAO[relacao]} 0`,
    resolucao,
    ['sinal.quociente', 'sinal.produto'],
    armadilhas,
    nivel === 'extremo'
      ? 'Faça o quadro de sinais de cima e de baixo. O zero do denominador nunca entra, nem com ≤ ou ≥.'
      : undefined,
  );
}
