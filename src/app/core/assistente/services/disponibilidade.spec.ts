import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ModeloOllama } from '@core/assistente/models/assistente.model';
import { AssistenteService } from '@core/assistente/services/assistente.service';
import { FalhaDoOllama, OllamaService } from '@core/assistente/services/ollama.service';

/**
 * O assistente só pode ser oferecido se o Ollama responder.
 *
 * Ele roda na máquina do aluno, e num iPad ou num celular quase nunca há um.
 * Um botão que abre uma janela com uma mensagem de erro é pior que nenhum
 * botão — daí a sondagem ao iniciar, e estes testes em volta dela.
 */
class OllamaFalso {
  instalados: readonly ModeloOllama[] = [{ nome: 'llama3.2:3b', bytes: 2_000_000_000 }];
  falha: string | null = null;
  /** Endereços que a sondagem perguntou, na ordem. */
  perguntados: string[] = [];

  async modelos(servidor: string): Promise<readonly ModeloOllama[]> {
    this.perguntados.push(servidor);

    if (this.falha !== null) {
      throw new FalhaDoOllama(this.falha);
    }

    return this.instalados;
  }
}

function montar(ollama: OllamaFalso, url = 'http://localhost:4200/'): AssistenteService {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection(), { provide: OllamaService, useValue: ollama }],
  });

  // O serviço lê o endereço do `location` do documento, então é ele que muda.
  history.replaceState(null, '', new URL(url).pathname + new URL(url).search);
  return TestBed.inject(AssistenteService);
}

describe('disponibilidade do assistente', () => {
  let ollama: OllamaFalso;

  beforeEach(() => {
    localStorage.clear();
    ollama = new OllamaFalso();
  });

  afterEach(() => {
    history.replaceState(null, '', '/');
  });

  it('o servidor que responde deixa o assistente disponível', async () => {
    const assistente = montar(ollama);
    await assistente.sondar();

    expect(assistente.disponivel()).toBe(true);
    expect(assistente.modelos().length).toBe(1);
  });

  it('sem servidor, o assistente não se oferece', async () => {
    ollama.falha = 'Não consegui falar com o Ollama.';
    const assistente = montar(ollama);
    await assistente.sondar();

    expect(assistente.disponivel()).toBe(false);
    expect(assistente.modelos()).toEqual([]);
  });

  it('não se oferece antes de a sondagem voltar', () => {
    // Melhor o botão aparecer um instante depois do que aparecer e não servir.
    const assistente = montar(ollama);
    expect(assistente.disponivel()).toBe(false);
  });

  it('a sondagem escolhe o maior modelo quando não há escolha guardada', async () => {
    ollama.instalados = [
      { nome: 'qwen2.5:14b', bytes: 9_000_000_000 },
      { nome: 'llama3.2:3b', bytes: 2_000_000_000 },
    ];
    const assistente = montar(ollama);
    await assistente.sondar();

    expect(assistente.modelo()).toBe('qwen2.5:14b');
  });

  it('trocar o endereço sonda de novo, no endereço novo', async () => {
    const assistente = montar(ollama);
    await assistente.sondar();

    assistente.definirServidor('http://192.168.0.10:11434');
    await assistente.sondar();

    expect(ollama.perguntados.at(-1)).toBe('http://192.168.0.10:11434');
  });

  it('o endereço pode vir da URL, para apontar outra máquina', async () => {
    const assistente = montar(ollama, 'http://localhost:4200/?ollama=http://192.168.0.7:11434');

    expect(assistente.servidor()).toBe('http://192.168.0.7:11434');
    await assistente.sondar();
    expect(ollama.perguntados).toContain('http://192.168.0.7:11434');
  });

  it('o endereço da URL aceita a forma curta, sem esquema', async () => {
    const assistente = montar(ollama, 'http://localhost:4200/?ollama=192.168.0.7:11434');
    expect(assistente.servidor()).toBe('http://192.168.0.7:11434');
  });

  it('parâmetro vazio na URL não apaga o endereço guardado', () => {
    const assistente = montar(ollama, 'http://localhost:4200/?ollama=');
    expect(assistente.servidor()).toBe('http://localhost:11434');
  });

  it('o endereço vindo da URL fica guardado para a próxima visita', async () => {
    montar(ollama, 'http://localhost:4200/?ollama=192.168.0.7:11434');
    TestBed.tick();

    const outra = montar(ollama, 'http://localhost:4200/');
    expect(outra.servidor()).toBe('http://192.168.0.7:11434');
  });

  it('o servidor que volta a responder devolve o assistente', async () => {
    ollama.falha = 'fora do ar';
    const assistente = montar(ollama);
    await assistente.sondar();
    expect(assistente.disponivel()).toBe(false);

    ollama.falha = null;
    await assistente.sondar();
    expect(assistente.disponivel()).toBe(true);
  });
});
