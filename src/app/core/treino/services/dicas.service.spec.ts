import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DicasService } from '@core/treino/services/dicas.service';

/**
 * A escolha de ver ou não a dica.
 *
 * O que este guarda protege é o padrão: a dica começa LIGADA. Quem nunca viu o
 * site não sabe que ela existe, e abrir o primeiro exercício sem a linha de
 * apoio é perder a ajuda justamente para quem ela foi escrita.
 */
describe('DicasService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  it('começa ligada', () => {
    expect(TestBed.inject(DicasService).visiveis()).toBe(true);
  });

  it('alternar desliga e liga de novo', () => {
    const dicas = TestBed.inject(DicasService);

    dicas.alternar();
    expect(dicas.visiveis()).toBe(false);

    dicas.alternar();
    expect(dicas.visiveis()).toBe(true);
  });

  it('o desligamento sobrevive ao recarregamento', () => {
    TestBed.inject(DicasService).definir(false);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

    expect(TestBed.inject(DicasService).visiveis()).toBe(false);
  });

  it('armazenamento estragado não esconde a dica', () => {
    localStorage.setItem('estudos-matematicos.dicas-visiveis.v1', 'talvez');

    expect(TestBed.inject(DicasService).visiveis()).toBe(true);
  });
});
