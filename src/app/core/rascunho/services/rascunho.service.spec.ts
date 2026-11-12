import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { paraTexto } from '@core/rascunho/models/peca/peca';
import { chaveDaUrl, RascunhoService } from '@core/rascunho/services/rascunho.service';

const CHAVE = 'estudos-matematicos.rascunho.v1';

/** Um roteador de mentira: só o endereço e os eventos de navegação. */
function fingirRota(url: string): { eventos: Subject<unknown>; rascunho: RascunhoService } {
  const eventos = new Subject<unknown>();

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      { provide: Router, useValue: { url, events: eventos.asObservable() } },
    ],
  });

  return { eventos, rascunho: TestBed.inject(RascunhoService) };
}

function navegar(eventos: Subject<unknown>, url: string): void {
  eventos.next(new NavigationEnd(1, url, url));
}

describe('RascunhoService', () => {
  beforeEach(() => localStorage.clear());

  it('começa vazio', () => {
    const { rascunho } = fingirRota('/algebra/inequacoes');

    expect(rascunho.vazio()).toBe(true);
    expect(rascunho.linhas().linhas.length).toBe(1);
  });

  it('monta uma conta peça por peça', () => {
    const { rascunho } = fingirRota('/frac');

    rascunho.tocarPeca({ tipo: 'algarismo', valor: '2' });
    rascunho.tocarPeca({ tipo: 'incognita' });

    expect(paraTexto(rascunho.montagem().arvore)).toBe('2x');
    expect(rascunho.vazio()).toBe(false);
  });

  it('a recusa fica à mão da tela', () => {
    const { rascunho } = fingirRota('/frac');

    rascunho.tocarPeca({ tipo: 'igualdade' });
    rascunho.tocarPeca({ tipo: 'igualdade' });

    expect(rascunho.recusa()).toBe('igualdade-repetida');
  });

  describe('o tópico vem da URL', () => {
    it('cada tópico tem o seu rascunho, e eles não se misturam', () => {
      const { eventos, rascunho } = fingirRota('/algebra/inequacoes');

      rascunho.tocarPeca({ tipo: 'algarismo', valor: '7' });
      expect(paraTexto(rascunho.montagem().arvore)).toBe('7');

      navegar(eventos, '/calculo-1/limites');
      expect(rascunho.topico()).toBe('calculo-1/limites');
      expect(rascunho.vazio()).toBe(true);

      // Voltando, o rascunho do primeiro tópico continua lá.
      navegar(eventos, '/algebra/inequacoes');
      expect(paraTexto(rascunho.montagem().arvore)).toBe('7');
    });

    it('os parâmetros não fazem um tópico diferente', () => {
      expect(chaveDaUrl('/algebra/inequacoes?nivel=medio')).toBe('algebra/inequacoes');
      expect(chaveDaUrl('/algebra/inequacoes#teoria')).toBe('algebra/inequacoes');
      expect(chaveDaUrl('/')).toBe('geral');
      expect(chaveDaUrl('')).toBe('geral');
    });
  });

  describe('persistência', () => {
    it('o que foi montado volta na sessão seguinte', () => {
      const primeira = fingirRota('/frac');
      primeira.rascunho.tocarPeca({ tipo: 'algarismo', valor: '4' });
      primeira.rascunho.tocarPeca({ tipo: 'algarismo', valor: '2' });
      TestBed.tick();

      const segunda = fingirRota('/frac');

      expect(paraTexto(segunda.rascunho.montagem().arvore)).toBe('42');
    });

    it('limpar joga fora o rascunho deste tópico', () => {
      const { rascunho } = fingirRota('/frac');

      rascunho.tocarPeca({ tipo: 'algarismo', valor: '5' });
      rascunho.limpar();

      expect(rascunho.vazio()).toBe(true);
      expect(rascunho.recusa()).toBeNull();
    });

    it('lixo no armazenamento não derruba nada', () => {
      localStorage.setItem(CHAVE, 'isto não é JSON');

      const { rascunho } = fingirRota('/frac');

      expect(rascunho.vazio()).toBe(true);
    });

    it('janela privada: o rascunho vale só para esta sessão', () => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        throw new Error('sem armazenamento');
      };

      try {
        const { rascunho } = fingirRota('/frac');
        rascunho.tocarPeca({ tipo: 'algarismo', valor: '3' });
        TestBed.tick();

        // A conta continua de pé; só o disco ficou para trás.
        expect(paraTexto(rascunho.montagem().arvore)).toBe('3');
      } finally {
        Storage.prototype.setItem = original;
      }
    });
  });

  describe('a pilha de linhas', () => {
    it('linha nova, cópia da anterior e escolha de linha', () => {
      const { rascunho } = fingirRota('/frac');

      rascunho.tocarPeca({ tipo: 'algarismo', valor: '9' });
      rascunho.copiarLinha();

      expect(rascunho.linhas().linhas.length).toBe(2);
      expect(paraTexto(rascunho.montagem().arvore)).toBe('9');

      rascunho.linhaNova();
      expect(rascunho.linhas().atual).toBe(2);

      rascunho.escolher(0);
      expect(rascunho.linhas().atual).toBe(0);

      rascunho.remover(2);
      expect(rascunho.linhas().linhas.length).toBe(2);
    });

    it('editar a linha copiada não mexe na de cima', () => {
      const { rascunho } = fingirRota('/frac');

      rascunho.tocarPeca({ tipo: 'algarismo', valor: '6' });
      rascunho.copiarLinha();
      rascunho.apagarPeca();

      expect(paraTexto(rascunho.linhas().linhas[0]!.arvore)).toBe('6');
      expect(rascunho.linhas().linhas[1]!.arvore.tipo).toBe('buraco');
    });
  });

  it('as teclas de navegação andam na árvore', () => {
    const { rascunho } = fingirRota('/frac');

    rascunho.tocarPeca({ tipo: 'operacao', operador: '+' });
    expect(rascunho.montagem().selecao).toEqual([0]);

    rascunho.irAoProximo();
    expect(rascunho.montagem().selecao).toEqual([1]);

    rascunho.subir();
    expect(rascunho.montagem().selecao).toEqual([]);

    rascunho.escolherPeca([0]);
    expect(rascunho.montagem().selecao).toEqual([0]);
  });

  it('virar os lados troca a operação de mão', () => {
    const { rascunho } = fingirRota('/frac');

    rascunho.tocarPeca({ tipo: 'algarismo', valor: '5' });
    rascunho.tocarPeca({ tipo: 'operacao', operador: '-' });
    rascunho.tocarPeca({ tipo: 'algarismo', valor: '2' });
    rascunho.subir();
    rascunho.virar();

    expect(paraTexto(rascunho.montagem().arvore)).toBe('2 - 5');
  });
});
