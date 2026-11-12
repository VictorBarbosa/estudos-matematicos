import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Arvore, Caminho } from '@core/rascunho/models/peca/peca';
import { RascunhoTabuleiro } from '@shared/components/rascunho-tabuleiro/rascunho-tabuleiro';

const num = (algarismos: string): Arvore => ({ tipo: 'numero', algarismos, negativo: false });
const x: Arvore = { tipo: 'incognita' };
const BURACO: Arvore = { tipo: 'buraco' };

async function montar(
  arvore: Arvore,
  selecao: Caminho | null = null,
): Promise<{ fixture: ComponentFixture<RascunhoTabuleiro>; escolhidos: Caminho[] }> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

  const fixture = TestBed.createComponent(RascunhoTabuleiro);
  fixture.componentRef.setInput('arvore', arvore);
  fixture.componentRef.setInput('selecao', selecao);

  const escolhidos: Caminho[] = [];
  fixture.componentInstance.escolher.subscribe((caminho) => escolhidos.push(caminho));

  await fixture.whenStable();

  return { fixture, escolhidos };
}

function texto(fixture: ComponentFixture<RascunhoTabuleiro>): string {
  return (fixture.nativeElement as HTMLElement).textContent!.replace(/\s+/g, ' ').trim();
}

function botoes(fixture: ComponentFixture<RascunhoTabuleiro>): HTMLButtonElement[] {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
}

describe('RascunhoTabuleiro', () => {
  it('desenha a conta inteira, descendo pela árvore', async () => {
    const equacao: Arvore = {
      tipo: 'igualdade',
      esquerda: {
        tipo: 'operacao',
        operador: '+',
        esquerda: { tipo: 'operacao', operador: '*', esquerda: num('2'), direita: x },
        direita: num('3'),
      },
      direita: num('11'),
    };

    const { fixture } = await montar(equacao);

    expect(texto(fixture)).toBe('2 x + 3 = 11');
  });

  it('a fração empilha numerador e denominador, com a barra entre eles', async () => {
    const { fixture } = await montar({
      tipo: 'fracao',
      numerador: num('1'),
      denominador: num('2'),
    });
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelectorAll('.andar').length).toBe(2);
    expect(elemento.querySelector('.barra')).not.toBeNull();
  });

  it('o produto de número por incógnita não desenha sinal', async () => {
    const { fixture } = await montar({
      tipo: 'operacao',
      operador: '*',
      esquerda: num('2'),
      direita: x,
    });

    expect(texto(fixture)).toBe('2 x');
    expect((fixture.nativeElement as HTMLElement).querySelector('.sinal')).toBeNull();
  });

  it('o parêntese aparece quando a precedência pede', async () => {
    const { fixture } = await montar({
      tipo: 'operacao',
      operador: '*',
      esquerda: { tipo: 'operacao', operador: '+', esquerda: num('1'), direita: num('2') },
      direita: num('3'),
    });

    expect(texto(fixture)).toContain('(');
    expect(texto(fixture)).toContain(')');
  });

  it('tocar numa peça avisa o caminho dela', async () => {
    const { fixture, escolhidos } = await montar({
      tipo: 'operacao',
      operador: '+',
      esquerda: num('5'),
      direita: BURACO,
    });

    const alvos = botoes(fixture);
    // Ordem de leitura: o número, o sinal da operação, o buraco.
    alvos[0]!.click();
    alvos[1]!.click();
    alvos[2]!.click();

    expect(escolhidos).toEqual([[0], [], [1]]);
  });

  it('a peça selecionada se destaca, e só ela', async () => {
    const { fixture } = await montar(
      { tipo: 'operacao', operador: '+', esquerda: num('5'), direita: BURACO },
      [1],
    );

    const destacadas = (fixture.nativeElement as HTMLElement).querySelectorAll('.escolhida');

    expect(destacadas.length).toBe(1);
    expect(destacadas[0]!.classList.contains('buraco')).toBe(true);
  });

  /**
   * Sem `<input>` não há como o teclado do sistema aparecer.
   *
   * Era o risco que mais pesava quando o plano ainda tinha um teclado:
   * `inputmode="none"` é instável no Safari do iOS, e um teclado subindo
   * cobriria justamente a conta. Com peças tocáveis o problema deixa de
   * existir, e este teste é o que impede alguém de reintroduzi-lo.
   */
  it('não existe campo de digitação no tabuleiro', async () => {
    const { fixture } = await montar({ tipo: 'fracao', numerador: num('1'), denominador: BURACO });
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelectorAll('input, textarea, [contenteditable]').length).toBe(0);
  });

  it('cada peça tem rótulo falado, com o papel e o conteúdo', async () => {
    const { fixture } = await montar({ tipo: 'fracao', numerador: num('7'), denominador: BURACO });

    const rotulos = botoes(fixture).map((botao) => botao.getAttribute('aria-label'));

    expect(rotulos).toContain('Número: 7');
    expect(rotulos).toContain('Buraco: buraco vazio');
    expect(rotulos.some((rotulo) => rotulo!.startsWith('Fração:'))).toBe(true);
  });
});
