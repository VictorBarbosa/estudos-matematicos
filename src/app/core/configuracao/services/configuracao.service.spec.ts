import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { CONFIGURACAO_PADRAO } from '@core/configuracao/models/configuracao.model';
import { ConfiguracaoService } from '@core/configuracao/services/configuracao.service';
import { ProgressaoService } from '@core/progressao/services/progressao.service';
import { ProvaService } from '@core/prova/services/prova.service';
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
    config.definir(['prova', 'percentualDeAcerto'], 80);
    TestBed.tick();

    TestBed.resetTestingModule();
    const outra = criar();

    expect(outra.prova().percentualDeAcerto).toBe(80);
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

describe('tirar um tópico do plano', () => {
  function montar() {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

    return {
      config: TestBed.inject(ConfiguracaoService),
      progressao: TestBed.inject(ProgressaoService),
      provas: TestBed.inject(ProvaService),
    };
  }

  it('encurta a trilha e renumera as etapas', () => {
    const { config, progressao } = montar();
    const antes = progressao.trilha().length;
    const segunda = progressao.trilha()[1]!.topicoId;

    config.alternarTopico(progressao.trilha()[0]!.topicoId);

    expect(progressao.trilha().length).toBe(antes - 1);
    // Quem era a segunda etapa passa a ser a primeira, com o número 1.
    expect(progressao.trilha()[0]!.topicoId).toBe(segunda);
    expect(progressao.trilha()[0]!.numero).toBe(1);
  });

  it('o tópico fora do plano some da prova da área', () => {
    const { config, provas } = montar();
    const sessao = () => provas.sessoes().find((s) => s.id === 'matematica-basica')!;
    expect(sessao().topicoIds).toContain('fracoes');

    config.alternarTopico('fracoes');

    expect(sessao().topicoIds).not.toContain('fracoes');
  });

  it('tirar a área inteira faz a sessão, e a prova dela, desaparecerem', () => {
    const { config, provas } = montar();
    const daArea = provas.sessoes().find((s) => s.id === 'matematica-basica')!.topicoIds;

    for (const topicoId of daArea) {
      config.alternarTopico(topicoId);
    }

    expect(provas.sessoes().some((s) => s.id === 'matematica-basica')).toBe(false);
  });

  it('o progresso do tópico tirado não é apagado, e volta com ele', () => {
    const { config, progressao } = montar();
    const progresso = TestBed.inject(ProgressoService);

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

    config.alternarTopico('operacoes-fundamentais');
    expect(progressao.trilha().some((e) => e.topicoId === 'operacoes-fundamentais')).toBe(false);

    config.alternarTopico('operacoes-fundamentais');
    expect(progressao.estaConcluida('operacoes-fundamentais')).toBe(true);
  });

  it('o que saiu do plano continua acessível, não trancado', () => {
    const { config, progressao } = montar();
    // `fracoes` é a quarta etapa: trancada enquanto as anteriores não caem.
    expect(progressao.estaLiberada('fracoes')).toBe(false);

    config.alternarTopico('fracoes');

    // Fora da trilha, ninguém tranca: tirar é «não preciso», não «não posso».
    expect(progressao.estaLiberada('fracoes')).toBe(true);
  });

  it('a escolha sobrevive a uma aba nova', () => {
    const { config } = montar();
    config.alternarTopico('fracoes');
    TestBed.tick();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

    expect(TestBed.inject(ConfiguracaoService).topicosRemovidos().has('fracoes')).toBe(true);
  });

  it('«voltar ao de fábrica» devolve os tópicos também', () => {
    const { config } = montar();
    config.alternarTopico('fracoes');
    expect(config.intocada()).toBe(false);

    config.redefinir();

    expect(config.topicosRemovidos().size).toBe(0);
    expect(config.intocada()).toBe(true);
  });
});
