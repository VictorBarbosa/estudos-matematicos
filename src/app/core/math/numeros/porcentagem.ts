import { Passo, Resolucao } from '@core/math/tipos';

/**
 * Porcentagem como fração de denominador cem.
 *
 * Tudo aqui é escrito em torno do **fator multiplicativo** (1 + p/100), porque
 * é ele que explica por que descontos e acréscimos sucessivos não se somam.
 */

/** Arredonda para duas casas, evitando o lixo do ponto flutuante na exibição. */
function arredondar(valor: number): number {
  return Math.round(valor * 1e6) / 1e6;
}

function formatar(valor: number): string {
  return arredondar(valor).toLocaleString('pt-BR', { maximumFractionDigits: 6 });
}

/** O fator que, multiplicado pelo valor, aplica a variação de uma só vez. */
export function fatorDe(percentual: number): number {
  return 1 + percentual / 100;
}

export function porcentagemDeComPassos(percentual: number, valor: number): Resolucao<number> {
  const resultado = (percentual / 100) * valor;

  return {
    resultado: arredondar(resultado),
    passos: [
      {
        descricao: 'Porcentagem é uma fração de denominador cem.',
        tex: `${percentual}\\% = \\frac{${percentual}}{100} = ${formatar(percentual / 100)}`,
      },
      {
        descricao: '"Por cento de" significa multiplicar por essa fração.',
        tex: `\\frac{${percentual}}{100} \\times ${formatar(valor)} = ${formatar(resultado)}`,
      },
    ],
  };
}

export function variacaoComPassos(valor: number, percentual: number): Resolucao<number> {
  const fator = fatorDe(percentual);
  const resultado = valor * fator;
  const aumentou = percentual >= 0;

  return {
    resultado: arredondar(resultado),
    passos: [
      {
        descricao: `Um ${aumentou ? 'acréscimo' : 'desconto'} de ${Math.abs(percentual)}% equivale a multiplicar por um fator.`,
        tex: `1 ${aumentou ? '+' : '-'} \\frac{${Math.abs(percentual)}}{100} = ${formatar(fator)}`,
        nota: aumentou
          ? 'O 1 preserva o valor original e a fração acrescenta a parte nova.'
          : 'O 1 preserva o valor original e a fração retira a parte descontada.',
      },
      {
        descricao: 'Aplicamos o fator ao valor.',
        tex: `${formatar(valor)} \\times ${formatar(fator)} = ${formatar(resultado)}`,
      },
    ],
  };
}

/**
 * Variações sucessivas.
 *
 * O ponto didático: os fatores se multiplicam, e não se somam — é por isso que
 * +10% seguido de -10% não devolve o valor inicial.
 */
export function sucessivasComPassos(
  valor: number,
  percentuais: readonly number[],
): Resolucao<number> {
  const fatores = percentuais.map(fatorDe);
  const fatorTotal = fatores.reduce((acumulado, fator) => acumulado * fator, 1);
  const resultado = valor * fatorTotal;
  const somaIngenua = percentuais.reduce((total, p) => total + p, 0);

  const passos: Passo[] = [
    {
      descricao: 'Cada variação tem seu próprio fator.',
      tex: percentuais
        .map((p, i) => `${p >= 0 ? '+' : ''}${p}\\% \\to ${formatar(fatores[i]!)}`)
        .join(' \\qquad '),
    },
    {
      descricao:
        'Variações sucessivas se MULTIPLICAM, porque cada uma incide sobre o valor já alterado.',
      tex: `${fatores.map((f) => formatar(f)).join(' \\times ')} = ${formatar(fatorTotal)}`,
    },
    {
      descricao: 'O fator acumulado revela a variação total equivalente.',
      tex: `(${formatar(fatorTotal)} - 1) \\times 100\\% = ${formatar((fatorTotal - 1) * 100)}\\%`,
      nota:
        `Somar os percentuais daria ${formatar(somaIngenua)}%, que é diferente: ` +
        'a segunda variação não incide sobre o valor original.',
    },
    {
      descricao: 'Aplicamos o fator acumulado.',
      tex: `${formatar(valor)} \\times ${formatar(fatorTotal)} = ${formatar(resultado)}`,
    },
  ];

  return { resultado: arredondar(resultado), passos };
}

/** De quanto por cento um valor variou em relação a outro. */
export function variacaoPercentualComPassos(de: number, para: number): Resolucao<number> {
  const diferenca = para - de;
  const resultado = (diferenca / de) * 100;

  return {
    resultado: arredondar(resultado),
    passos: [
      {
        descricao: 'Calculamos a diferença absoluta.',
        tex: `${formatar(para)} - ${formatar(de)} = ${formatar(diferenca)}`,
      },
      {
        descricao: 'A variação percentual compara a diferença com o valor INICIAL.',
        tex: `\\frac{${formatar(diferenca)}}{${formatar(de)}} \\times 100\\% = ${formatar(resultado)}\\%`,
        nota: 'O denominador é sempre o ponto de partida, nunca o de chegada.',
      },
    ],
  };
}
