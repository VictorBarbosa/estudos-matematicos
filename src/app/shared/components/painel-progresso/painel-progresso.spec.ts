import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TOPICO_DO_CONCEITO } from '@core/teoria/registro-teorias/registro-teorias';
import { ProgressoService } from '@core/treino/services/progresso.service';
import { PainelProgresso } from '@shared/components/painel-progresso/painel-progresso';

describe('PainelProgresso', () => {
  let fixture: ComponentFixture<PainelProgresso>;
  let progresso: ProgressoService;

  beforeEach(async () => {
    localStorage.clear();

    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    progresso = TestBed.inject(ProgressoService);
    fixture = TestBed.createComponent(PainelProgresso);
  });

  function texto(): string {
    return fixture.nativeElement.textContent as string;
  }

  async function errar(topicoId: string, conceito: string, vezes = 1): Promise<void> {
    for (let i = 0; i < vezes; i++) {
      progresso.registrar({
        topicoId,
        conceitos: [conceito],
        acertou: false,
        sequencia: 0,
        nivel: 'medio',
      });
    }
    await fixture.whenStable();
  }

  it('sem prática, convida a treinar', async () => {
    await fixture.whenStable();

    expect(texto()).toContain('Nenhum exercício respondido ainda');
  });

  it('sugere revisão de um conceito cujo prefixo não é o nome do tópico', async () => {
    // `operacoes-fundamentais` registra conceitos com prefixo `operacoes.`. O
    // filtro antigo, por `startsWith(topicoId + '.')`, não achava nenhum.
    expect(TOPICO_DO_CONCEITO['operacoes.ordem']).toBe('operacoes-fundamentais');

    fixture.componentRef.setInput('topicoId', 'operacoes-fundamentais');
    await errar('operacoes-fundamentais', 'operacoes.ordem', 3);

    expect(texto()).toContain('Vale revisar');
    expect(texto()).toContain('3 erros em 3');
  });

  it('conceitos frágeis de outros tópicos não escondem os deste', async () => {
    // O corte nos piores conceitos do site vinha antes do filtro por tópico:
    // oito conceitos frágeis em outros tópicos esvaziavam este painel.
    const outros = Object.entries(TOPICO_DO_CONCEITO)
      .filter(([, topico]) => topico !== 'fracoes')
      .slice(0, 10);

    for (const [conceito, topico] of outros) {
      await errar(topico, conceito, 9);
    }

    await errar('fracoes', 'fracoes.mmc', 1);

    fixture.componentRef.setInput('topicoId', 'fracoes');
    await fixture.whenStable();

    expect(texto()).toContain('Vale revisar');
  });

  it('não sugere conceitos de outro tópico', async () => {
    await errar('fracoes', 'fracoes.mmc', 4);

    fixture.componentRef.setInput('topicoId', 'mmc-mdc');
    await fixture.whenStable();

    expect(texto()).not.toContain('Vale revisar');
  });
});
