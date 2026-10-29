import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Teoria } from '@core/teoria/models/teoria.model';
import { TeoriaService } from '@core/teoria/services/teoria.service';
import { TeoriaDialog } from '@shared/components/teoria-dialog/teoria-dialog';

const CONCEITOS: readonly Teoria[] = [
  {
    id: 'teste.principal',
    titulo: 'Conceito principal',
    resumo: 'Um resumo de uma linha.',
    definicao: 'A definição completa do conceito.',
    formulas: [{ tex: 'a + b', legenda: 'Legenda da fórmula.' }],
    demonstracao: [{ descricao: 'Primeira etapa da demonstração.', tex: 'a = b' }],
    exemplo: {
      enunciado: 'Um exemplo numérico.',
      passos: [{ descricao: 'Etapa do exemplo.', tex: '1 + 1 = 2' }],
    },
    vejaTambem: ['teste.relacionado'],
  },
  {
    id: 'teste.relacionado',
    titulo: 'Conceito relacionado',
    resumo: 'Outro resumo.',
    definicao: 'Outra definição.',
    formulas: [],
    demonstracao: [],
  },
];

describe('TeoriaDialog', () => {
  let fixture: ComponentFixture<TeoriaDialog>;
  let teoria: TeoriaService;

  function dialogo(): HTMLDialogElement {
    return fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeoriaDialog],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    teoria = TestBed.inject(TeoriaService);
    teoria.registrar(CONCEITOS);

    fixture = TestBed.createComponent(TeoriaDialog);
    await fixture.whenStable();
  });

  it('começa fechado e sem conteúdo', () => {
    expect(dialogo().open).toBe(false);
    expect(dialogo().textContent?.trim()).toBe('');
  });

  it('abre mostrando definição, fórmula, demonstração e exemplo', async () => {
    teoria.abrir('teste.principal');
    await fixture.whenStable();

    expect(dialogo().open).toBe(true);

    const texto = dialogo().textContent ?? '';
    expect(texto).toContain('Conceito principal');
    expect(texto).toContain('Um resumo de uma linha.');
    expect(texto).toContain('A definição completa do conceito.');
    expect(texto).toContain('Legenda da fórmula.');
    expect(texto).toContain('Primeira etapa da demonstração.');
    expect(texto).toContain('Um exemplo numérico.');
  });

  it('fecha pelo botão de fechar', async () => {
    teoria.abrir('teste.principal');
    await fixture.whenStable();

    const fechar = dialogo().querySelector('button[aria-label="Fechar"]') as HTMLButtonElement;
    fechar.click();
    await fixture.whenStable();

    expect(dialogo().open).toBe(false);
    expect(teoria.estaAberta()).toBe(false);
  });

  it('sincroniza o serviço quando o diálogo é fechado por fora, como pelo Esc', async () => {
    teoria.abrir('teste.principal');
    await fixture.whenStable();

    // Ao pressionar Esc, o navegador fecha o elemento e emite `close`.
    dialogo().open = false;
    dialogo().dispatchEvent(new Event('close'));
    await fixture.whenStable();

    expect(teoria.estaAberta()).toBe(false);
  });

  it('navega para um conceito relacionado sem fechar', async () => {
    teoria.abrir('teste.principal');
    await fixture.whenStable();

    const relacionado = [...dialogo().querySelectorAll('button')].find(
      (botao) => botao.textContent?.trim() === 'Conceito relacionado',
    ) as HTMLButtonElement;

    relacionado.click();
    await fixture.whenStable();

    expect(dialogo().open).toBe(true);
    expect(teoria.aberta()?.id).toBe('teste.relacionado');
    expect(dialogo().textContent).toContain('Outra definição.');
  });

  it('omite as seções que o conceito não tem', async () => {
    teoria.abrir('teste.relacionado');
    await fixture.whenStable();

    const texto = dialogo().textContent ?? '';
    expect(texto).toContain('Definição');
    expect(texto).not.toContain('Por que funciona');
    expect(texto).not.toContain('Exemplo');
  });
});
