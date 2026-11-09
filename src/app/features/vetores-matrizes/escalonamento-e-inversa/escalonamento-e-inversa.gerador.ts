import {
  Fracao,
  Matriz,
  aumentadaParaTex,
  gaussJordanComPassos,
  inversaComPassos,
  nomeDaLinha,
  paraFracoes,
} from '@core/math';
import { TipoSistema } from '@core/math/algebra/sistema-linear/sistema-linear';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 1e-6;

type Pergunta =
  | 'operacao'
  | 'multiplicador'
  | 'retro'
  | 'classificar'
  | 'gauss'
  | 'inversa-2x2'
  | 'parametro'
  | 'inversa-3x3'
  | 'gauss-troca';

const NOMES = ['x', 'y', 'z'] as const;

/** O valor como fração de inteiros, a forma em que o aluno o escreve: `-2/3`. */
function fracaoTexto(valor: number): string {
  for (let denominador = 1; denominador <= 1000; denominador++) {
    const numerador = valor * denominador;
    if (Math.abs(numerador - Math.round(numerador)) < 1e-9) {
      return denominador === 1
        ? String(Math.round(numerador))
        : `${Math.round(numerador)}/${denominador}`;
    }
  }
  return String(Number(valor.toFixed(6))).replace('.', ',');
}

/**
 * O valor em TeX, com o sinal no numerador: `\frac{-2}{3}`.
 *
 * É a forma que o último passo exibe — com o sinal fora da fração, a leitura
 * automática do gabarito (e a do aluno apressado) perderia o menos.
 */
function valorTex(valor: number): string {
  const [n, d] = fracaoTexto(valor).split('/');
  return d === undefined ? n! : `\\frac{${n}}{${d}}`;
}

const ehInteiro = (valor: number): boolean => Math.abs(valor - Math.round(valor)) < 1e-9;

/** Acrescenta o pedido de fração quando o gabarito não é inteiro. */
const comFracao = (enunciado: string, gabarito: number): string =>
  ehInteiro(gabarito) ? enunciado : `${enunciado} Responda como fração.`;

/** `x`, `-x`, `3x`: o coeficiente 1 não se escreve. */
const cx = (c: number, nome: string): string =>
  c === 1 ? nome : c === -1 ? `-${nome}` : `${c}${nome}`;

/** `+ (−4) · 3` na substituição; nada quando o coeficiente é zero. */
const termo = (c: number, valor: number): string =>
  c === 0 ? '' : ` + ${c < 0 ? `(${c})` : c} \\cdot ${valor < 0 ? `(${valor})` : valor}`;

/** `(−3)` entre parênteses, para não sair «2 · −3». */
const par = (valor: number): string => (valor < 0 ? `(${valor})` : `${valor}`);

/** Uma equação linear em TeX: `2x - y + 3z = 4`. Aceita `'k'` como coeficiente. */
function equacaoTex(coeficientes: readonly (number | string)[], constante: number): string {
  const termos: string[] = [];

  coeficientes.forEach((c, i) => {
    const nome = NOMES[i]!;
    if (typeof c === 'string') {
      termos.push(termos.length === 0 ? `${c}${nome}` : `+ ${c}${nome}`);
      return;
    }
    if (c === 0) {
      return;
    }
    const modulo = Math.abs(c) === 1 ? '' : String(Math.abs(c));
    if (termos.length === 0) {
      termos.push(`${c < 0 ? '-' : ''}${modulo}${nome}`);
    } else {
      termos.push(`${c < 0 ? '-' : '+'} ${modulo}${nome}`);
    }
  });

  return `${termos.length === 0 ? '0' : termos.join(' ')} = ${constante}`;
}

function sistemaTex(
  linhas: readonly (readonly (number | string)[])[],
  b: readonly number[],
): string {
  return `\\begin{cases} ${linhas.map((l, i) => equacaoTex(l, b[i]!)).join(' \\\\ ')} \\end{cases}`;
}

function multiplicar(a: Matriz, v: readonly number[]): number[] {
  return a.map((linha) => linha.reduce((soma, c, j) => soma + c * v[j]!, 0));
}

/** `L₂ ← L₂ − 3·L₁`, ou `+` quando o fator é negativo. */
function operacaoTexto(destino: number, fator: number): string {
  const sinal = fator < 0 ? '+' : '−';
  const modulo = Math.abs(fator) === 1 ? '' : `${Math.abs(fator)}·`;
  return `${nomeDaLinha(destino)} ← ${nomeDaLinha(destino)} ${sinal} ${modulo}L₁`;
}

/**
 * A = L·U com inteiros: a eliminação sai limpa e o determinante é d₁d₂d₃.
 *
 * Construir pelo produto garante pivôs não nulos (salvo a troca pedida de
 * propósito) e solução inteira quando os d são ±1.
 */
function matrizLU(
  rng: Rng,
  diagonal: readonly number[],
  limiteL: number,
  limiteU: number,
  semL21 = false,
): number[][] {
  const l21 = semL21 ? 0 : rng.inteiro(-limiteL, limiteL);
  const L = [
    [1, 0, 0],
    [l21, 1, 0],
    [rng.inteiro(-limiteL, limiteL), rng.inteiro(-limiteL, limiteL), 1],
  ];
  const U = [
    [diagonal[0]!, rng.inteiro(-limiteU, limiteU), rng.inteiro(-limiteU, limiteU)],
    [0, diagonal[1]!, rng.inteiro(-limiteU, limiteU)],
    [0, 0, diagonal[2]!],
  ];
  return L.map((linha) => U[0]!.map((_, j) => linha.reduce((s, l, k) => s + l * U[k]![j]!, 0)));
}

const comSinal = (rng: Rng, valores: readonly number[]): number =>
  rng.escolher(valores) * rng.sinal();

/** Exercícios de escalonamento e matriz inversa. */
export const geradorEscalonamento: GeradorExercicio<number> = {
  topicoId: 'escalonamento-e-inversa',
  formatoResposta: 'um número ou fração, ex.: -3 ou 2/5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'operacao':
        return exercicioOperacao(nivel, rng);
      case 'multiplicador':
        return exercicioMultiplicador(nivel, rng);
      case 'retro':
        return exercicioRetro(nivel, rng);
      case 'classificar':
        return nivel === 'facil'
          ? exercicioClassificarEscalonada(nivel, rng)
          : exercicioClassificarSistema(nivel, rng);
      case 'gauss':
        return exercicioGauss(nivel, rng, false);
      case 'gauss-troca':
        return exercicioGauss(nivel, rng, true);
      case 'inversa-2x2':
        return exercicioInversa2(nivel, rng);
      case 'parametro':
        return exercicioParametro(nivel, rng);
      case 'inversa-3x3':
        return exercicioInversa3(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes: proximos,
  formatar: fracaoTexto,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['operacao', 'retro', 'classificar']);
    case 'medio':
      return rng.escolher<Pergunta>(['multiplicador', 'gauss', 'inversa-2x2', 'classificar']);
    case 'dificil':
      return rng.escolher<Pergunta>(['gauss', 'inversa-2x2', 'parametro']);
    // A inversa 3×3 por (A | I) é o escalonamento mais longo do tópico; o
    // sistema com pivô zero exige perceber que é preciso trocar linhas.
    case 'extremo':
      return rng.escolher<Pergunta>(['inversa-3x3', 'gauss-troca']);
  }
}

/** Uma operação elementar dada: o aluno a executa e lê uma entrada. */
function exercicioOperacao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a11 = rng.escolher([1, 2]);
  const k = comSinal(rng, [1, 2, 3]);
  const destino = rng.escolher([1, 2]);
  const m = Array.from({ length: 3 }, () => Array.from({ length: 4 }, () => rng.inteiro(-6, 6)));
  m[0]![0] = a11;
  m[destino]![0] = k * a11;

  const coluna = rng.escolher([1, 2, 3]);
  const nova = m[destino]!.map((valor, j) => valor - k * m[0]![j]!);
  const gabarito = nova[coluna]!;
  const Li = nomeDaLinha(destino);
  const op = operacaoTexto(destino, k);
  const vezes = Math.abs(k) === 1 ? 'a L₁' : `${Math.abs(k)} vezes a L₁`;
  const opPalavras = `ela mesma ${k > 0 ? 'menos' : 'mais'} ${vezes}`;

  return {
    id: `escal-op-${m.flat().join('_')}-${coluna}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Aplique ${op} na matriz aumentada. Qual é a nova entrada da ${Li} na coluna ` +
      `${coluna + 1}${coluna === 3 ? ' (a dos termos independentes)' : ''}?`,
    enunciadoTex: aumentadaParaTex(paraFracoes(m), 3),
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `A operação troca a ${Li} por ${opPalavras} — a L₁ não muda.`,
          tex: `L_{${destino + 1}} \\to L_{${destino + 1}} ${k > 0 ? '-' : '+'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}L_{1}`,
        },
        {
          descricao: `Calculamos ${k}·L₁, entrada por entrada.`,
          tex: `${k}\\,L_{1} = (${m[0]!.map((v) => k * v).join(',\\; ')})`,
        },
        {
          descricao: `Subtraímos da ${Li}, entrada por entrada.`,
          tex: `(${m[destino]!.join(',\\; ')}) - (${m[0]!.map((v) => k * v).join(',\\; ')}) = (${nova.join(',\\; ')})`,
          nota: 'A primeira entrada zerou: era esse o objetivo da operação.',
        },
        {
          descricao: `Na coluna ${coluna + 1}.`,
          tex: `${m[destino]![coluna]} - ${par(k)} \\cdot ${par(m[0]![coluna]!)} = ${gabarito}`,
        },
      ],
    },
    conceitos: ['escalonamento.operacoes'],
    armadilhas: semColisoes(
      [
        {
          resposta: m[destino]![coluna]! + k * m[0]![coluna]!,
          diagnostico:
            `O sinal saiu trocado: a operação SUBTRAI ${k} vezes a L₁. Confira a conta com ` +
            'a primeira coluna — ela tem de zerar.',
          passo: 2,
          conceito: 'escalonamento.operacoes',
        },
        {
          resposta: k * m[0]![coluna]! - m[destino]![coluna]!,
          diagnostico: `A ordem ficou invertida: é a ${Li} menos o múltiplo da L₁, não o contrário.`,
          passo: 2,
          conceito: 'escalonamento.operacoes',
        },
        {
          resposta: m[destino]![coluna]! - m[0]![coluna]!,
          diagnostico: `Faltou multiplicar a L₁ por ${k} antes de subtrair.`,
          passo: 1,
          conceito: 'escalonamento.operacoes',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'facil'
        ? `Multiplique cada entrada da L₁ por ${Math.abs(k)} e ${k > 0 ? 'subtraia da' : 'some à'} ${Li}, coluna por coluna.`
        : undefined,
  };
}

/** Qual multiplicador zera a entrada abaixo do pivô? */
function exercicioMultiplicador(nivel: Nivel, rng: Rng): Exercicio<number> {
  const pivo = comSinal(rng, [1, 2, 3, 4]);
  let alvo = rng.inteiro(-8, 8);
  if (alvo === 0 || alvo === pivo) alvo = pivo + 1 === 0 ? 2 : pivo + 1;
  const destino = rng.escolher([1, 2]);
  const m = Array.from({ length: 3 }, () => Array.from({ length: 4 }, () => rng.inteiro(-6, 6)));
  m[0]![0] = pivo;
  m[destino]![0] = alvo;

  const gabarito = alvo / pivo;
  const Li = nomeDaLinha(destino);

  return {
    id: `escal-mult-${m.flat().join('_')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: comFracao(
      `Na operação ${Li} ← ${Li} − k·L₁, qual valor de k zera a primeira entrada da ${Li}?`,
      gabarito,
    ),
    enunciadoTex: aumentadaParaTex(paraFracoes(m), 3),
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `O pivô da primeira coluna é a₁₁ = ${pivo}; a entrada a zerar é ${alvo}.`,
          tex: `${alvo} - k \\cdot ${par(pivo)} = 0`,
        },
        {
          descricao: 'Isolando k: a entrada a zerar dividida pelo pivô.',
          tex: `k = \\frac{${alvo}}{${pivo}} = ${valorTex(gabarito)}`,
          nota: 'É sempre «o que se quer zerar, sobre o pivô».',
        },
      ],
    },
    conceitos: ['escalonamento.operacoes', 'escalonamento.gauss'],
    armadilhas: semColisoes(
      [
        {
          resposta: pivo / alvo,
          diagnostico: 'A fração saiu de cabeça para baixo: o pivô vai no DENOMINADOR.',
          passo: 1,
          conceito: 'escalonamento.operacoes',
        },
        {
          resposta: -alvo / pivo,
          diagnostico:
            'O sinal ficou trocado. Como a operação já subtrai k·L₁, k tem o MESMO sinal da ' +
            'razão entre a entrada e o pivô.',
          passo: 1,
          conceito: 'escalonamento.operacoes',
        },
        {
          resposta: alvo - pivo,
          diagnostico:
            'Subtrair o pivô uma vez só zera a entrada se ela for igual a ele. É preciso dividir.',
          passo: 0,
          conceito: 'escalonamento.operacoes',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'medio'
        ? `O pivô é ${pivo}: k é a entrada que se quer zerar (${alvo}) dividida pelo pivô.`
        : undefined,
  };
}

/** Sistema já escalonado: substituição de baixo para cima. */
function exercicioRetro(nivel: Nivel, rng: Rng): Exercicio<number> {
  const [x, y, z] = [rng.inteiro(-5, 5), rng.inteiro(-5, 5), rng.inteiro(-5, 5)];
  const a = comSinal(rng, [1, 2]);
  const e = comSinal(rng, [1, 2, 3]);
  const h = comSinal(rng, [1, 2, 3]);
  const [b, c, f] = [rng.inteiro(-4, 4), rng.inteiro(-4, 4), rng.inteiro(-4, 4)];

  const A = [
    [a, b, c],
    [0, e, f],
    [0, 0, h],
  ];
  const rhs = multiplicar(A, [x, y, z]);
  const m = A.map((linha, i) => [...linha, rhs[i]!]);
  const gabarito = x;

  return {
    id: `escal-retro-${m.flat().join('_')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'A matriz aumentada do sistema já está escalonada. Encontre x, substituindo de baixo ' +
      'para cima.',
    enunciadoTex: aumentadaParaTex(paraFracoes(m), 3),
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A última linha tem uma incógnita só.',
          tex: `${cx(h, 'z')} = ${rhs[2]} \\;\\Rightarrow\\; z = ${z}`,
        },
        {
          descricao: 'Subimos para a segunda linha, com z conhecido.',
          tex: `${cx(e, 'y')}${termo(f, z)} = ${rhs[1]} \\;\\Rightarrow\\; ${cx(e, 'y')} = ${rhs[1]! - f * z} \\;\\Rightarrow\\; y = ${y}`,
        },
        {
          descricao: 'E por fim a primeira linha, com y e z.',
          tex:
            `${cx(a, 'x')}${termo(b, y)}${termo(c, z)} = ${rhs[0]}` +
            ` \\;\\Rightarrow\\; ${cx(a, 'x')} = ${rhs[0]! - b * y - c * z} \\;\\Rightarrow\\; x = ${x}`,
        },
      ],
    },
    conceitos: ['escalonamento.gauss'],
    armadilhas: semColisoes(
      [
        {
          resposta: z,
          diagnostico:
            'Esse é o valor de z, o primeiro a sair. Continue subindo até a primeira linha.',
          passo: 0,
          conceito: 'escalonamento.gauss',
        },
        {
          resposta: y,
          diagnostico: 'Esse é o valor de y. Falta substituir na primeira linha para achar x.',
          passo: 1,
          conceito: 'escalonamento.gauss',
        },
        {
          resposta: (rhs[0]! + b * y + c * z) / a,
          diagnostico:
            'Ao passar os termos de y e z para o outro lado, o sinal deles troca. Aqui eles ' +
            'foram somados em vez de subtraídos.',
          passo: 2,
          conceito: 'escalonamento.gauss',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'facil'
        ? `Comece por baixo: a última linha, ${cx(h, 'z')} = ${rhs[2]}, já dá z. Depois suba, substituindo o que já sabe.`
        : undefined,
  };
}

const LEGENDA_TIPO = 'Responda 0 (nenhuma solução), 1 (uma só) ou 2 (infinitas).';

const CODIGO: Readonly<Record<TipoSistema, number>> = {
  impossivel: 0,
  determinado: 1,
  indeterminado: 2,
};

const NOME_DO_TIPO: Readonly<Record<TipoSistema, string>> = {
  impossivel: 'impossível, nenhuma solução',
  determinado: 'possível e determinado, uma solução',
  indeterminado: 'possível e indeterminado, infinitas soluções',
};

function armadilhasDoTipo(tipo: TipoSistema, passo: number) {
  const diagnosticos: Readonly<Record<TipoSistema, string>> = {
    impossivel:
      'A linha 0 0 0 | c com c ≠ 0 diz 0 = c, que nunca vale: o sistema é impossível, sem ' +
      'nenhuma solução.',
    indeterminado:
      'A linha 0 0 0 | 0 diz 0 = 0, que vale sempre: ela não atrapalha, só deixa uma ' +
      'variável livre — infinitas soluções.',
    determinado:
      'Há um pivô em cada coluna das incógnitas: cada variável fica determinada, e a solução ' +
      'é única.',
  };

  return (['impossivel', 'determinado', 'indeterminado'] as const)
    .filter((outro) => outro !== tipo)
    .map((outro) => ({
      resposta: CODIGO[outro],
      diagnostico: diagnosticos[tipo],
      passo,
      conceito: 'escalonamento.classificacao',
    }));
}

/** Classificar lendo a forma escalonada pronta. */
function exercicioClassificarEscalonada(nivel: Nivel, rng: Rng): Exercicio<number> {
  const tipo = rng.escolher<TipoSistema>(['impossivel', 'determinado', 'indeterminado']);
  const m = [
    [comSinal(rng, [1, 2, 3]), rng.inteiro(-5, 5), rng.inteiro(-5, 5), rng.inteiro(-9, 9)],
    [0, comSinal(rng, [1, 2, 3]), rng.inteiro(-5, 5), rng.inteiro(-9, 9)],
    [
      0,
      0,
      tipo === 'determinado' ? comSinal(rng, [1, 2, 3, 4]) : 0,
      tipo === 'indeterminado' ? 0 : comSinal(rng, [1, 2, 3, 4, 5, 6]),
    ],
  ];
  const gabarito = CODIGO[tipo];
  const [, , c3, b3] = m[2]!;

  return {
    id: `escal-classe-${m.flat().join('_')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `A matriz aumentada já está escalonada. Quantas soluções tem o sistema? ${LEGENDA_TIPO}`,
    enunciadoTex: aumentadaParaTex(paraFracoes(m), 3),
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Lemos a última linha como equação.',
          tex: `0x + 0y ${c3! < 0 ? '-' : '+'} ${Math.abs(c3!)}z = ${b3}`,
        },
        {
          descricao:
            tipo === 'impossivel'
              ? 'Nenhum z faz 0 dar um número diferente de zero: contradição.'
              : tipo === 'indeterminado'
                ? 'A equação 0 = 0 vale para qualquer z: z fica livre.'
                : 'Há pivô nas três colunas: z sai dessa linha, e y e x das de cima.',
          tex:
            tipo === 'impossivel'
              ? `0 = ${b3} \\;\\Rightarrow\\; S = \\varnothing`
              : tipo === 'indeterminado'
                ? '0 = 0 \\;\\Rightarrow\\; z \\text{ livre}'
                : `z = ${valorTex(b3! / c3!)}`,
        },
        {
          descricao: `Sistema ${NOME_DO_TIPO[tipo]}.`,
          tex: `\\text{resposta: } ${gabarito}`,
        },
      ],
    },
    conceitos: ['escalonamento.classificacao'],
    armadilhas: semColisoes(armadilhasDoTipo(tipo, 1), gabarito, proximos),
    dica:
      nivel === 'facil'
        ? 'Olhe a última linha: 0 = 0 deixa uma variável livre; 0 igual a um número diferente de zero é contradição.'
        : undefined,
  };
}

/** Classificar um sistema ainda por escalonar. */
function exercicioClassificarSistema(nivel: Nivel, rng: Rng): Exercicio<number> {
  const tipo = rng.escolher<TipoSistema>(['impossivel', 'determinado', 'indeterminado']);
  const base = matrizLU(rng, [comSinal(rng, [1]), comSinal(rng, [1]), comSinal(rng, [1])], 2, 3);
  const solucao = [rng.inteiro(-4, 4), rng.inteiro(-4, 4), rng.inteiro(-4, 4)];
  const b = multiplicar(base, solucao);

  if (tipo !== 'determinado') {
    let alfa = 0;
    let beta = 0;
    while (alfa === 0 && beta === 0) {
      alfa = rng.inteiro(-2, 2);
      beta = rng.inteiro(-2, 2);
    }
    const delta = tipo === 'impossivel' ? comSinal(rng, [1, 2, 3, 4, 5]) : 0;
    base[2] = base[0]!.map((v, j) => alfa * v + beta * base[1]![j]!);
    b[2] = alfa * b[0]! + beta * b[1]! + delta;
  }

  const aumentada = base.map((linha, i) => [...linha, b[i]!]);
  const gauss = gaussJordanComPassos(aumentada);
  const gabarito = CODIGO[gauss.resultado.tipo];

  return {
    id: `escal-classe-sis-${aumentada.flat().join('_')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Escalone o sistema. Quantas soluções ele tem? ${LEGENDA_TIPO}`,
    enunciadoTex: sistemaTex(base, b),
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...gauss.passos,
        {
          descricao: `Sistema ${NOME_DO_TIPO[gauss.resultado.tipo]}.`,
          tex: `\\text{resposta: } ${gabarito}`,
        },
      ],
    },
    conceitos: ['escalonamento.classificacao', 'escalonamento.gauss'],
    armadilhas: semColisoes(
      armadilhasDoTipo(gauss.resultado.tipo, gauss.passos.length - 1),
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'medio'
        ? 'Escalone até a terceira linha: se ela virar 0 0 0 | c, é o valor de c que decide entre nenhuma e infinitas.'
        : undefined,
  };
}

/** Sistema 3×3 por Gauss-Jordan; com `troca`, o primeiro pivô é zero. */
function exercicioGauss(nivel: Nivel, rng: Rng, troca: boolean): Exercicio<number> {
  const diagonal =
    nivel === 'medio'
      ? [comSinal(rng, [1]), comSinal(rng, [1]), comSinal(rng, [1])]
      : [comSinal(rng, [1, 2]), comSinal(rng, [1, 2]), comSinal(rng, [1, 2])];
  const limite = troca ? 6 : 4;
  let A = matrizLU(rng, diagonal, troca ? 3 : 2, troca ? 4 : 3, troca);
  if (troca) {
    // A linha com primeira entrada zero vai para cima: sem trocar, não há pivô.
    A = [A[1]!, A[0]!, A[2]!];
  }
  const solucao = [
    rng.inteiro(-limite, limite),
    rng.inteiro(-limite, limite),
    rng.inteiro(-limite, limite),
  ];
  const b = multiplicar(A, solucao);
  const pedida = rng.inteiro(0, 2);
  const nome = NOMES[pedida]!;
  const gabarito = solucao[pedida]!;

  const gauss = gaussJordanComPassos(A.map((linha, i) => [...linha, b[i]!]));

  return {
    id: `escal-gauss${troca ? '-troca' : ''}-${A.flat().join('_')}-${b.join('_')}-${pedida}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Resolva o sistema por escalonamento e informe o valor de ${nome}.`,
    enunciadoTex: sistemaTex(A, b),
    gabarito,
    resolucao: { resultado: gabarito, passos: gauss.passos },
    conceitos: troca ? ['escalonamento.gauss', 'escalonamento.operacoes'] : ['escalonamento.gauss'],
    armadilhas: semColisoes(
      [
        ...solucao
          .map((valor, i) => ({ valor, i }))
          .filter(({ i }) => i !== pedida)
          .map(({ valor, i }) => ({
            resposta: valor,
            diagnostico: `Esse é o valor de ${NOMES[i]}; o pedido é ${nome}. Confira qual coluna é de qual variável.`,
            passo: gauss.passos.length - 1,
            conceito: 'escalonamento.gauss',
          })),
        {
          resposta: -gabarito,
          diagnostico:
            'O módulo está certo e o sinal não: algum termo mudou de lado sem trocar de sinal. ' +
            'Confira as subtrações de linha.',
          passo: 1,
          conceito: 'escalonamento.operacoes',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: troca
      ? nivel === 'extremo'
        ? 'O primeiro pivô é zero: troque a L₁ com uma linha que tenha a primeira entrada diferente de zero, e só então elimine.'
        : undefined
      : nivel === 'medio'
        ? 'Monte a matriz aumentada, zere a primeira coluna abaixo do pivô, depois a segunda, e resolva de baixo para cima.'
        : undefined,
  };
}

/** Uma entrada da inversa 2×2, pela fórmula da adjunta. */
function exercicioInversa2(nivel: Nivel, rng: Rng): Exercicio<number> {
  const limiteDet = nivel === 'medio' ? 3 : 30;
  let p: number, q: number, r: number, s: number, det: number;
  do {
    [p, q, r, s] = [rng.inteiro(-5, 6), rng.inteiro(-5, 6), rng.inteiro(-5, 6), rng.inteiro(-5, 6)];
    det = p * s - q * r;
  } while (det === 0 || Math.abs(det) > limiteDet);

  const adj = [
    [s, -q],
    [-r, p],
  ];
  // Uma entrada nula seria pergunta sem conta: escolhemos uma que não seja.
  const posicoes = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ].filter(([l, c]) => adj[l!]![c!] !== 0);
  const [i, j] = rng.escolher(posicoes) as [number, number];
  const gabarito = adj[i]![j]! / det;
  const A = [
    [p, q],
    [r, s],
  ];
  const inversa = inversaComPassos(A);
  const diagonal = i === j;

  return {
    id: `escal-inv2-${p}_${q}_${r}_${s}-${i}${j}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: comFracao(
      `Qual é a entrada da linha ${i + 1}, coluna ${j + 1} da matriz inversa A⁻¹?`,
      gabarito,
    ),
    enunciadoTex: `A = \\begin{pmatrix} ${p} & ${q} \\\\ ${r} & ${s} \\end{pmatrix}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...inversa.passos,
        {
          descricao: `A entrada pedida, linha ${i + 1} e coluna ${j + 1}.`,
          tex: `(A^{-1})_{${i + 1}${j + 1}} = \\frac{${adj[i]![j]}}{${det}} = ${valorTex(gabarito)}`,
        },
      ],
    },
    conceitos: ['escalonamento.inversa'],
    armadilhas: semColisoes(
      [
        {
          resposta: adj[i]![j]!,
          diagnostico: `Faltou dividir pelo determinante, que vale ${det}: A⁻¹ = (1/det)·adj A.`,
          passo: 2,
          conceito: 'escalonamento.inversa',
        },
        {
          resposta: A[i]![j]! / det,
          diagnostico: diagonal
            ? 'Na diagonal principal os dois elementos TROCAM de lugar antes de dividir.'
            : 'Fora da diagonal o elemento fica no lugar, mas troca de SINAL.',
          passo: 1,
          conceito: 'escalonamento.inversa',
        },
        {
          resposta: adj[j]![i]! / det,
          diagnostico: `Posição trocada: essa é a entrada da linha ${j + 1}, coluna ${i + 1}.`,
          passo: 2,
          conceito: 'escalonamento.inversa',
        },
        {
          resposta: -gabarito,
          diagnostico:
            'O sinal saiu trocado. Confira o determinante, ad − bc, e o sinal da adjunta.',
          passo: 0,
          conceito: 'escalonamento.inversa',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'medio'
        ? `det A = ${det}. Na adjunta, troque os dois da diagonal principal, mude o sinal dos outros dois e divida tudo por ${det}.`
        : undefined,
  };
}

/** Qual k anula o último pivô? */
function exercicioParametro(nivel: Nivel, rng: Rng): Exercicio<number> {
  const topo = matrizLU(rng, [comSinal(rng, [1, 2]), comSinal(rng, [1, 2]), 1], 2, 4);
  const [r1, r2] = [topo[0]!, topo[1]!];
  let alfa = 0;
  let beta = 0;
  while (alfa === 0 || beta === 0) {
    alfa = rng.inteiro(-2, 2);
    beta = rng.inteiro(-2, 2);
  }
  const a31 = alfa * r1[0]! + beta * r2[0]!;
  const a32 = alfa * r1[1]! + beta * r2[1]!;
  const k0 = alfa * r1[2]! + beta * r2[2]!;
  const b = [rng.inteiro(-9, 9), rng.inteiro(-9, 9), 0];
  const delta = rng.inteiro(-4, 4);
  b[2] = alfa * b[0]! + beta * b[1]! + delta;
  const gabarito = k0;
  const menor = r1[0]! * r2[1]! - r1[1]! * r2[0]!;

  const kMenos = k0 === 0 ? 'k' : `k ${k0 > 0 ? '-' : '+'} ${Math.abs(k0)}`;
  const opTexto =
    `L₃ ← L₃ ${alfa > 0 ? '−' : '+'} ${Math.abs(alfa) === 1 ? '' : `${Math.abs(alfa)}·`}L₁ ` +
    `${beta > 0 ? '−' : '+'} ${Math.abs(beta) === 1 ? '' : `${Math.abs(beta)}·`}L₂`;

  return {
    id: `escal-param-${[...r1, ...r2, a31, a32].join('_')}-${b.join('_')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Para que valor de k o sistema deixa de ter solução única?',
    enunciadoTex: sistemaTex([r1, r2, [a31, a32, 'k']], b),
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            `Nas duas primeiras colunas, a L₃ é combinação das de cima: ${par(alfa)} vezes a L₁ ` +
            `mais ${par(beta)} vezes a L₂.`,
          tex: `(${a31},\\; ${a32}) = ${par(alfa)}(${r1[0]},\\; ${r1[1]}) + ${par(beta)}(${r2[0]},\\; ${r2[1]})`,
        },
        {
          descricao: `Aplicamos ${opTexto}: as duas primeiras entradas da L₃ zeram.`,
          tex:
            `L_{3} \\to \\left(0,\\; 0,\\; k - ${par(alfa)} \\cdot ${par(r1[2]!)} - ${par(beta)} \\cdot ${par(r2[2]!)} \\;\\middle|\\; ${delta}\\right)` +
            ` = \\left(0,\\; 0,\\; ${kMenos} \\;\\middle|\\; ${delta}\\right)`,
          nota: `As duas primeiras linhas têm pivôs (o menor 2×2 delas vale ${menor}, não zero).`,
        },
        {
          descricao: 'A solução deixa de ser única quando esse último pivô se anula.',
          tex: `${kMenos} = 0 \\;\\Rightarrow\\; k = ${gabarito}`,
          nota:
            delta === 0
              ? 'Com esse k, a última linha vira 0 = 0: infinitas soluções.'
              : `Com esse k, a última linha vira 0 = ${delta}: o sistema fica impossível.`,
        },
      ],
    },
    conceitos: ['escalonamento.classificacao', 'escalonamento.gauss'],
    armadilhas: semColisoes(
      [
        {
          resposta: -k0,
          diagnostico: `O sinal saiu trocado: o pivô é ${kMenos}, que zera em k = ${k0}.`,
          passo: 2,
          conceito: 'escalonamento.classificacao',
        },
        {
          resposta: alfa * r1[2]!,
          diagnostico: 'Faltou a parcela que vem da L₂: a L₃ é combinação das DUAS linhas de cima.',
          passo: 1,
          conceito: 'escalonamento.gauss',
        },
        {
          resposta: delta,
          diagnostico:
            'Esse é o termo independente da última linha, que decide entre impossível e ' +
            'indeterminado — mas é o pivô, com k, que decide se a solução é única.',
          passo: 2,
          conceito: 'escalonamento.classificacao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'dificil'
        ? 'Escalone deixando k na última linha. A solução deixa de ser única quando o pivô que contém k vira zero.'
        : undefined,
  };
}

/** Uma entrada da inversa 3×3, por (A | I) → (I | A⁻¹). */
function exercicioInversa3(nivel: Nivel, rng: Rng): Exercicio<number> {
  let A: number[][];
  do {
    // Diagonais 1 em L e em U: det A = 1 e a inversa é inteira.
    A = matrizLU(rng, [1, 1, 1], 2, 2);
  } while (A.flat().filter((v) => v !== 0).length < 6);

  const inversa = inversaComPassos(A);
  const B = inversa.resultado.map((linha) => linha.map((v: Fracao) => v.paraDecimal()));
  const [i, j] = [rng.inteiro(0, 2), rng.inteiro(0, 2)];
  const gabarito = B[i]![j]!;

  return {
    id: `escal-inv3-${A.flat().join('_')}-${i}${j}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Calcule a inversa por escalonamento de (A | I) e informe a entrada da linha ${i + 1}, coluna ${j + 1} de A⁻¹.`,
    enunciadoTex: `A = ${aumentadaParaTex(paraFracoes(A), 3)}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...inversa.passos,
        {
          descricao: `A entrada pedida, linha ${i + 1} e coluna ${j + 1}.`,
          tex: `(A^{-1})_{${i + 1}${j + 1}} = ${gabarito}`,
          nota: 'Para conferir: A·A⁻¹ tem de dar a identidade.',
        },
      ],
    },
    conceitos: ['escalonamento.inversa', 'escalonamento.gauss'],
    armadilhas: semColisoes(
      [
        {
          resposta: B[j]![i]!,
          diagnostico: `Posição trocada: essa é a entrada da linha ${j + 1}, coluna ${i + 1}.`,
          passo: inversa.passos.length - 1,
          conceito: 'escalonamento.inversa',
        },
        {
          resposta: A[i]![j]!,
          diagnostico:
            'Essa é a entrada da própria A. A inversa é o bloco da DIREITA ao fim do escalonamento.',
          passo: inversa.passos.length - 1,
          conceito: 'escalonamento.inversa',
        },
        {
          resposta: -gabarito,
          diagnostico:
            'O sinal saiu trocado: confira as operações de linha feitas no bloco da identidade.',
          passo: 2,
          conceito: 'escalonamento.operacoes',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'extremo'
        ? 'Escreva (A | I) e escalone até a esquerda virar a identidade; faça cada operação também no bloco da direita.'
        : undefined,
  };
}
