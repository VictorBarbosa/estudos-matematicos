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
  const visor = (): string => (fixture.nativeElement.querySelector('.valor') as HTMLElement).textContent!.trim();
  const legenda = (): string => (fixture.nativeElement.querySelector('.legenda') as HTMLElement).textContent!.trim();

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
    const campo = [...fixture.nativeElement.querySelectorAll('.campo input')][indice] as HTMLInputElement;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  /** O que está escrito no campo de um rótulo. */
  function valorDoCampo(rotulo: string): string {
    const dono = [...fixture.nativeElement.querySelectorAll('.campo')].find((c) =>
      (c as HTMLElement).textContent!.includes(rotulo),
    ) as HTMLElement;
    return (dono.querySelector('input') as HTMLInputElement).value;
  }

  /** O campo pelo rótulo, que não depende da ordem em que a tela os põe. */
  async function escreverNoCampo(rotulo: string, valor: string): Promise<void> {
    const dono = [...fixture.nativeElement.querySelectorAll('.campo')].find((c) =>
      (c as HTMLElement).textContent!.includes(rotulo),
    ) as HTMLElement;
    const campo = dono.querySelector('input') as HTMLInputElement;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  /** O par de fatores, dito como se diz: produto e soma. */
  async function escreverFatores(produto: string, soma: string): Promise<void> {
    await escreverNoCampo('Soma', soma);
    await escreverNoCampo('Produto', produto);
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

  it('abre na básica, com as vinte teclas', () => {
    // Dezenove da calculadora da Apple, mais o apagar que ela não tem.
    expect(fixture.nativeElement.querySelectorAll('.basicas button').length).toBe(20);
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
    expect(fixture.nativeElement.querySelectorAll('.basicas button').length).toBe(20);
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

  it('pede a soma antes do produto, na ordem em que a expressão se lê', async () => {
    // Em `x² - 25x + 136` o 25 vem primeiro e é a SOMA.
    modos.definir('soma-produto');
    await fixture.whenStable();
    fixture.detectChanges();

    const rotulos = [...fixture.nativeElement.querySelectorAll('.campo .rotulo')].map((e) =>
      (e as HTMLElement).textContent!.trim(),
    );

    expect(rotulos).toEqual(['Soma', 'Produto']);
  });

  it('o modo de fatorar acha o par e mostra as raízes', async () => {
    modos.definir('soma-produto');
    await fixture.whenStable();
    fixture.detectChanges();

    await escreverFatores('-8', '2');

    expect(visor()).toBe('-2 e 4');
    expect(texto()).toContain('x² + 2x − 8 = (x − 2)(x + 4)');
    expect(texto()).toContain('Raízes: x = -4 ou x = 2');
  });

  it('avisa quando produto e soma estão trocados', async () => {
    // x² - 25x + 136: na expressão o 25 vem primeiro, mas é a soma. Sem este
    // aviso a tela mostrava só dois decimais longos e parecia estar errada.
    modos.definir('soma-produto');
    await fixture.whenStable();
    fixture.detectChanges();

    await escreverFatores('25', '136');

    expect(texto()).toContain('Com os campos trocados há par inteiro: 8 e 17');
    expect(texto()).toContain('soma 25 e produto 136');
  });

  it('e não avisa nada quando a ordem está certa', async () => {
    modos.definir('soma-produto');
    await fixture.whenStable();
    fixture.detectChanges();

    await escreverFatores('136', '25');

    expect(visor()).toBe('8 e 17');
    expect(texto()).not.toContain('campos trocados');
  });

  /** A tecla ao lado de um campo, pelo rótulo acessível. */
  function teclaDoCampo(rotulo: string): HTMLButtonElement {
    return [...fixture.nativeElement.querySelectorAll('.tecla-do-campo')].find(
      (b) => (b as HTMLButtonElement).getAttribute('aria-label') === rotulo,
    ) as HTMLButtonElement;
  }

  async function tocar(rotulo: string): Promise<void> {
    teclaDoCampo(rotulo).click();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('a vírgula do MMC vem de uma tecla, que o teclado do iPhone não tem', async () => {
    modos.definir('mmc-mdc');
    await fixture.whenStable();
    fixture.detectChanges();

    // Sem a tecla não há como separar: o `inputmode` numérico só dá dígitos.
    await escrever(0, '80');
    await tocar('separar números');
    const campo = fixture.nativeElement.querySelector('.campo input') as HTMLInputElement;
    expect(campo.value).toBe('80, ');

    await escrever(0, '80, 90');
    expect(visor()).toBe('720');
    expect(legenda()).toBe('MMC de 80, 90');
  });

  it('a vírgula não se repete nem abre a lista', async () => {
    modos.definir('mmc-mdc');
    await fixture.whenStable();
    fixture.detectChanges();

    // Campo vazio: nada a separar.
    await tocar('separar números');
    expect((fixture.nativeElement.querySelector('.campo input') as HTMLInputElement).value).toBe('');

    await escrever(0, '12');
    await tocar('separar números');
    await tocar('separar números');
    expect((fixture.nativeElement.querySelector('.campo input') as HTMLInputElement).value).toBe('12, ');
  });

  it('o sinal de menos do Fatorar vem de uma tecla por campo', async () => {
    modos.definir('soma-produto');
    await fixture.whenStable();
    fixture.detectChanges();

    await escreverFatores('8', '2');
    await tocar('trocar o sinal do produto');

    expect(valorDoCampo('Produto')).toBe('-8');
    expect(visor()).toBe('-2 e 4');
  });

  it('a tecla de sinal também desfaz', async () => {
    modos.definir('soma-produto');
    await fixture.whenStable();
    fixture.detectChanges();

    await escreverNoCampo('Soma', '11');
    await tocar('trocar o sinal da soma');
    await tocar('trocar o sinal da soma');

    expect(valorDoCampo('Soma')).toBe('11');
  });

  it('a tecla devolve o cursor ao campo, para o teclado não fechar', async () => {
    /*
     * No iPhone, quem tira o foco do campo faz o teclado recolher. O
     * `preventDefault` no `pointerdown` do botão é o que impede o desfoque —
     * verificado no navegador, com toque de verdade, contando zero eventos
     * de `blur`. Aqui fica a rede de segurança: depois da tecla, o campo tem
     * o foco e o cursor no fim.
     */
    modos.definir('mmc-mdc');
    await fixture.whenStable();
    fixture.detectChanges();

    await escrever(0, '80');
    await tocar('separar números');
    await new Promise<void>((pronto) => queueMicrotask(() => pronto()));

    const campo = fixture.nativeElement.querySelector('.campo input') as HTMLInputElement;
    expect(document.activeElement).toBe(campo);
    expect(campo.selectionStart).toBe(campo.value.length);
  });

  it('a tecla não entra na ordem de tabulação', () => {
    // Ela é auxiliar do campo ao lado; parar nela ao tabular só atrapalha.
    for (const tecla of fixture.nativeElement.querySelectorAll('.tecla-do-campo')) {
      expect((tecla as HTMLElement).getAttribute('tabindex')).toBe('-1');
    }
  });

  it('o apagar tira um dígito de cada vez', async () => {
    await apertar('1', '2', '3');
    expect(visor()).toBe('123');

    await apertar('⌫');
    expect(visor()).toBe('12');

    await apertar('⌫', '⌫');
    expect(visor()).toBe('0');
  });

  it('o apagar não quebra com o visor vazio', async () => {
    await apertar('⌫', '⌫');
    expect(visor()).toBe('0');
  });

  it('o decimal em fração converte o que termina e a dízima', async () => {
    modos.definir('decimal-fracao');
    await fixture.whenStable();
    fixture.detectChanges();

    await escrever(0, '0,375');
    expect(visor()).toBe('3/8');
    expect(legenda()).toBe('0,375 =');

    await escrever(0, '0,1(6)');
    expect(visor()).toBe('1/6');
    expect(texto()).toContain('90x = 15');
  });

  it('as teclas do decimal escrevem o que o teclado numérico não tem', async () => {
    modos.definir('decimal-fracao');
    await fixture.whenStable();
    fixture.detectChanges();

    await escrever(0, '0');
    await tocar('vírgula');
    await tocar('abrir o período');
    await escrever(0, '0,(3');
    await tocar('fechar o período');

    const campo = fixture.nativeElement.querySelector('.campo input') as HTMLInputElement;
    expect(campo.value).toBe('0,(3)');
    expect(visor()).toBe('1/3');
  });

  it('o sinal do decimal também tem tecla', async () => {
    modos.definir('decimal-fracao');
    await fixture.whenStable();
    fixture.detectChanges();

    await escrever(0, '0,375');
    await tocar('trocar o sinal');

    expect(visor()).toBe('-3/8');
  });

  it('o recado das reticências ensina a notação', async () => {
    modos.definir('decimal-fracao');
    await fixture.whenStable();
    fixture.detectChanges();

    await escrever(0, '0,333...');

    expect(legenda()).toContain('entre parênteses');
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
