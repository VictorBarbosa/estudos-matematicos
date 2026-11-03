import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AssistenteService } from '@core/assistente/services/assistente.service';
import { I18nService } from '@core/i18n/services/i18n.service';
import { IDIOMAS, NOME_DO_IDIOMA, SIGLA_DO_IDIOMA } from '@core/i18n/models/i18n.model';
import { CalculadoraService } from '@core/calculadora/services/calculadora.service';
import { CHAVE_DO_TEMA, TemaService } from '@core/tema/services/tema.service';
import { AtualizacaoDialog } from '@shared/components/atualizacao-dialog/atualizacao-dialog';
import { AssistenteDialog } from '@shared/components/assistente-dialog/assistente-dialog';
import { Calculadora } from '@shared/components/calculadora/calculadora';
import { TeoriaDialog } from '@shared/components/teoria-dialog/teoria-dialog';
import { Sidebar } from '@layout/sidebar/sidebar';

/**
 * Moldura da aplicação: cabeçalho, navegação lateral, área de conteúdo e as
 * duas instâncias únicas de modal — a teoria de um conceito e o aviso de
 * versão nova —, disponíveis a partir de qualquer tela.
 */
@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AssistenteDialog,
    AtualizacaoDialog,
    Calculadora,
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
  protected readonly assistente = inject(AssistenteService);
  protected readonly i18n = inject(I18nService);

  protected readonly sigla = SIGLA_DO_IDIOMA;
  protected readonly nomeDoIdioma = NOME_DO_IDIOMA;

  /** A chave de tradução do tema atual, para o rótulo do botão. */
  protected readonly chaveDoTema = CHAVE_DO_TEMA;

  /** Controla o menu lateral em telas estreitas. */
  protected readonly menuAberto = signal(false);

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
