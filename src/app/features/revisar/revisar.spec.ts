import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  ACERTOS_EXIGENTES,
  ACERTOS_NA_JANELA,
  RESPOSTAS_NA_JANELA,
  TRILHA,
} from '@core/progressao/models/progressao.model';
import { ProgressoService } from '@core/treino/services/progresso.service';
import { Revisar } from '@features/revisar/revisar';

/** Vence um tópico, para que ele entre na fila de revisão. */
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

async function montar(): Promise<ComponentFixture<Revisar>> {
  const fixture = TestBed.createComponent(Revisar);
  await fixture.whenStable();
  return fixture;
}

describe('Revisar', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });
  });

  it('sem matéria vencida, explica por que a fila está vazia', async () => {
    const fixture = await montar();

    expect(fixture.nativeElement.textContent).toContain('Ainda não há matéria antiga para revisar');
  });

  it('com um tópico vencido, mostra o item e carrega os exercícios dele', async () => {
    const progresso = TestBed.inject(ProgressoService);
    vencer(progresso, TRILHA[0]!.topicoId);

    const fixture = await montar();
    const texto = (): string => fixture.nativeElement.textContent as string;

    expect(texto()).toContain('Item 1 de 1');
    expect(texto()).toContain(TRILHA[0]!.titulo);

    // O gerador vem por import dinâmico: esperamos o chunk chegar. O orçamento
    // é generoso porque na integração contínua o primeiro import é mais lento.
    for (let tentativa = 0; tentativa < 200; tentativa++) {
      if (fixture.nativeElement.querySelector('app-area-treino') !== null) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 25));
      await fixture.whenStable();
    }

    expect(fixture.nativeElement.querySelector('app-area-treino')).not.toBeNull();
    expect(texto()).toContain('Sua resposta');
  }, 30_000);

  it('ao fim da fila, oferece montar outra', async () => {
    const progresso = TestBed.inject(ProgressoService);
    vencer(progresso, TRILHA[0]!.topicoId);

    const fixture = await montar();

    const proximo = [...fixture.nativeElement.querySelectorAll('button')].find(
      (botao: HTMLButtonElement) => botao.textContent?.includes('Próximo da fila'),
    ) as HTMLButtonElement;

    proximo.click();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Fila de hoje concluída');
  });
});
