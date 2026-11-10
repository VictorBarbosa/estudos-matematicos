import { Polinomio, numeroEmTex } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const { saoEquivalentes: proximos } = numeroComCasas(3, 1e-4);

/**
 * Crescimento pelo sinal de f′, e inflexão pelo sinal de f″.
 *
 * É o uso do estudo de sinal que motivou criar aquele tópico: a cúbica
 * f(x) = a(x³/3 − s·x²/2 + p·x) + d tem f′ = a(x − c₁)(x − c₂), e o intervalo
 * limitado entre os pontos críticos é onde f decresce (a > 0) ou cresce (a < 0).
 */
export function exercicioCrescimento(nivel: Nivel, rng: Rng): Exercicio<number> {
  const c1 = rng.inteiro(-4, 2);
  const c2 = c1 + rng.inteiro(1, 5);
  // Múltiplo de 6, para f ter coeficientes inteiros (a/3 e a/2).
  const a = nivel === 'medio' ? 6 : rng.escolher([6, -6, 12, -12]);
  const d = rng.inteiro(-5, 5);
  // f′ = a(x − c1)(x − c2) = a x² − a(c1+c2) x + a c1 c2
  const derivada = Polinomio.de(a * c1 * c2, -a * (c1 + c2), a);
  const f = Polinomio.de(d, a * c1 * c2, (-a * (c1 + c2)) / 2, a / 3);
  const verbo = a > 0 ? 'decrescente' : 'crescente';
  const pedeDireita = rng.booleano();
  const gabarito = pedeDireita ? c2 : c1;

  return {
    id: `aplic-cresc-${a}${c1}${c2}${d}-${pedeDireita ? 'b' : 'a'}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      `A função é ${verbo} num único intervalo limitado (a, b). Informe ` +
      `${pedeDireita ? 'b, o extremo direito' : 'a, o extremo esquerdo'}.`,
    enunciadoTex: `f(x) = ${f.paraTex()}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Crescer ou decrescer é o sinal da derivada. Derivamos.',
          tex: `f'(x) = ${derivada.paraTex()}`,
        },
        {
          descricao: 'Os pontos críticos: onde f′ zera.',
          tex: `f'(x) = ${a}(x ${c1 >= 0 ? '-' : '+'} ${Math.abs(c1)})(x ${c2 >= 0 ? '-' : '+'} ${Math.abs(c2)}) = 0 \\;\\Rightarrow\\; x = ${c1},\\; x = ${c2}`,
        },
        {
          descricao:
            `f′ é um trinômio com a = ${a}: ${a > 0 ? 'negativo' : 'positivo'} ENTRE as raízes, ` +
            `${a > 0 ? 'positivo' : 'negativo'} fora delas.`,
          tex: `\\begin{array}{c|ccccc} x & & ${c1} & & ${c2} & \\\\ \\hline f' & ${a > 0 ? '+' : '-'} & 0 & ${a > 0 ? '-' : '+'} & 0 & ${a > 0 ? '+' : '-'} \\end{array}`,
          nota: 'É o quadro de sinais do tópico Estudo de sinal, aplicado à derivada.',
        },
        {
          descricao: `Então f é ${verbo} entre os pontos críticos.`,
          tex: `(a, b) = (${c1}, ${c2}) \\;\\Rightarrow\\; ${pedeDireita ? 'b' : 'a'} = ${gabarito}`,
        },
      ],
    },
    conceitos: ['aplic-derivada.extremos', 'sinal.trinomio'],
    armadilhas: semColisoes(
      [
        {
          resposta: pedeDireita ? c1 : c2,
          diagnostico: `Esse é o outro extremo do intervalo. O pedido é ${pedeDireita ? 'o da direita (o maior)' : 'o da esquerda (o menor)'}.`,
          passo: 3,
          conceito: 'aplic-derivada.extremos',
        },
        {
          resposta: (c1 + c2) / 2,
          diagnostico:
            'Esse é o meio do intervalo (onde f″ zera, a inflexão). Os extremos são onde f′ zera.',
          passo: 1,
          conceito: 'aplic-derivada.extremos',
        },
      ],
      gabarito,
      proximos,
    ),
    // No Médio a é sempre positivo (decrescente); o «crescente» estreia no Difícil.
    dica:
      nivel === 'medio' || (nivel === 'dificil' && a < 0)
        ? 'Derive, ache onde f′ = 0 e veja o sinal de f′ entre essas raízes (é um trinômio: sinal contrário ao de a entre as raízes).'
        : undefined,
  };
}

/** O ponto de inflexão de uma cúbica: onde f″ troca de sinal. */
export function exercicioInflexao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = rng.escolher([1, 2, -1, 3, -2]);
  const b = rng.inteiro(-9, 9);
  const c = rng.inteiro(-8, 8);
  const d = rng.inteiro(-5, 5);
  const f = Polinomio.de(d, c, b, a);
  const gabarito = -b / (3 * a);
  const fracao = !Number.isInteger(gabarito);

  return {
    id: `aplic-inflexao-${a}${b}${c}${d}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado:
      'Em que x a função tem ponto de inflexão (onde a concavidade muda)?' +
      (fracao ? ' Responda como fração ou com 3 casas decimais.' : ''),
    enunciadoTex: `f(x) = ${f.paraTex()}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'A concavidade é o sinal da SEGUNDA derivada. Derivamos duas vezes.',
          tex: `f'(x) = ${f.derivar().paraTex()} \\qquad f''(x) = ${f.derivar().derivar().paraTex()}`,
        },
        {
          descricao: 'f″ é do 1º grau: troca de sinal exatamente onde zera.',
          tex: `${6 * a}x ${2 * b >= 0 ? '+' : '-'} ${Math.abs(2 * b)} = 0 \\;\\Rightarrow\\; x = ${numeroEmTex(gabarito)}`,
          nota: 'Numa cúbica a inflexão fica sempre no meio dos dois pontos críticos, quando eles existem.',
        },
      ],
    },
    conceitos: ['aplic-derivada.concavidade'],
    armadilhas: semColisoes(
      [
        {
          resposta: -b / a,
          diagnostico: `Faltou derivar o termo ${a}x³ duas vezes: dá ${6 * a}x, e o termo ${b}x² dá ${2 * b}.`,
          passo: 0,
          conceito: 'aplic-derivada.concavidade',
        },
        {
          resposta: b / (3 * a),
          diagnostico: 'Sinal trocado ao isolar x em f″ = 0.',
          passo: 1,
          conceito: 'aplic-derivada.concavidade',
        },
      ],
      gabarito,
      proximos,
    ),
    dica: 'Inflexão é onde f″ troca de sinal. Derive duas vezes e resolva f″(x) = 0.',
  };
}
