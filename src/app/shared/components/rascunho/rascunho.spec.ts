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

    // Entre um toque e outro é preciso redesenhar: o estado das teclas
    // acompanha a seleção, e `⇄` só pode agir depois que `⬆` chega à raiz.
    tecla(fixture, '⬆').click();
    await fixture.whenStable();
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

  it('a tecla que não cabe fica apagada, e tocada explica por quê', async () => {
    const { fixture } = await montar();

    tecla(fixture, '=').click();
    await fixture.whenStable();

    // Segunda igualdade: apagada, mas tocável — é tocando que vem o motivo.
    const igual = tecla(fixture, '=');
    expect(igual.disabled).toBe(false);
    expect(igual.classList.contains('nao-cabe')).toBe(true);

    igual.click();
    await fixture.whenStable();
    expect(html(fixture).querySelector('.aviso')).not.toBeNull();

    // O recado sai de cena quando o aluno volta a montar.
    tecla(fixture, '1').click();
    await fixture.whenStable();
    expect(html(fixture).querySelector('.aviso')).toBeNull();
  });

  it('a tecla muda nem responde, e não vira recado', async () => {
    const { fixture } = await montar();

    // Apagar sem nada a apagar: tentativa, não erro.
    expect(tecla(fixture, '⌫').disabled).toBe(true);
    // `±` só age sobre número; `⇄` só sobre operação ou fração.
    expect(tecla(fixture, '±').disabled).toBe(true);
    expect(tecla(fixture, '⇄').disabled).toBe(true);

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
