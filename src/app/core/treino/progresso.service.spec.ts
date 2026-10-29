import { ProgressoService } from './progresso.service';

describe('ProgressoService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('começa vazio', () => {
    const progresso = new ProgressoService();

    expect(progresso.totalRespondido()).toBe(0);
    expect(progresso.aproveitamentoDe('fracoes')).toBeNull();
    expect(progresso.conceitosParaRevisar()).toEqual([]);
  });

  it('acumula acertos e erros por tópico', () => {
    const progresso = new ProgressoService();

    progresso.registrar({ topicoId: 'fracoes', conceitos: [], acertou: true, sequencia: 1, nivel: 'facil' });
    progresso.registrar({ topicoId: 'fracoes', conceitos: [], acertou: true, sequencia: 2, nivel: 'facil' });
    progresso.registrar({ topicoId: 'fracoes', conceitos: [], acertou: false, sequencia: 0, nivel: 'facil' });

    const estatistica = progresso.estatisticaDe('fracoes');
    expect(estatistica.acertos).toBe(2);
    expect(estatistica.erros).toBe(1);
    expect(estatistica.melhorSequencia).toBe(2);
    expect(progresso.aproveitamentoDe('fracoes')).toBeCloseTo(2 / 3);
  });

  it('mantém tópicos separados', () => {
    const progresso = new ProgressoService();

    progresso.registrar({ topicoId: 'fracoes', conceitos: [], acertou: true, sequencia: 1, nivel: 'facil' });
    progresso.registrar({ topicoId: 'mmc-mdc', conceitos: [], acertou: false, sequencia: 0, nivel: 'facil' });

    expect(progresso.estatisticaDe('fracoes').acertos).toBe(1);
    expect(progresso.estatisticaDe('mmc-mdc').erros).toBe(1);
    expect(progresso.topicosPraticados()).toBe(2);
  });

  it('aponta os conceitos com mais erros, do pior para o melhor', () => {
    const progresso = new ProgressoService();

    for (let i = 0; i < 3; i++) {
      progresso.registrar({
        topicoId: 'fracoes',
        conceitos: ['fracoes.mmc'],
        acertou: false,
        sequencia: 0,
        nivel: 'facil',
      });
    }
    progresso.registrar({
      topicoId: 'fracoes',
      conceitos: ['fracoes.operacoes'],
      acertou: false,
      sequencia: 0,
      nivel: 'facil',
    });
    progresso.registrar({
      topicoId: 'fracoes',
      conceitos: ['fracoes.simplificacao'],
      acertou: true,
      sequencia: 1,
      nivel: 'facil',
    });

    const revisar = progresso.conceitosParaRevisar();

    expect(revisar.map((c) => c.id)).toEqual(['fracoes.mmc', 'fracoes.operacoes']);
    expect(revisar[0]?.erros).toBe(3);
    // Conceitos sem nenhum erro não entram na lista de revisão.
    expect(revisar.some((c) => c.id === 'fracoes.simplificacao')).toBe(false);
  });

  it('persiste entre instâncias', () => {
    const primeira = new ProgressoService();
    primeira.registrar({
      topicoId: 'fracoes',
      conceitos: ['fracoes.mmc'],
      acertou: true,
      sequencia: 4,
      nivel: 'facil',
    });

    const segunda = new ProgressoService();
    expect(segunda.estatisticaDe('fracoes').acertos).toBe(1);
    expect(segunda.estatisticaDe('fracoes').melhorSequencia).toBe(4);
  });

  it('descarta dados gravados em versão desconhecida', () => {
    localStorage.setItem(
      'estudos-matematicos.progresso.v1',
      JSON.stringify({ versao: 99, topicos: { fracoes: { acertos: 10, erros: 0 } } }),
    );

    expect(new ProgressoService().totalRespondido()).toBe(0);
  });

  it('ignora conteúdo corrompido em vez de quebrar', () => {
    localStorage.setItem('estudos-matematicos.progresso.v1', 'isto não é JSON');

    expect(() => new ProgressoService()).not.toThrow();
    expect(new ProgressoService().totalRespondido()).toBe(0);
  });

  it('continua funcionando quando o armazenamento não está disponível', () => {
    const negar = (): never => {
      throw new Error('acesso negado');
    };
    const leitura = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(negar);
    const escrita = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(negar);

    try {
      const progresso = new ProgressoService();
      progresso.registrar({
        topicoId: 'fracoes',
        conceitos: [],
        acertou: true,
        sequencia: 1,
        nivel: 'facil',
      });

      // O treino segue válido na sessão, apenas não é lembrado depois.
      expect(progresso.estatisticaDe('fracoes').acertos).toBe(1);
    } finally {
      leitura.mockRestore();
      escrita.mockRestore();
    }
  });

  it('limpa o progresso quando pedido', () => {
    const progresso = new ProgressoService();
    progresso.registrar({ topicoId: 'fracoes', conceitos: [], acertou: true, sequencia: 1, nivel: 'facil' });

    progresso.limpar();

    expect(progresso.totalRespondido()).toBe(0);
    expect(localStorage.getItem('estudos-matematicos.progresso.v1')).toBeNull();
  });
});
