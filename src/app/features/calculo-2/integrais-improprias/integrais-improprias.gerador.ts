import {
  ExpoenteRacional,
  Resolucao,
  arcotangenteNoInfinitoComPassos,
  comparacaoComPassos,
  criterioDaPotencia,
  exponencialNoInfinitoComPassos,
  expoenteTexto,
  expoenteValor,
  integrandoPotenciaTex,
  potenciaNaOrigemComPassos,
  potenciaNoInfinitoComPassos,
  ValorImproprio,
} from '@core/math';
import { Rng } from '@core/treino/rng/rng';
import { analisarNumero, proximosEmCasas, formatarNumero } from '@core/treino/resposta-numerica/resposta-numerica';
import {
  Armadilha,
  Exercicio,
  GeradorExercicio,
  Nivel,
  TeclaDeSimbolo,
  semColisoes,
} from '@core/treino/models/treino.model';

/**
 * Exercícios de integral imprópria.
 *
 * A resposta aqui tem três formas possíveis, e é de propósito: às vezes a
 * pergunta é quanto vale, às vezes é só se existe. Confundir as duas é o
 * engano central do tópico — uma integral que converge tem um número, e uma
 * que diverge não tem nenhum, por mais que a conta pareça ter terminado.
 */

/** O que o aluno pode responder: um veredito ou um número. */
export type RespostaImpropria =
  | { readonly tipo: 'diverge' }
  | { readonly tipo: 'converge' }
  | { readonly tipo: 'valor'; readonly valor: number };

const DIVERGENTE: RespostaImpropria = { tipo: 'diverge' };
const CONVERGENTE: RespostaImpropria = { tipo: 'converge' };

const valorDe = (valor: number): RespostaImpropria => ({ tipo: 'valor', valor });

const CASAS = 3;
const proximos = proximosEmCasas(CASAS);

const SIMBOLOS: readonly TeclaDeSimbolo[] = [
  { rotulo: '∞', insere: 'diverge', nome: 'diverge' },
  { rotulo: 'conv.', insere: 'converge', nome: 'converge' },
  { rotulo: 'π', insere: 'π', nome: 'pi' },
];

type Tipo = 'potencia-infinito' | 'potencia-origem' | 'exponencial' | 'arcotangente' | 'comparacao';

const TIPOS_POR_NIVEL: Readonly<Record<Nivel, readonly Tipo[]>> = {
  facil: ['potencia-infinito', 'exponencial'],
  medio: ['potencia-infinito', 'potencia-origem', 'exponencial', 'arcotangente'],
  dificil: ['potencia-infinito', 'potencia-origem', 'arcotangente', 'comparacao'],
};

export const geradorIntegraisImproprias: GeradorExercicio<RespostaImpropria> = {
  topicoId: 'integrais-improprias',
  formatoResposta: 'um número, ou "diverge" quando não houver valor',
  simbolos: SIMBOLOS,

  gerar(nivel: Nivel, rng: Rng): Exercicio<RespostaImpropria> {
    switch (rng.escolher(TIPOS_POR_NIVEL[nivel])) {
      case 'potencia-infinito':
        return noInfinito(nivel, rng);
      case 'potencia-origem':
        return naOrigem(nivel, rng);
      case 'exponencial':
        return daExponencial(nivel, rng);
      case 'arcotangente':
        return doArcotangente(nivel, rng);
      default:
        return daComparacao(nivel, rng);
    }
  },

  analisar(entrada: string): RespostaImpropria | null {
    const texto = entrada.trim().toLowerCase();

    if (/^(diverge|divergente|diverg[eê]ncia|infinito|∞|\+?∞)$/.test(texto)) {
      return DIVERGENTE;
    }
    if (/^(converge|convergente|converg[eê]ncia|existe|finita)$/.test(texto)) {
      return CONVERGENTE;
    }

    const numero = analisarNumero(entrada);
    return numero === null ? null : valorDe(numero);
  },

  /**
   * A comparação é assimétrica de propósito.
   *
   * Quando o gabarito é um número, dizer apenas "converge" não basta: o
   * exercício pediu o valor. Quando o gabarito é só o veredito, um número
   * seria uma afirmação que a comparação não autoriza fazer.
   */
  saoEquivalentes(a: RespostaImpropria, b: RespostaImpropria): boolean {
    if (b.tipo === 'valor') {
      return a.tipo === 'valor' && proximos(a.valor, b.valor);
    }
    return a.tipo === b.tipo;
  },

  formatar(valor: RespostaImpropria): string {
    if (valor.tipo === 'diverge') {
      return 'diverge';
    }
    return valor.tipo === 'converge' ? 'converge' : formatarNumero(valor.valor, CASAS);
  },
};

/** `∫ₐ^∞ dx/xᵖ`: metade converge, metade não, e o expoente decide. */
function noInfinito(nivel: Nivel, rng: Rng): Exercicio<RespostaImpropria> {
  const a = rng.inteiro(1, 10);
  const p = rng.escolher(
    nivel === 'facil'
      ? ([{ num: 2, den: 1 }, { num: 3, den: 1 }, { num: 1, den: 1 }] as const)
      : ([
          { num: 2, den: 1 },
          { num: 3, den: 1 },
          { num: 4, den: 1 },
          { num: 1, den: 1 },
          { num: 1, den: 2 },
          { num: 3, den: 2 },
        ] as const),
  );

  const resolucao = potenciaNoInfinitoComPassos(a, p);
  const gabarito = daResolucao(resolucao);

  return montar({
    chave: `inf-${a}-${p.num}-${p.den}`,
    nivel,
    rng,
    enunciado:
      'Calcule a integral imprópria, ou escreva "diverge". Se houver valor, use 3 casas decimais.',
    enunciadoTex: `\\int_{${a}}^{\\infty} ${integrandoPotenciaTex(p)}\\,dx`,
    gabarito,
    resolucao,
    conceitos: ['improprias.limite-na-borda', 'improprias.criterio-da-potencia'],
    armadilhas: armadilhasDoVeredito(gabarito, p, false, a),
    dica:
      nivel === 'facil'
        ? `No infinito, 1/x elevado a p converge quando p passa de 1. Aqui p vale ${expoenteTexto(p)}.`
        : undefined,
  });
}

/** `∫₀^b dx/xᵖ`: a borda ruim é a de baixo, e o critério inverte. */
function naOrigem(nivel: Nivel, rng: Rng): Exercicio<RespostaImpropria> {
  const b = rng.inteiro(1, 9);
  const p = rng.escolher([
    { num: 1, den: 2 },
    { num: 1, den: 3 },
    { num: 2, den: 3 },
    { num: 1, den: 1 },
    { num: 3, den: 2 },
    { num: 2, den: 1 },
  ] as const);

  const resolucao = potenciaNaOrigemComPassos(b, p);
  const gabarito = daResolucao(resolucao);

  return montar({
    chave: `org-${b}-${p.num}-${p.den}`,
    nivel,
    rng,
    enunciado:
      'O integrando explode em zero. Calcule a integral, ou escreva "diverge". ' +
      'Se houver valor, use 3 casas decimais.',
    enunciadoTex: `\\int_{0}^{${b}} ${integrandoPotenciaTex(p)}\\,dx`,
    gabarito,
    resolucao,
    conceitos: ['improprias.integrando-ilimitado', 'improprias.criterio-da-potencia'],
    armadilhas: armadilhasDoVeredito(gabarito, p, true, b),
    dica:
      nivel === 'medio'
        ? `Na origem o critério inverte: converge quando o expoente fica abaixo de 1.`
        : undefined,
  });
}

/** `∫ₐ^∞ e^{−kx} dx`: converge sempre, e o valor é fechado. */
function daExponencial(nivel: Nivel, rng: Rng): Exercicio<RespostaImpropria> {
  const a = rng.inteiro(0, 5);
  const k = rng.inteiro(1, 8);

  const resolucao = exponencialNoInfinitoComPassos(a, k);
  const gabarito = daResolucao(resolucao);
  const valor = Math.exp(-k * a) / k;

  return montar({
    chave: `exp-${a}-${k}`,
    nivel,
    rng,
    enunciado:
      'Calcule a integral imprópria, ou escreva "diverge". Se houver valor, use 3 casas decimais.',
    enunciadoTex: `\\int_{${a}}^{\\infty} e^{-${k}x}\\,dx`,
    gabarito,
    resolucao,
    conceitos: ['improprias.exponencial', 'improprias.limite-na-borda'],
    armadilhas: [
      {
        resposta: DIVERGENTE,
        diagnostico:
          'A exponencial negativa cai mais rápido que qualquer potência, e por isso a área ' +
          'acumulada é sempre finita. Este caso nunca diverge.',
        passo: 2,
        conceito: 'improprias.exponencial',
      },
      {
        resposta: valorDe(valor * k),
        diagnostico:
          `Faltou dividir pelo fator ${k} do expoente, que a primitiva da exponencial traz.`,
        passo: 1,
        conceito: 'improprias.exponencial',
      },
      {
        resposta: valorDe(-valor),
        diagnostico:
          'O sinal ficou invertido. A primitiva é negativa, mas o termo que sobra vem da borda ' +
          'de baixo com o sinal trocado — e área de função positiva não é negativa.',
        passo: 2,
        conceito: 'improprias.limite-na-borda',
      },
      {
        resposta: CONVERGENTE,
        diagnostico:
          'Ela converge mesmo, mas o exercício pede o valor. Dizer que existe não é calcular.',
        passo: 3,
        conceito: 'improprias.exponencial',
      },
    ],
  });
}

/** `∫ₐ^∞ dx/(1+x²)`: a primitiva é um arco, e o limite é π/2. */
function doArcotangente(nivel: Nivel, rng: Rng): Exercicio<RespostaImpropria> {
  const a = rng.inteiro(0, 4);

  const resolucao = arcotangenteNoInfinitoComPassos(a);
  const gabarito = daResolucao(resolucao);
  const valor = Math.PI / 2 - Math.atan(a);

  return montar({
    chave: `arc-${a}`,
    nivel,
    rng,
    enunciado:
      'Calcule a integral imprópria, ou escreva "diverge". Se houver valor, use 3 casas decimais.',
    enunciadoTex: `\\int_{${a}}^{\\infty} \\frac{dx}{1 + x^{2}}`,
    gabarito,
    resolucao,
    conceitos: ['improprias.arcotangente', 'improprias.limite-na-borda'],
    armadilhas: [
      {
        resposta: DIVERGENTE,
        diagnostico:
          'O arco-tangente tem assíntota horizontal: por maior que seja t, o valor não passa de ' +
          'π/2. Função limitada na ponta é exatamente o que faz a integral convergir.',
        passo: 2,
        conceito: 'improprias.arcotangente',
      },
      {
        resposta: valorDe(Math.PI / 2),
        diagnostico:
          `Esse é o limite no infinito sozinho. Falta subtrair o arco-tangente em ${a}, que é a ` +
          'borda de baixo da integral.',
        passo: 3,
        conceito: 'improprias.limite-na-borda',
      },
      {
        resposta: valorDe(Math.PI - Math.atan(a)),
        diagnostico:
          'O limite do arco-tangente é π/2, e não π. O arco-tangente cobre meia volta ao todo, ' +
          'de −π/2 a π/2.',
        passo: 2,
        conceito: 'improprias.arcotangente',
      },
      {
        resposta: CONVERGENTE,
        diagnostico:
          'Ela converge mesmo, mas o exercício pede o valor. Dizer que existe não é calcular.',
        passo: 3,
        conceito: 'improprias.arcotangente',
      },
    ],
  });
}

/** Comparação: decide o veredito sem calcular o valor. */
function daComparacao(nivel: Nivel, rng: Rng): Exercicio<RespostaImpropria> {
  const a = rng.inteiro(1, 4);
  const caso = rng.escolher(COMPARACOES);
  const p = caso.comparar;

  const resolucao = comparacaoComPassos(caso.descricao, caso.tex, a, p, caso.menor);
  const gabarito: RespostaImpropria = resolucao.resultado ? CONVERGENTE : DIVERGENTE;

  return montar({
    chave: `cmp-${caso.chave}-${a}`,
    nivel,
    rng,
    enunciado:
      'Este integrando não tem primitiva elementar. Decida pelo teste da comparação e ' +
      'responda "converge" ou "diverge".',
    enunciadoTex: `\\int_{${a}}^{\\infty} ${caso.tex}\\,dx`,
    gabarito: gabarito,
    resolucao: {
      resultado: gabarito,
      passos: resolucao.passos,
    },
    conceitos: ['improprias.comparacao', 'improprias.criterio-da-potencia'],
    armadilhas: [
      {
        resposta: gabarito.tipo === 'converge' ? DIVERGENTE : CONVERGENTE,
        diagnostico: caso.menor
          ? 'Ficar ABAIXO de algo que converge garante convergência; ficar abaixo de algo que ' +
            'diverge não garante nada. Olhe para qual lado a desigualdade aponta.'
          : 'Ficar ACIMA de algo que diverge garante divergência. A desigualdade só serve no ' +
            'sentido em que ela aponta.',
        passo: 1,
        conceito: 'improprias.comparacao',
      },
    ],
    dica:
      'A comparação dá o veredito, nunca o valor: a resposta aqui é uma palavra, não um número.',
  });
}

/** Os integrandos sem primitiva elementar que o teste da comparação resolve. */
const COMPARACOES: readonly {
  readonly chave: string;
  readonly tex: string;
  readonly descricao: string;
  readonly comparar: ExpoenteRacional;
  readonly menor: boolean;
}[] = [
  {
    chave: 'gauss',
    tex: 'e^{-x^{2}}',
    descricao: 'É a curva de Gauss, que não tem primitiva em funções elementares.',
    comparar: { num: 2, den: 1 },
    menor: true,
  },
  {
    chave: 'seno-sobre-quadrado',
    tex: '\\frac{2 + \\operatorname{sen} x}{x^{3}}',
    descricao: 'O numerador oscila entre 1 e 3, e o denominador manda no comportamento.',
    comparar: { num: 3, den: 1 },
    menor: true,
  },
  {
    chave: 'raiz-no-denominador',
    tex: '\\frac{1}{\\sqrt{x + 1}}',
    descricao: 'Para x grande, a raiz de x mais um se comporta como a raiz de x.',
    comparar: { num: 1, den: 2 },
    menor: false,
  },
  {
    chave: 'log-sobre-x',
    tex: '\\frac{1 + \\ln x}{x}',
    descricao: 'O logaritmo cresce, de modo que o integrando fica acima de um sobre x.',
    comparar: { num: 1, den: 1 },
    menor: false,
  },
  {
    chave: 'quadrado-mais-um',
    tex: '\\frac{1}{x^{2} + 1}',
    descricao: 'Somar 1 ao denominador só diminui o integrando.',
    comparar: { num: 2, den: 1 },
    menor: true,
  },
];

/** As armadilhas comuns aos dois casos de potência. */
function armadilhasDoVeredito(
  gabarito: RespostaImpropria,
  p: ExpoenteRacional,
  naOrigem: boolean,
  borda: number,
): readonly Armadilha<RespostaImpropria>[] {
  const criterio = criterioDaPotencia(p, naOrigem);
  const expoente = expoenteValor(p);

  const armadilhas: Armadilha<RespostaImpropria>[] = [
    {
      resposta: criterio.converge ? DIVERGENTE : CONVERGENTE,
      diagnostico: naOrigem
        ? `Na origem o critério é o oposto do critério no infinito: converge quando o expoente ` +
          `fica ABAIXO de 1. Aqui ele vale ${expoenteTexto(p)}.`
        : `No infinito converge quando o expoente passa de 1. Aqui ele vale ${expoenteTexto(p)}.`,
      passo: 3,
      conceito: 'improprias.criterio-da-potencia',
    },
  ];

  if (criterio.converge && gabarito.tipo === 'valor') {
    // O erro de conta mais comum: usar o expoente errado no denominador.
    const trocado = naOrigem
      ? borda ** (1 - expoente) / (expoente - 1)
      : borda ** (1 - expoente) / (1 - expoente);

    armadilhas.push({
      resposta: valorDe(trocado),
      diagnostico: naOrigem
        ? 'O denominador é 1 menos o expoente, e não o contrário. Trocar a ordem inverte o sinal ' +
          'da resposta inteira.'
        : 'O denominador é o expoente menos 1, e não o contrário. Trocar a ordem inverte o sinal.',
      passo: 2,
      conceito: 'improprias.limite-na-borda',
    });

    armadilhas.push({
      resposta: valorDe(borda ** (1 - expoente)),
      diagnostico:
        'A avaliação parou na potência da borda e não foi dividida pelo novo expoente, que a ' +
        'primitiva deixou no denominador.',
      passo: 2,
      conceito: 'improprias.limite-na-borda',
    });

    armadilhas.push({
      resposta: CONVERGENTE,
      diagnostico:
        'Está certo que ela converge — mas o exercício pede o valor, e dizer que existe não é ' +
        'o mesmo que calcular. O número sai da avaliação da primitiva na borda.',
      passo: 3,
      conceito: 'improprias.limite-na-borda',
    });
  }

  return armadilhas;
}

/** Converte o resultado do motor na resposta do tópico. */
function daResolucao(resolucao: Resolucao<ValorImproprio>): RespostaImpropria {
  return resolucao.resultado.converge ? valorDe(resolucao.resultado.valor) : DIVERGENTE;
}

interface Pedido {
  readonly chave: string;
  readonly nivel: Nivel;
  readonly rng: Rng;
  readonly enunciado: string;
  readonly enunciadoTex: string;
  readonly gabarito: RespostaImpropria;
  readonly resolucao: Resolucao<ValorImproprio> | Resolucao<RespostaImpropria>;
  readonly conceitos: readonly string[];
  readonly armadilhas: readonly Armadilha<RespostaImpropria>[];
  readonly dica?: string;
}

function montar(pedido: Pedido): Exercicio<RespostaImpropria> {
  const resolucao: Resolucao<RespostaImpropria> = {
    resultado: pedido.gabarito,
    passos: pedido.resolucao.passos,
  };

  return {
    id: `${pedido.chave}-${pedido.rng.inteiro(0, 9999)}`,
    nivel: pedido.nivel,
    enunciado: pedido.enunciado,
    enunciadoTex: pedido.enunciadoTex,
    gabarito: pedido.gabarito,
    resolucao,
    conceitos: pedido.conceitos,
    armadilhas: semColisoes(
      pedido.armadilhas.filter(
        (armadilha) =>
          armadilha.resposta.tipo !== 'valor' || Number.isFinite(armadilha.resposta.valor),
      ),
      pedido.gabarito,
      geradorIntegraisImproprias.saoEquivalentes,
    ),
    dica: pedido.dica,
  };
}
