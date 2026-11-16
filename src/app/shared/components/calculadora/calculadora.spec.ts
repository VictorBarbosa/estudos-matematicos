import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalculadoraService } from '@core/calculadora/services/calculadora.service';
import { TecladoService } from '@core/calculadora/services/teclado.service';
import { DispositivoService } from '@core/dispositivo/services/dispositivo.service';
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

      alvo.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, clientX: 50, clientY: 20 }),
      );
      barra.dispatchEvent(
        new PointerEvent('pointermove', { bubbles: true, clientX: 300, clientY: 300 }),
      );
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

  /** O número que aparece ao lado de `MMC` (ou de `MDC`) no visor. */
  function resultado(rotulo: string): string {
    const contas = [...fixture.nativeElement.querySelectorAll('.conta-resultado')].map(
      (conta) => ({
        nome: (conta.querySelector('.nome') as HTMLElement).textContent!.trim(),
        numero: (conta.querySelector('.numero') as HTMLElement).textContent!.trim(),
      }),
    );
    return contas.find((c) => c.nome === rotulo)?.numero ?? '(ausente)';
  }

  /** O visor mostra as duas contas ao mesmo tempo. */
  function visor(): string {
    const valor = fixture.nativeElement.querySelector('.visor .valor');
    return valor === null ? '' : (valor as HTMLElement).textContent!.trim();
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

  it('mostra o MMC e o MDC juntos, sem escolher entre eles', async () => {
    await escrever('12, 18, 24');

    expect(resultado('MMC')).toBe('72');
    expect(resultado('MDC')).toBe('6');
    expect(legenda()).toBe('MMC e MDC de 12, 18, 24');
  });

  it('não há mais botão para escolher a conta', () => {
    // O botão escondia o que as duas contas têm em comum: são duas leituras da
    // mesma divisão simultânea.
    expect(fixture.nativeElement.querySelector('.escolha')).toBeNull();
  });

  it('o exemplo de 4 e 2 mostra MMC 4, MDC 2 e a fração 4/2 = 2/1', async () => {
    await escrever('4, 2');

    expect(resultado('MMC')).toBe('4');
    expect(resultado('MDC')).toBe('2');

    // Dois números são uma FRAÇÃO: ela aparece empilhada, não escrita numa
    // linha só — `4/2` se lê «quatro barra dois», e o que se quer é a razão.
    const fracoes = [...fixture.nativeElement.querySelectorAll('.fracao')].map((fracao) => ({
      numerador: (fracao.querySelector('.numerador') as HTMLElement).textContent!.trim(),
      denominador: (fracao.querySelector('.denominador') as HTMLElement).textContent!.trim(),
    }));

    expect(fracoes).toEqual([
      { numerador: '4', denominador: '2' },
      { numerador: '2', denominador: '1' },
    ]);
  });

  it('a fração de 12 e 18 é 12/18 = 2/3', async () => {
    await escrever('12, 18');

    const numeradores = [...fixture.nativeElement.querySelectorAll('.fracao .numerador')].map(
      (e) => (e as HTMLElement).textContent!.trim(),
    );
    const denominadores = [
      ...fixture.nativeElement.querySelectorAll('.fracao .denominador'),
    ].map((e) => (e as HTMLElement).textContent!.trim());

    expect(numeradores).toEqual(['12', '2']);
    expect(denominadores).toEqual(['18', '3']);
  });

  it('com três números não há fração, e sim as linhas divididas', async () => {
    // 12, 18 e 24 não formam uma fração; a tela mostra o MDC aplicado a cada um.
    await escrever('12, 18, 24');

    expect(fixture.nativeElement.querySelector('.fracao-simplificada')).toBeNull();

    const linhas = [...fixture.nativeElement.querySelectorAll('.simplificacao li')].map((li) =>
      (li as HTMLElement).textContent!.trim(),
    );
    expect(linhas).toEqual(['12 ÷ 6 = 2', '18 ÷ 6 = 3', '24 ÷ 6 = 4']);
  });

  it('mostra a decomposição até todos chegarem a 1', async () => {
    await escrever('12, 18');

    const linhas = [...fixture.nativeElement.querySelectorAll('.decomposicao tr')].map((linha) =>
      [...(linha as HTMLElement).children].map((celula) => celula.textContent!.trim()).join(' '),
    );

    // A última linha é a chegada: todos em 1, sem divisor.
    expect(linhas).toEqual(['12 18 2', '6 9 2', '3 9 3', '1 3 3', '1 1 ']);
  });

  it('mostra de onde cada resultado sai', async () => {
    await escrever('12, 18');

    const montagens = [...fixture.nativeElement.querySelectorAll('.montagem')].map((linha) =>
      (linha as HTMLElement).textContent!.trim(),
    );

    expect(montagens).toEqual(['MMC = 2² · 3² = 36', 'MDC = 2 · 3 = 6']);
  });

  it('destaca as linhas que couberam em todos, sempre', async () => {
    // O destaque deixou de ser um modo: as linhas comuns são os fatores do
    // MDC e aparecem marcadas ao lado da coluna inteira, que é o MMC.
    await escrever('12, 18');

    const comuns = [...fixture.nativeElement.querySelectorAll('.decomposicao tr.comum')].map(
      (linha) => (linha as HTMLElement).querySelector('.divisor')!.textContent!.trim(),
    );

    expect(comuns).toEqual(['2', '3']);
  });

  it('MDC 1 diz em palavras por que não há montagem', async () => {
    await escrever('8, 9');

    const linhas = [...fixture.nativeElement.querySelectorAll('.montagem')].map((linha) =>
      (linha as HTMLElement).textContent!.trim(),
    );

    expect(linhas[1]).toContain('Nenhum divisor comum');
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

describe('Calculadora: soma e produto', () => {
  let fixture: ComponentFixture<Calculadora>;
  let servico: CalculadoraService;

  const campo = (rotulo: string): HTMLInputElement =>
    [...fixture.nativeElement.querySelectorAll('.fatores .campo')]
      .filter((e) => (e as HTMLElement).textContent?.includes(rotulo))
      .map((e) => (e as HTMLElement).querySelector('input'))[0] as HTMLInputElement;

  async function escrever(produto: string, soma: string): Promise<void> {
    for (const [rotulo, texto] of [
      ['Produto', produto],
      ['Soma', soma],
    ]) {
      const entrada = campo(rotulo!);
      entrada.value = texto!;
      entrada.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    }
  }

  const visor = (): string =>
    (fixture.nativeElement.querySelector('.valor') as HTMLElement).textContent!.trim();
  const legenda = (): string =>
    (fixture.nativeElement.querySelector('.legenda') as HTMLElement).textContent!.trim();
  const montagem = (): string | null =>
    (
      fixture.nativeElement.querySelector('.fatores .montagem') as HTMLElement | null
    )?.textContent?.trim() ?? null;
  const raizes = (): string | null =>
    (
      fixture.nativeElement.querySelector('.fatores .raizes') as HTMLElement | null
    )?.textContent?.trim() ?? null;

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
      .find((b) => (b as HTMLButtonElement).textContent?.trim() === 'Fatorar')!
      .click();
    await fixture.whenStable();
  });

  it('a aba troca o teclado por dois campos', () => {
    expect(servico.modo()).toBe('soma-produto');
    expect(campo('Produto')).not.toBeNull();
    expect(campo('Soma')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.teclado')).toBeNull();
  });

  it('pede a soma antes do produto, na ordem em que a expressão se lê', async () => {
    // Em `x² - 25x + 136` o 25 vem primeiro e é a SOMA. Com o produto no
    // primeiro campo, digitar na ordem da leitura invertia os dois.
    const rotulos = [...fixture.nativeElement.querySelectorAll('.fatores .campo .rotulo')].map(
      (e) => (e as HTMLElement).textContent!.trim(),
    );

    expect(rotulos).toEqual(['Soma', 'Produto']);
  });

  it('acha o par e escreve a fatoração', async () => {
    await escrever('24', '11');

    expect(visor()).toBe('3 e 8');
    expect(legenda()).toBe('Produto 24, soma 11');
    expect(montagem()).toBe('x² + 11x + 24 = (x + 3)(x + 8)');
  });

  it('mostra os pares tentados, com o que serviu destacado', async () => {
    await escrever('24', '11');

    const linhas = [...fixture.nativeElement.querySelectorAll('.pares tbody tr')];
    expect(linhas.length).toBe(3);
    expect((linhas.at(-1) as HTMLElement).classList).toContain('escolhido');
    expect((linhas.at(-1) as HTMLElement).textContent).toContain('11');
  });

  it('sem par inteiro, mostra o par exato e diz por quê', async () => {
    await escrever('11', '11');

    expect(visor()).toContain('1,11');
    expect(legenda()).toBe('Nenhum par de inteiros serve');
    expect(montagem()).toContain('par exato');
  });

  it('separa o par das raízes, que são os opostos dele', async () => {
    // x² + 2x - 8: o par é -2 e 4, mas quem anula a expressão é -4 e 2.
    await escrever('-8', '2');

    expect(visor()).toBe('-2 e 4');
    expect(montagem()).toBe('x² + 2x − 8 = (x − 2)(x + 4)');
    expect(raizes()).toBe('Raízes: x = -4 ou x = 2');
  });

  it('as raízes aparecem mesmo quando não há par inteiro', async () => {
    await escrever('11', '11');

    expect(raizes()).toBe('Raízes: x = -9,8874821937 ou x = -1,1125178063');
  });

  it('produto grande demais para a soma não tem resposta real', async () => {
    await escrever('10', '4');

    expect(legenda()).toBe('Não existem dois números reais com esse produto e essa soma.');
    expect(visor()).toBe('—');
  });

  it('campo pela metade pede o que falta, sem acusar erro', async () => {
    await escrever('24', '');

    expect(legenda()).toBe('Escreva o produto e a soma.');
    expect(visor()).toBe('—');
  });

  it('a aba escolhida sobrevive a uma aba nova do navegador', async () => {
    await escrever('24', '11');
    expect(servico.modo()).toBe('soma-produto');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

    expect(TestBed.inject(CalculadoraService).modo()).toBe('soma-produto');
  });
});

/**
 * A faixa de teclas acima do teclado do sistema.
 *
 * Ela existe para o que o teclado do aparelho não tem. O separador saiu dela
 * quando o campo dos números passou a abrir com `inputmode="decimal"`: a tecla
 * da vírgula está no próprio teclado, onde a mão já está — e é por isso que,
 * em MMC e MDC, não há faixa nenhuma.
 */
describe('Calculadora: faixa de teclas do teclado', () => {
  let fixture: ComponentFixture<Calculadora>;
  let servico: CalculadoraService;

  // A altura é um signal para o teste poder levá-la a zero — é o caso do
  // WebView que encolhe junto com o teclado.
  const altura = signal(300);
  const tecladoFingido = {
    altura: altura.asReadonly(),
    aberto: () => altura() >= 80,
  };

  /**
   * O aparelho, fingido.
   *
   * No jsdom o `DispositivoService` responde «computador», e no computador o
   * refoco é desligado de propósito — sem esta troca, o teste mediria o
   * caminho errado.
   */
  const tipo = signal<'celular' | 'tablet' | 'computador'>('celular');
  const dispositivoFingido = { tipo: tipo.asReadonly() };

  const barra = (): HTMLElement | null => fixture.nativeElement.querySelector('.barra-do-teclado');

  const teclasDaBarra = (): readonly string[] =>
    [...(barra()?.querySelectorAll('.tecla-da-barra') ?? [])].map((t) =>
      (t as HTMLElement).textContent!.trim(),
    );

  const campos = (): readonly HTMLInputElement[] => [
    ...fixture.nativeElement.querySelectorAll('.campo input'),
  ];

  async function escrever(indice: number, valor: string): Promise<void> {
    const campo = campos()[indice]!;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  /**
   * Foca de VERDADE, e não com um evento sintético.
   *
   * `dispatchEvent(new Event('focus'))` aciona o handler do Angular sem mexer
   * no `document.activeElement` — e aí um `blur()` depois não dispara nada, e o
   * teste mede o vazio.
   */
  async function focar(indice: number): Promise<void> {
    campos()[indice]!.focus();
    await fixture.whenStable();
  }

  async function tocar(): Promise<void> {
    (barra()!.querySelector('.tecla-da-barra') as HTMLButtonElement).click();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    // Altura zero é o caso do WebView que encolhe com o teclado — e é o que
    // prova que a faixa não depende de medida para existir.
    altura.set(0);
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Calculadora],
      providers: [
        provideZonelessChangeDetection(),
        { provide: TecladoService, useValue: tecladoFingido },
        { provide: DispositivoService, useValue: dispositivoFingido },
      ],
    }).compileComponents();

    tipo.set('celular');
    servico = TestBed.inject(CalculadoraService);
    servico.alternar();
    fixture = TestBed.createComponent(Calculadora);
    await fixture.whenStable();
  });

  it('o campo dos números abre o teclado numérico, e o separador vem da faixa', async () => {
    // `numeric` de propósito: a tecla de separador que o `decimal` oferece é a
    // do separador decimal da língua do aparelho — sem cor, e como `.` num
    // aparelho em inglês. O separador é o nosso, na faixa.
    servico.definirModo('mmc-mdc');
    await fixture.whenStable();

    expect(campos()[0]!.getAttribute('inputmode')).toBe('numeric');
  });

  it('em MMC e MDC a faixa traz a barra, que é o separador da calculadora', async () => {
    servico.definirModo('mmc-mdc');
    await fixture.whenStable();
    await focar(0);

    // A barra separa, e o `C` recomeça a lista — o par de teclas do campo.
    expect(teclasDaBarra()).toEqual(['|', 'C']);
    expect(barra()!.querySelector('.separador')).not.toBeNull();
  });

  it('perder o foco devolve o foco ao campo, no celular — o teclado não fecha', async () => {
    /*
     * Nenhum `preventDefault` segura o teclado do sistema: o que funciona é
     * DEVOLVER o foco no quadro seguinte.
     */
    servico.definirModo('mmc-mdc');
    await fixture.whenStable();
    await escrever(0, '12 | 18');
    await focar(0);

    campos()[0]!.blur();
    await new Promise<void>((pronto) => setTimeout(() => pronto(), 10));
    await fixture.whenStable();

    expect(document.activeElement).toBe(campos()[0]);
    expect(barra()).not.toBeNull();
  });

  it('no computador o foco não é devolvido — prenderia o cursor na calculadora', async () => {
    // Sem esta guarda, o aluno não conseguiria clicar no exercício ao lado.
    tipo.set('computador');
    servico.definirModo('mmc-mdc');
    await fixture.whenStable();
    await focar(0);

    campos()[0]!.blur();
    await new Promise<void>((pronto) => setTimeout(() => pronto(), 10));
    await fixture.whenStable();

    expect(document.activeElement).not.toBe(campos()[0]);
    expect(barra()).toBeNull();
  });

  it('tocar fora do campo não fecha o teclado', async () => {
    /*
     * No celular, tocar na tabela tirava o foco do campo, o teclado recolhia e
     * a faixa das teclas sumia junto — no meio da digitação.
     */
    servico.definirModo('mmc-mdc');
    await fixture.whenStable();
    await escrever(0, '12 | 18');
    await focar(0);

    const alvo = fixture.nativeElement.querySelector('.visor') as HTMLElement;
    const toque = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });
    alvo.dispatchEvent(toque);

    expect(toque.defaultPrevented).toBe(true);
    // E o campo continua em foco: a faixa das teclas não some.
    expect(barra()).not.toBeNull();
  });

  it('tocar no próprio campo não é barrado — é assim que se troca de campo', async () => {
    servico.definirModo('soma-produto');
    await fixture.whenStable();
    await focar(0);

    const toque = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });
    campos()[1]!.dispatchEvent(toque);

    expect(toque.defaultPrevented).toBe(false);
  });

  it('tocar na barra do topo não é barrado — é a alça de arrastar', async () => {
    // `preventDefault` no `pointerdown` cancela a captura implícita do ponteiro,
    // e a janela deixaria de se arrastar no toque.
    servico.definirModo('mmc-mdc');
    await fixture.whenStable();
    await focar(0);

    const alca = fixture.nativeElement.querySelector('header.barra') as HTMLElement;
    const toque = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });
    alca.dispatchEvent(toque);

    expect(toque.defaultPrevented).toBe(false);
  });

  it('sem campo em foco, o toque não é barrado', async () => {
    // No teclado da calculadora não há campo: barrar ali apagaria o estado de
    // tecla apertada.
    await fixture.whenStable();

    const tecla = fixture.nativeElement.querySelector('.teclado button') as HTMLElement;
    const toque = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });
    tecla.dispatchEvent(toque);

    expect(toque.defaultPrevented).toBe(false);
  });

  it('o C da faixa limpa o campo em foco', async () => {
    servico.definirModo('mmc-mdc');
    await fixture.whenStable();
    await escrever(0, '12 | 18 | 24');
    await focar(0);

    (barra()!.querySelector('.limpar') as HTMLButtonElement).click();
    await fixture.whenStable();

    // Sem o `C`, apagar cinco números exigiria cinco toques no apagar do
    // teclado — e a lista do MMC cresce rápido.
    expect(campos()[0]!.value).toBe('');
  });

  it('a barra da faixa separa os números do campo em foco', async () => {
    servico.definirModo('mmc-mdc');
    await fixture.whenStable();
    await escrever(0, '12');
    await focar(0);

    (barra()!.querySelector('.separador') as HTMLButtonElement).click();
    await fixture.whenStable();

    // Sem o espaço final: a normalização da escrita o tira, para o cursor ficar
    // colado na barra e o próximo dígito entrar no lugar certo.
    expect(campos()[0]!.value).toBe('12 |');
  });

  it('a barra não se repete nem abre a lista', async () => {
    servico.definirModo('mmc-mdc');
    await fixture.whenStable();
    await focar(0);

    // Campo vazio: nada a separar.
    (barra()!.querySelector('.separador') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(campos()[0]!.value).toBe('');

    await escrever(0, '12 |');
    await focar(0);
    (barra()!.querySelector('.separador') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(campos()[0]!.value).toBe('12 |');
  });

  it('o que é digitado vira barra: 12,18 aparece como 12 | 18', async () => {
    // Sem isto, o mesmo campo mostraria vírgula, ponto ou barra conforme o
    // aparelho, e o ponto ainda seria lido como decimal.
    servico.definirModo('mmc-mdc');
    await fixture.whenStable();

    await escrever(0, '12,18');

    expect(campos()[0]!.value).toBe('12 | 18');
  });

  it('aceita ponto e barra na leitura, e as duas contas saem certas', async () => {
    servico.definirModo('mmc-mdc');
    await fixture.whenStable();

    const resultado = (): readonly string[] =>
      [...fixture.nativeElement.querySelectorAll('.conta-resultado')].map((c) =>
        (c.querySelector('.numero') as HTMLElement).textContent!.trim(),
      );

    await escrever(0, '80.90');
    expect(resultado()).toEqual(['720', '10']);

    await escrever(0, '12|18');
    expect(resultado()).toEqual(['36', '6']);
  });

  it('no Fatorar a faixa traz o sinal, que o teclado não tem', async () => {
    servico.definirModo('soma-produto');
    await fixture.whenStable();
    await focar(0);

    expect(teclasDaBarra()).toEqual(['±']);
  });

  it('quando a altura é medida, a faixa sobe até o teclado', async () => {
    // No site e no Capacitor com `resize: none`, a altura vem do
    // `visualViewport` (ou do plugin) e a faixa acompanha.
    altura.set(300);
    servico.definirModo('mmc-mdc');
    await fixture.whenStable();

    await focar(0);

    expect(barra()!.style.bottom).toBe('300px');
  });

  it('a tecla da faixa troca o sinal do campo em foco', async () => {
    servico.definirModo('soma-produto');
    await fixture.whenStable();

    await escrever(0, '8');
    await focar(0);
    await tocar();

    expect(campos()[0]!.value).toBe('-8');
  });

  it('sem foco não há faixa: não há campo a servir', async () => {
    servico.definirModo('soma-produto');
    await fixture.whenStable();

    expect(barra()).toBeNull();
  });

  it('a faixa aparece mesmo com altura zero — foi o defeito que sumiu com a tecla', async () => {
    /*
     * Num WebView que encolhe junto com o teclado a medida é ZERO, e a
     * primeira versão da faixa exigia altura maior que 80 px para aparecer: o
     * separador desapareceu da tela. A faixa depende do campo em foco, e só; a
     * altura diz onde ela fica.
     */
    expect(altura()).toBe(0);
    servico.definirModo('mmc-mdc');
    await fixture.whenStable();

    await focar(0);

    expect(barra()).not.toBeNull();
    // Sem medida, o rodapé — que num WebView encolhido já é o topo do teclado.
    expect(barra()!.style.bottom).toBe('0px');
  });

  it('com a faixa na tela, as teclas ao lado do campo saem', async () => {
    // Duas cópias da mesma tecla a um dedo de distância confundem; a da faixa
    // ganha porque está onde o polegar já está.
    servico.definirModo('soma-produto');
    await fixture.whenStable();
    await focar(0);

    expect(fixture.nativeElement.querySelector('.janela').classList).toContain('com-barra');
  });

  it('a fração simplificada fica no visor, junto do MMC e do MDC', async () => {
    // Ela é RESULTADO, não passo: com dois números, a simplificação é a
    // resposta tanto quanto o MMC. Embaixo da tabela era a última coisa da
    // tela, e a mais procurada.
    servico.definirModo('mmc-mdc');
    await fixture.whenStable();

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
    servico.definirModo('mmc-mdc');
    await fixture.whenStable();

    await escrever(0, '12 | 18 | 24');

    expect(fixture.nativeElement.querySelector('.fracao-no-visor')).toBeNull();

    const linhas = [...fixture.nativeElement.querySelectorAll('.simplificacao li')].map((li) =>
      (li as HTMLElement).textContent!.trim(),
    );
    expect(linhas).toEqual(['12 ÷ 6 = 2', '18 ÷ 6 = 3', '24 ÷ 6 = 4']);
  });

  it('a conta do MMC continua funcionando com a vírgula digitada', async () => {
    servico.definirModo('mmc-mdc');
    await fixture.whenStable();

    await escrever(0, '12, 18');

    const resultado = [...fixture.nativeElement.querySelectorAll('.conta-resultado')].map((c) =>
      (c.querySelector('.numero') as HTMLElement).textContent!.trim(),
    );
    expect(resultado).toEqual(['36', '6']);
  });
});
