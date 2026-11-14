import { signal } from '@angular/core';
import type { ConfiguracaoDaLlm } from '@core/configuracao/models/llm.model';
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

/**
 * A configuração da LLM passou a viver em `configuracao/models/llm.model`,
 * onde a tela de configurações a alcança — era constante aqui, e trocar de
 * modelo exigia um deploy.
 *
 * Fica o reexport para quem já importava deste arquivo, e porque é esta classe
 * quem usa a configuração de fato.
 */
export { LLM_PADRAO as CONFIGURACAO_PADRAO } from '@core/configuracao/models/llm.model';
export type { ConfiguracaoDaLlm } from '@core/configuracao/models/llm.model';

/** Depois de três falhas seguidas, para de tentar até o próximo tópico. */
const FALHAS_ATE_DESISTIR = 3;

/**
 * Quando desistir de um lote.
 *
 * Eram 60 segundos, e isso cancelava tudo: com o raciocínio desligado o lote
 * leva de 82 a 117 segundos, e o `AbortController` matava a requisição antes
 * de ela voltar — o pedido aparecia como cancelado sem nenhum erro de verdade.
 *
 * Agora são QUATRO MINUTOS, e o número foi medido, não estimado: o lote que
 * cobre os quatro níveis (dois por nível, oito no total) levou 143 s com o
 * modelo quente nesta máquina. Três minutos deixavam onze segundos de folga, e
 * a primeira carga do modelo na memória come os trinta que faltavam — o lote
 * morreria calado justamente na primeira vez de cada sessão. Quatro minutos
 * cobrem o lote lento e a carga inicial, e não custam nada a quem estuda:
 * ninguém espera por este pedido, que repõe a fila em segundo plano.
 */
const LIMITE_EM_MS = 240_000;

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
        // `'false'` guardado como texto vira o booleano que a API espera;
        // `'low'` passa como grau, para os modelos que recusam desligar.
        configuracao.raciocinio === 'false' ? false : 'low',
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
      const veredito = validarModelo(bruto, pedido.dados.length, {
        proibidas: pedido.proibidas,
        permitidas: pedido.permitidas,
        repetiveis,
        // Sem esta lista o portão não confere a etiqueta, e uma história de
        // nível difícil cairia na fila do fácil — o pedido de quatro níveis
        // viraria um lote de um, sem erro nenhum à vista.
        niveis: pedido.niveis,
      });

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
