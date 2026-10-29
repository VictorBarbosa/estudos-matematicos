import { determinante, multiplicarComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/models/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 1e-6;

type Pergunta = 'det-2x2' | 'det-3x3' | 'entrada-produto' | 'cramer' | 'det-produto';

export const geradorMatrizes: GeradorExercicio<number> = {
  topicoId: 'matrizes-determinantes',
  formatoResposta: 'um número, ex.: -14',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    switch (sortearPergunta(nivel, rng)) {
      case 'det-2x2':
        return exercicioDet2(nivel, rng);
      case 'det-3x3':
        return exercicioDet3(nivel, rng);
      case 'entrada-produto':
        return exercicioEntradaProduto(nivel, rng);
      case 'cramer':
        return exercicioCramer(nivel, rng);
      case 'det-produto':
        return exercicioDetProduto(nivel, rng);
    }
  },

  analisar: analisarNumero,

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(6)).toLocaleString('pt-BR', { maximumFractionDigits: 6 }),
};

function sortearPergunta(nivel: Nivel, rng: Rng): Pergunta {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Pergunta>(['det-2x2', 'entrada-produto']);
    case 'medio':
      return rng.escolher<Pergunta>(['det-3x3', 'entrada-produto', 'cramer']);
    case 'dificil':
      return rng.escolher<Pergunta>(['det-3x3', 'cramer', 'det-produto']);
  }
}

function matrizTex(m: readonly (readonly number[])[]): string {
  const corpo = m.map((linha) => linha.join(' & ')).join(' \\\\ ');
  return `\\begin{pmatrix} ${corpo} \\end{pmatrix}`;
}

function sortearMatriz(ordem: number, rng: Rng): number[][] {
  return Array.from({ length: ordem }, () =>
    Array.from({ length: ordem }, () => rng.inteiro(-5, 6)),
  );
}

function exercicioDet2(nivel: Nivel, rng: Rng): Exercicio<number> {
  const [[a, b], [c, d]] = sortearMatriz(2, rng) as [[number, number], [number, number]];
  const resultado = a * d - b * c;

  return {
    id: `mat-det2-${a}_${b}_${c}_${d}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Qual é o determinante desta matriz?',
    enunciadoTex: matrizTex([
      [a, b],
      [c, d],
    ]),
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'Numa 2×2, o determinante é a diferença dos produtos das diagonais.',
          tex: '\\det = ad - bc',
        },
        {
          descricao: 'Substituindo.',
          tex: `= (${a})(${d}) - (${b})(${c}) = ${a * d} - ${b * c} = ${resultado}`,
        },
        {
          descricao: 'Em módulo, esse valor é a área do paralelogramo formado pelas linhas.',
          tex: `|\\det| = ${Math.abs(resultado)}`,
          nota:
            resultado === 0
              ? 'Zero: as linhas são proporcionais e a transformação achata o plano.'
              : undefined,
        },
      ],
    },
    conceitos: ['matrizes.determinante'],
    armadilhas: semColisoes(
      [
        {
          resposta: a * d + b * c,
          diagnostico:
            'A operação entre os dois produtos é SUBTRAÇÃO, não soma. É a diferença que mede ' +
            'área com sinal.',
          passo: 0,
          conceito: 'matrizes.determinante',
        },
        {
          resposta: a * b - c * d,
          diagnostico:
            'Os produtos são das DIAGONAIS (a·d e b·c), não das linhas. Siga o caminho ' +
            'cruzado.',
          passo: 1,
          conceito: 'matrizes.determinante',
        },
        {
          resposta: a + d,
          diagnostico:
            'Somar a diagonal principal dá o traço da matriz, que é outra coisa — útil, mas ' +
            'não é o determinante.',
          passo: 0,
          conceito: 'matrizes.determinante',
        },
      ],
      resultado,
      proximos,
    ),
    dica: nivel === 'facil' ? 'det = ad − bc' : undefined,
  };
}

function exercicioDet3(nivel: Nivel, rng: Rng): Exercicio<number> {
  const m = sortearMatriz(3, rng);
  const resultado = determinante(m);

  return {
    id: `mat-det3-${m.flat().join('_')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Qual é o determinante desta matriz 3×3?',
    enunciadoTex: matrizTex(m),
    gabarito: resultado,
    resolucao: {
      resultado,
      passos: [
        {
          descricao: 'Expandimos pela primeira linha, alternando os sinais.',
          tex: '\\det A = a_{11}M_{11} - a_{12}M_{12} + a_{13}M_{13}',
        },
        {
          descricao: 'Cada menor é o determinante 2×2 que sobra ao riscar linha e coluna.',
          tex: `M_{11} = ${determinante([
            [m[1]![1]!, m[1]![2]!],
            [m[2]![1]!, m[2]![2]!],
          ])}`,
        },
        {
          descricao: 'Somando as três contribuições.',
          tex: `\\det A = ${resultado}`,
          nota: 'O sinal alternado não é decorativo: ele é o que faz a conta medir volume.',
        },
      ],
    },
    conceitos: ['matrizes.determinante'],
    armadilhas: semColisoes(
      [
        {
          resposta: m[0]![0]! * m[1]![1]! * m[2]![2]!,
          diagnostico:
            'Multiplicar só a diagonal principal não basta. Isso valeria apenas para matrizes ' +
            'triangulares, onde o resto é zero.',
          passo: 0,
          conceito: 'matrizes.determinante',
        },
        {
          resposta: m[0]![0]! + m[1]![1]! + m[2]![2]!,
          diagnostico: 'Essa é a soma da diagonal — o traço, não o determinante.',
          passo: 0,
          conceito: 'matrizes.determinante',
        },
      ],
      resultado,
      proximos,
    ),
  };
}

function exercicioEntradaProduto(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = sortearMatriz(2, rng);
  const b = sortearMatriz(2, rng);

  const { resultado, passos } = multiplicarComPassos(a, b);
  const i = rng.inteiro(0, 1);
  const j = rng.inteiro(0, 1);
  const gabarito = resultado[i]![j]!;

  return {
    id: `mat-prod-${a.flat().join('')}-${b.flat().join('')}-${i}${j}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `No produto A·B, qual é a entrada da linha ${i + 1}, coluna ${j + 1}?`,
    enunciadoTex: `A = ${matrizTex(a)} \\qquad B = ${matrizTex(b)}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        ...passos,
        {
          descricao: `Olhando a posição pedida (${i + 1}, ${j + 1}).`,
          tex:
            `c_{${i + 1}${j + 1}} = (${a[i]![0]})(${b[0]![j]}) + (${a[i]![1]})(${b[1]![j]})` +
            ` = ${gabarito}`,
          nota: 'A linha vem da primeira matriz, a coluna da segunda.',
        },
      ],
    },
    conceitos: ['matrizes.produto'],
    armadilhas: semColisoes(
      [
        {
          resposta: a[i]![j]! * b[i]![j]!,
          diagnostico:
            'Multiplicar entrada por entrada não é produto de matrizes. Cada posição é um ' +
            'produto escalar entre uma linha e uma coluna.',
          passo: 1,
          conceito: 'matrizes.produto',
        },
        {
          resposta: multiplicarComPassos(b, a).resultado[i]![j]!,
          diagnostico:
            'Essa é a entrada de B·A. O produto de matrizes não comuta — a ordem muda o ' +
            'resultado.',
          passo: 0,
          conceito: 'matrizes.produto',
        },
      ],
      gabarito,
      proximos,
    ),
  };
}

function exercicioCramer(nivel: Nivel, rng: Rng): Exercicio<number> {
  // Monta o sistema a partir da solução, para que ela seja inteira.
  const x = rng.inteiro(-6, 6);
  const y = rng.inteiro(-6, 6);

  let a = sortearMatriz(2, rng);
  // Garante determinante não nulo, senão o sistema não tem solução única.
  while (Math.abs(determinante(a)) < 1e-9) {
    a = sortearMatriz(2, rng);
  }

  const constantes = [a[0]![0]! * x + a[0]![1]! * y, a[1]![0]! * x + a[1]![1]! * y];
  const incognita = rng.escolher([0, 1]);
  const gabarito = incognita === 0 ? x : y;

  const principal = determinante(a);
  const substituida = a.map((linha, i) =>
    linha.map((valor, coluna) => (coluna === incognita ? constantes[i]! : valor)),
  );

  return {
    id: `mat-cramer-${a.flat().join('')}-${incognita}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Resolva o sistema por Cramer. Quanto vale ${incognita === 0 ? 'x' : 'y'}?`,
    enunciadoTex:
      `\\begin{cases} ${a[0]![0]}x ${a[0]![1]! >= 0 ? '+' : '-'} ${Math.abs(a[0]![1]!)}y = ${constantes[0]} \\\\ ` +
      `${a[1]![0]}x ${a[1]![1]! >= 0 ? '+' : '-'} ${Math.abs(a[1]![1]!)}y = ${constantes[1]} \\end{cases}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'Calculamos o determinante principal, da matriz dos coeficientes.',
          tex: `D = ${principal}`,
        },
        {
          descricao: `Substituímos a coluna de ${incognita === 0 ? 'x' : 'y'} pelas constantes.`,
          tex: `D_{${incognita === 0 ? 'x' : 'y'}} = ${determinante(substituida)}`,
        },
        {
          descricao: 'Dividimos um pelo outro.',
          tex: `${incognita === 0 ? 'x' : 'y'} = \\frac{${determinante(substituida)}}{${principal}} = ${gabarito}`,
          nota: 'O principal no denominador é o que exige que ele não seja zero.',
        },
      ],
    },
    conceitos: ['matrizes.cramer', 'matrizes.determinante'],
    armadilhas: semColisoes(
      [
        {
          resposta: determinante(substituida),
          diagnostico:
            'Você parou no determinante com a coluna substituída. Falta dividir pelo ' +
            'determinante principal.',
          passo: 2,
          conceito: 'matrizes.cramer',
        },
        {
          resposta: principal / determinante(substituida),
          diagnostico:
            'A divisão está invertida: o principal vai no DENOMINADOR, sempre.',
          passo: 2,
          conceito: 'matrizes.cramer',
        },
      ],
      gabarito,
      proximos,
    ),
  };
}

function exercicioDetProduto(nivel: Nivel, rng: Rng): Exercicio<number> {
  const a = sortearMatriz(2, rng);
  const b = sortearMatriz(2, rng);

  const detA = determinante(a);
  const detB = determinante(b);
  const gabarito = detA * detB;

  return {
    id: `mat-detprod-${a.flat().join('')}-${b.flat().join('')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Qual é o determinante do produto A·B?',
    enunciadoTex: `A = ${matrizTex(a)} \\qquad B = ${matrizTex(b)}`,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'O determinante do produto é o produto dos determinantes.',
          tex: '\\det(AB) = \\det A \\cdot \\det B',
          nota: 'Compor duas transformações multiplica os fatores de área.',
        },
        {
          descricao: 'Calculamos cada um separadamente.',
          tex: `\\det A = ${detA} \\qquad \\det B = ${detB}`,
        },
        {
          descricao: 'Multiplicamos — não é preciso calcular o produto das matrizes.',
          tex: `\\det(AB) = ${detA} \\cdot ${detB} = ${gabarito}`,
        },
      ],
    },
    conceitos: ['matrizes.determinante', 'matrizes.produto'],
    armadilhas: semColisoes(
      [
        {
          resposta: detA + detB,
          diagnostico:
            'Os determinantes se MULTIPLICAM, não se somam: cada transformação multiplica a ' +
            'área pela sua própria taxa.',
          passo: 0,
          conceito: 'matrizes.determinante',
        },
        {
          resposta: detA,
          diagnostico: 'Esse é só o determinante de A. Falta a contribuição de B.',
          passo: 1,
          conceito: 'matrizes.determinante',
        },
      ],
      gabarito,
      proximos,
    ),
  };
}
