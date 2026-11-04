import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FolhaService } from '@core/folha/services/folha.service';

const ponto = (x: number, y: number, pressao = 0.5) => ({ x, y, pressao });

describe('FolhaService', () => {
  let folha: FolhaService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    folha = TestBed.inject(FolhaService);
  });

  it('começa fechada, vazia e com o lápis na mão', () => {
    expect(folha.aberta()).toBe(false);
    expect(folha.vazia()).toBe(true);
    expect(folha.tracos()).toEqual([]);
    expect(folha.ferramenta()).toBe('lapis');
  });

  it('abre e fecha', () => {
    folha.alternar();
    expect(folha.aberta()).toBe(true);

    folha.fechar();
    expect(folha.aberta()).toBe(false);
  });

  it('um traço cresce ponto a ponto', () => {
    folha.comecarTraco(ponto(1, 1));
    folha.estenderTraco(ponto(2, 2));
    folha.estenderTraco(ponto(3, 3));

    expect(folha.tracos().length).toBe(1);
    expect(folha.tracos()[0]!.pontos.length).toBe(3);
    expect(folha.vazia()).toBe(false);
  });

  it('cada apoiar da caneta começa um traço novo', () => {
    folha.comecarTraco(ponto(1, 1));
    folha.estenderTraco(ponto(2, 2));
    folha.comecarTraco(ponto(9, 9));

    expect(folha.tracos().length).toBe(2);
    expect(folha.tracos()[1]!.pontos).toEqual([ponto(9, 9)]);
  });

  it('estender sem traço aberto não inventa traço', () => {
    folha.estenderTraco(ponto(1, 1));
    expect(folha.tracos()).toEqual([]);
  });

  it('o traço nasce com a ferramenta da vez', () => {
    folha.comecarTraco(ponto(1, 1));
    expect(folha.tracos()[0]!.apaga).toBe(false);

    folha.definirFerramenta('borracha');
    folha.comecarTraco(ponto(2, 2));
    expect(folha.tracos()[1]!.apaga).toBe(true);
  });

  it('desfazer tira o último traço, e não o primeiro', () => {
    folha.comecarTraco(ponto(1, 1));
    folha.comecarTraco(ponto(2, 2));
    folha.desfazer();

    expect(folha.tracos().length).toBe(1);
    expect(folha.tracos()[0]!.pontos).toEqual([ponto(1, 1)]);
  });

  it('desfazer na folha vazia não quebra', () => {
    expect(() => folha.desfazer()).not.toThrow();
    expect(folha.tracos()).toEqual([]);
  });

  it('limpar apaga tudo', () => {
    folha.comecarTraco(ponto(1, 1));
    folha.comecarTraco(ponto(2, 2));
    folha.limpar();

    expect(folha.vazia()).toBe(true);
  });

  it('a janela aberta e a posição sobrevivem a uma aba nova', () => {
    folha.alternar();
    folha.definirPosicao({ x: 120, y: 340 });
    // O efeito que grava só roda na próxima varredura.
    TestBed.tick();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const outra = TestBed.inject(FolhaService);

    expect(outra.aberta()).toBe(true);
    expect(outra.posicao()).toEqual({ x: 120, y: 340 });
  });

  it('o rascunho NÃO é guardado entre sessões', () => {
    // Um rascunho de uma página são milhares de pontos, e rascunho é por
    // definição descartável: guardá-lo faria o armazenamento crescer sem teto.
    folha.comecarTraco(ponto(1, 1));
    folha.estenderTraco(ponto(2, 2));
    TestBed.tick();

    const guardado = localStorage.getItem('estudos-matematicos.folha.v1') ?? '';
    expect(guardado).not.toContain('pontos');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    expect(TestBed.inject(FolhaService).vazia()).toBe(true);
  });

  it('posição corrompida no armazenamento volta ao padrão', () => {
    localStorage.setItem('estudos-matematicos.folha.v1', '{"aberta":true,"posicao":"ali"}');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const outra = TestBed.inject(FolhaService);

    expect(outra.aberta()).toBe(true);
    expect(outra.posicao()).toBeNull();
  });
});
