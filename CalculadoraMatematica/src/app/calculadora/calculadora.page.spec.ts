import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { CalculadoraPage } from './calculadora.page';
import { ModoService } from './modo.service';
import { TecladoService } from './teclado.service';

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
  /** O número que aparece ao lado de `MMC` (ou de `MDC`) no visor. */
  const resultado = (rotulo: string): string => {
    const contas = [...fixture.nativeElement.querySelectorAll('.conta-resultado')].map((conta) => ({
      nome: (conta.querySelector('.nome') as HTMLElement).textContent!.trim(),
      numero: (conta.querySelector('.numero') as HTMLElement).textContent!.trim(),
    }));
    return contas.find((c) => c.nome === rotulo)?.numero ?? '(ausente)';
  };

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

  it('o modo de inteiros mostra o MMC e o MDC juntos, sem escolher', async () => {
    modos.definir('mmc-mdc');
    await fixture.whenStable();
    fixture.detectChanges();

    await escrever(0, '12, 18, 24');

    expect(resultado('MMC')).toBe('72');
    expect(resultado('MDC')).toBe('6');
    expect(legenda()).toBe('MMC e MDC de 12, 18, 24');
    expect(fixture.nativeElement.querySelectorAll('.decomposicao tr').length).toBeGreaterThan(3);
  });

  it('não há mais botão para escolher a conta', async () => {
    // O botão escondia o que as duas contas têm em comum: são duas leituras da
    // mesma divisão simultânea.
    modos.definir('mmc-mdc');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.escolha')).toBeNull();
  });

  it('4 e 2 mostram MMC 4, MDC 2 e a fração 4/2 = 2/1', async () => {
    modos.definir('mmc-mdc');
    await fixture.whenStable();
    fixture.detectChanges();

    await escrever(0, '4, 2');

    expect(resultado('MMC')).toBe('4');
    expect(resultado('MDC')).toBe('2');

    // Dois números são uma FRAÇÃO: aparece empilhada, e não escrita numa linha
    // só — `4/2` se lê «quatro barra dois», e o que se quer é a razão.
    const fracoes = [...fixture.nativeElement.querySelectorAll('.fracao')].map((fracao) => ({
      numerador: (fracao.querySelector('.numerador') as HTMLElement).textContent!.trim(),
      denominador: (fracao.querySelector('.denominador') as HTMLElement).textContent!.trim(),
    }));

    expect(fracoes).toEqual([
      { numerador: '4', denominador: '2' },
      { numerador: '2', denominador: '1' },
    ]);
  });

  it('com três números não há fração, e sim as linhas divididas', async () => {
    modos.definir('mmc-mdc');
    await fixture.whenStable();
    fixture.detectChanges();

    await escrever(0, '12, 18, 24');

    expect(fixture.nativeElement.querySelector('.fracao-simplificada')).toBeNull();

    const linhas = [...fixture.nativeElement.querySelectorAll('.simplificacao li')].map((li) =>
      (li as HTMLElement).textContent!.trim(),
    );
    expect(linhas).toEqual(['12 ÷ 6 = 2', '18 ÷ 6 = 3', '24 ÷ 6 = 4']);
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

  it('o campo do MMC abre o teclado numérico, e o separador vem da faixa', async () => {
    modos.definir('mmc-mdc');
    await fixture.whenStable();
    fixture.detectChanges();

    // `numeric` de propósito: a tecla de separador que o `decimal` oferece é a
    // do separador decimal da língua do aparelho — sem cor, e como `.` num
    // aparelho em inglês. O separador é o nosso, na faixa.
    const campo = fixture.nativeElement.querySelector('.campo input') as HTMLInputElement;
    expect(campo.getAttribute('inputmode')).toBe('numeric');

    // E não há tecla ao lado do campo: nada de duas teclas na tela.
    expect(fixture.nativeElement.querySelector('.campo .tecla-do-campo')).toBeNull();
  });

  it('a fração simplificada fica no visor, junto do MMC e do MDC', async () => {
    // Ela é RESULTADO, não passo: com dois números, a simplificação é a
    // resposta tanto quanto o MMC. Embaixo da tabela era a última coisa da
    // tela, e a mais procurada.
    modos.definir('mmc-mdc');
    await fixture.whenStable();
    fixture.detectChanges();

    await escrever(0, '12 | 18');

    const noVisor = fixture.nativeElement.querySelector('.visor .fracao-no-visor');
    expect(noVisor).not.toBeNull();

    const fracoes = [...noVisor.querySelectorAll('.fracao')].map((fracao) => ({
      numerador: (fracao.querySelector('.numerador') as HTMLElement).textContent!.trim(),
      denominador: (fracao.querySelector('.denominador') as HTMLElement).textContent!.trim(),
    }));
    expect(fracoes).toEqual([
      { numerador: '12', denominador: '18' },
      { numerador: '2', denominador: '3' },
    ]);
  });

  it('com três números não há fração no visor, e sim as linhas embaixo', async () => {
    modos.definir('mmc-mdc');
    await fixture.whenStable();
    fixture.detectChanges();

    await escrever(0, '12 | 18 | 24');

    expect(fixture.nativeElement.querySelector('.fracao-no-visor')).toBeNull();

    const linhas = [...fixture.nativeElement.querySelectorAll('.simplificacao li')].map((li) =>
      (li as HTMLElement).textContent!.trim(),
    );
    expect(linhas).toEqual(['12 ÷ 6 = 2', '18 ÷ 6 = 3', '24 ÷ 6 = 4']);
  });

  it('o que é digitado vira barra: 12,18 aparece como 12 | 18', async () => {
    // Sem isto, o mesmo campo mostraria vírgula, ponto ou barra conforme o
    // aparelho, e o ponto ainda seria lido como decimal.
    modos.definir('mmc-mdc');
    await fixture.whenStable();
    fixture.detectChanges();

    await escrever(0, '12,18');

    const campo = fixture.nativeElement.querySelector('.campo input') as HTMLInputElement;
    expect(campo.value).toBe('12 | 18');
  });

  it('aceita ponto e vírgula na leitura, e as duas contas saem certas', async () => {
    modos.definir('mmc-mdc');
    await fixture.whenStable();
    fixture.detectChanges();

    await escrever(0, '80.90');
    expect(resultado('MMC')).toBe('720');
    expect(resultado('MDC')).toBe('10');

    await escrever(0, '12|18');
    expect(resultado('MMC')).toBe('36');
    expect(resultado('MDC')).toBe('6');
  });

  it('separa por vírgula e diz as duas contas', async () => {
    modos.definir('mmc-mdc');
    await fixture.whenStable();
    fixture.detectChanges();

    await escrever(0, '80, 90');

    expect(resultado('MMC')).toBe('720');
    expect(resultado('MDC')).toBe('10');
    expect(legenda()).toBe('MMC e MDC de 80, 90');
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

  it('a tecla do sinal devolve o cursor ao campo, para o teclado não fechar', async () => {
    /*
     * No iPhone, quem tira o foco do campo faz o teclado recolher. O
     * `preventDefault` no `pointerdown` do botão é o que impede o desfoque —
     * verificado no navegador, com toque de verdade, contando zero eventos
     * de `blur`. Aqui fica a rede de segurança: depois da tecla, o campo tem
     * o foco e o cursor no fim.
     */
    modos.definir('soma-produto');
    await fixture.whenStable();
    fixture.detectChanges();

    await escreverFatores('8', '2');
    await tocar('trocar o sinal do produto');
    await new Promise<void>((pronto) => queueMicrotask(() => pronto()));

    const campo = [...fixture.nativeElement.querySelectorAll('.campo input')].find(
      (entrada) => (entrada as HTMLInputElement).value === '-8',
    ) as HTMLInputElement;
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

/**
 * A faixa de teclas acima do teclado.
 *
 * O teclado do iPhone não aceita botão novo, então a vírgula mora numa faixa
 * colada nele. Aqui o teclado é fingido — `TecladoService` devolve altura 300 —
 * e o que se prova é o resto: a faixa aparece com o campo em foco, a tecla
 * escreve no campo certo, e as teclas ao lado do campo saem de cena enquanto
 * ela está na tela.
 */
describe('CalculadoraPage: faixa de teclas', () => {
  let fixture: ComponentFixture<CalculadoraPage>;
  let modos: ModoService;

  /** Altura controlável: o teste a leva a zero, como o WebView encolhido. */
  let alturaDoTeste = { valor: 300 };
  const tecladoFingido = {
    altura: () => alturaDoTeste.valor,
    aberto: () => alturaDoTeste.valor >= 80,
  };

  const barra = (): HTMLElement | null =>
    fixture.nativeElement.querySelector('.barra-do-teclado');

  const teclasDaBarra = (): readonly string[] =>
    [...(barra()?.querySelectorAll('.tecla-da-barra') ?? [])].map((t) =>
      (t as HTMLElement).textContent!.trim(),
    );

  const campoDeNumeros = (): HTMLInputElement =>
    fixture.nativeElement.querySelector('.campo input') as HTMLInputElement;

  async function escrever(valor: string): Promise<void> {
    const campo = campoDeNumeros();
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  /**
   * Foca de VERDADE, e não com um evento sintético.
   *
   * `dispatchEvent(new Event('focus'))` aciona o handler do Angular sem mexer
   * no `document.activeElement` — e aí um `blur()` depois não dispara nada, e o
   * teste mede o vazio.
   */
  async function focarNumeros(): Promise<void> {
    campoDeNumeros().focus();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  /** Deixa os `setTimeout` do componente rodarem. */
  async function aguardar(): Promise<void> {
    await new Promise<void>((pronto) => setTimeout(() => pronto(), 10));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function montar(altura = 300): Promise<void> {
    alturaDoTeste = { valor: altura };
    localStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [CalculadoraPage],
      providers: [{ provide: TecladoService, useValue: tecladoFingido }],
    }).compileComponents();

    modos = TestBed.inject(ModoService);
    modos.definir('mmc-mdc');
    fixture = TestBed.createComponent(CalculadoraPage);
    await fixture.whenStable();
    fixture.detectChanges();

    // O foco automático do modo roda num `setTimeout`; sem esta espera ele
    // chegaria no meio do teste e o resultado dependeria do relógio.
    await aguardar();
  }

  it('a faixa aparece mesmo sem altura medida — foi o defeito que sumiu com a tecla', async () => {
    /*
     * No aplicativo o plugin redimensiona o WebView (`resize: native`): janela
     * e área visível encolhem juntas, a altura medida é ZERO, e a primeira
     * versão da faixa exigia altura > 80 para aparecer — o separador
     * desapareceu da tela. A faixa depende do campo em foco, e só; a altura
     * diz onde ela fica.
     */
    await montar(0);
    await focarNumeros();

    expect(barra()).not.toBeNull();
    expect(teclasDaBarra()).toEqual(['|', 'C']);
  });

  it('no teclado não há faixa: não há campo a servir', async () => {
    await montar(300);
    modos.definir('basica');
    await aguardar();

    expect(barra()).toBeNull();
  });

  it('no MMC a faixa traz a barra, que é o separador da calculadora', async () => {
    // A tecla do teclado do iPhone é a do separador decimal da língua do
    // aparelho: sem cor, e como `.` num aparelho em inglês. A barra da faixa é
    // colorida e não é decimal em língua nenhuma.
    await montar(300);
    await focarNumeros();

    // A barra separa, e o `C` recomeça a lista — o par de teclas do campo.
    expect(teclasDaBarra()).toEqual(['|', 'C']);
    expect(barra()!.querySelector('.separador')).not.toBeNull();
    expect(barra()!.querySelector('.limpar')).not.toBeNull();
  });

  it('perder o foco devolve o foco ao campo — o teclado não fecha', async () => {
    /*
     * Nenhum `preventDefault` segura o teclado do iOS: quem manda nele é o
     * sistema. O que funciona é DEVOLVER o foco no quadro seguinte, e é isto
     * que o teste mede — o `blur` não pode deixar o cursor fora do campo.
     */
    await montar(300);
    await escrever('12 | 18');
    await focarNumeros();

    campoDeNumeros().blur();
    await aguardar();

    expect(document.activeElement).toBe(campoDeNumeros());
    expect(barra()).not.toBeNull();
  });

  it('perder o foco para a barra do topo não devolve o foco', async () => {
    // Abrir o menu é sair de propósito: aí o teclado pode — e deve — fechar.
    await montar(300);
    await focarNumeros();

    (document.querySelector('ion-toolbar') as HTMLElement).dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true }),
    );
    campoDeNumeros().blur();
    await aguardar();

    expect(document.activeElement).not.toBe(campoDeNumeros());
    expect(barra()).toBeNull();
  });

  it('entrar no modo de inteiros já abre o teclado', async () => {
    // Antes o teclado só abria com um toque no campo, e quem escolhia o modo
    // no menu via a calculadora sem teclado e sem as teclas da faixa.
    await montar(300);
    modos.definir('mmc-mdc');
    await fixture.whenStable();
    fixture.detectChanges();

    await aguardar();

    expect(document.activeElement).toBe(campoDeNumeros());
  });

  it('tocar fora do campo não fecha o teclado', async () => {
    /*
     * No iPhone, tocar na tabela tirava o foco do campo, o teclado recolhia e
     * a faixa das teclas sumia junto — no meio da digitação. O `pointerdown`
     * barrado segura o foco onde está.
     */
    await montar(300);
    await escrever('12 | 18');
    await focarNumeros();

    const tabela = fixture.nativeElement.querySelector('.decomposicao') as HTMLElement;
    const toque = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });
    tabela.dispatchEvent(toque);

    expect(toque.defaultPrevented).toBe(true);
    // E o campo continua em foco: a faixa das teclas não some.
    expect(barra()).not.toBeNull();
  });

  it('tocar no próprio campo não é barrado — é assim que se troca de campo', async () => {
    await montar(300);
    await focarNumeros();

    const toque = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });
    campoDeNumeros().dispatchEvent(toque);

    expect(toque.defaultPrevented).toBe(false);
  });

  it('sem campo em foco, o toque não é barrado', async () => {
    // No teclado da calculadora não há campo: barrar ali apagaria o estado de
    // tecla apertada.
    await montar(300);
    modos.definir('basica');
    await fixture.whenStable();
    fixture.detectChanges();

    const tecla = fixture.nativeElement.querySelector('.teclas button') as HTMLElement;
    const toque = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });
    tecla.dispatchEvent(toque);

    expect(toque.defaultPrevented).toBe(false);
  });

  it('o C da faixa limpa o campo em foco', async () => {
    await montar(300);
    await escrever('12 | 18 | 24');
    await focarNumeros();

    (barra()!.querySelector('.limpar') as HTMLButtonElement).click();
    await fixture.whenStable();

    // Sem o `C`, apagar cinco números exigiria cinco toques no apagar do
    // teclado — e a lista do MMC cresce rápido.
    expect(campoDeNumeros().value).toBe('');
  });

  it('a barra da faixa separa os números do campo em foco', async () => {
    await montar(300);
    await escrever('12');
    await focarNumeros();

    (barra()!.querySelector('.separador') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    // Sem o espaço final: a normalização da escrita o tira, para o cursor ficar
    // colado na barra e o próximo dígito entrar no lugar certo.
    const campo = fixture.nativeElement.querySelector('.campo input') as HTMLInputElement;
    expect(campo.value).toBe('12 |');
  });

  it('a barra não se repete nem abre a lista', async () => {
    await montar(300);
    await focarNumeros();

    // Campo vazio: nada a separar.
    (barra()!.querySelector('.separador') as HTMLButtonElement).click();
    await fixture.whenStable();
    const campo = fixture.nativeElement.querySelector('.campo input') as HTMLInputElement;
    expect(campo.value).toBe('');

    await escrever('12 |');
    await focarNumeros();
    (barra()!.querySelector('.separador') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(campo.value).toBe('12 |');
  });

  it('no Fatorar a faixa traz o sinal, que o teclado não tem', async () => {
    await montar(300);
    modos.definir('soma-produto');
    await fixture.whenStable();
    fixture.detectChanges();

    const campo = fixture.nativeElement.querySelector('.campo input') as HTMLInputElement;
    campo.dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(teclasDaBarra()).toEqual(['±']);
    expect(barra()!.style.bottom).toBe('300px');
  });

  it('a tecla da faixa troca o sinal do campo em foco', async () => {
    await montar(300);
    modos.definir('soma-produto');
    await fixture.whenStable();
    fixture.detectChanges();

    const campo = fixture.nativeElement.querySelector('.campo input') as HTMLInputElement;
    campo.value = '8';
    campo.dispatchEvent(new Event('input'));
    campo.dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    fixture.detectChanges();

    (barra()!.querySelector('.tecla-da-barra') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(campo.value).toBe('-8');
  });

  it('com a faixa na tela, a tecla ao lado do campo sai', async () => {
    // Duas cópias da mesma tecla a um dedo de distância confundem; a da faixa
    // ganha porque está onde o polegar já está.
    await montar(300);
    modos.definir('soma-produto');
    await fixture.whenStable();
    fixture.detectChanges();

    const campo = fixture.nativeElement.querySelector('.campo input') as HTMLInputElement;
    campo.dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.calculadora').classList).toContain('com-barra');
  });

  it('a faixa mostra as teclas do campo decimal quando é ele que está em foco', async () => {
    await montar(300);
    modos.definir('decimal-fracao');
    await fixture.whenStable();
    fixture.detectChanges();

    const campo = fixture.nativeElement.querySelector('.campo input') as HTMLInputElement;
    campo.dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    fixture.detectChanges();

    // A vírgula saiu: o teclado decimal já a tem. Ficam as três que ele não tem.
    expect(teclasDaBarra()).toEqual(['(', ')', '±']);
  });
});
