import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { paraTexto } from '@core/rascunho/models/peca/peca';
import { RascunhoAberturaService } from '@core/rascunho/services/rascunho-abertura.service';
import { RascunhoService } from '@core/rascunho/services/rascunho.service';
import { Rascunho } from '@shared/components/rascunho/rascunho';

async function montar(): Promise<{
  fixture: ComponentFixture<Rascunho>;
  rascunho: RascunhoService;
  abertura: RascunhoAberturaService;
}> {
  localStorage.clear();
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      { provide: Router, useValue: { url: '/algebra/inequacoes', events: new Subject() } },
    ],
  });

  const fixture = TestBed.createComponent(Rascunho);
  const rascunho = TestBed.inject(RascunhoService);
  const abertura = TestBed.inject(RascunhoAberturaService);

  abertura.alternar();
  await fixture.whenStable();

  return { fixture, rascunho, abertura };
}

function html(fixture: ComponentFixture<Rascunho>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

function tecla(fixture: ComponentFixture<Rascunho>, rotulo: string): HTMLButtonElement {
  const botoes = Array.from(
    html(fixture).querySelectorAll<HTMLButtonElement>('app-rascunho-bandeja button'),
  );
  const achada = botoes.find((botao) => botao.textContent!.trim() === rotulo);

  if (achada === undefined) {
    throw new Error(`não há tecla «${rotulo}»`);
  }

  return achada;
}

describe('Rascunho', () => {
  it('fechado, não desenha nada', async () => {
    const { fixture, abertura } = await montar();

    abertura.fechar();
    await fixture.whenStable();

    expect(html(fixture).querySelector('.gaveta')).toBeNull();
  });

  it('aberto, traz o tabuleiro e a bandeja', async () => {
    const { fixture } = await montar();

    expect(html(fixture).querySelector('.gaveta')).not.toBeNull();
    expect(html(fixture).querySelector('app-rascunho-tabuleiro')).not.toBeNull();
    expect(html(fixture).querySelector('app-rascunho-bandeja')).not.toBeNull();
  });

  it('tocar na bandeja monta a conta', async () => {
    const { fixture, rascunho } = await montar();

    tecla(fixture, '2').click();
    tecla(fixture, 'x').click();
    await fixture.whenStable();

    expect(paraTexto(rascunho.montagem().arvore)).toBe('2x');
    expect(html(fixture).textContent).toContain('2');
  });

  it('as teclas de navegação chegam ao serviço', async () => {
    const { fixture, rascunho } = await montar();

    tecla(fixture, '+').click();
    await fixture.whenStable();
    expect(rascunho.montagem().selecao).toEqual([0]);

    tecla(fixture, '⇥').click();
    await fixture.whenStable();
    expect(rascunho.montagem().selecao).toEqual([1]);

    tecla(fixture, '⬆').click();
    await fixture.whenStable();
    expect(rascunho.montagem().selecao).toEqual([]);
  });

  it('apagar e virar os lados também', async () => {
    const { fixture, rascunho } = await montar();

    tecla(fixture, '5').click();
    tecla(fixture, '−').click();
    tecla(fixture, '2').click();
    await fixture.whenStable();

    tecla(fixture, '⬆').click();
    tecla(fixture, '⇄').click();
    await fixture.whenStable();
    expect(paraTexto(rascunho.montagem().arvore)).toBe('2 - 5');

    tecla(fixture, '⌫').click();
    await fixture.whenStable();
    expect(rascunho.montagem().arvore.tipo).toBe('buraco');
  });

  it('a pilha mostra uma linha por passo, e a cópia começa igual à de cima', async () => {
    const { fixture, rascunho } = await montar();

    tecla(fixture, '9').click();
    await fixture.whenStable();

    rascunho.copiarLinha();
    await fixture.whenStable();

    expect(html(fixture).querySelectorAll('.linha').length).toBe(2);
    expect(html(fixture).querySelectorAll('app-rascunho-tabuleiro').length).toBe(2);
    expect(paraTexto(rascunho.montagem().arvore)).toBe('9');
  });

  it('só a linha em edição mostra a seleção', async () => {
    const { fixture, rascunho } = await montar();

    tecla(fixture, '1').click();
    await fixture.whenStable();
    rascunho.copiarLinha();
    await fixture.whenStable();

    const atuais = html(fixture).querySelectorAll('.linha.atual');
    expect(atuais.length).toBe(1);
  });

  it('o recado de recusa aparece, e «sem efeito» não vira ruído', async () => {
    const { fixture } = await montar();

    // Dois iguais na mesma linha: recusa com motivo.
    tecla(fixture, '=').click();
    tecla(fixture, '⬆').click();
    tecla(fixture, '=').click();
    await fixture.whenStable();
    expect(html(fixture).querySelector('.aviso')).not.toBeNull();

    // Apagar um buraco é «sem efeito»: tentativa, não erro.
    tecla(fixture, '⌫').click();
    tecla(fixture, '⌫').click();
    await fixture.whenStable();
    expect(html(fixture).querySelector('.aviso')).toBeNull();
  });

  it('tem o recado de virar o aparelho, para a paisagem', async () => {
    const { fixture } = await montar();

    expect(html(fixture).querySelector('.deitado')).not.toBeNull();
  });

  it('não existe campo de digitação na gaveta inteira', async () => {
    const { fixture } = await montar();

    expect(html(fixture).querySelectorAll('input, textarea, [contenteditable]').length).toBe(0);
  });

  /**
   * O rascunho não tem atalho para o campo de resposta.
   *
   * Não é detalhe de interface: é a fronteira entre um rascunho e uma
   * calculadora. A conta é do aluno, e levá-la daqui para a resposta também.
   */
  it('nada aqui escreve no campo de resposta', async () => {
    const { fixture } = await montar();
    const textos = Array.from(html(fixture).querySelectorAll('button')).map((botao) =>
      (botao.getAttribute('aria-label') ?? '').toLowerCase(),
    );

    expect(textos.some((texto) => texto.includes('resposta'))).toBe(false);
  });
});
