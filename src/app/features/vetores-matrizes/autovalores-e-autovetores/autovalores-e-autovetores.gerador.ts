import {
  Matriz,
  autovaloresComPassos,
  autovaloresDeTriangular,
  autovetorPara,
  determinante,
  matrizComAutovalores,
  matrizParaTex,
  traco,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';
import { enunciadoTrilingue } from '@core/treino/textos/texto-trilingue';
import {
  DICA_DIRECAO,
  DICA_MAIOR,
  DICA_PRODUTO,
  DICA_SOMA,
  DICA_TRIANGULAR,
  DIRECAO,
  MAIOR,
  PRODUTO,
  SOMA,
  TRIANGULAR,
} from '@features/vetores-matrizes/autovalores-e-autovetores/autovalores-e-autovetores.textos';

// Tudo inteiro por construção: a folga é só do ponto flutuante.
const { saoEquivalentes: proximos, formatar } = numeroComCasas(0, 1e-9);

/**
 * As matrizes de passagem usadas para montar os exercícios.
 *
 * `P = [[1, 1], [k, k+1]]` tem determinante 1 — o que mantém `A = P D P⁻¹`
 * inteira — e colunas `(1, k)` e `(1, k+1)`, que são os autovetores. É daí que
 * a pergunta sobre a direção tem resposta inteira.
 *
 * `k = 0` e `k = -1` ficam de fora porque deixariam a matriz triangular, e aí
 * os autovalores estariam na diagonal: o exercício não cobraria conta nenhuma.
 */
const PASSAGENS = [-3, -2, 1, 2, 3];

type Pergunta = 'soma' | 'produto' | 'maior' | 'direcao' | 'triangular';

/**
 * Autovalores e autovetores — as direções que a matriz não torce.
 *
 * Uma matriz geralmente muda o tamanho e a direção de um vetor. Para algumas
 * direções ela só muda o tamanho, e é isso — e só isso — que `A·v = λ·v` diz.
 * Essas direções são os modos naturais do sistema: as frequências em que uma
 * estrutura vibra sozinha, os eixos principais de inércia, as soluções de uma
 * EDO que crescem sem mudar de forma.
 *
 * Duas das cinco perguntas são as identidades do polinômio característico — a
 * soma dos autovalores é o traço, o produto é o determinante. Elas não são
 * pegadinhas a descobrir: são a ferramenta de conferência, e a dica as entrega
 * de propósito, porque saber verificar a própria resposta vale mais que
 * acertar um exercício.
 */
export const geradorAutovalores: GeradorExercicio<number> = {
  topicoId: 'autovalores-e-autovetores',
  formatoResposta: 'um número inteiro',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'produto':
        return exercicioProduto(nivel, rng);
      case 'maior':
        return exercicioMaior(nivel, rng);
      case 'direcao':
        return exercicioDirecao(nivel, rng);
      case 'triangular':
        return exercicioTriangular(nivel, rng);
      default:
        return exercicioSoma(nivel, rng);
    }
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar,
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['soma', 'triangular']);
    case 'medio':
      return rng.escolher<Pergunta>(['soma', 'produto', 'maior']);
    case 'dificil':
      return rng.escolher<Pergunta>(['maior', 'direcao', 'produto']);
    // Achar a direção exige resolver o sistema homogêneo, e é a única pergunta
    // em que o autovetor aparece de verdade.
    case 'extremo':
      return rng.escolher<Pergunta>(['direcao', 'maior']);
  }
}

/** Uma matriz 2×2 inteira, não triangular, de autovalores inteiros e distintos. */
function sortearMatriz(rng: Rng): {
  matriz: Matriz;
  maior: number;
  menor: number;
  k: number;
} {
  const primeiro = rng.inteiro(2, 8);
  const segundoBruto = rng.inteiro(-3, 5);
  const segundo = segundoBruto === primeiro ? segundoBruto - 1 : segundoBruto;

  const k = rng.escolher(PASSAGENS);
  const matriz = matrizComAutovalores(primeiro, segundo, [
    [1, 1],
    [k, k + 1],
  ])!;

  return {
    matriz,
    maior: Math.max(primeiro, segundo),
    menor: Math.min(primeiro, segundo),
    k,
  };
}

function exercicioSoma(nivel: Nivel, rng: Rng): Exercicio<number> {
  const { matriz, maior, menor } = sortearMatriz(rng);
  const resultado = maior + menor;

  const texto = enunciadoTrilingue(SOMA, [], DICA_SOMA);
  const { passos } = autovaloresComPassos(matriz)!;

  return {
    id: `auto-soma-${matriz.flat().join('_')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: matrizParaTex(matriz),
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['autovalor.definicao', 'autovalor.identidades'],
    armadilhas: semColisoes(
      [
        {
          resposta: determinante(matriz),
          diagnostico:
            'Esse é o determinante, que é o PRODUTO dos autovalores. A soma deles é o traço — ' +
            'a soma da diagonal.',
          passo: 5,
          conceito: 'autovalor.identidades',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioProduto(nivel: Nivel, rng: Rng): Exercicio<number> {
  const { matriz, maior, menor } = sortearMatriz(rng);
  const resultado = maior * menor;

  const texto = enunciadoTrilingue(PRODUTO, [], DICA_PRODUTO);
  const { passos } = autovaloresComPassos(matriz)!;

  return {
    id: `auto-produto-${matriz.flat().join('_')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: matrizParaTex(matriz),
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['autovalor.identidades', 'autovalor.definicao'],
    armadilhas: semColisoes(
      [
        {
          resposta: traco(matriz),
          diagnostico:
            'Esse é o traço, que é a SOMA dos autovalores. O produto deles é o determinante.',
          passo: 5,
          conceito: 'autovalor.identidades',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioMaior(nivel: Nivel, rng: Rng): Exercicio<number> {
  const { matriz, maior, menor } = sortearMatriz(rng);

  const texto = enunciadoTrilingue(MAIOR, [], DICA_MAIOR);
  const { passos } = autovaloresComPassos(matriz)!;

  return {
    id: `auto-maior-${matriz.flat().join('_')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: matrizParaTex(matriz),
    gabarito: maior,
    resolucao: { resultado: maior, passos },
    conceitos: ['autovalor.polinomio', 'autovalor.definicao'],
    armadilhas: semColisoes(
      [
        {
          resposta: menor,
          diagnostico:
            'Esse é o OUTRO autovalor, o menor. As duas raízes estão certas; a pergunta pede ' +
            'a maior.',
          passo: 4,
          conceito: 'autovalor.polinomio',
        },
        {
          // Quem erra o sinal do termo linear resolve λ² + trλ + det = 0.
          resposta: -maior,
          diagnostico:
            'O sinal do termo em λ está trocado. No polinômio característico ele é MENOS o ' +
            'traço: λ² − tr·λ + det = 0.',
          passo: 3,
          conceito: 'autovalor.polinomio',
        },
      ],
      maior,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioDirecao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const { matriz, maior, menor, k } = sortearMatriz(rng);

  // A coluna de P associada ao autovalor é (1, k) para o primeiro e (1, k+1)
  // para o segundo; qual é qual depende de quem é o maior.
  const escolheMaior = rng.booleano();
  const autovalor = escolheMaior ? maior : menor;
  const vetor = autovetorPara(matriz, autovalor)!;

  // O representante reduzido pode vir multiplicado: o k pedido é a razão.
  const resultado = vetor[1]! / vetor[0]!;

  const texto = enunciadoTrilingue(DIRECAO, [autovalor], DICA_DIRECAO);
  const { passos } = autovaloresComPassos(matriz)!;

  const [[a, b]] = [matriz[0]!] as [readonly number[]];

  return {
    id: `auto-direcao-${matriz.flat().join('_')}-${autovalor}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: matrizParaTex(matriz),
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        ...passos,
        {
          descricao: `Para λ = ${autovalor}, a primeira linha de (A − λI)v = 0 já resolve.`,
          tex: `(${a!} - ${autovalor}) \\cdot 1 + ${b!}k = 0`,
          nota: 'Uma linha basta: as duas são proporcionais, e é isso que faz o sistema ter solução.',
        },
        {
          descricao: 'Isolando k.',
          tex: `k = \\frac{${autovalor} - ${a!}}{${b!}} = ${resultado}`,
          nota: `O autovetor é (1, ${resultado}) — e qualquer múltiplo dele, porque o que importa é a direção.`,
        },
      ],
    },
    conceitos: ['autovalor.autovetor', 'autovalor.definicao'],
    armadilhas: semColisoes(
      [
        {
          // Sinal trocado na subtração: (a − λ)/b em vez de (λ − a)/b.
          resposta: -resultado,
          diagnostico:
            'O sinal está trocado. A equação é (a − λ)·1 + b·k = 0, e isolar k deixa ' +
            '(λ − a) em cima.',
          passo: 7,
          conceito: 'autovalor.autovetor',
        },
        {
          resposta: autovalor,
          diagnostico:
            'Esse é o autovalor, não a coordenada do autovetor. O autovalor diz quanto a ' +
            'matriz ESTICA; o autovetor diz em que direção.',
          passo: 6,
          conceito: 'autovalor.autovetor',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}

function exercicioTriangular(nivel: Nivel, rng: Rng): Exercicio<number> {
  const diagonal = [rng.inteiro(-4, 9), rng.inteiro(-4, 9), rng.inteiro(-4, 9)];

  const matriz: Matriz = [
    [diagonal[0]!, rng.inteiro(-5, 5), rng.inteiro(-5, 5)],
    [0, diagonal[1]!, rng.inteiro(-5, 5)],
    [0, 0, diagonal[2]!],
  ];

  const valores = autovaloresDeTriangular(matriz)!;
  const resultado = valores[0]!;

  const texto = enunciadoTrilingue(TRIANGULAR, [], DICA_TRIANGULAR);

  return {
    id: `auto-triangular-${diagonal.join('_')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: texto.enunciado,
    traducoes: texto.traducoes,
    enunciadoTex: matrizParaTex(matriz),
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'Numa matriz triangular, det(A − λI) é o produto da diagonal deslocada.',
          tex: `(${diagonal[0]!} - \\lambda)(${diagonal[1]!} - \\lambda)(${diagonal[2]!} - \\lambda) = 0`,
          nota: 'Os zeros de um lado da diagonal fazem o determinante virar um produto só.',
        },
        {
          descricao: 'As raízes são a própria diagonal, sem conta nenhuma.',
          tex: `\\lambda \\in \\{${[...diagonal].sort((x, y) => y - x).join(', ')}\\}`,
        },
        {
          descricao: 'A maior delas.',
          tex: `\\lambda_{\\max} = ${resultado}`,
          nota: 'É por isso que diagonalizar vale o esforço: do outro lado, a resposta é de leitura.',
        },
      ],
    },
    conceitos: ['autovalor.triangular', 'autovalor.polinomio'],
    armadilhas: semColisoes(
      [
        {
          resposta: diagonal.reduce((soma, valor) => soma + valor, 0),
          diagnostico:
            'Essa é a soma da diagonal — o traço, que é a soma dos TRÊS autovalores. A ' +
            'pergunta quer só o maior deles.',
          passo: 2,
          conceito: 'autovalor.triangular',
        },
        {
          resposta: diagonal[0]!,
          diagnostico:
            'Esse é o primeiro elemento da diagonal, não o maior. Os três são autovalores: ' +
            'compare-os.',
          passo: 3,
          conceito: 'autovalor.triangular',
        },
      ],
      resultado,
      proximos,
    ),
    dica: texto.dica,
  };
}
