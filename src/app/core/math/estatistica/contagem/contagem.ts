import { formatar } from '@core/math/algebra/polinomio/polinomio';
import { ErroMatematico, Passo, Resolucao } from '@core/math/tipos/tipos';

/**
 * Contagem e probabilidade.
 *
 * Toda a combinatória decorre de uma pergunta só: a ordem importa? Se importa,
 * é arranjo; se não, divide-se pelas ordens repetidas e vira combinação. A
 * probabilidade, no caso equiprovável, é apenas contar duas vezes.
 */

export function fatorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new ErroMatematico(`Fatorial exige inteiro não negativo, recebido: ${n}`);
  }

  if (n > 170) {
    throw new ErroMatematico('Fatorial acima de 170! estoura a precisão de ponto flutuante.');
  }

  let resultado = 1;
  for (let i = 2; i <= n; i++) {
    resultado *= i;
  }
  return resultado;
}

/** Arranjos: escolher p entre n COM ordem. */
export function arranjosComPassos(n: number, p: number): Resolucao<number> {
  exigirValidos(n, p);

  let resultado = 1;
  const fatores: string[] = [];
  for (let i = 0; i < p; i++) {
    resultado *= n - i;
    fatores.push(String(n - i));
  }

  return {
    resultado,
    passos: [
      {
        descricao: 'Pelo princípio multiplicativo, cada posição tem uma opção menos que a anterior.',
        tex: `${fatores.join(' \\times ')} = ${formatar(resultado)}`,
      },
      {
        descricao: 'Escrito com fatoriais, é o mesmo que cortar as escolhas que não foram feitas.',
        tex: `A_{${n},${p}} = \\frac{${n}!}{(${n}-${p})!} = ${formatar(resultado)}`,
        nota: 'A ordem importa: trocar duas escolhas de lugar produz um arranjo diferente.',
      },
    ],
  };
}

/** Combinações: escolher p entre n SEM ordem. */
export function combinacoesComPassos(n: number, p: number): Resolucao<number> {
  exigirValidos(n, p);

  const arranjos = arranjosComPassos(n, p).resultado;
  const ordens = fatorial(p);

  // A divisão é exata na matemática, mas não em ponto flutuante: para n
  // maiores, arranjos/p! chega a devolver 253.00000000000003. Como uma
  // contagem é sempre inteira, arredondar aqui evita que o aluno digite o
  // número certo e a comparação o repreove por um erro de representação.
  const resultado = Math.round(arranjos / ordens);

  return {
    resultado,
    passos: [
      {
        descricao: 'Começamos contando com ordem, como se fossem arranjos.',
        tex: `A_{${n},${p}} = ${formatar(arranjos)}`,
      },
      {
        descricao: `Mas cada grupo foi contado ${p}! vezes, uma para cada ordem possível.`,
        tex: `${p}! = ${formatar(ordens)}`,
        nota: 'Um comitê com as mesmas pessoas é o mesmo comitê, em qualquer ordem.',
      },
      {
        descricao: 'Dividimos para eliminar as repetições.',
        tex: `C_{${n},${p}} = \\frac{${formatar(arranjos)}}{${formatar(ordens)}} = ${formatar(resultado)}`,
      },
      {
        descricao: 'Escolher p é o mesmo que descartar n − p: a contagem é simétrica.',
        tex: `C_{${n},${p}} = C_{${n},${n - p}}`,
      },
    ],
  };
}

export function combinacoes(n: number, p: number): number {
  return combinacoesComPassos(n, p).resultado;
}

/** Permutações de n elementos, com repetições opcionais. */
export function permutacoesComPassos(n: number, repeticoes: readonly number[] = []): Resolucao<number> {
  const total = fatorial(n);
  const divisor = repeticoes.reduce((produto, quantidade) => produto * fatorial(quantidade), 1);
  const resultado = total / divisor;

  const passos: Passo[] = [
    {
      descricao: 'Sem repetições, há n! ordens possíveis.',
      tex: `${n}! = ${formatar(total)}`,
    },
  ];

  if (repeticoes.length > 0) {
    passos.push(
      {
        descricao: 'Elementos repetidos produzem ordens indistinguíveis.',
        tex: repeticoes.map((quantidade) => `${quantidade}!`).join(' \\cdot ') + ` = ${formatar(divisor)}`,
        nota: 'Trocar duas letras iguais de lugar não gera uma palavra nova.',
      },
      {
        descricao: 'Dividimos pelas permutações internas dos repetidos.',
        tex: `P = \\frac{${formatar(total)}}{${formatar(divisor)}} = ${formatar(resultado)}`,
      },
    );
  }

  return { resultado, passos };
}

/** Probabilidade de um evento equiprovável. */
export function probabilidadeComPassos(favoraveis: number, total: number): Resolucao<number> {
  if (total <= 0) {
    throw new ErroMatematico('O espaço amostral deve ter ao menos um resultado.');
  }

  if (favoraveis < 0 || favoraveis > total) {
    throw new ErroMatematico('Os casos favoráveis devem estar entre 0 e o total.');
  }

  const resultado = favoraveis / total;

  return {
    resultado,
    passos: [
      {
        descricao: 'No caso equiprovável, a probabilidade é a razão entre as contagens.',
        tex: 'P(A) = \\frac{\\text{casos favoráveis}}{\\text{casos possíveis}}',
      },
      {
        descricao: 'Substituímos as duas contagens.',
        tex: `P(A) = \\frac{${formatar(favoraveis)}}{${formatar(total)}} = ${formatar(Number(resultado.toFixed(6)))}`,
        nota: 'Toda probabilidade fica entre 0 e 1 — resultado fora disso é erro de contagem.',
      },
      {
        descricao: 'Em porcentagem.',
        tex: `${formatar(Number((resultado * 100).toFixed(4)))}\\%`,
      },
    ],
  };
}

/** Eventos independentes: a probabilidade de ambos é o produto. */
export function probabilidadeConjuntaComPassos(
  pA: number,
  pB: number,
  independentes: boolean,
  pBdadoA = pB,
): Resolucao<number> {
  for (const p of [pA, pB, pBdadoA]) {
    if (p < 0 || p > 1) {
      throw new ErroMatematico('Probabilidades devem estar entre 0 e 1.');
    }
  }

  const condicional = independentes ? pB : pBdadoA;
  const resultado = pA * condicional;

  return {
    resultado,
    passos: [
      {
        descricao: 'A probabilidade de dois eventos ocorrerem é a do primeiro vezes a do segundo dado o primeiro.',
        tex: 'P(A \\cap B) = P(A) \\cdot P(B\\mid A)',
      },
      {
        descricao: independentes
          ? 'Sendo independentes, o primeiro evento não altera o segundo.'
          : 'Sem independência, o segundo evento tem probabilidade alterada.',
        tex: independentes
          ? `P(B\\mid A) = P(B) = ${formatar(pB)}`
          : `P(B\\mid A) = ${formatar(condicional)}`,
        nota: independentes
          ? 'Moedas e dados não têm memória.'
          : 'Retirar sem reposição muda o espaço amostral da segunda retirada.',
      },
      {
        descricao: 'Multiplicamos.',
        tex: `P(A \\cap B) = ${formatar(pA)} \\times ${formatar(condicional)} = ${formatar(Number(resultado.toFixed(6)))}`,
      },
    ],
  };
}

/** Probabilidade de ao menos um sucesso em n tentativas independentes. */
export function aoMenosUmComPassos(p: number, tentativas: number): Resolucao<number> {
  if (p < 0 || p > 1) {
    throw new ErroMatematico('A probabilidade deve estar entre 0 e 1.');
  }

  if (!Number.isInteger(tentativas) || tentativas < 1) {
    throw new ErroMatematico('O número de tentativas deve ser um inteiro positivo.');
  }

  const nenhum = (1 - p) ** tentativas;
  const resultado = 1 - nenhum;

  return {
    resultado,
    passos: [
      {
        descricao: 'Contar "ao menos um" caso a caso é trabalhoso; o complementar é simples.',
        tex: 'P(\\text{ao menos um}) = 1 - P(\\text{nenhum})',
      },
      {
        descricao: 'A probabilidade de falhar em todas as tentativas é o produto das falhas.',
        tex: `P(\\text{nenhum}) = (1 - ${formatar(p)})^{${tentativas}} = ${formatar(Number(nenhum.toFixed(6)))}`,
      },
      {
        descricao: 'Subtraindo de 1.',
        tex: `P = ${formatar(Number(resultado.toFixed(6)))}`,
        nota: 'Com muitas tentativas, até eventos raros ficam quase certos.',
      },
    ],
  };
}

function exigirValidos(n: number, p: number): void {
  if (!Number.isInteger(n) || !Number.isInteger(p)) {
    throw new ErroMatematico('n e p devem ser inteiros.');
  }

  if (n < 0 || p < 0) {
    throw new ErroMatematico('n e p não podem ser negativos.');
  }

  if (p > n) {
    throw new ErroMatematico(`Não há como escolher ${p} elementos entre apenas ${n}.`);
  }
}
