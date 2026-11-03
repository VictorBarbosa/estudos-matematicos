import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import { NOME_DO_IDIOMA } from '@core/i18n/models/i18n.model';
import { I18nService } from '@core/i18n/services/i18n.service';
import { PainelEtapa } from '@shared/components/painel-etapa/painel-etapa';
import { PainelProgresso } from '@shared/components/painel-progresso/painel-progresso';

export type AbaTopico = 'explorar' | 'treinar';

const ABAS: readonly AbaTopico[] = ['explorar', 'treinar'];

/**
 * Moldura comum a todos os tópicos: a faixa da etapa na trilha, título, abas
 * **Explorar** e **Treinar**, e o painel de desempenho do tópico.
 *
 * Os dois painéis são projetados de uma vez e alternados por visibilidade, em
 * vez de recriados. Assim, voltar da teoria para o treino não zera a rodada
 * que estava em andamento.
 */
@Component({
  selector: 'app-topico-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PainelEtapa, PainelProgresso],
  templateUrl: './topico-layout.html',
  styleUrl: './topico-layout.scss',
})
export class TopicoLayout {
  /** Id do tópico no currículo: daqui saem o painel de progresso e o cabeçalho. */
  readonly topicoId = input.required<string>();

  protected readonly i18n = inject(I18nService);

  /**
   * Título e descrição vêm do currículo, não da página.
   *
   * Antes cada tópico repetia os dois no seu próprio template, o que já era
   * uma duplicação do `curriculo.ts` — e, com três idiomas, seria a mesma
   * frase escrita em 102 lugares vezes três.
   */
  protected readonly titulo = computed(() => this.i18n.tituloDoTopico(this.topicoId()));
  protected readonly descricao = computed(() => this.i18n.descricaoDoTopico(this.topicoId()));

  protected readonly abas = ABAS;
  protected readonly aba = signal<AbaTopico>('explorar');

  private readonly botoes = viewChildren<ElementRef<HTMLButtonElement>>('botaoAba');

  /** Os nomes dos idiomas, para o aviso de que o conteúdo segue em português. */
  protected readonly nomeDoIdioma = NOME_DO_IDIOMA;

  protected readonly rotulos: Readonly<Record<AbaTopico, string>> = {
    explorar: 'topico.explorar',
    treinar: 'topico.treinar',
  };

  protected selecionar(aba: AbaTopico): void {
    this.aba.set(aba);
  }

  /** Setas navegam entre as abas, como manda o padrão de `tablist`. */
  protected aoTeclar(evento: KeyboardEvent): void {
    const direcao = evento.key === 'ArrowRight' ? 1 : evento.key === 'ArrowLeft' ? -1 : 0;
    if (direcao === 0) {
      return;
    }

    evento.preventDefault();
    const atual = ABAS.indexOf(this.aba());
    const proximo = (atual + direcao + ABAS.length) % ABAS.length;

    this.aba.set(ABAS[proximo]!);
    this.botoes()[proximo]?.nativeElement.focus();
  }
}
