import { formatar } from '@core/math/algebra/polinomio';
import { paraGraus, paraRadianos } from '@core/math/trigonometria/trigonometria';
import { ErroMatematico, Resolucao } from '@core/math/tipos';

/**
 * Números complexos.
 *
 * A motivação honesta não é "resolver x² = −1", e sim o que se ganha: no plano
 * complexo, multiplicar é girar e esticar. Essa leitura geométrica é a que
 * reaparece em oscilações, fasores e tudo que gira.
 */

export interface Complexo {
  readonly real: number;
  readonly imaginario: number;
}

export function complexoParaTex({ real, imaginario }: Complexo): string {
  if (Math.abs(imaginario) < 1e-12) {
    return formatar(real);
  }

  if (Math.abs(real) < 1e-12) {
    return `${imaginario === 1 ? '' : imaginario === -1 ? '-' : formatar(imaginario)}i`;
  }

  const sinal = imaginario < 0 ? '-' : '+';
  const parte = Math.abs(imaginario) === 1 ? '' : formatar(Math.abs(imaginario));

  return `${formatar(real)} ${sinal} ${parte}i`;
}

/** Módulo: a distância até a origem no plano de Argand-Gauss. */
export function moduloComplexo({ real, imaginario }: Complexo): number {
  return Math.hypot(real, imaginario);
}

/** Argumento em graus, no intervalo [0, 360). */
export function argumentoGraus({ real, imaginario }: Complexo): number {
  return (paraGraus(Math.atan2(imaginario, real)) + 360) % 360;
}

export function conjugado({ real, imaginario }: Complexo): Complexo {
  return { real, imaginario: -imaginario };
}

export function somarComplexos(a: Complexo, b: Complexo): Complexo {
  return { real: a.real + b.real, imaginario: a.imaginario + b.imaginario };
}

/**
 * Multiplicação de complexos, com os passos.
 *
 * A conta é a distributiva de sempre; o que a torna especial é i² = −1, que
 * converte o produto dos imaginários numa contribuição real.
 */
export function multiplicarComplexosComPassos(a: Complexo, b: Complexo): Resolucao<Complexo> {
  const real = a.real * b.real - a.imaginario * b.imaginario;
  const imaginario = a.real * b.imaginario + a.imaginario * b.real;
  const resultado = { real, imaginario };

  return {
    resultado,
    passos: [
      {
        descricao: 'Aplicamos a distributiva como em qualquer binômio.',
        tex:
          `(${complexoParaTex(a)})(${complexoParaTex(b)}) = ` +
          `${formatar(a.real)}\\cdot${formatar(b.real)} + ${formatar(a.real)}\\cdot${formatar(b.imaginario)}i` +
          ` + ${formatar(a.imaginario)}i\\cdot${formatar(b.real)} + ${formatar(a.imaginario)}\\cdot${formatar(b.imaginario)}i^{2}`,
      },
      {
        descricao: 'O termo com i² muda de natureza: i² = −1, então ele vira real.',
        tex: `i^{2} = -1 \;\\Rightarrow\; ${formatar(a.imaginario)}\\cdot${formatar(b.imaginario)}i^{2} = ${formatar(-a.imaginario * b.imaginario)}`,
        nota: 'É daqui que vem o sinal de menos na parte real do produto.',
      },
      {
        descricao: 'Agrupamos partes reais e imaginárias.',
        tex: `= ${complexoParaTex(resultado)}`,
      },
      {
        descricao: 'Em forma polar, os módulos multiplicam e os argumentos somam.',
        tex:
          `|z_1 z_2| = ${formatar(Number((moduloComplexo(a) * moduloComplexo(b)).toFixed(4)))} \\qquad ` +
          `\\arg = ${formatar(Number(((argumentoGraus(a) + argumentoGraus(b)) % 360).toFixed(2)))}^\\circ`,
        nota: 'Multiplicar por um complexo é esticar e girar — não há outra leitura mais útil.',
      },
    ],
  };
}

/** Divisão, racionalizando pelo conjugado. */
export function dividirComplexosComPassos(a: Complexo, b: Complexo): Resolucao<Complexo> {
  const denominador = b.real * b.real + b.imaginario * b.imaginario;

  if (denominador === 0) {
    throw new ErroMatematico('Não há divisão complexa por zero.');
  }

  const real = (a.real * b.real + a.imaginario * b.imaginario) / denominador;
  const imaginario = (a.imaginario * b.real - a.real * b.imaginario) / denominador;
  const resultado = { real, imaginario };

  return {
    resultado,
    passos: [
      {
        descricao: 'Multiplicamos numerador e denominador pelo conjugado do denominador.',
        tex: `\\frac{${complexoParaTex(a)}}{${complexoParaTex(b)}} \\cdot \\frac{${complexoParaTex(conjugado(b))}}{${complexoParaTex(conjugado(b))}}`,
      },
      {
        descricao: 'O denominador fica real: é o módulo ao quadrado.',
        tex: `(${complexoParaTex(b)})(${complexoParaTex(conjugado(b))}) = ${formatar(denominador)}`,
        nota: 'O conjugado existe justamente para isso — eliminar o i de baixo.',
      },
      {
        descricao: 'Dividimos cada parte pelo denominador real.',
        tex: `= ${complexoParaTex({ real: Number(real.toFixed(6)), imaginario: Number(imaginario.toFixed(6)) })}`,
      },
    ],
  };
}

/** Da forma algébrica para a polar. */
export function paraPolarComPassos(z: Complexo): Resolucao<{ modulo: number; argumento: number }> {
  const modulo = moduloComplexo(z);

  if (modulo === 0) {
    throw new ErroMatematico('O zero complexo não tem argumento definido.');
  }

  const argumento = argumentoGraus(z);

  return {
    resultado: { modulo, argumento },
    passos: [
      {
        descricao: 'Localizamos o número no plano: a parte real no eixo x, a imaginária no y.',
        tex: `z = ${complexoParaTex(z)}`,
      },
      {
        descricao: 'O módulo é a distância até a origem, por Pitágoras.',
        tex: `|z| = \\sqrt{${formatar(z.real)}^{2} + ${formatar(z.imaginario)}^{2}} = ${formatar(Number(modulo.toFixed(4)))}`,
      },
      {
        descricao: 'O argumento é o ângulo com o eixo real.',
        tex: `\\theta = ${formatar(Number(argumento.toFixed(2)))}^\\circ`,
        nota: 'O quadrante importa: a tangente sozinha não distingue θ de θ + 180°.',
      },
      {
        descricao: 'Juntando, chega-se à forma polar.',
        tex: `z = ${formatar(Number(modulo.toFixed(4)))}\\left(\\cos ${formatar(Number(argumento.toFixed(2)))}^\\circ + i\\sin ${formatar(Number(argumento.toFixed(2)))}^\\circ\\right)`,
      },
    ],
  };
}

/** Da forma polar para a algébrica. */
export function dePolar(modulo: number, argumentoGrausValor: number): Complexo {
  const radianos = paraRadianos(argumentoGrausValor);
  return {
    real: modulo * Math.cos(radianos),
    imaginario: modulo * Math.sin(radianos),
  };
}

/**
 * Potência pela fórmula de De Moivre.
 *
 * Elevar a uma potência é girar n vezes o mesmo ângulo — o que torna o
 * cálculo trivial na forma polar e horrível na algébrica.
 */
export function potenciaComPassos(z: Complexo, n: number): Resolucao<Complexo> {
  if (!Number.isInteger(n) || n < 0) {
    throw new ErroMatematico('O expoente deve ser um inteiro não negativo.');
  }

  const modulo = moduloComplexo(z);
  const argumento = argumentoGraus(z);

  const moduloFinal = modulo ** n;
  const argumentoFinal = (argumento * n) % 360;
  const resultado = dePolar(moduloFinal, argumentoFinal);

  return {
    resultado: {
      real: Number(resultado.real.toFixed(9)),
      imaginario: Number(resultado.imaginario.toFixed(9)),
    },
    passos: [
      {
        descricao: 'Passamos para a forma polar.',
        tex: `z = ${formatar(Number(modulo.toFixed(4)))}\\,\\angle\\,${formatar(Number(argumento.toFixed(2)))}^\\circ`,
      },
      {
        descricao: 'Por De Moivre, o módulo se eleva e o argumento se multiplica.',
        tex: `z^{${n}} = ${formatar(Number(modulo.toFixed(4)))}^{${n}}\\,\\angle\\,${n}\\cdot${formatar(Number(argumento.toFixed(2)))}^\\circ`,
        nota: 'Cada multiplicação por z aplica o mesmo giro outra vez.',
      },
      {
        descricao: 'Reduzimos o ângulo a uma volta e voltamos à forma algébrica.',
        tex: `z^{${n}} = ${complexoParaTex({ real: Number(resultado.real.toFixed(4)), imaginario: Number(resultado.imaginario.toFixed(4)) })}`,
      },
    ],
  };
}
