import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { CalculadoraPage } from './calculadora.page';
import { ModoService } from './modo.service';

/**
 * A mecânica da conta já é testada no modelo copiado do site, com 81 casos.
 * O que falta provar aqui é a moldura: que a página mostra o modo escolhido
 * no menu, que as teclas chegam ao modelo e que cada painel aparece no seu
 * modo.
 */
describe('CalculadoraPage', () => {
  let fixture: ComponentFixture<CalculadoraPage>;
  let modos: ModoService;

  const texto = (): string => fixture.nativeElement.textContent.replace(/\s+/g, ' ');
  const visor = (): string =>
    (fixture.nativeElement.querySelector('.valor') as HTMLElement).textContent!.trim();
  const legenda = (): string =>
    (fixture.nativeElement.querySelector('.legenda') as HTMLElement).textContent!.trim();

  async function apertar(...rotulos: readonly string[]): Promise<void> {
    for (const rotulo of rotulos) {
      const botao = [...fixture.nativeElement.querySelectorAll('.teclas button')].find(
        (b) => (b as HTMLButtonElement).textContent?.trim() === rotulo,
      ) as HTMLButtonElement;
      botao.click();
      await fixture.whenStable();
    }
    fixture.detectChanges();
  }

  async function escrever(indice: number, valor: string): Promise<void> {
    const campo = [...fixture.nativeElement.querySelectorAll('.campo input')][
      indice
    ] as HTMLInputElement;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  /** Monta a página do zero, mantendo (ou não) o que ficou guardado. */
  async function montar(limpar = true): Promise<void> {
    if (limpar) {
      localStorage.clear();
    }
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [CalculadoraPage] }).compileComponents();
    modos = TestBed.inject(ModoService);
    fixture = TestBed.createComponent(CalculadoraPage);
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(montar);

  it('abre na básica, com as dezenove teclas', () => {
    expect(fixture.nativeElement.querySelectorAll('.basicas button').length).toBe(19);
    expect(fixture.nativeElement.querySelector('.cientificas')).toBeNull();
    expect(visor()).toBe('0');
  });

  it('a conta respeita a ordem das operações', async () => {
    await apertar('2', '+', '3', '×', '4', '=');

    expect(visor()).toBe('14');
    expect(legenda()).toBe('2+3×4 =');
  });

  it('AC vira C depois do primeiro dígito', async () => {
    expect(texto()).toContain('AC');

    await apertar('7');

    expect(texto()).not.toContain('AC');
    expect(texto()).toContain('C');
  });

  it('a científica acrescenta a ala de funções', async () => {
    modos.definir('cientifica');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.cientificas button').length).toBe(15);
    expect(fixture.nativeElement.querySelectorAll('.basicas button').length).toBe(19);
  });

  it('a tecla de ângulo alterna entre RAD e DEG', async () => {
    modos.definir('cientifica');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(texto()).toContain('RAD');
    await apertar('RAD');
    expect(texto()).toContain('DEG');
  });

  it('o modo de inteiros mostra o MMC e a divisão simultânea', async () => {
    modos.definir('mmc-mdc');
    await fixture.whenStable();
    fixture.detectChanges();

    await escrever(0, '12, 18, 24');

    expect(visor()).toBe('72');
    expect(legenda()).toBe('MMC de 12, 18, 24');
    expect(fixture.nativeElement.querySelectorAll('.decomposicao tr').length).toBeGreaterThan(3);
  });

  it('o modo de fatorar acha o par e mostra as raízes', async () => {
    modos.definir('soma-produto');
    await fixture.whenStable();
    fixture.detectChanges();

    await escrever(0, '-8');
    await escrever(1, '2');

    expect(visor()).toBe('-2 e 4');
    expect(texto()).toContain('x² + 2x − 8 = (x − 2)(x + 4)');
    expect(texto()).toContain('Raízes: x = -4 ou x = 2');
  });

  it('os recados de erro saem em português', async () => {
    modos.definir('mmc-mdc');
    await fixture.whenStable();
    fixture.detectChanges();

    await escrever(0, '12, abc');

    expect(legenda()).toBe('"abc" não é um número inteiro.');
  });

  it('o ângulo escolhido sobrevive a reabrir o aplicativo', async () => {
    modos.definir('cientifica');
    await fixture.whenStable();
    fixture.detectChanges();
    await apertar('RAD');
    expect(texto()).toContain('DEG');

    // Reabrir o aplicativo é remontar SEM limpar o armazenamento.
    await montar(false);
    modos.definir('cientifica');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(texto()).toContain('DEG');
  });
});
