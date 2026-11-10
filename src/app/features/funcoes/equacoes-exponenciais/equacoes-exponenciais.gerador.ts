import { numeroEmTex, numeroEmTexto } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const { saoEquivalentes: proximos, formatar } = numeroComCasas(3, 1e-4);

/** Decimal com vírgula para o LaTeX. */
const dec = (v: number): string => formatar(v).replace(',', '{,}');

type Pergunta =
  'mesma-base' | 'com-logaritmo' | 'soma-de-logs' | 'substituicao' | 'tempo' | 'bases-diferentes';

/** Potências pequenas de cada base, para montar «a mesma base dos dois lados». */
const BASES: readonly { readonly base: number; readonly potencias: readonly number[] }[] = [
  { base: 2, potencias: [2, 4, 8, 16, 32, 64] },
  { base: 3, potencias: [3, 9, 27, 81] },
  { base: 5, potencias: [5, 25, 125] },
];

/**
 * Equações exponenciais e logarítmicas.
 *
 * O degrau que faltava entre «logaritmo é o expoente» e as aplicações de
 * EDO, onde toda resposta é um tempo tirado de um logaritmo. Cinco técnicas,
 * do Fácil ao Extremo: igualar as bases, tirar o logaritmo, juntar logs e
 * conferir o domínio, trocar a potência por t, e o tempo de um crescimento.
 */
export const geradorEquacoesExponenciais: GeradorExercicio<number> = {
  topicoId: 'equacoes-exponenciais',
  formatoResposta: 'um número ou fração, ex.: 3 · -3/2 · 2,807',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'mesma-base':
        return mesmaBase(nivel, rng);
      case 'com-logaritmo':
        return comLogaritmo(nivel, rng);
      case 'soma-de-logs':
        return somaDeLogs(nivel, rng);
      case 'substituicao':
        return substituicao(nivel, rng);
      case 'tempo':
        return tempo(nivel, rng);
      case 'bases-diferentes':
        return basesDiferentes(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['mesma-base', 'com-logaritmo']);
    case 'medio':
      return rng.escolher<Pergunta>(['mesma-base', 'com-logaritmo', 'soma-de-logs']);
    case 'dificil':
      return rng.escolher<Pergunta>(['substituicao', 'soma-de-logs', 'com-logaritmo']);
    // Raiz a descartar na substituição, crescimento contínuo e bases que não
    // se igualam: as três pedem decidir a técnica, não só aplicá-la.
    case 'extremo':
      return rng.escolher<Pergunta>(['substituicao', 'tempo', 'bases-diferentes']);
  }
}

/** b^(px + q) = b^n, montado com potências conhecidas; no Médio, bases diferentes da mesma família. */
function mesmaBase(nivel: Nivel, rng: Rng): Exercicio<number> {
  const { base, potencias } = rng.escolher(BASES);
  if (nivel === 'facil') {
    const q = rng.inteiro(-2, 2);
    const n = rng.inteiro(1, potencias.length);
    const valor = base ** n;
    const gabarito = n - q;
    const expoente = q === 0 ? 'x' : `x ${q > 0 ? '+' : '-'} ${Math.abs(q)}`;
    return {
      id: `expeq-base-${base}-${q}-${n}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Resolva a equação exponencial.',
      enunciadoTex: `${base}^{${expoente}} = ${valor}`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        passos: [
          {
            descricao: `Escrevemos ${valor} como potência de ${base}.`,
            tex: `${valor} = ${base}^{${n}}`,
          },
          {
            descricao: 'Com a mesma base dos dois lados, os expoentes são iguais.',
            tex: `${base}^{${expoente}} = ${base}^{${n}} \\;\\Rightarrow\\; ${expoente} = ${n}`,
          },
          { descricao: 'Isolando x.', tex: `x = ${gabarito}` },
        ],
      },
      conceitos: ['expeq.mesma-base'],
      armadilhas: semColisoes(
        [
          {
            resposta: valor / base,
            diagnostico: `Dividir ${valor} por ${base} não desfaz a potência. Pergunte: ${base} elevado a quanto dá ${valor}?`,
            passo: 0,
            conceito: 'expeq.mesma-base',
          },
          {
            resposta: n + q,
            diagnostico: `Sinal trocado ao isolar x: de ${expoente} = ${n}, x = ${n} ${q > 0 ? '−' : '+'} ${Math.abs(q)}.`,
            passo: 2,
            conceito: 'expeq.mesma-base',
          },
        ],
        gabarito,
        proximos,
      ),
      dica: `Escreva ${valor} como uma potência de ${base}: ${base} elevado a quanto dá ${valor}?`,
    };
  }

  // (b^m)^x = b^n ou 1/b^n: 4^x = 1/8 → 2^(2x) = 2^(−3).
  const familia = rng.escolher([
    { b: 2, m: 2, nome: 4 },
    { b: 2, m: 3, nome: 8 },
    { b: 3, m: 2, nome: 9 },
    { b: 5, m: 2, nome: 25 },
  ]);
  const n = rng.inteiro(1, 4) * (rng.booleano() ? -1 : 1);
  const lado = n > 0 ? `${familia.b ** n}` : `\\frac{1}{${familia.b ** -n}}`;
  const gabarito = n / familia.m;
  return {
    id: `expeq-base2-${familia.nome}-${n}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'Resolva a equação exponencial.' +
      (Number.isInteger(gabarito) ? '' : ' Responda como fração.'),
    enunciadoTex: `${familia.nome}^{x} = ${lado}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `Os dois lados são potências de ${familia.b}: ${familia.nome} = ${familia.b}${familia.m === 2 ? '²' : '³'}${n < 0 ? ', e uma fração 1/algo é expoente negativo' : ''}.`,
          tex: `(${familia.b}^{${familia.m}})^{x} = ${familia.b}^{${n}}`,
        },
        {
          descricao: 'Potência de potência multiplica os expoentes; depois igualamos.',
          tex: `${familia.b}^{${familia.m}x} = ${familia.b}^{${n}} \\;\\Rightarrow\\; ${familia.m}x = ${n}`,
        },
        { descricao: 'Dividindo.', tex: `x = ${numeroEmTex(gabarito)}` },
      ],
    },
    conceitos: ['expeq.mesma-base'],
    armadilhas: semColisoes(
      [
        {
          resposta: -gabarito,
          diagnostico:
            n < 0
              ? `1/${familia.b ** -n} é ${familia.b} elevado a MENOS ${-n}: o expoente é negativo.`
              : 'Sinal trocado.',
          passo: 0,
          conceito: 'expeq.mesma-base',
        },
        {
          resposta: n,
          diagnostico: `Faltou o expoente de ${familia.nome} = ${familia.b}^${familia.m}: fica ${familia.m}x = ${n}, e x = ${numeroEmTexto(gabarito)}.`,
          passo: 1,
          conceito: 'expeq.mesma-base',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'medio'
        ? `Escreva ${familia.nome} e o lado direito como potências de ${familia.b}. Uma fração 1/${familia.b ** Math.abs(n)} é ${familia.b} elevado a um expoente negativo.`
        : undefined,
  };
}

/** b^x = c sem potência exata: x = ln c / ln b. No Difícil, com coeficiente na frente. */
function comLogaritmo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const base = rng.escolher([2, 3, 5, 10]);
  // c não pode ser potência exata da base: aí bastaria igualar as bases.
  const potenciaExata = (v: number): boolean => {
    const e = Math.log(v) / Math.log(base);
    return Math.abs(e - Math.round(e)) < 1e-9;
  };
  let c = rng.inteiro(3, 60);
  while (potenciaExata(c)) c += 1;
  const k = nivel === 'dificil' ? rng.inteiro(2, 6) : 1;
  const direita = k * c;
  const gabarito = Math.log(c) / Math.log(base);
  const lnC = Math.log(c);
  const lnB = Math.log(base);

  return {
    id: `expeq-log-${base}-${k}-${c}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Resolva a equação. (3 casas decimais)',
    enunciadoTex: `${k === 1 ? '' : `${k} \\cdot `}${base}^{x} = ${direita}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...(k === 1
          ? []
          : [
              {
                descricao: `Primeiro isolamos a potência, dividindo por ${k}.`,
                tex: `${base}^{x} = \\frac{${direita}}{${k}} = ${c}`,
              },
            ]),
        {
          descricao: `${c} não é potência exata de ${base}: tiramos o logaritmo natural dos dois lados.`,
          tex: `\\ln(${base}^{x}) = \\ln ${c} \\;\\Rightarrow\\; x \\ln ${base} = \\ln ${c}`,
          nota: 'O logaritmo traz o expoente para a frente: ln(bˣ) = x·ln b.',
        },
        {
          descricao: 'Dividindo pelos logaritmos.',
          tex: `x = \\frac{\\ln ${c}}{\\ln ${base}} = \\frac{${dec(lnC)}}{${dec(lnB)}} = ${dec(gabarito)}`,
        },
      ],
    },
    conceitos: ['expeq.logaritmo'],
    armadilhas: semColisoes(
      [
        {
          resposta: c / base,
          diagnostico: `Dividir ${c} por ${base} não resolve uma potência: x está no EXPOENTE. Tire o logaritmo dos dois lados.`,
          passo: 0,
          conceito: 'expeq.logaritmo',
        },
        {
          resposta: Math.log(c / base),
          diagnostico: `ln ${c} ÷ ln ${base} não é ln(${c} ÷ ${base}): divida os logaritmos, não os números.`,
          passo: 1,
          conceito: 'expeq.logaritmo',
        },
        ...(k === 1
          ? []
          : [
              {
                resposta: Math.log(direita) / Math.log(base),
                diagnostico: `Faltou dividir por ${k} antes de tirar o logaritmo: o ${k} multiplica a potência, não está dentro dela.`,
                passo: 0,
                conceito: 'expeq.logaritmo',
              },
            ]),
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'facil'
        ? `${c} não é potência exata de ${base}. Tire o ln dos dois lados: x·ln ${base} = ln ${c}.`
        : nivel === 'dificil'
          ? `Isole a potência primeiro (divida por ${k}), depois tire o ln dos dois lados.`
          : undefined,
  };
}

/** log_b(x) + log_b(x + k) = n: produto, equação do 2º grau e o domínio que descarta uma raiz. */
function somaDeLogs(nivel: Nivel, rng: Rng): Exercicio<number> {
  // Raízes x = r > 0 e x = −(r + k) < 0: a segunda morre no domínio.
  const base = rng.escolher([2, 3, 2, 10]);
  let r = 0,
    k = 0,
    n = 0;
  for (let tentativa = 0; tentativa < 200; tentativa++) {
    r = rng.inteiro(1, 12);
    k = rng.inteiro(1, 8);
    const produto = r * (r + k);
    const exp = Math.round(Math.log(produto) / Math.log(base));
    if (base ** exp === produto) {
      n = exp;
      break;
    }
  }
  if (n === 0) {
    [r, k, n] = base === 3 ? [3, 6, 3] : base === 10 ? [20, 30, 3] : [2, 2, 3];
  }
  const produto = base ** n;
  const outra = -(r + k);
  const gabarito = r;

  return {
    id: `expeq-somalog-${base}-${r}-${k}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Resolva a equação logarítmica (confira o domínio).',
    enunciadoTex: `\\log_{${base}} x + \\log_{${base}} (x + ${k}) = ${n}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Soma de logaritmos de mesma base é o logaritmo do produto.',
          tex: `\\log_{${base}} \\big(x(x + ${k})\\big) = ${n}`,
        },
        {
          descricao: 'Pela definição, o produto é a base elevada ao resultado.',
          tex: `x(x + ${k}) = ${base}^{${n}} = ${produto} \\;\\Rightarrow\\; x^{2} + ${k}x - ${produto} = 0`,
        },
        {
          descricao: 'Resolvendo a equação do 2º grau.',
          tex: `x = ${r} \\quad \\text{ou} \\quad x = ${outra}`,
        },
        {
          descricao: `O logaritmo só existe para argumento positivo: x = ${outra} daria log de número negativo e é descartado.`,
          tex: `x = ${gabarito}`,
        },
      ],
    },
    conceitos: ['expeq.dominio', 'logaritmica.propriedades'],
    armadilhas: semColisoes(
      [
        {
          resposta: outra,
          diagnostico: `x = ${outra} resolve o 2º grau, mas log de ${outra} não existe: o domínio exige x > 0.`,
          passo: 3,
          conceito: 'expeq.dominio',
        },
        {
          resposta: r + outra,
          diagnostico: 'A pergunta é o valor de x, não a soma das raízes — e uma delas nem vale.',
          passo: 3,
          conceito: 'expeq.dominio',
        },
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'medio'
        ? `Junte os dois logs num só: log(x) + log(x + ${k}) = log(x·(x + ${k})). Depois confira se o x achado deixa os logs com argumento positivo.`
        : undefined,
  };
}

/** a^(2x) + p·a^x + q = 0, com t = a^x. No Extremo uma das raízes em t é negativa e se descarta. */
function substituicao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.escolher([2, 3]);
  const nome = a * a;
  const descarta = nivel === 'extremo';
  const t1 = a ** rng.inteiro(1, 3);
  let t2 = descarta ? -rng.inteiro(1, 5) : a ** rng.inteiro(0, 3);
  if (!descarta && t2 === t1) t2 = t1 * a;
  const p = -(t1 + t2);
  const q = t1 * t2;
  const raizes = [t1, t2].filter((t) => t > 0).map((t) => Math.round(Math.log(t) / Math.log(a)));
  const gabarito = Math.max(...raizes);
  const termo = (coef: number, resto: string): string =>
    coef === 0
      ? ''
      : ` ${coef > 0 ? '+' : '-'} ${Math.abs(coef) === 1 && resto ? '' : Math.abs(coef)}${resto}`;

  return {
    id: `expeq-subst-${a}-${t1}-${t2}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Resolva a equação e informe a MAIOR solução real.',
    enunciadoTex: `${nome}^{x}${termo(p, ` \\cdot ${a}^{x}`)}${termo(q, '')} = 0`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `${nome}^x = (${a}^x)²: trocamos ${a}^x por t e a equação vira do 2º grau.`,
          tex: `t = ${a}^{x} \\;\\Rightarrow\\; t^{2}${termo(p, 't')}${termo(q, '')} = 0`,
        },
        {
          descricao: 'Soma e produto (ou Bhaskara) em t.',
          tex: `t_1 = ${t1} \\qquad t_2 = ${t2}`,
        },
        {
          descricao: descarta
            ? `${a}^x é sempre positivo: t = ${t2} não dá solução. Voltamos a x só com t = ${t1}.`
            : 'Voltamos a x em cada um.',
          tex: [t1, t2]
            .filter((t) => t > 0)
            .map((t) => `${a}^{x} = ${t} \\Rightarrow x = ${Math.round(Math.log(t) / Math.log(a))}`)
            .join(' \\qquad '),
        },
        { descricao: 'A maior solução.', tex: `x = ${gabarito}` },
      ],
    },
    conceitos: ['expeq.substituicao'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.max(t1, t2),
          diagnostico: `Esse é o valor de t = ${a}^x. Falta voltar a x: ${a}^x = ${Math.max(t1, t2)}.`,
          passo: 2,
          conceito: 'expeq.substituicao',
        },
        ...(raizes.length > 1
          ? [
              {
                resposta: Math.min(...raizes),
                diagnostico: 'Essa é a MENOR solução; o enunciado pede a maior.',
                passo: 3,
                conceito: 'expeq.substituicao',
              },
            ]
          : []),
      ],
      gabarito,
      proximos,
    ),
    dica:
      nivel === 'dificil'
        ? `Chame ${a}^x de t: ${nome}^x = t². Resolva em t e depois volte a x.`
        : `Chame ${a}^x de t e resolva em t. Lembre que ${a}^x nunca é negativo.`,
  };
}

/** P(t) = P₀·e^(rt): quando a grandeza atinge um valor. */
function tempo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const p0 = rng.escolher([200, 500, 1000, 1500]);
  const fator = rng.escolher([2, 3, 4, 5, 10]);
  const taxa = rng.escolher([0.02, 0.03, 0.04, 0.05, 0.08]);
  const alvo = p0 * fator;
  const gabarito = Math.log(fator) / taxa;
  const t = (v: number) => String(v).replace('.', '{,}');

  return {
    id: `expeq-tempo-${p0}-${fator}-${taxa}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Uma população de bactérias cresce como P(t) = ${p0}·e^(${String(taxa).replace('.', ',')}·t), com t em horas. ` +
      `Em quantas horas ela chega a ${alvo}? (3 casas decimais)`,
    enunciadoTex: `P(t) = ${p0}\\,e^{${t(taxa)}t} = ${alvo}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `Dividimos por ${p0} para isolar a exponencial.`,
          tex: `e^{${t(taxa)}t} = \\frac{${alvo}}{${p0}} = ${fator}`,
        },
        {
          descricao: 'O ln desfaz o e.',
          tex: `${t(taxa)}t = \\ln ${fator} = ${dec(Math.log(fator))}`,
        },
        {
          descricao: 'Dividindo pela taxa.',
          tex: `t = \\frac{${dec(Math.log(fator))}}{${t(taxa)}} = ${dec(gabarito)}\\ \\text{h}`,
        },
      ],
    },
    conceitos: ['expeq.logaritmo'],
    armadilhas: semColisoes(
      [
        {
          resposta: Math.log(alvo) / taxa,
          diagnostico: `Faltou dividir por ${p0} antes do ln: o ${p0} multiplica a exponencial.`,
          passo: 0,
          conceito: 'expeq.logaritmo',
        },
        {
          resposta: fator / taxa,
          diagnostico: `e^(rt) = ${fator} pede o ln de ${fator}, não ${fator} direto.`,
          passo: 1,
          conceito: 'expeq.logaritmo',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Divida por ${p0} para ficar com e^(rt) = ${fator}; depois tire o ln dos dois lados.`,
  };
}

/** b^x = c^(x − k): bases que não se igualam, só o logaritmo resolve. */
function basesDiferentes(nivel: Nivel, rng: Rng): Exercicio<number> {
  const [b, c] = rng.escolher([
    [2, 3],
    [3, 5],
    [2, 5],
    [5, 7],
  ] as const);
  const k = rng.inteiro(1, 3);
  const lb = Math.log(b);
  const lc = Math.log(c);
  // x·ln b = (x − k)·ln c ⟹ x(ln c − ln b) = k·ln c
  const gabarito = (k * lc) / (lc - lb);

  return {
    id: `expeq-bases-${b}-${c}-${k}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Resolva a equação. (3 casas decimais)',
    enunciadoTex: `${b}^{x} = ${c}^{x - ${k}}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: `${b} e ${c} não são potências da mesma base: tiramos o ln dos dois lados.`,
          tex: `x \\ln ${b} = (x - ${k}) \\ln ${c}`,
        },
        {
          descricao: 'Distribuímos e juntamos os termos com x.',
          tex: `x(\\ln ${c} - \\ln ${b}) = ${k} \\ln ${c}`,
        },
        {
          descricao: 'Isolando x.',
          tex: `x = \\frac{${k} \\cdot ${dec(lc)}}{${dec(lc)} - ${dec(lb)}} = ${dec(gabarito)}`,
        },
      ],
    },
    conceitos: ['expeq.logaritmo'],
    armadilhas: semColisoes(
      [
        {
          resposta: (k * lc) / (lc + lb),
          diagnostico:
            'Ao passar x·ln b para o outro lado ele troca de sinal: fica ln c − ln b, não soma.',
          passo: 1,
          conceito: 'expeq.logaritmo',
        },
        {
          resposta: k,
          diagnostico:
            'Igualar os expoentes só vale com a MESMA base. Com bases diferentes, tire o ln.',
          passo: 0,
          conceito: 'expeq.mesma-base',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: `Tire o ln dos dois lados: x·ln ${b} = (x − ${k})·ln ${c}. Junte os termos com x de um lado.`,
  };
}
