import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalculadoraService } from '@core/calculadora/services/calculadora.service';
import { Calculadora } from '@shared/components/calculadora/calculadora';

describe('Calculadora', () => {
  let fixture: ComponentFixture<Calculadora>;
  let servico: CalculadoraService;

  function tecla(rotulo: string): HTMLButtonElement | undefined {
    return [...fixture.nativeElement.querySelectorAll('.teclas button')].find(
      (botao) => (botao as HTMLButtonElement).textContent?.trim() === rotulo,
    ) as HTMLButtonElement | undefined;
  }

  /** Aperta uma sequência de teclas e espera a tela se atualizar. */
  async function apertar(...rotulos: readonly string[]): Promise<void> {
    for (const rotulo of rotulos) {
      tecla(rotulo)!.click();
      await fixture.whenStable();
    }
  }

  /** Uma das abas de modo, na barra do topo. */
  function aba(rotulo: string): HTMLButtonElement {
    return [...fixture.nativeElement.querySelectorAll('.modos button')].find(
      (botao) => (botao as HTMLButtonElement).textContent?.trim() === rotulo,
    ) as HTMLButtonElement;
  }

  function visor(): string {
    return (fixture.nativeElement.querySelector('.valor') as HTMLElement).textContent!.trim();
  }

  function legenda(): string {
    return (fixture.nativeElement.querySelector('.legenda') as HTMLElement).textContent!.trim();
  }

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Calculadora],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    servico = TestBed.inject(CalculadoraService);
    fixture = TestBed.createComponent(Calculadora);
    await fixture.whenStable();
  });

  it('fica escondida enquanto ninguém a abre', () => {
    expect(fixture.nativeElement.querySelector('.janela')).toBeNull();
  });

  describe('aberta', () => {
    beforeEach(async () => {
      servico.alternar();
      await fixture.whenStable();
    });

    it('aparece zerada', () => {
      expect(fixture.nativeElement.querySelector('.janela')).not.toBeNull();
      expect(visor()).toBe('0');
    });

    it('faz uma conta respeitando a ordem das operações', async () => {
      await apertar('2', '+', '3', '×', '4', '=');

      expect(visor()).toBe('14');
      expect(legenda()).toBe('2+3×4 =');
    });

    it('a tecla de limpar vira C depois do primeiro toque', async () => {
      expect(tecla('AC')).toBeDefined();

      await apertar('7');

      expect(tecla('AC')).toBeUndefined();
      expect(tecla('C')).toBeDefined();
    });

    it('limpar devolve a tela ao zero', async () => {
      await apertar('7', '+', '1', 'C');

      expect(visor()).toBe('0');
    });

    it('o teclado físico também digita', async () => {
      const janela = fixture.nativeElement.querySelector('.janela') as HTMLElement;

      for (const key of ['9', '*', '6']) {
        janela.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      }
      janela.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await fixture.whenStable();

      expect(visor()).toBe('54');
    });

    it('no modo básico não há teclas científicas', () => {
      expect(tecla('sin')).toBeUndefined();
      expect(tecla('π')).toBeUndefined();
    });

    it('a aba Científica acrescenta a ala de funções', async () => {
      // Clicando na aba, e não chamando o serviço: era o clique que estava
      // quebrado — a barra capturava o ponteiro e engolia o evento.
      aba('Científica').click();
      await fixture.whenStable();

      expect(servico.modo()).toBe('cientifica');
      expect(tecla('sin')).toBeDefined();
      expect(tecla('√')).toBeDefined();
      expect(tecla('π')).toBeDefined();
    });

    it('apertar um botão da barra não arrasta a janela', async () => {
      /*
       * Capturar o ponteiro na barra faz o `pointerup` ser entregue a ela, e o
       * clique passa a ser disparado no ancestral comum em vez do botão. Era
       * por isso que a aba Científica e o X não respondiam.
       */
      const barra = fixture.nativeElement.querySelector('.barra') as HTMLElement;
      const alvo = aba('Científica');

      alvo.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 50, clientY: 20 }));
      barra.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 300, clientY: 300 }));
      await fixture.whenStable();

      const janela = fixture.nativeElement.querySelector('.janela') as HTMLElement;
      expect(janela.getAttribute('style')).toBeNull();
      expect(janela.classList.contains('sem-posicao')).toBe(true);
    });

    it('calcula um seno em graus', async () => {
      aba('Científica').click();
      await fixture.whenStable();

      // A tecla de ângulo mostra a unidade em uso e alterna entre as duas.
      expect(tecla('RAD')).toBeDefined();
      await apertar('RAD');
      expect(tecla('DEG')).toBeDefined();

      await apertar('sin', '3', '0', '=');

      expect(visor()).toBe('0,5');
    });

    it('fechar some com a janela', async () => {
      const fechar = fixture.nativeElement.querySelector('.fechar') as HTMLButtonElement;
      fechar.click();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.janela')).toBeNull();
      expect(servico.aberta()).toBe(false);
    });

    it('a conta que não fecha vira aviso, não resultado', async () => {
      await apertar('2', '+', '=');

      expect(legenda()).toContain('calcular');
      expect(visor()).toBe('2+');
    });
  });
});

/**
 * As teclas que não podem acontecer, vistas da tela.
 *
 * `5-----333---` e `5××××2` eram aceitos e só reclamavam no igual, com a conta
 * inteira já perdida.
 */
describe('Calculadora: teclas repetidas', () => {
  let fixture: ComponentFixture<Calculadora>;

  function tecla(rotulo: string): HTMLButtonElement | undefined {
    return [...fixture.nativeElement.querySelectorAll('.teclas button')].find(
      (botao) => (botao as HTMLButtonElement).textContent?.trim() === rotulo,
    ) as HTMLButtonElement | undefined;
  }

  async function apertar(...rotulos: readonly string[]): Promise<void> {
    for (const rotulo of rotulos) {
      tecla(rotulo)!.click();
      await fixture.whenStable();
    }
  }

  function visor(): string {
    return (fixture.nativeElement.querySelector('.valor') as HTMLElement).textContent!.trim();
  }

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Calculadora],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    TestBed.inject(CalculadoraService).alternar();
    fixture = TestBed.createComponent(Calculadora);
    await fixture.whenStable();
  });

  it('cinco menos seguidos viram um', async () => {
    await apertar('5', '−', '−', '−', '−', '−', '3', '3', '3');

    expect(visor()).toBe('5-333');
  });

  it('quatro vezes seguidos viram um', async () => {
    await apertar('5', '×', '×', '×', '×', '2', '=');

    expect(visor()).toBe('10');
  });

  it('vírgula repetida não entra', async () => {
    await apertar('1', ',', '5', ',', ',');

    expect(visor()).toBe('1,5');
  });
});

/** A aba de MMC e MDC, vista da tela. */
describe('Calculadora: MMC e MDC', () => {
  let fixture: ComponentFixture<Calculadora>;
  let servico: CalculadoraService;

  function campo(): HTMLInputElement {
    return fixture.nativeElement.querySelector('.campo input') as HTMLInputElement;
  }

  async function escrever(texto: string): Promise<void> {
    campo().value = texto;
    campo().dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  function visor(): string {
    return (fixture.nativeElement.querySelector('.valor') as HTMLElement).textContent!.trim();
  }

  function legenda(): string {
    return (fixture.nativeElement.querySelector('.legenda') as HTMLElement).textContent!.trim();
  }

  function escolha(rotulo: string): HTMLButtonElement {
    return [...fixture.nativeElement.querySelectorAll('.escolha button')].find(
      (botao) => (botao as HTMLButtonElement).textContent?.trim() === rotulo,
    ) as HTMLButtonElement;
  }

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Calculadora],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    servico = TestBed.inject(CalculadoraService);
    servico.alternar();
    fixture = TestBed.createComponent(Calculadora);
    await fixture.whenStable();

    [...fixture.nativeElement.querySelectorAll('.modos button')]
      .find((b) => (b as HTMLButtonElement).textContent?.includes('MMC'))!
      .click();
    await fixture.whenStable();
  });

  it('a aba troca o teclado pelo campo de números', () => {
    expect(servico.modo()).toBe('mmc-mdc');
    expect(campo()).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.teclado')).toBeNull();
  });

  it('mostra o MMC dos números escritos', async () => {
    await escrever('12, 18, 24');

    expect(visor()).toBe('72');
    expect(legenda()).toBe('MMC de 12, 18, 24');
  });

  it('trocar para MDC recalcula o mesmo que está escrito', async () => {
    await escrever('12, 18, 24');
    escolha('MDC').click();
    await fixture.whenStable();

    expect(visor()).toBe('6');
    expect(legenda()).toContain('MDC');
  });

  it('mostra a fatoração de cada número', async () => {
    await escrever('12, 18');

    const linhas = [...fixture.nativeElement.querySelectorAll('.fatoracoes li')].map(
      (item) => (item as HTMLElement).textContent!.trim(),
    );
    expect(linhas).toEqual(['12 = 2² · 3', '18 = 2 · 3²']);
  });

  it('entrada inválida vira recado, não resultado', async () => {
    await escrever('12, abc');

    expect(visor()).toBe('—');
    expect(legenda()).toContain('abc');
  });

  it('digitar no campo não aciona as teclas da calculadora', async () => {
    // O teclado físico da janela escuta o keydown; dentro do campo quem manda
    // é o campo, senão digitar 12 acionaria as teclas 1 e 2.
    await escrever('12');
    campo().dispatchEvent(new KeyboardEvent('keydown', { key: '8', bubbles: true }));
    await fixture.whenStable();

    expect(campo().value).toBe('12');
    expect(legenda()).toContain('pelo menos dois');
  });

  it('o modo escolhido volta na sessão seguinte', () => {
    expect(JSON.parse(localStorage.getItem('estudos-matematicos.calculadora.v1')!).modo).toBe(
      'mmc-mdc',
    );
  });
});
