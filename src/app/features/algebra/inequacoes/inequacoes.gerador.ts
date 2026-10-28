import { Relacao, resolverInequacaoComPassos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < 1e-9;

const RELACOES: readonly Relacao[] = ['<', '<=', '>', '>='];

const SIMBOLO: Readonly<Record<Relacao, string>> = {
  '<': '<',
  '<=': '\\leq',
  '>': '>',
  '>=': '\\geq',
};

/**
 * Exercícios de inequação do 1º grau.
 *
 * Pedimos a FRONTEIRA do conjunto solução — o número onde a desigualdade vira
 * igualdade. Assim a resposta é objetiva, e a armadilha do sinal invertido
 * aparece como um valor distinto.
 */
export const geradorInequacoes: GeradorExercicio<number> = {
  topicoId: 'inequacoes',
  formatoResposta: 'o valor da fronteira, ex.: 3 ou -1,5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const { a, b, c, relacao } = sortear(nivel, rng);

    const resolucao = resolverInequacaoComPassos(a, b, relacao, c);
    const { fronteira, relacao: relacaoFinal } = resolucao.resultado;

    const coeficiente = a === 1 ? '' : a === -1 ? '-' : String(a);
    const enunciadoTex = `${coeficiente}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)} ${SIMBOLO[relacao]} ${c}`;

    return {
      id: `inequacoes-${nivel}-${a}-${b}-${c}-${relacao}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Resolva a inequação e informe o valor da fronteira do conjunto solução.',
      enunciadoTex,
      gabarito: fronteira,
      resolucao: { resultado: fronteira, passos: resolucao.passos },
      conceitos:
        a < 0
          ? ['inequacoes.inversao', 'inequacoes.conjunto']
          : ['inequacoes.conjunto', 'inequacoes.representacao'],
      armadilhas: semColisoes(
        [
          {
            resposta: (c + b) / a,
            diagnostico:
              `Você somou ${Math.abs(b)} em vez de subtrair ao isolar o termo com x. A operação ` +
              'precisa DESFAZER o que está escrito na inequação.',
            passo: 1,
            conceito: 'inequacoes.conjunto',
          },
          {
            resposta: -fronteira,
            diagnostico:
              a < 0
                ? 'O valor da fronteira ficou com o sinal trocado. Note que dividir por um ' +
                  'coeficiente negativo inverte o SENTIDO da desigualdade, mas o quociente ' +
                  'continua sendo calculado normalmente.'
                : 'O sinal da fronteira está invertido. Confira a divisão pelo coeficiente de x.',
            passo: 2,
            conceito: a < 0 ? 'inequacoes.inversao' : 'inequacoes.conjunto',
          },
        ],
        fronteira,
        proximos,
      ),
      dica:
        a < 0 && nivel !== 'facil'
          ? 'Atenção ao sinal do coeficiente de x antes de dividir.'
          : undefined,
    };
  },

  analisar: (entrada) => {
    const limpo = entrada.trim().replace(/\s/g, '').replace(',', '.');
    return /^[+-]?\d*\.?\d+$/.test(limpo) ? Number(limpo) : null;
  },

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 }),
};

function sortear(nivel: Nivel, rng: Rng): { a: number; b: number; c: number; relacao: Relacao } {
  const relacao = rng.escolher(RELACOES);

  switch (nivel) {
    case 'facil': {
      // Coeficiente positivo: o sentido nunca se inverte.
      const a = rng.inteiro(2, 6);
      const fronteira = rng.inteiro(1, 9);
      const b = rng.inteiro(1, 10);
      return { a, b, c: a * fronteira + b, relacao };
    }
    case 'medio': {
      // Coeficiente pode ser negativo: a inversão entra em cena.
      const a = rng.inteiro(2, 7) * rng.sinal();
      const fronteira = rng.inteiro(-8, 8);
      const b = rng.inteiro(-12, 12);
      return { a, b, c: a * fronteira + b, relacao };
    }
    case 'dificil': {
      // Fronteira fracionária, com coeficiente negativo frequente.
      return {
        a: rng.inteiro(2, 9) * (rng.booleano(0.6) ? -1 : 1),
        b: rng.inteiro(-15, 15),
        c: rng.inteiro(-15, 15),
        relacao,
      };
    }
  }
}
