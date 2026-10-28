import { No, avaliar, expressaoParaTex, numero, op, resolverExpressaoComPassos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const saoIguais = (a: number, b: number): boolean => Math.abs(a - b) < 1e-9;

/**
 * Exercícios de ordem das operações.
 *
 * A armadilha central é sempre a mesma: resolver da esquerda para a direita,
 * ignorando a precedência. Ela é calculada avaliando a mesma expressão numa
 * árvore remontada linearmente — ou seja, exatamente o que o aluno faria.
 */
export const geradorOperacoes: GeradorExercicio<number> = {
  topicoId: 'operacoes-fundamentais',
  formatoResposta: 'um número, ex.: 14 ou -3',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const { arvore, termos } = sortearExpressao(nivel, rng);

    const resolucao = resolverExpressaoComPassos(arvore);
    const gabarito = resolucao.resultado;
    const daEsquerdaParaDireita = avaliarLinearmente(termos);

    return {
      id: `operacoes-${nivel}-${rng.inteiro(0, 99999)}`,
      nivel,
      enunciado: 'Resolva respeitando a ordem das operações.',
      enunciadoTex: `${expressaoParaTex(arvore)} = \;?`,
      gabarito,
      resolucao,
      conceitos: ['operacoes.ordem', 'operacoes.sinais'],
      armadilhas: semColisoes(
        [
          {
            resposta: daEsquerdaParaDireita,
            diagnostico:
              'Você resolveu da esquerda para a direita, na ordem em que a expressão aparece. ' +
              'Multiplicação, divisão e potências têm prioridade sobre adição e subtração, ' +
              'independentemente da posição em que estão escritas.',
            passo: 1,
            conceito: 'operacoes.ordem',
          },
        ],
        gabarito,
        saoIguais,
      ),
      dica: nivel === 'facil' ? 'O que deve ser resolvido primeiro nessa expressão?' : undefined,
    };
  },

  analisar: (entrada) => {
    const limpo = entrada.trim().replace(/\s/g, '').replace(',', '.');
    return /^[+-]?\d*\.?\d+$/.test(limpo) ? Number(limpo) : null;
  },

  saoEquivalentes: saoIguais,
  formatar: (valor) =>
    Number(valor.toFixed(6)).toLocaleString('pt-BR', { maximumFractionDigits: 6 }),
};

/** Um termo da expressão, guardado na ordem em que foi escrito. */
interface Termo {
  readonly operador: '+' | '-' | '*' | '/';
  readonly valor: No;
}

interface ExpressaoSorteada {
  readonly arvore: No;
  /** Primeiro valor e a sequência de operações, para simular a leitura linear. */
  readonly termos: { readonly inicial: No; readonly seguintes: readonly Termo[] };
}

function sortearExpressao(nivel: Nivel, rng: Rng): ExpressaoSorteada {
  const pequeno = (): number => rng.inteiro(2, 9);

  if (nivel === 'facil') {
    // a + b × c — o caso mínimo em que a precedência muda o resultado.
    const [a, b, c] = [pequeno(), pequeno(), pequeno()];
    const operador = rng.booleano() ? '+' : '-';
    const arvore = op(operador, numero(a), op('*', numero(b), numero(c)));

    return {
      arvore,
      termos: {
        inicial: numero(a),
        seguintes: [
          { operador, valor: numero(b) },
          { operador: '*', valor: numero(c) },
        ],
      },
    };
  }

  if (nivel === 'medio') {
    // a + b × c - d, ou com parênteses conduzindo a outra leitura.
    const [a, b, c, d] = [pequeno(), pequeno(), pequeno(), pequeno()];

    if (rng.booleano()) {
      const arvore = op('-', op('+', numero(a), op('*', numero(b), numero(c))), numero(d));
      return {
        arvore,
        termos: {
          inicial: numero(a),
          seguintes: [
            { operador: '+', valor: numero(b) },
            { operador: '*', valor: numero(c) },
            { operador: '-', valor: numero(d) },
          ],
        },
      };
    }

    const arvore = op('*', op('+', numero(a), numero(b)), numero(c));
    return {
      arvore,
      termos: {
        inicial: numero(a),
        seguintes: [
          { operador: '+', valor: numero(b) },
          { operador: '*', valor: numero(c) },
        ],
      },
    };
  }

  // Difícil: potência e parênteses na mesma expressão.
  const [a, b, c, d] = [pequeno(), rng.inteiro(2, 6), rng.inteiro(1, 4), pequeno()];
  const potencia = op('^', op('-', numero(b), numero(c)), numero(2));
  const arvore = op('+', numero(a), op('*', numero(d), potencia));

  return {
    arvore,
    termos: {
      inicial: numero(a),
      seguintes: [
        { operador: '+', valor: numero(d) },
        { operador: '*', valor: potencia },
      ],
    },
  };
}

/**
 * Avalia ignorando a precedência, como quem lê a conta da esquerda para a
 * direita. É exatamente o erro que a armadilha quer reconhecer.
 */
function avaliarLinearmente({ inicial, seguintes }: ExpressaoSorteada['termos']): number {
  return seguintes.reduce((acumulado, termo) => {
    const valor = avaliar(termo.valor);
    switch (termo.operador) {
      case '+':
        return acumulado + valor;
      case '-':
        return acumulado - valor;
      case '*':
        return acumulado * valor;
      case '/':
        return valor === 0 ? acumulado : acumulado / valor;
    }
  }, avaliar(inicial));
}
