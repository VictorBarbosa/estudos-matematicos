import {
  enunciadoDoMolde,
  moldesDe,
  textoDoMolde,
  traducoesDoMolde,
} from '@core/enunciados/moldes/moldes.model';
import {
  Fracao,
  OperacaoFracao,
  decimalParaFracaoComPassos,
  ehNumeroMisto,
  mmc,
  observarSimplificacao,
  operacaoParaTex,
  resolverComPassos,
} from '@core/math';

import { Armadilha, Exercicio, GeradorExercicio, Nivel } from '@core/treino/models/treino.model';

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

/**
 * Operar com um número INTEIRO.
 *
 * O site só propunha fração com fração, e isso deixava de fora a conta mais
 * comum das duas: 3/4 de 20, meia dúzia de 1/3, o dobro de 2/5. O erro é
 * próprio — multiplicar o inteiro também no denominador, chegando a 15/20 em
 * vez de 15/4 — e por isso ele é um tipo à parte, e não uma variação.
 *
 * É um conceito só para as quatro operações: o que se aprende aqui é que o
 * inteiro tem denominador 1, e isso vale igual na soma e na divisão.
 */
export const CONCEITO_DO_INTEIRO = 'fracoes.inteiro';

/**
 * Misto de um lado, fração do outro.
 *
 * `comMista` valia para os dois operandos ao mesmo tempo, então ou os dois
 * eram mistos ou nenhum era. Mas é em «2½ + ¾» que a conversão se mostra
 * necessária: há um número que precisa ser convertido ao lado de um que já
 * está pronto, e esquecer a conversão de um só é o erro que aparece.
 */
export const CONCEITO_DA_MISTA_COM_FRACAO = 'fracoes.mista-fracao';

export const geradorFracoes: GeradorExercicio<Fracao> = {
  topicoId: 'fracoes',
  formatoResposta: 'ex.: 3/4, -2/5, 7 ou o misto 2 1/3',

  gerar(nivel: Nivel, rng: Rng, pendentes: readonly string[] = []): Exercicio<Fracao> {
    /*
     * Enquanto há tipo faltando, o sorteio é só entre eles.
     *
     * Com sorteio uniforme dá para chegar a `soma 9/5` e `decimal 10/5` com
     * `subtração com mistos` parada em 3/5: o gerador seguia oferecendo o que
     * já estava cumprido, e a etapa não abria nunca.
     */
    const possiveis = pendentes.filter((conceito) => produzNoNivel(conceito, nivel));
    const exigido = possiveis.length === 0 ? null : rng.escolher(possiveis);

    // Converter decimal em fração entra no sorteio sem competir com as
    // operações: a etapa exige cinco acertos em cada uma delas, e diluí-las
    // seria tornar a exigência mais lenta sem ensinar mais.
    if (exigido === CONCEITO_DA_CONVERSAO || (exigido === null && rng.booleano(0.15))) {
      return exercicioConversao(nivel, rng);
    }

    const sorteio = sortear(
      nivel,
      rng,
      exigido === null ? null : (CONCEITO_DO_ALVO.get(exigido) ?? null),
    );
    const { operacao, escritas } = sorteio;

    /*
     * Em forma mista o enunciado mostra a fração já reduzida — `2\frac{1}{2}`,
     * nunca `\frac{10}{4}`. Reduzir aqui faz a resolução e as armadilhas
     * partirem dos mesmos números que o aluno está lendo.
     */
    const a = escritas[0] === 'mista' ? sorteio.a.simplificar() : sorteio.a;
    const b = escritas[1] === 'mista' ? sorteio.b.simplificar() : sorteio.b;

    /*
     * O par diz quais operandos estão escritos em forma mista.
     *
     * Era um booleano só, e por isso o site nunca propunha «2½ + ¾»: ou os
     * dois eram mistos, ou nenhum era. Com o par, a resolução converte só o
     * que precisa ser convertido.
     */
    const misto = [escritas[0] === 'mista', escritas[1] === 'mista'] as const;

    const resolucao = resolverComPassos(a, operacao, b, misto);

    /*
     * Quando há fração imprópria em jogo, o enunciado mostra o número misto.
     * É a forma em que a quantidade se diz em voz alta — "duas pizzas e um
     * terço" — e a que aparece em receita, régua e planta baixa; ler e operar
     * nessa forma é parte do assunto, não enfeite.
     */
    const enunciadoTex = `${operacaoParaTex(a, operacao, b, misto)} = \\;?`;

    const texto = enunciadoDoMolde(moldesDe('fracoes', formaDoMolde(escritas))[0]!, {});

    return {
      id: `fracoes-${nivel}-${a}-${operacao}-${b}-${rng.inteiro(0, 9999)}`,
      nivel,
      enunciado: texto.enunciado,
      traducoes: texto.traducoes,
      enunciadoTex,
      gabarito: resolucao.resultado,
      resolucao,
      conceitos: conceitosDe(operacao, a, b, escritas),
      armadilhas: armadilhasDe(
        a,
        b,
        operacao,
        resolucao.resultado,
        deslocamentoDosPassos(a, b, escritas),
      ),
      /*
       * A dica da conta entre duas frações é para quem está começando; a das
       * outras formas vale em qualquer nível, porque o que ela explica — o
       * inteiro com denominador 1, o misto que vira fração — é justamente o
       * que muda a conta.
       */
      dica: formaDoMolde(escritas) === 'calculo' && nivel !== 'facil' ? undefined : texto.dica,
    };
  },

  analisar: (entrada: string): Fracao | null => Fracao.analisar(entrada),

  // Equivalência, não igualdade textual: 6/8 conta como 3/4.
  saoEquivalentes: (a: Fracao, b: Fracao): boolean => a.igualA(b),

  // Resultado impróprio aparece como misto, que é como ele se lê — e o campo
  // aceita essa mesma forma de volta.
  formatar: (valor: Fracao): string =>
    valor.simplificar().ehImpropria ? valor.toStringMisto() : valor.toString(),

  /*
   * Vinte e oito vinte e sete avos e um inteiro e um vinte e sete avos são o
   * mesmo número, e as duas escritas sempre contaram como acerto. Mas o
   * gabarito mostrava só a mista: quem respondeu 28/27, acertou e depois errou
   * o exercício seguinte, lia "Resposta correta: 1 1/27" e tinha todo motivo
   * para achar que a sua forma é que estava errada.
   */
  /*
   * `10/20` conta como acerto — e passa a dizer que dá para escrever `1/2`.
   * A forma menor é a que o gabarito mostra e a que deixa a conta seguinte
   * mais leve; recusar a ampliada seria reprovar quem acertou.
   */
  observarResposta: observarSimplificacao,

  formasEquivalentes: (valor: Fracao): readonly string[] => {
    const simplificada = valor.simplificar();

    return simplificada.ehImpropria && !simplificada.ehInteira
      ? [simplificada.toStringMisto(), simplificada.toString()]
      : [simplificada.toString()];
  },
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
  // No extremo são cinco casas, e denominadores que não simplificam para
  // nada redondo: 0,03125 é 1/32, e 0,0144 é 9/625.
  extremo: [0.03125, 0.0144, 0.00625, 2.1875, 0.4375, 12.08, 0.00390625, 7.3125],
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
    enunciado: textoDoMolde(moldesDe('fracoes', 'forma-1')[0]!, {}, 'pt'),
    traducoes: traducoesDoMolde(moldesDe('fracoes', 'forma-1')[0]!, {}),
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

/**
 * Em que FORMA cada operando aparece escrito no enunciado.
 *
 * `fracao` é a fração como ela se escreve, própria ou imprópria; `mista` é
 * `2\frac{1}{3}`; `inteiro` é um número sem denominador visível, que na conta
 * vale 5/1. São três escritas do mesmo tipo de número — e são três contas
 * diferentes para quem está aprendendo.
 */
type Escrita = 'fracao' | 'mista' | 'inteiro';

/** As formas dos dois operandos, na ordem em que eles aparecem. */
type Escritas = readonly [Escrita, Escrita];

interface Sorteio {
  readonly a: Fracao;
  readonly b: Fracao;
  readonly operacao: OperacaoFracao;
  readonly escritas: Escritas;
}

/** O molde de enunciado que cada combinação de formas pede. */
function formaDoMolde(escritas: Escritas): string {
  if (escritas.includes('inteiro')) {
    return 'calculo-inteiro';
  }

  const mistas = escritas.filter((escrita) => escrita === 'mista').length;

  return mistas === 2 ? 'calculo-misto' : mistas === 1 ? 'calculo-misto-fracao' : 'calculo';
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

/**
 * As combinações de formas que o sorteio conhece.
 *
 * `fracoes` é a conta entre duas frações, que era a única que existia;
 * `com-inteiro` põe um número inteiro de um dos lados; `mista-e-fracao` deixa
 * um misto ao lado de uma fração pronta; `mistas` é o par de mistos.
 */
type Combinacao = 'fracoes' | 'com-inteiro' | 'mista-e-fracao' | 'mistas';

/**
 * O peso de cada combinação por nível.
 *
 * O Fácil não tem mistos — eles são a recompensa de subir —, mas tem inteiro
 * desde o começo: «3/4 de 20» é mais comum na vida do que qualquer conta entre
 * duas frações, e não é mais difícil. Nos níveis de cima a conta entre duas
 * frações perde espaço para as formas que exigem converter antes de operar.
 */
const PESOS_DA_COMBINACAO: Readonly<Record<Nivel, Readonly<Record<Combinacao, number>>>> = {
  facil: { fracoes: 0.7, 'com-inteiro': 0.3, 'mista-e-fracao': 0, mistas: 0 },
  medio: { fracoes: 0.4, 'com-inteiro': 0.2, 'mista-e-fracao': 0.2, mistas: 0.2 },
  dificil: { fracoes: 0.3, 'com-inteiro': 0.15, 'mista-e-fracao': 0.25, mistas: 0.3 },
  extremo: { fracoes: 0.25, 'com-inteiro': 0.1, 'mista-e-fracao': 0.25, mistas: 0.4 },
};

/** Sorteia a combinação respeitando os pesos do nível. */
function sortearCombinacao(nivel: Nivel, rng: Rng): Combinacao {
  const pesos = PESOS_DA_COMBINACAO[nivel];
  const combinacoes = Object.keys(pesos) as Combinacao[];

  const total = combinacoes.reduce((soma, chave) => soma + pesos[chave], 0);
  let sorteado = rng.proximo() * total;

  for (const combinacao of combinacoes) {
    sorteado -= pesos[combinacao];
    if (sorteado < 0) {
      return combinacao;
    }
  }

  return 'fracoes';
}

/** As formas dos dois operandos, com a posição do diferente sorteada. */
function escritasDa(combinacao: Combinacao, rng: Rng): Escritas {
  switch (combinacao) {
    case 'fracoes':
      return ['fracao', 'fracao'];
    case 'mistas':
      return ['mista', 'mista'];
    case 'com-inteiro':
      return rng.booleano() ? ['inteiro', 'fracao'] : ['fracao', 'inteiro'];
    case 'mista-e-fracao':
      return rng.booleano() ? ['mista', 'fracao'] : ['fracao', 'mista'];
  }
}

/**
 * O tipo de exercício que a etapa ainda está esperando.
 *
 * A operação é `null` nos tipos que não dependem dela: operar com um inteiro
 * é a mesma lição na soma e na divisão, e exigir as quatro separadamente
 * transformaria a etapa numa maratona sem ensinar mais.
 */
interface Alvo {
  readonly operacao: OperacaoFracao | null;
  readonly combinacao: Combinacao;
}

/** O conceito de cada tipo, do jeito que a progressão o conta. */
const CONCEITO_DO_ALVO = new Map<string, Alvo>([
  ...OPERACOES.map((operacao): [string, Alvo] => [
    CONCEITO_DA_OPERACAO[operacao],
    { operacao, combinacao: 'fracoes' },
  ]),
  ...OPERACOES.map((operacao): [string, Alvo] => [
    CONCEITO_DA_OPERACAO_MISTA[operacao],
    { operacao, combinacao: 'mistas' },
  ]),
  [CONCEITO_DO_INTEIRO, { operacao: null, combinacao: 'com-inteiro' }],
  [CONCEITO_DA_MISTA_COM_FRACAO, { operacao: null, combinacao: 'mista-e-fracao' }],
]);

/** O conceito da conversão de decimal, que não é operação entre frações. */
const CONCEITO_DA_CONVERSAO = 'fracoes.decimais';

/**
 * O que este nível é capaz de sortear.
 *
 * O Fácil não produz mistos — eles são a recompensa de subir —, então pedir
 * um deles ali seria pedir o impossível e travar o sorteio.
 */
function produzNoNivel(conceito: string, nivel: Nivel): boolean {
  if (conceito === CONCEITO_DA_CONVERSAO) {
    return true;
  }

  const alvo = CONCEITO_DO_ALVO.get(conceito);
  return alvo !== undefined && PESOS_DA_COMBINACAO[nivel][alvo.combinacao] > 0;
}

function sortear(nivel: Nivel, rng: Rng, alvo: Alvo | null): Sorteio {
  const operacao = alvo?.operacao ?? rng.escolher(OPERACOES);
  const escritas = escritasDa(alvo?.combinacao ?? sortearCombinacao(nivel, rng), rng);

  switch (nivel) {
    case 'facil':
      return sortearFacil(rng, operacao, escritas);
    case 'medio':
      return sortearMedio(rng, operacao, escritas);
    case 'dificil':
      return sortearDificil(rng, operacao, escritas);
    case 'extremo':
      return sortearExtremo(rng, operacao, escritas);
  }
}

/**
 * O numerador de um operando, de acordo com a forma em que ele será escrito.
 *
 * `inteiro` é o caso que não existia: denominador 1, e o número que aparece na
 * tela é o próprio numerador. `mista` precisa de uma fração imprópria — sem
 * parte inteira não há misto nenhum para converter.
 */
function montarOperando(
  rng: Rng,
  escrita: Escrita,
  denominador: number,
  inteiros: readonly [number, number],
  proprio: number,
): Fracao {
  if (escrita === 'inteiro') {
    return Fracao.criar(rng.inteiro(inteiros[0], inteiros[1]), 1);
  }

  const numerador =
    escrita === 'mista' ? rng.inteiro(inteiros[0], inteiros[1]) * denominador + proprio : proprio;

  return Fracao.criar(numerador, denominador);
}

/** Troca os operandos de lado, levando junto a forma de cada um. */
function trocados(sorteio: Sorteio): Sorteio {
  return {
    ...sorteio,
    a: sorteio.b,
    b: sorteio.a,
    escritas: [sorteio.escritas[1], sorteio.escritas[0]],
  };
}

/**
 * Fácil: denominadores em que um é múltiplo do outro, de modo que o
 * denominador comum é o próprio maior deles. Tudo positivo, sem mistas.
 */
function sortearFacil(rng: Rng, operacao: OperacaoFracao, escritas: Escritas): Sorteio {
  const base = rng.escolher([2, 3, 4, 5, 6, 8]);
  const fator = rng.escolher([1, 2, 3]);
  const maior = base * fator;

  const INTEIROS: readonly [number, number] = [2, 9];

  const a = montarOperando(rng, escritas[0], base, INTEIROS, rng.inteiro(1, base - 1 || 1));
  const b = montarOperando(rng, escritas[1], maior, INTEIROS, rng.inteiro(1, maior - 1));

  const sorteio: Sorteio = { a, b, operacao, escritas };

  // Na subtração, o maior vem primeiro para o resultado não ficar negativo: o
  // sinal entra no Médio, com a reta numérica já discutida.
  return operacao === 'subtrair' && a.comparar(b) < 0 ? trocados(sorteio) : sorteio;
}

/**
 * Médio: denominadores coprimos — o MMC é o produto, e não há como escapar de
 * converter as duas frações. Entram os negativos e os primeiros mistos.
 */
function sortearMedio(rng: Rng, operacao: OperacaoFracao, escritas: Escritas): Sorteio {
  const [d1, d2] = rng.escolher(PARES_COPRIMOS);
  const ordenados = rng.booleano() ? [d1, d2] : [d2, d1];

  const negativos = rng.booleano(0.3);

  const montar = (denominador: number, escrita: Escrita): Fracao => {
    // Misto: uma ou duas unidades inteiras somadas à parte própria.
    const fracao = montarOperando(
      rng,
      escrita,
      denominador,
      // O inteiro nunca é 1: multiplicar ou dividir por 1 não é exercício.
      escrita === 'inteiro' ? [2, 12] : [1, 2],
      rng.inteiro(1, denominador - 1 || 1),
    );

    return negativos && rng.booleano()
      ? Fracao.criar(-fracao.numerador, fracao.denominador)
      : fracao;
  };

  return {
    a: montar(ordenados[0]!, escritas[0]),
    b: montar(ordenados[1]!, escritas[1]),
    operacao,
    escritas,
  };
}

/** Difícil: as quatro operações, com negativos e mistos em qualquer posição. */
function sortearDificil(rng: Rng, operacao: OperacaoFracao, escritas: Escritas): Sorteio {
  const criar = (escrita: Escrita, permitirZero: boolean): Fracao => {
    const denominador = rng.inteiro(2, 12);
    const base = montarOperando(
      rng,
      escrita,
      denominador,
      escrita === 'inteiro' ? [2, 12] : [1, 3],
      // Fora do misto, a fração pode ser imprópria: o numerador não se prende
      // ao denominador.
      escrita === 'fracao' ? rng.inteiro(1, 15) : rng.inteiro(1, denominador - 1 || 1),
    );

    let numerador = base.numerador * rng.sinal();
    if (!permitirZero && numerador === 0) {
      numerador = base.numerador || 1;
    }
    return Fracao.criar(numerador, base.denominador);
  };

  const a = criar(escritas[0], true);
  // O divisor nunca pode ser zero.
  const b = criar(escritas[1], false);

  return { a, b, operacao, escritas };
}

/**
 * Extremo: denominadores grandes e primos entre si.
 *
 * Em frações o que endurece é o número, não a técnica. Com denominadores
 * primos entre si — 13 e 18, não 4 e 8 — o denominador comum é o produto dos
 * dois, e a conta deixa de caber de cabeça. Os mistos ficam maiores, e o sinal
 * negativo passa a ser frequente nos dois operandos.
 */
function sortearExtremo(rng: Rng, operacao: OperacaoFracao, escritas: Escritas): Sorteio {
  // Primos entre si: o MMC é o produto, e não um dos dois.
  const PARES: readonly (readonly [number, number])[] = [
    [7, 9],
    [8, 11],
    [9, 13],
    [11, 14],
    [12, 17],
    [13, 18],
    [15, 16],
    [16, 21],
  ];
  const [um, outro] = rng.escolher(PARES);
  const denominadores = rng.booleano() ? [um, outro] : [outro, um];

  const criar = (denominador: number, escrita: Escrita, permitirZero: boolean): Fracao => {
    const base = montarOperando(
      rng,
      escrita,
      denominador,
      escrita === 'inteiro' ? [2, 40] : [2, 6],
      escrita === 'fracao' ? rng.inteiro(1, 40) : rng.inteiro(1, denominador - 1),
    );

    let numerador = base.numerador * rng.sinal();
    if (!permitirZero && numerador === 0) {
      numerador = base.numerador || 1;
    }
    return Fracao.criar(numerador, base.denominador);
  };

  return {
    a: criar(denominadores[0]!, escritas[0], true),
    // O divisor nunca pode ser zero.
    b: criar(denominadores[1]!, escritas[1], false),
    operacao,
    escritas,
  };
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
  escritas: Escritas,
): readonly string[] {
  const mistas = escritas.filter((escrita) => escrita === 'mista').length;

  const conceitos =
    mistas === 2
      ? [CONCEITO_DA_OPERACAO_MISTA[operacao], 'fracoes.mistas', 'fracoes.operacoes']
      : [CONCEITO_DA_OPERACAO[operacao], 'fracoes.operacoes'];

  /*
   * O tipo da FORMA entra logo depois da operação.
   *
   * A progressão conta todos os conceitos do exercício, mas o primeiro é o que
   * nomeia o exercício onde só cabe um — e ali o que vale é a operação, que é
   * o que a etapa exige praticar nas quatro.
   */
  if (escritas.includes('inteiro')) {
    conceitos.splice(1, 0, CONCEITO_DO_INTEIRO);
  } else if (mistas === 1) {
    conceitos.splice(1, 0, CONCEITO_DA_MISTA_COM_FRACAO, 'fracoes.mistas');
  }

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
  const candidatas = [
    ...(operacao === 'somar' || operacao === 'subtrair'
      ? armadilhasAditivas(a, b, operacao)
      : operacao === 'multiplicar'
        ? armadilhasMultiplicacao(a, b)
        : armadilhasDivisao(a, b)),
    ...armadilhasComInteiro(a, b, operacao),
  ];

  const reposicionadas = candidatas.map((armadilha) => ({
    ...armadilha,
    passo: armadilha.passo === undefined ? undefined : armadilha.passo + deslocamento,
  }));

  return semColisoesDeFracao(reposicionadas, gabarito);
}

/**
 * Quantos passos as conversões iniciais empurram os demais.
 *
 * As armadilhas apontam o passo em que o aluno se perdeu. Com o enunciado em
 * forma mista, a resolução ganha um passo antes de todos os outros — e sem
 * este deslocamento o dedo passaria a apontar o passo errado.
 */
function deslocamentoDosPassos(a: Fracao, b: Fracao, escritas: Escritas): number {
  const mistoConvertido =
    (escritas[0] === 'mista' && ehNumeroMisto(a)) || (escritas[1] === 'mista' && ehNumeroMisto(b));

  // O inteiro também ganha um passo só seu — o que mostra que 5 é 5/1 —, e
  // ele vem antes de todos os outros.
  const comInteiro = escritas.includes('inteiro');

  return (mistoConvertido ? 1 : 0) + (comInteiro ? 1 : 0);
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

/**
 * Os erros que só existem quando um dos operandos é um número inteiro.
 *
 * São dois, e os dois vêm da mesma ideia: tratar o inteiro como se ele
 * tivesse o denominador da outra fração. Na multiplicação isso vira
 * 3/4 × 5 = 15/20 — que é 3/4 de novo, ou seja, multiplicar por 5 não mudou
 * nada; na soma vira 3/4 + 5 = 8/4, somando o inteiro direto no numerador.
 *
 * Vazio quando não há inteiro nenhum, ou quando os dois são inteiros — aí não
 * há fração com que confundir.
 */
function armadilhasComInteiro(
  a: Fracao,
  b: Fracao,
  operacao: OperacaoFracao,
): readonly Armadilha<Fracao>[] {
  const aEhInteiro = a.denominador === 1;
  const bEhInteiro = b.denominador === 1;

  if (aEhInteiro === bEhInteiro) {
    return [];
  }

  const fracao = aEhInteiro ? b : a;
  const inteiro = (aEhInteiro ? a : b).numerador;

  if (operacao === 'multiplicar') {
    const nosDois = tentar(() =>
      Fracao.criar(fracao.numerador * inteiro, fracao.denominador * inteiro),
    );

    return nosDois === null
      ? []
      : [
          {
            resposta: nosDois,
            diagnostico:
              `Você multiplicou ${inteiro} em cima e embaixo. O denominador de um inteiro é 1: ` +
              `${inteiro} é ${inteiro}/1, então só o numerador é multiplicado. Repare que ` +
              'multiplicar os dois termos pelo mesmo número não muda a fração — o resultado ' +
              'teria ficado igual ao que estava no enunciado.',
            passo: 1,
            conceito: CONCEITO_DO_INTEIRO,
          },
        ];
  }

  if (operacao === 'somar' || operacao === 'subtrair') {
    // Na subtração a ordem importa: quem é subtraído de quem.
    const numerador = aEhInteiro
      ? operacao === 'somar'
        ? inteiro + fracao.numerador
        : inteiro - fracao.numerador
      : operacao === 'somar'
        ? fracao.numerador + inteiro
        : fracao.numerador - inteiro;

    const noNumerador = tentar(() => Fracao.criar(numerador, fracao.denominador));

    return noNumerador === null
      ? []
      : [
          {
            resposta: noNumerador,
            diagnostico:
              `${inteiro} foi somado direto ao numerador, como se fosse ${inteiro} partes de ` +
              `tamanho 1/${fracao.denominador}. Ele vale ${inteiro} INTEIROS, ou seja ` +
              `${inteiro * fracao.denominador}/${fracao.denominador} — é assim que ele entra ` +
              'na conta.',
            passo: 1,
            conceito: CONCEITO_DO_INTEIRO,
          },
        ];
  }

  return [];
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
