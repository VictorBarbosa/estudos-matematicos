import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ConfiguracaoService } from '@core/configuracao/services/configuracao.service';
import { ProgressaoService } from '@core/progressao/services/progressao.service';
import { ProvaSurpresaService } from '@core/prova/services/prova-surpresa.service';
import { ProgressoService } from '@core/treino/services/progresso.service';
import { Nivel } from '@core/treino/models/treino.model';
import { Shell } from '@layout/shell/shell';

/**
 * O casco é quem faz a prova surpresa INTERROMPER o estudo.
 *
 * O guard barra a próxima navegação; quem está no meio de um tópico só sai de
 * lá por este efeito. Sem ele, «surpresa» viraria «opcional» — bastava não
 * navegar.
 */
describe('Shell e a prova surpresa', () => {
  function montar() {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });

    return {
      surpresa: TestBed.inject(ProvaSurpresaService),
      progresso: TestBed.inject(ProgressoService),
      progressao: TestBed.inject(ProgressaoService),
      config: TestBed.inject(ConfiguracaoService),
      router: TestBed.inject(Router),
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

  const espiar = (router: Router) =>
    vi.spyOn(router, 'navigate').mockImplementation(async () => true);

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('leva à prova assim que ela nasce, se o aluno estiver estudando', async () => {
    const { surpresa, progresso, router } = montar();
    const navigate = espiar(router);
    vi.spyOn(router, 'url', 'get').mockReturnValue('/algebra/inequacoes');

    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();

    preparar(progresso);
    surpresa.avaliar();

    // Os efeitos rodam junto com a detecção de mudança; é ela que os acorda
    // depois que o sinal muda.
    fixture.detectChanges();

    expect(navigate).toHaveBeenCalledWith(['/surpresa']);
  });

  it('não arrasta quem já está numa tela permitida', async () => {
    const { surpresa, progresso, router } = montar();
    const navigate = espiar(router);
    vi.spyOn(router, 'url', 'get').mockReturnValue('/configuracoes');

    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();

    preparar(progresso);
    surpresa.avaliar();
    fixture.detectChanges();

    expect(navigate).not.toHaveBeenCalled();
  });

  it('sem prova, não navega para lugar nenhum', () => {
    const { router } = montar();
    const navigate = espiar(router);
    vi.spyOn(router, 'url', 'get').mockReturnValue('/algebra/inequacoes');

    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();

    expect(navigate).not.toHaveBeenCalled();
  });
});
