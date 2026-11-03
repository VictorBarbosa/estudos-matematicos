import { Injectable } from '@angular/core';
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
  /** Os modelos instalados, do maior para o menor. */
  async modelos(servidor: string): Promise<readonly ModeloOllama[]> {
    const resposta = await this.buscar(`${semBarra(servidor)}/api/tags`);
    const dados = (await resposta.json()) as RespostaDeModelos;

    return (dados.models ?? [])
      .filter((modelo): modelo is { name: string; size?: number } => typeof modelo.name === 'string')
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
      throw new FalhaDoOllama('O servidor respondeu sem conteúdo.');
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
      throw new FalhaDoOllama(
        `Não consegui falar com o Ollama em ${url}. Ele está rodando? ` +
          'E, se este site está aberto pela internet, o Ollama precisa autorizar a origem: ' +
          'inicie com OLLAMA_ORIGINS="*" ollama serve.',
      );
    }

    if (!resposta.ok) {
      // O corpo traz o motivo — inclusive o "does not support thinking", que
      // é o que permite tentar de novo sem o campo.
      const detalhe = await resposta.text().catch(() => '');

      throw new FalhaDoOllama(
        `O Ollama respondeu ${resposta.status}. ` +
          (resposta.status === 404 ? 'Esse modelo está instalado? ' : '') +
          (detalhe.trim() === '' ? 'Veja o terminal dele.' : detalhe.slice(0, 300)),
      );
    }

    return resposta;
  }
}

/** `http://localhost:11434/` e `http://localhost:11434` são o mesmo servidor. */
function semBarra(servidor: string): string {
  return servidor.trim().replace(/\/+$/, '');
}
