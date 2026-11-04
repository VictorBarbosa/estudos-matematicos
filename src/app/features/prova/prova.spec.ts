import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import {
  ERROS_TOLERADOS,
  SESSOES,
  planoDaProva,
  sessaoPorId,
} from '@core/prova/models/prova.model';
import { ProvaService } from '@core/prova/services/prova.service';
import {
  ACERTOS_EXIGENTES,
  ACERTOS_NA_JANELA,
  REQUISITOS_POR_TOPICO,
  RESPOSTAS_NA_JANELA,
} from '@core/progressao/models/progressao.model';
import { ProgressoService } from '@core/treino/services/progresso.service';
import { Nivel } from '@core/treino/models/treino.model';
import { Prova } from '@features/prova/prova';

/**
 * A sessão mais curta serve de cobaia: a prova dela cai no mínimo de questões,
 * e carregar dois geradores é bem mais rápido que carregar dezessete.
 */
const sessao = SESSOES.reduce((menor, candidata) =>
  candidata.topicoIds.length < menor.topicoIds.length ? candidata : menor,
);

const TOTAL_DE_QUESTOES = planoDaProva(sessao).length;

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

describe('Prova', () => {
  let fixture: ComponentFixture<Prova>;
  let prova: Prova;
  let provas: ProvaService;
  let progresso: ProgressoService;

  const texto = (): string => fixture.nativeElement.textContent as string;

  /** Expõe o estado interno sem fingir que ele é público. */
  const interno = () => prova as unknown as Record<string, { (): unknown; set(v: unknown): void }>;

  const fase = (): string => interno()['fase']!() as string;
  const questao = () =>
    interno()['questao']!() as {
      gerador: { formatar(v: unknown): string };
      exercicio: { gabarito: unknown };
    } | null;

  /**
   * Candidatas a resposta errada.
   *
   * O formato aceito varia de tópico para tópico, então a primeira que o
   * gerador conseguir LER vale como erro — uma que ele não entende volta como
   * formato inválido, que de propósito não conta como erro.
   */
  const ERRADAS = ['-999999', '-123456', '1/999983', 'nenhuma'];

  /** Responde a questão da vez com o gabarito, ou com algo errado de propósito. */
  async function responder(certo: boolean): Promise<void> {
    const atual = questao()!;

    if (certo) {
      interno()['resposta']!.set(atual.gerador.formatar(atual.exercicio.gabarito));
      (prova as unknown as { responder(): void }).responder();
      await fixture.whenStable();
      return;
    }

    for (const candidata of ERRADAS) {
      interno()['resposta']!.set(candidata);
      (prova as unknown as { responder(): void }).responder();
      await fixture.whenStable();

      if (interno()['corrigida']!()) {
        break;
      }
    }

    const veredito = (interno()['validacao']!() as { veredito: string } | null)?.veredito;
    expect(veredito, 'nenhuma candidata foi lida como resposta errada').toBe('incorreto');
  }

  /**
   * Espera a montagem terminar.
   *
   * A prova carrega os geradores da sessão por `import()` dinâmico, e
   * `whenStable` não espera promessa arbitrária — daí a espera explícita.
   */
  async function esperarMontagem(): Promise<void> {
    for (let tentativa = 0; tentativa < 100 && fase() === 'carregando'; tentativa++) {
      await new Promise((ok) => setTimeout(ok, 10));
    }

    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function avancar(): Promise<void> {
    (prova as unknown as { proxima(): void }).proxima();
    await fixture.whenStable();
  }

  async function montar(sessaoId: string): Promise<void> {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map([['sessaoId', sessaoId]]) } },
        },
      ],
    });

    progresso = TestBed.inject(ProgressoService);
    provas = TestBed.inject(ProvaService);

    for (const topicoId of sessao.topicoIds) {
      vencer(progresso, topicoId);
    }

    fixture = TestBed.createComponent(Prova);
    prova = fixture.componentInstance;
    await esperarMontagem();
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it('abre a prova da sessão cumprida com o plano inteiro sorteado', async () => {
    await montar(sessao.id);

    expect(fase()).toBe('respondendo');
    expect(interno()['total']!()).toBe(TOTAL_DE_QUESTOES);
    expect(texto()).toContain('1');
  });

  it('não deixa responder a prova de uma sessão que ainda não foi cumprida', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map([['sessaoId', SESSOES.at(-1)!.id]]) } },
        },
      ],
    });

    fixture = TestBed.createComponent(Prova);
    prova = fixture.componentInstance;
    await esperarMontagem();

    expect(fase()).toBe('trancada');
    expect(questao()).toBeNull();
  });

  it('sessão inexistente na URL não derruba a página', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map([['sessaoId', 'nada']]) } },
        },
      ],
    });

    fixture = TestBed.createComponent(Prova);
    prova = fixture.componentInstance;
    await esperarMontagem();

    expect(fase()).toBe('trancada');
  });

  it('acertar tudo aprova a sessão e abre a seguinte', async () => {
    await montar(sessao.id);

    for (let i = 0; i < TOTAL_DE_QUESTOES; i++) {
      await responder(true);
      await avancar();
    }

    expect(fase()).toBe('aprovado');
    expect(provas.venceu(sessao.id)).toBe(true);
    expect(interno()['erros']!()).toBe(0);
    expect(interno()['acertos']!()).toBe(TOTAL_DE_QUESTOES);
  });

  it('o primeiro erro não avisa nada; o segundo avisa que o próximo zera', async () => {
    await montar(sessao.id);

    await responder(false);
    expect(interno()['erros']!()).toBe(1);
    expect(interno()['noLimite']!()).toBe(false);
    await avancar();

    await responder(false);
    expect(interno()['erros']!()).toBe(ERROS_TOLERADOS);
    expect(interno()['noLimite']!()).toBe(true);
    expect(interno()['perdida']!()).toBe(false);

    await avancar();
    fixture.detectChanges();

    // O aviso aparece ANTES de responder a questão seguinte.
    expect(fase()).toBe('respondendo');
    expect(fixture.nativeElement.querySelector('.ultimo-aviso')).not.toBeNull();
  });

  it('errar com o limite estourado zera a sessão na hora', async () => {
    await montar(sessao.id);

    for (let i = 0; i <= ERROS_TOLERADOS; i++) {
      await responder(false);
      if (i < ERROS_TOLERADOS) {
        await avancar();
      }
    }

    // A zeragem é gravada no instante do erro, antes de qualquer tela nova.
    expect(interno()['perdida']!()).toBe(true);
    for (const topicoId of sessao.topicoIds) {
      expect(progresso.historicoDe(topicoId), topicoId).toEqual([]);
    }

    // Mas a tela do veredito ainda está à vista, com o gabarito.
    expect(fase()).toBe('respondendo');
    expect(fixture.nativeElement.querySelector('.gabarito')).not.toBeNull();

    await avancar();
    expect(fase()).toBe('reprovado');
    expect(provas.venceu(sessao.id)).toBe(false);
  });

  it('dois erros ao longo da prova não impedem a aprovação', async () => {
    await montar(sessao.id);

    for (let i = 0; i < TOTAL_DE_QUESTOES; i++) {
      await responder(i >= ERROS_TOLERADOS);
      await avancar();
    }

    expect(interno()['erros']!()).toBe(ERROS_TOLERADOS);
    expect(fase()).toBe('aprovado');
    expect(provas.venceu(sessao.id)).toBe(true);
  });

  it('resposta ilegível não conta como erro: a prova pede de novo', async () => {
    await montar(sessao.id);

    interno()['resposta']!.set('???');
    (prova as unknown as { responder(): void }).responder();
    await fixture.whenStable();

    expect(interno()['erros']!()).toBe(0);
    expect(interno()['corrigida']!()).toBe(false);
  });

  it('responder duas vezes a mesma questão não conta duas vezes', async () => {
    await montar(sessao.id);

    await responder(false);
    await responder(false);

    expect(interno()['erros']!()).toBe(1);
  });

  it('avançar sem ter respondido não mexe na prova', async () => {
    await montar(sessao.id);

    await avancar();
    expect(interno()['indice']!()).toBe(0);
    expect(fase()).toBe('respondendo');
  });

  it('todas as questões vêm de tópicos da sessão', async () => {
    await montar(sessao.id);

    const questoes = interno()['questoes']!() as readonly { item: { topicoId: string } }[];
    for (const q of questoes) {
      expect(sessao.topicoIds).toContain(q.item.topicoId);
    }
  });

  it('a prova não mexe no histórico de treino dos tópicos', async () => {
    await montar(sessao.id);

    const antes = sessao.topicoIds.map((id) => progresso.historicoDe(id).length);

    await responder(true);
    await avancar();

    expect(sessao.topicoIds.map((id) => progresso.historicoDe(id).length)).toEqual(antes);
  });

  it('prova já passada não se refaz', async () => {
    await montar(sessao.id);
    provas.aprovar(sessao.id);

    // Uma visita nova encontra a prova fechada, não aberta de novo.
    TestBed.resetTestingModule();
    await montar(sessao.id);

    expect(fase()).toBe('vencida');
    expect(questao()).toBeNull();
  });

  it('a sessão da cobaia é mesmo a mais curta do currículo', () => {
    expect(sessaoPorId(sessao.id)).not.toBeNull();
    expect(TOTAL_DE_QUESTOES).toBeGreaterThanOrEqual(8);
  });
});
