import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwUpdate, UnrecoverableStateEvent, VersionEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';
import {
  AtualizacaoService,
  RECARREGAR_PAGINA,
} from '@core/atualizacao/services/atualizacao.service';
import { AtualizacaoDialog } from '@shared/components/atualizacao-dialog/atualizacao-dialog';

class SwFalso {
  readonly versionUpdates = new Subject<VersionEvent>();
  readonly unrecoverable = new Subject<UnrecoverableStateEvent>();
  readonly isEnabled = true;

  async activateUpdate(): Promise<boolean> {
    return true;
  }

  async checkForUpdate(): Promise<boolean> {
    return true;
  }
}

describe('AtualizacaoDialog', () => {
  let fixture: ComponentFixture<AtualizacaoDialog>;
  let sw: SwFalso;
  let recarregamentos: number;

  function dialogo(): HTMLDialogElement {
    return fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
  }

  function texto(): string {
    return fixture.nativeElement.textContent as string;
  }

  function botao(rotulo: string): HTMLButtonElement | undefined {
    return [...fixture.nativeElement.querySelectorAll('button')].find(
      (candidato) =>
        (candidato as HTMLButtonElement).textContent?.includes(rotulo) ||
        (candidato as HTMLButtonElement).getAttribute('aria-label') === rotulo,
    ) as HTMLButtonElement | undefined;
  }

  /** Anuncia uma versão nova e deixa a tela atualizada. */
  async function anunciarVersaoNova(): Promise<void> {
    sw.versionUpdates.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'antiga' },
      latestVersion: { hash: 'nova' },
    });
    await fixture.whenStable();
  }

  beforeEach(async () => {
    sw = new SwFalso();
    recarregamentos = 0;

    await TestBed.configureTestingModule({
      imports: [AtualizacaoDialog],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SwUpdate, useValue: sw },
        {
          provide: RECARREGAR_PAGINA,
          useValue: () => {
            recarregamentos++;
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AtualizacaoDialog);
    await fixture.whenStable();
  });

  it('fica fechado enquanto não há versão nova', () => {
    expect(dialogo().open).toBe(false);
  });

  it('abre avisando quando a versão nova fica pronta', async () => {
    await anunciarVersaoNova();

    expect(dialogo().open).toBe(true);
    expect(texto()).toContain('Nova versão disponível');
    expect(texto()).toContain('Reiniciar agora');
  });

  it('o botão de reiniciar recarrega a página', async () => {
    await anunciarVersaoNova();

    botao('Reiniciar agora')!.click();
    await fixture.whenStable();

    expect(recarregamentos).toBe(1);
  });

  it('o x fecha o aviso sem recarregar', async () => {
    await anunciarVersaoNova();

    botao('Fechar')!.click();
    await fixture.whenStable();

    expect(dialogo().open).toBe(false);
    expect(recarregamentos).toBe(0);
  });

  it('enquanto reinicia, o botão trava para não disparar duas vezes', async () => {
    await anunciarVersaoNova();

    botao('Reiniciar agora')!.click();
    await fixture.whenStable();

    expect(botao('Reiniciando')?.disabled).toBe(true);
  });

  it('o estado irrecuperável avisa de outro jeito e não oferece o x', async () => {
    sw.unrecoverable.next({ type: 'UNRECOVERABLE_STATE', reason: 'cache perdido' });
    await fixture.whenStable();

    expect(dialogo().open).toBe(true);
    expect(texto()).toContain('precisa ser recarregada');
    expect(botao('Fechar')).toBeUndefined();
    expect(botao('Reiniciar agora')).toBeDefined();
  });

  it('o aviso irrecuperável também não fecha pelo Esc', async () => {
    sw.unrecoverable.next({ type: 'UNRECOVERABLE_STATE', reason: 'cache perdido' });
    await fixture.whenStable();

    // `cancel` é o evento que o Esc dispara no `<dialog>` nativo.
    const cancelado = dialogo().dispatchEvent(new Event('cancel', { cancelable: true }));

    expect(cancelado).toBe(false);
  });

  it('a versão nova continua guardada depois de dispensada', async () => {
    const atualizacao = TestBed.inject(AtualizacaoService);
    await anunciarVersaoNova();

    botao('Fechar')!.click();
    await fixture.whenStable();

    // Dispensar adia: o service worker já trocou os arquivos e eles entram no
    // próximo carregamento, com ou sem o clique em "Reiniciar agora".
    expect(atualizacao.disponivel()).toBe(false);
    expect(atualizacao.motivo()).toBeNull();
  });
});
