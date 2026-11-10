import { numeroEmTex, numeroEmTexto } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Armadilha,
  Exercicio,
  GeradorExercicio,
  Nivel,
  semColisoes,
} from '@core/treino/models/treino.model';

const { saoEquivalentes: proximos, formatar } = numeroComCasas(3, 1e-4);

type Pergunta =
  | 'termo-geral'
  | 'p-serie'
  | 'comparacao'
  | 'razao'
  | 'telescopica'
  | 'alternada'
  | 'raio'
  | 'extremos-do-intervalo'
  | 'alternada-termos';

const CODIGO = 'A série converge ou diverge? Responda 1 se converge, 2 se diverge.';
const CONVERGE = 1;
const DIVERGE = 2;

/** A leitura errada do código 1/2, com o porquê. */
function armadilhaDoCodigo(certo: number, motivo: string, conceito: string): Armadilha<number>[] {
  return [
    { resposta: certo === CONVERGE ? DIVERGE : CONVERGE, diagnostico: motivo, passo: 1, conceito },
  ];
}

/**
 * Séries e convergência.
 *
 * O tópico repetia PA e PG de `funcoes/progressoes` e prometia convergência
 * sem cobrá-la. Agora cada pergunta é um teste: o do termo geral (que só
 * prova divergência), p-série, comparação, razão, telescópica, a alternada
 * com a cota do erro e, por fim, o raio e o intervalo de uma série de
 * potências — a ponte para Taylor.
 */
export const geradorSequencias: GeradorExercicio<number> = {
  topicoId: 'sequencias-e-series',
  formatoResposta: 'um número, fração ou código, ex.: 2/3 · 0,5 · 1',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'termo-geral':
        return termoGeral(nivel, rng);
      case 'p-serie':
        return pSerie(nivel, rng);
      case 'comparacao':
        return comparacao(nivel, rng);
      case 'razao':
        return razao(nivel, rng);
      case 'telescopica':
        return telescopica(nivel, rng);
      case 'alternada':
        return alternada(nivel, rng);
      case 'raio':
        return raio(nivel, rng);
      case 'extremos-do-intervalo':
        return extremosDoIntervalo(nivel, rng);
      case 'alternada-termos':
        return alternadaTermos(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['termo-geral', 'p-serie']);
    case 'medio':
      return rng.escolher<Pergunta>(['razao', 'telescopica', 'comparacao', 'p-serie']);
    case 'dificil':
      return rng.escolher<Pergunta>(['razao', 'alternada', 'raio', 'telescopica']);
    // Testar os extremos do intervalo e dimensionar a soma parcial: as duas
    // pedem combinar testes, não aplicar um só.
    case 'extremo':
      return rng.escolher<Pergunta>(['extremos-do-intervalo', 'alternada-termos', 'raio']);
  }
}

/** Polinômio curto em n: «3n + 2», «n^{2} − 1». */
function poli(coef: number, grau: 1 | 2, livre: number): string {
  const c = coef === 1 ? '' : coef === -1 ? '-' : String(coef);
  const termo = grau === 2 ? `${c}n^{2}` : `${c}n`;
  return livre === 0 ? termo : `${termo} ${livre > 0 ? '+' : '-'} ${Math.abs(livre)}`;
}

/** lim aₙ de uma razão de polinômios: se não for 0, a série diverge. */
function termoGeral(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(1, 6);
  const c = rng.inteiro(1, 6);
  const b = rng.inteiro(-5, 5);
  const d = rng.inteiro(1, 7);
  // Às vezes o numerador tem grau menor: o limite é 0 e o teste não decide.
  const grauMenor = rng.booleano(0.3);
  const gabarito = grauMenor ? 0 : a / c;
  const num = poli(a, 1, b);
  const den = grauMenor ? poli(c, 2, d) : poli(c, 1, d);

  return {
    id: `series-termo-${a}${b}${c}${d}-${grauMenor ? 'z' : 'n'}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'Calcule o limite do termo geral quando n tende ao infinito (fração ou 3 casas decimais). ' +
      'Se não der zero, a série diverge.',
    enunciadoTex: `\\sum_{n=1}^{\\infty} \\frac{${num}}{${den}} \\qquad \\lim_{n \\to \\infty} a_n = \\;?`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Para n grande, só os termos de maior grau importam em cima e embaixo.',
          tex: grauMenor
            ? `\\frac{${a}n}{${c}n^{2}} = \\frac{${a}}{${c}n} \\;\\to\\; 0`
            : `\\frac{${a}n}{${c}n} = \\frac{${a}}{${c}}`,
        },
        {
          descricao: grauMenor
            ? 'O limite é 0: o teste do termo geral NÃO decide (a harmônica também tem termo indo a 0 e diverge).'
            : 'O limite não é 0: somar infinitas parcelas perto desse valor explode. A série diverge.',
          tex: `\\lim_{n \\to \\infty} a_n = ${numeroEmTex(gabarito)}`,
        },
      ],
    },
    conceitos: ['series.termo-geral'],
    armadilhas: semColisoes(
      [
        {
          resposta: c / a,
          diagnostico: 'A fração saiu invertida: o coeficiente de cima vai em cima.',
          passo: 0,
          conceito: 'series.termo-geral',
        },
        {
          resposta: b / d,
          diagnostico: `${numeroEmTexto(b / d)} é a razão dos termos soltos, o valor perto de n = 0. No infinito mandam os termos de maior grau.`,
          passo: 0,
          conceito: 'series.termo-geral',
        },
        ...(grauMenor
          ? []
          : [
              {
                resposta: 0,
                diagnostico: `Numerador e denominador têm o mesmo grau: o limite é a razão dos coeficientes, ${a}/${c}, não 0.`,
                passo: 0,
                conceito: 'series.termo-geral',
              },
            ]),
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'facil'
        ? 'Divida tudo pela maior potência de n: sobram só os coeficientes dos termos de maior grau.'
        : undefined,
  };
}

const EXPOENTES: readonly { readonly p: number; readonly tex: string }[] = [
  { p: 0.5, tex: '\\frac{1}{\\sqrt{n}}' },
  { p: 1, tex: '\\frac{1}{n}' },
  { p: 1.5, tex: '\\frac{1}{n\\sqrt{n}}' },
  { p: 2, tex: '\\frac{1}{n^{2}}' },
  { p: 3, tex: '\\frac{1}{n^{3}}' },
  { p: 0.9, tex: '\\frac{1}{n^{0{,}9}}' },
  { p: 1.1, tex: '\\frac{1}{n^{1{,}1}}' },
];

function pSerie(nivel: Nivel, rng: Rng): Exercicio<number> {
  const { p, tex } = rng.escolher(EXPOENTES);
  const gabarito = p > 1 ? CONVERGE : DIVERGE;
  const pTexto = String(p).replace('.', ',');

  return {
    id: `series-p-${p}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: CODIGO,
    enunciadoTex: `\\sum_{n=1}^{\\infty} ${tex}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `É uma p-série, Σ 1/nᵖ, com p = ${pTexto}.`,
          tex: `${tex} = \\frac{1}{n^{${pTexto.replace(',', '{,}')}}}`,
        },
        {
          descricao:
            p > 1
              ? `p = ${pTexto} > 1: os termos caem rápido o bastante, a série converge.`
              : `p = ${pTexto} ≤ 1: os termos caem devagar demais, a série diverge${p === 1 ? ' (é a harmônica)' : ''}.`,
          tex: `p ${p > 1 ? '>' : '\\leq'} 1 \\;\\Rightarrow\\; ${gabarito}`,
        },
      ],
    },
    conceitos: ['series.p-serie'],
    armadilhas: semColisoes(
      armadilhaDoCodigo(
        gabarito,
        p > 1
          ? `Com p = ${pTexto} > 1 a p-série converge; só diverge quando p ≤ 1.`
          : `O termo vai a zero, mas isso não basta: com p = ${pTexto} ≤ 1 a soma cresce sem limite.`,
        'series.p-serie',
      ),
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'facil'
        ? 'Escreva o termo como 1/n elevado a p: converge só se p > 1 (com p = 1, a harmônica, diverge).'
        : undefined,
  };
}

type FamiliaComparacao = {
  readonly tex: string;
  readonly parecida: string;
  readonly converge: boolean;
  readonly porque: string;
};

function comparacao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const k = rng.inteiro(1, 9);
  const b = rng.inteiro(2, 5);
  const familias: readonly FamiliaComparacao[] = [
    {
      tex: `\\frac{1}{n^{2} + ${k}}`,
      parecida: '\\frac{1}{n^{2}}',
      converge: true,
      porque: 'é menor que 1/n², p-série com p = 2',
    },
    {
      tex: `\\frac{1}{n + ${k}}`,
      parecida: '\\frac{1}{n}',
      converge: false,
      porque: 'se comporta como 1/n, a harmônica',
    },
    {
      tex: `\\frac{1}{${b}^{n} + ${k}}`,
      parecida: `\\frac{1}{${b}^{n}}`,
      converge: true,
      porque: `é menor que (1/${b})ⁿ, geométrica de razão 1/${b}`,
    },
    {
      tex: `\\frac{1}{\\sqrt{n} + ${k}}`,
      parecida: '\\frac{1}{\\sqrt{n}}',
      converge: false,
      porque: 'se comporta como 1/√n, p-série com p = 1/2',
    },
    {
      tex: `\\frac{n}{n^{3} + ${k}}`,
      parecida: '\\frac{1}{n^{2}}',
      converge: true,
      porque: 'se comporta como n/n³ = 1/n²',
    },
    {
      tex: `\\frac{n + ${k}}{n^{2}}`,
      parecida: '\\frac{1}{n}',
      converge: false,
      porque: 'se comporta como n/n² = 1/n',
    },
  ];
  const indice = rng.inteiro(0, familias.length - 1);
  const familia = familias[indice]!;
  const gabarito = familia.converge ? CONVERGE : DIVERGE;

  return {
    id: `series-comp-${indice}-${k}-${b}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: CODIGO,
    enunciadoTex: `\\sum_{n=1}^{\\infty} ${familia.tex}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'Para n grande, ficamos com os termos que dominam e comparamos com uma série conhecida.',
          tex: `${familia.tex} \\;\\sim\\; ${familia.parecida}`,
        },
        {
          descricao: `O termo ${familia.porque}; por comparação, a série ${familia.converge ? 'converge' : 'diverge'}.`,
          tex: `\\Rightarrow\\; ${gabarito}`,
        },
      ],
    },
    conceitos: ['series.comparacao'],
    armadilhas: semColisoes(
      armadilhaDoCodigo(
        gabarito,
        familia.converge
          ? `O termo ${familia.porque}, que converge: a constante somada não muda o comportamento.`
          : `O termo vai a zero, mas ${familia.porque}, que diverge.`,
        'series.comparacao',
      ),
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'medio'
        ? 'Para n grande, despreze as constantes somadas e compare com uma p-série (1/nᵖ) ou uma geométrica.'
        : undefined,
  };
}

type FamiliaRazao = {
  readonly tex: string;
  readonly razaoTex: string;
  readonly limite: number;
  readonly armadilha: number;
  readonly porque: string;
};

/** L = lim |aₙ₊₁/aₙ|: L < 1 converge, L > 1 diverge. */
function razao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const p = rng.inteiro(1, 4);
  let q = rng.inteiro(2, 6);
  if (q === p) q += 1;
  const b = rng.inteiro(2, 6);
  const familias: readonly FamiliaRazao[] = [
    {
      tex: `n\\left(\\frac{${p}}{${q}}\\right)^{n}`,
      razaoTex: `\\frac{n + 1}{n} \\cdot \\frac{${p}}{${q}}`,
      limite: p / q,
      armadilha: q / p,
      porque: `(n + 1)/n tende a 1; sobra ${p}/${q}`,
    },
    {
      tex: `\\frac{n^{2}}{${b}^{n}}`,
      razaoTex: `\\frac{(n + 1)^{2}}{n^{2}} \\cdot \\frac{1}{${b}}`,
      limite: 1 / b,
      armadilha: b,
      porque: `(n + 1)²/n² tende a 1; sobra 1/${b}`,
    },
    {
      tex: `\\frac{${b}^{n}}{n!}`,
      razaoTex: `\\frac{${b}^{n+1}}{(n+1)!} \\cdot \\frac{n!}{${b}^{n}} = \\frac{${b}}{n + 1}`,
      limite: 0,
      armadilha: b,
      porque: `o fatorial ganha: ${b}/(n + 1) tende a 0`,
    },
    {
      tex: `\\frac{1}{n}\\left(\\frac{${q}}{${p}}\\right)^{n}`,
      razaoTex: `\\frac{n}{n + 1} \\cdot \\frac{${q}}{${p}}`,
      limite: q / p,
      armadilha: p / q,
      porque: `n/(n + 1) tende a 1; sobra ${q}/${p}`,
    },
  ];
  const indice = rng.inteiro(0, familias.length - 1);
  const familia = familias[indice]!;
  const gabarito = familia.limite;
  const conclusao = gabarito < 1 ? 'L < 1: converge.' : 'L > 1: diverge.';

  return {
    id: `series-razao-${indice}-${p}${q}${b}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'Pelo teste da razão, calcule L = lim |aₙ₊₁ / aₙ| quando n tende ao infinito (fração ou 3 casas decimais).',
    enunciadoTex: `\\sum_{n=1}^{\\infty} ${familia.tex}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Dividimos o termo seguinte pelo atual e simplificamos as potências.',
          tex: `\\frac{a_{n+1}}{a_n} = ${familia.razaoTex}`,
        },
        {
          descricao: `No limite, ${familia.porque}. ${conclusao}`,
          tex: `L = ${numeroEmTex(gabarito)}`,
        },
      ],
    },
    conceitos: ['series.razao'],
    armadilhas: semColisoes(
      [
        {
          resposta: familia.armadilha,
          diagnostico:
            'A razão é aₙ₊₁ sobre aₙ, nessa ordem — e as potências de n se cancelam no limite, não o número elevado a n.',
          passo: 0,
          conceito: 'series.razao',
        },
        {
          resposta: 1,
          diagnostico: 'O fator com n tende a 1, mas o que importa é o que sobra além dele.',
          passo: 1,
          conceito: 'series.razao',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'medio'
        ? 'Monte aₙ₊₁/aₙ: potências como bⁿ⁺¹/bⁿ viram b, e frações como (n + 1)/n tendem a 1.'
        : undefined,
  };
}

/** Σ k/((n + a)(n + a + 1)) = k/(a + 1): a soma parcial cancela em cascata. */
function telescopica(nivel: Nivel, rng: Rng): Exercicio<number> {
  const k = rng.inteiro(1, 6);
  const a = rng.inteiro(0, 4);
  const gabarito = k / (a + 1);
  const f = (s: number): string => (s === 0 ? 'n' : `n + ${s}`);

  return {
    id: `series-tele-${k}-${a}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Calcule a soma da série telescópica (fração ou 3 casas decimais).',
    enunciadoTex: `\\sum_{n=1}^{\\infty} \\frac{${k}}{(${f(a)})(${f(a + 1)})}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Separamos em frações parciais: a diferença de dois termos consecutivos.',
          tex: `\\frac{${k}}{(${f(a)})(${f(a + 1)})} = \\frac{${k}}{${f(a)}} - \\frac{${k}}{${f(a + 1)}}`,
        },
        {
          descricao:
            'Na soma parcial, cada termo negativo cancela o positivo seguinte; sobram a primeira e a última parcela.',
          tex: `S_N = \\frac{${k}}{${a + 1}} - \\frac{${k}}{N + ${a + 1}}`,
        },
        {
          descricao: 'Com N indo ao infinito, a última parcela some.',
          tex: `S = \\frac{${k}}{${a + 1}} = ${numeroEmTex(gabarito)}`,
        },
      ],
    },
    conceitos: ['series.telescopica'],
    armadilhas: semColisoes(
      [
        {
          resposta: k / (a + 2),
          diagnostico: `A soma começa em n = 1: a primeira parcela que sobra é ${k}/${a + 1}, não ${k}/${a + 2}.`,
          passo: 1,
          conceito: 'series.telescopica',
        },
        {
          resposta: 0,
          diagnostico:
            'O cancelamento não é total: a primeira parcela não tem par para cancelá-la.',
          passo: 1,
          conceito: 'series.telescopica',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'medio'
        ? `Escreva o termo como ${k}/(${f(a)}) − ${k}/(${f(a + 1)}) e veja o que sobra depois que os termos do meio se cancelam.`
        : undefined,
  };
}

/** Cota do erro ao truncar Σ (−1)ⁿ⁺¹/nᵖ: o primeiro termo desprezado. */
function alternada(nivel: Nivel, rng: Rng): Exercicio<number> {
  const p = rng.escolher([1, 2]);
  const N = rng.inteiro(3, 8);
  const gabarito = 1 / (N + 1) ** p;
  const termo = p === 1 ? '\\frac{1}{n}' : '\\frac{1}{n^{2}}';

  return {
    id: `series-alt-${p}-${N}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Somando só os ${N} primeiros termos, qual é a cota do erro dada pelo teorema da série alternada? Responda como fração.`,
    enunciadoTex: `\\sum_{n=1}^{\\infty} (-1)^{n+1}${termo}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'Os termos decrescem e vão a zero: pelo critério de Leibniz, a série converge.',
          tex: `b_n = ${termo} \\searrow 0`,
        },
        {
          descricao:
            'O erro de parar no termo N é no máximo o primeiro termo desprezado, o de ordem N + 1.',
          tex: `|S - S_{${N}}| \\leq b_{${N + 1}} = \\frac{1}{${p === 1 ? N + 1 : `${N + 1}^{2}`}} = \\frac{1}{${(N + 1) ** p}}`,
        },
      ],
    },
    conceitos: ['series.alternada'],
    armadilhas: semColisoes(
      [
        {
          resposta: 1 / N ** p,
          diagnostico: `Esse é o último termo SOMADO (o ${N}º). A cota é o primeiro desprezado, o ${N + 1}º.`,
          passo: 1,
          conceito: 'series.alternada',
        },
        {
          resposta: 1 / (N + 2) ** p,
          diagnostico: `O primeiro termo deixado de fora é o ${N + 1}º, não o ${N + 2}º.`,
          passo: 1,
          conceito: 'series.alternada',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'dificil'
        ? `Na alternada, o erro de parar no termo ${N} é no máximo o valor absoluto do termo ${N + 1}.`
        : undefined,
  };
}

/** `x`, `(x - 2)` ou `(x + 3)`: o binômio centrado em a. */
function centroTex(a: number): string {
  return a === 0 ? 'x' : `(x ${a > 0 ? '-' : '+'} ${Math.abs(a)})`;
}

/** `|x - 2|`, `|x + 3|` ou `|x|`. */
function distanciaTex(a: number): string {
  return a === 0 ? '|x|' : `|x ${a > 0 ? '-' : '+'} ${Math.abs(a)}|`;
}

/** Raio de convergência de uma série de potências, pela razão. */
function raio(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(-3, 3);
  const b = rng.inteiro(2, 6);
  const centro = centroTex(a);
  const dist = distanciaTex(a);
  const familias = [
    {
      tex: `\\frac{${centro}^{n}}{${b}^{n} \\, n}`,
      R: b,
      razaoTex: `\\frac{n}{n + 1} \\cdot \\frac{${dist}}{${b}}`,
    },
    {
      tex: `\\frac{n \\, ${centro}^{n}}{${b}^{n}}`,
      R: b,
      razaoTex: `\\frac{n + 1}{n} \\cdot \\frac{${dist}}{${b}}`,
    },
    {
      tex: `\\frac{${b}^{n} \\, ${centro}^{n}}{n^{2}}`,
      R: 1 / b,
      razaoTex: `\\frac{n^{2}}{(n + 1)^{2}} \\cdot ${b}\\,${dist}`,
    },
  ];
  const indice = rng.inteiro(0, familias.length - 1);
  const familia = familias[indice]!;
  const gabarito = familia.R;

  return {
    id: `series-raio-${indice}-${a}-${b}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'Qual é o raio de convergência R da série de potências? (fração ou 3 casas decimais)',
    enunciadoTex: `\\sum_{n=1}^{\\infty} ${familia.tex}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Aplicamos o teste da razão ao termo, com x fixo.',
          tex: `\\left|\\frac{a_{n+1}}{a_n}\\right| = ${familia.razaoTex}`,
        },
        {
          descricao:
            'No limite o fator com n tende a 1; a série converge quando o que sobra é menor que 1.',
          tex:
            familia.R === b
              ? `\\frac{${dist}}{${b}} < 1 \\;\\Rightarrow\\; ${dist} < ${b}`
              : `${b}\\,${dist} < 1 \\;\\Rightarrow\\; ${dist} < \\frac{1}{${b}}`,
        },
        {
          descricao: 'O raio é a distância máxima ao centro.',
          tex: `R = ${numeroEmTex(gabarito)}`,
        },
      ],
    },
    conceitos: ['series.potencias'],
    armadilhas: semColisoes(
      [
        {
          resposta: familia.R === b ? 1 / b : b,
          diagnostico: 'Invertido: de |x − a|/b < 1 sai R = b; de b·|x − a| < 1 sai R = 1/b.',
          passo: 1,
          conceito: 'series.potencias',
        },
        ...(a === 0
          ? []
          : [
              {
                resposta: Math.abs(a),
                diagnostico: `x = ${a} é o CENTRO da série, não o raio. O raio sai da desigualdade |x − a| < R.`,
                passo: 2,
                conceito: 'series.potencias',
              },
            ]),
      ],
      gabarito,
      proximos,
    ),
    dica: 'Teste da razão com x fixo: o fator com n tende a 1; imponha que o resto seja menor que 1 e isole |x − a|.',
  };
}

/** Quantos dos dois extremos de |x − a| < R entram no intervalo: 0, 1 ou 2. */
function extremosDoIntervalo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.inteiro(-3, 3);
  const b = rng.inteiro(2, 6);
  const centro = centroTex(a);
  const familias = [
    {
      tex: `\\frac{${centro}^{n}}{${b}^{n}}`,
      dentro: 0,
      direita: '1 + 1 + 1 + …, que diverge',
      esquerda: '1 − 1 + 1 − …, que diverge porque o termo não vai a 0',
    },
    {
      tex: `\\frac{${centro}^{n}}{${b}^{n} \\, n}`,
      dentro: 1,
      direita: 'a harmônica Σ 1/n, que diverge',
      esquerda: 'a alternada Σ (−1)ⁿ/n, que converge',
    },
    {
      tex: `\\frac{${centro}^{n}}{${b}^{n} \\, n^{2}}`,
      dentro: 2,
      direita: 'a p-série Σ 1/n² (p = 2), que converge',
      esquerda: 'Σ (−1)ⁿ/n², que converge absolutamente',
    },
  ];
  const familia = familias[rng.inteiro(0, familias.length - 1)]!;
  const gabarito = familia.dentro;

  return {
    id: `series-extremos-${a}-${b}-${gabarito}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'A série de potências tem centro a e raio R dados ao lado. Dos dois extremos do intervalo, ' +
      'x = a − R e x = a + R, quantos pertencem ao intervalo de convergência? Responda 0, 1 ou 2.',
    enunciadoTex: `\\sum_{n=1}^{\\infty} ${familia.tex} \\qquad a = ${a},\\; R = ${b}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'Nos extremos o teste da razão dá L = 1 e não decide: testamos cada um à parte.',
          tex: `x = ${a + b}: (x - a)^{n} = ${b}^{n} \\qquad x = ${a - b}: (x - a)^{n} = (-${b})^{n}`,
        },
        {
          descricao: `Em x = ${a + b} sobra ${familia.direita}; em x = ${a - b} sobra ${familia.esquerda}.`,
          tex: `\\text{extremos no intervalo: } ${gabarito}`,
        },
      ],
    },
    conceitos: ['series.potencias', 'series.alternada'],
    armadilhas: semColisoes(
      [0, 1, 2]
        .filter((v) => v !== gabarito)
        .map((v) => ({
          resposta: v,
          diagnostico: `Teste os dois extremos separadamente: em x = ${a + b} sobra ${familia.direita}; em x = ${a - b}, ${familia.esquerda}.`,
          passo: 1,
          conceito: 'series.potencias',
        })),
      gabarito,
      proximos,
    ),
    dica: 'Substitua cada extremo na série: (x − a)ⁿ vira Rⁿ ou (−R)ⁿ. Sobra uma série numérica — teste-a (harmônica, alternada, p-série).',
  };
}

/** Quantos termos de Σ (−1)ⁿ⁺¹/nᵖ garantem erro menor que 10⁻ᵏ. */
function alternadaTermos(nivel: Nivel, rng: Rng): Exercicio<number> {
  const [p, k] = rng.escolher([
    [1, 2],
    [1, 3],
    [2, 2],
    [2, 4],
    [2, 6],
  ] as const);
  const limite = 10 ** (k / p);
  // 1/(N + 1)ᵖ < 10⁻ᵏ ⟺ N + 1 > 10^(k/p), inteiro aqui: o menor N é o próprio 10^(k/p).
  const gabarito = limite;
  const termo = p === 1 ? '\\frac{1}{n}' : '\\frac{1}{n^{2}}';
  const potencia = '⁰¹²³⁴⁵⁶⁷⁸⁹'[k];

  return {
    id: `series-alttermos-${p}-${k}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é o menor número N de termos que garante, pelo teorema da série alternada, erro menor que 10⁻${potencia}?`,
    enunciadoTex: `\\sum_{n=1}^{\\infty} (-1)^{n+1}${termo} \\qquad |S - S_N| < 10^{-${k}}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'O erro ao parar em N é no máximo o termo N + 1; impomos que ele seja menor que a tolerância.',
          tex: `\\frac{1}{(N + 1)^{${p}}} < 10^{-${k}} \\;\\Rightarrow\\; (N + 1)^{${p}} > 10^{${k}}`,
        },
        {
          descricao: p === 1 ? 'Já está isolado.' : 'Tirando a raiz quadrada.',
          tex: `N + 1 > ${limite}`,
        },
        {
          descricao: `Como a desigualdade é estrita, N + 1 precisa ser pelo menos ${limite + 1}.`,
          tex: `N = ${gabarito}`,
        },
      ],
    },
    conceitos: ['series.alternada'],
    armadilhas: semColisoes(
      [
        {
          resposta: limite - 1,
          diagnostico: `Com N = ${limite - 1}, o primeiro termo desprezado é 1/${limite}${p === 2 ? '²' : ''}, que é IGUAL à tolerância, não menor.`,
          passo: 2,
          conceito: 'series.alternada',
        },
        ...(p === 2
          ? [
              {
                resposta: 10 ** k,
                diagnostico:
                  'Faltou tirar a raiz: com 1/n², (N + 1)² > 10ᵏ dá N + 1 maior que a raiz de 10ᵏ.',
                passo: 1,
                conceito: 'series.alternada',
              },
            ]
          : []),
      ],
      gabarito,
      proximos,
    ),
    dica: 'O erro é no máximo o primeiro termo desprezado: imponha 1/(N + 1)ᵖ < tolerância e isole N.',
  };
}
