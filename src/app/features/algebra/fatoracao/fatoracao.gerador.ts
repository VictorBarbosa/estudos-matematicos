import { Polinomio, fatorarComPassos, formatar, mdc } from '@core/math';
import { Rng } from '@core/treino/rng';
import { analisarNumero, numeroComCasas } from '@core/treino/resposta-numerica';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

/** A mesma tolerância da correção, para não listar armadilhas indistinguíveis. */
const { saoEquivalentes: proximos } = numeroComCasas(2, 1e-4);

/**
 * Exercícios de fatoração.
 *
 * Pedimos a MAIOR das duas raízes que a fatoração revela — um único número
 * que só é possível obter tendo fatorado corretamente.
 */
export const geradorFatoracao: GeradorExercicio<number> = {
  topicoId: 'fatoracao',
  formatoResposta: 'um número inteiro, ex.: 3',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const { polinomio, raizes, tipo } = sortear(nivel, rng);
    const resolucao = fatorarComPassos(polinomio);
    const gabarito = Math.max(...raizes);

    return {
      id: `fatoracao-${nivel}-${polinomio.paraTex()}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        'Fatore a expressão e informe a MAIOR raiz, ou seja, o maior valor de x que a anula.',
      enunciadoTex: `${polinomio.paraTex()} = 0`,
      gabarito,
      resolucao: {
        resultado: gabarito,
        // A fatoração é o meio; a pergunta é pela raiz. Sem este passo, a
        // resolução parava na forma fatorada e não respondia o que foi pedido.
        passos: [
          ...resolucao.passos,
          {
            descricao: 'Cada fator nulo dá uma raiz; o enunciado pede a maior delas.',
            tex:
              raizes.length > 1
                ? `x = ${formatar(Math.min(...raizes))} \\text{ ou } x = ${formatar(gabarito)}` +
                  ` \\Rightarrow \\max = ${formatar(gabarito)}`
                : `x = ${formatar(gabarito)}`,
          },
        ],
      },
      conceitos: ['fatoracao.ideia', tipo],
      armadilhas: semColisoes(
        [
          {
            resposta: Math.min(...raizes),
            diagnostico:
              'Essa é a menor das raízes. As duas anulam a expressão, mas o enunciado pede a maior.',
            passo: 1,
            conceito: 'fatoracao.ideia',
          },
          {
            // Trocou o sinal: leu o fator (x − 3) como raiz −3.
            resposta: -Math.max(...raizes),
            diagnostico:
              'O sinal está invertido. No fator (x − r), a raiz é +r, porque é esse valor que ' +
              'faz o fator valer zero. Confira substituindo de volta.',
            passo: 1,
            conceito: 'fatoracao.ideia',
          },
        ],
        gabarito,
        proximos,
      ),
      dica:
        nivel === 'facil'
          ? 'Procure dois números cuja soma e produto batam com a expressão.'
          : undefined,
    };
  },

  analisar: analisarNumero,

  ...numeroComCasas(2, 1e-4),
};

interface Sorteio {
  readonly polinomio: Polinomio;
  readonly raizes: readonly number[];
  readonly tipo: string;
}

function sortear(nivel: Nivel, rng: Rng): Sorteio {
  switch (nivel) {
    case 'facil': {
      // Trinômio simples com raízes inteiras distintas.
      let r1 = rng.inteiro(1, 20);
      let r2 = rng.inteiro(1, 20);
      if (r1 === r2) {
        r2 = r1 + 1;
      }
      return {
        polinomio: Polinomio.de(r1 * r2, -(r1 + r2), 1),
        raizes: [r1, r2],
        tipo: 'fatoracao.trinomio',
      };
    }
    case 'medio': {
      if (rng.booleano()) {
        // Diferença de quadrados.
        const k = rng.inteiro(1, 12);
        const a = rng.inteiro(1, 9);
        return {
          polinomio: Polinomio.de(-(k * k), 0, a * a),
          raizes: [k / a, -k / a],
          tipo: 'fatoracao.diferenca',
        };
      }
      // Trinômio com raízes de sinais diferentes.
      const r1 = rng.inteiro(-14, -1);
      const r2 = rng.inteiro(1, 7);
      return {
        polinomio: Polinomio.de(r1 * r2, -(r1 + r2), 1),
        raizes: [r1, r2],
        tipo: 'fatoracao.trinomio',
      };
    }
    case 'dificil': {
      // Fator comum somado a um trinômio: exige as duas técnicas em sequência.
      const comum = rng.inteiro(2, 5);
      const r1 = rng.inteiro(-6, 6);
      let r2 = rng.inteiro(-6, 6);
      if (r1 === r2) {
        r2 = r1 + 1;
      }

      const base = Polinomio.de(r1 * r2, -(r1 + r2), 1).escalar(comum);
      return { polinomio: base, raizes: [r1, r2], tipo: 'fatoracao.trinomio' };
    }
  }
}

/** O maior fator inteiro comum aos coeficientes, usado pelo componente. */
export function fatorComum(polinomio: Polinomio): number {
  const naoNulos = polinomio.coeficientes
    .filter((c) => c !== 0)
    .map((c) => Math.abs(Math.round(c)));
  return naoNulos.length === 0 ? 1 : naoNulos.reduce((acumulado, valor) => mdc(acumulado, valor));
}
