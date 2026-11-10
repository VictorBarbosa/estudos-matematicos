import {
  Intervalo,
  Resolucao,
  canonizarNotacao,
  conjuntoParaTex,
  fatorial,
  inteirosNoIntervaloComPassos,
  intervaloParaTex,
  operacaoDeConjuntoComPassos,
  produtorioComPassos,
  somatorioComPassos,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Exercicio,
  GeradorExercicio,
  Nivel,
  SEM_FORMULA,
  TeclaDeSimbolo,
  nivelAoMenos,
  semColisoes,
} from '@core/treino/models/treino.model';

/**
 * Notação matemática: ler o que está escrito e escrever o que se quer dizer.
 *
 * O tópico tem duas mãos, e nenhuma delas pede tradução em palavras.
 *
 * **Ler** vira conta: quem entende `\sum_{k=1}^{4} k^2` chega a 30, e quem não
 * entende não chega. Pedir o valor em vez da leitura tem uma vantagem que
 * múltipla escolha não tem — não há como acertar por eliminação.
 *
 * **Escrever** pede a notação a partir do texto, e a correção compara a forma
 * canônica: `\forall x \in \mathbb{R}, x^{2} \geq 0` e `∀x∈ℝ, x²≥0` são a
 * mesma resposta. O campo vem com paleta, porque esses símbolos não estão no
 * teclado de ninguém.
 */

/**
 * A resposta deste tópico: ou um número, ou uma notação.
 *
 * Os dois tipos convivem porque as duas mãos do tópico convivem. A comparação
 * decide pelo que existe: havendo valor nos dois lados, compara número; senão,
 * compara a forma canônica contra a lista de escritas aceitas.
 */
export interface Resposta {
  /** Como a resposta é mostrada ao aluno. */
  readonly exibida: string;
  /** Forma comparável: sem espaços, com os símbolos canônicos. */
  readonly canonica: string;
  /** O valor, quando a resposta é um número. */
  readonly valor: number | null;
  /** Escritas igualmente certas. No que o aluno digita, é só a dele. */
  readonly aceitas: readonly string[];
}

/** Uma resposta numérica, que é o que a mão de LER pede. */
function numero(valor: number): Resposta {
  const exibida = String(valor);
  return { exibida, canonica: exibida, valor, aceitas: [exibida] };
}

/**
 * Envolve a resolução numérica do motor no tipo de resposta do tópico.
 *
 * Os passos são os mesmos; o que muda é só como o resultado é comparado.
 */
function comoResposta(resolucao: Resolucao<number>): Resolucao<Resposta> {
  return { resultado: numero(resolucao.resultado), passos: resolucao.passos };
}

/** Uma resposta em notação, com as formas que valem por ela. */
function notacao(exibida: string, ...outras: readonly string[]): Resposta {
  return {
    exibida,
    canonica: canonizarNotacao(exibida),
    valor: null,
    aceitas: [exibida, ...outras].map(canonizarNotacao),
  };
}

/** As teclas que o campo de resposta oferece neste tópico. */
const SIMBOLOS: readonly TeclaDeSimbolo[] = [
  { rotulo: '∀', insere: '∀', nome: 'para todo' },
  { rotulo: '∃', insere: '∃', nome: 'existe' },
  { rotulo: '∈', insere: '∈', nome: 'pertence a' },
  { rotulo: '∉', insere: '∉', nome: 'não pertence a' },
  { rotulo: '⊂', insere: '⊂', nome: 'está contido em' },
  { rotulo: '∪', insere: '∪', nome: 'união' },
  { rotulo: '∩', insere: '∩', nome: 'interseção' },
  { rotulo: 'ℝ', insere: 'ℝ', nome: 'conjunto dos reais' },
  { rotulo: 'ℕ', insere: 'ℕ', nome: 'conjunto dos naturais' },
  { rotulo: 'ℤ', insere: 'ℤ', nome: 'conjunto dos inteiros' },
  { rotulo: '≤', insere: '≤', nome: 'menor ou igual a' },
  { rotulo: '≥', insere: '≥', nome: 'maior ou igual a' },
  { rotulo: '≠', insere: '≠', nome: 'diferente de' },
  { rotulo: '⇒', insere: '⇒', nome: 'implica' },
  { rotulo: '→', insere: '→', nome: 'leva em' },
  // Esqueletos: entram com o cursor onde falta preencher.
  { rotulo: 'f(x)', insere: 'f(x)', nome: 'função aplicada a x' },
  { rotulo: '|x|', insere: '||', recuo: 1, nome: 'valor absoluto' },
  { rotulo: '∑', insere: '∑_{k=1}^{n}', recuo: 0, nome: 'somatório' },
  { rotulo: '∏', insere: '∏_{k=1}^{n}', recuo: 0, nome: 'produtório' },
  { rotulo: '∫', insere: '∫_{a}^{b}', recuo: 0, nome: 'integral' },
  { rotulo: '√', insere: '√()', recuo: 1, nome: 'raiz quadrada' },
  { rotulo: 'x²', insere: '^2', nome: 'ao quadrado' },
  { rotulo: '[ ]', insere: '[,]', recuo: 2, nome: 'intervalo fechado' },
  { rotulo: '( )', insere: '(,)', recuo: 2, nome: 'intervalo aberto' },
];

export const geradorNotacao: GeradorExercicio<Resposta> = {
  topicoId: 'notacao-matematica',
  formatoResposta: 'um número, ou a notação pedida — use os botões',
  simbolos: SIMBOLOS,

  gerar(nivel: Nivel, rng: Rng): Exercicio<Resposta> {
    const ler = LEITURAS[nivel];
    const escrever = ESCRITAS[nivel];

    // Metade e metade: ler e escrever são o mesmo assunto visto dos dois lados,
    // e o tópico existe justamente porque uma das mãos costuma ficar para trás.
    return rng.booleano() ? rng.escolher(ler)(rng) : rng.escolher(escrever)(rng);
  },

  analisar: (entrada: string): Resposta | null => {
    const aparado = entrada.trim();
    if (aparado === '') {
      return null;
    }

    const valor = analisarNumero(aparado);
    return valor === null
      ? notacao(aparado)
      : { exibida: aparado, canonica: canonizarNotacao(aparado), valor, aceitas: [] };
  },

  saoEquivalentes: (a: Resposta, b: Resposta): boolean =>
    a.valor !== null && b.valor !== null
      ? Math.abs(a.valor - b.valor) < 1e-9
      : b.aceitas.includes(a.canonica) || a.aceitas.includes(b.canonica),

  formatar: (valor: Resposta): string => valor.exibida,
};

type Sorteador = (rng: Rng) => Exercicio<Resposta>;

/* -------------------------------------------------------------------------- */
/* LER: o valor só sai para quem entendeu o símbolo                            */
/* -------------------------------------------------------------------------- */

/** Os termos que um somatório pode somar, com o jeito de escrever cada um. */
const TERMOS: readonly {
  readonly corpo: string;
  readonly valor: (k: number) => number;
  readonly tex: (k: number) => string;
}[] = [
  { corpo: 'k', valor: (k) => k, tex: (k) => `${k}` },
  { corpo: 'k^2', valor: (k) => k * k, tex: (k) => `${k}^2` },
  { corpo: '2k', valor: (k) => 2 * k, tex: (k) => `2 \\cdot ${k}` },
  { corpo: '(2k - 1)', valor: (k) => 2 * k - 1, tex: (k) => `(2 \\cdot ${k} - 1)` },
  { corpo: 'k(k+1)', valor: (k) => k * (k + 1), tex: (k) => `${k} \\cdot ${k + 1}` },
];

function lerSomatorio(rng: Rng, nivel: Nivel): Exercicio<Resposta> {
  const termo = rng.escolher(nivel === 'facil' ? TERMOS.slice(0, 2) : TERMOS);
  const de = nivel === 'facil' ? 1 : rng.inteiro(1, 3);
  const ate = de + rng.inteiro(2, nivel === 'extremo' ? 7 : nivelAoMenos(nivel, 'dificil') ? 5 : 3);

  const resolucao = somatorioComPassos(de, ate, termo.valor, termo.tex, termo.corpo);

  return {
    id: `notacao-soma-${de}-${ate}-${termo.corpo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Leia o somatório e calcule o valor.',
    enunciadoTex: `\\sum_{k=${de}}^{${ate}} ${termo.corpo} = \\;?`,
    gabarito: numero(resolucao.resultado),
    resolucao: comoResposta(resolucao),
    conceitos: ['notacao.somatorio', 'notacao.leitura'],
    armadilhas: semColisoes(
      [
        {
          resposta: numero(termo.valor(ate)),
          diagnostico:
            'Esse é só o ÚLTIMO termo. O número em cima do sigma diz onde a soma para, não o ' +
            'que somar: é preciso somar todos os termos de k inicial até ele.',
          passo: 1,
          conceito: 'notacao.somatorio',
        },
        {
          resposta: numero(ate - de + 1),
          diagnostico:
            'Você contou quantas parcelas existem, não quanto elas somam. O somatório devolve ' +
            'a soma dos valores, não a quantidade deles.',
          passo: 2,
          conceito: 'notacao.somatorio',
        },
      ],
      numero(resolucao.resultado),
      geradorNotacao.saoEquivalentes,
    ),
    dica: 'Escreva as parcelas uma a uma, trocando k por cada valor do índice, e só depois some.',
  };
}

function lerProdutorio(rng: Rng, nivel: Nivel): Exercicio<Resposta> {
  const de = 1;
  const ate = rng.inteiro(3, nivelAoMenos(nivel, 'dificil') ? 6 : 4);
  const termo = rng.escolher(TERMOS.slice(0, 3));

  const resolucao = produtorioComPassos(de, ate, termo.valor, termo.tex, termo.corpo);

  return {
    id: `notacao-prod-${ate}-${termo.corpo}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Leia o produtório e calcule o valor.',
    enunciadoTex: `\\prod_{k=${de}}^{${ate}} ${termo.corpo} = \\;?`,
    gabarito: numero(resolucao.resultado),
    resolucao: comoResposta(resolucao),
    conceitos: ['notacao.produtorio', 'notacao.leitura'],
    armadilhas: semColisoes(
      [
        {
          resposta: numero(
            Array.from({ length: ate - de + 1 }, (_, i) => termo.valor(de + i)).reduce(
              (total, parcela) => total + parcela,
              0,
            ),
          ),
          diagnostico:
            'Você somou. O pi maiúsculo manda MULTIPLICAR — é o sigma que soma. Os dois têm o ' +
            'mesmo arranjo de índices, e é só a operação que muda.',
          passo: 2,
          conceito: 'notacao.produtorio',
        },
      ],
      numero(resolucao.resultado),
      geradorNotacao.saoEquivalentes,
    ),
    dica: `O Π multiplica: troque k por 1, 2, …, ${ate} e multiplique os termos um a um.`,
  };
}

function lerModuloFatorial(rng: Rng, nivel: Nivel): Exercicio<Resposta> {
  const dentro = -rng.inteiro(2, 12);
  const n = rng.inteiro(3, nivel === 'facil' ? 4 : 5);
  const resultado = Math.abs(dentro) + fatorial(n);

  return {
    id: `notacao-mod-${dentro}-${n}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Leia os dois símbolos e calcule.',
    enunciadoTex: `\\left|${dentro}\\right| + ${n}! = \\;?`,
    gabarito: numero(resultado),
    resolucao: {
      resultado: numero(resultado),
      passos: [
        {
          descricao: 'As barras pedem a distância até zero, que nunca é negativa.',
          tex: `\\left|${dentro}\\right| = ${Math.abs(dentro)}`,
        },
        {
          descricao: 'A exclamação pede o produto de todos os naturais até ali.',
          tex: `${n}! = ${Array.from({ length: n }, (_, i) => n - i).join(' \\cdot ')} = ${fatorial(n)}`,
        },
        {
          descricao: 'Somamos os dois.',
          tex: `${Math.abs(dentro)} + ${fatorial(n)} = ${resultado}`,
        },
      ],
    },
    conceitos: ['notacao.modulo', 'notacao.leitura'],
    armadilhas: semColisoes(
      [
        {
          resposta: numero(dentro + fatorial(n)),
          diagnostico:
            'O módulo foi ignorado: as barras tiram o sinal. |−7| é 7, e não −7 — é a distância ' +
            'até zero, que não tem como ser negativa.',
          passo: 0,
          conceito: 'notacao.modulo',
        },
        {
          resposta: numero(Math.abs(dentro) + n),
          diagnostico:
            'O fatorial não foi aplicado: n! é o produto de todos os naturais de 1 a n, não o ' +
            'próprio n.',
          passo: 1,
          conceito: 'notacao.modulo',
        },
      ],
      numero(resultado),
      geradorNotacao.saoEquivalentes,
    ),
    dica: `|${dentro}| tira o sinal; ${n}! é ${Array.from({ length: n }, (_, i) => n - i).join(' × ')}.`,
  };
}

function lerIntervalo(rng: Rng, nivel: Nivel): Exercicio<Resposta> {
  const de = rng.inteiro(-6, 6);
  const ate = de + rng.inteiro(3, nivel === 'facil' ? 5 : 9);
  const intervalo: Intervalo = {
    de,
    ate,
    fechadoEsquerda: rng.booleano(),
    fechadoDireita: rng.booleano(),
  };

  const resolucao = inteirosNoIntervaloComPassos(intervalo);

  return {
    id: `notacao-intervalo-${de}-${ate}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: 'Quantos números INTEIROS existem neste intervalo?',
    enunciadoTex: `x \\in ${intervaloParaTex(intervalo)}`,
    gabarito: numero(resolucao.resultado),
    resolucao: comoResposta(resolucao),
    conceitos: ['notacao.intervalos', 'notacao.leitura'],
    armadilhas: semColisoes(
      [
        {
          resposta: numero(ate - de + 1),
          diagnostico:
            'Você contou como se as duas pontas fossem fechadas. Parêntese deixa o extremo de ' +
            'fora; colchete o inclui — e é só esse desenho que muda a conta.',
          passo: 0,
          conceito: 'notacao.intervalos',
        },
        {
          resposta: numero(ate - de),
          diagnostico:
            'Essa é a LARGURA do intervalo, não quantos inteiros cabem nele. De 2 a 5 a ' +
            'distância é 3, mas os inteiros 2, 3, 4 e 5 são quatro.',
          passo: 1,
          conceito: 'notacao.intervalos',
        },
      ],
      numero(resolucao.resultado),
      geradorNotacao.saoEquivalentes,
    ),
    dica: 'Colchete inclui a ponta; parêntese não.',
  };
}

function lerConjuntos(rng: Rng, nivel: Nivel): Exercicio<Resposta> {
  const sortearConjunto = (): number[] =>
    [...new Set(Array.from({ length: rng.inteiro(3, 5) }, () => rng.inteiro(1, 9)))].sort(
      (x, y) => x - y,
    );

  const a = sortearConjunto();
  const b = sortearConjunto();
  const operacao = rng.escolher(
    nivel === 'facil'
      ? (['uniao', 'intersecao'] as const)
      : (['uniao', 'intersecao', 'diferenca'] as const),
  );

  const resolucao = operacaoDeConjuntoComPassos(a, b, operacao);
  const simbolo = { uniao: '\\cup', intersecao: '\\cap', diferenca: '\\setminus' }[operacao];

  return {
    id: `notacao-conj-${operacao}-${a.join('')}-${b.join('')}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Com A = {${a.join(', ')}} e B = {${b.join(', ')}}, quantos elementos tem o conjunto?`,
    enunciadoTex: `A ${simbolo} B`,
    gabarito: numero(resolucao.resultado.length),
    resolucao: {
      resultado: numero(resolucao.resultado.length),
      passos: [
        ...resolucao.passos,
        {
          descricao: 'Contamos os elementos que sobraram.',
          tex: `\\left|A ${simbolo} B\\right| = ${resolucao.resultado.length}`,
          nota: 'As barras em volta de um conjunto pedem quantos elementos ele tem.',
        },
      ],
    },
    conceitos: ['notacao.conjuntos', 'notacao.leitura'],
    armadilhas: semColisoes(
      [
        {
          resposta: numero(a.length + b.length),
          diagnostico:
            'Os elementos repetidos foram contados duas vezes. Num conjunto cada elemento ' +
            'aparece uma vez só, mesmo que esteja nos dois.',
          passo: 1,
          conceito: 'notacao.conjuntos',
        },
      ],
      numero(resolucao.resultado.length),
      geradorNotacao.saoEquivalentes,
    ),
    dica: {
      uniao: 'União (∪): junte os elementos dos dois conjuntos, sem repetir.',
      intersecao: 'Interseção (∩): fique só com os elementos que estão nos DOIS.',
      diferenca: 'Diferença (A − B): os elementos de A que NÃO estão em B.',
    }[operacao],
  };
}

function lerFuncao(rng: Rng, nivel: Nivel): Exercicio<Resposta> {
  const a = rng.inteiro(2, 6);
  const b = rng.inteiro(-8, 8);
  const x = rng.inteiro(-4, 6);
  const resultado = a * x + b;
  const sinal = b < 0 ? '-' : '+';

  return {
    id: `notacao-funcao-${a}-${b}-${x}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Leia a assinatura e a regra da função, e calcule f(${x}).`,
    enunciadoTex: `f: \\mathbb{R} \\to \\mathbb{R}, \\quad f(x) = ${a}x ${sinal} ${Math.abs(b)}`,
    gabarito: numero(resultado),
    resolucao: {
      resultado: numero(resultado),
      passos: [
        {
          descricao: 'A assinatura diz o que entra e o que sai: um real entra, um real sai.',
          tex: `f: \\mathbb{R} \\to \\mathbb{R}`,
          nota: 'Ela não diz como calcular — isso é a regra, que vem depois.',
        },
        {
          descricao: `Na regra, trocamos x por ${x}.`,
          tex: `f(${x}) = ${a} \\cdot (${x}) ${sinal} ${Math.abs(b)}`,
        },
        {
          descricao: 'Calculamos.',
          tex: `f(${x}) = ${resultado}`,
        },
      ],
    },
    conceitos: ['notacao.funcoes', 'notacao.leitura'],
    armadilhas: semColisoes(
      [
        {
          resposta: numero(a + x + b),
          diagnostico:
            '`2x` quer dizer 2 vezes x, não 2 mais x. A multiplicação entre número e letra é ' +
            'escrita sem sinal nenhum.',
          passo: 1,
          conceito: 'notacao.funcoes',
        },
      ],
      numero(resultado),
      geradorNotacao.saoEquivalentes,
    ),
    dica: 'f(número) quer dizer: troque todo x por esse número e calcule.',
  };
}

/* -------------------------------------------------------------------------- */
/* ESCREVER: do português para os símbolos                                      */
/* -------------------------------------------------------------------------- */

/** Monta um exercício de escrita, com o texto e as formas que valem. */
function escrever(
  nivel: Nivel,
  rng: Rng,
  texto: string,
  conceito: string,
  gabarito: Resposta,
  armadilhas: readonly { readonly resposta: Resposta; readonly diagnostico: string }[] = [],
): Exercicio<Resposta> {
  return {
    id: `notacao-escrever-${conceito}-${canonizarNotacao(gabarito.exibida)}-${rng.inteiro(0, 9999)}`,
    nivel,
    enunciado: `Escreva em símbolos: ${texto}`,
    // Sem fórmula: a notação é a resposta, não a pergunta.
    enunciadoTex: SEM_FORMULA,
    gabarito,
    resolucao: {
      resultado: gabarito,
      passos: [
        {
          descricao: 'O que o texto pede, símbolo a símbolo.',
          tex: `\\text{${texto}}`,
        },
        {
          descricao: 'Em notação.',
          tex: gabarito.exibida.replace(/∀/g, '\\forall ').replace(/∃/g, '\\exists '),
          nota: `Também vale escrever: ${gabarito.aceitas.join('  ·  ')}.`,
        },
      ],
    },
    conceitos: [conceito, 'notacao.escrita'],
    armadilhas: semColisoes(
      armadilhas.map((armadilha) => ({ ...armadilha, passo: 1, conceito })),
      gabarito,
      geradorNotacao.saoEquivalentes,
    ),
    dica: dicaDaEscrita(texto),
  };
}

/** A dica de cada frase a escrever: qual símbolo procurar nos botões. */
function dicaDaEscrita(texto: string): string {
  if (texto.startsWith('para todo')) {
    return '«Para todo» é ∀; depois vem o conjunto e a condição: ∀x ∈ conjunto, condição.';
  }
  if (texto.startsWith('existe')) return '«Existe» é ∃: ∃x ∈ conjunto tal que a condição vale.';
  if (texto.includes('soma de')) {
    return 'A soma é Σ, com o índice e o início embaixo (k = início) e o fim em cima.';
  }
  if (texto.includes('função')) return 'Uma função de A em B se escreve f: A → B.';
  if (texto.includes('pertence')) return '«Pertence» é ∈, e o conjunto vem depois: número ∈ ℕ.';
  return 'Os botões abaixo do campo escrevem os símbolos.';
}

const CONJUNTOS: readonly { readonly nome: string; readonly simbolo: string }[] = [
  { nome: 'real', simbolo: 'ℝ' },
  { nome: 'natural', simbolo: 'ℕ' },
  { nome: 'inteiro', simbolo: 'ℤ' },
];

function escreverQuantificador(rng: Rng, nivel: Nivel): Exercicio<Resposta> {
  const conjunto = rng.escolher(CONJUNTOS);
  const universal = rng.booleano();
  const limite = rng.inteiro(1, 9);
  const relacao = rng.escolher(['>', '≥', '≠'] as const);
  const lido = { '>': 'maior que', '≥': 'maior ou igual a', '≠': 'diferente de' }[relacao];

  const quantificador = universal ? '∀' : '∃';
  const texto = universal
    ? `para todo x ${conjunto.nome}, x é ${lido} ${limite}`
    : `existe um x ${conjunto.nome} ${lido} ${limite}`;

  return escrever(
    nivel,
    rng,
    texto,
    'notacao.quantificadores',
    notacao(
      `${quantificador}x ∈ ${conjunto.simbolo}, x ${relacao} ${limite}`,
      `${quantificador}x ∈ ${conjunto.simbolo}: x ${relacao} ${limite}`,
    ),
    [
      {
        resposta: notacao(
          `${universal ? '∃' : '∀'}x ∈ ${conjunto.simbolo}, x ${relacao} ${limite}`,
        ),
        diagnostico: universal
          ? '∃ é "existe", e diz que BASTA um. "Para todo" é ∀, que exige de todos.'
          : '∀ é "para todo", e exige de todos. "Existe" é ∃, que pede apenas um.',
      },
    ],
  );
}

function escreverIntervalo(rng: Rng, nivel: Nivel): Exercicio<Resposta> {
  const de = rng.inteiro(-5, 5);
  const ate = de + rng.inteiro(2, 8);
  const fechado = rng.booleano();

  const texto = fechado
    ? `x está entre ${de} e ${ate}, incluindo os dois extremos`
    : `x está entre ${de} e ${ate}, sem valer ${de} nem ${ate}`;

  const certo = fechado ? `x ∈ [${de}, ${ate}]` : `x ∈ (${de}, ${ate})`;
  const errado = fechado ? `x ∈ (${de}, ${ate})` : `x ∈ [${de}, ${ate}]`;

  return escrever(nivel, rng, texto, 'notacao.intervalos', notacao(certo), [
    {
      resposta: notacao(errado),
      diagnostico: fechado
        ? 'Parêntese deixa o extremo de fora. Para incluir as pontas, o desenho é o colchete.'
        : 'Colchete inclui o extremo. Para deixar as pontas de fora, o desenho é o parêntese.',
    },
  ]);
}

function escreverPertinencia(rng: Rng, nivel: Nivel): Exercicio<Resposta> {
  const conjunto = rng.escolher(CONJUNTOS);
  const contido = rng.booleano();

  return contido
    ? escrever(
        nivel,
        rng,
        `o conjunto A está contido no conjunto B`,
        'notacao.conjuntos',
        notacao('A ⊂ B'),
        [
          {
            resposta: notacao('A ∈ B'),
            diagnostico:
              '∈ liga um ELEMENTO a um conjunto; ⊂ liga um conjunto a outro. A é um conjunto, ' +
              'então o símbolo é ⊂.',
          },
        ],
      )
    : escrever(
        nivel,
        rng,
        `o número 7 pertence ao conjunto dos ${conjunto.nome}s`,
        'notacao.conjuntos',
        notacao(`7 ∈ ${conjunto.simbolo}`),
        [
          {
            resposta: notacao(`7 ⊂ ${conjunto.simbolo}`),
            diagnostico:
              '⊂ liga um conjunto a outro; 7 é um elemento, não um conjunto. Para elemento o ' +
              'símbolo é ∈.',
          },
        ],
      );
}

function escreverFuncao(rng: Rng, nivel: Nivel): Exercicio<Resposta> {
  const entrada = rng.escolher(CONJUNTOS);
  const saida = rng.escolher(CONJUNTOS);

  return escrever(
    nivel,
    rng,
    `a função f recebe um ${entrada.nome} e devolve um ${saida.nome}`,
    'notacao.funcoes',
    /*
     * `f(x)` também vale aqui, e não por generosidade: a tecla que este campo
     * oferece para função é `f(x)`, então é isso que sai do teclado do site.
     * Recusar a forma que nós mesmos damos ao aluno é defeito nosso. Numa
     * assinatura, `f` e `f(x)` apontam para a mesma função.
     */
    notacao(
      `f: ${entrada.simbolo} → ${saida.simbolo}`,
      `f(x): ${entrada.simbolo} → ${saida.simbolo}`,
    ),
  );
}

function escreverModulo(rng: Rng, nivel: Nivel): Exercicio<Resposta> {
  const quanto = rng.inteiro(2, 9);

  return escrever(
    nivel,
    rng,
    `o valor absoluto de x menos ${quanto}`,
    'notacao.modulo',
    notacao(`|x - ${quanto}|`),
    [
      {
        resposta: notacao(`|x| - ${quanto}`),
        diagnostico:
          'As barras precisam abraçar a subtração inteira: o texto diz o módulo DE "x menos ' +
          `${quanto}", e não o módulo de x menos ${quanto}.`,
      },
    ],
  );
}

function escreverSomatorio(rng: Rng, nivel: Nivel): Exercicio<Resposta> {
  const ate = rng.escolher(['n', '10', '100']);
  const termo = rng.escolher([
    { texto: 'os quadrados de k', corpo: 'k^2' },
    { texto: 'os valores de k', corpo: 'k' },
    { texto: 'os dobros de k', corpo: '2k' },
  ]);

  return escrever(
    nivel,
    rng,
    `a soma de ${termo.texto}, com k indo de 1 até ${ate}`,
    'notacao.somatorio',
    notacao(`∑_{k=1}^{${ate}} ${termo.corpo}`),
    [
      {
        resposta: notacao(`∏_{k=1}^{${ate}} ${termo.corpo}`),
        diagnostico: 'Esse é o pi maiúsculo, que MULTIPLICA. Somar é o sigma, ∑.',
      },
    ],
  );
}

/* -------------------------------------------------------------------------- */

const LEITURAS: Readonly<Record<Nivel, readonly Sorteador[]>> = {
  facil: [
    (rng) => lerModuloFatorial(rng, 'facil'),
    (rng) => lerIntervalo(rng, 'facil'),
    (rng) => lerFuncao(rng, 'facil'),
    (rng) => lerSomatorio(rng, 'facil'),
  ],
  medio: [
    (rng) => lerSomatorio(rng, 'medio'),
    (rng) => lerProdutorio(rng, 'medio'),
    (rng) => lerConjuntos(rng, 'medio'),
    (rng) => lerIntervalo(rng, 'medio'),
    (rng) => lerFuncao(rng, 'medio'),
  ],
  dificil: [
    (rng) => lerSomatorio(rng, 'dificil'),
    (rng) => lerProdutorio(rng, 'dificil'),
    (rng) => lerConjuntos(rng, 'dificil'),
    (rng) => lerIntervalo(rng, 'dificil'),
    (rng) => lerModuloFatorial(rng, 'dificil'),
  ],
  /*
   * No extremo só ficam as leituras que compõem símbolos: somatório e
   * produtório com mais parcelas, operação entre conjuntos, fatorial. O
   * intervalo sai — contar inteiros num intervalo não fica mais difícil, só
   * mais longo.
   */
  extremo: [
    (rng) => lerSomatorio(rng, 'extremo'),
    (rng) => lerProdutorio(rng, 'extremo'),
    (rng) => lerConjuntos(rng, 'extremo'),
    (rng) => lerModuloFatorial(rng, 'extremo'),
  ],
};

const ESCRITAS: Readonly<Record<Nivel, readonly Sorteador[]>> = {
  facil: [
    (rng) => escreverPertinencia(rng, 'facil'),
    (rng) => escreverIntervalo(rng, 'facil'),
    (rng) => escreverModulo(rng, 'facil'),
  ],
  medio: [
    (rng) => escreverQuantificador(rng, 'medio'),
    (rng) => escreverIntervalo(rng, 'medio'),
    (rng) => escreverFuncao(rng, 'medio'),
    (rng) => escreverPertinencia(rng, 'medio'),
  ],
  dificil: [
    (rng) => escreverQuantificador(rng, 'dificil'),
    (rng) => escreverSomatorio(rng, 'dificil'),
    (rng) => escreverFuncao(rng, 'dificil'),
    (rng) => escreverModulo(rng, 'dificil'),
  ],
  // Escrever é o que fica difícil de verdade: só quantificador e somatório.
  extremo: [
    (rng) => escreverQuantificador(rng, 'extremo'),
    (rng) => escreverSomatorio(rng, 'extremo'),
    (rng) => escreverFuncao(rng, 'extremo'),
  ],
};
