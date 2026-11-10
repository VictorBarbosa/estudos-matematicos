import { Polinomio } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const exato = (a: number, b: number): boolean => a === b;

type Tipo = 1 | 2 | 3;
const NOME: Record<Tipo, string> = { 1: 'removível', 2: 'de salto', 3: 'infinita' };

const PERGUNTA =
  'Classifique a descontinuidade em x = {p}. Responda 1 se for removível, 2 se for de salto, ' +
  '3 se for infinita.';

/** As duas respostas erradas, cada uma com o porquê de não ser. */
function armadilhas(certo: Tipo, motivo: Record<Tipo, string>) {
  return semColisoes(
    ([1, 2, 3] as Tipo[])
      .filter((t) => t !== certo)
      .map((t) => ({
        resposta: t as number,
        diagnostico: `Não é ${NOME[t]}: ${motivo[t]}`,
        passo: 1,
        conceito: 'continuidade.tipos',
      })),
    certo,
    exato,
  );
}

/**
 * Classificar a descontinuidade: removível, de salto ou infinita.
 *
 * A pergunta que separa calcular limites de entender o que eles dizem: os
 * três tipos aparecem na teoria do tópico e nenhum exercício os cobrava.
 * No Extremo a função é uma racional cujo denominador zera em dois pontos —
 * só fatorando se descobre qual dos dois é buraco e qual é assíntota.
 */
export function exercicioTipoDescontinuidade(nivel: Nivel, rng: Rng): Exercicio<number> {
  if (nivel === 'extremo') return tipoEmRacional(nivel, rng);

  const tipo = rng.escolher<Tipo>([1, 2, 3]);
  const p = rng.inteiro(-4, 5);

  if (tipo === 1) {
    // (x − p)(x + m)/(x − p): o fator some, sobra x + m.
    let m = rng.inteiro(-5, 5);
    if (m === -p) m += 1;
    const num = Polinomio.de(-p * m, m - p, 1);
    return {
      id: `cont-tipo-rem-${p}${m}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: PERGUNTA.replace('{p}', String(p)),
      enunciadoTex: `f(x) = \\frac{${num.paraTex()}}{${Polinomio.de(-p, 1).paraTex()}}`,
      gabarito: 1,
      resolucao: {
        resultado: 1,
        passos: [
          {
            descricao: `Em x = ${p} o denominador zera e o numerador também: forma 0/0.`,
            tex: `\\frac{${num.avaliar(p)}}{0}`,
          },
          {
            descricao: 'Fatorando, o fator que zera se cancela e o limite existe.',
            tex: `\\frac{${Polinomio.de(-p, 1).paraTex()}\\,(${Polinomio.de(m, 1).paraTex()})}{${Polinomio.de(-p, 1).paraTex()}} = ${Polinomio.de(m, 1).paraTex()} \\;\\to\\; ${p + m}`,
          },
          {
            descricao: `O limite existe (vale ${p + m}), mas f(${p}) não: é um buraco, que se tapa definindo f(${p}) = ${p + m}.`,
            tex: `\\text{removível} \\;\\Rightarrow\\; 1`,
          },
        ],
      },
      conceitos: ['continuidade.tipos'],
      armadilhas: armadilhas(1, {
        1: '',
        2: 'os dois laterais são iguais (o limite existe); salto exige laterais diferentes.',
        3: 'o numerador também zera, e o fator se cancela; infinita exige numerador diferente de zero.',
      }),
      dica:
        nivel === 'medio'
          ? 'Teste 0/0: se o fator que zera embaixo se cancela, é um buraco (removível).'
          : undefined,
    };
  }

  if (tipo === 2) {
    const a = rng.inteiro(1, 3);
    const b = rng.inteiro(-5, 5);
    const c = rng.inteiro(1, 3);
    let d = rng.inteiro(-5, 5);
    if (a * p + b === c * p + d) d += rng.escolher([2, -3]);
    const esq = a * p + b;
    const dir = c * p + d;
    return {
      id: `cont-tipo-salto-${p}${a}${b}${c}${d}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: PERGUNTA.replace('{p}', String(p)),
      enunciadoTex: `f(x) = \\begin{cases} ${Polinomio.de(b, a).paraTex()} & x < ${p} \\\\ ${Polinomio.de(d, c).paraTex()} & x \\geq ${p} \\end{cases}`,
      gabarito: 2,
      resolucao: {
        resultado: 2,
        passos: [
          {
            descricao: 'Os dois laterais, cada um pela sua sentença.',
            tex: `\\lim_{x \\to ${p}^{-}} f = ${a}(${p}) ${b >= 0 ? '+' : '-'} ${Math.abs(b)} = ${esq} \\qquad \\lim_{x \\to ${p}^{+}} f = ${c}(${p}) ${d >= 0 ? '+' : '-'} ${Math.abs(d)} = ${dir}`,
          },
          {
            descricao:
              'Os laterais são finitos e diferentes: o gráfico pula de um valor para o outro.',
            tex: `${esq} \\neq ${dir}`,
          },
          { descricao: 'Descontinuidade de salto.', tex: `\\text{salto} \\;\\Rightarrow\\; 2` },
        ],
      },
      conceitos: ['continuidade.tipos'],
      armadilhas: armadilhas(2, {
        1: 'removível exige que os dois laterais sejam iguais; aqui eles discordam.',
        2: '',
        3: 'os dois laterais são números finitos; infinita é quando algum vai a ±∞.',
      }),
      dica:
        nivel === 'medio'
          ? 'Calcule os dois laterais. Iguais: removível. Diferentes e finitos: salto.'
          : undefined,
    };
  }

  // (x + m)/(x − p) com p + m ≠ 0: numerador não zera, assíntota vertical.
  let m = rng.inteiro(-5, 5);
  if (m === -p) m += 2;
  return {
    id: `cont-tipo-inf-${p}${m}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: PERGUNTA.replace('{p}', String(p)),
    enunciadoTex: `f(x) = \\frac{${Polinomio.de(m, 1).paraTex()}}{${Polinomio.de(-p, 1).paraTex()}}`,
    gabarito: 3,
    resolucao: {
      resultado: 3,
      passos: [
        {
          descricao: `Em x = ${p} o denominador zera, mas o numerador não.`,
          tex: `\\frac{${p + m}}{0}`,
        },
        {
          descricao:
            'Um número diferente de zero dividido por algo que tende a zero explode: assíntota vertical.',
          tex: `\\lim_{x \\to ${p}} |f(x)| = \\infty`,
        },
        { descricao: 'Descontinuidade infinita.', tex: `\\text{infinita} \\;\\Rightarrow\\; 3` },
      ],
    },
    conceitos: ['continuidade.tipos'],
    armadilhas: armadilhas(3, {
      1: `o numerador vale ${p + m} em x = ${p}, não zero: não há fator para cancelar.`,
      2: 'salto tem laterais finitos; aqui a função vai a ±∞.',
      3: '',
    }),
    dica:
      nivel === 'medio'
        ? 'Substitua o ponto: algo diferente de zero sobre zero indica assíntota (infinita).'
        : undefined,
  };
}

/** (x − p)(x + m) / ((x − p)(x − q)): buraco em p, assíntota em q. */
function tipoEmRacional(nivel: Nivel, rng: Rng): Exercicio<number> {
  const p = rng.inteiro(-4, 4);
  let q = rng.inteiro(-4, 4);
  while (q === p) q = rng.inteiro(-4, 4);
  let m = rng.inteiro(-5, 5);
  while (m === -p || m === -q) m += 1;

  const num = Polinomio.de(-p * m, m - p, 1);
  const den = Polinomio.de(p * q, -(p + q), 1);
  const perguntaEmP = rng.booleano();
  const ponto = perguntaEmP ? p : q;
  const certo: Tipo = perguntaEmP ? 1 : 3;
  const limiteEmP = (p + m) / (p - q);

  return {
    id: `cont-tipo-racional-${p}${q}${m}-${ponto}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: PERGUNTA.replace('{p}', String(ponto)),
    enunciadoTex: `f(x) = \\frac{${num.paraTex()}}{${den.paraTex()}}`,
    gabarito: certo,
    resolucao: {
      resultado: certo,
      passos: [
        {
          descricao: `O denominador zera em dois pontos, x = ${Math.min(p, q)} e x = ${Math.max(p, q)}. Fatoramos em cima e embaixo.`,
          tex: `\\frac{(${Polinomio.de(-p, 1).paraTex()})(${Polinomio.de(m, 1).paraTex()})}{(${Polinomio.de(-p, 1).paraTex()})(${Polinomio.de(-q, 1).paraTex()})} = \\frac{${Polinomio.de(m, 1).paraTex()}}{${Polinomio.de(-q, 1).paraTex()}} \\quad (x \\neq ${p})`,
        },
        perguntaEmP
          ? {
              descricao: `Em x = ${p} o fator se cancela e o limite existe.`,
              tex: `\\lim_{x \\to ${p}} f = \\frac{${p + m}}{${p - q}}`,
              nota: 'Limite finito sem f definida no ponto: um buraco.',
            }
          : {
              descricao: `Em x = ${q} o fator NÃO se cancela: o numerador simplificado vale ${q + m}, não zero.`,
              tex: `\\frac{${q + m}}{0} \\;\\Rightarrow\\; \\lim |f| = \\infty`,
            },
        {
          descricao: perguntaEmP ? 'Descontinuidade removível.' : 'Descontinuidade infinita.',
          tex: `\\text{${perguntaEmP ? 'removível' : 'infinita'}} \\;\\Rightarrow\\; ${certo}`,
        },
      ],
    },
    conceitos: ['continuidade.tipos'],
    armadilhas: armadilhas(certo, {
      1: `o fator (x − ${q}) não aparece no numerador para se cancelar; o numerador vale ${q + m} ali.`,
      2: 'numa função racional não há laterais finitos e diferentes: ou o limite existe, ou vai a ±∞.',
      3: `o fator (x − ${p}) está em cima e embaixo e se cancela; o limite existe e vale ${Number(limiteEmP.toFixed(3)).toLocaleString('pt-BR')}.`,
    }),
    dica: 'Fatore numerador e denominador. Fator que cancela: removível. Fator que sobra embaixo: infinita.',
  };
}
