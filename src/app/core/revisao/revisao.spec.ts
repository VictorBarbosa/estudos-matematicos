import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ACERTOS_EXIGENTES,
  ACERTOS_NA_JANELA,
  RESPOSTAS_NA_JANELA,
  TRILHA,
} from '@core/progressao/progressao.model';
import { TOPICO_DO_CONCEITO } from '@core/teoria/registro-teorias';
import { TODOS_OS_GERADORES } from '@core/treino/geradores.catalogo';
import { ProgressoService } from '@core/treino/progresso.service';
import { CARREGAR_GERADOR } from '@core/treino/registro-geradores';
import { ITENS_NA_FILA, RevisaoService } from './revisao.service';

/** Vence um tópico, para que ele passe a ser candidato à revisão. */
function vencer(progresso: ProgressoService, topicoId: string): void {
  for (let i = 0; i < RESPOSTAS_NA_JANELA; i++) {
    progresso.registrar({
      topicoId,
      conceitos: [],
      acertou: i >= RESPOSTAS_NA_JANELA - ACERTOS_NA_JANELA,
      sequencia: i + 1,
      nivel: i >= RESPOSTAS_NA_JANELA - ACERTOS_EXIGENTES ? 'dificil' : 'facil',
    });
  }
}

describe('RevisaoService', () => {
  let revisao: RevisaoService;
  let progresso: ProgressoService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    progresso = TestBed.inject(ProgressoService);
    revisao = TestBed.inject(RevisaoService);
  });

  it('sem nada vencido, não há o que revisar', () => {
    expect(revisao.fila()).toEqual([]);
    expect(revisao.temRevisao()).toBe(false);
  });

  it('a fila só traz tópicos já vencidos', () => {
    vencer(progresso, TRILHA[0]!.topicoId);

    expect(revisao.fila().map((item) => item.etapa.topicoId)).toEqual([TRILHA[0]!.topicoId]);
    expect(revisao.temRevisao()).toBe(true);
  });

  it('a fila não passa do tamanho do dia', () => {
    for (const etapa of TRILHA.slice(0, ITENS_NA_FILA + 5)) {
      vencer(progresso, etapa.topicoId);
    }

    expect(revisao.fila().length).toBe(ITENS_NA_FILA);
  });

  it('conceito frágil tem prioridade sobre tempo sem praticar', () => {
    const comErro = TRILHA[0]!;
    const semErro = TRILHA[1]!;

    const conceito = Object.keys(TOPICO_DO_CONCEITO).find(
      (id) => TOPICO_DO_CONCEITO[id] === comErro.topicoId,
    )!;

    // Os erros vêm primeiro: depois deles o tópico é vencido, e o conceito
    // continua frágil no histórico por conceito. (Errar DEPOIS de vencer
    // destrancaria a etapa, por desenho do critério de domínio.)
    for (let i = 0; i < 3; i++) {
      progresso.registrar({
        topicoId: comErro.topicoId,
        conceitos: [conceito],
        acertou: false,
        sequencia: 0,
        nivel: 'medio',
      });
    }

    vencer(progresso, comErro.topicoId);
    vencer(progresso, semErro.topicoId);

    const fila = revisao.fila();
    expect(fila[0]!.etapa.topicoId).toBe(comErro.topicoId);
    expect(fila[0]!.motivo).toBe('conceito-fragil');
    expect(fila[0]!.conceitosFrageis).toContain(conceito);
  });

  it('a fila é ordenada da revisão mais urgente para a menos', () => {
    for (const etapa of TRILHA.slice(0, 5)) {
      vencer(progresso, etapa.topicoId);
    }

    const prioridades = revisao.fila().map((item) => item.prioridade);
    const ordenadas = [...prioridades].sort((um, outro) => outro - um);

    expect(prioridades).toEqual(ordenadas);
  });

  it('cada item diz por que está na fila', () => {
    vencer(progresso, TRILHA[0]!.topicoId);

    const item = revisao.fila()[0]!;
    expect(['conceito-fragil', 'descansado', 'nunca-praticado']).toContain(item.motivo);
    expect(item.diasSemPraticar).toBe(0);
  });
});

describe('registro de geradores', () => {
  it('cobre exatamente os tópicos que têm gerador', () => {
    expect(Object.keys(CARREGAR_GERADOR).sort()).toEqual(
      TODOS_OS_GERADORES.map(([topico]) => topico).sort(),
    );
  });

  it('cada carregador entrega o gerador do próprio tópico', async () => {
    for (const [topico, carregador] of Object.entries(CARREGAR_GERADOR)) {
      const gerador = await carregador();
      expect(gerador.topicoId, `${topico} carregou outro gerador`).toBe(topico);
    }
  });
});
