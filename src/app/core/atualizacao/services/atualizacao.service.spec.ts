import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SwUpdate, UnrecoverableStateEvent, VersionEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';
import {
  AtualizacaoService,
  RECARREGAR_PAGINA,
} from '@core/atualizacao/services/atualizacao.service';

/**
 * Um `SwUpdate` de mentira.
 *
 * O de verdade só funciona com um service worker registrado, o que não existe
 * em jsdom. O que importa testar aqui é a decisão que este serviço toma a
 * partir dos eventos — e essa decisão é nossa, não do Angular.
 */
class SwFalso {
  readonly versionUpdates = new Subject<VersionEvent>();
  readonly unrecoverable = new Subject<UnrecoverableStateEvent>();

  isEnabled = true;
  ativacoes = 0;
  checagens = 0;

  async activateUpdate(): Promise<boolean> {
    this.ativacoes++;
    return true;
  }

  async checkForUpdate(): Promise<boolean> {
    this.checagens++;
    return true;
  }
}

/** Evento de versão pronta, no formato que o `SwUpdate` publica. */
function versaoPronta(): VersionEvent {
  return {
    type: 'VERSION_READY',
    currentVersion: { hash: 'antiga' },
    latestVersion: { hash: 'nova' },
  };
}

describe('AtualizacaoService', () => {
  let sw: SwFalso;
  let recarregamentos: number;

  function criar(configurar: (sw: SwFalso) => void = () => {}): AtualizacaoService {
    sw = new SwFalso();
    configurar(sw);
    recarregamentos = 0;

    TestBed.configureTestingModule({
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
    });

    return TestBed.inject(AtualizacaoService);
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('não anuncia nada enquanto não sai versão nova', () => {
    const servico = criar();

    expect(servico.disponivel()).toBe(false);
    expect(servico.motivo()).toBeNull();
  });

  it('anuncia quando o service worker termina de baixar a versão nova', () => {
    const servico = criar();

    sw.versionUpdates.next(versaoPronta());

    expect(servico.disponivel()).toBe(true);
    expect(servico.motivo()).toBe('nova-versao');
  });

  it('ignora os eventos que não são de versão pronta', () => {
    // VERSION_DETECTED chega quando o download começa; avisar ali mostraria
    // um botão de reiniciar para uma versão que ainda não está no disco.
    const servico = criar();

    sw.versionUpdates.next({ type: 'VERSION_DETECTED', version: { hash: 'nova' } });

    expect(servico.disponivel()).toBe(false);
  });

  it('reiniciar ativa a versão nova antes de recarregar', async () => {
    const servico = criar();
    sw.versionUpdates.next(versaoPronta());

    await servico.recarregar();

    expect(sw.ativacoes).toBe(1);
    expect(recarregamentos).toBe(1);
  });

  it('recarrega mesmo se a ativação falhar', async () => {
    // Ativar falha quando outro service worker já assumiu. Recarregar resolve
    // do mesmo jeito, então engasgar aqui só deixaria o aluno preso no modal.
    const servico = criar((falso) => {
      falso.activateUpdate = () => Promise.reject(new Error('já substituído'));
    });
    sw.versionUpdates.next(versaoPronta());

    await servico.recarregar();

    expect(recarregamentos).toBe(1);
  });

  it('dois cliques seguidos recarregam uma vez só', async () => {
    const servico = criar();
    sw.versionUpdates.next(versaoPronta());

    await Promise.all([servico.recarregar(), servico.recarregar()]);

    expect(recarregamentos).toBe(1);
  });

  it('dispensar fecha o aviso sem recarregar', () => {
    const servico = criar();
    sw.versionUpdates.next(versaoPronta());

    servico.dispensar();

    expect(servico.disponivel()).toBe(false);
    expect(recarregamentos).toBe(0);
  });

  it('o estado irrecuperável não se dispensa', () => {
    // Aqui a aplicação já não consegue carregar um pedaço de si mesma: deixar
    // fechar o aviso seria devolver o aluno a uma tela que não funciona.
    const servico = criar();

    sw.unrecoverable.next({ type: 'UNRECOVERABLE_STATE', reason: 'cache perdido' });
    servico.dispensar();

    expect(servico.motivo()).toBe('irrecuperavel');
    expect(servico.disponivel()).toBe(true);
  });

  it('pergunta ao servidor assim que começa', () => {
    const servico = criar();

    expect(servico).toBeDefined();
    expect(sw.checagens).toBe(1);
  });

  it('não repete a checagem a cada volta para a aba', async () => {
    // Alternar de aba é algo que se faz dezenas de vezes por hora.
    const servico = criar();

    await servico.verificar();
    await servico.verificar();

    expect(sw.checagens).toBe(1);
  });

  it('uma falha de rede na checagem não derruba nada', async () => {
    const servico = criar((falso) => {
      falso.checkForUpdate = () => Promise.reject(new Error('sem rede'));
    });

    // Se a promessa rejeitasse, este `await` reprovaria o teste.
    await servico.verificar();

    expect(servico.disponivel()).toBe(false);
  });

  it('sem o próprio SwUpdate disponível, o serviço ainda assim se constrói', () => {
    // É o que acontece em qualquer teste de componente que monte o shell sem
    // configurar o service worker: injetar sem `optional` derrubaria a tela.
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });

    const servico = TestBed.inject(AtualizacaoService);

    expect(servico.disponivel()).toBe(false);
  });

  it('sem service worker registrado, o serviço fica quieto', () => {
    // É o caso do `ng serve` e o dos testes: `SwUpdate` existe mas desligado.
    const servico = criar((falso) => {
      falso.isEnabled = false;
    });

    sw.versionUpdates.next(versaoPronta());

    expect(servico.disponivel()).toBe(false);
    expect(sw.checagens).toBe(0);
  });
});
