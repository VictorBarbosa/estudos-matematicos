import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { Polinomio, formatar } from '@core/math/algebra/polinomio/polinomio';

/**
 * Produtos notáveis.
 *
 * Cada identidade é demonstrada pela distributiva e, quando possível, pela
 * área de um quadrado — a imagem geométrica é o que explica de onde vem o
 * termo do meio que tanta gente esquece.
 */

export type TipoProdutoNotavel =
  'quadrado-da-soma' | 'quadrado-da-diferenca' | 'diferenca-de-quadrados' | 'cubo-da-soma';

export const NOME_PRODUTO: Readonly<Record<TipoProdutoNotavel, string>> = {
  'quadrado-da-soma': 'Quadrado da soma',
  'quadrado-da-diferenca': 'Quadrado da diferença',
  'diferenca-de-quadrados': 'Diferença de quadrados',
  'cubo-da-soma': 'Cubo da soma',
};

/** A forma compacta, por exemplo (2x + 3)². */
export function enunciadoParaTex(tipo: TipoProdutoNotavel, a: number, b: number): string {
  const termoA = a === 1 ? 'x' : `${formatar(a)}x`;
  const termoB = formatar(Math.abs(b));
  const sinal = b >= 0 ? '+' : '-';

  switch (tipo) {
    case 'quadrado-da-soma':
    case 'quadrado-da-diferenca':
      return `\\left(${termoA} ${sinal} ${termoB}\\right)^{2}`;
    case 'diferenca-de-quadrados':
      return `\\left(${termoA} + ${termoB}\\right)\\left(${termoA} - ${termoB}\\right)`;
    case 'cubo-da-soma':
      return `\\left(${termoA} ${sinal} ${termoB}\\right)^{3}`;
  }
}

/** Expande o produto notável mostrando a distributiva por trás da regra. */
export function expandirComPassos(
  tipo: TipoProdutoNotavel,
  a: number,
  b: number,
): Resolucao<Polinomio> {
  const termoA = a === 1 ? 'x' : `${formatar(a)}x`;
  const termoB = formatar(Math.abs(b));

  switch (tipo) {
    case 'quadrado-da-soma':
    case 'quadrado-da-diferenca': {
      // (ax + b)² = a²x² + 2abx + b², com b negativo cobrindo a diferença.
      const resultado = Polinomio.de(b * b, 2 * a * b, a * a);
      const sinalMeio = 2 * a * b >= 0 ? '+' : '-';

      return {
        resultado,
        passos: [
          {
            descricao: 'Um quadrado é o produto do binômio por ele mesmo.',
            tex: `${enunciadoParaTex(tipo, a, b)} = \\left(${termoA} ${b >= 0 ? '+' : '-'} ${termoB}\\right)\\left(${termoA} ${b >= 0 ? '+' : '-'} ${termoB}\\right)`,
          },
          {
            descricao: 'Distribuímos cada termo do primeiro parêntese sobre o segundo.',
            tex:
              `= ${formatar(a * a)}x^{2} ${sinalMeio} ${formatar(Math.abs(a * b))}x ` +
              `${sinalMeio} ${formatar(Math.abs(a * b))}x + ${formatar(b * b)}`,
            nota: 'Os dois termos do meio são iguais — é daí que sai o "2ab".',
          },
          {
            descricao: 'Somando os termos semelhantes, chegamos à identidade.',
            tex: `= ${resultado.paraTex()}`,
            nota: 'O termo do meio é o que se perde ao escrever, erradamente, apenas a² + b².',
          },
          {
            descricao: 'Geometricamente, é a área de um quadrado de lado (a + b).',
            tex: '(a+b)^{2} = a^{2} + \\underbrace{ab + ab}_{2ab} + b^{2}',
            nota: 'Dois retângulos de área ab aparecem nos cantos — eles são o termo do meio.',
          },
        ],
      };
    }

    case 'diferenca-de-quadrados': {
      const resultado = Polinomio.de(-(b * b), 0, a * a);

      return {
        resultado,
        passos: [
          {
            descricao: 'Partimos do produto da soma pela diferença.',
            tex: enunciadoParaTex(tipo, a, b),
          },
          {
            descricao: 'Distribuindo, os termos cruzados aparecem com sinais opostos.',
            tex:
              `= ${formatar(a * a)}x^{2} - ${formatar(Math.abs(a * b))}x + ` +
              `${formatar(Math.abs(a * b))}x - ${formatar(b * b)}`,
          },
          {
            descricao: 'Eles se cancelam, e sobra apenas a diferença dos quadrados.',
            tex: `= ${resultado.paraTex()}`,
            nota: 'Esta é a única identidade em que o termo do meio desaparece.',
          },
        ],
      };
    }

    case 'cubo-da-soma': {
      const resultado = Polinomio.de(b ** 3, 3 * a * b * b, 3 * a * a * b, a ** 3);

      return {
        resultado,
        passos: [
          {
            descricao: 'O cubo é o quadrado multiplicado mais uma vez pelo binômio.',
            tex: `${enunciadoParaTex(tipo, a, b)} = \\left(${termoA} ${b >= 0 ? '+' : '-'} ${termoB}\\right)^{2}\\left(${termoA} ${b >= 0 ? '+' : '-'} ${termoB}\\right)`,
          },
          {
            descricao: 'Expandimos o quadrado primeiro.',
            tex: `= \\left(${Polinomio.de(b * b, 2 * a * b, a * a).paraTex()}\\right)\\left(${termoA} ${b >= 0 ? '+' : '-'} ${termoB}\\right)`,
          },
          {
            descricao: 'E distribuímos de novo, agrupando os termos semelhantes.',
            tex: `= ${resultado.paraTex()}`,
            nota: 'Os coeficientes 1, 3, 3, 1 são a quarta linha do triângulo de Pascal.',
          },
        ],
      };
    }
  }
}
