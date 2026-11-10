import { equacaoParaTex } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 1e-9;

interface Cenario {
  readonly coisaA: string;
  readonly coisaB: string;
  readonly pesoA: number;
  readonly pesoB: number;
  readonly total: string;
  readonly medida: string;
  readonly unidade: string;
}

const CENARIOS: readonly Cenario[] = [
  {
    coisaA: 'carros',
    coisaB: 'motos',
    pesoA: 4,
    pesoB: 2,
    total: 'veículos',
    medida: 'rodas',
    unidade: 'rodas',
  },
  {
    coisaA: 'ingressos inteiros',
    coisaB: 'meias-entradas',
    pesoA: 40,
    pesoB: 20,
    total: 'ingressos',
    medida: 'arrecadação',
    unidade: 'reais',
  },
  {
    coisaA: 'galinhas',
    coisaB: 'coelhos',
    pesoA: 2,
    pesoB: 4,
    total: 'animais',
    medida: 'patas',
    unidade: 'patas',
  },
  {
    coisaA: 'questões certas',
    coisaB: 'questões erradas',
    pesoA: 5,
    pesoB: -2,
    total: 'questões',
    medida: 'pontuação',
    unidade: 'pontos',
  },
];

/**
 * O problema de enunciado que vira sistema: quantidade total e um total
 * ponderado. É onde o sistema deixa de ser exercício de conta e vira
 * ferramenta — e o passo difícil é escrever as duas equações.
 */
export function exercicioProblema(nivel: Nivel, rng: Rng): Exercicio<number> {
  const cenario = rng.escolher(CENARIOS);
  const a = rng.inteiro(3, nivel === 'facil' ? 15 : 40);
  const b = rng.inteiro(2, nivel === 'facil' ? 15 : 40);
  const n = a + b;
  const t = cenario.pesoA * a + cenario.pesoB * b;
  const { pesoA: p, pesoB: q } = cenario;

  return {
    id: `sistemas-problema-${cenario.medida}-${a}-${b}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `Há ${n} ${cenario.total} no total, entre ${cenario.coisaA} e ${cenario.coisaB}. ` +
      `Cada um dos ${cenario.coisaA} vale ${p} ${cenario.unidade} e cada um dos ${cenario.coisaB}, ` +
      `${q} ${cenario.unidade}; a ${cenario.medida} total é ${t} ${cenario.unidade}. ` +
      `Quantos são os ${cenario.coisaA}?`,
    enunciadoTex: `\\text{${cenario.total}: } ${n} \\qquad \\text{${cenario.medida}: } ${t}\\ \\text{${cenario.unidade}}`,
    gabarito: a,
    resolucao: {
      resultado: a,
      passos: [
        {
          descricao: `Chamamos de x os ${cenario.coisaA} e de y os ${cenario.coisaB}. Uma equação conta, a outra pondera.`,
          tex: `\\begin{cases} x + y = ${n} \\\\ ${equacaoParaTex(p, q, t)} \\end{cases}`,
        },
        {
          descricao: 'Da primeira, y em função de x.',
          tex: `y = ${n} - x`,
        },
        {
          descricao: 'Substituindo na segunda.',
          tex: `${p}x ${q >= 0 ? '+' : '-'} ${Math.abs(q)}(${n} - x) = ${t} \\;\\Rightarrow\\; ${p - q}x = ${t - q * n}`,
        },
        {
          descricao: 'Isolando x.',
          tex: `x = \\frac{${t - q * n}}{${p - q}} = ${a}`,
          nota: `E y = ${n} − ${a} = ${b}. Conferindo: ${p}·${a} ${q < 0 ? '−' : '+'} ${Math.abs(q)}·${b} = ${t}.`,
        },
      ],
    },
    conceitos: ['sistemas.metodos'],
    armadilhas: semColisoes(
      [
        {
          resposta: b,
          diagnostico: `Essa é a quantidade de ${cenario.coisaB}. O enunciado pergunta pelos ${cenario.coisaA}.`,
          passo: 3,
          conceito: 'sistemas.metodos',
        },
        {
          resposta: t / p,
          diagnostico: `Dividir o total por ${p} supõe que só há ${cenario.coisaA}. São duas incógnitas: monte as duas equações.`,
          passo: 0,
          conceito: 'sistemas.metodos',
        },
      ],
      a,
      proximos,
    ),
    dica:
      nivel === 'facil'
        ? `Duas equações: uma soma as quantidades (x + y = ${n}), a outra soma os valores (${p}x + ${q}y = ${t}).`
        : undefined,
  };
}

/**
 * Classificação pelo determinante: o k que torna o sistema impossível
 * (Difícil) ou o m que, com o k certo, o torna indeterminado (Extremo).
 */
export function exercicioClassificacao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a1 = rng.inteiro(1, 4);
  let b1 = rng.inteiro(-5, 5);
  if (b1 === 0) b1 = 2;
  const c1 = rng.inteiro(-9, 9);
  const r = rng.escolher([2, 3, -2, -1, 4]);
  const a2 = a1 * r;
  const k = b1 * r;

  if (nivel === 'extremo') {
    const m = c1 * r;
    return {
      id: `sistemas-indet-${a1}${b1}${c1}-${r}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        'Para que valores de k e m o sistema tem INFINITAS soluções? Informe o valor de m.',
      enunciadoTex: `\\begin{cases} ${equacaoParaTex(a1, b1, c1)} \\\\ ${a2}x + ky = m \\end{cases}`,
      gabarito: m,
      resolucao: {
        resultado: m,
        passos: [
          {
            descricao:
              'Infinitas soluções: as duas equações são a MESMA reta — uma é múltipla da outra.',
            tex: '\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2}',
          },
          {
            descricao: `O coeficiente de x foi multiplicado por ${r} (de ${a1} para ${a2}).`,
            tex: `\\frac{${a2}}{${a1}} = ${r}`,
          },
          {
            descricao: 'O mesmo fator vale para y e para o termo independente.',
            tex: `k = ${r} \\cdot (${b1}) = ${k} \\qquad m = ${r} \\cdot (${c1}) = ${m}`,
          },
        ],
      },
      conceitos: ['sistemas.classificacao'],
      armadilhas: semColisoes(
        [
          {
            resposta: k,
            diagnostico: 'Esse é o k. O pedido é m, o termo independente da segunda equação.',
            passo: 2,
            conceito: 'sistemas.classificacao',
          },
          {
            resposta: c1,
            diagnostico: `O termo independente também é multiplicado por ${r}: a segunda equação inteira é ${r} vezes a primeira.`,
            passo: 2,
            conceito: 'sistemas.classificacao',
          },
        ],
        m,
        proximos,
      ),
      dica: 'Infinitas soluções: a segunda equação é a primeira multiplicada por um número. Ache esse número pelo coeficiente de x.',
    };
  }

  const c2 = c1 * r + rng.escolher([1, 2, -1, 3]);
  return {
    id: `sistemas-impossivel-${a1}${b1}${c1}-${r}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Para que valor de k o sistema NÃO tem solução (é impossível)?',
    enunciadoTex: `\\begin{cases} ${equacaoParaTex(a1, b1, c1)} \\\\ ${a2}x + ky = ${c2} \\end{cases}`,
    gabarito: k,
    resolucao: {
      resultado: k,
      passos: [
        {
          descricao: 'Sem solução: retas paralelas, o que exige determinante zero.',
          tex: `D = a_1b_2 - a_2b_1 = ${a1}k - ${a2 < 0 ? `(${a2})` : a2} \\cdot ${b1 < 0 ? `(${b1})` : b1} = 0`,
        },
        {
          descricao: 'Isolando k.',
          tex: `${a1}k = ${a2 * b1} \\;\\Rightarrow\\; k = ${k}`,
        },
        {
          descricao:
            'Conferimos que não é a mesma reta: o termo independente NÃO segue a proporção.',
          tex: `${r} \\cdot ${c1 < 0 ? `(${c1})` : c1} = ${r * c1} \\neq ${c2}`,
          nota: `Com k = ${k}, a segunda equação teria lado direito ${r} × ${c1} = ${r * c1} se fosse a mesma reta; é ${c2}, então são paralelas distintas.`,
        },
        { descricao: 'Portanto:', tex: `k = ${k}` },
      ],
    },
    conceitos: ['sistemas.classificacao'],
    armadilhas: semColisoes(
      [
        {
          resposta: -k,
          diagnostico: 'Sinal trocado: D = a₁b₂ − a₂b₁ = 0 dá a₁k = a₂b₁.',
          passo: 1,
          conceito: 'sistemas.classificacao',
        },
        {
          resposta: b1,
          diagnostico: `Retas paralelas têm coeficientes PROPORCIONAIS, não iguais: x foi multiplicado por ${r}, então y também.`,
          passo: 0,
          conceito: 'sistemas.classificacao',
        },
      ],
      k,
      proximos,
    ),
    dica:
      nivel === 'dificil'
        ? 'Sem solução = retas paralelas = determinante zero: a₁·k − a₂·b₁ = 0.'
        : undefined,
  };
}
