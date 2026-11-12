import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  AcaoDaBandeja,
  RascunhoBandeja,
} from '@shared/components/rascunho-bandeja/rascunho-bandeja';

async function montar(): Promise<{
  fixture: ComponentFixture<RascunhoBandeja>;
  acoes: AcaoDaBandeja[];
}> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

  const fixture = TestBed.createComponent(RascunhoBandeja);
  const acoes: AcaoDaBandeja[] = [];
  fixture.componentInstance.acionar.subscribe((acao) => acoes.push(acao));

  await fixture.whenStable();

  return { fixture, acoes };
}

function teclas(fixture: ComponentFixture<RascunhoBandeja>): HTMLButtonElement[] {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
}

function porRotulo(fixture: ComponentFixture<RascunhoBandeja>, rotulo: string): HTMLButtonElement {
  const achada = teclas(fixture).find((tecla) => tecla.textContent!.trim() === rotulo);

  if (achada === undefined) {
    throw new Error(`não há tecla «${rotulo}» na bandeja`);
  }

  return achada;
}

describe('RascunhoBandeja', () => {
  it('traz os dez algarismos, as quatro operações e a fração', async () => {
    const { fixture } = await montar();
    const rotulos = teclas(fixture).map((tecla) => tecla.textContent!.trim());

    for (const algarismo of '0123456789') {
      expect(rotulos).toContain(algarismo);
    }

    expect(rotulos).toContain('+');
    expect(rotulos).toContain('−');
    expect(rotulos).toContain('×');
    expect(rotulos).toContain('÷');
    expect(rotulos).toContain('▭/▭');
    expect(rotulos).toContain('=');
  });

  it('traz as três teclas de navegação e a de apagar', async () => {
    const { fixture } = await montar();
    const rotulos = teclas(fixture).map((tecla) => tecla.textContent!.trim());

    // `⬆` e `⇥` são o que torna o monta monta usável sem precisão de polegar.
    expect(rotulos).toContain('⬆');
    expect(rotulos).toContain('⇥');
    expect(rotulos).toContain('⇄');
    expect(rotulos).toContain('⌫');
  });

  /**
   * A régua do «nada muito já feito», como teste.
   *
   * A bandeja não pode ganhar uma peça que resolva um passo — «divida os dois
   * lados por 2» e parentes. Toda peça é átomo, ou é a estrutura vazia que o
   * aluno vai preencher. `▢x` é a única abreviação, e ela não decide nada:
   * continua pedindo o coeficiente.
   */
  it('nenhuma peça resolve um passo pelo aluno', async () => {
    const { fixture } = await montar();
    const permitidas = new Set([
      ...'0123456789'.split(''),
      ',',
      '±',
      'x',
      '+',
      '−',
      '×',
      '÷',
      '=',
      '▭/▭',
      '▢x',
      '⬆',
      '⇥',
      '⇄',
      '⌫',
    ]);

    for (const tecla of teclas(fixture)) {
      expect(permitidas.has(tecla.textContent!.trim())).toBe(true);
    }
  });

  it('não há peça de parêntese: o desenho tira isso da precedência', async () => {
    const { fixture } = await montar();
    const rotulos = teclas(fixture).map((tecla) => tecla.textContent!.trim());

    expect(rotulos).not.toContain('(');
    expect(rotulos).not.toContain(')');
  });

  it('tocar numa tecla avisa a ação dela', async () => {
    const { fixture, acoes } = await montar();

    porRotulo(fixture, '7').click();
    porRotulo(fixture, '+').click();
    porRotulo(fixture, '▭/▭').click();
    porRotulo(fixture, '▢x').click();
    porRotulo(fixture, '⌫').click();
    porRotulo(fixture, '⬆').click();
    porRotulo(fixture, '⇥').click();
    porRotulo(fixture, '⇄').click();

    expect(acoes).toEqual([
      { tipo: 'peca', peca: { tipo: 'algarismo', valor: '7' } },
      { tipo: 'peca', peca: { tipo: 'operacao', operador: '+' } },
      { tipo: 'peca', peca: { tipo: 'fracao' } },
      { tipo: 'peca', peca: { tipo: 'coeficiente' } },
      { tipo: 'apagar' },
      { tipo: 'subir' },
      { tipo: 'proximo' },
      { tipo: 'virar' },
    ]);
  });

  it('cada tecla tem rótulo falado, porque o símbolo sozinho não se lê', async () => {
    const { fixture } = await montar();

    for (const tecla of teclas(fixture)) {
      const rotulo = tecla.getAttribute('aria-label');

      expect(rotulo).toBeTruthy();
      // Chave de tradução que não existe voltaria como a própria chave.
      expect(rotulo!.startsWith('rascunho.')).toBe(false);
    }
  });

  it('não existe campo de digitação na bandeja', async () => {
    const { fixture } = await montar();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('input, textarea').length).toBe(
      0,
    );
  });
});
