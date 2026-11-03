import { Component, inject, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { I18nService } from '@core/i18n/services/i18n.service';
import {
  IDIOMAS,
  IDIOMA_PADRAO,
  Idioma,
  LOCALE_DO_IDIOMA,
} from '@core/i18n/models/i18n.model';

/**
 * A tradução chega mesmo à tela?
 *
 * As travas do arquivo ao lado comparam os dicionários entre si; estas
 * verificam o outro lado da ponte — que trocar o idioma reescreve o que o
 * navegador mostra, sem recarregar a página e sem recriar o componente.
 */
@Component({
  selector: 'app-sonda-i18n',
  standalone: true,
  template: `<p>{{ i18n.t('treino.verificar') }}</p>
    <span>{{ i18n.t('treino.subir', { quantos: 3 }) }}</span>
    <em>{{ i18n.tituloDoTopico('fracoes') }}</em>`,
})
class SondaI18n {
  readonly i18n = inject(I18nService);
}

describe('tradução na tela', () => {
  let fixture: ComponentFixture<SondaI18n>;
  let i18n: I18nService;

  const texto = (): string => fixture.nativeElement.textContent as string;

  /** Troca o idioma e espera o dicionário correspondente chegar. */
  async function usar(idioma: Idioma): Promise<void> {
    i18n.definir(idioma);
    await fixture.whenStable();

    for (let tentativa = 0; tentativa < 20 && !i18n.carregado(); tentativa++) {
      await new Promise((ok) => setTimeout(ok, 10));
    }

    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

    fixture = TestBed.createComponent(SondaI18n);
    i18n = TestBed.inject(I18nService);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  // A escolha fica gravada no navegador: sem limpar, o próximo arquivo de
  // teste começaria em inglês e procuraria rótulos em português.
  afterEach(() => {
    localStorage.clear();
    document.documentElement.setAttribute('lang', LOCALE_DO_IDIOMA[IDIOMA_PADRAO]);
  });

  it('começa em português', () => {
    expect(i18n.idioma()).toBe('pt');
    expect(texto()).toContain('Verificar');
    expect(texto()).toContain('Frações');
  });

  it('troca a tela inteira para o francês', async () => {
    await usar('fr');

    expect(texto()).toContain('Vérifier');
    expect(texto()).toContain('Fractions');
    expect(texto()).not.toContain('Verificar');
  });

  it('e para o inglês', async () => {
    await usar('en');

    expect(texto()).toContain('Check');
    expect(texto()).toContain('Fractions');
  });

  it('preenche os marcadores na língua escolhida', async () => {
    await usar('fr');

    expect(texto()).toContain('3 bonne(s) réponse(s) de suite');
  });

  it('o idioma escolhido sobrevive à recarga', async () => {
    await usar('en');

    // Um serviço novo lê a escolha gravada, como aconteceria numa aba nova.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

    expect(TestBed.inject(I18nService).idioma()).toBe('en');
  });

  it('o atributo lang do documento acompanha a escolha', async () => {
    await usar('fr');
    expect(document.documentElement.getAttribute('lang')).toBe('fr-CA');

    await usar('en');
    expect(document.documentElement.getAttribute('lang')).toBe('en-CA');
  });

  it('volta ao português sem precisar baixar nada', async () => {
    await usar('en');
    await usar('pt');

    expect(i18n.carregado()).toBe(true);
    expect(texto()).toContain('Verificar');
  });

  it('os três idiomas carregam', async () => {
    for (const idioma of IDIOMAS) {
      await usar(idioma);
      expect(i18n.carregado(), idioma).toBe(true);
    }
  });
});
