import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AssistenteService } from '@core/assistente/services/assistente.service';
import { I18nService } from '@core/i18n/services/i18n.service';
import { IDIOMAS, NOME_DO_IDIOMA, SIGLA_DO_IDIOMA } from '@core/i18n/models/i18n.model';
import { CalculadoraService } from '@core/calculadora/services/calculadora.service';
import { DispositivoService } from '@core/dispositivo/services/dispositivo.service';
import { FolhaService } from '@core/folha/services/folha.service';
import { CHAVE_DO_TEMA, TemaService } from '@core/tema/services/tema.service';
import { ProvaSurpresaService } from '@core/prova/services/prova-surpresa.service';
import { AtualizacaoDialog } from '@shared/components/atualizacao-dialog/atualizacao-dialog';
import { AssistenteDialog } from '@shared/components/assistente-dialog/assistente-dialog';
import { Calculadora } from '@shared/components/calculadora/calculadora';
import { Folha } from '@shared/components/folha/folha';
import { TeoriaDialog } from '@shared/components/teoria-dialog/teoria-dialog';
import { Sidebar } from '@layout/sidebar/sidebar';

/**
 * Moldura da aplicação: cabeçalho, navegação lateral, área de conteúdo e as
 * duas instâncias únicas de modal — a teoria de um conceito e o aviso de
 * versão nova —, disponíveis a partir de qualquer tela.
 *
 * Três ferramentas do cabeçalho aparecem ou não conforme o aparelho e o que
 * está ao alcance: a calculadora não cabe no celular, a folha de rascunho só
 * serve onde há caneta ou dedo, e o assistente depende de um Ollama que
 * responda. Em todos os casos a decisão é de fora — `DispositivoService` e
 * `AssistenteService` —, e aqui só se obedece.
 */
@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AssistenteDialog,
    AtualizacaoDialog,
    Calculadora,
    Folha,
    RouterLink,
    RouterOutlet,
    Sidebar,
    TeoriaDialog,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  protected readonly tema = inject(TemaService);
  protected readonly calculadora = inject(CalculadoraService);
  protected readonly folha = inject(FolhaService);
  protected readonly assistente = inject(AssistenteService);
  protected readonly dispositivo = inject(DispositivoService);
  protected readonly i18n = inject(I18nService);
  protected readonly surpresa = inject(ProvaSurpresaService);

  /**
   * De quanto em quanto tempo o app pergunta se a prova surpresa venceu.
   *
   * Não há contagem regressiva na tela — «surpresa» é o ponto. O relógio aqui
   * só decide o momento de ela aparecer, e 60 s é curto o bastante para que
   * ela surja durante uma sessão de estudo sem que ninguém a espere pelo dia
   * seguinte.
   */
  private static readonly INTERVALO_DE_CHECAGEM = 60_000;

  private readonly router = inject(Router);

  /**
   * As telas que continuam abertas com uma prova surpresa em andamento.
   *
   * A prova, a home e as configurações. Todo o resto é estudo — e é
   * justamente o que ela existe para interromper.
   */
  private static readonly PERMITIDAS = ['/', '/surpresa', '/configuracoes'];

  protected readonly sigla = SIGLA_DO_IDIOMA;
  protected readonly nomeDoIdioma = NOME_DO_IDIOMA;

  /** A chave de tradução do tema atual, para o rótulo do botão. */
  protected readonly chaveDoTema = CHAVE_DO_TEMA;

  /** Controla o menu lateral em telas estreitas. */
  protected readonly menuAberto = signal(false);

  constructor() {
    // Na abertura, e depois de minuto em minuto: a prova pode vencer no meio
    // de uma sessão longa, e quem a cria é o serviço, não a navegação.
    this.surpresa.avaliar();

    const relogio = setInterval(() => this.surpresa.avaliar(), Shell.INTERVALO_DE_CHECAGEM);
    inject(DestroyRef).onDestroy(() => clearInterval(relogio));

    /*
     * A prova surpresa interrompe o estudo no instante em que nasce.
     *
     * Sem isto, ela só barraria a PRÓXIMA navegação: quem estivesse no meio de
     * um tópico continuaria treinando indefinidamente, e «surpresa» viraria
     * «opcional». O guard continua sendo necessário para quem chega por um link
     * direto ou pelo histórico — este efeito cobre a sessão em curso.
     */
    effect(() => {
      if (this.surpresa.ativa() === null) {
        return;
      }

      const caminho = this.router.url.split('?')[0] ?? '/';
      if (Shell.PERMITIDAS.includes(caminho)) {
        return;
      }

      void this.router.navigate(['/surpresa']);
    });
  }

  protected alternarMenu(): void {
    this.menuAberto.update((aberto) => !aberto);
  }

  protected fecharMenu(): void {
    this.menuAberto.set(false);
  }

  /** Avança para o próximo idioma: português → francês → inglês → português. */
  protected alternarIdioma(): void {
    const atual = IDIOMAS.indexOf(this.i18n.idioma());
    this.i18n.definir(IDIOMAS[(atual + 1) % IDIOMAS.length]!);
  }
}
