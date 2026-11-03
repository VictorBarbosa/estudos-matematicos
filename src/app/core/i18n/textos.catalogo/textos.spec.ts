import { IDIOMAS } from '@core/i18n/models/i18n.model';
import { TODOS_OS_TEXTOS } from '@core/i18n/textos.catalogo/textos.catalogo';

/**
 * As travas dos dicionários que viajam com cada tópico.
 *
 * O dicionário global tem o seu próprio teste ao lado; este cuida dos arquivos
 * `<topico>.i18n.json`, que são muitos e fáceis de deixar pela metade — uma
 * chave traduzida só em duas línguas passa despercebida até alguém abrir a
 * página na terceira.
 */

/** Os `{marcadores}` de uma frase, em ordem, para comparar entre idiomas. */
function marcadores(frase: string): readonly string[] {
  return [...frase.matchAll(/\{(\w+)\}/g)].map((achado) => achado[1]!).sort();
}

describe('dicionários de tópico', () => {
  it('existe pelo menos um', () => {
    expect(TODOS_OS_TEXTOS.size).toBeGreaterThan(0);
  });

  for (const [topico, tabela] of TODOS_OS_TEXTOS) {
    describe(topico, () => {
      it('traz as três línguas em toda chave, sem vazios', () => {
        for (const [chave, linha] of Object.entries(tabela)) {
          for (const idioma of IDIOMAS) {
            const valor = linha[idioma];
            expect(typeof valor, `${chave}/${idioma}`).toBe('string');
            expect(valor.trim(), `${chave}/${idioma}`).not.toBe('');
          }
        }
      });

      it('usa os mesmos marcadores nas três', () => {
        for (const [chave, linha] of Object.entries(tabela)) {
          const esperados = marcadores(linha.pt);
          expect(marcadores(linha.fr), `${chave}/fr`).toEqual(esperados);
          expect(marcadores(linha.en), `${chave}/en`).toEqual(esperados);
        }
      });

      it('não deixa frase longa idêntica ao português', () => {
        for (const [chave, linha] of Object.entries(tabela)) {
          // Frases curtas coincidem de verdade entre línguas ("Total", "Base").
          if (linha.pt.length < 25) {
            continue;
          }

          expect(linha.fr, `${chave}/fr`).not.toBe(linha.pt);
          expect(linha.en, `${chave}/en`).not.toBe(linha.pt);
        }
      });
    });
  }
});
