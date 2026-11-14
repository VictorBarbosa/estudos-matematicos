import { signal } from '@angular/core';
import { SERVIDOR_PADRAO } from '@core/assistente/models/assistente.model';
import { OllamaService } from '@core/assistente/services/ollama.service';
import { PedidoDeProblema, montarPrompt } from '@core/problemas/prompt/montar-prompt';
import {
  ModeloBruto,
  ModeloDeProblema,
  assinaturaDoModelo,
  validarModelo,
} from '@core/problemas/validacao/validar-modelo';

/**
 * A política de um lote de histórias: pedir, filtrar e saber desistir.
 *
 * **Não** é um serviço. Quem conversa com o Ollama é o `OllamaService` que o
 * assistente já usava desde antes — listar modelos, o recuo do campo `think`,
 * a mensagem de «sem contato» traduzida — e duplicar aquilo seria manter duas
 * versões da mesma conversa. O que não existia lá era pedir uma resposta
 * inteira em JSON conforme um esquema; isso entrou lá, como `pedirJson`, e o
 * que sobrou aqui é só o que é dos problemas de palavra.
 *
 * A primeira coisa que esta classe sabe fazer é desistir. Um site de estudo
 * não pode ficar devendo exercício porque um programa na máquina de quem
 * estuda não está ligado: o treino funciona sem isto, e isto ou chega rápido
 * ou sai de cena.
 */

/** Onde o Ollama responde, com qual modelo, e em lotes de quanto. */
export interface ConfiguracaoDaLlm {
  readonly endpoint: string;
  readonly modelo: string;
  /** `false`, ou `'low'` nos modelos que não aceitam desligar o raciocínio. */
  readonly raciocinio: boolean | string;
  readonly lote: number;
}

/**
 * O padrão foi escolhido lendo os textos dos dois modelos.
 *
 * O `gpt-oss:20b` com raciocínio baixo escreve o mesmo formato que o
 * `qwen3.8:27b-mlx` em metade do tempo — 12 a 27 segundos por lote de seis,
 * contra 32 a 53 — e, depois das correções de prompt, aprova 18 de 18 nos três
 * tópicos de teste. A comparação está em `comparacao-modelos.md`.
 */
export const CONFIGURACAO_PADRAO: ConfiguracaoDaLlm = {
  endpoint: SERVIDOR_PADRAO,
  modelo: 'gpt-oss:20b',
  raciocinio: 'low',
  lote: 6,
};

/** Depois de três falhas seguidas, para de tentar até o próximo tópico. */
const FALHAS_ATE_DESISTIR = 3;

/** Um lote demora de 12 a 53 segundos; 60 é desistir, não é apressar. */
const LIMITE_EM_MS = 60_000;

interface RespostaDoLote {
  readonly problemas?: readonly ModeloBruto[];
}

export class LoteDeHistorias {
  constructor(private readonly ollama: OllamaService) {}

  private readonly falhas = signal(0);

  /** Verdadeiro enquanto há um lote em andamento, para o aviso de preparo. */
  readonly pedindo = signal(false);

  /** Falso quando as tentativas seguidas falharam: ninguém insiste à toa. */
  readonly valeTentarDeNovo = signal(true);

  /** Esquece as falhas: chamado ao entrar noutro tópico. */
  recomecar(): void {
    this.falhas.set(0);
    this.valeTentarDeNovo.set(true);
  }

  /**
   * Um lote aprovado pelo portão, já sem repetições entre si.
   *
   * Devolve lista vazia em qualquer problema — rede, formato, modelo fora do
   * ar — e nunca lança: quem chama tem o enunciado de sempre como reserva e
   * não precisa tratar erro.
   */
  async pedir(
    pedido: PedidoDeProblema,
    configuracao: ConfiguracaoDaLlm,
  ): Promise<readonly ModeloDeProblema[]> {
    if (!this.valeTentarDeNovo()) {
      return [];
    }

    this.pedindo.set(true);

    const controle = new AbortController();
    const relogio = setTimeout(() => controle.abort(), LIMITE_EM_MS);

    try {
      const { system, user, esquema } = montarPrompt(pedido);

      const resposta = await this.ollama.pedirJson<RespostaDoLote>(
        configuracao.endpoint,
        configuracao.modelo,
        system,
        user,
        esquema,
        controle.signal,
        configuracao.raciocinio,
      );

      const aprovados = this.filtrar(resposta?.problemas ?? [], pedido);

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
      clearTimeout(relogio);
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

  /** O portão, mais o descarte de histórias repetidas dentro do lote. */
  private filtrar(
    brutos: readonly ModeloBruto[],
    pedido: PedidoDeProblema,
  ): readonly ModeloDeProblema[] {
    // Fórmula pode aparecer mais de uma vez: a substância é nomeada na
    // história e cobrada na pergunta. Número, não.
    const repetiveis = pedido.dados
      .filter((dado) => dado.tipo === 'formula')
      .map((dado) => dado.indice);

    const aprovados: ModeloDeProblema[] = [];
    const vistos = new Set<string>();

    for (const bruto of brutos) {
      const veredito = validarModelo(
        bruto,
        pedido.dados.length,
        pedido.proibidas ?? [],
        repetiveis,
      );

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
