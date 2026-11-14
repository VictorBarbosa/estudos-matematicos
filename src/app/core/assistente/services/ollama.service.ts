import { Injectable, inject } from '@angular/core';
import { I18nService } from '@core/i18n/services/i18n.service';
import { Mensagem, ModeloOllama, Papel } from '@core/assistente/models/assistente.model';

/** O que a API do Ollama devolve em `/api/tags`. */
interface RespostaDeModelos {
  readonly models?: readonly { readonly name?: string; readonly size?: number }[];
}

/** Cada linha do fluxo de `/api/chat`. */
interface PedacoDaResposta {
  readonly message?: { readonly content?: string };
  readonly done?: boolean;
  readonly error?: string;
}

/**
 * Erro com o texto que o aluno precisa ler.
 *
 * Falha de rede, servidor desligado e origem não autorizada chegam ao
 * navegador como o mesmo `TypeError` sem detalhe — então a mensagem precisa
 * cobrir as três, porque não há como distinguir de dentro.
 */
export class FalhaDoOllama extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'FalhaDoOllama';
  }
}

const PAPEL_NA_API: Readonly<Record<Papel, string>> = {
  aluno: 'user',
  assistente: 'assistant',
};

/**
 * Conversa com o Ollama rodando na máquina do aluno.
 *
 * Só o protocolo: listar modelos e transmitir uma resposta. O estado da
 * conversa — o que foi perguntado, qual modelo está escolhido — fica no
 * serviço de cima, que é quem a tela observa.
 */
@Injectable({ providedIn: 'root' })
export class OllamaService {
  private readonly i18n = inject(I18nService);

  /**
   * Os modelos instalados, do maior para o menor.
   *
   * O `sinal` existe para a sondagem do cabeçalho, que precisa desistir
   * depressa: um servidor que não responde deixaria o botão do assistente em
   * suspenso por meio minuto.
   */
  async modelos(servidor: string, sinal?: AbortSignal): Promise<readonly ModeloOllama[]> {
    const resposta = await this.buscar(`${semBarra(servidor)}/api/tags`, { signal: sinal });
    const dados = (await resposta.json()) as RespostaDeModelos;

    return (dados.models ?? [])
      .filter(
        (modelo): modelo is { name: string; size?: number } => typeof modelo.name === 'string',
      )
      .map((modelo) => ({ nome: modelo.name, bytes: modelo.size ?? 0 }))
      .sort((a, b) => b.bytes - a.bytes);
  }

  /**
   * Transmite a resposta, pedaço a pedaço.
   *
   * Em fluxo, e não de uma vez, porque um modelo local leva dezenas de
   * segundos para uma resposta inteira: ver o texto nascer é a diferença entre
   * esperar e achar que travou.
   */
  async *conversar(
    servidor: string,
    modelo: string,
    sistema: string,
    historico: readonly Mensagem[],
    sinal: AbortSignal,
  ): AsyncGenerator<string> {
    const corpo = {
      model: modelo,
      stream: true,
      messages: [
        { role: 'system', content: sistema },
        ...historico.map((mensagem) => ({
          role: PAPEL_NA_API[mensagem.papel],
          content: mensagem.texto,
        })),
      ],
    };

    /*
     * `think: false` desliga o rascunho dos modelos de raciocínio.
     *
     * Sem isso eles gastam dezenas de segundos deliberando antes da primeira
     * palavra — numa máquina de estudo, isso é a diferença entre perguntar e
     * desistir de perguntar.
     *
     * Modelo que não pensa recusa o campo com 400, e aí a mesma pergunta vai
     * de novo sem ele: tentar e recuar sai mais barato que manter uma lista de
     * quem suporta o quê.
     */
    const url = `${semBarra(servidor)}/api/chat`;
    const resposta =
      (await this.pedirChat(url, { ...corpo, think: false }, sinal)) ??
      (await this.pedirChat(url, corpo, sinal, true))!;

    if (resposta.body === null) {
      throw new FalhaDoOllama(this.i18n.t('assistente.semConteudo'));
    }

    const leitor = resposta.body.pipeThrough(new TextDecoderStream()).getReader();
    let sobra = '';

    for (;;) {
      const { value, done } = await leitor.read();
      if (done) {
        break;
      }

      // O fluxo é NDJSON: uma linha por pedaço, e a última pode vir partida.
      sobra += value;
      const linhas = sobra.split('\n');
      sobra = linhas.pop() ?? '';

      for (const linha of linhas) {
        const texto = this.lerPedaco(linha);
        if (texto !== null) {
          yield texto;
        }
      }
    }

    const ultimo = this.lerPedaco(sobra);
    if (ultimo !== null) {
      yield ultimo;
    }
  }

  /**
   * Uma resposta inteira, em JSON, conforme um esquema.
   *
   * O assistente transmite em fluxo porque o aluno está esperando ler; aqui é
   * o contrário — ninguém lê isto, o código lê. Quem usa são os problemas de
   * palavra: um lote de histórias chega de uma vez, é validado e entra na
   * fila, e o aluno nunca espera por ele.
   *
   * O `format` com esquema é o que faz valer a pena: sem ele, metade das
   * respostas volta embrulhada em markdown e o `JSON.parse` falha. Com ele, o
   * Ollama garante a forma.
   *
   * O `think` segue a mesma regra do fluxo, e por um motivo medido: sem
   * contê-lo, o `gpt-oss:20b` gasta o orçamento inteiro de tokens deliberando
   * e devolve conteúdo vazio com `done_reason: length`. Escrever um enunciado
   * não é tarefa de raciocínio — não há conta a fazer, há texto a escrever.
   * `raciocinio` existe porque alguns modelos recusam `false` e aceitam
   * `'low'`.
   */
  async pedirJson<T>(
    servidor: string,
    modelo: string,
    sistema: string,
    usuario: string,
    esquema: unknown,
    sinal: AbortSignal,
    raciocinio: boolean | string = false,
  ): Promise<T | null> {
    const url = `${semBarra(servidor)}/api/chat`;
    const corpo = {
      model: modelo,
      stream: false,
      format: esquema,
      options: { temperature: 0.8, num_predict: 8192 },
      messages: [
        { role: 'system', content: sistema },
        { role: 'user', content: usuario },
      ],
    };

    const resposta =
      (await this.pedirChat(url, { ...corpo, think: raciocinio }, sinal)) ??
      (await this.pedirChat(url, corpo, sinal, true))!;

    const lido = (await resposta.json()) as { message?: { content?: string } };
    const conteudo = (lido.message?.content ?? '').trim();

    if (conteudo.length === 0) {
      return null;
    }

    try {
      return JSON.parse(conteudo) as T;
    } catch {
      // Modelo que ignorou o esquema. Quem chama tem um caminho de reserva.
      return null;
    }
  }

  /**
   * Pede a conversa. Devolve `null` quando o modelo recusou o campo `think`.
   *
   * `obrigatorio` desliga esse recuo: na segunda tentativa, qualquer erro é
   * erro de verdade e tem de chegar ao aluno.
   */
  private async pedirChat(
    url: string,
    corpo: object,
    sinal: AbortSignal,
    obrigatorio = false,
  ): Promise<Response | null> {
    try {
      return await this.buscar(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
        signal: sinal,
      });
    } catch (erro) {
      const recusouPensamento =
        !obrigatorio && erro instanceof FalhaDoOllama && /think/i.test(erro.message);

      if (recusouPensamento) {
        return null;
      }
      throw erro;
    }
  }

  private lerPedaco(linha: string): string | null {
    if (linha.trim() === '') {
      return null;
    }

    try {
      const pedaco = JSON.parse(linha) as PedacoDaResposta;
      if (pedaco.error !== undefined) {
        throw new FalhaDoOllama(pedaco.error);
      }
      return pedaco.message?.content ?? null;
    } catch (erro) {
      if (erro instanceof FalhaDoOllama) {
        throw erro;
      }
      // Linha partida ou ruído: o próximo pedaço completa.
      return null;
    }
  }

  private async buscar(url: string, opcoes?: RequestInit): Promise<Response> {
    let resposta: Response;

    try {
      resposta = await fetch(url, opcoes);
    } catch (erro) {
      if (erro instanceof DOMException && erro.name === 'AbortError') {
        throw erro;
      }
      throw new FalhaDoOllama(this.i18n.t('assistente.semContato', { url }));
    }

    if (!resposta.ok) {
      // O corpo traz o motivo — inclusive o "does not support thinking", que
      // é o que permite tentar de novo sem o campo.
      const detalhe = await resposta.text().catch(() => '');

      throw new FalhaDoOllama(
        this.i18n.t('assistente.respostaRuim', {
          status: resposta.status,
          detalhe:
            (resposta.status === 404 ? `${this.i18n.t('assistente.modeloInstalado')} ` : '') +
            (detalhe.trim() === ''
              ? this.i18n.t('assistente.vejaTerminal')
              : detalhe.slice(0, 300)),
        }),
      );
    }

    return resposta;
  }
}

/** `http://localhost:11434/` e `http://localhost:11434` são o mesmo servidor. */
function semBarra(servidor: string): string {
  return servidor.trim().replace(/\/+$/, '');
}
