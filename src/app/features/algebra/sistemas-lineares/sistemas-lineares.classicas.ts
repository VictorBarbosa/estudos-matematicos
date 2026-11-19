import { enunciadoDoMolde, moldesDe } from '@core/enunciados/moldes/moldes.model';
import { equacaoParaTex } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 1e-9;

/**
 * Um cenário é só a CONTA; a história dele está no arquivo.
 *
 * Antes o cenário trazia as palavras — «carros», «rodas», «veículos» — e elas
 * eram coladas ao enunciado em português, atravessando a tradução intactas.
 * Agora cada cenário aponta para o seu molde, escrito nas três línguas.
 */
interface Cenario {
  readonly molde: string;
  readonly pesoA: number;
  readonly pesoB: number;
}

const CENARIOS: readonly Cenario[] = [
  { molde: 'problema-veiculos', pesoA: 4, pesoB: 2 },
  { molde: 'problema-ingressos', pesoA: 40, pesoB: 20 },
  { molde: 'problema-animais', pesoA: 2, pesoB: 4 },
  { molde: 'problema-questoes', pesoA: 5, pesoB: -2 },
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

  const texto = enunciadoDoMolde(moldesDe('sistemas-lineares', cenario.molde)[0]!, {
    n,
    p,
    q,
    t,
  });

  return {
    id: `sistemas-problema-${cenario.molde}-${a}-${b}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    // Notação, e não palavra: o tex não tem campo de tradução, e «veículos»
    // escrito aqui chegaria em português às três telas.
    enunciadoTex: `n = ${n} \\qquad T = ${t}`,
    gabarito: a,
    resolucao: {
      resultado: a,
      passos: [
        {
          descricao:
            'Chamamos de x a primeira quantidade do enunciado e de y a segunda. Uma equação ' +
            'conta, a outra pondera.',
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
          diagnostico:
            'Essa é a SEGUNDA quantidade, a que o enunciado cita depois. A pergunta é pela ' +
            'primeira — as duas somam o total, e é fácil trocá-las no fim da conta.',
          passo: 3,
          conceito: 'sistemas.metodos',
        },
        {
          resposta: t / p,
          diagnostico:
            `Dividir o total por ${p} supõe que só existe a primeira quantidade. São duas ` +
            'incógnitas: monte as duas equações.',
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
    const texto = enunciadoDoMolde(
      moldesDe('sistemas-lineares', 'infinitas-solucoes-valor-de-m')[0]!,
      {},
    );

    return {
      id: `sistemas-indet-${a1}${b1}${c1}-${r}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: texto.enunciado,
      traducoes: texto.traducoes,
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
  const texto = enunciadoDoMolde(
    moldesDe('sistemas-lineares', 'sistema-impossivel-valor-de-k')[0]!,
    {},
  );

  return {
    id: `sistemas-impossivel-${a1}${b1}${c1}-${r}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
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
