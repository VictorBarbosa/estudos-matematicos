import { Polinomio, TipoProdutoNotavel, enunciadoParaTex, expandirComPassos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

/**
 * Exercícios de produtos notáveis.
 *
 * A resposta pedida é o COEFICIENTE DO TERMO DO MEIO — justamente o que se
 * perde quando alguém escreve (a+b)² = a² + b². Um único número mantém a
 * correção objetiva e aponta direto para o erro clássico.
 */
export const geradorProdutos: GeradorExercicio<number> = {
  topicoId: 'produtos-notaveis',
  formatoResposta: 'um número inteiro, ex.: 12',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const tipo = sortearTipo(nivel, rng);
    // Fixar a = 1 no fácil deixava o tópico com pouquíssimos produtos.
    const a = nivel === 'facil' ? rng.inteiro(1, 4) : rng.inteiro(1, 9);
    const b = rng.inteiro(1, 14) * (tipo === 'quadrado-da-diferenca' ? -1 : 1);

    const resolucao = expandirComPassos(tipo, a, b);
    const expandido = resolucao.resultado;

    // Em todos os casos perguntamos pelo coeficiente de x.
    const gabarito = expandido.coeficiente(1);

    return {
      id: `produtos-${tipo}-${a}-${b}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        tipo === 'diferenca-de-quadrados'
          ? 'Expanda e informe o coeficiente de x no resultado.'
          : 'Expanda e informe o coeficiente do termo em x (o termo do meio).',
      enunciadoTex: `${enunciadoParaTex(tipo, a, b)} = \;?`,
      gabarito,
      resolucao: { resultado: gabarito, passos: resolucao.passos },
      conceitos: [conceitoDe(tipo)],
      armadilhas: semColisoes(
        [
          {
            resposta: 0,
            diagnostico:
              'Zero seria o caso de a identidade não ter termo do meio — o que só acontece na ' +
              'diferença de quadrados. No quadrado de um binômio, os dois termos cruzados se ' +
              'SOMAM em vez de se cancelar.',
            passo: 2,
            conceito: 'produtos.quadrado',
          },
          {
            resposta: a * b,
            diagnostico:
              'Você contou o termo cruzado uma vez só. Na distribuição ele aparece DUAS vezes ' +
              `— por isso o coeficiente é 2ab = ${2 * a * b}, e não ab.`,
            passo: 1,
            conceito: 'produtos.quadrado',
          },
          {
            resposta: -2 * a * b,
            diagnostico:
              'O sinal do termo do meio acompanha o sinal da parcela do binômio. Confira se ' +
              'está diante de uma soma ou de uma diferença.',
            passo: 2,
            conceito: 'produtos.quadrado',
          },
        ],
        gabarito,
        (x, y) => x === y,
      ),
      dica:
        nivel === 'facil'
          ? 'Multiplique o binômio por ele mesmo e some os termos semelhantes.'
          : undefined,
    };
  },

  analisar: (entrada) => {
    const limpo = entrada.trim().replace(/\s/g, '').replace(',', '.');
    return /^[+-]?\d*\.?\d+$/.test(limpo) ? Number(limpo) : null;
  },

  saoEquivalentes: (a, b) => a === b,
  formatar: (valor) => String(valor),
};

function sortearTipo(nivel: Nivel, rng: Rng): TipoProdutoNotavel {
  switch (nivel) {
    case 'facil':
      return rng.escolher<TipoProdutoNotavel>(['quadrado-da-soma', 'quadrado-da-diferenca']);
    case 'medio':
      return rng.escolher<TipoProdutoNotavel>([
        'quadrado-da-soma',
        'quadrado-da-diferenca',
        'diferenca-de-quadrados',
      ]);
    case 'dificil':
      return rng.escolher<TipoProdutoNotavel>([
        'quadrado-da-soma',
        'diferenca-de-quadrados',
        'cubo-da-soma',
      ]);
  }
}

function conceitoDe(tipo: TipoProdutoNotavel): string {
  switch (tipo) {
    case 'diferenca-de-quadrados':
      return 'produtos.diferenca-de-quadrados';
    case 'cubo-da-soma':
      return 'produtos.cubo';
    default:
      return 'produtos.quadrado';
  }
}

/** Reexportado para o componente montar a grade de identidades. */
export const TIPOS_DISPONIVEIS: readonly TipoProdutoNotavel[] = [
  'quadrado-da-soma',
  'quadrado-da-diferenca',
  'diferenca-de-quadrados',
  'cubo-da-soma',
];

export const polinomioDoTipo = (tipo: TipoProdutoNotavel, a: number, b: number): Polinomio =>
  expandirComPassos(tipo, a, b).resultado;
