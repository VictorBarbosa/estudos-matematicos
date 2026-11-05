import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConfiguracaoService } from '@core/configuracao/services/configuracao.service';
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

  beforeEach(async () => {
    localStorage.clear();
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

  it('mostra os quatro blocos e os nove ajustes numéricos', () => {
    expect(fixture.nativeElement.querySelectorAll('.bloco').length).toBe(4);
    expect(fixture.nativeElement.querySelectorAll('.ajustes input').length).toBe(9);
    expect(texto()).toContain('Para abrir a próxima etapa');
    expect(texto()).toContain('Prova final da sessão');
    expect(texto()).toContain('O seu plano de estudo');
  });

  it('escrever um número guarda o ajuste', async () => {
    await escrever('Erros tolerados', '4');

    expect(config.prova().errosTolerados).toBe(4);
  });

  it('o resumo em palavras acompanha o que foi ajustado', async () => {
    expect(texto()).toContain('acertar 8 dos últimos 10 exercícios');

    await escrever('Exercícios respondidos', '6');

    expect(texto()).toContain('acertar 6 dos últimos 6 exercícios');
  });

  it('o resumo da prova conta qual erro zera a sessão', async () => {
    expect(texto()).toContain('tolera 2 erros — o 3º zera');

    await escrever('Erros tolerados', '5');

    expect(texto()).toContain('tolera 5 erros — o 6º zera');
  });

  it('o valor fora do limite é preso, e a tela mostra o que valeu', async () => {
    await escrever('Mínimo de questões', '999');

    expect(config.prova().minimoDeQuestoes).toBe(60);
    expect(campo('Mínimo de questões').value).toBe('60');
  });

  it('o que saiu de fábrica fica marcado, com o valor original à vista', async () => {
    expect(fixture.nativeElement.querySelectorAll('.ajustes li.mudado').length).toBe(0);

    await escrever('Erros tolerados', '4');

    expect(fixture.nativeElement.querySelectorAll('.ajustes li.mudado').length).toBe(1);
    expect(texto()).toContain('de fábrica: 2');
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

    await escrever('Erros tolerados', '4');
    expect(botao.disabled).toBe(false);

    botao.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(config.intocada()).toBe(true);
    expect(campo('Erros tolerados').value).toBe('2');
  });
});
