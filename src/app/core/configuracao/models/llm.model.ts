/**
 * A configuração da LLM local, como o aluno a deixou.
 *
 * Era constante no código — `CONFIGURACAO_PADRAO` em `lote-de-historias.ts` — e
 * trocar de modelo exigia um deploy. Mas o modelo certo depende da máquina: um
 * `gpt-oss:20b` de 14 GB é rápido num Mac com memória e inútil num que começa a
 * usar disco; e um modelo pequeno, que cabe em qualquer lugar, escreve mal.
 * Quem sabe qual é o caso é quem estuda.
 *
 * ## Por que este grupo é separado dos números da progressão
 *
 * `Configuracao` é toda numérica, e isso não é acidente: `definir`, `validar` e
 * `harmonizar` tratam tudo como número com limite, e há um teste que exige um
 * limite declarado para cada chave. Texto e booleano não cabem nesse molde sem
 * abrir um caminho paralelo em três funções — então a LLM tem o seu, com a
 * mesma ideia (padrão, limites, validação) e as regras que lhe são próprias.
 */

/** Onde o Ollama responde, com qual modelo, e em lotes de quanto. */
export interface ConfiguracaoDaLlm {
  /**
   * O endereço do servidor. **Vazio significa herdar o do assistente.**
   *
   * É o padrão, e é o que dá zero configuração: se o assistente alcança o
   * Ollama, as histórias alcançam. Um endereço escrito aqui vence a herança —
   * serve para quem tem dois servidores ou aponta para outra máquina.
   */
  readonly endpoint: string;
  /** O modelo que escreve as histórias. Nunca é herdado: veja `LLM_PADRAO`. */
  readonly modelo: string;
  /**
   * `false` desliga o rascunho dos modelos de raciocínio; `'low'` é para os
   * que recusam `false` e aceitam o grau.
   */
  readonly raciocinio: 'false' | 'low';
  /** Quantas histórias pedir POR NÍVEL. Multiplique por quatro para o total. */
  readonly lote: number;
}

/**
 * Os valores de fábrica.
 *
 * O modelo NÃO é herdado do assistente, e isso foi medido: o do assistente é
 * escolhido para conversar, e um de 43 GB fez o lote estourar o prazo. Escrever
 * enunciado em lote é tarefa de modelo rápido — o `gpt-oss:20b` levou 13 s no
 * lote de seis contra 50 s do grande, com a mesma taxa de aprovação.
 *
 * O raciocínio fica desligado, e a medição de 14/11 mostra por quê: com
 * `false`, o lote leva 82 a 117 s e aproveita 6 de 6; com `'low'`, leva 17 a
 * 34 s e aproveita 2 a 4. Como ninguém espera por este pedido — a fila repõe em
 * segundo plano —, o que interessa é quantas histórias boas chegam.
 */
export const LLM_PADRAO: ConfiguracaoDaLlm = {
  endpoint: '',
  modelo: 'gpt-oss:20b',
  raciocinio: 'false',
  lote: 2,
};

/** Até onde o lote pode ir. Um é o mínimo útil; quatro já são 16 por pedido. */
export const LOTE_MINIMO = 1;
export const LOTE_MAXIMO = 4;

/**
 * Deixa o que veio do armazenamento com cara de configuração.
 *
 * O que está no navegador não é confiável só porque fomos nós que gravamos:
 * versão antiga, edição à mão e aba de outra origem chegam aqui como qualquer
 * coisa. Cada campo é conferido por si, e o que não passa volta ao padrão — em
 * vez de recusar o conjunto inteiro, que apagaria um ajuste bom por causa de um
 * campo estragado.
 */
export function validarLlm(bruto: unknown): ConfiguracaoDaLlm {
  if (bruto === null || typeof bruto !== 'object') {
    return LLM_PADRAO;
  }

  const lido = bruto as Partial<Record<keyof ConfiguracaoDaLlm, unknown>>;

  const modelo =
    typeof lido.modelo === 'string' && lido.modelo.trim() !== ''
      ? lido.modelo.trim()
      : LLM_PADRAO.modelo;

  const endpoint = typeof lido.endpoint === 'string' ? lido.endpoint.trim() : LLM_PADRAO.endpoint;

  const raciocinio = lido.raciocinio === 'low' ? 'low' : 'false';

  const lote =
    typeof lido.lote === 'number' && Number.isFinite(lido.lote)
      ? Math.min(LOTE_MAXIMO, Math.max(LOTE_MINIMO, Math.round(lido.lote)))
      : LLM_PADRAO.lote;

  return { endpoint, modelo, raciocinio, lote };
}

/** Troca um campo. O lote é preso no limite; o resto é texto livre. */
export function definirLlm(
  atual: ConfiguracaoDaLlm,
  campo: keyof ConfiguracaoDaLlm,
  valor: string | number,
): ConfiguracaoDaLlm {
  if (campo === 'lote') {
    const numero = typeof valor === 'number' ? valor : Number(valor);

    return {
      ...atual,
      lote: Number.isFinite(numero)
        ? Math.min(LOTE_MAXIMO, Math.max(LOTE_MINIMO, Math.round(numero)))
        : atual.lote,
    };
  }

  if (campo === 'raciocinio') {
    return { ...atual, raciocinio: valor === 'low' ? 'low' : 'false' };
  }

  return { ...atual, [campo]: String(valor) };
}

/** Está tudo como veio de fábrica? */
export function llmEhPadrao(llm: ConfiguracaoDaLlm): boolean {
  return JSON.stringify(llm) === JSON.stringify(LLM_PADRAO);
}
