import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos/tipos';
import { Fracao } from '@core/math/numeros/fracao/fracao';
import { formatar } from '@core/math/algebra/polinomio/polinomio';

/**
 * Equação do 1º grau: ax + b = c.
 *
 * A resolução é apresentada como uma sequência de operações aplicadas aos
 * DOIS lados — nada de "passa pro outro lado trocando o sinal", que esconde o
 * que de fato está acontecendo.
 */
export interface SolucaoLinear {
  /** A raiz como fração exata, para evitar dízimas na resposta. */
  readonly raiz: Fracao;
  readonly valor: number;
}

export function resolverLinearComPassos(a: number, b: number, c = 0): Resolucao<SolucaoLinear> {
  if (a === 0) {
    throw new ErroMatematico(
      b === c
        ? 'Com a = 0 e b = c, qualquer x serve: a equação é uma identidade.'
        : 'Com a = 0 e b ≠ c, nenhum x serve: a equação é impossível.',
    );
  }

  const raiz = Fracao.criar(c - b, a).simplificar();
  const passos: Passo[] = [
    {
      descricao: 'Partimos da equação.',
      tex: `${formatar(a)}x ${b >= 0 ? '+' : '-'} ${formatar(Math.abs(b))} = ${formatar(c)}`,
    },
  ];

  if (b !== 0) {
    passos.push({
      descricao: `Subtraímos ${formatar(b)} dos dois lados, para isolar o termo com x.`,
      tex:
        `${formatar(a)}x ${b >= 0 ? '+' : '-'} ${formatar(Math.abs(b))} ${b >= 0 ? '-' : '+'} ` +
        `${formatar(Math.abs(b))} = ${formatar(c)} ${b >= 0 ? '-' : '+'} ${formatar(Math.abs(b))}`,
      nota: 'A igualdade se mantém porque a mesma operação foi feita nos dois lados.',
    });
    passos.push({
      descricao: 'O que sobra do lado esquerdo é só o termo com x.',
      tex: `${formatar(a)}x = ${formatar(c - b)}`,
    });
  }

  if (a !== 1) {
    passos.push({
      descricao: `Dividimos os dois lados por ${formatar(a)}, o coeficiente de x.`,
      tex: `\\frac{${formatar(a)}x}{${formatar(a)}} = \\frac{${formatar(c - b)}}{${formatar(a)}}`,
    });
  }

  passos.push({
    descricao: 'Chegamos ao valor de x.',
    tex: `x = ${raiz.paraTex()}${raiz.denominador === 1 ? '' : ` \\approx ${formatar(raiz.paraDecimal())}`}`,
  });

  passos.push({
    descricao: 'Conferindo: substituímos a raiz na equação original.',
    tex:
      `${formatar(a)} \\cdot \\left(${raiz.paraTex()}\\right) ${b >= 0 ? '+' : '-'} ` +
      `${formatar(Math.abs(b))} = ${formatar(c)}`,
    nota: 'Verificar a raiz é parte da resolução, não um extra.',
  });

  return { resultado: { raiz, valor: raiz.paraDecimal() }, passos };
}
