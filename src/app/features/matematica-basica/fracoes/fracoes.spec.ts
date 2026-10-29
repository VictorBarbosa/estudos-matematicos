import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeoriaService } from '@core/teoria/teoria.service';
import { Fracoes } from './fracoes';

describe('Fracoes', () => {
  let fixture: ComponentFixture<Fracoes>;

  function texto(): string {
    return fixture.nativeElement.textContent as string;
  }

  function botaoComTexto(rotulo: string): HTMLButtonElement | undefined {
    return [...fixture.nativeElement.querySelectorAll('button')].find((botao: HTMLButtonElement) =>
      botao.textContent?.trim().startsWith(rotulo),
    );
  }

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Fracoes],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Fracoes);
    await fixture.whenStable();
  });

  it('monta a tela com as duas abas do tópico', () => {
    const abas = [...fixture.nativeElement.querySelectorAll('[role="tab"]')].map(
      (aba: HTMLElement) => aba.textContent?.trim(),
    );

    expect(abas).toEqual(['Explorar', 'Treinar']);
    expect(texto()).toContain('Frações');
  });

  it('resolve a operação inicial passo a passo', () => {
    // 1/4 + 1/6 exige denominador comum, então o passo do MMC precisa aparecer.
    expect(texto()).toContain('menor denominador comum');
    expect(texto()).toContain('Reescrevemos as duas frações com denominador 12');
  });

  it('avisa que os denominadores são diferentes antes de somar', () => {
    expect(texto()).toContain('não têm o mesmo tamanho');
  });

  it('desenha as barras das duas frações e do resultado', () => {
    const barras = fixture.nativeElement.querySelectorAll('app-barra-fracao');
    expect(barras.length).toBe(3);
  });

  it('desenha a reta numérica', () => {
    const plot = fixture.nativeElement.querySelector('app-math-plot svg');
    expect(plot).not.toBeNull();
    expect(plot.getAttribute('aria-label')).toContain('Reta numérica');
  });

  it('registra a teoria do tópico, que aparece nos botões', () => {
    expect(botaoComTexto('O que é uma fração')).toBeDefined();
    expect(botaoComTexto('Denominador comum e MMC')).toBeDefined();
    expect(botaoComTexto('As quatro operações')).toBeDefined();
  });

  it('pede a abertura do conceito certo ao clicar no botão de teoria', async () => {
    // O modal em si vive no shell; daqui o que se observa é o pedido ao serviço.
    const teoria = TestBed.inject(TeoriaService);
    expect(teoria.estaAberta()).toBe(false);

    botaoComTexto('Denominador comum e MMC')!.click();
    await fixture.whenStable();

    expect(teoria.aberta()?.id).toBe('fracoes.mmc');
  });

  it('registra os quatro conceitos com demonstração e exemplo', () => {
    const teoria = TestBed.inject(TeoriaService);

    for (const id of [
      'fracoes.definicao',
      'fracoes.simplificacao',
      'fracoes.mmc',
      'fracoes.operacoes',
    ]) {
      const conceito = teoria.obter(id);
      expect(conceito, id).toBeDefined();
      expect(conceito!.demonstracao.length).toBeGreaterThan(0);
      expect(conceito!.exemplo?.passos.length).toBeGreaterThan(0);
    }
  });

  it('troca a operação ao clicar no símbolo', async () => {
    const multiplicar = fixture.nativeElement.querySelector(
      'button[aria-label="Multiplicar"]',
    ) as HTMLButtonElement;

    multiplicar.click();
    await fixture.whenStable();

    expect(multiplicar.getAttribute('aria-pressed')).toBe('true');
    expect(texto()).toContain('multiplicamos em linha');
    // Na multiplicação não há denominador comum a calcular.
    expect(texto()).not.toContain('menor denominador comum');
  });

  it('mostra a área de treino ao trocar de aba', async () => {
    const abaTreinar = [...fixture.nativeElement.querySelectorAll('[role="tab"]')].find(
      (aba: HTMLElement) => aba.textContent?.trim() === 'Treinar',
    ) as HTMLButtonElement;

    abaTreinar.click();
    await fixture.whenStable();

    expect(abaTreinar.getAttribute('aria-selected')).toBe('true');
    expect(fixture.nativeElement.querySelector('app-area-treino')).not.toBeNull();
  });
});
