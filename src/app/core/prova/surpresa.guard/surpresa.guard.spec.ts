import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { ConfiguracaoService } from '@core/configuracao/services/configuracao.service';
import { ProgressaoService } from '@core/progressao/services/progressao.service';
import { ProvaSurpresaService } from '@core/prova/services/prova-surpresa.service';
import { ProgressoService } from '@core/treino/services/progresso.service';
import { Nivel } from '@core/treino/models/treino.model';
import { semSurpresaAtivaGuard } from '@core/prova/surpresa.guard/surpresa.guard';

/** Executa o guard como o router faria. */
function ativar(): boolean | UrlTree {
  return TestBed.runInInjectionContext(() =>
    semSurpresaAtivaGuard({} as never, {} as RouterStateSnapshot),
  ) as boolean | UrlTree;
}

describe('semSurpresaAtivaGuard', () => {
  function montar() {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });

    return {
      surpresa: TestBed.inject(ProvaSurpresaService),
      progresso: TestBed.inject(ProgressoService),
      config: TestBed.inject(ConfiguracaoService),
      progressao: TestBed.inject(ProgressaoService),
    };
  }

  /** Vence o critério de domínio de três tópicos sem cobertura por tipo. */
  function preparar(progresso: ProgressoService): void {
    for (const topicoId of ['operacoes-fundamentais', 'notacao-matematica', 'mmc-mdc']) {
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
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('sem prova em andamento, o estudo segue', () => {
    montar();
    expect(ativar()).toBe(true);
  });

  it('com a prova em andamento, manda para ela', () => {
    const { surpresa, progresso } = montar();
    preparar(progresso);
    surpresa.avaliar();

    const destino = ativar();

    expect(destino).toBeInstanceOf(UrlTree);
    expect(String(destino)).toBe('/surpresa');
  });

  it('depois de terminar, o estudo volta a passar', () => {
    const { surpresa, progresso } = montar();
    preparar(progresso);
    surpresa.avaliar();
    surpresa.encerrarSemAvaliar();

    expect(ativar()).toBe(true);
  });

  it('a prova surpresa não trava o tópico por conta própria: quem tranca é a reprovação', () => {
    const { surpresa, progresso, progressao } = montar();
    preparar(progresso);
    surpresa.avaliar();

    // Com a prova aberta, o tópico continua «liberado» no modelo: o bloqueio
    // é de navegação, não de progresso. Apagar o progresso aqui seria punir
    // alguém que ainda nem respondeu.
    expect(progressao.estaLiberada('operacoes-fundamentais')).toBe(true);
    expect(progressao.estaTrancado('operacoes-fundamentais')).toBe(false);
  });
});
