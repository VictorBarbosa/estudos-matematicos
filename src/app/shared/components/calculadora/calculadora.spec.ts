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

    it('o modo científico acrescenta a ala de funções', async () => {
      servico.definirModo('cientifica');
      await fixture.whenStable();

      expect(tecla('sin')).toBeDefined();
      expect(tecla('√')).toBeDefined();
      expect(tecla('π')).toBeDefined();
    });

    it('calcula um seno em graus', async () => {
      servico.definirModo('cientifica');
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
