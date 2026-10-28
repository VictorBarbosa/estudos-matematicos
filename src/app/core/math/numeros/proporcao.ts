import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos';
import { Fracao } from './fracao';

/**
 * Razão, proporção e regra de três.
 *
 * O fio condutor é a distinção entre grandezas diretamente e inversamente
 * proporcionais: aplicar a regra de três direta num caso inverso é o erro
 * mais comum do tema, e é por isso que aqui a escolha vem antes da conta.
 */

function formatar(valor: number): string {
  return Number(valor.toFixed(6)).toLocaleString('pt-BR', { maximumFractionDigits: 6 });
}

/** A razão entre dois números, reduzida à forma irredutível. */
export function razaoComPassos(a: number, b: number): Resolucao<Fracao> {
  const bruta = Fracao.criar(a, b);
  const resultado = bruta.simplificar();

  const passos: Passo[] = [
    {
      descricao: 'A razão entre dois números é o quociente entre eles.',
      tex: `${a} : ${b} = ${bruta.paraTex()}`,
    },
  ];

  if (!bruta.estaSimplificada) {
    passos.push({
      descricao: 'Simplificando, vemos a proporção na sua forma mais clara.',
      tex: `${bruta.paraTex()} = ${resultado.paraTex()}`,
      nota: `Para cada ${resultado.numerador} de um, há ${resultado.denominador} do outro.`,
    });
  }

  return { resultado, passos };
}

/**
 * Regra de três.
 *
 * Em `a` está para `b` assim como `c` está para `x`, resolve x. Quando as
 * grandezas são inversamente proporcionais, é o produto que se conserva, não
 * a razão.
 */
export function regraDeTresComPassos(
  a: number,
  b: number,
  c: number,
  inversa = false,
): Resolucao<number> {
  if (a === 0) {
    throw new ErroMatematico('O primeiro termo não pode ser zero.');
  }

  const resultado = inversa ? (a * b) / c : (b * c) / a;

  if (inversa) {
    return {
      resultado,
      passos: [
        {
          descricao:
            'As grandezas são inversamente proporcionais: quando uma cresce, a outra diminui.',
          tex: `${formatar(a)} \\to ${formatar(b)} \\qquad ${formatar(c)} \\to x`,
        },
        {
          descricao: 'Nesse caso o que se conserva é o PRODUTO, não a razão.',
          tex: `${formatar(a)} \\cdot ${formatar(b)} = ${formatar(c)} \\cdot x`,
          nota: 'O dobro de operários leva metade do tempo: o produto operários × tempo é constante.',
        },
        {
          descricao: 'Isolamos x.',
          tex: `x = \\frac{${formatar(a)} \\cdot ${formatar(b)}}{${formatar(c)}} = ${formatar(resultado)}`,
        },
      ],
    };
  }

  return {
    resultado,
    passos: [
      {
        descricao: 'As grandezas são diretamente proporcionais: as duas crescem juntas.',
        tex: `\\frac{${formatar(a)}}{${formatar(b)}} = \\frac{${formatar(c)}}{x}`,
      },
      {
        descricao: 'Numa proporção, o produto dos meios é igual ao produto dos extremos.',
        tex: `${formatar(a)} \\cdot x = ${formatar(b)} \\cdot ${formatar(c)}`,
        nota: 'É o que se chama de multiplicar em cruz.',
      },
      {
        descricao: 'Isolamos x.',
        tex: `x = \\frac{${formatar(b)} \\cdot ${formatar(c)}}{${formatar(a)}} = ${formatar(resultado)}`,
      },
    ],
  };
}

/** Divide um total em partes diretamente proporcionais aos pesos dados. */
export function divisaoProporcionalComPassos(
  total: number,
  pesos: readonly number[],
): Resolucao<readonly number[]> {
  const soma = pesos.reduce((acumulado, peso) => acumulado + peso, 0);

  if (soma === 0) {
    throw new ErroMatematico('A soma das partes não pode ser zero.');
  }

  const constante = total / soma;
  const resultado = pesos.map((peso) => peso * constante);

  return {
    resultado,
    passos: [
      {
        descricao: 'Cada parte é o seu peso multiplicado por uma mesma constante k.',
        tex: pesos.map((peso, i) => `x_{${i + 1}} = ${peso}k`).join(' \\qquad '),
      },
      {
        descricao: 'A soma das partes tem de dar o total, o que determina k.',
        tex: `${pesos.join(' + ')} = ${soma} \;\\Rightarrow\; ${soma}k = ${formatar(total)} \;\\Rightarrow\; k = ${formatar(constante)}`,
      },
      {
        descricao: 'Com k conhecido, cada parte fica determinada.',
        tex: resultado.map((valor, i) => `x_{${i + 1}} = ${formatar(valor)}`).join(' \\qquad '),
      },
    ],
  };
}

/** Verifica se quatro números formam uma proporção. */
export function ehProporcao(a: number, b: number, c: number, d: number): boolean {
  return a * d === b * c;
}
