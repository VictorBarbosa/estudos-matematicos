import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { RascunhoAberturaService } from '@core/rascunho/services/rascunho-abertura.service';

describe('RascunhoAberturaService', () => {
  let abertura: RascunhoAberturaService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    abertura = TestBed.inject(RascunhoAberturaService);
  });

  it('começa fechada', () => {
    expect(abertura.aberto()).toBe(false);
  });

  it('abre, fecha e volta a abrir', () => {
    abertura.alternar();
    expect(abertura.aberto()).toBe(true);

    abertura.alternar();
    expect(abertura.aberto()).toBe(false);

    abertura.alternar();
    abertura.fechar();
    expect(abertura.aberto()).toBe(false);
  });
});
