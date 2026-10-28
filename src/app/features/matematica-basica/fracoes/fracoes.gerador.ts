import { Fracao, OperacaoFracao, mmc, operacaoParaTex, resolverComPassos } from '@core/math';
import { Rng } from '@core/treino/rng';
import { Armadilha, Exercicio, GeradorExercicio, Nivel } from '@core/treino/treino.model';

/** Pares de denominadores sem fator comum, que forçam o cálculo real do MMC. */
const PARES_COPRIMOS: readonly (readonly [number, number])[] = [
  [2, 3],
  [2, 5],
  [2, 7],
  [3, 4],
  [3, 5],
  [3, 7],
  [3, 8],
  [4, 5],
  [4, 7],
  [4, 9],
  [5, 6],
  [5, 8],
  [5, 9],
  [6, 7],
  [7, 8],
  [7, 9],
  [8, 9],
];

/**
 * Gerador de exercícios de frações.
 *
 * O gabarito e a resolução comentada vêm do mesmo motor usado na aba Explorar;
 * o que este arquivo acrescenta é o sorteio por nível e, principalmente, as
 * armadilhas — os erros clássicos do tema, previstos de antemão para que a
 * correção diga *qual* foi o equívoco, e não apenas que houve um.
 */
export const geradorFracoes: GeradorExercicio<Fracao> = {
  topicoId: 'fracoes',
  formatoResposta: 'ex.: 3/4, -2/5 ou 7',

  gerar(nivel: Nivel, rng: Rng): Exercicio<Fracao> {
    const { a, b, operacao } = sortear(nivel, rng);

    const resolucao = resolverComPassos(a, operacao, b);

    return {
      id: `fracoes-${nivel}-${a}-${operacao}-${b}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: 'Calcule e escreva o resultado na forma mais simples.',
      enunciadoTex: `${operacaoParaTex(a, operacao, b)} = \\;?`,
      gabarito: resolucao.resultado,
      resolucao,
      conceitos: conceitosDe(operacao, a, b),
      armadilhas: armadilhasDe(a, b, operacao, resolucao.resultado),
      dica: nivel === 'facil' ? 'Comece comparando os denominadores.' : undefined,
    };
  },

  analisar: (entrada: string): Fracao | null => Fracao.analisar(entrada),

  // Equivalência, não igualdade textual: 6/8 conta como 3/4.
  saoEquivalentes: (a: Fracao, b: Fracao): boolean => a.igualA(b),

  formatar: (valor: Fracao): string => valor.toString(),
};

interface Sorteio {
  readonly a: Fracao;
  readonly b: Fracao;
  readonly operacao: OperacaoFracao;
}

function sortear(nivel: Nivel, rng: Rng): Sorteio {
  switch (nivel) {
    case 'facil':
      return sortearFacil(rng);
    case 'medio':
      return sortearMedio(rng);
    case 'dificil':
      return sortearDificil(rng);
  }
}

/**
 * Fácil: denominadores em que um é múltiplo do outro, de modo que o
 * denominador comum é o próprio maior deles. Resultado sempre positivo.
 */
function sortearFacil(rng: Rng): Sorteio {
  const base = rng.escolher([2, 3, 4, 5, 6, 8]);
  const fator = rng.escolher([1, 2, 3]);
  const maior = base * fator;

  let a = Fracao.criar(rng.inteiro(1, base - 1 || 1), base);
  let b = Fracao.criar(rng.inteiro(1, maior - 1), maior);

  const operacao: OperacaoFracao = rng.booleano() ? 'somar' : 'subtrair';

  // Na subtração, a maior fração vem primeiro para o resultado não ficar negativo.
  if (operacao === 'subtrair' && a.comparar(b) < 0) {
    [a, b] = [b, a];
  }

  return { a, b, operacao };
}

/**
 * Médio: denominadores coprimos — o MMC é o produto, e não há como escapar de
 * converter as duas frações. Inclui multiplicação.
 */
function sortearMedio(rng: Rng): Sorteio {
  const [d1, d2] = rng.escolher(PARES_COPRIMOS);
  const ordenados = rng.booleano() ? [d1, d2] : [d2, d1];

  const a = Fracao.criar(rng.inteiro(1, ordenados[0]! - 1 || 1), ordenados[0]!);
  const b = Fracao.criar(rng.inteiro(1, ordenados[1]! - 1 || 1), ordenados[1]!);

  const operacao = rng.escolher<OperacaoFracao>(['somar', 'subtrair', 'multiplicar']);
  return { a, b, operacao };
}

/** Difícil: as quatro operações, com negativos e frações impróprias. */
function sortearDificil(rng: Rng): Sorteio {
  const operacao = rng.escolher<OperacaoFracao>(['somar', 'subtrair', 'multiplicar', 'dividir']);

  const criar = (permitirZero: boolean): Fracao => {
    const denominador = rng.inteiro(2, 12);
    let numerador = rng.inteiro(1, 15) * rng.sinal();
    if (!permitirZero && numerador === 0) {
      numerador = 1;
    }
    return Fracao.criar(numerador, denominador);
  };

  const a = criar(true);
  // O divisor nunca pode ser zero.
  const b = criar(false);

  return { a, b, operacao };
}

function conceitosDe(operacao: OperacaoFracao, a: Fracao, b: Fracao): readonly string[] {
  const conceitos = ['fracoes.operacoes'];

  // O MMC só está em jogo quando há denominadores diferentes a igualar.
  if ((operacao === 'somar' || operacao === 'subtrair') && a.denominador !== b.denominador) {
    conceitos.push('fracoes.mmc');
  }

  conceitos.push('fracoes.simplificacao');
  return conceitos;
}

/** Constrói uma fração ignorando combinações impossíveis (denominador zero). */
function tentar(construir: () => Fracao): Fracao | null {
  try {
    return construir();
  } catch {
    return null;
  }
}

/**
 * Os erros típicos de cada operação, com o diagnóstico correspondente.
 *
 * Armadilhas que coincidem com o gabarito são descartadas: nesses casos o erro
 * previsto leva, por acaso, à resposta certa, e apontá-lo confundiria.
 */
function armadilhasDe(
  a: Fracao,
  b: Fracao,
  operacao: OperacaoFracao,
  gabarito: Fracao,
): readonly Armadilha<Fracao>[] {
  const candidatas =
    operacao === 'somar' || operacao === 'subtrair'
      ? armadilhasAditivas(a, b, operacao)
      : operacao === 'multiplicar'
        ? armadilhasMultiplicacao(a, b)
        : armadilhasDivisao(a, b);

  const vistas: Fracao[] = [];

  return candidatas.filter((armadilha) => {
    if (armadilha.resposta.igualA(gabarito)) {
      return false;
    }
    if (vistas.some((anterior) => anterior.igualA(armadilha.resposta))) {
      return false;
    }
    vistas.push(armadilha.resposta);
    return true;
  });
}

function armadilhasAditivas(
  a: Fracao,
  b: Fracao,
  operacao: 'somar' | 'subtrair',
): readonly Armadilha<Fracao>[] {
  const sinal = operacao === 'somar' ? 1 : -1;
  const numeradorCombinado = a.numerador + sinal * b.numerador;
  const denominadorComum = mmc(a.denominador, b.denominador);
  const mesmosDenominadores = a.denominador === b.denominador;

  // Índices das etapas na resolução gerada por `resolverComPassos`.
  const indiceConversao = 2;
  const indiceOperar = mesmosDenominadores ? 2 : 3;

  const armadilhas: Armadilha<Fracao>[] = [];
  const verbo = operacao === 'somar' ? 'somou' : 'subtraiu';

  const operandoNosDoisTermos = tentar(() =>
    Fracao.criar(numeradorCombinado, a.denominador + sinal * b.denominador),
  );
  if (operandoNosDoisTermos) {
    armadilhas.push({
      resposta: operandoNosDoisTermos,
      diagnostico:
        `Parece que você ${verbo} numeradores com numeradores e denominadores com denominadores. ` +
        'O denominador indica o tamanho das partes, não uma quantidade a ser somada — por isso ' +
        'ele não entra na conta. Repare que 1/2 + 1/2 daria 2/4, ou seja 1/2, quando o resultado é 1.',
      passo: indiceOperar,
      conceito: 'fracoes.operacoes',
    });
  }

  if (!mesmosDenominadores) {
    const semConverterNumeradores = tentar(() =>
      Fracao.criar(numeradorCombinado, denominadorComum),
    );
    if (semConverterNumeradores) {
      armadilhas.push({
        resposta: semConverterNumeradores,
        diagnostico:
          `Você encontrou o denominador comum correto (${denominadorComum}), mas manteve os ` +
          'numeradores originais. Ao multiplicar o denominador por um fator, o numerador precisa ' +
          'ser multiplicado pelo mesmo fator — é isso que preserva o valor da fração.',
        passo: indiceConversao,
        conceito: 'fracoes.mmc',
      });
    }

    const produto = a.denominador * b.denominador;
    if (produto !== denominadorComum) {
      const produtoSemConverter = tentar(() => Fracao.criar(numeradorCombinado, produto));
      if (produtoSemConverter) {
        armadilhas.push({
          resposta: produtoSemConverter,
          diagnostico:
            `Você usou o produto dos denominadores (${produto}) como denominador comum — isso é ` +
            `válido, embora o MMC (${denominadorComum}) deixe os números menores. O problema é ` +
            'que os numeradores não foram convertidos junto.',
          passo: indiceConversao,
          conceito: 'fracoes.mmc',
        });
      }
    }
  }

  return armadilhas;
}

function armadilhasMultiplicacao(a: Fracao, b: Fracao): readonly Armadilha<Fracao>[] {
  const armadilhas: Armadilha<Fracao>[] = [];

  const emCruz = tentar(() =>
    Fracao.criar(a.numerador * b.denominador, a.denominador * b.numerador),
  );
  if (emCruz) {
    armadilhas.push({
      resposta: emCruz,
      diagnostico:
        'Você multiplicou em cruz, o que equivale a inverter a segunda fração. Esse é o ' +
        'procedimento da divisão; na multiplicação é em linha: numerador com numerador, ' +
        'denominador com denominador.',
      passo: 1,
      conceito: 'fracoes.operacoes',
    });
  }

  if (a.denominador !== b.denominador) {
    const denominadorComum = mmc(a.denominador, b.denominador);
    const comDenominadorComum = tentar(() =>
      Fracao.criar(
        a.comDenominador(denominadorComum).numerador * b.comDenominador(denominadorComum).numerador,
        denominadorComum,
      ),
    );
    if (comDenominadorComum) {
      armadilhas.push({
        resposta: comDenominadorComum,
        diagnostico:
          'Você igualou os denominadores antes de multiplicar. Isso é necessário na soma e na ' +
          'subtração, mas na multiplicação não — e aqui altera o resultado.',
        passo: 1,
        conceito: 'fracoes.operacoes',
      });
    }
  }

  return armadilhas;
}

function armadilhasDivisao(a: Fracao, b: Fracao): readonly Armadilha<Fracao>[] {
  const armadilhas: Armadilha<Fracao>[] = [];

  const semInverter = tentar(() =>
    Fracao.criar(a.numerador * b.numerador, a.denominador * b.denominador),
  );
  if (semInverter) {
    armadilhas.push({
      resposta: semInverter,
      diagnostico:
        'Você multiplicou as duas frações diretamente, sem inverter a segunda. Dividir por c/d ' +
        'é multiplicar por d/c, porque esse é o número que, multiplicado por c/d, resulta em 1.',
      passo: 1,
      conceito: 'fracoes.operacoes',
    });
  }

  const invertendoAPrimeira = tentar(() =>
    Fracao.criar(a.denominador * b.numerador, a.numerador * b.denominador),
  );
  if (invertendoAPrimeira) {
    armadilhas.push({
      resposta: invertendoAPrimeira,
      diagnostico:
        'A fração invertida foi a primeira. Na divisão, quem se inverte é o divisor, ou seja, ' +
        'a segunda fração.',
      passo: 1,
      conceito: 'fracoes.operacoes',
    });
  }

  return armadilhas;
}
