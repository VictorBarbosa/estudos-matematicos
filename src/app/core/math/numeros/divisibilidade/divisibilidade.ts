import { Passo, Resolucao } from '@core/math/tipos/tipos';
import { fatoracaoParaTex, fatorar, mdc, mmc } from '@core/math/numeros/inteiros/inteiros';

/**
 * Demonstrações de MMC e MDC.
 *
 * Os dois são apresentados pela fatoração em primos, que é o que deixa visível
 * *por que* um toma o maior expoente e o outro o menor — decorar qual é qual
 * sem essa imagem é a origem da confusão mais comum do tema.
 */

/** Fatores comuns com o menor expoente, que é a receita do MDC. */
export function mdcComPassos(a: number, b: number): Resolucao<number> {
  const resultado = mdc(a, b);
  const fatoresA = fatorar(a);
  const fatoresB = fatorar(b);

  const comuns = fatoresA
    .filter((fator) => fatoresB.some((outro) => outro.primo === fator.primo))
    .map((fator) => {
      const correspondente = fatoresB.find((outro) => outro.primo === fator.primo)!;
      return { primo: fator.primo, expoente: Math.min(fator.expoente, correspondente.expoente) };
    });

  const passos: Passo[] = [
    {
      descricao: 'Fatoramos os dois números em primos.',
      tex: `${a} = ${fatoracaoParaTex(a)} \\qquad ${b} = ${fatoracaoParaTex(b)}`,
    },
  ];

  if (comuns.length === 0) {
    passos.push({
      descricao: 'Não há nenhum fator primo em comum, então os números são primos entre si.',
      tex: `\\operatorname{mdc}(${a}, ${b}) = 1`,
      nota: 'Quando o MDC é 1, a fração a/b já é irredutível.',
    });
    return { resultado, passos };
  }

  passos.push({
    descricao: 'O MDC toma apenas os primos comuns, cada um com o MENOR expoente.',
    tex:
      `\\operatorname{mdc}(${a}, ${b}) = ` +
      comuns
        .map(({ primo, expoente }) => (expoente === 1 ? `${primo}` : `${primo}^{${expoente}}`))
        .join(' \\cdot ') +
      ` = ${resultado}`,
    nota:
      'Com o menor expoente, o resultado ainda divide os dois; com qualquer expoente maior, ' +
      'deixaria de dividir um deles.',
  });

  return { resultado, passos };
}

/** Todos os primos com o maior expoente, que é a receita do MMC. */
export function mmcComPassos(a: number, b: number): Resolucao<number> {
  const resultado = mmc(a, b);

  return {
    resultado,
    passos: [
      {
        descricao: 'Fatoramos os dois números em primos.',
        tex: `${a} = ${fatoracaoParaTex(a)} \\qquad ${b} = ${fatoracaoParaTex(b)}`,
      },
      {
        descricao: 'O MMC toma TODOS os primos que aparecem, cada um com o MAIOR expoente.',
        tex: `\\operatorname{mmc}(${a}, ${b}) = ${fatoracaoParaTex(resultado)} = ${resultado}`,
        nota:
          'Com o maior expoente, o resultado é múltiplo de ambos; com qualquer expoente menor, ' +
          'deixaria de ser múltiplo de um deles.',
      },
    ],
  };
}

/**
 * A relação que amarra os dois conceitos: multiplicar MDC por MMC devolve o
 * produto dos números, porque juntos eles usam cada fator exatamente duas vezes.
 */
export function relacaoMdcMmcComPassos(a: number, b: number): Resolucao<number> {
  const divisor = mdc(a, b);
  const multiplo = mmc(a, b);

  return {
    resultado: a * b,
    passos: [
      {
        descricao: 'Calculamos o MDC e o MMC.',
        tex: `\\operatorname{mdc}(${a}, ${b}) = ${divisor} \\qquad \\operatorname{mmc}(${a}, ${b}) = ${multiplo}`,
      },
      {
        descricao: 'O produto dos dois é igual ao produto dos números originais.',
        tex: `${divisor} \\cdot ${multiplo} = ${divisor * multiplo} = ${a} \\cdot ${b}`,
        nota:
          'O MDC guarda o menor expoente de cada primo comum e o MMC o maior; somados, ' +
          'reconstroem exatamente os expoentes dos dois números.',
      },
    ],
  };
}
