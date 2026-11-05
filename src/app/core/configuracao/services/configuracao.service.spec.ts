import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { CONFIGURACAO_PADRAO } from '@core/configuracao/models/configuracao.model';
import { ConfiguracaoService } from '@core/configuracao/services/configuracao.service';
import { ProgressaoService } from '@core/progressao/services/progressao.service';
import { ProgressoService } from '@core/treino/services/progresso.service';

describe('ConfiguracaoService', () => {
  function criar(): ConfiguracaoService {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    return TestBed.inject(ConfiguracaoService);
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('começa de fábrica', () => {
    const config = criar();

    expect(config.configuracao()).toEqual(CONFIGURACAO_PADRAO);
    expect(config.intocada()).toBe(true);
  });

  it('o que foi ajustado sobrevive a uma aba nova', () => {
    const config = criar();
    config.definir(['prova', 'errosTolerados'], 4);
    TestBed.tick();

    TestBed.resetTestingModule();
    const outra = criar();

    expect(outra.prova().errosTolerados).toBe(4);
    expect(outra.intocada()).toBe(false);
  });

  it('redefinir devolve tudo ao de fábrica', () => {
    const config = criar();
    config.definir(['etapa', 'respostasNaJanela'], 20);
    config.definir(['escada', 'errosParaDescer'], 5);
    config.redefinir();

    expect(config.configuracao()).toEqual(CONFIGURACAO_PADRAO);
    expect(config.intocada()).toBe(true);
  });
});

describe('a configuração manda na progressão', () => {
  /** Uma tentativa certa no nível pedido. */
  const certa = (nivel: 'facil' | 'medio' | 'dificil') => ({ nivel, acertou: true });

  function montar(): {
    config: ConfiguracaoService;
    progresso: ProgressoService;
    progressao: ProgressaoService;
  } {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

    return {
      config: TestBed.inject(ConfiguracaoService),
      progresso: TestBed.inject(ProgressoService),
      progressao: TestBed.inject(ProgressaoService),
    };
  }

  it('baixar a exigência abre a etapa sem responder mais nada', () => {
    const { config, progresso, progressao } = montar();

    // Quatro acertos no Médio: pouco para o critério de fábrica (8 em 10).
    for (let i = 0; i < 4; i++) {
      progresso.registrar({
        topicoId: 'operacoes-fundamentais',
        conceitos: [],
        acertou: true,
        sequencia: i + 1,
        nivel: 'medio',
      });
    }
    expect(progressao.estaConcluida('operacoes-fundamentais')).toBe(false);

    config.definir(['etapa', 'respostasNaJanela'], 4);
    config.definir(['etapa', 'acertosNaJanela'], 4);

    expect(progressao.estaConcluida('operacoes-fundamentais')).toBe(true);
  });

  it('subir a exigência fecha uma etapa que estava aberta', () => {
    const { config, progresso, progressao } = montar();

    for (let i = 0; i < 10; i++) {
      progresso.registrar({
        topicoId: 'operacoes-fundamentais',
        conceitos: [],
        acertou: true,
        sequencia: i + 1,
        nivel: i < 3 ? 'facil' : 'dificil',
      });
    }
    expect(progressao.estaConcluida('operacoes-fundamentais')).toBe(true);

    config.definir(['etapa', 'respostasNaJanela'], 20);

    // Agora a janela pede 20 respostas, e só há 10.
    expect(progressao.estaConcluida('operacoes-fundamentais')).toBe(false);
    expect(certa('medio').acertou).toBe(true);
  });

  it('a lista do que falta mostra os alvos ajustados, e não os de fábrica', () => {
    const { config, progressao } = montar();
    config.definir(['etapa', 'respostasNaJanela'], 6);

    const respondidos = progressao
      .exigenciasDe('operacoes-fundamentais')
      .find((exigencia) => exigencia.rotulo === 'exigencia.respondidos')!;

    expect(respondidos.alvo).toBe(6);
  });
});
