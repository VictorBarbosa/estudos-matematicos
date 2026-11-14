import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HistoriasService } from '@core/problemas/servicos/historias.service';
import { I18nService } from '@core/i18n/services/i18n.service';
import { PROBLEMA_EQUACAO1 } from '@features/algebra/equacao-primeiro-grau/equacao-primeiro-grau.problema';
import pt from '@core/i18n/dicionarios/pt.json';
import fr from '@core/i18n/dicionarios/fr.json';
import en from '@core/i18n/dicionarios/en.json';

describe('o aviso de que a LLM está escrevendo', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  it('existe nos três dicionários, e os três textos diferem', () => {
    /*
     * Lidos direto dos dicionários, e não pelo serviço: `fr` e `en` carregam
     * sob demanda (import dinâmico), e um teste que dependesse disso mediria o
     * carregamento em vez da tradução.
     */
    const textos = [pt, fr, en].map(
      (dicionario) => (dicionario as { treino: Record<string, string> }).treino[
        'escrevendoEnunciados'
      ],
    );

    for (const [indice, texto] of textos.entries()) {
      expect(texto, `idioma ${indice}`).toBeDefined();
      expect(texto!.length, `idioma ${indice}`).toBeGreaterThan(20);
    }

    expect(new Set(textos).size, 'os três textos têm de ser diferentes').toBe(3);
  });

  it('o português, que está sempre em memória, sai traduzido', () => {
    const i18n = TestBed.inject(I18nService);

    expect(i18n.t('treino.escrevendoEnunciados')).toContain('três idiomas');
  });

  it('o sinal do serviço segue o pedido, que é o que liga o aviso', async () => {
    let liberar!: () => void;
    const espera = new Promise<void>((r) => (liberar = r));
    const original = globalThis.fetch;
    globalThis.fetch = (async () => {
      await espera;
      return new Response(JSON.stringify({ message: { content: '{"problemas":[]}' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as any;

    try {
      const historias = TestBed.inject(HistoriasService);

      expect(historias.preparando()).toBe(false);

      historias.atribuir('ex-1', 'equacao-primeiro-grau', 'medio', PROBLEMA_EQUACAO1, [3, 7, 22]);
      await new Promise((r) => setTimeout(r, 30));

      expect(historias.preparando(), 'o aviso não ligaria durante o pedido').toBe(true);

      liberar();
      await new Promise((r) => setTimeout(r, 60));

      expect(historias.preparando(), 'o aviso ficaria ligado para sempre').toBe(false);
    } finally {
      globalThis.fetch = original;
    }
  });
});
