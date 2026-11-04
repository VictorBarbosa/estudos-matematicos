import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FolhaService } from '@core/folha/services/folha.service';
import { Folha } from '@shared/components/folha/folha';

/**
 * Um contexto 2D de mentira que anota o que foi pedido.
 *
 * O jsdom não desenha nada, então sem isto o componente pintaria no vazio e o
 * teste não teria o que verificar. Com ele dá para conferir o que importa: que
 * cada traço virou linha, e que a borracha pinta no modo que apaga.
 */
class PincelFalso {
  linhas: { x1: number; y1: number; x2: number; y2: number; largura: number }[] = [];
  composicoes: string[] = [];
  limpou = 0;
  circulos = 0;

  globalCompositeOperation = 'source-over';
  strokeStyle = '';
  fillStyle = '';
  lineWidth = 1;
  lineCap = '';
  lineJoin = '';

  private de = { x: 0, y: 0 };

  setTransform(): void {}
  clearRect(): void {
    this.limpou++;
  }
  beginPath(): void {}
  moveTo(x: number, y: number): void {
    this.de = { x, y };
  }
  lineTo(x: number, y: number): void {
    this.linhas.push({ x1: this.de.x, y1: this.de.y, x2: x, y2: y, largura: this.lineWidth });
  }
  stroke(): void {
    this.composicoes.push(this.globalCompositeOperation);
  }
  arc(): void {
    this.circulos++;
  }
  fill(): void {
    this.composicoes.push(this.globalCompositeOperation);
  }
}

/** Um evento de ponteiro com o mínimo que o componente lê. */
function toque(tipo: string, { x = 10, y = 10, pressao = 0.5, id = 1 } = {}): PointerEvent {
  const evento = new Event(tipo, { bubbles: true }) as unknown as Record<string, unknown>;
  evento['clientX'] = x;
  evento['clientY'] = y;
  evento['pressure'] = pressao;
  evento['pointerId'] = id;
  evento['getCoalescedEvents'] = () => [];
  return evento as unknown as PointerEvent;
}

describe('Folha', () => {
  let fixture: ComponentFixture<Folha>;
  let folha: FolhaService;
  let pincel: PincelFalso;

  const tela = (): HTMLCanvasElement =>
    fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement;

  beforeEach(async () => {
    localStorage.clear();
    pincel = new PincelFalso();

    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: () => pincel,
    });

    // O canvas não tem tamanho no jsdom; sem isto, os pontos sairiam deslocados.
    Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ left: 0, top: 0, width: 400, height: 300, right: 400, bottom: 300 }),
    });

    HTMLCanvasElement.prototype.setPointerCapture = () => undefined;

    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    folha = TestBed.inject(FolhaService);
    folha.alternar();

    fixture = TestBed.createComponent(Folha);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
  });

  /** Escreve um traço de três pontos. */
  async function escrever(id = 1): Promise<void> {
    tela().dispatchEvent(toque('pointerdown', { x: 10, y: 10, id }));
    tela().dispatchEvent(toque('pointermove', { x: 20, y: 30, id }));
    tela().dispatchEvent(toque('pointermove', { x: 40, y: 50, id }));
    tela().dispatchEvent(toque('pointerup', { x: 40, y: 50, id }));
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('a janela aberta desenha a área de rascunho', () => {
    expect(tela()).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.convite')).not.toBeNull();
  });

  it('escrever registra um traço com os pontos percorridos', async () => {
    await escrever();

    expect(folha.tracos().length).toBe(1);
    expect(folha.tracos()[0]!.pontos).toEqual([
      { x: 10, y: 10, pressao: 0.5 },
      { x: 20, y: 30, pressao: 0.5 },
      { x: 40, y: 50, pressao: 0.5 },
    ]);
  });

  it('o traço é pintado como segmentos entre os pontos', async () => {
    await escrever();

    expect(pincel.linhas.length).toBeGreaterThanOrEqual(2);
    expect(pincel.linhas[0]).toMatchObject({ x1: 10, y1: 10, x2: 20, y2: 30 });
  });

  it('com algo escrito, o convite sai da frente', async () => {
    await escrever();
    expect(fixture.nativeElement.querySelector('.convite')).toBeNull();
  });

  it('o dedo, que não informa pressão, vale meio', async () => {
    tela().dispatchEvent(toque('pointerdown', { x: 5, y: 5, pressao: 0 }));
    await fixture.whenStable();

    expect(folha.tracos()[0]!.pontos[0]!.pressao).toBe(0.5);
  });

  it('a caneta com mais pressão faz traço mais grosso', async () => {
    tela().dispatchEvent(toque('pointerdown', { x: 0, y: 0, pressao: 0.2 }));
    tela().dispatchEvent(toque('pointermove', { x: 10, y: 0, pressao: 0.2 }));
    tela().dispatchEvent(toque('pointerup', { x: 10, y: 0, pressao: 0.2 }));
    await fixture.whenStable();
    const fina = pincel.linhas.at(-1)!.largura;

    folha.limpar();
    tela().dispatchEvent(toque('pointerdown', { x: 0, y: 0, pressao: 1, id: 2 }));
    tela().dispatchEvent(toque('pointermove', { x: 10, y: 0, pressao: 1, id: 2 }));
    await fixture.whenStable();
    const grossa = pincel.linhas.at(-1)!.largura;

    expect(grossa).toBeGreaterThan(fina);
  });

  it('um segundo dedo na tela não começa outro traço', async () => {
    tela().dispatchEvent(toque('pointerdown', { x: 10, y: 10, id: 1 }));
    tela().dispatchEvent(toque('pointerdown', { x: 90, y: 90, id: 2 }));
    tela().dispatchEvent(toque('pointermove', { x: 95, y: 95, id: 2 }));
    await fixture.whenStable();

    expect(folha.tracos().length).toBe(1);
    expect(folha.tracos()[0]!.pontos.length).toBe(1);
  });

  it('a borracha pinta no modo que apaga', async () => {
    folha.definirFerramenta('borracha');
    await escrever();

    expect(folha.tracos()[0]!.apaga).toBe(true);
    expect(pincel.composicoes).toContain('destination-out');
  });

  it('um toque sem arrastar vira um ponto', async () => {
    tela().dispatchEvent(toque('pointerdown', { x: 7, y: 7 }));
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(pincel.circulos).toBeGreaterThan(0);
  });

  it('desfazer e limpar chegam pelos botões da barra', async () => {
    await escrever(1);
    await escrever(2);
    expect(folha.tracos().length).toBe(2);

    const botao = (titulo: string): HTMLButtonElement =>
      [...fixture.nativeElement.querySelectorAll('.barra button')].find(
        (b) =>
          (b as HTMLButtonElement).title.length > 0 &&
          (b as HTMLButtonElement).title.includes(titulo),
      ) as HTMLButtonElement;

    botao('Desfazer').click();
    await fixture.whenStable();
    expect(folha.tracos().length).toBe(1);

    botao('Limpar').click();
    await fixture.whenStable();
    expect(folha.vazia()).toBe(true);
  });

  it('fechar some com a janela', async () => {
    folha.fechar();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.janela')).toBeNull();
  });

  it('redesenha do zero a cada traço: nada de tinta acumulada', async () => {
    const antes = pincel.limpou;
    await escrever();

    expect(pincel.limpou).toBeGreaterThan(antes);
  });
});
