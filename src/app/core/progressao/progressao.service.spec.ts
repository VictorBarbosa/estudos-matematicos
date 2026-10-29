import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ProgressoService } from '@core/treino/progresso.service';
import { criarRng } from '@core/treino/rng';
import { Nivel } from '@core/treino/treino.model';
import {
  ACERTOS_EXIGENTES,
  ACERTOS_NA_JANELA,
  RESPOSTAS_NA_JANELA,
  TRILHA,
} from './progressao.model';
import { ProgressaoService } from './progressao.service';

/**
 * Simula vencer um tópico.
 *
 * O critério não é mais "3 seguidos no Fácil": são 8 acertos nas últimas 10
 * tentativas, com pelo menos 3 no Médio ou no Difícil.
 */
function vencer(progresso: ProgressoService, topicoId: string): void {
  for (let i = 0; i < RESPOSTAS_NA_JANELA; i++) {
    // Os erros vêm primeiro: a janela precisa terminar em acertos.
    const acertou = i >= RESPOSTAS_NA_JANELA - ACERTOS_NA_JANELA;
    const nivel: Nivel = i >= RESPOSTAS_NA_JANELA - ACERTOS_EXIGENTES ? 'dificil' : 'facil';
    progresso.registrar({ topicoId, conceitos: [], acertou, sequencia: i + 1, nivel });
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

  it('metade de acerto não libera nada, mesmo com muitas tentativas', () => {
    const topicoId = TRILHA[0]!.topicoId;

    for (let i = 0; i < 20; i++) {
      progresso.registrar({
        topicoId,
        conceitos: [],
        acertou: i % 2 === 0,
        sequencia: i % 2 === 0 ? 1 : 0,
        nivel: 'dificil',
      });
    }

    expect(progressao.estaConcluida(topicoId)).toBe(false);
    expect(progressao.estaLiberada(TRILHA[1]!.topicoId)).toBe(false);
  });

  it('três acertos seguidos no Fácil não liberam mais nada', () => {
    const topicoId = TRILHA[0]!.topicoId;

    // Era o atalho do critério antigo: três acertos no nível padrão abriam a
    // etapa seguinte, e o Fácil nem sorteia todos os tipos de questão.
    for (let sequencia = 1; sequencia <= 3; sequencia++) {
      progresso.registrar({ topicoId, conceitos: [], acertou: true, sequencia, nivel: 'facil' });
    }

    expect(progressao.estaConcluida(topicoId)).toBe(false);
    expect(progressao.estaLiberada(TRILHA[1]!.topicoId)).toBe(false);
  });

  it('dez acertos no Fácil também não bastam: o domínio é medido no Médio ou no Difícil', () => {
    const topicoId = TRILHA[0]!.topicoId;

    for (let i = 0; i < RESPOSTAS_NA_JANELA; i++) {
      progresso.registrar({
        topicoId,
        conceitos: [],
        acertou: true,
        sequencia: i + 1,
        nivel: 'facil',
      });
    }

    const dominio = progressao.dominioEm(topicoId);
    expect(dominio.acertos).toBe(RESPOSTAS_NA_JANELA);
    expect(dominio.acertosExigentes).toBe(0);
    expect(dominio.vencido).toBe(false);
    expect(progressao.faltamExigentesPara(topicoId)).toBe(ACERTOS_EXIGENTES);
  });

  it('o domínio é atual: errar as últimas tentativas tranca a etapa de novo', () => {
    const topicoId = TRILHA[0]!.topicoId;
    vencer(progresso, topicoId);
    expect(progressao.estaConcluida(topicoId)).toBe(true);

    for (let i = 0; i < 5; i++) {
      progresso.registrar({
        topicoId,
        conceitos: [],
        acertou: false,
        sequencia: 0,
        nivel: 'medio',
      });
    }

    expect(progressao.estaConcluida(topicoId)).toBe(false);
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
    expect(progressao.faltamPara(topicoId)).toBe(ACERTOS_NA_JANELA);

    progresso.registrar({ topicoId, conceitos: [], acertou: true, sequencia: 1, nivel: 'medio' });
    expect(progressao.avancoNa(topicoId)).toBe(1);
    expect(progressao.faltamPara(topicoId)).toBe(ACERTOS_NA_JANELA - 1);
    expect(progressao.faltamExigentesPara(topicoId)).toBe(ACERTOS_EXIGENTES - 1);
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

  it('quem acerta metade quase nunca libera a etapa por sorte', () => {
    // O critério antigo — 3 seguidos — era vencido por quem acerta 50% em 79%
    // das vezes dentro de 20 tentativas. Esta é a medição do critério novo.
    const rng = criarRng(2718);
    let liberou = 0;
    const simulacoes = 400;

    for (let s = 0; s < simulacoes; s++) {
      localStorage.clear();
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
      const umProgresso = TestBed.inject(ProgressoService);
      const umaProgressao = TestBed.inject(ProgressaoService);
      const topicoId = TRILHA[0]!.topicoId;

      let sequencia = 0;
      for (let tentativa = 0; tentativa < 20; tentativa++) {
        const acertou = rng.inteiro(0, 1) === 1;
        sequencia = acertou ? sequencia + 1 : 0;
        umProgresso.registrar({
          topicoId,
          conceitos: [],
          acertou,
          sequencia,
          nivel: 'dificil',
        });

        if (umaProgressao.estaConcluida(topicoId)) {
          liberou++;
          break;
        }
      }
    }

    // Medido: ~15%, contra 79% do critério de "3 seguidos".
    expect(liberou / simulacoes).toBeLessThan(0.25);
  });
});
