import { resolverQuadraticaComPassos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { Exercicio, GeradorExercicio, Nivel, semColisoes } from '@core/treino/treino.model';

const TOLERANCIA = 1e-9;
const proximos = (a: number, b: number): boolean => Math.abs(a - b) < TOLERANCIA;

/**
 * Exercícios de equação do 2º grau.
 *
 * Pedimos a MAIOR raiz, ou o discriminante quando não há raízes reais, para
 * que a resposta seja sempre um único número — e a correção, objetiva.
 */
export const geradorEquacao2: GeradorExercicio<number> = {
  topicoId: 'equacao-segundo-grau',
  formatoResposta: 'um número, ex.: 3 ou -1,5',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const { a, b, c } = sortear(nivel, rng);
    const resolucao = resolverQuadraticaComPassos(a, b, c);
    const { delta, raizes } = resolucao.resultado;

    const equacaoTex = montarEquacao(a, b, c);
    const semRaizes = raizes.length === 0;

    const gabarito = semRaizes ? delta : Math.max(...raizes);

    return {
      id: `equacao2-${nivel}-${a}-${b}-${c}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: semRaizes
        ? 'Esta equação não tem raízes reais. Informe o valor do discriminante Δ.'
        : 'Resolva a equação e informe a MAIOR raiz.',
      enunciadoTex: `${equacaoTex} = 0`,
      gabarito,
      resolucao: { resultado: gabarito, passos: resolucao.passos },
      conceitos: semRaizes
        ? ['equacao2.discriminante']
        : ['equacao2.bhaskara', 'equacao2.discriminante'],
      armadilhas: semRaizes
        ? semColisoes(
            [
              {
                resposta: b * b + 4 * a * c,
                diagnostico:
                  'O discriminante é b² − 4ac, com SUBTRAÇÃO. Trocar o sinal muda completamente ' +
                  'a conclusão sobre o número de raízes.',
                passo: 1,
                conceito: 'equacao2.discriminante',
              },
            ],
            gabarito,
            proximos,
          )
        : semColisoes(
            [
              {
                resposta: Math.min(...raizes),
                diagnostico:
                  'Essa é a MENOR raiz. As duas estão corretas como solução da equação, mas o ' +
                  'enunciado pede a maior delas.',
                passo: 2,
                conceito: 'equacao2.bhaskara',
              },
              {
                // Esqueceu o 2a do denominador.
                resposta: -b + Math.sqrt(delta),
                diagnostico:
                  `Faltou dividir por 2a. A fórmula inteira é (−b ± √Δ) / 2a, e aqui ` +
                  `2a = ${2 * a}.`,
                passo: 2,
                conceito: 'equacao2.bhaskara',
              },
              {
                // Esqueceu de trocar o sinal de b.
                resposta: (b + Math.sqrt(Math.max(0, delta))) / (2 * a),
                diagnostico:
                  'O numerador começa com −b, e não com b. Se b já é negativo, −b fica ' +
                  'positivo — é um dos erros de sinal mais frequentes do tema.',
                passo: 2,
                conceito: 'equacao2.bhaskara',
              },
            ],
            gabarito,
            proximos,
          ),
      dica: nivel === 'facil' ? 'Calcule o discriminante antes de aplicar a fórmula.' : undefined,
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

function montarEquacao(a: number, b: number, c: number): string {
  const termoA = a === 1 ? 'x^{2}' : a === -1 ? '-x^{2}' : `${a}x^{2}`;
  const termoB = b === 0 ? '' : ` ${b > 0 ? '+' : '-'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x`;
  const termoC = c === 0 ? '' : ` ${c > 0 ? '+' : '-'} ${Math.abs(c)}`;

  return `${termoA}${termoB}${termoC}`;
}

function sortear(nivel: Nivel, rng: Rng): { a: number; b: number; c: number } {
  switch (nivel) {
    case 'facil': {
      // Construída a partir de raízes inteiras, com a = 1.
      const r1 = rng.inteiro(-6, 6);
      const r2 = rng.inteiro(-6, 6);
      return { a: 1, b: -(r1 + r2), c: r1 * r2 };
    }
    case 'medio': {
      // Coeficiente líder diferente de 1, ainda com raízes exatas.
      const a = rng.escolher([1, 2, 3, -1, -2]);
      const r1 = rng.inteiro(-5, 5);
      const r2 = rng.inteiro(-5, 5);
      return { a, b: -a * (r1 + r2), c: a * r1 * r2 };
    }
    case 'dificil': {
      // Coeficientes livres: aparecem raízes irracionais e casos sem raiz real.
      return {
        a: rng.inteiro(1, 4) * rng.sinal(),
        b: rng.inteiro(-10, 10),
        c: rng.inteiro(-12, 12),
      };
    }
  }
}
