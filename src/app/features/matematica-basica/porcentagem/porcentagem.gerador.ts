import {
  fatorDe,
  porcentagemDeComPassos,
  sucessivasComPassos,
  variacaoComPassos,
  variacaoPercentualComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng';
import {
  Armadilha,
  Exercicio,
  GeradorExercicio,
  Nivel,
  semColisoes,
} from '@core/treino/treino.model';

type Modalidade = 'parte' | 'variacao' | 'sucessivas' | 'percentual';

/** Tolerância de centavos: respostas monetárias não precisam bater no bit. */
const TOLERANCIA = 1e-4;

const proximos = (a: number, b: number): boolean => Math.abs(a - b) < TOLERANCIA;

/** Descarta armadilhas que coincidem com o gabarito deste exercício. */
function limpar(
  armadilhas: readonly Armadilha<number>[],
  gabarito: number,
): readonly Armadilha<number>[] {
  return semColisoes(armadilhas, gabarito, proximos);
}

export const geradorPorcentagem: GeradorExercicio<number> = {
  topicoId: 'porcentagem',
  formatoResposta: 'um número, ex.: 36 ou 1234,50',

  gerar(nivel: Nivel, rng: Rng): Exercicio<number> {
    const modalidade = sortearModalidade(nivel, rng);

    switch (modalidade) {
      case 'parte':
        return exercicioParte(nivel, rng);
      case 'variacao':
        return exercicioVariacao(nivel, rng);
      case 'sucessivas':
        return exercicioSucessivas(nivel, rng);
      case 'percentual':
        return exercicioPercentual(nivel, rng);
    }
  },

  analisar: (entrada) => {
    const limpo = entrada
      .trim()
      .replace(/\s|%|R\$/g, '')
      .replace(',', '.');
    if (limpo === '' || !/^[+-]?\d*\.?\d+$/.test(limpo)) {
      return null;
    }
    return Number(limpo);
  },

  saoEquivalentes: proximos,
  formatar: (valor) =>
    Number(valor.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 }),
};

function sortearModalidade(nivel: Nivel, rng: Rng): Modalidade {
  switch (nivel) {
    case 'facil':
      return rng.escolher<Modalidade>(['parte', 'variacao']);
    case 'medio':
      return rng.escolher<Modalidade>(['variacao', 'percentual', 'parte']);
    case 'dificil':
      return rng.escolher<Modalidade>(['sucessivas', 'percentual', 'variacao']);
  }
}

function identificador(nome: string, rng: Rng): string {
  return `porcentagem-${nome}-${rng.inteiro(0, 99999)}`;
}

function exercicioParte(nivel: Nivel, rng: Rng): Exercicio<number> {
  const percentual = rng.escolher(
    nivel === 'facil' ? [10, 20, 25, 50] : [5, 12, 15, 18, 35, 42, 65],
  );
  const valor = rng.inteiro(2, 40) * (nivel === 'facil' ? 10 : 5);
  const resolucao = porcentagemDeComPassos(percentual, valor);

  return {
    id: identificador('parte', rng),
    nivel,
    enunciado: 'Calcule a porcentagem indicada.',
    enunciadoTex: `${percentual}\\% \\text{ de } ${valor} = \;?`,
    gabarito: resolucao.resultado,
    resolucao,
    conceitos: ['porcentagem.definicao'],
    armadilhas: limpar(
      [
        {
          resposta: percentual * valor,
          diagnostico:
            'Você multiplicou pelo percentual inteiro, esquecendo de dividir por cem. ' +
            `${percentual}% é ${percentual}/100, ou seja ${percentual / 100}.`,
          passo: 0,
          conceito: 'porcentagem.definicao',
        },
        {
          resposta: valor / percentual,
          diagnostico:
            'Você dividiu o valor pelo percentual. "Por cento de" é multiplicação pela fração ' +
            'p/100, não divisão.',
          passo: 1,
          conceito: 'porcentagem.definicao',
        },
      ],
      resolucao.resultado,
    ),
    dica:
      nivel === 'facil' ? 'Transforme a porcentagem em decimal antes de multiplicar.' : undefined,
  };
}

function exercicioVariacao(nivel: Nivel, rng: Rng): Exercicio<number> {
  const percentual = rng.escolher([10, 15, 20, 25, 30, 40]) * (rng.booleano() ? 1 : -1);
  const valor = rng.inteiro(4, 40) * 25;
  const resolucao = variacaoComPassos(valor, percentual);
  const aumentou = percentual > 0;

  return {
    id: identificador('variacao', rng),
    nivel,
    enunciado: `Um valor de ${valor} sofre ${aumentou ? 'um acréscimo' : 'um desconto'} de ${Math.abs(percentual)}%. Qual é o valor final?`,
    enunciadoTex: `${valor} \;${aumentou ? '+' : '-'}\; ${Math.abs(percentual)}\\% = \;?`,
    gabarito: resolucao.resultado,
    resolucao,
    conceitos: ['porcentagem.fator', 'porcentagem.definicao'],
    armadilhas: limpar(
      [
        {
          resposta: (Math.abs(percentual) / 100) * valor,
          diagnostico:
            'Você calculou apenas a parte que muda, mas a pergunta é pelo valor FINAL — falta ' +
            `${aumentou ? 'somá-la ao' : 'subtraí-la do'} valor original.`,
          passo: 1,
          conceito: 'porcentagem.fator',
        },
        {
          resposta: valor * fatorDe(-percentual),
          diagnostico: aumentou
            ? 'Você aplicou um desconto no lugar do acréscimo: o fator deveria ser maior que 1.'
            : 'Você aplicou um acréscimo no lugar do desconto: o fator deveria ser menor que 1.',
          passo: 0,
          conceito: 'porcentagem.fator',
        },
      ],
      resolucao.resultado,
    ),
  };
}

function exercicioSucessivas(nivel: Nivel, rng: Rng): Exercicio<number> {
  const primeiro = rng.escolher([10, 15, 20, 25]) * (rng.booleano() ? 1 : -1);
  const segundo = rng.escolher([10, 15, 20, 25]) * (rng.booleano() ? 1 : -1);
  const valor = rng.inteiro(4, 20) * 50;

  const resolucao = sucessivasComPassos(valor, [primeiro, segundo]);
  const somaIngenua = valor * fatorDe(primeiro + segundo);

  const armadilhas: Armadilha<number>[] = [
    {
      resposta: somaIngenua,
      diagnostico:
        `Você somou os percentuais (${primeiro > 0 ? '+' : ''}${primeiro}% e ` +
        `${segundo > 0 ? '+' : ''}${segundo}%) e aplicou de uma vez. Variações sucessivas não ` +
        'se somam: a segunda incide sobre o valor já alterado, então os FATORES é que se multiplicam.',
      passo: 1,
      conceito: 'porcentagem.sucessivas',
    },
  ];

  return {
    id: identificador('sucessivas', rng),
    nivel,
    enunciado: 'Aplique as duas variações, uma depois da outra, e informe o valor final.',
    enunciadoTex:
      `${valor} \;\\xrightarrow{${primeiro > 0 ? '+' : ''}${primeiro}\\%}\; \\square ` +
      `\;\\xrightarrow{${segundo > 0 ? '+' : ''}${segundo}\\%}\; ?`,
    gabarito: resolucao.resultado,
    resolucao,
    conceitos: ['porcentagem.sucessivas', 'porcentagem.fator'],
    armadilhas: limpar(armadilhas, resolucao.resultado),
  };
}

function exercicioPercentual(nivel: Nivel, rng: Rng): Exercicio<number> {
  const de = rng.inteiro(2, 20) * 10;
  const fator = rng.escolher([0.5, 0.75, 0.8, 1.2, 1.25, 1.5, 2]);
  const para = Math.round(de * fator);

  const resolucao = variacaoPercentualComPassos(de, para);

  return {
    id: identificador('percentual', rng),
    nivel,
    enunciado: `De quantos por cento foi a variação de ${de} para ${para}? (use sinal negativo se houve queda)`,
    enunciadoTex: `${de} \;\\longrightarrow\; ${para} \\qquad \\Delta\\% = \;?`,
    gabarito: resolucao.resultado,
    resolucao,
    conceitos: ['porcentagem.variacao'],
    armadilhas: limpar(
      [
        {
          resposta: ((para - de) / para) * 100,
          diagnostico:
            'Você dividiu pelo valor FINAL. A variação percentual sempre se compara ao valor ' +
            'inicial, que é o ponto de partida da mudança.',
          passo: 1,
          conceito: 'porcentagem.variacao',
        },
        {
          resposta: (para / de) * 100,
          diagnostico:
            `${((para / de) * 100).toFixed(0)}% é o quanto o valor final representa do inicial, ` +
            'não o quanto ele VARIOU. Para a variação, subtraia 100% desse resultado.',
          passo: 0,
          conceito: 'porcentagem.variacao',
        },
      ],
      resolucao.resultado,
    ),
  };
}
