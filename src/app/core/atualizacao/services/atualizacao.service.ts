import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, InjectionToken, computed, inject, signal } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

/**
 * Por que há um aviso de nova versão.
 *
 * `nova-versao` é o caso comum: um deploy entrou no ar, o service worker já
 * baixou os arquivos novos e eles passam a valer no próximo carregamento.
 *
 * `irrecuperavel` é o caso raro e sério: o cache ficou inconsistente — o
 * GitHub Pages apaga os arquivos com hash antigos a cada publicação — e a
 * aplicação não consegue mais carregar um pedaço de si mesma. Recarregar é a
 * única saída, e por isso esse aviso não se dispensa.
 */
export type MotivoDaAtualizacao = 'nova-versao' | 'irrecuperavel';

/**
 * Como recarregar a página.
 *
 * É um token, e não uma chamada direta, para que o teste possa verificar que o
 * recarregamento foi pedido sem que o ambiente de teste tente navegar de fato.
 */
export const RECARREGAR_PAGINA = new InjectionToken<() => void>('recarregar a página', {
  providedIn: 'root',
  factory: () => {
    const documento = inject(DOCUMENT);
    return () => documento.location.reload();
  },
});

/** De quanto em quanto tempo perguntar ao servidor se saiu versão nova. */
export const INTERVALO_DE_CHECAGEM = 30 * 60 * 1000;

/**
 * Intervalo mínimo entre duas checagens disparadas pela volta ao primeiro plano.
 *
 * Alternar de aba é algo que se faz dezenas de vezes por hora; sem este piso,
 * cada ida e volta renderia uma requisição ao `ngsw.json`.
 */
const ESPERA_ENTRE_CHECAGENS = 60 * 1000;

/**
 * Avisa quando uma versão nova do site está pronta.
 *
 * O service worker do Angular baixa a versão nova em segundo plano e a guarda,
 * mas continua servindo a antiga — é isso que impede a aplicação de quebrar no
 * meio de uma sessão de estudo, quando um deploy troca todos os arquivos com
 * hash. A troca só acontece quando o aluno aceita, e aceitar é recarregar.
 *
 * Fora de produção o service worker não é registrado: `SwUpdate` então não
 * existe, e este serviço simplesmente nunca anuncia nada.
 */
@Injectable({ providedIn: 'root' })
export class AtualizacaoService {
  // `optional`: sem o service worker registrado — `ng serve` e os testes — o
  // provedor não existe, e injetar sem isto derrubaria a aplicação inteira.
  private readonly sw = inject(SwUpdate, { optional: true });
  private readonly documento = inject(DOCUMENT);
  private readonly recarregarPagina = inject(RECARREGAR_PAGINA);

  private readonly aviso = signal<MotivoDaAtualizacao | null>(null);
  private readonly emAndamento = signal(false);

  /** Por que avisar, ou `null` quando não há nada a anunciar. */
  readonly motivo = this.aviso.asReadonly();

  /** Há aviso de versão a mostrar? */
  readonly disponivel = computed(() => this.aviso() !== null);

  /** O recarregamento já foi pedido — evita dois cliques seguidos. */
  readonly aplicando = this.emAndamento.asReadonly();

  private ultimaChecagem = 0;

  /** Checa ao voltar para a aba: é quando o aluno repara que algo mudou. */
  private readonly aoVoltarAoPrimeiroPlano = (): void => {
    if (this.documento.visibilityState === 'visible') {
      void this.verificar();
    }
  };

  constructor() {
    const sw = this.sw;
    const destruicao = inject(DestroyRef);

    if (sw === null || !sw.isEnabled) {
      return;
    }

    sw.versionUpdates.subscribe((evento) => {
      if (evento.type === 'VERSION_READY') {
        this.aviso.set('nova-versao');
      }
    });

    // O cache quebrou: a versão em uso não pode mais ser montada por inteiro.
    sw.unrecoverable.subscribe(() => this.aviso.set('irrecuperavel'));

    const timer = setInterval(() => void this.verificar(), INTERVALO_DE_CHECAGEM);
    this.documento.addEventListener('visibilitychange', this.aoVoltarAoPrimeiroPlano);

    destruicao.onDestroy(() => {
      clearInterval(timer);
      this.documento.removeEventListener('visibilitychange', this.aoVoltarAoPrimeiroPlano);
    });

    void this.verificar();
  }

  /**
   * Aplica a versão nova e recarrega.
   *
   * `activateUpdate` troca a versão que o service worker serve; sem recarregar
   * depois, a aba continuaria com o código antigo na memória e passaria a
   * buscar pedaços da versão nova — a mistura exata que o aviso evita.
   */
  async recarregar(): Promise<void> {
    if (this.emAndamento()) {
      return;
    }
    this.emAndamento.set(true);

    try {
      await this.sw?.activateUpdate();
    } catch {
      // Ativar pode falhar se o service worker já tiver sido substituído.
      // Recarregar resolve do mesmo jeito, então o erro não interrompe nada.
    }

    this.recarregarPagina();
  }

  /**
   * Fecha o aviso sem recarregar.
   *
   * A versão nova continua guardada e entra sozinha no próximo carregamento da
   * página — dispensar adia, não cancela. O estado irrecuperável é a exceção:
   * ali não há o que adiar, porque a aplicação já está quebrada.
   */
  dispensar(): void {
    if (this.aviso() === 'irrecuperavel') {
      return;
    }
    this.aviso.set(null);
  }

  /** Pergunta ao servidor se há versão nova, respeitando o intervalo mínimo. */
  async verificar(): Promise<void> {
    const agora = Date.now();
    if (this.ultimaChecagem !== 0 && agora - this.ultimaChecagem < ESPERA_ENTRE_CHECAGENS) {
      return;
    }
    this.ultimaChecagem = agora;

    try {
      await this.sw?.checkForUpdate();
    } catch {
      // Sem rede, ou o servidor fora do ar: tenta de novo no próximo intervalo.
    }
  }
}
