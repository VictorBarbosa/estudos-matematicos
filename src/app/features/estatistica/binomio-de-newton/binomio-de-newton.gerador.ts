import { combinacoes } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const exato = (a: number, b: number): boolean => Math.abs(a - b) < 1e-9;

type Pergunta = 'pascal' | 'soma-coeficientes' | 'coeficiente' | 'termo' | 'independente';

/** `ax + b` em LaTeX, com os sinais certos e sem «1x». */
function binomioTex(a: number, b: number, variavel = 'x'): string {
  const ta = a === 1 ? variavel : a === -1 ? `-${variavel}` : `${a}${variavel}`;
  return `${ta} ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`;
}

const par = (v: number): string => (v < 0 ? `(${v})` : `${v}`);

/** Expoente em sobrescrito, para a prosa (que não passa pelo KaTeX). */
const SOBRE = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const elevado = (n: number): string =>
  String(n)
    .split('')
    .map((d) => SOBRE[Number(d)])
    .join('');

/**
 * Binômio de Newton.
 *
 * A ponte entre a combinatória e a álgebra: os coeficientes de (a + b)ⁿ são as
 * combinações C(n, k). As perguntas vão do triângulo de Pascal ao termo
 * independente, passando pelo coeficiente de uma potência pedida — que é onde
 * se erra o expoente do segundo termo e o sinal.
 */
export const geradorBinomio: GeradorExercicio<number> = {
  topicoId: 'binomio-de-newton',
  formatoResposta: 'um número inteiro, ex.: 240',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'pascal':
        return pascal(nivel, rng);
      case 'soma-coeficientes':
        return somaCoeficientes(nivel, rng);
      case 'coeficiente':
        return coeficiente(nivel, rng);
      case 'termo':
        return termo(nivel, rng);
      case 'independente':
        return independente(nivel, rng);
    }
  },

  analisar: analisarNumero,
  saoEquivalentes: exato,
  formatar: (v) => v.toLocaleString('pt-BR'),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['pascal', 'soma-coeficientes']);
    case 'medio':
      return rng.escolher<Pergunta>(['coeficiente', 'soma-coeficientes', 'pascal']);
    case 'dificil':
      return rng.escolher<Pergunta>(['coeficiente', 'termo']);
    // O termo independente exige montar o expoente de x em função de k e
    // resolver para k — a pergunta que separa aplicar de entender o termo geral.
    case 'extremo':
      return rng.escolher<Pergunta>(['independente', 'coeficiente']);
  }
}

function pascal(nivel: Nivel, rng: Rng): Exercicio<number> {
  const n = rng.inteiro(4, 10);
  const k = rng.inteiro(1, n - 1);
  const gabarito = combinacoes(n, k);
  const acima = [combinacoes(n - 1, k - 1), combinacoes(n - 1, k)];
  return {
    id: `binomio-pascal-${n}-${k}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Quanto vale C(${n}, ${k}), o número na linha ${n}, posição ${k} do triângulo de Pascal (contando do 0)?`,
    enunciadoTex: `\\binom{${n}}{${k}} = \\;?`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Pela fórmula das combinações.',
          tex: `\\binom{${n}}{${k}} = \\frac{${n}!}{${k}!\\,${n - k}!}`,
        },
        {
          descricao: 'Ou pelo triângulo: cada número é a soma dos dois de cima.',
          tex: `\\binom{${n - 1}}{${k - 1}} + \\binom{${n - 1}}{${k}} = ${acima[0]} + ${acima[1]} = ${gabarito}`,
        },
      ],
    },
    conceitos: ['binomio.pascal'],
    armadilhas: semColisoes(
      [
        {
          resposta: combinacoes(n, k - 1),
          diagnostico:
            'Posição deslocada: no triângulo de Pascal a contagem começa do 0 (o 1 da ponta é a posição 0).',
          passo: 0,
          conceito: 'binomio.pascal',
        },
        {
          resposta: acima[0]! * acima[1]!,
          diagnostico: 'Os dois de cima se SOMAM, não se multiplicam.',
          passo: 1,
          conceito: 'binomio.pascal',
        },
      ],
      gabarito,
      exato,
    ),
    dica:
      nivel === 'facil'
        ? `C(${n}, ${k}) = ${n}! / (${k}!·${n - k}!). Ou some os dois números acima no triângulo.`
        : undefined,
  };
}

function somaCoeficientes(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = nivel === 'facil' ? rng.inteiro(1, 2) : rng.inteiro(1, 3);
  const b = nivel === 'facil' ? rng.inteiro(1, 2) : rng.escolher([1, 2, -1, 3, -3]);
  const n = rng.inteiro(2, nivel === 'facil' ? 9 : 6);
  const gabarito = (a + b) ** n;
  return {
    id: `binomio-soma-${a}${b}-${n}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Qual é a soma de todos os coeficientes do desenvolvimento?',
    enunciadoTex: `\\left(${binomioTex(a, b)}\\right)^{${n}}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao:
            'Fazer x = 1 transforma cada termo no seu coeficiente: a soma deles é o valor em x = 1.',
          tex: `P(1) = \\left(${a} \\cdot 1 ${b >= 0 ? '+' : '-'} ${Math.abs(b)}\\right)^{${n}}`,
        },
        { descricao: 'Calculando.', tex: `(${a + b})^{${n}} = ${gabarito}` },
      ],
    },
    conceitos: ['binomio.soma-coeficientes'],
    armadilhas: semColisoes(
      [
        {
          resposta: 2 ** n,
          diagnostico: `2ⁿ só vale para (x + 1)ⁿ. Aqui, com x = 1, a base é ${a} ${b >= 0 ? '+' : '−'} ${Math.abs(b)} = ${a + b}.`,
          passo: 0,
          conceito: 'binomio.soma-coeficientes',
        },
        {
          resposta: (a + b) * n,
          diagnostico: `É (${a + b}) ELEVADO a ${n}, não vezes ${n}.`,
          passo: 1,
          conceito: 'binomio.soma-coeficientes',
        },
      ],
      gabarito,
      exato,
    ),
    dica:
      nivel === 'facil'
        ? 'Substitua x = 1: cada termo vira só o seu coeficiente.'
        : nivel === 'medio'
          ? `Substitua x = 1 no binômio: fica (${a + b}) elevado a ${n}.`
          : undefined,
  };
}

/** Coeficiente de x^p em (ax + b)^n: C(n, p)·a^p·b^(n−p). */
function coeficiente(nivel: Nivel, rng: Rng): Exercicio<number> {
  const n = rng.inteiro(4, nivel === 'extremo' ? 9 : 7);
  const a = nivel === 'medio' ? 1 : rng.escolher([1, 2, 3, -2]);
  const b = nivel === 'medio' ? rng.inteiro(2, 4) : rng.escolher([2, -1, -2, 3, -3]);
  const p = rng.inteiro(1, n - 1);
  const c = combinacoes(n, p);
  const gabarito = c * a ** p * b ** (n - p);
  return {
    id: `binomio-coef-${a}${b}-${n}-${p}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Qual é o coeficiente de x${p === 1 ? '' : elevado(p)} no desenvolvimento?`,
    enunciadoTex: `\\left(${binomioTex(a, b)}\\right)^{${n}}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'O termo geral: escolhemos k vezes o termo com x e as outras n − k o número.',
          tex: `\\binom{${n}}{k}(${a === 1 ? '' : a}x)^{k}(${b})^{${n} - k}`,
        },
        {
          descricao: `Para ter x${elevado(p)}, k = ${p}; o número entra ${n - p} vezes.`,
          tex: `\\binom{${n}}{${p}} \\cdot ${par(a)}^{${p}} \\cdot ${par(b)}^{${n - p}}`,
        },
        {
          descricao: 'Calculando cada fator.',
          tex: `${c} \\cdot ${a ** p} \\cdot ${par(b ** (n - p))} = ${gabarito}`,
        },
      ],
    },
    conceitos: ['binomio.termo-geral'],
    armadilhas: semColisoes(
      [
        {
          resposta: c,
          diagnostico: `C(${n}, ${p}) é só parte do coeficiente: falta multiplicar pelas potências de ${a} e de ${b}.`,
          passo: 1,
          conceito: 'binomio.termo-geral',
        },
        {
          resposta: c * a ** (n - p) * b ** p,
          diagnostico: `Expoentes trocados: o ${a === 1 ? 'x' : `${a}x`} vai à potência ${p} (a do x pedido) e o ${b} à ${n - p}.`,
          passo: 1,
          conceito: 'binomio.termo-geral',
        },
        ...(b < 0
          ? [
              {
                resposta: Math.abs(gabarito),
                diagnostico: `O sinal: (${b}) elevado a ${n - p} é ${(n - p) % 2 === 0 ? 'positivo' : 'NEGATIVO'}.`,
                passo: 2,
                conceito: 'binomio.termo-geral',
              },
            ]
          : []),
      ],
      gabarito,
      exato,
    ),
    dica:
      nivel === 'medio'
        ? `O termo com x${elevado(p)} é C(${n}, ${p})·x${elevado(p)}·${b}${elevado(n - p)}: o ${b} entra ${n} − ${p} = ${n - p} vezes.`
        : nivel === 'dificil' || nivel === 'extremo'
          ? `Termo geral: C(${n}, k)·(${a}x) elevado a k vezes (${b}) elevado a ${n} − k. Com k = ${p}, calcule cada potência com o sinal.`
          : undefined,
  };
}

/** O k-ésimo termo de (x + b)^n em potências decrescentes de x: T(k+1) = C(n,k)·x^(n−k)·b^k. */
function termo(nivel: Nivel, rng: Rng): Exercicio<number> {
  const n = rng.inteiro(5, 8);
  const b = rng.escolher([2, -2, 3, -1]);
  const k = rng.inteiro(1, n - 1);
  const ordem = k + 1;
  const gabarito = combinacoes(n, k) * b ** k;
  return {
    id: `binomio-termo-${b}-${n}-${ordem}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `No desenvolvimento em potências decrescentes de x, qual é o coeficiente do ${ordem}º termo?`,
    enunciadoTex: `\\left(x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}\\right)^{${n}}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'O termo de ordem k + 1 usa k como índice: o primeiro termo é k = 0.',
          tex: `T_{k+1} = \\binom{${n}}{k}\\,x^{${n} - k}\\,(${b})^{k} \\;\\Rightarrow\\; k = ${k}`,
        },
        {
          descricao: 'Substituindo.',
          tex: `\\binom{${n}}{${k}}(${b})^{${k}} = ${combinacoes(n, k)} \\cdot ${par(b ** k)} = ${gabarito}`,
        },
      ],
    },
    conceitos: ['binomio.termo-geral'],
    armadilhas: semColisoes(
      [
        {
          resposta: combinacoes(n, ordem) * b ** ordem,
          diagnostico: `O ${ordem}º termo é k = ${k}, não k = ${ordem}: a contagem dos termos começa em k = 0.`,
          passo: 0,
          conceito: 'binomio.termo-geral',
        },
        {
          resposta: combinacoes(n, k),
          diagnostico: `Faltou a potência do segundo termo: (${b})${elevado(k)}.`,
          passo: 1,
          conceito: 'binomio.termo-geral',
        },
      ],
      gabarito,
      exato,
    ),
    dica:
      nivel === 'dificil'
        ? `O ${ordem}º termo corresponde a k = ${k} (o 1º é k = 0). Use C(${n}, k) vezes (${b}) elevado a k.`
        : undefined,
  };
}

/** Termo independente de (x + c/x)^n (n par) ou (x² + c/x)^n (n múltiplo de 3). */
function independente(nivel: Nivel, rng: Rng): Exercicio<number> {
  const quadrado = rng.booleano();
  const c = rng.escolher([1, 2, 3, -1, -2]);
  const n = quadrado ? rng.escolher([3, 6]) : rng.escolher([4, 6, 8]);
  // Expoente de x no termo k: (x^q)^(n−k)·(x^−1)^k → q(n − k) − k = 0.
  const q = quadrado ? 2 : 1;
  const k = (q * n) / (q + 1);
  const gabarito = combinacoes(n, k) * c ** k;
  const primeiro = quadrado ? 'x^{2}' : 'x';
  return {
    id: `binomio-indep-${q}-${c}-${n}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Qual é o termo independente de x (o termo sem x) no desenvolvimento?',
    enunciadoTex: `\\left(${primeiro} ${c >= 0 ? '+' : '-'} \\frac{${Math.abs(c)}}{x}\\right)^{${n}}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'O termo geral, com o expoente de x de cada fator.',
          tex: `\\binom{${n}}{k}(${primeiro})^{${n} - k}\\left(${c >= 0 ? '' : '-'}\\frac{${Math.abs(c)}}{x}\\right)^{k} = \\binom{${n}}{k}(${c})^{k}\\,x^{${q === 1 ? '' : q}(${n} - k) - k}`,
        },
        {
          descricao: 'Sem x significa expoente zero.',
          tex: `${q === 1 ? '' : q}(${n} - k) - k = 0 \\;\\Rightarrow\\; k = ${k}`,
        },
        {
          descricao: 'Substituindo k.',
          tex: `\\binom{${n}}{${k}}(${c})^{${k}} = ${combinacoes(n, k)} \\cdot ${par(c ** k)} = ${gabarito}`,
        },
      ],
    },
    conceitos: ['binomio.independente'],
    armadilhas: semColisoes(
      [
        {
          resposta: combinacoes(n, k),
          diagnostico: `Faltou o ${c} elevado a ${k}: o número junto do 1/x também entra no termo.`,
          passo: 2,
          conceito: 'binomio.independente',
        },
        ...(quadrado && n % 2 === 0
          ? [
              {
                resposta: combinacoes(n, n / 2) * c ** (n / 2),
                diagnostico: `Com x² no primeiro termo, o expoente é 2(${n} − k) − k, não (${n} − k) − k: o meio do desenvolvimento não é o termo sem x.`,
                passo: 1,
                conceito: 'binomio.independente',
              },
            ]
          : []),
      ],
      gabarito,
      exato,
    ),
    dica: `Escreva o expoente de x no termo geral em função de k e iguale a zero para achar k.`,
  };
}
