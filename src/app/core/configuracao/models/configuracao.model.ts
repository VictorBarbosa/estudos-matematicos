/**
 * Os números que governam a progressão, num lugar só.
 *
 * Eles eram constantes espalhadas entre `progressao.model` e `prova.model`, e
 * mudar qualquer um exigia editar o código. Aqui eles viram dados: a tela de
 * configurações escreve, e as funções que decidem leem. Os valores de fábrica
 * continuam sendo os mesmos de antes — quem não mexer em nada não vê diferença.
 */

/** O que é preciso para vencer uma etapa. */
export interface CriterioDaEtapa {
  /** Quantas tentativas recentes entram na conta. */
  readonly respostasNaJanela: number;
  /** Quantas delas precisam estar certas. */
  readonly acertosNaJanela: number;
  /** Quantos acertos precisam ser no Médio ou no Difícil. */
  readonly acertosExigentes: number;
  /** Acertos seguidos no fim da janela, para a etapa não abrir logo após um erro. */
  readonly acertosSeguidosFinais: number;
  /** Acertos exigidos em CADA tipo de questão, onde o tópico declara tipos. */
  readonly acertosPorTipo: number;
}

/** Como o nível sobe e desce sozinho. */
export interface EscadaDeNivel {
  readonly acertosParaSubir: number;
  readonly errosParaDescer: number;
}

/** A prova final de cada sessão. */
export interface RegraDaProva {
  /** Erros que a prova tolera; o seguinte zera a sessão. */
  readonly errosTolerados: number;
  /** Quantas questões a prova tem, no mínimo. */
  readonly minimoDeQuestoes: number;
}

export interface Configuracao {
  readonly etapa: CriterioDaEtapa;
  readonly escada: EscadaDeNivel;
  readonly prova: RegraDaProva;
}

/** Os valores de fábrica: exatamente os que o site usava antes desta tela. */
export const CONFIGURACAO_PADRAO: Configuracao = {
  etapa: {
    respostasNaJanela: 10,
    acertosNaJanela: 8,
    acertosExigentes: 3,
    acertosSeguidosFinais: 3,
    acertosPorTipo: 3,
  },
  escada: {
    acertosParaSubir: 3,
    errosParaDescer: 2,
  },
  prova: {
    errosTolerados: 2,
    minimoDeQuestoes: 8,
  },
};

/** O caminho de um ajuste dentro da configuração: `['etapa', 'acertosNaJanela']`. */
export type Grupo = keyof Configuracao;
export type Ajuste =
  | readonly ['etapa', keyof CriterioDaEtapa]
  | readonly ['escada', keyof EscadaDeNivel]
  | readonly ['prova', keyof RegraDaProva];

/** Até onde cada ajuste pode ir, e o que ele significa na tela. */
export interface LimiteDoAjuste {
  readonly ajuste: Ajuste;
  readonly minimo: number;
  readonly maximo: number;
}

/**
 * Os limites existem para que a tela não produza um critério impossível.
 *
 * O teto de cada um é generoso de propósito: quem quiser um treino severo tem
 * de conseguir pedi-lo. O que os limites impedem é o absurdo — zero respostas
 * na janela, uma prova sem questão nenhuma.
 */
export const LIMITES: readonly LimiteDoAjuste[] = [
  { ajuste: ['etapa', 'respostasNaJanela'], minimo: 3, maximo: 40 },
  { ajuste: ['etapa', 'acertosNaJanela'], minimo: 1, maximo: 40 },
  { ajuste: ['etapa', 'acertosExigentes'], minimo: 0, maximo: 40 },
  { ajuste: ['etapa', 'acertosSeguidosFinais'], minimo: 0, maximo: 40 },
  { ajuste: ['etapa', 'acertosPorTipo'], minimo: 1, maximo: 20 },
  { ajuste: ['escada', 'acertosParaSubir'], minimo: 1, maximo: 20 },
  { ajuste: ['escada', 'errosParaDescer'], minimo: 1, maximo: 20 },
  { ajuste: ['prova', 'errosTolerados'], minimo: 0, maximo: 20 },
  { ajuste: ['prova', 'minimoDeQuestoes'], minimo: 1, maximo: 60 },
];

function limiteDe(ajuste: Ajuste): LimiteDoAjuste {
  const achado = LIMITES.find(
    (limite) => limite.ajuste[0] === ajuste[0] && limite.ajuste[1] === ajuste[1],
  );
  if (achado === undefined) {
    throw new Error(`Ajuste sem limite declarado: ${ajuste.join('.')}`);
  }
  return achado;
}

const inteiroEntre = (valor: unknown, limite: LimiteDoAjuste, padrao: number): number => {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    return padrao;
  }
  return Math.min(limite.maximo, Math.max(limite.minimo, Math.round(valor)));
};

/**
 * Deixa a configuração coerente consigo mesma.
 *
 * Não dá para exigir 12 acertos numa janela de 10, nem 5 acertos exigentes
 * entre 3 acertos. Em vez de recusar o que o aluno pediu, os dependentes
 * acompanham: é o comportamento que não trava a tela no meio de um ajuste.
 */
export function harmonizar(configuracao: Configuracao): Configuracao {
  const { etapa } = configuracao;
  const acertosNaJanela = Math.min(etapa.acertosNaJanela, etapa.respostasNaJanela);

  return {
    ...configuracao,
    etapa: {
      ...etapa,
      acertosNaJanela,
      acertosExigentes: Math.min(etapa.acertosExigentes, acertosNaJanela),
      acertosSeguidosFinais: Math.min(etapa.acertosSeguidosFinais, acertosNaJanela),
    },
  };
}

/** Troca um ajuste, respeitando os limites e a coerência do conjunto. */
export function definir(configuracao: Configuracao, ajuste: Ajuste, valor: number): Configuracao {
  const [grupo, chave] = ajuste;
  const limite = limiteDe(ajuste);
  const padrao = (CONFIGURACAO_PADRAO[grupo] as unknown as Record<string, number>)[chave]!;
  const novo = inteiroEntre(valor, limite, padrao);

  return harmonizar({
    ...configuracao,
    [grupo]: { ...configuracao[grupo], [chave]: novo },
  } as Configuracao);
}

/** Lê o que estava guardado, trocando por padrão tudo que não fizer sentido. */
export function validar(bruto: unknown): Configuracao {
  if (bruto === null || typeof bruto !== 'object') {
    return CONFIGURACAO_PADRAO;
  }

  const lido = bruto as Partial<Record<Grupo, Record<string, unknown>>>;
  const grupos = Object.entries(CONFIGURACAO_PADRAO) as [Grupo, Record<string, number>][];

  const montado = Object.fromEntries(
    grupos.map(([grupo, valores]) => [
      grupo,
      Object.fromEntries(
        Object.entries(valores).map(([chave, padrao]) => [
          chave,
          inteiroEntre(lido[grupo]?.[chave], limiteDe([grupo, chave] as Ajuste), padrao),
        ]),
      ),
    ]),
  ) as unknown as Configuracao;

  return harmonizar(montado);
}

/** A configuração está igual à de fábrica? */
export function ehPadrao(configuracao: Configuracao): boolean {
  return JSON.stringify(configuracao) === JSON.stringify(CONFIGURACAO_PADRAO);
}
