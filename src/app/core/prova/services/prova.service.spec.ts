import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { SESSOES, sessaoPorId } from '@core/prova/models/prova.model';
import { ProvaService } from '@core/prova/services/prova.service';
import {
  ACERTOS_EXIGENTES,
  ACERTOS_NA_JANELA,
  REQUISITOS_POR_TOPICO,
  RESPOSTAS_NA_JANELA,
  TRILHA,
} from '@core/progressao/models/progressao.model';
import { ProgressaoService } from '@core/progressao/services/progressao.service';
import { ProgressoService } from '@core/treino/services/progresso.service';
import { Nivel } from '@core/treino/models/treino.model';

/** Vence um tópico pelo mesmo caminho que a progressão exige. */
function vencer(progresso: ProgressoService, topicoId: string): void {
  for (const requisito of REQUISITOS_POR_TOPICO[topicoId] ?? []) {
    for (let i = 0; i < requisito.acertos; i++) {
      progresso.registrar({
        topicoId,
        conceitos: [requisito.conceito],
        acertou: true,
        sequencia: i + 1,
        nivel: 'medio',
      });
    }
  }

  for (let i = 0; i < RESPOSTAS_NA_JANELA; i++) {
    const acertou = i >= RESPOSTAS_NA_JANELA - ACERTOS_NA_JANELA;
    const nivel: Nivel = i >= RESPOSTAS_NA_JANELA - ACERTOS_EXIGENTES ? 'dificil' : 'facil';
    progresso.registrar({ topicoId, conceitos: [], acertou, sequencia: i + 1, nivel });
  }
}

function vencerSessao(progresso: ProgressoService, sessaoId: string): void {
  for (const topicoId of sessaoPorId(sessaoId)!.topicoIds) {
    vencer(progresso, topicoId);
  }
}

describe('ProvaService', () => {
  let prova: ProvaService;
  let progresso: ProgressoService;

  const primeira = SESSOES[0]!;
  const segunda = SESSOES[1]!;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    progresso = TestBed.inject(ProgressoService);
    prova = TestBed.inject(ProvaService);
  });

  it('começa com toda prova trancada', () => {
    for (const sessao of SESSOES) {
      expect(prova.estadoDe(sessao.id), sessao.id).toBe('trancada');
    }

    expect(prova.pendente()).toBeNull();
  });

  it('a prova abre quando a última etapa da sessão é vencida', () => {
    const topicos = primeira.topicoIds;

    for (const topicoId of topicos.slice(0, -1)) {
      vencer(progresso, topicoId);
    }
    expect(prova.estadoDe(primeira.id)).toBe('trancada');

    vencer(progresso, topicos.at(-1)!);
    expect(prova.estadoDe(primeira.id)).toBe('disponivel');
    expect(prova.estaDisponivel(primeira.id)).toBe(true);
    expect(prova.pendente()?.id).toBe(primeira.id);
  });

  it('aprovar marca a sessão como vencida e tira a pendência', () => {
    vencerSessao(progresso, primeira.id);
    prova.aprovar(primeira.id);

    expect(prova.estadoDe(primeira.id)).toBe('vencida');
    expect(prova.venceu(primeira.id)).toBe(true);
    expect(prova.venceuASessaoDo(primeira.topicoIds[0]!)).toBe(true);
    expect(prova.venceuASessaoDo('nada')).toBe(false);
    expect(prova.pendente()).toBeNull();
  });

  it('aprovar duas vezes não duplica nada', () => {
    vencerSessao(progresso, primeira.id);
    prova.aprovar(primeira.id);
    prova.aprovar(primeira.id);

    expect(prova.venceu(primeira.id)).toBe(true);
  });

  it('reprovar zera a sessão e deixa as outras intactas', () => {
    vencerSessao(progresso, primeira.id);
    vencer(progresso, segunda.topicoIds[0]!);

    const umDaPrimeira = primeira.topicoIds[0]!;
    const daSegunda = segunda.topicoIds[0]!;

    expect(progresso.historicoDe(umDaPrimeira).length).toBeGreaterThan(0);

    prova.reprovar(primeira.id);

    for (const topicoId of primeira.topicoIds) {
      expect(progresso.historicoDe(topicoId), topicoId).toEqual([]);
      expect(progresso.estatisticaDe(topicoId).acertos, topicoId).toBe(0);
      expect(progresso.ultimaPraticaDe(topicoId), topicoId).toBeNull();
    }

    // O que estava fora da sessão continua onde estava.
    expect(progresso.historicoDe(daSegunda).length).toBeGreaterThan(0);
    expect(prova.estadoDe(primeira.id)).toBe('trancada');
  });

  it('reprovar apaga também a cobertura por tipo da sessão', () => {
    const comTipos = Object.keys(REQUISITOS_POR_TOPICO)[0]!;
    const sessaoComTipos = SESSOES.find((sessao) => sessao.topicoIds.includes(comTipos))!;

    vencerSessao(progresso, sessaoComTipos.id);
    const conceito = REQUISITOS_POR_TOPICO[comTipos]![0]!.conceito;
    expect(progresso.porConceito()[conceito]?.acertos).toBeGreaterThan(0);

    prova.reprovar(sessaoComTipos.id);
    expect(progresso.porConceito()[conceito]).toBeUndefined();
  });

  it('sessão desconhecida não derruba reprovar', () => {
    expect(() => prova.reprovar('nada')).not.toThrow();
  });

  it('a aprovação sobrevive a um serviço novo, como numa aba nova', () => {
    vencerSessao(progresso, primeira.id);
    prova.aprovar(primeira.id);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

    expect(TestBed.inject(ProvaService).venceu(primeira.id)).toBe(true);
  });

  it('limpar esquece as aprovações', () => {
    vencerSessao(progresso, primeira.id);
    prova.aprovar(primeira.id);

    prova.limpar();
    expect(prova.venceu(primeira.id)).toBe(false);
  });
});

describe('a prova tranca a sessão seguinte', () => {
  let prova: ProvaService;
  let progresso: ProgressoService;
  let progressao: ProgressaoService;

  const primeira = SESSOES[0]!;

  /** A primeira etapa da trilha que pertence à segunda sessão. */
  const primeiraDaSegunda = TRILHA.find((etapa) => etapa.areaId === SESSOES[1]!.id)!;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    progresso = TestBed.inject(ProgressoService);
    prova = TestBed.inject(ProvaService);
    progressao = TestBed.inject(ProgressaoService);

    vencerSessao(progresso, primeira.id);
  });

  it('vencer todas as etapas não basta para abrir a sessão seguinte', () => {
    for (const topicoId of primeira.topicoIds) {
      expect(progressao.estaConcluida(topicoId), topicoId).toBe(true);
      expect(progressao.estaLiberada(topicoId), topicoId).toBe(true);
    }

    expect(progressao.estaLiberada(primeiraDaSegunda.topicoId)).toBe(false);
  });

  it('as etapas vencidas continuam contando, mesmo com a prova pendente', () => {
    expect(progressao.etapasVencidas()).toBeGreaterThanOrEqual(primeira.topicoIds.length);
    expect(progressao.etapasAbertas()).toBe(primeira.topicoIds.length);
  });

  it('passar na prova abre a sessão seguinte', () => {
    prova.aprovar(primeira.id);

    expect(progressao.estaLiberada(primeiraDaSegunda.topicoId)).toBe(true);
    expect(progressao.etapasAbertas()).toBe(primeira.topicoIds.length + 1);
  });

  it('o modo livre continua abrindo tudo', () => {
    progressao.definirModoLivre(true);
    expect(progressao.estaLiberada(primeiraDaSegunda.topicoId)).toBe(true);
  });

  it('recomeçar do zero esquece a aprovação junto com o progresso', () => {
    prova.aprovar(primeira.id);
    progressao.reiniciar();

    expect(prova.venceu(primeira.id)).toBe(false);
    expect(progressao.estaLiberada(primeiraDaSegunda.topicoId)).toBe(false);
  });
});
