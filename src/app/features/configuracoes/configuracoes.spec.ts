import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConfiguracaoService } from '@core/configuracao/services/configuracao.service';
import { AssistenteService } from '@core/assistente/services/assistente.service';
import { Configuracoes } from '@features/configuracoes/configuracoes';

describe('Configuracoes', () => {
  let fixture: ComponentFixture<Configuracoes>;
  let config: ConfiguracaoService;

  const texto = (): string => fixture.nativeElement.textContent.replace(/\s+/g, ' ');

  /** O campo de um ajuste, pelo rótulo visível. */
  function campo(rotulo: string): HTMLInputElement {
    const item = [...fixture.nativeElement.querySelectorAll('.ajustes li')].find((li) =>
      (li as HTMLElement).textContent?.includes(rotulo),
    ) as HTMLElement;
    return item.querySelector('input') as HTMLInputElement;
  }

  async function escrever(rotulo: string, valor: string): Promise<void> {
    const entrada = campo(rotulo);
    entrada.value = valor;
    entrada.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  /*
   * O servidor de mentira, com os modelos instalados.
   *
   * Sem ele a tela chama o Ollama de verdade: o teste passa numa máquina com o
   * servidor no ar e falha na integração contínua — e, pior, o conteúdo da
   * lista muda com o que está instalado em cada lugar.
   */
  const MODELOS = [
    { name: 'ministral-3:3b', size: 3_200_000_000 },
    { name: 'qwen3.5:0.8b-mlx', size: 800_000_000 },
    { name: 'gpt-oss:20b', size: 14_000_000_000 },
  ];

  let fetchOriginal: typeof globalThis.fetch;

  beforeEach(async () => {
    localStorage.clear();
    fetchOriginal = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ models: MODELOS }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })) as typeof globalThis.fetch;
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Configuracoes],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    config = TestBed.inject(ConfiguracaoService);
    fixture = TestBed.createComponent(Configuracoes);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    globalThis.fetch = fetchOriginal;
  });

  it('mostra os seis blocos, e a LLM entre eles', () => {
    // Eram cinco. O sexto é a LLM local, que deixou de ser constante no código:
    // modelo, endereço, raciocínio e lote agora se ajustam aqui.
    expect(fixture.nativeElement.querySelectorAll('.bloco').length).toBe(6);
    // Dezenove controles: quatorze números da progressão, a caixa da surpresa,
    // os dois campos de texto da LLM, o lote — e dois `<select>`, modelo e
    // raciocínio. O modelo era `<input>` e virou `<select>`.
    expect(
      fixture.nativeElement.querySelectorAll('.ajustes input, .ajustes select').length,
    ).toBe(19);
    // Os numéricos são os quatorze da progressão mais o lote da LLM.
    expect(fixture.nativeElement.querySelectorAll('.ajustes input[type="number"]').length).toBe(15);
    expect(texto()).toContain('Para abrir a próxima etapa');
    expect(texto()).toContain('Prova final da sessão');
    expect(texto()).toContain('Prova surpresa');
    expect(texto()).toContain('O seu plano de estudo');
    expect(texto()).toContain('LLM local');
  });

  it('o modelo da LLM se troca pela tela, e fica gravado', () => {
    const campo = fixture.nativeElement.querySelector('#llm-modelo') as HTMLSelectElement;

    expect(campo.value).toBe('gpt-oss:20b');

    campo.value = 'ministral-3:3b';
    campo.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(config.configuracaoDaLlm().modelo).toBe('ministral-3:3b');
  });

  it('o seletor mostra TODOS os modelos do servidor, não só o escolhido', async () => {
    /*
     * O defeito relatado: a lista mostrava um modelo só. Era um `datalist`, que
     * esconde as opções até o clique na seta — e com a lista vazia (servidor
     * fora do ar) o único nome à vista era o do próprio campo. Este teste fixa
     * o seletor com três modelos instalados.
     */
    await fixture.whenStable();
    const assistente = TestBed.inject(AssistenteService);
    await assistente.carregarModelos();
    fixture.detectChanges();

    const opcoes = [
      ...(fixture.nativeElement.querySelectorAll(
        '#llm-modelo option',
      ) as NodeListOf<HTMLOptionElement>),
    ];
    const nomes = opcoes.map((opcao) => opcao.value);

    expect(nomes).toContain('ministral-3:3b');
    expect(nomes).toContain('qwen3.5:0.8b-mlx');
    expect(nomes).toContain('gpt-oss:20b');
    // E o escolhido aparece marcado, para o seletor não trocar sozinho.
    expect(opcoes.find((opcao) => opcao.value === 'gpt-oss:20b')!.selected).toBe(true);
  });

  it('o botão de reler o servidor continua na tela', () => {
    // Ele sumiu numa edição e nada avisou: sem ele, quem instala um modelo
    // novo precisa recarregar a página inteira para vê-lo na lista.
    const botao = [...(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)].find(
      (candidato) => candidato.textContent?.includes('Reler do servidor'),
    );

    expect(botao, 'o botão de reler os modelos sumiu').toBeDefined();
  });

  it('o lote fica preso entre um e quatro', () => {
    const campo = fixture.nativeElement.querySelector('#llm-lote') as HTMLInputElement;

    campo.value = '99';
    campo.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(config.configuracaoDaLlm().lote).toBe(4);
  });

  it('endereço em branco é a herança do assistente, e isso é o padrão', () => {
    const campo = fixture.nativeElement.querySelector('#llm-endpoint') as HTMLInputElement;

    expect(campo.value).toBe('');

    campo.value = 'http://192.168.1.9:11434';
    campo.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(config.configuracaoDaLlm().endpoint).toBe('http://192.168.1.9:11434');
  });

  it('o raciocínio é um grau, e não um sim ou não', () => {
    const campo = fixture.nativeElement.querySelector('#llm-raciocinio') as HTMLSelectElement;

    expect(campo.value).toBe('false');

    campo.value = 'low';
    campo.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(config.configuracaoDaLlm().raciocinio).toBe('low');
  });

  it('a prova surpresa liga e desliga por caixa de seleção', () => {
    // Os outros ajustes são números; este é o único 0/1, e um campo numérico
    // pedindo «0 ou 1» seria pior que uma caixa.
    const caixa = fixture.nativeElement.querySelector(
      '.ajustes input[type="checkbox"]',
    ) as HTMLInputElement;

    expect(caixa.checked).toBe(true);

    caixa.click();

    expect(config.surpresa().ativa).toBe(0);
    expect(caixa.checked).toBe(false);
  });

  it('escrever um número guarda o ajuste', async () => {
    await escrever('Acerto mínimo (%)', '80');

    expect(config.prova().percentualDeAcerto).toBe(80);
  });

  it('o resumo em palavras acompanha o que foi ajustado', async () => {
    expect(texto()).toContain('acertar 8 dos últimos 10 exercícios');

    await escrever('Exercícios respondidos', '6');

    expect(texto()).toContain('acertar 6 dos últimos 6 exercícios');
  });

  it('o resumo da prova conta a régua de acerto e quantos erros ela tolera', async () => {
    expect(texto()).toContain('exige 75% de acerto — numa prova de 8 questões, 2 erros');

    await escrever('Acerto mínimo (%)', '50');

    expect(texto()).toContain('exige 50% de acerto — numa prova de 8 questões, 4 erros');
  });

  it('o valor fora do limite é preso, e a tela mostra o que valeu', async () => {
    await escrever('Mínimo de questões', '999');

    expect(config.prova().minimoDeQuestoes).toBe(60);
    expect(campo('Mínimo de questões').value).toBe('60');
  });

  it('o que saiu de fábrica fica marcado, com o valor original à vista', async () => {
    expect(fixture.nativeElement.querySelectorAll('.ajustes li.mudado').length).toBe(0);

    await escrever('Acerto mínimo (%)', '80');

    expect(fixture.nativeElement.querySelectorAll('.ajustes li.mudado').length).toBe(1);
    expect(texto()).toContain('de fábrica: 75');
  });

  /** A caixa de um tópico, pelo título visível. */
  function caixaDo(titulo: string): HTMLInputElement {
    const item = [...fixture.nativeElement.querySelectorAll('.topicos .lista li')].find((li) =>
      (li as HTMLElement).textContent?.trim().startsWith(titulo),
    ) as HTMLElement;
    return item.querySelector('input') as HTMLInputElement;
  }

  async function desmarcar(titulo: string): Promise<void> {
    caixaDo(titulo).click();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('lista o currículo inteiro, tudo dentro do plano', () => {
    const caixas = [...fixture.nativeElement.querySelectorAll('.topicos .lista input')];

    expect(caixas.length).toBeGreaterThan(50);
    expect(caixas.every((c) => (c as HTMLInputElement).checked)).toBe(true);
    expect(config.topicosRemovidos().size).toBe(0);
  });

  it('desmarcar tira o tópico do plano', async () => {
    await desmarcar('Frações');

    expect(config.topicosRemovidos().has('fracoes')).toBe(true);
    expect(caixaDo('Frações').checked).toBe(false);
  });

  it('marcar de novo devolve o tópico', async () => {
    await desmarcar('Frações');
    await desmarcar('Frações');

    expect(config.topicosRemovidos().has('fracoes')).toBe(false);
  });

  it('a contagem do plano acompanha', async () => {
    const antes = Number(/(\d+) de (\d+) tópicos/.exec(texto())![1]);

    await desmarcar('Frações');

    expect(Number(/(\d+) de (\d+) tópicos/.exec(texto())![1])).toBe(antes - 1);
  });

  it('dá para tirar e devolver a área inteira de uma vez', async () => {
    const tirar = [...fixture.nativeElement.querySelectorAll('.topicos .area .texto')].find((b) =>
      (b as HTMLElement).textContent?.includes('Tirar'),
    ) as HTMLButtonElement;

    tirar.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(config.topicosRemovidos().has('fracoes')).toBe(true);
    expect(config.topicosRemovidos().has('operacoes-fundamentais')).toBe(true);

    const devolver = [...fixture.nativeElement.querySelectorAll('.topicos .area .texto')].find(
      (b) => (b as HTMLElement).textContent?.includes('Devolver a área'),
    ) as HTMLButtonElement;
    devolver.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(config.topicosRemovidos().size).toBe(0);
  });

  it('«Devolver todos» só aparece quando há algo fora', async () => {
    const devolverTodos = () =>
      [...fixture.nativeElement.querySelectorAll('.topicos .texto')].find((b) =>
        (b as HTMLElement).textContent?.includes('Devolver todos'),
      );

    expect(devolverTodos()).toBeUndefined();

    await desmarcar('Frações');
    expect(devolverTodos()).toBeDefined();

    (devolverTodos() as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(config.topicosRemovidos().size).toBe(0);
  });

  it('redefinir volta tudo, e o botão só serve quando há o que desfazer', async () => {
    const botao = [...fixture.nativeElement.querySelectorAll('button')].find((b) =>
      (b as HTMLButtonElement).textContent?.includes('fábrica'),
    ) as HTMLButtonElement;

    expect(botao.disabled).toBe(true);

    await escrever('Acerto mínimo (%)', '80');
    expect(botao.disabled).toBe(false);

    botao.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(config.intocada()).toBe(true);
    expect(campo('Acerto mínimo (%)').value).toBe('75');
  });
});
