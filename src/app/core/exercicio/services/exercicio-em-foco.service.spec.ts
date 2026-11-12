import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ExercicioEmFocoService } from '@core/exercicio/services/exercicio-em-foco.service';

describe('ExercicioEmFocoService', () => {
  let emFoco: ExercicioEmFocoService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    emFoco = TestBed.inject(ExercicioEmFocoService);
  });

  it('começa sem pergunta nenhuma', () => {
    expect(emFoco.exercicio()).toBeNull();
  });

  it('guarda a pergunta e a troca pela seguinte', () => {
    emFoco.mostrar({ enunciado: 'Quanto é 2 + 3?', tex: '2 + 3' });
    expect(emFoco.exercicio()).toEqual({ enunciado: 'Quanto é 2 + 3?', tex: '2 + 3' });

    emFoco.mostrar({ enunciado: 'E 4 + 5?', tex: '' });
    expect(emFoco.exercicio()!.enunciado).toBe('E 4 + 5?');
  });

  /**
   * Quem sai de cena limpa o que publicou.
   *
   * Sem isto a gaveta mostraria a pergunta da tela anterior — pior que não
   * mostrar nenhuma, porque o aluno montaria a conta errada.
   */
  it('limpa quando a tela sai', () => {
    emFoco.mostrar({ enunciado: 'Pergunta', tex: '' });
    emFoco.limpar();

    expect(emFoco.exercicio()).toBeNull();
  });
});
