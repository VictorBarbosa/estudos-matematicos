import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos/tipos';
import { Polinomio } from '@core/math/algebra/polinomio/polinomio';
import { Relacao, SIMBOLO_RELACAO } from '@core/math/algebra/inequacao/inequacao';

/**
 * Estudo de sinal e inequações do 2º grau.
 *
 * O pré-requisito que faltava na trilha: `aplicacoes-da-derivada` decide
 * crescimento pelo sinal de f′, e a técnica — achar onde a expressão zera e
 * olhar o sinal em cada pedaço — não era ensinada em lugar nenhum.
 *
 * Toda a matemática daqui é a mesma ideia: uma expressão contínua só troca de
 * sinal onde zera (ou onde deixa de existir). Marcados esses pontos na reta,
 * basta saber o sinal em cada intervalo.
 */

/** O conjunto solução de uma inequação de uma variável, nas formas que o tópico produz. */
export type ConjuntoSolucaoReal =
  | { readonly tipo: 'vazio' }
  | { readonly tipo: 'todos' }
  | { readonly tipo: 'ponto'; readonly a: number }
  | { readonly tipo: 'exceto'; readonly a: number }
  | {
      readonly tipo: 'entre' | 'fora';
      readonly a: number;
      readonly b: number;
      readonly fechaA: boolean;
      readonly fechaB: boolean;
    };

/** Fração curta quando o número é racional de denominador pequeno, senão decimal. */
export function racional(valor: number): { readonly num: number; readonly den: number } | null {
  for (let den = 1; den <= 24; den++) {
    const num = Math.round(valor * den);
    if (Math.abs(num / den - valor) < 1e-9) {
      return { num, den };
    }
  }
  return null;
}

/** `3/2`, `-1/3`, `4` ou `1,4142` — para enunciados, dicas e o gabarito exibido. */
export function numeroEmTexto(valor: number): string {
  const r = racional(valor);
  if (r === null) {
    return String(Number(valor.toFixed(4))).replace('.', ',');
  }
  return r.den === 1 ? String(r.num) : `${r.num}/${r.den}`;
}

/** O mesmo número em LaTeX: `\frac{3}{2}`, `-\frac{1}{3}`, `4`. */
export function numeroEmTex(valor: number): string {
  const r = racional(valor);
  if (r === null) {
    return String(Number(valor.toFixed(4))).replace('.', '{,}');
  }
  if (r.den === 1) {
    return String(r.num);
  }
  return `${r.num < 0 ? '-' : ''}\\frac{${Math.abs(r.num)}}{${r.den}}`;
}

const MENOR = (fecha: boolean): string => (fecha ? '\\leq' : '<');
const MENOR_TEXTO = (fecha: boolean): string => (fecha ? '≤' : '<');
const MAIOR_TEXTO = (fecha: boolean): string => (fecha ? '≥' : '>');

/** O conjunto em LaTeX, como se escreve na resposta. */
export function solucaoRealEmTex(conjunto: ConjuntoSolucaoReal): string {
  switch (conjunto.tipo) {
    case 'vazio':
      return 'S = \\varnothing';
    case 'todos':
      return 'S = \\mathbb{R}';
    case 'ponto':
      return `x = ${numeroEmTex(conjunto.a)}`;
    case 'exceto':
      return `x \\neq ${numeroEmTex(conjunto.a)}`;
    case 'entre':
      return (
        `${numeroEmTex(conjunto.a)} ${MENOR(conjunto.fechaA)} x ` +
        `${MENOR(conjunto.fechaB)} ${numeroEmTex(conjunto.b)}`
      );
    case 'fora':
      return (
        `x ${MENOR(conjunto.fechaA)} ${numeroEmTex(conjunto.a)} \\;\\text{ ou }\\; ` +
        `x ${conjunto.fechaB ? '\\geq' : '>'} ${numeroEmTex(conjunto.b)}`
      );
  }
}

/** O conjunto em texto corrido — a forma que o aluno digita. */
export function solucaoRealEmTexto(conjunto: ConjuntoSolucaoReal): string {
  switch (conjunto.tipo) {
    case 'vazio':
      return 'vazio';
    case 'todos':
      return 'todos';
    case 'ponto':
      return `x = ${numeroEmTexto(conjunto.a)}`;
    case 'exceto':
      return `x ≠ ${numeroEmTexto(conjunto.a)}`;
    case 'entre':
      return (
        `${numeroEmTexto(conjunto.a)} ${MENOR_TEXTO(conjunto.fechaA)} x ` +
        `${MENOR_TEXTO(conjunto.fechaB)} ${numeroEmTexto(conjunto.b)}`
      );
    case 'fora':
      return (
        `x ${MENOR_TEXTO(conjunto.fechaA)} ${numeroEmTexto(conjunto.a)} ou ` +
        `x ${MAIOR_TEXTO(conjunto.fechaB)} ${numeroEmTexto(conjunto.b)}`
      );
  }
}

/** O conjunto contém x? Usado nos testes e no desenho da reta. */
export function pertence(conjunto: ConjuntoSolucaoReal, x: number): boolean {
  const igual = (p: number): boolean => Math.abs(x - p) < 1e-9;
  switch (conjunto.tipo) {
    case 'vazio':
      return false;
    case 'todos':
      return true;
    case 'ponto':
      return igual(conjunto.a);
    case 'exceto':
      return !igual(conjunto.a);
    case 'entre':
      return (
        (x > conjunto.a || (conjunto.fechaA && igual(conjunto.a))) &&
        (x < conjunto.b || (conjunto.fechaB && igual(conjunto.b)))
      );
    case 'fora':
      return (
        x < conjunto.a ||
        (conjunto.fechaA && igual(conjunto.a)) ||
        x > conjunto.b ||
        (conjunto.fechaB && igual(conjunto.b))
      );
  }
}

const expressaoEmTexto = (positivo: boolean, inclui: boolean): string =>
  `o produto ${positivo ? 'positivo' : 'negativo'}${inclui ? ' ou zero' : ''}`;

const quer = (relacao: Relacao): { positivo: boolean; inclui: boolean } => ({
  positivo: relacao === '>' || relacao === '>=',
  inclui: relacao === '<=' || relacao === '>=',
});

/** Linha de quadro de sinais em LaTeX: x | ... e f(x) | sinais. */
function quadroDeSinais(
  pontos: readonly string[],
  sinais: readonly string[],
  marcas: readonly string[],
  rotulo = 'f(x)',
): string {
  // sinais tem pontos.length + 1 entradas; marcas, uma por ponto (0 ou ∄).
  const colunas = 'c'.repeat(pontos.length * 2 + 1);
  const linhaX = ['', ...pontos.flatMap((p) => [p, ''])].join(' & ');
  const linhaF = sinais.flatMap((s, i) => (i < marcas.length ? [s, marcas[i]!] : [s])).join(' & ');
  return `\\begin{array}{c|${colunas}} x & ${linhaX} \\\\ \\hline ${rotulo} & ${linhaF} \\end{array}`;
}

/**
 * Resolve ax² + bx + c (relação) 0 pelo estudo de sinal do trinômio.
 *
 * Os passos seguem a receita que serve para qualquer expressão: zeros,
 * sinal em cada pedaço, escolha dos pedaços pedidos, fronteiras.
 */
export function resolverInequacaoQuadraticaComPassos(
  a: number,
  b: number,
  c: number,
  relacao: Relacao,
): Resolucao<ConjuntoSolucaoReal> {
  if (a === 0) {
    throw new ErroMatematico('Com a = 0 a inequação é do 1º grau.');
  }

  const p = Polinomio.de(c, b, a);
  const delta = b * b - 4 * a * c;
  const { positivo, inclui } = quer(relacao);
  const concavidade = a > 0 ? 'para cima' : 'para baixo';

  const passos: Passo[] = [
    {
      descricao: 'Estudamos o sinal do trinômio comparado com zero: primeiro, onde ele ZERA.',
      tex: `${p.paraTex()} ${SIMBOLO_RELACAO[relacao]} 0`,
    },
    {
      descricao: 'O discriminante diz quantas vezes a parábola toca o eixo x.',
      tex: `\\Delta = (${b})^{2} - 4 \\cdot (${a}) \\cdot (${c}) = ${delta}`,
    },
  ];

  if (delta < 0) {
    // Sem raízes: o trinômio tem o sinal de a em toda a reta.
    const sempre = a > 0;
    passos.push({
      descricao:
        `Δ < 0: a parábola não toca o eixo. Com a = ${a}, ela fica inteira ` +
        `${sempre ? 'ACIMA' : 'ABAIXO'} dele — o trinômio é sempre ${sempre ? 'positivo' : 'negativo'}.`,
      tex: `${p.paraTex()} ${sempre ? '> 0' : '< 0'} \\quad \\text{para todo } x`,
    });
    const resultado: ConjuntoSolucaoReal =
      sempre === positivo ? { tipo: 'todos' } : { tipo: 'vazio' };
    passos.push({
      descricao:
        sempre === positivo
          ? 'O sinal pedido é o que ele tem sempre: todo número real serve.'
          : 'O sinal pedido nunca acontece: nenhum número real serve.',
      tex: solucaoRealEmTex(resultado),
    });
    return { resultado, passos };
  }

  if (delta === 0) {
    const r = -b / (2 * a);
    passos.push({
      descricao: `Δ = 0: uma raiz dupla, x = ${numeroEmTexto(r)}. A parábola só encosta no eixo ali.`,
      tex: `x = \\frac{-(${b})}{2 \\cdot ${a}} = ${numeroEmTex(r)}`,
    });
    passos.push({
      descricao: `Fora desse ponto, o trinômio tem o sinal de a (${a > 0 ? 'positivo' : 'negativo'}).`,
      tex: quadroDeSinais([numeroEmTex(r)], a > 0 ? ['+', '+'] : ['-', '-'], ['0']),
    });

    let resultado: ConjuntoSolucaoReal;
    if (positivo === a > 0) {
      resultado = inclui ? { tipo: 'todos' } : { tipo: 'exceto', a: r };
    } else {
      resultado = inclui ? { tipo: 'ponto', a: r } : { tipo: 'vazio' };
    }
    passos.push({
      descricao: inclui
        ? 'A relação inclui o zero, e ele acontece na raiz dupla.'
        : 'A relação é estrita: a raiz, onde o trinômio vale 0, fica de fora.',
      tex: solucaoRealEmTex(resultado),
    });
    return { resultado, passos };
  }

  const raiz = Math.sqrt(delta);
  const [x1, x2] = [(-b - raiz) / (2 * a), (-b + raiz) / (2 * a)].sort((u, v) => u - v) as [
    number,
    number,
  ];

  passos.push({
    descricao: 'Duas raízes reais, por Bhaskara (em ordem crescente).',
    tex: `x = \\frac{-(${b}) \\pm \\sqrt{${delta}}}{2 \\cdot (${a})} \\;\\Rightarrow\\; x_1 = ${numeroEmTex(x1)},\\; x_2 = ${numeroEmTex(x2)}`,
  });

  const fora = a > 0 ? '+' : '-';
  const dentro = a > 0 ? '-' : '+';
  passos.push({
    descricao:
      `a = ${a}: concavidade ${concavidade}. O trinômio tem o sinal de a FORA das raízes e ` +
      'o sinal contrário ENTRE elas.',
    tex: quadroDeSinais([numeroEmTex(x1), numeroEmTex(x2)], [fora, dentro, fora], ['0', '0']),
    nota: 'Regra rápida: «fora, sinal de a; entre, contrário de a».',
  });

  const querFora = (positivo && a > 0) || (!positivo && a < 0);
  const resultado: ConjuntoSolucaoReal = {
    tipo: querFora ? 'fora' : 'entre',
    a: x1,
    b: x2,
    fechaA: inclui,
    fechaB: inclui,
  };

  passos.push({
    descricao:
      `Queremos o trinômio ${positivo ? 'positivo' : 'negativo'}${inclui ? ' ou zero' : ''}: ` +
      `${querFora ? 'os dois pedaços de FORA' : 'o pedaço ENTRE as raízes'}` +
      `${inclui ? ', com as raízes incluídas' : ', sem as raízes'}.`,
    tex: solucaoRealEmTex(resultado),
  });

  return { resultado, passos };
}

/**
 * Resolve (px + q)/(rx + s) (relação) 0 pelo quadro de sinais.
 *
 * A diferença para o produto é uma só, e é o erro clássico: o zero do
 * DENOMINADOR nunca entra no conjunto, nem com ≤ ou ≥ — ali a fração não existe.
 */
export function resolverInequacaoQuocienteComPassos(
  p: number,
  q: number,
  r: number,
  s: number,
  relacao: Relacao,
): Resolucao<ConjuntoSolucaoReal> {
  return resolverPorQuadro(p, q, r, s, relacao, true);
}

/**
 * Resolve (px + q)(rx + s) (relação) 0 pelo quadro de sinais dos dois fatores.
 *
 * É o estudo de sinal na forma mais pura: cada fator do 1º grau troca de sinal
 * na sua raiz, e o produto segue a regra dos sinais.
 */
export function resolverInequacaoProdutoComPassos(
  p: number,
  q: number,
  r: number,
  s: number,
  relacao: Relacao,
): Resolucao<ConjuntoSolucaoReal> {
  return resolverPorQuadro(p, q, r, s, relacao, false);
}

function resolverPorQuadro(
  p: number,
  q: number,
  r: number,
  s: number,
  relacao: Relacao,
  quociente: boolean,
): Resolucao<ConjuntoSolucaoReal> {
  if (p === 0 || r === 0) {
    throw new ErroMatematico('Os dois fatores precisam ser do 1º grau.');
  }

  const zeroN = -q / p;
  const zeroD = -s / r;
  if (Math.abs(zeroN - zeroD) < 1e-12) {
    throw new ErroMatematico('Os dois fatores com o mesmo zero: use o trinômio.');
  }

  const { positivo, inclui } = quer(relacao);
  const num = Polinomio.de(q, p).paraTex();
  const den = Polinomio.de(s, r).paraTex();

  const [menor, maior] = zeroN < zeroD ? [zeroN, zeroD] : [zeroD, zeroN];
  // Sinal de cada fator à esquerda de tudo: o oposto do coeficiente.
  const sinal = (coef: number, zero: number, x: number): number =>
    x > zero ? Math.sign(coef) : -Math.sign(coef);
  const amostras = [menor - 1, (menor + maior) / 2, maior + 1];
  const sinaisN = amostras.map((x) => sinal(p, zeroN, x));
  const sinaisD = amostras.map((x) => sinal(r, zeroD, x));
  const sinaisQ = sinaisN.map((n, i) => n * sinaisD[i]!);
  const simbolo = (v: number): string => (v > 0 ? '+' : '-');
  const marca = (zero: number, deQuem: number): string =>
    Math.abs(zero - deQuem) < 1e-12 ? '0' : '';

  const pontosTex = [numeroEmTex(menor), numeroEmTex(maior)];
  const [rotuloN, rotuloD] = quociente ? ['N', 'D'] : ['A', 'B'];

  if (!quociente) {
    const passos: Passo[] = [
      {
        descricao:
          'Cada fator do 1º grau zera num ponto e troca de sinal ali. Achamos os dois zeros.',
        tex:
          `${num} = 0 \\;\\Rightarrow\\; x = ${numeroEmTex(zeroN)} \\qquad ` +
          `${den} = 0 \\;\\Rightarrow\\; x = ${numeroEmTex(zeroD)}`,
      },
      {
        descricao:
          'O sinal de cada fator em cada pedaço da reta (à direita do zero, o sinal do coeficiente de x).',
        tex:
          quadroDeSinais(
            pontosTex,
            sinaisN.map(simbolo),
            [marca(menor, zeroN) || ' ', marca(maior, zeroN) || ' '],
            rotuloN,
          ) +
          ' \\quad ' +
          quadroDeSinais(
            pontosTex,
            sinaisD.map(simbolo),
            [marca(menor, zeroD) || ' ', marca(maior, zeroD) || ' '],
            rotuloD,
          ),
        nota: `A = ${num} e B = ${den}.`,
      },
      {
        descricao: 'O sinal do produto, pela regra dos sinais, pedaço por pedaço.',
        tex: quadroDeSinais(pontosTex, sinaisQ.map(simbolo), ['0', '0'], 'A \\cdot B'),
      },
    ];
    const meio = sinaisQ[1]! > 0 === positivo;
    const resultado: ConjuntoSolucaoReal = {
      tipo: meio ? 'entre' : 'fora',
      a: menor,
      b: maior,
      fechaA: inclui,
      fechaB: inclui,
    };
    passos.push({
      descricao:
        `Queremos ${expressaoEmTexto(positivo, inclui)}: ${meio ? 'o pedaço do meio' : 'os pedaços de fora'}` +
        `${inclui ? ', com os zeros incluídos' : ', sem os zeros'}.`,
      tex: solucaoRealEmTex(resultado),
    });
    return { resultado, passos };
  }

  const passos: Passo[] = [
    {
      descricao:
        'Comparamos a fração com zero. Marcamos onde o numerador zera e onde o denominador zera.',
      tex:
        `${num} = 0 \\;\\Rightarrow\\; x = ${numeroEmTex(zeroN)} \\qquad ` +
        `${den} = 0 \\;\\Rightarrow\\; x = ${numeroEmTex(zeroD)}`,
      nota: 'Não se multiplica cruzado: o sinal do denominador é desconhecido, e o sentido poderia inverter.',
    },
    {
      descricao: 'O sinal de cada fator em cada pedaço da reta.',
      tex:
        quadroDeSinais(
          pontosTex,
          sinaisN.map(simbolo),
          [marca(menor, zeroN) || ' ', marca(maior, zeroN) || ' '],
          'N',
        ) +
        ' \\quad ' +
        quadroDeSinais(
          pontosTex,
          sinaisD.map(simbolo),
          [marca(menor, zeroD) || ' ', marca(maior, zeroD) || ' '],
          'D',
        ),
    },
    {
      descricao:
        'Sinal da fração: regra dos sinais, pedaço por pedaço. No zero do denominador, ela não existe (∄).',
      tex: quadroDeSinais(
        pontosTex,
        sinaisQ.map(simbolo),
        [menor === zeroD ? '\\nexists' : '0', maior === zeroD ? '\\nexists' : '0'],
        'N/D',
      ),
    },
  ];

  // O pedaço do meio tem o sinal de sinaisQ[1]; os de fora, o oposto.
  const meioServe = sinaisQ[1]! > 0 === positivo;
  const fechaMenor = inclui && menor === zeroN;
  const fechaMaior = inclui && maior === zeroN;
  const resultado: ConjuntoSolucaoReal = {
    tipo: meioServe ? 'entre' : 'fora',
    a: menor,
    b: maior,
    fechaA: fechaMenor,
    fechaB: fechaMaior,
  };

  passos.push({
    descricao:
      `Ficamos com ${meioServe ? 'o pedaço do meio' : 'os pedaços de fora'}. ` +
      (inclui
        ? `O zero do numerador entra (a fração vale 0 ali); o do denominador, x = ${numeroEmTexto(zeroD)}, nunca.`
        : 'Com desigualdade estrita, nenhuma fronteira entra.'),
    tex: solucaoRealEmTex(resultado),
  });

  return { resultado, passos };
}
