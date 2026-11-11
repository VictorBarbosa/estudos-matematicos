import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProvaSurpresaService } from '@core/prova/services/prova-surpresa.service';
import { ProgressoService } from '@core/treino/services/progresso.service';
import { Nivel } from '@core/treino/models/treino.model';
import { Surpresa } from '@features/surpresa/surpresa';

/** Tópicos sem cobertura por tipo, para a prova caber num teste rápido. */
const TOPICOS = ['operacoes-fundamentais', 'notacao-matematica', 'mmc-mdc'];

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

describe('Surpresa', () => {
  let fixture: ComponentFixture<Surpresa>;
  let surpresa: ProvaSurpresaService;

  const texto = (): string => fixture.nativeElement.textContent as string;
  const interno = () => fixture.componentInstance as unknown as Record<string, () => unknown>;

  /**
   * Cria a página e espera o sorteio terminar.
   *
   * `whenStable` não basta: os geradores chegam por `import()` dinâmico, que
   * não é uma Promise observada pelo Angular. Uma volta no laço de tarefas
   * resolve os módulos, e a detecção de mudança seguinte desenha o resultado.
   */
  async function montar(): Promise<void> {
    fixture = TestBed.createComponent(Surpresa);

    // O sorteio carrega os geradores por `import()` dinâmico; o laço espera o
    // estado sair de «carregando» em vez de contar voltas fixas.
    for (let volta = 0; volta < 120; volta++) {
      await new Promise((resolver) => setTimeout(resolver, 5));
      fixture.detectChanges();
      if (interno()['fase']!() !== 'carregando') {
        return;
      }
    }
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });

    surpresa = TestBed.inject(ProvaSurpresaService);
    const progresso = TestBed.inject(ProgressoService);

    for (const topicoId of TOPICOS) {
      vencer(progresso, topicoId);
    }
  });

  it('sem prova em andamento, explica quando ela aparece', async () => {
    await montar();

    expect(interno()['fase']!()).toBe('sem-prova');
    expect(texto()).toContain('Nenhuma prova surpresa em andamento');
    expect(texto()).toContain('Não há contagem regressiva');
  });

  it('com a prova aberta, mostra a questão e nenhuma dica', async () => {
    surpresa.avaliar();
    await montar();

    expect(interno()['fase']!()).toBe('respondendo');
    expect(texto()).toContain('Questão 1 de');

    // Numa prova surpresa não há dica na tela: consultar seria responder
    // outra coisa. O `Exercicio` pode trazê-la; o template é que não a mostra.
    expect(fixture.nativeElement.querySelector('.dica')).toBeNull();
  });

  it('responder tudo certo leva à tela de aprovado', async () => {
    surpresa.avaliar();
    await montar();

    const total = surpresa.total();

    for (let i = 0; i < total; i++) {
      const questao = interno()['questao']!() as {
        gerador: { formatar(v: unknown): string };
        exercicio: { gabarito: unknown };
      };
      const campo = interno()['resposta'] as unknown as { set(v: string): void };
      campo.set(questao.gerador.formatar(questao.exercicio.gabarito));
      (fixture.componentInstance as unknown as { responder(): void }).responder();
      fixture.detectChanges();
      (fixture.componentInstance as unknown as { proxima(): void }).proxima();
      fixture.detectChanges();
    }

    expect(interno()['fase']!()).toBe('terminada');
    expect(texto()).toContain('Passou');
    expect(texto()).toContain('Nada foi trancado');
  });

  it('recarregar a página devolve a mesma questão, não uma prova nova', async () => {
    surpresa.avaliar();
    await montar();

    const questao = interno()['questao']!() as {
      gerador: { formatar(v: unknown): string };
      exercicio: { gabarito: unknown };
    };
    const resposta = interno()['resposta'] as unknown as { set(v: string): void };
    resposta.set(questao.gerador.formatar(questao.exercicio.gabarito));
    (fixture.componentInstance as unknown as { responder(): void }).responder();
    fixture.detectChanges();

    const antes = surpresa.ativa()!;

    // «Refresh»: componente novo, mesmo serviço e mesmo armazenamento.
    fixture.destroy();
    await montar();

    expect(surpresa.ativa()!.semente).toBe(antes.semente);
    expect(surpresa.ativa()!.itens).toEqual(antes.itens);
    expect(texto()).toContain('Questão 2 de');
  });
});
