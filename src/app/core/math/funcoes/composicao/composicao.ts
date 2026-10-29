import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos/tipos';
import { formatar } from '@core/math/algebra/polinomio/polinomio';

/**
 * Composição e função inversa.
 *
 * Compor é encadear: a saída de uma função vira a entrada da outra. Inverter
 * é desfazer o encadeamento — e por isso só funções que não repetem valores
 * têm inversa.
 */

export interface Afim {
  readonly a: number;
  readonly b: number;
}

export function afimParaTex({ a, b }: Afim, nome = 'f', variavel = 'x'): string {
  const coeficiente = a === 1 ? '' : a === -1 ? '-' : formatar(a);
  const termo = b === 0 ? '' : ` ${b > 0 ? '+' : '-'} ${formatar(Math.abs(b))}`;
  return `${nome}(${variavel}) = ${coeficiente}${variavel}${termo}`;
}

/** f(g(x)) para duas funções afins, que também é afim. */
export function comporComPassos(f: Afim, g: Afim): Resolucao<Afim> {
  const resultado: Afim = { a: f.a * g.a, b: f.a * g.b + f.b };

  return {
    resultado,
    passos: [
      {
        descricao: 'Partimos das duas funções.',
        tex: `${afimParaTex(f, 'f')} \\qquad ${afimParaTex(g, 'g')}`,
      },
      {
        descricao: 'Compor f com g é substituir TODA a expressão de g no lugar do x de f.',
        tex: `f(g(x)) = ${formatar(f.a)}\\left(${formatar(g.a)}x ${g.b >= 0 ? '+' : '-'} ${formatar(Math.abs(g.b))}\\right) ${f.b >= 0 ? '+' : '-'} ${formatar(Math.abs(f.b))}`,
      },
      {
        descricao: 'Distribuindo e somando os termos constantes.',
        tex: `= ${afimParaTex(resultado, 'f \\circ g').replace('(x) = ', '(x) = ')}`,
        nota: 'A ordem importa: f(g(x)) em geral é diferente de g(f(x)).',
      },
    ],
  };
}

/** A inversa de uma função afim, obtida isolando x. */
export function inverterComPassos(f: Afim): Resolucao<Afim> {
  if (f.a === 0) {
    throw new ErroMatematico(
      'Uma função constante não tem inversa: todos os x levam ao mesmo y, e não há como voltar.',
    );
  }

  const resultado: Afim = { a: 1 / f.a, b: -f.b / f.a };

  return {
    resultado,
    passos: [
      {
        descricao: 'Escrevemos y no lugar de f(x).',
        tex: `y = ${formatar(f.a)}x ${f.b >= 0 ? '+' : '-'} ${formatar(Math.abs(f.b))}`,
      },
      {
        descricao: 'Isolamos x, que é o que a inversa precisa devolver.',
        tex: `x = \\frac{y ${f.b >= 0 ? '-' : '+'} ${formatar(Math.abs(f.b))}}{${formatar(f.a)}}`,
      },
      {
        descricao: 'Trocamos os nomes das variáveis, por convenção.',
        tex: `${afimParaTex(resultado, 'f^{-1}')}`,
        nota: 'A troca de nomes é o que reflete o gráfico na reta y = x.',
      },
      {
        descricao: 'Conferindo: compor a função com sua inversa devolve o próprio x.',
        tex: 'f^{-1}(f(x)) = x',
      },
    ],
  };
}

/** Uma função é injetora se nunca repete valores — condição para ter inversa. */
export function ehInjetora(f: (x: number) => number, xMin: number, xMax: number): boolean {
  const amostras = 200;
  const passo = (xMax - xMin) / amostras;

  let crescendo: boolean | null = null;
  let anterior = f(xMin);

  for (let i = 1; i <= amostras; i++) {
    const atual = f(xMin + i * passo);
    if (!Number.isFinite(atual) || !Number.isFinite(anterior)) {
      anterior = atual;
      continue;
    }

    if (Math.abs(atual - anterior) > 1e-12) {
      const subindo = atual > anterior;
      if (crescendo !== null && subindo !== crescendo) {
        // Mudou de direção: existe um valor atingido duas vezes.
        return false;
      }
      crescendo = subindo;
    }

    anterior = atual;
  }

  return true;
}
