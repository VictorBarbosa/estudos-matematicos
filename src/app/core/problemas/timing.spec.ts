import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HistoriasService } from '@core/problemas/servicos/historias.service';
import { PROBLEMA_EQUACAO1 } from '@features/algebra/equacao-primeiro-grau/equacao-primeiro-grau.problema';

describe('a história que chega DEPOIS', () => {
  it('veste o exercício que já está na tela?', async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

    let liberar!: () => void;
    const espera = new Promise<void>((r) => (liberar = r));

    const original = globalThis.fetch;
    globalThis.fetch = (async () => {
      await espera; // o lote demora: é o caso real, 28 s
      return new Response(
        JSON.stringify({
          message: {
            content: JSON.stringify({
              problemas: [
                {
                  nivel: 'medio',
                  pt: 'Uma oficina cobra {0} reais por hora e mais {1} de taxa. Quantas horas cabem em {2} reais?',
                  fr: 'Un atelier facture {0} l’heure et {1} de frais. Combien d’heures tiennent dans {2} ?',
                  en: 'A workshop charges {0} per hour plus {1} in fees. How many hours fit in {2}?',
                },
              ],
            }),
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }) as any;

    try {
      const servico = TestBed.inject(HistoriasService);

      // 1. O exercício aparece AGORA, com a fila vazia.
      servico.atribuir('ex-1', 'equacao-primeiro-grau', 'medio', PROBLEMA_EQUACAO1, [3, 7, 22]);
      expect(servico.vestir('ex-1', [3, 7, 22], 'pt'), 'antes do lote').toBeUndefined();

      // 2. O lote chega 28 s depois.
      liberar();
      await new Promise((r) => setTimeout(r, 100));

      // 3. O exercício que estava na tela recebe a história?
      const vestido = servico.vestir('ex-1', [3, 7, 22], 'pt');
      console.log('VESTIDO DEPOIS DO LOTE:', vestido ?? '(nada — o exercício ficou sem história)');
      expect(vestido, 'a história chegou e não vestiu o exercício em tela').toBeDefined();
    } finally {
      globalThis.fetch = original;
    }
  });
});
