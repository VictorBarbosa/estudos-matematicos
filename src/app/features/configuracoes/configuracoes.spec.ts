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

  it('mostra os três blocos e os nove ajustes', () => {
    expect(fixture.nativeElement.querySelectorAll('.bloco').length).toBe(3);
    expect(fixture.nativeElement.querySelectorAll('.ajustes input').length).toBe(9);
    expect(texto()).toContain('Para abrir a próxima etapa');
    expect(texto()).toContain('Prova final da sessão');
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
