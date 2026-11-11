import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ConfiguracaoService } from '@core/configuracao/services/configuracao.service';
import { ProgressaoService } from '@core/progressao/services/progressao.service';
import { ProvaSurpresaService } from '@core/prova/services/prova-surpresa.service';
import { ProvaService } from '@core/prova/services/prova.service';
import { ProgressoService } from '@core/treino/services/progresso.service';
import { Nivel } from '@core/treino/models/treino.model';
import { DIA } from '@core/prova/models/prova-surpresa.model';

/** Quais tópicos já estão vencidos na trilha, na ordem. */
/*
 * Tópicos sem exigência de cobertura por tipo.
 *
 * `fracoes` também vence o critério de janela, mas pede três acertos em cada
 * um dos nove tipos de operação — incluí-lo faria o teste depender de semear
 * nove conceitos, o que não é o que ele quer medir.
 */
const DA_TRILHA = [
  'operacoes-fundamentais',
  'notacao-matematica',
  'mmc-mdc',
  'numeros-decimais',
  'razao-proporcao',
  'potenciacao-radiciacao',
];

/**
 * A prova surpresa: quando nasce, o que ela deixa guardado e o que ela tranca.
 *
 * O teste grava o histórico pelo `ProgressoService`, que é o mesmo caminho da
 * tela — nada de semear o estado interno do serviço.
 */
describe('ProvaSurpresaService', () => {
  function montar() {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

    return {
      surpresa: TestBed.inject(ProvaSurpresaService),
      progresso: TestBed.inject(ProgressoService),
      progressao: TestBed.inject(ProgressaoService),
      config: TestBed.inject(ConfiguracaoService),
      provas: TestBed.inject(ProvaService),
    };
  }

  /** Vence o critério de domínio do tópico (10 tentativas, 8 acertos, 3 difíceis). */
  function vencer(progresso: ProgressoService, topicoId: string): void {
    for (let i = 0; i < 10; i++) {
      progresso.registrar({
        topicoId,
        conceitos: [],
        acertou: true,
        sequencia: i + 1,
        nivel: (i < 3 ? 'facil' : 'dificil') as Nivel,
      });
    }
  }

  /** Cria a prova e responde tudo, com a quantidade de erros pedida. */
  function responder(
    surpresa: ProvaSurpresaService,
    erros: number,
  ): ReturnType<ProvaSurpresaService['concluir']> {
    const itens = surpresa.ativa()!.itens;

    itens.forEach((item, indice) => {
      surpresa.registrarResposta(item.topicoId, '1', indice >= erros);
    });

    return surpresa.concluir();
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('nasce sozinha quando há tópicos vencidos suficientes', () => {
    const { surpresa, progresso } = montar();
    expect(surpresa.ativa()).toBeNull();

    for (const topicoId of DA_TRILHA.slice(0, 3)) {
      vencer(progresso, topicoId);
    }

    expect(surpresa.avaliar()).toBe(true);
    expect(surpresa.ativa()).not.toBeNull();
    expect(surpresa.total()).toBeGreaterThan(0);
  });

  it('não nasce com a prova surpresa desligada', () => {
    const { surpresa, progresso, config } = montar();
    config.definir(['surpresa', 'ativa'], 0);

    for (const topicoId of DA_TRILHA.slice(0, 3)) {
      vencer(progresso, topicoId);
    }

    expect(surpresa.avaliar()).toBe(false);
    expect(surpresa.ativa()).toBeNull();
  });

  it('cobra só o que está no plano: o tópico removido fica de fora', () => {
    const { surpresa, progresso, config } = montar();

    // Quatro vencidos, um removido: sobram três, que é o mínimo da prova.
    for (const topicoId of DA_TRILHA.slice(0, 4)) {
      vencer(progresso, topicoId);
    }
    config.alternarTopico(DA_TRILHA[0]!);

    surpresa.avaliar();
    const cobrados = new Set(surpresa.ativa()!.itens.map((item) => item.topicoId));

    expect(cobrados.has(DA_TRILHA[0]!)).toBe(false);
    expect(cobrados.size).toBeGreaterThan(0);
  });

  it('a prova aberta sobrevive a uma aba nova, com a mesma questão', () => {
    const { surpresa, progresso } = montar();

    for (const topicoId of DA_TRILHA.slice(0, 3)) {
      vencer(progresso, topicoId);
    }
    surpresa.avaliar();

    const antes = surpresa.ativa()!;
    surpresa.registrarResposta(antes.itens[0]!.topicoId, '7', false);
    TestBed.tick();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const outra = TestBed.inject(ProvaSurpresaService);

    expect(outra.ativa()).not.toBeNull();
    expect(outra.ativa()!.semente).toBe(antes.semente);
    expect(outra.ativa()!.itens).toEqual(antes.itens);
    expect(outra.indice()).toBe(1);
    expect(outra.respostas()).toHaveLength(1);
  });

  it('recarregar várias vezes não sorteia uma prova nova', () => {
    const { surpresa, progresso } = montar();

    for (const topicoId of DA_TRILHA.slice(0, 3)) {
      vencer(progresso, topicoId);
    }
    surpresa.avaliar();
    const primeira = surpresa.ativa()!;

    for (let volta = 0; volta < 3; volta++) {
      expect(surpresa.avaliar()).toBe(false);
      expect(surpresa.ativa()!.itens).toEqual(primeira.itens);
    }
  });

  it('aprovada: nada é trancado e o progresso fica', () => {
    const { surpresa, progresso, progressao } = montar();

    for (const topicoId of DA_TRILHA.slice(0, 3)) {
      vencer(progresso, topicoId);
    }
    surpresa.avaliar();

    const resultado = responder(surpresa, 0);

    expect(resultado?.aprovado).toBe(true);
    expect(resultado?.percentual).toBe(100);
    expect(surpresa.trancadosAtivos().size).toBe(0);
    expect(surpresa.ativa()).toBeNull();
    expect(progressao.estaConcluida(DA_TRILHA[0]!)).toBe(true);
  });

  it('reprovada: os tópicos errados voltam a ser exigidos e trancam a trilha', () => {
    const { surpresa, progresso, progressao } = montar();

    for (const topicoId of DA_TRILHA.slice(0, 3)) {
      vencer(progresso, topicoId);
    }
    surpresa.avaliar();

    const alvo = surpresa.ativa()!.itens[0]!.topicoId;
    // Erra tudo: garantidamente abaixo dos 75%.
    const resultado = responder(surpresa, Number.MAX_SAFE_INTEGER);

    expect(resultado?.aprovado).toBe(false);
    expect(resultado?.reprovados).toContain(alvo);
    expect(surpresa.trancadosAtivos().has(alvo)).toBe(true);
    expect(progressao.estaConcluida(alvo)).toBe(false);
    expect(progressao.estaTrancado(alvo)).toBe(true);
  });

  it('o tópico destranca sozinho quando é vencido de novo', () => {
    const { surpresa, progresso, progressao } = montar();

    for (const topicoId of DA_TRILHA.slice(0, 3)) {
      vencer(progresso, topicoId);
    }
    surpresa.avaliar();
    const alvo = surpresa.ativa()!.itens[0]!.topicoId;
    responder(surpresa, Number.MAX_SAFE_INTEGER);

    expect(surpresa.trancadosAtivos().has(alvo)).toBe(true);

    vencer(progresso, alvo);

    expect(surpresa.trancadosAtivos().has(alvo)).toBe(false);
    expect(progressao.estaConcluida(alvo)).toBe(true);
  });

  it('a trilha trava no tópico reprovado, e o destino continua uma porta aberta', () => {
    /*
     * O guard manda para `destinoDaVez` quando barra alguém. Se o tópico
     * trancado não fosse ele próprio acessível, o guard redirecionaria para a
     * mesma rota que acabou de barrar — e a página travaria em laço. É o mesmo
     * defeito que a prova de área já teve uma vez.
     */
    const { surpresa, progresso, progressao } = montar();

    for (const topicoId of DA_TRILHA.slice(0, 4)) {
      vencer(progresso, topicoId);
    }
    const antes = progressao.etapasVencidas();

    surpresa.avaliar();
    const itens = surpresa.ativa()!.itens;

    // Dois erros em quatro questões dão 50%, abaixo dos 75% exigidos.
    itens.forEach((item, indice) => {
      surpresa.registrarResposta(item.topicoId, '1', indice > 1);
    });
    const resultado = surpresa.concluir();
    const trancado = resultado!.reprovados[0]!;

    expect(progressao.estaTrancado(trancado)).toBe(true);
    expect(progressao.etapasVencidas()).toBeLessThan(antes);

    // O destino do guard tem de ser o próprio tópico trancado — aberto para
    // reestudar —, e não uma etapa à frente.
    const destino = progressao.destinoDaVez();
    expect(destino[0]).toBe(progressao.etapaAtual()!.rota);
    expect(progressao.estaLiberada(progressao.etapaAtual()!.topicoId)).toBe(true);
  });

  it('a reprovação apaga o histórico do tópico, para reestudar de verdade', () => {
    const { surpresa, progresso } = montar();

    for (const topicoId of DA_TRILHA.slice(0, 3)) {
      vencer(progresso, topicoId);
    }
    surpresa.avaliar();
    const alvo = surpresa.ativa()!.itens[0]!.topicoId;
    responder(surpresa, Number.MAX_SAFE_INTEGER);

    expect(progresso.historicoDe(alvo)).toHaveLength(0);
  });

  it('a aprovação da área não esconde o trancamento', () => {
    const { surpresa, progresso, progressao, provas } = montar();

    for (const topicoId of DA_TRILHA.slice(0, 3)) {
      vencer(progresso, topicoId);
    }
    // A área inteira conta como vencida pela prova final.
    provas.aprovar('matematica-basica');
    expect(progressao.estaConcluida(DA_TRILHA[0]!)).toBe(true);

    surpresa.avaliar();
    const alvo = surpresa.ativa()!.itens[0]!.topicoId;
    responder(surpresa, Number.MAX_SAFE_INTEGER);

    expect(surpresa.trancadosAtivos().has(alvo)).toBe(true);
    expect(progressao.estaConcluida(alvo)).toBe(false);
    expect(provas.venceu('matematica-basica')).toBe(false);
  });

  it('cada prova dada empurra a próxima para o fim do intervalo', () => {
    const { surpresa, progresso } = montar();

    for (const topicoId of DA_TRILHA.slice(0, 3)) {
      vencer(progresso, topicoId);
    }
    surpresa.avaliar();
    const agora = Date.now();
    responder(surpresa, 0);

    expect(surpresa.avaliar(agora + 1 * DIA)).toBe(false);
    expect(surpresa.ultimaEm()).not.toBeNull();
  });

  it('encerrar sem avaliar destranca a navegação e não tranca ninguém', () => {
    const { surpresa, progresso } = montar();

    for (const topicoId of DA_TRILHA.slice(0, 3)) {
      vencer(progresso, topicoId);
    }
    surpresa.avaliar();

    surpresa.encerrarSemAvaliar();

    expect(surpresa.ativa()).toBeNull();
    expect(surpresa.trancadosAtivos().size).toBe(0);
  });

  it('limpar esquece trancas, contagem e prova aberta', () => {
    const { surpresa, progresso } = montar();

    for (const topicoId of DA_TRILHA.slice(0, 3)) {
      vencer(progresso, topicoId);
    }
    surpresa.avaliar();
    responder(surpresa, Number.MAX_SAFE_INTEGER);

    surpresa.limpar();

    expect(surpresa.ativa()).toBeNull();
    expect(surpresa.trancadosAtivos().size).toBe(0);
    expect(surpresa.feitas()).toBe(0);
  });
});
