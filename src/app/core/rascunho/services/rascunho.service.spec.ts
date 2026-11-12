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

  describe('a lixeira de um slot', () => {
    /**
     * O acidente de dois toques: o sinal `=` seleciona a raiz, e o `⌫` logo
     * depois leva a linha inteira. Sem volta, vinte linhas de conta iam embora.
     */
    it('apagar com a raiz selecionada tem volta', () => {
      const { rascunho } = fingirRota('/frac');

      rascunho.tocarPeca({ tipo: 'algarismo', valor: '2' });
      rascunho.tocarPeca({ tipo: 'incognita' });
      rascunho.escolherPeca([]);
      expect(rascunho.podeDesfazer()).toBe(false);

      rascunho.apagarPeca();
      expect(rascunho.montagem().arvore.tipo).toBe('buraco');
      expect(rascunho.podeDesfazer()).toBe(true);

      rascunho.desfazer();
      expect(paraTexto(rascunho.montagem().arvore)).toBe('2x');
      expect(rascunho.podeDesfazer()).toBe(false);
    });

    it('apagar uma peça comum não enche a lixeira: é um toque de volta', () => {
      const { rascunho } = fingirRota('/frac');

      rascunho.tocarPeca({ tipo: 'operacao', operador: '+' });
      rascunho.tocarPeca({ tipo: 'algarismo', valor: '5' });
      rascunho.apagarPeca();

      expect(rascunho.podeDesfazer()).toBe(false);
    });

    it('o cesto tem volta', () => {
      const { rascunho } = fingirRota('/frac');

      rascunho.tocarPeca({ tipo: 'algarismo', valor: '8' });
      rascunho.limpar();
      expect(rascunho.vazio()).toBe(true);

      rascunho.desfazer();
      expect(paraTexto(rascunho.montagem().arvore)).toBe('8');
    });

    it('tirar uma linha tem volta', () => {
      const { rascunho } = fingirRota('/frac');

      rascunho.tocarPeca({ tipo: 'algarismo', valor: '1' });
      rascunho.copiarLinha();
      rascunho.remover(1);
      expect(rascunho.linhas().linhas.length).toBe(1);

      rascunho.desfazer();
      expect(rascunho.linhas().linhas.length).toBe(2);
    });

    /**
     * A lixeira cobre só o arrependimento imediato.
     *
     * Se ela durasse, o botão desfaria algo mais antigo do que o aluno espera —
     * e levaria embora o que ele montou depois.
     */
    it('qualquer alteração depois esvazia a lixeira', () => {
      const { rascunho } = fingirRota('/frac');

      rascunho.tocarPeca({ tipo: 'algarismo', valor: '3' });
      rascunho.limpar();
      expect(rascunho.podeDesfazer()).toBe(true);

      rascunho.tocarPeca({ tipo: 'algarismo', valor: '9' });
      expect(rascunho.podeDesfazer()).toBe(false);
    });

    it('desfazer sem nada na lixeira não faz nada', () => {
      const { rascunho } = fingirRota('/frac');

      rascunho.tocarPeca({ tipo: 'algarismo', valor: '4' });
      rascunho.desfazer();

      expect(paraTexto(rascunho.montagem().arvore)).toBe('4');
    });
  });

  /**
   * A seleção nunca aponta para um nó que não existe.
   *
   * Trocar de tópico muda `linhas()` na hora, e o efeito que recomeça a seleção
   * roda depois: havia uma janela de um quadro em que a árvore nova convivia
   * com o caminho antigo. Saneado no `computed`, o invariante não depende mais
   * de ordem de execução.
   */
  it('a seleção é saneada contra a árvore em edição', () => {
    const { eventos, rascunho } = fingirRota('/a');

    rascunho.tocarPeca({ tipo: 'operacao', operador: '+' });
    rascunho.escolherPeca([1]);
    expect(rascunho.montagem().selecao).toEqual([1]);

    navegar(eventos, '/b');

    // No tópico novo a linha é um buraco só: o caminho [1] não existe nela.
    expect(rascunho.montagem().selecao).toEqual([]);
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
