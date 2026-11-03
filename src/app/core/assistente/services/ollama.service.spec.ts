import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FalhaDoOllama, OllamaService } from '@core/assistente/services/ollama.service';

const SERVIDOR = 'http://localhost:11434';

/** Uma resposta HTTP de mentira, com o corpo em NDJSON. */
function resposta(linhas: readonly string[], ok = true, status = 200): Response {
  const corpo = new ReadableStream<Uint8Array>({
    start(controlador) {
      for (const linha of linhas) {
        controlador.enqueue(new TextEncoder().encode(linha));
      }
      controlador.close();
    },
  });

  return {
    ok,
    status,
    body: corpo,
    json: async () => JSON.parse(linhas.join('')),
    // O caminho de erro lê o corpo para saber o motivo.
    text: async () => linhas.join(''),
  } as unknown as Response;
}

/** Junta tudo o que o fluxo devolveu. */
async function juntar(fluxo: AsyncGenerator<string>): Promise<string> {
  let texto = '';
  for await (const pedaco of fluxo) {
    texto += pedaco;
  }
  return texto;
}

describe('OllamaService', () => {
  let ollama: OllamaService;
  let chamadas: { url: string; opcoes?: RequestInit }[];
  const originalFetch = globalThis.fetch;

  /** Troca o `fetch` por um que devolve o que o teste mandar. */
  function responderCom(resolver: () => Promise<Response>): void {
    globalThis.fetch = ((url: string, opcoes?: RequestInit) => {
      chamadas.push({ url, opcoes });
      return resolver();
    }) as typeof fetch;
  }

  beforeEach(() => {
    chamadas = [];
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    ollama = TestBed.inject(OllamaService);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('listar modelos', () => {
    it('devolve os modelos instalados, do maior para o menor', async () => {
      responderCom(async () =>
        resposta([
          JSON.stringify({
            models: [
              { name: 'llama3.2:3b', size: 2_000_000_000 },
              { name: 'qwen2.5:14b', size: 9_000_000_000 },
            ],
          }),
        ]),
      );

      const modelos = await ollama.modelos(SERVIDOR);

      expect(modelos.map((m) => m.nome)).toEqual(['qwen2.5:14b', 'llama3.2:3b']);
    });

    it('a barra no fim do endereço não duplica', () => {
      responderCom(async () => resposta([JSON.stringify({ models: [] })]));

      void ollama.modelos('http://localhost:11434/');

      expect(chamadas[0]!.url).toBe('http://localhost:11434/api/tags');
    });

    it('servidor fora do ar vira um recado que diz o que fazer', async () => {
      responderCom(() => Promise.reject(new TypeError('Failed to fetch')));

      await expect(ollama.modelos(SERVIDOR)).rejects.toThrow(FalhaDoOllama);
      await ollama.modelos(SERVIDOR).catch((erro: Error) => {
        // Servidor desligado e origem não autorizada chegam como o mesmo erro
        // sem detalhe, então a mensagem precisa cobrir os dois casos.
        expect(erro.message).toContain('Ele está rodando?');
        expect(erro.message).toContain('OLLAMA_ORIGINS');
      });
    });
  });

  describe('conversar', () => {
    const sinal = new AbortController().signal;

    it('junta os pedaços do fluxo', async () => {
      responderCom(async () =>
        resposta([
          `${JSON.stringify({ message: { content: 'Dois ' } })}\n`,
          `${JSON.stringify({ message: { content: 'mais ' } })}\n`,
          `${JSON.stringify({ message: { content: 'dois.' }, done: true })}\n`,
        ]),
      );

      const texto = await juntar(
        ollama.conversar(SERVIDOR, 'llama3.2', 'instruções', [{ papel: 'aluno', texto: 'oi' }], sinal),
      );

      expect(texto).toBe('Dois mais dois.');
    });

    it('remonta a linha que chegou partida', async () => {
      // O fluxo é NDJSON e o pedaço pode cortar no meio do JSON.
      const inteira = JSON.stringify({ message: { content: 'resposta' } });
      responderCom(async () =>
        resposta([inteira.slice(0, 10), `${inteira.slice(10)}\n`]),
      );

      expect(await juntar(ollama.conversar(SERVIDOR, 'm', 's', [], sinal))).toBe('resposta');
    });

    it('manda as instruções como sistema e o histórico em seguida', async () => {
      responderCom(async () => resposta([`${JSON.stringify({ message: { content: '' } })}\n`]));

      await juntar(
        ollama.conversar(SERVIDOR, 'llama3.2', 'as instruções', [
          { papel: 'aluno', texto: 'primeira' },
          { papel: 'assistente', texto: 'resposta' },
          { papel: 'aluno', texto: 'segunda' },
        ], sinal),
      );

      const enviado = JSON.parse(String(chamadas[0]!.opcoes!.body));
      expect(enviado.model).toBe('llama3.2');
      expect(enviado.stream).toBe(true);
      expect(enviado.messages[0]).toEqual({ role: 'system', content: 'as instruções' });
      expect(enviado.messages.map((m: { role: string }) => m.role)).toEqual([
        'system',
        'user',
        'assistant',
        'user',
      ]);
    });

    it('pede ao modelo que não pense', async () => {
      // Modelos de raciocínio gastam dezenas de segundos deliberando antes da
      // primeira palavra, e numa máquina de estudo isso é esperar demais.
      responderCom(async () => resposta([`${JSON.stringify({ message: { content: 'ok' } })}\n`]));

      await juntar(ollama.conversar(SERVIDOR, 'm', 's', [], sinal));

      expect(JSON.parse(String(chamadas[0]!.opcoes!.body)).think).toBe(false);
    });

    it('modelo que não pensa recebe a mesma pergunta sem o campo', async () => {
      // Tentar e recuar sai mais barato que manter uma lista de quem suporta
      // o quê.
      let primeira = true;
      responderCom(async () => {
        if (primeira) {
          primeira = false;
          return resposta(['"llama3.2" does not support thinking'], false, 400);
        }
        return resposta([`${JSON.stringify({ message: { content: 'resposta' } })}\n`]);
      });

      const texto = await juntar(ollama.conversar(SERVIDOR, 'llama3.2', 's', [], sinal));

      expect(texto).toBe('resposta');
      expect(chamadas.length).toBe(2);
      expect(JSON.parse(String(chamadas[0]!.opcoes!.body)).think).toBe(false);
      expect(JSON.parse(String(chamadas[1]!.opcoes!.body)).think).toBeUndefined();
    });

    it('erro que não é sobre pensar não repete a pergunta', async () => {
      responderCom(async () => resposta(['out of memory'], false, 500));

      await expect(juntar(ollama.conversar(SERVIDOR, 'm', 's', [], sinal))).rejects.toThrow(
        'out of memory',
      );
      expect(chamadas.length).toBe(1);
    });

    it('erro vindo do próprio Ollama vira falha', async () => {
      responderCom(async () =>
        resposta([`${JSON.stringify({ error: 'model "xyz" not found' })}\n`]),
      );

      await expect(
        juntar(ollama.conversar(SERVIDOR, 'xyz', 's', [], sinal)),
      ).rejects.toThrow('not found');
    });

    it('404 avisa que o modelo pode não estar instalado', async () => {
      responderCom(async () => resposta(['modelo ausente'], false, 404));

      await expect(juntar(ollama.conversar(SERVIDOR, 'xyz', 's', [], sinal))).rejects.toThrow(
        'instalado',
      );
    });

    it('cancelar não vira erro de servidor', async () => {
      // Parar a resposta é uma escolha do aluno, não uma falha.
      const abortado = new DOMException('cancelado', 'AbortError');
      responderCom(() => Promise.reject(abortado));

      await expect(juntar(ollama.conversar(SERVIDOR, 'm', 's', [], sinal))).rejects.toThrow(
        DOMException,
      );
    });
  });
});
