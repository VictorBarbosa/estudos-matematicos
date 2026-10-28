import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ProgressoService } from '@core/treino/progresso.service';
import { ACERTOS_PARA_LIBERAR, TRILHA } from './progressao.model';
import { ProgressaoService } from './progressao.service';

/** Simula vencer um tópico: acertos seguidos suficientes na área de treino. */
function vencer(progresso: ProgressoService, topicoId: string): void {
  for (let sequencia = 1; sequencia <= ACERTOS_PARA_LIBERAR; sequencia++) {
    progresso.registrar({ topicoId, conceitos: [], acertou: true, sequencia });
  }
}

describe('ProgressaoService', () => {
  let progressao: ProgressaoService;
  let progresso: ProgressoService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    progresso = TestBed.inject(ProgressoService);
    progressao = TestBed.inject(ProgressaoService);
  });

  it('monta a trilha na ordem do currículo, só com tópicos prontos', () => {
    expect(TRILHA.length).toBeGreaterThan(0);
    expect(TRILHA[0]!.numero).toBe(1);
    expect(TRILHA.at(-1)!.numero).toBe(TRILHA.length);
    expect(new Set(TRILHA.map((e) => e.topicoId)).size).toBe(TRILHA.length);
  });

  it('começa com apenas a primeira etapa liberada', () => {
    expect(progressao.estaLiberada(TRILHA[0]!.topicoId)).toBe(true);
    expect(progressao.estaLiberada(TRILHA[1]!.topicoId)).toBe(false);
    expect(progressao.etapaAtual()?.topicoId).toBe(TRILHA[0]!.topicoId);
  });

  it('libera a próxima etapa ao vencer a atual', () => {
    vencer(progresso, TRILHA[0]!.topicoId);

    expect(progressao.estaConcluida(TRILHA[0]!.topicoId)).toBe(true);
    expect(progressao.estaLiberada(TRILHA[1]!.topicoId)).toBe(true);
    expect(progressao.estaLiberada(TRILHA[2]!.topicoId)).toBe(false);
    expect(progressao.etapaAtual()?.topicoId).toBe(TRILHA[1]!.topicoId);
  });

  it('acertos que não vêm em sequência não liberam nada', () => {
    const topicoId = TRILHA[0]!.topicoId;

    for (let i = 0; i < 10; i++) {
      progresso.registrar({ topicoId, conceitos: [], acertou: true, sequencia: 1 });
      progresso.registrar({ topicoId, conceitos: [], acertou: false, sequencia: 0 });
    }

    expect(progressao.estaConcluida(topicoId)).toBe(false);
    expect(progressao.estaLiberada(TRILHA[1]!.topicoId)).toBe(false);
  });

  it('vencer uma etapa adiante não abre buraco na trilha', () => {
    vencer(progresso, TRILHA[3]!.topicoId);

    expect(progressao.estaConcluida(TRILHA[3]!.topicoId)).toBe(true);
    // A fronteira continua na primeira: o que vale é a sequência desde o começo.
    expect(progressao.etapasVencidas()).toBe(0);
    expect(progressao.estaLiberada(TRILHA[1]!.topicoId)).toBe(false);
  });

  it('conta quanto falta para vencer o tópico', () => {
    const topicoId = TRILHA[0]!.topicoId;
    expect(progressao.faltamPara(topicoId)).toBe(ACERTOS_PARA_LIBERAR);

    progresso.registrar({ topicoId, conceitos: [], acertou: true, sequencia: 1 });
    expect(progressao.avancoNa(topicoId)).toBe(1);
    expect(progressao.faltamPara(topicoId)).toBe(ACERTOS_PARA_LIBERAR - 1);
  });

  it('o modo livre abre tudo e é lembrado entre sessões', () => {
    expect(progressao.estaLiberada(TRILHA[9]!.topicoId)).toBe(false);

    progressao.definirModoLivre(true);
    expect(progressao.estaLiberada(TRILHA[9]!.topicoId)).toBe(true);

    // Um refresh é um serviço novo lendo o mesmo armazenamento.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

    expect(TestBed.inject(ProgressaoService).modoLivre()).toBe(true);
  });

  it('a conquista sobrevive a um refresh', () => {
    vencer(progresso, TRILHA[0]!.topicoId);

    // Zera os serviços, mantendo o localStorage — é o que um F5 faz.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const recarregado = TestBed.inject(ProgressaoService);

    expect(recarregado.estaConcluida(TRILHA[0]!.topicoId)).toBe(true);
    expect(recarregado.etapaAtual()?.topicoId).toBe(TRILHA[1]!.topicoId);
  });

  it('o reinício apaga tudo e volta à primeira etapa', () => {
    vencer(progresso, TRILHA[0]!.topicoId);
    vencer(progresso, TRILHA[1]!.topicoId);
    progressao.definirModoLivre(true);

    progressao.reiniciar();

    expect(progressao.etapasVencidas()).toBe(0);
    expect(progressao.etapaAtual()?.topicoId).toBe(TRILHA[0]!.topicoId);
    expect(progressao.estaLiberada(TRILHA[1]!.topicoId)).toBe(false);
    expect(progressao.modoLivre()).toBe(false);
    expect(progresso.totalRespondido()).toBe(0);
  });

  it('o reinício também vale depois de um refresh', () => {
    vencer(progresso, TRILHA[0]!.topicoId);
    progressao.reiniciar();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

    expect(TestBed.inject(ProgressaoService).etapasVencidas()).toBe(0);
  });

  it('a trilha termina quando todas as etapas são vencidas', () => {
    for (const etapa of TRILHA) {
      vencer(progresso, etapa.topicoId);
    }

    expect(progressao.trilhaCompleta()).toBe(true);
    expect(progressao.etapaAtual()).toBeNull();
    expect(progressao.percentual()).toBe(100);
  });
});
