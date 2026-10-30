import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { Polinomio, formatar, formatarEmTexto } from '@core/math/algebra/polinomio/polinomio';

/**
 * Derivadas.
 *
 * A derivada é apresentada como aquilo que ela é: o limite da inclinação de
 * uma reta secante quando os dois pontos se aproximam. As regras vêm depois,
 * como atalhos para esse limite.
 */

/** Quociente de Newton: a inclinação da secante entre x e x+h. */
export function quocienteDeNewton(f: (x: number) => number, x: number, h: number): number {
  return (f(x + h) - f(x)) / h;
}

/**
 * Derivada numérica pela diferença central.
 *
 * A diferença central cancela o erro de primeira ordem, sendo bem mais
 * precisa que a diferença à frente para o mesmo h.
 */
export function derivadaNumerica(f: (x: number) => number, x: number, h = 1e-6): number {
  return (f(x + h) - f(x - h)) / (2 * h);
}

/** A segunda derivada, que informa a concavidade. */
export function segundaDerivadaNumerica(f: (x: number) => number, x: number, h = 1e-4): number {
  return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
}

/**
 * Mostra a derivada nascendo do limite: a secante virando tangente.
 */
export function derivadaPelaDefinicaoComPassos(
  f: (x: number) => number,
  x: number,
  descricaoFuncao: string,
): Resolucao<number> {
  const resultado = derivadaNumerica(f, x);
  const aproximacoes = [1, 0.1, 0.01, 0.001].map((h) => ({
    h,
    inclinacao: quocienteDeNewton(f, x, h),
  }));

  return {
    resultado,
    passos: [
      {
        descricao: 'A derivada é o limite da inclinação da reta secante.',
        tex: `f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}`,
      },
      {
        descricao: 'Calculamos essa inclinação com h cada vez menor.',
        tex: aproximacoes
          .map((a) => `h = ${formatar(a.h)} \\to ${formatar(a.inclinacao)}`)
          .join(' \\quad '),
        nota: 'Os dois pontos da secante vão se aproximando um do outro.',
      },
      {
        descricao: 'No limite, a secante vira a reta tangente, e sua inclinação é a derivada.',
        tex: `f'(${formatar(x)}) = ${formatar(resultado)}`,
        nota: `A tangente em x = ${formatarEmTexto(x)} tem essa inclinação.`,
      },
      {
        descricao: 'Com a inclinação e o ponto, a equação da tangente fica determinada.',
        tex: `y = ${formatar(f(x))} ${resultado >= 0 ? '+' : '-'} ${formatar(Math.abs(resultado))}(x - ${formatar(x)})`,
      },
    ],
  };
}

/** Deriva um polinômio aplicando a regra da potência termo a termo. */
export function derivarPolinomioComPassos(p: Polinomio): Resolucao<Polinomio> {
  const resultado = p.derivar();

  const termos = p.coeficientes
    .map((coeficiente, grau) => ({ coeficiente, grau }))
    .filter(({ coeficiente, grau }) => coeficiente !== 0 && grau > 0)
    .map(
      ({ coeficiente, grau }) =>
        `\\frac{d}{dx}\\left(${formatar(coeficiente)}x^{${grau}}\\right) = ${formatar(coeficiente * grau)}x^{${grau - 1}}`,
    );

  const passos: Passo[] = [
    { descricao: 'Partimos do polinômio.', tex: `f(x) = ${p.paraTex()}` },
    {
      descricao: 'A regra da potência: o expoente desce multiplicando e diminui em um.',
      tex: '\\frac{d}{dx}\\left(x^{n}\\right) = n\\,x^{n-1}',
    },
  ];

  if (termos.length > 0) {
    passos.push({
      descricao: 'Aplicamos a regra a cada termo separadamente.',
      tex: termos.join(' \\qquad '),
      nota: 'A derivada de uma soma é a soma das derivadas.',
    });
  }

  passos.push({
    descricao:
      p.coeficiente(0) === 0
        ? 'Somando os termos derivados.'
        : 'O termo constante some: uma constante não varia, então sua derivada é zero.',
    tex: `f'(x) = ${resultado.paraTex()}`,
  });

  return { resultado, passos };
}

export interface PontoCritico {
  readonly x: number;
  readonly y: number;
  readonly tipo: 'maximo' | 'minimo' | 'inflexao';
}

/**
 * Pontos onde a derivada se anula, classificados pela segunda derivada.
 *
 * Onde a tangente fica horizontal, a função para de subir ou de descer — é
 * ali que estão os extremos.
 */
export function pontosCriticos(
  f: (x: number) => number,
  xMin: number,
  xMax: number,
  amostras = 500,
): readonly PontoCritico[] {
  const raizes: number[] = [];
  const passo = (xMax - xMin) / amostras;
  // Abaixo disso consideramos a derivada nula: a diferença central devolve
  // exatamente 0 em pontos simétricos, como o vértice de uma parábola.
  const tolerancia = 1e-9;

  let anterior = derivadaNumerica(f, xMin);

  for (let i = 1; i <= amostras; i++) {
    const x = xMin + i * passo;
    const atual = derivadaNumerica(f, x);

    if (!Number.isFinite(anterior) || !Number.isFinite(atual)) {
      anterior = atual;
      continue;
    }

    if (Math.abs(atual) < tolerancia) {
      // A derivada zerou nesta amostra. Só registramos a entrada no trecho
      // plano, para não devolver centenas de pontos numa função constante.
      if (Math.abs(anterior) >= tolerancia) {
        raizes.push(x);
      }
    } else if (anterior * atual < 0) {
      // Houve troca de sinal entre as amostras: refina a raiz por bisseção.
      let baixo = x - passo;
      let alto = x;

      for (let k = 0; k < 50; k++) {
        const meio = (baixo + alto) / 2;
        if (derivadaNumerica(f, baixo) * derivadaNumerica(f, meio) <= 0) {
          alto = meio;
        } else {
          baixo = meio;
        }
      }

      raizes.push((baixo + alto) / 2);
    }

    anterior = atual;
  }

  return raizes
    // Descarta raízes praticamente coincidentes, que a varredura pode duplicar.
    .filter((raiz, indice, todas) => indice === 0 || Math.abs(raiz - todas[indice - 1]!) > passo)
    .map((x) => {
      const segunda = segundaDerivadaNumerica(f, x);
      return {
        x,
        y: f(x),
        tipo: segunda > 1e-6 ? 'minimo' : segunda < -1e-6 ? 'maximo' : 'inflexao',
      } as PontoCritico;
    });
}
