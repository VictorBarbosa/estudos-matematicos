import { Injectable, signal } from '@angular/core';
import {
  ModeloBruto,
  ModeloDeProblema,
  assinaturaDoModelo,
  validarModelo,
} from '@core/problemas/validacao/validar-modelo';
import { PedidoDeProblema, montarPrompt } from '@core/problemas/prompt/montar-prompt';

/**
 * A conversa com o modelo de linguagem local.
 *
 * Fala com um Ollama em `localhost`, e a primeira coisa que ele sabe fazer é
 * **desistir**. Um site de estudo não pode ficar devendo exercício porque um
 * programa na máquina de quem estuda não está ligado: o treino funciona sem
 * isto, e esta camada é um acréscimo que ou chega rápido ou sai de cena.
 *
 * Por que esta classe não decide nada sobre o exercício: ela recebe um pedido
 * pronto, devolve histórias aprovadas pelo portão, e não conhece gerador,
 * nível nem gabarito. Quem junta as peças é o serviço de histórias.
 *
 * ## Duas coisas medidas em 14/11, que ficam no código para não se perderem
 *
 * - **`think` tem de ser contido.** Com o raciocínio solto, o `gpt-oss:20b`
 *   gastou todo o orçamento de tokens pensando e devolveu `content` vazio em
 *   dois de três pedidos (`done_reason: length`). Escrever um enunciado não é
 *   tarefa de raciocínio: não há conta a fazer, há história a escrever.
 * - **O esquema JSON do Ollama vale a pena.** Com `format` de esquema, o corpo
 *   volta parseável; sem ele, metade das respostas vem embrulhada em markdown.
 */

/** Onde o Ollama responde, e com qual modelo. */
export interface ConfiguracaoDaLlm {
  readonly endpoint: string;
  readonly modelo: string;
  /** `false`, ou `'low'` nos modelos que não aceitam desligar. */
  readonly raciocinio: boolean | string;
  /** Quantas histórias pedir por lote. */
  readonly lote: number;
}

/**
 * O padrão foi escolhido lendo os textos dos dois modelos.
 *
 * O `gpt-oss:20b` com raciocínio baixo escreve o mesmo formato que o
 * `qwen3.8:27b-mlx` em metade do tempo — 14 a 27 segundos por lote de seis,
 * contra 32 a 53. A comparação completa está em `comparacao-modelos.md`.
 */
export const CONFIGURACAO_PADRAO: ConfiguracaoDaLlm = {
  endpoint: 'http://localhost:11434',
  modelo: 'gpt-oss:20b',
  raciocinio: 'low',
  lote: 6,
};

/** Depois de três falhas seguidas, para de tentar até o próximo tópico. */
const FALHAS_ATE_DESISTIR = 3;

/** Um lote demora de 14 a 53 segundos; 60 é desistir, não é apressar. */
const LIMITE_EM_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class LlmService {
  private readonly falhas = signal(0);

  /** Verdadeiro enquanto há um lote em andamento, para o aviso de preparo. */
  readonly pedindo = signal(false);

  /** Falso quando as tentativas seguidas falharam: ninguém insiste à toa. */
  readonly valeTentarDeNovo = signal(true);

  /** O Ollama está no ar? Uma pergunta barata, usada antes do primeiro lote. */
  async disponivel(configuracao: ConfiguracaoDaLlm): Promise<boolean> {
    try {
      const controle = new AbortController();
      const relogio = setTimeout(() => controle.abort(), 2_000);

      const resposta = await fetch(`${configuracao.endpoint}/api/tags`, {
        signal: controle.signal,
      });

      clearTimeout(relogio);

      return resposta.ok;
    } catch {
      return false;
    }
  }

  /** Esquece as falhas: chamado ao entrar noutro tópico. */
  recomecar(): void {
    this.falhas.set(0);
    this.valeTentarDeNovo.set(true);
  }

  /**
   * Um lote de histórias aprovadas, já sem repetições entre si.
   *
   * Devolve lista vazia em qualquer problema — rede, formato, modelo fora do
   * ar —, e nunca lança: quem chama tem um enunciado de reserva e não precisa
   * tratar erro.
   */
  async pedirLote(
    pedido: PedidoDeProblema,
    configuracao: ConfiguracaoDaLlm,
  ): Promise<readonly ModeloDeProblema[]> {
    if (!this.valeTentarDeNovo()) {
      return [];
    }

    this.pedindo.set(true);

    try {
      const brutos = await this.conversar(pedido, configuracao);
      // Fórmula pode aparecer mais de uma vez: a substância é nomeada na
      // história e cobrada na pergunta. Número, não.
      const repetiveis = pedido.dados
        .filter((dado) => dado.tipo === 'formula')
        .map((dado) => dado.indice);

      const aprovados = this.filtrar(
        brutos,
        pedido.dados.length,
        pedido.proibidas ?? [],
        repetiveis,
      );

      if (aprovados.length === 0) {
        this.contarFalha();
      } else {
        this.falhas.set(0);
      }

      return aprovados;
    } catch {
      this.contarFalha();
      return [];
    } finally {
      this.pedindo.set(false);
    }
  }

  private contarFalha(): void {
    const total = this.falhas() + 1;
    this.falhas.set(total);

    if (total >= FALHAS_ATE_DESISTIR) {
      this.valeTentarDeNovo.set(false);
    }
  }

  private async conversar(
    pedido: PedidoDeProblema,
    configuracao: ConfiguracaoDaLlm,
  ): Promise<readonly ModeloBruto[]> {
    const { system, user, esquema } = montarPrompt(pedido);

    const controle = new AbortController();
    const relogio = setTimeout(() => controle.abort(), LIMITE_EM_MS);

    try {
      const resposta = await fetch(`${configuracao.endpoint}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: controle.signal,
        body: JSON.stringify({
          model: configuracao.modelo,
          stream: false,
          format: esquema,
          think: configuracao.raciocinio,
          options: { temperature: 0.8, num_predict: 8192 },
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      });

      if (!resposta.ok) {
        return [];
      }

      const corpo = (await resposta.json()) as { message?: { content?: string } };
      const conteudo = (corpo.message?.content ?? '').trim();

      if (conteudo.length === 0) {
        return [];
      }

      const lido = JSON.parse(conteudo) as { problemas?: readonly ModeloBruto[] };

      return lido.problemas ?? [];
    } finally {
      clearTimeout(relogio);
    }
  }

  /** O portão, mais o descarte de histórias repetidas dentro do lote. */
  private filtrar(
    brutos: readonly ModeloBruto[],
    lacunas: number,
    proibidas: readonly string[],
    repetiveis: readonly number[],
  ): readonly ModeloDeProblema[] {
    const aprovados: ModeloDeProblema[] = [];
    const vistos = new Set<string>();

    for (const bruto of brutos) {
      const veredito = validarModelo(bruto, lacunas, proibidas, repetiveis);

      if (!veredito.ok) {
        continue;
      }

      const assinatura = assinaturaDoModelo(bruto);

      if (vistos.has(assinatura)) {
        continue;
      }

      vistos.add(assinatura);
      aprovados.push(veredito.modelo);
    }

    return aprovados;
  }
}
