import { Fracao, resolverLinearComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import {
  Armadilha,
  Exercicio,
  GeradorExercicio,
  Nivel,
  semColisoes,
} from '@core/treino/models/treino.model';

const saoEquivalentes = (a: Fracao, b: Fracao): boolean => a.igualA(b);

/** Constrói a fração da armadilha, ou null quando ela não existe (denominador zero). */
function tentar(construir: () => Fracao): Fracao | null {
  try {
    return construir();
  } catch {
    return null;
  }
}

/** Monta uma armadilha apenas se a resposta errada for representável. */
function armadilha(
  resposta: Fracao | null,
  diagnostico: string,
  passo: number,
): readonly [Armadilha<Fracao>] | readonly [] {
  return resposta === null
    ? []
    : [{ resposta, diagnostico, passo, conceito: 'equacao1.igualdade' }];
}

/**
 * Exercícios de equação do 1º grau.
 *
 * As armadilhas reproduzem os erros de sinal — somar onde se deveria subtrair,
 * trocar a ordem da divisão — que são a causa de quase todo erro no tema.
 */
export const geradorEquacao1: GeradorExercicio<Fracao> = {
  topicoId: 'equacao-primeiro-grau',
  formatoResposta: 'um número ou fração, ex.: 4 ou -3/2',

  gerar(nivel: Nivel, rng: Rng): Exercicio<Fracao> {
    const { a, b, c } = sortear(nivel, rng);

    const resolucao = resolverLinearComPassos(a, b, c);
    const gabarito = resolucao.resultado.raiz;

    return {
      id: `equacao1-${nivel}-${a}-${b}-${c}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Resolva a equação e informe o valor de x.',
      enunciadoTex: `${a === 1 ? '' : a === -1 ? '-' : a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)} = ${c}`,
      gabarito,
      resolucao: { resultado: gabarito, passos: resolucao.passos },
      conceitos: ['equacao1.igualdade', 'equacao1.verificacao'],
      armadilhas: semColisoes(
        [
          // Somou b em vez de subtrair.
          ...armadilha(
            tentar(() => Fracao.criar(c + b, a).simplificar()),
            `Você somou ${Math.abs(b)} em vez de subtrair. Para isolar o termo com x, a ` +
              `operação tem de DESFAZER o que está na equação: se aparece ${b >= 0 ? '+' : '-'}` +
              `${Math.abs(b)}, subtraímos ${b >= 0 ? '' : '-'}${Math.abs(b)} dos dois lados.`,
            1,
          ),
          // Dividiu na ordem errada. Não existe quando o lado direito zera.
          ...armadilha(
            tentar(() => Fracao.criar(a, c - b).simplificar()),
            'A divisão ficou invertida. Dividimos o lado independente PELO coeficiente de x, ' +
              'não o contrário.',
            2,
          ),
          // Esqueceu de dividir pelo coeficiente.
          ...armadilha(
            Fracao.deInteiro(c - b),
            `Falta dividir por ${a}, o coeficiente de x. O que foi encontrado é o valor de ` +
              `${a}x, não o de x.`,
            2,
          ),
        ],
        gabarito,
        saoEquivalentes,
      ),
      dica: nivel === 'facil' ? 'Primeiro isole o termo com x, depois divida.' : undefined,
    };
  },

  analisar: (entrada) => Fracao.analisar(entrada),
  saoEquivalentes,
  formatar: (valor) => valor.toString(),
};

function sortear(nivel: Nivel, rng: Rng): { a: number; b: number; c: number } {
  switch (nivel) {
    case 'facil': {
      // Coeficiente positivo e raiz inteira.
      const a = rng.inteiro(2, 6);
      const raiz = rng.inteiro(1, 10);
      const b = rng.inteiro(1, 12);
      return { a, b, c: a * raiz + b };
    }
    case 'medio': {
      // Coeficiente pode ser negativo; raiz ainda inteira.
      const a = rng.inteiro(2, 9) * rng.sinal();
      const raiz = rng.inteiro(-8, 8);
      const b = rng.inteiro(-15, 15);
      return { a, b, c: a * raiz + b };
    }
    case 'dificil': {
      // Raiz fracionária, que obriga a resposta exata em fração.
      const a = rng.inteiro(2, 12) * rng.sinal();
      const b = rng.inteiro(-20, 20);
      const c = rng.inteiro(-20, 20);
      return { a, b, c };
    }
  }
}
