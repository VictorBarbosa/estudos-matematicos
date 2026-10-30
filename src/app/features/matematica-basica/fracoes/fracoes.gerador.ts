import {
  Fracao,
  OperacaoFracao,
  decimalParaFracaoComPassos,
  ehNumeroMisto,
  mmc,
  operacaoParaTex,
  resolverComPassos,
} from '@core/math';
 
import { Armadilha, Exercicio, GeradorExercicio, Nivel }  from '@core/treino/models/treino.model';

import { Rng } from '@core/treino/rng/rng';

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
/** O conceito de cada operação entre frações próprias ou impróprias. */
export const CONCEITO_DA_OPERACAO: Readonly<Record<OperacaoFracao, string>> = {
  somar: 'fracoes.soma',
  subtrair: 'fracoes.subtracao',
  multiplicar: 'fracoes.multiplicacao',
  dividir: 'fracoes.divisao',
};

/**
 * O conceito de cada operação COM NÚMEROS MISTOS.
 *
 * São conceitos à parte porque o erro é outro: em 2½ × 1½ a tentação é
 * multiplicar inteiro com inteiro e fração com fração, o que não funciona;
 * na divisão, esquecer de converter antes de inverter. Exigir os dois tipos
 * separadamente é o que garante que as duas formas sejam praticadas.
 */
export const CONCEITO_DA_OPERACAO_MISTA: Readonly<Record<OperacaoFracao, string>> = {
  somar: 'fracoes.mista-soma',
  subtrair: 'fracoes.mista-subtracao',
  multiplicar: 'fracoes.mista-multiplicacao',
  dividir: 'fracoes.mista-divisao',
};

export const geradorFracoes: GeradorExercicio<Fracao> = {
  topicoId: 'fracoes',
  formatoResposta: 'ex.: 3/4, -2/5, 7 ou o misto 2 1/3',

  gerar(nivel: Nivel, rng: Rng): Exercicio<Fracao> {
    // Converter decimal em fração entra no sorteio sem competir com as
    // operações: a etapa exige cinco acertos em cada uma delas, e diluí-las
    // seria tornar a exigência mais lenta sem ensinar mais.
    if (rng.booleano(0.15)) {
      return exercicioConversao(nivel, rng);
    }

    const sorteio = sortear(nivel, rng);
    const { operacao, comMista } = sorteio;

    /*
     * Em forma mista o enunciado mostra a fração já reduzida — `2\frac{1}{2}`,
     * nunca `\frac{10}{4}`. Reduzir aqui faz a resolução e as armadilhas
     * partirem dos mesmos números que o aluno está lendo.
     */
    const a = comMista ? sorteio.a.simplificar() : sorteio.a;
    const b = comMista ? sorteio.b.simplificar() : sorteio.b;

    // `misto` acrescenta à resolução a conversão inicial e a volta à forma
    // mista no fim — as duas passagens que o enunciado em misto exige.
    const resolucao = resolverComPassos(a, operacao, b, comMista);

    /*
     * Quando há fração imprópria em jogo, o enunciado mostra o número misto.
     * É a forma em que a quantidade se diz em voz alta — "duas pizzas e um
     * terço" — e a que aparece em receita, régua e planta baixa; ler e operar
     * nessa forma é parte do assunto, não enfeite.
     */
    const enunciadoTex = `${operacaoParaTex(a, operacao, b, comMista)} = \\;?`;

    return {
      id: `fracoes-${nivel}-${a}-${operacao}-${b}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: comMista
        ? 'Converta os números mistos em frações, calcule e simplifique.'
        : 'Calcule e escreva o resultado na forma mais simples.',
      enunciadoTex,
      gabarito: resolucao.resultado,
      resolucao,
      conceitos: conceitosDe(operacao, a, b, comMista),
      armadilhas: armadilhasDe(a, b, operacao, resolucao.resultado, deslocamentoMisto(a, b, comMista)),
      dica:
        nivel === 'facil'
          ? comMista
            ? 'Um número misto vira fração: 2 1/3 é (2·3 + 1)/3.'
            : 'Comece comparando os denominadores.'
          : undefined,
    };
  },

  analisar: (entrada: string): Fracao | null => Fracao.analisar(entrada),

  // Equivalência, não igualdade textual: 6/8 conta como 3/4.
  saoEquivalentes: (a: Fracao, b: Fracao): boolean => a.igualA(b),

  // Resultado impróprio aparece como misto, que é como ele se lê — e o campo
  // aceita essa mesma forma de volta.
  formatar: (valor: Fracao): string =>
    valor.simplificar().ehImpropria ? valor.toStringMisto() : valor.toString(),
};


/**
 * Decimais usados na conversão, por nível.
 *
 * Escolhidos à mão porque o que se aprende aqui é o VALOR POSICIONAL: 0,5 e
 * 0,25 são os que já se reconhecem de cor; 0,375 e 0,875 obrigam a ir até os
 * milésimos; e 1,2 ou 2,75 mostram que a parte inteira não atrapalha.
 */
const DECIMAIS_POR_NIVEL: Readonly<Record<Nivel, readonly number[]>> = {
  facil: [0.5, 0.25, 0.75, 0.2, 0.4, 0.6, 0.8, 0.1],
  medio: [0.35, 0.125, 0.375, 0.625, 0.875, 0.05, 0.45, 1.5, 1.25, 2.4],
  dificil: [0.025, 0.0625, 0.104, 1.375, 2.75, 3.08, 0.015, 1.04],
};

/**
 * Escreva o decimal como fração irredutível.
 *
 * O caminho é o mesmo que a teoria descreve: ler a última casa — décimos,
 * centésimos, milésimos — para achar o denominador, e simplificar depois. A
 * resposta precisa vir em forma de fração, senão devolver o próprio número
 * dado passaria por acerto (ver `exigeFracao`).
 */
function exercicioConversao(nivel: Nivel, rng: Rng): Exercicio<Fracao> {
  const magnitude = rng.escolher(DECIMAIS_POR_NIVEL[nivel]);
  // O sinal entra junto com os negativos do resto do tópico.
  const decimal = nivel === 'facil' || rng.booleano(0.7) ? magnitude : -magnitude;

  const { resultado, passos } = decimalParaFracaoComPassos(decimal);
  const casas = String(Math.abs(decimal)).split('.')[1]?.length ?? 0;
  const potencia = 10 ** casas;

  return {
    id: `fracoes-conv-${decimal}-${rng.inteiro(0, 9999)}`,
    nivel,
    /*
     * "Como fração", e não "como fração irredutível": a correção deste site é
     * por VALOR — 75/100 conta como 3/4 —, então exigir a forma irredutível no
     * enunciado prometeria uma cobrança que não existe. Simplificar continua
     * sendo o último passo da resolução, e é o que a dica pede.
     */
    enunciado: 'Escreva este decimal como fração.',
    enunciadoTex: `${String(decimal).replace('.', '{,}')} = \\;?`,
    gabarito: resultado,
    resolucao: { resultado, passos },
    conceitos: ['fracoes.decimais', 'fracoes.simplificacao'],
    exigeFracao: true,
    armadilhas: semColisoesDeFracao(
      [
        {
          resposta: Fracao.criar(Math.round(decimal * potencia), 10),
          diagnostico:
            'O denominador é 10 elevado ao número de CASAS decimais, não 10 sempre. Com ' +
            `${casas} casas, ele vale ${potencia}.`,
          passo: 0,
          conceito: 'fracoes.decimais',
        },
        {
          resposta: Fracao.criar(1, Math.max(2, Math.round(1 / Math.abs(decimal)) || 2)),
          diagnostico:
            'Inverter o decimal não é convertê-lo: 0,25 é 25 centésimos, ou seja 25/100 — o ' +
            'fato de dar 1/4 vem da simplificação, não de dividir 1 pelo número.',
          passo: 0,
          conceito: 'fracoes.decimais',
        },
      ],
      resultado,
    ),
    dica:
      nivel === 'facil'
        ? 'Quantas casas depois da vírgula? Esse é o expoente do 10. Simplifique no fim.'
        : undefined,
  };
}

interface Sorteio {
  readonly a: Fracao;
  readonly b: Fracao;
  readonly operacao: OperacaoFracao;
  /** O enunciado mostra os operandos como números mistos? */
  readonly comMista: boolean;
}

/**
 * As quatro operações aparecem em TODOS os níveis.
 *
 * A etapa só é vencida com cinco acertos em cada uma delas, então deixar a
 * divisão só no Difícil obrigaria a trocar de nível para cumprir a exigência —
 * o que não tem nada de pedagógico. O que muda com o nível é o tamanho dos
 * números, o sinal e a presença de mistas, não quais contas existem.
 */
const OPERACOES: readonly OperacaoFracao[] = ['somar', 'subtrair', 'multiplicar', 'dividir'];

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
 * denominador comum é o próprio maior deles. Tudo positivo, sem mistas.
 */
function sortearFacil(rng: Rng): Sorteio {
  const operacao = rng.escolher(OPERACOES);
  const base = rng.escolher([2, 3, 4, 5, 6, 8]);
  const fator = rng.escolher([1, 2, 3]);
  const maior = base * fator;

  let a = Fracao.criar(rng.inteiro(1, base - 1 || 1), base);
  let b = Fracao.criar(rng.inteiro(1, maior - 1), maior);

  // Na subtração, a maior fração vem primeiro para o resultado não ficar
  // negativo: o sinal entra no Médio, com a reta numérica já discutida.
  if (operacao === 'subtrair' && a.comparar(b) < 0) {
    [a, b] = [b, a];
  }

  return { a, b, operacao, comMista: false };
}

/**
 * Médio: denominadores coprimos — o MMC é o produto, e não há como escapar de
 * converter as duas frações. Entram os negativos e os primeiros mistos.
 */
function sortearMedio(rng: Rng): Sorteio {
  const operacao = rng.escolher(OPERACOES);
  const [d1, d2] = rng.escolher(PARES_COPRIMOS);
  const ordenados = rng.booleano() ? [d1, d2] : [d2, d1];

  const comMista = rng.booleano(0.35);
  const negativos = rng.booleano(0.3);

  const montar = (denominador: number): Fracao => {
    const proprio = rng.inteiro(1, denominador - 1 || 1);
    // Misto: uma ou duas unidades inteiras somadas à parte própria.
    const numerador = comMista ? rng.inteiro(1, 2) * denominador + proprio : proprio;
    return Fracao.criar(negativos && rng.booleano() ? -numerador : numerador, denominador);
  };

  return { a: montar(ordenados[0]!), b: montar(ordenados[1]!), operacao, comMista };
}

/** Difícil: as quatro operações, com negativos e mistos em qualquer posição. */
function sortearDificil(rng: Rng): Sorteio {
  const operacao = rng.escolher(OPERACOES);
  const comMista = rng.booleano(0.5);

  const criar = (permitirZero: boolean): Fracao => {
    const denominador = rng.inteiro(2, 12);
    const proprio = rng.inteiro(1, denominador - 1 || 1);
    const magnitude = comMista ? rng.inteiro(1, 3) * denominador + proprio : rng.inteiro(1, 15);

    let numerador = magnitude * rng.sinal();
    if (!permitirZero && numerador === 0) {
      numerador = magnitude || 1;
    }
    return Fracao.criar(numerador, denominador);
  };

  const a = criar(true);
  // O divisor nunca pode ser zero.
  const b = criar(false);

  return { a, b, operacao, comMista };
}

/**
 * Os conceitos do exercício, começando pelo da operação.
 *
 * É esse primeiro id que a progressão conta para exigir cinco acertos em cada
 * uma das quatro operações — por isso ele é específico, e não o genérico
 * `fracoes.operacoes`.
 */
function conceitosDe(
  operacao: OperacaoFracao,
  a: Fracao,
  b: Fracao,
  comMista: boolean,
): readonly string[] {
  const conceitos = comMista
    ? [CONCEITO_DA_OPERACAO_MISTA[operacao], 'fracoes.mistas', 'fracoes.operacoes']
    : [CONCEITO_DA_OPERACAO[operacao], 'fracoes.operacoes'];

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
  deslocamento: number,
): readonly Armadilha<Fracao>[] {
  const candidatas =
    operacao === 'somar' || operacao === 'subtrair'
      ? armadilhasAditivas(a, b, operacao)
      : operacao === 'multiplicar'
        ? armadilhasMultiplicacao(a, b)
        : armadilhasDivisao(a, b);

  const reposicionadas = candidatas.map((armadilha) => ({
    ...armadilha,
    passo: armadilha.passo === undefined ? undefined : armadilha.passo + deslocamento,
  }));

  return semColisoesDeFracao(reposicionadas, gabarito);
}

/**
 * Quantos passos a conversão inicial empurra os demais.
 *
 * As armadilhas apontam o passo em que o aluno se perdeu. Com o enunciado em
 * forma mista, a resolução ganha um passo antes de todos os outros — e sem
 * este deslocamento o dedo passaria a apontar o passo errado.
 */
function deslocamentoMisto(a: Fracao, b: Fracao, comMista: boolean): number {
  return comMista && (ehNumeroMisto(a) || ehNumeroMisto(b)) ? 1 : 0;
}

/**
 * Descarta armadilhas que caem sobre o gabarito ou sobre outra já listada.
 *
 * É a versão para frações de `semColisoes`: a comparação precisa ser por
 * valor, porque 2/4 e 1/2 são a mesma resposta escrita de dois jeitos.
 */
function semColisoesDeFracao(
  candidatas: readonly Armadilha<Fracao>[],
  gabarito: Fracao,
): readonly Armadilha<Fracao>[] {
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
