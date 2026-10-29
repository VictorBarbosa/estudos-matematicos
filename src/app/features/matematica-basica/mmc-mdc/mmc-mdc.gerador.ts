import { fatorar, mdc, mdcComPassos, mmc, mmcComPassos } from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { Armadilha, Exercicio, GeradorExercicio, Nivel } from '@core/treino/models/treino.model';

type Alvo = 'mdc' | 'mmc';

/**
 * Exercícios de MMC e MDC.
 *
 * As armadilhas cobrem os três enganos clássicos: trocar um conceito pelo
 * outro, usar o produto no lugar do MMC e somar os expoentes em vez de
 * escolher o maior ou o menor.
 */
export const geradorMmcMdc: GeradorExercicio<number> = {
  topicoId: 'mmc-mdc',
  formatoResposta: 'um número inteiro, ex.: 36',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const alvo: Alvo = rng.booleano() ? 'mdc' : 'mmc';
    const [a, b] = sortearPar(nivel, rng);

    const resolucao = alvo === 'mdc' ? mdcComPassos(a, b) : mmcComPassos(a, b);

    return {
      id: `mmc-mdc-${nivel}-${alvo}-${a}-${b}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado:
        alvo === 'mdc'
          ? 'Qual é o máximo divisor comum dos dois números?'
          : 'Qual é o mínimo múltiplo comum dos dois números?',
      enunciadoTex: `\\operatorname{${alvo}}(${a}, ${b}) = \\;?`,
      gabarito: resolucao.resultado,
      resolucao,
      conceitos: ['mmc-mdc.fatoracao', alvo === 'mdc' ? 'mmc-mdc.mdc' : 'mmc-mdc.mmc'],
      armadilhas: armadilhasDe(a, b, alvo),
      dica: nivel === 'facil' ? 'Comece fatorando os dois números em primos.' : undefined,
    };
  },

  analisar: (entrada) => {
    const limpo = entrada.trim().replace(/\s+/g, '');
    return /^\d+$/.test(limpo) ? Number(limpo) : null;
  },

  saoEquivalentes: (a, b) => a === b,
  formatar: (valor) => String(valor),
};

function sortearPar(nivel: Nivel, rng: Rng): readonly [number, number] {
  switch (nivel) {
    case 'facil': {
      // Números pequenos, com fatoração curta e visível.
      const a = rng.inteiro(4, 20);
      const b = rng.inteiro(4, 20);
      return [a, b];
    }
    case 'medio': {
      // Garante ao menos um fator comum, para que o MDC não seja trivialmente 1.
      const comum = rng.escolher([2, 3, 4, 5, 6]);
      return [comum * rng.inteiro(2, 9), comum * rng.inteiro(2, 9)];
    }
    case 'dificil': {
      const a = rng.inteiro(20, 150);
      const b = rng.inteiro(20, 150);
      return [a, b];
    }
  }
}

function armadilhasDe(a: number, b: number, alvo: Alvo): readonly Armadilha<number>[] {
  const divisor = mdc(a, b);
  const multiplo = mmc(a, b);
  const gabarito = alvo === 'mdc' ? divisor : multiplo;

  const candidatas: Armadilha<number>[] = [
    {
      // Trocar um conceito pelo outro.
      resposta: alvo === 'mdc' ? multiplo : divisor,
      diagnostico:
        alvo === 'mdc'
          ? `${multiplo} é o MMC, não o MDC. O MDC é um DIVISOR, então nunca pode ser maior ` +
            'que os próprios números; o MMC é um MÚLTIPLO, e nunca é menor que eles.'
          : `${divisor} é o MDC, não o MMC. O MMC é um MÚLTIPLO comum, então precisa ser maior ` +
            'ou igual a ambos; o MDC é um divisor, e nunca os ultrapassa.',
      passo: 1,
      conceito: alvo === 'mdc' ? 'mmc-mdc.mdc' : 'mmc-mdc.mmc',
    },
    {
      // Usar o produto no lugar do MMC.
      resposta: a * b,
      diagnostico:
        `${a * b} é o produto dos dois números. Ele é de fato um múltiplo comum, mas não o ` +
        `MENOR: dividindo pelo MDC (${divisor}) chegamos a ${multiplo}, que também serve e é menor.`,
      passo: 1,
      conceito: 'mmc-mdc.mmc',
    },
    {
      // Somar os expoentes de cada primo em vez de escolher máximo ou mínimo.
      resposta: produtoComExpoentesSomados(a, b),
      diagnostico:
        'Parece que você somou os expoentes de cada primo. A soma dos expoentes corresponde ao ' +
        'produto dos números; para o MMC o expoente é o MAIOR dos dois, e para o MDC o MENOR.',
      passo: 1,
      conceito: 'mmc-mdc.fatoracao',
    },
  ];

  const vistas = new Set<number>([gabarito]);

  return candidatas.filter((armadilha) => {
    if (vistas.has(armadilha.resposta)) {
      return false;
    }
    vistas.add(armadilha.resposta);
    return true;
  });
}

/** O que sai de somar os expoentes de cada primo comum — ou seja, o produto. */
function produtoComExpoentesSomados(a: number, b: number): number {
  const fatoresB = new Map(fatorar(b).map(({ primo, expoente }) => [primo, expoente]));
  let resultado = 1;

  for (const { primo, expoente } of fatorar(a)) {
    resultado *= primo ** (expoente + (fatoresB.get(primo) ?? 0));
    fatoresB.delete(primo);
  }
  for (const [primo, expoente] of fatoresB) {
    resultado *= primo ** expoente;
  }

  return resultado;
}
